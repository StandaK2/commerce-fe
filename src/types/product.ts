export interface Product {
  id: string;
  name: string;
  price: number;
  stockQuantity: number;
  createdAt: string;
  soldCount: number;
  soldSum: number;
}

export interface CreateProductRequest {
  name: string;
  price: number;
  stockQuantity: number;
}

export interface UpdateProductRequest {
  name: string;
  price: number;
  stockQuantity: number;
}

export interface IdResult {
  id: string;
}

export interface ErrorResponse {
  timestamp: string;
  status: number;
  error: string;
  message: string;
}

export interface ProductFormData {
  name: string;
  price: string; // String for form input handling
  stockQuantity: string; // String for form input handling
}

export interface ProductFilters {
  searchName: string;
  minStockQuantity: number | null;
  maxStockQuantity: number | null;
  minPrice: number | null;
  maxPrice: number | null;
  minSoldCount: number | null;
  maxSoldCount: number | null;
  minSoldSum: number | null;
  maxSoldSum: number | null;
}


