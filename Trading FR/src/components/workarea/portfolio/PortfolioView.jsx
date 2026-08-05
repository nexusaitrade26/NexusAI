import { useState, useEffect } from 'react';
import SectionHeader from '../../common/SectionHeader';
import RiskScoreGauge from './RiskScoreGauge';
import ExposureBreakdown from './ExposureBreakdown';
import OpenPositionsList from './OpenPositionsList';
import AiPositionGuardianWidget from '../../common/AiPositionGuardianWidget';
import Card from '../../common/Card';
import { useMarket } from '../../../context/MarketContext';
import { useTradingStore } from '../../../store/useTradingStore';

const PortfolioView = () => {
  const { getLivePrice } = useMarket();
  const openPositions = useTradingStore((state) => state.positions);
  const closedTrades = useTradingStore((state) => state.closedTrades);

  // 1. Totale Capitale Investito (Somma posizioni aperte + posizioni chiuse)
  const openInvested = openPositions.reduce((acc, p) => {
    const qty = Number(p.quantity) || 0;
    const entry = Number(p.entryPrice) || 0;
    return acc + (qty * entry);
  }, 0);

  const closedInvested = closedTrades.reduce((acc, t) => {
    const qty = Number(t.quantity) || 0;
    const entry = Number(t.entryPrice) || 0;
    return acc + (qty * entry);
  }, 0);

  const totalInvested = openInvested + closedInvested;

  // 2. Guadagno / Perdita Netta (P&L Aperto in tempo reale + P&L Chiuso accumulato)
  const openPnl = openPositions.reduce((acc, p) => {
    const qty = Number(p.quantity) || 0;
    const entry = Number(p.entryPrice) || 0;
    const live = getLivePrice(p.asset) || entry;
    const isLong = p.side === 'BUY' || p.side === 'long' || !p.side;
    const pnl = isLong ? (live - entry) * qty : (entry - live) * qty;
    return acc + pnl;
  }, 0);

  const closedPnl = closedTrades.reduce((acc, t) => acc + (Number(t.pnl) || 0), 0);
  const totalNetPnl = (isNaN(openPnl + closedPnl) ? 0 : parseFloat((openPnl + closedPnl).toFixed(2))) || 0;

  // 3. Ritorno sull'Investimento (ROI %) = (Guadagno Netto / Capitale Investito) * 100
  const baseInvested = totalInvested > 0 ? totalInvested : 1000;
  const roiPercent = (isNaN(totalNetPnl) ? 0 : parseFloat(((totalNetPnl / baseInvested) * 100).toFixed(2))) || 0;

  // Ripartizione esposizione per categoria
  const exposureData = [
    { category: 'Crypto', percent: openPositions.some(p => p.asset?.includes('BTC') || p.asset?.includes('ETH')) ? 50 : 0, color: '#3b82f6' },
    { category: 'Forex', percent: openPositions.some(p => p.asset?.includes('EUR')) ? 30 : 0, color: '#10b981' },
    { category: 'Tech/Stock', percent: openPositions.some(p => p.asset === 'NVDA' || p.asset === 'AAPL' || p.asset === 'TSLA') ? 20 : 0, color: '#8b5cf6' }
  ];

  const riskData = {
    score: openPositions.length * 15 > 100 ? 90 : openPositions.length * 15,
    level: openPositions.length > 3 ? 'Elevato' : openPositions.length > 1 ? 'Moderato' : 'Basso'
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestione Portafoglio & Valutazione Rischio"
        subtitle="Panoramica completa in tempo reale di tutte le posizioni (aperte e chiuse), calcolo ROI, Capitale investito e Risk Score."
      />

      {/* Riquadri Metriche Portafoglio dinamici in Tempo Reale */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Totale Capitale Investito */}
        <Card className="flex flex-col justify-between border-blue-500/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Totale Capitale Investito</span>
          <div className="my-2">
            <span className="text-2xl font-black font-outfit text-slate-100 font-mono">
              ${(Number(totalInvested) || 0).toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">
            Capitale allocato su {openPositions.length} aperte + {closedTrades.length} chiuse
          </span>
        </Card>

        {/* Guadagno / Perdita Netta Totale */}
        <Card className="flex flex-col justify-between border-emerald-500/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Guadagno / Perdita Netta</span>
          <div className="my-2">
            <span className={`text-2xl font-black font-outfit font-mono ${totalNetPnl >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {totalNetPnl >= 0 ? '+' : ''}${(Number(totalNetPnl) || 0).toFixed(2)}
            </span>
          </div>
          <span className="text-[10px] text-slate-400 font-medium">P&L live in diretta ($ USD)</span>
        </Card>

        {/* Ritorno sull'Investimento (ROI %) */}
        <Card className="flex flex-col justify-between border-purple-500/20">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ritorno sull'Investimento (ROI)</span>
          <div className="my-2">
            <span className={`text-2xl font-black font-outfit font-mono ${roiPercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {roiPercent >= 0 ? '+' : ''}${(Number(roiPercent) || 0).toFixed(2)}%
            </span>
          </div>
          <span className="text-[10px] text-purple-400 font-medium">Resa percentuale dinamica del capitale</span>
        </Card>
      </div>

      {/* Risk Score & Esposizione per Categoria */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RiskScoreGauge isLoading={false} riskData={riskData} />
        <ExposureBreakdown isLoading={false} exposure={exposureData} />
      </div>

      {/* Registro Posizioni Totali (Identico a Trade per grafica e funzionalità) */}
      <OpenPositionsList isLoading={false} />
    </div>
  );
};

export default PortfolioView;
