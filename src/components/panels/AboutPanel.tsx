import { useState } from 'react';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import { assetUrl } from '../../utils/asset';
import type { AboutMoment } from '../../types';
import PanelFrame, { PanelBlock, TagList } from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.about;

/**
 * Holographic portrait frame.
 *
 * The treatment (cyan edge light, transparent scanlines, a sweeping scan beam,
 * layered glass, slight perspective) is applied with CSS to whatever real image
 * is configured. Nothing invents a photograph: while `about.portrait` is empty
 * — or if the configured file fails to load — the frame shows a clearly
 * labelled placeholder instead.
 */
function Portrait() {
  const { portrait, portraitAlt, name } = portfolio.about;
  const [failed, setFailed] = useState(false);
  const src = portrait ? assetUrl(portrait) : '';
  const showImage = Boolean(src) && !failed;

  return (
    <figure className="portrait">
      <div className="portrait__frame">
        {showImage ? (
          <img
            className="portrait__image"
            src={src}
            alt={portraitAlt || `Portrait of ${name}`}
            loading="lazy"
            decoding="async"
            onError={() => {
              console.warn('[about] portrait image failed to load:', src);
              setFailed(true);
            }}
          />
        ) : (
          <div className="portrait__placeholder">
            <span className="portrait__placeholder-glyph" aria-hidden="true">
              ⬡
            </span>
            <p className="portrait__placeholder-text">
              PORTRAIT SLOT
              <em>
                Add your photo to <code>public/assets/images/</code> and set{' '}
                <code>about.portrait</code> in <code>src/data/portfolio.ts</code>.
              </em>
            </p>
          </div>
        )}

        <span className="portrait__scanlines" aria-hidden="true" />
        <span className="portrait__sweep" aria-hidden="true" />
        <span className="portrait__edge" aria-hidden="true" />
        <span className="portrait__corner portrait__corner--tl" aria-hidden="true" />
        <span className="portrait__corner portrait__corner--tr" aria-hidden="true" />
        <span className="portrait__corner portrait__corner--bl" aria-hidden="true" />
        <span className="portrait__corner portrait__corner--br" aria-hidden="true" />
      </div>
      <figcaption className="portrait__caption">
        VISUAL ID · {name.toUpperCase()}
      </figcaption>
    </figure>
  );
}

/**
 * A single "in action" photo with the holographic treatment and a caption.
 * If the image hasn't been uploaded yet (or fails to load), it shows a labelled
 * placeholder instead of a broken image.
 */
function Moment({ moment }: { moment: AboutMoment }) {
  const [failed, setFailed] = useState(false);
  const src = moment.image ? assetUrl(moment.image) : '';
  const showImage = Boolean(src) && !failed;

  return (
    <figure className="moment">
      <div className="moment__frame">
        {showImage ? (
          <img
            className="moment__image"
            src={src}
            alt={moment.caption}
            loading="lazy"
            decoding="async"
            onError={() => {
              console.warn('[about] moment image failed to load:', src);
              setFailed(true);
            }}
          />
        ) : (
          <div className="moment__placeholder">
            <span aria-hidden="true">▣</span>
          </div>
        )}
        <span className="moment__scanlines" aria-hidden="true" />
        <span className="moment__edge" aria-hidden="true" />
      </div>
      <figcaption className="moment__caption">{moment.caption}</figcaption>
    </figure>
  );
}

export function AboutPanel() {
  const about = portfolio.about;

  return (
    <PanelFrame
      title="About Me"
      subtitle="Orbital Observatory · Deck 01"
      accent={ACCENT}
      code="P01"
    >
      <div className="about">
        <Portrait />

        <div className="about__body">
          <div className="about__identity">
            <p className="about__name">{about.name}</p>
            <p className="about__role">{about.role}</p>
            <p className="about__education">{about.education}</p>
          </div>

          <PanelBlock label="Introduction">
            {about.introduction.map((paragraph) => (
              <p key={paragraph} className="panel__text">
                {paragraph}
              </p>
            ))}
          </PanelBlock>

          {about.principle && (
            <figure className="creed">
              <span className="creed__mark" aria-hidden="true">
                “
              </span>
              <blockquote className="creed__quote">{about.principle.quote}</blockquote>
              {about.principle.original && (
                <p className="creed__original">{about.principle.original}</p>
              )}
              <figcaption className="creed__meaning">{about.principle.meaning}</figcaption>
            </figure>
          )}

          {about.moments && about.moments.length > 0 && (
            <PanelBlock label="In Action">
              <p className="panel__text">
                Not just a claim — moments of speaking, hosting and teaching in front of real
                audiences.
              </p>
              <div className="moments">
                {about.moments.map((moment) => (
                  <Moment key={moment.image} moment={moment} />
                ))}
              </div>
            </PanelBlock>
          )}

          <PanelBlock label="Interests">
            <TagList items={about.interests} accent={ACCENT} />
          </PanelBlock>

          <PanelBlock label="Learning Journey">
            <ol className="panel__steps">
              {about.learningJourney.map((step) => (
                <li key={step}>{step}</li>
              ))}
            </ol>
          </PanelBlock>

          <PanelBlock label="Goals">
            <ul className="panel__bullets">
              {about.goals.map((goal) => (
                <li key={goal}>{goal}</li>
              ))}
            </ul>
          </PanelBlock>

          <PanelBlock label="Areas of Interest">
            <TagList items={about.focusAreas} accent={ACCENT} />
          </PanelBlock>
        </div>
      </div>
    </PanelFrame>
  );
}

export default AboutPanel;
