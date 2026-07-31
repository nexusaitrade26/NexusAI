import { useState } from 'react';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import LoadingState from '../../common/LoadingState';
import { useMarket } from '../../../context/MarketContext';
import { useTradingStore } from '../../../store/useTradingStore';

const OpenPositionsList = ({ isLoading = false }) => {
  const [filterType, setFilterType] = useState('all'); // 'all' | 'open' | 'closed'
  const { getLivePrice } = useMarket();

  const storePositions = useTradingStore((state) => state.positions) || [];
  const storeClosed = useTradingStore((state) => state.closedTrades) || [];
  const closePosition = useTradingStore((state) => state.closePosition);

  if (isLoading) {
    return <LoadingState lines={4} />;
  }

  const mappedOpen = (storePositions || []).filter(Boolean).map((p) => {
    const qty = Number(p?.quantity) || 0;
    const entry = Number(p?.entryPrice) || 0;
    const curr = Number(getLivePrice(p?.asset)) || entry;
    const isLong = p?.side === 'BUY' || p?.side === 'long' || !p?.side;

    const pnlVal = isLong ? (curr - entry) * qty : (entry - curr) * qty;
    const pnlPctVal = entry > 0 ? (isLong ? ((curr - entry) / entry) * 100 : ((entry - curr) / entry) * 100) : 0;

    const safePnl = isNaN(pnlVal) ? 0 : pnlVal;
    const safePnlPct = isNaN(pnlPctVal) ? 0 : pnlPctVal;

    return {
      rawId: p?.id || Date.now(),
      id: `open-${p?.id || Date.now()}`,
      asset: p?.asset || 'BTC/USD',
      side: p?.side || 'BUY',
      quantity: qty,
      invested: (qty * entry).toFixed(2),
      entryPrice: entry.toFixed(2),
      currentPrice: curr.toFixed(curr < 2 ? 4 : 2),
      stopLoss: p?.stopLoss != null && !isNaN(p.stopLoss) ? Number(p.stopLoss).toFixed(2) : null,
      takeProfit: p?.takeProfit != null && !isNaN(p.takeProfit) ? Number(p.takeProfit).toFixed(2) : null,
      pnl: safePnl.toFixed(2),
      pnlPercent: safePnlPct.toFixed(2),
      status: 'Aperta',
      openedBy: p?.openedBy ?? 'manual',
      date: p?.openedAt ?? ''
    };
  });

  const mappedClosed = (storeClosed || []).filter(Boolean).map((c) => {
    const qty = Number(c?.quantity) || 0;
    const entry = Number(c?.entryPrice) || 0;
    const exit = Number(c?.exitPrice) || entry;
    const isLong = c?.side === 'BUY' || c?.side === 'long' || !c?.side;
    const pnlVal = Number(c?.pnl);
    const safePnl = isNaN(pnlVal) ? (isLong ? (exit - entry) * qty : (entry - exit) * qty) : pnlVal;
    const pnlPctVal = entry > 0 ? (isLong ? ((exit - entry) / entry) * 100 : ((entry - exit) / entry) * 100) : 0;
    const safePnlPct = isNaN(pnlPctVal) ? 0 : pnlPctVal;

    return {
      rawId: c?.id || Date.now(),
      id: `closed-${c?.id || Date.now()}`,
      asset: c?.asset || 'BTC/USD',
      side: c?.side || 'BUY',
      quantity: qty,
      invested: (qty * entry).toFixed(2),
      entryPrice: entry.toFixed(2),
      currentPrice: exit.toFixed(2),
      stopLoss: c?.stopLoss != null && !isNaN(c.stopLoss) ? Number(c.stopLoss).toFixed(2) : null,
      takeProfit: c?.takeProfit != null && !isNaN(c.takeProfit) ? Number(c.takeProfit).toFixed(2) : null,
      pnl: safePnl.toFixed(2),
      pnlPercent: safePnlPct.toFixed(2),
      status: 'Chiusa',
      openedBy: 'manual',
      date: c?.closedAt ?? ''
    };
  });

  let combined = [];
  if (filterType === 'all') combined = [...mappedOpen, ...mappedClosed];
  else if (filterType === 'open') combined = mappedOpen;
  else if (filterType === 'closed') combined = mappedClosed;

  if (combined.length === 0) {
    return (
      <Card>
        <div className="flex justify-between items-center mb-4 border-b border-slate-800 pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Elenco Posizioni & Registri
          </span>
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'all' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Tutte
            </button>
            <button
              onClick={() => setFilterType('open')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'open' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Aperte
            </button>
            <button
              onClick={() => setFilterType('closed')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${filterType === 'closed' ? 'bg-blue-600 text-white' : 'text-slate-400'}`}
            >
              Chiuse
            </button>
          </div>
        </div>
        <EmptyState
          title="Nessuna Posizione Trovata"
          description="Invia un ordine dal modulo Trade per vedere apparire la tua posizione qui in tempo reale."
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Registro Posizioni Totali ({combined.length})
          </span>
          <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
            Aperte & Chiuse
          </span>
        </div>

        <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 rounded-xl p-1 text-[11px]">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterType === 'all' ? 'bg-blue-600 text-white shadow-liquid-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Tutte ({mappedOpen.length + mappedClosed.length})
          </button>
          <button
            onClick={() => setFilterType('open')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterType === 'open' ? 'bg-blue-600 text-white shadow-liquid-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Aperte ({mappedOpen.length})
          </button>
          <button
            onClick={() => setFilterType('closed')}
            className={`px-3 py-1 rounded-lg font-bold transition-all ${
              filterType === 'closed' ? 'bg-blue-600 text-white shadow-liquid-glow' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Chiuse ({mappedClosed.length})
          </button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="pb-3">Asset</th>
              <th className="pb-3">Direzione</th>
              <th className="pb-3">Stato</th>
              <th className="pb-3">Quantità (Lotti)</th>
              <th className="pb-3">Capitale Investito ($)</th>
              <th className="pb-3">Ingresso</th>
              <th className="pb-3">Prezzo Live / Exit</th>
              <th className="pb-3">Stop Loss (SL)</th>
              <th className="pb-3">Take Profit (TP)</th>
              <th className="pb-3">P&L ($ / %)</th>
              <th className="pb-3 text-right font-semibold">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {combined.map((item) => {
              const numPnl = Number(item.pnl) || 0;
              const isProfit = numPnl >= 0;
              const isOpen = item.status === 'Aperta';
              const isBuy = item.side === 'BUY' || item.side === 'long';

              return (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 font-bold text-slate-100">{item.asset}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isOpen
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 animate-pulse'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 font-mono font-bold text-blue-400">{item.quantity} Lotti</td>
                  <td className="py-3 font-mono font-semibold text-slate-100">${item.invested}</td>
                  <td className="py-3 font-mono text-slate-300">${item.entryPrice}</td>
                  <td className="py-3 font-mono text-slate-100">${item.currentPrice}</td>
                  <td className="py-3 font-mono text-slate-400">{item.stopLoss ? `$${item.stopLoss}` : '-'}</td>
                  <td className="py-3 font-mono text-slate-400">{item.takeProfit ? `$${item.takeProfit}` : '-'}</td>
                  <td className="py-3 font-mono font-bold">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] border ${
                      isProfit
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isProfit ? '+' : ''}${item.pnl} ({isProfit ? '+' : ''}{item.pnlPercent}%)
                    </span>
                  </td>
                  <td className="py-3 text-right">
                    {isOpen ? (
                      <button
                        onClick={() => closePosition && closePosition(item.rawId, item.currentPrice, 'Calmo')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/40 text-[10px] font-bold transition-all"
                      >
                        Chiudi Posizione
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-400 font-medium">Chiuso ({item.date})</span>
                    )}
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

export default OpenPositionsList;
