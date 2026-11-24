import { describe, expect, it } from 'vitest';
import { getApiErrorMessage, isRateLimited, isUnauthorized } from '@/utils/errors';

function axiosError(status: number | undefined, data?: unknown) {
  return {
    isAxiosError: true,
    message: 'Request failed',
    response: status === undefined ? undefined : { status, data },
  };
}

describe('getApiErrorMessage', () => {
  it('prefers the first field validation message', () => {
    const error = axiosError(400, {
      success: false,
      message: 'Validation échouée',
      data: { fullName: 'Le nom est obligatoire', phoneNumber: 'Numéro invalide' },
    });

    expect(getApiErrorMessage(error, 'fallback')).toBe('Le nom est obligatoire');
  });

  it('falls back to the envelope message', () => {
    const error = axiosError(400, { success: false, message: 'Identifiants invalides' });

    expect(getApiErrorMessage(error, 'fallback')).toBe('Identifiants invalides');
  });

  it('uses the fallback for an unreachable server', () => {
    expect(getApiErrorMessage(axiosError(undefined), 'Service indisponible')).toBe(
      'Service indisponible'
    );
  });

  it('uses the fallback for unknown errors', () => {
    expect(getApiErrorMessage(new Error('boom'), 'Erreur')).toBe('Erreur');
    expect(getApiErrorMessage(null, 'Erreur')).toBe('Erreur');
  });

  it('ignores blank messages', () => {
    const error = axiosError(500, { success: false, message: '   ' });

    expect(getApiErrorMessage(error, 'fallback')).toBe('fallback');
  });
});

describe('status helpers', () => {
  it('detects 401 responses', () => {
    expect(isUnauthorized(axiosError(401))).toBe(true);
    expect(isUnauthorized(axiosError(403))).toBe(false);
    expect(isUnauthorized(new Error('nope'))).toBe(false);
  });

  it('detects 429 responses', () => {
    expect(isRateLimited(axiosError(429))).toBe(true);
    expect(isRateLimited(axiosError(400))).toBe(false);
  });
});
