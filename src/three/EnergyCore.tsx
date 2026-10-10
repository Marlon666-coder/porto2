import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import {
  energyCoreFragmentShader,
  energyCoreVertexShader,
  holoSurfaceFragmentShader,
  holoSurfaceVertexShader,
} from './shaders/hologram';
import { GlowShell } from './Planet';
import type { HologramControl } from './hologramControl';

export interface EnergyCoreProps {
  control: HologramControl;
  radius?: number;
  colorInner?: string;
  colorOuter?: string;
}

/**
 * Plasma energy core.
 * A displaced icosahedron running a fresnel + fbm plasma shader, wrapped in a
 * wireframe cage and a fresnel glow shell. All of its intensity is driven by
 * `control.charge`, which the hologram timeline tweens with GSAP.
 */
export function EnergyCore({
  control,
  radius = 0.42,
  colorInner = '#EAFBFF',
  colorOuter = '#00E5FF',
}: EnergyCoreProps) {
  const coreRef = useRef<THREE.Mesh>(null);
  const cageRef = useRef<THREE.Mesh>(null);
  const lightRef = useRef<THREE.PointLight>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(radius, 4), [radius]);
  const cageGeometry = useMemo(() => new THREE.IcosahedronGeometry(radius * 1.45, 1), [radius]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: energyCoreVertexShader,
        fragmentShader: energyCoreFragmentShader,
        uniforms: {
          uTime: { value: 0 },
          uCharge: { value: 0 },
          uColorInner: { value: new THREE.Color(colorInner) },
          uColorOuter: { value: new THREE.Color(colorOuter) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [colorInner, colorOuter],
  );

  const cageMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(colorOuter),
        wireframe: true,
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [colorOuter],
  );

  useEffect(
    () => () => {
      geometry.dispose();
      cageGeometry.dispose();
      material.dispose();
      cageMaterial.dispose();
    },
    [geometry, cageGeometry, material, cageMaterial],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    material.uniforms.uTime.value += delta;
    material.uniforms.uCharge.value = control.charge;
    cageMaterial.opacity = control.charge * 0.5;

    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.35;
      coreRef.current.rotation.x += delta * 0.12;
      const breathe = 1 + Math.sin(t * 2.1) * 0.05 * control.charge;
      coreRef.current.scale.setScalar(0.25 + control.charge * 0.75 * breathe);
    }
    if (cageRef.current) {
      cageRef.current.rotation.y -= delta * 0.22;
      cageRef.current.rotation.z += delta * 0.1;
      cageRef.current.scale.setScalar(0.4 + control.charge * 0.6);
    }
    if (lightRef.current) {
      lightRef.current.intensity = control.charge * (14 + Math.sin(t * 5.5) * 2.2);
    }
  });

  return (
    <group>
      <mesh ref={coreRef} geometry={geometry} material={material} />
      <mesh ref={cageRef} geometry={cageGeometry} material={cageMaterial} />
      <GlowShell radius={radius} color={colorOuter} intensity={0.9} power={2.2} scale={2.6} segments={20} />
      <pointLight ref={lightRef} color={colorOuter} intensity={0} distance={14} decay={2} />
    </group>
  );
}

/* ------------------------------------------------------------------ */

export interface HoloRingsProps {
  control: HologramControl;
  count?: number;
  baseRadius?: number;
  color?: string;
}

/**
 * Thin holographic rings that emerge from the projector and orbit the core on
 * different axes. Each ring uses the holo-surface shader so it reads as a
 * projected light structure rather than solid plastic.
 */
export function HoloRings({
  control,
  count = 4,
  baseRadius = 0.95,
  color = '#00E5FF',
}: HoloRingsProps) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);

  const rings = useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        radius: baseRadius + index * 0.42,
        tube: 0.012 + (index % 2) * 0.006,
        tilt: [0.42, -0.3, 1.5, -1.1][index % 4] ?? 0.4,
        speed: 0.28 + index * 0.17 * (index % 2 === 0 ? 1 : -1),
        offset: index * 0.35,
      })),
    [count, baseRadius],
  );

  const geometries = useMemo(
    () => rings.map((ring) => new THREE.TorusGeometry(ring.radius, ring.tube, 6, 96)),
    [rings],
  );

  const materials = useMemo(
    () =>
      rings.map(
        () =>
          new THREE.ShaderMaterial({
            vertexShader: holoSurfaceVertexShader,
            fragmentShader: holoSurfaceFragmentShader,
            uniforms: {
              uTime: { value: 0 },
              uOpacity: { value: 0 },
              uGridScale: { value: 60 },
              uGridWidth: { value: 0.3 },
              uScanSpeed: { value: 0.25 },
              uColor: { value: new THREE.Color(color) },
            },
            transparent: true,
            depthWrite: false,
            blending: THREE.AdditiveBlending,
            side: THREE.DoubleSide,
          }),
      ),
    [rings, color],
  );

  useEffect(
    () => () => {
      for (const geometry of geometries) geometry.dispose();
      for (const material of materials) material.dispose();
    },
    [geometries, materials],
  );

  useFrame((_state, delta) => {
    for (let i = 0; i < rings.length; i += 1) {
      const material = materials[i];
      material.uniforms.uTime.value += delta;
      material.uniforms.uOpacity.value = control.charge * 0.9;

      const group = groupRefs.current[i];
      if (!group) continue;
      group.rotation.y += delta * rings[i].speed;
      group.rotation.z += delta * rings[i].speed * 0.3;
      const spread = control.ringSpread;
      group.scale.setScalar(0.25 + spread * 0.75);
      group.position.y = Math.sin(_state.clock.elapsedTime * 0.6 + rings[i].offset) * 0.08 * spread;
    }
  });

  return (
    <group>
      {rings.map((ring, index) => (
        <group
          key={`holo-ring-${index}`}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
          rotation={[ring.tilt, 0, 0]}
        >
          <mesh geometry={geometries[index]} material={materials[index]} rotation={[Math.PI / 2, 0, 0]} />
        </group>
      ))}
    </group>
  );
}

export default EnergyCore;
