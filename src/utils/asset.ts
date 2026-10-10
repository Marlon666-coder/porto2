/**
 * Deployment-safe URL helpers.
 *
 * On GitHub Pages the site lives under `/<repository-name>/`, so a hardcoded
 * `/assets/...` path would 404. Vite injects the configured base path as
 * `import.meta.env.BASE_URL`; every local asset reference goes through here.
 *
 * Usage: store paths in `src/data/portfolio.ts` WITHOUT a leading slash
 * (`assets/images/portrait.jpg`) and resolve them with `assetUrl()`.
 */

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function assetUrl(path: string): string {
  if (!path) return '';
  const trimmed = path.trim();
  if (!trimmed) return '';
  // Already absolute (http, https, data, blob, mailto…) — leave untouched.
  if (ABSOLUTE.test(trimmed)) return trimmed;

  const base = import.meta.env.BASE_URL || '/';
  const normalisedBase = base.endsWith('/') ? base : `${base}/`;
  return `${normalisedBase}${trimmed.replace(/^\/+/, '')}`;
}

/**
 * Guards portfolio links. An unconfigured or malformed link returns null so the
 * UI can render an inert "not available" state instead of a dead anchor.
 */
export function safeLink(url: string | undefined | null): string | null {
  if (!url) return null;
  const value = url.trim();
  if (!value) return null;
  if (/^(mailto:|tel:)/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    try {
      // Throws on malformed URLs.
      new URL(value);
      return value;
    } catch {
      console.warn('[links] ignoring malformed URL:', value);
      return null;
    }
  }
  if (value.startsWith('/') || value.startsWith('./') || !value.includes(' ')) {
    // Treat bare domains as https.
    if (/^[\w-]+(\.[\w-]+)+(\/.*)?$/.test(value)) return `https://${value}`;
  }
  console.warn('[links] ignoring unrecognised URL:', value);
  return null;
}

/** Human-readable label for a link, used by the holographic terminals. */
export function linkLabel(url: string | null): string {
  if (!url) return 'awaiting configuration';
  return url.replace(/^https?:\/\//i, '').replace(/^mailto:/i, '');
}
