'use client';

import { useRef, type ReactNode } from 'react';
import { EASE, gsap, MOTION_OK, useIsoLayoutEffect } from '@/lib/gsap';

interface RevealProps {
  children: ReactNode;
  className?: string;
  /**
   * Animate direct children one after another instead of the wrapper as one
   * block. Value is the delay between items, in seconds.
   */
  stagger?: number;
  /** Starting vertical offset in px. */
  y?: number;
  delay?: number;
  /** Adds a soft blur-to-focus. Reserve for headings; blur is costly on large areas. */
  blur?: boolean;
  /** Render as a list (`ul`) so staggered list items stay valid HTML. */
  as?: 'div' | 'ul' | 'ol';
}

/**
 * Scroll-triggered entrance.
 *
 * Content is rendered visible in the HTML and only hidden by GSAP once it is
 * on the client, so if JavaScript fails or reduced motion is on, nothing stays
 * invisible. Each element animates once, when it first scrolls into view.
 */
export function Reveal({
  children,
  className,
  stagger,
  y = 28,
  delay = 0,
  blur = false,
  as = 'div',
}: RevealProps) {
  const ref = useRef<HTMLElement | null>(null);

  useIsoLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const targets = stagger ? Array.from(element.children) : element;
      gsap.from(targets, {
        y,
        opacity: 0,
        filter: blur ? 'blur(10px)' : undefined,
        duration: 1,
        delay,
        ease: EASE,
        stagger: stagger ?? 0,
        clearProps: 'filter',
        scrollTrigger: { trigger: element, start: 'top 86%', once: true },
      });
    });

    return () => mm.revert();
  }, [stagger, y, delay, blur]);

  const Tag = as;
  return (
    <Tag ref={ref as never} className={className}>
      {children}
    </Tag>
  );
}

export default Reveal;
