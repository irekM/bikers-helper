import type { SxProps, Theme } from '@mui/material';

/** Płaska karta sekcji (Paper/Card bez cienia, z obramowaniem) */
export const sectionCardSx: SxProps<Theme> = {
  borderRadius: 3,
  border: '1px solid',
  borderColor: 'divider',
};

/** Sekcja z paddingiem (np. PriceChart, filtry) */
export const sectionCardPaddedSx: SxProps<Theme> = {
  ...sectionCardSx,
  p: 3,
  bgcolor: 'background.paper',
};

/** Wiersz nagłówka sekcji (icon + tytuł po lewej, akcje po prawej) */
export const sectionHeaderSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  mb: 3,
};

/** Wiersz icon + tekst (np. ikona + tytuł sekcji) */
export const iconRowSx: SxProps<Theme> = {
  display: 'flex',
  alignItems: 'center',
  gap: 1,
};

/** Efekt uniesienia na hover (chipy, małe karty) */
export const hoverLiftSx: SxProps<Theme> = {
  transition: 'all 0.2s ease',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
  },
};

/** Obcinanie tekstu do N linii */
export const lineClampSx = (lines: number = 2): SxProps<Theme> => ({
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  display: '-webkit-box',
  WebkitLineClamp: lines,
  WebkitBoxOrient: 'vertical',
});
