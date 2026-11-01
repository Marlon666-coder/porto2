import { portfolio } from '@/data/portfolio';
import Reveal from '@/components/ui/Reveal';
import SafeImage from '@/components/ui/SafeImage';
import SectionHeader from '@/components/ui/SectionHeader';

function ListBlock({ title, items, numbered = false }: { title: string; items: string[]; numbered?: boolean }) {
  return (
    <div>
      <h3 className="mb-5 text-label uppercase text-mute-dark">{title}</h3>
      <Reveal as={numbered ? 'ol' : 'ul'} stagger={0.06} y={16} className="divide-y divide-ink/10 border-y border-ink/10">
        {items.map((item, index) => (
          <li key={item} className="flex gap-5 py-4 text-[1.0625rem] leading-relaxed tracking-[-0.01em]">
            {numbered ? (
              <span className="w-6 shrink-0 pt-0.5 font-mono text-label text-mute-dark">
                {String(index + 1).padStart(2, '0')}
              </span>
            ) : null}
            <span>{item}</span>
          </li>
        ))}
      </Reveal>
    </div>
  );
}

/**
 * Editorial About section on white.
 * Left: a short "at a glance" column an HR reader can scan in seconds.
 * Right: the full existing biography, principle and supporting lists.
 */
export function About() {
  const { about, education } = portfolio;
  const current = education[0];

  const glance = [
    { term: 'Name', value: about.name },
    { term: 'Role', value: about.role },
    ...(current
      ? [
          { term: 'University', value: current.institution },
          { term: 'Programme', value: `${current.program} · ${current.period}` },
        ]
      : []),
  ];

  return (
    <section id="about" tabIndex={-1} aria-labelledby="about-title" className="bg-paper py-24 text-ink outline-none md:py-36">
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader index="01" label="About" title="A digital identity, built across disciplines." titleId="about-title" tone="light" />

        <div className="grid gap-16 lg:grid-cols-12 lg:gap-10">
          {/* At a glance */}
          <aside className="lg:col-span-4">
            <div className="lg:sticky lg:top-28">
              <h3 className="mb-5 text-label uppercase text-mute-dark">At a glance</h3>
              <Reveal stagger={0.07} y={14}>
                {glance.map((row) => (
                  <dl key={row.term} className="border-t border-ink/10 py-4">
                    <dt className="text-label uppercase text-mute-dark">{row.term}</dt>
                    <dd className="mt-2 text-[1.0625rem] font-medium tracking-[-0.01em]">{row.value}</dd>
                  </dl>
                ))}
                <div className="border-t border-ink/10 py-4">
                  <p className="text-label uppercase text-mute-dark">Focus areas</p>
                  <ul className="mt-3 flex flex-wrap gap-2">
                    {about.focusAreas.map((area) => (
                      <li key={area} className="rounded-full border border-ink/15 px-3 py-1 text-[0.8125rem]">
                        {area}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
          </aside>

          {/* Story */}
          <div className="space-y-20 lg:col-span-8">
            <Reveal stagger={0.12} className="space-y-6">
              {about.introduction.map((paragraph, index) => (
                <p
                  key={paragraph}
                  className={
                    index === 0
                      ? 'text-headline font-medium'
                      : 'max-w-3xl text-lead text-mute-dark'
                  }
                >
                  {paragraph}
                </p>
              ))}
            </Reveal>

            {about.principle ? (
              <Reveal blur>
                <figure className="rounded-[1.75rem] bg-ink px-7 py-12 text-paper md:px-14 md:py-16">
                  <p className="mb-8 text-label uppercase text-mute">Guiding principle</p>
                  <blockquote className="text-headline font-semibold">
                    &ldquo;{about.principle.quote}&rdquo;
                  </blockquote>
                  {about.principle.original ? (
                    <p className="mt-5 text-lead italic text-mute">{about.principle.original}</p>
                  ) : null}
                  <figcaption className="mt-10 max-w-2xl border-t border-ink-2 pt-8 text-[1.0625rem] leading-relaxed text-mute">
                    {about.principle.meaning}
                  </figcaption>
                </figure>
              </Reveal>
            ) : null}

            {about.moments && about.moments.length > 0 ? (
              <div>
                <h3 className="mb-5 text-label uppercase text-mute-dark">In action</h3>
                <Reveal stagger={0.12} className="grid gap-5 sm:grid-cols-2">
                  {about.moments.map((moment) => (
                    <figure key={moment.image} className="group">
                      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-paper-2">
                        <SafeImage
                          src={moment.image}
                          alt={moment.caption}
                          sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
                          fallbackLabel="Photo"
                          className="object-cover grayscale transition-[filter,transform] duration-700 ease-out group-hover:scale-[1.03] group-hover:grayscale-0"
                        />
                      </div>
                      <figcaption className="mt-3 text-[0.9375rem] text-mute-dark">{moment.caption}</figcaption>
                    </figure>
                  ))}
                </Reveal>
              </div>
            ) : null}

            <div className="grid gap-14 md:grid-cols-2">
              <ListBlock title="Interests" items={about.interests} />
              <ListBlock title="Goals" items={about.goals} />
            </div>

            <ListBlock title="Learning journey" items={about.learningJourney} numbered />
          </div>
        </div>
      </div>
    </section>
  );
}

export default About;
