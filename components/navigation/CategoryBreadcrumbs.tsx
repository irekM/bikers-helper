'use client';

import { useRouter, usePathname,useSearchParams } from 'next/navigation';
import {
  Box,
  Breadcrumbs,  
  Chip,
  Typography,
  Link as MuiLink,
} from '@mui/material';
import NavigateNextIcon from '@mui/icons-material/NavigateNext';
import HomeIcon from '@mui/icons-material/Home';
import { useCategories } from '@/hooks/useCategories';
//import {Tooltip} from '@mui/material';

interface CategoryBreadcrumbsProps {
  currentCategory?: string;
  productName?: string;
}

/**
 * CategoryBreadcrumbs - Skeleton komponent nawigacji breadcrumbs
 * 
 * TODO: Dodać logikę:

 * - Dynamiczne generowanie breadcrumbs
 */



export default function CategoryBreadcrumbs({
  currentCategory = 'helmets',
  productName,
}: CategoryBreadcrumbsProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { categories } = useCategories();
  const categoryFromURL = searchParams.get('category');

  const activeCategory = categoryFromURL || currentCategory;
  const category = categories.find((c) => c.id === activeCategory);

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
          onClick={() => router.push('/dashboard')}
          sx={{
            fontWeight: 500,
            bgcolor: 'transparent',
            '&:hover': {
              bgcolor: 'action.hover',
            },
          }}
        />

        {/* Category */}
        {category && (
          <Chip
            label={`${category.icon} ${category.name}`}
            size="small"
            clickable
            onClick={() => router.push(`/dashboard/search?category=${category.id}`)}
            color={productName ? 'default' : 'primary'}
            variant={productName ? 'outlined' : 'filled'}
            sx={{
              fontWeight: 500,
            }}
          />
        )}

        {/* Product Name (if available) */}
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

      {/* Quick category chips - fast access navigation */}
      <Box
        sx={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 1,
          mt: 2,
        }}
      >
        {categories.map((cat) => (
          <Chip
            key={cat.id}
            label={`${cat.icon} ${cat.name}`}
            size="small"
            clickable
            onClick={() => router.push(`/dashboard/search?category=${cat.id}`)}
            variant={cat.id === activeCategory ? 'filled' : 'outlined'}
            color={cat.id === activeCategory ? 'primary' : 'default'}
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
