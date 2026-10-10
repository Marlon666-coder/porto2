import { cinematicOrder, destinationOrder, sceneMap } from '../data/scenes';
import { goTo } from '../state/navigation';
import { useExperience } from '../state/experienceStore';

/**
 * Clickable progress rail.
 *
 * Two grouped tracks — the cinematic sequence and the six destinations — so a
 * visitor can see where they are and jump anywhere directly, instead of having
 * to scroll through the whole journey again.
 */
export function SceneIndicators() {
  const stage = useExperience((s) => s.stage);
  const isTransitioning = useExperience((s) => s.isTransitioning);

  const renderDot = (id: (typeof cinematicOrder)[number], index: number, prefix: string) => {
    const scene = sceneMap[id];
    const active = stage === id;
    return (
      <button
        key={id}
        type="button"
        className={`rail__dot ${active ? 'is-active' : ''}`}
        onClick={() => void goTo(id)}
        disabled={isTransitioning}
        aria-current={active ? 'true' : undefined}
        title={scene.caption}
      >
        <span className="rail__dot-mark" aria-hidden="true" />
        <span className="rail__dot-label">
          {prefix}
          {String(index + 1).padStart(2, '0')} · {scene.label}
        </span>
      </button>
    );
  };

  return (
    <nav className="rail" aria-label="Scene navigation" data-nav-exempt>
      <div className="rail__group">
        <span className="rail__group-title" aria-hidden="true">
          JOURNEY
        </span>
        {cinematicOrder.map((id, index) => renderDot(id, index, 'S'))}
      </div>
      <div className="rail__divider" aria-hidden="true" />
      <div className="rail__group">
        <span className="rail__group-title" aria-hidden="true">
          WORLDS
        </span>
        {destinationOrder.map((id, index) => renderDot(id, index, 'P'))}
      </div>
    </nav>
  );
}

export default SceneIndicators;
