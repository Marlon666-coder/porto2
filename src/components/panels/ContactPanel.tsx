import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS } from '../../data/worldLayout';
import { linkLabel, safeLink } from '../../utils/asset';
import type { ContactChannel } from '../../types';
import PanelFrame from './PanelFrame';

const ACCENT = DESTINATION_ACCENTS.contact;

const GLYPHS: Record<string, string> = {
  instagram: '◙',
  whatsapp: '✆',
  email: '✉',
  github: '⌥',
  linkedin: '⌗',
};

/**
 * One row of the communications terminal.
 *
 * A channel only becomes a real anchor when it is both enabled and carries a
 * URL that passes validation. Everything else renders as an inert
 * "awaiting configuration" row, so the terminal never offers a dead link.
 */
function ChannelRow({ channel }: { channel: ContactChannel }) {
  const href = channel.enabled ? safeLink(channel.href) : null;
  const glyph = GLYPHS[channel.id] ?? '◇';

  if (!href) {
    return (
      <li className="channel channel--pending">
        <span className="channel__glyph" aria-hidden="true">
          {glyph}
        </span>
        <span className="channel__content">
          <span className="channel__label">{channel.label}</span>
          <span className="channel__handle">awaiting configuration</span>
        </span>
        <span className="channel__status" aria-hidden="true">
          OFFLINE
        </span>
      </li>
    );
  }

  return (
    <li className="channel">
      <a
        className="channel__link"
        href={href}
        target={href.startsWith('mailto:') ? undefined : '_blank'}
        rel="noopener noreferrer"
      >
        <span className="channel__glyph" aria-hidden="true">
          {glyph}
        </span>
        <span className="channel__content">
          <span className="channel__label">{channel.label}</span>
          <span className="channel__handle">{channel.handle || linkLabel(href)}</span>
        </span>
        <span className="channel__status" aria-hidden="true">
          ONLINE
        </span>
      </a>
    </li>
  );
}

export function ContactPanel() {
  const contact = portfolio.contact;
  const online = contact.channels.filter(
    (channel) => channel.enabled && safeLink(channel.href),
  ).length;

  return (
    <PanelFrame
      title={contact.heading}
      subtitle="Communications Terminal"
      accent={ACCENT}
      code="P06"
    >
      <p className="panel__lead">{contact.message}</p>

      <div className="terminal">
        <div className="terminal__status">
          <span className={`terminal__beacon ${online > 0 ? 'is-live' : ''}`} aria-hidden="true" />
          <span>
            {online > 0
              ? `${online} channel${online === 1 ? '' : 's'} online`
              : 'No channels configured yet'}
          </span>
        </div>

        <ul className="channel-list">
          {contact.channels.map((channel) => (
            <ChannelRow key={channel.id} channel={channel} />
          ))}
        </ul>
      </div>

      <p className="panel__footnote">
        Add your real handles in <code>src/data/portfolio.ts</code> → <code>contact.channels</code>:
        set <code>href</code>, update <code>handle</code>, and switch <code>enabled</code> to{' '}
        <code>true</code>.
      </p>
    </PanelFrame>
  );
}

export default ContactPanel;
