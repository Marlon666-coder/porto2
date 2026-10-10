import { useEffect, useRef, type CSSProperties } from 'react';
import { cinematicOrder, destinationOrder, sceneMap } from '../data/scenes';
import { DESTINATION_ACCENTS } from '../data/worldLayout';
import { closeMenu, goTo } from '../state/navigation';
import { useExperience } from '../state/experienceStore';

const DESTINATION_BLURB: Record<string, string> = {
  about: 'Orbital observatory · who I am',
  projects: 'Hangar bay · things I have built',
  skills: 'Laboratory · the tech I work with',
  education: 'Archive · academic record',
  certificates: 'Vault · credentials',
  contact: 'Terminal · open a channel',
};

/**
 * Destination selector.
 *
 * The direct-access answer to "do not make people scroll through the whole
 * journey again": every world and every cinematic beat is one click away.
 */
export function DestinationMenu() {
  const menuOpen = useExperience((s) => s.menuOpen);
  const stage = useExperience((s) => s.stage);
  const isTransitioning = useExperience((s) => s.isTransitioning);
  const panelRef = useRef<HTMLDivElement>(null);
  const firstButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (menuOpen) firstButtonRef.current?.focus();
  }, [menuOpen]);

  if (!menuOpen) return null;

  return (
    <div
      className="menu"
      data-nav-exempt
      role="dialog"
      aria-modal="true"
      aria-label="Destination map"
      onClick={(event) => {
        if (event.target === event.currentTarget) closeMenu();
      }}
    >
      <div className="menu__panel" ref={panelRef}>
        <header className="menu__header">
          <h2 className="menu__title">Destination Map</h2>
          <button type="button" className="menu__close" onClick={closeMenu} aria-label="Close map">
            ✕
          </button>
        </header>

        <section className="menu__section">
          <h3 className="menu__section-title">Worlds</h3>
          <ul className="menu__grid">
            {destinationOrder.map((id, index) => {
              const scene = sceneMap[id];
              const accent = DESTINATION_ACCENTS[id];
              return (
                <li key={id}>
                  <button
                    ref={index === 0 ? firstButtonRef : undefined}
                    type="button"
                    className={`menu__card ${stage === id ? 'is-active' : ''}`}
                    style={{ '--accent': accent } as CSSProperties}
                    onClick={() => void goTo(id)}
                    disabled={isTransitioning}
                  >
                    <span className="menu__card-index">P{String(index + 1).padStart(2, '0')}</span>
                    <span className="menu__card-name">{scene.label}</span>
                    <span className="menu__card-blurb">{DESTINATION_BLURB[id] ?? scene.caption}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="menu__section">
          <h3 className="menu__section-title">The Journey</h3>
          <ul className="menu__list">
            {cinematicOrder.map((id, index) => {
              const scene = sceneMap[id];
              return (
                <li key={id}>
                  <button
                    type="button"
                    className={`menu__row ${stage === id ? 'is-active' : ''}`}
                    onClick={() => void goTo(id)}
                    disabled={isTransitioning}
                  >
                    <span className="menu__row-index">S{String(index + 1).padStart(2, '0')}</span>
                    <span className="menu__row-name">{scene.label}</span>
                    <span className="menu__row-caption">{scene.caption}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <p className="menu__hint">
          Keyboard: ← → travel · M map · S sound · R reduced motion · Esc close
        </p>
      </div>
    </div>
  );
}

export default DestinationMenu;
