import { getScene, isDestination, navigationOrder } from '../data/scenes';
import { portfolio } from '../data/portfolio';
import { useExperience } from '../state/experienceStore';
import {
  nextStage,
  previousStage,
  returnToUniverse,
  skipIntro,
  toggleMenu,
  toggleReducedMotion,
  toggleSound,
} from '../state/navigation';
import DestinationMenu from './DestinationMenu';
import SceneIndicators from './SceneIndicators';

/**
 * The futuristic navigation HUD.
 *
 * Everything here performs the action it advertises: previous / next walk the
 * full journey, the map opens direct shortcuts, home returns to the universe
 * view, and the sound and motion toggles change the actual runtime behaviour.
 * Controls disable themselves while a camera transition is running, which makes
 * the animation lock visible instead of mysterious.
 */
export function NavigationHUD() {
  const phase = useExperience((s) => s.phase);
  const stage = useExperience((s) => s.stage);
  const isTransitioning = useExperience((s) => s.isTransitioning);
  const soundEnabled = useExperience((s) => s.soundEnabled);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const degraded = useExperience((s) => s.degraded);

  if (phase !== 'experience') return null;

  const scene = getScene(stage);
  const index = navigationOrder.indexOf(stage);
  const total = navigationOrder.length;
  const atStart = index <= 0;
  const atEnd = index >= total - 1;
  const inCinematic = !isDestination(stage) && stage !== 'universe';

  return (
    <>
      <header className="hud hud--top" data-nav-exempt>
        <div className="hud__brand">
          <span className="hud__brand-mark" aria-hidden="true" />
          <span className="hud__brand-text">
            <strong>{portfolio.identity.name.toUpperCase()}</strong>
            <em>EXPLORE MY UNIVERSE</em>
          </span>
        </div>

        <div className="hud__tools">
          <button
            type="button"
            className={`hud__tool ${soundEnabled ? 'is-on' : ''}`}
            onClick={toggleSound}
            aria-pressed={soundEnabled}
            title="Toggle ambient sound (S)"
          >
            <span aria-hidden="true">{soundEnabled ? '◉' : '◎'}</span>
            <span className="hud__tool-label">SOUND</span>
          </button>

          <button
            type="button"
            className={`hud__tool ${reducedMotion ? 'is-on' : ''}`}
            onClick={toggleReducedMotion}
            aria-pressed={reducedMotion}
            title="Reduce motion (R)"
          >
            <span aria-hidden="true">{reducedMotion ? '◉' : '◎'}</span>
            <span className="hud__tool-label">CALM</span>
          </button>

          <button
            type="button"
            className="hud__tool hud__tool--accent"
            onClick={toggleMenu}
            title="Open destination map (M)"
          >
            <span aria-hidden="true">⬡</span>
            <span className="hud__tool-label">MAP</span>
          </button>
        </div>
      </header>

      <SceneIndicators />

      <footer className="hud hud--bottom" data-nav-exempt>
        <div className="hud__readout">
          <span className="hud__readout-index">
            {String(index + 1).padStart(2, '0')}
            <em>/{String(total).padStart(2, '0')}</em>
          </span>
          <span className="hud__readout-text">
            <strong>{scene.label}</strong>
            <em>{scene.caption}</em>
          </span>
        </div>

        <div className="hud__progress" aria-hidden="true">
          <div
            className="hud__progress-fill"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>

        <div className="hud__controls">
          <button
            type="button"
            className="hud__nav"
            onClick={previousStage}
            disabled={atStart || isTransitioning}
            aria-label="Previous scene"
          >
            <span aria-hidden="true">◄</span> PREV
          </button>

          <button
            type="button"
            className="hud__nav hud__nav--home"
            onClick={returnToUniverse}
            disabled={isTransitioning || stage === 'universe'}
            aria-label="Return to the universe map"
          >
            UNIVERSE
          </button>

          <button
            type="button"
            className="hud__nav"
            onClick={nextStage}
            disabled={atEnd || isTransitioning}
            aria-label="Next scene"
          >
            NEXT <span aria-hidden="true">►</span>
          </button>

          {inCinematic && (
            <button
              type="button"
              className="hud__nav hud__nav--skip"
              onClick={skipIntro}
              disabled={isTransitioning}
            >
              SKIP INTRO <span aria-hidden="true">»</span>
            </button>
          )}
        </div>

        {degraded && (
          <p className="hud__notice" role="status">
            Performance mode enabled — visual load reduced to keep the frame rate smooth.
          </p>
        )}
      </footer>

      <DestinationMenu />
    </>
  );
}

export default NavigationHUD;
