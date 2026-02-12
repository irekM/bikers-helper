// API Route: /api/products - CRUD operations for products
import { NextRequest, NextResponse } from 'next/server';
import {
  getProducts,
  addProduct,
} from '@/lib/firebase';
import { scrapeProduct, isUrlSupported, getSupportedShops } from '@/lib/scrapers';
import { isValidUrl } from '@/lib/scrapers/utils';
import type { ApiResponse, Product } from '@/types';

// GET /api/products?userId=xxx
export async function GET(request: NextRequest): Promise<NextResponse<ApiResponse<Product[]>>> {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'userId is required',
          },
        },
        { status: 400 }
      );
    }

    const products = await getProducts(userId);

    return NextResponse.json({
      success: true,
      data: products,
      meta: {
        total: products.length,
        page: 1,
        limit: products.length,
      },
    });
  } catch (error) {
    console.error('Error fetching products:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch products',
        },
      },
      { status: 500 }
    );
  }
}

// POST /api/products - Add new product
export async function POST(request: NextRequest): Promise<NextResponse<ApiResponse<{ id: string }>>> {
  try {
    const body = await request.json();
    const { url, userId } = body;

    // Validate input
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

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'AUTH_REQUIRED',
            message: 'User ID is required',
          },
        },
        { status: 401 }
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

    // Scrape product data
    const scrapedData = await scrapeProduct(url);

    // Save to Firestore
    const productId = await addProduct(userId, {
      url: scrapedData.originalUrl,
      name: scrapedData.name,
      price: scrapedData.price,
      currency: scrapedData.currency,
      imageUrl: scrapedData.imageUrl,
      shopName: scrapedData.shopName,
      available: scrapedData.available,
    });

    return NextResponse.json(
      {
        success: true,
        data: { id: productId },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Error adding product:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: error instanceof Error ? error.message : 'Failed to add product',
        },
      },
      { status: 500 }
    );
  }
}
