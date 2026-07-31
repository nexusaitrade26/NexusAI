import Card from '../../common/Card';

const PreTradeCheckSlot = ({ isEvaluating = false, evaluation = null }) => {
  return (
    <Card className="border-purple-500/20">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-purple-400">
          Pre-Trade Check (AI Risk Evaluation)
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Calcolo Reale Backend</span>
      </div>

      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 text-xs min-h-[140px] flex flex-col justify-center">
        {isEvaluating ? (
          <span className="animate-pulse text-purple-400 text-center">
            Calcolo del rischio pre-trade in corso sul server...
          </span>
        ) : evaluation ? (
          <div className="space-y-2 text-left">
            <div className={`p-2.5 rounded-xl border font-medium text-xs ${
              evaluation.isHighRisk
                ? 'bg-rose-500/10 text-rose-300 border-rose-500/30'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            }`}>
              {evaluation.message}
            </div>

            <div className="space-y-1 text-[11px] text-slate-400 pt-1">
              <div className="flex justify-between">
                <span>Valore Ordine Stimato:</span>
                <strong className="text-slate-200">${evaluation.orderValue}</strong>
              </div>
              <div className="flex justify-between">
                <span>% Capitale Impegnato:</span>
                <strong className="text-slate-200">{evaluation.capitalPercentage}%</strong>
              </div>
              <div className="flex justify-between">
                <span>Massimo Rischio Calcolato:</span>
                <strong className={evaluation.isHighRisk ? 'text-rose-400' : 'text-emerald-400'}>
                  ${evaluation.maxRiskAmount} ({evaluation.riskPercentOfCapital}%)
                </strong>
              </div>
            </div>
          </div>
        ) : (
          <p className="text-slate-500 text-center">
            Inserisci quantità ed asset per attivare il calcolo reale del rischio pre-ordine dal backend.
          </p>
        )}
      </div>
    </Card>
  );
};

export default PreTradeCheckSlot;
