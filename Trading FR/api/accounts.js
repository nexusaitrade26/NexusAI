// Vercel Serverless Cloud DB Server & Sync Endpoint per Nexus AI
const CLOUD_OBJECT_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019fc7b93d956944';

export default async function handler(req, res) {
  // Configurazione CORS universale e totale per Native Android WebView, Capacitor, iOS, Web App, Chrome e Safari
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // GET: Lettura Server-to-Server dal Database Cloud
  if (req.method === 'GET') {
    try {
      const cloudRes = await fetch(`${CLOUD_OBJECT_URL}?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      if (cloudRes.ok) {
        const json = await cloudRes.json();
        return res.status(200).json({ data: json.data || {} });
      }
    } catch (e) {
      console.error('Server DB fetch error:', e);
    }
    return res.status(200).json({ data: {} });
  }

  // POST / PUT: Scrittura Server-to-Server nel Database Cloud (con MERGE sicuro)
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const accountsData = (body && body.data) ? body.data : (body && body.accounts) ? body.accounts : body;

      // 1. Fetch preventivo dei dati correnti dal DB per fare MERGE senza mai perdere account
      let existingAccounts = {};
      try {
        const getRes = await fetch(`${CLOUD_OBJECT_URL}?t=${Date.now()}`, {
          headers: { 'Cache-Control': 'no-cache' }
        });
        if (getRes.ok) {
          const getJson = await getRes.json();
          if (getJson && getJson.data && typeof getJson.data === 'object') {
            existingAccounts = getJson.data;
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
    } catch (e) {
      console.error('Server DB update error:', e);
    }
    return res.status(500).json({ error: 'Errore durante il salvataggio sul Server Cloud' });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
