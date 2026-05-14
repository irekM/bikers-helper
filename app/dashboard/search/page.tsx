'use client';

import React from 'react';
import { Box, Typography, Grid } from '@mui/material';
import { useCurrentUserProducts } from '@/hooks/useCurrentUserProducts';
import { useCurrentUserFavorites } from '@/hooks/useCurrentUserFavorites';
import AddProductForm from '@/components/products/AddProductForm';
import ProductList from '@/components/products/ProductList';

export default function SearchPage() {
  const { products, addProduct, refreshProduct, deleteProduct } = useCurrentUserProducts();
  const { favoriteIds, toggleFavorite } = useCurrentUserFavorites();

  // Get recently added products (last 3)
  const recentProducts = products.slice(0, 3);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dodaj produkt
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Wklej link do produktu, aby rozpocząć śledzenie jego ceny
      </Typography>

      <Grid container spacing={4}>
        {/* Add Product Form */}
        <Grid size={{ xs: 12, md: 6 }}>
          <AddProductForm onSubmit={addProduct} />
        </Grid>

        {/* Recently Added */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Typography variant="h6" gutterBottom>
            Ostatnio dodane
          </Typography>
          <ProductList
            products={recentProducts}
            onRefresh={refreshProduct}
            onDelete={deleteProduct}
            onToggleFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
            emptyMessage="Brak ostatnio dodanych produktów"
          />
        </Grid>
      </Grid>
    </Box>
  );
}
