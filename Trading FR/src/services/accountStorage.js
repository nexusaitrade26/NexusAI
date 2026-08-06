// Gestore Memoria Cloud DB Multi-Device (Nexus AI Global Server Account Storage)

const ACCOUNTS_KEY = 'nexus_registered_accounts';
const ACTIVE_USER_KEY = 'nexus_active_user_session';

// Endpoint Server API HTTPS Globale attivo h24 su Vercel Cloud Server
const SERVER_ACCOUNTS_API = 'https://nexus-ai-eight-flax.vercel.app/api/accounts';

// Helper per il merge profondo di appData (posizioni, trade chiusi, notifiche, chat)
const mergeAppData = (existing = {}, incoming = {}) => {
  if (!incoming && !existing) return { balance: 10000.0, positions: [], closedTrades: [], chatSessions: [], notifications: [] };
  if (!incoming) return existing;
  if (!existing) return incoming;

  const closedIds = new Set([
    ...(existing.closedTrades || []).map(t => t && (t.positionId || t.id)),
    ...(incoming.closedTrades || []).map(t => t && (t.positionId || t.id))
  ]);

  const posMap = new Map();
  (existing.positions || []).forEach(p => {
    if (p && p.id && !closedIds.has(p.id)) posMap.set(p.id, p);
  });
  (incoming.positions || []).forEach(p => {
    if (p && p.id && !closedIds.has(p.id)) posMap.set(p.id, p);
  });

  const closedMap = new Map();
  (existing.closedTrades || []).forEach(t => { if (t && t.id) closedMap.set(t.id, t); });
  (incoming.closedTrades || []).forEach(t => { if (t && t.id) closedMap.set(t.id, t); });

  const chatMap = new Map();
  (existing.chatSessions || []).forEach(c => { if (c && c.id) chatMap.set(c.id, c); });
  (incoming.chatSessions || []).forEach(c => { if (c && c.id) chatMap.set(c.id, c); });

  const notifMap = new Map();
  (existing.notifications || []).forEach(n => { if (n && n.id) notifMap.set(n.id, n); });
  (incoming.notifications || []).forEach(n => { if (n && n.id) notifMap.set(n.id, n); });

  return {
    balance: incoming.balance != null ? incoming.balance : (existing.balance ?? 10000.0),
    positions: Array.from(posMap.values()),
    closedTrades: Array.from(closedMap.values()),
    chatSessions: Array.from(chatMap.values()),
    notifications: Array.from(notifMap.values())
  };
};

// Durata della prova gratuita per ogni nuovo account (5 minuti = 300 secondi)
export const TRIAL_DURATION_SECONDS = 300; 

// Helper per notificare l'intera app dei cambiamenti di sessione utente
export const notifyUserUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nexus_user_updated'));
    window.dispatchEvent(new Event('storage'));
  }
};

// Scarica gli account aggiornati dal Server Cloud in tempo reale per Web ed Android WebView Native App
export const fetchCloudAccounts = async () => {
  try {
    const res = await fetch(`${SERVER_ACCOUNTS_API}?t=${Date.now()}`);
    if (res.ok) {
      const json = await res.json();
      const accountsData = (json && json.data && typeof json.data === 'object')
        ? json.data
        : (json && typeof json === 'object' && !Array.isArray(json)) ? json : null;

      if (accountsData) {
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accountsData));
        return accountsData;
      }
    }
  } catch (e) {
    console.warn('Server Cloud API error, fallback a cache locale:', e);
  }
  return getRegisteredAccounts();
};

// Invia l'elenco aggiornato degli account al Server Cloud h24 (con Merge profondo a prova di perdita)
export const pushCloudAccounts = async (accountsObj) => {
  try {
    let currentCloud = {};
    try {
      const res = await fetch(`${SERVER_ACCOUNTS_API}?t=${Date.now()}`);
      if (res.ok) {
        const json = await res.json();
        const accountsData = (json && json.data && typeof json.data === 'object')
          ? json.data
          : (json && typeof json === 'object' && !Array.isArray(json)) ? json : null;
        if (accountsData) {
          currentCloud = accountsData;
        }
      }
    } catch (err) {
      // ignore
    }

    const merged = { ...currentCloud };
    if (accountsObj && typeof accountsObj === 'object') {
      Object.keys(accountsObj).forEach(key => {
        const cleanKey = key.trim().toLowerCase();
        if (merged[cleanKey]) {
          merged[cleanKey] = {
            ...merged[cleanKey],
            ...accountsObj[key],
            appData: (accountsObj[key].appData || merged[cleanKey].appData)
              ? mergeAppData(merged[cleanKey].appData, accountsObj[key].appData)
              : merged[cleanKey].appData
          };
        } else {
          merged[cleanKey] = accountsObj[key];
        }
      });
    }

    await fetch(SERVER_ACCOUNTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data: merged })
    });
  } catch (e) {
    console.warn('Errore invio dati al Server Cloud:', e);
  }
};

// Ottiene l'elenco di tutti gli account registrati dalla memoria locale di backup
export const getRegisteredAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// Registra un nuovo account ed inizializza il trial di 5 minuti sia sul Server Cloud che in locale
export const registerAccount = async ({ username, email, password, gender, age }) => {
  const cleanUser = (username || '').trim();
  const cleanEmail = (email || '').trim();
  const cleanPwd = (password || '').trim();

  if (!cleanUser || !cleanEmail || !cleanPwd) {
    throw new Error('Nome utente, email e password sono obbligatori.');
  }

  // Chiamata diretta Server-Side per Registrazione Reale Atomica h24
  try {
    const res = await fetch(SERVER_ACCOUNTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'register', username: cleanUser, email: cleanEmail, password: cleanPwd, gender, age })
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Errore durante la registrazione dell\'account.');
    }

    if (json.data) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(json.data));
    }

    const newUser = json.user;
    const lowerUser = cleanUser.toLowerCase();
    const userAppDataKey = `nexus_user_data_${lowerUser}`;
    if (newUser && newUser.appData) {
      localStorage.setItem(userAppDataKey, JSON.stringify(newUser.appData));
    }

    setActiveUserSession(newUser);
    return newUser;
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    // Fallback locale se offline
    const cloudAccounts = await fetchCloudAccounts();
    const localAccounts = getRegisteredAccounts();
    const accounts = { ...localAccounts, ...cloudAccounts };
    const lowerUser = cleanUser.toLowerCase();
    const lowerEmail = cleanEmail.toLowerCase();

    const exists = Object.values(accounts).some(
      (acc) => acc && (
        (acc.username && acc.username.trim().toLowerCase() === lowerUser) ||
        (acc.email && acc.email.trim().toLowerCase() === lowerEmail)
      )
    );

    if (exists) {
      throw new Error('Un account con questo Nome Utente o Email esiste già. Effettua l\'accesso.');
    }

    const nowISO = new Date().toISOString();
    const initialAppData = {
      balance: 10000,
      positions: [],
      closedTrades: [],
      notifications: [{ id: Date.now(), type: 'NEXUS SYSTEM', message: `Benvenuto su Nexus AI ${cleanUser}!` }],
      chatSessions: [{ id: `sess-${Date.now()}`, title: 'Conversazione Principale', messages: [{ id: 1, sender: 'ai', text: `Ciao ${cleanUser}!` }] }]
    };

    const newAccount = {
      id: `usr_${Date.now()}`,
      username: cleanUser,
      email: cleanEmail,
      password: cleanPwd,
      gender: gender || 'Maschile',
      age: parseInt(age, 10) || 25,
      createdAt: nowISO,
      appData: initialAppData,
      subscription: { active: false }
    };

    accounts[lowerUser] = newAccount;
    localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
    await pushCloudAccounts(accounts);
    setActiveUserSession(newAccount);
    return newAccount;
  }
};

// Autenticazione / Login account con verifica sul Server Cloud h24 + fallback locale integrato
export const loginAccount = async (usernameOrEmail, password) => {
  const query = (usernameOrEmail || '').trim().toLowerCase();
  const inputPwd = (password || '').trim();

  if (!query || !inputPwd) {
    throw new Error('Inserisci nome utente / email e password.');
  }

  // Chiamata diretta Server-Side per Login Reale Atomico h24
  try {
    const res = await fetch(SERVER_ACCOUNTS_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'login', query, password: inputPwd })
    });

    const json = await res.json();
    if (!res.ok || json.error) {
      throw new Error(json.error || 'Account non trovato. Registrati sul sito web oppure verifica le credenziali.');
    }

    if (json.data) {
      localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(json.data));
    }

    const user = json.user;
    setActiveUserSession(user);
    if (user && user.username) {
      const lowerUser = user.username.trim().toLowerCase();
      if (user.appData) {
        localStorage.setItem(`nexus_user_data_${lowerUser}`, JSON.stringify(user.appData));
      }
    }
    return user;
  } catch (err) {
    if (err.message && !err.message.includes('fetch')) {
      throw err;
    }
    const cloudAccounts = await fetchCloudAccounts();
    const localAccounts = getRegisteredAccounts();
    const accounts = { ...localAccounts, ...cloudAccounts };

    const found = Object.values(accounts).find(
      (acc) => acc && (
        (acc.username && acc.username.trim().toLowerCase() === query) ||
        (acc.email && acc.email.trim().toLowerCase() === query)
      )
    );

    if (!found) {
      throw new Error('Account non trovato. Registrati sul sito web oppure verifica le credenziali.');
    }

    const storedPwd = (found.password || '').trim();
    if (storedPwd !== inputPwd) {
      throw new Error('Password errata. Riprova o recupera la password.');
    }

    if (found.appData && found.username) {
      const key = `nexus_user_data_${found.username.trim().toLowerCase()}`;
      localStorage.setItem(key, JSON.stringify(found.appData));
    }

    setActiveUserSession(found);
    return found;
  }
};

// Attiva un Abbonamento per l'Account Attivo con data di scadenza calcolata
export const activateUserSubscription = async ({ plan, paymentMethod }) => {
  const activeUser = getActiveUserSession();
  if (!activeUser) return null;

  const accounts = await fetchCloudAccounts();
  const key = activeUser.username.trim().toLowerCase();

  const now = new Date();
  const expireDate = new Date(now);

  if (plan.includes('Mensile')) {
    expireDate.setMonth(expireDate.getMonth() + 1);
  } else if (plan.includes('Trimestrale')) {
    expireDate.setMonth(expireDate.getMonth() + 3);
  } else if (plan.includes('Annuale')) {
    expireDate.setFullYear(expireDate.getFullYear() + 1);
  } else {
    expireDate.setMonth(expireDate.getMonth() + 1);
  }

  const expiresAtFormatted = expireDate.toLocaleDateString('it-IT', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });

  const subscriptionObj = {
    active: true,
    plan,
    paymentMethod,
    activatedAt: now.toISOString(),
    expiresAtFormatted
  };

  const updatedUser = {
    ...activeUser,
    subscription: subscriptionObj
  };

  accounts[key] = updatedUser;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await pushCloudAccounts(accounts);
  setActiveUserSession(updatedUser);
  return updatedUser;
};

// Aggiorna le impostazioni ed il profilo dell'utente attivo
export const updateActiveUserSettings = async (updatedFields) => {
  const activeUser = getActiveUserSession();
  if (!activeUser) return null;

  const accounts = await fetchCloudAccounts();
  const key = activeUser.username.trim().toLowerCase();

  const updatedUser = {
    ...activeUser,
    ...updatedFields
  };

  if (updatedFields.username && updatedFields.username !== activeUser.username) {
    const oldAppData = getUserAppData(activeUser.username);
    saveUserAppData(updatedFields.username, oldAppData);
    delete accounts[key];
    accounts[updatedFields.username.trim().toLowerCase()] = updatedUser;
  } else {
    accounts[key] = updatedUser;
  }

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await pushCloudAccounts(accounts);
  setActiveUserSession(updatedUser);
  return updatedUser;
};

// Ottiene l'utente attualmente connesso nella sessione attiva
export const getActiveUserSession = () => {
  try {
    const raw = localStorage.getItem(ACTIVE_USER_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (e) {
    return null;
  }
};

// Imposta la sessione dell'utente attivo e notifica l'app
export const setActiveUserSession = (userObj) => {
  if (!userObj) {
    localStorage.removeItem(ACTIVE_USER_KEY);
  } else {
    localStorage.setItem(ACTIVE_USER_KEY, JSON.stringify(userObj));
  }
  notifyUserUpdated();
};

// Logout utente
export const logoutActiveUserSession = () => {
  localStorage.removeItem(ACTIVE_USER_KEY);
  notifyUserUpdated();
};

// OTTIENE I DATI ISOLATI DELLO SPECIFICO ACCOUNT (Con sincronizzazione dal Cloud)
export const getUserAppData = (username) => {
  if (!username) return null;
  const lowerUser = username.trim().toLowerCase();

  // 1. Priorità ai dati salvati nel Cloud DB per questo account
  const accounts = getRegisteredAccounts();
  const acc = Object.values(accounts).find(a => a && a.username && a.username.trim().toLowerCase() === lowerUser);
  if (acc && acc.appData) {
    return acc.appData;
  }

  // 2. Fallback a memoria locale
  const key = `nexus_user_data_${lowerUser}`;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    // ignore
  }

  return {
    balance: 10000,
    positions: [],
    closedTrades: [],
    notifications: [],
    chatSessions: []
  };
};

// SCARICA IN TEMPO REALE DAL CLOUD I DATI DI TRADING DELL'UTENTE
export const fetchUserAppData = async (username) => {
  if (!username) return null;
  const accounts = await fetchCloudAccounts();
  const lowerUser = username.trim().toLowerCase();
  const acc = Object.values(accounts).find(a => a && a.username && a.username.trim().toLowerCase() === lowerUser);
  if (acc && acc.appData) {
    const key = `nexus_user_data_${lowerUser}`;
    localStorage.setItem(key, JSON.stringify(acc.appData));
    return acc.appData;
  }
  return getUserAppData(username);
};

// SALVA E SINCRONIZZA I DATI DI TRADING (POSIZIONI, BILANCIO, CHAT, NOTIFICHE) SUL CLOUD SERVER H24 IN TEMPO REALE
export const saveUserAppData = async (username, dataObj) => {
  if (!username) return;
  const lowerUser = username.trim().toLowerCase();
  const userAppDataKey = `nexus_user_data_${lowerUser}`;
  
  // 1. Salva in localStorage locale per risposta ultra-rapida dell'interfaccia
  localStorage.setItem(userAppDataKey, JSON.stringify(dataObj));

  // 2. Recupera l'elenco account e garantisce la presenza della chiave per l'utente attivo
  const localAccounts = getRegisteredAccounts();
  let accounts = { ...localAccounts };
  
  const activeUser = getActiveUserSession();
  let accKey = Object.keys(accounts).find(k => accounts[k] && accounts[k].username && accounts[k].username.trim().toLowerCase() === lowerUser);

  if (!accKey || !accounts[accKey]) {
    const userToSave = (activeUser && activeUser.username && activeUser.username.trim().toLowerCase() === lowerUser)
      ? activeUser
      : { id: `usr_${Date.now()}`, username: username.trim(), email: `${lowerUser}@nexus.ai` };
    accounts[lowerUser] = { ...userToSave, appData: dataObj };
    accKey = lowerUser;
  } else {
    accounts[accKey] = {
      ...accounts[accKey],
      appData: dataObj
    };
  }

  // 3. Salva la mappa aggiornata in locale e sincronizza al Cloud DB H24 senza perdere mai dati pregressi
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
  await pushCloudAccounts(accounts);
};
