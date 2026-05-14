'use client';

import { MOCK_CATEGORIES, type Category } from '@/lib/mocks/categories';

interface UseCategoriesReturn {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

/**
 * Provides categories for UI components.
 *
 * For now it returns mock data. In the future, replace the implementation
 * with an API/Firestore call without changing consumer components.
 */
export function useCategories(): UseCategoriesReturn {
  return {
    categories: MOCK_CATEGORIES,
    loading: false,
    error: null,
  };
}
