import api from '../../../lib/axios';

export const getPets = () => api.get('/api/pets');

export const getPet = (petId) => api.get(`/api/pets/${petId}`);

export const createPet = (payload) => api.post('/api/pets', payload);

export const updatePet = (petId, payload) => api.patch(`/api/pets/${petId}`, payload);

export const deletePet = (petId) => api.delete(`/api/pets/${petId}`);

export const createVaccination = (petId, payload) => api.post(`/api/pets/${petId}/vaccinations`, payload);

export const updateVaccination = (petId, vaccinationId, payload) => api.patch(`/api/pets/${petId}/vaccinations/${vaccinationId}`, payload);

export const deleteVaccination = (petId, vaccinationId) => api.delete(`/api/pets/${petId}/vaccinations/${vaccinationId}`);
