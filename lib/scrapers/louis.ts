// Scraper for Louis.eu / Louis.pl motorcycle shop
import * as cheerio from 'cheerio';
import type { ScrapedProduct } from '@/types';
import { BaseScraper } from './base';
import {
  assertValidScrapedData,
  parsePrice,
  detectCurrency,
  cleanProductName,
  normalizeImageUrl,
} from './utils';

export class LouisScraper extends BaseScraper {
  shopName = 'Louis';
  supportedDomains = ['louis.eu', 'louis.pl', 'louis.de'];

  private parseProduct(html: string, url: string, sourceType: 'http' | 'browser'): ScrapedProduct {
    const $ = cheerio.load(html);

    // Product name - try multiple selectors
    const name =
      $('h1.product-detail-name').text().trim() ||
      $('h1[data-product-name]').text().trim() ||
      $('h1.pdp-title').text().trim() ||
      $('.product-title h1').text().trim();

    if (!name) {
      throw new Error('Could not find product name');
    }

    // Price - try multiple selectors
    const priceText =
      $('.product-detail-price .price').first().text().trim() ||
      $('[data-product-price]').first().text().trim() ||
      $('.pdp-price .price-value').first().text().trim() ||
      $('.product-price .current-price').first().text().trim();

    if (!priceText) {
      throw new Error('Could not find product price');
    }

    const price = parsePrice(priceText);
  assertValidScrapedData(name, price);
    const currency = detectCurrency(priceText);

    // Image
    const imageUrl =
      $('img.product-detail-image').attr('src') ||
      $('img[data-product-image]').attr('src') ||
      $('.pdp-image img').attr('src') ||
      $('.product-gallery img').first().attr('src');

    // Availability
    const availabilityText = $('.product-detail-availability').text().toLowerCase();
    const available =
      !availabilityText.includes('niedostępn') &&
      !availabilityText.includes('wyprzedane') &&
      !availabilityText.includes('out of stock') &&
      !$('.out-of-stock').length;

    return {
      name: cleanProductName(name),
      price,
      currency,
      imageUrl: normalizeImageUrl(imageUrl, url),
      available,
      originalUrl: url,
      shopName: this.shopName,
      scrapedAt: new Date(),
      sourceType,
      availabilityText,
    };
  }

  async scrape(url: string): Promise<ScrapedProduct> {
    const html = await this.fetchHtml(url);
    return this.parseProduct(html, url, 'http');
  }

  async scrapeWithBrowser(url: string): Promise<ScrapedProduct> {
    const html = await this.fetchHtmlWithBrowser(url);
    return this.parseProduct(html, url, 'browser');
  }
}

export const louisScraper = new LouisScraper();
