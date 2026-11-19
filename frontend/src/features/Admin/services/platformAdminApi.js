import api from '../../../lib/axios';

export const getPlatformOverview = () => api.get('/api/platform-admin/overview');
export const getPlatformTenants = () => api.get('/api/platform-admin/tenants');
export const createPlatformTenant = (payload) => api.post('/api/platform-admin/tenants', payload);
export const updatePlatformTenant = (tenantId, payload) => api.patch(`/api/platform-admin/tenants/${tenantId}`, payload);
export const getPlatformUsers = () => api.get('/api/platform-admin/users');
export const updatePlatformUser = (userId, payload) => api.patch(`/api/platform-admin/users/${userId}`, payload);
export const deletePlatformTenant = (tenantId) => api.delete(`/api/platform-admin/tenants/${tenantId}`);
export const getPlatformClinics = (tenantId) =>
  api.get('/api/platform-admin/clinics', { params: tenantId ? { tenantId } : undefined });
export const deletePlatformClinic = (clinicId) => api.delete(`/api/platform-admin/clinics/${clinicId}`);
export const getPlatformPosts = (tenantId) =>
  api.get('/api/platform-admin/posts', { params: tenantId ? { tenantId } : undefined });
export const deletePlatformPost = (postId) => api.delete(`/api/platform-admin/posts/${postId}`);
export const getPlatformAuditLogs = (tenantId) =>
  api.get('/api/platform-admin/audit-logs', { params: tenantId ? { tenantId } : undefined });
export const getPlatformMemberships = (tenantId) =>
  api.get('/api/platform-admin/memberships', { params: tenantId ? { tenantId } : undefined });
export const updatePlatformMembershipStatus = (membershipId, status) =>
  api.patch(`/api/platform-admin/memberships/${membershipId}/status`, { status });
export const updatePlatformAccountStatus = (userId, suspended) =>
  api.patch(`/api/platform-admin/users/${userId}/account-status`, { suspended });
