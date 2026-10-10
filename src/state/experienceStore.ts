/**
 * Shared, low-frequency experience state.
 * Per-frame values (camera pose, uniforms) are intentionally NOT kept here.
 */

import type { StageId, TransitionKind, TransitionPhase } from '../types';
import { createStore, useStoreValue } from './store';

export type Phase = 'boot' | 'loading' | 'intro' | 'experience';
export type HologramPhase = 'dormant' | 'charging' | 'projecting' | 'stable' | 'map';

export interface ExperienceState {
  /** High level lifecycle of the page. */
  phase: Phase;
  /** 0 → 100. Mirrors real asset/warm-up progress, never a fake timer. */
  loadProgress: number;
  /** Message shown by the boot sequence. */
  bootMessageIndex: number;
  /** True once the 3D scene has rendered its first frames and is interactive. */
  sceneReady: boolean;

  /** Current place in the universe. */
  stage: StageId;
  previousStage: StageId | null;

  /** Animation lock — blocks overlapping camera timelines. */
  isTransitioning: boolean;
  transitionKind: TransitionKind;
  transitionPhase: TransitionPhase;

  /** Hologram reveal choreography. */
  hologramPhase: HologramPhase;

  /** UI */
  menuOpen: boolean;
  panelOpen: boolean;
  activeProjectId: string | null;
  activeCertificateId: string | null;
  hudVisible: boolean;

  /** Preferences */
  soundEnabled: boolean;
  reducedMotion: boolean;
  /** Set when the runtime FPS watchdog decides to drop visual load. */
  degraded: boolean;

  /** Environment capability */
  webglSupported: boolean;
}

export const initialExperienceState: ExperienceState = {
  phase: 'boot',
  loadProgress: 0,
  bootMessageIndex: 0,
  sceneReady: false,

  stage: 'awakening',
  previousStage: null,

  isTransitioning: false,
  transitionKind: 'glide',
  transitionPhase: 'idle',

  hologramPhase: 'dormant',

  menuOpen: false,
  panelOpen: false,
  activeProjectId: null,
  activeCertificateId: null,
  hudVisible: false,

  soundEnabled: false,
  reducedMotion: false,
  degraded: false,

  webglSupported: true,
};

export const experienceStore = createStore<ExperienceState>(initialExperienceState);

export function useExperience<S>(selector: (state: ExperienceState) => S): S {
  return useStoreValue(experienceStore, selector);
}

export const getExperience = experienceStore.getState;
export const setExperience = experienceStore.setState;
