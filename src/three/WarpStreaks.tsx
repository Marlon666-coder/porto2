import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useExperience } from '../state/experienceStore';
import { mulberry32, randomRange } from '../utils/math';

interface Streak {
  angle: number;
  radius: number;
  z: number;
  length: number;
  speed: number;
}

export interface WarpStreaksProps {
  count?: number;
  color?: string;
}

/**
 * Light-speed streaks shown while the camera crosses between distant worlds.
 *
 * The streak volume is parented to the camera each frame, so the effect always
 * surrounds the viewer no matter where in the universe the jump happens. It is
 * also what hides the heavy world swap: the destination geometry mounts while
 * the screen is full of motion.
 */
export function WarpStreaks({ count = 180, color = '#9FD8FF' }: WarpStreaksProps) {
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);
  const intensity = useRef(0);

  const transitionKind = useExperience((s) => s.transitionKind);
  const transitionPhase = useExperience((s) => s.transitionPhase);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  const active = transitionKind === 'warp' && transitionPhase !== 'idle';

  const streaks = useMemo<Streak[]>(() => {
    const rng = mulberry32(2024);
    return Array.from({ length: count }, () => ({
      angle: rng() * Math.PI * 2,
      radius: randomRange(rng, 1.2, 26),
      z: randomRange(rng, -340, 40),
      length: randomRange(rng, 12, 70),
      speed: randomRange(rng, 260, 760),
    }));
  }, [count]);

  const geometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        depthTest: false,
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

  const matrix = useMemo(() => new THREE.Matrix4(), []);
  const position = useMemo(() => new THREE.Vector3(), []);
  const quaternion = useMemo(() => new THREE.Quaternion(), []);
  const scale = useMemo(() => new THREE.Vector3(), []);

  useFrame((state, delta) => {
    const target = active ? 1 : 0;
    intensity.current += (target - intensity.current) * Math.min(1, delta * (active ? 9 : 4));

    const mesh = meshRef.current;
    const group = groupRef.current;
    if (!mesh || !group) return;

    material.opacity = intensity.current * 0.85;
    mesh.visible = intensity.current > 0.01;
    if (!mesh.visible) return;

    // Ride with the camera.
    group.position.copy(state.camera.position);
    group.quaternion.copy(state.camera.quaternion);

    const boost = reducedMotion ? 0.35 : 1;
    const step = Math.min(delta, 0.05);

    for (let i = 0; i < streaks.length; i += 1) {
      const streak = streaks[i];
      streak.z += streak.speed * step * intensity.current * boost;
      if (streak.z > 60) streak.z -= 400;

      position.set(
        Math.cos(streak.angle) * streak.radius,
        Math.sin(streak.angle) * streak.radius,
        -streak.z,
      );
      scale.set(0.055, 0.055, streak.length * (0.3 + intensity.current * 0.9));
      matrix.compose(position, quaternion, scale);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  });

  return (
    <group ref={groupRef}>
      <instancedMesh
        ref={meshRef}
        args={[geometry, material, count]}
        frustumCulled={false}
        renderOrder={999}
        visible={false}
      />
    </group>
  );
}

export default WarpStreaks;
