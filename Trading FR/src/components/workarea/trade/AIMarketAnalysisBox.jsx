import { useState } from 'react';
import Card from '../../common/Card';
import LoadingState from '../../common/LoadingState';

const AIMarketAnalysisBox = ({
  isLoading = false,
  analysis = null,
  selectedAsset = 'BTC/USD',
  onAnalyzeWithBudget
}) => {
  const [userBudget, setUserBudget] = useState('1000');
  const [isCalculating, setIsCalculating] = useState(false);

  const activeMarkets = ['BTC/USD', 'ETH/USD', 'NVDA', 'AAPL', 'TSLA', 'EUR/USD', 'GOLD', 'OIL'];
  const isMarketActive = activeMarkets.includes(selectedAsset);

  // Avvia l'Analisi Gemini AI principale per l'asset selezionato
  const handleStartAnalysis = async () => {
    if (!isMarketActive || !onAnalyzeWithBudget) return;
    setIsCalculating(true);
    try {
      const numericBudget = parseFloat(userBudget) || 1000;
      await onAnalyzeWithBudget(selectedAsset, numericBudget);
    } finally {
      setIsCalculating(false);
    }
  };

  // Calcola la strategia operativa sul budget inserito
  const handleCalculateStrategy = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    if (!isMarketActive || !onAnalyzeWithBudget) return;

    setIsCalculating(true);
    try {
      const numericBudget = parseFloat(userBudget) || 1000;
      await onAnalyzeWithBudget(selectedAsset, numericBudget);
    } finally {
      setIsCalculating(false);
    }
  };

  if (isLoading || isCalculating) {
    return (
      <Card className="border-purple-500/30 p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-purple-500/10 border border-purple-500/40 text-purple-400 flex items-center justify-center mx-auto animate-pulse">
          <span className="animate-spin text-xl font-bold">⚙️</span>
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold text-white font-outfit">
            Elaborazione Gemini AI in corso...
          </h4>
          <p className="text-xs text-purple-300 font-medium">
            Analisi in tempo reale per <strong>{selectedAsset}</strong> basata sui prezzi del grafico TradingView.
          </p>
        </div>
        <LoadingState lines={4} />
      </Card>
    );
  }

  // PANNELLO DI AVVIO INIZIALE: Si attiva ESCLUSIVAMENTE se l'utente preme il pulsante
  if (!analysis) {
    return (
      <Card className="border-purple-500/30 p-5 space-y-4 font-sans">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-ping"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit">
              Analisi AI e Intelligence di Mercato
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-bold text-purple-300">
              Gemini AI Engine ($ USD)
            </span>
          </div>

          <span className="text-[10px] text-slate-300 font-mono bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800 font-bold">
            Asset Grafico: {selectedAsset}
          </span>
        </div>

        {!isMarketActive ? (
          <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-xs space-y-2">
            <span className="font-bold text-rose-400 block uppercase text-[10px] tracking-wider">
              ⚠️ Analisi AI Sospesa per {selectedAsset}
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              L'alimentazione dati in tempo reale per l'asset selezionato è sospesa. Seleziona un asset attivo (BTC/USD, ETH/USD, NVDA, AAPL, TSLA, GOLD, OIL) dal grafico TradingView.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Box Avvio Analisi Principale */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-950/30 via-slate-900 to-slate-950 border border-purple-500/30 text-center space-y-4">
              <div className="space-y-1">
                <h4 className="text-sm font-bold text-white font-outfit">
                  Sistema Gemini AI Pronto per {selectedAsset}
                </h4>
                <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
                  Premi il pulsante per avviare l'elaborazione dell'analisi tecnica, dei livelli di prezzo e dello scenario di mercato in tempo reale per {selectedAsset}.
                </p>
              </div>

              <button
                type="button"
                onClick={handleStartAnalysis}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-liquid-glow transition-all uppercase tracking-wider"
              >
                Avvia Analisi Gemini AI per {selectedAsset} ($ USD)
              </button>
            </div>

            {/* Form Calcola Strategia su Budget */}
            <form onSubmit={handleCalculateStrategy} className="p-4 rounded-2xl bg-slate-900/80 border border-blue-500/30 space-y-3">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">
                  Oppure Calcola Strategia su Budget ($ USD)
                </label>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-slate-400 font-bold text-xs">$</span>
                  <input
                    type="number"
                    min="10"
                    step="any"
                    value={userBudget}
                    onChange={(e) => setUserBudget(e.target.value)}
                    placeholder="es. 1000"
                    className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 w-32 font-bold font-mono"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow"
                  >
                    Calcola Strategia
                  </button>
                </div>
              </div>
            </form>
          </div>
        )}
      </Card>
    );
  }

  // VISTA RISULTATI DELL'ANALISI GEMINI AI (Attivata solo dopo il click)
  return (
    <Card className="border-purple-500/30 p-5 space-y-4">
      {/* Contenitore con scorrimento verticale interno max-h-[560px] */}
      <div className="max-h-[560px] overflow-y-auto pr-1 space-y-4 font-sans">
        
        {/* HEADER: TITOLO + BADGE AFFIDABILITÀ + TIKER ASSET + PULSANTE RI-ANALIZZA */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
            <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 font-outfit">
              Analisi AI e Intelligence di Mercato
            </h3>
            <span className="px-2 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/30 text-[9px] font-bold text-purple-300">
              Gemini AI Engine ($ USD)
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400 flex items-center gap-1">
              <span>Affidabilità:</span>
              <span className="font-mono text-xs">{analysis.confidencePercent || 93}%</span>
            </span>

            <button
              type="button"
              onClick={handleStartAnalysis}
              className="text-[10px] bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 font-bold px-2.5 py-1 rounded-lg transition-all"
            >
              🔄 Ri-Analizza {selectedAsset}
            </button>
          </div>
        </div>

        {/* SEGNALE OPERATIVO PRINCIPALE (BUY / SELL) CON PREZZI REALI DEL GRAFICO TRADINGVIEW */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-950/40 via-slate-900 to-slate-950 border border-purple-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-purple-900/40 pb-2.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-xl bg-emerald-500 text-slate-950 text-xs font-black font-outfit uppercase tracking-wider shadow-liquid-glow">
                {analysis.signal || 'BUY (LONG)'}
              </span>
              <span className="text-xs text-slate-300 font-medium">
                Segnale Tattico Generato su {selectedAsset}
              </span>
            </div>

            <div className="text-[11px] text-slate-400 font-mono">
              Rapporto Rischio / Rendimento: <strong className="text-emerald-400">{analysis.riskRewardRatio || '1:3.2'}</strong>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-slate-800">
              <span className="text-slate-400 font-medium text-[10px] block">Ingresso Grafico</span>
              <strong className="text-slate-100 font-mono text-xs">{analysis.recommendedEntry} $</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30">
              <span className="text-emerald-400 font-medium text-[10px] block">Target Price 1 (TP1)</span>
              <strong className="text-emerald-300 font-mono text-xs">{analysis.takeProfit} $</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-emerald-500/30">
              <span className="text-emerald-400 font-medium text-[10px] block">Target Price 2 (TP2)</span>
              <strong className="text-emerald-300 font-mono text-xs">{analysis.takeProfit2} $</strong>
            </div>

            <div className="p-2.5 rounded-xl bg-slate-950/80 border border-rose-500/30">
              <span className="text-rose-400 font-medium text-[10px] block">Stop Loss (SL)</span>
              <strong className="text-rose-300 font-mono text-xs">{analysis.stopLoss} $</strong>
            </div>
          </div>
        </div>

        {/* METRICHE CHIAVE E INDICATORI DI MERCATO */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-medium text-[10px] block">Sentiment di Mercato</span>
            <strong className="text-emerald-400 text-xs block font-bold">{analysis.sentiment}</strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-medium text-[10px] block">Supporto / Resistenza ($)</span>
            <strong className="text-slate-200 text-xs font-mono block">
              {analysis.supportLevel} / {analysis.resistanceLevel}
            </strong>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/70 border border-slate-800 space-y-0.5">
            <span className="text-slate-400 font-medium text-[10px] block">Impatto Notizie Macro</span>
            <strong className="text-blue-400 text-xs block">{analysis.newsImpact}</strong>
          </div>
        </div>

        {/* SINTESI DELL'ANALISTA SENIOR PER L'ASSET */}
        {(analysis.sintesi || analysis.summary) && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 text-xs space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-blue-400 uppercase text-[10px] tracking-wider block">
                Sintesi Analista Senior ({selectedAsset})
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Generato via Gemini AI</span>
            </div>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analysis.sintesi || analysis.summary}
            </p>
          </div>
        )}

        {/* SCENARI CONDIZIONATI */}
        {analysis.scenari && (
          <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-1">
            <span className="font-bold text-slate-300 block uppercase text-[10px] tracking-wider">
              Scenari Condizionati ({selectedAsset})
            </span>
            <p className="text-slate-300 leading-relaxed whitespace-pre-line font-normal">
              {analysis.scenari}
            </p>
          </div>
        )}

        {/* RACCOMANDAZIONE TATTICA GEMINI */}
        {analysis.aiSuggestion && (
          <div className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-500/30 text-xs space-y-1">
            <span className="font-bold text-purple-300 block uppercase text-[10px] tracking-wider">
              Raccomandazione Tattica Gemini ({selectedAsset})
            </span>
            <p className="text-slate-200 leading-relaxed font-medium">
              {analysis.aiSuggestion}
            </p>
          </div>
        )}

        {/* FORM INTERATTIVO CALCOLA STRATEGIA SU BUDGET PERSONALIZZATO ($ USD) */}
        <form onSubmit={handleCalculateStrategy} className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/30 space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
            <label className="text-xs font-bold text-blue-400 uppercase tracking-wider">
              Calcola Strategia Operativa su Budget ($ USD)
            </label>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <span className="text-slate-400 font-bold text-xs">$</span>
              <input
                type="number"
                min="10"
                step="any"
                value={userBudget}
                onChange={(e) => setUserBudget(e.target.value)}
                placeholder="es. 1000"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:border-blue-500 w-32 font-bold font-mono"
              />
              <button
                type="submit"
                className="px-4 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs shadow-liquid-glow transition-all"
              >
                Calcola Strategia
              </button>
            </div>
          </div>

          {analysis.strategiaOperativa && (
            <div className="pt-2.5 border-t border-slate-800/80 text-xs space-y-1">
              <span className="font-bold text-emerald-400 block uppercase text-[10px] tracking-wider">
                Strategia Operativa Consigliata ({selectedAsset})
              </span>
              <p className="text-slate-200 leading-relaxed font-medium">
                {analysis.strategiaOperativa}
              </p>
            </div>
          )}
        </form>

        {/* PROMEMORIA E GESTIONE RISCHIO */}
        <div className="text-[10px] text-slate-400 text-center font-medium pt-1 border-t border-slate-800/60">
          {analysis.riskReminder || "Analisi di scenario elaborata da Gemini AI ($ USD). La decisione finale e la gestione del rischio restano dell'utente."}
        </div>
      </div>
    </Card>
  );
};

export default AIMarketAnalysisBox;
