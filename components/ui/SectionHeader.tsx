import BlurText from './BlurText';
import Reveal from './Reveal';

interface SectionHeaderProps {
  /** Two-digit index shown in the label, e.g. "02". */
  index: string;
  label: string;
  title: string;
  intro?: string;
  /** id for the heading, referenced by the section's aria-labelledby. */
  titleId: string;
  tone: 'dark' | 'light';
}

/**
 * Shared section opening: a small index/label row with a hairline, then a large
 * heading. The repeated structure is what makes the page easy to scan.
 */
export function SectionHeader({ index, label, title, intro, titleId, tone }: SectionHeaderProps) {
  const muted = tone === 'dark' ? 'text-mute' : 'text-mute-dark';
  const rule = tone === 'dark' ? 'bg-ink-2' : 'bg-ink/10';

  return (
    <header className="mb-14 md:mb-20">
      <Reveal className={`mb-8 flex items-center gap-4 text-label uppercase ${muted}`}>
        <span className="font-mono">{index}</span>
        <span className={`h-px flex-1 ${rule}`} aria-hidden="true" />
        <span>{label}</span>
      </Reveal>
      <div className="grid gap-6 md:grid-cols-12 md:items-end">
        <BlurText id={titleId} text={title} as="h2" className="text-display font-semibold md:col-span-7" />
        {intro ? (
          <Reveal delay={0.15} className={`text-lead md:col-span-5 md:pb-2 ${muted}`}>
            <p>{intro}</p>
          </Reveal>
        ) : null}
      </div>
    </header>
  );
}

export default SectionHeader;
