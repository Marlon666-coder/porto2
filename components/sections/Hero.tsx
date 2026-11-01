import type { CSSProperties } from 'react';
import { portfolio } from '@/data/portfolio';
import { asset } from '@/lib/asset';
import MagneticButton from '@/components/ui/MagneticButton';
import ProfilePhoto from './ProfilePhoto';

/** The CV button always does something: download the file, or ask for it by email. */
function cvAction(): { href: string; label: string; download: boolean } {
  if (portfolio.cv) return { href: asset(portfolio.cv), label: 'Download CV', download: true };
  const email = portfolio.contact.channels.find((channel) => channel.id === 'email' && channel.enabled);
  const subject = encodeURIComponent(`CV request — ${portfolio.about.name}`);
  return {
    href: email ? `${email.href}?subject=${subject}` : '#contact',
    label: 'Request CV',
    download: false,
  };
}

const delay = (index: number) => ({ '--i': index }) as CSSProperties;

/**
 * Who, what, where — readable in the first few seconds.
 * The entrance is pure CSS so the content is never hidden waiting for scripts.
 */
export function Hero() {
  const { about, identity, projects, certificates, skills } = portfolio;
  const nameLines = about.name.split(' ');
  const cv = cvAction();
  const spoken = skills.find((group) => group.id === 'spoken-languages')?.items.length ?? 0;
  // Second paragraph of the existing bio, first sentence.
  const statement = about.introduction[1]?.split(/(?<=\.)\s/)[0] ?? '';

  const facts = [
    { value: String(projects.length), label: 'Live projects' },
    { value: String(certificates.length), label: 'Achievements' },
    { value: '30', label: "Juz of the Qur'an memorised" },
    { value: String(spoken), label: 'Languages' },
  ];

  return (
    <section
      id="top"
      tabIndex={-1}
      aria-labelledby="hero-title"
      className="relative overflow-hidden bg-ink pb-20 pt-28 text-paper outline-none md:pb-28 md:pt-36"
    >
      <div className="mx-auto grid max-w-shell gap-14 px-5 md:px-10 lg:grid-cols-12 lg:items-end lg:gap-10">
        <div className="lg:col-span-7">
          <p className="hero-fade mb-8 text-label uppercase text-mute" style={delay(0)}>
            Personal portfolio <span className="mx-2 text-ink-2">/</span> 2026
          </p>

          <h1 id="hero-title" className="text-hero font-semibold">
            {nameLines.map((line, index) => (
              <span key={line} className="hero-line block overflow-hidden pb-[0.06em]">
                <span style={delay(index + 1)}>{line}</span>
              </span>
            ))}
          </h1>

          <p className="hero-fade mt-10 max-w-xl text-title font-medium text-paper" style={delay(5)}>
            {about.role} at {identity.location}.
          </p>
          <p className="hero-fade mt-4 max-w-xl text-lead text-mute" style={delay(6)}>
            {statement}
          </p>

          <p className="hero-fade mt-6 flex flex-wrap gap-x-3 gap-y-1 text-label uppercase text-mute" style={delay(7)}>
            {identity.descriptors.map((descriptor, index) => (
              <span key={descriptor}>
                {index > 0 ? <span className="mr-3 text-ink-2">·</span> : null}
                {descriptor}
              </span>
            ))}
          </p>

          <div className="hero-fade mt-10 flex flex-wrap gap-3" style={delay(8)}>
            <MagneticButton href="#projects" tone="dark" variant="solid">
              Explore my work
            </MagneticButton>
            <MagneticButton
              href={cv.href}
              tone="dark"
              variant="outline"
              icon={cv.download ? 'download' : 'external'}
              download={cv.download}
              external={!cv.download && cv.href.startsWith('mailto:')}
            >
              {cv.label}
            </MagneticButton>
          </div>
        </div>

        <div className="hero-photo mx-auto w-full max-w-md lg:col-span-5 lg:max-w-none" style={delay(3)}>
          <ProfilePhoto src={about.portrait} alt={about.portraitAlt} caption={about.portraitAlt} />
        </div>
      </div>

      <div className="mx-auto mt-20 max-w-shell px-5 md:mt-28 md:px-10">
        <dl className="hero-fade grid grid-cols-2 border-t border-ink-2 md:grid-cols-4" style={delay(9)}>
          {facts.map((fact) => (
            <div key={fact.label} className="flex flex-col border-b border-ink-2 py-6 pr-4 md:border-b-0">
              <dt className="order-2 mt-2 text-label uppercase text-mute">{fact.label}</dt>
              <dd className="text-headline font-semibold">{fact.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

export default Hero;
