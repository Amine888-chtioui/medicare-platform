import axios from 'axios';
import type { ApiResponse } from '@/types';

/**
 * Extracts a user-facing message from an API error without leaking internals.
 * Falls back to a generic translated message when the server is unreachable.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as ApiResponse<unknown> | undefined;

    if (data && typeof data === 'object') {
      // Bean Validation errors are returned inside `data` as field -> message.
      // Prefer the precise field message over the generic envelope message.
      if (data.data && typeof data.data === 'object') {
        const firstMessage = Object.values(data.data as Record<string, unknown>).find(
          (value): value is string => typeof value === 'string' && value.trim().length > 0
        );
        if (firstMessage) return firstMessage;
      }
      if (typeof data.message === 'string' && data.message.trim()) {
        return data.message;
      }
    }

    if (!error.response) {
      return fallback;
    }
  }

  return fallback;
}

export function isUnauthorized(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 401;
}

export function isRateLimited(error: unknown): boolean {
  return axios.isAxiosError(error) && error.response?.status === 429;
}
