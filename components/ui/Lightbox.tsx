'use client';

import { useEffect, useRef } from 'react';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import SafeImage from './SafeImage';

export interface LightboxItem {
  id: string;
  image: string;
  title: string;
  meta: string[];
}

interface LightboxProps {
  items: LightboxItem[];
  /** Index of the open item, or null when closed. */
  index: number | null;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

/**
 * Full-screen image viewer for certificates and documentation.
 * Keyboard: Esc closes, ← / → move between items, Tab stays inside the dialog.
 * Focus returns to whatever opened it.
 */
export function Lightbox({ items, index, onClose, onNavigate }: LightboxProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const opener = useRef<Element | null>(null);
  const { stop, start } = useSmoothScroll();
  const isOpen = index !== null;

  // Open / close side effects.
  useEffect(() => {
    if (!isOpen) return undefined;
    opener.current = document.activeElement;
    stop();
    closeRef.current?.focus();

    if (!prefersReducedMotion() && dialogRef.current && panelRef.current) {
      gsap.fromTo(dialogRef.current, { opacity: 0 }, { opacity: 1, duration: 0.35, ease: 'power2.out' });
      gsap.fromTo(
        panelRef.current,
        { y: 24, scale: 0.97, opacity: 0 },
        { y: 0, scale: 1, opacity: 1, duration: 0.6, ease: 'power3.out' },
      );
    }

    return () => {
      start();
      if (opener.current instanceof HTMLElement) opener.current.focus();
    };
  }, [isOpen, stop, start]);

  // Keyboard handling.
  useEffect(() => {
    if (index === null) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
      else if (event.key === 'ArrowRight') onNavigate((index + 1) % items.length);
      else if (event.key === 'ArrowLeft') onNavigate((index - 1 + items.length) % items.length);
      else if (event.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll<HTMLElement>('button, a[href]');
        if (focusable.length === 0) return;
        const first = focusable[0];
        const last = focusable[focusable.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [index, items.length, onClose, onNavigate]);

  if (index === null) return null;
  const item = items[index];
  if (!item) return null;

  return (
    <div
      ref={dialogRef}
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      data-lenis-prevent
      className="fixed inset-0 z-[70] flex items-center justify-center bg-ink/95 p-4 md:p-10"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div ref={panelRef} className="flex max-h-full w-full max-w-5xl flex-col">
        <div className="mb-4 flex items-start justify-between gap-6 text-paper">
          <div>
            <p className="font-mono text-label text-mute">
              {String(index + 1).padStart(2, '0')} / {String(items.length).padStart(2, '0')}
            </p>
            <h3 className="mt-2 text-title font-semibold">{item.title}</h3>
            {item.meta.length > 0 ? (
              <p className="mt-1 text-[0.9375rem] text-mute">{item.meta.join(' · ')}</p>
            ) : null}
          </div>
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close preview"
            className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-ink-2 text-paper transition-colors hover:border-paper/50 active:scale-95"
          >
            <X className="h-5 w-5" strokeWidth={1.75} />
          </button>
        </div>

        <div className="relative min-h-0 flex-1">
          <div className="relative mx-auto aspect-[4/3] max-h-[72vh] w-full overflow-hidden rounded-2xl bg-ink-1">
            {/* object-contain keeps certificates fully readable, uncropped. */}
            <SafeImage key={item.id} src={item.image} alt={item.title} sizes="90vw" className="object-contain" fallbackLabel="Image" />
          </div>
        </div>

        {items.length > 1 ? (
          <div className="mt-5 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate((index - 1 + items.length) % items.length)}
              aria-label="Previous"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-2 text-paper transition-colors hover:border-paper/50 active:scale-95"
            >
              <ChevronLeft className="h-5 w-5" strokeWidth={1.75} />
            </button>
            <button
              type="button"
              onClick={() => onNavigate((index + 1) % items.length)}
              aria-label="Next"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-ink-2 text-paper transition-colors hover:border-paper/50 active:scale-95"
            >
              <ChevronRight className="h-5 w-5" strokeWidth={1.75} />
            </button>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default Lightbox;
