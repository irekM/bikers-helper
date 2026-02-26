'use client';

import React from 'react';
import { Box, Container } from '@mui/material';
import Navbar from '@/components/layout/Navbar';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { CircularProgress } from '@mui/material';
import CategoryBreadcrumbs from '@/components/navigation/CategoryBreadcrumbs';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { loggedIn, loading } = useAuth();
  const router = useRouter();

  React.useEffect(() => {
    if (!loading && !loggedIn) {
      router.push('/login');
    }
  }, [loggedIn, loading, router]);

  if (loading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!loggedIn) {
    return null;
  }

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      <Navbar />
      <Container maxWidth="xl" sx={{ py: 4 }}>
        <CategoryBreadcrumbs />
        {children}
      </Container>
    </Box>
  );
}
