import { apiClient } from '../../lib/axios';
import { QuotationsResponse, QuotationsFilters } from './types';

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

  updateQuotationStatus: async (quotationId: string, adminStatus: 'approved' | 'rejected'): Promise<void> => {
    console.log('Making PUT request to update quotation status:', `${QUOTATIONS_ENDPOINT}/${quotationId}/status`);
    console.log('Status update:', { adminStatus });
    try {
      await apiClient.put(`${QUOTATIONS_ENDPOINT}/${quotationId}/status`, { adminStatus });
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
}; 