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
  },
  lucas: {
    id: 'usr_lucas123',
    username: 'Lucas',
    email: 'lucas@gmail.com',
    password: 'Lucas'
  }
};

let memoryCache = { ...DEFAULT_ACCOUNTS };

async function loadFromBlob() {
  try {
    const res = await fetch(JSON_BLOB_URL, {
      headers: { 'Accept': 'application/json' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        memoryCache = { ...DEFAULT_ACCOUNTS, ...data };
      }
    }
  } catch (e) {
    // fallback cache in memoria
  }
}

async function saveToBlob(data) {
  try {
    await fetch(JSON_BLOB_URL, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
      body: JSON.stringify(data)
    });
  } catch (e) {
    // fallback cache in memoria
  }
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  await loadFromBlob();

  let body = req.body;
  if (typeof body === 'string') {
    try { body = JSON.parse(body); } catch (e) {}
  } else if (body && Buffer.isBuffer(body)) {
    try { body = JSON.parse(body.toString('utf-8')); } catch (e) {}
  }

  if (req.method === 'POST' || req.method === 'PUT') {
    const action = body ? body.action : null;
    const query = body ? (body.query || body.usernameOrEmail) : null;
    const pwd = body ? body.password : null;

    if (action === 'login') {
      const targetQuery = (query || '').toString().trim().toLowerCase();
      const found = Object.values(memoryCache).find(
        acc => acc && typeof acc === 'object' && (
          (typeof acc.username === 'string' && acc.username.trim().toLowerCase() === targetQuery) ||
          (typeof acc.email === 'string' && acc.email.trim().toLowerCase() === targetQuery)
        )
      );

      if (!found) {
        return res.status(404).json({ error: 'Account non trovato. Registrati sul sito web o nell\'app oppure verifica le credenziali.' });
      }

      if ((found.password || '').toString().trim() !== (pwd || '').toString().trim()) {
        return res.status(401).json({ error: 'Password errata. Riprova.' });
      }

      return res.status(200).json({ success: true, user: found, data: memoryCache });
    }

    if (action === 'register') {
      const cleanUser = (body.username || '').toString().trim();
      const cleanEmail = (body.email || '').toString().trim();
      const cleanPwd = (body.password || '').toString().trim();

      if (!cleanUser || !cleanEmail || !cleanPwd) {
        return res.status(400).json({ error: 'Nome utente, email e password sono obbligatori.' });
      }

      const lowerUser = cleanUser.toLowerCase();
      const lowerEmail = cleanEmail.toLowerCase();

      const exists = Object.values(memoryCache).some(
        acc => acc && typeof acc === 'object' && (
          (typeof acc.username === 'string' && acc.username.trim().toLowerCase() === lowerUser) ||
          (typeof acc.email === 'string' && acc.email.trim().toLowerCase() === lowerEmail)
        )
      );

      if (exists) {
        return res.status(400).json({ error: 'Un account con questo Nome Utente o Email esiste già. Effettua l\'accesso.' });
      }

      const newAccount = {
        id: `usr_${Date.now()}`,
        username: cleanUser,
        email: cleanEmail,
        password: cleanPwd,
        gender: body.gender || 'Maschile',
        age: parseInt(body.age, 10) || 25,
        createdAt: new Date().toISOString(),
        trialStartedAt: new Date().toISOString(),
        appData: {
          balance: 10000,
          positions: [],
          closedTrades: [],
          notifications: [{ id: Date.now(), type: 'NEXUS SYSTEM', message: `Benvenuto su Nexus AI ${cleanUser}!` }],
          chatSessions: [{ id: `sess-${Date.now()}`, title: 'Conversazione Principale', messages: [{ id: 1, sender: 'ai', text: `Ciao ${cleanUser}!` }] }]
        },
        subscription: { active: false }
      };

      memoryCache[lowerUser] = newAccount;
      await saveToBlob(memoryCache);
      return res.status(200).json({ success: true, user: newAccount, data: memoryCache });
    }

    // Se vengono inviati dati aggiornati dall'app (pushCloudAccounts)
    if (body && body.data && typeof body.data === 'object') {
      Object.keys(body.data).forEach(k => {
        const key = k.trim().toLowerCase();
        if (memoryCache[key]) {
          memoryCache[key] = {
            ...memoryCache[key],
            ...body.data[k],
            appData: body.data[k].appData || memoryCache[key].appData
          };
        } else {
          memoryCache[key] = body.data[k];
        }
      });
      await saveToBlob(memoryCache);
      return res.status(200).json({ success: true, data: memoryCache });
    }
  }

  return res.status(200).json({ data: memoryCache });
}

