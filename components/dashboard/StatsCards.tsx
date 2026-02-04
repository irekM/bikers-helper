'use client';

import React from 'react';
import { Box, Grid, Card, CardContent, Typography } from '@mui/material';
import {
  Inventory as InventoryIcon,
  TrendingDown as TrendingDownIcon,
  TrendingUp as TrendingUpIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import type { DashboardStats } from '@/types';

interface StatsCardsProps {
  stats: DashboardStats;
  loading?: boolean;
}

interface StatCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

function StatCard({ title, value, icon, color, bgColor }: StatCardProps) {
  return (
    <Card>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="body2" color="text.secondary" gutterBottom>
              {title}
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {value}
            </Typography>
          </Box>
          <Box
            sx={{
              width: 56,
              height: 56,
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: bgColor,
              color: color,
            }}
          >
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

export default function StatsCards({ stats, loading }: StatsCardsProps) {
  const cards: StatCardProps[] = [
    {
      title: 'Śledzone produkty',
      value: stats.totalProducts,
      icon: <InventoryIcon fontSize="large" />,
      color: '#1976d2',
      bgColor: '#e3f2fd',
    },
    {
      title: 'Spadki cen',
      value: stats.priceDrops,
      icon: <TrendingDownIcon fontSize="large" />,
      color: '#4caf50',
      bgColor: '#e8f5e9',
    },
    {
      title: 'Wzrosty cen',
      value: stats.priceIncreases,
      icon: <TrendingUpIcon fontSize="large" />,
      color: '#f44336',
      bgColor: '#ffebee',
    },
    {
      title: 'Aktywne alerty',
      value: stats.activeAlerts,
      icon: <NotificationsIcon fontSize="large" />,
      color: '#ff9800',
      bgColor: '#fff3e0',
    },
  ];

  return (
    <Grid container spacing={3}>
      {cards.map((card) => (
        <Grid size={{ xs: 12, sm: 6, md: 3 }} key={card.title}>
          <StatCard {...card} />
        </Grid>
      ))}
    </Grid>
  );
}
