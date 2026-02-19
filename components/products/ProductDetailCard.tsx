'use client';

import React from 'react';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  IconButton,
  Chip,
  Skeleton,
  Divider,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorefrontIcon from '@mui/icons-material/Storefront';

interface ProductDetailCardProps {
  product?: {
    id: string;
    name: string;
    imageUrl: string;
    currentPrice: number;
    previousPrice: number | null;
    currency: string;
    shopName: string;
    shopLogo?: string;
    url: string;
    available: boolean;
    lastChecked: string;
    category?: string;
  };
  isFavorite?: boolean;
  onAddAlert?: () => void;
  onToggleFavorite?: () => void;
  isLoading?: boolean;
}

// Domyślne dane produktu - do zastąpienia prawdziwymi
const DEFAULT_PRODUCT = {
  id: 'mock-1',
  name: 'AGV K3 SV Rossi Winter Test 2019',
  imageUrl: 'https://via.placeholder.com/400x300?text=Kask+AGV',
  currentPrice: 489,
  previousPrice: 549,
  currency: 'PLN',
  shopName: 'MotoZone',
  shopLogo: undefined,
  url: 'https://example.com/product',
  available: true,
  lastChecked: '5 min temu',
  category: 'Kaski',
};

/**
 * ProductDetailCard - Skeleton komponent szczegółowej karty produktu
 * 
 * TODO: Dodać logikę:
 * - Obsługa onAddAlert - modal/drawer z formularzem alertu
 * - Obsługa onToggleFavorite - zapis do Firestore
 * - Nawigacja do sklepu (Link)
 * - Pobieranie danych produktu z hooka
 */
export default function ProductDetailCard({
  product = DEFAULT_PRODUCT,
  isFavorite = false,
  onAddAlert,
  onToggleFavorite,
  isLoading = false,
}: ProductDetailCardProps) {
  // Tymczasowy stan - do przeniesienia do rodzica
  const [favorite, setFavorite] = React.useState(isFavorite);

  const handleToggleFavorite = () => {
    setFavorite(!favorite);
    // TODO: wywołać onToggleFavorite z propsa
    // onToggleFavorite?.();
  };

  // Oblicz zmianę ceny
  const priceChange = product.previousPrice
    ? product.currentPrice - product.previousPrice
    : null;
  const priceChangePercent = product.previousPrice
    ? ((priceChange! / product.previousPrice) * 100).toFixed(1)
    : null;

  if (isLoading) {
    return (
      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
          overflow: 'hidden',
        }}
      >
        <Skeleton variant="rectangular" height={250} />
        <CardContent>
          <Skeleton variant="text" height={32} width="80%" />
          <Skeleton variant="text" height={48} width="50%" />
          <Skeleton variant="text" height={24} width="60%" />
          <Box sx={{ mt: 2 }}>
            <Skeleton variant="rectangular" height={44} sx={{ borderRadius: 2 }} />
          </Box>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      elevation={0}
      sx={{
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        overflow: 'hidden',
        transition: 'all 0.3s ease',
        '&:hover': {
          boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
        },
      }}
    >
      {/* Zdjęcie produktu */}
      <Box sx={{ position: 'relative' }}>
        <CardMedia
          component="img"
          height="250"
          image={product.imageUrl}
          alt={product.name}
          sx={{
            objectFit: 'cover',
            bgcolor: 'grey.100',
          }}
        />

        {/* Badge kategorii */}
        {product.category && (
          <Chip
            label={product.category}
            size="small"
            sx={{
              position: 'absolute',
              top: 12,
              left: 12,
              fontWeight: 600,
              bgcolor: 'background.paper',
              boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            }}
          />
        )}

        {/* Przycisk ulubione */}
        <IconButton
          onClick={handleToggleFavorite}
          sx={{
            position: 'absolute',
            top: 8,
            right: 8,
            bgcolor: 'background.paper',
            boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
            '&:hover': {
              bgcolor: 'background.paper',
              transform: 'scale(1.1)',
            },
          }}
        >
          {favorite ? (
            <FavoriteIcon color="error" />
          ) : (
            <FavoriteBorderIcon />
          )}
        </IconButton>

        {/* Badge dostępności */}
        <Chip
          label={product.available ? 'Dostępny' : 'Niedostępny'}
          size="small"
          color={product.available ? 'success' : 'warning'}
          sx={{
            position: 'absolute',
            bottom: 12,
            right: 12,
            fontWeight: 600,
          }}
        />
      </Box>

      <CardContent sx={{ p: 3 }}>
        {/* Nazwa produktu */}
        <Typography
          variant="h6"
          fontWeight={700}
          gutterBottom
          sx={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            lineHeight: 1.3,
          }}
        >
          {product.name}
        </Typography>

        {/* Cena */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
          >
            {product.currentPrice}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {product.currency}
          </Typography>
        </Box>

        {/* Zmiana ceny */}
        {priceChange !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {product.previousPrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                }}
              >
                {product.previousPrice} {product.currency}
              </Typography>
            )}
            <Chip
              label={`${priceChange > 0 ? '+' : ''}${priceChange} ${product.currency} (${priceChange > 0 ? '+' : ''}${priceChangePercent}%)`}
              size="small"
              color={priceChange < 0 ? 'success' : 'error'}
              sx={{ fontWeight: 600 }}
            />
          </Box>
        )}

        <Divider sx={{ my: 2 }} />

        {/* Sklep */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
          <StorefrontIcon fontSize="small" color="action" />
          <Typography variant="body2" fontWeight={500}>
            {product.shopName}
          </Typography>
        </Box>

        {/* Ostatnia aktualizacja */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Aktualizacja: {product.lastChecked}
          </Typography>
        </Box>

        {/* Akcje */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <Button
            variant="contained"
            size="large"
            endIcon={<OpenInNewIcon />}
            fullWidth
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Przejdź do sklepu
          </Button>

          <Button
            variant="outlined"
            size="large"
            startIcon={<NotificationsActiveIcon />}
            fullWidth
            onClick={onAddAlert}
            sx={{
              textTransform: 'none',
              fontWeight: 600,
              py: 1.5,
              borderRadius: 2,
            }}
          >
            Ustaw alert cenowy
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
}
