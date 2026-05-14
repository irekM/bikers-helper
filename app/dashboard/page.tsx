'use client';

import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Paper, Skeleton } from '@mui/material';
import { useCurrentUserProducts } from '@/hooks/useCurrentUserProducts';
import { useCurrentUserFavorites } from '@/hooks/useCurrentUserFavorites';
import StatsCards from '@/components/dashboard/StatsCards';
import ProductList from '@/components/products/ProductList';
import type { DashboardStats } from '@/types';

export default function DashboardPage() {
  const { products, loading, error, refreshProduct, deleteProduct } = useCurrentUserProducts();
  const { favoriteIds, toggleFavorite } = useCurrentUserFavorites();

  // Calculate stats from products
  const stats: DashboardStats = React.useMemo(() => {
    let priceDrops = 0;
    let priceIncreases = 0;
    let activeAlerts = 0;

    products.forEach((product) => {
      if (product.previousPrice) {
        if (product.currentPrice < product.previousPrice) {
          priceDrops++;
        } else if (product.currentPrice > product.previousPrice) {
          priceIncreases++;
        }
      }
      if (product.alertSettings?.enabled) {
        activeAlerts++;
      }
    });

    return {
      totalProducts: products.length,
      priceDrops,
      priceIncreases,
      activeAlerts,
    };
  }, [products]);

  // Get recent products (last 4)
  const recentProducts = products.slice(0, 4);

  // Products with price drops
  const priceDropProducts = products
    .filter(
      (p) => p.previousPrice && p.currentPrice < p.previousPrice
    )
    .slice(0, 4);

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Dashboard
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Przegląd śledzonych produktów i zmian cen
      </Typography>

      {/* Stats Cards */}
      <Box sx={{ mb: 4 }}>
        <StatsCards stats={stats} loading={loading} />
      </Box>

      {/* Price Drops Section */}
      {priceDropProducts.length > 0 && (
        <Box sx={{ mb: 4 }}>
          <Typography variant="h5" fontWeight={600} gutterBottom sx={{ color: 'success.main' }}>
            🔥 Okazje - spadki cen
          </Typography>
          <ProductList
            products={priceDropProducts}
            onRefresh={refreshProduct}
            onDelete={deleteProduct}
            onToggleFavorite={toggleFavorite}
            favoriteIds={favoriteIds}
          />
        </Box>
      )}

      {/* Recent Products */}
      <Box>
        <Typography variant="h5" fontWeight={600} gutterBottom>
          Ostatnio dodane
        </Typography>
        <ProductList
          products={recentProducts}
          loading={loading}
          error={error}
          onRefresh={refreshProduct}
          onDelete={deleteProduct}
          onToggleFavorite={toggleFavorite}
          favoriteIds={favoriteIds}
          emptyMessage="Nie masz jeszcze żadnych śledzonych produktów"
        />
      </Box>
    </Box>
  );
}
