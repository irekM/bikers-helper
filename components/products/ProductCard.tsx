'use client';

import React from 'react';
import {
  Card,
  CardContent,
  CardMedia,
  CardActions,
  Typography,
  Box,
  IconButton,
  Tooltip,
  Chip,
  Skeleton,
} from '@mui/material';
import {
  Refresh as RefreshIcon,
  Delete as DeleteIcon,
  OpenInNew as OpenInNewIcon,
  Store as StoreIcon,
  Favorite as FavoriteIcon,
  FavoriteBorder as FavoriteBorderIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import PriceBadge from './PriceBadge';
import type { Product } from '@/types';
import { formatPrice, formatDate } from '@/lib/priceCalculation';

interface ProductCardProps {
  product: Product;
  onRefresh?: (productId: string) => void;
  onDelete?: (productId: string) => void;
  onToggleFavorite?: (productId: string) => Promise<void>;
  isFavorite?: boolean;
  loading?: boolean;
}

export default function ProductCard({
  product,
  onRefresh,
  onDelete,
  onToggleFavorite,
  isFavorite = false,
  loading,
}: ProductCardProps) {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
    if (onRefresh) {
      setRefreshing(true);
      try {
        await onRefresh(product.id);
      } finally {
        setRefreshing(false);
      }
    }
  };



  if (loading) {
    return (
      <Card>
        <Skeleton variant="rectangular" height={140} />
        <CardContent>
          <Skeleton variant="text" width="80%" />
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
        },
      }}
    >
      {/* Product Image */}
      <Link href={`/dashboard/product/${product.id}`} style={{ textDecoration: 'none' }}>
        <CardMedia
          component="div"
          sx={{
            height: 160,
            backgroundColor: 'grey.100',
            backgroundImage: product.imageUrl ? `url(${product.imageUrl})` : 'none',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
            cursor: 'pointer',
          }}
        />
      </Link>

      <CardContent sx={{ flexGrow: 1 }}>
        {/* Shop Badge */}
        <Box sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Chip
            icon={<StoreIcon />}
            label={product.shopName}
            size="small"
            variant="outlined"
          />
          {!product.available && (
            <Chip label="Niedostępny" size="small" color="error" />
          )}
        </Box>

        {/* Product Name */}
        <Link href={`/dashboard/product/${product.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
          <Typography
            variant="subtitle1"
            fontWeight={600}
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              minHeight: 48,
              cursor: 'pointer',
              '&:hover': { color: 'primary.main' },
            }}
          >
            {product.name}
          </Typography>
        </Link>

        {/* Price */}
        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center', gap: 1 }}>
          <Typography variant="h5" fontWeight={700} color="primary.main">
            {formatPrice(product.currentPrice, product.currency)}
          </Typography>
          <PriceBadge
            currentPrice={product.currentPrice}
            previousPrice={product.previousPrice}
          />
        </Box>

        {/* Previous Price */}
        {product.previousPrice && product.previousPrice !== product.currentPrice && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ textDecoration: 'line-through' }}
          >
            {formatPrice(product.previousPrice, product.currency)}
          </Typography>
        )}

        {/* Last Updated */}
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Ostatnia aktualizacja: {formatDate(product.lastChecked)}
        </Typography>
      </CardContent>

      {/* Actions */}
      <CardActions sx={{ justifyContent: 'flex-end', borderTop: 1, borderColor: 'divider' }}>
        <Tooltip title={isFavorite ? 'Usuń z ulubionych' : 'Dodaj do ulubionych'}>
          <IconButton
            size="small"
            onClick={() => onToggleFavorite?.(product.id)}
            color={isFavorite ? 'error' : 'default'}
          >
            {isFavorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
          </IconButton>
        </Tooltip>
        <Tooltip title="Otwórz w sklepie">
          <IconButton
            size="small"
            component="a"
            href={product.url}
            target="_blank"
            rel="noopener noreferrer"
          >
            <OpenInNewIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Odśwież cenę">
          <IconButton size="small" onClick={handleRefresh} disabled={refreshing}>
            <RefreshIcon className={refreshing ? 'rotating' : ''} />
          </IconButton>
        </Tooltip>
        <Tooltip title="Usuń">
          <IconButton
            size="small"
            color="error"
            onClick={() => onDelete?.(product.id)}
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>

      <style jsx global>{`
        @keyframes rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .rotating {
          animation: rotate 1s linear infinite;
        }
      `}</style>
    </Card>
  );
}
