'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import ProductList from '@/components/products/ProductList';

export default function FavoritesPage() {
  const { firebaseUser } = useAuth();
  const { products, loading, error, refreshProduct, deleteProduct } = useProducts({
    userId: firebaseUser?.uid,
  });

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Śledzone produkty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Wszystkie produkty, których ceny monitorujesz ({products.length})
      </Typography>

      {/* Product List */}
      <ProductList
        products={products}
        loading={loading}
        error={error}
        onRefresh={refreshProduct}
        onDelete={deleteProduct}
        emptyMessage="Nie śledzisz jeszcze żadnych produktów. Dodaj pierwszy produkt w sekcji 'Dodaj'."
      />
    </Box>
  );
}
