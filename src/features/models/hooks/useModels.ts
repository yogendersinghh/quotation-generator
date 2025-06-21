import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { modelsApi } from '../api';
import { CreateModelRequest, UpdateModelRequest } from '../types';
import toast from 'react-hot-toast';

export const useModels = () => {
  return useQuery({
    queryKey: ['models'],
    queryFn: () => modelsApi.getModels(),
  });
};

export const useCreateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateModelRequest) => modelsApi.createModel(data),
    onSuccess: () => {
      toast.success('Model created successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create model');
    },
  });
};

export const useUpdateModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModelRequest }) =>
      modelsApi.updateModel({ id, data }),
    onSuccess: () => {
      toast.success('Model updated successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update model');
    },
  });
};

export const useDeleteModel = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => modelsApi.deleteModel(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Model deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['models'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete model');
    },
  });
}; 