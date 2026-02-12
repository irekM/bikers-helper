'use client';

import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  TwoWheeler as MotorcycleIcon,
  Google as GoogleIcon,
} from '@mui/icons-material';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signInWithEmail, signInWithGoogle } from '@/lib/firebase';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    try {
      setLoading(true);
      await signInWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Błąd logowania';
      if (errorMessage.includes('user-not-found')) {
        setError('Nie znaleziono użytkownika o podanym adresie email');
      } else if (errorMessage.includes('wrong-password')) {
        setError('Nieprawidłowe hasło');
      } else {
        setError('Błąd logowania. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setError(null);

    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError('Błąd logowania przez Google. Spróbuj ponownie.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card sx={{ maxWidth: 450, mx: 'auto' }}>
      <CardContent sx={{ p: 4 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Box
            sx={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 64,
              height: 64,
              borderRadius: '50%',
              backgroundColor: 'primary.light',
              color: 'primary.main',
              mb: 2,
            }}
          >
            <MotorcycleIcon sx={{ fontSize: 32 }} />
          </Box>
          <Typography variant="h5" fontWeight={700}>
            Bikers Helper
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Zaloguj się do swojego konta
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Google Login */}
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleLogin}
          disabled={loading}
          sx={{ mb: 3 }}
        >
          Kontynuuj z Google
        </Button>

        <Divider sx={{ mb: 3 }}>
          <Typography variant="body2" color="text.secondary">
            lub
          </Typography>
        </Divider>

        {/* Email Login Form */}
        <Box component="form" onSubmit={handleEmailLogin}>
          <TextField
            label="Email"
            type="email"
            fullWidth
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={loading}
            sx={{ mb: 2 }}
          />
          <TextField
            label="Hasło"
            type="password"
            fullWidth
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={loading}
            sx={{ mb: 3 }}
          />

          <Button
            type="submit"
            variant="contained"
            fullWidth
            size="large"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Zaloguj się'}
          </Button>
        </Box>

        {/* Register Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Nie masz konta?{' '}
            <Link href="/register" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Zarejestruj się
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
