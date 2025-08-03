import { apiClient } from '../../lib/axios';
import { ClientsResponse, CreateClientPayload, CreateClientResponse, Client } from './types';

const CLIENTS_ENDPOINT = '/api/clients';

// New type for the new API
export interface CreateCompanyWithUsersPayload {
  companyName: string;
  companyCode: string;
  address: string;
  place: string;
  city: string;
  state: string;
  PIN: string;
  users: Array<{
    name: string;
    email: string[];
    position: string;
    phone: string[];
  }>;
}

export const clientsApi = {
  getClients: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    search?: string;
    companyName?: string;
  }): Promise<ClientsResponse> => {
    const url = new URL(CLIENTS_ENDPOINT, apiClient.defaults.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          url.searchParams.append(key, String(value));
        }
      });
    }
    try {
      const { data } = await apiClient.get<ClientsResponse>(url.pathname + url.search);
      return data;
    } catch (error: any) {
      console.error('Clients API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // Fetch a single client by ID
  getClientById: async (clientId: string, token?: string): Promise<any> => {
    try {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const { data } = await apiClient.get(`${CLIENTS_ENDPOINT}/${clientId}`, { headers });
      return data;
    } catch (error: any) {
      console.error('Get client by ID API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  createClient: async (payload: CreateClientPayload): Promise<CreateClientResponse> => {
    try {
      const { data } = await apiClient.post<CreateClientResponse>(CLIENTS_ENDPOINT, payload);
      return data;
    } catch (error: any) {
      console.error('Create client API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  // New API for creating company with multiple users
  createCompanyWithUsers: async (payload: CreateCompanyWithUsersPayload, token?: string): Promise<any> => {
    console.log('Making POST request to create company with users:', `${CLIENTS_ENDPOINT}`);
    console.log('Company with users payload:', payload);
    try {
      const headers: any = { 'Content-Type': 'application/json' };
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const { data } = await apiClient.post(CLIENTS_ENDPOINT, payload, { headers });
      console.log('Create company with users response:', data);
      return data;
    } catch (error: any) {
      console.error('Create company with users API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateClient: async (clientId: string, payload: Partial<CreateClientPayload>): Promise<CreateClientResponse> => {
    try {
      const { data } = await apiClient.post<CreateClientResponse>(`${CLIENTS_ENDPOINT}/${clientId}`, payload);
      return data;
    } catch (error: any) {
      console.error('Update client API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  deleteClient: async (clientId: string): Promise<void> => {
    try {
      await apiClient.post(`${CLIENTS_ENDPOINT}/delete`, { clientId });
    } catch (error: any) {
      console.error('Delete client API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getCompanyNames: async (token?: string): Promise<string[]> => {
    try {
      const headers: any = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const { data } = await apiClient.get('/api/clients/company-names', token ? { headers } : undefined);
      // Assuming the API returns { companyNames: string[] }
      return data.companyNames || [];
    } catch (error: any) {
      console.error('Company names API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
}; 