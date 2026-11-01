import { portfolio } from '@/data/portfolio';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * Skills as plain, scannable lists — no percentage bars or self-ratings.
 * Categories and items come straight from the existing content.
 */
export function Skills() {
  const groups = portfolio.skills;

  return (
    <section id="skills" tabIndex={-1} aria-labelledby="skills-title" className="bg-ink py-24 text-paper outline-none md:py-36">
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader
          index="04"
          label="Skills"
          title="Technical depth, human range."
          titleId="skills-title"
          tone="dark"
          intro={`${groups.length} areas, from code to communication.`}
        />

        <Reveal stagger={0.07} className="grid border-l border-t border-ink-2 sm:grid-cols-2 lg:grid-cols-4">
          {groups.map((group, index) => (
            <div key={group.id} className="group border-b border-r border-ink-2 p-7 transition-colors duration-500 hover:bg-ink-1 md:p-8">
              <p className="font-mono text-label text-mute">{String(index + 1).padStart(2, '0')}</p>
              <h3 className="mt-6 text-title font-semibold">{group.title}</h3>
              <ul className="mt-6 space-y-2.5">
                {group.items.map((item) => (
                  <li key={item} className="text-[0.9875rem] text-mute transition-colors duration-300 group-hover:text-paper">
                    {item}
                  </li>
                ))}
              </ul>
              {group.note ? <p className="mt-8 border-t border-ink-2 pt-5 text-[0.8125rem] text-mute">{group.note}</p> : null}
            </div>
          ))}
        </Reveal>
      </div>
    </section>
  );
}

export default Skills;
