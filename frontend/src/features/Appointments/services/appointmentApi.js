import api from '../../../lib/axios';

export const createAppointment = (payload) => api.post('/api/appointments', payload);

export const getAppointment = (appointmentId) => api.get(`/api/appointments/${appointmentId}`);

export const getUserAppointments = () => api.get('/api/appointments');

export const cancelAppointment = (appointmentId) => api.patch(`/api/appointments/${appointmentId}/cancel`);

export const getProviderAppointments = () => api.get('/api/appointments/provider');

export const updateAppointmentStatus = (appointmentId, status) => api.patch(`/api/appointments/provider/${appointmentId}/status`, { status });

export const getMyReviews = () => api.get('/api/reviews/mine');

export const createReview = (payload) => api.post('/api/reviews', payload);

export const updateReview = (reviewId, payload) => api.patch(`/api/reviews/${reviewId}`, payload);

export const deleteReview = (reviewId) => api.delete(`/api/reviews/${reviewId}`);