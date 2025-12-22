// src/pages/auth/Register.tsx
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

export const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { clearError, register, isLoading, error } = useAuthStore();

  useEffect(() => {
    clearError();
  }, [location, clearError]);

  const validatePassword = (value: string): string | null => {
    if (value.length < 6) {
      return 'Длина пароля должна быть не менее 6 символов.';
    }
    if (!/^[A-Za-z0-9]+$/.test(value)) {
      return 'Пароль должен содержать только латинские буквы и цифры.';
    }
    if (!/[A-Z]/.test(value)) {
      return 'Пароль должен содержать хотя бы одну заглавную букву.';
    }
    if (!/\d/.test(value)) {
      return 'Пароль должен содержать хотя бы одну цифру.';
    }
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const pwdError = validatePassword(password);
    if (pwdError) {
      setPasswordError(pwdError);
      return;
    }
    setPasswordError(null);

    try {
      await register(username, email, password, true);
      navigate('/verify-email');
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
          p: 5,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="h5"
          component="h1"
          align="center"
          sx={{ mb: 3, color: '#333', fontSize: 28 }}
        >
          Регистрация
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

        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Stack spacing={2.5}>
            <Box>
              <Typography
                component="label"
                htmlFor="register-username"
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
                id="register-username"
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
                htmlFor="register-email"
                sx={{
                  display: 'block',
                  mb: 1,
                  color: '#555',
                  fontWeight: 500,
                  fontSize: 14,
                }}
              >
                Email
              </Typography>
              <TextField
                id="register-email"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
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
                htmlFor="register-password"
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
                id="register-password"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                disabled={isLoading}
                fullWidth
                size="small"
                variant="outlined"
                error={Boolean(passwordError)}
                sx={{
                  '& .MuiOutlinedInput-root': {
                    fontSize: 14,
                    bgcolor: '#fff',
                  },
                }}
              />

              <Box
                sx={{
                  mt: 0.75,
                  p: 1,
                  borderRadius: 1,
                  bgcolor: 'rgba(102, 126, 234, 0.04)',
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mb: 0.25,
                    color: '#5b6ee0',
                    fontWeight: 600,
                    fontSize: 11,
                  }}
                >
                  Требования к паролю:
                </Typography>
                <ul
                  style={{
                    margin: 0,
                    paddingLeft: 18,
                    color: '#5b6ee0',
                    fontSize: 11,
                    lineHeight: 1.4,
                  }}
                >
                  <li>Длина не менее 6 символов.</li>
                  <li>Только латинские буквы и цифры.</li>
                  <li>Хотя бы одна заглавная буква (A–Z).</li>
                  <li>Хотя бы одна цифра (0–9).</li>
                </ul>
              </Box>

              {passwordError && (
                <Typography
                  variant="caption"
                  sx={{
                    display: 'block',
                    mt: 0.5,
                    color: '#d32f2f',
                    fontSize: 11,
                  }}
                >
                  {passwordError}
                </Typography>
              )}
            </Box>

            <Button
              type="submit"
              disabled={isLoading}
              sx={{
                mt: 1,
                width: '100%',
                py: 1.3,
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
              {isLoading ? 'Загрузка...' : 'Зарегистрироваться'}
            </Button>
          </Stack>
        </Box>

        <Typography
          variant="body2"
          align="center"
          sx={{ mt: 2.5, color: '#666' }}
        >
          Уже есть аккаунт?{' '}
          <Link
            component={RouterLink}
            to="/login"
            sx={{
              color: '#667eea',
              fontWeight: 600,
              textDecoration: 'none',
              '&:hover': { textDecoration: 'underline' },
            }}
          >
            Войти
          </Link>
        </Typography>
      </Paper>
    </Box>
  );
};
