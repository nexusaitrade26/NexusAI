import SectionHeader from '../components/common/SectionHeader';
import Card from '../components/common/Card';
import { useMarket } from '../context/MarketContext';
import { useTradingStore } from '../store/useTradingStore';

const HomePage = ({ onSelectTab, onNavigateToSection, onNavigateToPortfolio }) => {
  const { selectedAsset, getLivePrice } = useMarket();
  const openPositions = useTradingStore((state) => state.positions);
  const closedTrades = useTradingStore((state) => state.closedTrades);

  // 1. Totale Capitale Investito
  const openInvested = openPositions.reduce((acc, p) => {
    const qty = Number(p.quantity) || 0;
    const entry = Number(p.entryPrice) || 0;
    return acc + (qty * entry);
  }, 0);

  const closedInvested = closedTrades.reduce((acc, t) => {
    const qty = Number(t.quantity) || 0;
    const entry = Number(t.entryPrice) || 0;
    return acc + (qty * entry);
  }, 0);

  const totalInvested = openInvested + closedInvested;

  // 2. Guadagno / Perdita Netta (P&L Aperto live + P&L Chiuso)
  const openPnl = openPositions.reduce((acc, p) => {
    const qty = Number(p.quantity) || 0;
    const entry = Number(p.entryPrice) || 0;
    const live = getLivePrice(p.asset) || entry;
    const isLong = p.side === 'BUY' || p.side === 'long' || !p.side;
    const pnl = isLong ? (live - entry) * qty : (entry - live) * qty;
    return acc + pnl;
  }, 0);

  const closedPnl = closedTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
  const totalNetPnl = (isNaN(openPnl + closedPnl) ? 0 : parseFloat((openPnl + closedPnl).toFixed(2))) || 0;

  // 3. Ritorno sull'Investimento (ROI %)
  const baseInvested = totalInvested > 0 ? totalInvested : 1000;
  const roiPercent = (isNaN(totalNetPnl) ? 0 : parseFloat(((totalNetPnl / baseInvested) * 100).toFixed(2))) || 0;

  // Statistiche Journal
  const totalTradesCount = closedTrades.length;
  const winsCount = closedTrades.filter((t) => (Number(t.pnl) || 0) > 0).length;
  const winRate = totalTradesCount > 0 ? parseFloat(((winsCount / totalTradesCount) * 100).toFixed(1)) : 0;

  const handleNav = (target) => {
    if (target === 'trade') {
      if (onSelectTab) onSelectTab('workarea', 'trade');
      else if (onNavigateToSection) onNavigateToSection('workarea', 'trade');
    } else if (target === 'portfolio' || target === 'portafolio') {
      if (onSelectTab) onSelectTab('workarea', 'portafolio');
      else if (onNavigateToSection) onNavigateToSection('workarea', 'portafolio');
      else if (onNavigateToPortfolio) onNavigateToPortfolio();
    } else if (target === 'journal') {
      if (onSelectTab) onSelectTab('workarea', 'journal');
      else if (onNavigateToSection) onNavigateToSection('workarea', 'journal');
    } else if (target === 'studio') {
      if (onSelectTab) onSelectTab('studio');
      else if (onNavigateToSection) onNavigateToSection('studio');
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Dashboard Executive Hub"
        subtitle="Sintesi panoramica in tempo reale delle 4 sezioni principali: Trade, Portafolio, Journal e Studio."
      />

      {/* Grid delle 4 Sezioni Principali dell'App */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

        {/* Card 1: SEZIONE TRADE */}
        <Card className="border-blue-500/30 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Centro Operativo Trade
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
              TradingView & Gemini AI
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Asset Attivo sul Grafico:</span>
              <strong className="text-slate-100 font-mono font-bold">{selectedAsset}</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Intelligence Gemini AI:</span>
              <strong className="text-emerald-400 font-bold">Bullish (Rialzista)</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Posizioni Attive:</span>
              <strong className="text-blue-400 font-bold font-mono">{openPositions.length} Operazioni</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleNav('trade')}
              className="w-full py-2.5 rounded-xl bg-blue-600/20 text-blue-400 hover:bg-blue-600/30 border border-blue-500/30 font-bold text-xs transition-all"
            >
              Apri Sezione Trade &rarr;
            </button>
          </div>
        </Card>

        {/* Card 2: SEZIONE PORTAFOLIO */}
        <Card className="border-emerald-500/30 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Gestione Portafolio
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
              Risk Score: {openPositions.length * 15} / 100
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Capitale Investito</span>
              <strong className="text-slate-100 font-mono font-bold text-xs">${(Number(totalInvested) || 0).toFixed(2)}</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Guadagno Netto</span>
              <strong className={`font-mono font-bold text-xs ${totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalNetPnl >= 0 ? '+' : ''}${(Number(totalNetPnl) || 0).toFixed(2)}
              </strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Resa ROI</span>
              <strong className={`font-mono font-bold text-xs ${roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                {roiPercent >= 0 ? '+' : ''}${(Number(roiPercent) || 0).toFixed(2)}%
              </strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleNav('portfolio')}
              className="w-full py-2.5 rounded-xl bg-emerald-600/20 text-emerald-400 hover:bg-emerald-600/30 border border-emerald-500/30 font-bold text-xs transition-all"
            >
              Apri Sezione Portafolio &rarr;
            </button>
          </div>
        </Card>

        {/* Card 3: SEZIONE JOURNAL */}
        <Card className="border-purple-500/30 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Diario Operativo (Journal)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[10px] font-bold text-purple-300">
              Psicologia & Tag
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Percentuale Vittoria</span>
              <strong className="text-emerald-400 font-bold text-xs">{winRate}%</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Drawdown Max</span>
              <strong className="text-rose-400 font-bold text-xs">0%</strong>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
              <span className="text-slate-400 block text-[10px]">Trade Chiusi</span>
              <strong className="text-blue-400 font-bold text-xs">{closedTrades.length}</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleNav('journal')}
              className="w-full py-2.5 rounded-xl bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30 font-bold text-xs transition-all"
            >
              Apri Sezione Diario &rarr;
            </button>
          </div>
        </Card>

        {/* Card 4: SEZIONE STUDIO */}
        <Card className="border-amber-500/30 flex flex-col justify-between space-y-4">
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse"></span>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Studio (Percorso Formativo)
              </h3>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
              30 Lezioni Estese
            </span>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="flex justify-between">
              <span className="text-slate-400">Livello Base:</span>
              <strong className="text-slate-100 font-bold">10 Lezioni con Walkthrough Animati</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Livello Intermedio:</span>
              <strong className="text-slate-100 font-bold">10 Lezioni con Pattern Grafici</strong>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Livello Avanzato:</span>
              <strong className="text-slate-100 font-bold">10 Lezioni con Manuali Completi</strong>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80">
            <button
              onClick={() => handleNav('studio')}
              className="w-full py-2.5 rounded-xl bg-amber-600/20 text-amber-400 hover:bg-amber-600/30 border border-amber-500/30 font-bold text-xs transition-all"
            >
              Apri Sezione Studio &rarr;
            </button>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default HomePage;
