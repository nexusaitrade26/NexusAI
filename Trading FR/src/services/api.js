import {
  getFallbackStudioLevels,
  getFallbackStudioCategories,
  getFallbackLessonDetail,
  toggleCompletedLesson,
  FALLBACK_WORKAREA_POSITIONS,
  FALLBACK_WORKAREA_ORDERS,
  FALLBACK_WORKAREA_TRADES,
  FALLBACK_WORKAREA_RISK,
  FALLBACK_WORKAREA_STATS,
  getFallbackNews,
  getFallbackAiAnalysis
} from './fallbackData';

const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.location && window.location.hostname) {
    const host = window.location.hostname;
    const protocol = window.location.protocol === 'https:' ? 'https:' : 'http:';
    if (host.includes('loca.lt') || host.includes('ngrok') || host.includes('tunnel')) {
      return `${protocol}//${host}/api`;
    }
    return `${protocol}//${host}:3001/api`;
  }
  return 'http://localhost:3001/api';
};

export async function fetchApi(endpoint, options = {}) {
  const url = `${getApiBaseUrl()}${endpoint}`;
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Bypass-Tunnel-Reminder': 'true'
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      const error = new Error(errorData.error || `Errore HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return await response.json();
  } catch (err) {
    console.warn(`Fallback dati locali per endpoint ${endpoint}:`, err.message);

    // Default safe fallbacks to ensure React UI never crashes or renders blank on mobile
    if (endpoint.includes('/portfolio/positions')) {
      return FALLBACK_WORKAREA_POSITIONS;
    }
    if (endpoint.includes('/journal/trades')) {
      return FALLBACK_WORKAREA_TRADES;
    }
    if (endpoint.includes('/portfolio/risk-score')) {
      return FALLBACK_WORKAREA_RISK;
    }
    if (endpoint.includes('/journal/stats')) {
      return FALLBACK_WORKAREA_STATS;
    }
    if (endpoint.includes('/trade/orders')) {
      return FALLBACK_WORKAREA_ORDERS;
    }
    if (endpoint.includes('/trade/news')) {
      const match = endpoint.match(/asset=([^&]+)/);
      const asset = match ? decodeURIComponent(match[1]) : 'BTC/USD';
      return getFallbackNews(asset);
    }
    if (endpoint.includes('/trade/ai-analysis')) {
      let asset = 'BTC/USD';
      let budget = 1000;
      if (options.body) {
        try {
          const parsed = JSON.parse(options.body);
          if (parsed.asset) asset = parsed.asset;
          if (parsed.budget) budget = parsed.budget;
        } catch (_) {}
      }
      return getFallbackAiAnalysis(asset, budget);
    }
    if (endpoint.includes('/progress')) {
      const match = endpoint.match(/\/studio\/lessons\/([^/]+)\/progress/);
      const lessonId = match ? match[1] : null;
      let completed = true;
      if (options.body) {
        try {
          const parsed = JSON.parse(options.body);
          if (typeof parsed.completed === 'boolean') completed = parsed.completed;
        } catch (_) {}
      }
      if (lessonId) {
        toggleCompletedLesson(lessonId, completed);
      }
      return { success: true, lessonId, completed };
    }
    if (endpoint.includes('/studio/levels')) {
      return { levels: getFallbackStudioLevels() };
    }
    if (endpoint.includes('/studio/categories')) {
      const match = endpoint.match(/level_code=([^&]+)/);
      const levelCode = match ? match[1] : 'base';
      return getFallbackStudioCategories(levelCode);
    }
    if (endpoint.includes('/studio/lessons/')) {
      const lessonId = endpoint.split('/studio/lessons/')[1]?.split('/')[0];
      return getFallbackLessonDetail(lessonId);
    }
    if (endpoint.includes('/trade/order')) {
      return { message: 'Ordine registrato con successo (modalità offline)' };
    }
    return {};
  }
}
