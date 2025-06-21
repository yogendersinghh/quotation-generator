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
  getProducts: async (params?: {
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }): Promise<ProductsResponse> => {
    const url = new URL(PRODUCTS_ENDPOINT, apiClient.defaults.baseURL);
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          url.searchParams.append(key, String(value));
        }
      });
    }
    console.log('Making GET request to products API:', url.toString());
    try {
      const { data } = await apiClient.get<ProductsResponse>(url.pathname + url.search);
      console.log('Products API response:', data);
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

    console.log('Uploading product image:', imageFile.name);
    try {
      const { data } = await apiClient.post<UploadImageResponse>(UPLOAD_ENDPOINT, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      console.log('Image upload response:', data);
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
    console.log('Creating product:', productData);
    try {
      const { data } = await apiClient.post<CreateProductResponse>(PRODUCTS_ENDPOINT, productData);
      console.log('Create product response:', data);
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
    console.log(`Updating product ${id}:`, productData);
    try {
      const { data } = await apiClient.put<UpdateProductResponse>(
        `${PRODUCTS_ENDPOINT}/${id}`,
        productData
      );
      console.log('Update product response:', data);
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
    console.log(`Deleting product ${id}`);
    try {
      await apiClient.delete(`${PRODUCTS_ENDPOINT}/${id}`);
      console.log('Delete product response: success');
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