import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { quotationsApi } from '../api';
import { QuotationsFilters } from '../types';
import { useAuthContext } from '../../auth/context/AuthContext';

export const useQuotations = (filters: QuotationsFilters = {}) => {
  const { isAuthenticated, isInitialized } = useAuthContext();
  
  const shouldEnable = isAuthenticated && isInitialized && !!filters.userId;
  
  console.log('useQuotations hook:', {
    filters,
    isAuthenticated,
    isInitialized,
    shouldEnable,
    userId: filters.userId
  });

  return useQuery({
    queryKey: ['quotations', filters],
    queryFn: () => quotationsApi.getQuotations(filters),
    enabled: shouldEnable,
    retry: false,
  });
};

export const useUpdateQuotationStatus = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quotationId, adminStatus }: { quotationId: string; adminStatus: 'approved' | 'rejected' }) =>
      quotationsApi.updateQuotationStatus(quotationId, adminStatus),
    onSuccess: () => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
    },
    onError: (error) => {
      console.error('Failed to update quotation status:', error);
    },
  });
}; 