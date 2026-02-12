'use client';

import { ThemeProvider, CssBaseline } from '@mui/material';
import theme from '@/theme/theme';
import { AuthProvider } from '@/hooks/useAuth';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>{children}</AuthProvider>
    </ThemeProvider>
  );
}
