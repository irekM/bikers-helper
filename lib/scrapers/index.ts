// Scraper registry and router
import type { Scraper, ScrapedProduct, ScrapeMode } from '@/types';
import { louisScraper } from './louis';
import { xlmotoScraper } from './xlmoto';
import { fcmotoScraper } from './fcmoto';
import { extractDomain, retryOperation, scrapeWithRetry } from './utils';

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

export function supportsBrowserMode(url: string): boolean {
  const scraper = getScraperForUrl(url);
  return typeof scraper?.scrapeWithBrowser === 'function';
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
export async function scrapeProduct(url: string, mode: ScrapeMode = 'auto'): Promise<ScrapedProduct> {
  const scraper = getScraperForUrl(url);

  if (!scraper) {
    const domain = extractDomain(url);
    console.warn(`Unsupported shop requested for scraping: ${domain || url}`);
    throw new Error(
      `Unsupported shop: ${domain}. Supported shops: ${getSupportedShops().join(', ')}`
    );
  }

  if (mode === 'browser') {
    if (!scraper.scrapeWithBrowser) {
      throw new Error(`${scraper.shopName} does not support browser mode yet`);
    }

    return retryOperation(
      () => scraper.scrapeWithBrowser!(url),
      `Browser scrape failed for ${url}`
    );
  }

  if (mode === 'http') {
    return scrapeWithRetry(scraper, url);
  }

  try {
    return await scrapeWithRetry(scraper, url);
  } catch (error) {
    if (!scraper.scrapeWithBrowser) {
      throw error;
    }

    console.warn(`HTTP scrape failed for ${url}, retrying with browser mode`);

    return retryOperation(
      () => scraper.scrapeWithBrowser!(url),
      `Browser fallback failed for ${url}`
    );
  }
}

// Export individual scrapers for direct use if needed
export { louisScraper } from './louis';
export { xlmotoScraper } from './xlmoto';
export { fcmotoScraper } from './fcmoto';
