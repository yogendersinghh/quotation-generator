import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../lib/axios';

export type User = {
  id: string;
  name: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  status: 'active' | 'blocked';
  createdBy: string;
  createdAt: Date;
};

export type CreateUserData = Omit<User, 'id' | 'createdAt'>;
export type UpdateUserData = Partial<CreateUserData>;

// API endpoints
const USERS_ENDPOINT = '/users';

// Query keys
export const userKeys = {
  all: ['users'] as const,
  lists: () => [...userKeys.all, 'list'] as const,
  list: (filters: string) => [...userKeys.lists(), { filters }] as const,
  details: () => [...userKeys.all, 'detail'] as const,
  detail: (id: string) => [...userKeys.details(), id] as const,
};

// Fetch all users
export const useUsers = (filters?: { search?: string; role?: string; status?: string }) => {
  return useQuery({
    queryKey: userKeys.list(JSON.stringify(filters)),
    queryFn: async () => {
      const { data } = await apiClient.get<User[]>(USERS_ENDPOINT, { params: filters });
      return data;
    },
  });
};

// Fetch single user
export const useUser = (id: string) => {
  return useQuery({
    queryKey: userKeys.detail(id),
    queryFn: async () => {
      const { data } = await apiClient.get<User>(`${USERS_ENDPOINT}/${id}`);
      return data;
    },
    enabled: !!id,
  });
};

// Create user mutation
export const useCreateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (newUser: CreateUserData) => {
      const { data } = await apiClient.post<User>(USERS_ENDPOINT, newUser);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
    },
  });
};

// Update user mutation
export const useUpdateUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, userData }: { id: string; userData: UpdateUserData }) => {
      const { data } = await apiClient.patch<User>(`${USERS_ENDPOINT}/${id}`, userData);
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.invalidateQueries({ queryKey: userKeys.detail(data.id) });
    },
  });
};

// Delete user mutation
export const useDeleteUser = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      await apiClient.delete(`${USERS_ENDPOINT}/${id}`);
      return id;
    },
    onSuccess: (id) => {
      queryClient.invalidateQueries({ queryKey: userKeys.lists() });
      queryClient.removeQueries({ queryKey: userKeys.detail(id) });
    },
  });
}; 