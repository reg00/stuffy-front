// src/pages/auth/ConfirmEmail.tsx
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import MarkEmailReadIcon from '@mui/icons-material/MarkEmailRead';

export const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();

  // Автоматическое закрытие страницы через 15 секунд
  useEffect(() => {
    const timerId = setTimeout(() => {
      navigate('/login');
    }, 15000);

    return () => clearTimeout(timerId);
  }, [navigate]);

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        background: 'linear-gradient(135deg, #c0c0c0 0%, #764ba2 100%)',
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
        <MarkEmailReadIcon sx={{ fontSize: 64, mb: 2, color: '#667eea' }} />

        <Typography
          variant="h5"
          sx={{ mb: 2, color: '#333', fontSize: 24 }}
        >
          Подтвердите вашу почту
        </Typography>

        <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            <li>На указанный email отправлено письмо с подтверждением.</li>
            <li>Откройте письмо и перейдите по ссылке внутри.</li>
            <li>Если письма нет, проверьте папку «Спам».</li>
          </ul>
        </Alert>

        <Typography variant="body1" sx={{ color: '#666', mb: 1.5 }}>
          После перехода по ссылке вы увидите страницу об успешном подтверждении
          email и сможете войти в систему.
        </Typography>

        <Typography variant="body2" sx={{ color: '#999', mb: 3 }}>
          Эта страница автоматически закроется и перенаправит вас на экран
          входа через 15 секунд.
        </Typography>

        <Typography variant="body2" sx={{ color: '#666' }}>
          Если письмо не пришло в течение 5 минут, вы можете{' '}
          <Typography
            component="span"
            sx={{ color: '#667eea', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            зарегистрироваться заново
          </Typography>
          .
        </Typography>
      </Paper>
    </Box>
  );
};
