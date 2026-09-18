import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  config.headers['x-tenant-slug'] = localStorage.getItem('pawcareTenant') || import.meta.env.VITE_TENANT_SLUG || 'default';
  return config;
});

export default api;
