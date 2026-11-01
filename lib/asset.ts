/**
 * Deployment-safe asset URLs.
 *
 * On GitHub Pages the site lives under `/<repo>/`. `next/link` adds that prefix
 * automatically, but plain image paths and file downloads do not, so every
 * local asset goes through `asset()`.
 */

export const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? '';

const ABSOLUTE = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

export function asset(path: string): string {
  const value = path?.trim();
  if (!value) return '';
  if (ABSOLUTE.test(value)) return value;
  return `${BASE_PATH}/${value.replace(/^\/+/, '')}`;
}

/** Returns the URL if it is a usable external/mail link, otherwise null. */
export function safeHref(url: string | undefined | null): string | null {
  const value = url?.trim();
  if (!value) return null;
  if (/^(mailto:|tel:)/i.test(value)) return value;
  if (/^https?:\/\//i.test(value)) {
    try {
      new URL(value);
      return value;
    } catch {
      return null;
    }
  }
  return null;
}
