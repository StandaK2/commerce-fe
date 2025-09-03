import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, CreateProductRequest, UpdateProductRequest } from '../types/product';
import { productService, ApiError } from '../services/productService';

const POLLING_INTERVAL = 15000; // 15 seconds

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isUserInteractingRef = useRef(false);

  const fetchProducts = useCallback(async (isBackgroundRefresh = false) => {
    if (!isBackgroundRefresh) {
      setLoading(true);
    }
    setError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
      setLastRefresh(new Date());
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to fetch products';
      setError(errorMessage);
    } finally {
      if (!isBackgroundRefresh) {
        setLoading(false);
      }
    }
  }, []);

  // Start/stop polling
  const startPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }
    
    pollingIntervalRef.current = setInterval(() => {
      // Only poll if user is not actively interacting and polling is enabled
      if (!isUserInteractingRef.current && isPolling) {
        fetchProducts(true); // Background refresh
      }
    }, POLLING_INTERVAL);
  }, [fetchProducts, isPolling]);

  const stopPolling = useCallback(() => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
      pollingIntervalRef.current = null;
    }
  }, []);

  const togglePolling = useCallback(() => {
    setIsPolling(prev => !prev);
  }, []);

  // Mark user as interacting (pauses polling)
  const setUserInteracting = useCallback((interacting: boolean) => {
    isUserInteractingRef.current = interacting;
  }, []);

  const createProduct = useCallback(async (request: CreateProductRequest): Promise<boolean> => {
    setUserInteracting(true);
    setLoading(true);
    setError(null);
    try {
      await productService.createProduct(request);
      await fetchProducts(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to create product';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setUserInteracting(false);
    }
  }, [fetchProducts, setUserInteracting]);

  const updateProduct = useCallback(async (productId: string, request: UpdateProductRequest): Promise<boolean> => {
    setUserInteracting(true);
    setLoading(true);
    setError(null);
    try {
      await productService.updateProduct(productId, request);
      await fetchProducts(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to update product';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setUserInteracting(false);
    }
  }, [fetchProducts, setUserInteracting]);

  const deleteProduct = useCallback(async (productId: string): Promise<boolean> => {
    setUserInteracting(true);
    setLoading(true);
    setError(null);
    try {
      await productService.deleteProduct(productId);
      await fetchProducts(); // Refresh the list
      return true;
    } catch (err) {
      const errorMessage = err instanceof ApiError 
        ? err.message 
        : 'Failed to delete product';
      setError(errorMessage);
      return false;
    } finally {
      setLoading(false);
      setUserInteracting(false);
    }
  }, [fetchProducts, setUserInteracting]);

  const manualRefresh = useCallback(async () => {
    await fetchProducts();
  }, [fetchProducts]);

  // Initial fetch and polling setup
  useEffect(() => {
    fetchProducts();
    startPolling();
    
    return () => {
      stopPolling();
    };
  }, [fetchProducts, startPolling, stopPolling]);

  // Update polling when isPolling changes
  useEffect(() => {
    if (isPolling) {
      startPolling();
    } else {
      stopPolling();
    }
  }, [isPolling, startPolling, stopPolling]);

  // Pause polling when user is away (optional enhancement)
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        stopPolling();
      } else if (isPolling) {
        startPolling();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isPolling, startPolling, stopPolling]);

  return {
    products,
    loading,
    error,
    isPolling,
    lastRefresh,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    manualRefresh,
    togglePolling,
    setUserInteracting,
    clearError: () => setError(null)
  };
};
