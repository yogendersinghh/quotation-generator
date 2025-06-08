import { apiClient } from '../../lib/axios';
import { ClientsResponse, CreateClientPayload, CreateClientResponse, Client } from './types';

const CLIENTS_ENDPOINT = '/api/clients';

export const clientsApi = {
  getClients: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ClientsResponse> => {
    const url = new URL(CLIENTS_ENDPOINT, apiClient.defaults.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    console.log('Making GET request to clients API:', url.toString());
    try {
      const { data } = await apiClient.get<ClientsResponse>(url.pathname + url.search);
      console.log('Clients API response:', data);
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

  createClient: async (payload: CreateClientPayload): Promise<CreateClientResponse> => {
    console.log('Making POST request to create client:', `${CLIENTS_ENDPOINT}`);
    console.log('Client payload:', payload);
    try {
      const { data } = await apiClient.post<CreateClientResponse>(CLIENTS_ENDPOINT, payload);
      console.log('Create client response:', data);
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

  updateClient: async (payload: Client): Promise<CreateClientResponse> => {
    console.log('Making PUT request to update client:', `${CLIENTS_ENDPOINT}/${payload._id}`);
    console.log('Client update payload:', payload);
    try {
      const { data } = await apiClient.put<CreateClientResponse>(`${CLIENTS_ENDPOINT}/${payload._id}`, payload);
      console.log('Update client response:', data);
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
    console.log('Making DELETE request to delete client:', `${CLIENTS_ENDPOINT}/${clientId}`);
    try {
      await apiClient.delete(`${CLIENTS_ENDPOINT}/${clientId}`);
      console.log(`Client ${clientId} deleted successfully`);
    } catch (error: any) {
      console.error('Delete client API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
}; 