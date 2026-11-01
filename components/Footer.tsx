import { portfolio } from '@/data/portfolio';
import { safeHref } from '@/lib/asset';

export function Footer() {
  const { about } = portfolio;
  const socials = portfolio.contact.channels.filter(
    (channel) => channel.enabled && safeHref(channel.href) && channel.id !== 'email' && channel.id !== 'whatsapp',
  );
  // Static export: the year is fixed at build time. suppressHydrationWarning covers a
  // build that happens just before New Year.
  const year = new Date().getFullYear();

  return (
    <footer className="bg-ink text-paper">
      <div className="mx-auto flex max-w-shell flex-col gap-6 border-t border-ink-2 px-5 py-10 text-[0.8125rem] text-mute md:flex-row md:items-center md:justify-between md:px-10">
        <p suppressHydrationWarning>
          © {year} {about.name}. All rights reserved.
        </p>
        <ul className="flex flex-wrap gap-6">
          {socials.map((channel) => (
            <li key={channel.id}>
              <a
                href={channel.href}
                target="_blank"
                rel="noopener noreferrer"
                className="transition-colors duration-300 hover:text-paper"
              >
                {channel.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </footer>
  );
}

export default Footer;
