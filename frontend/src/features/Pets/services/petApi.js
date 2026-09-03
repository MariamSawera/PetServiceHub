import api from '../../../lib/axios';

export const getPets = () => api.get('/api/pets');

export const getPet = (petId) => api.get(`/api/pets/${petId}`);

export const createPet = (payload) => api.post('/api/pets', payload);

export const updatePet = (petId, payload) => api.patch(`/api/pets/${petId}`, payload);

export const deletePet = (petId) => api.delete(`/api/pets/${petId}`);
