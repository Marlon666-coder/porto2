import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import PanelFrame, { TagList } from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.skills;

/**
 * Skills are presented as honest category lists.
 *
 * There are deliberately no percentage bars or "expert / advanced" labels: no
 * proficiency data was supplied, so inventing it would be fabricating a claim.
 */
export function SkillsPanel() {
  const skills = portfolio.skills;

  return (
    <PanelFrame
      title="Skills"
      subtitle="Research Laboratory · Tech Index"
      accent={ACCENT}
      code="P03"
    >
      <p className="panel__lead">
        Technologies I work with, grouped by category. Each ring orbiting the reactor outside
        corresponds to one of these groups.
      </p>

      <div className="skills">
        {skills.map((group, index) => (
          <section className="skills__group" key={group.id}>
            <header className="skills__group-header">
              <span className="skills__group-index">{String(index + 1).padStart(2, '0')}</span>
              <h3 className="skills__group-title">{group.title}</h3>
            </header>
            <TagList items={group.items} accent={index % 2 === 0 ? ACCENT : '#00E5FF'} />
            {group.note && <p className="skills__note">{group.note}</p>}
          </section>
        ))}
      </div>

      <p className="panel__footnote">
        Edit the <code>skills</code> array in <code>src/data/portfolio.ts</code> to change these
        categories.
      </p>
    </PanelFrame>
  );
}

export default SkillsPanel;
