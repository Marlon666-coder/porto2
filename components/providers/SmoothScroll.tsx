'use client';

import { createContext, useContext, useEffect, useMemo, useRef, type ReactNode } from 'react';
import Lenis from 'lenis';
import { gsap, prefersReducedMotion, ScrollTrigger } from '@/lib/gsap';

interface ScrollApi {
  /** Scroll to a `#section` selector or a pixel offset. */
  scrollTo: (target: string | number) => void;
  /** Freeze page scroll (used by the menu and the image viewer). */
  stop: () => void;
  start: () => void;
}

/** Height of the fixed navigation bar, so sections don't land underneath it. */
const NAV_OFFSET = -72;

const ScrollContext = createContext<ScrollApi>({
  scrollTo: () => undefined,
  stop: () => undefined,
  start: () => undefined,
});

export function useSmoothScroll(): ScrollApi {
  return useContext(ScrollContext);
}

/**
 * The single scroll controller for the whole site.
 *
 * Lenis drives the scroll; GSAP's ticker drives Lenis; Lenis tells
 * ScrollTrigger whenever it moves. That one loop keeps scroll-linked
 * animations in step with the smoothed position. With reduced motion, Lenis is
 * never created and the browser's native scrolling is used.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (prefersReducedMotion()) return undefined;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
    });
    lenisRef.current = lenis;

    lenis.on('scroll', ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      lenisRef.current = null;
    };
  }, []);

  const api = useMemo<ScrollApi>(
    () => ({
      scrollTo(target) {
        const lenis = lenisRef.current;
        const element = typeof target === 'string' ? document.querySelector<HTMLElement>(target) : null;

        if (lenis) {
          lenis.scrollTo(element ?? target, { offset: NAV_OFFSET, duration: 1.3 });
        } else if (typeof target === 'number') {
          window.scrollTo({ top: target });
        } else if (element) {
          const top = element.getBoundingClientRect().top + window.scrollY + NAV_OFFSET;
          window.scrollTo({ top, behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
        }

        // Move keyboard focus with the scroll so Tab continues from the section.
        if (element) element.focus({ preventScroll: true });
      },
      stop() {
        lenisRef.current?.stop();
        document.documentElement.style.overflow = 'hidden';
      },
      start() {
        lenisRef.current?.start();
        document.documentElement.style.overflow = '';
      },
    }),
    [],
  );

  return <ScrollContext.Provider value={api}>{children}</ScrollContext.Provider>;
}
