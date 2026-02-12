'use client';

import React from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Switch,
  FormControlLabel,
  Button,
  Divider,
  Alert,
} from '@mui/material';
import { useAuth } from '@/hooks/useAuth';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const [saved, setSaved] = React.useState(false);

  const handleSave = () => {
    // TODO: Implement settings save
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <Box>
      {/* Header */}
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Ustawienia
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
        Zarządzaj swoim kontem i preferencjami
      </Typography>

      {saved && (
        <Alert severity="success" sx={{ mb: 3 }}>
          Ustawienia zostały zapisane
        </Alert>
      )}

      {/* Profile Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Profil
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, maxWidth: 400 }}>
            <TextField
              label="Email"
              value={user?.email || ''}
              disabled
              fullWidth
            />
            <TextField
              label="Nazwa wyświetlana"
              defaultValue={user?.displayName || ''}
              fullWidth
            />
          </Box>
        </CardContent>
      </Card>

      {/* Notifications Card */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Powiadomienia
          </Typography>
          <Divider sx={{ mb: 3 }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Powiadomienia email o zmianach cen"
            />
            <FormControlLabel
              control={<Switch />}
              label="Powiadomienia push (wkrótce)"
              disabled
            />
            <FormControlLabel
              control={<Switch defaultChecked />}
              label="Cotygodniowe podsumowanie"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Actions */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button variant="contained" onClick={handleSave}>
          Zapisz zmiany
        </Button>
        <Button variant="outlined" color="error" onClick={signOut}>
          Wyloguj się
        </Button>
      </Box>
    </Box>
  );
}
