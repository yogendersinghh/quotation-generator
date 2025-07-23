import { apiClient } from '../../lib/axios';
import {
  CreateProductRequest,
  CreateProductResponse,
  ProductsResponse,
  UpdateProductRequest,
  UpdateProductResponse,
  UploadImageResponse,
} from './types';

const PRODUCTS_ENDPOINT = '/api/products';
const UPLOAD_ENDPOINT = '/api/upload/product-image';

export const productsApi = {
  getProductById: async (id: string): Promise<any> => {
    try {
      const { data } = await apiClient.get(`${PRODUCTS_ENDPOINT}/${id}`);
      return data;
    } catch (error: any) {
      console.error('Get product by ID error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  getProducts: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
    categories?: string | string[];
  }): Promise<ProductsResponse> => {
    const url = new URL(PRODUCTS_ENDPOINT, apiClient.defaults.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (key === 'categories') {
            // Support both string and array
            const catValue = Array.isArray(value) ? value.join(',') : value;
            url.searchParams.append(key, String(catValue));
          } else {
            url.searchParams.append(key, String(value));
          }
        }
      });
    }
    try {
      const { data } = await apiClient.get<ProductsResponse>(url.pathname + url.search);
      return data;
    } catch (error: any) {
      console.error('Products API error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  uploadProductImage: async (imageFile: File): Promise<UploadImageResponse> => {
    const formData = new FormData();
    formData.append('image', imageFile);
    try {
      const { data } = await apiClient.post<UploadImageResponse>(UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return data;
    } catch (error: any) {
      console.error('Image upload error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  createProduct: async (productData: CreateProductRequest): Promise<CreateProductResponse> => {
    try {
      const { data } = await apiClient.post<CreateProductResponse>(PRODUCTS_ENDPOINT, productData);
      return data;
    } catch (error: any) {
      console.error('Create product error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  updateProduct: async ({
    id,
    productData,
  }: {
    id: string;
    productData: UpdateProductRequest;
  }): Promise<UpdateProductResponse> => {
    try {
      const { data } = await apiClient.post<UpdateProductResponse>(
        `${PRODUCTS_ENDPOINT}/${id}`,
        productData
      );
      return data;
    } catch (error: any) {
      console.error('Update product error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },

  deleteProduct: async (id: string): Promise<void> => {
    try {
      await apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`);
    } catch (error: any) {
      console.error('Delete product error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message,
      });
      throw error;
    }
  },
}; 