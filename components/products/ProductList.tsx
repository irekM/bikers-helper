'use client';

import React from 'react';
import { Grid, Box, Typography, Alert } from '@mui/material';
import ProductCard from './ProductCard';
import type { Product } from '@/types';

interface ProductListProps {
  products: Product[];
  loading?: boolean;
  error?: string | null;
  onRefresh?: (productId: string) => Promise<boolean>;
  onDelete?: (productId: string) => Promise<void>;
  onToggleFavorite?: (productId: string) => Promise<void>;
  favoriteIds?: string[];
  emptyMessage?: string;
}

export default function ProductList({
  products,
  loading,
  error,
  onRefresh,
  onDelete,
  onToggleFavorite,
  favoriteIds,
  emptyMessage = 'Brak produktów do wyświetlenia',
}: ProductListProps) {
  if (error) {
    return (
      <Alert severity="error" sx={{ mb: 2 }}>
        {error}
      </Alert>
    );
  }

  if (loading) {
    return (
      <Grid container spacing={3}>
        {[1, 2, 3, 4].map((i) => (
          <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={i}>
            <ProductCard product={{} as Product} loading />
          </Grid>
        ))}
      </Grid>
    );
  }

  if (products.length === 0) {
    return (
      <Box
        sx={{
          textAlign: 'center',
          py: 8,
          px: 2,
          backgroundColor: 'grey.50',
          borderRadius: 2,
        }}
      >
        <Typography variant="h6" color="text.secondary" gutterBottom>
          {emptyMessage}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Dodaj pierwszy produkt, aby rozpocząć śledzenie cen
        </Typography>
      </Box>
    );
  }

  return (
    <Grid container spacing={3}>
      {products.map((product) => (
        <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={product.id}>
          <ProductCard
            product={product}
            onRefresh={onRefresh}
            onDelete={onDelete}
            onToggleFavorite={onToggleFavorite}
            isFavorite={favoriteIds?.includes(product.id)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
