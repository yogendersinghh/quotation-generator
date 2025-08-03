export type CreatedBy = {
  _id: string;
  name: string;
  email: string;
};

export type Client = {
  _id: string;
  name: string;
  email: string[];
  position: string;
  address: string;
  place?: string;
  city?: string;
  state?: string;
  PIN?: string;
  phone: string[];
  companyName?: string;
  companyCode?: string;
  createdBy?: CreatedBy;
  createdAt: string;
  updatedAt: string;
  __v?: number;
};

export type PaginationInfo = {
  page: number;
  limit: number;
  total: number;
  pages: number;
};

export type ClientsResponse = {
  clients: Client[];
  pagination: PaginationInfo;
  filters: Record<string, any>;
};

export type CreateClientPayload = {
  name: string;
  email: string[];
  position: string;
  address: string;
  place?: string;
  city?: string;
  state?: string;
  PIN?: string;
  phone: string[];
  companyName?: string;
  companyCode?: string;
};

export type CreateClientResponse = {
  message: string;
  client: Client;
}; 