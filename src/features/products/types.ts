export interface Product {
  _id: string;
  productImage: string;
  title: string;
  model: string;
  type: string;
  features: string[];
  price: number;
  warranty: string;
  categories: string[];
  createdAt: string;
  updatedAt: string;
  notes?: string;
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export interface ProductsResponse {
  products: Product[];
  pagination: Pagination;
}

export interface CreateProductRequest {
  productImage: string;
  title: string;
  model: string;
  type: string;
  features: string;
  price: number;
  warranty: string;
  categories: string[];
  notes?: string;
}

export interface CreateProductResponse {
  product: Product;
  message: string;
}

export type UpdateProductRequest = Partial<CreateProductRequest>;

export interface UpdateProductResponse {
  product: Product;
  message: string;
}

export interface UploadImageResponse {
  filename: string;
  message: string;
} 