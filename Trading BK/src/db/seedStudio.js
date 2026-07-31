import db, { run, get } from '../config/database.js';

export async function seedStudioData() {
  console.log('Inizializzazione e Seeding Completo Studio con Manuali Estesi (30 Lezioni Senza Simboli/Asterischi)...');

  // Pulizia preventiva tabelle studio per ripopolamento ordinato
  await run("DELETE FROM studio_interactive_blocks");
  await run("DELETE FROM studio_lessons");
  await run("DELETE FROM studio_categories");
  await run("DELETE FROM studio_levels");

  // 1. Livelli
  await run("INSERT INTO studio_levels (code, name, description, order_index) VALUES (?, ?, ?, ?)", ['base', 'Livello Base', 'Fondamenti di trading, struttura di mercato e lettura candele (10 Lezioni).', 1]);
  await run("INSERT INTO studio_levels (code, name, description, order_index) VALUES (?, ?, ?, ?)", ['intermedio', 'Livello Intermedio', 'Pattern grafici, indicatori tecnici e gestione del rischio (10 Lezioni).', 2]);
  await run("INSERT INTO studio_levels (code, name, description, order_index) VALUES (?, ?, ?, ?)", ['avanzato', 'Livello Avanzato', 'Psicologia, strategie di breakout e liquidità istituzionale (10 Lezioni).', 3]);

  const baseLvl = await get("SELECT id FROM studio_levels WHERE code = 'base'");
  const interLvl = await get("SELECT id FROM studio_levels WHERE code = 'intermedio'");
  const avanLvl = await get("SELECT id FROM studio_levels WHERE code = 'avanzato'");

  // 2. Categorie
  const catB1 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [baseLvl.id, 'Struttura dei Mercati e Asset', 'fondamenti-mercato', 'Concetti base: Bid, Ask, spread e tipi di ordine.', 1]);
  const catB2 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [baseLvl.id, 'Lettura dei Candlestick', 'lettura-candlestick', 'Interpretazione delle candele giapponesi e dinamica di prezzo.', 2]);

  const catI1 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [interLvl.id, 'Pattern Grafici e Inversioni', 'pattern-grafici', 'Identificazione dei classici pattern di inversione e continuazione.', 1]);
  const catI2 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [interLvl.id, 'Gestione Rischio e Money Management', 'money-management', 'Formule di Risk/Reward, calcolo della posizione e Stop Loss.', 2]);

  const catA1 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [avanLvl.id, 'Psicologia e Disciplina del Trader', 'psicologia-diario', 'Gestione delle emozioni, prevenzione FOMO e diario operativo.', 1]);
  const catA2 = await run("INSERT INTO studio_categories (level_id, name, slug, description, order_index) VALUES (?, ?, ?, ?, ?)", [avanLvl.id, 'Smart Money e Liquidità Istituzionale', 'smart-money', 'Individuazione delle trappole di liquidità e strategie di breakout.', 2]);

  async function insertLesson(categoryId, title, slug, duration, intro, manual, orderIndex, blockConfig = null) {
    const les = await run(
      `INSERT INTO studio_lessons (category_id, title, slug, duration, intro_text, manual_text, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [categoryId, title, slug, duration, intro, manual, orderIndex]
    );

    if (blockConfig) {
      await run(
        `INSERT INTO studio_interactive_blocks (lesson_id, type, title, instruction, config_json, order_index)
         VALUES (?, ?, ?, ?, ?, 1)`,
        [les.id, blockConfig.type, blockConfig.title, blockConfig.instruction, JSON.stringify(blockConfig.config)]
      );
    }
    return les.id;
  }

  // --- LEZIONI LIVELLO BASE (10 LEZIONI ESTESE) ---
  console.log('Inserimento 10 Lezioni Base con manuali estesi...');

  await insertLesson(
    catB1.id,
    "1. Cos'è il Trading Online e come funzionano i Mercati",
    "cos-e-il-trading",
    "10 min",
    "Panoramica completa sull'acquisto e vendita di strumenti finanziari, struttura del book e liquidità.",
    "### Introduzione Generale al Trading Online\n\nIl trading online rappresenta la compravendita di strumenti finanziari attraverso piattaforme telematiche con l'obiettivo di realizzare un profitto economico sfruttando le fluttuazioni dei prezzi. A differenza dell'investimento tradizionale a lungo termine, il trader opera con orizzonti temporali più brevi, che possono variare da pochi minuti a diverse settimane.\n\n### Struttura del Mercato: Bid, Ask e Spread\n\nIn ogni mercato finanziario regolamentato o decentralizzato, la quotazione di un asset è determinata dall'incontro tra domanda e offerta:\n\n1. Prezzo Bid (Offerta): Rappresenta la quota massima alla quale gli acquirenti presenti sul mercato sono disposti a comprare il titolo in quel determinato istante.\n2. Prezzo Ask (Domanda): Rappresenta la quota minima alla quale i venditori sono disposti a cedere il titolo.\n3. Spread: Corrisponde alla differenza numerica tra il prezzo Ask e il prezzo Bid. Più il mercato è liquido, minore sarà lo spread da sostenere per aprire un'operazione.\n\n### Principi di Gestione Operativa\n\nPer operare in maniera profittevole è fondamentale comprendere che il mercato è governato dalle probabilità e non dalla certezza. Ogni operazione deve essere preceduta da un'analisi rigorosa della struttura di prezzo e da una pianificazione del rischio massima prima ancora di calcolare i potenziali guadagni.",
    1,
    {
      type: 'chart_walkthrough',
      title: 'Dinamica di mercato tra domanda e offerta',
      instruction: 'Osserva come la variazione della pressione tra acquisti e vendite sposta il prezzo sul grafico.',
      config: {
        candles: [
          { time: '10:00', open: 100, high: 102, low: 99, close: 101 },
          { time: '10:05', open: 101, high: 105, low: 101, close: 104 },
          { time: '10:10', open: 104, high: 108, low: 103, close: 107 }
        ],
        steps: [
          { candleIndex: 0, text: "Gli ordini in acquisto incontrano i venditori a quota 101." },
          { candleIndex: 1, text: "L'aumento dei compratori fa salire il prezzo fino a 104." },
          { candleIndex: 2, text: "Forte spinta rialzista con chiusura a quota 107." }
        ]
      }
    }
  );

  await insertLesson(
    catB1.id,
    "2. Gli Asset Finanziari: Crypto, Azioni, Forex e Commodities",
    "asset-finanziari",
    "10 min",
    "Analisi dettagliata delle caratteristiche di volatilità, orari e dinamiche di ogni classe di asset.",
    "### Classificazione degli Asset Finanziari\n\nUn trader consapevole deve conoscere le peculiarità di ciascuna classe di asset prima di allocare capitale operativo.\n\n### Criptovalute (Crypto)\nIl mercato delle criptovalute è attivo 24 ore su 24 e 7 giorni su 7. Si distingue per una volatilità estremamente elevata e per reazioni immediate alle notizie di settore o macroeconomiche. Richiede una gestione del rischio molto rigorosa.\n\n### Azioni Societarie\nLe azioni rappresentano quote di capitale di società quotate in borsa. Vengono negoziate durante le sessioni ufficiali di borsa (es. NASDAQ, NYSE). I prezzi sono influenzati dai bilanci trimestrali e dalla salute economica delle singole aziende.\n\n### Valute Estere (Forex)\nIl Forex è il mercato più liquido al mondo. Si scambiano coppie di valute (es. EUR/USD, GBP/USD). È guidato dalle decisioni sulle tassi d'interesse delle banche centrali (FED, BCE).\n\n### Materie Prime (Commodities)\nComprende beni fisici come oro, argento e petrolio. Risentono delle dinamiche geopolitiche ed inflazionistiche.",
    2
  );

  await insertLesson(
    catB1.id,
    "3. Tipi di Ordine: Market Order vs Limit Order",
    "tipi-di-ordine",
    "10 min",
    "Funzionamento tecnico degli ordini a mercato immediati ed ordini limite condizionati sul book.",
    "### Tipologie di Ordine nel Trading\n\nL'esecuzione corretta degli ordini è determinante per evitare slippage indesiderati e per proteggere la propria strategia.\n\n### Ordini a Mercato (Market Order)\nUn ordine a mercato viene eseguito immediatamente al miglior prezzo disponibile al momento dell'invio. Garantisce l'esecuzione dell'operazione ma non il prezzo esatto se il mercato si muove rapidamente.\n\n### Ordini Limite (Limit Order)\nUn ordine limite stabilisce un prezzo esatto al quale si è disposti ad entrare a mercato. L'ordine viene inserito nel book ed eseguito soltanto se e quando il prezzo raggiunge o supera la quota prefissata. Garantisce il prezzo di ingresso ma non l'esecuzione se il mercato non raggiunge mai quel livello.",
    3
  );

  await insertLesson(
    catB1.id,
    "4. Come si legge un Grafico a Candele Giapponesi",
    "lettura-grafico-candele",
    "12 min",
    "Anatomia completa delle candele giapponesi: Apertura, Massimo, Minimo e Chiusura (OHLC).",
    "### Anatomia dei Candlestick Giapponesi\n\nIl grafico a candele giapponesi è lo strumento visivo più utilizzato nell'analisi tecnica modernamente intesa in quanto fornisce in un colpo d'occhio 4 informazioni fondamentali per ogni timeframe di riferimento.\n\n### Le 4 componenti della candela (OHLC):\n\n1. Apertura (Open): Il prezzo a cui si è aperta la sessione o il periodo temporale selezionato.\n2. Massimo (High): La quota più alta raggiunta dal prezzo durante l'intera durata della candela.\n3. Minimo (Low): La quota più bassa toccata durante la sessione.\n4. Chiusura (Close): Il prezzo finale registrato allo scadere del periodo temporale.\n\n### Significato del Corpo e delle Ombre\nIl corpo della candela mostra la direzione dominante: verde se la chiusura è superiore all'apertura, rossa se la chiusura è inferiore. Le ombre (wicks) rappresentano la volatilità ed il rifiuto temporaneo dei prezzi spinti in alto o in basso.",
    4
  );

  await insertLesson(
    catB2.id,
    "5. Candela Hammer (Martello): Segnale di Inversione Rialzista",
    "candela-hammer",
    "10 min",
    "Identificare il rifiuto dei prezzi bassi tramite la lunga ombra inferiore ed il corpo ristretto.",
    "### Il Pattern Candlestick Hammer\n\nL'Hammer (o Martello) è uno dei pattern di inversione rialzista più affidabili quando si presenta al termine di un trend ribassista o su un livello di supporto rilevante.\n\n### Caratteristiche Strutturali dell'Hammer:\n1. Ombra Inferiore Lunga: L'ombra inferiore deve essere lunga almeno il doppio del corpo reale della candela.\n2. Corpo Piccolo: Posizionato nella parte superiore della candela, sia esso verde o rosso.\n3. Ombra Superiore Piccola o Assente: Indica che la chiusura è avvenuta nei pressi dei massimi della sessione.\n\n### Dinamica Psicologica di Mercato\nDurante la formazione della candela i venditori spingono con violenza il prezzo verso il basso verso nuovi minimi. Tuttavia, la reazione massiccia dei compratori riassorbe l'intera discesa portando la chiusura vicino ai massimi. Questo dimostra che la spinta ribassista si è esaurita.",
    5,
    {
      type: 'chart_quiz',
      title: 'Individua la candela Hammer',
      instruction: 'Clicca sulla candela che presenta le caratteristiche esatte del pattern Hammer.',
      config: {
        candles: [
          { time: '1', open: 150, high: 152, low: 142, close: 144 },
          { time: '2', open: 144, high: 145, low: 135, close: 137 },
          { time: '3', open: 137, high: 138, low: 120, close: 136, isTarget: true },
          { time: '4', open: 136, high: 148, low: 135, close: 146 }
        ],
        targetIndex: 2,
        correctFeedback: "Corretto! Questa è la candela Hammer con riassorbimento dai minimi a quota 120.",
        wrongFeedback: "Non corretto. Clicca sulla candela che mostra la lunga ombra inferiore."
      }
    }
  );

  await insertLesson(
    catB2.id,
    "6. Candela Shooting Star: Inversione Ribassista sui Massimi",
    "shooting-star",
    "10 min",
    "Come identificare l'esaurimento della spinta rialzista sui livelli di resistenza.",
    "### La Shooting Star (Stella Cadente)\n\nLa Shooting Star è l'equivalente ribassista del pattern Hammer. Si manifesta in cima ad un trend rialzista o a ridosso di una resistenza critica.\n\n### Elementi Distintivi:\n- Ombra superiore molto pronunciata (almeno doppia rispetto al corpo).\n- Corpo piccolo situato nella parte inferiore del range della candela.\n- Ombra inferiore quasi inesistente.\n\n### Interpretazione Operativa\nI compratori hanno tentato di spingere il prezzo a nuovi massimi, ma la massiccia presenza di venditori ha sopraffatto gli acquisti, riportando la chiusura vicino ai livelli iniziali.",
    6
  );

  await insertLesson(
    catB2.id,
    "7. Candele Doji: Incertezza ed Equilibrio di Mercato",
    "candele-doji",
    "10 min",
    "Lettura delle candele neutre in cui il prezzo di apertura coincide con quello di chiusura.",
    "### Le Candele Doji ed il Bilanciamento del Mercato\n\nUna candela Doji si forma quando il prezzo di apertura e quello di chiusura sono identici o estremamente vicini.\n\n### Significato Operativo:\nLa Doji segnala un momento di indecisione assoluta tra compratori e venditori. Se compare al termine di un trend prolungato, è spesso il primo campanello d'allarme di un imminente cambio di direzione o di una forte esplosione di volatilità.",
    7
  );

  await insertLesson(
    catB2.id,
    "8. Bullish e Bearish Engulfing: Pattern di Dominanza a Due Candele",
    "engulfing-patterns",
    "12 min",
    "Riconoscere le candele di assorbimento totale che segnalano un cambio di controllo nel mercato.",
    "### I Pattern Engulfing\n\nI pattern Engulfing sono formati da due candele consecutive in cui la seconda candela ingloba totalmente il corpo della prima.\n\n### Bullish Engulfing (Rialzista)\nLa prima candela è rossa e la seconda è una candela verde imponente che apre sotto o allo stesso livello della precedente e chiude nettamente sopra il massimo del corpo della prima candela.\n\n### Bearish Engulfing (Ribassista)\nLa prima candela è verde e la seconda è una candela rossa di grandi dimensioni che copre totalmente il corpo verde precedente, indicando il totale subentro dei venditori.",
    8
  );

  await insertLesson(
    catB2.id,
    "9. Concetto di Supporto: Livelli di Rimbalzo dei Prezzi",
    "supporti-prezzo",
    "10 min",
    "Identificare e tracciare le fasce di prezzo in cui la domanda supera sistematicamente l'offerta.",
    "### Concetto e Tracciamento dei Supporti\n\nUn livello di supporto è una zona orizzontale del grafico dove la pressione di acquisto è stata storicamente sufficiente a fermare ed invertire una discesa dei prezzi.\n\n### Come Identificare un Supporto Valido:\n- Presenza di almeno due o tre rimbalzi precedenti sulla medesima area numerica.\n- Volumi importanti registrati sui minimi toccati.\n- Reazioni immediate del prezzo con candele a lungo stoppino inferiore.",
    9,
    {
      type: 'chart_drawable',
      title: 'Disegna la linea di supporto',
      instruction: 'Traccia la linea orizzontale di supporto a quota $100 toccando i minimi del grafico.',
      config: {
        candles: [
          { time: '1', open: 120, high: 122, low: 100, close: 105 },
          { time: '2', open: 105, high: 118, low: 100, close: 116 },
          { time: '3', open: 116, high: 125, low: 99, close: 122 }
        ],
        targetY: 100,
        toleranceY: 6,
        correctFeedback: "Ottimo! Hai tracciato correttamente la linea di supporto a quota $100.",
        wrongFeedback: "Riprova: traccia la linea orizzontale sui minimi a quota $100."
      }
    }
  );

  await insertLesson(
    catB2.id,
    "10. Concetto di Resistenza: Livelli di Tetto dei Prezzi",
    "resistenze-prezzo",
    "10 min",
    "Come tracciare i soffitti di prezzo in cui l'offerta blocca i rialzi di mercato.",
    "### Tracciare le Resistenze Operative\n\nLa resistenza rappresenta il soffitto concettuale del grafico dove la pressione di vendita supera la forza degli acquirenti.\n\n### Regola di polarità:\nQuando un livello di resistenza viene brecciato con decisione al rialzo, tende a trasformarsi in un nuovo supporto nelle sessioni successive (Principio di inversione dei ruoli).",
    10
  );

  // --- LEZIONI LIVELLO INTERMEDIO (10 LEZIONI ESTESE) ---
  console.log('Inserimento 10 Lezioni Intermedio con manuali estesi...');

  await insertLesson(
    catI1.id,
    "11. Pattern Testa e Spalle (Head and Shoulders)",
    "testa-e-spalle-intermedio",
    "12 min",
    "Analisi approfondita del pattern di inversione ribassista formato da tre picchi distinti.",
    "### Anatomia del Pattern Testa e Spalle\n\nIl pattern Testa e Spalle è una delle figure di inversione di trend più conosciute ed affidabili dell'analisi tecnica.\n\n### Componenti Strutturali:\n1. Spalla Sinistra: Un primo rialzo seguito da una correzione su una linea di supporto (Neckline).\n2. Testa: Un secondo rialzo che supera il picco precedente ma trova venditori su quotazioni superiori.\n3. Spalla Destra: Un terzo rialzo che non riesce a raggiungere l'altezza della testa, evidenziando il definitivo calo della spinta dei compratori.\n4. Neckline (Linea del collo): La linea di supporto che unisce i due minimi intermedi.\n\n### Trigger di Ingresso:\nIl segnale operativo di vendita (Short) viene confermato esclusivamente dalla chiusura di una candela al di sotto della Neckline.",
    1,
    {
      type: 'chart_walkthrough',
      title: 'Walkthrough: Formazione del Testa e Spalle',
      instruction: 'Osserva lo sviluppo della spalla sinistra, della testa, della spalla destra e del breakout.',
      config: {
        candles: [
          { time: '1', open: 130, high: 150, low: 128, close: 148 },
          { time: '2', open: 148, high: 149, low: 139, close: 140 },
          { time: '3', open: 140, high: 168, low: 138, close: 165 },
          { time: '4', open: 165, high: 166, low: 139, close: 140 },
          { time: '5', open: 140, high: 152, low: 138, close: 150 },
          { time: '6', open: 150, high: 151, low: 132, close: 134 }
        ],
        steps: [
          { candleIndex: 0, text: "1. Spalla Sinistra con massimo a $150." },
          { candleIndex: 2, text: "2. La Testa segna il picco massimo a $168." },
          { candleIndex: 4, text: "3. Spalla Destra a $150 evidenzia la debolezza dei compratori." },
          { candleIndex: 5, text: "4. Rottura della Neckline a $140: segnale operativo." }
        ]
      }
    }
  );

  await insertLesson(
    catI1.id,
    "12. Doppio Minimo (Double Bottom) e W Pattern",
    "doppio-minimo",
    "10 min",
    "Pattern di inversione rialzista caratterizzato da due minimi consecutivi a livelli simili.",
    "### Il Pattern Doppio Minimo (W Pattern)\n\nIl Doppio Minimo è una figura rialzista che indica il fallimento dei venditori nel far sprofondare ulteriormente il prezzo sotto una quota di supporto strategica.\n\n### Esecuzione Operativa:\nIl punto di ingresso ottimale si posiziona sulla rottura al rialzo del massimo centrale che separa i due minimi (Scollatura). Lo Stop Loss viene inserito pochi tick al di sotto del secondo minimo.",
    2
  );

  await insertLesson(
    catI1.id,
    "13. Doppio Massimo (Double Top) e M Pattern",
    "doppio-massimo",
    "10 min",
    "Pattern di inversione ribassista con due picchi consecutivi sulla medesima resistenza.",
    "### Il Pattern Doppio Massimo (M Pattern)\n\nIl Doppio Massimo mostra l'incapacità dei compratori di rompere una resistenza dopo due tentativi consecutivi. La rottura al ribasso del minimo centrale valida il target di vendita.",
    3
  );

  await insertLesson(
    catI1.id,
    "14. Triangoli Simmetrici, Ascendenti e Discendenti",
    "triangoli-tecnici",
    "12 min",
    "Studio delle figure di contrazione della volatilità prima dell'esplosione direzionale del prezzo.",
    "### I Triangoli nell'Analisi Tecnica\n\nI triangoli indicano una fase di contrazione temporanea del range dei prezzi prima di un violento breakout.\n\n1. Triangolo Ascendente: Massimi piatti e minimi crescenti. Indica accumulazione rialzista.\n2. Triangolo Discendente: Minimi piatti e massimi decrescenti. Indica distribuzione ribassista.\n3. Triangolo Simmetrico: Massimi decrescenti e minimi crescenti. Indica compressione neutra in attesa del breakout.",
    4
  );

  await insertLesson(
    catI2.id,
    "15. Calcolo della Dimensione della Posizione (Position Sizing)",
    "position-sizing",
    "12 min",
    "Formula matematica rigorosa per determinare l'ammontare esatto di capitale da allocare per operazione.",
    "### Calcolo della Dimensione della Posizione (Position Sizing)\n\nLa gestione del capitale è l'unico fattore che garantisce la sopravvivenza finanziaria a lungo termine nel trading.\n\n### Formula Matematica del Rischio:\n\nDimensione Posizione = (Capitale Totale x Rischio Percentuale) / (Prezzo Ingresso - Stop Loss)\n\n### Regola Fondamentale:\nNon rischiare mai più del 1% o massimo 2% del capitale totale su un singolo trade.",
    5,
    {
      type: 'chart_quiz',
      title: 'Individua la quota di Stop Loss per il calcolo',
      instruction: 'Clicca sulla candela che definisce il livello minimo di protezione.',
      config: {
        candles: [
          { time: '1', open: 100, high: 105, low: 95, close: 104 },
          { time: '2', open: 104, high: 115, low: 102, close: 114, isTarget: true }
        ],
        targetIndex: 0,
        correctFeedback: "Corretto! Lo Stop Loss va inserito sotto il minimo a quota $95.",
        wrongFeedback: "Non corretto. Clicca sulla prima candela dove si trova il minimo di protezione."
      }
    }
  );

  await insertLesson(
    catI2.id,
    "16. Rapporto Rischio Rendimento (Risk Reward Ratio)",
    "risk-reward-ratio",
    "10 min",
    "Come impostare operatività con un rapporto minimo 1 a 2 per essere profittevoli anche con basso win rate.",
    "### Il Rapporto Rischio Rendimento (R/R)\n\nIl rapporto R/R misura quanto capitale si rischia rispetto al guadagno potenziale target.\n\nCon un rapporto di 1 a 2, per ogni 100 euro rischiati il target di guadagno è fissato a 200 euro. Questo consente di chiudere in guadagno complessivo anche indovinando soltanto il 40% dei trade effettuati.",
    6
  );

  await insertLesson(
    catI2.id,
    "17. Stop Loss Tecnico vs Stop Loss Monetario",
    "stop-loss-tipologie",
    "10 min",
    "Analisi degli errori derivanti dall'impostare stop loss su cifre casuali anziché su livelli grafici.",
    "### Stop Loss Tecnico vs Monetario\n\nLo Stop Loss Monetario viene scelto in base a quanto denaro si vuole perdere (es. chiudere a meno 50 euro). Questo è un errore comune.\n\nLo Stop Loss Tecnico viene posizionato esclusivamente su livelli dove la tesi di analisi viene smentita dal grafico (es. sotto un supporto chiave).",
    7
  );

  await insertLesson(
    catI2.id,
    "18. Indicatore RSI (Relative Strength Index) ed Ipercomprato ed Ipervenduto",
    "rsi-indicatore",
    "12 min",
    "Misurare la forza del movimento e rilevare le divergenze tra prezzo ed oscillatore.",
    "### L'Indicatore RSI (Relative Strength Index)\n\nL'RSI è un oscillatore di momentum con scala da 0 a 100.\n\n- Zona Ipercomprato (sopra 70): Indica che il prezzo è salito molto rapidamente e potrebbe necessitare di una pausa o correzione.\n- Zona Ipervenduto (sotto 30): Indica che le vendite sono state eccessive e il prezzo potrebbe rimbalzare.",
    8,
    {
      type: 'chart_drawable',
      title: 'Traccia la linea di divergenza RSI',
      instruction: 'Traccia la linea di supporto inclinata sui minimi crescenti del grafico.',
      config: {
        candles: [
          { time: '1', open: 100, high: 110, low: 90, close: 105 },
          { time: '2', open: 105, high: 120, low: 100, close: 118 },
          { time: '3', open: 118, high: 135, low: 112, close: 130 }
        ],
        targetY: 105,
        toleranceY: 8,
        correctFeedback: "Ottimo! Hai tracciato correttamente la linea di supporto.",
        wrongFeedback: "Riprova: traccia la linea unendo i minimi crescenti da 90 a 112."
      }
    }
  );

  await insertLesson(
    catI2.id,
    "19. Medie Mobili EMA 50 ed EMA 200 come Supporti e Resistenze Dinamiche",
    "medie-mobili-ema",
    "10 min",
    "Identificare il trend istituzionale di fondo utilizzando le medie mobili esponenziali.",
    "### Le Medie Mobili Esponenziali (EMA)\n\nLa EMA 200 rappresenta il filtro di trend per eccellenza. Quando il prezzo si trova al di sopra della EMA 200, la tendenza di fondo è rialzista e si prediligono operazioni di acquisto.",
    9
  );

  await insertLesson(
    catI2.id,
    "20. Indicatore MACD ed Incroci della Signal Line",
    "macd-indicatore",
    "10 min",
    "Interpretazione delle convergenze e divergenze del MACD per la conferma dei trend.",
    "### L'Indicatore MACD\n\nIl MACD misura la differenza tra due medie mobili esponenziali. Quando la linea MACD incrocia al rialzo la Signal Line, si ottiene un segnale di conferma del momentum rialzista.",
    10
  );

  // --- LEZIONI LIVELLO AVANZATO (10 LEZIONI ESTESE) ---
  console.log('Inserimento 10 Lezioni Avanzato con manuali estesi...');

  await insertLesson(
    catA1.id,
    "21. Gestione delle Emozioni: Combattere la FOMO (Fear of Missing Out)",
    "gestione-fomo",
    "12 min",
    "Come evitare entrate d'impulso a mercato generate dalla paura di perdere il movimento.",
    "### Il Fenomeno della FOMO nel Trading\n\nLa FOMO (Fear Of Missing Out) è lo stato emotivo d'ansia che spinge il trader ad entrare a mercato in ritardo quando un prezzo è già salito o sceso notevolmente.\n\n### Effetti Distruttivi della FOMO:\nEntrare a picco avvenuto porta ad acquistare esattamente sui massimi di periodo, poco prima che i trader istituzionali prendano profitto provocando ritracciamenti immediati.\n\n### Regola di Disciplina:\nSe l'opportunità di ingresso è passata, non inseguire mai il mercato. Attendi che si formi una nuova struttura valida.",
    1,
    {
      type: 'chart_walkthrough',
      title: 'Walkthrough: Trappola da FOMO sui massimi',
      instruction: 'Osserva come chi entra a mercato sui massimi spinto dalla FOMO subisce la correzione immediata.',
      config: {
        candles: [
          { time: '1', open: 100, high: 120, low: 99, close: 118 },
          { time: '2', open: 118, high: 150, low: 117, close: 148 },
          { time: '3', open: 148, high: 149, low: 120, close: 122 }
        ],
        steps: [
          { candleIndex: 0, text: "1. Il movimento parte regolarmente." },
          { candleIndex: 1, text: "2. Forte spike rialzista. I trader FOMO entrano sui massimi a quota 148." },
          { candleIndex: 2, text: "3. Le mani forti prendono profitto: crollo immediato a quota 122." }
        ]
      }
    }
  );

  await insertLesson(
    catA1.id,
    "22. Revenge Trading e la Trappola delle Perdite Consecutive",
    "revenge-trading",
    "10 min",
    "Strategie comportamentali per interrompere la spirale dell'aumento irrazionale della leva.",
    "### Eliminare il Revenge Trading\n\nIl Revenge Trading si verifica quando, dopo aver subito una perdita, si apre immediatamente un'altra operazione irrazionale con taglia maggiorata per vendicarsi del mercato.\n\n### Protocollo di Sicurezza:\nDopo una perdita subita, è obbligatorio allontanarsi dal grafico per almeno 30 minuti al fine di resettare lo stato emotivo.",
    2
  );

  await insertLesson(
    catA1.id,
    "23. Diario Operativo (Journaling) e Tracciamento dei Tag Emotivi",
    "diario-psicologico",
    "10 min",
    "Come analizzare le proprie prestazioni correlando i risultati finanziari allo stato d'animo.",
    "### L'Importanza del Diario Operativo\n\nRegistrare per ogni operazione l'emozione provata (Calmo, Ansioso, FOMO, Vendetta) consente di evidenziare quale stato d'animo produce statisticamente i peggiori risultati sul capitale.",
    3
  );

  await insertLesson(
    catA1.id,
    "24. Gestione del Drawdown e Protezione del Capitale Residuo",
    "gestione-drawdown",
    "10 min",
    "Protocolli per ridurre il rischio percentuale per trade durante le fasi operative negative.",
    "### Gestione del Drawdown\n\nQuando l'equity curve subisce una contrazione (Drawdown), la regola d'oro prevede di dimezzare immediatamente il rischio per operazione (es. dallo 1% allo 0.5%) fino al ripristino della consistenza.",
    4
  );

  await insertLesson(
    catA2.id,
    "25. Caccia alla Liquidità (Liquidity Hunt) e Falsi Breakout Istituzionali",
    "caccia-liquidita",
    "12 min",
    "Comprendere come gli investitori istituzionali muovono il prezzo per raccogliere ordini di stop loss.",
    "### Caccia alla Liquidità (Liquidity Hunt)\n\nI grandi operatori istituzionali necessitano di elevati volumi per aprire le proprie posizioni. Per fare ciò spingono momentaneamente il prezzo al di sotto di supporti noti dove si concentrano gli Stop Loss dei trader al dettaglio.\n\nUna volta attivati gli stop loss (che diventano ordini di vendita a mercato), gli istituzionali li assorbono ed invertono immediatamente la direzione.",
    5,
    {
      type: 'chart_quiz',
      title: 'Individua la caccia alla liquidità',
      instruction: 'Clicca sulla candela che ha eseguito la caccia alla liquidità sotto il supporto.',
      config: {
        candles: [
          { time: '1', open: 100, high: 105, low: 90, close: 102 },
          { time: '2', open: 102, high: 104, low: 78, close: 103, isTarget: true },
          { time: '3', open: 103, high: 125, low: 102, close: 124 }
        ],
        targetIndex: 1,
        correctFeedback: "Esatto! L'ombra profonda a quota 78 ha raccolto la liquidità prima dell'inversione.",
        wrongFeedback: "Riprova: clicca sulla seconda candela con l'ampia ombra inferiore."
      }
    }
  );

  await insertLesson(
    catA2.id,
    "26. Order Blocks e Zone di Domanda e Offerta Istituzionale",
    "order-blocks",
    "12 min",
    "Identificare le ultime candele contrarie dove risiedono gli ordini istituzionali pendenti.",
    "### Gli Order Block Istituzionali\n\nUn Order Block rappresenta l'ultima candela ribassista prima di un grande movimento impulsivo al rialzo. In quella zona di prezzo rimangono ordini istituzionali non ancora eseguiti al 100% su cui il prezzo tende a ritornare.",
    6
  );

  await insertLesson(
    catA2.id,
    "27. Fair Value Gaps (FVG) ed Inefficienze di Prezzo",
    "fair-value-gaps",
    "12 min",
    "Come individuare i vuoti di liquidità lasciati dai movimenti di prezzo troppo veloci.",
    "### I Fair Value Gaps (FVG)\n\nIl Fair Value Gap è un'inefficienza di mercato creata da una candela impulsiva che lascia uno spazio non ricoperto tra l'ombra della candela precedente e quella successiva. Il mercato tende a riempire tale inefficienza prima di proseguire.",
    7
  );

  await insertLesson(
    catA2.id,
    "28. Strategia di Breakout Confermato con Retest",
    "breakout-retest",
    "12 min",
    "Tecnica operativa per entrare a mercato solo dopo la conferma del retest della resistenza brecciata.",
    "### Breakout e Retest Operativo\n\nPer evitare i falsi breakout, non si entra mai al momento dell'esplosione iniziale del prezzo. Si attende che il prezzo ritracci e ritesti la vecchia resistenza ora trasformata in supporto.",
    8,
    {
      type: 'chart_drawable',
      title: 'Traccia la linea di Retest',
      instruction: 'Traccia la linea orizzontale a quota $150 che da resistenza diventa supporto.',
      config: {
        candles: [
          { time: '1', open: 130, high: 150, low: 128, close: 148 },
          { time: '2', open: 148, high: 165, low: 147, close: 162 },
          { time: '3', open: 162, high: 163, low: 150, close: 152 },
          { time: '4', open: 152, high: 175, low: 151, close: 172 }
        ],
        targetY: 150,
        toleranceY: 5,
        correctFeedback: "Eccellente! La linea a $150 mostra la quota esatta del Retest.",
        wrongFeedback: "Riprova: traccia la linea orizzontale al livello di rottura di $150."
      }
    }
  );

  await insertLesson(
    catA2.id,
    "29. Gestione delle Posizioni Multi Target e Scaling Out",
    "scaling-out",
    "10 min",
    "Strategia di incasso parziale dei profitti e spostamento dello Stop Loss a Break Even.",
    "### Esecuzione dello Scaling Out\n\nAl raggiungimento del primo target di profitto si incassa il 50% della posizione e si sposta lo Stop Loss al prezzo d'ingresso. Questo rende il resto dell'operazione a rischio zero.",
    9
  );

  await insertLesson(
    catA2.id,
    "30. Creazione del Proprio Trading Plan Istituzionale",
    "trading-plan-completo",
    "12 min",
    "Sintetizzare tutte le regole di analisi, gestione ed emotività in una checklist operativa immodificabile.",
    "### Il Trading Plan Istituzionale\n\nUn Trading Plan professionale è una checklist scritta di regole inviolabili:\n\n1. Orari operativi prestabiliti.\n2. Rischio massimo giornaliero fisso.\n3. Condizioni di ingresso e di uscita dettagliate.\n4. Accettazione totale dell'esito di ciascuna operazione.",
    10
  );

  console.log('Seeding 30 Lezioni Estese completato con successo!');
}
