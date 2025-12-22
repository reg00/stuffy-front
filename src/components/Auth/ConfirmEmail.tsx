// src/pages/auth/VerifyEmailPage.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';

export const ConfirmEmail: React.FC = () => {
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
          maxWidth: 480,
          p: 5,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <Stack spacing={2.5}>
          <Typography variant="h5" component="h1">
            Подтвердите почту
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Мы отправили письмо с ссылкой для подтверждения на указанный email.
            Перейдите по ссылке из письма, чтобы активировать аккаунт, а затем
            выполните вход.
          </Typography>

          <Button
            variant="contained"
            component={RouterLink}
            to="/login"
            sx={{
              mt: 1,
              textTransform: 'none',
              fontWeight: 600,
              color: '#fff',
              background:
                'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            }}
          >
            Перейти к входу
          </Button>

          <Typography variant="body2" color="text.secondary">
            Не пришло письмо? Проверьте папку «Спам» или попробуйте
            зарегистрироваться ещё раз.
          </Typography>

          <Link component={RouterLink} to="/register" underline="hover">
            Вернуться к регистрации
          </Link>
        </Stack>
      </Paper>
    </Box>
  );
};
