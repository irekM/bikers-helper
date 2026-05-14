'use client';

import { useReducer, useEffect, useCallback } from 'react';
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

type FavoritesState =
  | {
      status: 'init' | 'loading' | 'success';
      favoriteIds: string[];
      error: null;
    }
  | {
      status: 'error';
      favoriteIds: string[];
      error: string;
    };

type FavoritesAction =
  | { type: 'RESET_NO_USER' }
  | { type: 'FETCH_START' }
  | { type: 'FETCH_SUCCESS'; payload: string[] }
  | { type: 'FETCH_ERROR'; payload: string };

const initialState: FavoritesState = {
  status: 'init',
  favoriteIds: [],
  error: null,
};

function favoritesReducer(state: FavoritesState, action: FavoritesAction): FavoritesState {
  switch (action.type) {
    case 'RESET_NO_USER':
      return {
        status: 'success',
        favoriteIds: [],
        error: null,
      };
    case 'FETCH_START':
      return {
        status: 'loading',
        favoriteIds: state.favoriteIds,
        error: null,
      };
    case 'FETCH_SUCCESS':
      return {
        status: 'success',
        favoriteIds: action.payload,
        error: null,
      };
    case 'FETCH_ERROR':
      return {
        status: 'error',
        favoriteIds: state.favoriteIds,
        error: action.payload,
      };
    default:
      return state;
  }
}

export function useFavorites({ userId }: UseFavoritesOptions): UseFavoritesReturn {
  const [state, dispatch] = useReducer(favoritesReducer, initialState);

  // Fetch favorite IDs when userId changes
  const fetchFavorites = useCallback(async () => {
    if (!userId) {
      dispatch({ type: 'RESET_NO_USER' });
      return;
    }

    try {
      dispatch({ type: 'FETCH_START' });
      const ids = await getFavoriteIds(userId);
      dispatch({ type: 'FETCH_SUCCESS', payload: ids });
    } catch (err) {
      dispatch({
        type: 'FETCH_ERROR',
        payload: err instanceof Error ? err.message : 'Failed to fetch favorites',
      });
    }
  }, [userId]);

  useEffect(() => {
    fetchFavorites();
  }, [fetchFavorites]);

  // Check if a product is in favorites (local state lookup)
  const isFavorite = useCallback(
    (productId: string): boolean => {
      return state.favoriteIds.includes(productId);
    },
    [state.favoriteIds]
  );

  // Toggle favorite status (add or remove)
  const toggleFavorite = useCallback(
    async (productId: string): Promise<void> => {
      if (!userId) return;

      const currentlyFavorite = state.favoriteIds.includes(productId);

      try {
        dispatch({ type: 'FETCH_START' });

        if (currentlyFavorite) {
          await removeFavorite(userId, productId);
        } else {
          await addFavorite(userId, productId);
        }

        const ids = await getFavoriteIds(userId);
        dispatch({ type: 'FETCH_SUCCESS', payload: ids });
      } catch (err) {
        dispatch({
          type: 'FETCH_ERROR',
          payload: err instanceof Error ? err.message : 'Failed to update favorite',
        });
      }
    },
    [userId, state.favoriteIds]
  );

  return {
    favoriteIds: state.favoriteIds,
    loading: state.status === 'loading',
    error: state.status === 'error' ? state.error : null,
    toggleFavorite,
    isFavorite,
  };
}
