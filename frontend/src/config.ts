// Central API configuration for local and cloud environments
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

export const getAuthToken = (): string => {
  return localStorage.getItem('campus_ai_token') || '';
};

export const setAuthToken = (token: string): void => {
  if (token) {
    localStorage.setItem('campus_ai_token', token);
  } else {
    localStorage.removeItem('campus_ai_token');
  }
};

export const getAuthHeaders = (extraHeaders: Record<string, string> = {}): Record<string, string> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...extraHeaders
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

// ==========================================
// LIGHTWEIGHT FRONTEND IN-MEMORY CACHE (SWR)
// ==========================================
interface CacheEntry {
  data: any;
  timestamp: number;
  ttlMs: number;
}

const memoryCache = new Map<string, CacheEntry>();

/**
 * Perform a cached GET request.
 * If data is in cache and younger than ttlMs, returns cached value immediately.
 * Mutations (POST, PUT, DELETE) should call invalidateApiCache(prefix).
 */
export const cachedFetch = async (
  url: string,
  options: RequestInit = {},
  ttlMs: number = 60000 // default 60s
): Promise<Response> => {
  const method = (options.method || 'GET').toUpperCase();
  
  // Only cache idempotent GET requests
  if (method !== 'GET') {
    return fetch(url, options);
  }

  const cacheKey = `${url}_${options.headers ? JSON.stringify(options.headers) : ''}`;
  const now = Date.now();
  const cached = memoryCache.get(cacheKey);

  if (cached && (now - cached.timestamp) < cached.ttlMs) {
    return new Response(JSON.stringify(cached.data), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'x-cache-hit': 'true' }
    });
  }

  const res = await fetch(url, options);
  if (res.ok) {
    try {
      const cloned = res.clone();
      const jsonData = await cloned.json();
      memoryCache.set(cacheKey, {
        data: jsonData,
        timestamp: now,
        ttlMs
      });
    } catch {
      // Ignore clone/json parse errors
    }
  }

  return res;
};

/**
 * Invalidate cached endpoints by partial URL matching
 */
export const invalidateApiCache = (urlPrefix?: string) => {
  if (!urlPrefix) {
    memoryCache.clear();
    return;
  }
  for (const key of memoryCache.keys()) {
    if (key.includes(urlPrefix)) {
      memoryCache.delete(key);
    }
  }
};
