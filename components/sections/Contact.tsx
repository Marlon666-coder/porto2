import { ArrowUpRight } from 'lucide-react';
import { portfolio } from '@/data/portfolio';
import { safeHref } from '@/lib/asset';
import BlurText from '@/components/ui/BlurText';
import MagneticButton from '@/components/ui/MagneticButton';
import Reveal from '@/components/ui/Reveal';

/** Closing section: one clear headline, then every real contact channel. */
export function Contact() {
  const channels = portfolio.contact.channels.filter((channel) => channel.enabled && safeHref(channel.href));
  const email = channels.find((channel) => channel.id === 'email');

  return (
    <section id="contact" tabIndex={-1} aria-labelledby="contact-title" className="bg-ink pb-16 pt-24 text-paper outline-none md:pt-36">
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <Reveal className="mb-8 flex items-center gap-4 text-label uppercase text-mute">
          <span className="font-mono">06</span>
          <span className="h-px flex-1 bg-ink-2" aria-hidden="true" />
          <span>Contact</span>
        </Reveal>

        <BlurText id="contact-title" as="h2" text="Let's build something meaningful." className="max-w-5xl text-hero font-semibold" stagger={0.08} />

        <div className="mt-14 grid gap-14 lg:grid-cols-12">
          <Reveal className="lg:col-span-5">
            <p className="max-w-md text-lead text-mute">{portfolio.contact.message}</p>
            {email ? (
              <div className="mt-10">
                <MagneticButton href={email.href} tone="dark" variant="solid" icon="external" external>
                  {email.handle}
                </MagneticButton>
              </div>
            ) : null}
          </Reveal>

          <Reveal as="ul" stagger={0.07} y={16} className="border-t border-ink-2 lg:col-span-7">
            {channels.map((channel) => {
              const external = !channel.href.startsWith('mailto:');
              return (
                <li key={channel.id} className="border-b border-ink-2">
                  <a
                    href={channel.href}
                    target={external ? '_blank' : undefined}
                    rel={external ? 'noopener noreferrer' : undefined}
                    className="group flex items-center justify-between gap-6 py-6 transition-[padding] duration-500 ease-out hover:px-3"
                  >
                    <span className="text-label uppercase text-mute">{channel.label}</span>
                    <span className="flex min-w-0 items-center gap-4">
                      <span className="truncate text-title font-medium">{channel.handle}</span>
                      <ArrowUpRight
                        aria-hidden="true"
                        className="h-5 w-5 shrink-0 text-mute transition-[transform,color] duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-paper"
                        strokeWidth={1.75}
                      />
                    </span>
                  </a>
                </li>
              );
            })}
          </Reveal>
        </div>
      </div>
    </section>
  );
}

export default Contact;
