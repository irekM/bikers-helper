import type { PriceHistoryEntry } from '@/types';

export function calculatePriceChange(currentPrice: number, previousPrice: number | null | undefined): number | null {
  if (previousPrice == null) return null;
  return currentPrice - previousPrice;
}

export function calculatePriceChangePercent(currentPrice: number, previousPrice: number | null | undefined, decimals: number = 1): string | null {
  if (previousPrice == null || previousPrice === 0) {
    return null;
  }
  return (((currentPrice - previousPrice) / previousPrice) * 100).toFixed(decimals);
}

export function formatPrice(price: number, currency: string): string {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: currency,
  }).format(price);
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
}

export function formatPercentChange(value: number): string {
  const prefix = value > 0 ? '+' : '';
  return `${prefix}${value.toFixed(1)}%`;
}

export function calculateAveragePrice(priceHistory: PriceHistoryEntry[], fallbackPrice: number): number {
  if (priceHistory.length === 0) {
    return fallbackPrice;
  }
  return Math.round(priceHistory.reduce((sum, entry) => sum + entry.price, 0) / priceHistory.length);
}

export function calculatePercentChangeFromHistory(currentPrice: number, priceHistory: PriceHistoryEntry[]): number {
  const firstPrice = priceHistory.at(-1)?.price ?? currentPrice;
  if (firstPrice === 0){
    return 0;
  }
  return ((currentPrice - firstPrice) / firstPrice) * 100;
}

export function countPriceChanges(priceHistory: PriceHistoryEntry[]): number {
  let changes = 0;

  for (let i = 1; i < priceHistory.length; i++) {
    const current = priceHistory[i].price;
    const previous = priceHistory[i - 1].price;

    if (current !== previous) changes++;
  }

  return changes;
}