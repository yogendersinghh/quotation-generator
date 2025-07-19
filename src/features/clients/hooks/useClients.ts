import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api';
import { ClientsResponse } from '../types';

type UseClientsOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
  companyName?: string;
};

export const useClients = (options: UseClientsOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 'desc',
    search,
    companyName,
  } = options;

  return useQuery<ClientsResponse, Error>({
    queryKey: ['clients', { page, limit, sortBy, sortOrder, search, companyName }],
    queryFn: () => clientsApi.getClients({ page, limit, sortBy, sortOrder, search, companyName }),
    retry: false,
  });
};

export const useAllClients = () => {
  return useQuery({
    queryKey: ['all-clients'],
    queryFn: async () => {
      const data = await clientsApi.getClients({ page: 1, limit: 1000, sortBy: 'name', sortOrder: 'asc' });
      return data.clients;
    },
  });
};

export const useCompanyNames = () => {
  return useQuery({
    queryKey: ['company-names'],
    queryFn: clientsApi.getCompanyNames,
  });
}; 