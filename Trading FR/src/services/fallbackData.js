// Lista completa delle 30 Lezioni suddivise per Livello
const ALL_STUDIO_LESSONS_DATA = {
  base: {
    categories: [
      {
        id: 'cat-b1',
        name: 'Fondamenti dei Mercati Finanziari',
        description: 'Capire il funzionamento delle borse, asset e dinamiche di prezzo',
        lessons: [
          { id: 'les-b1', title: 'Introduzione ai Mercati Finanziari & Asset Class', duration: '12 min' },
          { id: 'les-b2', title: 'Leggere un Grafico a Candele (Candlestick)', duration: '15 min' },
          { id: 'les-b3', title: 'Ordine a Mercato, Limit, Stop Loss e Take Profit', duration: '18 min' },
          { id: 'les-b4', title: 'Calcolo dei Lotti, Leva e Margin Call', duration: '20 min' },
          { id: 'les-b5', title: 'Struttura del Trend: Massimi e Minimi Crescenti', duration: '16 min' }
        ]
      },
      {
        id: 'cat-b2',
        name: 'Psicologia & Gestione Operativa',
        description: 'Regole fondamentali per la gestione emotiva e del capitale',
        lessons: [
          { id: 'les-b6', title: 'Psicologia del Trader & Gestione delle Emozioni', duration: '15 min' },
          { id: 'les-b7', title: 'Analisi del Capitale: Rispetto del Risk Per Trade (1-2%)', duration: '18 min' },
          { id: 'les-b8', title: 'Utilizzo della Piattaforma TradingView & Strumenti', duration: '14 min' },
          { id: 'les-b9', title: 'Orari di Mercato & Sessioni di Liquidità (London, NY, Tokyo)', duration: '19 min' },
          { id: 'les-b10', title: 'Creazione del Primo Diario di Trading (Journal)', duration: '22 min' }
        ]
      }
    ]
  },
  intermedio: {
    categories: [
      {
        id: 'cat-i1',
        name: 'Analisi Tecnica & Indicatori',
        description: 'Padroneggiare i pattern grafici e gli oscillatori di momentum',
        lessons: [
          { id: 'les-i1', title: 'Supporti, Resistenze e Trendline Dinamiche', duration: '18 min' },
          { id: 'les-i2', title: 'Indicatori di Momentum: RSI, MACD & Media Mobile', duration: '22 min' },
          { id: 'les-i3', title: 'Pattern Chartisti: Testa e Spalle, Doppi Minimi/Massimi', duration: '25 min' },
          { id: 'les-i4', title: 'Volatilità e Bande di Bollinger', duration: '20 min' },
          { id: 'les-i5', title: 'Retracciamenti di Fibonacci & Livelli Chiave', duration: '24 min' }
        ]
      },
      {
        id: 'cat-i2',
        name: 'Strategie operative e Backtesting',
        description: 'Gestione operativa sul campo ed analisi del movimento prezzi',
        lessons: [
          { id: 'les-i6', title: 'Breakout Reali vs Falsi Breakout (Fakeout)', duration: '21 min' },
          { id: 'les-i7', title: 'Volume Profile & Zone di Alta Liquidità', duration: '26 min' },
          { id: 'les-i8', title: 'Gestione Multi-Timeframe (Top-Down Analysis)', duration: '23 min' },
          { id: 'les-i9', title: 'Strategia di Swing Trading vs Day Trading', duration: '25 min' },
          { id: 'les-i10', title: 'Backtesting Manuale & Storico Prezzi', duration: '30 min' }
        ]
      }
    ]
  },
  avanzato: {
    categories: [
      {
        id: 'cat-a1',
        name: 'AI Trading & Smart Money Concepts',
        description: 'Sfruttare Gemini AI, Prompting Avanzato e Gestione Istituzionale',
        lessons: [
          { id: 'les-a1', title: 'Trading Algoritmico con Gemini AI Prompting', duration: '25 min' },
          { id: 'les-a2', title: 'Position Sizing & Gestione del Rischio Istituzionale', duration: '30 min' },
          { id: 'les-a3', title: 'Order Blocks & Fair Value Gaps (Smart Money Concepts)', duration: '28 min' },
          { id: 'les-a4', title: 'Analisi del Sentiment Globale e Notizie di Mercato', duration: '24 min' },
          { id: 'les-a5', title: 'Hedging, Correlazioni tra Cross Forex e Cripto', duration: '27 min' }
        ]
      },
      {
        id: 'cat-a2',
        name: 'Piani Operativi & Esecuzione Executive',
        description: 'Automazione dei segnali, VWAP e gestione fondi prop',
        lessons: [
          { id: 'les-a6', title: 'Costruzione di un Piano di Trading Personalizzato', duration: '32 min' },
          { id: 'les-a7', title: 'Valutazione delle Inefficienze di Liquidità (Liquidity Sweeps)', duration: '29 min' },
          { id: 'les-a8', title: 'Algoritmi di Esecuzione Operativa (VWAP & TWAP)', duration: '31 min' },
          { id: 'les-a9', title: 'Automatizzare i Segnali di Trading con la Suite AI', duration: '35 min' },
          { id: 'les-a10', title: 'Masterclass Executive: Gestione di Fondi Propri (Prop Firm)', duration: '40 min' }
        ]
      }
    ]
  }
};

// Lista sequenziale piatta di tutte le 30 lezioni
const ALL_FLAT_LESSONS = [
  ...ALL_STUDIO_LESSONS_DATA.base.categories.flatMap((c) => c.lessons),
  ...ALL_STUDIO_LESSONS_DATA.intermedio.categories.flatMap((c) => c.lessons),
  ...ALL_STUDIO_LESSONS_DATA.avanzato.categories.flatMap((c) => c.lessons)
];

// Gestione salvataggio e recupero lezioni completate in localStorage
export function getCompletedLessons() {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem('nexus_completed_lessons');
    return saved ? JSON.parse(saved) : [];
  } catch (_) {
    return [];
  }
}

export function toggleCompletedLesson(lessonId, isCompleted = true) {
  if (typeof window === 'undefined' || !lessonId) return;
  try {
    const current = getCompletedLessons();
    let updated;
    if (isCompleted) {
      updated = Array.from(new Set([...current, lessonId]));
    } else {
      updated = current.filter((id) => id !== lessonId);
    }
    localStorage.setItem('nexus_completed_lessons', JSON.stringify(updated));
    window.dispatchEvent(new Event('nexus_user_updated'));
  } catch (err) {
    console.error('Errore salvataggio progresso lezione:', err);
  }
}

// Generatore dinamico dei livelli con percentuale completamento reale
export function getFallbackStudioLevels() {
  const completed = getCompletedLessons();
  const baseLessons = ALL_STUDIO_LESSONS_DATA.base.categories.flatMap((c) => c.lessons);
  const intermedioLessons = ALL_STUDIO_LESSONS_DATA.intermedio.categories.flatMap((c) => c.lessons);
  const avanzatoLessons = ALL_STUDIO_LESSONS_DATA.avanzato.categories.flatMap((c) => c.lessons);

  const baseDone = baseLessons.filter((l) => completed.includes(l.id)).length;
  const intermedioDone = intermedioLessons.filter((l) => completed.includes(l.id)).length;
  const avanzatoDone = avanzatoLessons.filter((l) => completed.includes(l.id)).length;

  return [
    { 
      id: 1, 
      code: 'base', 
      name: 'Livello Base', 
      description: 'Fondamenti di Trading, Candlestick & Gestione del Rischio', 
      completedLessons: baseDone, 
      totalLessons: 10, 
      progressPercent: Math.round((baseDone / 10) * 100) 
    },
    { 
      id: 2, 
      code: 'intermedio', 
      name: 'Livello Intermedio', 
      description: 'Analisi Tecnica, Indicatori, Pattern & Multi-Timeframe', 
      completedLessons: intermedioDone, 
      totalLessons: 10, 
      progressPercent: Math.round((intermedioDone / 10) * 100) 
    },
    { 
      id: 3, 
      code: 'avanzato', 
      name: 'Livello Avanzato', 
      description: 'Algoritmi AI, Smart Money Concepts & Trading Istituzionale', 
      completedLessons: avanzatoDone, 
      totalLessons: 10, 
      progressPercent: Math.round((avanzatoDone / 10) * 100) 
    }
  ];
}

// Generatore dinamico delle categorie per ciascun livello con stato completato
export function getFallbackStudioCategories(levelCode = 'base') {
  const completed = getCompletedLessons();
  const levelData = ALL_STUDIO_LESSONS_DATA[levelCode] || ALL_STUDIO_LESSONS_DATA.base;

  return {
    categories: levelData.categories.map((cat) => ({
      ...cat,
      lessons: cat.lessons.map((les) => ({
        ...les,
        completed: completed.includes(les.id)
      }))
    }))
  };
}

// Generatore dettagli lezione singola con navigazione dinamica prev/next
export function getFallbackLessonDetail(lessonId = 'les-b1') {
  const completed = getCompletedLessons();
  const isCompleted = completed.includes(lessonId);

  const currentIndex = ALL_FLAT_LESSONS.findIndex((l) => l.id === lessonId);
  const currentObj = ALL_FLAT_LESSONS[currentIndex >= 0 ? currentIndex : 0];

  const prevLesson = currentIndex > 0 ? ALL_FLAT_LESSONS[currentIndex - 1] : null;
  const nextLesson = currentIndex >= 0 && currentIndex < ALL_FLAT_LESSONS.length - 1 ? ALL_FLAT_LESSONS[currentIndex + 1] : null;

  return {
    lesson: {
      id: currentObj.id,
      title: currentObj.title,
      duration: currentObj.duration,
      introText: 'Guida teorico-pratica completa progettata dagli analisti Nexus AI per padroneggiare l\'operatività sui mercati.',
      manualText: `### 1. Concetti Chiave & Struttura Operativa\n\nIn questa lezione analizziamo in dettaglio l'operatività reale sui mercati finanziari. Comprendere la struttura del prezzo, la gestione del rischio e la disciplina emotiva è il requisito fondamentale per mantenere la redditività sul lungo periodo.\n\n### 2. Pianificazione ed Esecuzione dell'Ordine\n\nQuando entri a mercato, posiziona sempre con rigore lo Stop Loss ed il Take Profit. Utilizza gli strumenti di analisi tecnica e la suite di intelligenza artificiale Nexus AI per validare i livelli prima dell'esecuzione.`,
      completed: isCompleted
    },
    blocks: [
      {
        id: `walkthrough-${lessonId}`,
        type: 'chart_walkthrough',
        title: 'Walkthrough Grafico Interattivo',
        instruction: 'Osserva l\'andamento del grafico per identificare la struttura del trend ed i livelli chiave.',
        config: {
          symbol: 'BTC/USD',
          timeframe: '1H',
          points: [
            { price: 42000, label: 'Livello Chiave Supporto' },
            { price: 43500, label: 'Conferma Breakout' }
          ]
        }
      },
      {
        id: `quiz-${lessonId}`,
        type: 'chart_quiz',
        title: 'Test Pratico di Comprensione Grafica',
        instruction: 'Rispondi al quesito per testare la tua comprensione del pattern operativo.',
        config: {
          question: 'Qual è il posizionamento corretto dello Stop Loss per tutelare il capitale?',
          options: [
            'Sotto il minimo del supporto chiave (Protezione Ottimale)',
            'Sopra il massimo relativo (Rischioso)',
            'Senza impostare lo Stop Loss (Errato)'
          ],
          correctAnswerIndex: 0
        }
      },
      {
        id: `drawable-${lessonId}`,
        type: 'chart_drawable',
        title: 'Esercitazione di Disegno Tecnico',
        instruction: 'Disegna la trendline o il livello operativo sul grafico sottostante.',
        config: {
          symbol: 'BTC/USD'
        }
      }
    ],
    navigation: {
      prev: prevLesson ? { id: prevLesson.id, title: prevLesson.title } : null,
      next: nextLesson ? { id: nextLesson.id, title: nextLesson.title } : null
    }
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
  factors: []
};

export const FALLBACK_WORKAREA_STATS = {
  winRatePercent: 0,
  profitFactor: 0,
  totalTrades: 0,
  averageProfitUsd: 0
};

export function getFallbackNews(asset = 'BTC/USD') {
  return {
    asset,
    news: [
      {
        id: 'news-1',
        title: `Aggiornamento Analisi di Mercato per ${asset}`,
        summary: `Forte interesse istituzionale e volumi in consolidamento sulla coppia ${asset}.`,
        source: 'Nexus AI Intelligence',
        time: '10 min fa',
        sentiment: 'Bullish'
      }
    ]
  };
}

export function getFallbackAiAnalysis(asset = 'BTC/USD', budget = 1000) {
  return {
    asset,
    budget,
    confidencePercent: 93,
    direction: 'BUY',
    suggestedEntry: 43200,
    suggestedSl: 42100,
    suggestedTp: 45800,
    summary: `Analisi algoritmica completata per ${asset}. Configurazione rialzista confermata con supporto a 42.100$.`
  };
}
