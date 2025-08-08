import axios from 'axios';
import Cookies from 'js-cookie';
import toast from 'react-hot-toast';
import { retryWithBackoff } from '../utils/retryUtils';

// Create axios instance
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    // Try to get token from both cookies and localStorage
    let token = Cookies.get('token') || localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle empty responses
    if (error.response?.status === 204 || error.response?.data === '') {
      console.warn('Empty response received');
      return Promise.resolve({ data: null });
    }

    const message = error.response?.data?.message || 'Something went wrong';
    
    // Handle unauthorized access
    if (error.response?.status === 401) {
      Cookies.remove('token');
      Cookies.remove('user');
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/auth/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status === 403) {
      toast.error('Access denied. Please login to continue.');
    } else if (error.response?.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.status === 404) {
      toast.error('Resource not found.');
    } else {
      toast.error(message);
    }
    
    return Promise.reject(error);
  }
);

// Enhanced API methods with retry mechanism
export const apiWithRetry = {
  get: async (url, config = {}) => {
    return retryWithBackoff(() => api.get(url, config));
  },
  
  post: async (url, data = {}, config = {}) => {
    return retryWithBackoff(() => api.post(url, data, config));
  },
  
  put: async (url, data = {}, config = {}) => {
    return retryWithBackoff(() => api.put(url, data, config));
  },
  
  delete: async (url, config = {}) => {
    return retryWithBackoff(() => api.delete(url, config));
  },
  
  patch: async (url, data = {}, config = {}) => {
    return retryWithBackoff(() => api.patch(url, data, config));
  }
};

export default api;
