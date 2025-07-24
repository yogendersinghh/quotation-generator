import { apiClient } from '../../lib/axios';
import { User } from './hooks/useUsers'; // Assuming User type is shared

export type RegisterCredentials = {
  email: string;
  password: string;
  name: string;
  role: string;
  userStatus: string;
  signature: string;
};

export type RegisterResponse = {
  message: string;
  user: User;
};

export type UpdateUserData = {
  name?: string;
  email?: string;
  role?: string;
  userStatus?: string;
  signature?: string;
};

const USERS_ENDPOINT = '/api/users';

export const usersApi = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    try {
      const { data } = await apiClient.post<RegisterResponse>(`${USERS_ENDPOINT}/register`, credentials);
      return data;
    } catch (error: any) {
      console.error('User registration API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  update: async (userId: string, userData: UpdateUserData): Promise<User> => {
    try {
      const { data } = await apiClient.post<User>(`${USERS_ENDPOINT}/${userId}`, userData);
      return data;
    } catch (error: any) {
      console.error('User update API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  delete: async (userId: string): Promise<void> => {
    try {
      await apiClient.post(`${USERS_ENDPOINT}/delete`, { userId });
    } catch (error: any) {
      console.error('User delete API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
}; 