import axios from 'axios';

const api = axios.create({
  baseURL: 'https://tubanan-api-123.loca.lt/api',
  headers: { "Bypass-Tunnel-Reminder": "true",
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
