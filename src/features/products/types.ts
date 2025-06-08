export interface Product {
  _id: string;
  productImage: string;
  title: string;
  model: string;
  type: string;
  features: string[];
  price: number;
  warranty: string;
  category: string | null;
  createdAt: string;
  updatedAt: string;
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
  category: string;
}

export interface CreateProductResponse {
  product: Product;
  message: string;
}

export interface UploadImageResponse {
  filename: string;
  message: string;
} 