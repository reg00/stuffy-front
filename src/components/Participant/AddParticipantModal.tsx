// src/components/AddParticipantModal/AddParticipantModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { UserShortEntry } from '../../api';
import { authService } from '../../services/auth-service';
import { participantService } from '../../services/patricipant-service';
import { useDebounce } from '../../hooks/useDebounce';
import { isApiError } from '../../utils/api-error';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import CircularProgress from '@mui/material/CircularProgress';
import Typography from '@mui/material/Typography';

type Props = {
  eventId: string;
  isOpen: boolean;
  onClose: () => void;
  onCreated: (createdParticipantId?: string) => void;
};

export const AddParticipantModal: React.FC<Props> = ({
  eventId,
  isOpen,
  onClose,
  onCreated,
}) => {
  const [query, setQuery] = useState('');
  const debouncedQuery = useDebounce(query, 500);

  const [users, setUsers] = useState<UserShortEntry[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');

  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const trimmed = useMemo(() => debouncedQuery.trim(), [debouncedQuery]);
  const hasQuery = useMemo(() => trimmed.length > 0, [trimmed]);

  const getErrorMessage = (e: unknown, fallback: string) => {
    if (isApiError(e)) return e.message || fallback;
    if (e instanceof Error) return e.message || fallback;
    return fallback;
  };

  // 1) Первичная загрузка — при открытии модалки
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsSearching(true);
        setSelectedUserId('');
        setUsers([]);

        const data = await authService.getUsers(undefined);

        if (cancelled) return;
        setUsers(
          (data ?? []).filter(
            (u): u is UserShortEntry => Boolean(u && u.id),
          ),
        );
      } catch (e) {
        if (cancelled) return;
        setError(
          getErrorMessage(e, 'Не удалось загрузить пользователей.'),
        );
        setUsers([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 2) Debounced поиск
  useEffect(() => {
    if (!isOpen) return;
    if (!hasQuery) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsSearching(true);
        setSelectedUserId('');
        setUsers([]);

        const data = await authService.getUsers(trimmed);

        if (cancelled) return;
        setUsers(
          (data ?? []).filter(
            (u): u is UserShortEntry => Boolean(u && u.id),
          ),
        );
      } catch (e) {
        if (cancelled) return;
        setError(
          getErrorMessage(
            e,
            'Не удалось выполнить поиск пользователей.',
          ),
        );
        setUsers([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, hasQuery, trimmed]);

  const handleClose = () => {
    setQuery('');
    setUsers([]);
    setSelectedUserId('');
    setError(null);
    onClose();
  };

  const handleCreate = async () => {
    if (!selectedUserId) return;

    try {
      setIsCreating(true);
      setError(null);

      const created = await participantService.createParticipant(eventId, {
        userId: selectedUserId,
      });

      if (!created?.id) {
        throw new Error(
          'Пустой ответ от API при добавлении участника (нет id).',
        );
      }

      onCreated(created.id);
      handleClose();
    } catch (e) {
      setError(getErrorMessage(e, 'Не удалось добавить участника.'));
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-participant-title"
    >
      <DialogTitle id="add-participant-title">
        Добавить участника
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          <TextField
            label="Поиск пользователя"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Начните вводить имя..."
            autoFocus
            fullWidth
            size="small"
          />

          {error && <Alert severity="error">{error}</Alert>}

          {isSearching && (
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{ mt: 1 }}
            >
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Ищем...
              </Typography>
            </Stack>
          )}

          {!isSearching && users.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              {hasQuery ? 'Ничего не найдено.' : 'Список пуст.'}
            </Typography>
          )}

          {users.length > 0 && (
            <FormControl component="fieldset" sx={{ mt: 1 }}>
              <FormLabel component="legend">
                Выберите пользователя
              </FormLabel>
              <RadioGroup
                name="user"
                value={selectedUserId}
                onChange={(_, value) => setSelectedUserId(value)}
              >
                {users.map(u => (
                  <FormControlLabel
                    key={u.id}
                    value={u.id!}
                    control={<Radio size="small" />}
                    label={u.name ?? u.id}
                  />
                ))}
              </RadioGroup>
            </FormControl>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleCreate}
          variant="contained"
          disabled={!selectedUserId || isCreating}
        >
          {isCreating ? 'Создаём...' : 'Добавить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
