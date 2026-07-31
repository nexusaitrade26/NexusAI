import { useState } from 'react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';

const INSTITUTIONAL_STRATEGIES = [
  {
    id: 'smc',
    title: 'Smart Money Concepts & Order Blocks',
    tag: 'Liquidità Istituzionale',
    color: 'blue',
    description: 'Identificazione delle trappole di liquidità, caccia agli stop loss e banchi di ordini istituzionali (Order Blocks e FVG).',
    winRate: '72%',
    rrRatio: '1:3',
    timeframe: '15m - 4h',
    simpleExplanation: 'Gli investitori istituzionali (banche e fondi) muovono volumi immensi. Prima di spingere il prezzo al rialzo, creano una trappola spingendo temporaneamente il prezzo in basso per raccogliere i contratti dagli Stop Loss dei piccoli trader (Liquidity Hunt). Non appena la liquidità viene assorbita, il prezzo rimbalza dall\'Order Block lasciando un Fair Value Gap (vuoto di prezzo).',
    entryRules: [
      'Identifica un picco di liquidità brecciato (Liquidity Grab).',
      'Attendi la formazione dell\'Order Block (ultima candela ribassista prima del forte impulso rialzista).',
      'Entra a mercato quando il prezzo ritorna a ritestare l\'Order Block o il Fair Value Gap (FVG).',
      'Stop Loss posizionato subito sotto il minimo dell\'Order Block.'
    ],
    simulationChart: {
      entryPrice: 64500,
      stopLoss: 63800,
      takeProfit: 66600,
      candles: [
        { time: '1', open: 65200, high: 65400, low: 64800, close: 64900 },
        { time: '2', open: 64900, high: 65000, low: 63700, close: 64200, isLiquidityHunt: true },
        { time: '3', open: 64200, high: 65800, low: 64100, close: 65600, isImpulse: true },
        { time: '4', open: 65600, high: 65700, low: 64500, close: 64600 },
        { time: '5', open: 64600, high: 66700, low: 64550, close: 66600, isTp: true }
      ]
    }
  },
  {
    id: 'breakout',
    title: 'Breakout Confermato & Retest',
    tag: 'Struttura di Mercato',
    color: 'blue',
    description: 'Ingresso ad alta probabilità solo dopo la rottura netta di un supporto/resistenza ed il successivo retest di conferma.',
    winRate: '68%',
    rrRatio: '1:2.5',
    timeframe: '1h - 1D',
    simpleExplanation: 'I mercati trascorrono molto tempo in fasi di lateralizzazione. Quando il prezzo rompe con forza un tetto (resistenza), molti trader entrano subito. Il trader istituzionale attende che la resistenza brecciata si trasformi nel nuovo pavimento (supporto) tramite un retest pulito prima di entrare.',
    entryRules: [
      'Identifica una resistenza chiave con almeno 2 o 3 tocchi precedenti.',
      'Attendi una candela di chiusura con ampio corpo sopra la resistenza (Breakout).',
      'Non entrare sulla prima candela: attendi il ritracciamento sul livello brecciato (Retest).',
      'Entra sulla candela di conferma rialzista al contatto con il vecchio livello.'
    ],
    simulationChart: {
      entryPrice: 120,
      stopLoss: 116,
      takeProfit: 130,
      candles: [
        { time: '1', open: 112, high: 118, low: 111, close: 117 },
        { time: '2', open: 117, high: 118.5, low: 115, close: 116 },
        { time: '3', open: 116, high: 124, low: 115.5, close: 123 },
        { time: '4', open: 123, high: 123.5, low: 120, close: 120.5 },
        { time: '5', open: 120.5, high: 131, low: 120, close: 130 }
      ]
    }
  },
  {
    id: 'trend',
    title: 'Trend Following & EMA Dinamiche',
    tag: 'Inseguimento Trend',
    color: 'blue',
    description: 'Operatività a favore del trend primario di fondo utilizzando gli incroci ed i rintracciamenti sulle medie EMA 50 e 200.',
    winRate: '65%',
    rrRatio: '1:2',
    timeframe: '4h - 1D',
    simpleExplanation: 'Il trend è il tuo migliore alleato. Quando la media mobile a breve termine (EMA 50) si trova sopra quella a lungo termine (EMA 200), il mercato è in un trend rialzista strutturato. L\'obiettivo è comprare sui rintracciamenti quando il prezzo ritocca le medie mobili senza mai andare contro il trend.',
    entryRules: [
      'Verifica la pendenza ed il verso delle medie mobi EMA 50 ed EMA 200.',
      'Attendi che il prezzo corregga verso la zona compresa tra le due medie mobili.',
      'Cerca una candela di inversione (Hammer o Engulfing) sulla media mobile.',
      'Imposta il Take Profit sul massimo precedente della struttura.'
    ],
    simulationChart: {
      entryPrice: 3400,
      stopLoss: 3320,
      takeProfit: 3560,
      candles: [
        { time: '1', open: 3300, high: 3450, low: 3290, close: 3420 },
        { time: '2', open: 3420, high: 3480, low: 3380, close: 3460 },
        { time: '3', open: 3460, high: 3470, low: 3390, close: 3400 },
        { time: '4', open: 3400, high: 3420, low: 3395, close: 3415 },
        { time: '5', open: 3415, high: 3570, low: 3410, close: 3560 }
      ]
    }
  },
  {
    id: 'scalping',
    title: 'Scalping Volatilità & Momentum',
    tag: 'Operatività Veloce',
    color: 'blue',
    description: 'Cattura dei micro-movimenti di prezzo ad elevata volatilità con Stop Loss stretti ed uscite rapide al primo target.',
    winRate: '78%',
    rrRatio: '1:1.5',
    timeframe: '1m - 5m',
    simpleExplanation: 'Lo scalping si basa sulla velocità di esecuzione. Durante le aperture di borsa o i rilasci di notizie ad alto impatto, il prezzo accumula momentum. Lo scalper entra per pochi minuti sfruttando l\'esplosione d\'impulso e chiude rapidamente appena la spinta rallenta.',
    entryRules: [
      'Identifica picchi di volume insoliti sul grafico a 1m o 5m.',
      'Entra all\'uscita da una fase di contrazione della volatilità (squeeze).',
      'Mantenimento posizione breve: da 2 a 15 minuti massimo.',
      'Chiusura immediata al primo rallentamento del momentum.'
    ],
    simulationChart: {
      entryPrice: 2380,
      stopLoss: 2372,
      takeProfit: 2392,
      candles: [
        { time: '1', open: 2370, high: 2373, low: 2369, close: 2372 },
        { time: '2', open: 2372, high: 2374, low: 2371, close: 2373 },
        { time: '3', open: 2373, high: 2382, low: 2373, close: 2380 },
        { time: '4', open: 2380, high: 2393, low: 2379, close: 2392 }
      ]
    }
  }
];

const StrategyAiView = () => {
  const [currentCapital, setCurrentCapital] = useState('10000');
  const [targetGoal, setTargetGoal] = useState('15000');
  const [timeframe, setTimeframe] = useState('3 Mesi');
  const [riskProfile, setRiskProfile] = useState('Moderato (1.5% per trade)');
  const [assetClass, setAssetClass] = useState('Crypto & Azioni');
  
  const [selectedStrategy, setSelectedStrategy] = useState('smc');
  const [activeModalStrategy, setActiveModalStrategy] = useState(null);

  const [aiPlan, setAiPlan] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGeneratePlan = (e) => {
    e.preventDefault();
    setIsGenerating(true);
    setAiPlan(null);

    setTimeout(() => {
      const cap = parseFloat(currentCapital) || 10000;
      const target = parseFloat(targetGoal) || 15000;
      const growthNeeded = (((target - cap) / cap) * 100).toFixed(1);
      const estTrades = Math.max(12, Math.round((target - cap) / (cap * 0.015 * 2.2)));

      setAiPlan({
        capital: cap,
        target: target,
        growthNeeded: growthNeeded > 0 ? `+${growthNeeded}%` : `${growthNeeded}%`,
        estimatedTrades: estTrades,
        recommendedWinRate: '66%',
        targetRR: '1 : 2.5',
        monthlyTarget: `$${((target - cap) / 3).toFixed(2)} / mese`,
        riskPerTradeAmount: `$${(cap * 0.015).toFixed(2)}`,
        strategyName: INSTITUTIONAL_STRATEGIES.find(s => s.id === selectedStrategy)?.title || 'Smart Money Concepts',
        summary: `L'AI ha elaborato un piano strategico per far crescere il tuo capitale da $${cap.toLocaleString()} a $${target.toLocaleString()} in un orizzonte di ${timeframe}.`,
        actionSteps: [
          `Fase 1 (Conservazione): Rischia esattamente $${(cap * 0.015).toFixed(2)} (1.5%) per singola operazione su ${assetClass}.`,
          `Fase 2 (Esecuzione): Esegui circa ${estTrades} operazioni seguendo rigorosamente la strategia ${INSTITUTIONAL_STRATEGIES.find(s => s.id === selectedStrategy)?.title}.`,
          `Fase 3 (Scaling Profitti): Sposta lo Stop Loss a Break Even non appena il trade raggiunge +1.5R e fai correre il Take Profit verso l'obiettivo finale.`,
          `Fase 4 (Raggiungimento Target): Incassa i profitti parziali al raggiungimento delle tappe intermedie per mettere al sicuro il capitale accumulato.`
        ]
      });

      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Libreria Strategie & Generatore AI di Crescita Capitale"
        subtitle="Seleziona una strategia per aprire l'analisi dettagliata con simulazione grafica, oppure elabora il tuo piano target con l'AI."
      />

      {/* Libreria delle Strategie Istituzionali */}
      <div className="space-y-3">
        <div className="flex justify-between items-center">
          <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
            1. Seleziona ed Esplora le Strategie
          </h3>
          <span className="text-[11px] text-blue-400 font-semibold">Clicca su una card per l'analisi e simulazione grafica</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {INSTITUTIONAL_STRATEGIES.map((strat) => {
            const isSelected = selectedStrategy === strat.id;
            return (
              <Card
                key={strat.id}
                onClick={() => {
                  setSelectedStrategy(strat.id);
                  setActiveModalStrategy(strat);
                }}
                className={`cursor-pointer transition-all border group ${
                  isSelected
                    ? 'border-blue-500 bg-blue-950/20 ring-1 ring-blue-500/40 shadow-liquid-glow'
                    : 'border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <h4 className="font-bold text-sm text-slate-100 font-outfit group-hover:text-blue-400 transition-colors">
                    {strat.title}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                    {strat.tag}
                  </span>
                </div>

                <p className="text-xs text-slate-400 mb-4 leading-relaxed line-clamp-2">{strat.description}</p>

                <div className="grid grid-cols-3 gap-2 text-center text-[11px] pt-2 border-t border-slate-800 font-mono mb-3">
                  <div className="p-1.5 rounded-lg bg-slate-900">
                    <span className="text-slate-500 block text-[9px]">Win Rate</span>
                    <strong className="text-emerald-400 font-bold">{strat.winRate}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900">
                    <span className="text-slate-500 block text-[9px]">Rischio/Resa</span>
                    <strong className="text-blue-400 font-bold">{strat.rrRatio}</strong>
                  </div>
                  <div className="p-1.5 rounded-lg bg-slate-900">
                    <span className="text-slate-500 block text-[9px]">Timeframe</span>
                    <strong className="text-blue-400 font-bold">{strat.timeframe}</strong>
                  </div>
                </div>

                <div className="w-full py-2 rounded-xl bg-blue-600/10 hover:bg-blue-600/20 border border-blue-500/20 text-blue-400 font-bold text-xs text-center transition-all">
                  Apri Analisi Dettagliata & Simulazione Grafica &rarr;
                </div>
              </Card>
            );
          })}
        </div>
      </div>

      {/* Form Generatore di Strategia Personalizzata con AI */}
      <Card className="border-blue-500/30 space-y-5">
        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
              2. Valutatore & Pianificatore di Target Capitale AI
            </h3>
          </div>
          <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
            Intelligence AI
          </span>
        </div>

        <form onSubmit={handleGeneratePlan} className="space-y-4 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Capitale Attuale ($)</label>
              <input
                type="number"
                required
                value={currentCapital}
                onChange={(e) => setCurrentCapital(e.target.value)}
                placeholder="es. 10000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Target Capitale Obiettivo ($)</label>
              <input
                type="number"
                required
                value={targetGoal}
                onChange={(e) => setTargetGoal(e.target.value)}
                placeholder="es. 15000"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Orizzonte Temporale</label>
              <select
                value={timeframe}
                onChange={(e) => setTimeframe(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="1 Mese">1 Mese</option>
                <option value="3 Mesi">3 Mesi</option>
                <option value="6 Mesi">6 Mesi</option>
                <option value="1 Anno">1 Anno</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Profilo di Rischio</label>
              <select
                value={riskProfile}
                onChange={(e) => setRiskProfile(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="Conservativo (1.0% per trade)">Conservativo (1.0% per trade)</option>
                <option value="Moderato (1.5% per trade)">Moderato (1.5% per trade)</option>
                <option value="Aggressivo (2.5% per trade)">Aggressivo (2.5% per trade)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Classe di Asset Preferita</label>
              <select
                value={assetClass}
                onChange={(e) => setAssetClass(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
              >
                <option value="Crypto & Azioni">Crypto & Azioni (BTC, ETH, NVDA)</option>
                <option value="Forex & Commodities">Forex & Commodities (EUR/USD, GOLD)</option>
                <option value="Tutti gli Asset">Tutti gli Asset (Portafoglio Multimercato)</option>
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isGenerating}
            className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-liquid-glow disabled:opacity-50"
          >
            {isGenerating ? 'L\'AI sta calcolando il piano...' : 'Elabora Piano Strategico Personalizzato con l\'AI'}
          </button>
        </form>

        {/* Output Piano Generato dall'Intelligenza Artificiale */}
        {aiPlan && (
          <div className="p-4 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-4 font-sans animate-fade-in">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h4 className="font-bold text-sm text-blue-300 font-outfit">
                  Piano Strategico AI Generato
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{aiPlan.summary}</p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-400">
                Obiettivo: {aiPlan.growthNeeded}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs font-mono">
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Crescita Target</span>
                <strong className="text-emerald-400 font-bold">{aiPlan.growthNeeded}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Operazioni Stimate</span>
                <strong className="text-blue-400 font-bold">{aiPlan.estimatedTrades} Trade</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Target Rischio/Resa</span>
                <strong className="text-blue-400 font-bold">{aiPlan.targetRR}</strong>
              </div>
              <div className="p-2 rounded-xl bg-slate-950 border border-slate-800">
                <span className="text-slate-400 block text-[10px]">Rischio / Trade</span>
                <strong className="text-rose-400 font-bold">{aiPlan.riskPerTradeAmount}</strong>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <span className="text-slate-300 font-bold uppercase tracking-wider text-[10px] block">
                Passaggi Tattici Esecutivi dell'AI:
              </span>
              <ul className="space-y-1.5 text-slate-300">
                {aiPlan.actionSteps.map((step, idx) => (
                  <li key={idx} className="bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/80">
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </Card>

      {/* MODAL DETTAGLIATO CON SIMULAZIONE GRAFICA PER LA STRATEGIA */}
      {activeModalStrategy && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#0b0f19] border border-blue-500/40 rounded-3xl p-6 max-w-3xl w-full space-y-6 shadow-2xl relative animate-fade-in max-h-[90vh] overflow-y-auto">
            
            {/* Header Modal */}
            <div className="flex justify-between items-start border-b border-slate-800 pb-4">
              <div>
                <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 uppercase tracking-wider">
                  {activeModalStrategy.tag}
                </span>
                <h3 className="text-xl font-black text-white font-outfit mt-2">
                  {activeModalStrategy.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalStrategy(null)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-rose-600/30 border border-slate-700 hover:border-rose-500/50 text-slate-300 hover:text-rose-300 font-bold flex items-center justify-center transition-all"
              >
                ✕
              </button>
            </div>

            {/* Spiegazione in Parole Semplici */}
            <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-2">
              <span className="text-xs font-bold text-blue-400 uppercase tracking-wider font-outfit block">
                Spiegazione in Parole Semplici:
              </span>
              <p className="text-xs text-slate-200 leading-relaxed font-sans">
                {activeModalStrategy.simpleExplanation}
              </p>
            </div>

            {/* Grafico SVG di Simulazione Operativa */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit block">
                Simulazione Grafica dell'Operazione (Candele OHLC, SL e TP):
              </span>
              
              <div className="w-full h-64 bg-slate-950 rounded-2xl border border-slate-800 p-4 relative overflow-hidden select-none">
                <svg className="w-full h-full" viewBox="0 0 500 200">
                  <line x1="0" y1="40" x2="500" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="100" x2="500" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                  <line x1="0" y1="160" x2="500" y2="160" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                  <line x1="0" y1="100" x2="500" y2="100" stroke="#3b82f6" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="10" y="95" fill="#3b82f6" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Ingresso: ${activeModalStrategy.simulationChart.entryPrice}
                  </text>

                  <line x1="0" y1="30" x2="500" y2="30" stroke="#10b981" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="10" y="25" fill="#10b981" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Take Profit (TP): ${activeModalStrategy.simulationChart.takeProfit}
                  </text>

                  <line x1="0" y1="170" x2="500" y2="170" stroke="#f43f5e" strokeWidth="2" strokeDasharray="6 3" />
                  <text x="10" y="185" fill="#f43f5e" fontSize="10" fontWeight="bold" fontFamily="monospace">
                    Stop Loss (SL): ${activeModalStrategy.simulationChart.stopLoss}
                  </text>

                  {activeModalStrategy.simulationChart.candles.map((c, idx) => {
                    const x = 80 + idx * 90;
                    const isGreen = c.close >= c.open;
                    const color = isGreen ? '#10b981' : '#f43f5e';
                    const mapY = (val) => 180 - ((val - 63500) / 3500) * 150;

                    const highY = Math.max(20, Math.min(180, mapY(c.high)));
                    const lowY = Math.max(20, Math.min(180, mapY(c.low)));
                    const openY = Math.max(20, Math.min(180, mapY(c.open)));
                    const closeY = Math.max(20, Math.min(180, mapY(c.close)));
                    const bodyY = Math.min(openY, closeY);
                    const bodyHeight = Math.max(Math.abs(closeY - openY), 6);

                    return (
                      <g key={idx}>
                        <line x1={x + 15} y1={highY} x2={x + 15} y2={lowY} stroke={color} strokeWidth="2" />
                        <rect x={x} y={bodyY} width="30" height={bodyHeight} fill={color} rx="4" />
                      </g>
                    );
                  })}
                </svg>
              </div>
            </div>

            {/* Regole Esecutive di Ingresso */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit block">
                Checklist di Ingresso a Mercato:
              </span>
              <div className="space-y-1.5 text-xs text-slate-300">
                {activeModalStrategy.entryRules.map((rule, idx) => (
                  <div key={idx} className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                    {rule}
                  </div>
                ))}
              </div>
            </div>

            {/* Pulsante Chiudi Modal */}
            <div className="pt-2 border-t border-slate-800">
              <button
                onClick={() => setActiveModalStrategy(null)}
                className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all"
              >
                Chiudi Analisi Strategia
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};

export default StrategyAiView;
