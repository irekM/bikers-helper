'use client';

import React from 'react';
import {
  Box,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
} from '@mui/material';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';

// Typy zakresów czasowych
type TimeRange = '7d' | '30d' | '6m' | '1y' | 'all' | 'custom';

interface TimeRangeFilterProps {
  value?: TimeRange;
  onChange?: (value: TimeRange) => void;
}

// Konfiguracja przycisków
const TIME_RANGE_OPTIONS: { value: TimeRange; label: string }[] = [
  { value: '7d', label: '7 dni' },
  { value: '30d', label: '30 dni' },
  { value: '6m', label: '6 mies.' },
  { value: '1y', label: 'Rok' },
  { value: 'all', label: 'Wszystko' },
];

/**
 * TimeRangeFilter - Skeleton komponent filtrów czasowych
 * 
 * TODO: Dodać logikę:
 * - Obsługa onChange i przekazywanie do rodzica
 * - Integracja z DateRangePicker dla 'custom'
 * - Persystencja wybranego zakresu w URL/localStorage
 */
export default function TimeRangeFilter({
  value = '30d',
  onChange,
}: TimeRangeFilterProps) {
  // Tymczasowy stan - do przeniesienia do rodzica
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>(value);

  const handleChange = (
    _event: React.MouseEvent<HTMLElement>,
    newValue: TimeRange | null
  ) => {
    if (newValue !== null) {
      setSelectedRange(newValue);
      // TODO: wywołać onChange z propsa
      // onChange?.(newValue);
    }
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
          flexWrap: 'wrap',
          gap: 2,
        }}
      >
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <CalendarTodayIcon color="primary" sx={{ fontSize: 20 }} />
          <Typography variant="subtitle2" fontWeight={600}>
            Zakres czasowy
          </Typography>
        </Box>

        <ToggleButtonGroup
          value={selectedRange}
          exclusive
          onChange={handleChange}
          aria-label="zakres czasowy"
          size="small"
          sx={{
            '& .MuiToggleButton-root': {
              px: 2,
              py: 0.75,
              textTransform: 'none',
              fontWeight: 500,
              fontSize: '0.875rem',
              borderRadius: 2,
              border: '1px solid',
              borderColor: 'divider',
              '&:hover': {
                bgcolor: 'primary.light',
                color: 'primary.contrastText',
              },
              '&.Mui-selected': {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                '&:hover': {
                  bgcolor: 'primary.dark',
                },
              },
            },
            '& .MuiToggleButtonGroup-grouped': {
              mx: 0.5,
              '&:not(:first-of-type)': {
                borderRadius: 2,
                borderLeft: '1px solid',
                borderColor: 'divider',
              },
              '&:first-of-type': {
                borderRadius: 2,
              },
            },
          }}
        >
          {TIME_RANGE_OPTIONS.map((option) => (
            <ToggleButton key={option.value} value={option.value}>
              {option.label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      {/* Placeholder dla DateRangePicker w Fazie 2 */}
      {selectedRange === 'custom' && (
        <Box
          sx={{
            mt: 2,
            p: 2,
            borderRadius: 2,
            bgcolor: 'action.hover',
            textAlign: 'center',
          }}
        >
          <Typography variant="body2" color="text.secondary">
            📅 DateRangePicker - do implementacji w Fazie 2
          </Typography>
        </Box>
      )}
    </Paper>
  );
}
