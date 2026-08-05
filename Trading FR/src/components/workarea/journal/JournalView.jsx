import { useState } from 'react';
import SectionHeader from '../../common/SectionHeader';
import JournalStatsSummary from './JournalStatsSummary';
import EmotionalTagFilter from './EmotionalTagFilter';
import ClosedTradesList from './ClosedTradesList';
import { useTradingStore } from '../../../store/useTradingStore';

const JournalView = () => {
  const storeClosedTrades = useTradingStore((state) => state.closedTrades);

  const [filters, setFilters] = useState({ result: 'Tutti i Risultati', tag: 'Tutti' });
  const [feedback, setFeedback] = useState(null);

  // Calcolo dinamico in tempo reale delle metriche del Diario dai trade effettivi
  const totalTrades = storeClosedTrades.length;
  const wins = storeClosedTrades.filter((t) => (Number(t.pnl) || 0) > 0).length;
  const winRate = totalTrades > 0 ? parseFloat(((wins / totalTrades) * 100).toFixed(1)) : 0;

  // Calcolo Drawdown Massimo %
  let maxDrawdown = 0;
  let peak = 0;
  let currentBalance = 10000;
  storeClosedTrades.forEach((t) => {
    currentBalance += Number(t.pnl) || 0;
    if (currentBalance > peak) peak = currentBalance;
    const dd = peak > 0 ? ((peak - currentBalance) / peak) * 100 : 0;
    if (dd > maxDrawdown) maxDrawdown = parseFloat(dd.toFixed(1));
  });

  const statsData = {
    winRate,
    maxDrawdown,
    totalTrades
  };

  // Filtraggio dinamico dei trade chiusi
  const filteredTrades = storeClosedTrades.filter((t) => {
    const isWin = (Number(t.pnl) || 0) >= 0;
    if (filters.result === 'Vinti' && !isWin) return false;
    if (filters.result === 'Persi' && isWin) return false;
    if (filters.tag !== 'Tutti' && t.emotionalTag !== filters.tag) return false;
    return true;
  });

  const handleUpdateTag = (tradeId, newTag) => {
    useTradingStore.setState((state) => ({
      closedTrades: state.closedTrades.map((t) =>
        t.id === tradeId ? { ...t, emotionalTag: newTag } : t
      )
    }));
  };

  const handleDeleteTrade = (tradeId) => {
    useTradingStore.setState((state) => ({
      closedTrades: state.closedTrades.filter((t) => t.id !== tradeId)
    }));
    setFeedback({ type: 'success', message: 'Trade rimosso dal Diario Operativo.' });
  };

  const handleClearAllTrades = () => {
    const clearClosedTrades = useTradingStore.getState().clearClosedTrades;
    if (clearClosedTrades) {
      clearClosedTrades();
    }
    setFeedback({ type: 'success', message: 'Tutto lo storico dei trade chiusi è stato eliminato dal Diario.' });
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Diario Operativo & Psicologia (Journal)"
        subtitle="Analizza la cronologia dei trade chiusi, le metriche psicologiche e la gestione del registro."
      />

      {feedback && (
        <div className={`p-4 rounded-2xl border text-xs font-medium ${
          feedback.type === 'success'
            ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
            : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
        }`}>
          {feedback.type === 'success' ? '✅ ' : '⚠️ '} {feedback.message}
        </div>
      )}

      {/* Statistiche Aggregate in tempo reale */}
      <JournalStatsSummary stats={statsData} />

      {/* Filtri Diario */}
      <EmotionalTagFilter
        filters={filters}
        onFilterChange={(newFilters) => setFilters(newFilters)}
      />

      {/* Elenco Trade Chiusi */}
      <ClosedTradesList
        trades={filteredTrades}
        onUpdateTag={handleUpdateTag}
        onDeleteTrade={handleDeleteTrade}
        onClearAll={handleClearAllTrades}
      />
    </div>
  );
};

export default JournalView;
