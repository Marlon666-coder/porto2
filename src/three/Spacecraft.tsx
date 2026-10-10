import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { mulberry32, randomRange } from '../utils/math';
import { GlowShell } from './Planet';

/* ------------------------------------------------------------------ */
/* Engine plume shader                                                 */
/* ------------------------------------------------------------------ */

const plumeVertex = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

const plumeFragment = /* glsl */ `
uniform float uTime;
uniform float uThrottle;
uniform vec3 uColorHot;
uniform vec3 uColorCool;
varying vec2 vUv;

float hash(float n) { return fract(sin(n * 78.233) * 43758.5453); }

void main() {
  float along = clamp(vUv.y, 0.0, 1.0);
  float across = 1.0 - abs(vUv.x - 0.5) * 2.0;

  float flicker = 0.85 + 0.15 * hash(floor(uTime * 30.0) + vUv.x * 3.0);
  float taper = pow(1.0 - along, 1.35);
  float pulse = 0.82 + 0.18 * sin(uTime * 9.0 - along * 11.0);

  vec3 colour = mix(uColorHot, uColorCool, along);
  float alpha = taper * pow(across, 0.7) * uThrottle * flicker * pulse;
  if (alpha < 0.004) discard;
  gl_FragColor = vec4(colour * alpha * 2.4, alpha);
}
`;

/* ------------------------------------------------------------------ */

export interface SpacecraftProps {
  /** 0 → idle, 1 → full burn. Animated by the approach sequence. */
  throttle?: number;
  /** Multiplies the whole craft; hull length is ~46 units at scale 1. */
  scale?: number;
  detail?: 'high' | 'low';
}

/**
 * Fully procedural spacecraft.
 *
 * Built from real 3D geometry — a lathed fuselage, swept wings, four engine
 * nacelles, a glass canopy, instanced hull greebles and emissive window strips.
 * Nothing here is a flat image: the silhouette holds up from any angle, which
 * matters because the camera orbits it during the approach.
 *
 * Local orientation: the nose points down -Z.
 */
export function Spacecraft({ throttle = 0.35, scale = 1, detail = 'high' }: SpacecraftProps) {
  const rootRef = useRef<THREE.Group>(null);
  const plumeMaterials = useRef<THREE.ShaderMaterial[]>([]);
  const navLightRefs = useRef<Array<THREE.Mesh | null>>([]);
  const throttleRef = useRef(throttle);
  throttleRef.current = throttle;

  const segments = detail === 'high' ? 48 : 20;

  /* ---------------- hull ---------------- */
  const hullGeometry = useMemo(() => {
    const profile: Array<[number, number]> = [
      [0.02, -23],
      [0.9, -21.6],
      [1.9, -19],
      [2.9, -14.5],
      [3.7, -8],
      [4.2, -1],
      [4.35, 5],
      [4.05, 10.5],
      [3.5, 14],
      [3.75, 16.5],
      [3.3, 18.4],
      [2.1, 19.2],
      [0.02, 19.4],
    ];
    const geo = new THREE.LatheGeometry(
      profile.map(([radius, axial]) => new THREE.Vector2(radius, axial)),
      segments,
    );
    // Lathe spins around +Y; rotate so the nose points down -Z.
    geo.rotateX(Math.PI / 2);
    geo.computeVertexNormals();
    return geo;
  }, [segments]);

  const hullMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#2B3449'),
        metalness: 0.92,
        roughness: 0.34,
        envMapIntensity: 1.1,
      }),
    [],
  );

  const panelMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#1A2134'),
        metalness: 0.85,
        roughness: 0.48,
        envMapIntensity: 0.9,
      }),
    [],
  );

  const trimMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#5C6B92'),
        metalness: 0.95,
        roughness: 0.22,
        envMapIntensity: 1.3,
      }),
    [],
  );

  const windowMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#061626'),
        emissive: new THREE.Color('#00E5FF'),
        emissiveIntensity: 1.5,
        metalness: 0.4,
        roughness: 0.18,
      }),
    [],
  );

  const canopyMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#071A2E'),
        emissive: new THREE.Color('#2E7BFF'),
        emissiveIntensity: 0.55,
        metalness: 0.65,
        roughness: 0.08,
        transparent: true,
        opacity: 0.72,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const engineRingMaterial = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: new THREE.Color('#0A1526'),
        emissive: new THREE.Color('#4287FF'),
        emissiveIntensity: 2.4,
        metalness: 0.7,
        roughness: 0.3,
      }),
    [],
  );

  const navRedMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#FF38C7'),
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  const navCyanMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#00E5FF'),
        transparent: true,
        opacity: 1,
      }),
    [],
  );

  /* ---------------- greebles ---------------- */
  const greebleGeometry = useMemo(() => new THREE.BoxGeometry(1, 1, 1), []);
  const greebleCount = detail === 'high' ? 86 : 28;
  const greebleRef = useRef<THREE.InstancedMesh>(null);

  useEffect(() => {
    const mesh = greebleRef.current;
    if (!mesh) return;
    const rng = mulberry32(5150);
    const matrix = new THREE.Matrix4();
    const position = new THREE.Vector3();
    const quaternion = new THREE.Quaternion();
    const euler = new THREE.Euler();
    const sizeVec = new THREE.Vector3();

    for (let i = 0; i < greebleCount; i += 1) {
      const axial = randomRange(rng, -16, 18);
      // Follow the hull profile roughly so plates sit on the surface.
      const hullRadius = 4.3 - Math.pow(Math.abs(axial + 2) / 22, 2.1) * 3.6;
      const angle = rng() * Math.PI * 2;
      const r = Math.max(1.2, hullRadius) * 0.98;

      position.set(Math.cos(angle) * r, Math.sin(angle) * r, axial);
      euler.set(0, 0, angle + Math.PI / 2);
      quaternion.setFromEuler(euler);
      sizeVec.set(randomRange(rng, 0.5, 2.4), randomRange(rng, 0.18, 0.5), randomRange(rng, 0.9, 3.6));

      matrix.compose(position, quaternion, sizeVec);
      mesh.setMatrixAt(i, matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
    mesh.computeBoundingSphere();
  }, [greebleCount]);

  /* ---------------- plumes ---------------- */
  const plumeGeometry = useMemo(() => {
    // radiusBottom sits at the nozzle (local z = 0, uv.y = 0) and flares out
    // toward the tip (z = 1). rotateX(+90deg) maps the lathe axis +Y onto +Z.
    const geo = new THREE.CylinderGeometry(1, 0.45, 1, 14, 1, true);
    geo.rotateX(Math.PI / 2);
    geo.translate(0, 0, 0.5);
    return geo;
  }, []);

  const plumes = useMemo(
    () =>
      Array.from({ length: 4 }, () => {
        const material = new THREE.ShaderMaterial({
          vertexShader: plumeVertex,
          fragmentShader: plumeFragment,
          uniforms: {
            uTime: { value: Math.random() * 10 },
            uThrottle: { value: throttle },
            uColorHot: { value: new THREE.Color('#C9F4FF') },
            uColorCool: { value: new THREE.Color('#4287FF') },
          },
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
          side: THREE.DoubleSide,
        });
        return material;
      }),
    // Throttle is applied per-frame; only rebuild if the count changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  useEffect(() => {
    plumeMaterials.current = plumes;
    return () => {
      for (const material of plumes) material.dispose();
    };
  }, [plumes]);

  useEffect(
    () => () => {
      hullGeometry.dispose();
      greebleGeometry.dispose();
      plumeGeometry.dispose();
      hullMaterial.dispose();
      panelMaterial.dispose();
      trimMaterial.dispose();
      windowMaterial.dispose();
      canopyMaterial.dispose();
      engineRingMaterial.dispose();
      navRedMaterial.dispose();
      navCyanMaterial.dispose();
    },
    [
      hullGeometry,
      greebleGeometry,
      plumeGeometry,
      hullMaterial,
      panelMaterial,
      trimMaterial,
      windowMaterial,
      canopyMaterial,
      engineRingMaterial,
      navRedMaterial,
      navCyanMaterial,
    ],
  );

  const enginePositions = useMemo<Array<[number, number, number]>>(
    () => [
      [-3.1, 1.5, 19.6],
      [3.1, 1.5, 19.6],
      [-2.2, -2.1, 19.6],
      [2.2, -2.1, 19.6],
    ],
    [],
  );

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;
    const level = throttleRef.current;

    for (const material of plumeMaterials.current) {
      material.uniforms.uTime.value += delta;
      material.uniforms.uThrottle.value +=
        (level - material.uniforms.uThrottle.value) * Math.min(1, delta * 2.4);
    }

    engineRingMaterial.emissiveIntensity = 1.5 + level * 2.6 + Math.sin(t * 4.2) * 0.22;
    windowMaterial.emissiveIntensity = 1.25 + Math.sin(t * 0.8) * 0.18;

    // Blinking navigation beacons.
    navLightRefs.current.forEach((mesh, index) => {
      if (!mesh) return;
      const phase = (t * 1.4 + index * 0.55) % 2;
      const on = phase < 0.22 ? 1 : 0.06;
      const material = mesh.material as THREE.MeshBasicMaterial;
      material.opacity = on;
      mesh.scale.setScalar(0.85 + on * 0.5);
    });

    // Subtle idle sway so the ship feels like it is station-keeping.
    if (rootRef.current) {
      rootRef.current.rotation.z = Math.sin(t * 0.18) * 0.022;
      rootRef.current.rotation.x = Math.sin(t * 0.13) * 0.014;
      rootRef.current.position.y = Math.sin(t * 0.22) * 0.5;
    }
  });

  return (
    <group ref={rootRef} scale={scale}>
      {/* ---------- primary hull ---------- */}
      <mesh geometry={hullGeometry} material={hullMaterial} />

      {/* ---------- dorsal spine ---------- */}
      <mesh material={panelMaterial} position={[0, 4.1, 2]}>
        <boxGeometry args={[1.5, 1.6, 26]} />
      </mesh>
      <mesh material={trimMaterial} position={[0, 5.3, 6]}>
        <boxGeometry args={[0.6, 1.4, 13]} />
      </mesh>

      {/* ---------- ventral keel ---------- */}
      <mesh material={panelMaterial} position={[0, -4.2, 3]}>
        <boxGeometry args={[2.4, 1.3, 20]} />
      </mesh>

      {/* ---------- swept wings ---------- */}
      {[-1, 1].map((side) => (
        <group key={`wing-${side}`} position={[side * 4.2, -0.4, 7]} rotation={[0, 0, side * -0.22]}>
          <mesh material={panelMaterial} rotation={[0, side * 0.34, 0]} position={[side * 5.2, 0, 1.5]}>
            <boxGeometry args={[11.5, 0.75, 9.5]} />
          </mesh>
          <mesh material={trimMaterial} rotation={[0, side * 0.34, 0]} position={[side * 9.6, 0.1, 0.4]}>
            <boxGeometry args={[3.4, 0.5, 5.4]} />
          </mesh>
          {/* wing-tip light */}
          <mesh
            ref={(node) => {
              navLightRefs.current[side > 0 ? 0 : 1] = node;
            }}
            material={side > 0 ? navCyanMaterial : navRedMaterial}
            position={[side * 11.4, 0.2, -1.6]}
          >
            <sphereGeometry args={[0.42, 10, 8]} />
          </mesh>
          <pointLight
            position={[side * 11.4, 0.2, -1.6]}
            color={side > 0 ? '#00E5FF' : '#FF38C7'}
            intensity={6}
            distance={16}
          />
        </group>
      ))}

      {/* ---------- stabiliser fins ---------- */}
      {[-1, 1].map((side) => (
        <mesh
          key={`fin-${side}`}
          material={panelMaterial}
          position={[side * 2.4, 3.2, 16.5]}
          rotation={[0.18, 0, side * 0.5]}
        >
          <boxGeometry args={[0.6, 7.2, 5.2]} />
        </mesh>
      ))}

      {/* ---------- cockpit canopy ---------- */}
      <group position={[0, 1.9, -15.2]}>
        <mesh material={canopyMaterial} rotation={[-0.42, 0, 0]}>
          <sphereGeometry args={[3.1, 28, 18, 0, Math.PI * 2, 0, Math.PI * 0.56]} />
        </mesh>
        <mesh material={trimMaterial} rotation={[-0.42, 0, 0]} position={[0, -0.1, 0]}>
          <torusGeometry args={[3.05, 0.16, 8, 32]} />
        </mesh>
        <pointLight color="#4287FF" intensity={9} distance={22} position={[0, 0.6, 0]} />
      </group>

      {/* ---------- panoramic window strips ---------- */}
      {[-10, -6.5, -3].map((z, index) => (
        <mesh key={`window-${index}`} material={windowMaterial} position={[0, 2.6, z]}>
          <boxGeometry args={[5.6 - index * 0.4, 0.42, 1.5]} />
        </mesh>
      ))}
      {[-1, 1].map((side) =>
        [2, 6, 10].map((z, index) => (
          <mesh
            key={`side-window-${side}-${index}`}
            material={windowMaterial}
            position={[side * 3.9, 1.3, z]}
            rotation={[0, side * 0.35, 0]}
          >
            <boxGeometry args={[0.3, 0.5, 2.6]} />
          </mesh>
        )),
      )}

      {/* ---------- hull greebles (instanced) ---------- */}
      <instancedMesh
        ref={greebleRef}
        args={[greebleGeometry, trimMaterial, greebleCount]}
        frustumCulled={false}
      />

      {/* ---------- engines ---------- */}
      {enginePositions.map((position, index) => (
        <group key={`engine-${index}`} position={position}>
          <mesh material={panelMaterial}>
            <cylinderGeometry args={[1.75, 2.05, 5.6, 20, 1]} />
          </mesh>
          <mesh material={trimMaterial} rotation={[Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <torusGeometry args={[1.95, 0.18, 8, 24]} />
          </mesh>
          <mesh material={engineRingMaterial} position={[0, 0, 2.7]} rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.5, 1.5, 0.45, 20, 1]} />
          </mesh>
          <GlowShell radius={1.9} color="#4287FF" intensity={0.75} power={2.1} scale={1.5} segments={18} />
          <mesh
            geometry={plumeGeometry}
            material={plumes[index]}
            position={[0, 0, 3]}
            scale={[1.55, 1.55, 16]}
            frustumCulled={false}
          />
        </group>
      ))}
      <pointLight position={[0, 0, 24]} color="#4287FF" intensity={28} distance={70} />

      {/* ---------- sensor masts ---------- */}
      {[-1, 1].map((side) => (
        <mesh
          key={`mast-${side}`}
          material={trimMaterial}
          position={[side * 1.6, 3.6, -11]}
          rotation={[0.5, 0, 0]}
        >
          <cylinderGeometry args={[0.07, 0.11, 6.4, 6]} />
        </mesh>
      ))}

      {/* ---------- dorsal beacon ---------- */}
      <mesh
        ref={(node) => {
          navLightRefs.current[2] = node;
        }}
        material={navCyanMaterial}
        position={[0, 6.2, 6]}
      >
        <sphereGeometry args={[0.34, 10, 8]} />
      </mesh>

      {/* ---------- docking ring (the camera flies through this) ---------- */}
      <mesh material={trimMaterial} position={[0, 1.9, -17.6]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.1, 0.22, 8, 28]} />
      </mesh>
    </group>
  );
}

export default Spacecraft;
