import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { generateTradingPrompt } from '../../services/aiPromptBuilder';

const CopilotChat = () => {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: 'Ciao! Sono il tuo AI Trading Copilot. Dimmi quale asset vuoi analizzare o chiedimi una strategia operativa.'
    }
  ]);
  const [input, setInput] = useState('');

  const handleSend = () => {
    if (!input.trim()) return;
    
    // Aggiungi messaggio utente
    const userMsg = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    // Qui andrebbe la chiamata reale API (es. OpenAI). Simulo la risposta:
    setTimeout(() => {
      const mockPromptGenerato = generateTradingPrompt('AAPL', '1D', '150.00', userMsg.content);
      console.log('Prompt inviato all\'AI:', mockPromptGenerato);

      const aiMsg = {
        role: 'assistant',
        content: `**Setup Operativo Suggerito (Mock)**\n\n1. **Entry Point**: 150.00$ (Acquisto al mercato)\n2. **Stop-Loss**: 145.00$ (Se il prezzo scende sotto questo livello, chiudiamo per limitare le perdite)\n3. **Take-Profit**: 160.00$ (Obiettivo di guadagno)\n4. **Rapporto Rischio/Rendimento**: 1:2 (Rischiamo 5$ per guadagnarne 10$)\n\n*Spiegazione*: Il prezzo si trova su un importante supporto. L'indicatore RSI mostra che il titolo non è ipercomprato, c'è spazio per una crescita a breve termine.`
      };
      setMessages(prev => [...prev, aiMsg]);
    }, 1500);
  };

  return (
    <div className="bg-slate-800 rounded-xl border border-slate-700 h-full flex flex-col">
      <div className="p-4 border-b border-slate-700 flex items-center gap-2">
        <Bot className="text-blue-500" />
        <h3 className="font-semibold text-slate-50">AI Trading Copilot</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-600' : 'bg-blue-600'}`}>
              {msg.role === 'user' ? <User size={16} /> : <Bot size={16} />}
            </div>
            <div className={`p-3 rounded-lg text-sm max-w-[80%] whitespace-pre-wrap ${msg.role === 'user' ? 'bg-slate-700 text-slate-50' : 'bg-blue-900/30 text-slate-200 border border-blue-800/50'}`}>
              {msg.content}
            </div>
          </div>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-700">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Chiedi all'AI..."
            className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-sm text-slate-50 focus:outline-none focus:border-blue-500 transition-colors"
          />
          <button 
            onClick={handleSend}
            className="bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg transition-colors"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CopilotChat;
