'use client';

import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Box,
  Avatar,
  Menu,
  MenuItem,
  Divider,
} from '@mui/material';
import {
  TwoWheeler as MotorcycleIcon,
  Dashboard as DashboardIcon,
  Favorite as FavoriteIcon,
  Search as SearchIcon,
  Settings as SettingsIcon,
  Logout as LogoutIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);

  const handleMenu = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    handleClose();
    await signOut();
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: <DashboardIcon /> },
    { label: 'Śledzone', href: '/dashboard/favorites', icon: <FavoriteIcon /> },
    { label: 'Dodaj', href: '/dashboard/search', icon: <SearchIcon /> },
  ];

  const isActive = (href: string) => {
    if (href === '/dashboard') {
      return pathname === '/dashboard';
    }
    return pathname.startsWith(href);
  };

  return (
    <AppBar position="sticky" color="default" elevation={0}>
      <Toolbar>
        {/* Logo */}
        <Link href="/dashboard" style={{ textDecoration: 'none', color: 'inherit' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mr: 4 }}>
            <MotorcycleIcon sx={{ mr: 1, color: 'primary.main' }} />
            <Typography
              variant="h6"
              component="span"
              sx={{ fontWeight: 700, color: 'primary.main' }}
            >
              Bikers Helper
            </Typography>
          </Box>
        </Link>

        {/* Navigation */}
        <Box sx={{ flexGrow: 1, display: 'flex', gap: 1 }}>
          {navItems.map((item) => (
            <Link key={item.href} href={item.href} style={{ textDecoration: 'none' }}>
              <Button
                startIcon={item.icon}
                sx={{
                  color: isActive(item.href) ? 'primary.main' : 'text.secondary',
                  backgroundColor: isActive(item.href)
                    ? 'primary.light'
                    : 'transparent',
                  '&:hover': {
                    backgroundColor: isActive(item.href)
                      ? 'primary.light'
                      : 'action.hover',
                  },
                  opacity: isActive(item.href) ? 1 : 0.8,
                }}
              >
                {item.label}
              </Button>
            </Link>
          ))}
        </Box>

        {/* User Menu */}
        {user && (
          <Box>
            <IconButton onClick={handleMenu} size="small">
              <Avatar
                sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}
                src={user.photoURL || undefined}
              >
                {user.displayName?.[0] || user.email?.[0]?.toUpperCase()}
              </Avatar>
            </IconButton>
            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={handleClose}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {user.displayName || 'Użytkownik'}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>
              <Divider />
              <Link href="/dashboard/settings" style={{ textDecoration: 'none', color: 'inherit' }}>
                <MenuItem onClick={handleClose}>
                  <SettingsIcon fontSize="small" sx={{ mr: 1 }} />
                  Ustawienia
                </MenuItem>
              </Link>
              <MenuItem onClick={handleSignOut}>
                <LogoutIcon fontSize="small" sx={{ mr: 1 }} />
                Wyloguj
              </MenuItem>
            </Menu>
          </Box>
        )}
      </Toolbar>
    </AppBar>
  );
}
