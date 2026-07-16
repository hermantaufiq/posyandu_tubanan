import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:8000/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor to add auth token if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('nakes_auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Interceptor to handle 401 (token expired / invalid)
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('nakes_auth_token');
      localStorage.removeItem('nakes_auth_user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
