import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triple } from '../types';
import { mulberry32, randomRange } from '../utils/math';
import { getMaterials } from './materials';

/* ------------------------------------------------------------------ */
/* Light strip                                                         */
/* ------------------------------------------------------------------ */

export interface LightStripProps {
  length: number;
  thickness?: number;
  position?: Triple;
  rotation?: Triple;
  color?: string;
  /** Slow pulse so interiors never look like static geometry. */
  pulse?: number;
  opacity?: number;
}

export function LightStrip({
  length,
  thickness = 0.06,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  color = '#9FE8FF',
  pulse = 0.35,
  opacity = 0.9,
}: LightStripProps) {
  const materialRef = useRef<THREE.MeshBasicMaterial | null>(null);
  const phase = useMemo(() => Math.random() * Math.PI * 2, []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color, opacity],
  );

  useEffect(() => {
    materialRef.current = material;
    return () => material.dispose();
  }, [material]);

  useFrame((state) => {
    if (!materialRef.current) return;
    materialRef.current.opacity =
      opacity * (1 - pulse * 0.5 + Math.sin(state.clock.elapsedTime * 1.3 + phase) * pulse * 0.5);
  });

  return (
    <mesh material={material} position={position} rotation={rotation}>
      <boxGeometry args={[length, thickness, thickness]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */
/* Structural ring                                                     */
/* ------------------------------------------------------------------ */

export interface StationRingProps {
  radius: number;
  tube?: number;
  position?: Triple;
  rotation?: Triple;
  segments?: number;
  spin?: number;
  variant?: 'trim' | 'hull' | 'panel';
}

/** Rotating structural ring — the backbone of every orbital set. */
export function StationRing({
  radius,
  tube = 0.16,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  segments = 64,
  spin = 0,
  variant = 'trim',
}: StationRingProps) {
  const materials = getMaterials();
  const meshRef = useRef<THREE.Mesh>(null);

  const geometry = useMemo(
    () => new THREE.TorusGeometry(radius, tube, 8, segments),
    [radius, tube, segments],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((_state, delta) => {
    if (meshRef.current && spin !== 0) meshRef.current.rotation.z += delta * spin;
  });

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={materials[variant]}
      position={position}
      rotation={rotation}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Radial struts                                                       */
/* ------------------------------------------------------------------ */

export interface RadialStrutsProps {
  count?: number;
  innerRadius: number;
  outerRadius: number;
  thickness?: number;
  position?: Triple;
  rotation?: Triple;
}

/** Spokes connecting rings. One instanced mesh, any number of spokes. */
export function RadialStruts({
  count = 8,
  innerRadius,
  outerRadius,
  thickness = 0.12,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
}: RadialStrutsProps) {
  const materials = getMaterials();
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const matrix = new THREE.Matrix4();
    const pos = new THREE.Vector3();
    const quat = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const scale = new THREE.Vector3();
    const length = outerRadius - innerRadius;
    const mid = (outerRadius + innerRadius) / 2;

    for (let i = 0; i < count; i += 1) {
      const angle = (i / count) * Math.PI * 2;
      pos.set(Math.cos(angle) * mid, Math.sin(angle) * mid, 0);
      euler.set(0, 0, angle);
      quat.setFromEuler(euler);
      scale.set(length, thickness, thickness);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, innerRadius, outerRadius, thickness]);

  return (
    <instancedMesh
      ref={meshRef}
      args={[geometry, materials.trim, count]}
      position={position}
      rotation={rotation}
      frustumCulled={false}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Data columns                                                        */
/* ------------------------------------------------------------------ */

export interface DataColumnsProps {
  count?: number;
  radius?: number;
  height?: number;
  seed?: number;
  color?: string;
}

/**
 * Vertical emissive data pillars, arranged in a ring.
 * Gives archives and laboratories depth without extra draw calls.
 */
export function DataColumns({
  count = 18,
  radius = 11,
  height = 7,
  seed = 991,
  color = '#4287FF',
}: DataColumnsProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.42,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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

  const config = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, (_, i) => ({
      angle: (i / count) * Math.PI * 2 + randomRange(rng, -0.08, 0.08),
      radius: radius * randomRange(rng, 0.86, 1.14),
      height: height * randomRange(rng, 0.35, 1),
      width: randomRange(rng, 0.08, 0.3),
      speed: randomRange(rng, 0.4, 1.5),
      phase: rng() * Math.PI * 2,
    }));
  }, [count, radius, height, seed]);

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const euler = useMemo(() => new THREE.Euler(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime;
    for (let i = 0; i < config.length; i += 1) {
      const column = config[i];
      const h = column.height * (0.65 + 0.35 * Math.sin(t * column.speed + column.phase));
      pos.set(Math.cos(column.angle) * column.radius, h / 2, Math.sin(column.angle) * column.radius);
      euler.set(0, -column.angle, 0);
      quat.setFromEuler(euler);
      scale.set(column.width, h, column.width);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
  );
}

/* ------------------------------------------------------------------ */
/* Orbiting nodes                                                      */
/* ------------------------------------------------------------------ */

export interface OrbitNodesProps {
  count?: number;
  radius?: number;
  spread?: number;
  speed?: number;
  size?: number;
  color?: string;
  seed?: number;
}

/** Small glowing satellites / probes orbiting a set piece. */
export function OrbitNodes({
  count = 24,
  radius = 6,
  spread = 2.4,
  speed = 0.35,
  size = 0.09,
  color = '#8CEBFF',
  seed = 7,
}: OrbitNodesProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const geometry = useMemo(() => new THREE.SphereGeometry(1, 8, 6), []);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.95,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
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

  const config = useMemo(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: count }, () => ({
      angle: rng() * Math.PI * 2,
      radius: radius * randomRange(rng, 0.7, 1.25),
      y: randomRange(rng, -spread, spread),
      speed: randomRange(rng, 0.4, 1.7) * (rng() > 0.5 ? 1 : -1),
      size: size * randomRange(rng, 0.6, 1.7),
      tilt: randomRange(rng, -0.4, 0.4),
    }));
  }, [count, radius, spread, size, seed]);

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const pos = useMemo(() => new THREE.Vector3(), []);
  const quat = useMemo(() => new THREE.Quaternion(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const t = state.clock.elapsedTime * speed;
    for (let i = 0; i < config.length; i += 1) {
      const node = config[i];
      const angle = node.angle + t * node.speed;
      pos.set(
        Math.cos(angle) * node.radius,
        node.y + Math.sin(angle * 2 + node.tilt) * 0.4,
        Math.sin(angle) * node.radius,
      );
      scale.setScalar(node.size);
      matrix.compose(pos, quat, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <instancedMesh ref={meshRef} args={[geometry, material, count]} frustumCulled={false} />
  );
}

/* ------------------------------------------------------------------ */
/* Panoramic window                                                    */
/* ------------------------------------------------------------------ */

export interface PanoramicWindowProps {
  radius?: number;
  height?: number;
  /** Angular width of the window, in radians. */
  arc?: number;
  mullions?: number;
  position?: Triple;
}

/**
 * Curved cockpit window: an open-ended cylinder slice of glass with metal
 * mullions. The camera genuinely looks through it at the star field, so the
 * view outside parallaxes correctly as the shot drifts.
 */
export function PanoramicWindow({
  radius = 10,
  height = 5.2,
  arc = Math.PI * 1.15,
  mullions = 9,
  position = [0, 0, 0],
}: PanoramicWindowProps) {
  const materials = getMaterials();

  const glassGeometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius, height, 72, 1, true, -arc / 2, arc),
    [radius, height, arc],
  );
  useEffect(() => () => glassGeometry.dispose(), [glassGeometry]);

  const mullionPositions = useMemo(
    () =>
      Array.from({ length: mullions }, (_, i) => {
        const t = mullions === 1 ? 0.5 : i / (mullions - 1);
        return -arc / 2 + t * arc;
      }),
    [mullions, arc],
  );

  return (
    <group position={position} rotation={[0, Math.PI, 0]}>
      <mesh geometry={glassGeometry} material={materials.glass} />

      {/* top & bottom frames (full rings — the cockpit is a round room) */}
      <mesh material={materials.trim} position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.17, 8, 72]} />
      </mesh>
      <mesh material={materials.trim} position={[0, -height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.17, 8, 72]} />
      </mesh>

      {/* vertical mullions */}
      {mullionPositions.map((angle, index) => (
        <mesh
          key={`mullion-${index}`}
          material={materials.trim}
          position={[Math.sin(angle) * radius, 0, Math.cos(angle) * radius]}
          rotation={[0, angle, 0]}
        >
          <boxGeometry args={[0.14, height, 0.2]} />
        </mesh>
      ))}

      {/* illuminated sill */}
      <LightStrip
        length={radius * 1.6}
        thickness={0.05}
        position={[0, -height / 2 + 0.22, radius * 0.86]}
        color="#00E5FF"
        opacity={0.6}
      />
    </group>
  );
}
