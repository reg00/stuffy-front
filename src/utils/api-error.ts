// utils/api-error.ts
import type { ApiError } from '../api';

/**
 * Type guard для проверки, является ли объект ApiError
 */
export function isApiError(error: unknown): error is ApiError {
  if (typeof error !== 'object' || error === null) return false;
  
  const err = error as Record<string, unknown>;
  
  // Проверяем структуру ApiError
  // Адаптируйте проверки под структуру вашего ApiError
  return (
    (typeof err.message === 'string' || typeof err.message === 'undefined') &&
    (typeof err.code === 'string' || typeof err.code === 'number' || typeof err.code === 'undefined') &&
    (typeof err.statusCode === 'number' || typeof err.statusCode === 'undefined')
  );
}

export function getErrorMessage(e: unknown, fallback: string): string {
  // 1) Твой формат API-ошибки (если есть message/status и т.п.)
  if (isApiError(e)) {
    return e.message || fallback;
  }

  // 2) Обычный JS Error
  if (e instanceof Error) {
    return e.message || fallback;
  }

  // 3) Иногда кидают строку
  if (typeof e === 'string') {
    return e || fallback;
  }

  // 4) Иногда кидают объект вида { message: '...' }
  if (e && typeof e === 'object' && 'message' in e) {
    const msg = (e as { message?: unknown }).message;
    if (typeof msg === 'string' && msg.trim().length > 0) return msg;
  }

  return fallback;
}