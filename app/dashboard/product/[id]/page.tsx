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

const errorMessage = 'Nie można załadować produktu';

interface ProductWithHistory extends Product {
  priceHistory: PriceHistoryEntry[];
}

const productState = {
  INIT: 'init',
  LOADING: 'loading',
  ERROR: 'error',
  SUCCESS: 'success',
} as const;

type ProductState = 
| { type: typeof productState.INIT }
| { type: typeof productState.LOADING }
| { type: typeof productState.ERROR; error: string }
| { type: typeof productState.SUCCESS; product: ProductWithHistory };

export default function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();
  const [state, setState] = useState<ProductState>({ type: productState.INIT });
  const [refreshing, setRefreshing] = useState(false);

  const loadProduct = async () => {
    try {
      setState({ type: productState.LOADING });

      const response = await fetch(`/api/products/${id}`);
      const data = await response.json();

      if (data.success) {
        setState({
          type: productState.SUCCESS,
          product: data.data,
        });
        return;
      }

      setState({
        type: productState.ERROR,
        error: errorMessage,
      });
    } catch (err) {
      setState({
        type: productState.ERROR,
        error: errorMessage,
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



 

  if (state.type === productState.LOADING || state.type === productState.INIT) {
    return (
      <Box>
        <Skeleton variant="text" width={300} height={40} />
        <Skeleton variant="rectangular" height={400} sx={{ mt: 2 }} />
      </Box>
    );
  }

  if (state.type === productState.ERROR) {
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
   const { product } = state;
  const { priceHistory, currentPrice, lowestPrice, highestPrice, createdAt, currency } = product;

  const averagePrice = calculateAveragePrice(priceHistory, currentPrice);
  const percentChange = calculatePercentChangeFromHistory(currentPrice, priceHistory);
  const priceChangesCount = countPriceChanges(priceHistory);

  const stats = {
    lowestPrice,
    lowestPriceDate: formatDate(createdAt),
    highestPrice,
    highestPriceDate: formatDate(createdAt),
    averagePrice,
    percentChange,
    trackedSince: formatDate(createdAt),
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
        rightColumn={<PriceStats stats={stats} currency={currency} />}/>
      </Box>
  );
}

