import { NOISE_2D } from './noiseHelpers';

/**
 * Volumetric-looking nebula sheet.
 * Several large additive billboards at different depths, each with slowly
 * drifting fbm, read as a single cloud with real internal structure.
 */

export const nebulaVertexShader = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaFragmentShader = /* glsl */ `
${NOISE_2D}

uniform float uTime;
uniform float uOpacity;
uniform float uScale;
uniform float uSeed;
uniform float uSoftness;
uniform vec3 uColorA;
uniform vec3 uColorB;

varying vec2 vUv;

void main() {
  vec2 centred = vUv - 0.5;
  vec2 p = centred * uScale + uSeed;

  float drift = uTime * 0.012;
  float base = fbm(p * 1.45 + vec2(drift, -drift * 0.63));
  float detail = fbm(p * 3.2 - vec2(drift * 0.8, drift * 0.41) + 17.0);
  float wisps = fbm(p * 6.5 + vec2(-drift * 1.4, drift * 0.9) + 41.0);

  float radial = 1.0 - smoothstep(0.0, uSoftness, length(centred));
  float density = pow(radial, 1.55) * (base * 0.72 + detail * 0.4 + wisps * 0.2);
  density = max(density - 0.06, 0.0);

  vec3 colour = mix(uColorA, uColorB, clamp(detail * 1.35, 0.0, 1.0));
  colour += vec3(0.08, 0.1, 0.22) * wisps;

  float alpha = density * uOpacity;
  if (alpha < 0.002) discard;

  gl_FragColor = vec4(colour * alpha * 2.1, alpha);
}
`;
