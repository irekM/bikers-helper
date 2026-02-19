'use client';

import React from 'react';
import { Box, Grid, Container, Paper } from '@mui/material';

interface TwoColumnLayoutProps {
  leftColumn: React.ReactNode;
  rightColumn: React.ReactNode;
  header?: React.ReactNode;
  leftColumnWidth?: number; // xs 1-12
  rightColumnWidth?: number; // xs 1-12
  spacing?: number;
}

/**
 * TwoColumnLayout - Skeleton komponent layoutu dwukolumnowego
 * 
 * Proporcje zgodne z dokumentacją:
 * - Karta produktu (lewa): xs={12} md={4} (około 35%)
 * - Sekcja analizy (prawa): xs={12} md={8} (około 65%)
 * 
 * Na mobile obie kolumny zajmują 100% szerokości (xs={12})
 * 
 * TODO: Dodać logikę:
 * - Sticky left column na scroll (opcjonalne)
 * - Responsywne ukrywanie elementów
 * - Animacje przy ładowaniu
 */
export default function TwoColumnLayout({
  leftColumn,
  rightColumn,
  header,
  leftColumnWidth = 4, // md={4} = ~33%
  rightColumnWidth = 8, // md={8} = ~67%
  spacing = 3,
}: TwoColumnLayoutProps) {
  return (
    <Container maxWidth="xl" sx={{ py: 3 }}>
      {/* Header (Breadcrumbs, Filtry) */}
      {header && (
        <Box sx={{ mb: 3 }}>
          {header}
        </Box>
      )}

      {/* Main Content - Two Columns */}
      <Grid container spacing={spacing}>
        {/* Lewa kolumna - Karta produktu */}
        <Grid size={{ xs: 12, md: leftColumnWidth }}>
          <Box
            sx={{
              position: { md: 'sticky' },
              top: { md: 24 },
            }}
          >
            {leftColumn}
          </Box>
        </Grid>

        {/* Prawa kolumna - Wykres i Statystyki */}
        <Grid size={{ xs: 12, md: rightColumnWidth }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            {rightColumn}
          </Box>
        </Grid>
      </Grid>
    </Container>
  );
}

/**
 * Przykład użycia:
 * 
 * <TwoColumnLayout
 *   header={
 *     <>
 *       <CategoryBreadcrumbs currentCategory="helmets" productName="AGV K3" />
 *       <TimeRangeFilter value="30d" />
 *     </>
 *   }
 *   leftColumn={
 *     <ProductDetailCard product={product} />
 *   }
 *   rightColumn={
 *     <>
 *       <PriceChart data={priceHistory} />
 *       <PriceStats stats={stats} />
 *     </>
 *   }
 * />
 */
