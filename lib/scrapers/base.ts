// Base scraper interface and abstract implementation
import type { ScrapedProduct, Scraper } from '@/types';
import { defaultHeaders } from './utils';

/**
 * Abstract base class for scrapers
 * Provides common functionality for all shop scrapers
 */
export abstract class BaseScraper implements Scraper {
  abstract shopName: string;
  abstract supportedDomains: string[];

  protected headers: Record<string, string> = defaultHeaders;

  /**
   * Main scrape method - must be implemented by each scraper
   */
  abstract scrape(url: string): Promise<ScrapedProduct>;

  /**
   * Fetch HTML content from URL
   */
  protected async fetchHtml(url: string): Promise<string> {
    const response = await fetch(url, {
      headers: this.headers,
      redirect: 'follow',
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    return response.text();
  }

  /**
   * Check if this scraper supports the given URL
   */
  supports(url: string): boolean {
    try {
      const hostname = new URL(url).hostname.replace(/^www\./, '');
      return this.supportedDomains.some(
        (domain) => hostname === domain || hostname.endsWith(`.${domain}`)
      );
    } catch {
      return false;
    }
  }
}
