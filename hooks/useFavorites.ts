'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  addFavorite,
  removeFavorite,
  getFavoriteIds,
} from '@/lib/firebase';

interface UseFavoritesOptions {
  userId?: string;
}

interface UseFavoritesReturn {
  favoriteIds: string[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

export function useFavorites({ userId }: UseFavoritesOptions): UseFavoritesReturn {
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch favorite IDs when userId changes
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      setFavoriteIds([]);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const ids = await getFavoriteIds(userId);
      setFavoriteIds(ids);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch favorites');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a product is in favorites (local state lookup)
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return favoriteIds.includes(productId);
    },
    [favoriteIds]
  );

  // Toggle favorite status (add or remove)
  const toggleFavorite = useCallback(
    async (productId: string): Promise<void> => {
      if (!userId) return;

      const currentlyFavorite = favoriteIds.includes(productId);

      // Optimistic update — change UI immediately
      setFavoriteIds((prev) =>
        currentlyFavorite
          ? prev.filter((id) => id !== productId)
          : [...prev, productId]
      );

      try {
        // Sync with Firestore
        if (currentlyFavorite) {
          await removeFavorite(userId, productId);
        } else {
          await addFavorite(userId, productId);
        }
      } catch (err) {
        // Rollback on failure — restore previous state
        setFavoriteIds((prev) =>
          currentlyFavorite
            ? [...prev, productId]
            : prev.filter((id) => id !== productId)
        );
        setError(err instanceof Error ? err.message : 'Failed to update favorite');
      }
    },
    [userId, favoriteIds]
  );

  return {
    favoriteIds,
    loading,
    error,
    toggleFavorite,
    isFavorite,
  };
}
