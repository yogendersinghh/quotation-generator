import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { productsApi } from '../api';
import type { CreateProductRequest } from '../types';

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  const uploadImageMutation = useMutation({
    mutationFn: (imageFile: File) => productsApi.uploadProductImage(imageFile),
    onError: (error: any) => {
      console.error('Image upload failed:', error);
      toast.error(error.response?.data?.message || 'Failed to upload image');
    },
  });

  const createProductMutation = useMutation({
    mutationFn: (productData: CreateProductRequest) => productsApi.createProduct(productData),
    onSuccess: () => {
      toast.success('Product created successfully!');
      queryClient.invalidateQueries({ queryKey: ['products'] });
    },
    onError: (error: any) => {
      console.error('Product creation failed:', error);
      toast.error(error.response?.data?.message || 'Failed to create product');
    },
  });

  const createProduct = async (productData: Omit<CreateProductRequest, 'productImage'>, imageFile?: File) => {
    try {
      let productImage = '';
      
      if (imageFile) {
        const uploadResult = await uploadImageMutation.mutateAsync(imageFile);
        productImage = uploadResult.filename;
      }

      await createProductMutation.mutateAsync({
        ...productData,
        productImage,
      });
    } catch (error) {
      // Error handling is done in the mutation callbacks
      throw error;
    }
  };

  return {
    createProduct,
    uploadImageMutation,
    isUploading: uploadImageMutation.isPending,
    isCreating: createProductMutation.isPending,
    isPending: uploadImageMutation.isPending || createProductMutation.isPending,
  };
}; 