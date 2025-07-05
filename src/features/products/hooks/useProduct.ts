import { useQuery } from '@tanstack/react-query';
import { productsApi } from '../api';

export const useProduct = (id: string, enabled: boolean = true) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => productsApi.getProductById(id),
    enabled: enabled && !!id,
  });
}; 