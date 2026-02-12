// Scraper for XLMoto.pl / XLMoto.eu motorcycle shop
import * as cheerio from 'cheerio';
import type { ScrapedProduct } from '@/types';
import { BaseScraper } from './base';
import {
  parsePrice,
  detectCurrency,
  cleanProductName,
  normalizeImageUrl,
} from './utils';

export class XLMotoScraper extends BaseScraper {
  shopName = 'XLMoto';
  supportedDomains = ['xlmoto.pl', 'xlmoto.eu', 'xlmoto.de', 'xlmoto.com'];

  async scrape(url: string): Promise<ScrapedProduct> {
    const html = await this.fetchHtml(url);
    const $ = cheerio.load(html);

    // Product name
    const name =
      $('h1.product-name').text().trim() ||
      $('h1[itemprop="name"]').text().trim() ||
      $('.product-title h1').text().trim() ||
      $('h1').first().text().trim();

    if (!name) {
      throw new Error('Could not find product name');
    }

    // Price - XLMoto often has sale prices
    const priceText =
      $('.product-price .price--sale').first().text().trim() ||
      $('.product-price .price--current').first().text().trim() ||
      $('[data-price]').first().attr('data-price') ||
      $('.price-wrapper .price').first().text().trim() ||
      $('[itemprop="price"]').attr('content') ||
      $('.product-price').first().text().trim();

    if (!priceText) {
      throw new Error('Could not find product price');
    }

    const price = parsePrice(priceText);
    const currency = detectCurrency(priceText) || 'PLN';

    // Image
    const imageUrl =
      $('img.product-image--main').attr('src') ||
      $('img[itemprop="image"]').attr('src') ||
      $('.product-gallery__main img').attr('src') ||
      $('.product-image img').first().attr('src');

    // Availability
    const availabilityText =
      $('[itemprop="availability"]').attr('content') ||
      $('.product-availability').text().toLowerCase();
    
    const available =
      availabilityText.includes('instock') ||
      availabilityText.includes('w magazynie') ||
      availabilityText.includes('dostępn') ||
      (!availabilityText.includes('niedostępn') &&
        !availabilityText.includes('wyprzedane') &&
        !$('.out-of-stock').length);

    return {
      name: cleanProductName(name),
      price,
      currency,
      imageUrl: normalizeImageUrl(imageUrl, url),
      available,
      originalUrl: url,
      shopName: this.shopName,
      scrapedAt: new Date(),
    };
  }
}

export const xlmotoScraper = new XLMotoScraper();
