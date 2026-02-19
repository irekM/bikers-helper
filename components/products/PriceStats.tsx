'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  Skeleton,
} from '@mui/material';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import BarChartIcon from '@mui/icons-material/BarChart';
import AutorenewIcon from '@mui/icons-material/Autorenew';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import NumbersIcon from '@mui/icons-material/Numbers';

interface PriceStatsProps {
  stats?: {
    lowestPrice: number;
    lowestPriceDate: string;
    highestPrice: number;
    highestPriceDate: string;
    averagePrice: number;
    percentChange: number;
    trackedSince: string;
    priceChangesCount: number;
  };
  currency?: string;
  isLoading?: boolean;
}

// Domyślne dane - do zastąpienia prawdziwymi
const DEFAULT_STATS = {
  lowestPrice: 399,
  lowestPriceDate: '15.03.2024',
  highestPrice: 599,
  highestPriceDate: '12.01.2024',
  averagePrice: 489,
  percentChange: -12.5,
  trackedSince: '01.01.2024',
  priceChangesCount: 8,
};

interface StatItemProps {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtitle?: string;
  color?: 'success' | 'error' | 'primary' | 'default';
}

/**
 * StatItem - Pojedynczy element statystyki
 */
function StatItem({ icon, label, value, subtitle, color = 'default' }: StatItemProps) {
  const getIconColor = () => {
    switch (color) {
      case 'success':
        return 'success.main';
      case 'error':
        return 'error.main';
      case 'primary':
        return 'primary.main';
      default:
        return 'text.secondary';
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 1.5,
        p: 1.5,
        borderRadius: 2,
        bgcolor: 'action.hover',
        transition: 'all 0.2s ease',
        '&:hover': {
          bgcolor: 'action.selected',
          transform: 'translateY(-2px)',
        },
      }}
    >
      <Box
        sx={{
          p: 1,
          borderRadius: 1.5,
          bgcolor: 'background.paper',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: getIconColor(),
        }}
      >
        {icon}
      </Box>
      <Box sx={{ flex: 1 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={500}>
          {label}
        </Typography>
        <Typography variant="body1" fontWeight={700} color="text.primary">
          {value}
        </Typography>
        {subtitle && (
          <Typography variant="caption" color="text.disabled">
            {subtitle}
          </Typography>
        )}
      </Box>
    </Box>
  );
}

/**
 * PriceStats - Skeleton komponent statystyk cenowych
 * 
 * TODO: Dodać logikę:
 * - Hook usePriceStats do obliczania statystyk
 * - Formatowanie dat (date-fns)
 * - Animacje przy zmianie wartości
 * - Tooltips z dodatkowymi informacjami
 */
export default function PriceStats({
  stats = DEFAULT_STATS,
  currency = 'PLN',
  isLoading = false,
}: PriceStatsProps) {
  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <CardContent>
          <Skeleton variant="text" width={180} height={32} sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {[...Array(6)].map((_, i) => (
              <Grid size={6} key={i}>
                <Skeleton variant="rectangular" height={80} sx={{ borderRadius: 2 }} />
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    );
  }

  const formatPercentChange = (value: number) => {
    const prefix = value > 0 ? '+' : '';
    return `${prefix}${value.toFixed(1)}%`;
  };

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
          <BarChartIcon color="primary" />
          <Typography variant="h6" fontWeight={600}>
            Statystyki cenowe
          </Typography>
        </Box>

        <Grid container spacing={2}>
          {/* Najniższa cena */}
          <Grid size={6}>
            <StatItem
              icon={<TrendingDownIcon />}
              label="Najniższa cena"
              value={`${stats.lowestPrice} ${currency}`}
              subtitle={`dnia ${stats.lowestPriceDate}`}
              color="success"
            />
          </Grid>

          {/* Najwyższa cena */}
          <Grid size={6}>
            <StatItem
              icon={<TrendingUpIcon />}
              label="Najwyższa cena"
              value={`${stats.highestPrice} ${currency}`}
              subtitle={`dnia ${stats.highestPriceDate}`}
              color="error"
            />
          </Grid>

          {/* Średnia cena */}
          <Grid size={6}>
            <StatItem
              icon={<BarChartIcon />}
              label="Średnia cena"
              value={`${stats.averagePrice} ${currency}`}
              color="primary"
            />
          </Grid>

          {/* Zmiana procentowa */}
          <Grid size={6}>
            <StatItem
              icon={<AutorenewIcon />}
              label="Zmiana ceny"
              value={formatPercentChange(stats.percentChange)}
              subtitle="od pierwszego pomiaru"
              color={stats.percentChange < 0 ? 'success' : 'error'}
            />
          </Grid>

          {/* Śledzone od */}
          <Grid size={6}>
            <StatItem
              icon={<CalendarTodayIcon />}
              label="Śledzone od"
              value={stats.trackedSince}
            />
          </Grid>

          {/* Liczba zmian */}
          <Grid size={6}>
            <StatItem
              icon={<NumbersIcon />}
              label="Zmiany ceny"
              value={`${stats.priceChangesCount} razy`}
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
