import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { getExperience, setExperience } from '../state/experienceStore';

/**
 * Frame-rate watchdog.
 *
 * Samples in 1.5s windows and, after two consecutive poor windows, flips the
 * `degraded` flag once. `useQuality` then halves particle counts and disables
 * post-processing. It never upgrades back automatically — oscillating quality
 * looks worse than a stable, slightly simpler scene.
 */
export function PerfGuard({ threshold = 38 }: { threshold?: number }) {
  const frames = useRef(0);
  const elapsed = useRef(0);
  const poorWindows = useRef(0);
  const settled = useRef(0);

  useFrame((_state, delta) => {
    if (getExperience().degraded) return;

    // Ignore the first couple of seconds: shader compilation skews the sample.
    if (settled.current < 2.5) {
      settled.current += delta;
      return;
    }

    frames.current += 1;
    elapsed.current += delta;

    if (elapsed.current < 1.5) return;

    const fps = frames.current / elapsed.current;
    frames.current = 0;
    elapsed.current = 0;

    if (fps < threshold) {
      poorWindows.current += 1;
      if (poorWindows.current >= 2) {
        console.info(
          `[perf] sustained ~${fps.toFixed(0)} FPS — reducing visual load (degraded mode).`,
        );
        setExperience({ degraded: true });
      }
    } else {
      poorWindows.current = 0;
    }
  });

  return null;
}

export default PerfGuard;
