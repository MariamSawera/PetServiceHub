import api from '../../../lib/axios';

export const getProfile = () => api.get('/api/profile');

export const saveProfile = (payload) => api.put('/api/profile', payload);
