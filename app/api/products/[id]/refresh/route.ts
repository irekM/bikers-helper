// API Route: POST /api/products/[id]/refresh - Manually refresh product price
import { NextRequest, NextResponse } from 'next/server';
import { getProduct, updateProductPrice } from '@/lib/firebase';
import { scrapeProduct } from '@/lib/scrapers';
import type { ApiResponse, Product } from '@/types';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ product: Product; priceChanged: boolean }>>> {
  try {
    const { id } = await params;
    const product = await getProduct(id);

    if (!product) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PRODUCT_NOT_FOUND',
            message: 'Product not found',
          },
        },
        { status: 404 }
      );
    }

    // Scrape current price
    const scrapedData = await scrapeProduct(product.url);

    // Check if price changed
    const priceChanged = scrapedData.price !== product.currentPrice;

    // Update product
    await updateProductPrice(id, scrapedData.price, scrapedData.available);

    // Get updated product
    const updatedProduct = await getProduct(id);

    return NextResponse.json({
      success: true,
      data: {
        product: updatedProduct!,
        priceChanged,
      },
    });
  } catch (error) {
    console.error('Error refreshing product:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SCRAPER_FAILED',
          message: error instanceof Error ? error.message : 'Failed to refresh product price',
        },
      },
      { status: 500 }
    );
  }
}
