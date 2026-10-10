import { useEffect, useState } from 'react';

/**
 * Font stacks shared by CSS and the canvas-based 3D text generator.
 * The web fonts are a progressive enhancement — the fallbacks are chosen so the
 * hologram still looks deliberately geometric if Google Fonts is unreachable.
 */
export const FONT_DISPLAY = "'Orbitron', 'Rajdhani', 'Impact', 'Arial Black', sans-serif";
export const FONT_UI = "'Rajdhani', 'Segoe UI', 'Helvetica Neue', Arial, sans-serif";

interface FontFaceSetLike {
  load: (font: string) => Promise<unknown>;
  ready: Promise<unknown>;
}

let sharedPromise: Promise<void> | null = null;

/**
 * Resolves once the display fonts are usable — or immediately if the Font
 * Loading API is missing / the request fails. It never rejects, so a blocked
 * CDN cannot stall the experience.
 */
export function ensureFontsReady(): Promise<void> {
  if (sharedPromise) return sharedPromise;

  const fonts = (document as unknown as { fonts?: FontFaceSetLike }).fonts;
  if (!fonts) {
    sharedPromise = Promise.resolve();
    return sharedPromise;
  }

  const guard = new Promise<void>((resolve) => {
    // Hard ceiling: never wait more than 2.5s on a font.
    window.setTimeout(resolve, 2500);
  });

  const load = Promise.all([
    fonts.load("900 120px 'Orbitron'").catch(() => null),
    fonts.load("700 120px 'Orbitron'").catch(() => null),
    fonts.load("600 120px 'Rajdhani'").catch(() => null),
  ])
    .then(() => fonts.ready)
    .then(() => undefined)
    .catch(() => undefined);

  sharedPromise = Promise.race([load, guard]);
  return sharedPromise;
}

/** Re-renders the caller once fonts are ready so canvas textures can redraw. */
export function useFontsReady(): boolean {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    void ensureFontsReady().then(() => {
      if (!cancelled) setReady(true);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return ready;
}
