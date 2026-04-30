'use client';

import { useAuth } from './useAuth';
import { useProducts } from './useProducts';
import type { Product } from '@/types';

interface UseCurrentUserProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProduct: (url: string) => Promise<string>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshProduct: (productId: string) => Promise<boolean>;
}

/**
 * Hook to fetch products for the currently logged-in user
 * 
 * Automatically handles getting the user ID from auth context
 * and fetching their products. Simplifies component code by removing
 * the need to manually pass userId everywhere.
 * 
 * Usage:
 * const { products, loading, error, addProduct } = useCurrentUserProducts();
 */
export function useCurrentUserProducts(): UseCurrentUserProductsReturn {
  const { user } = useAuth();
  return useProducts({ userId: user?.id });
}
