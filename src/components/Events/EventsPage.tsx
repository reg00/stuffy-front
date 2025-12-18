import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { eventsService } from '../../services/event-service';
import type { EventShortEntry } from '@/api';

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
        // как только понимаем, что данных нет — отключаем observer
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
        return;
      }

      if (data.length < LIMIT) {
        hasMoreRef.current = false;
        setHasMore(false);
        if (observerRef.current) {
          observerRef.current.disconnect();
        }
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
    <div
      style={{
        padding: '16px',
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <div style={{ width: '100%', maxWidth: 1080 }}>
        <h1 style={{ margin: '0 0 16px' }}>События</h1>

        {error && (
          <div style={{ marginBottom: 12, color: 'var(--color-danger)' }}>
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
          <p style={{ color: 'var(--color-muted)' }}>Событий пока нет.</p>
        )}

        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 12,
          }}
        >
          {events.map(event => (
            <div
              key={event.id}
              style={{
                borderRadius: 18,
                border: '1px solid var(--color-border)',
                background: 'var(--color-bg-elevated)',
                padding: '10px 14px',
                boxShadow: '0 2px 8px rgba(15, 23, 42, 0.10)',
                display: 'flex',
                flexDirection: 'column',
                gap: 4,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <h2
                  style={{
                    margin: 0,
                    fontSize: 15,
                    fontWeight: 600,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}
                >
                  {event.name}
                </h2>

                <span
                  style={{
                    padding: '2px 8px',
                    borderRadius: 999,
                    fontSize: 11,
                    background: event.isCompleted
                      ? 'rgba(34, 197, 94, 0.12)'
                      : 'rgba(59, 130, 246, 0.12)',
                    color: event.isCompleted ? '#16a34a' : '#2563eb',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {event.isCompleted ? 'Завершено' : 'Активно'}
                </span>
              </div>

              {event.description && (
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    color: 'var(--color-muted)',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {event.description}
                </p>
              )}

              <p
                style={{
                  margin: 0,
                  fontSize: 12,
                  color: 'var(--color-muted)',
                }}
              >
                Начало: {new Date(event.eventDateStart).toLocaleString()}
              </p>
            </div>
          ))}
        </div>

        <div ref={sentinelRef} style={{ height: 1 }} />

        {isLoading && (
          <p style={{ marginTop: 12, fontSize: 13, color: 'var(--color-muted)' }}>
            Загружаем ещё...
          </p>
        )}
        {!hasMore && events.length > 0 && (
          <p style={{ marginTop: 12, fontSize: 12, color: 'var(--color-muted)' }}>
            Больше событий нет.
          </p>
        )}
      </div>
    </div>
  );
};
