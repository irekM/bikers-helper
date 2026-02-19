'use client';

import React from 'react';
import { Box, Chip, Typography, Paper } from '@mui/material';
import FilterListIcon from '@mui/icons-material/FilterList';

// Typy kategorii
interface Category {
  id: string;
  name: string;
  icon: string;
  count?: number;
}

interface CategoryFilterProps {
  categories?: Category[];
  selectedCategories?: string[];
  onChange?: (selected: string[]) => void;
  multiSelect?: boolean;
}

// Domyślne kategorie - do zastąpienia danymi z bazy
const DEFAULT_CATEGORIES: Category[] = [
  { id: 'helmets', name: 'Kaski', icon: '🪖', count: 24 },
  { id: 'jackets', name: 'Kurtki', icon: '🧥', count: 18 },
  { id: 'pants', name: 'Spodnie', icon: '👖', count: 12 },
  { id: 'gloves', name: 'Rękawice', icon: '🧤', count: 31 },
  { id: 'boots', name: 'Buty', icon: '👢', count: 15 },
  { id: 'accessories', name: 'Akcesoria', icon: '🎒', count: 42 },
  { id: 'parts', name: 'Części', icon: '⚙️', count: 67 },
];

/**
 * CategoryFilter - Skeleton komponent filtrowania kategorii
 * 
 * TODO: Dodać logikę:
 * - Obsługa onChange i przekazywanie do rodzica
 * - Pobieranie kategorii z Firestore
 * - Dynamiczne liczniki produktów
 * - Multi-select vs single-select mode
 */
export default function CategoryFilter({
  categories = DEFAULT_CATEGORIES,
  selectedCategories = [],
  onChange,
  multiSelect = true,
}: CategoryFilterProps) {
  // Tymczasowy stan - do przeniesienia do rodzica
  const [selected, setSelected] = React.useState<string[]>(selectedCategories);

  const handleToggle = (categoryId: string) => {
    let newSelected: string[];

    if (multiSelect) {
      if (selected.includes(categoryId)) {
        newSelected = selected.filter((id) => id !== categoryId);
      } else {
        newSelected = [...selected, categoryId];
      }
    } else {
      newSelected = selected.includes(categoryId) ? [] : [categoryId];
    }

    setSelected(newSelected);
    // TODO: wywołać onChange z propsa
    // onChange?.(newSelected);
  };

  const handleClearAll = () => {
    setSelected([]);
    // onChange?.([]);
  };

  return (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 3,
        bgcolor: 'background.paper',
        border: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          mb: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <FilterListIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Kategorie
          </Typography>
          {selected.length > 0 && (
            <Chip
              label={selected.length}
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: '0.75rem' }}
            />
          )}
        </Box>

        {selected.length > 0 && (
          <Chip
            label="Wyczyść"
            size="small"
            variant="outlined"
            onClick={handleClearAll}
            sx={{
              fontWeight: 500,
              cursor: 'pointer',
              '&:hover': {
                bgcolor: 'error.light',
                color: 'error.contrastText',
                borderColor: 'error.main',
              },
            }}
          />
        )}
      </Box>

      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        {categories.map((category) => {
          const isSelected = selected.includes(category.id);

          return (
            <Chip
              key={category.id}
              label={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <span>{category.icon}</span>
                  <span>{category.name}</span>
                  {category.count !== undefined && (
                    <Typography
                      component="span"
                      variant="caption"
                      sx={{
                        ml: 0.5,
                        opacity: 0.7,
                        fontWeight: 400,
                      }}
                    >
                      ({category.count})
                    </Typography>
                  )}
                </Box>
              }
              clickable
              onClick={() => handleToggle(category.id)}
              variant={isSelected ? 'filled' : 'outlined'}
              color={isSelected ? 'primary' : 'default'}
              sx={{
                fontWeight: 500,
                transition: 'all 0.2s ease',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                },
              }}
            />
          );
        })}
      </Box>
    </Paper>
  );
}
