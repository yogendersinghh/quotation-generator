import { apiClient } from '../../lib/axios';
import {
  Model,
  CreateModelRequest,
  UpdateModelRequest,
  DeleteModelResponse,
  GetModelsResponse,
} from './types';

export const modelsApi = {
  getModels: async (): Promise<GetModelsResponse> => {
    const response = await apiClient.get('/api/models');
    return response.data;
  },

  createModel: async (data: CreateModelRequest): Promise<Model> => {
    const response = await apiClient.post('/api/models', data);
    return response.data;
  },

  updateModel: async ({ id, data }: { id: string, data: UpdateModelRequest }): Promise<Model> => {
    const response = await apiClient.post(`/api/models/${id}`, data);
    return response.data;
  },

  deleteModel: async (id: string): Promise<DeleteModelResponse> => {
    const response = await apiClient.post('/api/models/delete', { id });
    return response.data;
  },
}; 