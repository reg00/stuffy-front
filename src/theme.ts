// src/theme.ts
import { createTheme } from '@mui/material/styles';

export const themeLight = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#4c1d95' },
    secondary: { main: '#a855f7' },
    background: {
      default: '#f9fafb',
      paper: '#ffffff',
    },
    text: {
      primary: '#0f172a',    // тёмный текст
      secondary: '#6b7280',  // серый текст
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  shape: { borderRadius: 8 },
});

export const themeDark = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#4c1d95' },
    secondary: { main: '#a855f7' },
    background: {
      default: '#111827',
      paper: '#1f2937',
    },
    text: {
      primary: '#e5e7eb',    // светлый текст
      secondary: '#9ca3af',  // светло‑серый
    },
  },
  typography: {
    fontFamily: 'Inter, Roboto, sans-serif',
  },
  shape: { borderRadius: 8 },
});
