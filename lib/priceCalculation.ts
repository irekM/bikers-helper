import type { PriceHistoryEntry } from '@/types';

export function calculatePriceChange(currentPrice: number, previousPrice: number): number {
  return currentPrice - previousPrice;
}

export function calculatePriceChangePercent(currentPrice: number, previousPrice: number): number {
  if (previousPrice === 0) {
    return 0;
  }
  return ((currentPrice - previousPrice) / previousPrice) * 100;
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
  const sortedAsc = [...priceHistory].reverse();
  const firstPrice = sortedAsc.length > 0 ? sortedAsc[0].price : currentPrice;
  if (firstPrice === 0){
    return 0;
  }
  return ((currentPrice - firstPrice) / firstPrice) * 100;
}

export function countPriceChanges(priceHistory: PriceHistoryEntry[]): number {
  return priceHistory.filter((entry, index) => {
    if (index === priceHistory.length - 1){
        return false;
    }
    return entry.price !== priceHistory[index + 1].price;
  }).length;
}