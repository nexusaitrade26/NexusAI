import { useState, useEffect } from 'react';
import AuthModal from '../auth/AuthModal';
import { getActiveUserSession } from '../../services/accountStorage';

const Sidebar = ({ activeTab, setActiveTab }) => {
  const [currentUser, setCurrentUser] = useState(() => getActiveUserSession());
  const [isAuthOpen, setIsAuthOpen] = useState(false);

  useEffect(() => {
    const handleUserSync = () => {
      setCurrentUser(getActiveUserSession());
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
  };

  const navItems = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'workarea', label: 'Area di Lavoro' },
    { id: 'capitale', label: 'Gestione Capitale & Strategia' },
    { id: 'studio', label: 'Studio' },
    { id: 'community', label: 'Community Nexus' },
  ];

  return (
    <>
      <aside className="w-64 glass-panel border-r border-slate-800/80 p-6 flex flex-col justify-between shadow-2xl h-screen select-none font-sans">
        <div>
          {/* Brand Header */}
          <div className="space-y-1 mb-8">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black font-outfit tracking-tight text-white">
                Nexus <span className="text-blue-500">AI</span>
              </h1>
              {currentUser?.subscription?.active && (
                <span className="px-2 py-0.5 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
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

          {/* Navigation Menu */}
          <nav className="space-y-2">
            {navItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full px-5 py-3.5 rounded-2xl font-bold text-sm transition-all duration-200 text-left flex items-center justify-between ${
                    isActive
                      ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-liquid-glow'
                      : 'text-slate-300 hover:bg-slate-800/40 hover:text-slate-100 border border-transparent'
                  }`}
                >
                  <span>{item.label}</span>
                  {isActive && <span className="w-2 h-2 rounded-full bg-blue-400 shadow-liquid-glow"></span>}
                </button>
              );
            })}
          </nav>
        </div>

        {/* RIQUADRO ACCOUNT UTENTE */}
        <div className="space-y-3 pt-6 border-t border-slate-800/80">
          <button
            onClick={() => setActiveTab('settings')}
            className={`w-full px-4 py-3 rounded-2xl font-bold text-xs transition-all flex items-center justify-start gap-2.5 ${
              activeTab === 'settings'
                ? 'bg-blue-600 text-white shadow-liquid-glow border border-blue-500/40'
                : 'bg-slate-900/60 hover:bg-slate-800/60 text-slate-300 border border-slate-800'
            }`}
          >
            <span>Impostazioni</span>
          </button>

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
              <div className="w-9 h-9 rounded-full overflow-hidden shrink-0 border border-blue-500/40 bg-slate-900 shadow-liquid-glow group-hover:scale-105 transition-transform">
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
                <p className="text-[10px] text-blue-400 font-semibold truncate">
                  {currentUser
                    ? currentUser.subscription?.active
                      ? `${currentUser.subscription.plan}`
                      : 'Prova Gratuita 5 Minuti'
                    : 'Clicca per Registrarti'}
                </p>
              </div>
            </button>
          </div>
        </div>
      </aside>

      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onUserChange={handleUserChange}
      />
    </>
  );
};

export default Sidebar;
