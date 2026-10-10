/**
 * Live choreography values for the hologram reveal.
 *
 * GSAP tweens this plain object; the 3D components read it inside `useFrame`.
 * Keeping it outside React means the entire 10-beat activation sequence runs at
 * frame rate without triggering a single re-render, and the cockpit lights can
 * dim in sync with the projector from a different component.
 */
export interface HologramControl {
  /** Energy core intensity, 0 → 1. */
  charge: number;
  /** 0 while materialising (flicker + jitter active), 1 once locked in. */
  stability: number;
  /** Master text opacity. */
  opacity: number;
  /** Short bursts only — drives glitch bands and chromatic split. */
  glitch: number;
  /** Bottom-up materialisation wipe, 0 → 1. */
  reveal: number;
  /** Vertical projection beam intensity. */
  beam: number;
  /** How far the orbital rings have expanded, 0 → 1. */
  ringSpread: number;
  /** 0 → full cockpit lighting, 1 → fully dimmed for the projection. */
  lightDim: number;
}

export function createHologramControl(): HologramControl {
  return {
    charge: 0,
    stability: 0,
    opacity: 0,
    glitch: 0,
    reveal: 0,
    beam: 0,
    ringSpread: 0,
    lightDim: 0,
  };
}

export const STABLE_CONTROL: HologramControl = {
  charge: 1,
  stability: 1,
  opacity: 1,
  glitch: 0,
  reveal: 1,
  beam: 1,
  ringSpread: 1,
  lightDim: 0,
};

/** Shared singleton used by the cockpit set and the hologram stage. */
export const hologramControl: HologramControl = createHologramControl();

/** Secondary control for the descriptor lines, so they land after the name. */
export const descriptorControl: HologramControl = createHologramControl();

/** Control for the universe navigation map that replaces the welcome text. */
export const mapControl: HologramControl = createHologramControl();

export function resetHologramControls(): void {
  for (const control of [hologramControl, descriptorControl, mapControl]) {
    control.charge = 0;
    control.stability = 0;
    control.opacity = 0;
    control.glitch = 0;
    control.reveal = 0;
    control.beam = 0;
    control.ringSpread = 0;
    control.lightDim = 0;
  }
}
