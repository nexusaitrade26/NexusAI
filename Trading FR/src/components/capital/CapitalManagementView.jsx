import { useState } from 'react';
import Card from '../common/Card';
import SectionHeader from '../common/SectionHeader';

const CapitalManagementView = () => {
  // Sotto-menu interno: prima 'money_management', poi 'guida'
  const [activeSubMenu, setActiveSubMenu] = useState('money_management');

  // Stato per Calcolatore Position Sizing (in Guida)
  const [capital, setCapital] = useState('10000');
  const [riskPercent, setRiskPercent] = useState('1.5');
  const [stopLossPips, setStopLossPips] = useState('200');

  const numCapital = parseFloat(capital) || 10000;
  const numRisk = parseFloat(riskPercent) || 1.5;
  const numSlPips = parseFloat(stopLossPips) || 200;

  const maxRiskAmount = (numCapital * (numRisk / 100)).toFixed(2);
  const calculatedLot = (maxRiskAmount / numSlPips).toFixed(4);

  // Stato per Money Management AI Planner
  const [mmCapital, setMmCapital] = useState('10000');
  const [mmMaxLoss, setMmMaxLoss] = useState('1000');
  const [mmDifficulty, setMmDifficulty] = useState('Intermedio (Bilanciato)');
  const [mmPlan, setMmPlan] = useState(null);
  const [isGeneratingMm, setIsGeneratingMm] = useState(false);

  const handleGenerateMmPlan = (e) => {
    e.preventDefault();
    setIsGeneratingMm(true);
    setMmPlan(null);

    setTimeout(() => {
      const cap = parseFloat(mmCapital) || 10000;
      const maxLoss = parseFloat(mmMaxLoss) || 1000;
      const maxLossPct = ((maxLoss / cap) * 100).toFixed(1);

      let riskPerTrade = 1.5;
      let maxPositions = 2;
      let studyLessons = [];

      if (mmDifficulty.includes('Principiante')) {
        riskPerTrade = 0.5;
        maxPositions = 1;
        studyLessons = [
          'Lezione 1-3: Basi del Trading, Struttura del Mercato e Lettura delle Candele.',
          'Lezione 4-6: Concetto di Supporto, Resistenza e Trend Primario.',
          'Lezione 7-10: Principi di Conservazione del Capitale e Posizionamento dello Stop Loss.'
        ];
      } else if (mmDifficulty.includes('Intermedio')) {
        riskPerTrade = 1.5;
        maxPositions = 2;
        studyLessons = [
          'Lezione 11-15: Pattern Grafici Istituzionali e Breakout Confermato con Retest.',
          'Lezione 16-20: Utilizzo dei Rintracciamenti di Fibonacci ed Indicatori di Volatilità.',
          'Lezione 21-25: Psicologia Operativa, Gestione dello Stress e Tag Emotivo del Diario.'
        ];
      } else {
        riskPerTrade = 2.5;
        maxPositions = 3;
        studyLessons = [
          'Lezione 21-25: Smart Money Concepts (SMC), Liquidity Grab e Fair Value Gaps (FVG).',
          'Lezione 26-28: Identificazione degli Order Blocks Istituzionali e Ingressi ad Alta Precisione.',
          'Lezione 29-30: Scaling Avanzato delle Posizioni, Hedging e Ottimizzazione del Rischio Multimercato.'
        ];
      }

      const riskPerTradeDollars = (cap * (riskPerTrade / 100)).toFixed(2);

      setMmPlan({
        capital: cap,
        maxLoss: maxLoss,
        maxLossPct: maxLossPct,
        difficulty: mmDifficulty,
        riskPerTradePct: `${riskPerTrade}%`,
        riskPerTradeDollars: `$${riskPerTradeDollars}`,
        maxOpenPositions: maxPositions,
        studyLessons,
        capitalStrategy: [
          `Dimensionamento Posizione: Rischio monetario massimo per operazione pari a $${riskPerTradeDollars} (${riskPerTrade}% del capitale disponibile).`,
          `Esposizione Contemporanea: Limite massimo di ${maxPositions} ${maxPositions === 1 ? 'posizione aperta' : 'posizioni aperte in simultanea'} per evitare sovraesposizione.`,
          `Freno di Emergenza: In caso di perdita cumulativa pari a $${maxLoss} (${maxLossPct}% del capitale), sospendere le operazioni per almeno 48 ore.`,
          `Protezione del Capitale (Break Even): Spostare lo Stop Loss sul prezzo d'ingresso non appena la posizione raggiunge un guadagno di +1.5R.`
        ],
        chartAiGuidance: [
          'Analisi del Grafico con l\'AI: Nella sezione Trade, seleziona l\'asset ed utilizza il riquadro Analisi AI per ottenere il quadro di mercato in tempo reale.',
          'Conferma della Struttura: Verifica se l\'AI individua una tendenza rialzista o ribassista prima di posizionare ordini in BUY o SELL.',
          'Validazione dei Livelli: Utilizza i consigli dell\'AI per confermare l\'ubicazione di Stop Loss e Take Profit rispetto alle notizie ed al contesto di mercato.'
        ],
        financialRoadmap: [
          'Fase 1 (Settimana 1-2): Esegui esclusivamente operazioni con rischio fisso impostato a $'+riskPerTradeDollars+' e registra ogni operazione nel Diario.',
          'Fase 2 (Settimana 3-4): Valuta il rapporto vincite/perdite. Se il Win Rate supera il 50%, mantieni la stessa size ed applica l\'incasso parziale dei profitti.',
          'Fase 3 (Audit Mensile): Controlla la resa ROI totale ed il Tag Emotivo del Diario per verificare che la disciplina sia stata rispettata.'
        ]
      });

      setIsGeneratingMm(false);
    }, 1200);
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Gestione del Capitale & Money Management"
        subtitle="Genera il tuo piano integrato di Money Management con l'AI oppure consulta la Guida Operativa di Gestione Capitale."
      />

      {/* Sotto-Menu Interno: 1) Money Management AI Planner, 2) Guida Gestione del Capitale */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveSubMenu('money_management')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            activeSubMenu === 'money_management'
              ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Money Management AI Planner
        </button>

        <button
          onClick={() => setActiveSubMenu('guida')}
          className={`px-4 py-2 rounded-xl font-bold text-xs transition-all ${
            activeSubMenu === 'guida'
              ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
              : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
          }`}
        >
          Guida Gestione del Capitale
        </button>
      </div>

      {/* ================= SOTTO-MENU 1: MONEY MANAGEMENT AI PLANNER ================= */}
      {activeSubMenu === 'money_management' && (
        <div className="space-y-6 animate-fade-in">
          <Card className="border-blue-500/30 space-y-5">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                  Pianificatore Personale Money Management AI
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Inserisci i tuoi dati per generare un piano operativo personalizzato su misura.
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                Pianificazione Su Misura
              </span>
            </div>

            <form onSubmit={handleGenerateMmPlan} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Capitale Disponibile ($)</label>
                  <input
                    type="number"
                    required
                    value={mmCapital}
                    onChange={(e) => setMmCapital(e.target.value)}
                    placeholder="es. 10000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Massima Perdita Tollerata ($)</label>
                  <input
                    type="number"
                    required
                    value={mmMaxLoss}
                    onChange={(e) => setMmMaxLoss(e.target.value)}
                    placeholder="es. 1000"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Livello di Difficoltà Operativa</label>
                  <select
                    value={mmDifficulty}
                    onChange={(e) => setMmDifficulty(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Principiante (Bassa Volatilità)">Principiante (Bassa Volatilità - Conservativo)</option>
                    <option value="Intermedio (Bilanciato)">Intermedio (Bilanciato - Crescita Regolare)</option>
                    <option value="Avanzato / Pro (Alta Efficienza)">Avanzato / Pro (Alta Efficienza - Scalper/SMC)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                disabled={isGeneratingMm}
                className="w-full py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-black text-xs uppercase tracking-wider transition-all duration-200 shadow-liquid-glow disabled:opacity-50"
              >
                {isGeneratingMm ? 'L\'AI sta elaborando il piano integrato...' : 'Elabora Piano Integrato Money Management AI'}
              </button>
            </form>

            {/* Output Piano Ampio e Dettagliato Generato dall'AI */}
            {mmPlan && (
              <div className="p-6 rounded-2xl bg-slate-900/90 border border-blue-500/40 space-y-6 animate-fade-in font-sans">
                
                {/* Header Sintesi Piano */}
                <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                  <div>
                    <h4 className="font-bold text-base text-blue-300 font-outfit">
                      Piano Integrato Personalizzato di Money Management & Studio
                    </h4>
                    <p className="text-xs text-slate-400 mt-1">
                      Capitale: ${mmPlan.capital.toLocaleString()} | Perdita Max: ${mmPlan.maxLoss.toLocaleString()} ({mmPlan.maxLossPct}%) | Profilo: {mmPlan.difficulty}
                    </p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-xs font-bold text-emerald-400 font-mono">
                    Protezione Attiva
                  </span>
                </div>

                {/* Metriche operative a colonna */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center text-xs font-mono">
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Rischio / Operazione</span>
                    <strong className="text-blue-400 font-bold text-sm">{mmPlan.riskPerTradeDollars} ({mmPlan.riskPerTradePct})</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Posizioni Simultanee Max</span>
                    <strong className="text-emerald-400 font-bold text-sm">{mmPlan.maxOpenPositions} Posizione</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Stop Emergenza Loss</span>
                    <strong className="text-rose-400 font-bold text-sm">${mmPlan.maxLoss}</strong>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Rapporto R:R Target</span>
                    <strong className="text-purple-400 font-bold text-sm">1 : 2.5 Minimo</strong>
                  </div>
                </div>

                {/* MODULO 1: PIANO FORMATIVO & STUDIO PERSONALIZZATO */}
                <div className="p-4 rounded-xl bg-slate-950 border border-blue-500/30 space-y-2">
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-outfit">
                    Modulo 1: Percorso Formativo consigliato nella Sezione Studio
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    {mmPlan.studyLessons.map((item, idx) => (
                      <div key={idx} className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800">
                        {item}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODULO 2: PROTOCOLLO GESTIONE DEL CAPITALE & SIZING */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-outfit">
                    Modulo 2: Regole Rigide di Capitale & Dimensionamento Posizione
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    {mmPlan.capitalStrategy.map((rule, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                        {rule}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODULO 3: GUIDA ALL'ANALISI DEI GRAFICI CON L'AI */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-blue-400 uppercase tracking-wider font-outfit">
                    Modulo 3: Supporto dell'AI nell'Analisi dei Grafici & Operatività Trade
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    {mmPlan.chartAiGuidance.map((guide, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                        {guide}
                      </div>
                    ))}
                  </div>
                </div>

                {/* MODULO 4: ROADMAP FINANZIARIA PASSO-PASSO */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-emerald-400 uppercase tracking-wider font-outfit">
                    Modulo 4: Roadmap Finanziaria Esecutiva
                  </h5>
                  <div className="space-y-2 text-xs text-slate-300">
                    {mmPlan.financialRoadmap.map((step, idx) => (
                      <div key={idx} className="p-3 rounded-xl bg-slate-950 border border-slate-800 leading-relaxed">
                        {step}
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}
          </Card>
        </div>
      )}

      {/* ================= SOTTO-MENU 2: GUIDA GESTIONE DEL CAPITALE ================= */}
      {activeSubMenu === 'guida' && (
        <div className="space-y-6 animate-fade-in">
          {/* Riquadro Calcolatore Position Sizing */}
          <Card className="border-blue-500/30 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-800 pb-3 gap-2">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                  Calcolatore Interattivo di Position Sizing & Margine
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Calcola matematicamente l'ammontare massimo da rischiare ed la dimensione esatta in lotti.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                Formula Istituzionale
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Capitale Totale ($)</label>
                <input
                  type="number"
                  value={capital}
                  onChange={(e) => setCapital(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Rischio per Trade (%)</label>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Distanza Stop Loss ($ / pips)</label>
                <input
                  type="number"
                  value={stopLossPips}
                  onChange={(e) => setStopLossPips(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-mono font-bold focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-blue-500/20 flex justify-between items-center">
                <span className="text-xs text-slate-300 font-medium">Rischio Massimo Consentito:</span>
                <strong className="text-sm font-mono font-black text-rose-400">${maxRiskAmount}</strong>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-emerald-500/20 flex justify-between items-center">
                <span className="text-xs text-slate-300 font-medium">Dimensione Posizione Consigliata:</span>
                <strong className="text-sm font-mono font-black text-emerald-400">{calculatedLot} Lotti</strong>
              </div>
            </div>
          </Card>

          {/* Matrice Risk / Reward */}
          <Card className="border-blue-500/30 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                  La Matrice del Vantaggio Statistico (Risk / Reward)
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
                Matematica Istituzionale
              </span>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              Non serve indovinare il 90% delle operazioni per essere in guadagno. Con un rapporto Risk/Reward di <strong>1:3</strong>, ti basta vincere solo 4 operazioni su 10 (Win Rate del 40%) per chiudere in netto profitto!
            </p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-2">Rapporto R:R</th>
                    <th className="pb-2">Win Rate Necessario</th>
                    <th className="pb-2">Risultato su 10 Operazioni ($100 a rischio)</th>
                    <th className="pb-2 text-right">Profitto Netto Finale</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono text-slate-300">
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-100">1 : 1</td>
                    <td className="py-2.5 text-rose-400 font-bold">55% Minimum</td>
                    <td className="py-2.5">5 Vinte (+$500) | 5 Perse (-$500)</td>
                    <td className="py-2.5 text-right font-bold text-slate-400">$0.00 (Pareggio)</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30">
                    <td className="py-2.5 font-bold text-slate-100">1 : 2</td>
                    <td className="py-2.5 text-emerald-400 font-bold">40% Minimum</td>
                    <td className="py-2.5">4 Vinte (+$800) | 6 Perse (-$600)</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">+$200.00</td>
                  </tr>
                  <tr className="hover:bg-slate-800/30 bg-blue-950/20">
                    <td className="py-2.5 font-bold text-blue-400">1 : 3 (Consigliato)</td>
                    <td className="py-2.5 text-emerald-400 font-bold">30% Minimum</td>
                    <td className="py-2.5">4 Vinte (+$1,200) | 6 Perse (-$600)</td>
                    <td className="py-2.5 text-right font-bold text-emerald-400">+$600.00</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card>

          {/* Grid DOs & DON'Ts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-emerald-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider font-outfit">
                  Cosa FARE (Linee Guida Vincenti)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-bold text-emerald-300">
                  Protocollo Operativo
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 font-bold block">1. Calcola il rischio PRIMA dell'ingresso</strong>
                  <p className="text-slate-400">Non inserire mai un ordine a mercato senza conoscere l'esatto ammontare in dollari a rischio.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 font-bold block">2. Mantieni un Rapporto Risk/Reward minimo di 1:2</strong>
                  <p className="text-slate-400">Punta ad incassare almeno $200 per ogni $100 che decidi di mettere a rischio sul mercato.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 font-bold block">3. Imposta sempre uno Stop Loss Tecnico</strong>
                  <p className="text-slate-400">Posiziona lo Stop Loss su livelli strutturali di supporto o resistenza, mai su numeri casuali.</p>
                </div>
                <div className="p-3 rounded-xl bg-emerald-950/20 border border-emerald-500/20 space-y-1">
                  <strong className="text-emerald-300 font-bold block">4. Gestione della Posizione: Break Even & Scaling Out</strong>
                  <p className="text-slate-400">Sposta lo Stop Loss sul prezzo d'ingresso non appena raggiungi +1.5R per proteggere la posizione gratis.</p>
                </div>
              </div>
            </Card>

            <Card className="border-rose-500/30 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-sm font-bold text-rose-400 uppercase tracking-wider font-outfit">
                  Cosa NON FARE (Errori Fatali)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-rose-500/10 border border-rose-500/30 text-[10px] font-bold text-rose-300">
                  Da Evitare Assolutamente
                </span>
              </div>

              <div className="space-y-3 text-xs text-slate-300">
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 font-bold block">1. Revenge Trading (Vendetta sul Mercato)</strong>
                  <p className="text-slate-400">Non cercare di recuperare immediatamente una perdita aumentando la size della posizione successiva.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 font-bold block">2. Spostare o Rimuovere lo Stop Loss durante il trade</strong>
                  <p className="text-slate-400">Allontanare lo Stop Loss in perdita è il motivo principale di azzeramento del capitale.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 font-bold block">3. Martingala e Raddoppio della Leva</strong>
                  <p className="text-slate-400">Non aggiungere posizioni a favore di un trade che sta andando in perdita sperando nel rimbalzo.</p>
                </div>
                <div className="p-3 rounded-xl bg-rose-950/20 border border-rose-500/20 space-y-1">
                  <strong className="text-rose-300 font-bold block">4. Entrate d'Impulso da FOMO</strong>
                  <p className="text-slate-400">Non rincorrere le candele verdi o rosse esplosive quando il movimento è già iniziato.</p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
};

export default CapitalManagementView;
