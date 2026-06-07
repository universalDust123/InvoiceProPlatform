import apiClient from './api-client';

export const notificationApi = {
  list: () => apiClient.get('/api/notifications'),
  getUnread: () => apiClient.get('/api/notifications/unread'),
  markAsRead: (id: string) => apiClient.put(`/api/notifications/${id}/read`, {}),
  markAllAsRead: () => apiClient.put('/api/notifications/read-all', {}),
  delete: (id: string) => apiClient.delete(`/api/notifications/${id}`),
  deleteAll: () => apiClient.delete('/api/notifications'),
};

export default notificationApi;
