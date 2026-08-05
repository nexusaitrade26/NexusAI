import { useState } from 'react';
import Card from '../../common/Card';
import EmptyState from '../../common/EmptyState';
import LoadingState from '../../common/LoadingState';
import { useMarket } from '../../../context/MarketContext';
import { useTradingStore } from '../../../store/useTradingStore';

const OpenPositionsList = ({ isLoading = false, showClosed = true }) => {
  const [filterType, setFilterType] = useState(showClosed ? 'all' : 'open'); // 'all' | 'open' | 'closed'
  const { getLivePrice } = useMarket();

  const storePositions = useTradingStore((state) => state.positions) || [];
  const storeClosed = useTradingStore((state) => state.closedTrades) || [];
  const closePosition = useTradingStore((state) => state.closePosition);
  const closeAllPositions = useTradingStore((state) => state.closeAllPositions);
  const clearClosedTrades = useTradingStore((state) => state.clearClosedTrades);

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

  const mappedClosed = showClosed
    ? (storeClosed || []).filter(Boolean).map((c) => {
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
          closeReason: c?.closeReason || (c?.emotionalTag?.includes('Stop Loss') ? 'Chiuso con Stop Loss' : c?.emotionalTag?.includes('Take Profit') ? 'Chiuso con Take Profit' : 'Chiuso Manualmente'),
          date: c?.closedAt ?? ''
        };
      })
    : [];

  let combined = [];
  if (!showClosed || filterType === 'open') {
    combined = mappedOpen;
  } else if (filterType === 'closed') {
    combined = mappedClosed;
  } else {
    combined = [...mappedOpen, ...mappedClosed];
  }

  // Calcolo del guadagno totale in tempo reale delle posizioni aperte
  const totalOpenPnl = mappedOpen.reduce((sum, p) => sum + (Number(p.pnl) || 0), 0);
  const isTotalProfit = totalOpenPnl >= 0;
  const absTotalPnl = Math.abs(totalOpenPnl).toFixed(2);
  const totalPnlSign = isTotalProfit ? '+' : '-';

  const handleCloseAll = () => {
    if (closeAllPositions) {
      closeAllPositions(getLivePrice);
    }
  };

  if (combined.length === 0) {
    return (
      <Card>
        <div className="flex flex-wrap justify-between items-center gap-3 mb-4 border-b border-slate-800 pb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
              Elenco Posizioni & Registri
            </span>

            {/* Widget Guadagno Totale Aperto + Pulsante Chiudi Tutto */}
            <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-xl px-3 py-1 text-xs font-mono">
              <span className="text-slate-400 font-sans text-[11px]">P&L Aperto Live:</span>
              <span className={`font-bold ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                {totalPnlSign}${absTotalPnl}
              </span>
            </div>

            {mappedOpen.length > 0 && (
              <button
                onClick={handleCloseAll}
                className="px-3 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1 font-outfit"
                title="Chiudi tutte le posizioni aperte"
              >
                Chiudi Tutto ({mappedOpen.length})
              </button>
            )}
          </div>

          {showClosed && (
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
          )}
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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3 mb-4 border-b border-slate-800 pb-3">
        {/* Lato Sinistro: Titolo + Widget P&L Aperto Live + Tasto Chiudi Tutto */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
            Registro Posizioni Totali ({combined.length})
          </span>

          {/* Widget Guadagno Totale Aperto */}
          <div className="flex items-center gap-2 bg-slate-900/90 border border-slate-800 rounded-xl px-3 py-1 text-xs font-mono">
            <span className="text-slate-400 font-sans text-[11px]">P&L Aperto Live:</span>
            <span className={`font-bold ${isTotalProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalPnlSign}${absTotalPnl}
            </span>
          </div>

          {/* Pulsante Chiudi Tutto */}
          {mappedOpen.length > 0 && (
            <button
              onClick={handleCloseAll}
              className="px-3 py-1 rounded-xl bg-rose-600/20 hover:bg-rose-600 text-rose-400 hover:text-white border border-rose-500/40 font-bold text-xs transition-all shadow-sm cursor-pointer flex items-center gap-1 font-outfit"
              title="Chiudi tutte le posizioni aperte al prezzo di mercato"
            >
              Chiudi Tutto ({mappedOpen.length})
            </button>
          )}
        </div>

        {/* Lato Destro: Tab Filtri (Visibile se showClosed è true) */}
        {showClosed && (
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
        )}
      </div>

      <div className="overflow-x-auto custom-scrollbar pb-2">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead>
            <tr className="border-b border-slate-800 text-slate-400 font-semibold">
              <th className="py-3 px-2">Asset</th>
              <th className="py-3 px-2">Direzione</th>
              <th className="py-3 px-2">Stato</th>
              <th className="py-3 px-2">Quantità (Lotti)</th>
              <th className="py-3 px-2">Capitale Investito ($)</th>
              <th className="py-3 px-2">Ingresso</th>
              <th className="py-3 px-2">Prezzo Live / Exit</th>
              <th className="py-3 px-2">Stop Loss (SL)</th>
              <th className="py-3 px-2">Take Profit (TP)</th>
              <th className="py-3 px-2">P&L ($ / %)</th>
              <th className="py-3 px-2 text-right font-semibold">Azione</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {combined.map((item) => {
              const numPnl = Number(item.pnl) || 0;
              const isProfit = numPnl >= 0;
              const isOpen = item.status === 'Aperta';
              const isBuy = item.side === 'BUY' || item.side === 'long';

              const absPnl = Math.abs(numPnl).toFixed(2);
              const absPct = Math.abs(Number(item.pnlPercent) || 0).toFixed(2);
              const pnlSign = isProfit ? '+' : '-';

              return (
                <tr key={item.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 px-2 font-bold text-slate-100">{item.asset}</td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider border ${
                      isBuy
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {isBuy ? 'BUY' : 'SELL'}
                    </span>
                  </td>
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${
                      isOpen
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/30 font-outfit'
                        : 'bg-slate-800 text-slate-400 border-slate-700'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 font-mono font-bold text-blue-400">{item.quantity} Lotti</td>
                  <td className="py-3 px-2 font-mono font-semibold text-slate-100">${item.invested}</td>
                  <td className="py-3 px-2 font-mono text-slate-300">${item.entryPrice}</td>
                  <td className="py-3 px-2 font-mono text-slate-100">${item.currentPrice}</td>
                  <td className="py-3 px-2 font-mono text-slate-400">{item.stopLoss ? `$${item.stopLoss}` : '-'}</td>
                  <td className="py-3 px-2 font-mono text-slate-400">{item.takeProfit ? `$${item.takeProfit}` : '-'}</td>
                  <td className="py-3 px-2 font-mono font-bold">
                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold border whitespace-nowrap ${
                      isProfit
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                    }`}>
                      {pnlSign}${absPnl} ({pnlSign}{absPct}%)
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">
                    {isOpen ? (
                      <button
                        onClick={() => closePosition && closePosition(item.rawId, item.currentPrice, 'Calmo')}
                        className="px-2.5 py-1 rounded-lg bg-rose-600/20 text-rose-400 hover:bg-rose-600/30 border border-rose-500/40 text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Chiudi Posizione
                      </button>
                    ) : (
                      <span className="text-[10px] text-slate-300 font-medium font-outfit">
                        {item.closeReason ? `${item.closeReason}` : 'Chiuso'} • {item.date}
                      </span>
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
