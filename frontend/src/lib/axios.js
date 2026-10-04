import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const tenantSlug = localStorage.getItem('pawcareTenant') || import.meta.env.VITE_TENANT_SLUG;
  if (tenantSlug && tenantSlug !== 'default') config.headers['x-tenant-slug'] = tenantSlug;
  return config;
});

export default api;
