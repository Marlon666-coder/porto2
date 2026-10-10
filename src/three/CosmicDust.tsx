import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import StarField from './StarField';

export interface CosmicDustProps {
  count: number;
  radius?: number;
  seed?: number;
  opacity?: number;
  color?: string;
}

/**
 * Near-field floating motes. Giving the whole shell a slow compound rotation
 * (instead of rewriting every particle position each frame) keeps this at zero
 * per-frame CPU cost while still reading as drifting dust.
 */
export function CosmicDust({
  count,
  radius = 90,
  seed = 7331,
  opacity = 0.55,
  color = '#8FD9FF',
}: CosmicDustProps) {
  const group = useRef<THREE.Group>(null);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = state.clock.elapsedTime;
    g.rotation.y += delta * 0.012;
    g.rotation.x = Math.sin(t * 0.05) * 0.1;
    g.position.y = Math.sin(t * 0.09) * 1.6;
  });

  if (count <= 0) return null;

  return (
    <group ref={group}>
      <StarField
        count={count}
        radius={radius}
        innerRadius={radius * 0.05}
        seed={seed}
        sizeScale={2.1}
        opacity={opacity}
        farFade={radius * 1.6}
        spin={0}
        palette={[color, '#CFE4FF', '#9D4EDD']}
      />
    </group>
  );
}

export default CosmicDust;
