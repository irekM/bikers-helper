// API Route: POST /api/scrape - Scrape product data from URL
import { NextRequest, NextResponse } from 'next/server';
import { runScraper } from '@/lib/scrapers/runner';
import { scrapeRequestSchema } from '@/lib/scrapers/schemas';
import type { ApiResponse, ScrapedProduct } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ScrapedProduct>>> {
  try {
    const body = await request.json();
    const parsed = scrapeRequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parsed.error.issues[0]?.message || 'Invalid scrape request',
          },
        },
        { status: 400 }
      );
    }

    const result = await runScraper(parsed.data.url, { mode: parsed.data.mode });

    if (!result.success) {
      const status = result.error?.code === 'VALIDATION_ERROR' ? 400 : 500;

      return NextResponse.json(
        {
          success: false,
          error: {
            code: result.error?.code || 'SCRAPER_FAILED',
            message: result.error?.message || 'Failed to scrape product',
          },
        },
        { status }
      );
    }

    return NextResponse.json({
      success: true,
      data: result.data,
    });
  } catch (error) {
    console.error('Scraping error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SCRAPER_FAILED',
          message: error instanceof Error ? error.message : 'Failed to scrape product',
        },
      },
      { status: 500 }
    );
  }
}
