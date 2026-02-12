'use client';

import React from 'react';
import {
  Box,
  Button,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  TwoWheeler as MotorcycleIcon,
  TrendingDown as TrendingDownIcon,
  Notifications as NotificationsIcon,
  History as HistoryIcon,
  Speed as SpeedIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';

export default function Home() {
  const { firebaseUser, loading } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  React.useEffect(() => {
    if (!loading && firebaseUser) {
      router.push('/dashboard');
    }
  }, [firebaseUser, loading, router]);

  const features = [
    {
      icon: <TrendingDownIcon fontSize="large" />,
      title: 'Śledź spadki cen',
      description: 'Automatycznie monitoruj ceny i dowiaduj się o obniżkach',
    },
    {
      icon: <NotificationsIcon fontSize="large" />,
      title: 'Alerty cenowe',
      description: 'Ustaw próg cenowy i otrzymuj powiadomienia',
    },
    {
      icon: <HistoryIcon fontSize="large" />,
      title: 'Historia cen',
      description: 'Przeglądaj historyczne ceny i trendy',
    },
    {
      icon: <SpeedIcon fontSize="large" />,
      title: 'Szybkie dodawanie',
      description: 'Wklej link i zacznij śledzić w kilka sekund',
    },
  ];

  const supportedShops = ['Louis.eu', 'XLMoto.pl', 'FC-Moto.de', 'Motoblouz.pl'];

  return (
    <Box sx={{ minHeight: '100vh', backgroundColor: 'background.default' }}>
      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #1976d2 0%, #1565c0 100%)',
          color: 'white',
          py: { xs: 8, md: 12 },
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <MotorcycleIcon sx={{ fontSize: 48, mr: 2 }} />
                <Typography variant="h3" fontWeight={700}>
                  Bikers Helper
                </Typography>
              </Box>
              <Typography variant="h5" sx={{ mb: 3, opacity: 0.9 }}>
                Śledź ceny sprzętu motocyklowego i nie przegap żadnej okazji
              </Typography>
              <Typography variant="body1" sx={{ mb: 4, opacity: 0.8 }}>
                Monitoruj ceny kasków, kurtek, rękawic i innych akcesoriów z najpopularniejszych
                sklepów motocyklowych. Otrzymuj powiadomienia o spadkach cen.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2 }}>
                <Link href="/register" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="contained"
                    size="large"
                    sx={{
                      backgroundColor: 'white',
                      color: 'primary.main',
                      '&:hover': { backgroundColor: 'grey.100' },
                    }}
                  >
                    Rozpocznij za darmo
                  </Button>
                </Link>
                <Link href="/login" style={{ textDecoration: 'none' }}>
                  <Button
                    variant="outlined"
                    size="large"
                    sx={{
                      borderColor: 'white',
                      color: 'white',
                      '&:hover': { borderColor: 'white', backgroundColor: 'rgba(255,255,255,0.1)' },
                    }}
                  >
                    Zaloguj się
                  </Button>
                </Link>
              </Box>
            </Grid>
            <Grid size={{ xs: 12, md: 6 }}>
              <Box
                sx={{
                  backgroundColor: 'rgba(255,255,255,0.1)',
                  borderRadius: 4,
                  p: 4,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <Typography variant="h6" gutterBottom>
                  Obsługiwane sklepy:
                </Typography>
                <List>
                  {supportedShops.map((shop) => (
                    <ListItem key={shop} sx={{ py: 0.5 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CheckIcon sx={{ color: 'white' }} />
                      </ListItemIcon>
                      <ListItemText primary={shop} />
                    </ListItem>
                  ))}
                </List>
                <Typography variant="body2" sx={{ mt: 2, opacity: 0.8 }}>
                  ...i więcej wkrótce!
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h4" fontWeight={700} textAlign="center" gutterBottom>
          Dlaczego Bikers Helper?
        </Typography>
        <Typography
          variant="body1"
          color="text.secondary"
          textAlign="center"
          sx={{ mb: 6, maxWidth: 600, mx: 'auto' }}
        >
          Oszczędzaj pieniądze na sprzęcie motocyklowym dzięki automatycznemu śledzeniu cen
        </Typography>

        <Grid container spacing={4}>
          {features.map((feature) => (
            <Grid size={{ xs: 12, sm: 6, md: 3 }} key={feature.title}>
              <Card
                sx={{
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'translateY(-4px)' },
                }}
              >
                <CardContent>
                  <Box
                    sx={{
                      width: 64,
                      height: 64,
                      borderRadius: '50%',
                      backgroundColor: 'primary.light',
                      color: 'primary.main',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mx: 'auto',
                      mb: 2,
                    }}
                  >
                    {feature.icon}
                  </Box>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {feature.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ backgroundColor: 'grey.100', py: 8 }}>
        <Container maxWidth="md" sx={{ textAlign: 'center' }}>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Gotowy, aby zaoszczędzić?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
            Dołącz do Bikers Helper i zacznij śledzić ceny już dziś. To całkowicie za darmo!
          </Typography>
          <Link href="/register" style={{ textDecoration: 'none' }}>
            <Button variant="contained" size="large">
              Utwórz konto za darmo
            </Button>
          </Link>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ backgroundColor: 'grey.900', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MotorcycleIcon sx={{ mr: 1 }} />
            <Typography variant="body2">
              © 2026 Bikers Helper. Śledź ceny sprzętu motocyklowego.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
}
