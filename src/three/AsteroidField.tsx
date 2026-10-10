import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triple } from '../types';
import { mulberry32, randomRange } from '../utils/math';

export interface AsteroidFieldProps {
  count: number;
  center?: Triple;
  innerRadius?: number;
  outerRadius?: number;
  /** Vertical thickness of the belt. */
  thickness?: number;
  seed?: number;
  /** Orbital rotation of the whole belt. */
  orbitSpeed?: number;
  minScale?: number;
  maxScale?: number;
  color?: string;
  accent?: string;
}

/**
 * Instanced asteroid belt.
 *
 * One `InstancedMesh` renders hundreds of rocks in a single draw call. The
 * per-instance matrices are written once at build time and the belt is animated
 * by rotating the parent group, which keeps the per-frame cost at essentially
 * zero no matter how many rocks there are.
 */
export function AsteroidField({
  count,
  center = [0, 0, 0],
  innerRadius = 50,
  outerRadius = 130,
  thickness = 16,
  seed = 4242,
  orbitSpeed = 0.014,
  minScale = 0.5,
  maxScale = 4.2,
  color = '#6B6A73',
  accent = '#9DA7C7',
}: AsteroidFieldProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  // Two low-poly variants, merged visually by random rotation and scale.
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(1, 0);
    // Rough the silhouette up so they do not read as perfect polyhedra.
    const position = geo.attributes.position as THREE.BufferAttribute;
    const rng = mulberry32(seed + 17);
    for (let i = 0; i < position.count; i += 1) {
      const scale = 0.72 + rng() * 0.56;
      position.setXYZ(
        i,
        position.getX(i) * scale,
        position.getY(i) * (0.7 + rng() * 0.6),
        position.getZ(i) * scale,
      );
    }
    position.needsUpdate = true;
    geo.computeVertexNormals();
    return geo;
  }, [seed]);

  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color(color),
        roughness: 0.82,
        metalness: 0.28,
        flatShading: true,
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

  useEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;

    const rng = mulberry32(seed);
    const matrix = new THREE.Matrix4();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const position = new THREE.Vector3();
    const scale = new THREE.Vector3();
    const baseColor = new THREE.Color(color);
    const accentColor = new THREE.Color(accent);
    const instanceColor = new THREE.Color();

    for (let i = 0; i < count; i += 1) {
      const angle = rng() * Math.PI * 2;
      // sqrt keeps the density even across the annulus instead of clustering.
      const radius = innerRadius + (outerRadius - innerRadius) * Math.sqrt(rng());
      const y = randomRange(rng, -thickness, thickness) * (1 - (radius - innerRadius) / (outerRadius - innerRadius) * 0.4);

      position.set(Math.cos(angle) * radius, y, Math.sin(angle) * radius);
      euler.set(rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2);
      quaternion.setFromEuler(euler);

      const size = randomRange(rng, minScale, maxScale) * (rng() > 0.97 ? 2.4 : 1);
      scale.set(size, size * randomRange(rng, 0.6, 1.1), size);

      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);

      instanceColor.copy(baseColor).lerp(accentColor, rng() * 0.8);
      mesh.setColorAt(i, instanceColor);
    }

    mesh.instanceMatrix.needsUpdate = true;
    if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [count, innerRadius, outerRadius, thickness, seed, minScale, maxScale, color, accent]);

  useFrame((_state, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * orbitSpeed;
  });

  if (count <= 0) return null;

  return (
    <group ref={groupRef} position={center}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        frustumCulled={false}
        castShadow={false}
        receiveShadow={false}
      />
    </group>
  );
}

export default AsteroidField;
