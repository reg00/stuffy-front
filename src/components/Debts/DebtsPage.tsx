import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link as RouterLink, useParams } from 'react-router-dom';
import { debtsService } from '../../services/debt-service';
import type { GetDebtEntry, GetUserEntry } from '../../api';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';

import ArrowBackIcon from '@mui/icons-material/ArrowBack';

type RouteParams = { id: string };

const LIMIT = 10;
const USER_STORAGE_KEY = 'user';

function safeParseUser(json: string | null): GetUserEntry | null {
  if (!json) return null;
  try {
    return JSON.parse(json) as GetUserEntry;
  } catch {
    return null;
  }
}

function useCurrentUserId(): string | undefined {
  const [userId] = useState<string | undefined>(() => {
    const user = safeParseUser(localStorage.getItem(USER_STORAGE_KEY));
    const id = user?.id ?? undefined;
    return typeof id === 'string' && id.length ? id : undefined;
  });
  return userId;
}

function formatRub(amount?: number): string {
  if (typeof amount !== 'number') return '—';
  return new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB' }).format(amount);
}

type UiStatus = 'NOT_PAID' | 'PAID' | 'DONE';

export const DebtsPage: React.FC = () => {
  const { id: eventId } = useParams<RouteParams>();
  const currentUserId = useCurrentUserId();

  const [debts, setDebts] = useState<GetDebtEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const title = useMemo(() => 'Долги', []);

  const loadDebts = useCallback(async () => {
    if (!eventId) return;
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = offsetRef.current;

      const resp = await debtsService.getEventDebts(eventId, currentOffset, LIMIT);
      const items = resp.data ?? [];

      if (!items.length) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
        return;
      }

      if (items.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
      }

      setDebts(prev => [...prev, ...items]);
      offsetRef.current = currentOffset + LIMIT;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить долги';
      setError(msg);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, [eventId]);

  // reset при смене eventId — без ручного loadDebts, чтобы не было дублей
  useEffect(() => {
    setDebts([]);
    setHasMore(true);
    setError(null);

    loadingRef.current = false;
    hasMoreRef.current = true;
    offsetRef.current = 0;

    const node = sentinelRef.current;
    if (node && observerRef.current) {
      observerRef.current.disconnect();
      observerRef.current.observe(node);
    }
  }, [eventId]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        loadDebts();
      },
      { root: null, rootMargin: '150px', threshold: 0.1 },
    );

    const node = sentinelRef.current;
    if (node && observerRef.current) observerRef.current.observe(node);

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadDebts]);

  const isDebtor = (d: GetDebtEntry) =>
    !!currentUserId && (d.debtor?.id ?? undefined) === currentUserId;

  const isLender = (d: GetDebtEntry) =>
    !!currentUserId && (d.lender?.id ?? undefined) === currentUserId;

  // статус “для моего экрана”
  // - DONE: isSent && isComfirmed
  // - PAID: isSent && !isComfirmed
  // - NOT_PAID: !isSent
  const getUiStatus = (d: GetDebtEntry): UiStatus => {
    const sent = !!d.isSent;
    const confirmed = !!d.isComfirmed;
    if (sent && confirmed) return 'DONE';
    if (sent) return 'PAID';
    return 'NOT_PAID';
  };

  const getStatusLabelForRole = (d: GetDebtEntry): string => {
    const status = getUiStatus(d);

    // должник:
    // - NOT_PAID -> (кнопка оплатить) и можно показывать "Не оплачено"
    // - PAID -> "Оплачено"
    // - DONE -> "Завершено"
    if (isDebtor(d)) {
      if (status === 'DONE') return 'Завершено';
      if (status === 'PAID') return 'Оплачено';
      return 'Не оплачено';
    }

    // заемщик:
    // - NOT_PAID -> "Не оплачено"
    // - PAID -> (кнопка подтвердить) + статус "Оплачено"
    // - DONE -> "Завершено"
    if (isLender(d)) {
      if (status === 'DONE') return 'Завершено';
      if (status === 'PAID') return 'Оплачено';
      return 'Не оплачено';
    }

    // на всякий случай
    if (status === 'DONE') return 'Завершено';
    if (status === 'PAID') return 'Оплачено';
    return 'Не оплачено';
  };

  const getStatusChipColor = (label: string): 'warning' | 'info' | 'success' => {
    if (label === 'Завершено') return 'success';
    if (label === 'Оплачено') return 'info';
    return 'warning';
  };

  const handleSend = async (debt: GetDebtEntry) => {
    if (!eventId || !debt.id) return;

    try {
      setActionLoadingId(debt.id);
      await debtsService.sendEventDebt(eventId, debt.id);
      setDebts(prev => prev.map(d => (d.id === debt.id ? { ...d, isSent: true } : d)));
    } catch (e) {
      console.error(e);
      setError('Не удалось выполнить оплату');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleConfirm = async (debt: GetDebtEntry) => {
    if (!eventId || !debt.id) return;

    try {
      setActionLoadingId(debt.id);
      await debtsService.confirmEventDebt(eventId, debt.id);

      // поле isComfirmed (опечатка в модели) — используем его
      setDebts(prev =>
        prev.map(d => (d.id === debt.id ? { ...d, isComfirmed: true } : d)),
      );
    } catch (e) {
      console.error(e);
      setError('Не удалось подтвердить оплату');
    } finally {
      setActionLoadingId(null);
    }
  };

  const renderRightSide = (d: GetDebtEntry) => {
    const status = getUiStatus(d);
    const statusLabel = getStatusLabelForRole(d);
    const chipColor = getStatusChipColor(statusLabel);

    const showPayButton = isDebtor(d) && status === 'NOT_PAID';
    const showConfirmButton = isLender(d) && status === 'PAID';

    return (
      <Stack direction="row" spacing={1} alignItems="center">
        <Chip size="small" label={statusLabel} color={chipColor} variant="outlined" />
        {showPayButton && (
          <Button
            size="small"
            variant="contained"
            color="primary"
            onClick={() => handleSend(d)}
            disabled={actionLoadingId === d.id}
            startIcon={actionLoadingId === d.id ? <CircularProgress size={16} /> : undefined}
          >
            Оплатить
          </Button>
        )}
        {showConfirmButton && (
          <Button
            size="small"
            variant="contained"
            color="info"
            onClick={() => handleConfirm(d)}
            disabled={actionLoadingId === d.id}
            startIcon={actionLoadingId === d.id ? <CircularProgress size={16} /> : undefined}
          >
            Подтвердить
          </Button>
        )}
      </Stack>
    );
  };

  if (!eventId) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Typography color="text.primary">Некорректный идентификатор события.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Button
        component={RouterLink}
        to={`/events/${eventId}`}
        startIcon={<ArrowBackIcon />}
        variant="text"
        sx={{ mb: 2, color: 'text.primary' }}
      >
        НАЗАД К СОБЫТИЮ
      </Button>

      <Typography variant="h4" component="h1" color="text.primary" sx={{ mb: 2 }}>
        {title}
      </Typography>

      {!currentUserId && (
        <Box mb={2}>
          <Alert severity="info">
            Не найден текущий пользователь в localStorage по ключу "{USER_STORAGE_KEY}" — роли
            (должник/заемщик) определить нельзя, поэтому кнопки могут не появляться.
          </Alert>
        </Box>
      )}

      {error && (
        <Box mb={2}>
          <Alert
            severity="error"
            action={
              <Button color="inherit" size="small" onClick={loadDebts}>
                Повторить
              </Button>
            }
          >
            {error}
          </Alert>
        </Box>
      )}

      {!debts.length && !isLoading && !error && (
        <Typography variant="body1" color="text.secondary">
          Долгов пока нет.
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
        {debts.map(d => {
          const lenderName = d.lender?.name ?? '—';
          const debtorName = d.debtor?.name ?? '—';

          const headerText = currentUserId
            ? isDebtor(d)
              ? `Вы должны: ${lenderName}`
              : isLender(d)
                ? `Вам должны: ${debtorName}`
                : `${debtorName} → ${lenderName}`
            : `${debtorName} → ${lenderName}`;

          return (
            <ListItem
              key={d.id}
              disablePadding
              secondaryAction={
                <ListItemSecondaryAction sx={{ right: 16 }}>
                  {renderRightSide(d)}
                </ListItemSecondaryAction>
              }
              sx={{
                '& .MuiListItemSecondaryAction-root': { right: 16 },
                borderRadius: 2,
                bgcolor: 'background.paper',
                boxShadow: 1,
                px: 2,
                py: 1.5,
              }}
            >
              {/* резервируем справа место под Chip+Button, иначе текст будет залезать под secondaryAction */}
              <Box sx={{ width: '100%', pr: 18 }}>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                  {headerText}
                </Typography>

                <Typography variant="h6" color="text.primary" sx={{ lineHeight: 1.2 }}>
                  {formatRub(d.amount)}
                </Typography>
              </Box>
            </ListItem>
          );
        })}
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

        {!hasMore && debts.length > 0 && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Больше долгов нет.
          </Typography>
        )}
      </Box>
    </Container>
  );
};
