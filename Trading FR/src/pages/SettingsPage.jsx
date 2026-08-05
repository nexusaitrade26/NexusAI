import { useState, useEffect } from 'react';
import Card from '../components/common/Card';
import SectionHeader from '../components/common/SectionHeader';
import { useTradingStore } from '../store/useTradingStore';
import { getActiveUserSession, updateActiveUserSettings } from '../services/accountStorage';

const SettingsPage = ({ currentTheme, onThemeChange }) => {
  const [activeUser, setActiveUser] = useState(() => getActiveUserSession());

  // Stato Form Profilo Utente Reale dell'Account Attivo
  const [username, setUsername] = useState(activeUser?.username || '');
  const [email, setEmail] = useState(activeUser?.email || '');
  const [gender, setGender] = useState(activeUser?.gender || 'Maschile');
  const [age, setAge] = useState(activeUser?.age ? String(activeUser.age) : '25');
  const [experience, setExperience] = useState(activeUser?.experience || 'Intermedio (1-3 Anni)');
  const [preferredAsset, setPreferredAsset] = useState(activeUser?.preferredAsset || 'Crypto & Forex');

  // Stato Preferenze Piattaforma & Valuta dell'Account Attivo
  const [theme, setTheme] = useState(activeUser?.theme || currentTheme || 'dark');
  const [currency, setCurrency] = useState(activeUser?.currency || 'USD ($)');
  const [defaultLot, setDefaultLot] = useState(activeUser?.defaultLot || '1.0');
  const [defaultSlPct, setDefaultSlPct] = useState(activeUser?.defaultSlPct || '3.0');
  const [defaultTpPct, setDefaultTpPct] = useState(activeUser?.defaultTpPct || '6.0');

  // Stato Audio & Notifiche dell'Account Attivo
  const [soundOrderExec, setSoundOrderExec] = useState(activeUser?.soundOrderExec ?? true);
  const [soundSlTp, setSoundSlTp] = useState(activeUser?.soundSlTp ?? true);

  const [profileFeedback, setProfileFeedback] = useState(false);

  // Sincronizza lo stato ogni volta che l'utente attivo o le sue impostazioni cambiano
  useEffect(() => {
    const user = getActiveUserSession();
    setActiveUser(user);
    if (user) {
      setUsername(user.username || '');
      setEmail(user.email || '');
      setGender(user.gender || 'Maschile');
      setAge(user.age ? String(user.age) : '25');
      setExperience(user.experience || 'Intermedio (1-3 Anni)');
      setPreferredAsset(user.preferredAsset || 'Crypto & Forex');
      setTheme(user.theme || 'dark');
      setCurrency(user.currency || 'USD ($)');
      setDefaultLot(user.defaultLot || '1.0');
      setDefaultSlPct(user.defaultSlPct || '3.0');
      setDefaultTpPct(user.defaultTpPct || '6.0');
      setSoundOrderExec(user.soundOrderExec ?? true);
      setSoundSlTp(user.soundSlTp ?? true);
    }
  }, []);

  // Salva TUTTE le modifiche alle impostazioni (Profilo, Valuta, Ordini, Suoni) per l'Account Attivo
  const handleSaveAllSettings = (e) => {
    if (e) e.preventDefault();
    if (!activeUser) {
      alert('Nessun account connesso. Effettua la registrazione o l\'accesso prima di salvare le modifiche.');
      return;
    }

    const updatedUser = updateActiveUserSettings({
      username,
      gender,
      age: parseInt(age, 10) || 25,
      experience,
      preferredAsset,
      theme,
      currency,
      defaultLot,
      defaultSlPct,
      defaultTpPct,
      soundOrderExec,
      soundSlTp
    });

    if (updatedUser) {
      setActiveUser(updatedUser);
      setProfileFeedback(true);
      setTimeout(() => setProfileFeedback(false), 3000);
      window.dispatchEvent(new Event('storage'));
    }
  };

  // Cambio Tema Isolato per l'Account Attivo
  const handleThemeChange = (newTheme) => {
    setTheme(newTheme);
    onThemeChange(newTheme);
    if (activeUser) {
      updateActiveUserSettings({ theme: newTheme });
    }
  };

  // Reset completo memoria locale dell'account attivo
  const handleResetLocalData = () => {
    if (window.confirm(`Sei sicuro di voler ripristinare il conto ed azzerare i dati dell'account '${activeUser?.username}'?`)) {
      useTradingStore.getState().clearAll();
      alert(`Dati dell'account '${activeUser?.username}' ripristinati con successo! Il saldo è stato riportato a $10,000.00.`);
    }
  };

  // Esporta Backup Dati dell'account attivo
  const handleExportData = () => {
    const state = useTradingStore.getState();
    const exportObject = {
      account: activeUser,
      tradingData: state
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(exportObject, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `nexus_${activeUser?.username || 'trading'}_backup_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-6 font-sans pt-4 sm:pt-6">
      <SectionHeader
        title="Impostazioni Piattaforma & Profilo Utente"
        subtitle="Le impostazioni di ogni riquadro sono salvate in modo riservato per l'account attualmente connesso."
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* CARD 1: PROFILO UTENTE REALE CONNESSO */}
        <Card className="border-blue-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Profilo Utente & Dati Personali
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                {activeUser ? `Account Connesso: ${activeUser.username}` : 'Nessun account connesso'}
              </p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
              {activeUser ? 'Account Reale' : 'Ospite'}
            </span>
          </div>

          {profileFeedback && (
            <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-bold">
              ✓ Tutte le impostazioni dell'account '{username}' sono state salvate con successo!
            </div>
          )}

          {!activeUser ? (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-semibold">
              ⚠️ Non c'è alcun account connesso al momento. Effettua la registrazione o l'accesso dal menu di sinistra per gestire le tue impostazioni riservate.
            </div>
          ) : (
            <form onSubmit={handleSaveAllSettings} className="space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Nome Utente / Username</label>
                  <input
                    type="text"
                    required
                    placeholder="Nome utente"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* INDIRIZZO EMAIL REALE DELL'ACCOUNT REGISTRATO READ-ONLY */}
                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="text-slate-400 font-medium">Indirizzo Email Account</label>
                    <span className="text-[9px] text-amber-400 font-bold uppercase">Non Modificabile</span>
                  </div>
                  <input
                    type="email"
                    readOnly
                    value={email}
                    className="w-full bg-slate-950/80 border border-slate-800/80 rounded-xl px-3 py-2 text-slate-400 font-mono text-xs cursor-not-allowed opacity-80"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Genere Utente</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
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
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Livello di Esperienza</label>
                  <select
                    value={experience}
                    onChange={(e) => setExperience(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Principiante (0-1 Anni)">Principiante (0-1 Anni)</option>
                    <option value="Intermedio (1-3 Anni)">Intermedio (1-3 Anni)</option>
                    <option value="Avanzato / Pro (3+ Anni)">Avanzato / Pro (3+ Anni)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-400 mb-1 font-medium">Asset Preferito</label>
                  <select
                    value={preferredAsset}
                    onChange={(e) => setPreferredAsset(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-semibold focus:outline-none focus:border-blue-500"
                  >
                    <option value="Crypto & Forex">Crypto & Forex (BTC, ETH, EUR/USD)</option>
                    <option value="Azioni & Tech">Azioni & Tech (NVDA, AAPL, TSLA)</option>
                    <option value="Tutti gli Asset">Tutti gli Asset (Portafoglio Completo)</option>
                  </select>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs uppercase tracking-wider transition-all shadow-liquid-glow"
              >
                Salva Modifiche Profilo ({username})
              </button>
            </form>
          )}
        </Card>

        {/* CARD 2: TEMA GRAFICO DELL'ACCOUNT ATTIVO */}
        <Card className="border-blue-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Tema Grafico dell'Account
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">La preferenza del tema è salvata sul tuo profilo personale.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
              Personalizzazione
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
              theme === 'dark'
                ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/40'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div>
                <strong className="text-slate-100 font-bold block">Nexus Dark Slate (Tema Scuro Istituzionale)</strong>
                <span className="text-[11px] text-slate-400">Tema scuro professionale ad alto contrasto (Predefinito).</span>
              </div>
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={theme === 'dark'}
                onChange={() => handleThemeChange('dark')}
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
              theme === 'light'
                ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/40'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div>
                <strong className="text-slate-100 font-bold block">Nexus Light Platinum (Tema Chiaro Luminoso)</strong>
                <span className="text-[11px] text-slate-400">Modalità chiara ad alta nitidezza per ambienti illuminati.</span>
              </div>
              <input
                type="radio"
                name="theme"
                value="light"
                checked={theme === 'light'}
                onChange={() => handleThemeChange('light')}
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <label className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer transition-all ${
              theme === 'system'
                ? 'bg-blue-950/30 border-blue-500 ring-1 ring-blue-500/40'
                : 'bg-slate-900/60 border-slate-800'
            }`}>
              <div>
                <strong className="text-slate-100 font-bold block">Automatico (Predefinito di Sistema)</strong>
                <span className="text-[11px] text-slate-400">Sincronizza lo stile grafico in base alle preferenze del tuo dispositivo.</span>
              </div>
              <input
                type="radio"
                name="theme"
                value="system"
                checked={theme === 'system'}
                onChange={() => handleThemeChange('system')}
                className="w-4 h-4 accent-blue-600"
              />
            </label>
          </div>
        </Card>

        {/* CARD 3: PREFERENZE VALUTA & PIATTAFORMA PER ACCOUNT */}
        <Card className="border-blue-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Preferenze Valuta & Impostazioni Ordini
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Parametri ordini predefiniti dell'account '{username}'.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
              Parametri Trading
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-400 mb-1 font-medium">Valuta Principale</label>
              <select
                value={currency}
                onChange={(e) => {
                  setCurrency(e.target.value);
                  if (activeUser) updateActiveUserSettings({ currency: e.target.value });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="USD ($)">USD ($ US Dollar)</option>
                <option value="EUR (€)">EUR (€ Euro)</option>
                <option value="GBP (£)">GBP (£ British Pound)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Dimensione Lotto Predefinita</label>
              <select
                value={defaultLot}
                onChange={(e) => {
                  setDefaultLot(e.target.value);
                  if (activeUser) updateActiveUserSettings({ defaultLot: e.target.value });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              >
                <option value="0.1">0.1 Lotti (Micro)</option>
                <option value="0.5">0.5 Lotti (Mini)</option>
                <option value="1.0">1.0 Lotto (Standard)</option>
                <option value="2.0">2.0 Lotti (Pro)</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Stop Loss Predefinito (%)</label>
              <input
                type="number"
                step="0.5"
                value={defaultSlPct}
                onChange={(e) => {
                  setDefaultSlPct(e.target.value);
                  if (activeUser) updateActiveUserSettings({ defaultSlPct: e.target.value });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-slate-400 mb-1 font-medium">Take Profit Predefinito (%)</label>
              <input
                type="number"
                step="0.5"
                value={defaultTpPct}
                onChange={(e) => {
                  setDefaultTpPct(e.target.value);
                  if (activeUser) updateActiveUserSettings({ defaultTpPct: e.target.value });
                }}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-100 font-bold focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>
        </Card>

        {/* CARD 4: NOTIFICHE, AUDIO & SICUREZZA DATI PER ACCOUNT */}
        <Card className="border-blue-500/30 space-y-4">
          <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
            <div>
              <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider font-outfit">
                Notifiche, Suoni & Gestione Dati
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">Preferenze audio e backup del conto di '{username}'.</p>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-[10px] font-bold text-blue-400">
              Sistema & Backup
            </span>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Suono all'Esecuzione degli Ordini</span>
              <input
                type="checkbox"
                checked={soundOrderExec}
                onChange={(e) => {
                  setSoundOrderExec(e.target.checked);
                  if (activeUser) updateActiveUserSettings({ soundOrderExec: e.target.checked });
                }}
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-900 border border-slate-800 cursor-pointer">
              <span className="text-slate-200">Suono al Raggiungimento di Stop Loss / Take Profit</span>
              <input
                type="checkbox"
                checked={soundSlTp}
                onChange={(e) => {
                  setSoundSlTp(e.target.checked);
                  if (activeUser) updateActiveUserSettings({ soundSlTp: e.target.checked });
                }}
                className="w-4 h-4 accent-blue-600"
              />
            </label>

            <div className="pt-2 border-t border-slate-800 flex gap-2">
              <button
                onClick={handleExportData}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 transition-all"
              >
                Esporta Backup Dati (.JSON)
              </button>

              <button
                onClick={handleResetLocalData}
                className="flex-1 py-2.5 rounded-xl bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 font-bold text-xs border border-rose-500/30 transition-all"
              >
                Ripristina Saldo & Dati Account
              </button>
            </div>
          </div>
        </Card>

      </div>
    </div>
  );
};

export default SettingsPage;
