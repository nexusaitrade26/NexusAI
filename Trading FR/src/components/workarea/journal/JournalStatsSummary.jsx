import Card from '../../common/Card';
import LoadingState from '../../common/LoadingState';

const JournalStatsSummary = ({ isLoading = false, stats = null }) => {
  if (isLoading) {
    return <LoadingState lines={2} />;
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      {/* Stat 1: Percentuale di Vittoria */}
      <Card className="flex flex-col justify-between border-emerald-500/20">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Percentuale di Vittoria</span>
        <div className="my-2">
          <span className="text-2xl font-black font-outfit text-emerald-400">
            {stats ? `${stats.winRate}%` : '0%'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Operazioni in profitto nel Diario</span>
      </Card>

      {/* Stat 2: Drawdown Massimo */}
      <Card className="flex flex-col justify-between border-rose-500/20">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Drawdown Massimo</span>
        <div className="my-2">
          <span className="text-2xl font-black font-outfit text-rose-400">
            {stats ? `${stats.maxDrawdown}%` : '0%'}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Picco massimo di perdita accumulata</span>
      </Card>

      {/* Stat 3: Totale Trade */}
      <Card className="flex flex-col justify-between border-blue-500/20">
        <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider">Trade Chiusi Totali</span>
        <div className="my-2">
          <span className="text-2xl font-black font-outfit text-blue-400">
            {stats ? stats.totalTrades : 0}
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Registrati nel database SQLite</span>
      </Card>
    </div>
  );
};

export default JournalStatsSummary;
