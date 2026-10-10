import { createRoot } from 'react-dom/client';
import App from './App';

const container = document.getElementById('root');

if (!container) {
  // Should be impossible (index.html ships the node), but failing loudly beats
  // a silently blank page.
  throw new Error('[marlo-universe] #root container is missing from index.html');
}

/**
 * StrictMode is intentionally omitted.
 *
 * Its development-only double mounting runs every effect twice, which for a
 * WebGL app means geometries and materials are disposed and re-uploaded, GSAP
 * timelines are built twice, and one-shot choreography (the hologram reveal)
 * fires twice. The result is dev behaviour that differs from production in ways
 * that hide real bugs rather than surface them. All cleanup here is explicit
 * and tested by actually unmounting worlds during navigation.
 */
createRoot(container).render(<App />);
