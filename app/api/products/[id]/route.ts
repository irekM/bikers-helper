// API Route: /api/products/[id] - Single product operations
import { NextRequest, NextResponse } from 'next/server';
import {
  getProduct,
  updateProduct,
  deleteProduct,
  getPriceHistory,
} from '@/lib/firebase';
import type { ApiResponse, Product, PriceHistoryEntry } from '@/types';

interface ProductWithHistory extends Product {
  priceHistory: PriceHistoryEntry[];
}

// GET /api/products/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<ProductWithHistory>>> {
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

    // Get price history
    const priceHistory = await getPriceHistory(id);

    return NextResponse.json({
      success: true,
      data: {
        ...product,
        priceHistory,
      },
    });
  } catch (error) {
    console.error('Error fetching product:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch product',
        },
      },
      { status: 500 }
    );
  }
}

// PUT /api/products/[id] - Update product settings
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { id } = await params;
    const body = await request.json();

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

    // Only allow updating certain fields
    const allowedUpdates: Partial<Pick<Product, 'alertSettings' | 'category'>> = {};

    if (body.alertSettings) {
      allowedUpdates.alertSettings = body.alertSettings;
    }
    if (body.category !== undefined) {
      allowedUpdates.category = body.category;
    }

    await updateProduct(id, allowedUpdates);

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Error updating product:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update product',
        },
      },
      { status: 500 }
    );
  }
}

// DELETE /api/products/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
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

    await deleteProduct(id);

    return NextResponse.json({
      success: true,
      data: { success: true },
    });
  } catch (error) {
    console.error('Error deleting product:', error);

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete product',
        },
      },
      { status: 500 }
    );
  }
}
