import axios from 'axios';
import { tokenStorage } from '../features/auth/utils';

// Create axios instance with base URL
export const apiClient = axios.create({
  baseURL: "https://cms-be.yogendersingh.tech",
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  withCredentials: true, // Important for cookies
});

// Request interceptor
apiClient.interceptors.request.use(
  (config) => {
    const token = tokenStorage.getToken();
    
    if (token) {
      // Set Authorization header exactly like the curl command
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    
    if (error.response?.status === 401) {
      tokenStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 