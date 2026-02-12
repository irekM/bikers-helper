// Scraper registry and router
import type { Scraper, ScrapedProduct } from '@/types';
import { louisScraper } from './louis';
import { xlmotoScraper } from './xlmoto';
import { fcmotoScraper } from './fcmoto';
import { extractDomain, scrapeWithRetry } from './utils';

// Registry of all available scrapers
const scrapers: Scraper[] = [
  louisScraper,
  xlmotoScraper,
  fcmotoScraper,
];

// Domain to scraper mapping (built from scrapers array)
const scraperRegistry: Map<string, Scraper> = new Map();

// Initialize registry
scrapers.forEach((scraper) => {
  scraper.supportedDomains.forEach((domain) => {
    scraperRegistry.set(domain, scraper);
  });
});

/**
 * Get scraper for a given URL
 */
export function getScraperForUrl(url: string): Scraper | null {
  const domain = extractDomain(url);
  return scraperRegistry.get(domain) || null;
}

/**
 * Get list of all supported domains
 */
export function getSupportedDomains(): string[] {
  return Array.from(scraperRegistry.keys());
}

/**
 * Get list of all supported shop names
 */
export function getSupportedShops(): string[] {
  return [...new Set(scrapers.map((s) => s.shopName))];
}

/**
 * Check if URL is from a supported shop
 */
export function isUrlSupported(url: string): boolean {
  return getScraperForUrl(url) !== null;
}

/**
 * Main scraping function - routes to appropriate scraper
 */
export async function scrapeProduct(url: string): Promise<ScrapedProduct> {
  const scraper = getScraperForUrl(url);

  if (!scraper) {
    const domain = extractDomain(url);
    throw new Error(
      `Unsupported shop: ${domain}. Supported shops: ${getSupportedShops().join(', ')}`
    );
  }

  return scrapeWithRetry(scraper, url);
}

// Export individual scrapers for direct use if needed
export { louisScraper } from './louis';
export { xlmotoScraper } from './xlmoto';
export { fcmotoScraper } from './fcmoto';
