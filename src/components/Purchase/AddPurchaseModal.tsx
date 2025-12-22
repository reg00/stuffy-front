// src/pages/events/AddPurchaseModal.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import type {
  AddPurchaseEntry,
  GetPurchaseEntry,
  ParticipantShortEntry,
  PurchaseShortEntry,
  UpsertPurchaseUsageEntry,
  UpdatePurchaseEntry,
} from '../../api';
import { participantService } from '../../services/patricipant-service';
import { purchaseService } from '../../services/purchase-service';

import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';

type Props =
  | {
      mode: 'create';
      eventId: string;
      isOpen: boolean;
      onClose: () => void;
      onCreated: (purchase: PurchaseShortEntry) => void;
      onUpdated?: never;
      purchaseId?: never;
      initialPurchase?: never;
    }
  | {
      mode: 'edit';
      eventId: string;
      isOpen: boolean;
      onClose: () => void;
      onUpdated: (purchase: PurchaseShortEntry) => void;
      onCreated?: never;
      purchaseId: string;
      initialPurchase?: GetPurchaseEntry;
    };

type UsageRow = {
  participantId: string;
  amount: number;
};

const PAGE_LIMIT = 20;

function mapGetPurchaseToForm(p: GetPurchaseEntry): {
  name: string;
  cost: number;
  buyerParticipantId: string;
  usages: UsageRow[];
} {
  const usages =
    (p.purchaseUsages as Array<UpsertPurchaseUsageEntry> | undefined) ?? [];

  return {
    name: p.name ?? '',
    cost: Number(p.cost ?? 0),
    buyerParticipantId: p.participant?.id ?? '',
    usages: usages
      .filter(u => u?.participantId)
      .map(u => ({
        participantId: u.participantId,
        amount: u.amount ?? 1,
      })),
  };
}

export const AddPurchaseModal: React.FC<Props> = props => {
  const { eventId, isOpen, onClose, mode } = props;

  // form fields
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [buyerParticipantId, setBuyerParticipantId] = useState<string>('');
  const [usages, setUsages] = useState<UsageRow[]>([]);

  // edit loading
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // participants infinite list
  const [participants, setParticipants] = useState<ParticipantShortEntry[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(
    null,
  );

  const [offset, setOffset] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const pageIndex = useMemo(
    () => Math.floor(offset / PAGE_LIMIT),
    [offset],
  );
  const hasMore = useMemo(() => {
    if (totalPages === null) return true;
    return pageIndex < totalPages;
  }, [pageIndex, totalPages]);

  const loadedOffsetsRef = useRef<Set<number>>(new Set());
  const loadingOffsetsRef = useRef<Set<number>>(new Set());

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // submit state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    if (mode === 'create') {
      return (
        name.trim().length > 0 &&
        Number.isFinite(cost) &&
        cost >= 0 &&
        buyerParticipantId.length > 0 &&
        !purchaseLoading
      );
    }

    return (
      name.trim().length > 0 &&
      Number.isFinite(cost) &&
      cost >= 0 &&
      !purchaseLoading
    );
  }, [mode, name, cost, buyerParticipantId, purchaseLoading]);

  const getErrorMessage = (e: unknown, fallback: string) => {
    if (e instanceof Error) return e.message || fallback;
    return fallback;
  };

  const hardResetAll = () => {
    setError(null);
    setIsSaving(false);

    setName('');
    setCost(0);
    setBuyerParticipantId('');
    setUsages([]);

    setPurchaseLoading(false);

    setParticipants([]);
    setParticipantsError(null);
    setParticipantsLoading(false);

    setOffset(0);
    setTotalPages(null);

    loadedOffsetsRef.current.clear();
    loadingOffsetsRef.current.clear();

    observerRef.current?.disconnect();
    observerRef.current = null;
  };

  const loadParticipantsPage = async (pageOffset: number) => {
    if (!isOpen) return;
    if (!eventId) return;

    if (loadedOffsetsRef.current.has(pageOffset)) return;
    if (loadingOffsetsRef.current.has(pageOffset)) return;

    if (totalPages !== null) {
      const currentPage = Math.floor(pageOffset / PAGE_LIMIT);
      if (currentPage >= totalPages) return;
    }

    const wasOpen = isOpen;

    try {
      loadingOffsetsRef.current.add(pageOffset);
      setParticipantsLoading(true);
      setParticipantsError(null);

      const resp = await participantService.getPartcipants(
        eventId,
        pageOffset,
        PAGE_LIMIT,
        undefined,
      );

      if (!wasOpen) return;

      const data = (resp.data ?? []).filter(Boolean);
      const tp = resp.totalPages ?? 1;

      loadedOffsetsRef.current.add(pageOffset);

      setTotalPages(tp);
      setParticipants(prev => {
        const existingIds = new Set(prev.map(p => p.id));
        const newParticipants = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newParticipants];
      });
      setOffset(prevNextOffset =>
        Math.max(prevNextOffset, pageOffset + PAGE_LIMIT),
      );

      if (mode === 'create' && pageOffset === 0 && data.length > 0) {
        setBuyerParticipantId(prev => prev || data[0].id);
      }
    } catch (e: unknown) {
      if (wasOpen) {
        setParticipantsError(
          getErrorMessage(e, 'Не удалось загрузить участников.'),
        );
      }
    } finally {
      loadingOffsetsRef.current.delete(pageOffset);
      setParticipantsLoading(false);
    }
  };

  // open: reset + first participants page
  useEffect(() => {
    if (!isOpen) return;

    hardResetAll();
    loadParticipantsPage(0);
  }, [isOpen, eventId]);

  // infinite scroll observer
  useEffect(() => {
    if (!isOpen) return;
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = null;

    const el = sentinelRef.current;

    const observer = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (!hasMore) return;
        loadParticipantsPage(offset);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '200px 0px 200px 0px',
      },
    );

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [isOpen, offset, hasMore, eventId]);

  // edit prefill
  useEffect(() => {
    if (!isOpen) return;
    if (mode !== 'edit') return;

    let cancelled = false;

    (async () => {
      try {
        setPurchaseLoading(true);
        setError(null);

        let purchase: GetPurchaseEntry | undefined = props.initialPurchase;

        if (!purchase) {
          const purchaseId = props.purchaseId as string;
          purchase = await purchaseService.getPurchaseById(
            eventId,
            purchaseId,
          );
        }

        if (cancelled || !purchase) return;

        const mapped = mapGetPurchaseToForm(purchase);
        setName(mapped.name);
        setCost(mapped.cost);
        setBuyerParticipantId(mapped.buyerParticipantId);
        setUsages(mapped.usages);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(
          getErrorMessage(
            e,
            'Не удалось загрузить покупку для редактирования.',
          ),
        );
      } finally {
        if (!cancelled) setPurchaseLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, eventId, props.initialPurchase, props.purchaseId]);

  const addUsageRow = () => {
    const firstParticipantId = participants[0]?.id ?? '';
    setUsages(prev => [...prev, { participantId: firstParticipantId, amount: 1 }]);
  };

  const updateUsageRow = (index: number, patch: Partial<UsageRow>) => {
    setUsages(prev =>
      prev.map((r, i) => (i === index ? { ...r, ...patch } : r)),
    );
  };

  const removeUsageRow = (index: number) => {
    setUsages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);

      const purchaseUsages: UpsertPurchaseUsageEntry[] = usages
        .filter(u => u.participantId && u.amount > 0)
        .map(u => ({ participantId: u.participantId, amount: u.amount }));

      if (mode === 'create') {
        const payload: AddPurchaseEntry = {
          name: name.trim(),
          cost,
          participantId: buyerParticipantId,
          purchaseUsages,
        };

        const created = await purchaseService.createPurchase(
          eventId,
          payload,
        );
        if (!created?.id)
          throw new Error(
            'Пустой ответ от API при создании покупки (нет id).',
          );

        props.onCreated(created);
        onClose();
        return;
      }

      const purchaseId = props.purchaseId;
      const payload: UpdatePurchaseEntry = {
        name: name.trim(),
        cost,
        purchaseUsages,
      };

      const updated = await purchaseService.editPurchaseById(
        eventId,
        purchaseId,
        payload,
      );
      if (!updated?.id)
        throw new Error(
          'Пустой ответ от API при обновлении покупки (нет id).',
        );

      props.onUpdated(updated);
      onClose();
    } catch (e: unknown) {
      setError(
        getErrorMessage(
          e,
          mode === 'edit'
            ? 'Не удалось обновить покупку.'
            : 'Не удалось добавить покупку.',
        ),
      );
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
      aria-labelledby="add-purchase-title"
    >
      <DialogTitle id="add-purchase-title">
        {mode === 'edit' ? 'Изменить покупку' : 'Добавить покупку'}
      </DialogTitle>

      <DialogContent dividers>
        <Stack spacing={2}>
          {error && <Alert severity="error">{error}</Alert>}

          {purchaseLoading && mode === 'edit' && (
            <Stack direction="row" spacing={1} alignItems="center">
              <CircularProgress size={18} />
              <Typography variant="body2" color="text.secondary">
                Загружаем данные покупки...
              </Typography>
            </Stack>
          )}

          <TextField
            label="Название"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder="Например: Пицца"
            autoFocus
            fullWidth
            size="small"
            disabled={purchaseLoading}
          />

          <TextField
            label="Цена (₽)"
            type="number"
            inputProps={{ min: 0, step: 1 }}
            value={Number.isFinite(cost) ? cost : 0}
            onChange={e => setCost(Number(e.target.value))}
            fullWidth
            size="small"
            disabled={purchaseLoading}
          />

          {mode === 'create' && (
            <Box>
              <Typography variant="subtitle2" gutterBottom>
                Кто купил
              </Typography>
              <TextField
                select
                fullWidth
                size="small"
                value={buyerParticipantId}
                onChange={e => setBuyerParticipantId(e.target.value)}
                disabled={purchaseLoading || participants.length === 0}
              >
                {participants.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name ?? 'Без имени'}
                  </MenuItem>
                ))}
              </TextField>

              {participantsError && (
                <Box mt={1}>
                  <Alert severity="error" variant="outlined">
                    {participantsError}
                  </Alert>
                </Box>
              )}

              <Box ref={sentinelRef} sx={{ height: 1 }} />

              {participantsLoading && (
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ mt: 1 }}
                >
                  <CircularProgress size={18} />
                  <Typography variant="body2" color="text.secondary">
                    Загружаем участников...
                  </Typography>
                </Stack>
              )}

              {!participantsLoading &&
                participants.length === 0 &&
                !participantsError && (
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mt: 1 }}
                  >
                    Участников нет.
                  </Typography>
                )}
            </Box>
          )}

          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            sx={{ mt: 1 }}
          >
            <Typography variant="subtitle2">
              Использования (опционально)
            </Typography>
            <Button
              startIcon={<AddIcon />}
              size="small"
              variant="outlined"
              onClick={addUsageRow}
              disabled={participants.length === 0 || purchaseLoading}
            >
              Добавить
            </Button>
          </Stack>

          {usages.length === 0 && (
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{ mt: 1 }}
            >
              Можно не заполнять — список пуст.
            </Typography>
          )}

          {usages.map((row, idx) => (
            <Stack
              key={`${row.participantId}-${idx}`}
              direction="row"
              spacing={1}
              alignItems="center"
            >
              <TextField
                select
                size="small"
                fullWidth
                value={row.participantId}
                onChange={e =>
                  updateUsageRow(idx, { participantId: e.target.value })
                }
                disabled={purchaseLoading}
                label="Участник"
              >
                <MenuItem value="" disabled>
                  Выберите участника
                </MenuItem>
                {participants.map(p => (
                  <MenuItem key={p.id} value={p.id}>
                    {p.name ?? 'Без имени'}
                  </MenuItem>
                ))}
              </TextField>

              <TextField
                size="small"
                type="number"
                label="Кол-во"
                inputProps={{ min: 1, step: 1 }}
                value={row.amount}
                onChange={e =>
                  updateUsageRow(idx, { amount: Number(e.target.value) })
                }
                sx={{ width: 100 }}
                disabled={purchaseLoading}
              />

              <IconButton
                color="error"
                onClick={() => removeUsageRow(idx)}
                disabled={purchaseLoading}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </Stack>
          ))}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="inherit">
          Отмена
        </Button>
        <Button
          onClick={handleSave}
          variant="contained"
          disabled={!canSubmit || isSaving || participantsLoading}
        >
          {isSaving
            ? 'Сохраняем...'
            : mode === 'edit'
            ? 'Сохранить'
            : 'Создать'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};