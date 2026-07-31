import Card from '../common/Card';
import EmptyState from '../common/EmptyState';
import LoadingState from '../common/LoadingState';

const OpenPositionsPreview = ({ isLoading = false, positions = [], onNavigateToPortfolio }) => {
  if (isLoading) {
    return <LoadingState lines={3} />;
  }

  if (!positions || positions.length === 0) {
    return (
      <EmptyState
        title="Nessuna Posizione Aperta"
        description="Al momento non sono presenti posizioni attive nel portafoglio."
        actionLabel="Vai a Portafolio"
        onAction={onNavigateToPortfolio}
      />
    );
  }

  return (
    <Card>
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
          Anteprima Posizioni Aperte
        </span>
        <button
          onClick={onNavigateToPortfolio}
          className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
        >
          Portafolio Completo &rarr;
        </button>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="pb-2">Asset</th>
              <th className="pb-2">Quantità</th>
              <th className="pb-2">P&L</th>
              <th className="pb-2">% Portafolio</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {positions.slice(0, 3).map((pos) => {
              const isProfit = pos.pnl >= 0;
              return (
                <tr key={pos.id}>
                  <td className="py-2.5 font-bold text-slate-100">{pos.asset}</td>
                  <td className="py-2.5">{pos.quantity}</td>
                  <td className={`py-2.5 font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isProfit ? '+' : ''}${pos.pnl}
                  </td>
                  <td className="py-2.5 text-blue-400 font-semibold">{pos.portfolioSharePercent}%</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default OpenPositionsPreview;
