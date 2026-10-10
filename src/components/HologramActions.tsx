import { goTo, nextStage } from '../state/navigation';
import { useExperience } from '../state/experienceStore';

/**
 * The two holographic call-to-action buttons that sit beneath the projected
 * message.
 *
 * They are real DOM buttons on purpose: they must be reachable by keyboard,
 * announced by screen readers and tappable with a thumb. The holographic
 * treatment (glass, scanlines, bracket glyphs, corner ticks) is pure CSS, and
 * they are positioned low in the frame so they never cover the hologram itself.
 */
export function HologramActions() {
  const stage = useExperience((s) => s.stage);
  const hologramPhase = useExperience((s) => s.hologramPhase);
  const isTransitioning = useExperience((s) => s.isTransitioning);
  const phase = useExperience((s) => s.phase);

  if (phase !== 'experience') return null;
  if (stage !== 'hologram') return null;

  const revealed = hologramPhase === 'stable';

  return (
    <div className={`holo-actions ${revealed ? 'is-visible' : ''}`} data-nav-exempt>
      <button
        type="button"
        className="holo-button holo-button--primary"
        onClick={() => void goTo('projects')}
        disabled={!revealed || isTransitioning}
      >
        <span className="holo-button__bracket">[</span>
        <span className="holo-button__label">EXPLORE MY PROJECTS</span>
        <span className="holo-button__bracket">]</span>
      </button>

      <button
        type="button"
        className="holo-button"
        onClick={() => void goTo('contact')}
        disabled={!revealed || isTransitioning}
      >
        <span className="holo-button__bracket">[</span>
        <span className="holo-button__label">ESTABLISH CONNECTION</span>
        <span className="holo-button__bracket">]</span>
      </button>

      <button
        type="button"
        className="holo-actions__ghost"
        onClick={nextStage}
        disabled={!revealed || isTransitioning}
      >
        or open the universe map ↓
      </button>
    </div>
  );
}

export default HologramActions;
