// Gestore Memoria Locale Multi-Account Isolata & Abbonamenti (Nexus AI Account Storage)

const ACCOUNTS_KEY = 'nexus_registered_accounts';
const ACTIVE_USER_KEY = 'nexus_active_user_session';

// Durata della prova gratuita per ogni nuovo account (5 minuti = 300 secondi)
export const TRIAL_DURATION_SECONDS = 300; 

// Helper per notificare l'intera app dei cambiamenti di sessione utente
export const notifyUserUpdated = () => {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('nexus_user_updated'));
    window.dispatchEvent(new Event('storage'));
  }
};

// Ottiene l'elenco di tutti gli account registrati
export const getRegisteredAccounts = () => {
  try {
    const raw = localStorage.getItem(ACCOUNTS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (e) {
    return {};
  }
};

// Registra un nuovo account ed inizializza il trial di 5 minuti
export const registerAccount = ({ username, email, password, gender, age }) => {
  const accounts = getRegisteredAccounts();
  const lowerUser = username.trim().toLowerCase();
  const lowerEmail = email.trim().toLowerCase();

  // Verifica se l'username o l'email esistono già
  const exists = Object.values(accounts).some(
    (acc) => acc.username.toLowerCase() === lowerUser || acc.email.toLowerCase() === lowerEmail
  );

  if (exists) {
    throw new Error('Un account con questo Nome Utente o Email esiste già. Effettua l\'accesso.');
  }

  const nowISO = new Date().toISOString();

  // Impostazioni, Trial 5 min ed Abbonamento per account
  const newAccount = {
    id: `usr_${Date.now()}`,
    username: username.trim(),
    email: email.trim(),
    password,
    gender: gender || 'Maschile',
    age: parseInt(age, 10) || 25,
    experience: 'Intermedio (1-3 Anni)',
    preferredAsset: 'Crypto & Forex',
    theme: 'dark',
    currency: 'USD ($)',
    defaultLot: '1.0',
    defaultSlPct: '3.0',
    defaultTpPct: '6.0',
    soundOrderExec: true,
    soundSlTp: true,
    notifMarketAi: true,
    notifCopyTrading: true,
    notifCapitalRisk: true,
    createdAt: nowISO,
    trialStartedAt: nowISO,
    subscription: {
      active: false,
      plan: null,
      paymentMethod: null,
      activatedAt: null,
      expiresAtFormatted: null
    }
  };

  accounts[lowerUser] = newAccount;
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));

  // Notifica Iniziale Pulita
  const initialAppData = {
    balance: 10000,
    positions: [],
    closedTrades: [],
    notifications: [
      {
        id: Date.now(),
        type: 'NEXUS SYSTEM',
        message: `Benvenuto su Nexus AI ${newAccount.username}! Il tuo account Nexus AI è ora attivo con 5 minuti di prova gratuita.`
      }
    ],
    chatSessions: [
      {
        id: `sess-${Date.now()}`,
        title: 'Conversazione Principale',
        timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' }),
        messages: [
          {
            id: 1,
            sender: 'ai',
            text: `Ciao ${newAccount.username}! Sono Nexus AI, il tuo assistente di trading intelligente. Hai 5 minuti di prova gratuita disponibili!`,
            timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
          }
        ]
      }
    ]
  };

  saveUserAppData(newAccount.username, initialAppData);
  setActiveUserSession(newAccount);
  return newAccount;
};

// Autenticazione / Login account
export const loginAccount = (usernameOrEmail, password) => {
  const accounts = getRegisteredAccounts();
  const query = usernameOrEmail.trim().toLowerCase();

  const found = Object.values(accounts).find(
    (acc) => acc.username.toLowerCase() === query || acc.email.toLowerCase() === query
  );

  if (!found) {
    throw new Error('Account non trovato. Verifica il nome utente/email oppure registrati.');
  }

  if (found.password !== password) {
    throw new Error('Password errata. Riprova o recupera la password.');
  }

  setActiveUserSession(found);
  return found;
};

// Attiva un Abbonamento per l'Account Attivo con data di scadenza calcolata
export const activateUserSubscription = ({ plan, paymentMethod }) => {
  const activeUser = getActiveUserSession();
  if (!activeUser) return null;

  const accounts = getRegisteredAccounts();
  const key = activeUser.username.toLowerCase();

  // Calcola data di scadenza esatta
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
    plan, // 'Piano Mensile' | 'Piano Trimestrale' | 'Piano Annuale'
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
  setActiveUserSession(updatedUser);
  return updatedUser;
};

// Aggiorna le impostazioni ed il profilo dell'utente attivo
export const updateActiveUserSettings = (updatedFields) => {
  const activeUser = getActiveUserSession();
  if (!activeUser) return null;

  const accounts = getRegisteredAccounts();
  const key = activeUser.username.toLowerCase();

  const updatedUser = {
    ...activeUser,
    ...updatedFields
  };

  if (updatedFields.username && updatedFields.username !== activeUser.username) {
    const oldAppData = getUserAppData(activeUser.username);
    saveUserAppData(updatedFields.username, oldAppData);
    delete accounts[key];
    accounts[updatedFields.username.toLowerCase()] = updatedUser;
  } else {
    accounts[key] = updatedUser;
  }

  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
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

// OTTIENE I DATI ISOLATI DELLO SPECIFICO ACCOUNT
export const getUserAppData = (username) => {
  if (!username) return null;
  const key = `nexus_user_data_${username.toLowerCase()}`;
  try {
    const raw = localStorage.getItem(key);
    return raw
      ? JSON.parse(raw)
      : {
          balance: 10000,
          positions: [],
          closedTrades: [],
          notifications: [],
          chatSessions: []
        };
  } catch (e) {
    return { balance: 10000, positions: [], closedTrades: [], notifications: [], chatSessions: [] };
  }
};

// SALVA I DATI ISOLATI DELLO SPECIFICO ACCOUNT
export const saveUserAppData = (username, dataObj) => {
  if (!username) return;
  const key = `nexus_user_data_${username.toLowerCase()}`;
  localStorage.setItem(key, JSON.stringify(dataObj));
};
