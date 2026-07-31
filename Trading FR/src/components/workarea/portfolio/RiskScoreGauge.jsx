import Card from '../../common/Card';
import LoadingState from '../../common/LoadingState';

const RiskScoreGauge = ({ scoreData = null, riskData = null, isLoading = false }) => {
  if (isLoading) {
    return <LoadingState lines={3} />;
  }

  const data = riskData || scoreData;

  const score = data ? data.score : 35;
  const level = data ? data.level : 'Basso';
  const details = data ? data.details : { concentrationRiskPercent: 20, exposureRatioPercent: 35, missingStopLossPercent: 0 };

  return (
    <Card className="flex flex-col justify-between border-purple-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
          Risk Score Indicatore
        </span>
        <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
          level === 'Alto'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : level === 'Moderato'
            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
        }`}>
          Livello {level}
        </span>
      </div>

      <div className="my-4 flex flex-col items-center justify-center">
        <div className="w-36 h-20 bg-slate-900/90 rounded-t-full border border-slate-800 flex items-end justify-center pb-2 relative overflow-hidden shadow-liquid-glow">
          <span className="text-2xl font-black font-outfit text-white">
            {score} <span className="text-xs font-normal text-slate-400">/ 100</span>
          </span>
        </div>
      </div>

      {details && (
        <div className="space-y-1.5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
          <div className="flex justify-between">
            <span>Rischio Concentrazione:</span>
            <strong className="text-slate-200">{details.concentrationRiskPercent}%</strong>
          </div>
          <div className="flex justify-between">
            <span>Esposizione / Capitale:</span>
            <strong className="text-slate-200">{details.exposureRatioPercent}%</strong>
          </div>
          <div className="flex justify-between">
            <span>Senza Stop Loss:</span>
            <strong className="text-rose-400">{details.missingStopLossPercent}%</strong>
          </div>
        </div>
      )}
    </Card>
  );
};

export default RiskScoreGauge;
