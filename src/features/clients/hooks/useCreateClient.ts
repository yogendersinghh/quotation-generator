import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { clientsApi } from '../api';
import { CreateClientPayload } from '../types';

export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateClientPayload) => {
      return clientsApi.createClient(payload);
    },
    onSuccess: () => {
      toast.success('Customer created successfully!');
      // Invalidate the clients query to refetch the list
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
    onError: (error: any) => {
      console.error('Create client mutation error:', error);
      const errorMessage = error.response?.data?.message || error.response?.error ||  'Failed to create customer. Please try again.';
      console.error('Error Message:', errorMessage);
      toast.error(errorMessage);
    },
  });
}; 