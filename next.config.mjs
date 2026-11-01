/**
 * Static export for GitHub Pages.
 *
 * Base path resolution (production builds only):
 *   1. BASE_PATH env var, if set ("/" means domain root).
 *   2. GITHUB_REPOSITORY, provided automatically by GitHub Actions:
 *        owner/owner.github.io -> ""          (user site at the domain root)
 *        owner/porto2          -> "/porto2"   (project site)
 *   3. "" (local builds).
 * Nothing is hardcoded, so renaming the repository needs no code change.
 */
function resolveBasePath() {
  const explicit = process.env.BASE_PATH?.trim();
  if (explicit) {
    const trimmed = explicit.replace(/^\/+|\/+$/g, '');
    return trimmed ? `/${trimmed}` : '';
  }
  // Vercel (and other root hosts) serve from the domain root, so no prefix.
  // Vercel also exposes GITHUB_REPOSITORY, so this check must come first or the
  // GitHub Pages sub-path below would wrongly apply on Vercel and break assets.
  if (process.env.VERCEL) return '';
  const slug = process.env.GITHUB_REPOSITORY?.trim();
  if (slug && slug.includes('/')) {
    const repo = slug.split('/')[1] ?? '';
    if (!repo || repo.toLowerCase().endsWith('.github.io')) return '';
    return `/${repo}`;
  }
  return '';
}

const basePath = process.env.NODE_ENV === 'production' ? resolveBasePath() : '';

if (process.env.NODE_ENV === 'production') {
  console.log(`[portfolio] building with basePath: "${basePath || '/'}"`);
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath,
  trailingSlash: true,
  reactStrictMode: true,
  poweredByHeader: false,
  // Static hosting has no image optimisation server.
  images: { unoptimized: true },
  // Exposed to the client so plain asset paths (images, CV) get the prefix too.
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  // No ESLint setup in this repo; type errors still fail the build.
  eslint: { ignoreDuringBuilds: true },
};

export default nextConfig;
