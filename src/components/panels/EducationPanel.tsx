import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import PanelFrame from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.education;

export function EducationPanel() {
  const entries = portfolio.education;

  return (
    <PanelFrame
      title="Education"
      subtitle="Orbital Archive · Academic Record"
      accent={ACCENT}
      code="P04"
    >
      <ol className="timeline">
        {entries.map((entry) => (
          <li className="timeline__item" key={entry.id}>
            <span className="timeline__node" aria-hidden="true" />
            <div className="timeline__content">
              <p className="timeline__period">{entry.period}</p>
              <h3 className="timeline__institution">{entry.institution}</h3>
              <p className="timeline__program">{entry.program}</p>
              {entry.detail && <p className="panel__text">{entry.detail}</p>}
              {entry.highlights && entry.highlights.length > 0 && (
                <>
                  <h4 className="timeline__subheading">Coursework focus</h4>
                  <ul className="panel__bullets">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight}>{highlight}</li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </li>
        ))}
      </ol>

      <p className="panel__footnote">
        Edit the <code>education</code> array in <code>src/data/portfolio.ts</code> to update this
        record.
      </p>
    </PanelFrame>
  );
}

export default EducationPanel;
