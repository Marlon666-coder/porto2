import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, randomRange } from '../utils/math';
import { nebulaFragmentShader, nebulaVertexShader } from './shaders/nebula';

interface NebulaLayer {
  position: THREE.Vector3;
  scale: number;
  seed: number;
  opacity: number;
  colourA: THREE.Color;
  colourB: THREE.Color;
  softness: number;
}

export interface NebulaFieldProps {
  layers: number;
  /** Radius of the volume the clouds are scattered through. */
  spread?: number;
  seed?: number;
  intensity?: number;
  /** Clouds billboard toward the camera so they never flip edge-on. */
  billboard?: boolean;
  palette?: [string, string][];
}

const DEFAULT_PALETTE: [string, string][] = [
  ['#0B1E52', '#4287FF'],
  ['#2A0F52', '#9D4EDD'],
  ['#07203A', '#00E5FF'],
  ['#3A0B35', '#FF38C7'],
];

/**
 * Large additive fbm billboards. A handful of them at very different depths is
 * what gives the void a sense of atmosphere and volume.
 */
export function NebulaField({
  layers,
  spread = 900,
  seed = 20260101,
  intensity = 1,
  billboard = true,
  palette = DEFAULT_PALETTE,
}: NebulaFieldProps) {
  const groupRef = useRef<THREE.Group>(null);
  const materialsRef = useRef<THREE.ShaderMaterial[]>([]);

  const config = useMemo<NebulaLayer[]>(() => {
    const rng = mulberry32(seed);
    return Array.from({ length: Math.max(0, layers) }, (_, index) => {
      const pair = palette[index % palette.length];
      return {
        position: new THREE.Vector3(
          randomRange(rng, -spread, spread),
          randomRange(rng, -spread * 0.55, spread * 0.55),
          randomRange(rng, -spread * 1.4, spread * 0.25),
        ),
        scale: randomRange(rng, spread * 0.5, spread * 1.5),
        seed: randomRange(rng, 0, 100),
        opacity: randomRange(rng, 0.1, 0.26) * intensity,
        colourA: new THREE.Color(pair[0]),
        colourB: new THREE.Color(pair[1]),
        softness: randomRange(rng, 0.34, 0.5),
      };
    });
  }, [layers, spread, seed, intensity, palette]);

  const materials = useMemo(() => {
    return config.map(
      (layer) =>
        new THREE.ShaderMaterial({
          vertexShader: nebulaVertexShader,
          fragmentShader: nebulaFragmentShader,
          uniforms: {
            uTime: { value: layer.seed * 10 },
            uOpacity: { value: layer.opacity },
            uScale: { value: 2.4 },
            uSeed: { value: layer.seed },
            uSoftness: { value: layer.softness },
            uColorA: { value: layer.colourA },
            uColorB: { value: layer.colourB },
          },
          transparent: true,
          depthWrite: false,
          depthTest: true,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        }),
    );
  }, [config]);

  useEffect(() => {
    materialsRef.current = materials;
    return () => {
      for (const material of materials) material.dispose();
    };
  }, [materials]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    for (const material of materialsRef.current) {
      material.uniforms.uTime.value += delta;
    }
    if (billboard && groupRef.current) {
      for (const child of groupRef.current.children) {
        child.quaternion.copy(state.camera.quaternion);
      }
    }
  });

  if (layers <= 0) return null;

  return (
    <group ref={groupRef}>
      {config.map((layer, index) => (
        <mesh
          key={`nebula-${index}`}
          geometry={geometry}
          material={materials[index]}
          position={layer.position}
          scale={[layer.scale, layer.scale * 0.72, 1]}
          frustumCulled={false}
          renderOrder={-10}
        />
      ))}
    </group>
  );
}

export default NebulaField;
