'use client';

import React from 'react';
import { Box, Typography, Alert, AlertTitle } from '@mui/material';

// Komponenty skeleton
import TwoColumnLayout from '@/components/layout/TwoColumnLayout';
import CategoryBreadcrumbs from '@/components/navigation/CategoryBreadcrumbs';
import TimeRangeFilter from '@/components/filters/TimeRangeFilter';
import CategoryFilter from '@/components/filters/CategoryFilter';
import ProductDetailCard from '@/components/products/ProductDetailCard';
import PriceChart from '@/components/charts/PriceChart';
import PriceStats from '@/components/products/PriceStats';
import PriceChangeIndicator from '@/components/products/PriceChangeIndicator';

/**
 * DashboardSkeletonPage - Strona demonstracyjna wszystkich komponentów skeleton
 * 
 * Ta strona pokazuje jak komponenty wyglądają i współpracują ze sobą.
 * Wszystkie dane są mockowane - logikę należy zaimplementować samodzielnie.
 * 
 * TODO: Przeniesić do app/(dashboard)/products/[id]/page.tsx
 */
export default function DashboardSkeletonPage() {
  return (
    <Box>
      {/* Info Alert */}
      <Alert severity="info" sx={{ mb: 3, mx: 3, mt: 3 }}>
        <AlertTitle>Skeleton Dashboard - Preview</AlertTitle>
        To jest podgląd komponentów skeleton. Wszystkie dane są mockowane.
        Komponenty są gotowe do stylowania - logikę należy zaimplementować
        samodzielnie.
      </Alert>

      {/* Przykład PriceChangeIndicator */}
      <Box sx={{ px: 3, mb: 3 }}>
        <Typography variant="subtitle2" gutterBottom fontWeight={600}>
          Przykłady PriceChangeIndicator:
        </Typography>
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
          <PriceChangeIndicator currentPrice={450} previousPrice={500} size="small" />
          <PriceChangeIndicator currentPrice={550} previousPrice={500} size="medium" />
          <PriceChangeIndicator currentPrice={500} previousPrice={500} size="large" />
        </Box>
      </Box>

      {/* Main Layout */}
      <TwoColumnLayout
        header={
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <CategoryBreadcrumbs
              currentCategory="helmets"
              productName="AGV K3 SV Rossi Winter Test 2019"
            />
            <TimeRangeFilter value="30d" />
            <CategoryFilter />
          </Box>
        }
        leftColumn={
          <ProductDetailCard />
        }
        rightColumn={
          <>
            <PriceChart />
            <PriceStats />
          </>
        }
      />
    </Box>
  );
}
