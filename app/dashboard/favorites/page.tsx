'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { useAuth } from '@/hooks/useAuth';
import { useProducts } from '@/hooks/useProducts';
import { useFavorites } from '@/hooks/useFavorites';
import ProductList from '@/components/products/ProductList';

export default function FavoritesPage() {
  const { user } = useAuth();
  const { products, loading: productsLoading, error, refreshProduct, deleteProduct } = useProducts({
    userId: user?.username,
  });
  const { favoriteIds, loading: favoritesLoading, toggleFavorite } = useFavorites({
    userId: user?.username,
  });

  // Filter products to only show favorites
  const favoriteProducts = products.filter((product) =>
    favoriteIds.includes(product.id)
  );

  const loading = productsLoading || favoritesLoading;

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Ulubione produkty
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Produkty dodane do ulubionych ({favoriteProducts.length})
      </Typography>

      {/* Product List */}
      <ProductList
        products={favoriteProducts}
        loading={loading}
        error={error}
        onRefresh={refreshProduct}
        onDelete={deleteProduct}
        onToggleFavorite={toggleFavorite}
        favoriteIds={favoriteIds}
        emptyMessage="Nie masz jeszcze ulubionych produktów. Kliknij ❤ na karcie produktu, aby dodać go tutaj."
      />
    </Box>
  );
}
