/**
 * Imperative bridge between the DOM-side navigation controller and the single
 * camera rig living inside the R3F canvas.
 *
 * The navigation controller must be able to say "dive toward the ship, then
 * hold" without re-rendering React or owning the Three.js camera. The rig
 * registers its handlers here on mount and restores no-ops on unmount, so
 * calling into the bus is always safe — even before the canvas exists.
 */

import type { CameraPose } from '../types';

export interface CameraCommand {
  /** Poses are played in order as one GSAP timeline. */
  poses: CameraPose[];
  /** Mouse parallax strength for the resulting resting shot. */
  parallax?: number;
  /** Idle drift applied once the timeline settles. */
  drift?: { amplitude: number; speed: number };
  /** Global duration multiplier (reduced motion shortens everything). */
  motionScale?: number;
}

export interface CameraBus {
  /** Plays a camera path. Resolves when the timeline completes. */
  play: (command: CameraCommand) => Promise<void>;
  /** Teleports the rig instantly (used while a flare/warp hides the cut). */
  snap: (pose: CameraPose, parallax?: number, drift?: { amplitude: number; speed: number }) => void;
  /** Short, subtle impulse. Skipped entirely when reduced motion is on. */
  impulse: (strength: number, duration?: number) => void;
  /** Cancels any running timeline. */
  stop: () => void;
}

const noopBus: CameraBus = {
  play: () => Promise.resolve(),
  snap: () => undefined,
  impulse: () => undefined,
  stop: () => undefined,
};

export const cameraBus: CameraBus = {
  play: (command) => noopBus.play(command),
  snap: (...args) => noopBus.snap(...args),
  impulse: (...args) => noopBus.impulse(...args),
  stop: () => noopBus.stop(),
};

export function registerCameraBus(impl: Partial<CameraBus>): () => void {
  const previous: CameraBus = { ...cameraBus };
  Object.assign(cameraBus, impl);
  return () => {
    Object.assign(cameraBus, previous);
  };
}
