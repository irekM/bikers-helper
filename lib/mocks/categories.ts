export interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

export const MOCK_CATEGORIES: Category[] = [
  { id: 'helmets', name: 'Kaski', icon: '🪖', count: 24 },
  { id: 'jackets', name: 'Kurtki', icon: '🧥', count: 18 },
  { id: 'pants', name: 'Spodnie', icon: '👖', count: 12 },
  { id: 'gloves', name: 'Rękawice', icon: '🧤', count: 31 },
  { id: 'boots', name: 'Buty', icon: '👢', count: 15 },
  { id: 'accessories', name: 'Akcesoria', icon: '🎒', count: 42 },
  { id: 'parts', name: 'Części', icon: '⚙️', count: 67 },
];