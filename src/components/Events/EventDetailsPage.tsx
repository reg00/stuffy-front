import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { eventsService } from '../../services/event-service';
import type { GetEventEntry } from '../../api';
import styles from './Event.module.css';

type RouteParams = {
  id: string;
};

const FALLBACK_IMAGE =
  'https://via.placeholder.com/120x120.png?text=+';

export const EventDetailsPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const navigate = useNavigate();
  const [event, setEvent] = useState<GetEventEntry | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadEvent = async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      setError(null);
      const data = await eventsService.getEventById(id);
      setEvent(data);
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось загрузить событие';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEvent();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>,
  ) => {
    e.currentTarget.src = FALLBACK_IMAGE;
  };

  const handleFinishEvent = () => {
    alert('Завершение ивента (заглушка)');
  };

  if (!id) {
    return <p>Некорректный идентификатор события.</p>;
  }

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <div className={styles.backRow}>
          <Link to="/events" className={styles.backLink}>
            ← Назад к событиям
          </Link>
        </div>

        {isLoading && <p>Загружаем событие...</p>}

        {error && (
          <div className={styles.error}>
            {error}
            <button
              className="secondary"
              style={{ marginLeft: 8 }}
              onClick={loadEvent}
            >
              Повторить
            </button>
          </div>
        )}

        {!isLoading && !error && event && (
          <>
            <div className={styles.header}>
              <div className={styles.cover}>
                {event.mediaUri ? (
                  <img
                    src={event.mediaUri}
                    alt={event.name}
                    onError={handleImageError}
                    className={styles.coverImg}
                  />
                ) : (
                  <span className={styles.coverPlaceholder}>+</span>
                )}
              </div>

              <div className={styles.headerInfo}>
                <h1 className={styles.title}>{event.name}</h1>

                <div className={styles.meta}>
                  <span>
                    {new Date(event.eventDateStart).toLocaleDateString()}
                  </span>
                  <span>•</span>
                  <span>
                    {event.user?.name ?? 'Админ'}
                    {event.user && ' (админ)'}
                  </span>
                </div>

                {event.description && (
                  <p className={styles.description}>{event.description}</p>
                )}
              </div>
            </div>

            <div className={styles.sections}>
              <button
                type="button"
                className={styles.sectionBtn}
                onClick={() =>
                  navigate(`/events/${id}/participants`, {
                    state: { participants: event.participants ?? [] },
                  })
                }
              >
                <div className={styles.sectionLeft}>
                  <div className={styles.iconRound} />
                  <span className={styles.sectionLabel}>Участники</span>
                </div>
                <span className={styles.sectionArrow}>›</span>
              </button>

              <button
                type="button"
                className={styles.sectionBtn}
                onClick={() =>
                  navigate(`/events/${id}/purchases`, {
                    state: { purchases: event.purchases ?? [] },
                  })
                }
              >
                <div className={styles.sectionLeft}>
                  <div className={styles.iconSquare} />
                  <span className={styles.sectionLabel}>Покупки</span>
                </div>
                <span className={styles.sectionArrow}>›</span>
              </button>
            </div>

            <div className={styles.finishWrap}>
              <button
                type="button"
                className={styles.finishBtn}
                onClick={handleFinishEvent}
              >
                Завершить ивент
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
