'use client';

import React, { use } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Chip,
  Button,
  IconButton,
  Skeleton,
  Alert,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  OpenInNew as OpenInNewIcon,
  Refresh as RefreshIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Store as StoreIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import PriceBadge from '@/components/products/PriceBadge';
import type { Product, PriceHistoryEntry } from '@/types';
import ProductDetailCard from '@/components/products/ProductDetailCard';
import PriceStats from '@/components/products/PriceStats';
import TwoColumnLayout from '@/components/layout/TwoColumnLayout';

interface ProductWithHistory extends Product {
  priceHistory: PriceHistoryEntry[];
}

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [product, setProduct] = React.useState<ProductWithHistory | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [refreshing, setRefreshing] = React.useState(false);

  const fetchProduct = React.useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setProduct(data.data);
      } else {
        setError(data.error.message);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch product');
    } finally {
      setLoading(false);
    }
  }, [id]);

  React.useEffect(() => {
    fetchProduct();
  }, [fetchProduct]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/products/${id}/refresh`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        await fetchProduct();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('pl-PL', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('pl-PL', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

 

  if (loading) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (error || !product) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Wróć
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {error || 'Nie znaleziono produktu'}
        </Alert>
      </Box>
    );
  }

   // Prepare data for price statistics
  const priceHistory = product.priceHistory;

  const averagePrice = priceHistory.length > 0
    ? Math.round(priceHistory.reduce((sum, entry) => sum + entry.price, 0) / priceHistory.length)
    : product.currentPrice;

  const firstPrice = priceHistory.length > 0
    ? priceHistory[priceHistory.length - 1].price
    : product.currentPrice;

  const percentChange = firstPrice !== 0
    ? ((product.currentPrice - firstPrice) / firstPrice) * 100
    : 0;

  const priceChangesCount = priceHistory.filter((entry, index) => {
    if (index === priceHistory.length - 1) return false;
    return entry.price !== priceHistory[index + 1].price;
  }).length;

  const stats = {
    lowestPrice: product.lowestPrice,
    lowestPriceDate: formatDate(product.createdAt),
    highestPrice: product.highestPrice,
    highestPriceDate: formatDate(product.createdAt),
    averagePrice,
    percentChange,
    trackedSince: formatDate(product.createdAt),
    priceChangesCount,
  };

  return (
    <Box>
      <TwoColumnLayout 
        header={
          <Button
            startIcon={<ArrowBackIcon />}
            onClick={() => router.back()}
            sx={{ mb: 2 }}
      >
        Wróć
          </Button>} 
        leftColumn={<ProductDetailCard product={product} />} 
        rightColumn={<PriceStats stats={stats} currency={product.currency} />}/>
      </Box>
  );
}

