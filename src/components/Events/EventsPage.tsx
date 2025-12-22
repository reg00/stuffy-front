// src/components/Events/EventsPage.tsx
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link as RouterLink } from 'react-router-dom';
import { eventsService } from '../../services/event-service';
import type { EventShortEntry } from '../../api';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemText from '@mui/material/ListItemText';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Stack from '@mui/material/Stack';
import IconButton from '@mui/material/IconButton';
import EditIcon from '@mui/icons-material/Edit';
import { AddEventModal } from './AddEventModal';

const LIMIT = 10;

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventShortEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventShortEntry | null>(
    null,
  );

  const loadEvents = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = offsetRef.current;
      const data = await eventsService.getEvents(currentOffset, LIMIT);

      if (!data.length) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
        return;
      }

      if (data.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
      }

      setEvents(prev => [...prev, ...data]);

      const nextOffset = currentOffset + LIMIT;
      offsetRef.current = nextOffset;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось загрузить события';
      setError(msg);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        loadEvents();
      },
      {
        root: null,
        rootMargin: '150px',
        threshold: 0.1,
      },
    );

    const node = sentinelRef.current;
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadEvents]);

  const handleCreated = (created: EventShortEntry) => {
    // новое событие в начало списка
    setEvents(prev => [created, ...prev]);
  };

  const handleUpdated = (updated: EventShortEntry) => {
    setEvents(prev => prev.map(e => (e.id === updated.id ? updated : e)));
  };

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Заголовок + кнопка создать */}
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mb: 2 }}
      >
        <Typography
          variant="h4"
          component="h1"
          color="text.primary"
        >
          События
        </Typography>

        <Button
          variant="contained"
          color="primary"
          onClick={() => setIsCreateOpen(true)}
        >
          Создать событие
        </Button>
      </Stack>

      {error && (
        <Box mb={2}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadEvents}>
                Повторить
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {!events.length && !isLoading && !error && (
        <Typography variant="body1" color="text.secondary">
          Событий пока нет.
        </Typography>
      )}

      <List
        sx={{
          mt: 1,
          p: 0,
          bgcolor: 'transparent',
          display: 'flex',
          flexDirection: 'column',
          gap: 1.5,
        }}
      >
        {events.map(event => (
          <ListItem
            key={event.id}
            disablePadding
            secondaryAction={
              <ListItemSecondaryAction
                sx={{ display: 'flex', alignItems: 'center', gap: 1, right: 16 }}
              >
                <Chip
                  size="small"
                  label={event.isCompleted ? 'Завершено' : 'Активно'}
                  color={event.isCompleted ? 'info' : 'success'}
                />
                <IconButton
                  edge="end"
                  aria-label="Редактировать"
                  title="Редактировать"
                  onClick={() => setEditingEvent(event)}
                  size="small"
                  color="primary"
                >
                  <EditIcon fontSize="small" />
                </IconButton>
              </ListItemSecondaryAction>
            }
            sx={{
              '& .MuiListItemSecondaryAction-root': { right: 16 },
              borderRadius: 2,
              bgcolor: 'background.paper',
              boxShadow: 1,
            }}
          >
            <ListItemButton
              component={RouterLink}
              to={`/events/${event.id}`}
              alignItems="flex-start"
            >
              <ListItemText
                primary={
                  <Typography
                    variant="subtitle1"
                    fontWeight={600}
                    component="span"
                    color="text.primary"
                  >
                    {event.name}
                  </Typography>
                }
                secondary={
                  <span>
                    {event.description && (
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        component="span"
                        display="block"
                      >
                        {event.description}
                      </Typography>
                    )}
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      component="span"
                      display="block"
                    >
                      Начало:{' '}
                      {new Date(event.eventDateStart).toLocaleString()}
                    </Typography>
                  </span>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Box ref={sentinelRef} sx={{ height: 1 }} />

      <Box mt={2}>
        {isLoading && (
          <Stack direction="row" spacing={1} alignItems="center">
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.primary">
              Загружаем ещё...
            </Typography>
          </Stack>
        )}

        {!hasMore && events.length > 0 && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 1 }}
          >
            Больше событий нет.
          </Typography>
        )}
      </Box>

      {/* Модалки */}
      <AddEventModal
        mode="create"
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />

      {editingEvent && (
        <AddEventModal
          mode="edit"
          open={!!editingEvent}
          event={editingEvent}
          onClose={() => setEditingEvent(null)}
          onUpdated={handleUpdated}
        />
      )}
    </Container>
  );
};
