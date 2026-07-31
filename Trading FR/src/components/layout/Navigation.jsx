import { useState, useEffect } from 'react';
import AuthModal from '../auth/AuthModal';
import { getActiveUserSession } from '../../services/accountStorage';
import { useTradingStore } from '../../store/useTradingStore';

const Navigation = ({ activeTab, setActiveTab, onShowLanding, onOpenSubscription }) => {
  const [currentUser, setCurrentUser] = useState(() => getActiveUserSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  // Ascolta in tempo reale qualsiasi evento di aggiornamento utente/abbonamento
  useEffect(() => {
    const handleUserSync = () => {
      const active = getActiveUserSession();
      setCurrentUser(active);
    };

    window.addEventListener('nexus_user_updated', handleUserSync);
    window.addEventListener('storage', handleUserSync);
    return () => {
      window.removeEventListener('nexus_user_updated', handleUserSync);
      window.removeEventListener('storage', handleUserSync);
    };
  }, []);

  const handleUserChange = (user) => {
    setCurrentUser(user);
    useTradingStore.getState().loadActiveUserStore();
    if (!user && onShowLanding) {
      onShowLanding();
    }
  };

  const mainNavItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workarea', label: 'Area di Lavoro' },
    { id: 'capitale', label: 'Gestione Capitale & Strategia' },
    { id: 'studio', label: 'Studio' },
    { id: 'community', label: 'Community Nexus' },
  ];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 glass-panel border-t border-slate-800/80 px-2 sm:px-4 py-2 sm:py-3 z-30 lg:static lg:border-t-0 lg:border-r lg:w-64 lg:p-6 flex lg:flex-col justify-between shadow-2xl transition-colors font-sans">
        
        {/* Brand Header (Desktop) - PRO BADGE E NOME PIANO ESCLUSIVAMENTE QUI */}
        <div className="hidden lg:block space-y-1 mb-8">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-black font-outfit tracking-tight text-white">
              Nexus <span className="text-blue-500">AI</span>
            </h1>
            {currentUser?.subscription?.active && (
              <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400 shadow-liquid-glow">
                PRO
              </span>
            )}
          </div>
          <p className="text-[11px] text-slate-400 font-medium">
            {currentUser?.subscription?.active
              ? `${currentUser.subscription.plan}`
              : 'Trading Suite & Intelligence'}
          </p>
        </div>

        {/* Main Navigation Menu (Mobile & Desktop Responsive) */}
        <div className="flex lg:flex-col items-center lg:items-stretch justify-around w-full gap-1 sm:gap-2">
          {mainNavItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 sm:px-4 sm:py-3 lg:px-5 lg:py-3.5 rounded-xl sm:rounded-2xl font-bold text-[11px] sm:text-xs lg:text-sm transition-all duration-200 text-center lg:text-left flex-1 lg:flex-initial ${
                  isActive
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-liquid-glow'
                    : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 border border-slate-800/80'
                }`}
              >
                {item.label}
              </button>
            );
          })}

          {/* Pulsante Account per Mobile con Avatar Maschile / Femminile Circolare */}
          <button
            type="button"
            onClick={() => setIsAuthOpen(true)}
            className="lg:hidden flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-blue-600/20 border border-blue-500/40 text-blue-400 font-bold text-[11px]"
          >
            <div className="w-5 h-5 rounded-full overflow-hidden shrink-0 border border-blue-500/40 bg-slate-900 flex items-center justify-center">
              <img
                src={currentUser?.gender === 'Femminile' ? '/avatars/avatar_female.png' : '/avatars/avatar_male.png'}
                alt="Avatar Utente"
                className="w-full h-full object-cover scale-125 rounded-full"
              />
            </div>
            <span className="truncate max-w-[60px] sm:max-w-none">
              {currentUser?.username || 'Accedi / Registrati'}
            </span>
          </button>
        </div>

        {/* RIQUADRO DESKTOP: IMPOSTAZIONI & ACCOUNT UTENTE REALE IN BASSO A SINISTRA */}
        <div className="hidden lg:block mt-auto pt-6 border-t border-slate-800/80 space-y-3">
          
          {/* Tasto Impostazioni */}
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-start gap-2.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
                : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 border border-slate-800'
            }`}
          >
            <svg className="w-4 h-4 fill-current text-blue-400" viewBox="0 0 24 24">
              <path d="M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0-.44-.17.47-.41l.36-2.54c.59-.24 1.13-.56 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6-3.6z"/>
            </svg>
            <span>Impostazioni</span>
          </button>

          {/* Riquadro Account Utente Reale Registrato con Avatar Maschile / Femminile Circolare */}
          <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-blue-500/30 shadow-liquid-glow">
            <div className="flex justify-between items-center mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 font-outfit">
                Account Utente
              </span>
              {currentUser?.subscription?.active && (
                <span className="px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 text-[9px] font-black uppercase border border-blue-500/40">
                  PRO
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setIsAuthOpen(true)}
              className="w-full flex items-center gap-3 p-2 rounded-xl bg-slate-800/60 hover:bg-blue-600/20 border border-slate-700/80 hover:border-blue-500/40 transition-all text-left group"
            >
              {/* AVATAR CIRCOLARE SENZA BORDI QUADRATI (MASCHILE / FEMMINILE) */}
              <div className="w-10 h-10 rounded-full overflow-hidden shrink-0 border border-blue-500/40 bg-slate-900 shadow-liquid-glow group-hover:scale-105 transition-transform">
                <img
                  src={currentUser?.gender === 'Femminile' ? '/avatars/avatar_female.png' : '/avatars/avatar_male.png'}
                  alt={currentUser?.username || 'Avatar Utente'}
                  className="w-full h-full object-cover scale-125 rounded-full"
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentUser?.username || 'Accedi / Registrati'}
                </p>
                
                {currentUser ? (
                  currentUser.subscription?.active ? (
                    <div className="space-y-0.5 mt-0.5">
                      <p className="text-[10px] text-blue-400 font-bold truncate">
                        PRO ({currentUser.subscription.plan})
                      </p>
                      {currentUser.subscription.expiresAtFormatted && (
                        <p className="text-[9px] text-emerald-400 font-semibold truncate">
                          Scade il {currentUser.subscription.expiresAtFormatted}
                        </p>
                      )}
                    </div>
                  ) : (
                    <p className="text-[10px] text-amber-400 font-semibold truncate mt-0.5">
                      Prova Gratuita 5 Minuti
                    </p>
                  )
                ) : (
                  <p className="text-[10px] text-slate-400 font-semibold truncate mt-0.5">
                    Clicca per Registrarti
                  </p>
                )}
              </div>
            </button>
          </div>
        </div>
      </nav>

      {/* Modal Autenticazione & Profilo Utente */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
        onLogoutRedirect={() => {
          if (onShowLanding) onShowLanding();
        }}
        onOpenSubscription={onOpenSubscription}
      />
    </>
  );
};

export default Navigation;
