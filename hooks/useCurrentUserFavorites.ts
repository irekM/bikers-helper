'use client';

import { useAuth } from './useAuth';
import { useFavorites } from './useFavorites';

interface UseCurrentUserFavoritesReturn {
  favoriteIds: string[];
  loading: boolean;
  error: string | null;
  toggleFavorite: (productId: string) => Promise<void>;
  isFavorite: (productId: string) => boolean;
}

/**
 * Hook to fetch and manage favorites for the currently logged-in user
 *
 * Automatically handles getting the user ID from auth context
 * and managing their favorite products. Simplifies component code by removing
 * the need to manually pass userId everywhere.
 *
 * Usage:
 * const { favoriteIds, toggleFavorite, isFavorite } = useCurrentUserFavorites();
 */
export function useCurrentUserFavorites(): UseCurrentUserFavoritesReturn {
  const { user } = useAuth();
  return useFavorites({ userId: user?.id });
}
