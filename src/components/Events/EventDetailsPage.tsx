// src/components/Events/EventDetailsPage.tsx
import React, { useEffect, useState } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { eventsService } from '../../services/event-service';
import type { GetEventEntry } from '../../api';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Avatar from '@mui/material/Avatar';
import Skeleton from '@mui/material/Skeleton';
import Chip from '@mui/material/Chip';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type RouteParams = {
  id: string;
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/120x120.png?text=+';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<GetEventEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventsService.getEventById(id);
      setEvent(data);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось загрузить событие';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleFinishEvent = () => {
    alert('Завершение ивента (заглушка)');
  };

  if (!id) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="text.primary">
          Некорректный идентификатор события.
        </Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Рамка и фон, зависящие от темы */}
      <Box
        sx={{
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          p: 3,
        }}
      >
        {/* Назад */}
        <Button
          component={RouterLink}
          to="/events"
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ mb: 2, color:'text.primary' }}
        >
          НАЗАД К СОБЫТИЯМ
        </Button>

        {/* Ошибка */}
        {error && (
          <Box mb={2}>
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={loadEvent}>
                  Повторить
                </Button>
              }
            >
              {error}
            </Alert>
          </Box>
        )}

        {/* Лоадер */}
        {isLoading && !event && (
          <Card
            sx={{
              bgcolor: 'background.paper',
              boxShadow: 1,
              mb: 3,
            }}
          >
            <CardContent>
              <Stack direction="row" spacing={2}>
                <Skeleton variant="rounded" width={120} height={120} />
                <Box sx={{ flexGrow: 1 }}>
                  <Skeleton width="60%" />
                  <Skeleton width="40%" />
                  <Skeleton width="80%" />
                </Box>
              </Stack>
            </CardContent>
          </Card>
        )}

        {/* Контент */}
        {!isLoading && !error && event && (
          <>
            {/* Шапка события */}
            <Card
              sx={{
                mb: 3,
                bgcolor: 'background.default',
                boxShadow: 1,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2}>
                  {/* Обложка */}
                  {event.mediaUri ? (
                    <Box
                      sx={{
                        width: 120,
                        height: 120,
                        borderRadius: 2,
                        overflow: 'hidden',
                        flexShrink: 0,
                      }}
                    >
                      <Box
                        component="img"
                        src={event.mediaUri}
                        alt={event.name}
                        onError={handleImageError}
                        sx={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                        }}
                      />
                    </Box>
                  ) : (
                    <Avatar
                      variant="rounded"
                      sx={{
                        width: 120,
                        height: 120,
                        fontSize: 40,
                      }}
                    >
                      +
                    </Avatar>
                  )}

                  {/* Инфо */}
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography
                      variant="h5"
                      component="h1"
                      gutterBottom
                      color="text.primary"
                    >
                      {event.name}
                    </Typography>

                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      sx={{ mb: 1 }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        {new Date(event.eventDateStart).toLocaleDateString()}
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        •
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {event.user?.name ?? 'Админ'}
                        {event.user && ' (админ)'}
                      </Typography>
                      {event.isCompleted && (
                        <Chip
                          label="Завершено"
                          size="small"
                          color="info"
                          variant="outlined"
                        />
                      )}
                    </Stack>

                    {event.description && (
                      <Typography variant="body2" color="text.secondary">
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

            {/* Разделы */}
            <Stack spacing={1.5} sx={{ mb: 3 }}>
              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  navigate(`/events/${id}/participants`, {
                    state: { participants: event.participants ?? [] },
                  })
                }
                sx={{
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  bgcolor: 'background.default',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <GroupIcon fontSize="small" />
                  </Box>
                  <Typography color="text.primary">Участники</Typography>
                </Stack>
                <ArrowForwardIosIcon fontSize="small" />
              </Button>

              <Button
                variant="outlined"
                fullWidth
                onClick={() =>
                  navigate(`/events/${id}/purchases`, {
                    state: { purchases: event.purchases ?? [] },
                  })
                }
                sx={{
                  justifyContent: 'space-between',
                  borderRadius: 2,
                  textTransform: 'none',
                  py: 1.5,
                  bgcolor: 'background.default',
                  borderColor: 'divider',
                }}
              >
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Box
                    sx={{
                      width: 32,
                      height: 32,
                      borderRadius: 1,
                      bgcolor: 'secondary.main',
                      color: 'secondary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <ShoppingCartIcon fontSize="small" />
                  </Box>
                  <Typography color="text.primary">Покупки</Typography>
                </Stack>
                <ArrowForwardIosIcon fontSize="small" />
              </Button>
            </Stack>

            {/* Завершить ивент */}
            <Box textAlign="right">
              <Button
                variant="contained"
                color="error"
                onClick={handleFinishEvent}
              >
                Завершить ивент
              </Button>
            </Box>
          </>
        )}
      </Box>
    </Container>
  );
};
