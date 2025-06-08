import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clientsApi } from '../api';

export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (clientId: string) => {
      return clientsApi.deleteClient(clientId);
    },
    onSuccess: (_, clientId) => {
      toast.success('Customer deleted successfully!');
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      console.log(`Client ${clientId} successfully removed from cache`);
    },
    onError: (error: any) => {
      console.error('Delete client mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to delete customer. Please try again.';
      toast.error(errorMessage);
    },
  });
}; 