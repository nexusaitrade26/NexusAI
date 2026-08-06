// Vercel Serverless Cloud DB Server & Sync Endpoint per Nexus AI (Enterprise Persistent Storage)
const JSON_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019fd26c-ffbe-716d-9155-6c737d3bc08c';

const DEFAULT_ACCOUNTS = {
  tommy: {
    id: 'usr_1785864209292',
    username: 'Tommy',
    email: 'Tommy@gmail.com',
    password: 'Tommy123',
    gender: 'Maschile',
    age: 23,
    experience: 'Intermedio (1-3 Anni)',
    preferredAsset: 'Crypto & Forex',
    theme: 'dark',
    currency: 'USD ($)',
    defaultLot: '1.0',
    defaultSlPct: '3.0',
    defaultTpPct: '6.0',
    createdAt: '2026-08-04T17:23:29.292Z',
    trialStartedAt: '2026-08-04T17:23:29.292Z',
    subscription: {
      active: true,
      plan: 'Piano Trimestrale',
      paymentMethod: 'PayPal Checkout',
      activatedAt: '2026-08-04T17:23:36.059Z',
      expiresAtFormatted: '04/11/2026'
    }
  },
  flavio: {
    id: 'usr_1785938000000',
    username: 'Flavio',
    email: 'flavio@gmail.com',
    password: '123'
  }
};

let memoryCache = { ...DEFAULT_ACCOUNTS };

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

export default async function handler(req, res) {
  // Configurazione CORS universale e azzeramento Totale della Cache CDN / Edge
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Helper per caricare dal Cloud Blob con accumulo sicuro in memoryCache
  const fetchCloudBlob = async () => {
    try {
      const response = await fetch(JSON_BLOB_URL, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object' && !Array.isArray(json) && Object.keys(json).length > 0) {
          memoryCache = { ...DEFAULT_ACCOUNTS, ...memoryCache };
          Object.keys(json).forEach(k => {
            const cleanK = k.trim().toLowerCase();
            // Ignora chiavi riservate erroneamente salvate
            if (cleanK === 'action' || cleanK === 'query' || cleanK === 'password') return;

            memoryCache[cleanK] = {
              ...(memoryCache[cleanK] || {}),
              ...json[k],
              appData: (json[k].appData || memoryCache[cleanK]?.appData)
                ? mergeAppData(memoryCache[cleanK]?.appData, json[k].appData)
                : memoryCache[cleanK]?.appData
            };
          });
        }
      }
    } catch (err) {
      console.error('Fetch JSON Blob Error:', err);
    }
    return memoryCache;
  };

  // Helper per salvare la memoryCache corrente su JSONBlob
  const saveCloudBlob = async () => {
    try {
      memoryCache = { ...DEFAULT_ACCOUNTS, ...memoryCache };
      delete memoryCache.action;
      delete memoryCache.query;

      const putRes = await fetch(JSON_BLOB_URL, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        },
        body: JSON.stringify(memoryCache)
      });
      if (putRes.ok) {
        const updatedData = await putRes.json();
        if (updatedData && typeof updatedData === 'object' && !Array.isArray(updatedData)) {
          Object.keys(updatedData).forEach(k => {
            const cleanK = k.trim().toLowerCase();
            if (cleanK === 'action' || cleanK === 'query' || cleanK === 'password') return;
            if (updatedData[k] && typeof updatedData[k] === 'object') {
              memoryCache[cleanK] = { ...(memoryCache[cleanK] || {}), ...updatedData[k] };
            }
          });
        }
      }
    } catch (e) {
      console.error('Save JSON Blob Error:', e);
    }
    return memoryCache;
  };

  // GET: Lettura account dal Server Cloud
  if (req.method === 'GET') {
    const data = await fetchCloudBlob();
    return res.status(200).json({ data });
  }

  // POST / PUT: Gestione Registrazione, Login e Scrittura Account
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      await fetchCloudBlob();

      // AZIONE 1: REGISTRAZIONE DIRECT SERVER-SIDE
      if (body && body.action === 'register') {
        const { username, email, password, gender, age } = body;
        const cleanUser = (username || '').trim();
        const cleanEmail = (email || '').trim();
        const cleanPwd = (password || '').trim();

        if (!cleanUser || !cleanEmail || !cleanPwd) {
          return res.status(400).json({ error: 'Nome utente, email e password sono obbligatori.' });
        }

        const lowerUser = cleanUser.toLowerCase();
        const lowerEmail = cleanEmail.toLowerCase();

        const exists = Object.values(memoryCache).some(
          acc => acc && (
            (acc.username && acc.username.trim().toLowerCase() === lowerUser) ||
            (acc.email && acc.email.trim().toLowerCase() === lowerEmail)
          )
        );

        if (exists) {
          return res.status(400).json({ error: 'Un account con questo Nome Utente o Email esiste già. Effettua l\'accesso.' });
        }

        const nowISO = new Date().toISOString();
        const initialAppData = {
          balance: 10000,
          positions: [],
          closedTrades: [],
          notifications: [
            {
              id: Date.now(),
              type: 'NEXUS SYSTEM',
              message: `Benvenuto su Nexus AI ${cleanUser}! Il tuo account è ora attivo.`
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
                  text: `Ciao ${cleanUser}! Sono Nexus AI, il tuo assistente di trading intelligente.`,
                  timestamp: new Date().toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' })
                }
              ]
            }
          ]
        };

        const newAccount = {
          id: `usr_${Date.now()}`,
          username: cleanUser,
          email: cleanEmail,
          password: cleanPwd,
          gender: gender || 'Maschile',
          age: parseInt(age, 10) || 25,
          experience: 'Intermedio (1-3 Anni)',
          preferredAsset: 'Crypto & Forex',
          theme: 'dark',
          currency: 'USD ($)',
          defaultLot: '1.0',
          defaultSlPct: '3.0',
          defaultTpPct: '6.0',
          createdAt: nowISO,
          trialStartedAt: nowISO,
          appData: initialAppData,
          subscription: { active: false }
        };

        memoryCache[lowerUser] = newAccount;
        await saveCloudBlob();
        return res.status(200).json({ success: true, user: newAccount, data: memoryCache });
      }

      // AZIONE 2: LOGIN DIRECT SERVER-SIDE
      if (body && body.action === 'login') {
        const query = (body.usernameOrEmail || body.query || '').trim().toLowerCase();
        const inputPwd = (body.password || '').trim();

        const found = Object.values(memoryCache).find(
          acc => acc && (
            (acc.username && acc.username.trim().toLowerCase() === query) ||
            (acc.email && acc.email.trim().toLowerCase() === query)
          )
        );

        if (!found) {
          return res.status(404).json({ error: 'Account non trovato. Registrati sul sito web oppure verifica le credenziali.' });
        }

        const storedPwd = (found.password || '').trim();
        if (storedPwd !== inputPwd) {
          return res.status(401).json({ error: 'Password errata. Riprova.' });
        }

        return res.status(200).json({ success: true, user: found, data: memoryCache });
      }

      // AZIONE 3: SCRITTURA/MERGE ACCOUNT STANDARD (POST/PUT GENERICO PER DATA O ACCOUNTS)
      if (body && (body.data || body.accounts)) {
        const incoming = body.data || body.accounts;
        if (incoming && typeof incoming === 'object') {
          Object.keys(incoming).forEach((key) => {
            const cleanKey = key.trim().toLowerCase();
            if (cleanKey === 'action' || cleanKey === 'query' || cleanKey === 'password') return;

            if (memoryCache[cleanKey]) {
              memoryCache[cleanKey] = {
                ...memoryCache[cleanKey],
                ...incoming[key],
                appData: (incoming[key].appData || memoryCache[cleanKey].appData)
                  ? mergeAppData(memoryCache[cleanKey].appData, incoming[key].appData)
                  : memoryCache[cleanKey].appData
              };
            } else {
              memoryCache[cleanKey] = incoming[key];
            }
          });
        }
        await saveCloudBlob();
      }

      return res.status(200).json({ data: memoryCache });
    } catch (e) {
      console.error('Update JSON Blob Error:', e);
      return res.status(200).json({ data: memoryCache });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
