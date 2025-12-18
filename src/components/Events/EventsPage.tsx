import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { Link } from 'react-router-dom';
import { eventsService } from '../../services/event-service';
import type { EventShortEntry } from '@/api';
import styles from './Event.module.css';

const LIMIT = 10;

export const EventsPage: React.FC = () => {
  const [events, setEvents] = useState<EventShortEntry[]>([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  const loadingRef = useRef(false);
  const hasMoreRef = useRef(true);
  const offsetRef = useRef(0);

  const loadEvents = useCallback(async () => {
    if (loadingRef.current || !hasMoreRef.current) return;

    loadingRef.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = offsetRef.current;
      const data = await eventsService.getEvents(currentOffset, LIMIT);

      if (!data.length) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
        return;
      }

      if (data.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) observerRef.current.disconnect();
      }

      setEvents(prev => [...prev, ...data]);

      const nextOffset = currentOffset + LIMIT;
      offsetRef.current = nextOffset;
    } catch (e: unknown) {
      const msg =
        e instanceof Error ? e.message : 'Не удалось загрузить события';
      setError(msg);
    } finally {
      loadingRef.current = false;
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadEvents();
  }, [loadEvents]);

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      entries => {
        const first = entries[0];
        if (!first.isIntersecting) return;
        if (loadingRef.current || !hasMoreRef.current) return;
        loadEvents();
      },
      {
        root: null,
        rootMargin: '150px',
        threshold: 0.1,
      },
    );

    const node = sentinelRef.current;
    if (node && observerRef.current) {
      observerRef.current.observe(node);
    }

    return () => {
      if (observerRef.current) observerRef.current.disconnect();
    };
  }, [loadEvents]);

  return (
    <div className={styles.page}>
      <div className={styles.container}>
        <h1 className={styles.eventsTitle}>События</h1>

        {error && (
          <div className={styles.error}>
            {error}
            <button
              className="secondary"
              style={{ marginLeft: 8 }}
              onClick={loadEvents}
            >
              Повторить
            </button>
          </div>
        )}

        {!events.length && !isLoading && !error && (
          <p className={styles.emptyText}>Событий пока нет.</p>
        )}

        <div className={styles.eventsList}>
          {events.map(event => (
            <Link
              key={event.id}
              to={`/events/${event.id}`}
              className={styles.eventCardLink}
            >
              <div className={styles.eventCard}>
                <div className={styles.eventCardHeader}>
                  <h2 className={styles.eventCardTitle}>{event.name}</h2>

                  <span
                    className={
                      event.isCompleted
                        ? styles.eventStatusDone
                        : styles.eventStatusActive
                    }
                  >
                    {event.isCompleted ? 'Завершено' : 'Активно'}
                  </span>
                </div>

                {event.description && (
                  <p className={styles.eventCardDescription}>
                    {event.description}
                  </p>
                )}

                <p className={styles.eventCardDate}>
                  Начало: {new Date(event.eventDateStart).toLocaleString()}
                </p>
              </div>
            </Link>
          ))}
        </div>

        <div ref={sentinelRef} className={styles.eventsSentinel} />

        {isLoading && (
          <p className={styles.eventsLoadingText}>Загружаем ещё...</p>
        )}
        {!hasMore && events.length > 0 && (
          <p className={styles.eventsEndText}>Больше событий нет.</p>
        )}
      </div>
    </div>
  );
};
