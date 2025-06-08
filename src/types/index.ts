export type User = {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'vendor';
  createdAt: Date;
};

export type Product = {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  createdBy: string;
  createdAt: Date;
};

export type Client = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdBy: string;
  createdAt: Date;
};

export type Quotation = {
  id: string;
  clientId: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'approved' | 'rejected';
  createdBy: string;
  createdAt: Date;
};