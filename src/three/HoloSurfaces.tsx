import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triple } from '../types';
import {
  beamFragmentShader,
  beamVertexShader,
  holoSurfaceFragmentShader,
  holoSurfaceVertexShader,
} from './shaders/hologram';
import type { HologramControl } from './hologramControl';

/* ------------------------------------------------------------------ */
/* Projection beam                                                     */
/* ------------------------------------------------------------------ */

export interface ProjectionBeamProps {
  control: HologramControl;
  radius?: number;
  height?: number;
  color?: string;
  position?: Triple;
}

/** The vertical energy beam that rises from the platform before the reveal. */
export function ProjectionBeam({
  control,
  radius = 1.15,
  height = 3.4,
  color = '#00E5FF',
  position = [0, 0, 0],
}: ProjectionBeamProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(() => {
    const geo = new THREE.CylinderGeometry(radius * 0.72, radius, height, 40, 1, true);
    // Move the origin to the base so scale.y grows the beam upward out of the
    // platform rather than outward from its centre.
    geo.translate(0, height / 2, 0);
    return geo;
  }, [radius, height]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVertexShader,
        fragmentShader: beamFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uIntensity: { value: 0 },
          uColor: { value: new THREE.Color(color) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [color],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uIntensity.value = control.beam;
    if (meshRef.current) {
      meshRef.current.scale.y = 0.2 + control.beam * 0.8;
      meshRef.current.visible = control.beam > 0.004;
    }
  });

  return (
    <mesh ref={meshRef} geometry={geometry} material={material} position={position} visible={false} />
  );
}

/* ------------------------------------------------------------------ */
/* Holographic grid surface                                            */
/* ------------------------------------------------------------------ */

export interface HoloSurfaceProps {
  width: number;
  height: number;
  position?: Triple;
  rotation?: Triple;
  color?: string;
  opacity?: number;
  gridScale?: number;
  scanSpeed?: number;
  /** Optional extra frame outline. */
  frame?: boolean;
  radial?: boolean;
}

/**
 * A translucent holographic plane with grid, scanline and rim glow.
 * Used for consoles, platforms, project frames and archive shelves.
 */
export function HoloSurface({
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#00E5FF',
  opacity = 0.85,
  gridScale = 14,
  scanSpeed = 0.12,
  frame = true,
  radial = false,
}: HoloSurfaceProps) {
  const geometry = useMemo(
    () =>
      radial
        ? new THREE.CircleGeometry(width / 2, 64)
        : new THREE.PlaneGeometry(width, height, 1, 1),
    [radial, width, height],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: holoSurfaceVertexShader,
        fragmentShader: holoSurfaceFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uOpacity: { value: opacity },
          uGridScale: { value: gridScale },
          uGridWidth: { value: 0.035 },
          uScanSpeed: { value: scanSpeed },
          uColor: { value: new THREE.Color(color) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [opacity, gridScale, scanSpeed, color],
  );

  const frameMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: opacity * 0.75,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color, opacity],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
      frameMaterial.dispose();
    },
    [geometry, material, frameMaterial],
  );

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta;
  });

  const bar = Math.max(0.012, Math.min(width, height) * 0.006);

  return (
    <group position={position} rotation={rotation}>
      <mesh geometry={geometry} material={material} />
      {frame && !radial && (
        <>
          <mesh material={frameMaterial} position={[0, height / 2, 0.002]}>
            <boxGeometry args={[width, bar, bar]} />
          </mesh>
          <mesh material={frameMaterial} position={[0, -height / 2, 0.002]}>
            <boxGeometry args={[width, bar, bar]} />
          </mesh>
          <mesh material={frameMaterial} position={[-width / 2, 0, 0.002]}>
            <boxGeometry args={[bar, height, bar]} />
          </mesh>
          <mesh material={frameMaterial} position={[width / 2, 0, 0.002]}>
            <boxGeometry args={[bar, height, bar]} />
          </mesh>
        </>
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */
/* Orbiting particle swarm                                             */
/* ------------------------------------------------------------------ */

export interface RisingParticlesProps {
  control?: HologramControl;
  count?: number;
  radius?: number;
  height?: number;
  color?: string;
  speed?: number;
}

const particleVertex = /* glsl */ `
attribute float aOffset;
attribute float aSpeed;
attribute float aRadius;
attribute float aAngle;

uniform float uTime;
uniform float uHeight;
uniform float uPixelRatio;
uniform float uSize;

varying float vFade;

void main() {
  float t = fract(aOffset + uTime * aSpeed * 0.12);
  float y = t * uHeight;
  // Particles spiral inwards as they rise, like a projector drawing them up.
  float radius = aRadius * (1.0 - t * 0.55);
  float angle = aAngle + uTime * aSpeed * 0.5;

  vec3 transformed = vec3(cos(angle) * radius, y, sin(angle) * radius);

  vec4 mvPosition = modelViewMatrix * vec4(transformed, 1.0);
  gl_Position = projectionMatrix * mvPosition;
  gl_PointSize = clamp(uSize * uPixelRatio * (12.0 / max(-mvPosition.z, 0.6)), 0.8, 14.0);

  vFade = sin(t * 3.14159) * (0.4 + aSpeed * 0.6);
}
`;

const particleFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying float vFade;

void main() {
  vec2 coord = gl_PointCoord - 0.5;
  float d = length(coord);
  if (d > 0.5) discard;
  float core = 1.0 - smoothstep(0.0, 0.5, d);
  float alpha = pow(core, 1.8) * vFade * uOpacity;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(uColor * (0.7 + core), alpha);
}
`;

/** Cyan motes rising off the projector platform. */
export function RisingParticles({
  control,
  count = 420,
  radius = 1.5,
  height = 3.6,
  color = '#8CEBFF',
  speed = 1,
}: RisingParticlesProps) {
  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const offsets = new Float32Array(count);
    const speeds = new Float32Array(count);
    const radii = new Float32Array(count);
    const angles = new Float32Array(count);

    for (let i = 0; i < count; i += 1) {
      offsets[i] = Math.random();
      speeds[i] = 0.5 + Math.random() * 1.6;
      radii[i] = radius * (0.25 + Math.random() * 0.95);
      angles[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geo.setAttribute('aOffset', new THREE.BufferAttribute(offsets, 1));
    geo.setAttribute('aSpeed', new THREE.BufferAttribute(speeds, 1));
    geo.setAttribute('aRadius', new THREE.BufferAttribute(radii, 1));
    geo.setAttribute('aAngle', new THREE.BufferAttribute(angles, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(0, height / 2, 0), radius + height);
    return geo;
  }, [count, radius, height]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: particleVertex,
        fragmentShader: particleFragment,
        uniforms: {
          uTime: { value: 0 },
          uHeight: { value: height },
          uPixelRatio: { value: Math.min(window.devicePixelRatio || 1, 2) },
          uSize: { value: 16 },
          uColor: { value: new THREE.Color(color) },
          uOpacity: { value: 0.9 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [height, color],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_state, delta) => {
    material.uniforms.uTime.value += delta * speed;
    material.uniforms.uOpacity.value = control ? 0.25 + control.charge * 0.85 : 0.85;
  });

  if (count <= 0) return null;

  return <points geometry={geometry} material={material} frustumCulled={false} />;
}
