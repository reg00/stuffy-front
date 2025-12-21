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
import styles from './Purchase.module.css';

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
  const usages = (p.purchaseUsages as Array<UpsertPurchaseUsageEntry> | undefined) ?? [];

  return {
    name: p.name ?? '',
    cost: Number(p.cost ?? 0),
    // важно для create-предзаполнения (если вдруг используешь initialPurchase и в create)
    buyerParticipantId: p.participant?.id ?? '',
    usages: usages
      .filter((u) => u?.participantId)
      .map((u) => ({ participantId: u.participantId, amount: u.amount ?? 1 })),
  };
}

export const AddPurchaseModal: React.FC<Props> = (props) => {
  const { eventId, isOpen, onClose, mode } = props;

  // ===== form fields =====
  const [name, setName] = useState('');
  const [cost, setCost] = useState<number>(0);
  const [buyerParticipantId, setBuyerParticipantId] = useState<string>(''); // кто купил (только create)
  const [usages, setUsages] = useState<UsageRow[]>([]);

  // ===== purchase loading in edit =====
  const [purchaseLoading, setPurchaseLoading] = useState(false);

  // ===== participants infinite list (нужен только для create и usages) =====
  const [participants, setParticipants] = useState<ParticipantShortEntry[]>([]);
  const [participantsLoading, setParticipantsLoading] = useState(false);
  const [participantsError, setParticipantsError] = useState<string | null>(null);

  const [offset, setOffset] = useState(0);
  const [totalPages, setTotalPages] = useState<number | null>(null);

  const pageIndex = useMemo(() => Math.floor(offset / PAGE_LIMIT), [offset]);
  const hasMore = useMemo(() => {
    if (totalPages === null) return true;
    return pageIndex < totalPages;
  }, [pageIndex, totalPages]);

  // защита от дублей
  const loadedOffsetsRef = useRef<Set<number>>(new Set());
  const loadingOffsetsRef = useRef<Set<number>>(new Set());

  // sentinel/observer
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // submit state
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = useMemo(() => {
    // create: нужен buyerParticipantId
    if (mode === 'create') {
      return (
        name.trim().length > 0 &&
        Number.isFinite(cost) &&
        cost >= 0 &&
        buyerParticipantId.length > 0 &&
        !purchaseLoading
      );
    }

    // edit: participantId не редактируем и не валидируем
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

  // Esc закрывает модалку
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const loadParticipantsPage = async (pageOffset: number) => {
    if (!isOpen) return;
    if (!eventId) return;

    if (loadedOffsetsRef.current.has(pageOffset)) return;
    if (loadingOffsetsRef.current.has(pageOffset)) return;

    if (totalPages !== null) {
      const currentPage = Math.floor(pageOffset / PAGE_LIMIT);
      if (currentPage >= totalPages) return;
    }

    const wasOpen = isOpen; // защита от race condition

    try {
      loadingOffsetsRef.current.add(pageOffset);
      setParticipantsLoading(true);
      setParticipantsError(null);

      const resp = await participantService.getPartcipants(
        eventId,
        pageOffset,
        PAGE_LIMIT,
        undefined
      );

      if (!wasOpen) return; // модалка закрылась во время запроса

      const data = (resp.data ?? []).filter(Boolean);
      const tp = resp.totalPages ?? 1;

      loadedOffsetsRef.current.add(pageOffset);

      setTotalPages(tp);
      setParticipants((prev) => {
        // убираем дубли при merge
        const existingIds = new Set(prev.map(p => p.id));
        const newParticipants = data.filter(p => !existingIds.has(p.id));
        return [...prev, ...newParticipants];
      });
      setOffset((prevNextOffset) => Math.max(prevNextOffset, pageOffset + PAGE_LIMIT));

      // авто-выбор покупателя только в create
      if (mode === 'create' && pageOffset === 0 && data.length > 0) {
        setBuyerParticipantId((prev) => prev || data[0].id);
      }
    } catch (e: unknown) {
      if (wasOpen) {
        setParticipantsError(getErrorMessage(e, 'Не удалось загрузить участников.'));
      }
    } finally {
      loadingOffsetsRef.current.delete(pageOffset);
      setParticipantsLoading(false);
    }
  };

  // ✅ При открытии: сброс + первая страница участников (ТОЛЬКО ОДИН РАЗ)
  useEffect(() => {
    if (!isOpen) return;

    hardResetAll();

    // Загружаем первую страницу ТОЛЬКО при открытии
    // (ни для create, ни для edit не важно — usages всегда нужны)
    loadParticipantsPage(0);
  }, [isOpen, eventId]); // ✅ убрали mode из deps

  // Observer (infinite scroll)
  useEffect(() => {
    if (!isOpen) return;
    if (!sentinelRef.current) return;

    observerRef.current?.disconnect();
    observerRef.current = null;

    const el = sentinelRef.current;

    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0];
        if (!first?.isIntersecting) return;
        if (!hasMore) return;
        loadParticipantsPage(offset);
      },
      {
        root: null,
        threshold: 0,
        rootMargin: '200px 0px 200px 0px',
      }
    );

    observer.observe(el);
    observerRef.current = observer;

    return () => {
      observer.disconnect();
      observerRef.current = null;
    };
  }, [isOpen, offset, hasMore, eventId]); // ✅ добавили eventId для стабильности

  // ✅ Предзаполнение в edit-режиме (НЕ трогаем participants)
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
          purchase = await purchaseService.getPurchaseById(eventId, purchaseId);
        }

        if (cancelled || !purchase) return;

        const mapped = mapGetPurchaseToForm(purchase);
        setName(mapped.name);
        setCost(mapped.cost);

        // ВАЖНО: buyerParticipantId предзаполняем, но UI не показываем и в payload edit не отправляем
        setBuyerParticipantId(mapped.buyerParticipantId);

        setUsages(mapped.usages);
      } catch (e: unknown) {
        if (cancelled) return;
        setError(getErrorMessage(e, 'Не удалось загрузить покупку для редактирования.'));
      } finally {
        if (!cancelled) setPurchaseLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, mode, eventId, props.initialPurchase, props.purchaseId]); // ✅ точные deps

  const addUsageRow = () => {
    const firstParticipantId = participants[0]?.id ?? '';
    setUsages((prev) => [...prev, { participantId: firstParticipantId, amount: 1 }]);
  };

  const updateUsageRow = (index: number, patch: Partial<UsageRow>) => {
    setUsages((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));
  };

  const removeUsageRow = (index: number) => {
    setUsages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    if (!canSubmit) return;

    try {
      setIsSaving(true);
      setError(null);

      const purchaseUsages: UpsertPurchaseUsageEntry[] = usages
        .filter((u) => u.participantId && u.amount > 0)
        .map((u) => ({ participantId: u.participantId, amount: u.amount }));

      if (mode === 'create') {
        const payload: AddPurchaseEntry = {
          name: name.trim(),
          cost,
          participantId: buyerParticipantId,
          purchaseUsages,
        };

        const created = await purchaseService.createPurchase(eventId, payload);
        if (!created?.id) throw new Error('Пустой ответ от API при создании покупки (нет id).');

        props.onCreated(created);
        onClose();
        return;
      }

      // edit (participantId НЕ отправляем)
      const purchaseId = props.purchaseId;

      const payload: UpdatePurchaseEntry = {
        name: name.trim(),
        cost,
        purchaseUsages,
      };

      const updated = await purchaseService.editPurchaseById(eventId, purchaseId, payload);
      if (!updated?.id) throw new Error('Пустой ответ от API при обновлении покупки (нет id).');

      props.onUpdated(updated);
      onClose();
    } catch (e: unknown) {
      setError(
        getErrorMessage(
          e,
          mode === 'edit' ? 'Не удалось обновить покупку.' : 'Не удалось добавить покупку.'
        )
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.backdrop} onMouseDown={onClose} role="presentation">
      <div
        className={styles.modal}
        onMouseDown={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={mode === 'edit' ? 'Редактировать покупку' : 'Добавить покупку'}
      >
        <div className={styles.header}>
          <h2 className={styles.title}>
            {mode === 'edit' ? 'Изменить покупку' : 'Добавить покупку'}
          </h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <div className={styles.modalBody}>
          {error && <div className={styles.error}>{error}</div>}

          {purchaseLoading && mode === 'edit' && (
            <div className={styles.hint}>Загружаем данные покупки...</div>
          )}

          <label className={styles.label}>
            Название
            <input
              className={styles.input}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Например: Пицца"
              autoFocus
              disabled={purchaseLoading}
            />
          </label>

          <label className={styles.label}>
            Цена (₽)
            <input
              className={styles.input}
              type="number"
              min={0}
              step="1"
              value={Number.isFinite(cost) ? cost : 0}
              onChange={(e) => setCost(Number(e.target.value))}
              disabled={purchaseLoading}
            />
          </label>

          {/* ВАЖНО: в edit не показываем participantId */}
          {mode === 'create' && (
            <div className={styles.label}>
              Кто купил
              <div className={styles.participantsBox}>
                {participants.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    className={
                      buyerParticipantId === p.id
                        ? styles.participantRowActive
                        : styles.participantRow
                    }
                    onClick={() => setBuyerParticipantId(p.id)}
                    disabled={purchaseLoading}
                  >
                    <span className={styles.participantRowName}>
                      {p.name ?? 'Без имени'}
                    </span>
                    {buyerParticipantId === p.id && <span>✓</span>}
                  </button>
                ))}

                {participantsError && (
                  <div className={styles.errorInline}>{participantsError}</div>
                )}

                <div ref={sentinelRef} />

                {participantsLoading && (
                  <div className={styles.hint}>Загружаем участников...</div>
                )}

                {!participantsLoading && participants.length === 0 && !participantsError && (
                  <div className={styles.hint}>Участников нет.</div>
                )}

                {!participantsLoading && participants.length > 0 && !hasMore && (
                  <div className={styles.hint}>Больше участников нет.</div>
                )}
              </div>
            </div>
          )}

          <div className={styles.usageHeader}>
            <div className={styles.usageTitle}>Использования (опционально)</div>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={addUsageRow}
              disabled={participants.length === 0 || purchaseLoading}
            >
              + Добавить
            </button>
          </div>

          {usages.length === 0 && (
            <div className={styles.hint}>Можно не заполнять — список пуст.</div>
          )}

          {usages.map((row, idx) => (
            <div key={`${row.participantId}-${idx}`} className={styles.usageRow}>
              <select
                className={styles.select}
                value={row.participantId}
                onChange={(e) => updateUsageRow(idx, { participantId: e.target.value })}
                disabled={purchaseLoading}
              >
                <option value="" disabled>
                  Выберите участника
                </option>
                {participants.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name ?? 'Без имени'}
                  </option>
                ))}
              </select>

              <input
                className={styles.input}
                type="number"
                min={1}
                step="1"
                value={row.amount}
                onChange={(e) => updateUsageRow(idx, { amount: Number(e.target.value) })}
                disabled={purchaseLoading}
              />

              <button
                type="button"
                className={styles.deleteButton}
                onClick={() => removeUsageRow(idx)}
                title="Удалить строку"
                disabled={purchaseLoading}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose} type="button">
            Отмена
          </button>

          <button
            className={styles.primaryBtn}
            onClick={handleSave}
            type="button"
            disabled={!canSubmit || isSaving || participantsLoading}
          >
            {isSaving ? 'Сохраняем...' : mode === 'edit' ? 'Сохранить' : 'Создать'}
          </button>
        </div>
      </div>
    </div>
  );
};
