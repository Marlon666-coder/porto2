'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gsap, hasFinePointer, prefersReducedMotion } from '@/lib/gsap';
import SafeImage from '@/components/ui/SafeImage';

interface Ripple {
  id: number;
  x: number;
  y: number;
}

interface ProfilePhotoProps {
  src: string;
  alt: string;
  caption: string;
}

/**
 * The hero portrait.
 *
 * Mouse: the frame tilts toward the cursor, a soft light follows it, and the
 * photo eases from grayscale to its original colour.
 * Click / tap: a press-and-release spring plus a ripple from the touch point;
 * on touch screens the tap also toggles colour (there is no hover on a phone).
 * Nothing calls preventDefault, so vertical scrolling over the photo still works.
 */
export function ProfilePhoto({ src, alt, caption }: ProfilePhotoProps) {
  const frameRef = useRef<HTMLButtonElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const [colour, setColour] = useState(false);
  const [ripples, setRipples] = useState<Ripple[]>([]);
  const rippleId = useRef(0);
  const hovering = useRef(false);

  // Cursor-driven tilt + light (fine pointers only).
  useEffect(() => {
    const frame = frameRef.current;
    const card = cardRef.current;
    if (!frame || !card || !hasFinePointer() || prefersReducedMotion()) return undefined;

    gsap.set(card, { transformPerspective: 1100 });
    const rotX = gsap.quickTo(card, 'rotationX', { duration: 0.6, ease: 'power3.out' });
    const rotY = gsap.quickTo(card, 'rotationY', { duration: 0.6, ease: 'power3.out' });

    const onMove = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      const rect = frame.getBoundingClientRect();
      const px = (event.clientX - rect.left) / rect.width;
      const py = (event.clientY - rect.top) / rect.height;
      rotY((px - 0.5) * 9);
      rotX(-(py - 0.5) * 9);
      card.style.setProperty('--mx', `${px * 100}%`);
      card.style.setProperty('--my', `${py * 100}%`);
    };
    const onEnter = (event: PointerEvent) => {
      if (event.pointerType !== 'mouse') return;
      hovering.current = true;
      setColour(true);
      gsap.to(card, { scale: 1.025, duration: 0.6, ease: 'power3.out' });
    };
    const onLeave = () => {
      hovering.current = false;
      setColour(false);
      rotX(0);
      rotY(0);
      gsap.to(card, { scale: 1, duration: 0.7, ease: 'power3.out' });
    };

    frame.addEventListener('pointermove', onMove);
    frame.addEventListener('pointerenter', onEnter);
    frame.addEventListener('pointerleave', onLeave);
    return () => {
      frame.removeEventListener('pointermove', onMove);
      frame.removeEventListener('pointerenter', onEnter);
      frame.removeEventListener('pointerleave', onLeave);
      gsap.set(card, { clearProps: 'transform' });
    };
  }, []);

  const onPointerDown = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const frame = frameRef.current;
    const card = cardRef.current;
    if (!frame || !card) return;

    const rect = frame.getBoundingClientRect();
    rippleId.current += 1;
    const ripple = { id: rippleId.current, x: event.clientX - rect.left, y: event.clientY - rect.top };
    setRipples((current) => [...current.slice(-2), ripple]);

    if (!prefersReducedMotion()) {
      gsap.to(card, { scale: hovering.current ? 0.985 : 0.97, duration: 0.18, ease: 'power2.out' });
    }
  };

  const release = () => {
    const card = cardRef.current;
    if (!card || prefersReducedMotion()) return;
    gsap.to(card, { scale: hovering.current ? 1.025 : 1, duration: 0.9, ease: 'elastic.out(1, 0.45)' });
  };

  const onClick = () => {
    // Touch screens have no hover: a tap reveals (or hides) the colour.
    if (!hasFinePointer()) setColour((value) => !value);
  };

  return (
    <figure className="relative">
      <button
        ref={frameRef}
        type="button"
        onPointerDown={onPointerDown}
        onPointerUp={release}
        onPointerCancel={release}
        onClick={onClick}
        aria-pressed={colour}
        aria-label={`${alt}. Show photo in ${colour ? 'black and white' : 'colour'}.`}
        className="block w-full cursor-pointer rounded-[1.75rem] outline-offset-8"
      >
        <div
          ref={cardRef}
          className="photo-card relative aspect-[4/5] w-full overflow-hidden rounded-[1.75rem] bg-ink-2 will-change-transform"
        >
          <SafeImage
            src={src}
            alt=""
            priority
            sizes="(min-width: 1024px) 40vw, 90vw"
            fallbackLabel="Portrait"
            className={`object-cover object-[50%_30%] transition-[filter] duration-700 ease-out ${
              colour ? 'grayscale-0' : 'grayscale'
            }`}
          />
          {/* Light that follows the cursor. */}
          <span aria-hidden="true" className="photo-light pointer-events-none absolute inset-0" />
          {/* Hairline frame. */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-paper/10"
          />
          {ripples.map((ripple) => (
            <span
              key={ripple.id}
              aria-hidden="true"
              className="photo-ripple pointer-events-none absolute rounded-full"
              style={{ left: ripple.x, top: ripple.y }}
              onAnimationEnd={() => setRipples((current) => current.filter((item) => item.id !== ripple.id))}
            />
          ))}
        </div>
      </button>
      <figcaption className="mt-4 flex items-center justify-between text-label uppercase text-mute">
        <span>{caption}</span>
        <span className="hidden sm:inline">{colour ? 'Colour' : 'Monochrome'}</span>
      </figcaption>
    </figure>
  );
}

export default ProfilePhoto;
