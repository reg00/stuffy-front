// src/pages/events/PurchasesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link as RouterLink, useLocation, useParams } from 'react-router-dom';
import type { PurchaseShortEntry } from '../../api';
import { purchaseService } from '../../services/purchase-service';
import { AddPurchaseModal } from './AddPurchaseModal';

import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

type RouteParams = {
  id: string;
};

type LocationState = {
  purchases?: PurchaseShortEntry[];
  refresh?: boolean;
};

export const PurchasesPage: React.FC = () => {
  const { id: eventId } = useParams<RouteParams>();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const initialPurchases = useMemo(
    () => state?.purchases ?? [],
    [state],
  );

  const [purchases, setPurchases] =
    useState<PurchaseShortEntry[]>(initialPurchases);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingPurchaseId, setEditingPurchaseId] =
    useState<string | null>(null);
  const isEditOpen = Boolean(editingPurchaseId);

  const openedWithoutState = !state?.purchases && !state?.refresh;

  const loadPurchases = async () => {
    // TODO: подключить реальный GET списка покупок
  };

  useEffect(() => {
    if (state?.refresh && eventId) {
      loadPurchases();
    }
  }, [state?.refresh, eventId]);

  const handleAddPurchase = () => {
    if (!eventId) return;
    setIsCreateOpen(true);
  };

  const handleEditPurchase = (purchase: PurchaseShortEntry) => {
    if (!eventId) return;
    setEditingPurchaseId(purchase.id);
  };

  const handleDeletePurchase = async (purchaseId: string) => {
    if (!eventId) return;

    const ok = window.confirm('Удалить покупку?');
    if (!ok) return;

    try {
      setLoading(true);
      setError(null);
      await purchaseService.deletePurchaseById(eventId, purchaseId);
      setPurchases(prev => prev.filter(p => p.id !== purchaseId));
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось удалить покупку';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (created: PurchaseShortEntry) => {
    setPurchases(prev => [created, ...prev]);
  };

  const handleUpdated = (updated: PurchaseShortEntry) => {
    setPurchases(prev => prev.map(p => (p.id === updated.id ? updated : p)));
  };

  if (!eventId) return null;

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
        {/* Шапка */}
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
            onClick={handleAddPurchase}
            disabled={loading}
          >
            + Добавить покупку
          </Button>
        </Stack>

        <Typography
          variant="h5"
          component="h1"
          gutterBottom
          color="text.primary"
        >
          Покупки
        </Typography>

        {error && (
          <Box mb={2}>
            <Alert severity="error">{error}</Alert>
          </Box>
        )}

        {purchases.length === 0 && !loading && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            Покупок пока нет. Добавьте первую.
          </Typography>
        )}

        {/* Список покупок */}
        <List
          sx={{
            mt: 2,
            p: 0,
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {purchases.map(p => (
            <ListItem
              key={p.id}
              sx={{
                borderRadius: 2,
                bgcolor: 'background.default',
                boxShadow: 1,
              }}
            >
              <Stack
                direction="row"
                spacing={2}
                alignItems="center"
                justifyContent="space-between"
                sx={{ width: '100%' }}
              >
                {/* Левая часть: название + цена под ним */}
                <ListItemText
                  primary={
                    <Stack spacing={0.25}>
                      <Typography
                        variant="subtitle1"
                        component="span"
                        color="text.primary"
                        noWrap
                      >
                        {p.name}
                      </Typography>
                      <Typography
                        variant="caption"
                        component="span"
                        color="text.secondary"
                      >
                        {p.cost} ₽
                      </Typography>
                    </Stack>
                  }
                />

                {/* Правая часть: статус + кнопки */}
                <Stack
                  direction="row"
                  spacing={1.5}
                  alignItems="center"
                  sx={{ flexShrink: 0 }}
                >
                  <Chip
                    label={p.isComplete ? 'Рассчитано' : 'Не рассчитано'}
                    size="small"
                    color={p.isComplete ? 'success' : 'warning'}
                  />

                  <IconButton
                    aria-label="Редактировать"
                    title="Редактировать"
                    onClick={() => handleEditPurchase(p)}
                    disabled={loading}
                    color="primary"
                    size="small"
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>

                  <IconButton
                    aria-label="Удалить"
                    title="Удалить"
                    onClick={() => handleDeletePurchase(p.id)}
                    disabled={loading}
                    color="error"
                    size="small"
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Stack>
              </Stack>
            </ListItem>
          ))}
        </List>

        {openedWithoutState && (
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

      {/* Create */}
      <AddPurchaseModal
        mode="create"
        eventId={eventId}
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onCreated={handleCreated}
      />

      {/* Edit */}
      {editingPurchaseId && (
        <AddPurchaseModal
          mode="edit"
          eventId={eventId}
          purchaseId={editingPurchaseId}
          isOpen={isEditOpen}
          onClose={() => setEditingPurchaseId(null)}
          onUpdated={handleUpdated}
        />
      )}
    </Container>
  );
};
