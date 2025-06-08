export type Client = {
  _id: string;
  name: string;
  email: string;
  position: string;
  address: string;
  phoneNumber: string;
  createdBy?: string; // Optional, as it might not be returned on all calls
  createdAt: string;
  updatedAt: string;
  __v?: number; // Optional, as it might not be returned on all calls
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
};

export type CreateClientPayload = {
  name: string;
  email: string;
  position: string;
  address: string;
  phoneNumber: string;
};

export type CreateClientResponse = {
  message: string;
  client: Client;
}; 