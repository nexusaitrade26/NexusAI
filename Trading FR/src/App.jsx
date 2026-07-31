import { useState, useEffect } from 'react';
import Navigation from './components/layout/Navigation';
import Header from './components/layout/Header';
import LandingPage from './pages/LandingPage';
import HomePage from './pages/HomePage';
import WorkAreaPage from './pages/WorkAreaPage';
import CapitalStrategyPage from './pages/CapitalStrategyPage';
import LearnPage from './pages/LearnPage';
import CommunityPage from './pages/CommunityPage';
import SettingsPage from './pages/SettingsPage';
import FloatingAiAssistant from './components/common/FloatingAiAssistant';
import ErrorBoundary from './components/common/ErrorBoundary';
import SubscriptionModal from './components/subscription/SubscriptionModal';
import { getActiveUserSession, TRIAL_DURATION_SECONDS } from './services/accountStorage';

function App() {
  // Se non c'è una sessione utente attiva, mostra la Landing Page iniziale
  const [showLandingPage, setShowLandingPage] = useState(() => !getActiveUserSession());

  const [activeTab, setActiveTab] = useState('dashboard');
  const [workAreaSubTab, setWorkAreaSubTab] = useState('trade');
  
  // Tema dinamico dell'account attivo
  const [theme, setTheme] = useState(() => {
    const active = getActiveUserSession();
    return active?.theme || localStorage.getItem('nexus_theme') || 'dark';
  });

  // Gestione Lockout Trial 5 Minuti ed Abbonamenti
  const [activeUser, setActiveUser] = useState(() => getActiveUserSession());
  const [isTrialExpiredLockout, setIsTrialExpiredLockout] = useState(false);
  const [isManualSubscriptionOpen, setIsManualSubscriptionOpen] = useState(false);

  // Verificatore in tempo reale della scadenza dei 5 minuti di trial
  useEffect(() => {
    const monitorTrialLockout = () => {
      const u = getActiveUserSession();
      setActiveUser(u);

      if (!u || showLandingPage) {
        setIsTrialExpiredLockout(false);
        return;
      }

      if (u.subscription?.active) {
        setIsTrialExpiredLockout(false);
        return;
      }

      const startMs = u.trialStartedAt ? new Date(u.trialStartedAt).getTime() : new Date(u.createdAt || Date.now()).getTime();
      const elapsedSec = Math.floor((Date.now() - startMs) / 1000);

      if (elapsedSec >= TRIAL_DURATION_SECONDS) {
        setIsTrialExpiredLockout(true);
      } else {
        setIsTrialExpiredLockout(false);
      }
    };

    monitorTrialLockout();
    const interval = setInterval(monitorTrialLockout, 1000);
    return () => clearInterval(interval);
  }, [showLandingPage]);

  // Ascolta i cambiamenti di account per applicare il tema dell'account corrente
  useEffect(() => {
    const handleStorageChange = () => {
      const active = getActiveUserSession();
      setActiveUser(active);
      if (active?.theme) {
        setTheme(active.theme);
      }
      if (!active) {
        setShowLandingPage(true);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Applicazione live del tema grafico (Scuro, Chiaro, Automatico)
  useEffect(() => {
    localStorage.setItem('nexus_theme', theme);

    const isLightPreference =
      theme === 'light' ||
      (theme === 'system' && window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches);

    if (isLightPreference) {
      document.body.classList.add('nexus-light-theme');
    } else {
      document.body.classList.remove('nexus-light-theme');
    }
  }, [theme]);

  useEffect(() => {
    if (showLandingPage) {
      document.title = 'Nexus AI - Piattaforma Esecutiva di Trading';
    } else if (activeTab === 'dashboard') {
      document.title = 'Dashboard - Nexus AI';
    } else if (activeTab === 'capitale') {
      document.title = 'Gestione Capitale & Strategia - Nexus AI';
    } else if (activeTab === 'studio') {
      document.title = 'Studio - Nexus AI';
    } else if (activeTab === 'community') {
      document.title = 'Community Nexus - Nexus AI';
    } else if (activeTab === 'settings') {
      document.title = 'Impostazioni - Nexus AI';
    }
  }, [activeTab, showLandingPage]);

  const handleSelectTab = (tabId, subTabId) => {
    if (subTabId) {
      setWorkAreaSubTab(subTabId);
      setActiveTab('workarea');
    } else if (tabId === 'workarea') {
      setWorkAreaSubTab('trade');
      setActiveTab('workarea');
    } else {
      setActiveTab(tabId);
    }
  };

  const handleNavigateToPortafolio = () => {
    setWorkAreaSubTab('portafolio');
    setActiveTab('workarea');
  };

  // SE L'UTENTE NON È CONNESSO O VUOLE CONSULTARE LA LANDING PAGE INIZIALE
  if (showLandingPage) {
    return <LandingPage onEnterApp={() => setShowLandingPage(false)} />;
  }

  // ALTRIMENTI MOSTRA LA PIATTAFORMA UFFICIALE DI TRADING
  return (
    <div className="flex flex-col lg:flex-row h-screen bg-[#060913] text-slate-100 font-sans overflow-hidden select-none relative transition-colors duration-300">
      {/* Navigazione Principale */}
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={handleSelectTab} 
        onShowLanding={() => setShowLandingPage(true)}
        onOpenSubscription={() => setIsManualSubscriptionOpen(true)}
      />

      {/* Area Principale di Lavoro */}
      <div className="flex-1 flex flex-col overflow-hidden relative pb-16 lg:pb-0">
        {/* Header con Ticker & Status */}
        <Header />

        {/* Pagine di Primo Livello protette da ErrorBoundary */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <ErrorBoundary>
            {activeTab === 'dashboard' && (
              <HomePage 
                onSelectTab={handleSelectTab} 
                onNavigateToSection={handleSelectTab}
                onNavigateToPortfolio={handleNavigateToPortafolio} 
              />
            )}

            {activeTab === 'workarea' && (
              <WorkAreaPage initialSubTab={workAreaSubTab} />
            )}

            {activeTab === 'capitale' && (
              <CapitalStrategyPage />
            )}

            {activeTab === 'studio' && (
              <LearnPage />
            )}

            {activeTab === 'community' && (
              <CommunityPage />
            )}

            {activeTab === 'settings' && (
              <SettingsPage currentTheme={theme} onThemeChange={(newTheme) => setTheme(newTheme)} />
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* WIDGET FLOTTRANTE FISSO AI IN BASSO A DESTRA (SITO INTERO) */}
      <FloatingAiAssistant activeTab={activeTab} />

      {/* PAYWALL BLOCCO SCADENZA TRIAL 5 MINUTI */}
      <SubscriptionModal
        isOpen={isTrialExpiredLockout || isManualSubscriptionOpen}
        onClose={() => setIsManualSubscriptionOpen(false)}
        activeUser={activeUser}
        isTrialExpired={isTrialExpiredLockout}
        onSubscriptionSuccess={(updatedUser) => {
          setIsTrialExpiredLockout(false);
          setIsManualSubscriptionOpen(false);
          setActiveUser(updatedUser);
        }}
      />
    </div>
  );
}

export default App;
