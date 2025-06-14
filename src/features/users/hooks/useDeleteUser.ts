import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersApi } from '../api';

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (userId: string) => {
      return usersApi.delete(userId);
    },
    onSuccess: (_, userId) => {
      toast.success('User deleted successfully!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      // Optionally, remove the specific user from cache
      queryClient.removeQueries({ queryKey: ['users', userId] });
    },
    onError: (error: any) => {
      console.error('Delete user mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete user. Please try again.';
      toast.error(errorMessage);
    },
  });
}; 