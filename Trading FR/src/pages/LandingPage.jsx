import { useState } from 'react';
import AuthModal from '../components/auth/AuthModal';

const LandingPage = ({ onEnterApp }) => {
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  const handleLaunchAuth = () => {
    setIsAuthOpen(true);
  };

  return (
    <div className="min-h-screen bg-[#060913] text-slate-100 font-sans selection:bg-blue-600 selection:text-white relative overflow-x-hidden">
      
      {/* BACKGROUND GLOW EFFECTS */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-blue-600/15 rounded-full blur-[140px] pointer-events-none"></div>
      <div className="absolute top-1/3 right-10 w-[500px] h-[500px] bg-indigo-600/10 rounded-full blur-[160px] pointer-events-none"></div>

      {/* 1. HEADER LANDING PAGE (LOGO + PULSANTE UNICO 'ENTRA NELLA PIATTAFORMA') */}
      <header className="max-w-7xl mx-auto px-4 sm:px-8 py-6 flex items-center justify-between relative z-20">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black font-outfit text-lg shadow-liquid-glow">
            N
          </div>
          <div>
            <h1 className="text-xl font-black font-outfit tracking-tight text-white">
              Nexus <span className="text-blue-500">AI</span>
            </h1>
            <span className="text-[10px] text-slate-400 font-semibold block -mt-1">Trading Suite & Intelligence</span>
          </div>
        </div>

        {/* Pulsante Unico Header: Entra nella Piattaforma */}
        <div>
          <button
            onClick={handleLaunchAuth}
            className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs transition-all shadow-liquid-glow flex items-center gap-2 hover:scale-105"
          >
            <span>Entra nella Piattaforma</span>
            <span>→</span>
          </button>
        </div>
      </header>

      {/* 2. HERO SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 pt-12 pb-20 relative z-10 text-center space-y-8">
        
        <h2 className="text-4xl sm:text-6xl lg:text-7xl font-black font-outfit tracking-tight text-white leading-tight max-w-5xl mx-auto">
          Il Trading Professionale Potenziato dall'<span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-emerald-400">Intelligenza Artificiale</span>
        </h2>

        {/* Descrizione Pulita senza la dicitura copy trading */}
        <p className="text-slate-300 text-sm sm:text-lg max-w-3xl mx-auto font-normal leading-relaxed">
          Nexus AI combina l'analisi tecnica di TradingView, le strategie Smart Money Concepts (SMC), la gestione del rischio avanzata ed una suite esecutiva potenziata dall'Intelligenza Artificiale.
        </p>

        {/* CTA Hero Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
          <button
            onClick={handleLaunchAuth}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black font-outfit text-sm uppercase tracking-wider transition-all shadow-liquid-glow hover:scale-105"
          >
            Accedi / Registrati alla Piattaforma
          </button>
        </div>

        {/* PREVIEW INTERATTIVA / DEMO PREVIEW */}
        <div className="pt-10 max-w-5xl mx-auto">
          <div className="p-3 sm:p-4 rounded-3xl bg-slate-900/90 border border-blue-500/30 shadow-2xl backdrop-blur-xl relative group">
            <div className="flex items-center justify-between px-4 py-2 border-b border-slate-800/80 mb-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-amber-500/80"></span>
                <span className="w-3 h-3 rounded-full bg-emerald-500/80"></span>
                <span className="text-slate-400 font-mono text-[11px] ml-2">nexus-app://workspace/btc-usd</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-bold text-[10px]">
                Live Market Engine Active
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-left p-2">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Segnale Nexus AI</span>
                <strong className="text-emerald-400 font-bold block">BUY CONFIRMED @ $64,200</strong>
                <p className="text-slate-400 text-xs">Confluenza SMC & Rischio 1:3 R/R.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Target Take Profit</span>
                <strong className="text-blue-400 font-bold block">$66,500 (Risk/Reward 1:3)</strong>
                <p className="text-slate-400 text-xs">Trailing Stop automatico attivo.</p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 space-y-2">
                <span className="text-slate-400 text-[10px] uppercase font-bold block">Community Nexus</span>
                <strong className="text-purple-400 font-bold block">28 Trader Hanno Copiato</strong>
                <p className="text-slate-400 text-xs">Social Feed & Copy Trading.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. METRICHE PRINCIPALI */}
      <section className="border-y border-slate-800/80 bg-slate-950/60 py-12 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-8 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
          <div>
            <p className="text-3xl sm:text-4xl font-black font-outfit text-white">$10M+</p>
            <span className="text-xs text-slate-400 font-medium block mt-1">Volume Operativo Eseguito</span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black font-outfit text-blue-400">50+</p>
            <span className="text-xs text-slate-400 font-medium block mt-1">Classifica Trader Verificati</span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black font-outfit text-emerald-400">84.2%</p>
            <span className="text-xs text-slate-400 font-medium block mt-1">Tasso di Successo Algoritmi</span>
          </div>
          <div>
            <p className="text-3xl sm:text-4xl font-black font-outfit text-purple-400">26 Lezioni</p>
            <span className="text-xs text-slate-400 font-medium block mt-1">Corso SMC Completo (Studio)</span>
          </div>
        </div>
      </section>

      {/* 4. TUTORIAL IN 4 PASSAGGI VISUALI */}
      <section className="max-w-7xl mx-auto px-4 sm:px-8 py-20 relative z-10 space-y-12">
        <div className="text-center space-y-3">
          <h3 className="text-3xl sm:text-4xl font-black font-outfit text-white">
            Come Funziona la Piattaforma Nexus AI
          </h3>
          <p className="text-slate-400 text-sm max-w-2xl mx-auto">
            4 semplici passaggi per sfruttare l'intelligenza artificiale, la community ed i grafici TradingView.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-blue-600/20 text-blue-400 flex items-center justify-center font-black font-outfit text-sm border border-blue-500/30">1</span>
            <h4 className="font-bold text-white text-base font-outfit">Registra il tuo Account</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Crea il tuo profilo personale riservato ed accedi subito alla suite di trading con $10,000.00 di capitale demo.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center font-black font-outfit text-sm border border-indigo-500/30">2</span>
            <h4 className="font-bold text-white text-base font-outfit">Analizza & Opera</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Sfrutta l'Area di Lavoro con grafici TradingView avanzati, il diario Journal e la calcolatrice della posizione.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-purple-600/20 text-purple-400 flex items-center justify-center font-black font-outfit text-sm border border-purple-500/30">3</span>
            <h4 className="font-bold text-white text-base font-outfit">Community & Copy Trading</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Esplora la classifica dei 50 trader verificati, condividi i tuoi report o copia singole operazioni specificando il capitale.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
            <span className="w-8 h-8 rounded-xl bg-emerald-600/20 text-emerald-400 flex items-center justify-center font-black font-outfit text-sm border border-emerald-500/30">4</span>
            <h4 className="font-bold text-white text-base font-outfit">Assistente AI Nexus</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Utilizza il badge AI sempre presente per chiedere analisi di mercato, piani di trading ed impostare alert personalizzati.
            </p>
          </div>
        </div>
      </section>

      {/* FOOTER LANDING PAGE */}
      <footer className="border-t border-slate-800/80 py-8 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 Nexus AI - Piattaforma Esecutiva di Trading. Tutti i diritti riservati.</p>
      </footer>

      {/* MODAL AUTENTICAZIONE / REGISTRAZIONE */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={null}
        onUserChange={(user) => {
          if (user) {
            onEnterApp();
          }
        }}
      />

    </div>
  );
};

export default LandingPage;
