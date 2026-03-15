'use client';

import React from 'react';
import { calculatePriceChange, calculatePriceChangePercent, formatDate } from '@/lib/priceCalculation';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  IconButton,
  Chip,
  Skeleton,
  Divider,
} from '@mui/material';
import ActionButton from '@/components/products/ActionButton';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import StorefrontIcon from '@mui/icons-material/Storefront';

//import types
import type { Product } from '@/types';

interface ProductDetailCardProps {
  product?: Product;
  isFavorite?: boolean;
  onAddAlert?: () => void;
  onToggleFavorite?: () => void;
  isLoading?: boolean;
}

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
  product,
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

  
//Early return for loading state or missing product

  if (isLoading || !product) {
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

  const { name, currentPrice, previousPrice, currency, imageUrl, category, available, shopName, lastChecked, url } = product;

// Calculating price change and percentage
  const priceChange = previousPrice
    ? calculatePriceChange(currentPrice, previousPrice)
    : null;
  const priceChangePercent = previousPrice
    ? calculatePriceChangePercent(currentPrice, previousPrice).toFixed(1)
    : null;

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
          image={imageUrl}
          alt={name}
          sx={{
            objectFit: 'cover',
            bgcolor: 'grey.100',
          }}
        />

        {/* Badge kategorii */}
        {category && (
          <Chip
            label={category}
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
          label={available ? 'Dostępny' : 'Niedostępny'}
          size="small"
          color={available ? 'success' : 'warning'}
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
          {name}
        </Typography>

        {/* Cena */}
        <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
          <Typography
            variant="h4"
            fontWeight={800}
            color="primary.main"
          >
            {currentPrice}
          </Typography>
          <Typography variant="h6" color="text.secondary">
            {currency}
          </Typography>
        </Box>

        {/* Zmiana ceny */}
        {priceChange !== null && (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            {previousPrice && (
              <Typography
                variant="body2"
                sx={{
                  textDecoration: 'line-through',
                  color: 'text.disabled',
                }}
              >
                {previousPrice} {currency}
              </Typography>
            )}
            <Chip
              label={`${priceChange > 0 ? '+' : ''}${priceChange} ${currency} (${priceChange > 0 ? '+' : ''}${priceChangePercent}%)`}
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
            {shopName}
          </Typography>
        </Box>

        {/* Ostatnia aktualizacja */}
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <AccessTimeIcon fontSize="small" color="action" />
          <Typography variant="caption" color="text.secondary">
            Aktualizacja: {formatDate(lastChecked)}
          </Typography>
        </Box>

        {/* Akcje */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          <ActionButton
            variant="contained"
            endIcon={<OpenInNewIcon />}
            component="a"
            href={url}
            target="_blank"
            rel="noopener noreferrer"
          >
            Przejdź do sklepu
          </ActionButton>

          <ActionButton
            variant="outlined"
            startIcon={<NotificationsActiveIcon />}
            onClick={onAddAlert}
          >
            Ustaw alert cenowy
          </ActionButton>
        </Box>
      </CardContent>
    </Card>
  );
}
