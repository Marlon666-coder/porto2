'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { useSmoothScroll } from '@/components/providers/SmoothScroll';
import { gsap, prefersReducedMotion } from '@/lib/gsap';
import { portfolio } from '@/data/portfolio';

export const NAV_ITEMS = [
  { id: 'top', label: 'Home' },
  { id: 'about', label: 'About' },
  { id: 'achievements', label: 'Achievements' },
  { id: 'projects', label: 'Projects' },
  { id: 'skills', label: 'Skills' },
  { id: 'experience', label: 'Experience' },
  { id: 'education', label: 'Education' },
  { id: 'contact', label: 'Contact' },
] as const;

type SectionId = (typeof NAV_ITEMS)[number]['id'];

/** Tracks which section occupies the middle of the viewport. */
function useActiveSection(): SectionId {
  const [active, setActive] = useState<SectionId>('top');

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id as SectionId);
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    );
    for (const item of NAV_ITEMS) {
      const element = document.getElementById(item.id);
      if (element) observer.observe(element);
    }
    return () => observer.disconnect();
  }, []);

  return active;
}

export function Nav() {
  const { scrollTo, stop, start } = useSmoothScroll();
  const active = useActiveSection();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const linksRef = useRef<HTMLUListElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const timeline = useRef<gsap.core.Timeline | null>(null);
  // False when a menu item was chosen: focus then moves to that section instead.
  const restoreFocus = useRef(true);

  // Solid bar once the page has moved.
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Slide the active-section pill under the current link.
  useEffect(() => {
    const list = linksRef.current;
    const indicator = indicatorRef.current;
    if (!list || !indicator) return undefined;

    const place = () => {
      const link = list.querySelector<HTMLElement>(`[data-section="${active}"]`);
      if (!link) return;
      gsap.to(indicator, {
        x: link.offsetLeft,
        width: link.offsetWidth,
        opacity: 1,
        duration: prefersReducedMotion() ? 0 : 0.55,
        ease: 'power3.out',
      });
    };
    place();
    window.addEventListener('resize', place);
    return () => window.removeEventListener('resize', place);
  }, [active]);

  const go = useCallback(
    (id: SectionId) => {
      scrollTo(`#${id}`);
    },
    [scrollTo],
  );

  // ---- mobile menu -------------------------------------------------------
  const closeMenu = useCallback(() => {
    const tl = timeline.current;
    if (tl && !prefersReducedMotion()) {
      tl.eventCallback('onReverseComplete', () => setOpen(false));
      tl.timeScale(1.6).reverse();
    } else {
      setOpen(false);
    }
  }, []);

  useEffect(() => {
    if (!open) return undefined;
    const overlay = overlayRef.current;
    if (!overlay) return undefined;

    stop();
    const items = overlay.querySelectorAll('[data-menu-item]');
    const tl = gsap.timeline();
    if (!prefersReducedMotion()) {
      tl.fromTo(
        overlay,
        { clipPath: 'inset(0% 0% 100% 0%)' },
        { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.7, ease: 'power4.inOut' },
      ).from(items, { y: 48, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.05 }, '-=0.3');
    }
    timeline.current = tl;

    overlay.querySelector<HTMLElement>('[data-menu-item] button')?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeMenu();
    };
    window.addEventListener('keydown', onKey);

    return () => {
      window.removeEventListener('keydown', onKey);
      tl.kill();
      timeline.current = null;
      start();
      if (restoreFocus.current) toggleRef.current?.focus();
      restoreFocus.current = true;
    };
  }, [open, stop, start, closeMenu]);

  const onMenuSelect = (id: SectionId) => {
    restoreFocus.current = false;
    // Release the scroll lock first: a stopped Lenis ignores scrollTo().
    start();
    setOpen(false);
    window.setTimeout(() => go(id), 60);
  };

  const name = portfolio.about.name;

  return (
    <>
      <nav
        aria-label="Primary"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color] duration-500 ease-out ${
          scrolled ? 'border-b border-ink-2 bg-ink-1/95' : 'border-b border-transparent bg-transparent'
        }`}
      >
        <div className="mx-auto flex h-16 max-w-shell items-center justify-between px-5 md:px-10">
          <a
            href="#top"
            onClick={(event) => {
              event.preventDefault();
              go('top');
            }}
            className="text-[0.9375rem] font-semibold tracking-[-0.02em] text-paper"
          >
            {name}
          </a>

          <ul ref={linksRef} className="relative hidden items-center lg:flex">
            <span
              ref={indicatorRef}
              aria-hidden="true"
              className="absolute left-0 top-1/2 -mt-4 h-8 rounded-full bg-paper/[0.08] opacity-0"
            />
            {NAV_ITEMS.map((item) => (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  data-section={item.id}
                  aria-current={active === item.id ? 'location' : undefined}
                  onClick={(event) => {
                    event.preventDefault();
                    go(item.id);
                  }}
                  className={`relative block rounded-full px-4 py-2 text-[0.8125rem] tracking-[-0.005em] transition-colors duration-300 ${
                    active === item.id ? 'text-paper' : 'text-mute hover:text-paper'
                  }`}
                >
                  {item.label}
                </a>
              </li>
            ))}
          </ul>

          <a
            href="#contact"
            onClick={(event) => {
              event.preventDefault();
              go('contact');
            }}
            className="hidden h-9 items-center rounded-full bg-paper px-4 text-[0.8125rem] font-medium text-ink transition-colors duration-300 hover:bg-paper-2 active:scale-[0.96] lg:inline-flex"
          >
            Contact me
          </a>

          <button
            ref={toggleRef}
            type="button"
            onClick={() => (open ? closeMenu() : setOpen(true))}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="relative z-[60] -mr-2 inline-flex h-11 w-11 items-center justify-center rounded-full text-paper lg:hidden"
          >
            {open ? <X className="h-5 w-5" strokeWidth={1.75} /> : <Menu className="h-5 w-5" strokeWidth={1.75} />}
          </button>
        </div>
      </nav>

      {open ? (
        <div
          ref={overlayRef}
          id="mobile-menu"
          role="dialog"
          aria-modal="true"
          aria-label="Site menu"
          className="fixed inset-0 z-[55] flex flex-col bg-ink px-6 pb-10 pt-24 text-paper lg:hidden"
        >
          <ul className="flex flex-1 flex-col justify-center gap-1">
            {NAV_ITEMS.map((item, index) => (
              <li key={item.id} data-menu-item className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => onMenuSelect(item.id)}
                  className={`flex w-full items-baseline gap-4 py-2 text-left text-[2.5rem] font-semibold leading-tight tracking-[-0.04em] ${
                    active === item.id ? 'text-paper' : 'text-mute'
                  }`}
                >
                  <span className="font-mono text-label text-mute">{String(index + 1).padStart(2, '0')}</span>
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
          <p data-menu-item className="text-label uppercase text-mute">
            {portfolio.about.role} · {portfolio.identity.location}
          </p>
        </div>
      ) : null}
    </>
  );
}

export default Nav;
