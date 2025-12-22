// src/pages/auth/Login.tsx
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import { useAuthStore } from '../../store/auth-store';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const { clearError, login, isLoading, error } = useAuthStore();

   // ✅ Правильно: location объект мутируется роутером
   useEffect(() => {
     clearError();
   }, [location, clearError]); // location целиком, не .pathname

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(username, password);
      navigate('/events');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #c0c0c0 0%, #764ba2 100%)',
        fontFamily:
          "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        px: 2,
      }}
    >
      <Paper
        elevation={8}
        sx={{
          width: '100%',
          maxWidth: 400,
          p: 5, // ~40px
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          sx={{ mb: 3, color: '#333', fontSize: 28 }}
        >
          Вход
        </Typography>

        {error && (
          <Alert
            severity="error"
            sx={{
              mb: 2.5,
              bgcolor: '#fee',
              color: '#c00',
              borderLeft: '4px solid #c00',
            }}
          >
            {error}
          </Alert>
        )}

        <Box component="form" onSubmit={handleSubmit}>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                component="label"
                htmlFor="login-username"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: '#555',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Имя пользователя
              </Typography>
              <TextField
                id="login-username"
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 14,
                    bgcolor: '#fff',
                  },
                }}
              />
            </Box>

            <Box>
              <Typography
                component="label"
                htmlFor="login-password"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: '#555',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Пароль
              </Typography>
              <TextField
                id="login-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                size="small"
                variant="outlined"
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 14,
                    bgcolor: '#fff',
                  },
                }}
              />
            </Box>

            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                mt: 1,
                width: '100%',
                py: 1.3, // ~12px
                borderRadius: 1,
                fontSize: 16,
                fontWeight: 600,
                textTransform: 'none',
                color: '#fff',
                background:
                  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                boxShadow: 'none',
                '&:hover': {
                  transform: 'translateY(-2px)',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.25)',
                  background:
                    'linear-gradient(135deg, #5b6ee0 0%, #6a43a0 100%)',
                },
                '&:disabled': {
                  opacity: 0.7,
                  cursor: 'not-allowed',
                  transform: 'none',
                },
              }}
            >
              {isLoading ? 'Загрузка...' : 'Войти'}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2.5, color: '#666' }}
        >
          Нет аккаунта?{' '}
          <Link
            component={RouterLink}
            to="/register"
            sx={{
              color: '#667eea',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Зарегистрироваться
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};
