// Vercel Serverless Cloud DB Server & Sync Endpoint per Nexus AI (Enterprise Persistent Storage)
const JSON_BLOB_URL = 'https://jsonblob.com/api/jsonBlob/019fd232-4705-78b9-8cee-96b6f9558909';

let memoryCache = null;

// Helper per il merge profondo di appData (posizioni, trade chiusi, notifiche, chat)
const mergeAppData = (existing = {}, incoming = {}) => {
  if (!incoming) return existing || {};
  if (!existing) return incoming || {};

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

  // Helper per caricare dal Cloud Blob con fallback a memoria
  const fetchCloudBlob = async () => {
    try {
      const response = await fetch(`${JSON_BLOB_URL}?t=${Date.now()}`, {
        headers: { 'Accept': 'application/json', 'Cache-Control': 'no-cache, no-store' },
        cache: 'no-store'
      });
      if (response.ok) {
        const json = await response.json();
        if (json && typeof json === 'object' && !Array.isArray(json)) {
          memoryCache = { ...(memoryCache || {}), ...json };
          return memoryCache;
        }
      }
    } catch (err) {
      console.error('Fetch JSON Blob Error:', err);
    }
    return memoryCache || {};
  };

  // GET: Lettura account dal Server Cloud
  if (req.method === 'GET') {
    const data = await fetchCloudBlob();
    return res.status(200).json({ data });
  }

  // POST / PUT: Scrittura account nel Server Cloud (Merge Sicuro)
  if (req.method === 'POST' || req.method === 'PUT') {
    try {
      const body = typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
      const incoming = (body && body.data) ? body.data : (body && body.accounts) ? body.accounts : body;

      const current = await fetchCloudBlob();
      const merged = { ...current };

      if (incoming && typeof incoming === 'object') {
        Object.keys(incoming).forEach((key) => {
          if (merged[key]) {
            merged[key] = {
              ...merged[key],
              ...incoming[key],
              appData: (incoming[key].appData || merged[key].appData)
                ? mergeAppData(merged[key].appData, incoming[key].appData)
                : merged[key].appData
            };
          } else {
            merged[key] = incoming[key];
          }
        });
      }

      memoryCache = merged;

      // Salvataggio atomico su JSONBlob
      const putRes = await fetch(JSON_BLOB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(merged)
      });

      if (putRes.ok) {
        const updatedData = await putRes.json();
        memoryCache = updatedData;
        return res.status(200).json({ data: updatedData });
      }

      return res.status(200).json({ data: merged });
    } catch (e) {
      console.error('Update JSON Blob Error:', e);
      return res.status(200).json({ data: memoryCache || {} });
    }
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
