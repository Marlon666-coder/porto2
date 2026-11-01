import { portfolio } from '@/data/portfolio';
import Reveal from '@/components/ui/Reveal';
import SectionHeader from '@/components/ui/SectionHeader';

/** Education as an editorial timeline. */
export function Education() {
  const entries = portfolio.education;

  return (
    <section id="education" tabIndex={-1} aria-labelledby="education-title" className="bg-paper py-24 text-ink outline-none md:py-36">
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader index="06" label="Education" title="Where the foundation is built." titleId="education-title" tone="light" />

        <ol className="relative border-l border-ink/15 pl-8 md:ml-[25%] md:pl-14">
          {entries.map((entry) => (
            <li key={entry.id} className="relative pb-4">
              <span aria-hidden="true" className="absolute -left-[2.3rem] top-3 h-2.5 w-2.5 rounded-full bg-ink md:-left-[3.82rem]" />
              <Reveal>
                <p className="font-mono text-label uppercase text-mute-dark">{entry.period}</p>
                <h3 className="mt-4 text-headline font-semibold">{entry.institution}</h3>
                <p className="mt-2 text-title text-mute-dark">{entry.program}</p>
                {entry.detail ? <p className="mt-6 max-w-2xl text-lead">{entry.detail}</p> : null}
              </Reveal>
              {entry.highlights && entry.highlights.length > 0 ? (
                <div className="mt-10">
                  <h4 className="mb-4 text-label uppercase text-mute-dark">Coursework focus</h4>
                  <Reveal as="ul" stagger={0.06} y={14} className="grid gap-x-10 border-t border-ink/10 sm:grid-cols-2">
                    {entry.highlights.map((highlight) => (
                      <li key={highlight} className="border-b border-ink/10 py-4 text-[1.0625rem] tracking-[-0.01em]">
                        {highlight}
                      </li>
                    ))}
                  </Reveal>
                </div>
              ) : null}
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

export default Education;
