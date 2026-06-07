import axios, { AxiosInstance, AxiosError } from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export const apiClient: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor to add JWT token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn(
        'No token found in localStorage. Authentication may fail.'
      );
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,

  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Clear auth on 401
      localStorage.removeItem('token');
      localStorage.removeItem('user');

      window.location.href = '/auth/login';
    } else if (error.response?.status === 403) {
      toast.error('Access denied');
    } else if (error.response?.data) {
      const errorData = error.response.data as {
        message?: string;
        error?: string;
      };

      const message =
        errorData.message ||
        errorData.error ||
        'An error occurred';

      toast.error(message);
    }

    return Promise.reject(error);
  }
);

export default apiClient;