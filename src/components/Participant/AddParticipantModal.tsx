// src/components/AddParticipantModal/AddParticipantModal.tsx
import React, { useEffect, useMemo, useState } from 'react';
import type { UserShortEntry } from '../../api';
import { authService } from '../../services/auth-service';
import { participantService } from '../../services/patricipant-service';
import { useDebounce } from '../../hooks/useDebounce';
import { isApiError } from '../../utils/api-error';
import styles from './Participant.module.css';

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

  // 1) Первичная загрузка — сразу при открытии модалки (без ввода)
  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsSearching(true);
        setSelectedUserId('');

        // ВАЖНО: начальная загрузка без query
        const data = await authService.getUsers(undefined);

        if (cancelled) return;
        setUsers((data ?? []).filter((u): u is UserShortEntry => Boolean(u && u.id)));
      } catch (e) {
        if (cancelled) return;
        setError(getErrorMessage(e, 'Не удалось загрузить пользователей.'));
        setUsers([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  // 2) Debounced поиск — только когда пользователь что-то ввёл
  useEffect(() => {
    if (!isOpen) return;
    if (!hasQuery) return; // если поле пустое — показываем первичный список

    let cancelled = false;

    (async () => {
      try {
        setError(null);
        setIsSearching(true);
        setSelectedUserId('');

        const data = await authService.getUsers(trimmed);

        if (cancelled) return;
        setUsers((data ?? []).filter((u): u is UserShortEntry => Boolean(u && u.id)));
      } catch (e) {
        if (cancelled) return;
        setError(getErrorMessage(e, 'Не удалось выполнить поиск пользователей.'));
        setUsers([]);
      } finally {
        if (!cancelled) setIsSearching(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [isOpen, hasQuery, trimmed]);

  // Esc закрывает модалку
  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const handleCreate = async () => {
    if (!selectedUserId) return;

    try {
      setIsCreating(true);
      setError(null);

      const created = await participantService.createParticipant(eventId, {
        userId: selectedUserId,
      });

      // защита от undefined, чтобы не падать чтением created.id
      if (!created?.id) {
        throw new Error('Пустой ответ от API при добавлении участника (нет id).');
      }

      onCreated(created.id);
      onClose();

      setQuery('');
      setUsers([]);
      setSelectedUserId('');
    } catch (e) {
      setError(getErrorMessage(e, 'Не удалось добавить участника.'));
    } finally {
      setIsCreating(false);
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
        aria-label="Добавить участника"
      >
        <div className={styles.header}>
          <h2 className={styles.title}>Добавить участника</h2>
          <button className={styles.closeBtn} onClick={onClose} type="button">
            ✕
          </button>
        </div>

        <label className={styles.label}>
          Поиск пользователя
          <input
            className={styles.input}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Начните вводить имя..."
            autoFocus
          />
        </label>

        {error && <div className={styles.error}>{error}</div>}

        <div className={styles.results}>
          {isSearching && <div className={styles.hint}>Ищем...</div>}

          {!isSearching && users.length === 0 && (
            <div className={styles.hint}>
              {hasQuery ? 'Ничего не найдено.' : 'Список пуст.'}
            </div>
          )}

          {users.map((u) => (
            <label key={u.id} className={styles.userRow}>
              <input
                type="radio"
                name="user"
                value={u.id!}
                checked={selectedUserId === u.id}
                onChange={() => setSelectedUserId(u.id!)}
              />
              <span className={styles.userName}>{u.name ?? u.id}</span>
            </label>
          ))}
        </div>

        <div className={styles.footer}>
          <button className={styles.secondaryBtn} onClick={onClose} type="button">
            Отмена
          </button>
          <button
            className={styles.primaryBtn}
            onClick={handleCreate}
            type="button"
            disabled={!selectedUserId || isCreating}
          >
            {isCreating ? 'Создаём...' : 'Добавить'}
          </button>
        </div>
      </div>
    </div>
  );
};
