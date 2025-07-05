import { apiClient } from '../../lib/axios';
import { QuotationsResponse, QuotationsFilters, Quotation, DashboardStats } from './types';

const QUOTATIONS_ENDPOINT = '/api/quotations';

export const quotationsApi = {
  getQuotations: async (filters?: QuotationsFilters): Promise<QuotationsResponse> => {
    const url = new URL(QUOTATIONS_ENDPOINT, apiClient.defaults.baseURL);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    
    console.log('Making GET request to quotations API:', url.toString());
    try {
      const { data } = await apiClient.get<QuotationsResponse>(url.pathname + url.search);
      console.log('Quotations API response:', data);
      return data;
    } catch (error: any) {
      console.error('Quotations API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateQuotationStatus: async (quotationId: string, action: 'approve' | 'reject'): Promise<void> => {
    console.log('Making PATCH request to update quotation status:', `/api/quotations/admin/${quotationId}/status`);
    console.log('Status update:', { action });
    try {
      await apiClient.patch(`/api/quotations/admin/${quotationId}/status`, { action });
      console.log('Quotation status updated successfully:', quotationId);
    } catch (error: any) {
      console.error('Update quotation status API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getQuotation: async (quotationId: string): Promise<Quotation> => {
    console.log('Making GET request to get quotation:', `${QUOTATIONS_ENDPOINT}/${quotationId}`);
    try {
      const { data } = await apiClient.get<Quotation>(`${QUOTATIONS_ENDPOINT}/${quotationId}`);
      console.log('Get quotation API response:', data);
      return data;
    } catch (error: any) {
      console.error('Get quotation API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateQuotation: async (quotationId: string, updateData: Partial<Quotation>): Promise<Quotation> => {
    console.log('Making PUT request to update quotation:', `${QUOTATIONS_ENDPOINT}/${quotationId}`);
    console.log('Update data:', updateData);
    try {
      const { data } = await apiClient.put<Quotation>(`${QUOTATIONS_ENDPOINT}/${quotationId}`, updateData);
      console.log('Update quotation API response:', data);
      return data;
    } catch (error: any) {
      console.error('Update quotation API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getDashboardStats: async (userId?: string): Promise<DashboardStats> => {
    console.log('Making POST request to dashboard statistics API with userId:', userId);
    try {
      const response = await apiClient.post('/api/dashboard/statistics', {
        userId: userId || undefined
      });
      console.log('Dashboard statistics API response:', response.data);
      
      // Extract the stats from the response.data.data structure
      const apiData = response.data.data;
      const stats: DashboardStats = {
        totalQuotations: apiData.totalQuotations,
        pendingApprovals: apiData.pendingApproval,
        totalClients: apiData.clientsCreated,
        underDevelopment: apiData.conversionStats.underDevelopment,
        booked: apiData.conversionStats.booked,
        lost: apiData.conversionStats.lost,
      };
      
      console.log('Processed dashboard stats:', stats);
      return stats;
    } catch (error: any) {
      console.error('Dashboard statistics API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
}; 