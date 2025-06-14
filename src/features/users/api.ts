import { apiClient } from '../../lib/axios';
import { User } from './hooks/useUsers'; // Assuming User type is shared

export type RegisterCredentials = {
  email: string;
  password: string;
  name: string;
  role: string;
  userStatus: string;
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
};

const USERS_ENDPOINT = '/api/users';

export const usersApi = {
  register: async (credentials: RegisterCredentials): Promise<RegisterResponse> => {
    console.log('Making user registration request to:', `${USERS_ENDPOINT}/register`);
    console.log('Registration credentials:', { email: credentials.email, name: credentials.name, role: credentials.role, userStatus: credentials.userStatus });
    try {
      const { data } = await apiClient.post<RegisterResponse>(`${USERS_ENDPOINT}/register`, credentials);
      console.log('User registration response:', data);
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
    console.log('Making user update request to:', `${USERS_ENDPOINT}/${userId}`);
    console.log('Update data:', userData);
    try {
      const { data } = await apiClient.put<User>(`${USERS_ENDPOINT}/${userId}`, userData);
      console.log('User update response:', data);
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
    console.log('Making user delete request to:', `${USERS_ENDPOINT}/${userId}`);
    try {
      await apiClient.delete(`${USERS_ENDPOINT}/${userId}`);
      console.log('User deleted successfully:', userId);
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