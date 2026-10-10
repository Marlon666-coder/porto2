/**
 * Spatial layout of the universe.
 *
 * Everything lives in one continuous coordinate system so the experience feels
 * like a single connected place rather than separate pages. The cinematic
 * voyage runs along the -Z corridor; the cockpit interior and the six
 * destinations sit in their own far-away regions and are mounted one at a time
 * (heavy worlds are swapped behind a flare / warp transition).
 */

import type { DestinationId, Triple } from '../types';

/** Deep-space voyage corridor landmarks. */
export const VOYAGE = {
  ringedPlanet: {
    position: [-82, -16, -158] as Triple,
    radius: 30,
  },
  distantGiant: {
    position: [120, 44, -520] as Triple,
    radius: 54,
  },
  asteroidBelt: {
    center: [16, -4, -286] as Triple,
    innerRadius: 46,
    outerRadius: 132,
  },
  spacecraft: {
    position: [0, 0, -430] as Triple,
    /** Hull length is roughly 46 units; used for approach framing. */
    scale: 1,
  },
  hostPlanet: {
    position: [78, -40, -660] as Triple,
    radius: 78,
  },
};

/** Origin of the spacecraft interior set. */
export const COCKPIT_ORIGIN: Triple = [0, 620, 420];

/** Origin of each destination world. Only one is ever mounted. */
export const DESTINATION_ORIGINS: Record<DestinationId, Triple> = {
  about: [1500, 80, -980],
  projects: [-1620, -90, -1320],
  skills: [1740, 160, -1700],
  education: [-1840, 220, -2120],
  certificates: [1320, -240, -2520],
  contact: [-1420, -160, -2960],
};

/** Accent colour per destination — drives HUD, lighting and panel glow. */
export const DESTINATION_ACCENTS: Record<DestinationId, string> = {
  about: '#00E5FF',
  projects: '#4287FF',
  skills: '#9D4EDD',
  education: '#00E5FF',
  certificates: '#FF38C7',
  contact: '#4287FF',
};

/** Shared palette, mirrored in CSS custom properties. */
export const PALETTE = {
  deepSpace: '#03040B',
  cosmicNavy: '#080D24',
  electricCyan: '#00E5FF',
  holoBlue: '#4287FF',
  neonViolet: '#9D4EDD',
  plasmaMagenta: '#FF38C7',
  iceWhite: '#F4F7FF',
} as const;

/** Helper: offset a local coordinate by a world origin. */
export function at(origin: Triple, local: Triple): Triple {
  return [origin[0] + local[0], origin[1] + local[1], origin[2] + local[2]];
}
