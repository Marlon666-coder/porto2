import { useEffect, useRef, useState } from 'react';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import { closeProject, openProject } from '../../state/navigation';
import { useExperience } from '../../state/experienceStore';
import { assetUrl, linkLabel, safeLink } from '../../utils/asset';
import type { Project } from '../../types';
import PanelFrame, { TagList } from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.projects;

/** Preview image with a procedural holographic fallback. */
function Preview({ project }: { project: Project }) {
  const [failed, setFailed] = useState(false);
  const src = project.image ? assetUrl(project.image) : '';
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div className="preview preview--placeholder" aria-hidden="true">
        <span className="preview__grid" />
        <span className="preview__glyph">⬡</span>
      </div>
    );
  }

  return (
    <div className="preview">
      <img
        src={src}
        alt={`${project.title} preview`}
        loading="lazy"
        decoding="async"
        onError={() => {
          console.warn('[projects] preview image failed to load:', src);
          setFailed(true);
        }}
      />
      <span className="preview__scanlines" aria-hidden="true" />
    </div>
  );
}

/** Renders a link, or an inert chip when the URL is not configured yet. */
function ProjectLinkButton({
  url,
  label,
  primary,
}: {
  url: string;
  label: string;
  primary?: boolean;
}) {
  const safe = safeLink(url);
  if (!safe) {
    return (
      <span className="link-chip link-chip--disabled" aria-disabled="true">
        {label} · not linked yet
      </span>
    );
  }
  return (
    <a
      className={`link-chip ${primary ? 'link-chip--primary' : ''}`}
      href={safe}
      target="_blank"
      rel="noopener noreferrer"
    >
      {label}
      <em>{linkLabel(safe)}</em>
    </a>
  );
}

export function ProjectDetailModal() {
  const activeProjectId = useExperience((s) => s.activeProjectId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeProjectId) closeRef.current?.focus();
  }, [activeProjectId]);

  if (!activeProjectId) return null;
  const project = portfolio.projects.find((entry) => entry.id === activeProjectId);
  if (!project) {
    console.warn('[projects] unknown project id:', activeProjectId);
    return null;
  }

  return (
    <div
      className="modal"
      data-nav-exempt
      role="dialog"
      aria-modal="true"
      aria-label={project.title}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeProject();
      }}
    >
      <article className="modal__panel">
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">PROJECT RECORD</p>
            <h3 className="modal__title">{project.title}</h3>
            <p className="modal__tagline">{project.tagline}</p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="modal__close"
            onClick={closeProject}
            aria-label="Close project details"
          >
            ✕
          </button>
        </header>

        <div className="modal__body">
          <Preview project={project} />
          {project.isExample && (
            <p className="modal__badge">
              Example slot — placeholder content, not a finished project.
            </p>
          )}
          <p className="panel__text">{project.description}</p>

          <h4 className="modal__subheading">Technology stack</h4>
          <TagList items={project.stack} accent={ACCENT} />

          <h4 className="modal__subheading">Links</h4>
          <div className="link-row">
            <ProjectLinkButton url={project.repository.url} label="GitHub repository" primary />
            <ProjectLinkButton url={project.demo.url} label="Live demo" />
          </div>
        </div>
      </article>
    </div>
  );
}

export function ProjectsPanel() {
  const projects = portfolio.projects;

  return (
    <PanelFrame
      title="Projects"
      subtitle="Hangar Bay · Build Archive"
      accent={ACCENT}
      code="P02"
    >
      <p className="panel__lead">
        Click a floating display in the hangar, or pick a bay below, to open the full record.
      </p>

      <ul className="project-list">
        {projects.map((project) => (
          <li key={project.id}>
            <button
              type="button"
              className="project-card"
              onClick={() => openProject(project.id)}
            >
              <Preview project={project} />
              <span className="project-card__content">
                <span className="project-card__title">{project.title}</span>
                <span className="project-card__tagline">{project.tagline}</span>
                {project.stack.length > 0 && (
                  <span className="project-card__stack">{project.stack.join(' · ')}</span>
                )}
                {project.status && <span className="project-card__status">{project.status}</span>}
              </span>
              <span className="project-card__cta" aria-hidden="true">
                OPEN →
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="panel__footnote">
        Projects are defined in <code>src/data/portfolio.ts</code> — edit the <code>projects</code>{' '}
        array to add your own.
      </p>
    </PanelFrame>
  );
}

export default ProjectsPanel;
