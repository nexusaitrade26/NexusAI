import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import LoadingState from '../../common/LoadingState';

const ExposureBreakdown = ({ isLoading = false, exposure = [] }) => {
  if (isLoading) {
    return <LoadingState lines={3} />;
  }

  if (!exposure || exposure.length === 0) {
    return (
      <EmptyState
        title="Nessuna Esposizione Calcolata"
        description="La ripartizione dell'esposizione per settore e categoria viene aggregata in tempo reale in base alle posizioni aperte."
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
          Esposizione per Categoria / Settore
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Aggregazione Live</span>
      </div>

      <div className="space-y-3">
        {exposure.map((exp, idx) => {
          const cat = exp?.category || 'Altro';
          const pct = Number(exp?.percent ?? exp?.percentage) || 0;
          const val = Number(exp?.value);
          const color = exp?.color || '#3b82f6';

          return (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-medium">
                <span className="text-slate-200">{cat}</span>
                <span className="text-blue-400 font-bold font-mono">
                  {!isNaN(val) ? `$${val.toLocaleString()} ` : ''}({pct}%)
                </span>
              </div>
              <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                <div
                  className="h-full rounded-full transition-all duration-500 shadow-liquid-glow"
                  style={{ width: `${Math.min(Math.max(pct, 0), 100)}%`, backgroundColor: color }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default ExposureBreakdown;
