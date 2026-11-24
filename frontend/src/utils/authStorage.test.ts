import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';
import {
  clearSession,
  getToken,
  getUsername,
  isAuthenticated,
  setSession,
} from '@/utils/authStorage';

function base64Url(value: string): string {
  return btoa(value).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fakeJwt(expSecondsFromNow: number): string {
  const payload = base64Url(JSON.stringify({ sub: 'admin', exp: Math.floor(Date.now() / 1000) + expSecondsFromNow }));
  return `header.${payload}.signature`;
}

describe('authStorage', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and returns a valid session', () => {
    setSession('token-value', 3600, 'admin');

    expect(getToken()).toBe('token-value');
    expect(getUsername()).toBe('admin');
    expect(isAuthenticated()).toBe(true);
  });

  it('rejects and clears an expired session', () => {
    setSession('token-value', -10, 'admin');

    expect(getToken()).toBeNull();
    expect(getUsername()).toBeNull();
    expect(sessionStorage.getItem('medicare_token')).toBeNull();
  });

  it('rejects a session that expires within the safety margin', () => {
    setSession('token-value', 20, 'admin');

    expect(getToken()).toBeNull();
  });

  it('falls back to the JWT expiry when no expiry key is stored', () => {
    sessionStorage.setItem('medicare_token', fakeJwt(3600));

    expect(getToken()).not.toBeNull();
  });

  it('rejects a legacy JWT whose exp is in the past', () => {
    sessionStorage.setItem('medicare_token', fakeJwt(-60));

    expect(getToken()).toBeNull();
    expect(sessionStorage.getItem('medicare_token')).toBeNull();
  });

  it('keeps a legacy JWT with an unreadable payload', () => {
    sessionStorage.setItem('medicare_token', 'not-a-jwt');

    expect(getToken()).toBe('not-a-jwt');
  });

  it('clears every stored key', () => {
    setSession('token-value', 3600, 'admin');
    clearSession();

    expect(isAuthenticated()).toBe(false);
    expect(getUsername()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
});
