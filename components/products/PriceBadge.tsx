'use client';

import React from 'react';
import { Chip, ChipProps } from '@mui/material';
import {
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  TrendingFlat as TrendingFlatIcon,
} from '@mui/icons-material';

interface PriceBadgeProps {
  currentPrice: number;
  previousPrice?: number;
  showPercentage?: boolean;
  size?: 'small' | 'medium';
}

export default function PriceBadge({
  currentPrice,
  previousPrice,
  showPercentage = true,
  size = 'small',
}: PriceBadgeProps) {
  if (!previousPrice || previousPrice === currentPrice) {
    return (
      <Chip
        icon={<TrendingFlatIcon />}
        label="Bez zmian"
        size={size}
        sx={{
          backgroundColor: 'grey.100',
          color: 'grey.700',
        }}
      />
    );
  }

  const change = currentPrice - previousPrice;
  const changePercent = ((change / previousPrice) * 100).toFixed(1);
  const isDropped = change < 0;

  const chipProps: ChipProps = {
    size,
    icon: isDropped ? <TrendingDownIcon /> : <TrendingUpIcon />,
    label: showPercentage ? `${changePercent}%` : `${change > 0 ? '+' : ''}${change.toFixed(2)} zł`,
    sx: {
      backgroundColor: isDropped ? 'success.light' : 'error.light',
      color: isDropped ? 'success.dark' : 'error.dark',
      fontWeight: 600,
      '& .MuiChip-icon': {
        color: 'inherit',
      },
    },
  };

  return <Chip {...chipProps} />;
}
