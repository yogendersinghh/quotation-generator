import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../api';
import { RegisterCredentials } from '../api';

export const useCreateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (credentials: RegisterCredentials) => {
      return usersApi.register(credentials);
    },
    onSuccess: () => {
      toast.success('User created successfully!');
      // Invalidate the users query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (error: any) => {
      console.error('Create user mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to create user. Please try again.';
      toast.error(errorMessage);
    },
  });
}; 