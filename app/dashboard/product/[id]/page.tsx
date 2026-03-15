'use client';

import { use, useState, useEffect } from 'react';
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
import { formatDate, calculateAveragePrice, calculatePercentChangeFromHistory, countPriceChanges } from '@/lib/priceCalculation';

interface ProductWithHistory extends Product {
  priceHistory: PriceHistoryEntry[];
}

const PRODUCT_STATE = {
  INIT: 'init',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

type ProductState = 
| { type: typeof PRODUCT_STATE.INIT }
| { type: typeof PRODUCT_STATE.LOADING }
| { type: typeof PRODUCT_STATE.ERROR; error: string }
| { type: typeof PRODUCT_STATE.SUCCESS; product: ProductWithHistory };

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState<ProductState>({ type: PRODUCT_STATE.INIT });
  const [refreshing, setRefreshing] = useState(false);

  const loadProduct = async () => {
    try {
      setState({ type: PRODUCT_STATE.LOADING });

      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setState({
          type: PRODUCT_STATE.SUCCESS,
          product: data.data,
        });
        return;
      }

      setState({
        type: PRODUCT_STATE.ERROR,
        error: data.error?.message ?? 'Nie można załadować produktu',
      });
    } catch (err) {
      setState({
        type: PRODUCT_STATE.ERROR,
        error: err instanceof Error ? err.message : 'Nie można załadować produktu',
      });
    }
  };

  useEffect(() => {
    void loadProduct();
  }, [id]);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const response = await fetch(`/api/products/${id}/refresh`, {
        method: 'POST',
      });
      const data = await response.json();

      if (data.success) {
        await loadProduct();
      }
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };



 

  if (state.type === PRODUCT_STATE.LOADING || state.type === PRODUCT_STATE.INIT) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (state.type === PRODUCT_STATE.ERROR) {
    return (
      <Box>
        <Button startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
          Wróć
        </Button>
        <Alert severity="error" sx={{ mt: 2 }}>
          {state.error}
        </Alert>
      </Box>
    );
  }

   // Prepare data for price statistics
   const product = state.product;
  const priceHistory = product.priceHistory;

  const averagePrice = calculateAveragePrice(priceHistory, product.currentPrice);
  const percentChange = calculatePercentChangeFromHistory(product.currentPrice, priceHistory);
  const priceChangesCount = countPriceChanges(priceHistory);

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

