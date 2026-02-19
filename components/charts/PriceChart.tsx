'use client';

import React from 'react';
import { Box, Paper, Typography, useTheme, Skeleton } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';

// Dummy data dla wykresu - wizualna reprezentacja
const MOCK_CHART_DATA = [
  { date: '01.01', price: 499 },
  { date: '08.01', price: 520 },
  { date: '15.01', price: 485 },
  { date: '22.01', price: 510 },
  { date: '29.01', price: 450 },
  { date: '05.02', price: 475 },
  { date: '12.02', price: 489 },
];

interface PriceChartProps {
  data?: { date: string; price: number; available?: boolean }[];
  currency?: string;
  isLoading?: boolean;
  height?: number;
}

/**
 * PriceChart - Skeleton komponent wykresu cenowego
 * 
 * TODO: Dodać logikę:
 * - Instalacja i integracja Recharts: npm install recharts
 * - Pobieranie danych historycznych z Firestore
 * - Tooltip z detalami (data, cena, dostępność)
 * - Linie referencyjne min/max
 * - Responsywność (ResponsiveContainer)
 * - Formatowanie dat według wybranego zakresu
 */
export default function PriceChart({
  data = MOCK_CHART_DATA,
  currency = 'PLN',
  isLoading = false,
  height = 300,
}: PriceChartProps) {
  const theme = useTheme();

  // Oblicz min/max z danych (placeholder)
  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  // Kolory zgodne z dokumentacją
  const CHART_COLORS = {
    line: theme.palette.primary.main, // #1976d2
    area: `${theme.palette.primary.main}1A`, // 10% opacity
    min: theme.palette.success.main, // #4caf50
    max: theme.palette.error.main, // #f44336
    grid: theme.palette.divider,
  };

  if (isLoading) {
    return (
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 3,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <ShowChartIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Historia cen
          </Typography>
        </Box>

        {/* Legenda */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 3,
                bgcolor: CHART_COLORS.min,
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Min: {minPrice} {currency}
            </Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box
              sx={{
                width: 12,
                height: 3,
                bgcolor: CHART_COLORS.max,
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Max: {maxPrice} {currency}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Placeholder dla wykresu Recharts */}
      <Box
        sx={{
          width: '100%',
          height: height,
          bgcolor: 'action.hover',
          borderRadius: 2,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px dashed',
          borderColor: 'divider',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Symulacja siatki wykresu */}
        <Box
          sx={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            p: 3,
            opacity: 0.3,
          }}
        >
          {[...Array(5)].map((_, i) => (
            <Box
              key={i}
              sx={{
                width: '100%',
                height: 1,
                bgcolor: 'divider',
              }}
            />
          ))}
        </Box>

        {/* Symulacja linii wykresu - prosty SVG */}
        <Box
          component="svg"
          viewBox="0 0 300 150"
          sx={{
            position: 'absolute',
            inset: 0,
            p: 3,
          }}
        >
          {/* Obszar pod linią */}
          <path
            d="M 0 100 L 50 80 L 100 110 L 150 85 L 200 130 L 250 105 L 300 95 L 300 150 L 0 150 Z"
            fill={CHART_COLORS.area}
          />
          {/* Linia główna */}
          <path
            d="M 0 100 L 50 80 L 100 110 L 150 85 L 200 130 L 250 105 L 300 95"
            fill="none"
            stroke={CHART_COLORS.line}
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Punkty danych */}
          {[
            { x: 0, y: 100 },
            { x: 50, y: 80 },
            { x: 100, y: 110 },
            { x: 150, y: 85 },
            { x: 200, y: 130 },
            { x: 250, y: 105 },
            { x: 300, y: 95 },
          ].map((point, i) => (
            <circle
              key={i}
              cx={point.x}
              cy={point.y}
              r="5"
              fill={CHART_COLORS.line}
            />
          ))}
          {/* Linia min */}
          <line
            x1="0"
            y1="130"
            x2="300"
            y2="130"
            stroke={CHART_COLORS.min}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
          {/* Linia max */}
          <line
            x1="0"
            y1="70"
            x2="300"
            y2="70"
            stroke={CHART_COLORS.max}
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        </Box>

        {/* Overlay z instrukcją */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 1,
            textAlign: 'center',
            p: 2,
            bgcolor: 'rgba(255,255,255,0.9)',
            borderRadius: 2,
          }}
        >
          <Typography variant="body2" color="text.secondary" gutterBottom>
            📊 Wykres Recharts - do implementacji
          </Typography>
          <Typography variant="caption" color="text.disabled">
            npm install recharts
          </Typography>
        </Box>
      </Box>

      {/* Oś X - daty */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          mt: 1,
          px: 1,
        }}
      >
        {data.map((d, i) => (
          <Typography key={i} variant="caption" color="text.secondary">
            {d.date}
          </Typography>
        ))}
      </Box>
    </Paper>
  );
}
