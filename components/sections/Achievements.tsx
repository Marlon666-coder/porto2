'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { gsap, hasFinePointer, prefersReducedMotion } from '@/lib/gsap';
import { asset } from '@/lib/asset';
import type { Achievement } from '@/lib/types';
import Lightbox, { type LightboxItem } from '@/components/ui/Lightbox';
import Reveal from '@/components/ui/Reveal';
import SafeImage from '@/components/ui/SafeImage';
import SectionHeader from '@/components/ui/SectionHeader';

function metaFor(item: Achievement): string[] {
  return [item.issuer, item.issued].filter(Boolean);
}

/**
 * Achievements on black.
 *
 * 1. An editorial index — numbered rows an HR reader can scan top to bottom.
 *    On desktop, hovering a row floats its photo next to the cursor.
 * 2. A documentation grid of the same images, for visual credibility.
 * Both open the same full-size viewer, so certificates stay readable.
 */
export function Achievements() {
  const items = portfolio.certificates.filter((item) => !item.isPlaceholder);
  const [open, setOpen] = useState<number | null>(null);
  const [hovered, setHovered] = useState<number | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLOListElement>(null);

  const lightboxItems: LightboxItem[] = items.map((item) => ({
    id: item.id,
    image: item.image,
    title: item.title,
    meta: metaFor(item),
  }));

  // Floating hover preview that trails the cursor (desktop only).
  useEffect(() => {
    const preview = previewRef.current;
    const list = listRef.current;
    if (!preview || !list || !hasFinePointer() || prefersReducedMotion()) return undefined;

    const x = gsap.quickTo(preview, 'x', { duration: 0.6, ease: 'power3.out' });
    const y = gsap.quickTo(preview, 'y', { duration: 0.6, ease: 'power3.out' });
    const onMove = (event: PointerEvent) => {
      x(event.clientX + 28);
      y(event.clientY - 120);
    };
    list.addEventListener('pointermove', onMove);
    return () => list.removeEventListener('pointermove', onMove);
  }, []);

  useEffect(() => {
    const preview = previewRef.current;
    if (!preview || !hasFinePointer() || prefersReducedMotion()) return;
    gsap.to(preview, {
      opacity: hovered === null ? 0 : 1,
      scale: hovered === null ? 0.92 : 1,
      duration: 0.35,
      ease: 'power2.out',
    });
  }, [hovered]);

  const close = useCallback(() => setOpen(null), []);
  const navigate = useCallback((index: number) => setOpen(index), []);

  return (
    <section
      id="achievements"
      tabIndex={-1}
      aria-labelledby="achievements-title"
      className="relative bg-ink py-24 text-paper outline-none md:py-36"
    >
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader
          index="02"
          label="Achievements"
          title="Recognition, earned."
          titleId="achievements-title"
          tone="dark"
          intro={`${items.length} documented milestones across competition, scholarship and faith.`}
        />

        <Reveal as="ol" stagger={0.08} y={20} className="border-t border-ink-2">
          {items.map((item, index) => (
            <li key={item.id} className="border-b border-ink-2">
              <button
                type="button"
                onClick={() => setOpen(index)}
                onPointerEnter={() => setHovered(index)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(null)}
                className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-5 py-7 text-left md:grid-cols-12 md:gap-6 md:py-9"
              >
                <span className="font-mono text-label text-mute md:col-span-1">{String(index + 1).padStart(2, '0')}</span>

                {/* Thumbnail inline on touch screens, where there is no hover preview. */}
                <span className="relative col-span-3 row-start-2 aspect-[4/3] w-full overflow-hidden rounded-xl bg-ink-2 md:hidden">
                  <SafeImage src={item.image} alt="" sizes="90vw" className="object-cover" fallbackLabel="Image" />
                </span>

                <span className="min-w-0 md:col-span-7">
                  <span className="block text-title font-medium transition-transform duration-500 ease-out md:group-hover:translate-x-2">
                    {item.title}
                  </span>
                  <span className="mt-1 block text-[0.9375rem] text-mute">{item.issuer}</span>
                </span>

                <span className="hidden flex-wrap gap-2 md:col-span-3 md:flex">
                  {item.award ? <Tag>{item.award}</Tag> : null}
                  {item.level ? <Tag>{item.level}</Tag> : null}
                  {item.issued ? <Tag>{item.issued}</Tag> : null}
                </span>

                <span className="flex items-center justify-end md:col-span-1">
                  <span className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-ink-2 transition-[background-color,border-color,color] duration-300 group-hover:border-paper group-hover:bg-paper group-hover:text-ink">
                    <ArrowUpRight className="h-4 w-4" strokeWidth={1.75} aria-hidden="true" />
                    <span className="sr-only">View {item.title}</span>
                  </span>
                </span>
              </button>
            </li>
          ))}
        </Reveal>

        {/* Documentation grid */}
        <div className="mt-24 md:mt-32">
          <div className="mb-8 flex items-center gap-4 text-label uppercase text-mute">
            <span>Documentation</span>
            <span className="h-px flex-1 bg-ink-2" aria-hidden="true" />
          </div>
          <Reveal stagger={0.08} className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-5 lg:grid-cols-5">
            {items.map((item, index) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setOpen(index)}
                className="group relative aspect-[3/4] overflow-hidden rounded-xl bg-ink-2 text-left"
                aria-label={`Open ${item.title}`}
              >
                <SafeImage
                  src={item.image}
                  alt=""
                  sizes="(min-width: 1024px) 18vw, (min-width: 768px) 30vw, 45vw"
                  fallbackLabel="Image"
                  className="object-cover grayscale transition-[filter,transform] duration-700 ease-out group-hover:scale-105 group-hover:grayscale-0"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink/90 to-transparent p-3 pt-10 text-[0.8125rem] leading-snug text-paper">
                  {item.title}
                </span>
              </button>
            ))}
          </Reveal>
        </div>
      </div>

      {/* Cursor-trailing preview (desktop). Decorative: the row itself is the control. */}
      <div
        ref={previewRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-40 hidden h-[15rem] w-[12rem] overflow-hidden rounded-2xl bg-ink-2 opacity-0 lg:block"
      >
        {items.map((item, index) => (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            key={item.id}
            src={asset(item.image)}
            alt=""
            loading="lazy"
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300 ${
              hovered === index ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ))}
      </div>

      <Lightbox items={lightboxItems} index={open} onClose={close} onNavigate={navigate} />
    </section>
  );
}

function Tag({ children }: { children: string }) {
  return <span className="rounded-full border border-ink-2 px-3 py-1 text-[0.75rem] text-mute">{children}</span>;
}

export default Achievements;
