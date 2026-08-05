import { useState, useEffect, useRef } from 'react';
import { useMarket } from '../../context/MarketContext';
import { useTradingStore } from '../../store/useTradingStore';

const INITIAL_WELCOME = {
  id: 1,
  sender: 'ai',
  text: 'Ciao! Sono Nexus AI, il tuo assistente intelligente. Posso analizzare in tempo reale il tuo portafoglio, guidarti nell\'uso delle sezioni del sito o rispondere alle tue domande. Come posso aiutarti?',
  timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
};

const FloatingAiAssistant = ({ activeTab = 'dashboard' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const chatEndRef = useRef(null);

  const { selectedAsset, getLivePrice } = useMarket();
  const positions = useTradingStore((state) => state.positions) || [];
  const closedTrades = useTradingStore((state) => state.closedTrades) || [];
  const balance = useTradingStore((state) => state.balance) || 10000;
  const activeAiPositionId = useTradingStore((state) => state.activeAiPositionId);
  const setActiveAiPositionId = useTradingStore((state) => state.setActiveAiPositionId);

  const activePosition = positions.find((p) => p && p.id === activeAiPositionId) || positions[0];

  // Calcolo PnL dal vivo
  const openPnl = positions.reduce((acc, p) => {
    const qty = Number(p?.quantity) || 0;
    const entry = Number(p?.entryPrice) || 0;
    const live = Number(getLivePrice(p?.asset)) || entry;
    const isLong = p?.side === 'BUY' || p?.side === 'long' || !p?.side;
    const pnl = isLong ? (live - entry) * qty : (entry - live) * qty;
    return acc + (isNaN(pnl) ? 0 : pnl);
  }, 0);

  const closedPnl = closedTrades.reduce((acc, t) => acc + (Number(t?.pnl) || 0), 0);
  const totalNetPnl = isNaN(openPnl + closedPnl) ? 0 : parseFloat((openPnl + closedPnl).toFixed(2));

  // Gestione Sessioni di Chat e Cronologia salvata
  const [sessions, setSessions] = useState([
    {
      id: 'session-1',
      title: 'Conversazione Nexus AI',
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      messages: [INITIAL_WELCOME]
    }
  ]);
  const [activeSessionId, setActiveSessionId] = useState('session-1');

  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];
  const messages = activeSession?.messages || [INITIAL_WELCOME];

  useEffect(() => {
    if (isOpen && !showHistory) {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isOpen, showHistory]);

  // Crea una nuova sessione di chat
  const handleNewChat = () => {
    const newId = `session-${Date.now()}`;
    const newSession = {
      id: newId,
      title: `Nuova Chat (${new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })})`,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
      messages: [
        {
          id: Date.now(),
          sender: 'ai',
          text: 'Nuova conversazione avviata con Nexus AI! Come posso aiutarti?',
          timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
        }
      ]
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setShowHistory(false);
  };

  // Elimina una chat dalla cronologia
  const handleDeleteSession = (sessionId, e) => {
    e.stopPropagation();
    setSessions((prev) => {
      const filtered = prev.filter((s) => s.id !== sessionId);
      if (filtered.length === 0) {
        const freshId = `session-${Date.now()}`;
        setActiveSessionId(freshId);
        return [
          {
            id: freshId,
            title: 'Conversazione Principale',
            timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
            messages: [INITIAL_WELCOME]
          }
        ];
      }
      if (sessionId === activeSessionId) {
        setActiveSessionId(filtered[0].id);
      }
      return filtered;
    });
  };

  // Invio messaggio a Nexus AI (Risposte mirate e direttamente pertinenti alla domanda)
  const handleSendMessage = (userText) => {
    const textToSend = userText || inputMessage;
    if (!textToSend.trim()) return;

    const userMsgObj = {
      id: Date.now(),
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
    };

    // Aggiorna la sessione attiva
    setSessions((prev) =>
      prev.map((sess) => {
        if (sess.id === activeSessionId) {
          const updatedTitle = sess.title.startsWith('Nuova Chat') ? textToSend.slice(0, 25) + '...' : sess.title;
          return {
            ...sess,
            title: updatedTitle,
            messages: [...sess.messages, userMsgObj]
          };
        }
        return sess;
      })
    );

    if (!userText) setInputMessage('');
    setIsTyping(true);

    // Motore di risposta Nexus AI mirato ed esatto sulla specifica domanda
    setTimeout(() => {
      let aiText = '';
      const q = textToSend.toLowerCase().trim();

      // 1. Domanda specifica su "Area di Lavoro"
      if (q.includes('area di lavoro') || q.includes('lavoro')) {
        aiText = `L'Area di Lavoro è la sezione operativa centrale della piattaforma. Contiene 3 strumenti fondamentali:\n1. Trade: grafico professionale TradingView, analisi intelligente ed esecuzione ordini BUY/SELL su ${selectedAsset}.\n2. Portafolio: gestione del capitale ed elenco live delle posizioni aperte e chiuse.\n3. Journal: diario operativo per registrare la psicologia ed i Tag Emotivi dei tuoi trade.`;
      } 
      // 2. Domanda specifica su "Trade" o "Come aprire ordini"
      else if (q.includes('trade') || q.includes('buy') || q.includes('sell') || q.includes('ordine') || q.includes('aprire')) {
        aiText = `Per eseguire ordini nella sezione Trade:\n1. Vai su Area di Lavoro -> Trade.\n2. Seleziona l'asset dal grafico (es. ${selectedAsset}).\n3. Nel modulo d'ordine imposta la quantità in Lotti ed i livelli di Stop Loss / Take Profit.\n4. Clicca su Esegui BUY o Esegui SELL per inviare l'operazione a mercato.`;
      }
      // 3. Domanda specifica su "Portafoglio" / "Posizioni" / "Analizza Portafoglio"
      else if (q.includes('portafoglio') || q.includes('posizion') || q.includes('analizza')) {
        if (positions.length === 0 && closedTrades.length === 0) {
          aiText = `Nexus AI Analisi: Non hai posizioni aperte né trade chiusi salvati. Il tuo saldo disponibile è $${balance.toLocaleString()}.`;
        } else {
          aiText = `Nexus AI Analisi Portafoglio:\n• Posizioni Aperte: ${positions.length}\n• Trade Chiusi: ${closedTrades.length}\n• P&L Netto Totale: ${totalNetPnl >= 0 ? '+' : ''}$${totalNetPnl.toFixed(2)}\n• Asset Attivo: ${selectedAsset} ($${getLivePrice(selectedAsset)})`;
        }
      }
      // 4. Domanda specifica su "Gestione Capitale" / "Money Management"
      else if (q.includes('gestione capitale') || q.includes('money management') || q.includes('strategia')) {
        aiText = `La sezione Gestione Capitale & Strategia serve a proteggere il conto ed incrementare il saldo su misura:\n• Money Management AI Planner: inserisci il tuo capitale e la perdita massima tollerata per generare il tuo piano esecutivo.\n• Guida Gestione Capitale: calcola matematicamente i Lotti consigliati ed il rapporto Rischio/Resa minimo 1:2.`;
      }
      // 5. Domanda specifica su "Studio" / "Corsi"
      else if (q.includes('studio') || q.includes('corso') || q.includes('lezion')) {
        aiText = `La sezione Studio è il percorso formativo in 30 lezioni suddiviso in 3 livelli:\n• Livello Base (10 lezioni): concetti fondamentali e struttura di mercato.\n• Livello Intermedio (10 lezioni): pattern grafici e gestione del rischio.\n• Livello Avanzato (10 lezioni): Smart Money Concepts (SMC), Order Blocks e liquidità istituzionale.`;
      }
      // 6. Domanda specifica su "Community"
      else if (q.includes('community') || q.includes('forum')) {
        aiText = `La sezione Community è l'hub in arrivo riservato ai trader della piattaforma per condividere le analisi, consultare le classifiche mensili (Leaderboard) e confrontarsi sulle strategie.`;
      }
      // 7. Domanda specifica su "Dashboard"
      else if (q.includes('dashboard')) {
        aiText = `La Dashboard è la pagina principale di sintesi. Mostra i riquadri esecutivi di tutte e 4 le aree principali (Trade, Portafolio, Journal e Studio) con metriche in tempo reale.`;
      }
      // 8. Risposta generica mirata al contesto corrente
      else {
        aiText = `In merito a quanto chiesto: Ti trovi attualmente nella pagina "${activeTab.toUpperCase()}" con l'asset ${selectedAsset} ($${getLivePrice(selectedAsset)}).\n\nPosso rispondere precisamente su qualsiasi sezione del sito, analizzare le tue posizioni aperte o guidarti nell'uso del Money Management.`;
      }

      const aiMsgObj = {
        id: Date.now() + 1,
        sender: 'ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
      };

      setSessions((prev) =>
        prev.map((sess) => {
          if (sess.id === activeSessionId) {
            return {
              ...sess,
              messages: [...sess.messages, aiMsgObj]
            };
          }
          return sess;
        })
      );
      setIsTyping(false);
    }, 800);
  };

  return (
    <>
      {/* 1. PULSANTE FLOTTRANTE FISSO IN BASSO A DESTRA (BADGE PICCOLO TONDO "AI") */}
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-11 h-11 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-black font-outfit text-xs shadow-2xl border border-blue-400/40 flex items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 shadow-liquid-glow relative"
          title="Nexus AI Assistant"
        >
          AI
        </button>
      </div>

      {/* 2. DRAWER DI CHAT FLOTTRANTE COMPATTO CON CRONOLOGIA & NUOVA CHAT */}
      {isOpen && (
        <div className="fixed bottom-16 right-3 sm:right-6 z-50 w-[88vw] sm:w-[330px] h-[390px] sm:h-[410px] bg-[#0b0f19] border border-blue-500/40 rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-fade-in font-sans">
          
          {/* Header Drawer Chat */}
          <div className="p-3 bg-slate-900/90 border-b border-slate-800 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black font-outfit text-[11px] shadow-liquid-glow">
                AI
              </div>
              <div>
                <h4 className="font-bold text-xs text-white font-outfit">Nexus AI</h4>
                <p className="text-[9px] text-blue-400 font-medium truncate max-w-[130px]">
                  {activeTab.toUpperCase()} • {selectedAsset}
                </p>
              </div>
            </div>

            {/* Pulsanti Header: Nuova Chat, Cronologia, Chiudi */}
            <div className="flex items-center gap-1.5">
              <button
                onClick={handleNewChat}
                className="px-2 py-0.5 rounded-md bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 text-[10px] font-bold border border-blue-500/30 transition-all"
              >
                Nuova
              </button>

              <button
                onClick={() => setShowHistory(!showHistory)}
                className={`px-2 py-0.5 rounded-md text-[10px] font-bold border transition-all ${
                  showHistory
                    ? 'bg-blue-600 text-white border-blue-500'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                }`}
              >
                Cronologia
              </button>

              <button
                onClick={() => setIsOpen(false)}
                className="w-6 h-6 rounded-md bg-slate-800 hover:bg-rose-600/30 text-slate-400 hover:text-rose-300 font-bold flex items-center justify-center text-xs transition-all"
              >
                X
              </button>
            </div>
          </div>

          {/* VISTA 1: CRONOLOGIA CHAT SALVATE */}
          {showHistory ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-2 bg-slate-950/80 font-sans">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-outfit">
                  Cronologia Conversazioni ({sessions.length})
                </span>
                <span className="text-[10px] text-slate-500 font-medium font-outfit">Nexus AI</span>
              </div>

              {sessions.map((sess) => {
                const isActive = sess.id === activeSessionId;
                return (
                  <div
                    key={sess.id}
                    onClick={() => {
                      setActiveSessionId(sess.id);
                      setShowHistory(false);
                    }}
                    className={`p-3 rounded-2xl border flex justify-between items-center cursor-pointer transition-all ${
                      isActive
                        ? 'bg-blue-950/30 border-blue-500 text-white'
                        : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex-1 min-w-0 pr-2">
                      <h5 className="text-xs font-bold truncate">{sess.title}</h5>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {sess.timestamp} • {sess.messages.length} Messaggi
                      </span>
                    </div>

                    <button
                      onClick={(e) => handleDeleteSession(sess.id, e)}
                      title="Elimina Chat"
                      className="px-2 py-1 rounded-lg bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 text-[10px] font-bold transition-all"
                    >
                      Elimina
                    </button>
                  </div>
                );
              })}
            </div>
          ) : (
            /* VISTA 2: FINESTRA CHAT ATTIVA */
            <>
              <div className="flex-1 p-4 overflow-y-auto space-y-3 text-xs no-scrollbar bg-slate-950/60">
                {messages.map((msg) => {
                  const isAi = msg.sender === 'ai';
                  return (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                    >
                      <div
                        className={`max-w-[85%] p-3 rounded-2xl leading-relaxed whitespace-pre-line ${
                          isAi
                            ? 'bg-slate-900 border border-slate-800 text-slate-200 rounded-tl-none'
                            : 'bg-blue-600 text-white font-medium rounded-tr-none shadow-liquid-glow'
                        }`}
                      >
                        {msg.text}
                      </div>
                      <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                    </div>
                  );
                })}

                {isTyping && (
                  <div className="flex items-center gap-2 text-slate-400 text-xs italic">
                    <span className="w-2 h-2 rounded-full bg-blue-500 animate-ping"></span>
                    Nexus AI sta elaborando la risposta...
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              {/* Chips Domande Rapide */}
              <div className="p-2 bg-slate-900/40 border-t border-slate-800/60 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                <button
                  onClick={() => handleSendMessage('A cosa serve l\'Area di Lavoro?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700 text-[10px] whitespace-nowrap font-medium transition-all"
                >
                  Area di Lavoro
                </button>
                <button
                  onClick={() => handleSendMessage('Analizza il mio portafoglio')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700 text-[10px] whitespace-nowrap font-medium transition-all"
                >
                  Analizza Portafoglio
                </button>
                <button
                  onClick={() => handleSendMessage('A cosa serve la sezione Studio?')}
                  className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-blue-600/20 text-slate-300 hover:text-blue-400 border border-slate-700 text-[10px] whitespace-nowrap font-medium transition-all"
                >
                  Sezione Studio
                </button>
              </div>

              {/* Form Input Messaggio */}
              <div className="p-3 bg-slate-900 border-t border-slate-800">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSendMessage();
                  }}
                  className="flex items-center gap-2"
                >
                  <input
                    type="text"
                    value={inputMessage}
                    onChange={(e) => setInputMessage(e.target.value)}
                    placeholder="Chiedi a Nexus AI..."
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow"
                  >
                    Invia
                  </button>
                </form>
              </div>
            </>
          )}

        </div>
      )}
    </>
  );
};

export default FloatingAiAssistant;
