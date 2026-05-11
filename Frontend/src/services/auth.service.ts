import api from './api';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/signin', { email, password });
    if (response.data.access_token) {
      localStorage.setItem('token', response.data.access_token);
      localStorage.setItem('user', JSON.stringify(response.data.user));
    }
    return response.data;
  },

  signup: async (data: any) => {
    const response = await api.post('/auth/signup', data);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  forgotPassword: async (email: string, proposedPassword: string) => {
    console.log('Sending forgotPassword request for:', email);
    const response = await api.post('/auth/forgot-password', { email, proposedPassword });
    return response.data;
  },

  resetPassword: async (email: string) => {
    const response = await api.post('/auth/reset-password', { email });
    return response.data;
  },

  getPendingResetRequests: async () => {
    const response = await api.get('/auth/password-requests/pending');
    return response.data;
  },

  approveResetRequest: async (id: string) => {
    const response = await api.post(`/auth/password-requests/${id}/approve`);
    return response.data;
  },

  rejectResetRequest: async (id: string) => {
    const response = await api.post(`/auth/password-requests/${id}/reject`);
    return response.data;
  }
};

