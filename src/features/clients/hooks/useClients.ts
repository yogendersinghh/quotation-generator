import { useQuery } from '@tanstack/react-query';
import { clientsApi } from '../api';
import { ClientsResponse } from '../types';

type UseClientsOptions = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  search?: string;
};

export const useClients = (options: UseClientsOptions = {}) => {
  const {
    page = 1,
    limit = 10,
    sortBy = 'name',
    sortOrder = 'desc',
    search,
  } = options;

  return useQuery<ClientsResponse, Error>({
    queryKey: ['clients', { page, limit, sortBy, sortOrder, search }],
    queryFn: () => clientsApi.getClients({ page, limit, sortBy, sortOrder, search }),
    retry: false,
  });
}; 