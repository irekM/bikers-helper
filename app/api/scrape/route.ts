// API Route: POST /api/scrape - Scrape product data from URL
import { NextRequest, NextResponse } from 'next/server';
import { scrapeProduct, isUrlSupported, getSupportedShops } from '@/lib/scrapers';
import { isValidUrl } from '@/lib/scrapers/utils';
import type { ApiResponse, ScrapedProduct } from '@/types';

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<ScrapedProduct>>> {
  try {
    const body = await request.json();
    const { url } = body;

    // Validate URL
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'URL is required',
          },
        },
        { status: 400 }
      );
    }

    if (!isValidUrl(url)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid URL format',
          },
        },
        { status: 400 }
      );
    }

    // Check if shop is supported
    if (!isUrlSupported(url)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCRAPER_NOT_FOUND',
            message: `This shop is not supported yet. Supported shops: ${getSupportedShops().join(', ')}`,
          },
        },
        { status: 400 }
      );
    }

    // Scrape the product
    const scrapedData = await scrapeProduct(url);

    return NextResponse.json({
      success: true,
      data: scrapedData,
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
