'use client';

import { useRef } from 'react';
import { EASE, gsap, MOTION_OK, useIsoLayoutEffect } from '@/lib/gsap';

interface BlurTextProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'p';
  className?: string;
  id?: string;
  /** Delay between words, in seconds. */
  stagger?: number;
}

/**
 * Word-by-word blur-to-focus heading (the effect popularised by React Bits'
 * BlurText, written here directly on GSAP so there is one animation engine).
 *
 * Words are real text nodes separated by real spaces, so line breaks, copy and
 * paste, and screen readers behave exactly as with a plain heading.
 */
export function BlurText({ text, as = 'h2', className, id, stagger = 0.06 }: BlurTextProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const words = text.split(/\s+/).filter(Boolean);

  useIsoLayoutEffect(() => {
    const element = ref.current;
    if (!element) return undefined;

    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      gsap.from(element.querySelectorAll('[data-word]'), {
        opacity: 0,
        y: '0.35em',
        filter: 'blur(12px)',
        duration: 1.05,
        ease: EASE,
        stagger,
        clearProps: 'filter',
        scrollTrigger: { trigger: element, start: 'top 88%', once: true },
      });
    });
    return () => mm.revert();
  }, [text, stagger]);

  const Tag = as;
  return (
    <Tag id={id} className={className}>
      <span ref={ref}>
        {words.map((word, index) => (
          <span key={`${word}-${index}`}>
            <span data-word className="inline-block will-change-transform">
              {word}
            </span>
            {index < words.length - 1 ? ' ' : null}
          </span>
        ))}
      </span>
    </Tag>
  );
}

export default BlurText;
