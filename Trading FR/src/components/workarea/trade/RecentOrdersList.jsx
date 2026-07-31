import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import LoadingState from '../../common/LoadingState';

const RecentOrdersList = ({ isLoading = false, orders = [] }) => {
  if (isLoading) {
    return <LoadingState lines={4} />;
  }

  const formatPrice = (priceInUsd) => {
    if (priceInUsd === null || priceInUsd === undefined || isNaN(priceInUsd)) return '-';
    return `$${parseFloat(priceInUsd).toFixed(2)}`;
  };

  if (!orders || orders.length === 0) {
    return (
      <Card>
        <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Storico Ordini Recenti ($ USD Real-Time Engine)
          </span>
          <span className="text-[10px] text-slate-400 font-medium">Registro Ordini Locale & Cloud</span>
        </div>
        <EmptyState
          title="Nessun Ordine Attivo"
          description="Invia un nuovo ordine dal form soprastante per vederlo apparire ed elaborare in tempo reale qui."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Storico Ordini Recenti (Live Trading Monitor - $ USD)
          </span>
          <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 animate-pulse">
            Live ({orders.length} Inviati)
          </span>
        </div>
        <span className="text-[10px] text-slate-400 font-medium">Valori e Tipi di Ordine espressi in $ USD</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="pb-3">ID</th>
              <th className="pb-3">Asset</th>
              <th className="pb-3">Direzione</th>
              <th className="pb-3">Quantità (Lotti)</th>
              <th className="pb-3">Tipo Ordine</th>
              <th className="pb-3">Stop Loss (SL)</th>
              <th className="pb-3">Take Profit (TP)</th>
              <th className="pb-3 text-right">Stato Ordine</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {orders.map((ord) => {
              const isBuy = ord.side === 'BUY' || ord.side === 'long' || !ord.side;

              return (
                <tr key={ord.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-slate-400">#{ord.id}</td>
                  <td className="py-3 font-bold text-slate-100">{ord.asset}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-blue-400">{ord.quantity} Lotti</td>
                  <td className="py-3 font-semibold uppercase text-slate-300">{ord.type || 'market'}</td>
                  <td className="py-3 text-slate-400 font-mono">{formatPrice(ord.stopLoss)}</td>
                  <td className="py-3 text-slate-400 font-mono">{formatPrice(ord.takeProfit)}</td>
                  <td className="py-3 text-right">
                    <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase">
                      Eseguito
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

export default RecentOrdersList;
