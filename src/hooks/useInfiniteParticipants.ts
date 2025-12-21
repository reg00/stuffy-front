// src/hooks/useInfiniteParticipants.ts
import { useCallback, useEffect, useRef, useState } from 'react';
import type { ParticipantShortEntry } from '../api';
import { participantService } from '../services/patricipant-service';

type Args = {
  eventId: string;
  limit?: number;
  userId?: string; // если хочешь фильтрацию
  enabled: boolean;
};

export function useInfiniteParticipants({ eventId, limit = 20, userId, enabled }: Args) {
  const [items, setItems] = useState<ParticipantShortEntry[]>([]);
  const [offset, setOffset] = useState(0);

  const [totalPages, setTotalPages] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // чтобы не было двойной загрузки одной и той же страницы
  const inFlightRef = useRef(false);

  const hasMore = totalPages === null ? true : offset / limit + 1 < totalPages;

  const reset = useCallback(() => {
    setItems([]);
    setOffset(0);
    setTotalPages(null);
    setError(null);
    inFlightRef.current = false;
  }, []);

  const loadNext = useCallback(async () => {
    if (!enabled) return;
    if (loading) return;
    if (inFlightRef.current) return;
    if (!hasMore) return;

    try {
      inFlightRef.current = true;
      setLoading(true);
      setError(null);

      const resp = await participantService.getPartcipants(eventId, offset, limit, userId);

      const pageItems = resp.data ?? [];
      setItems((prev) => [...prev, ...pageItems]);
      setTotalPages(resp.totalPages ?? 1);
      setOffset((prev) => prev + limit);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : 'Не удалось загрузить участников.';
      setError(msg);
    } finally {
      inFlightRef.current = false;
      setLoading(false);
    }
  }, [enabled, eventId, offset, limit, userId, hasMore, loading]);

  // начальная загрузка
  useEffect(() => {
    if (!enabled) return;
    reset();
    // после reset offset=0, но state обновится асинхронно — проще вызвать loadNext в отдельном тике:
    // здесь можно просто вызывать participantService с offset=0 напрямую, но оставлю проще:
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    (async () => {
      await new Promise((r) => setTimeout(r, 0));
      await loadNext();
    })();
    // reset специально не включаем в deps, чтобы не закольцевать
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [enabled, eventId, userId, limit]);

  return { items, loadNext, reset, loading, error, hasMore };
}
