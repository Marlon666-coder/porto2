import { useEffect } from 'react';
import { getExperience, setExperience } from '../state/experienceStore';

/**
 * Mirrors the OS `prefers-reduced-motion` setting into the store on mount and
 * keeps listening for changes. The in-app toggle can still override it, which
 * is why the listener only writes when the media query itself changes.
 */
export function useSystemPreferences(): void {
  useEffect(() => {
    if (typeof window.matchMedia !== 'function') return;
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');

    if (query.matches && !getExperience().reducedMotion) {
      setExperience({ reducedMotion: true });
    }

    const onChange = (event: MediaQueryListEvent) => {
      setExperience({ reducedMotion: event.matches });
    };

    if (typeof query.addEventListener === 'function') {
      query.addEventListener('change', onChange);
      return () => query.removeEventListener('change', onChange);
    }
    // Safari < 14
    query.addListener(onChange);
    return () => query.removeListener(onChange);
  }, []);
}

export function detectWebGLSupport(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl: WebGLRenderingContext | WebGL2RenderingContext | null =
      canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Release the probe context immediately so it does not count against the
    // browser's live-context limit.
    const lose = gl.getExtension('WEBGL_lose_context') as { loseContext?: () => void } | null;
    lose?.loseContext?.();
    return true;
  } catch (error) {
    console.warn('[webgl] capability probe failed', error);
    return false;
  }
}
