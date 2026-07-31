import { calculateRiskScore } from './riskCalculator.js';
import { calculateJournalStats } from './journalCalculator.js';

/**
 * GENERATORE DI BRIEFING A REGOLE DINAMICO PER LA DASHBOARD
 * Analizza i dati reali di Portafolio, Trade e Journal presenti nel DB.
 */
export function generateDashboardBriefing(user, positions, recentOrders, closedTrades) {
  const riskData = calculateRiskScore(positions, user.total_capital);
  const journalStats = calculateJournalStats(closedTrades);
  const lastClosedTrade = closedTrades && closedTrades.length > 0 ? closedTrades[0] : null;
  const lastOrder = recentOrders && recentOrders.length > 0 ? recentOrders[0] : null;

  let riskSummaryText = '';
  let suggestionText = '';
  let lastTradeSummaryText = '';

  // 1. Logica Rischio Attuale
  if (positions.length === 0) {
    riskSummaryText = "Nessuna posizione aperta. Il capitale è interamente liquido (100% Cash).";
  } else if (riskData.score >= 70) {
    riskSummaryText = `Rischio ELEVATO (${riskData.score}/100): concentrazione del ${riskData.details.concentrationRiskPercent}% nel settore principale.`;
  } else if (riskData.score >= 40) {
    riskSummaryText = `Rischio MODERATO (${riskData.score}/100): esposizione pari al ${riskData.details.exposureRatioPercent}% del capitale totale.`;
  } else {
    riskSummaryText = `Rischio BILANCIATO (${riskData.score}/100): portafoglio ben diversificato con stop loss impostati.`;
  }

  // 2. Logica Ultimo Trade
  if (lastClosedTrade) {
    const isWin = lastClosedTrade.pnl >= 0;
    lastTradeSummaryText = `Ultimo trade chiuso su ${lastClosedTrade.asset}: ${isWin ? '+' : ''}$${lastClosedTrade.pnl} (${lastClosedTrade.result.toUpperCase()}) con tag '${lastClosedTrade.emotional_tag || 'N/A'}'.`;
  } else if (lastOrder) {
    lastTradeSummaryText = `Ultimo ordine in archivio su ${lastOrder.asset} (${lastOrder.type.toUpperCase()}) in stato ${lastOrder.status}.`;
  } else {
    lastTradeSummaryText = "Nessun trade precedente registrato nel diario.";
  }

  // 3. Logica Suggerimento Strategico
  if (riskData.details.missingStopLossPercent > 0) {
    suggestionText = `Consiglio Rischio: Il ${riskData.details.missingStopLossPercent}% delle tue posizioni non ha uno Stop Loss impostato. Proteggi il capitale.`;
  } else if (journalStats.winRate > 60) {
    suggestionText = `Ottimo Momentum: Il tuo Win Rate è al ${journalStats.winRate}%. Mantieni la disciplina senza aumentare eccessivamente il rischio per trade.`;
  } else if (lastClosedTrade && lastClosedTrade.pnl < 0 && lastClosedTrade.emotional_tag === 'FOMO') {
    suggestionText = "Alert Psicologia: L'ultimo trade in perdita è stato etichettato come FOMO. Evita entrate d'impulso sulle prossime sessioni.";
  } else {
    suggestionText = "Consiglio Generale: Monitora costantemente le posizioni attive e rispetta il tuo piano di trading.";
  }

  return {
    riskScore: riskData.score,
    riskLevel: riskData.level,
    riskSummary: riskSummaryText,
    lastTradeSummary: lastTradeSummaryText,
    suggestion: suggestionText,
    openPositionsCount: positions.length,
    totalCapital: user.total_capital,
    winRate: journalStats.winRate
  };
}
