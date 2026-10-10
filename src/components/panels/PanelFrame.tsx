import type { CSSProperties, ReactNode } from 'react';
import { returnToUniverse, togglePanel } from '../../state/navigation';
import { useExperience } from '../../state/experienceStore';

export interface PanelFrameProps {
  title: string;
  subtitle?: string;
  accent: string;
  children: ReactNode;
  /** Shown as a small code in the panel header, e.g. "P02". */
  code?: string;
}

/**
 * Holographic information panel.
 *
 * The readable content lives in the DOM rather than inside the WebGL canvas,
 * which is a deliberate choice: real text is selectable, translatable,
 * zoomable, screen-reader friendly and crisp at any DPI, and real anchors are
 * keyboard focusable. The 3D world behind it still changes completely per
 * destination, so the sense of place comes from the environment while the
 * information stays genuinely usable.
 *
 * `data-nav-exempt` tells the input layer not to treat scrolling inside this
 * panel as a request to change scene.
 */
export function PanelFrame({ title, subtitle, accent, children, code }: PanelFrameProps) {
  const panelOpen = useExperience((s) => s.panelOpen);

  return (
    <section
      className={`panel ${panelOpen ? 'is-open' : 'is-collapsed'}`}
      style={{ '--accent': accent } as CSSProperties}
      data-nav-exempt
      aria-label={title}
    >
      <header className="panel__header">
        <div className="panel__heading">
          {code && <span className="panel__code">{code}</span>}
          <h2 className="panel__title">{title}</h2>
          {subtitle && <p className="panel__subtitle">{subtitle}</p>}
        </div>
        <div className="panel__header-tools">
          <button
            type="button"
            className="panel__tool"
            onClick={togglePanel}
            aria-expanded={panelOpen}
          >
            {panelOpen ? 'HIDE' : 'SHOW'}
          </button>
          <button type="button" className="panel__tool" onClick={returnToUniverse}>
            ← UNIVERSE
          </button>
        </div>
      </header>

      <div className="panel__scan" aria-hidden="true" />

      <div className="panel__body">{children}</div>

      <span className="panel__corner panel__corner--tl" aria-hidden="true" />
      <span className="panel__corner panel__corner--br" aria-hidden="true" />
    </section>
  );
}

/* ------------------------------------------------------------------ */

export function PanelBlock({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="panel__block">
      <h3 className="panel__block-title">{label}</h3>
      {children}
    </div>
  );
}

export function TagList({ items, accent }: { items: string[]; accent?: string }) {
  if (items.length === 0) return <p className="panel__empty">Nothing listed yet.</p>;
  return (
    <ul className="taglist">
      {items.map((item) => (
        <li
          key={item}
          className="taglist__item"
          style={accent ? ({ '--accent': accent } as CSSProperties) : undefined}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}

export default PanelFrame;
