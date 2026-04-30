'use client';

export interface CategoryItem {
  id: string;
  name: string;
  icon: string;
}

interface UseCategoriesReturn {
  categories: CategoryItem[];
  loading: boolean;
  error: string | null;
}

const MOCK_CATEGORIES: CategoryItem[] = [
  { id: 'helmets', name: 'Kaski', icon: '🪖' },
  { id: 'jackets', name: 'Kurtki', icon: '🧥' },
  { id: 'pants', name: 'Spodnie', icon: '👖' },
  { id: 'gloves', name: 'Rękawice', icon: '🧤' },
  { id: 'boots', name: 'Buty', icon: '👢' },
  { id: 'accessories', name: 'Akcesoria', icon: '🎒' },
  { id: 'parts', name: 'Części', icon: '⚙️' },
];

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
