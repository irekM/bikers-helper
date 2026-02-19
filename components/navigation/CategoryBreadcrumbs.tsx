'use client';

import React from 'react';
import {
  Box,
  Breadcrumbs,
  Chip,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';

// Dummy data - do zastąpienia prawdziwymi danymi
const MOCK_CATEGORIES = [
  { id: 'helmets', name: 'Kaski', icon: '🪖' },
  { id: 'jackets', name: 'Kurtki', icon: '🧥' },
  { id: 'pants', name: 'Spodnie', icon: '👖' },
  { id: 'gloves', name: 'Rękawice', icon: '🧤' },
  { id: 'boots', name: 'Buty', icon: '👢' },
  { id: 'accessories', name: 'Akcesoria', icon: '🎒' },
  { id: 'parts', name: 'Części', icon: '⚙️' },
];

interface CategoryBreadcrumbsProps {
  currentCategory?: string;
  productName?: string;
}

/**
 * CategoryBreadcrumbs - Skeleton komponent nawigacji breadcrumbs
 * 
 * TODO: Dodać logikę:
 * - Obsługa kliknięć i nawigacji
 * - Pobieranie aktualnej ścieżki z routera
 * - Dynamiczne generowanie breadcrumbs
 */
export default function CategoryBreadcrumbs({
  currentCategory = 'helmets',
  productName,
}: CategoryBreadcrumbsProps) {
  const category = MOCK_CATEGORIES.find((c) => c.id === currentCategory);

  return (
    <Box sx={{ mb: 3 }}>
      <Breadcrumbs
        separator={<NavigateNextIcon fontSize="small" />}
        aria-label="breadcrumb"
        sx={{
          '& .MuiBreadcrumbs-separator': {
            mx: 1,
            color: 'text.secondary',
          },
        }}
      >
        {/* Home */}
        <Chip
          icon={<HomeIcon sx={{ fontSize: 18 }} />}
          label="Dashboard"
          size="small"
          clickable
          sx={{
            fontWeight: 500,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />

        {/* Kategoria */}
        {category && (
          <Chip
            label={`${category.icon} ${category.name}`}
            size="small"
            clickable
            color={productName ? 'default' : 'primary'}
            variant={productName ? 'outlined' : 'filled'}
            sx={{
              fontWeight: 500,
            }}
          />
        )}

        {/* Nazwa produktu (jeśli jest) */}
        {productName && (
          <Typography
            color="text.primary"
            sx={{
              fontWeight: 600,
              maxWidth: 300,
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
            }}
          >
            {productName}
          </Typography>
        )}
      </Breadcrumbs>

      {/* Quick category chips - szybka nawigacja */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2,
        }}
      >
        {MOCK_CATEGORIES.map((cat) => (
          <Chip
            key={cat.id}
            label={`${cat.icon} ${cat.name}`}
            size="small"
            clickable
            variant={cat.id === currentCategory ? 'filled' : 'outlined'}
            color={cat.id === currentCategory ? 'primary' : 'default'}
            sx={{
              fontWeight: 500,
              transition: 'all 0.2s ease',
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
              },
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
