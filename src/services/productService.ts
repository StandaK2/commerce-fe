import axios, { AxiosError } from 'axios';
import { Product, CreateProductRequest, UpdateProductRequest, IdResult, ErrorResponse } from '../types/product';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Custom error class for API errors
export class ApiError extends Error {
  public readonly status: number;
  public readonly errorCode: string;
  public readonly timestamp: string;

  constructor(errorResponse: ErrorResponse) {
    super(errorResponse.message);
    this.status = errorResponse.status;
    this.errorCode = errorResponse.error;
    this.timestamp = errorResponse.timestamp;
    this.name = 'ApiError';
  }
}

// Error handler for API responses
const handleApiError = (error: AxiosError): never => {
  if (error.response?.data) {
    const errorResponse = error.response.data as ErrorResponse;
    throw new ApiError(errorResponse);
  }
  
  // Fallback for network errors or other issues
  throw new ApiError({
    timestamp: new Date().toISOString(),
    status: error.response?.status || 500,
    error: 'NETWORK_ERROR',
    message: error.message || 'Network error occurred'
  });
};

export const productService = {
  async getProducts(): Promise<Product[]> {
    try {
      const response = await api.get<Product[]>('/products');
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async createProduct(request: CreateProductRequest): Promise<IdResult> {
    try {
      const response = await api.post<IdResult>('/products', request);
      return response.data;
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async updateProduct(productId: string, request: UpdateProductRequest): Promise<void> {
    try {
      await api.put(`/products/${productId}`, request);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  },

  async deleteProduct(productId: string): Promise<void> {
    try {
      await api.delete(`/products/${productId}`);
    } catch (error) {
      return handleApiError(error as AxiosError);
    }
  }
};
