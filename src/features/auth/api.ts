import { apiClient } from '../../lib/axios';
import type { LoginCredentials, AuthResponse } from './types';

// Update the auth endpoint to match your backend
const AUTH_ENDPOINT = '/api/users';

export const authApi = {
  login: async (credentials: LoginCredentials): Promise<AuthResponse> => {
    try {
      const { data } = await apiClient.post<AuthResponse>(`${AUTH_ENDPOINT}/login`, credentials);
      return data;
    } catch (error: any) {
      console.error('Login API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  logout: async (): Promise<void> => {
    // You might want to call a logout endpoint if your API has one
    // await apiClient.post(`${AUTH_ENDPOINT}/logout`);
  },
}; 