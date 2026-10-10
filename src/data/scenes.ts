/**
 * Scene definitions: the authored camera choreography of the whole experience.
 *
 * Each scene owns a camera *path* (one or more poses). GSAP plays the poses in
 * order, so a single navigation step can be a multi-beat move — e.g. swinging
 * wide before settling on the ringed planet.
 */

import type { CameraPose, DestinationId, SceneDefinition, StageId, Triple } from '../types';
import {
  COCKPIT_ORIGIN,
  DESTINATION_ACCENTS,
  DESTINATION_ORIGINS,
  VOYAGE,
  at,
} from './worldLayout';

const C = COCKPIT_ORIGIN;

/* ------------------------------------------------------------------ */
/* Cinematic sequence                                                  */
/* ------------------------------------------------------------------ */

const cinematicScenes: SceneDefinition[] = [
  {
    id: 'awakening',
    label: 'Awakening',
    caption: 'Scene 01 — Awakening in darkness',
    world: 'voyage',
    parallax: 0.35,
    drift: { amplitude: 0.5, speed: 0.08 },
    path: [
      {
        position: [0, 0, 54],
        target: [0, 0, -60],
        fov: 48,
        duration: 2.6,
        ease: 'power2.inOut',
      },
    ],
  },
  {
    id: 'starfield',
    label: 'Star Field',
    caption: 'Scene 02 — Entering the star field',
    world: 'voyage',
    parallax: 1,
    drift: { amplitude: 0.9, speed: 0.12 },
    path: [
      {
        position: [0, 3, -18],
        target: [-6, 1, -140],
        fov: 64,
        duration: 3.4,
        ease: 'power2.inOut',
      },
    ],
  },
  {
    id: 'ringed-planet',
    label: 'Ringed Giant',
    caption: 'Scene 03 — Flying past a gigantic ringed planet',
    world: 'voyage',
    parallax: 0.9,
    drift: { amplitude: 0.7, speed: 0.1 },
    path: [
      {
        position: [-4, 9, -74],
        target: VOYAGE.ringedPlanet.position,
        fov: 62,
        duration: 2.2,
        ease: 'power1.inOut',
      },
      {
        position: [-26, 14, -124],
        target: VOYAGE.ringedPlanet.position,
        fov: 58,
        duration: 3.2,
        ease: 'power2.inOut',
      },
    ],
  },
  {
    id: 'asteroid-belt',
    label: 'Asteroid Belt',
    caption: 'Scene 04 — Passing through an asteroid belt',
    world: 'voyage',
    parallax: 1.15,
    drift: { amplitude: 1.3, speed: 0.22 },
    path: [
      {
        position: [-4, 6, -200],
        target: [16, -2, -290],
        fov: 66,
        duration: 2.4,
        ease: 'power1.in',
      },
      {
        position: [14, -1, -258],
        target: [18, -5, -340],
        fov: 72,
        duration: 2.8,
        ease: 'power2.out',
      },
    ],
  },
  {
    id: 'ship-approach',
    label: 'Spacecraft',
    caption: 'Scene 05 — Approaching a futuristic spacecraft',
    world: 'voyage',
    parallax: 0.75,
    drift: { amplitude: 0.6, speed: 0.1 },
    path: [
      {
        position: [58, 26, -352],
        target: VOYAGE.spacecraft.position,
        fov: 62,
        duration: 2.6,
        ease: 'power1.inOut',
      },
      {
        position: [30, 11, -386],
        target: [0, 1, -430],
        fov: 56,
        duration: 3.4,
        ease: 'power2.inOut',
      },
    ],
  },
  {
    id: 'cockpit-entry',
    label: 'Cockpit',
    caption: 'Scene 06 — Entering the spacecraft cockpit',
    world: 'cockpit',
    parallax: 0.5,
    drift: { amplitude: 0.1, speed: 0.14 },
    path: [
      {
        position: at(C, [0, 1.8, 11.5]),
        target: at(C, [0, 1.5, -3]),
        fov: 70,
        duration: 0.01,
      },
      {
        position: at(C, [0, 1.75, 7.4]),
        target: at(C, [0, 1.45, -4]),
        fov: 62,
        duration: 3.6,
        ease: 'power2.out',
      },
    ],
  },
  {
    id: 'hologram',
    label: 'Hologram',
    caption: 'Scene 07 — Activating the central hologram',
    world: 'cockpit',
    parallax: 0.35,
    drift: { amplitude: 0.07, speed: 0.16 },
    path: [
      {
        position: at(C, [0, 1.95, 5.3]),
        target: at(C, [0, 2.15, -0.6]),
        fov: 55,
        duration: 2.8,
        ease: 'power2.inOut',
      },
    ],
  },
  {
    id: 'universe',
    label: 'Universe Map',
    caption: 'Scene 08 — Exploring the portfolio universe',
    world: 'cockpit',
    parallax: 0.45,
    drift: { amplitude: 0.1, speed: 0.13 },
    path: [
      {
        position: at(C, [0, 2.75, 7.2]),
        target: at(C, [0, 1.95, -0.8]),
        fov: 60,
        duration: 2.4,
        ease: 'power2.inOut',
      },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Destinations                                                        */
/* ------------------------------------------------------------------ */

interface DestinationSpec {
  id: DestinationId;
  label: string;
  caption: string;
  /** Camera pose relative to the destination world origin. */
  arrival: { position: Triple; target: Triple; fov: number };
  settle: { position: Triple; target: Triple; fov: number };
  parallax: number;
  drift: { amplitude: number; speed: number };
}

const destinationSpecs: DestinationSpec[] = [
  {
    id: 'about',
    label: 'About Me',
    caption: 'Planet 01 — Orbital observatory above a glowing world',
    arrival: { position: [0, 10, 46], target: [0, 1, -10], fov: 72 },
    settle: { position: [1.6, 2.4, 15.5], target: [0.4, 1.4, -4], fov: 56 },
    parallax: 0.8,
    drift: { amplitude: 0.22, speed: 0.11 },
  },
  {
    id: 'projects',
    label: 'Projects',
    caption: 'Planet 02 — Futuristic spaceship hangar',
    arrival: { position: [-6, 18, 54], target: [0, 2, -8], fov: 74 },
    settle: { position: [0, 3.1, 19], target: [0, 2.1, -6], fov: 58 },
    parallax: 0.7,
    drift: { amplitude: 0.2, speed: 0.1 },
  },
  {
    id: 'skills',
    label: 'Skills',
    caption: 'Planet 03 — Technology laboratory in orbit',
    arrival: { position: [8, 16, 50], target: [0, 2, -6], fov: 74 },
    settle: { position: [0, 2.6, 17.5], target: [0, 2.2, -3], fov: 57 },
    parallax: 0.85,
    drift: { amplitude: 0.26, speed: 0.13 },
  },
  {
    id: 'education',
    label: 'Education',
    caption: 'Planet 04 — Orbital archive and luminous timeline',
    arrival: { position: [-10, 14, 48], target: [0, 2, -8], fov: 72 },
    settle: { position: [0.5, 2.9, 16.5], target: [0, 2.3, -5], fov: 56 },
    parallax: 0.7,
    drift: { amplitude: 0.2, speed: 0.09 },
  },
  {
    id: 'certificates',
    label: 'Certificates',
    caption: 'Planet 05 — Futuristic digital archive',
    arrival: { position: [6, 20, 52], target: [0, 2, -8], fov: 74 },
    settle: { position: [0, 2.7, 18], target: [0, 2.2, -5], fov: 57 },
    parallax: 0.75,
    drift: { amplitude: 0.22, speed: 0.12 },
  },
  {
    id: 'contact',
    label: 'Contact',
    caption: 'Planet 06 — Communications terminal',
    arrival: { position: [0, 12, 44], target: [0, 2, -6], fov: 72 },
    settle: { position: [0, 2.5, 14.5], target: [0, 2.1, -4], fov: 55 },
    parallax: 0.65,
    drift: { amplitude: 0.18, speed: 0.1 },
  },
];

const destinationScenes: SceneDefinition[] = destinationSpecs.map((spec) => {
  const origin = DESTINATION_ORIGINS[spec.id];
  return {
    id: spec.id,
    label: spec.label,
    caption: spec.caption,
    world: 'destination',
    isDestination: true,
    worldOrigin: origin,
    accent: DESTINATION_ACCENTS[spec.id],
    parallax: spec.parallax,
    drift: spec.drift,
    path: [
      {
        position: at(origin, spec.arrival.position),
        target: at(origin, spec.arrival.target),
        fov: spec.arrival.fov,
        duration: 0.01,
      },
      {
        position: at(origin, spec.settle.position),
        target: at(origin, spec.settle.target),
        fov: spec.settle.fov,
        duration: 3.1,
        ease: 'power3.out',
      },
    ],
  };
});

/* ------------------------------------------------------------------ */
/* Public API                                                          */
/* ------------------------------------------------------------------ */

export const scenes: SceneDefinition[] = [...cinematicScenes, ...destinationScenes];

export const sceneMap: Record<StageId, SceneDefinition> = scenes.reduce(
  (acc, scene) => {
    acc[scene.id] = scene;
    return acc;
  },
  {} as Record<StageId, SceneDefinition>,
);

/** Global navigation order used by next / previous and the wheel + arrow keys. */
export const navigationOrder: StageId[] = scenes.map((s) => s.id);

export const cinematicOrder: StageId[] = cinematicScenes.map((s) => s.id);

export const destinationOrder: DestinationId[] = destinationSpecs.map((s) => s.id);

export function getScene(id: StageId): SceneDefinition {
  return sceneMap[id] ?? sceneMap.awakening;
}

export function isDestination(id: StageId): id is DestinationId {
  return Boolean(sceneMap[id]?.isDestination);
}

/**
 * Pre-flare push used by the exterior -> interior transition. The camera dives
 * toward the cockpit window so the light flare has real momentum behind it.
 */
export const SHIP_ENTRY_PUSH: CameraPose = {
  position: [1.5, 2.2, -411],
  target: [0, 1.2, -452],
  fov: 94,
  duration: 1.25,
  ease: 'power3.in',
};

/** Resting pose of the very first frame, before any navigation happens. */
export const INITIAL_POSE: CameraPose = {
  position: [0, 0, 92],
  target: [0, 0, -40],
  fov: 42,
};
