'use client';

import { useState, useEffect, useCallback } from 'react';
import type { Product } from '@/types';

interface UseProductsOptions {
  userId?: string;
}

interface UseProductsReturn {
  products: Product[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  addProduct: (url: string) => Promise<string>;
  deleteProduct: (productId: string) => Promise<void>;
  refreshProduct: (productId: string) => Promise<boolean>;
}

export function useProducts({ userId }: UseProductsOptions): UseProductsReturn {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    if (!userId) {
      setProducts([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/products?userId=${userId}`);
      const data = await response.json();

      if (data.success) {
        setProducts(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch products');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const addProduct = async (url: string): Promise<string> => {
    if (!userId) throw new Error('User not authenticated');

    const response = await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url, userId }),
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    // Refetch products to update the list
    await fetchProducts();

    return data.data.id;
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    const response = await fetch(`/api/products/${productId}`, {
      method: 'DELETE',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    // Remove from local state
    setProducts((prev) => prev.filter((p) => p.id !== productId));
  };

  const refreshProduct = async (productId: string): Promise<boolean> => {
    const response = await fetch(`/api/products/${productId}/refresh`, {
      method: 'POST',
    });

    const data = await response.json();

    if (!data.success) {
      throw new Error(data.error.message);
    }

    // Update product in local state
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? data.data.product : p))
    );

    return data.data.priceChanged;
  };

  return {
    products,
    loading,
    error,
    refetch: fetchProducts,
    addProduct,
    deleteProduct,
    refreshProduct,
  };
}
