import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';

const ClosedTradesList = ({ trades = [], onUpdateTag, onDeleteTrade }) => {
  if (!trades || trades.length === 0) {
    return (
      <EmptyState
        title="Nessun Trade Chiuso Trovato"
        description="I trade chiusi e le operazioni concluse verranno registrati qui nel Diario."
      />
    );
  }

  const tags = ['Calmo', 'Ansioso', 'FOMO', 'Vendetta', 'Strategico'];

  return (
    <Card>
      <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
          Elenco Trade Chiusi nel Diario ({trades.length})
        </span>
        <span className="text-[10px] text-slate-400 font-medium">Gestione ed Eliminazione Registro</span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="pb-3">ID</th>
              <th className="pb-3">Asset</th>
              <th className="pb-3">Direzione</th>
              <th className="pb-3">Quantità</th>
              <th className="pb-3">Capitale Investito</th>
              <th className="pb-3">Ingresso ($)</th>
              <th className="pb-3">Uscita ($)</th>
              <th className="pb-3">P&L Finale ($)</th>
              <th className="pb-3">Stato</th>
              <th className="pb-3">Tag Emotivo</th>
              <th className="pb-3 text-right">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {trades.map((t) => {
              const numPnl = Number(t.pnl) || 0;
              const isWin = numPnl >= 0;
              const qty = Number(t.quantity) || 0;
              const entry = Number(t.entryPrice) || 0;
              const exit = Number(t.exitPrice) || entry;
              const invested = (qty * entry).toFixed(2);
              const isBuy = t.side === 'BUY' || t.side === 'long' || !t.side;

              return (
                <tr key={t.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-mono text-slate-400">#{t.id}</td>
                  <td className="py-3 font-bold text-slate-100">{t.asset}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase border ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-blue-400">{qty} Lotti</td>
                  <td className="py-3 font-mono font-semibold text-slate-200">${invested}</td>
                  <td className="py-3 font-mono text-slate-300">${entry.toFixed(2)}</td>
                  <td className="py-3 font-mono text-slate-100">${exit.toFixed(2)}</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={isWin ? 'text-emerald-400' : 'text-rose-400'}>
                      {isWin ? '+' : ''}${numPnl.toFixed(2)}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isWin
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isWin ? 'Win' : 'Loss'}
                    </span>
                  </td>
                  <td className="py-3">
                    <select
                      value={t.emotionalTag || ''}
                      onChange={(e) => onUpdateTag && onUpdateTag(t.id, e.target.value || null)}
                      className="bg-slate-900 border border-slate-800 rounded-lg px-2 py-1 text-[11px] text-slate-200 focus:outline-none focus:border-blue-500 font-semibold"
                    >
                      <option value="">Seleziona Tag...</option>
                      {tags.map((tag) => (
                        <option key={tag} value={tag}>
                          {tag}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-3 text-right">
                    <button
                      onClick={() => onDeleteTrade && onDeleteTrade(t.id)}
                      className="px-3 py-1 rounded-xl bg-rose-600/20 text-rose-300 border border-rose-500/30 font-bold text-[10px] hover:bg-rose-600/30 transition-all"
                    >
                      Elimina
                    </button>
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

export default ClosedTradesList;
