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
import { signUpWithEmail, signInWithGoogle } from '@/lib/firebase';

export default function RegisterPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email || !password || !confirmPassword) {
      setError('Wypełnij wszystkie pola');
      return;
    }

    if (password !== confirmPassword) {
      setError('Hasła nie są identyczne');
      return;
    }

    if (password.length < 6) {
      setError('Hasło musi mieć co najmniej 6 znaków');
      return;
    }

    try {
      setLoading(true);
      await signUpWithEmail(email, password);
      router.push('/dashboard');
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Błąd rejestracji';
      if (errorMessage.includes('email-already-in-use')) {
        setError('Ten adres email jest już zajęty');
      } else if (errorMessage.includes('invalid-email')) {
        setError('Nieprawidłowy adres email');
      } else if (errorMessage.includes('weak-password')) {
        setError('Hasło jest za słabe');
      } else {
        setError('Błąd rejestracji. Spróbuj ponownie.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleRegister = async () => {
    setError(null);

    try {
      setLoading(true);
      await signInWithGoogle();
      router.push('/dashboard');
    } catch (err) {
      setError('Błąd rejestracji przez Google. Spróbuj ponownie.');
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
            Utwórz nowe konto
          </Typography>
        </Box>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {/* Google Register */}
        <Button
          variant="outlined"
          fullWidth
          size="large"
          startIcon={<GoogleIcon />}
          onClick={handleGoogleRegister}
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

        {/* Email Register Form */}
        <Box component="form" onSubmit={handleEmailRegister}>
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
            helperText="Minimum 6 znaków"
            sx={{ mb: 2 }}
          />
          <TextField
            label="Potwierdź hasło"
            type="password"
            fullWidth
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
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
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Zarejestruj się'}
          </Button>
        </Box>

        {/* Login Link */}
        <Box sx={{ textAlign: 'center', mt: 3 }}>
          <Typography variant="body2" color="text.secondary">
            Masz już konto?{' '}
            <Link href="/login" style={{ color: '#1976d2', textDecoration: 'none' }}>
              Zaloguj się
            </Link>
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
}
