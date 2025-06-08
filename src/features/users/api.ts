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
}; 