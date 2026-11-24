import { describe, expect, it } from 'vitest';
import {
  formatDate,
  formatDateTime,
  formatShortDate,
  formatShortDay,
  resolveLocale,
} from '@/utils/date';

describe('date helpers', () => {
  it('maps supported languages and falls back to French', () => {
    expect(resolveLocale('fr')).toBe('fr-FR');
    expect(resolveLocale('ar')).toBe('ar-MA');
    expect(resolveLocale('en')).toBe('fr-FR');
  });

  it('formats a valid date', () => {
    const formatted = formatDate('2026-03-05T10:30:00', 'fr');

    expect(formatted).toContain('2026');
    expect(formatted).not.toBe('—');
  });

  it('returns a dash for invalid dates', () => {
    expect(formatDate('not-a-date', 'fr')).toBe('—');
    expect(formatDateTime('', 'ar')).toBe('—');
  });

  it('formats ISO day and month labels', () => {
    expect(formatShortDay('2026-03-05', 'fr')).not.toBe('2026-03-05');
    expect(formatShortDate('2026-03-05', 'fr')).toContain('05');
  });

  it('keeps the raw value when the ISO date is invalid', () => {
    expect(formatShortDay('bad', 'fr')).toBe('bad');
    expect(formatShortDate('bad', 'fr')).toBe('bad');
  });
});
