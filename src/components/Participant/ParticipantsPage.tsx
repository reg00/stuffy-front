// src/pages/events/EventParticipantsPage.tsx
import React, { useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import type { ParticipantShortEntry } from '../../api';
import { participantService } from '../../services/patricipant-service';
import { AddParticipantModal } from './AddParticipantModal';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import ListItemText from '@mui/material/ListItemText';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import PersonIcon from '@mui/icons-material/Person';
import DeleteIcon from '@mui/icons-material/Delete';

type RouteParams = { id: string };

type LocationState = {
  participants?: ParticipantShortEntry[];
};

export const ParticipantsPage: React.FC = () => {
  const { id: eventId } = useParams<RouteParams>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const initialParticipants = useMemo(
    () => state?.participants ?? [],
    [state],
  );

  const [participants, setParticipants] = useState<ParticipantShortEntry[]>(
    initialParticipants,
  );
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!eventId) return null;

  const handleDelete = async (participantId: string) => {
    const ok = window.confirm('Удалить участника?');
    if (!ok) return;

    try {
      setError(null);
      setDeletingId(participantId);
      await participantService.deleteParticipant(eventId, participantId);
      setParticipants(prev => prev.filter(p => p.id !== participantId));
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось удалить участника';
      setError(msg);
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (createdParticipantId?: string) => {
    if (!createdParticipantId) return;

    (async () => {
      try {
        const full = await participantService.getParticipantById(
          eventId,
          createdParticipantId,
        );

        setParticipants(prev => [
          ...prev,
          {
            id: full.id,
            name: full.user.name ?? null,
          },
        ]);
      } catch {
        // fallback: ничего
      }
    })();
  };

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
        {/* Назад + заголовок + Добавить */}
        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <Stack direction="row" spacing={1} alignItems="center">
            <Button
              sx={{ mb: 2, color:'text.primary' }}
              component={RouterLink}
              to={`/events/${eventId}`}
              startIcon={<ArrowBackIcon />}
              variant="text"
            >
              Назад к ивенту
            </Button>
          </Stack>

          <Button
            variant="contained"
            color="primary"
            onClick={() => setIsAddOpen(true)}
          >
            + Добавить участника
          </Button>
        </Stack>

        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          color="text.primary"
        >
          Участники
        </Typography>

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {participants.length === 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Участников пока нет. Добавьте первого.
          </Typography>
        )}

        {/* Список участников */}
        <List
          sx={{
            mt: 2,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {participants.map(p => (
            <ListItem
              key={p.id}
              sx={{
                borderRadius: 2,
                bgcolor: 'background.default',
                boxShadow: 1,
              }}
              secondaryAction={
                <IconButton
                  edge="end"
                  aria-label="Удалить участника"
                  title="Удалить"
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  color="error"
                >
                  {deletingId === p.id ? '…' : <DeleteIcon />}
                </IconButton>
              }
            >
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText
                primary={
                  p.name && p.name.trim().length > 0
                    ? p.name
                    : 'Без имени'
                }
              />
            </ListItem>
          ))}
        </List>

        {!state && (
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2 }}
          >
            Страница открыта без state — вернитесь на детальную ивента и
            зайдите повторно.
          </Typography>
        )}
      </Box>

      <AddParticipantModal
        eventId={eventId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={handleCreated}
      />
    </Container>
  );
};
