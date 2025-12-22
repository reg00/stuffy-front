// src/pages/auth/ConfirmEmail.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import Box from '@mui/material/Box';
import Paper from '@mui/material/Paper';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';

export const ConfirmEmail: React.FC = () => {
  const navigate = useNavigate();

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
          maxWidth: 400,
          p: 5,
          borderRadius: 2,
          textAlign: 'center',
        }}
      >
        <CircularProgress size={60} sx={{ mb: 3, color: '#667eea' }} />
        
        <Typography variant="h5" sx={{ mb: 2, color: '#333', fontSize: 24 }}>
          Проверка почты
        </Typography>
        
        <Alert severity="info" sx={{ mb: 3 }}>
          Письмо с подтверждением отправлено на ваш email. 
          Проверьте почту (включая папку "Спам") и перейдите по ссылке.
        </Alert>
        
        <Typography variant="body1" sx={{ color: '#666', mb: 3 }}>
          Если письмо не пришло в течение 5 минут, нажмите{' '}
          <Typography 
            component="span" 
            sx={{ color: '#667eea', fontWeight: 600, cursor: 'pointer' }}
            onClick={() => navigate('/register')}
          >
            "Зарегистрироваться заново"
          </Typography>
        </Typography>
      </Paper>
    </Box>
  );
};
