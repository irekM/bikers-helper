'use client';

import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as CheckIcon,
} from '@mui/icons-material';
import { getSupportedShops } from '@/lib/scrapers';

interface AddProductFormProps {
  onSubmit: (url: string) => Promise<string>;
}

export default function AddProductForm({ onSubmit }: AddProductFormProps) {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const supportedShops = getSupportedShops();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!url.trim()) {
      setError('Wprowadź URL produktu');
      return;
    }

    try {
      setLoading(true);
      await onSubmit(url.trim());
      setSuccess(true);
      setUrl('');
      
      // Reset success after 3 seconds
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się dodać produktu');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Paper sx={{ p: 3 }}>
      <Typography variant="h6" gutterBottom>
        Dodaj nowy produkt
      </Typography>
      
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Wklej link do produktu z jednego z obsługiwanych sklepów, aby rozpocząć śledzenie ceny.
      </Typography>

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth
          label="URL produktu"
          placeholder="https://louis.eu/produkt..."
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
          error={!!error}
          sx={{ mb: 2 }}
        />

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Produkt został dodany! Możesz go znaleźć w sekcji "Śledzone".
          </Alert>
        )}

        <Button
          type="submit"
          variant="contained"
          size="large"
          startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AddIcon />}
          disabled={loading}
          fullWidth
        >
          {loading ? 'Dodawanie...' : 'Dodaj produkt'}
        </Button>
      </Box>

      <Box sx={{ mt: 4 }}>
        <Typography variant="subtitle2" gutterBottom>
          Obsługiwane sklepy:
        </Typography>
        <List dense>
          {supportedShops.map((shop) => (
            <ListItem key={shop} sx={{ py: 0.5 }}>
              <ListItemIcon sx={{ minWidth: 32 }}>
                <CheckIcon color="success" fontSize="small" />
              </ListItemIcon>
              <ListItemText primary={shop} />
            </ListItem>
          ))}
        </List>
      </Box>
    </Paper>
  );
}
