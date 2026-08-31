import axios from 'axios';

const api = axios.create({
  baseURL: 'https://posyandu-tubanan-api-production-6ff3.up.railway.app/api',
  headers: { "Bypass-Tunnel-Reminder": "true", "ngrok-skip-browser-warning": "true",
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('kader_auth_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('kader_auth_token');
      localStorage.removeItem('kader_auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
