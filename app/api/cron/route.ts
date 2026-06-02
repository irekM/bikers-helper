// API Route: POST /api/cron - Scheduled price check (called by external CRON service)
import { NextRequest, NextResponse } from 'next/server';
import { getAllProductsForUpdate, updateProductPrice } from '@/lib/firebase';
import { runScraper } from '@/lib/scrapers/runner';
import { sleep } from '@/lib/scrapers/utils';
import type { ApiResponse } from '@/types';

interface CronResult {
  totalProducts: number;
  updated: number;
  failed: number;
  priceChanges: number;
  errors: string[];
}

export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<CronResult>>> {
  try {
    // Verify CRON secret (basic security)
    const authHeader = request.headers.get('authorization');
    const cronSecret = process.env.CRON_SECRET;

    if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_INVALID',
            message: 'Invalid CRON secret',
          },
        },
        { status: 401 }
      );
    }

    // Get all products
    const products = await getAllProductsForUpdate();

    const result: CronResult = {
      totalProducts: products.length,
      updated: 0,
      failed: 0,
      priceChanges: 0,
      errors: [],
    };

    // Process each product with rate limiting
    for (const product of products) {
      try {
        const result = await runScraper(product.url);

        if (!result.success || !result.data) {
          throw new Error(result.error?.message || 'Failed to scrape product');
        }

        const scrapedData = result.data;

        // Track price changes
        if (scrapedData.price !== product.currentPrice) {
          result.priceChanges++;
        }

        // Update product
        await updateProductPrice(product.id, scrapedData.price, scrapedData.available);
        result.updated++;

        // Rate limiting: wait 2 seconds between requests
        await sleep(2000);
      } catch (error) {
        result.failed++;
        result.errors.push(
          `${product.name}: ${error instanceof Error ? error.message : 'Unknown error'}`
        );

        // Still wait to avoid overwhelming servers
        await sleep(1000);
      }
    }

    return NextResponse.json({
      success: true,
      data: result,
    });
  } catch (error) {
    console.error('CRON error:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'CRON job failed',
        },
      },
      { status: 500 }
    );
  }
}
