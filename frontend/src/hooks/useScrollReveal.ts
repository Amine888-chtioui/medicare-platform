import { useEffect, useRef, RefObject } from 'react';

/**
 * useScrollReveal — attaches a `.visible` class when the element enters the viewport.
 * Works with CSS classes: .reveal, .reveal-left, .reveal-right, .reveal-scale
 *
 * @param threshold  fraction of element that must be visible (default 0.12)
 * @param rootMargin IntersectionObserver rootMargin (default '0px 0px -60px 0px')
 */
export function useScrollReveal<T extends HTMLElement>(
  threshold = 0.12,
  rootMargin = '0px 0px -60px 0px'
): RefObject<T> {
  const ref = useRef<T>(null!);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          el.classList.add('visible');
          // Once revealed, stop observing
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return ref;
}
