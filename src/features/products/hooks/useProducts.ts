import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api';

interface UseProductsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export const useProducts = (params?: UseProductsParams) => {
  return useQuery({
    queryKey: ['products', params],
    queryFn: () => productsApi.getProducts(params),
  });
}; 