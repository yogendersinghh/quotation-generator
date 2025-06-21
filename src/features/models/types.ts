export interface Model {
  _id: string;
  name: string;
  description: string;
  specifications: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateModelRequest {
  name: string;
  description: string;
  specifications: string;
}

export type UpdateModelRequest = Partial<CreateModelRequest>;

export type GetModelsResponse = Model[];

export interface DeleteModelResponse {
    message: string;
} 