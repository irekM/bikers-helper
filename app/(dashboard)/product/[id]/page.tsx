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

  return (
    <Box>
      {/* Back Button */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => router.back()}
        sx={{ mb: 2 }}
      >
        Wróć
      </Button>

      <Grid container spacing={4}>
        {/* Product Info */}
        <Grid size={{ xs: 12, md: 8 }}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', gap: 3 }}>
                {/* Image */}
                {product.imageUrl && (
                  <Box
                    component="img"
                    src={product.imageUrl}
                    alt={product.name}
                    sx={{
                      width: 200,
                      height: 200,
                      objectFit: 'contain',
                      borderRadius: 2,
                      backgroundColor: 'grey.100',
                    }}
                  />
                )}

                {/* Details */}
                <Box sx={{ flex: 1 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                    <Chip icon={<StoreIcon />} label={product.shopName} />
                    {!product.available && (
                      <Chip label="Niedostępny" color="error" />
                    )}
                  </Box>

                  <Typography variant="h5" fontWeight={700} gutterBottom>
                    {product.name}
                  </Typography>

                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                    <Typography variant="h3" fontWeight={700} color="primary.main">
                      {formatPrice(product.currentPrice, product.currency)}
                    </Typography>
                    <PriceBadge
                      currentPrice={product.currentPrice}
                      previousPrice={product.previousPrice}
                      size="medium"
                    />
                  </Box>

                  {product.previousPrice &&
                    product.previousPrice !== product.currentPrice && (
                      <Typography
                        variant="h6"
                        color="text.secondary"
                        sx={{ textDecoration: 'line-through' }}
                      >
                        {formatPrice(product.previousPrice, product.currency)}
                      </Typography>
                    )}

                  <Box sx={{ mt: 3, display: 'flex', gap: 2 }}>
                    <Button
                      variant="contained"
                      startIcon={<OpenInNewIcon />}
                      component="a"
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Otwórz w sklepie
                    </Button>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleRefresh}
                      disabled={refreshing}
                    >
                      {refreshing ? 'Odświeżanie...' : 'Odśwież cenę'}
                    </Button>
                  </Box>
                </Box>
              </Box>
            </CardContent>
          </Card>

          {/* Price History Table */}
          <Paper sx={{ mt: 3 }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600}>
                Historia cen
              </Typography>
            </Box>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell align="right">Cena</TableCell>
                    <TableCell align="center">Dostępność</TableCell>
                    <TableCell align="center">Zmiana</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {product.priceHistory.map((entry, index) => {
                    const prevEntry = product.priceHistory[index + 1];
                    const priceChange = prevEntry
                      ? entry.price - prevEntry.price
                      : 0;

                    return (
                      <TableRow key={entry.id}>
                        <TableCell>{formatDate(entry.timestamp)}</TableCell>
                        <TableCell align="right">
                          <Typography fontWeight={600}>
                            {formatPrice(entry.price, product.currency)}
                          </Typography>
                        </TableCell>
                        <TableCell align="center">
                          <Chip
                            label={entry.available ? 'Dostępny' : 'Niedostępny'}
                            color={entry.available ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell align="center">
                          {priceChange !== 0 && (
                            <Box
                              sx={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: priceChange < 0 ? 'success.main' : 'error.main',
                              }}
                            >
                              {priceChange < 0 ? (
                                <TrendingDownIcon fontSize="small" />
                              ) : (
                                <TrendingUpIcon fontSize="small" />
                              )}
                              <Typography variant="body2" fontWeight={600}>
                                {priceChange > 0 ? '+' : ''}
                                {formatPrice(priceChange, product.currency)}
                              </Typography>
                            </Box>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>

        {/* Stats Sidebar */}
        <Grid size={{ xs: 12, md: 4 }}>
          <Card>
            <CardContent>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                Statystyki
              </Typography>

              <Box sx={{ mt: 2 }}>
                <StatItem
                  label="Najniższa cena"
                  value={formatPrice(product.lowestPrice, product.currency)}
                  color="success.main"
                />
                <StatItem
                  label="Najwyższa cena"
                  value={formatPrice(product.highestPrice, product.currency)}
                  color="error.main"
                />
                <StatItem
                  label="Aktualna cena"
                  value={formatPrice(product.currentPrice, product.currency)}
                  color="primary.main"
                />
                <StatItem
                  label="Dodano"
                  value={formatDate(product.createdAt)}
                />
                <StatItem
                  label="Ostatnia aktualizacja"
                  value={formatDate(product.lastChecked)}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}

function StatItem({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color?: string;
}) {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        py: 1.5,
        borderBottom: 1,
        borderColor: 'divider',
        '&:last-child': { borderBottom: 0 },
      }}
    >
      <Typography variant="body2" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body1" fontWeight={600} sx={{ color }}>
        {value}
      </Typography>
    </Box>
  );
}
