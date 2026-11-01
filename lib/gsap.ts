import { useEffect, useLayoutEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

// Register once, client side only.
if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

/** useLayoutEffect on the client, useEffect during static rendering (no SSR warning). */
export const useIsoLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

/** Shared easing so every motion in the site feels like the same hand. */
export const EASE = 'power3.out';

export const MOTION_OK = '(prefers-reduced-motion: no-preference)';

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** True for a real mouse/trackpad. Hover effects are skipped on touch screens. */
export function hasFinePointer(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false;
  return window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export { gsap, ScrollTrigger };
