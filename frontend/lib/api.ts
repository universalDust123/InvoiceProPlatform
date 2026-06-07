import apiClient from './api-client';

export const authApi = {
  register: (data: { fullName: string; email: string; password: string; tenantId: string }) =>
    apiClient.post('/api/auth/register', data),
  login: (data: { email: string; password: string; tenantId?: string }) =>
    apiClient.post('/api/auth/login', data),
  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export const invoiceApi = {
  list: () => apiClient.get('/api/invoices'),
  create: (data: any) => apiClient.post('/api/invoices', data),
  update: (id: string, data: any) => apiClient.put(`/api/invoices/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/invoices/${id}`),
  getById: (id: string) => apiClient.get(`/api/invoices/${id}`),
  sendInvoice: (id: string) => apiClient.post(`/api/invoices/${id}/send`, {}),
  markAsPaid: (id: string) => apiClient.post(`/api/invoices/${id}/mark-paid`, {}),
  sendEmail: (id: string) => apiClient.post(`/api/invoices/${id}/send-email`, {}),
  downloadPdf: (id: string) => apiClient.get(`/api/invoices/${id}/download-pdf`, { responseType: "blob" }),
};

export const customerApi = {
  list: () => apiClient.get('/api/customers/list'),
  create: (data: any) => apiClient.post('/api/customers', data),
  update: (id: string, data: any) => apiClient.put(`/api/customers/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/customers/${id}`),
  getById: (id: string) => apiClient.get(`/api/customers/${id}`),
};

export const analyticsApi = {
  getDashboardStats: () => apiClient.get('/api/analytics/dashboard'),
};

export const templateApi = {
  list: () => apiClient.get('/api/line-item-templates'),
  create: (data: any) => apiClient.post('/api/line-item-templates', data),
  update: (id: string, data: any) => apiClient.put(`/api/line-item-templates/${id}`, data),
  delete: (id: string) => apiClient.delete(`/api/line-item-templates/${id}`),
};

export const userApi = {
  getProfile: () => apiClient.get('/api/users/profile'),
  updateProfile: (data: { fullName?: string; email?: string }) =>
    apiClient.put('/api/users/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    apiClient.post('/api/users/change-password', data),
  updateNotifications: (data: any) =>
    apiClient.put('/api/users/notifications', data),
  getNotifications: () => apiClient.get('/api/users/notifications'),
  updatePreferences: (data: any) =>
    apiClient.put('/api/users/preferences', data),
  getPreferences: () => apiClient.get('/api/users/preferences'),
  deleteAccount: () => apiClient.delete('/api/users/account'),
};


export default {
  authApi,
  invoiceApi,
  customerApi,
  analyticsApi,
  templateApi,
  userApi,
};
