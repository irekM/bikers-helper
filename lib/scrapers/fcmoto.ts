// Scraper for FC-Moto.de / FC-Moto.pl motorcycle shop
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

export class FCMotoScraper extends BaseScraper {
  shopName = 'FC-Moto';
  supportedDomains = ['fc-moto.de', 'fc-moto.pl', 'fc-moto.com', 'fc-moto.eu'];

  private parseProduct(html: string, url: string, sourceType: 'http' | 'browser'): ScrapedProduct {
    const $ = cheerio.load(html);

    // Product name
    const name =
      $('h1.product-title').text().trim() ||
      $('h1[itemprop="name"]').text().trim() ||
      $('.product-detail-title h1').text().trim() ||
      $('[data-testid="product-title"]').first().text().trim() ||
      $('h1').first().text().trim();

    if (!name) {
      throw new Error('Could not find product name');
    }

    // Price
    const priceText =
      $('.product-price .price').first().text().trim() ||
      $('[itemprop="price"]').attr('content') ||
      $('.price--default').first().text().trim() ||
      $('[data-testid="product-price"]').first().text().trim() ||
      $('.product-detail-price').first().text().trim();

    if (!priceText) {
      throw new Error('Could not find product price');
    }

    const price = parsePrice(priceText);
  assertValidScrapedData(name, price);
    const currency = detectCurrency(priceText) || 'EUR';

    // Image
    const imageUrl =
      $('img.product-detail-image').attr('src') ||
      $('img[itemprop="image"]').attr('src') ||
      $('.product-media img').first().attr('src') ||
      $('.gallery-slider img').first().attr('src');

    // Availability
    const availabilityText =
      $('[itemprop="availability"]').attr('href') ||
      $('.product-availability').text().toLowerCase();
    
    const available =
      availabilityText.includes('InStock') ||
      availabilityText.includes('verfügbar') ||
      availabilityText.includes('dostępn') ||
      availabilityText.includes('lieferbar');

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
      availabilityText: typeof availabilityText === 'string' ? availabilityText : undefined,
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

export const fcmotoScraper = new FCMotoScraper();
