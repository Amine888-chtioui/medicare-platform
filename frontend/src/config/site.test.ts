import { describe, expect, it } from 'vitest';
import { isConfigured, telHref, whatsappHref } from '@/config/site';

describe('isConfigured', () => {
  it('accepts a real value', () => {
    expect(isConfigured('+212 6 12 34 56 78')).toBe(true);
  });

  it('rejects empty, blank and placeholder values', () => {
    expect(isConfigured(undefined)).toBe(false);
    expect(isConfigured('')).toBe(false);
    expect(isConfigured('   ')).toBe(false);
    expect(isConfigured('[À CONFIRMER]')).toBe(false);
    expect(isConfigured('todo')).toBe(false);
    expect(isConfigured('CHANGEME')).toBe(false);
  });
});

describe('contact link builders', () => {
  it('builds a tel link without formatting characters', () => {
    expect(telHref('+212 6 12-34-56-78')).toBe('tel:+212612345678');
  });

  it('builds a WhatsApp link with digits only', () => {
    expect(whatsappHref('+212 (6) 12 34 56 78')).toBe('https://wa.me/212612345678');
  });
});
