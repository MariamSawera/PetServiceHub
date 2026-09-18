import api from '../../../lib/axios';

export const getNotifications = () => api.get('/api/notifications');
export const markNotificationRead = (notificationId) => api.patch(`/api/notifications/${notificationId}/read`);
export const markAllNotificationsRead = () => api.patch('/api/notifications/read-all');