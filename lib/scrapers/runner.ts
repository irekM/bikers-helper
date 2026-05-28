import { scrapeProduct } from './index';
import { isValidUrl } from './utils';
import { scrapeRequestSchema, scrapedProductSchema } from './schemas';
import type { ScrapeRequestOptions, ScrapeRunResult, ScrapedProduct } from '@/types';

function resolveMode(mode?: ScrapeRequestOptions['mode']): 'http' | 'browser' {
  if (mode === 'browser') {
    return 'browser';
  }

  return 'http';
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
    if (resolvedMode === 'browser') {
      return {
        success: false,
        error: buildError(
          'BROWSER_MODE_NOT_IMPLEMENTED',
          'Browser mode is scaffolded in step 0/1 and will be implemented in the next iteration.'
        ),
        meta: {
          url: parsedRequest.data.url,
          mode: parsedRequest.data.mode ?? 'browser',
          resolvedMode,
          durationMs: Date.now() - startedAt,
        },
      };
    }

    const data = await scrapeProduct(parsedRequest.data.url);
    const normalizedData = scrapedProductSchema.parse(data) as ScrapedProduct;

    return {
      success: true,
      data: normalizedData,
      meta: {
        url: parsedRequest.data.url,
        mode: parsedRequest.data.mode ?? 'auto',
        resolvedMode,
        durationMs: Date.now() - startedAt,
      },
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Failed to scrape product';

    return {
      success: false,
      error: buildError('SCRAPER_FAILED', message),
      meta: {
        url: parsedRequest.data.url,
        mode: parsedRequest.data.mode ?? 'auto',
        resolvedMode,
        durationMs: Date.now() - startedAt,
      },
    };
  }
}