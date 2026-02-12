// Utility functions for scrapers
import type { ScrapedProduct, Scraper } from '@/types';

/**
 * Parse price string to number
 * Handles various formats: "1 299,00 zł", "€ 129.99", "PLN 599.00"
 */
export function parsePrice(priceText: string): number {
  // Remove currency symbols and whitespace
  const cleaned = priceText
    .replace(/[^\d,.\s]/g, '')
    .trim();

  // Handle European format (1 299,00) vs US format (1,299.00)
  // Check if comma is decimal separator (European)
  if (cleaned.includes(',') && cleaned.includes('.')) {
    // Both present - determine which is decimal
    const commaIndex = cleaned.lastIndexOf(',');
    const dotIndex = cleaned.lastIndexOf('.');
    
    if (commaIndex > dotIndex) {
      // European: 1.299,00
      return parseFloat(cleaned.replace(/\./g, '').replace(',', '.'));
    } else {
      // US: 1,299.00
      return parseFloat(cleaned.replace(/,/g, ''));
    }
  } else if (cleaned.includes(',')) {
    // Only comma - likely European decimal
    const parts = cleaned.split(',');
    if (parts.length === 2 && parts[1].length <= 2) {
      // Decimal comma: 299,00
      return parseFloat(cleaned.replace(',', '.'));
    }
    // Thousand separator: 1,299
    return parseFloat(cleaned.replace(/,/g, ''));
  }

  // Standard format or only dots
  return parseFloat(cleaned.replace(/\s/g, ''));
}

/**
 * Detect currency from price string or page content
 */
export function detectCurrency(text: string): string {
  const currencyPatterns: Record<string, RegExp[]> = {
    PLN: [/zł/i, /PLN/i, /złot/i],
    EUR: [/€/, /EUR/i, /euro/i],
    USD: [/\$/, /USD/i],
    GBP: [/£/, /GBP/i],
  };

  for (const [currency, patterns] of Object.entries(currencyPatterns)) {
    if (patterns.some((pattern) => pattern.test(text))) {
      return currency;
    }
  }

  return 'PLN'; // Default for Polish shops
}

/**
 * Extract domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const hostname = new URL(url).hostname;
    return hostname.replace(/^www\./, '');
  } catch {
    return '';
  }
}

/**
 * Sleep utility for rate limiting
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry wrapper for scraping operations
 */
export async function scrapeWithRetry(
  scraper: Scraper,
  url: string,
  maxRetries = 3,
  baseDelay = 1000
): Promise<ScrapedProduct> {
  let lastError: Error = new Error('Unknown error');

  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await scraper.scrape(url);
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Scrape attempt ${attempt} failed for ${url}:`, lastError.message);

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt - 1); // Exponential backoff
        await sleep(delay);
      }
    }
  }

  throw lastError;
}

/**
 * Common headers for HTTP requests
 */
export const defaultHeaders: Record<string, string> = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  Accept:
    'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
  'Accept-Language': 'pl-PL,pl;q=0.9,en-US;q=0.8,en;q=0.7',
  'Accept-Encoding': 'gzip, deflate, br',
  'Cache-Control': 'no-cache',
  Pragma: 'no-cache',
};

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ['http:', 'https:'].includes(parsed.protocol);
  } catch {
    return false;
  }
}

/**
 * Clean product name (remove extra whitespace, newlines, etc.)
 */
export function cleanProductName(name: string): string {
  return name
    .replace(/\s+/g, ' ')
    .replace(/[\n\r\t]/g, ' ')
    .trim();
}

/**
 * Normalize image URL (handle relative URLs)
 */
export function normalizeImageUrl(imageUrl: string | undefined, baseUrl: string): string | undefined {
  if (!imageUrl) return undefined;

  try {
    // Already absolute
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      return imageUrl;
    }

    // Protocol-relative
    if (imageUrl.startsWith('//')) {
      return `https:${imageUrl}`;
    }

    // Relative URL
    const base = new URL(baseUrl);
    return new URL(imageUrl, base.origin).href;
  } catch {
    return undefined;
  }
}
