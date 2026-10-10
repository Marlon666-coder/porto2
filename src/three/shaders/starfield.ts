/**
 * Star / dust point shader.
 *
 * One `THREE.Points` draw call renders tens of thousands of stars. Size is
 * attenuated by true view-space distance, which is what sells the parallax:
 * near stars sweep past while deep stars barely move.
 */

export const starVertexShader = /* glsl */ `
attribute float aSize;
attribute float aTwinkle;
attribute vec3 aColor;

uniform float uTime;
uniform float uPixelRatio;
uniform float uSizeScale;
uniform float uFarFade;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec4 mvPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mvPosition;

  float dist = max(-mvPosition.z, 1.0);

  // Gentle, per-star twinkle. aTwinkle also acts as a phase offset.
  float twinkle = 0.62 + 0.38 * sin(uTime * (0.6 + aTwinkle * 1.8) + aTwinkle * 57.0);

  float size = aSize * uSizeScale * uPixelRatio * (340.0 / dist) * twinkle;
  gl_PointSize = clamp(size, 0.55, 30.0);

  // Fade the deepest layer so the field reads as volume, not a wall.
  float depthFade = 1.0 - smoothstep(uFarFade * 0.45, uFarFade, dist);
  float nearFade = smoothstep(0.0, 14.0, dist);

  vColor = aColor;
  vAlpha = twinkle * mix(0.25, 1.0, depthFade) * nearFade;
}
`;

export const starFragmentShader = /* glsl */ `
uniform float uOpacity;

varying vec3 vColor;
varying float vAlpha;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float dist = length(coord);
  if (dist > 0.5) discard;

  float core = 1.0 - smoothstep(0.0, 0.26, dist);
  float halo = 1.0 - smoothstep(0.12, 0.5, dist);

  float alpha = (core * 0.9 + pow(halo, 2.4) * 0.55) * vAlpha * uOpacity;
  if (alpha < 0.003) discard;

  vec3 colour = vColor * (0.55 + core * 1.1);
  gl_FragColor = vec4(colour, alpha);
}
`;
