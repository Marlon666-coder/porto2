import { useEffect, useRef, useState } from 'react';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import { closeCertificate, openCertificate } from '../../state/navigation';
import { useExperience } from '../../state/experienceStore';
import { assetUrl, linkLabel, safeLink } from '../../utils/asset';
import type { Certificate } from '../../types';
import PanelFrame from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.certificates;

function CertificateImage({ certificate, large }: { certificate: Certificate; large?: boolean }) {
  const [failed, setFailed] = useState(false);
  const src = certificate.image ? assetUrl(certificate.image) : '';
  const showImage = Boolean(src) && !failed;

  if (!showImage) {
    return (
      <div className={`cert-image cert-image--empty ${large ? 'is-large' : ''}`}>
        <span className="cert-image__grid" aria-hidden="true" />
        <span className="cert-image__glyph" aria-hidden="true">
          ⊘
        </span>
        <span className="cert-image__hint">EMPTY SLOT</span>
      </div>
    );
  }

  return (
    <div className={`cert-image ${large ? 'is-large' : ''}`}>
      <img
        src={src}
        alt={`${certificate.title} certificate`}
        loading="lazy"
        decoding="async"
        onError={() => {
          console.warn('[certificates] image failed to load:', src);
          setFailed(true);
        }}
      />
      <span className="cert-image__scanlines" aria-hidden="true" />
    </div>
  );
}

export function CertificateDetailModal() {
  const activeId = useExperience((s) => s.activeCertificateId);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (activeId) closeRef.current?.focus();
  }, [activeId]);

  if (!activeId) return null;
  const certificate = portfolio.certificates.find((entry) => entry.id === activeId);
  if (!certificate) {
    console.warn('[certificates] unknown certificate id:', activeId);
    return null;
  }

  const verify = safeLink(certificate.verifyUrl);

  return (
    <div
      className="modal"
      data-nav-exempt
      role="dialog"
      aria-modal="true"
      aria-label={certificate.title}
      onClick={(event) => {
        if (event.target === event.currentTarget) closeCertificate();
      }}
    >
      <article className="modal__panel">
        <header className="modal__header">
          <div>
            <p className="modal__eyebrow">CREDENTIAL RECORD</p>
            <h3 className="modal__title">{certificate.title}</h3>
            <p className="modal__tagline">
              {certificate.issuer} · {certificate.issued}
            </p>
          </div>
          <button
            ref={closeRef}
            type="button"
            className="modal__close"
            onClick={closeCertificate}
            aria-label="Close certificate"
          >
            ✕
          </button>
        </header>

        <div className="modal__body">
          <CertificateImage certificate={certificate} large />
          {certificate.isPlaceholder ? (
            <p className="modal__badge">
              Reserved slot. Add the certificate image to <code>public/assets/images/</code>, then
              fill in the title, issuer, date and optional verification link in{' '}
              <code>src/data/portfolio.ts</code>.
            </p>
          ) : (
            verify && (
              <div className="link-row">
                <a
                  className="link-chip link-chip--primary"
                  href={verify}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Verify credential
                  <em>{linkLabel(verify)}</em>
                </a>
              </div>
            )
          )}
        </div>
      </article>
    </div>
  );
}

export function CertificatesPanel() {
  const certificates = portfolio.certificates;
  const filled = certificates.filter((certificate) => !certificate.isPlaceholder).length;

  return (
    <PanelFrame
      title="Certificates"
      subtitle="Digital Archive · Credential Vault"
      accent={ACCENT}
      code="P05"
    >
      <p className="panel__lead">
        {filled > 0
          ? `${filled} credential${filled === 1 ? '' : 's'} on record. Select a plate to enlarge it.`
          : 'No credentials have been added yet — the slots below are reserved and ready.'}
      </p>

      <ul className="cert-grid">
        {certificates.map((certificate) => (
          <li key={certificate.id}>
            <button
              type="button"
              className={`cert-card ${certificate.isPlaceholder ? 'is-empty' : ''}`}
              onClick={() => openCertificate(certificate.id)}
            >
              <CertificateImage certificate={certificate} />
              <span className="cert-card__meta">
                <span className="cert-card__title">{certificate.title}</span>
                <span className="cert-card__issuer">{certificate.issuer}</span>
                <span className="cert-card__date">{certificate.issued}</span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <p className="panel__footnote">
        Edit the <code>certificates</code> array in <code>src/data/portfolio.ts</code> to fill these
        slots.
      </p>
    </PanelFrame>
  );
}

export default CertificatesPanel;
