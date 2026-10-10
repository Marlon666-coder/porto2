import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * GitHub Pages deployment base path resolution.
 *
 * Priority:
 *   1. VITE_BASE_PATH environment variable (explicit override, e.g. "/my-repo/").
 *   2. GITHUB_REPOSITORY provided automatically by GitHub Actions ("owner/name").
 *      - "owner/owner.github.io"  -> "/"          (user/organisation root site)
 *      - "owner/my-repo"          -> "/my-repo/"  (project site)
 *   3. Fallback "/" (local dev, Netlify/Vercel/root hosting).
 *
 * Nothing is hardcoded, so the same source tree works for any repository name.
 */
function resolveBasePath(): string {
  const explicit = process.env.VITE_BASE_PATH?.trim();
  if (explicit) {
    if (explicit === '/' || explicit === './') return explicit;
    const withLeading = explicit.startsWith('/') ? explicit : `/${explicit}`;
    return withLeading.endsWith('/') ? withLeading : `${withLeading}/`;
  }

  const slug = process.env.GITHUB_REPOSITORY?.trim();
  if (slug && slug.includes('/')) {
    const repoName = slug.split('/')[1] ?? '';
    if (!repoName) return '/';
    // User / organisation pages are served from the domain root.
    if (repoName.toLowerCase().endsWith('.github.io')) return '/';
    return `/${repoName}/`;
  }

  return '/';
}

export default defineConfig(({ command }) => {
  const base = command === 'build' ? resolveBasePath() : '/';

  if (command === 'build') {
    // Surfaced in CI logs so a wrong base path is easy to spot.
    console.log(`[marlo-universe] building with base path: ${base}`);
  }

  return {
    base,
    plugins: [react()],
    server: {
      host: true,
      port: 5173,
    },
    preview: {
      port: 4173,
    },
    build: {
      target: 'es2020',
      outDir: 'dist',
      assetsDir: 'assets',
      sourcemap: false,
      chunkSizeWarningLimit: 1400,
      rollupOptions: {
        output: {
          manualChunks: {
            'vendor-three': ['three'],
            'vendor-r3f': ['@react-three/fiber', '@react-three/drei', '@react-three/postprocessing'],
            'vendor-gsap': ['gsap'],
            'vendor-react': ['react', 'react-dom'],
          },
        },
      },
    },
  };
});
