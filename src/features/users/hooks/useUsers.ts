import { useQuery } from '@tanstack/react-query';
import { apiClient } from '../../../lib/axios';
import { useAuthContext } from '../../auth/context/AuthContext';

export type User = {
  _id: string;
  name: string;
  email: string;
  role: string;
  userStatus: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type UsersResponse = {
  users: User[];
  pagination: PaginationInfo;
};

type UseUsersOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  enabled?: boolean;
};

export const useUsers = (options: UseUsersOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'email',
    sortOrder = 'asc',
    search = '',
    enabled = true,
  } = options;

  // Get authentication state
  const { isAuthenticated, isInitialized } = useAuthContext();

  const shouldEnable = enabled && isAuthenticated && isInitialized;
  
  console.log('useUsers hook:', {
    enabled,
    isAuthenticated,
    isInitialized,
    shouldEnable,
    search,
    page,
    limit
  });

  return useQuery({
    queryKey: ['users', { page, limit, sortBy, sortOrder, search }],
    queryFn: async () => {
      try {
        // Construct the URL exactly like the curl command with search parameter
        const url = `/api/users?page=${page}&limit=${limit}&sortBy=${sortBy}&sortOrder=${sortOrder}${search ? `&search=${encodeURIComponent(search)}` : ''}`;
        console.log('Making GET request to:', url);
        
        const { data } = await apiClient.get<UsersResponse>(url, {
          headers: {
            'Accept': 'application/json',
          },
        });
        
        console.log('Users API response:', data);
        return data;
      } catch (error: any) {
        console.error('Error fetching users:', {
          status: error.response?.status,
          statusText: error.response?.statusText,
          data: error.response?.data,
          headers: error.response?.headers,
          config: {
            url: error.config?.url,
            method: error.config?.method,
            headers: error.config?.headers,
          },
        });
        throw error;
      }
    },
    enabled: shouldEnable, // Only fetch when authenticated and initialized
    retry: false,
  });
}; 