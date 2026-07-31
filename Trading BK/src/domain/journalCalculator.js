/**
 * FORMULA WIN RATE (%):
 * Win Rate = (Numero di Trade in Guadagno / Numero Totale di Trade Chiusi) * 100
 * 
 * FORMULA MAX DRAWDOWN (%):
 * Calcola la massima flessione percentuale dal picco cumulativo di P&L (Peak-to-Trough Decline).
 * Per ogni punto della serie storica dei P&L cumulati:
 * 1. Mantiene il picco massimo raggiunto fino a quel momento (Peak).
 * 2. Calcola il Drawdown corrente = (Peak - Valore Corrente) / Peak.
 * 3. Restituisce il valore massimo di Drawdown registrato nella serie storica.
 */

export function calculateJournalStats(trades) {
  if (!trades || trades.length === 0) {
    return {
      totalTrades: 0,
      winRate: 0,
      maxDrawdown: 0,
      totalPnl: 0
    };
  }

  let winCount = 0;
  let totalPnl = 0;
  let cumulativePnl = 0;
  let peakPnl = 0;
  let maxDrawdownValue = 0;

  // I trade devono essere processati in ordine cronologico per il calcolo del Drawdown
  const sortedTrades = [...trades].sort((a, b) => new Date(a.closed_at) - new Date(b.closed_at));

  sortedTrades.forEach((trade) => {
    if (trade.result === 'win' || trade.pnl > 0) {
      winCount += 1;
    }

    totalPnl += trade.pnl;
    cumulativePnl += trade.pnl;

    // Aggiornamento del picco di P&L cumulato
    if (cumulativePnl > peakPnl) {
      peakPnl = cumulativePnl;
    }

    // Calcolo del Drawdown dal picco massimo
    const currentDrawdown = peakPnl - cumulativePnl;
    if (currentDrawdown > maxDrawdownValue) {
      maxDrawdownValue = currentDrawdown;
    }
  });

  const winRate = parseFloat(((winCount / trades.length) * 100).toFixed(2));
  
  // Calcolo della percentuale di Drawdown rispetto al picco massimo (o capitale di riferimento)
  const maxDrawdownPercent = peakPnl > 0 
    ? parseFloat(((maxDrawdownValue / peakPnl) * 100).toFixed(2)) 
    : 0;

  return {
    totalTrades: trades.length,
    winRate,
    maxDrawdown: maxDrawdownPercent,
    totalPnl: parseFloat(totalPnl.toFixed(2))
  };
}
