import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clientsApi } from '../api';
import { Client } from '../types';

export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ clientId, payload }: { clientId: string; payload: any }) => {
      return clientsApi.updateClient(clientId, payload);
    },
    onSuccess: (data) => {
      toast.success('Customer updated successfully!');
      // Invalidate the clients query to refetch the list and update cache for single client
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.setQueryData(['client', data.client._id], data.client); // Optimistic update or direct set
    },
    onError: (error: any) => {
      console.error('Update client mutation error:', error);
      const errorMessage = error.response?.data?.message || 'Failed to update customer. Please try again.';
      console.error('Error Message:', errorMessage);
      toast.error(errorMessage);
    },
  });
}; 