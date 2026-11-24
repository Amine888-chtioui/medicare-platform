import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { lockScroll, unlockScroll } from './useScrollLock';

describe('Global Scroll Lock', () => {
  beforeEach(() => {
    // Reset styles
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';

    // Clear any residual locks
    while (document.body.style.overflow === 'hidden') {
      unlockScroll();
    }
  });

  afterEach(() => {
    document.body.style.overflow = '';
    document.documentElement.style.overflow = '';
    document.body.style.paddingRight = '';
  });

  it('locks body and html overflow when lockScroll is invoked', () => {
    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');

    lockScroll();

    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    unlockScroll();

    expect(document.body.style.overflow).toBe('');
    expect(document.documentElement.style.overflow).toBe('');
  });

  it('supports nested modals using reference counting', () => {
    // Modal A opens
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');

    // Modal B opens on top of Modal A
    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');

    // Modal B closes -> body MUST remain locked because Modal A is still open
    unlockScroll();
    expect(document.body.style.overflow).toBe('hidden');

    // Modal A closes -> now body is unlocked
    unlockScroll();
    expect(document.body.style.overflow).toBe('');
  });

  it('preserves existing pre-lock styles and restores them on unlock', () => {
    document.body.style.overflow = 'visible';
    document.documentElement.style.overflow = 'auto';

    lockScroll();
    expect(document.body.style.overflow).toBe('hidden');
    expect(document.documentElement.style.overflow).toBe('hidden');

    unlockScroll();
    expect(document.body.style.overflow).toBe('visible');
    expect(document.documentElement.style.overflow).toBe('auto');
  });

  it('prevents wheel events on non-scrollable backdrops while locked', () => {
    lockScroll();

    const backdrop = document.createElement('div');
    document.body.appendChild(backdrop);

    const wheelEvent = new WheelEvent('wheel', { bubbles: true, cancelable: true });
    const preventDefaultSpy = vi.spyOn(wheelEvent, 'preventDefault');

    backdrop.dispatchEvent(wheelEvent);
    expect(preventDefaultSpy).toHaveBeenCalled();

    unlockScroll();
    document.body.removeChild(backdrop);
  });

  it('prevents navigation keys outside form inputs on non-scrollable backdrops while locked', () => {
    lockScroll();

    const backdrop = document.createElement('div');
    document.body.appendChild(backdrop);

    // Space key on backdrop should be prevented
    const spaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    const preventSpace = vi.spyOn(spaceEvent, 'preventDefault');
    backdrop.dispatchEvent(spaceEvent);
    expect(preventSpace).toHaveBeenCalled();

    // ArrowDown key on backdrop should be prevented
    const downEvent = new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true });
    const preventDown = vi.spyOn(downEvent, 'preventDefault');
    backdrop.dispatchEvent(downEvent);
    expect(preventDown).toHaveBeenCalled();

    // Keydown in input element must NOT be prevented
    const input = document.createElement('input');
    backdrop.appendChild(input);
    const inputSpaceEvent = new KeyboardEvent('keydown', { key: ' ', bubbles: true, cancelable: true });
    const preventInputSpace = vi.spyOn(inputSpaceEvent, 'preventDefault');
    input.dispatchEvent(inputSpaceEvent);
    expect(preventInputSpace).not.toHaveBeenCalled();

    unlockScroll();
    document.body.removeChild(backdrop);
  });
});
