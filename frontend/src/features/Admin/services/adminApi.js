import api from '../../../lib/axios';

export const getAdminOverview = () => api.get('/api/admin/overview');
export const getAdminUsers = () => api.get('/api/admin/users');
export const updateAdminUser = (userId, payload) => api.patch(`/api/admin/users/${userId}`, payload);
export const getAdminClinics = () => api.get('/api/admin/clinics');
export const deleteAdminClinic = (clinicId) => api.delete(`/api/admin/clinics/${clinicId}`);
export const getAdminAppointments = () => api.get('/api/admin/appointments');
export const updateAdminAppointment = (appointmentId, status) =>
  api.patch(`/api/admin/appointments/${appointmentId}`, { status });
export const getAdminReviews = () => api.get('/api/admin/reviews');
export const deleteAdminReview = (reviewId) => api.delete(`/api/admin/reviews/${reviewId}`);
export const getAdminPosts = () => api.get('/api/admin/posts');
export const deleteAdminPost = (postId) => api.delete(`/api/admin/posts/${postId}`);
export const getTenantAuditLogs = () => api.get('/api/admin/audit-logs');
export const createTenant = (payload) => api.post('/api/tenants', payload);
