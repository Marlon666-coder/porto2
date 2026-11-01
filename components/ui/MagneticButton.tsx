'use client';

import { useEffect, useRef, type MouseEvent, type ReactNode } from 'react';
import { ArrowRight, ArrowUpRight, Download } from 'lucide-react';
import { gsap, hasFinePointer, prefersReducedMotion } from '@/lib/gsap';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';

type Variant = 'solid' | 'outline';
type Tone = 'dark' | 'light';
type Icon = 'arrow' | 'external' | 'download' | 'none';

interface MagneticButtonProps {
  children: ReactNode;
  /** `#section` scrolls smoothly; anything else is a normal link. */
  href: string;
  variant?: Variant;
  /** Background the button sits on. Dark = button lives on a black section. */
  tone?: Tone;
  icon?: Icon;
  /** Set for file downloads (the CV). */
  download?: boolean;
  external?: boolean;
  className?: string;
  ariaLabel?: string;
}

const ICONS = {
  arrow: ArrowRight,
  external: ArrowUpRight,
  download: Download,
} as const;

function styles(variant: Variant, tone: Tone): string {
  if (variant === 'solid') {
    return tone === 'dark'
      ? 'bg-paper text-ink hover:bg-paper-2'
      : 'bg-ink text-paper hover:bg-ink-2';
  }
  return tone === 'dark'
    ? 'border border-ink-2 text-paper hover:border-paper/60 hover:bg-paper/[0.06]'
    : 'border border-ink/15 text-ink hover:border-ink/50 hover:bg-ink/[0.04]';
}

/**
 * Primary call-to-action.
 *
 * Desktop: the button leans toward the cursor (magnetic) and the arrow slides.
 * Everywhere: a press-down scale on click. Every instance points at a real
 * destination — there is no decorative button without an action.
 */
export function MagneticButton({
  children,
  href,
  variant = 'solid',
  tone = 'dark',
  icon = 'arrow',
  download = false,
  external = false,
  className = '',
  ariaLabel,
}: MagneticButtonProps) {
  const ref = useRef<HTMLAnchorElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const { scrollTo } = useSmoothScroll();

  useEffect(() => {
    const element = ref.current;
    const label = labelRef.current;
    if (!element || !label || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const moveX = gsap.quickTo(element, 'x', { duration: 0.5, ease: 'power3.out' });
    const moveY = gsap.quickTo(element, 'y', { duration: 0.5, ease: 'power3.out' });
    const labelX = gsap.quickTo(label, 'x', { duration: 0.5, ease: 'power3.out' });
    const labelY = gsap.quickTo(label, 'y', { duration: 0.5, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      const rect = element.getBoundingClientRect();
      const dx = event.clientX - (rect.left + rect.width / 2);
      const dy = event.clientY - (rect.top + rect.height / 2);
      moveX(dx * 0.22);
      moveY(dy * 0.3);
      labelX(dx * 0.08);
      labelY(dy * 0.1);
    };
    const onLeave = () => {
      moveX(0);
      moveY(0);
      labelX(0);
      labelY(0);
    };

    element.addEventListener('pointermove', onMove);
    element.addEventListener('pointerleave', onLeave);
    return () => {
      element.removeEventListener('pointermove', onMove);
      element.removeEventListener('pointerleave', onLeave);
      gsap.set([element, label], { clearProps: 'transform' });
    };
  }, []);

  const onClick = (event: MouseEvent<HTMLAnchorElement>) => {
    if (href.startsWith('#')) {
      event.preventDefault();
      scrollTo(href);
    }
  };

  const IconComponent = icon === 'none' ? null : ICONS[icon];
  const opensNewTab = external && !href.startsWith('mailto:');

  return (
    <a
      ref={ref}
      href={href}
      onClick={onClick}
      download={download || undefined}
      target={opensNewTab ? '_blank' : undefined}
      rel={opensNewTab ? 'noopener noreferrer' : undefined}
      aria-label={ariaLabel}
      className={`group relative inline-flex h-12 select-none items-center justify-center gap-2 rounded-full px-6 text-[0.9375rem] font-medium tracking-[-0.01em] transition-[background-color,border-color,color,scale] duration-300 ease-out active:scale-[0.96] ${styles(variant, tone)} ${className}`}
    >
      <span ref={labelRef} className="inline-flex items-center gap-2">
        {children}
        {IconComponent ? (
          <IconComponent
            aria-hidden="true"
            className={`h-4 w-4 transition-transform duration-300 ease-out ${
              icon === 'arrow'
                ? 'group-hover:translate-x-1'
                : icon === 'download'
                  ? 'group-hover:translate-y-0.5'
                  : 'group-hover:-translate-y-0.5 group-hover:translate-x-0.5'
            }`}
            strokeWidth={1.75}
          />
        ) : null}
      </span>
    </a>
  );
}

export default MagneticButton;
