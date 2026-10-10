import { useEffect } from 'react';
import { portfolio } from '../data/portfolio';
import { assetUrl, linkLabel, safeLink } from '../utils/asset';

/**
 * Graceful fallback for browsers without WebGL (or when the 3D tree fails to
 * start). It is not an apology page: the entire portfolio is here, fully
 * readable and fully linked, styled with the same sci-fi language in plain CSS.
 */
export function WebGLFallback({ reason }: { reason?: string }) {
  const { identity, about, projects, skills, education, certificates, contact } = portfolio;
  const portraitSrc = about.portrait ? assetUrl(about.portrait) : '';

  // The immersive build locks body scrolling; this is a normal document.
  useEffect(() => {
    document.body.classList.add('no-webgl');
    return () => document.body.classList.remove('no-webgl');
  }, []);

  return (
    <main className="fallback">
      <div className="fallback__stars" aria-hidden="true" />

      <header className="fallback__hero">
        <p className="fallback__eyebrow">{identity.welcomeLine}</p>
        <h1 className="fallback__title">{identity.displayName}</h1>
        <p className="fallback__descriptors">{identity.descriptors.join(' · ')}</p>
        <p className="fallback__note">
          {reason ??
            'Your browser could not start WebGL, so the immersive 3D experience is unavailable. Everything below is the same portfolio content in a lightweight form.'}
        </p>
      </header>

      <section className="fallback__section" id="about">
        <h2>About Me</h2>
        {portraitSrc && (
          <img
            className="fallback__portrait"
            src={portraitSrc}
            alt={about.portraitAlt || `Portrait of ${about.name}`}
            loading="lazy"
          />
        )}
        <p className="fallback__meta">{about.education}</p>
        {about.introduction.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
        <h3>Interests</h3>
        <p className="fallback__tags">{about.interests.join(' · ')}</p>
        <h3>Learning journey</h3>
        <ul>
          {about.learningJourney.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <h3>Goals</h3>
        <ul>
          {about.goals.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </section>

      <section className="fallback__section" id="projects">
        <h2>Projects</h2>
        <ul className="fallback__cards">
          {projects.map((project) => {
            const repo = safeLink(project.repository.url);
            const demo = safeLink(project.demo.url);
            return (
              <li key={project.id}>
                <h3>{project.title}</h3>
                <p className="fallback__meta">{project.tagline}</p>
                <p>{project.description}</p>
                {project.stack.length > 0 && (
                  <p className="fallback__tags">{project.stack.join(' · ')}</p>
                )}
                <p className="fallback__links">
                  {repo ? (
                    <a href={repo} target="_blank" rel="noopener noreferrer">
                      Repository
                    </a>
                  ) : (
                    <span>Repository not linked yet</span>
                  )}
                  {demo ? (
                    <a href={demo} target="_blank" rel="noopener noreferrer">
                      Live demo
                    </a>
                  ) : (
                    <span>No live demo yet</span>
                  )}
                </p>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="fallback__section" id="skills">
        <h2>Skills</h2>
        {skills.map((group) => (
          <div key={group.id}>
            <h3>{group.title}</h3>
            <p className="fallback__tags">{group.items.join(' · ')}</p>
          </div>
        ))}
      </section>

      <section className="fallback__section" id="education">
        <h2>Education</h2>
        {education.map((entry) => (
          <div key={entry.id}>
            <h3>{entry.institution}</h3>
            <p className="fallback__meta">
              {entry.program} · {entry.period}
            </p>
            {entry.detail && <p>{entry.detail}</p>}
            {entry.highlights && (
              <ul>
                {entry.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section className="fallback__section" id="certificates">
        <h2>Certificates</h2>
        <ul>
          {certificates.map((certificate) => {
            const verify = safeLink(certificate.verifyUrl);
            return (
              <li key={certificate.id}>
                <strong>{certificate.title}</strong> — {certificate.issuer} ({certificate.issued})
                {verify && (
                  <>
                    {' · '}
                    <a href={verify} target="_blank" rel="noopener noreferrer">
                      verify
                    </a>
                  </>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <section className="fallback__section" id="contact">
        <h2>{contact.heading}</h2>
        <p>{contact.message}</p>
        <ul>
          {contact.channels.map((channel) => {
            const href = channel.enabled ? safeLink(channel.href) : null;
            return (
              <li key={channel.id}>
                <strong>{channel.label}:</strong>{' '}
                {href ? (
                  <a href={href} target="_blank" rel="noopener noreferrer">
                    {channel.handle || linkLabel(href)}
                  </a>
                ) : (
                  <span>awaiting configuration</span>
                )}
              </li>
            );
          })}
        </ul>
      </section>

      <footer className="fallback__footer">
        <p>{identity.name} · {identity.location}</p>
      </footer>
    </main>
  );
}

export default WebGLFallback;
