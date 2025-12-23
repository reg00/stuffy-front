// src/components/Events/EventDetailsPage.tsx
import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import { eventsService } from '../../services/event-service';
import type { GetEventEntry, EventShortEntry } from '../../api';

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
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';

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

  // состояние для смены обложки
  const [coverUploading, setCoverUploading] = useState(false);
  const [coverVersion, setCoverVersion] = useState(0); // cache-buster
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleCoverClick = () => {
    fileInputRef.current?.click();
  };

  const handleCoverChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    if (!id) return;
    const file = e.target.files?.[0];
    if (!file) return;

    setCoverUploading(true);
    try {
      // обновляем обложку на бэке
      const updatedShort: EventShortEntry =
        await eventsService.editEventAvatar(id, file);

      // в EventShortEntry должен прийти новый mediaUri
      // обновляем текущий event, чтобы сразу отрисовать новую обложку
      setEvent(prev =>
        prev
          ? {
              ...prev,
              mediaUri: updatedShort.imageUri ?? prev.mediaUri,
            }
          : prev,
      );

      // ломаем кеш (если URL на бэке не меняется)
      setCoverVersion(v => v + 1);

      setSnackbar({
        open: true,
        message: 'Обложка успешно обновлена',
        severity: 'success',
      });
    } catch (e) {
      console.error(e);
      setSnackbar({
        open: true,
        message: 'Ошибка обновления обложки',
        severity: 'error',
      });
    } finally {
      setCoverUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleCloseSnackbar = () =>
    setSnackbar(prev => ({ ...prev, open: false }));

  if (!id) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="text.primary">
          Некорректный идентификатор события.
        </Typography>
      </Container>
    );
  }

  // соберём src для обложки c cache-buster
  const coverSrc =
    event?.mediaUri ? `${event.mediaUri}?v=${coverVersion}` : undefined;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box
        sx={{
          borderRadius: 3,
          border: theme => `1px solid ${theme.palette.divider}`,
          bgcolor: 'background.paper',
          p: 3,
        }}
      >
        <Button
          component={RouterLink}
          to="/events"
          startIcon={<ArrowBackIcon />}
          variant="text"
          sx={{ mb: 2, color: 'text.primary' }}
        >
          НАЗАД К СОБЫТИЯМ
        </Button>

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

        {!isLoading && !error && event && (
          <>
            <Card
              sx={{
                mb: 3,
                bgcolor: 'background.default',
                boxShadow: 1,
              }}
            >
              <CardContent>
                <Stack direction="row" spacing={2}>
                  {/* Обложка + кнопка смены */}
                  <Box
                    sx={{
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 1,
                    }}
                  >
                    {coverSrc ? (
                      <Box
                        sx={{
                          width: 120,
                          height: 120,
                          borderRadius: 2,
                          overflow: 'hidden',
                          flexShrink: 0,
                          position: 'relative',
                        }}
                      >
                        <Box
                          component="img"
                          src={coverSrc}
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

                    <input
                      ref={fileInputRef}
                      hidden
                      accept="image/*"
                      type="file"
                      onChange={handleCoverChange}
                    />

                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={
                        coverUploading ? (
                          <CircularProgress size={16} />
                        ) : (
                          <PhotoCameraIcon fontSize="small" />
                        )
                      }
                      onClick={handleCoverClick}
                      disabled={coverUploading}
                      sx={{ mt: 0.5 }}
                    >
                      {coverUploading ? 'Загрузка...' : 'Сменить обложку'}
                    </Button>
                  </Box>

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
                        {new Date(
                          event.eventDateStart,
                        ).toLocaleDateString()}
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
                      <Typography
                        variant="body2"
                        color="text.secondary"
                      >
                        {event.description}
                      </Typography>
                    )}
                  </Box>
                </Stack>
              </CardContent>
            </Card>

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
                  <Typography color="text.primary">
                    Участники
                  </Typography>
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
                  <Typography color="text.primary">
                    Покупки
                  </Typography>
                </Stack>
                <ArrowForwardIosIcon fontSize="small" />
              </Button>
            </Stack>

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

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Container>
  );
};
