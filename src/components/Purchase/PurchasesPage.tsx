// src/pages/events/PurchasesPage.tsx
import React, { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { PurchaseShortEntry } from '../../api';
import { purchaseService } from '../../services/purchase-service';
import styles from './Purchase.module.css';
import { AddPurchaseModal } from './AddPurchaseModal';

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
    [state]
  );

  const [purchases, setPurchases] = useState<PurchaseShortEntry[]>(initialPurchases);
  const [loading, setLoading] = useState(false);

  // create modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // edit modal
  const [editingPurchaseId, setEditingPurchaseId] = useState<string | null>(null);
  const isEditOpen = Boolean(editingPurchaseId);

  // Если страницу открыли без state — показываем подсказку (как у тебя было)
  const openedWithoutState = !state?.purchases && !state?.refresh;

  // Заглушка: если позже появится эндпоинт "получить покупки ивента"
  const loadPurchases = async () => {
    // TODO: заменить на реальный GET списка покупок
    // Сейчас данные берутся из location.state
  };

  // Обновляем список при возврате с refresh (оставил как было)
  useEffect(() => {
    if (state?.refresh && eventId) {
      loadPurchases();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      await purchaseService.deletePurchaseById(eventId, purchaseId);
      setPurchases((prev) => prev.filter((p) => p.id !== purchaseId));
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось удалить покупку';
      alert(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleCreated = (created: PurchaseShortEntry) => {
    // добавляем в начало списка
    setPurchases((prev) => [created, ...prev]);
  };

  const handleUpdated = (updated: PurchaseShortEntry) => {
    // обновляем элемент по id (immutable update) [web:283]
    setPurchases((prev) => prev.map((p) => (p.id === updated.id ? updated : p)));
  };

  if (!eventId) return null;

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link to={`/events/${eventId}`} className={styles.backLink}>
            ← Назад к ивенту
          </Link>
        </div>

        <div className={styles.narrow}>
          <div className={styles.pageHeader}>
            <h1 className={styles.sectionTitle}>Покупки</h1>

            <button
              type="button"
              onClick={handleAddPurchase}
              className={styles.addButton}
              disabled={loading}
            >
              + Добавить покупку
            </button>
          </div>

          {purchases.length === 0 && !loading && (
            <p className={styles.emptyText}>
              Покупок пока нет. Добавьте первую.
            </p>
          )}

          <ul className={styles.list}>
            {purchases.map((p) => (
              <li key={p.id} className={styles.listItem}>
                <div className={styles.purchaseInfo}>
                  <span>{p.name}</span>
                  <span className={styles.purchaseStatus}>
                    {p.isComplete ? 'Оплачено' : 'Не оплачено'}
                  </span>
                </div>

                <div className={styles.purchaseActions}>
                  <span className={styles.purchaseAmount}>{p.cost} ₽</span>

                  <button
                    type="button"
                    className={styles.editButton}
                    onClick={() => handleEditPurchase(p)}
                    title="Редактировать"
                    disabled={loading}
                  >
                    ✏️
                  </button>

                  <button
                    type="button"
                    className={styles.deleteButton}
                    onClick={() => handleDeletePurchase(p.id)}
                    title="Удалить"
                    disabled={loading}
                  >
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>

          {openedWithoutState && (
            <p className={styles.hintText}>
              Страница открыта без state — вернитесь на детальную ивента и зайдите повторно.
            </p>
          )}
        </div>
      </div>

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
    </div>
  );
};
