import { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useTradingStore } from '../../store/useTradingStore';
import { getActiveUserSession, TRIAL_DURATION_SECONDS } from '../../services/accountStorage';
import SubscriptionModal from '../subscription/SubscriptionModal';

const Header = () => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [showNotifSettings, setShowNotifSettings] = useState(false);

  // Stato Utente Attivo & Timer Prova 5 minuti
  const [activeUser, setActiveUser] = useState(() => getActiveUserSession());
  const [trialRemainingSeconds, setTrialRemainingSeconds] = useState(300);
  const [isSubscriptionModalOpen, setIsSubscriptionModalOpen] = useState(false);

  // Impostazioni Disattivazione / Mute Notifiche
  const [notifSettings, setNotifSettings] = useState({
    copyTrading: true,
    marketAi: true,
    capitalRisk: true
  });

  const { prices = {}, priceChanges = {}, getLivePrice } = useMarket();
  const openPositions = useTradingStore((state) => state.positions) || [];
  const closedTrades = useTradingStore((state) => state.closedTrades) || [];
  const notifications = useTradingStore((state) => state.notifications) || [];

  // Monitoraggio Timer Prova Gratuita 5 minuti
  useEffect(() => {
    const checkTrial = () => {
      const u = getActiveUserSession();
      setActiveUser(u);

      if (!u) return;

      if (u.subscription?.active) {
        setTrialRemainingSeconds(99999);
        return;
      }

      const startMs = u.trialStartedAt ? new Date(u.trialStartedAt).getTime() : new Date(u.createdAt || Date.now()).getTime();
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);
      const remainSec = Math.max(0, TRIAL_DURATION_SECONDS - elapsedSec);

      setTrialRemainingSeconds(remainSec);
    };

    checkTrial();
    const interval = setInterval(checkTrial, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calcolo in tempo reale del Guadagno / Perdita Netta Totale
  const openPnl = openPositions.reduce((acc, p) => {
    const qty = Number(p?.quantity) || 0;
    const entry = Number(p?.entryPrice) || 0;
    const live = Number(getLivePrice(p?.asset)) || entry;
    const isLong = p?.side === 'BUY' || p?.side === 'long' || !p?.side;
    const pnl = isLong ? (live - entry) * qty : (entry - live) * qty;
    return acc + (isNaN(pnl) ? 0 : pnl);
  }, 0);

  const closedPnl = closedTrades.reduce((acc, t) => acc + (Number(t?.pnl) || 0), 0);
  const totalNetPnl = isNaN(openPnl + closedPnl) ? 0 : parseFloat((openPnl + closedPnl).toFixed(2));
  const isProfit = totalNetPnl >= 0;

  const btcPrice = Number(prices?.['BTC/USD']) || 63807.87;
  const ethPrice = Number(prices?.['ETH/USD']) || 1912.62;
  const nvdaPrice = Number(prices?.['NVDA']) || 197.65;
  const aaplPrice = Number(prices?.['AAPL']) || 339.14;

  // Formattazione Minuti : Secondi per il Timer
  const formatTimer = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  // Generatore Automatico di Notifiche AI sulle Opportunità di Mercato
  useEffect(() => {
    if (!notifSettings.marketAi) return;

    const interval = setInterval(() => {
      const liveBtc = Number(getLivePrice('BTC/USD')) || 64500;
      const aiAlertMsg = `AI Market Alert: Formazione di un Order Block rialzista su BTC/USD a $${liveBtc}. Opportunità d'ingresso raccomandata con R:R 1:3.`;

      useTradingStore.setState((state) => {
        const existing = state.notifications || [];
        if (existing.some((n) => n.message === aiAlertMsg)) return state;
        return {
          notifications: [
            {
              id: Date.now(),
              type: 'AI OPPORTUNITÀ',
              category: 'marketAi',
              message: aiAlertMsg
            },
            ...existing
          ]
        };
      });
    }, 45000);

    return () => clearInterval(interval);
  }, [getLivePrice, notifSettings.marketAi]);

  // Elimina singola notifica
  const handleDeleteNotification = (notifId) => {
    useTradingStore.setState((state) => ({
      notifications: (state.notifications || []).filter((n) => n.id !== notifId)
    }));
  };

  // Cancella tutte le notifiche
  const handleClearAllNotifications = () => {
    useTradingStore.setState({ notifications: [] });
  };

  // Filtra notifiche in base ai toggle impostati dall'utente
  const filteredNotifications = notifications.filter((n) => {
    if (n.type === 'COPY TRADING' && !notifSettings.copyTrading) return false;
    if (n.type === 'AI OPPORTUNITÀ' && !notifSettings.marketAi) return false;
    if (n.category === 'capitalRisk' && !notifSettings.capitalRisk) return false;
    return true;
  });

  return (
    <>
      <header className="h-14 glass-panel border-b border-slate-800/80 px-3 sm:px-6 flex items-center justify-between select-none z-20 overflow-visible relative font-sans">
        {/* Market Ticker Live con aggiornamento prezzi in tempo reale (PULITO SENZA BADGE PRO QUI) */}
        <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto no-scrollbar py-1">
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="font-outfit font-extrabold text-[11px] sm:text-xs tracking-wider text-blue-400">NEXUS ENGINE</span>
          </div>
          
          <div className="h-4 w-[1px] bg-slate-800 shrink-0"></div>

          <div className="flex items-center gap-3 sm:gap-5 text-[11px] sm:text-xs font-mono whitespace-nowrap">
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300">BTC</span>
              <span className="text-slate-100">${btcPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-emerald-400 font-medium">{priceChanges?.['BTC/USD'] || '+2.45%'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300">ETH</span>
              <span className="text-slate-100">${ethPrice.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              <span className="text-emerald-400 font-medium">{priceChanges?.['ETH/USD'] || '+1.82%'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300">NVDA</span>
              <span className="text-slate-100">${nvdaPrice.toFixed(2)}</span>
              <span className="text-emerald-400 font-medium">{priceChanges?.['NVDA'] || '+4.12%'}</span>
            </div>
            <div className="flex items-center gap-1">
              <span className="font-semibold text-slate-300">AAPL</span>
              <span className="text-slate-100">${aaplPrice.toFixed(2)}</span>
              <span className="text-emerald-400 font-medium">{priceChanges?.['AAPL'] || '+0.85%'}</span>
            </div>
          </div>
        </div>

        {/* Riquadro Destra: WIDGET TIMER PROVA GRATUITA (MOSTRATO SOLO SE IN TRIAL) + GUADAGNO NETTO + CAMPANELLA */}
        <div className="flex items-center gap-2.5 shrink-0 ml-2 relative">
          
          {/* WIDGET TIMER MOSTRATO SOLO SE L'UTENTE È IN PROVA GRATUITA */}
          {!activeUser?.subscription?.active && (
            <button
              onClick={() => setIsSubscriptionModalOpen(true)}
              className={`px-3 py-1 rounded-full border text-[10px] sm:text-xs font-bold font-mono transition-all flex items-center gap-1 cursor-pointer ${
                trialRemainingSeconds <= 60
                  ? 'bg-rose-500/20 text-rose-300 border-rose-500/50 animate-pulse'
                  : 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
              }`}
              title="Prova Gratuita 5 Minuti - Clicca per Abbonarti"
            >
              <span>Prova Gratuita</span>
              <span className="font-extrabold">{formatTimer(trialRemainingSeconds)}</span>
            </button>
          )}

          {/* Badge Guadagno Netto */}
          <div className="flex items-center gap-1.5 px-2.5 sm:px-4 py-1.5 rounded-full bg-slate-900/80 border border-slate-800 text-[11px] sm:text-xs">
            <span className="text-slate-400 font-medium hidden sm:inline">Guadagno Netto:</span>
            <span className="text-slate-400 font-medium sm:hidden">Net:</span>
            <strong className={`font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {isProfit ? '+' : ''}${totalNetPnl.toFixed(2)}
            </strong>
          </div>

          {/* CAMPANELLA NOTIFICHE LIVE */}
          <div className="relative">
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="w-9 h-9 rounded-full bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 text-slate-300 hover:text-blue-400 flex items-center justify-center transition-all relative group"
              title="Centro Notifiche Copy Trading & AI Opportunities"
            >
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.89 2 2 2zm6-6v-5c0-3.07-1.64-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.63 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/>
              </svg>

              {filteredNotifications.length > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-blue-600 text-white font-black text-[9px] flex items-center justify-center animate-pulse border border-slate-950">
                  {filteredNotifications.length}
                </span>
              )}
            </button>

            {/* DRAWER PANNELLO NOTIFICHE */}
            {isNotifOpen && (
              <div className="absolute right-0 top-12 w-80 sm:w-96 rounded-2xl bg-slate-950/95 border border-slate-800 p-4 shadow-2xl z-50 space-y-3 animate-fade-in backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-bold text-white font-outfit uppercase tracking-wider">Notifiche</span>
                    <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-bold">
                      {filteredNotifications.length}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowNotifSettings(!showNotifSettings)}
                      className="text-[10px] text-slate-400 hover:text-blue-400 font-medium underline"
                    >
                      {showNotifSettings ? 'Chiudi Filtri' : '⚙️ Filtri'}
                    </button>
                    {filteredNotifications.length > 0 && (
                      <button
                        onClick={handleClearAllNotifications}
                        className="text-[10px] text-slate-400 hover:text-rose-400 font-medium underline"
                      >
                        Pulisci
                      </button>
                    )}
                  </div>
                </div>

                {/* IMPOSTAZIONI FILTRI MUTE NOTIFICHE */}
                {showNotifSettings && (
                  <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                    <p className="text-[10px] font-bold text-slate-400 uppercase">Filtra categorie di avvisi:</p>
                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>Copy Trading</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.copyTrading}
                        onChange={(e) => setNotifSettings({ ...notifSettings, copyTrading: e.target.checked })}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>AI Market Opportunities</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.marketAi}
                        onChange={(e) => setNotifSettings({ ...notifSettings, marketAi: e.target.checked })}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                    </label>
                    <label className="flex items-center justify-between cursor-pointer text-slate-300">
                      <span>Alert Rischio Capitale</span>
                      <input
                        type="checkbox"
                        checked={notifSettings.capitalRisk}
                        onChange={(e) => setNotifSettings({ ...notifSettings, capitalRisk: e.target.checked })}
                        className="w-3.5 h-3.5 accent-blue-600"
                      />
                    </label>
                  </div>
                )}

                {/* LISTA NOTIFICHE */}
                <div className="max-h-72 overflow-y-auto space-y-2 pr-1 no-scrollbar text-xs">
                  {filteredNotifications.length === 0 ? (
                    <p className="text-center text-slate-500 py-6 text-xs font-medium">
                      Nessuna nuova notifica presente.
                    </p>
                  ) : (
                    filteredNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-2.5 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-start justify-between gap-2 group hover:border-slate-700"
                      >
                        <div className="space-y-0.5 flex-1 min-w-0">
                          <span className={`text-[9px] font-bold uppercase tracking-wider block ${
                            notif.type === 'AI OPPORTUNITÀ'
                              ? 'text-blue-400'
                              : notif.type === 'COPY TRADING'
                              ? 'text-purple-400'
                              : 'text-emerald-400'
                          }`}>
                            {notif.type || 'SISTEMA'}
                          </span>
                          <p className="text-slate-200 text-[11px] leading-snug break-words">
                            {notif.message}
                          </p>
                        </div>
                        <button
                          onClick={() => handleDeleteNotification(notif.id)}
                          className="text-slate-500 hover:text-rose-400 p-1 font-bold text-xs"
                          title="Elimina notifica"
                        >
                          ✕
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Modal Abbonamento Volontario (se aperto dal tasto Header) */}
      <SubscriptionModal
        isOpen={isSubscriptionModalOpen}
        onClose={() => setIsSubscriptionModalOpen(false)}
        activeUser={activeUser}
        isTrialExpired={false}
        onSubscriptionSuccess={() => {
          setIsSubscriptionModalOpen(false);
          setActiveUser(getActiveUserSession());
        }}
      />
    </>
  );
};

export default Header;
