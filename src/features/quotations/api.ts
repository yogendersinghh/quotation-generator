import { apiClient } from '../../lib/axios';
import { QuotationsResponse, QuotationsFilters, Quotation, DashboardStats } from './types';

const QUOTATIONS_ENDPOINT = '/api/quotations';

// Helper function to map frontend status values to backend status values
const mapStatusToBackend = (status: string): string => {
  switch (status) {
    case 'approved':
      return 'accepted';
    case 'rejected':
      return 'rejected';
    case 'pending':
      return 'draft';
    default:
      return status;
  }
};

export const quotationsApi = {
  getQuotations: async (filters?: QuotationsFilters): Promise<QuotationsResponse> => {
    const url = new URL(QUOTATIONS_ENDPOINT, apiClient.defaults.baseURL);
    
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '' && value !== null) {
          // Map status values for backend compatibility
          if (key === 'status' && typeof value === 'string') {
            url.searchParams.append(key, mapStatusToBackend(value));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    
    try {
      const { data } = await apiClient.get<QuotationsResponse>(url.pathname + url.search);
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

  updateQuotationStatus: async (quotationId: string, status: 'pending' | 'approved' | 'rejected'): Promise<void> => {
    console.log('Making PATCH request to update quotation status:', `/api/quotations/admin/${quotationId}/status`);
    
    // Map frontend status to API action
    const action = status === 'approved' ? 'approve' : 'reject';
    
    console.log('Status update:', { status, action });
    try {
      await apiClient.patch(`/api/quotations/admin/${quotationId}/status`, { action });
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
    try {
      const { data } = await apiClient.get<Quotation>(`${QUOTATIONS_ENDPOINT}/${quotationId}`);
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
    try {
      const { data } = await apiClient.post<Quotation>(`${QUOTATIONS_ENDPOINT}/${quotationId}`, updateData);
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
    try {
      const response = await apiClient.post('/api/dashboard/statistics', {
        userId: userId || undefined
      });
      
      // Extract the stats from the response.data.data structure
      const apiData = response.data.data;
      const stats: DashboardStats = {
        totalQuotations: apiData.totalQuotations,
        pendingApprovals: apiData.pendingApproval,
        totalClients: apiData.clientsCreated,
        underDevelopment: apiData.conversionStats.underDevelopment,
        booked: apiData.conversionStats.booked,
        lost: apiData.conversionStats.lost,
        totalEngagedClients: apiData.totalEngagedClients ?? 0,
      };
      
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