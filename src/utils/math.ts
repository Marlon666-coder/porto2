export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Frame-rate independent exponential smoothing. */
export function damp(current: number, target: number, smoothing: number, delta: number): number {
  return lerp(current, target, 1 - Math.exp(-smoothing * delta));
}

/** Deterministic PRNG so every reload builds the identical star field. */
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function randomRange(rng: () => number, min: number, max: number): number {
  return min + rng() * (max - min);
}

/** Uniformly distributed point on a sphere of the given radius. */
export function pointOnSphere(rng: () => number, radius: number): [number, number, number] {
  const u = rng();
  const v = rng();
  const theta = u * Math.PI * 2;
  const phi = Math.acos(2 * v - 1);
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.sin(phi) * Math.sin(theta),
    radius * Math.cos(phi),
  ];
}

export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}
