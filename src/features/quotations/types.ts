export type QuotationStatus = 'draft' | 'pending' | 'accepted' | 'rejected' | 'under_development' | 'booked' | 'lost';
export type AdminStatus = 'pending' | 'approved' | 'rejected';

export type User = {
  _id: string;
  name: string;
  email: string;
};

export type Product = {
  _id: string;
  price: number;
};

export type ProductItem = {
  _id: string;
  product: Product;
  quantity: number;
  unit: string;
};

export type MachineInstallation = {
  _id: string;
  quantity: number;
  unit: string;
  price: number;
  total: number;
};

export type Quotation = {
  _id: string;
  title: string;
  subject: string;
  quotationRefNumber: string;
  status: QuotationStatus;
  converted: string; // This seems to be the quotation status in a different format
  totalAmount: number;
  price: number; // This might be the main price
  createdAt: string;
  updatedAt: string;
  createdBy: User;
  client: User | null;
  products: ProductItem[];
  machineInstallation: MachineInstallation;
  billingDetails: string;
  formalMessage: string;
  installationAndCommissioning: string;
  notes: string;
  supply: string;
  termsAndConditions: string;
  signatureImage: string;
  relatedProducts: string[];
  suggestedProducts: string[];
  __v: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  totalItems?: number;
  pages: number;
};

export type QuotationsResponse = {
  quotations: Quotation[];
  pagination: PaginationInfo;
  filters: Record<string, any>;
};

export type QuotationsFilters = {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
  userId?: string;
  search?: string;
  customer?: string;
  fromMonth?: string;
  toMonth?: string;
  status?: QuotationStatus;
  converted?: string;
};

export type DashboardStats = {
  totalQuotations: number;
  pendingApprovals: number;
  totalClients: number;
  underDevelopment: number;
  booked: number;
  lost: number;
};