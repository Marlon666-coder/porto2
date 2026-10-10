/**
 * Shared transition timings (seconds).
 * Both the GSAP/JS choreography and the CSS overlay read these numbers, so the
 * light flare can never drift out of sync with the camera cut it is hiding.
 */
export const TRANSITION_TIMING = {
  /** Exterior -> interior light flare. */
  flareOut: 1.25,
  flareHold: 0.14,
  flareIn: 0.95,

  /** World-to-world warp. */
  warpOut: 0.72,
  warpHold: 0.12,
  warpIn: 1.05,
} as const;

export function scaled(seconds: number, motionScale: number): number {
  return Math.max(0.01, seconds * motionScale);
}

export function wait(seconds: number): Promise<void> {
  if (seconds <= 0) return Promise.resolve();
  return new Promise((resolve) => {
    window.setTimeout(resolve, seconds * 1000);
  });
}
