import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriesApi } from '../api';
import { CreateCategoryRequest } from '../types';
import toast from 'react-hot-toast';

export interface UseCategoriesParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  enabled?: boolean;
}

export const useCategories = (params: UseCategoriesParams = {}) => {
  const { enabled = true, ...queryParams } = params;

  console.log('useCategories hook called with params:', { enabled, queryParams });

  return useQuery({
    queryKey: ['categories', queryParams],
    queryFn: () => {
      console.log('Categories API call being made with params:', queryParams);
      return categoriesApi.getCategories(queryParams);
    },
    enabled,
  });
};

export const useCreateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateCategoryRequest) => categoriesApi.createCategory(data),
    onSuccess: (data) => {
      toast.success(data.message || 'Category created successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to create category');
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<CreateCategoryRequest> }) =>
      categoriesApi.updateCategory(id, data),
    onSuccess: (data) => {
      toast.success(data.message || 'Category updated successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to update category');
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => categoriesApi.deleteCategory(id),
    onSuccess: (data) => {
      toast.success(data.message || 'Category deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || 'Failed to delete category');
    },
  });
}; 