import { scrapeProduct } from './index';
import { isValidUrl } from './utils';
import { scrapeRequestSchema, scrapedProductSchema } from './schemas';
import type { ScrapeRequestOptions, ScrapeRunResult, ScrapedProduct } from '@/types';

function resolveMode(mode?: ScrapeRequestOptions['mode']): 'auto' | 'http' | 'browser' {
  if (mode === 'browser') {
    return 'browser';
  }

  if (mode === 'http') {
    return 'http';
  }

  if (process.env.SCRAPER_USE_PLAYWRIGHT_DEFAULT === 'true') {
    return 'browser';
  }

  return 'auto';
}

function buildError(code: string, message: string) {
  return {
    code,
    message,
  };
}

export async function runScraper(url: string, options: ScrapeRequestOptions = {}): Promise<ScrapeRunResult> {
  const startedAt = Date.now();
  const parsedRequest = scrapeRequestSchema.safeParse({ url, ...options });

  if (!parsedRequest.success) {
    return {
      success: false,
      error: buildError('VALIDATION_ERROR', parsedRequest.error.issues[0]?.message || 'Invalid scrape request'),
      meta: {
        url,
        mode: options.mode ?? 'auto',
        resolvedMode: 'http',
        durationMs: Date.now() - startedAt,
      },
    };
  }

  if (!isValidUrl(parsedRequest.data.url)) {
    return {
      success: false,
      error: buildError('VALIDATION_ERROR', 'Invalid URL format'),
      meta: {
        url: parsedRequest.data.url,
        mode: parsedRequest.data.mode ?? 'auto',
        resolvedMode: 'http',
        durationMs: Date.now() - startedAt,
      },
    };
  }

  const resolvedMode = resolveMode(parsedRequest.data.mode);

  try {
    const data = await scrapeProduct(parsedRequest.data.url, resolvedMode);
    const normalizedData = scrapedProductSchema.parse(data) as ScrapedProduct;
    const finalMode = normalizedData.sourceType ?? (resolvedMode === 'auto' ? 'http' : resolvedMode);

    return {
      success: true,
      data: normalizedData,
      meta: {
        url: parsedRequest.data.url,
        mode: parsedRequest.data.mode ?? 'auto',
        resolvedMode: finalMode,
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scrape product';
    const finalMode = resolvedMode === 'auto' ? 'http' : resolvedMode;

    return {
      success: false,
      error: buildError('SCRAPER_FAILED', message),
      meta: {
        url: parsedRequest.data.url,
        mode: parsedRequest.data.mode ?? 'auto',
        resolvedMode: finalMode,
        durationMs: Date.now() - startedAt,
      },
    };
  }
}