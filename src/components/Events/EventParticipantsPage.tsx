import React from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import type { ParticipantShortEntry } from '@/api';
import styles from './Event.module.css';

type RouteParams = {
  id: string;
};

type LocationState = {
  participants?: ParticipantShortEntry[];
};

export const EventParticipantsPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const location = useLocation();
  const state = location.state as LocationState | null;
  const participants = state?.participants ?? [];

  const handleAddParticipant = () => {
    alert('Добавить участника (заглушка)');
  };

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link
            to={`/events/${id}`}
            className={styles.backLink}
          >
            ← Назад к ивенту
          </Link>
        </div>

        {/* узкий блок */}
        <div className={styles.narrow}>
          <h1 className={styles.sectionTitle}>Участники</h1>

          <button
            type="button"
            onClick={handleAddParticipant}
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
            {participants.map(p => (
              <li key={p.id} className={styles.listItem}>
                <div className={styles.avatar} />
                <span>{p.name || 'Без имени'}</span>
              </li>
            ))}
          </ul>

          {!state && (
            <p className={styles.hintText}>
              Страница открыта без state — вернитесь на детальную ивента и
              зайдите повторно.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};
