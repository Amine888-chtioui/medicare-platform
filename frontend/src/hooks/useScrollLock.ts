import { useEffect } from 'react';

/**
 * Global Scroll Lock Manager
 * - Reference-counted: supports multiple/nested modals without race conditions
 * - Layout-shift protected: compensates for scrollbar width when locked
 * - Event-contained: stops wheel, touchpad, touch gestures, and keyboard navigation
 *   from scrolling the background page while allowing modal content to scroll freely.
 */

let lockCount = 0;
let originalBodyOverflow = '';
let originalHtmlOverflow = '';
let originalBodyPaddingRight = '';

const SCROLL_KEYS = new Set([
  ' ', // Space
  'PageUp',
  'PageDown',
  'End',
  'Home',
  'ArrowLeft',
  'ArrowUp',
  'ArrowRight',
  'ArrowDown',
]);

/**
 * Checks whether an element can scroll along the Y or X axis.
 */
function isScrollableElement(el: HTMLElement | null): boolean {
  if (!el || el === document.body || el === document.documentElement) {
    return false;
  }
  const style = window.getComputedStyle(el);
  const overflowY = style.overflowY;
  const overflowX = style.overflowX;

  const canScrollY =
    (overflowY === 'auto' || overflowY === 'scroll' || overflowY === 'overlay') &&
    el.scrollHeight > el.clientHeight;

  const canScrollX =
    (overflowX === 'auto' || overflowX === 'scroll' || overflowX === 'overlay') &&
    el.scrollWidth > el.clientWidth;

  return canScrollY || canScrollX;
}

/**
 * Traverses up the DOM tree from the event target to find if any container is scrollable.
 */
function hasScrollableAncestor(target: EventTarget | null): boolean {
  let curr = target as HTMLElement | null;
  while (curr && curr !== document.body && curr !== document.documentElement) {
    if (isScrollableElement(curr)) {
      return true;
    }
    curr = curr.parentElement;
  }
  return false;
}

/**
 * Prevents navigation keys (Space, PageUp, Arrows, etc.) from scrolling the underlying page
 * unless the user is actively focused in an input/textarea/select or inside a scrollable container.
 */
function handleGlobalKeyDown(e: KeyboardEvent): void {
  if (!SCROLL_KEYS.has(e.key)) return;

  const target = e.target as HTMLElement | null;
  if (!target) return;

  // Allow standard typing in form controls
  const tagName = target.tagName;
  if (
    tagName === 'INPUT' ||
    tagName === 'TEXTAREA' ||
    tagName === 'SELECT' ||
    target.isContentEditable
  ) {
    return;
  }

  // Allow keyboard navigation inside scrollable modal contents
  if (hasScrollableAncestor(target)) {
    return;
  }

  // Prevent background page from scrolling
  e.preventDefault();
}

/**
 * Prevents wheel scrolling when the cursor is over non-scrollable backdrops or static modal headers.
 */
function handleGlobalWheel(e: WheelEvent): void {
  const target = e.target as HTMLElement | null;
  if (!hasScrollableAncestor(target)) {
    e.preventDefault();
  }
}

/**
 * Prevents touch dragging (mobile/touchpad rubberbanding) over non-scrollable backdrops.
 */
function handleGlobalTouchMove(e: TouchEvent): void {
  const target = e.target as HTMLElement | null;
  if (!hasScrollableAncestor(target)) {
    if (e.cancelable) {
      e.preventDefault();
    }
  }
}

/**
 * Acquires a scroll lock. If this is the first active lock, locks html/body and compensates scrollbar.
 */
export function lockScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  if (lockCount === 0) {
    // 1. Capture original style values
    originalBodyOverflow = document.body.style.overflow;
    originalHtmlOverflow = document.documentElement.style.overflow;
    originalBodyPaddingRight = document.body.style.paddingRight;

    // 2. Calculate scrollbar width to prevent layout shift
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      const existingPadding = parseFloat(window.getComputedStyle(document.body).paddingRight) || 0;
      document.body.style.paddingRight = `${existingPadding + scrollbarWidth}px`;
    }

    // 3. Lock document scrolling
    document.body.style.overflow = 'hidden';
    document.documentElement.style.overflow = 'hidden';

    // 4. Attach event listeners
    window.addEventListener('keydown', handleGlobalKeyDown, { passive: false });
    window.addEventListener('wheel', handleGlobalWheel, { passive: false });
    window.addEventListener('touchmove', handleGlobalTouchMove, { passive: false });
  }

  lockCount++;
}

/**
 * Releases a scroll lock. When all locks are released, restores original document styles and listeners.
 */
export function unlockScroll(): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;

  lockCount = Math.max(0, lockCount - 1);

  if (lockCount === 0) {
    // 1. Restore styles
    document.body.style.overflow = originalBodyOverflow;
    document.documentElement.style.overflow = originalHtmlOverflow;
    document.body.style.paddingRight = originalBodyPaddingRight;

    // 2. Remove listeners
    window.removeEventListener('keydown', handleGlobalKeyDown);
    window.removeEventListener('wheel', handleGlobalWheel);
    window.removeEventListener('touchmove', handleGlobalTouchMove);
  }
}

/**
 * React hook to lock background scrolling whenever `isLocked` is true.
 * Automatically unlocks when `isLocked` becomes false or when the component unmounts.
 */
export function useScrollLock(isLocked: boolean): void {
  useEffect(() => {
    if (!isLocked) return;

    lockScroll();

    return () => {
      unlockScroll();
    };
  }, [isLocked]);
}
