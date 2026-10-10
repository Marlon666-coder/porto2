import { NOISE_2D } from './noiseHelpers';

/**
 * ============================================================================
 *  HOLOGRAM SHADERS — the visual centrepiece
 * ============================================================================
 */

export const hologramTextVertexShader = /* glsl */ `
uniform float uTime;
uniform float uStability;
uniform float uJitter;

varying vec2 vUv;

void main() {
  vUv = uv;

  vec3 transformed = position;

  // While materialising, the slab shivers very slightly — it settles to
  // perfectly still once uStability reaches 1.0, so the final text is crisp.
  float unsettled = 1.0 - uStability;
  transformed.x += sin(uTime * 34.0 + position.y * 7.0) * 0.012 * unsettled * uJitter;
  transformed.z += cos(uTime * 27.0 + position.x * 5.0) * 0.008 * unsettled * uJitter;

  gl_Position = projectionMatrix * modelViewMatrix * vec4(transformed, 1.0);
}
`;

/**
 * Layered holographic type:
 *  - RGB-split sampling of the glyph alpha mask (chromatic distortion)
 *  - horizontal glitch bands, driven by uGlitch and therefore always brief
 *  - fine scanlines + a travelling scan sweep
 *  - bottom-up materialisation wipe tied to uStability
 *
 * The flicker term is multiplied by (1 - uStability), so once the hologram has
 * stabilised it stops flickering entirely and simply stays readable.
 */
export const hologramTextFragmentShader = /* glsl */ `
${NOISE_2D}

uniform sampler2D uMap;
uniform float uTime;
uniform float uStability;
uniform float uOpacity;
uniform float uGlitch;
uniform float uAberration;
uniform float uScanStrength;
uniform float uReveal;
uniform vec3 uColorCore;
uniform vec3 uColorEdge;

varying vec2 vUv;

void main() {
  vec2 uv = vUv;

  // --- glitch bands (brief, purposeful) --------------------------------
  float band = floor(uv.y * 42.0);
  float bandNoise = hash11(band + floor(uTime * 16.0) * 1.7);
  uv.x += (bandNoise - 0.5) * 0.14 * uGlitch;

  // --- chromatic split -------------------------------------------------
  float split = uAberration * (0.0018 + 0.012 * uGlitch);
  float r = texture2D(uMap, uv + vec2(split, 0.0)).a;
  float g = texture2D(uMap, uv).a;
  float b = texture2D(uMap, uv - vec2(split, 0.0)).a;
  float mask = max(max(r, g), b);
  if (mask < 0.004) discard;

  // --- colour ----------------------------------------------------------
  vec3 chroma = vec3(r, g, b);
  vec3 colour = mix(uColorCore, uColorEdge, clamp(uv.y, 0.0, 1.0));
  colour = colour * (0.55 + g * 0.85) + chroma * 0.35;

  // --- scanlines + travelling sweep ------------------------------------
  float scan = 1.0 - uScanStrength * 0.5 * (0.5 + 0.5 * sin(uv.y * 520.0 - uTime * 5.0));
  float sweepPos = fract(uv.y * 0.75 - uTime * 0.16);
  float sweep = 1.0 - smoothstep(0.0, 0.055, abs(sweepPos - 0.5));
  colour += uColorCore * sweep * 0.55 * uStability;

  // --- bottom-up materialisation wipe ----------------------------------
  float wipe = smoothstep(uReveal - 0.22, uReveal + 0.04, 1.0 - uv.y);

  // --- controlled flicker (vanishes once stable) ------------------------
  float flicker = 1.0 - 0.12 * (1.0 - uStability) * hash11(floor(uTime * 24.0));

  float alpha = mask * uOpacity * scan * flicker * wipe;
  alpha *= mix(0.35, 1.0, uStability);
  if (alpha < 0.004) discard;

  gl_FragColor = vec4(colour * (1.0 + sweep * 0.8), alpha);
}
`;

/* ------------------------------------------------------------------ */

/** Energy core: fresnel-lit plasma sphere with rolling internal bands. */
export const energyCoreVertexShader = /* glsl */ `
uniform float uTime;
uniform float uCharge;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;

void main() {
  vLocal = position;
  vNormal = normalize(normalMatrix * normal);

  vec3 displaced = position;
  float pulse = sin(uTime * 2.1 + position.y * 3.4) * 0.5 + 0.5;
  displaced += normal * pulse * 0.055 * uCharge;

  vec4 mvPosition = modelViewMatrix * vec4(displaced, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const energyCoreFragmentShader = /* glsl */ `
${NOISE_2D}

uniform float uTime;
uniform float uCharge;
uniform vec3 uColorInner;
uniform vec3 uColorOuter;

varying vec3 vNormal;
varying vec3 vViewDir;
varying vec3 vLocal;

void main() {
  float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.2);

  vec2 flowUv = vec2(atan(vLocal.z, vLocal.x) * 0.6, vLocal.y * 1.5 - uTime * 0.25);
  float plasma = fbm(flowUv * 2.4);
  float bands = 0.5 + 0.5 * sin(vLocal.y * 22.0 - uTime * 3.4 + plasma * 6.0);

  vec3 colour = mix(uColorInner, uColorOuter, fresnel * 0.85 + bands * 0.25);
  float intensity = (0.35 + plasma * 0.65) * (0.4 + uCharge * 1.4);

  float alpha = clamp((fresnel * 0.9 + 0.35) * uCharge, 0.0, 1.0);
  gl_FragColor = vec4(colour * intensity, alpha);
}
`;

/* ------------------------------------------------------------------ */

/** Atmospheric rim glow shell used around planets and the energy core. */
export const glowVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const glowFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uIntensity;
uniform float uPower;

varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  float fresnel = pow(
    1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0),
    uPower
  );
  float alpha = fresnel * uIntensity;
  if (alpha < 0.002) discard;
  gl_FragColor = vec4(uColor * alpha, alpha);
}
`;

/* ------------------------------------------------------------------ */

/** Vertical projection beam rising from the hologram platform. */
export const beamVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const beamFragmentShader = /* glsl */ `
${NOISE_2D}

uniform float uTime;
uniform float uIntensity;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  // Soft at the top, bright at the base.
  float vertical = pow(1.0 - vUv.y, 1.7);
  float edge = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float rim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 1.4);

  float flow = fbm(vec2(vUv.x * 5.0, vUv.y * 2.4 - uTime * 0.45));
  float strands = 0.55 + 0.45 * sin(vUv.x * 60.0 + uTime * 2.0);

  float alpha = vertical * edge * (0.45 + rim * 0.75) * (0.5 + flow * 0.8) * uIntensity;
  alpha *= 0.65 + strands * 0.35;
  if (alpha < 0.002) discard;

  gl_FragColor = vec4(uColor * alpha * 1.6, alpha);
}
`;

/* ------------------------------------------------------------------ */

/** Holographic surface used for rings, consoles, panels and platforms. */
export const holoSurfaceVertexShader = /* glsl */ `
varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

void main() {
  vUv = uv;
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const holoSurfaceFragmentShader = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform float uGridScale;
uniform float uGridWidth;
uniform float uScanSpeed;
uniform vec3 uColor;

varying vec2 vUv;
varying vec3 vNormal;
varying vec3 vViewDir;

float gridLine(float value, float width) {
  float f = abs(fract(value) - 0.5);
  return 1.0 - smoothstep(0.0, width, f);
}

void main() {
  float gx = gridLine(vUv.x * uGridScale, uGridWidth);
  float gy = gridLine(vUv.y * uGridScale, uGridWidth);
  float grid = clamp(gx + gy, 0.0, 1.0);

  float scan = 1.0 - smoothstep(0.0, 0.06, abs(fract(vUv.y - uTime * uScanSpeed) - 0.5));
  float rim = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 1.8);

  float alpha = (0.1 + grid * 0.55 + scan * 0.35 + rim * 0.5) * uOpacity;
  if (alpha < 0.003) discard;

  vec3 colour = uColor * (0.5 + grid * 0.7 + scan * 1.1 + rim * 0.6);
  gl_FragColor = vec4(colour, alpha);
}
`;
