import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productsApi } from '../api';
import type { UpdateProductRequest } from '../types';

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  const updateProductMutation = useMutation({
    mutationFn: ({ id, productData }: { id: string; productData: UpdateProductRequest }) =>
      productsApi.updateProduct({ id, productData }),
    onSuccess: () => {
      toast.success('Product updated successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      console.error('Product update failed:', error);
      toast.error(error.response?.data?.message || 'Failed to update product');
    },
  });

  return {
    updateProduct: updateProductMutation.mutateAsync,
    isUpdating: updateProductMutation.isPending,
  };
}; 