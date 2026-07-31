import Card from '../common/Card';
import LoadingState from '../common/LoadingState';

const PerformanceChartCard = ({ isLoading = false, performance = null }) => {
  if (isLoading) {
    return <LoadingState lines={4} />;
  }

  const points = performance?.points || [];

  return (
    <Card className="flex flex-col justify-between">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Grafico di Performance (Equity Curve Reale)
        </span>
        <span className="text-xs text-emerald-400 font-bold">
          Capitale: ${performance?.currentCapital?.toLocaleString()}
        </span>
      </div>

      <div className="w-full h-48 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative flex items-end justify-between overflow-hidden">
        {points.length <= 1 ? (
          <div className="w-full h-full flex items-center justify-center text-xs text-slate-500">
            Nessuno storico trade chiuso disponibile per calcolare la curva di equity.
          </div>
        ) : (
          <svg className="w-full h-full" viewBox="0 0 300 120">
            {/* Griglia di Sfondo */}
            <line x1="0" y1="30" x2="300" y2="30" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />
            <line x1="0" y1="90" x2="300" y2="90" stroke="rgba(255,255,255,0.05)" strokeDasharray="3 3" />

            {/* Tracciamento della Curva di Equity */}
            {points.map((pt, idx) => {
              if (idx === 0) return null;
              const prevPt = points[idx - 1];

              const minCap = 9500;
              const maxCap = 11000;
              const mapY = (c) => 110 - ((c - minCap) / (maxCap - minCap)) * 90;

              const x1 = ((idx - 1) / (points.length - 1)) * 280 + 10;
              const y1 = mapY(prevPt.capital);
              const x2 = (idx / (points.length - 1)) * 280 + 10;
              const y2 = mapY(pt.capital);

              return (
                <g key={idx}>
                  <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#38bdf8" strokeWidth="2.5" />
                  <circle cx={x2} cy={y2} r="4" fill="#38bdf8" />
                </g>
              );
            })}
          </svg>
        )}
      </div>
    </Card>
  );
};

export default PerformanceChartCard;
