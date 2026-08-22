import axios from 'axios';

const api = axios.create({
  baseURL: 'https://shaggy-rockets-cheat.loca.lt/api',
  headers: { "Bypass-Tunnel-Reminder": "true",
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request interceptor — attach Bearer token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor — handle 401 globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
