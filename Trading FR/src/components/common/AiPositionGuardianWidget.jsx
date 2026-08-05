import { useState, useEffect } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useTradingStore } from '../../store/useTradingStore';

const AiPositionGuardianSingleWidget = ({ activePos, widgetIndex }) => {
  const { getLivePrice } = useMarket();
  const widgetModes = useTradingStore((state) => state.widgetModes) || {};
  const globalMode = useTradingStore((state) => state.aiGuardianMode);
  const setWidgetModeForPosition = useTradingStore((state) => state.setWidgetModeForPosition);
  const updatePositionSLTP = useTradingStore((state) => state.updatePositionSLTP);
  const closePosition = useTradingStore((state) => state.closePosition);

  // Ottieni la modalità per questa specifica posizione
  const mode = widgetModes[activePos.id] || globalMode || 'toast';
  const setMode = (newMode) => {
    setWidgetModeForPosition(activePos.id, newMode);
  };

  const [isExiting, setIsExiting] = useState(false);
  const [appliedNotice, setAppliedNotice] = useState(null);

  // Timer di Auto-Dismiss Notifica Banner a 5 secondi con effetto scorrimento verso destra (slide-out)
  useEffect(() => {
    if (mode === 'toast') {
      setIsExiting(false);
      const exitTimer = setTimeout(() => {
        setIsExiting(true);
      }, 4550);

      const closeTimer = setTimeout(() => {
        setMode('closed');
        setIsExiting(false);
      }, 5000);

      return () => {
        clearTimeout(exitTimer);
        clearTimeout(closeTimer);
      };
    }
  }, [mode, activePos.id]);

  if (mode === 'closed') return null;

  const qty = Number(activePos.quantity) || 1;
  const entry = Number(activePos.entryPrice) || 100;
  const livePrice = Number(getLivePrice(activePos.asset)) || entry;
  const isLong = activePos.side === 'BUY' || activePos.side === 'long' || !activePos.side;

  const pnlVal = isLong ? (livePrice - entry) * qty : (entry - livePrice) * qty;
  const pnlPctVal = entry > 0 ? (isLong ? ((livePrice - entry) / entry) * 100 : ((entry - livePrice) / entry) * 100) : 0;
  const isProfit = pnlVal >= 0;

  const absPnl = Math.abs(pnlVal).toFixed(2);
  const absPct = Math.abs(pnlPctVal).toFixed(2);
  const pnlSign = isProfit ? '+' : '-';

  // Calcolo dinamico del consiglio Nexus AI Guardian
  let aiStatusText = '';
  let aiStatusBadgeClass = '';
  let aiAdviceText = '';
  let recommendedSL = activePos.stopLoss ? Number(activePos.stopLoss) : entry;
  let recommendedTP = activePos.takeProfit ? Number(activePos.takeProfit) : (isLong ? entry * 1.05 : entry * 0.95);

  if (isProfit) {
    if (pnlPctVal > 2.0) {
      aiStatusText = 'FORTE MOMENTUM';
      aiStatusBadgeClass = 'text-emerald-400 font-bold';
      aiAdviceText = `La posizione su ${activePos.asset} è in guadagno (+${absPct}%). Sposta lo Stop Loss a pareggio ($${entry.toFixed(2)}) e alza il TP a $${(isLong ? livePrice * 1.03 : livePrice * 0.97).toFixed(2)} per profitto a rischio zero.`;
      recommendedSL = entry;
      recommendedTP = parseFloat((isLong ? livePrice * 1.03 : livePrice * 0.97).toFixed(2));
    } else {
      aiStatusText = 'POSIZIONE IN SALUTE';
      aiStatusBadgeClass = 'text-blue-400 font-bold';
      aiAdviceText = `Operazione ${activePos.side} su ${activePos.asset} in corso (+${absPct}%). Nexus AI consiglia di mantenere la posizione e impostare lo SL al prezzo d'ingresso ($${entry.toFixed(2)}).`;
      recommendedSL = entry;
    }
  } else {
    if (pnlPctVal < -3.0) {
      aiStatusText = 'ALTO RISCHIO';
      aiStatusBadgeClass = 'text-rose-400 font-bold';
      aiAdviceText = `Mercato in pressione contraria (${pnlSign}${absPct}%). Valuta chiusura anticipata o proteggi la posizione fissando il nuovo SL a $${(isLong ? entry * 0.97 : entry * 1.03).toFixed(2)}.`;
      recommendedSL = parseFloat((isLong ? entry * 0.97 : entry * 1.03).toFixed(2));
    } else {
      aiStatusText = 'MONITORAGGIO LIVE';
      aiStatusBadgeClass = 'text-amber-300 font-bold';
      aiAdviceText = `Volatilità moderata su ${activePos.asset} (${pnlSign}${absPct}%). Mantieni i livelli correnti.`;
    }
  }

  const handleApplyAdvice = () => {
    updatePositionSLTP(activePos.id, recommendedSL, recommendedTP);
    setAppliedNotice(`Consiglio AI applicato: SL a $${recommendedSL}`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const handleBreakEven = () => {
    updatePositionSLTP(activePos.id, entry, activePos.takeProfit);
    setAppliedNotice(`SL impostato al Break-Even ($${entry.toFixed(2)})`);
    setTimeout(() => setAppliedNotice(null), 3000);
  };

  const handleClosePos = () => {
    closePosition(activePos.id, livePrice, 'AI Guardian Close');
  };

  // Calcolo dell'offset verticale per impilare piu widget compatti a destra senza sovrapposizioni
  const topOffsetPx = 96 + widgetIndex * 54; // top-24 (96px) + 54px per ogni widget aggiuntivo

  // VISTA 1: MODALITÀ WIDGET COMPATTO A DESTRA (ATTIVABILE TRAMITE TASTATO MINIMIZZA "-")
  if (mode === 'widget') {
    return (
      <div
        style={{ top: `${topOffsetPx}px` }}
        className="fixed right-4 z-50 flex items-center gap-2.5 bg-[#0b0f19]/95 border border-blue-500/40 rounded-full px-4 py-2 shadow-2xl animate-fade-in backdrop-blur-md font-sans transition-all duration-300"
      >
        <span className="text-emerald-400 font-bold text-[10px] font-outfit uppercase tracking-wider">LIVE</span>
        
        <div className="text-xs">
          <strong className="text-white font-outfit">{activePos.asset} ({activePos.side})</strong>
          <span className={`ml-2 font-mono font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pnlSign}${absPnl}
          </span>
        </div>

        {/* Tasti controllo stile finestra: Ingrandisci (frecce diagonali) | Chiudi X */}
        <div className="flex items-center gap-1 ml-1 border-l border-slate-800/80 pl-2">
          <button
            onClick={() => setMode('window')}
            title="Ingrandisci Finestrella"
            className="w-6 h-6 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <button
            onClick={() => setMode('closed')}
            title="Chiudi Widget Posizione"
            className="w-6 h-6 rounded-lg hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 flex items-center justify-center font-bold text-xs transition-all"
          >
            X
          </button>
        </div>
      </div>
    );
  }

  // VISTA 2: MODALITÀ FINESTRELLA INGRANDITA (MODAL AL CENTRO SCHERMO - SENZA TASTO X, SOLO TASTATO MINIMIZZA -)
  if (mode === 'window') {
    return (
      <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in font-sans">
        <div className="glass-panel bg-[#090d1a]/95 border border-blue-500/40 rounded-3xl p-6 max-w-xl w-full shadow-2xl relative space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-emerald-400 font-bold text-[10px] font-outfit uppercase tracking-wider">LIVE</span>
              <div>
                <h3 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">
                  Analisi Finestra Estesa Nexus AI Guardian ({activePos.asset})
                </h3>
                <span className={`text-[9px] font-bold uppercase mt-0.5 inline-block ${aiStatusBadgeClass}`}>
                  {aiStatusText}
                </span>
              </div>
            </div>

            {/* Tasti di Controllo senza riquadro: Solo Minimizza - quando è ingrandita (senza tasto X) */}
            <div className="flex items-center gap-1 font-mono">
              <button
                onClick={() => setMode('widget')}
                title="Minimizza in Widget"
                className="w-7 h-7 rounded-lg hover:bg-slate-800/80 text-slate-300 hover:text-white flex items-center justify-center text-base font-bold transition-all"
              >
                -
              </button>
            </div>
          </div>

          {appliedNotice && (
            <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-300 text-xs font-bold">
              {appliedNotice}
            </div>
          )}

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Asset & Side</span>
              <strong className="text-white font-bold">{activePos.asset} ({activePos.side})</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">Ingresso</span>
              <strong className="text-slate-200 font-mono">${entry.toFixed(entry < 2 ? 4 : 2)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-blue-500/30">
              <span className="text-[10px] text-blue-400 block">Prezzo Live</span>
              <strong className="text-blue-300 font-mono">${livePrice.toFixed(livePrice < 2 ? 4 : 2)}</strong>
            </div>
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-slate-800">
              <span className="text-[10px] text-slate-400 block">P&L Live</span>
              <strong className={`font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pnlSign}${absPnl} ({pnlSign}{absPct}%)
              </strong>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-2">
            <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider">Sintesi Tattica Gemini AI</h4>
            <p className="text-xs text-slate-200 leading-relaxed font-medium">{aiAdviceText}</p>
          </div>

          <div className="flex flex-wrap gap-2 pt-2">
            <button
              onClick={handleApplyAdvice}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-liquid-glow"
            >
              Applica Consiglio AI
            </button>
            <button
              onClick={handleBreakEven}
              className="py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-xs"
            >
              SL al Pareggio (${entry.toFixed(2)})
            </button>
            <button
              onClick={handleClosePos}
              className="py-2.5 px-4 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-xs"
            >
              Chiudi Operazione
            </button>
          </div>
        </div>
      </div>
    );
  }

  // VISTA 3 (SLIDE-IN BANNER TOAST): SPUNTA DA DESTRA E SCOMPARE CON SLIDE-OUT VERSO DESTRA DOPO 5 SECONDI
  return (
    <div
      style={{ top: `${80 + widgetIndex * 140}px` }}
      className={`fixed right-4 sm:right-6 z-50 w-[90vw] sm:w-[360px] bg-[#0b0f19]/95 border border-blue-500/40 rounded-3xl p-4 shadow-2xl font-sans space-y-3 backdrop-blur-md transition-all duration-300 ${
        isExiting ? 'animate-slide-out-right' : 'animate-slide-in-right'
      }`}
    >
      <div className="flex justify-between items-center border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-bold text-[10px] font-outfit uppercase tracking-wider">LIVE</span>
          <h4 className="text-xs font-bold uppercase tracking-wider text-white font-outfit">
            AI Guardian Alert
          </h4>
        </div>

        <div className="flex items-center gap-1 font-mono">
          <button
            onClick={() => setMode('widget')}
            title="Minimizza in Widget"
            className="w-6 h-6 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center text-sm font-bold transition-all"
          >
            -
          </button>
          <button
            onClick={() => setMode('window')}
            title="Ingrandisci Finestrella"
            className="w-6 h-6 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white flex items-center justify-center transition-all"
          >
            <svg className="w-3.5 h-3.5 stroke-current" viewBox="0 0 24 24" fill="none" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </button>
          <button
            onClick={() => setMode('closed')}
            title="Chiudi Notifica"
            className="w-6 h-6 rounded-lg hover:bg-rose-600/20 text-slate-400 hover:text-rose-400 flex items-center justify-center text-xs font-bold transition-all"
          >
            X
          </button>
        </div>
      </div>

      {appliedNotice && (
        <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-300 text-[11px] font-bold">
          {appliedNotice}
        </div>
      )}

      <div className="flex items-center justify-between text-xs p-2.5 rounded-2xl bg-slate-950/80 border border-slate-800">
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Asset & Direzione</span>
          <strong className="text-white font-bold">{activePos.asset} ({activePos.side})</strong>
        </div>
        <div>
          <span className="text-[10px] text-slate-400 block font-medium">Prezzo Live</span>
          <strong className="text-blue-400 font-mono">${livePrice.toFixed(livePrice < 2 ? 4 : 2)}</strong>
        </div>
        <div className="text-right">
          <span className="text-[10px] text-slate-400 block font-medium">P&L Live</span>
          <strong className={`font-mono ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
            {pnlSign}${absPnl}
          </strong>
        </div>
      </div>

      <div className="p-3 rounded-2xl bg-slate-900/80 border border-blue-500/30 text-[11px] text-slate-200 leading-relaxed font-medium">
        {aiAdviceText}
      </div>

      <div className="flex items-center gap-2 pt-1">
        <button
          onClick={handleApplyAdvice}
          className="flex-1 py-2 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-liquid-glow transition-all"
        >
          Applica Consiglio AI
        </button>
        <button
          onClick={handleBreakEven}
          className="py-2 px-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 font-bold text-[11px] transition-all"
        >
          SL Pareggio
        </button>
        <button
          onClick={handleClosePos}
          className="py-2 px-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/30 text-rose-400 border border-rose-500/40 font-bold text-[11px] transition-all"
        >
          Chiudi
        </button>
      </div>
    </div>
  );
};

// COMPONENTE CONTENITORE MULTI-WIDGET: Gestisce più widget contemporanei per ogni posizione aperta!
const AiPositionGuardianWidget = () => {
  const positions = useTradingStore((state) => state.positions) || [];
  const widgetModes = useTradingStore((state) => state.widgetModes) || {};
  const globalMode = useTradingStore((state) => state.aiGuardianMode);

  if (!positions || positions.length === 0) {
    return null;
  }

  // Controlla se c'è un widget attualmente ingrandito a tutto schermo (Modalità Finestra Estesa 'window')
  const windowPos = positions.find((p) => {
    const m = widgetModes[p.id] || globalMode;
    return m === 'window';
  });

  // Se un widget è ingrandito a finestra estesa, nascondi temporaneamente gli altri e mostra solo la finestra attiva
  if (windowPos) {
    return (
      <AiPositionGuardianSingleWidget
        key={windowPos.id}
        activePos={windowPos}
        widgetIndex={0}
      />
    );
  }

  // Altrimenti mostra tutti i widget compatti attivi
  return (
    <>
      {positions.map((pos, index) => (
        <AiPositionGuardianSingleWidget key={pos.id} activePos={pos} widgetIndex={index} />
      ))}
    </>
  );
};

export default AiPositionGuardianWidget;
