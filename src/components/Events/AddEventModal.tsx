// src/components/Events/EventModal.tsx
import React, { useEffect, useState } from 'react';
import type { AddEventEntry, EventShortEntry, UpdateEventEntry } from '../../api';
import { eventsService } from '../../services/event-service';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';

type Props =
  | {
      mode: 'create';
      open: boolean;
      onClose: () => void;
      onCreated: (event: EventShortEntry) => void;
      event?: never;
    }
  | {
      mode: 'edit';
      open: boolean;
      onClose: () => void;
      onUpdated: (event: EventShortEntry) => void;
      event: EventShortEntry;
    };

export const AddEventModal: React.FC<Props> = props => {
  const { mode, open, onClose } = props;

  const [name, setName] = useState('');
  const [description, setDescription] = useState<string>('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // предзаполнение для edit
  useEffect(() => {
    if (!open) return;

    if (mode === 'edit' && props.event) {
      setName(props.event.name ?? '');
      setDescription(props.event.description ?? '');
      setDateStart(props.event.eventDateStart.slice(0, 16)); // 'YYYY‑MM‑DDTHH:mm'
      setDateEnd(
        props.event.eventDateEnd ? props.event.eventDateEnd.slice(0, 16) : '',
      );
    } else {
      setName('');
      setDescription('');
      setDateStart('');
      setDateEnd('');
    }
    setError(null);
    setIsSaving(false);
  }, [open, mode, props.event]);

  const canSubmit = name.trim().length > 0 && !!dateStart && !isSaving;

  const handleSave = async () => {
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);

      const base: UpdateEventEntry | AddEventEntry = {
        name: name.trim(),
        description: description.trim() || null,
        eventDateStart: new Date(dateStart).toISOString(),
        eventDateEnd: dateEnd ? new Date(dateEnd).toISOString() : null,
      };

      if (mode === 'create') {
        const created = await eventsService.createEvent(base as AddEventEntry);
        if (!created?.id) throw new Error('Пустой ответ при создании события.');
        props.onCreated(created);
      } else {
        const updated = await eventsService.editEvent(
          props.event.id,
          base as UpdateEventEntry,
        );
        if (!updated?.id) throw new Error('Пустой ответ при обновлении события.');
        props.onUpdated(updated);
      }

      onClose();
    } catch (e: unknown) {
      const msg =
        e instanceof Error
          ? e.message
          : mode === 'create'
          ? 'Не удалось создать событие.'
          : 'Не удалось обновить событие.';
      setError(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="event-modal-title"
    >
      <DialogTitle id="event-modal-title">
        {mode === 'create' ? 'Создать событие' : 'Редактировать событие'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Название"
            value={name}
            onChange={e => setName(e.target.value)}
            fullWidth
            size="small"
            autoFocus
            required
          />

          <TextField
            label="Описание"
            value={description}
            onChange={e => setDescription(e.target.value)}
            fullWidth
            size="small"
            multiline
            minRows={2}
          />

          <TextField
            label="Начало события"
            type="datetime-local"
            value={dateStart}
            onChange={e => setDateStart(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
            required
          />

          <TextField
            label="Окончание события (опционально)"
            type="datetime-local"
            value={dateEnd}
            onChange={e => setDateEnd(e.target.value)}
            fullWidth
            size="small"
            InputLabelProps={{ shrink: true }}
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSubmit}
        >
          {isSaving
            ? 'Сохраняем...'
            : mode === 'create'
            ? 'Создать'
            : 'Сохранить'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
