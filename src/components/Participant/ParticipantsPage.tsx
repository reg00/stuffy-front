// src/pages/events/EventParticipantsPage.tsx
import React, { useMemo, useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { ParticipantShortEntry } from '../../api';
import styles from './Participant.module.css';
import { participantService } from '../../services/patricipant-service';
import { AddParticipantModal } from './AddParticipantModal';

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
    [state]
  );

  const [participants, setParticipants] = useState<ParticipantShortEntry[]>(
    initialParticipants
  );

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!eventId) return null;

  const handleDelete = async (participantId: string) => {
    const ok = window.confirm('Удалить участника?');
    if (!ok) return;

    try {
      setDeletingId(participantId);
      await participantService.deleteParticipant(eventId, participantId);

      setParticipants((prev) => prev.filter((p) => p.id !== participantId));
    } finally {
      setDeletingId(null);
    }
  };

  const handleCreated = (createdParticipantId?: string) => {
    // Если бэкенд возвращает короткую сущность участника — лучше передавать её и добавлять в список.
    // Сейчас у нас есть только id, поэтому можно:
    // 1) ничего не делать и попросить пользователя перезайти на страницу
    // 2) или сделать fetch по id и добавить полноценно
    // Покажу вариант с дозагрузкой.
    if (!createdParticipantId) return;

    (async () => {
      try {
        const full = await participantService.getParticipantById(
          eventId,
          createdParticipantId
        );

        setParticipants((prev) => [
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
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link to={`/events/${eventId}`} className={styles.backLink}>
            ← Назад к ивенту
          </Link>
        </div>

        <div className={styles.narrow}>
          <h1 className={styles.sectionTitle}>Участники</h1>

          <button
            type="button"
            onClick={() => setIsAddOpen(true)}
            className={styles.addButton}
          >
            + Добавить участника
          </button>

          {participants.length === 0 && (
            <p className={styles.emptyText}>
              Участников пока нет. Добавьте первого.
            </p>
          )}

          <ul className={styles.list}>
            {participants.map((p) => (
              <li key={p.id} className={styles.listItem}>
                <div className={styles.avatar} />
                <span className={styles.participantName}>
                  {p.name || 'Без имени'}
                </span>

                <button
                  type="button"
                  className={styles.iconButton}
                  onClick={() => handleDelete(p.id)}
                  disabled={deletingId === p.id}
                  aria-label="Удалить участника"
                  title="Удалить"
                >
                  {deletingId === p.id ? '...' : '🗑️'}
                </button>
              </li>
            ))}
          </ul>

          {!state && (
            <p className={styles.hintText}>
              Страница открыта без state — вернитесь на детальную ивента и зайдите повторно.
            </p>
          )}
        </div>
      </div>

      <AddParticipantModal
        eventId={eventId}
        isOpen={isAddOpen}
        onClose={() => setIsAddOpen(false)}
        onCreated={handleCreated}
      />
    </div>
  );
};
