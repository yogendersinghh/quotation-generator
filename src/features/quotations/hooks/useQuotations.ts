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
    mutationFn: ({ quotationId, action }: { quotationId: string; action: 'approve' | 'reject' }) =>
      quotationsApi.updateQuotationStatus(quotationId, action),
    onSuccess: (_, variables) => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      // Also invalidate dashboard stats since approval/rejection affects stats
      queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      console.log(`Quotation ${variables.action}d successfully`);
    },
    onError: (error) => {
      console.error('Failed to update quotation status:', error);
    },
  });
};

export const useQuotation = (quotationId: string, enabled: boolean = true) => {
  const { isAuthenticated, isInitialized } = useAuthContext();
  
  const shouldEnable = enabled && isAuthenticated && isInitialized && !!quotationId;
  
  return useQuery({
    queryKey: ['quotation', quotationId],
    queryFn: () => quotationsApi.getQuotation(quotationId),
    enabled: shouldEnable,
    retry: false,
  });
};

export const useUpdateQuotation = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ quotationId, updateData }: { quotationId: string; updateData: any }) =>
      quotationsApi.updateQuotation(quotationId, updateData),
    onSuccess: (data, variables) => {
      // Invalidate and refetch quotations data
      queryClient.invalidateQueries({ queryKey: ['quotations'] });
      queryClient.invalidateQueries({ queryKey: ['quotation', variables.quotationId] });
    },
    onError: (error) => {
      console.error('Failed to update quotation:', error);
    },
  });
};

export const useDashboardStats = (userId?: string) => {
  const { isAuthenticated, isInitialized } = useAuthContext();
  
  const shouldEnable = isAuthenticated && isInitialized && !!userId;
  
  console.log('useDashboardStats hook:', {
    userId,
    isAuthenticated,
    isInitialized,
    shouldEnable,
    hasUserId: !!userId
  });
  
  return useQuery({
    queryKey: ['dashboard-stats', userId],
    queryFn: () => quotationsApi.getDashboardStats(userId),
    enabled: shouldEnable,
    retry: false,
  });
}; 