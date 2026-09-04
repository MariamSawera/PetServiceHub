import api from '../../../lib/axios';

export const getClinics = () => api.get('/api/clinics');

export const getNearbyClinics = ({ longitude, latitude, maxDistance, limit, specialty } = {}) => api.get('/api/clinics/nearby', {
	params: { longitude, latitude, maxDistance, limit, specialty },
});

export const getOwnedClinics = () => api.get('/api/clinics/mine');

export const getClinic = (clinicId) => api.get(`/api/clinics/${clinicId}`);

export const createClinic = (payload) => api.post('/api/clinics', payload);

export const updateClinic = (clinicId, payload) => api.patch(`/api/clinics/${clinicId}`, payload);

export const deleteClinic = (clinicId) => api.delete(`/api/clinics/${clinicId}`);