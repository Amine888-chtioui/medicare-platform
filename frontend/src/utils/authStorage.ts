/**
 * Session storage for the admin JWT.
 *
 * The token is kept in sessionStorage (not localStorage) so that closing the
 * browser ends the session. The expiry is stored next to it to avoid sending
 * obviously expired tokens and to redirect the user cleanly.
 */

const TOKEN_KEY = 'medicare_token';
const EXPIRY_KEY = 'medicare_token_expires_at';
const USERNAME_KEY = 'medicare_username';

/** Small safety margin so a token does not expire mid-request. */
const EXPIRY_LEEWAY_MS = 30_000;

export interface StoredSession {
  token: string;
  expiresAt: number;
  username: string;
}

export function setSession(token: string, expiresInSeconds: number, username: string): void {
  const expiresAt = Date.now() + Math.max(0, expiresInSeconds) * 1000;
  sessionStorage.setItem(TOKEN_KEY, token);
  sessionStorage.setItem(EXPIRY_KEY, String(expiresAt));
  sessionStorage.setItem(USERNAME_KEY, username);
}

export function clearSession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(EXPIRY_KEY);
  sessionStorage.removeItem(USERNAME_KEY);
}

export function getToken(): string | null {
  const token = sessionStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  const expiresAt = Number(sessionStorage.getItem(EXPIRY_KEY));
  if (Number.isFinite(expiresAt) && expiresAt > 0) {
    if (Date.now() >= expiresAt - EXPIRY_LEEWAY_MS) {
      clearSession();
      return null;
    }
    return token;
  }

  // Backward compatibility: sessions created before expiry storage existed.
  const decodedExpiry = decodeJwtExpiry(token);
  if (decodedExpiry && Date.now() >= decodedExpiry - EXPIRY_LEEWAY_MS) {
    clearSession();
    return null;
  }
  return token;
}

export function getUsername(): string | null {
  return sessionStorage.getItem(USERNAME_KEY);
}

export function isAuthenticated(): boolean {
  return getToken() !== null;
}

function decodeJwtExpiry(token: string): number | null {
  try {
    const payload = token.split('.')[1];
    if (!payload) return null;
    const normalized = payload.replace(/-/g, '+').replace(/_/g, '/');
    const json = decodeURIComponent(
      atob(normalized)
        .split('')
        .map((char) => `%${`00${char.charCodeAt(0).toString(16)}`.slice(-2)}`)
        .join('')
    );
    const parsed = JSON.parse(json) as { exp?: number };
    return typeof parsed.exp === 'number' ? parsed.exp * 1000 : null;
  } catch {
    return null;
  }
}
