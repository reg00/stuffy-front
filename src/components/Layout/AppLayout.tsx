// src/components/Layout/AppLayout.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';
import { useTheme as useCustomTheme } from '../../hooks/useTheme'; // твой хук: { theme: 'light' | 'dark', toggleTheme }
import { themeLight, themeDark } from '../../theme'; // createTheme(...) для light/dark

import { ThemeProvider } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import SettingsIcon from '@mui/icons-material/Settings';

interface AppLayoutProps {
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme: customTheme, toggleTheme } = useCustomTheme();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const goHome = () => {
    navigate('/events');
  };

  const activeTheme = customTheme === 'dark' ? themeDark : themeLight;

  return (
    <ThemeProvider theme={activeTheme}>
      {/* Корневой контейнер — на весь экран, без рамок */}
      <Box
        sx={{
          minHeight: '100vh',
          bgcolor: 'background.default',
          color: 'text.primary',
          margin: 0,
          padding: 0,
        }}
      >
        {/* Верхний бар */}
        <AppBar position="static" color="primary" enableColorOnDark>
          <Toolbar sx={{ justifyContent: 'space-between' }}>
            {/* Левая часть: логотип */}
            <Stack direction="row" spacing={1} alignItems="center">
              <Typography
                variant="h6"
                component="div"
                onClick={goHome}
                sx={{
                  cursor: 'pointer',
                  fontWeight: 700,
                  userSelect: 'none',
                }}
              >
                StuffyHelper
              </Typography>
            </Stack>

            {/* Правая часть: настройки, тема, пользователь */}
            <Stack direction="row" spacing={2} alignItems="center">
              <IconButton color="inherit" size="small">
                <SettingsIcon fontSize="small" />
              </IconButton>

              <IconButton
                onClick={toggleTheme}
                color="inherit"
                size="small"
                aria-label="Toggle theme"
              >
                {customTheme === 'dark' ? (
                  <Brightness7Icon fontSize="small" />
                ) : (
                  <Brightness4Icon fontSize="small" />
                )}
              </IconButton>

              {isAuthenticated && user && (
                <Stack direction="row" spacing={1} alignItems="center">
                  <Typography variant="body2">
                    {user.firstName || user.name || user.email || 'Пользователь'}
                  </Typography>
                  <Button
                    variant="outlined"
                    color="inherit"
                    size="small"
                    onClick={handleLogout}
                  >
                    ВЫХОД
                  </Button>
                </Stack>
              )}
            </Stack>
          </Toolbar>
        </AppBar>

        {/* Основной контент */}
        <Box
          component="main"
          sx={{
            px: 3,
            py: 4,
            maxWidth: '1200px',
            margin: '0 auto',
          }}
        >
          {children}
        </Box>
      </Box>
    </ThemeProvider>
  );
};
