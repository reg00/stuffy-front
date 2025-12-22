// src/pages/NotFoundPage.tsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';

export const NotFoundPage: React.FC = () => {
  return (
    <Box
      sx={{
        minHeight: '100vh',
        bgcolor: 'background.default',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        px: 2,
      }}
    >
      <Paper
        elevation={3}
        sx={{
          maxWidth: 480,
          width: '100%',
          p: 4,
          textAlign: 'center',
          bgcolor: 'background.paper',
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Typography variant="h3" component="h1" color="text.primary">
            404
          </Typography>

          <Typography variant="body1" color="text.secondary">
            Страница не найдена.
          </Typography>

          <Button
            variant="contained"
            color="primary"
            component={RouterLink}
            to="/events"
          >
            На главную
          </Button>
        </Stack>
      </Paper>
    </Box>
  );
};
