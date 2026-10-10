import { useCallback, useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, randomRange } from '../utils/math';

const tailVertexShader = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const tailFragmentShader = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;
varying vec2 vUv;
void main() {
  // uv.y runs from the head (0) to the tip of the tail (1).
  float along = pow(1.0 - clamp(vUv.y, 0.0, 1.0), 1.5);
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;
  float alpha = along * pow(across, 0.55) * uOpacity;
  if (alpha < 0.003) discard;
  gl_FragColor = vec4(uColor * alpha * 2.2, alpha);
}
`;

interface CometState {
  origin: THREE.Vector3;
  direction: THREE.Vector3;
  speed: number;
  life: number;
  maxLife: number;
  delay: number;
  length: number;
  width: number;
}

export interface CometsProps {
  count: number;
  spread?: number;
  seed?: number;
  color?: string;
}

/**
 * Shooting stars / comets.
 * Each streak is a tapered cylinder oriented along its own velocity with a
 * glowing head. States are recycled instead of reallocated, so there is no GC
 * churn while they fly.
 */
export function Comets({ count, spread = 420, seed = 99119, color = '#BFEFFF' }: CometsProps) {
  const groupRefs = useRef<Array<THREE.Group | null>>([]);
  const tailRefs = useRef<Array<THREE.Mesh | null>>([]);
  const states = useRef<CometState[]>([]);

  const rng = useMemo(() => mulberry32(seed), [seed]);

  const respawn = useCallback(
    (state: CometState, immediate = false) => {
      state.origin.set(
        randomRange(rng, -spread, spread),
        randomRange(rng, -spread * 0.6, spread * 0.6),
        randomRange(rng, -spread * 1.2, spread * 0.4),
      );
      state.direction
        .set(randomRange(rng, -1, 1), randomRange(rng, -0.5, 0.5), randomRange(rng, -1, 1))
        .normalize();
      state.speed = randomRange(rng, 90, 210);
      state.maxLife = randomRange(rng, 2.4, 4.6);
      state.life = 0;
      state.delay = immediate ? randomRange(rng, 0, 2.5) : randomRange(rng, 1.5, 9);
      state.length = randomRange(rng, 18, 54);
      state.width = randomRange(rng, 0.35, 0.95);
    },
    [rng, spread],
  );

  useEffect(() => {
    states.current = Array.from({ length: count }, () => {
      const state: CometState = {
        origin: new THREE.Vector3(),
        direction: new THREE.Vector3(0, 0, -1),
        speed: 120,
        life: 0,
        maxLife: 3,
        delay: 0,
        length: 30,
        width: 0.6,
      };
      respawn(state, true);
      return state;
    });
  }, [count, respawn]);

  const tailGeometry = useMemo(() => {
    // radiusTop sits at the tail tip, radiusBottom at the head.
    const geo = new THREE.CylinderGeometry(1, 0.12, 1, 8, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, 0.5);
    return geo;
  }, []);

  const headGeometry = useMemo(() => new THREE.SphereGeometry(1, 10, 8), []);

  const instanceMaterials = useMemo(
    () =>
      Array.from({ length: count }, () => ({
        tail: new THREE.ShaderMaterial({
          vertexShader: tailVertexShader,
          fragmentShader: tailFragmentShader,
          uniforms: {
            uColor: { value: new THREE.Color(color) },
            uOpacity: { value: 0 },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        }),
        head: new THREE.MeshBasicMaterial({
          color: new THREE.Color(color),
          transparent: true,
          opacity: 0,
          blending: THREE.AdditiveBlending,
          depthWrite: false,
        }),
      })),
    [count, color],
  );

  useEffect(() => {
    return () => {
      tailGeometry.dispose();
      headGeometry.dispose();
      for (const pair of instanceMaterials) {
        pair.tail.dispose();
        pair.head.dispose();
      }
    };
  }, [tailGeometry, headGeometry, instanceMaterials]);

  const scratch = useMemo(() => new THREE.Vector3(), []);

  useFrame((_state, delta) => {
    const step = Math.min(delta, 0.05);
    for (let i = 0; i < states.current.length; i += 1) {
      const comet = states.current[i];
      const group = groupRefs.current[i];
      const tail = tailRefs.current[i];
      const mats = instanceMaterials[i];
      if (!comet || !group || !mats) continue;

      if (comet.delay > 0) {
        comet.delay -= step;
        mats.tail.uniforms.uOpacity.value = 0;
        mats.head.opacity = 0;
        group.visible = false;
        continue;
      }

      comet.life += step;
      if (comet.life >= comet.maxLife) {
        respawn(comet);
        continue;
      }

      group.visible = true;
      if (tail) tail.scale.set(comet.width, comet.width, comet.length);

      const travelled = comet.life * comet.speed;
      scratch.copy(comet.direction).multiplyScalar(travelled).add(comet.origin);
      group.position.copy(scratch);

      // Orient so local +Z (the tail) points opposite the direction of travel.
      scratch.copy(comet.direction).multiplyScalar(-1).add(group.position);
      group.lookAt(scratch);

      const fade = Math.sin(Math.PI * (comet.life / comet.maxLife));
      mats.tail.uniforms.uOpacity.value = fade * 0.85;
      mats.head.opacity = fade;
    }
  });

  if (count <= 0) return null;

  return (
    <group>
      {Array.from({ length: count }, (_, index) => (
        <group
          key={`comet-${index}`}
          ref={(node) => {
            groupRefs.current[index] = node;
          }}
          visible={false}
        >
          <mesh
            ref={(node) => {
              tailRefs.current[index] = node;
            }}
            geometry={tailGeometry}
            material={instanceMaterials[index].tail}
            frustumCulled={false}
          />
          <mesh
            geometry={headGeometry}
            material={instanceMaterials[index].head}
            scale={0.9}
            frustumCulled={false}
          />
        </group>
      ))}
    </group>
  );
}

export default Comets;
