'use client';

import React from 'react';
import { Box, Paper, Typography, useTheme, Skeleton } from '@mui/material';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import { sectionCardPaddedSx, sectionHeaderSx, iconRowSx } from '@/theme/commonStyles';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceLine,
} from 'recharts';

const mockChartData = [
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

interface CustomTooltipProps {
  active?: boolean;
  payload?: { value: number }[];
  label?: string;
  currency: string;
}

function CustomTooltip({ active, payload, label, currency }: CustomTooltipProps) {
  if (!active || !payload?.length) return null;

  return (
    <Paper elevation={3} sx={{ p: 1.5, border: '1px solid', borderColor: 'divider' }}>
      <Typography variant="caption" color="text.secondary">
        {label}
      </Typography>
      <Typography variant="body2" fontWeight={600}>
        {payload[0].value} {currency}
      </Typography>
    </Paper>
  );
}

export default function PriceChart({
  data = mockChartData,
  currency = 'PLN',
  isLoading = false,
  height = 300,
}: PriceChartProps) {
  const theme = useTheme();

  const prices = data.map((d) => d.price);
  const minPrice = Math.min(...prices);
  const maxPrice = Math.max(...prices);

  const chartColors = {
    line: theme.palette.primary.main,
    min: theme.palette.success.main,
    max: theme.palette.error.main,
    grid: theme.palette.divider,
  };

  if (isLoading) {
    return (
      <Paper elevation={0} sx={sectionCardPaddedSx}>
        <Skeleton variant="text" width={200} height={32} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={height} sx={{ borderRadius: 2 }} />
      </Paper>
    );
  }

  return (
    <Paper elevation={0} sx={sectionCardPaddedSx}>
      {/* Header */}
      <Box sx={sectionHeaderSx}>
        <Box sx={iconRowSx}>
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
                bgcolor: chartColors.min,
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
                bgcolor: chartColors.max,
                borderRadius: 1,
              }}
            />
            <Typography variant="caption" color="text.secondary">
              Max: {maxPrice} {currency}
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* chart of Recharts */}
      <ResponsiveContainer width="100%" height={height}>
        <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 5 }}>
          <defs>
            <linearGradient id="priceGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColors.line} stopOpacity={0.15} />
              <stop offset="95%" stopColor={chartColors.line} stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke={chartColors.grid}
          />

          <YAxis
            tick={{ fontSize: 12 }}
            tickLine={false}
            stroke={chartColors.grid}
            tickFormatter={(value: number) => `${value} ${currency}`}
            width={80}
          />

          <Tooltip content={<CustomTooltip currency={currency} />} />

          <ReferenceLine
            y={minPrice}
            stroke={chartColors.min}
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />
          <ReferenceLine
            y={maxPrice}
            stroke={chartColors.max}
            strokeDasharray="5 5"
            strokeWidth={1.5}
          />

          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColors.line}
            strokeWidth={2.5}
            fill="url(#priceGradient)"
            dot={{ r: 4, fill: chartColors.line, strokeWidth: 2, stroke: '#fff' }}
            activeDot={{ r: 6, fill: chartColors.line, strokeWidth: 2, stroke: '#fff' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </Paper>
  );
}
