import axios from 'axios';
import { tokenStorage } from '../features/auth/utils';

// Create axios instance with base URL
export const apiClient = axios.create({
  baseURL: 'http://localhost:3033', // Make sure this matches your backend URL
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
    
    // Log the complete request details
    console.log('Request details:', {
      fullUrl: `${config.baseURL}${config.url}`,
      method: config.method,
      headers: config.headers,
      hasToken: !!token,
      token: token ? `${token.substring(0, 10)}...` : null,
    });
    
    if (token) {
      // Set Authorization header exactly like the curl command
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor
apiClient.interceptors.response.use(
  (response) => {
    console.log('Response received:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data,
      headers: response.headers,
    });
    return response;
  },
  (error) => {
    // Log detailed error information
    console.error('Response error:', {
      url: error.config?.url,
      method: error.config?.method,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      headers: {
        request: error.config?.headers,
        response: error.response?.headers,
      },
    });
    
    if (error.response?.status === 401) {
      console.log('Unauthorized access, clearing auth data');
      tokenStorage.clear();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
); 