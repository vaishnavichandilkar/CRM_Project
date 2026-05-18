import axios from 'axios';
import { toast } from 'sonner';

const api = axios.create({
  baseURL: 'http://localhost:5000',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add interceptor to include JWT token in requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle authentication and global errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || 'An unexpected error occurred';
    
    if (error.response?.status === 401) {
      const isAuthPath = error.config.url?.includes('/auth/signin') || error.config.url?.includes('/auth/signup');
      if (!isAuthPath && window.location.pathname !== '/login') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    } else if (error.response?.status === 409) {
      toast.error(message); // Conflict error (e.g., overlapping calls)
    } else if (error.response?.status === 400) {
      // Handle validation errors (array or string)
      if (Array.isArray(message)) {
        message.forEach(msg => toast.error(msg));
      } else {
        toast.error(message);
      }
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
