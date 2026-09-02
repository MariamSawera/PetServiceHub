import api from '../../../lib/axios';

export const getCurrentUser = () => api.get('/api/auth/me');

export const login = (email, password) => api.post('/api/auth/login', { email, password });

export const signup = (payload) => api.post('/api/auth/signup', payload);

export const logout = () => api.post('/api/auth/logout');

export const googleLoginUrl = `${api.defaults.baseURL}/api/auth/google`;
