import axios from 'axios';

// Simple in-memory cache for GET requests to make navigation instant
const cache = new Map();

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'https://posyandu-tubanan-api-production-6ff3.up.railway.app/api',
  headers: { "Bypass-Tunnel-Reminder": "true", "ngrok-skip-browser-warning": "true", 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_auth_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;

  // If it's a GET request and we have a cached response, return it
  // We use a custom adapter to intercept the request and return cache if available
  if (cfg.method?.toLowerCase() === 'get') {
    const cachedResponse = cache.get(cfg.url);
    if (cachedResponse) {
      cfg.adapter = () => Promise.resolve(cachedResponse);
    }
  }

  return cfg;
});

api.interceptors.response.use(r => {
  // Save successful GET responses to cache
  if (r.config.method?.toLowerCase() === 'get' && r.status >= 200 && r.status < 300) {
    // Clone the response to avoid reference issues
    const responseToCache = {
      data: r.data,
      status: r.status,
      statusText: r.statusText,
      headers: r.headers,
      config: r.config,
      request: r.request
    };
    cache.set(r.config.url, responseToCache);
  }
  
  // Clear cache for related endpoints on mutations (POST, PUT, DELETE)
  if (r.config.method?.toLowerCase() !== 'get') {
    // A simple strategy is to clear all cache on any mutation to ensure data is fresh
    // since we're optimizing for navigation speed but want to avoid stale data after edits.
    cache.clear();
  }
  
  return r;
}, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default api;
