import { z } from 'zod';

export const scrapeModeSchema = z.enum(['auto', 'http', 'browser']);

export const scrapeRequestSchema = z.object({
  url: z.string().min(1, 'URL is required').url('Invalid URL format'),
  mode: scrapeModeSchema.optional(),
});

export const scrapedProductSchema = z.object({
  name: z.string().min(1),
  price: z.number().finite().positive(),
  currency: z.string().min(1),
  imageUrl: z.string().url().optional(),
  available: z.boolean(),
  originalUrl: z.string().url(),
  shopName: z.string().min(1),
  scrapedAt: z.date(),
  sourceType: z.enum(['http', 'browser']).optional(),
  externalProductId: z.string().optional(),
  availabilityText: z.string().optional(),
});

export type ScrapeRequestInput = z.infer<typeof scrapeRequestSchema>;
export type ScrapedProductInput = z.infer<typeof scrapedProductSchema>;