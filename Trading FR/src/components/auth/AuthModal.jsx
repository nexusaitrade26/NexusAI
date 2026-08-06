import { useState, useEffect } from 'react';
import Card from '../common/Card';
import { registerAccount, loginAccount, logoutActiveUserSession, getRegisteredAccounts, setActiveUserSession } from '../../services/accountStorage';
import { useTradingStore } from '../../store/useTradingStore';
import { sendPasswordResetEmail } from '../../services/emailService';

const EyeIcon = () => (
  <svg className="w-4 h-4 text-slate-400 hover:text-slate-100 transition-colors fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
    <circle cx="12" cy="12" r="3" />
  </svg>
);

const EyeOffIcon = () => (
  <svg className="w-4 h-4 text-slate-400 hover:text-slate-100 transition-colors fill-none stroke-current" viewBox="0 0 24 24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);

const AuthModal = ({ isOpen, onClose, currentUser, onUserChange, onLogoutRedirect, onOpenSubscription, initialTab = 'login' }) => {
  // Ordine Tab: 1. Accedi (Login), 2. Registrati (Register)
  const [activeTab, setActiveTab] = useState(initialTab); // 'login' | 'register' | 'forgot' | 'profile'
  
  // Form State
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [gender, setGender] = useState('Maschile');
  const [age, setAge] = useState('25');

  // Forgot / Reset Password State
  const [forgotEmail, setForgotEmail] = useState('');
  const [generatedOtp, setGeneratedOtp] = useState('');
  const [inputOtp, setInputOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  // Toggle visibilità password con icona occhio SVG semplice in bianco e nero
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [showResetPassword, setShowResetPassword] = useState(false);

  // Status Feedback
  const [feedback, setFeedback] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setActiveTab('profile');
    } else {
      setActiveTab(initialTab || 'login');
    }
  }, [currentUser, isOpen, initialTab]);

  if (!isOpen) return null;

  // Login Account Reale
  const handleLogin = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFeedback(null);
    setIsLoading(true);
    try {
      const user = await loginAccount(username, password);
      setFeedback({ type: 'success', message: `Bentornato, ${user.username}! Accesso effettuato con successo.` });
      
      onUserChange(user);
      useTradingStore.getState().loadActiveUserStore();

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante l\'accesso.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Registrazione Nuovo Account Reale
  const handleRegister = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFeedback(null);
    setIsLoading(true);
    try {
      const newUser = await registerAccount({
        username,
        email,
        password,
        gender,
        age
      });

      setFeedback({ type: 'success', message: `Account registrato con successo! Benvenuto ${newUser.username}.` });
      
      onUserChange(newUser);
      useTradingStore.getState().loadActiveUserStore();

      setTimeout(() => {
        onClose();
      }, 800);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante la registrazione.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Invio Email Reale con Codice OTP a 6 cifre via EmailJS
  const handleSendResetEmail = async (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFeedback(null);
    setIsLoading(true);
    try {
      const accounts = getRegisteredAccounts();
      const query = (forgotEmail || '').toString().trim().toLowerCase();
      const found = Object.values(accounts).find((acc) => acc && typeof acc === 'object' && acc.email && String(acc.email).trim().toLowerCase() === query);

      if (!found) {
        throw new Error('Nessun account registrato trovato con questo indirizzo email.');
      }

      // Genera codice OTP reale a 6 cifre
      const otpCode = String(Math.floor(100000 + Math.random() * 900000));
      setGeneratedOtp(otpCode);

      // Invia l'email reale tramite EmailJS
      const emailResult = await sendPasswordResetEmail(forgotEmail, otpCode);

      setIsOtpSent(true);

      if (emailResult.success) {
        setFeedback({
          type: 'success',
          message: `Email di recupero inviata con successo a ${forgotEmail}! Inserisci il codice a 6 cifre ricevuto nella tua posta.`
        });
      } else {
        setFeedback({
          type: 'error',
          message: `Errore invio email: ${emailResult.error || 'Verifica il servizio email'}.`
        });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Errore durante l\'invio dell\'email.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Verifica Codice OTP a 6 Cifre & Ripristino Nuova Password
  const handleVerifyAndResetPassword = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    try {
      if (inputOtp.trim() !== generatedOtp) {
        throw new Error('Codice di verifica a 6 cifre errato. Controlla la tua posta elettronica.');
      }

      if (!newPassword || newPassword.length < 4) {
        throw new Error('Inserisci una nuova password di almeno 4 caratteri.');
      }

      const accounts = getRegisteredAccounts();
      const query = (forgotEmail || '').toString().trim().toLowerCase();
      const foundKey = Object.keys(accounts).find(
        (k) => accounts[k] && typeof accounts[k] === 'object' && accounts[k].email && String(accounts[k].email).trim().toLowerCase() === query
      );

      if (!foundKey) {
        throw new Error('Account non trovato.');
      }

      accounts[foundKey].password = newPassword;
      localStorage.setItem('nexus_registered_accounts', JSON.stringify(accounts));
      setActiveUserSession(accounts[foundKey]);

      setFeedback({ type: 'success', message: '✅ Password aggiornata con successo! Accesso in corso...' });
      onUserChange(accounts[foundKey]);
      useTradingStore.getState().loadActiveUserStore();

      setTimeout(() => {
        setIsOtpSent(false);
        setGeneratedOtp('');
        setInputOtp('');
        setForgotEmail('');
        onClose();
      }, 1200);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Errore nel ripristino della password.' });
    } finally {
      setIsLoading(false);
    }
  };

  // Disconnessione Account & Reindirizzamento alla Homepage Iniziale
  const handleLogout = () => {
    logoutActiveUserSession();
    onUserChange(null);
    useTradingStore.getState().loadActiveUserStore();
    setActiveTab('login');
    onClose();
    if (onLogoutRedirect) {
      onLogoutRedirect();
    }
  };

  // Stato validazione live dell'OTP inserito dall'utente (Spunta verde o X rossa)
  const isOtpComplete = inputOtp.trim().length === 6;
  const isOtpValid = isOtpComplete && inputOtp.trim() === generatedOtp;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fade-in font-sans">
      <div className="relative w-full max-w-md">
        <Card className="border-blue-500/30 p-6 shadow-2xl space-y-4">
          
          {/* Header Modal & Close */}
          <div className="flex justify-between items-center border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-blue-500 animate-pulse"></span>
              <h2 className="text-sm font-bold text-white font-outfit uppercase tracking-wider">
                {activeTab === 'profile'
                  ? 'Profilo Account Connesso'
                  : activeTab === 'forgot'
                  ? 'Recupero Password via Email'
                  : 'Accesso & Registrazione Account'}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-bold"
            >
              ✕
            </button>
          </div>

          {/* BANNER PROVA GRATUITA 5 MINUTI PRESENTE ESCLUSIVAMENTE NELLA TAB REGISTRATI (SENZA SIMBOLO REGALO) */}
          {!currentUser && activeTab === 'register' && (
            <div className="p-3 rounded-xl bg-blue-500/10 border border-blue-500/30 text-xs space-y-2">
              <p className="text-slate-200 leading-snug">
                <strong>Prova Gratuita di 5 Minuti:</strong> Ogni nuovo account inizia con 5 minuti di prova gratuita. Al termine verrà richiesto l'abbonamento Premium per continuare.
              </p>
              {onOpenSubscription && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenSubscription();
                  }}
                  className="w-full py-1.5 rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-[11px] transition-all shadow-liquid-glow"
                >
                  👑 Passa Subito ad un Piano Premium
                </button>
              )}
            </div>
          )}

          {/* Feedback Banner */}
          {feedback && (
            <div className={`p-3 rounded-xl border text-xs font-medium ${
              feedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-300 border-rose-500/30'
            }`}>
              {feedback.message}
            </div>
          )}

          {/* NAVIGAZIONE TAB INVERTITA: 1. ACCEDI, 2. REGISTRATI */}
          {!currentUser && activeTab !== 'forgot' && (
            <div className="flex gap-1 p-1 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold">
              <button
                type="button"
                onClick={() => { setActiveTab('login'); setFeedback(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'login' ? 'bg-blue-600 text-white shadow-liquid-glow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Accedi
              </button>
              <button
                type="button"
                onClick={() => { setActiveTab('register'); setFeedback(null); }}
                className={`flex-1 py-2 rounded-lg transition-all ${
                  activeTab === 'register' ? 'bg-blue-600 text-white shadow-liquid-glow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Registrati
              </button>
            </div>
          )}

          {/* VISTA 1: ACCEDI ALL'ACCOUNT (LOGIN) */}
          {activeTab === 'login' && !currentUser && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nome Utente o Email</label>
                <input
                  type="text"
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  data-dashlane-ignore="true"
                  data-form-type="other"
                  placeholder="Inserisci username o email"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    data-dashlane-ignore="true"
                    data-form-type="other"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleLogin(e); }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                    title={showLoginPassword ? 'Nascondi Password' : 'Mostra Password'}
                  >
                    {showLoginPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>

                {/* LINK PASSWORD DIMENTICATA POSIZIONATO RIGOROSAMENTE SOTTO IL RIQUADRO DELLA PASSWORD */}
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => { setActiveTab('forgot'); setFeedback(null); setIsOtpSent(false); }}
                    className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold underline"
                  >
                    Password dimenticata?
                  </button>
                </div>
              </div>

              <button
                type="button"
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-liquid-glow disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Accesso in corso...' : 'Accedi all\'Account'}
              </button>
            </div>
          )}

          {/* VISTA 2: REGISTRAZIONE NUOVO ACCOUNT */}
          {activeTab === 'register' && !currentUser && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1 font-medium">Nome Utente / Username</label>
                <input
                  type="text"
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  data-dashlane-ignore="true"
                  data-form-type="other"
                  placeholder="Scegli il tuo nome utente"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Indirizzo Email</label>
                <input
                  type="email"
                  autoComplete="off"
                  data-1p-ignore="true"
                  data-lpignore="true"
                  data-bwignore="true"
                  data-dashlane-ignore="true"
                  data-form-type="other"
                  placeholder="latuaemail@esempio.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1 font-medium">Password</label>
                <div className="relative">
                  <input
                    type={showRegisterPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    data-1p-ignore="true"
                    data-lpignore="true"
                    data-bwignore="true"
                    data-dashlane-ignore="true"
                    data-form-type="other"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword(!showRegisterPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                    title={showRegisterPassword ? 'Nascondi Password' : 'Mostra Password'}
                  >
                    {showRegisterPassword ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Genere</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Maschile">Maschile</option>
                    <option value="Femminile">Femminile</option>
                    <option value="Non Specificato">Non Specificato</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Età Utente</label>
                  <input
                    type="number"
                    min="18"
                    max="99"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <button
                type="button"
                onClick={handleRegister}
                disabled={isLoading}
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-liquid-glow disabled:opacity-50 mt-2"
              >
                {isLoading ? 'Registrazione in corso...' : 'Crea Account & Inizia Prova Gratuita'}
              </button>
            </div>
          )}

          {/* VISTA 3: PASSWORD DIMENTICATA CON VERIFICA LIVE A SPUNTA VERDE ✔️ O CROCE ROSSA ❌ */}
          {activeTab === 'forgot' && !currentUser && (
            <div className="space-y-3 text-xs">
              {!isOtpSent ? (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Inserisci la tua Email di Registrazione</label>
                    <input
                      type="email"
                      autoComplete="off"
                      data-1p-ignore="true"
                      data-lpignore="true"
                      data-bwignore="true"
                      data-dashlane-ignore="true"
                      data-form-type="other"
                      placeholder="latuaemail@esempio.com"
                      value={forgotEmail}
                      onChange={(e) => setForgotEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => { setActiveTab('login'); setFeedback(null); }}
                      className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                    >
                      Torna al Login
                    </button>

                    <button
                      type="button"
                      onClick={handleSendResetEmail}
                      disabled={isLoading}
                      className="flex-1 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all shadow-liquid-glow disabled:opacity-50"
                    >
                      {isLoading ? 'Invio Email Reale...' : 'Invia Email con Codice'}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Inserisci il Codice a 6 Cifre (Inviato alla Posta)</label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength="6"
                        placeholder="Esempio: 784920"
                        value={inputOtp}
                        onChange={(e) => setInputOtp(e.target.value)}
                        className={`w-full bg-slate-950 border rounded-xl px-3 py-2.5 font-mono text-center font-extrabold text-base tracking-widest focus:outline-none pr-10 transition-colors ${
                          isOtpComplete
                            ? isOtpValid
                              ? 'border-emerald-500 text-emerald-400'
                              : 'border-rose-500 text-rose-400'
                            : 'border-blue-500/50 text-blue-400'
                        }`}
                      />

                      {/* SPUNTA VERDE ✔️ O CROCE ROSSA ❌ IN TEMPO REALE SUL CAMPO CODICE */}
                      {isOtpComplete && (
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm font-black">
                          {isOtpValid ? (
                            <span className="text-emerald-400 font-bold">✔️</span>
                          ) : (
                            <span className="text-rose-500 font-bold">❌</span>
                          )}
                        </span>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-slate-400 mb-1 font-medium">Imposta Nuova Password</label>
                    <div className="relative">
                      <input
                        type={showResetPassword ? 'text' : 'password'}
                        autoComplete="new-password"
                        data-1p-ignore="true"
                        data-lpignore="true"
                        data-bwignore="true"
                        data-dashlane-ignore="true"
                        data-form-type="other"
                        placeholder="Nuova password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-slate-100 font-bold focus:outline-none focus:border-blue-500 pr-10"
                      />
                      <button
                        type="button"
                        onClick={() => setShowResetPassword(!showResetPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-white transition-colors"
                      >
                        {showResetPassword ? <EyeOffIcon /> : <EyeIcon />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => setIsOtpSent(false)}
                      className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold transition-all"
                    >
                      Reinvia Email
                    </button>

                    <button
                      type="button"
                      onClick={handleVerifyAndResetPassword}
                      disabled={isLoading || (isOtpComplete && !isOtpValid)}
                      className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition-all shadow-liquid-glow disabled:opacity-50"
                    >
                      {isLoading ? 'Verifica in corso...' : 'Conferma Codice & Ripristina'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* VISTA 4: PROFILO UTENTE ATTIVO LOGGATO CON AVATAR CIRCOLARE */}
          {currentUser && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full overflow-hidden shrink-0 border border-blue-500/40 bg-slate-950 shadow-liquid-glow">
                    <img
                      src={currentUser?.gender === 'Femminile' ? '/avatars/avatar_female.png' : '/avatars/avatar_male.png'}
                      alt={currentUser?.username || 'Avatar Utente'}
                      className="w-full h-full object-cover scale-125 rounded-full"
                    />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">{currentUser.username}</h3>
                    <p className="text-[11px] text-blue-400 font-mono">{currentUser.email}</p>
                    <span className="text-[10px] text-slate-400 font-medium">
                      {currentUser.gender} • {currentUser.age} Anni
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="w-full py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 font-bold text-xs transition-all"
              >
                Disconnetti Account
              </button>
            </div>
          )}

        </Card>
      </div>
    </div>
  );
};

export default AuthModal;
