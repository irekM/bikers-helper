'use client';

import React, { useMemo, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import LinkIcon from '@mui/icons-material/Link';
import type { ScrapedProduct, ScrapeMode } from '@/types';

type ScrapeMeta = {
  url: string;
  mode: ScrapeMode;
  resolvedMode: 'http' | 'browser';
  durationMs: number;
};

interface ScrapeApiResponse {
  success: boolean;
  data?: ScrapedProduct;
  meta?: {
    scrape?: ScrapeMeta;
  };
  error?: {
    code: string;
    message: string;
  };
}

const modeOptions: ScrapeMode[] = ['auto', 'http', 'browser'];

export default function ScrapeLabPage() {
  const [url, setUrl] = useState('');
  const [mode, setMode] = useState<ScrapeMode>('auto');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ScrapedProduct | null>(null);
  const [meta, setMeta] = useState<ScrapeMeta | null>(null);

  const canSubmit = useMemo(() => url.trim().length > 0 && !loading, [url, loading]);

  const runScrape = async (event: React.FormEvent) => {
    event.preventDefault();
    setError(null);
    setResult(null);
    setMeta(null);

    if (!url.trim()) {
      setError('Wklej URL produktu.');
      return;
    }

    try {
      setLoading(true);

      const response = await fetch('/api/scrape', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          url: url.trim(),
          mode,
        }),
      });

      const payload = (await response.json()) as ScrapeApiResponse;

      if (!payload.success || !payload.data) {
        throw new Error(payload.error?.message || 'Scrape failed');
      }

      setResult(payload.data);
      setMeta(payload.meta?.scrape ?? null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nie udało się pobrać danych produktu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} gutterBottom>
        Scrape Lab (MVP)
      </Typography>
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Ten ekran testuje scraping end-to-end bez zapisu do bazy. Wklej URL produktu i sprawdź wynik JSON na żywo.
      </Typography>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Test request
            </Typography>

            <Box component="form" onSubmit={runScrape}>
              <TextField
                fullWidth
                label="URL produktu"
                placeholder="https://www.xlmoto.pl/product/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1 }} fontSize="small" />,
                }}
              />

              <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap' }}>
                {modeOptions.map((option) => (
                  <Chip
                    key={option}
                    label={option.toUpperCase()}
                    clickable
                    color={mode === option ? 'primary' : 'default'}
                    variant={mode === option ? 'filled' : 'outlined'}
                    onClick={() => setMode(option)}
                  />
                ))}
              </Stack>

              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Button
                type="submit"
                variant="contained"
                startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <PlayArrowIcon />}
                disabled={!canSubmit}
                fullWidth
              >
                {loading ? 'Scrapuję...' : 'Uruchom scraping'}
              </Button>
            </Box>
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Wynik
            </Typography>

            {!result && !error && (
              <Typography variant="body2" color="text.secondary">
                Brak wyniku. Uruchom request po lewej stronie.
              </Typography>
            )}

            {result && (
              <Stack spacing={1.25}>
                <Typography variant="body2">
                  <strong>Nazwa:</strong> {result.name}
                </Typography>
                <Typography variant="body2">
                  <strong>Cena:</strong> {result.price} {result.currency}
                </Typography>
                <Typography variant="body2">
                  <strong>Dostępność:</strong> {result.available ? 'Dostępny' : 'Niedostępny'}
                </Typography>
                <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                  <strong>URL:</strong> {result.originalUrl}
                </Typography>
                <Typography variant="body2">
                  <strong>Sklep:</strong> {result.shopName}
                </Typography>
                <Typography variant="body2">
                  <strong>Źródło:</strong> {result.sourceType ?? 'http'}
                </Typography>
                {result.imageUrl && (
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    <strong>Obraz:</strong> {result.imageUrl}
                  </Typography>
                )}

                <Divider sx={{ my: 1 }} />

                {meta && (
                  <>
                    <Typography variant="subtitle2">Meta runnera:</Typography>
                    <Typography variant="caption" color="text.secondary">
                      mode: {meta.mode} | resolved: {meta.resolvedMode} | czas: {meta.durationMs} ms
                    </Typography>
                  </>
                )}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
