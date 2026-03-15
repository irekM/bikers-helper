'use client';

import React from 'react';
import { Box, Typography } from '@mui/material';
import { calculatePriceChange, calculatePriceChangePercent } from '@/lib/priceCalculation';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import RemoveIcon from '@mui/icons-material/Remove';

interface PriceChangeIndicatorProps {
  currentPrice: number;
  previousPrice: number | null;
  currency?: string;
  showPercentage?: boolean;
  showAbsolute?: boolean;
  size?: 'small' | 'medium' | 'large';
}

/**
 * PriceChangeIndicator - Skeleton komponent wskaźnika zmiany ceny
 * 
 * Kolory zgodne z dokumentacją:
 * - Spadek ceny (pozytywny): zielony #4caf50
 * - Wzrost ceny (negatywny): czerwony #f44336
 * - Bez zmian: szary #9e9e9e
 * 
 * TODO: Dodać logikę:
 * - Animacje przy zmianie wartości
 * - Tooltip z historią zmian
 */
export default function PriceChangeIndicator({
  currentPrice,
  previousPrice,
  currency = 'PLN',
  showPercentage = true,
  showAbsolute = true,
  size = 'medium',
}: PriceChangeIndicatorProps) {
  // Brak poprzedniej ceny - brak zmiany
  if (previousPrice === null || previousPrice === currentPrice) {
    return (
      <Box
        sx={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 0.5,
          px: size === 'small' ? 1 : 1.5,
          py: size === 'small' ? 0.25 : 0.5,
          borderRadius: 2,
          bgcolor: 'grey.100',
          color: 'text.secondary',
        }}
      >
        <RemoveIcon
          sx={{
            fontSize: size === 'small' ? 14 : size === 'medium' ? 18 : 22,
          }}
        />
        <Typography
          variant={size === 'small' ? 'caption' : size === 'medium' ? 'body2' : 'body1'}
          fontWeight={600}
        >
          Bez zmian
        </Typography>
      </Box>
    );
  }

  const change = calculatePriceChange(currentPrice, previousPrice);
  const changePercent = calculatePriceChangePercent(currentPrice, previousPrice);
  const isDecrease = change < 0;

  // Kolory z dokumentacji
  const bgColor = isDecrease ? 'success.light' : 'error.light';
  const textColor = isDecrease ? 'success.dark' : 'error.dark';
  const iconColor = isDecrease ? 'success.main' : 'error.main';

  const Icon = isDecrease ? TrendingDownIcon : TrendingUpIcon;

  // Formatowanie wartości
  const formatAbsolute = () => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${change.toFixed(0)} ${currency}`;
  };

  const formatPercent = () => {
    const prefix = change > 0 ? '+' : '';
    return `${prefix}${changePercent.toFixed(1)}%`;
  };

  // Tekst do wyświetlenia
  const getText = () => {
    const parts: string[] = [];
    if (showAbsolute) parts.push(formatAbsolute());
    if (showPercentage) parts.push(`(${formatPercent()})`);
    return parts.join(' ');
  };

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: size === 'small' ? 1 : 1.5,
        py: size === 'small' ? 0.25 : 0.5,
        borderRadius: 2,
        bgcolor: bgColor,
        color: textColor,
        transition: 'all 0.2s ease',
      }}
    >
      <Icon
        sx={{
          fontSize: size === 'small' ? 14 : size === 'medium' ? 18 : 22,
          color: iconColor,
        }}
      />
      <Typography
        variant={size === 'small' ? 'caption' : size === 'medium' ? 'body2' : 'body1'}
        fontWeight={600}
      >
        {getText()}
      </Typography>
    </Box>
  );
}

/**
 * Przykłady użycia:
 * 
 * <PriceChangeIndicator 
 *   currentPrice={450} 
 *   previousPrice={500} 
 * />
 * // Wyświetli: ↓ -50 PLN (-10.0%) na zielonym tle
 * 
 * <PriceChangeIndicator 
 *   currentPrice={550} 
 *   previousPrice={500} 
 *   size="small"
 * />
 * // Wyświetli: ↑ +50 PLN (+10.0%) na czerwonym tle (mały)
 * 
 * <PriceChangeIndicator 
 *   currentPrice={500} 
 *   previousPrice={500} 
 * />
 * // Wyświetli: — Bez zmian na szarym tle
 */
