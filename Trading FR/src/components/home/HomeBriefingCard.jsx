import Card from '../common/Card';
import LoadingState from '../common/LoadingState';

const HomeBriefingCard = ({ isLoading = false, briefing = null, onNavigateToPortfolio }) => {
  if (isLoading) {
    return <LoadingState lines={3} />;
  }

  if (!briefing) {
    return null;
  }

  return (
    <Card className="border-blue-500/20 space-y-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
          Briefing Sintetico AI (Calcolo Reale Backend)
        </span>
        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
          briefing.riskLevel === 'Alto'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          Rischio: {briefing.riskLevel} ({briefing.riskScore}/100)
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        {/* Rischio Attuale */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-400 font-semibold block">Rischio Attuale</span>
          <p className="text-slate-200 leading-normal">{briefing.riskSummary}</p>
        </div>

        {/* Ultimo Trade */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-slate-400 font-semibold block">Ultimo Trade Eseguito</span>
          <p className="text-slate-200 leading-normal">{briefing.lastTradeSummary}</p>
        </div>

        {/* Suggerimento Strategico */}
        <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-1">
          <span className="text-blue-400 font-semibold block">Suggerimento Strategico</span>
          <p className="text-slate-200 leading-normal">{briefing.suggestion}</p>
        </div>
      </div>
    </Card>
  );
};

export default HomeBriefingCard;
