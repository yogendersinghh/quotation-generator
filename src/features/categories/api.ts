import { apiClient } from '../../lib/axios';
import { 
  Category, 
  CreateCategoryRequest, 
  CreateCategoryResponse, 
  GetCategoriesResponse,
  UpdateCategoryResponse,
  DeleteCategoryResponse,
} from './types';

export const categoriesApi = {
  // Get all categories
  getCategories: async (params?: {
    page?: number;
    limit?: number;
    search?: string;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<GetCategoriesResponse> => {
    const response = await apiClient.get('/api/categories', { params });
    return response.data;
  },

  // Create a new category
  createCategory: async (data: CreateCategoryRequest): Promise<CreateCategoryResponse> => {
    const response = await apiClient.post('/api/categories', data);
    return response.data;
  },

  // Update a category
  updateCategory: async (id: string, data: Partial<CreateCategoryRequest>): Promise<UpdateCategoryResponse> => {
    const response = await apiClient.post(`/api/categories/${id}`, data);
    return response.data;
  },

  // Delete a category
  deleteCategory: async (id: string): Promise<DeleteCategoryResponse> => {
    const response = await apiClient.delete(`/api/categories/${id}`);
    return response.data;
  },
}; 