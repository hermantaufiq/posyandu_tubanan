import axios from 'axios';

const api = axios.create({
  baseURL: 'https://sipo-api-tubanan.loca.lt/api',
  headers: { "Bypass-Tunnel-Reminder": "true", 'Content-Type': 'application/json', Accept: 'application/json' },
});

api.interceptors.request.use(cfg => {
  const token = localStorage.getItem('admin_auth_token');
  if (token) cfg.headers.Authorization = `Bearer ${token}`;
  return cfg;
});

api.interceptors.response.use(r => r, err => {
  if (err.response?.status === 401) {
    localStorage.removeItem('admin_auth_token');
    localStorage.removeItem('admin_auth_user');
    window.location.href = '/login';
  }
  return Promise.reject(err);
});

export default api;
