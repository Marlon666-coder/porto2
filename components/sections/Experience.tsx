import { portfolio } from '@/data/portfolio';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

/**
 * Organisation & volunteer experience, on white, as an editorial list.
 * Only rendered when the data file actually has entries.
 */
export function Experience() {
  const entries = portfolio.experience ?? [];
  if (entries.length === 0) return null;

  return (
    <section
      id="experience"
      tabIndex={-1}
      aria-labelledby="experience-title"
      className="bg-paper py-24 text-ink outline-none md:py-36"
    >
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader
          index="05"
          label="Experience"
          title="Leadership, in practice."
          titleId="experience-title"
          tone="light"
          intro="Organisation and volunteer roles where communication and responsibility were put to work."
        />

        <div className="border-t border-ink/10">
          {entries.map((entry) => (
            <Reveal key={entry.id} className="grid gap-6 border-b border-ink/10 py-10 md:grid-cols-12 md:gap-8 md:py-14">
              <div className="md:col-span-4">
                <p className="font-mono text-label uppercase text-mute-dark">{entry.period}</p>
                <h3 className="mt-4 text-title font-semibold">{entry.role}</h3>
                <p className="mt-1 text-[1rem] text-mute-dark">{entry.organisation}</p>
              </div>
              <div className="md:col-span-8">
                <p className="max-w-3xl text-lead text-mute-dark">{entry.description}</p>
                {entry.highlights && entry.highlights.length > 0 ? (
                  <ul className="mt-6 flex flex-wrap gap-2">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="rounded-full border border-ink/15 px-3 py-1 text-[0.8125rem]">
                        {highlight}
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}

export default Experience;
