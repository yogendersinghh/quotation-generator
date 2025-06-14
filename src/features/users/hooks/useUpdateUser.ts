import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi, UpdateUserData } from '../api';
import { User } from './useUsers';

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, userData }: { userId: string; userData: UpdateUserData }) => {
      return usersApi.update(userId, userData);
    },
    onSuccess: (data) => {
      toast.success('User updated successfully!');
      // Invalidate the users list query to refetch the data
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Optionally, update the specific user in cache if needed for other parts of the app
      queryClient.setQueryData(['users', data._id], data);
    },
    onError: (error: any) => {
      console.error('Update user mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update user. Please try again.';
      toast.error(errorMessage);
    },
  });
}; 