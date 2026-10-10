import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triple } from '../types';
import { glowFragmentShader, glowVertexShader } from './shaders/hologram';
import {
  planetFragmentShader,
  planetVertexShader,
  ringFragmentShader,
  ringVertexShader,
} from './shaders/planet';

export interface GlowShellProps {
  radius: number;
  color: string;
  intensity?: number;
  power?: number;
  scale?: number;
  segments?: number;
}

/** Fresnel atmosphere / bloom shell. Reused by planets, cores and the ship. */
export function GlowShell({
  radius,
  color,
  intensity = 0.8,
  power = 2.6,
  scale = 1.16,
  segments = 32,
}: GlowShellProps) {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: glowVertexShader,
        fragmentShader: glowFragmentShader,
        uniforms: {
          uColor: { value: new THREE.Color(color) },
          uIntensity: { value: intensity },
          uPower: { value: power },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.BackSide,
      }),
    [color, intensity, power],
  );

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius * scale, segments, Math.max(8, segments / 2)),
    [radius, scale, segments],
  );

  useEffect(
    () => () => {
      material.dispose();
      geometry.dispose();
    },
    [material, geometry],
  );

  return <mesh geometry={geometry} material={material} />;
}

export interface PlanetProps {
  position?: Triple;
  radius: number;
  seed?: number;
  colorDeep?: string;
  colorMid?: string;
  colorHigh?: string;
  colorAtmo?: string;
  lightDirection?: Triple;
  bandScale?: number;
  turbulence?: number;
  atmosphere?: number;
  nightGlow?: number;
  rotationSpeed?: number;
  segments?: number;
  glow?: boolean;
  glowIntensity?: number;
  tilt?: number;
}

/**
 * Fully procedural planet — no texture downloads, so nothing can 404 and the
 * look is identical on every deployment.
 */
export function Planet({
  position = [0, 0, 0],
  radius,
  seed = 11,
  colorDeep = '#0A1430',
  colorMid = '#1E4C86',
  colorHigh = '#8FD4FF',
  colorAtmo = '#4287FF',
  lightDirection = [0.6, 0.35, 0.72],
  bandScale = 3.2,
  turbulence = 1.4,
  atmosphere = 0.9,
  nightGlow = 0.12,
  rotationSpeed = 0.012,
  segments = 64,
  glow = true,
  glowIntensity = 0.55,
  tilt = 0.18,
}: PlanetProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.SphereGeometry(radius, segments, Math.max(16, Math.round(segments / 2))),
    [radius, segments],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVertexShader,
        fragmentShader: planetFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uSeed: { value: seed },
          uBandScale: { value: bandScale },
          uTurbulence: { value: turbulence },
          uAtmosphere: { value: atmosphere },
          uNightGlow: { value: nightGlow },
          uLightDir: {
            value: new THREE.Vector3(...lightDirection).normalize(),
          },
          uColorDeep: { value: new THREE.Color(colorDeep) },
          uColorMid: { value: new THREE.Color(colorMid) },
          uColorHigh: { value: new THREE.Color(colorHigh) },
          uColorAtmo: { value: new THREE.Color(colorAtmo) },
        },
      }),
    [
      seed,
      bandScale,
      turbulence,
      atmosphere,
      nightGlow,
      lightDirection[0],
      lightDirection[1],
      lightDirection[2],
      colorDeep,
      colorMid,
      colorHigh,
      colorAtmo,
    ],
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
    if (meshRef.current) meshRef.current.rotation.y += delta * rotationSpeed;
  });

  return (
    <group position={position} rotation={[tilt, 0, 0]}>
      <mesh ref={meshRef} geometry={geometry} material={material} />
      {glow && (
        <GlowShell
          radius={radius}
          color={colorAtmo}
          intensity={glowIntensity}
          power={2.4}
          scale={1.14}
          segments={32}
        />
      )}
    </group>
  );
}

export interface PlanetRingProps {
  innerRadius: number;
  outerRadius: number;
  colorA?: string;
  colorB?: string;
  opacity?: number;
  rotationSpeed?: number;
  segments?: number;
}

/** Procedural ring system with Cassini-style gaps. */
export function PlanetRing({
  innerRadius,
  outerRadius,
  colorA = '#C9B8A0',
  colorB = '#7FA8D8',
  opacity = 0.85,
  rotationSpeed = 0.02,
  segments = 160,
}: PlanetRingProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.RingGeometry(innerRadius, outerRadius, segments, 4),
    [innerRadius, outerRadius, segments],
  );

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: ringVertexShader,
        fragmentShader: ringFragmentShader,
        uniforms: {
          uInner: { value: innerRadius },
          uOuter: { value: outerRadius },
          uOpacity: { value: opacity },
          uColorA: { value: new THREE.Color(colorA) },
          uColorB: { value: new THREE.Color(colorB) },
        },
        transparent: true,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [innerRadius, outerRadius, opacity, colorA, colorB],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      material.dispose();
    },
    [geometry, material],
  );

  useFrame((_state, delta) => {
    if (meshRef.current) meshRef.current.rotation.z += delta * rotationSpeed;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      rotation={[-Math.PI / 2, 0, 0]}
    />
  );
}

export default Planet;
