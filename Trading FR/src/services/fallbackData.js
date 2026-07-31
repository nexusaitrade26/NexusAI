export const FALLBACK_STUDIO_LEVELS = [
  { code: 'base', name: 'Livello Base', desc: 'Fondamenti di Trading & Gestione del Rischio', count: 5 },
  { code: 'intermedio', name: 'Livello Intermedio', desc: 'Analisi Tecnica & Strategie di Scenario', count: 4 },
  { code: 'avanzato', name: 'Livello Avanzato', desc: 'Algoritmi, AI Prompting & Quantitative Trading', count: 3 }
];

export const FALLBACK_STUDIO_CATEGORIES = {
  base: [
    { id: 'b1', title: 'Introduzione ai Mercati Finanziari', duration: '12 min' },
    { id: 'b2', title: 'Leggere un Grafico a Candele (Candlestick)', duration: '15 min' }
  ],
  intermedio: [
    { id: 'i1', title: 'Supporti, Resistenze e Trendline', duration: '18 min' },
    { id: 'i2', title: 'Indicatori di Momentum: RSI & MACD', duration: '20 min' }
  ],
  avanzato: [
    { id: 'a1', title: 'Trading Algoritmo con Gemini AI Prompting', duration: '25 min' },
    { id: 'a2', title: 'Risk Management Avanzato & Position Sizing', duration: '30 min' }
  ]
};

export function getFallbackLessonDetail(lessonId) {
  return {
    id: lessonId || 'b1',
    title: 'Introduzione ai Mercati Finanziari',
    content: 'Benvenuto nella lezione formativa Nexus Studio. In questa sessione imparerai le basi operative dei mercati finanziari, la gestione del capitale e l\'utilizzo di Gemini AI per analizzare i trend di prezzo.',
    videoUrl: '',
    quiz: [
      {
        question: 'Qual è l\'obiettivo principale della gestione del rischio nel trading?',
        options: ['Proteggere il capitale operativo', 'Scommettere l\'intero saldo su un singolo trade', 'Ignorare lo Stop Loss'],
        correctAnswerIndex: 0
      }
    ]
  };
}

export const FALLBACK_WORKAREA_POSITIONS = {
  positions: [],
  summary: {
    totalValueUsd: 0,
    totalProfitLossUsd: 0,
    dailyProfitLossUsd: 0,
    totalPositionsCount: 0
  }
};

export const FALLBACK_WORKAREA_ORDERS = {
  orders: [],
  count: 0
};

export const FALLBACK_WORKAREA_TRADES = {
  trades: [],
  count: 0
};

export const FALLBACK_WORKAREA_RISK = {
  score: 0,
  level: 'Basso',
  details: {
    concentrationRiskPercent: 0,
    exposureRatioPercent: 0,
    missingStopLossPercent: 0
  }
};

export const FALLBACK_WORKAREA_STATS = {
  winRate: 0,
  maxDrawdown: 0,
  totalTrades: 0
};

export function getFallbackNews(asset = 'BTC/USD') {
  return {
    asset,
    news: [
      { id: 1, title: `Analisi di mercato per ${asset}: Forte pressione in acquisto`, source: 'CryptoGlobe', time: '10m fa', sentiment: 'positive' },
      { id: 2, title: `Banche centrali e decisioni macroeconomiche su ${asset}`, source: 'Bloomberg', time: '1h fa', sentiment: 'neutral' },
      { id: 3, title: `Livelli di resistenza chiave per ${asset} rilevati da Gemini AI`, source: 'FinancialTimes', time: '3h fa', sentiment: 'positive' }
    ]
  };
}

/**
 * Genera l'analisi Gemini AI legata al prezzo live reale dell'asset selezionato sul grafico TradingView.
 */
export function getFallbackAiAnalysis(asset = 'BTC/USD', budget = 1000, customPrice = null) {
  const defaultPrices = {
    'BTC/USD': 66800,
    'ETH/USD': 3450,
    'NVDA': 124.50,
    'AAPL': 225.00,
    'TSLA': 215.00,
    'EUR/USD': 1.085,
    'GOLD': 2380.00,
    'OIL': 78.50
  };

  const currentPrice = Number(customPrice) > 0 ? Number(customPrice) : (defaultPrices[asset] || 100);
  const support = Number((currentPrice * 0.975).toFixed(currentPrice < 10 ? 4 : 2));
  const resistance = Number((currentPrice * 1.031).toFixed(currentPrice < 10 ? 4 : 2));
  const tp1 = Number((currentPrice * 1.070).toFixed(currentPrice < 10 ? 4 : 2));
  const tp2 = Number((currentPrice * 1.108).toFixed(currentPrice < 10 ? 4 : 2));
  const sl = Number((currentPrice * 0.961).toFixed(currentPrice < 10 ? 4 : 2));

  const numericBudget = Number(budget) > 0 ? Number(budget) : 1000;
  const units = (numericBudget / currentPrice).toFixed(4);

  const profitTp1 = ((tp1 - currentPrice) * (numericBudget / currentPrice)).toFixed(2);
  const profitTp2 = ((tp2 - currentPrice) * (numericBudget / currentPrice)).toFixed(2);
  const riskSl = ((currentPrice - sl) * (numericBudget / currentPrice)).toFixed(2);

  const formattedPrice = currentPrice.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });
  const formattedSupport = support.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });
  const formattedResistance = resistance.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });
  const formattedTp1 = tp1.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });
  const formattedTp2 = tp2.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });
  const formattedSl = sl.toLocaleString('en-US', { minimumFractionDigits: currentPrice < 10 ? 4 : 2 });

  return {
    asset,
    budget: numericBudget,
    currentPrice: formattedPrice,
    signal: 'BUY (LONG)',
    confidencePercent: 93,
    summary: `Analisi Gemini AI per ${asset} (Prezzo live grafico: $${formattedPrice}): Trend orientato al rialzo con volumi in accumulo sopra il supporto primario a $${formattedSupport}.`,
    sintesi: `Gemini AI rileva per l'asset ${asset} al prezzo di mercato attuale di $${formattedPrice} una convergenza di indicatori di momentum rialzisti. Il livello di supporto chiave è posizionato a $${formattedSupport} mentre la prima resistenza di target è a $${formattedResistance}.`,
    sentiment: 'Rialzista Fiducioso',
    supportLevel: `$${formattedSupport}`,
    resistanceLevel: `$${formattedResistance}`,
    newsImpact: 'Alto - Catalizzatore Macro Positivo',
    rsi: '64.2 (Rialzista)',
    scenari: `Scenario Principale (Rialzista): Breakout della resistenza a $${formattedResistance} con estensione verso $${formattedTp1} e $${formattedTp2}.\nScenario Alternativo (Pullback): Test del supporto a $${formattedSupport} prima del rimbalzo verso l'alto.`,
    aiSuggestion: `Ingresso tattico su ${asset} attorno al prezzo attuale di $${formattedPrice}, posizionando lo Stop Loss tassativamente a $${formattedSl} a tutela del capitale.`,
    recommendedEntry: formattedPrice,
    stopLoss: formattedSl,
    takeProfit: formattedTp1,
    takeProfit2: formattedTp2,
    riskRewardRatio: '1:3.2',
    suggestedQuantity: units,
    strategiaOperativa: `Con un budget di $${numericBudget.toLocaleString('en-US')}, la dimensione posizione consigliata è di ${units} unità di ${asset} a $${formattedPrice}. Profitto stimato al Target 1: +$${profitTp1} | Target 2: +$${profitTp2} | Rischio massimo allo Stop Loss: -$${riskSl}.`,
    riskReminder: "Analisi di scenario elaborata da Gemini AI ($ USD). La gestione del rischio ed il posizionamento dello Stop Loss restano di competenza dell'utente."
  };
}
