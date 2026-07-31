import { useState, useEffect, useCallback } from 'react';
import SectionHeader from '../../common/SectionHeader';
import TradingViewChart from './TradingViewChart';
import MarketNewsBox from './MarketNewsBox';
import AIMarketAnalysisBox from './AIMarketAnalysisBox';
import OrderForm from './OrderForm';
import OpenPositionsList from '../portfolio/OpenPositionsList';
import { fetchApi } from '../../../services/api';
import { useMarket } from '../../../context/MarketContext';
import { useTradingStore } from '../../../store/useTradingStore';
import { getFallbackAiAnalysis } from '../../../services/fallbackData';

const TradeView = () => {
  const { selectedAsset, setSelectedAsset, getLivePrice } = useMarket();
  const openOrder = useTradingStore((state) => state.openOrder);

  const [newsData, setNewsData] = useState(null);
  const [aiAnalysis, setAiAnalysis] = useState(null);

  const [isLoadingNews, setIsLoadingNews] = useState(false);
  const [isLoadingAnalysis, setIsLoadingAnalysis] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Caricamento Notizie automatico per l'asset selezionato
  const loadNewsData = useCallback(async (asset) => {
    try {
      setIsLoadingNews(true);
      const newsRes = await fetchApi(`/trade/news?asset=${encodeURIComponent(asset)}`);
      if (newsRes) setNewsData(newsRes);
    } catch (err) {
      console.error('Errore caricamento notizie:', err);
    } finally {
      setIsLoadingNews(false);
    }
  }, []);

  // Al cambio dell'asset nel grafico TradingView: resetta l'analisi AI finché l'utente non preme il pulsante
  useEffect(() => {
    loadNewsData(selectedAsset);
    setAiAnalysis(null);
  }, [selectedAsset, loadNewsData]);

  const handleRefreshNews = useCallback(async (asset) => {
    try {
      const newsRes = await fetchApi(`/trade/news?asset=${encodeURIComponent(asset)}`);
      if (newsRes) setNewsData(newsRes);
    } catch (err) {
      console.error('Errore refresh notizie:', err);
    }
  }, []);

  // Esecuzione dell'Analisi Gemini AI ESCLUSIVAMENTE SU PRESSIONE DEL PULSANTE
  const handleAnalyzeWithBudget = useCallback(async (asset, budget) => {
    setIsLoadingAnalysis(true);
    try {
      const livePrice = getLivePrice(asset);
      let analysisRes = null;

      try {
        analysisRes = await fetchApi('/trade/ai-analysis', {
          method: 'POST',
          body: JSON.stringify({ asset, budget, livePrice }),
        });
      } catch (e) {
        // Fallback locale con i prezzi reali del grafico TradingView
      }

      if (!analysisRes || !analysisRes.sintesi) {
        analysisRes = getFallbackAiAnalysis(asset, budget, livePrice);
      }

      setAiAnalysis(analysisRes);
    } catch (err) {
      console.error('Errore analisi Gemini AI:', err);
    } finally {
      setIsLoadingAnalysis(false);
    }
  }, [getLivePrice]);

  const handleSubmitOrder = async (orderPayload) => {
    setFeedback(null);
    try {
      const livePrice = getLivePrice(selectedAsset);
      openOrder(orderPayload, livePrice);
      setFeedback({
        type: 'success',
        message: `Ordine ${orderPayload.side || 'BUY'} eseguito con successo su ${selectedAsset} a $${livePrice}`
      });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || "Impossibile inviare l'ordine." });
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Sezione */}
      <SectionHeader
        title="Centro Operativo Trade"
        subtitle="Grafico professionale TradingView, Analisi Gemini AI sintonizzata in tempo reale e notizie di mercato ($ USD)."
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

      {/* Grafico Professionale TradingView */}
      <TradingViewChart
        symbol={selectedAsset}
        onSymbolChange={(newSymbol) => setSelectedAsset(newSymbol)}
      />

      {/* Riquadri Sintonizzati in Tempo Reale: SINISTRA -> Analisi AI, DESTRA -> Notizie di mercato */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <AIMarketAnalysisBox
          isLoading={isLoadingAnalysis}
          analysis={aiAnalysis}
          selectedAsset={selectedAsset}
          onAnalyzeWithBudget={handleAnalyzeWithBudget}
        />
        <MarketNewsBox
          isLoading={isLoadingNews}
          newsData={newsData}
          selectedAsset={selectedAsset}
          onRefreshNews={handleRefreshNews}
        />
      </div>

      {/* Form Inserisci Nuovo Ordine ($ USD) con BUY / SELL */}
      <div>
        <OrderForm
          onSubmitOrder={handleSubmitOrder}
          selectedAsset={selectedAsset}
          onAssetChange={(newAsset) => setSelectedAsset(newAsset)}
        />
      </div>

      {/* Registro Posizioni Totali */}
      <OpenPositionsList isLoading={false} />
    </div>
  );
};

export default TradeView;
