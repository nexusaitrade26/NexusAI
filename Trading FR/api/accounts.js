// Vercel Serverless Cloud DB Server & Sync Endpoint per Nexus AI
const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fc7b93d956944';

// In-Memory Backup Server Cache (Persiste nell'istanza serverless di Vercel per velocità istantanea)
let memoryAccountsCache = {
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
    soundOrderExec: true,
    soundSlTp: true,
    notifMarketAi: true,
    notifCopyTrading: true,
    notifCapitalRisk: true,
    createdAt: '2026-08-04T17:23:29.292Z',
    trialStartedAt: '2026-08-04T17:23:29.292Z',
    subscription: {
      active: true,
      plan: 'Piano Trimestrale',
      paymentMethod: 'PayPal Checkout',
      activatedAt: '2026-08-04T17:23:36.059Z',
      expiresAtFormatted: '04/11/2026'
    }
  }
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

  // GET: Lettura Server-to-Server dal Database Cloud
  if (req.method === 'GET') {
    try {
      const cacheBustUrl = `${CLOUD_OBJECT_URL}?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
      const cloudRes = await fetch(cacheBustUrl, {
        headers: { 'Cache-Control': 'no-cache, no-store' },
        cache: 'no-store'
      });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        if (json && json.data && typeof json.data === 'object' && Object.keys(json.data).length > 0) {
          memoryAccountsCache = { ...memoryAccountsCache, ...json.data };
        }
      }
    } catch (e) {
      console.error('Server DB fetch error:', e);
    }
    return res.status(200).json({ data: memoryAccountsCache });
  }

  // POST / PUT: Scrittura Server-to-Server nel Database Cloud (con MERGE sicuro)
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const accountsData = (body && body.data) ? body.data : (body && body.accounts) ? body.accounts : body;

      // 1. Fetch preventivo dai dati correnti dal DB per fare MERGE senza mai perdere account
      let existingAccounts = { ...memoryAccountsCache };
      try {
        const cacheBustUrl = `${CLOUD_OBJECT_URL}?t=${Date.now()}&r=${Math.random().toString(36).substring(7)}`;
        const getRes = await fetch(cacheBustUrl, {
          headers: { 'Cache-Control': 'no-cache, no-store' },
          cache: 'no-store'
        });
        if (getRes.ok) {
          const getJson = await getRes.json();
          if (getJson && getJson.data && typeof getJson.data === 'object') {
            existingAccounts = { ...existingAccounts, ...getJson.data };
          }
        }
      } catch (err) {
        console.warn('Errore lettura preventiva DB Cloud:', err);
      }

      // 2. Merge intelligente di ciascun account
      const mergedAccounts = { ...existingAccounts };
      if (accountsData && typeof accountsData === 'object') {
        Object.keys(accountsData).forEach((uKey) => {
          if (mergedAccounts[uKey]) {
            mergedAccounts[uKey] = {
              ...mergedAccounts[uKey],
              ...accountsData[uKey],
              // Merge profondo per appData se presente
              appData: accountsData[uKey].appData 
                ? { ...(mergedAccounts[uKey].appData || {}), ...accountsData[uKey].appData }
                : mergedAccounts[uKey].appData
            };
          } else {
            mergedAccounts[uKey] = accountsData[uKey];
          }
        });
      }

      // Aggiorna la memoria istantanea del server
      memoryAccountsCache = mergedAccounts;

      const payload = {
        name: 'Nexus_AI_Accounts',
        data: mergedAccounts
      };

      const putRes = await fetch(CLOUD_OBJECT_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (putRes.ok) {
        const json = await putRes.json();
        return res.status(200).json({ data: json.data || mergedAccounts });
      }
      return res.status(200).json({ data: mergedAccounts });
    } catch (e) {
      console.error('Server DB update error:', e);
    }
    return res.status(200).json({ data: memoryAccountsCache });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
