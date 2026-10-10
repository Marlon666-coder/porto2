import { NOISE_2D } from './noiseHelpers';

/**
 * Procedural planet surface.
 *
 * No texture downloads: banded fbm over spherical coordinates produces cloud
 * belts and continents, lit by a single directional term with a soft
 * terminator, plus a night side that keeps a faint emissive glow so the planet
 * never reads as a flat black disc against the star field.
 */

export const planetVertexShader = /* glsl */ `
varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec3 vViewDir;

void main() {
  vLocalNormal = normalize(normal);
  vNormal = normalize(normalMatrix * normal);
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  vViewDir = normalize(-mvPosition.xyz);
  gl_Position = projectionMatrix * mvPosition;
}
`;

export const planetFragmentShader = /* glsl */ `
${NOISE_2D}

uniform float uTime;
uniform float uSeed;
uniform float uBandScale;
uniform float uTurbulence;
uniform float uAtmosphere;
uniform float uNightGlow;
uniform vec3 uLightDir;
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform vec3 uColorAtmo;

varying vec3 vNormal;
varying vec3 vLocalNormal;
varying vec3 vViewDir;

void main() {
  vec3 n = normalize(vLocalNormal);

  // Spherical parameterisation -> stable, seam-light banding.
  float lat = asin(clamp(n.y, -1.0, 1.0));
  float lon = atan(n.z, n.x);

  vec2 p = vec2(lon * 1.6, lat * uBandScale) + uSeed;
  float swirl = fbm(p * 1.1 + vec2(uTime * 0.008, 0.0));
  float bands = fbm(vec2(p.x * 0.55 + swirl * uTurbulence, p.y * 2.2));
  float detail = fbm(p * 4.3 + swirl * 1.7);

  float height = bands * 0.65 + detail * 0.35;

  vec3 surface = mix(uColorDeep, uColorMid, smoothstep(0.25, 0.58, height));
  surface = mix(surface, uColorHigh, smoothstep(0.58, 0.86, height));

  // Lighting with a cinematic soft terminator.
  vec3 lightDir = normalize(uLightDir);
  float ndl = dot(normalize(vNormal), lightDir);
  float day = smoothstep(-0.22, 0.42, ndl);

  vec3 lit = surface * (0.08 + day * 1.15);

  // Night side: faint self-illumination so silhouettes stay readable.
  float night = 1.0 - day;
  lit += uColorAtmo * uNightGlow * night * (0.35 + detail * 0.5);

  // Atmospheric rim.
  float fresnel = pow(1.0 - clamp(dot(normalize(vNormal), normalize(vViewDir)), 0.0, 1.0), 2.6);
  lit += uColorAtmo * fresnel * uAtmosphere * (0.35 + day * 0.9);

  gl_FragColor = vec4(lit, 1.0);
}
`;

/* ------------------------------------------------------------------ */

/**
 * Planetary ring plane: radial banding with Cassini-style gaps.
 *
 * Note on UVs: `THREE.RingGeometry` maps UVs across the bounding *box*, not
 * radially — uv.x is not the radius. So the radial parameter is derived from the
 * local vertex position instead, which is exact and also gives us the angle for
 * free.
 */
export const ringVertexShader = /* glsl */ `
varying vec2 vLocal;

void main() {
  vLocal = position.xy;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ringFragmentShader = /* glsl */ `
${NOISE_2D}

uniform float uInner;
uniform float uOuter;
uniform float uOpacity;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vLocal;

void main() {
  float radius = length(vLocal);
  float span = max(uOuter - uInner, 0.0001);
  float t = clamp((radius - uInner) / span, 0.0, 1.0);
  float angle = atan(vLocal.y, vLocal.x);

  // Angular variation keeps the rings from looking like perfect stencils.
  float bands = fbm(vec2(t * 46.0, angle * 1.6));
  float fine = fbm(vec2(t * 170.0, angle * 0.6 + 3.1));

  float gap = 1.0;
  gap *= smoothstep(0.012, 0.05, abs(t - 0.34));
  gap *= smoothstep(0.008, 0.04, abs(t - 0.57));
  gap *= smoothstep(0.006, 0.03, abs(t - 0.78));

  float density = (0.32 + bands * 0.6 + fine * 0.28) * gap;
  // Soften both edges so the ring fades into space.
  density *= smoothstep(0.0, 0.07, t) * (1.0 - smoothstep(0.9, 1.0, t));

  vec3 colour = mix(uColorA, uColorB, bands);
  float alpha = density * uOpacity;
  if (alpha < 0.004) discard;

  gl_FragColor = vec4(colour * (0.6 + fine * 0.6), alpha);
}
`;
