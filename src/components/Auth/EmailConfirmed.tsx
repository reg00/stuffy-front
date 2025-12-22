// src/pages/auth/EmailConfirmed.tsx
import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { authService } from '../../services/auth-service';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

export const EmailConfirmed: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const login = searchParams.get('login');
  const code = searchParams.get('code');

  const confirmEmail = async () => {
    if (!login || !code) {
      setError('Неверные параметры подтверждения');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);

      await authService.confirmEmail(login, code);

      setIsSuccess(true);

      setTimeout(() => {
        navigate('/login');
      }, 5000);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Ошибка подтверждения email';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    confirmEmail();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [login, code]);

  const handleLoginNow = () => {
    navigate('/login');
  };

  const handleRegisterAgain = () => {
    navigate('/register');
  };

  if (!login || !code) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Box
          sx={{
            borderRadius: 3,
            border: theme => `1px solid ${theme.palette.divider}`,
            bgcolor: 'background.paper',
            p: 3,
          }}
        >
          <Typography color="text.primary">
            Некорректные параметры подтверждения.
          </Typography>
        </Box>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box
        sx={{
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          p: 3,
        }}
      >
        <Button
          onClick={handleLoginNow}
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ mb: 2, color: 'text.primary' }}
        >
          НАЗАД К ВХОДУ
        </Button>

        {error && (
          <Box mb={3}>
            <Alert
              severity="error"
              icon={<ErrorIcon />}
              action={
                <Button color="inherit" size="small" onClick={confirmEmail}>
                  Повторить
                </Button>
              }
            >
              {error}
            </Alert>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2 }} // отступ между алертом и кнопками
            >
              <Button
                variant="contained"
                onClick={handleRegisterAgain}
                sx={{
                  background:
                    'linear-gradient(135deg, #ff9800 0%, #f57c00 100%)',
                }}
              >
                Зарегистрироваться заново
              </Button>
              <Button variant="outlined" onClick={handleLoginNow}>
                Попробовать войти
              </Button>
            </Stack>
          </Box>
        )}

        {isLoading && (
          <Card sx={{ bgcolor: 'background.paper', boxShadow: 1, mb: 3 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress
                size={60}
                sx={{ mb: 2, color: 'primary.main' }}
              />
              <Typography variant="h6" color="text.primary">
                Подтверждение email...
              </Typography>
            </CardContent>
          </Card>
        )}

        {!isLoading && isSuccess && !error && (
          <Card sx={{ bgcolor: 'background.default', boxShadow: 1 }}>
            <CardContent sx={{ textAlign: 'center', py: 4 }}>
              <CheckCircleIcon
                sx={{
                  fontSize: 80,
                  color: 'success.main',
                  mb: 2,
                }}
              />
              <Typography
                variant="h4"
                component="h1"
                gutterBottom
                color="text.primary"
              >
                Email подтвержден!
              </Typography>
              <Typography
                variant="body1"
                color="text.secondary"
                sx={{ mb: 3 }}
              >
                Перенаправление на страницу входа через 5 секунд...
              </Typography>
              <Button
                variant="contained"
                onClick={handleLoginNow}
                size="large"
                sx={{
                  background:
                    'linear-gradient(135deg, #4caf50 0%, #45a049 100%)',
                  '&:hover': {
                    background:
                      'linear-gradient(135deg, #45a049 0%, #3d8b40 100%)',
                  },
                }}
              >
                Войти сейчас
              </Button>
            </CardContent>
          </Card>
        )}
      </Box>
    </Container>
  );
};
