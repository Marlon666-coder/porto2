import type { CSSProperties } from 'react';
import { TRANSITION_TIMING } from '../state/transitionTiming';
import { useExperience } from '../state/experienceStore';

/**
 * The light flare and warp wash that hide world swaps.
 *
 * Timings come from the same constants the JS choreography uses, injected as
 * CSS custom properties — so the flare can never drift out of sync with the
 * camera cut it exists to conceal.
 */
export function TransitionOverlay() {
  const kind = useExperience((s) => s.transitionKind);
  const phase = useExperience((s) => s.transitionPhase);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const scale = reducedMotion ? 0.3 : 1;

  const style = {
    '--flare-out': `${TRANSITION_TIMING.flareOut * scale}s`,
    '--flare-in': `${TRANSITION_TIMING.flareIn * scale}s`,
    '--warp-out': `${TRANSITION_TIMING.warpOut * scale}s`,
    '--warp-in': `${TRANSITION_TIMING.warpIn * scale}s`,
  } as CSSProperties;

  return (
    <div
      className={`veil veil--${kind} veil--${phase}`}
      style={style}
      aria-hidden="true"
      data-nav-exempt
    >
      <div className="veil__flash" />
      <div className="veil__streaks" />
      <div className="veil__scanlines" />
    </div>
  );
}

export default TransitionOverlay;
