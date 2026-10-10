import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { COCKPIT_ORIGIN } from '../data/worldLayout';
import { useQuality } from '../hooks/useQuality';
import Planet, { GlowShell } from '../three/Planet';
import StarField from '../three/StarField';
import { HoloSurface } from '../three/HoloSurfaces';
import { LightStrip, PanoramicWindow, StationRing } from '../three/Structures';
import { hologramControl } from '../three/hologramControl';
import { getMaterials } from '../three/materials';
import HologramStage from './HologramStage';

/** A curved console desk built from a torus slice. */
function CurvedConsole({
  radius,
  arc,
  height = 0.7,
  y = 0.85,
  accent = '#00E5FF',
}: {
  radius: number;
  arc: number;
  height?: number;
  y?: number;
  accent?: string;
}) {
  const materials = getMaterials();
  const geometry = useMemo(
    () => new THREE.CylinderGeometry(radius, radius * 1.04, height, 48, 1, true, -arc / 2, arc),
    [radius, height, arc],
  );
  useEffect(() => () => geometry.dispose(), [geometry]);

  const screens = useMemo(
    () =>
      Array.from({ length: 5 }, (_, i) => {
        const t = (i / 4 - 0.5) * arc * 0.78;
        return { angle: t };
      }),
    [arc],
  );

  return (
    <group position={[0, y, 0]} rotation={[0, Math.PI, 0]}>
      <mesh geometry={geometry} material={materials.panel} />
      <mesh material={materials.trim} position={[0, height / 2, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[radius, 0.07, 6, 48]} />
      </mesh>
      {screens.map((screen, index) => (
        <group
          key={`console-screen-${index}`}
          position={[Math.sin(screen.angle) * (radius - 0.1), 0.2, Math.cos(screen.angle) * (radius - 0.1)]}
          rotation={[-0.75, screen.angle + Math.PI, 0]}
        >
          <HoloSurface
            width={1.25}
            height={0.6}
            color={accent}
            opacity={0.55}
            gridScale={9}
            scanSpeed={0.22}
            frame={false}
          />
        </group>
      ))}
    </group>
  );
}

/**
 * Cockpit lighting that reacts to the hologram.
 *
 * Beat 1 of the reveal is "the cockpit lights dim". Rather than coupling two
 * components through React state at 60fps, both read the same mutable
 * `hologramControl` object, so the dimming is perfectly in step with the
 * projector spinning up.
 */
function CockpitLighting() {
  const ambientRef = useRef<THREE.AmbientLight>(null);
  const hemiRef = useRef<THREE.HemisphereLight>(null);
  const keyRef = useRef<THREE.DirectionalLight>(null);
  const deckRef = useRef<THREE.PointLight>(null);
  const leftRef = useRef<THREE.PointLight>(null);
  const rightRef = useRef<THREE.PointLight>(null);

  const base = useMemo(
    () => ({ ambient: 0.3, hemi: 0.5, key: 1.5, deck: 16, left: 11, right: 11 }),
    [],
  );

  useFrame(() => {
    const dim = 1 - hologramControl.lightDim * 0.72;
    if (ambientRef.current) ambientRef.current.intensity = base.ambient * dim;
    if (hemiRef.current) hemiRef.current.intensity = base.hemi * dim;
    if (keyRef.current) keyRef.current.intensity = base.key * (1 - hologramControl.lightDim * 0.45);
    if (deckRef.current) deckRef.current.intensity = base.deck * dim;
    // Console accents stay on — they sell the "powered down for projection" look.
    if (leftRef.current) leftRef.current.intensity = base.left * (1 - hologramControl.lightDim * 0.3);
    if (rightRef.current) rightRef.current.intensity = base.right * (1 - hologramControl.lightDim * 0.3);
  });

  return (
    <group>
      <ambientLight ref={ambientRef} intensity={base.ambient} color="#7FA6E8" />
      <hemisphereLight ref={hemiRef} args={['#2C5BA8', '#04060E', base.hemi]} />
      {/* Light spilling in from the planet outside the window. */}
      <directionalLight ref={keyRef} position={[-14, 6, -40]} intensity={base.key} color="#AFD9FF" />
      <pointLight ref={deckRef} position={[0, 4.2, 2]} intensity={base.deck} distance={22} color="#4287FF" />
      <pointLight ref={leftRef} position={[-5.5, 1.6, -1]} intensity={base.left} distance={14} color="#00E5FF" />
      <pointLight ref={rightRef} position={[5.5, 1.6, -1]} intensity={base.right} distance={14} color="#9D4EDD" />
    </group>
  );
}

/**
 * SCENES 06–08: the spacecraft interior.
 *
 * A round command deck with a curved panoramic window, two flanking consoles,
 * rotating structural rings and the central holographic projector. The planet
 * and stars outside are real geometry seen through real glass, so the view
 * parallaxes correctly as the camera drifts.
 */
export function CockpitWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const ringAssembly = useRef<THREE.Group>(null);

  useFrame((_state, delta) => {
    if (ringAssembly.current) ringAssembly.current.rotation.y += delta * 0.07;
  });

  return (
    <group position={COCKPIT_ORIGIN}>
      <CockpitLighting />

      {/* ---------------- deck ---------------- */}
      <mesh material={materials.darkPanel} position={[0, -0.18, 0]}>
        <cylinderGeometry args={[9.6, 9.6, 0.36, 64]} />
      </mesh>
      <mesh material={materials.panel} position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[3.4, 9.5, 64, 1]} />
      </mesh>
      {[4.2, 6.4, 8.6].map((radius, index) => (
        <mesh
          key={`deck-ring-${index}`}
          material={materials.trim}
          position={[0, 0.06, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radius, 0.045, 6, 72]} />
        </mesh>
      ))}

      {/*
        Hull shell behind the visitor. It is an arc, not a full cylinder: the
        remaining 198° is the panoramic window, so the wall never appears
        *through* the glass. Material is BackSide because the camera is inside.
      */}
      <mesh material={materials.interior} position={[0, 2.4, 0]}>
        <cylinderGeometry
          args={[10.4, 10.4, 6.6, 48, 1, true, -Math.PI * 0.45, Math.PI * 0.9]}
        />
      </mesh>
      {/* shallow ceiling dome */}
      <mesh material={materials.interior} position={[0, 5.5, 0]} scale={[1, 0.34, 1]}>
        <sphereGeometry args={[10.4, 40, 16, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
      </mesh>
      {/* structural ribs on the rear wall */}
      {[-1.3, -0.65, 0, 0.65, 1.3].map((offset, index) => (
        <mesh
          key={`rear-rib-${index}`}
          material={materials.trim}
          position={[Math.sin(offset) * 10.1, 2.4, Math.cos(offset) * 10.1]}
          rotation={[0, offset, 0]}
        >
          <boxGeometry args={[0.22, 6.4, 0.3]} />
        </mesh>
      ))}

      {/* ---------------- panoramic window ---------------- */}
      <PanoramicWindow radius={10} height={5.4} arc={Math.PI * 1.1} mullions={9} position={[0, 2.1, 0]} />

      {/* ---------------- overhead light ribs ---------------- */}
      {[-1, 1].map((side) =>
        [0, 1, 2].map((index) => (
          <LightStrip
            key={`rib-${side}-${index}`}
            length={7.5}
            thickness={0.05}
            position={[side * (1.8 + index * 1.5), 4.55 - index * 0.12, 1.2]}
            rotation={[0, 0, 0]}
            color={index % 2 === 0 ? '#9FE8FF' : '#4287FF'}
            opacity={0.5}
          />
        )),
      )}
      <mesh material={materials.trim} position={[0, 4.7, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[6.5, 0.08, 6, 64]} />
      </mesh>

      {/* ---------------- front + side consoles ---------------- */}
      <CurvedConsole radius={8.4} arc={Math.PI * 0.72} y={0.95} accent="#00E5FF" />
      {[-1, 1].map((side) => (
        <group key={`side-console-${side}`} position={[side * 5.6, 0.9, 1.4]} rotation={[0, side * -0.9, 0]}>
          <mesh material={materials.panel}>
            <boxGeometry args={[3.2, 1.6, 1.1]} />
          </mesh>
          <mesh material={materials.trim} position={[0, 0.85, 0]}>
            <boxGeometry args={[3.3, 0.08, 1.2]} />
          </mesh>
          <group position={[0, 0.5, 0.56]} rotation={[-0.6, 0, 0]}>
            <HoloSurface
              width={2.7}
              height={0.9}
              color={side > 0 ? '#9D4EDD' : '#00E5FF'}
              opacity={0.6}
              gridScale={12}
              frame={false}
            />
          </group>
          <mesh material={materials.darkPanel} position={[0, 1.9, -0.2]} rotation={[-0.25, 0, 0]}>
            <boxGeometry args={[2.6, 1.5, 0.08]} />
          </mesh>
          <group position={[0, 1.9, -0.14]} rotation={[-0.25, 0, 0]}>
            <HoloSurface
              width={2.4}
              height={1.3}
              color={side > 0 ? '#FF38C7' : '#4287FF'}
              opacity={0.45}
              gridScale={16}
              scanSpeed={0.18}
              frame
            />
          </group>
        </group>
      ))}

      {/* ---------------- pilot seats ---------------- */}
      {[-1.9, 1.9].map((x, index) => (
        <group key={`seat-${index}`} position={[x, 0.45, 2.6]}>
          <mesh material={materials.darkPanel}>
            <boxGeometry args={[0.95, 0.22, 0.95]} />
          </mesh>
          <mesh material={materials.darkPanel} position={[0, 0.72, -0.42]} rotation={[-0.18, 0, 0]}>
            <boxGeometry args={[0.9, 1.5, 0.18]} />
          </mesh>
          <mesh material={materials.trim} position={[0, -0.3, 0]}>
            <cylinderGeometry args={[0.16, 0.26, 0.5, 10]} />
          </mesh>
        </group>
      ))}

      {/* ---------------- central projector assembly ---------------- */}
      <group position={[0, 0, -1.3]}>
        {/* platform */}
        <mesh material={materials.trim}>
          <cylinderGeometry args={[2.45, 2.65, 0.22, 48]} />
        </mesh>
        <mesh material={materials.darkPanel} position={[0, 0.13, 0]}>
          <cylinderGeometry args={[2.2, 2.2, 0.08, 48]} />
        </mesh>
        <group position={[0, 0.19, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <HoloSurface width={4.2} height={4.2} radial color="#00E5FF" opacity={0.5} gridScale={18} />
        </group>

        {/* emitter ribs around the base */}
        {Array.from({ length: 8 }, (_, index) => {
          const angle = (index / 8) * Math.PI * 2;
          return (
            <mesh
              key={`emitter-${index}`}
              material={materials.trim}
              position={[Math.cos(angle) * 2.3, 0.3, Math.sin(angle) * 2.3]}
              rotation={[0, -angle, 0.28]}
            >
              <boxGeometry args={[0.16, 0.6, 0.3]} />
            </mesh>
          );
        })}

        {/* slow structural rings orbiting the projection volume */}
        <group ref={ringAssembly} position={[0, 2.1, 0]}>
          <StationRing radius={3.1} tube={0.05} rotation={[Math.PI / 2.4, 0, 0]} segments={72} spin={0.09} />
          <StationRing radius={3.5} tube={0.04} rotation={[Math.PI / 1.7, 0.4, 0]} segments={72} spin={-0.06} />
          <StationRing radius={2.7} tube={0.06} rotation={[Math.PI / 3.4, -0.3, 0]} segments={72} spin={0.12} />
        </group>

        {/* ceiling emitter pointing down at the platform */}
        <group position={[0, 4.45, 0]}>
          <mesh material={materials.trim}>
            <cylinderGeometry args={[0.7, 0.4, 0.5, 20]} />
          </mesh>
          <mesh material={materials.emissiveCyan} position={[0, -0.28, 0]}>
            <cylinderGeometry args={[0.38, 0.38, 0.08, 20]} />
          </mesh>
          <GlowShell radius={0.4} color="#00E5FF" intensity={0.7} power={2} scale={2.2} segments={16} />
        </group>

        {/* the hologram itself */}
        <HologramStage />
      </group>

      {/* ---------------- interior motes ---------------- */}
      <StarField
        count={Math.max(120, Math.round(quality.dustCount * 0.1))}
        radius={8}
        innerRadius={1.5}
        seed={515}
        sizeScale={1.6}
        opacity={0.3}
        farFade={20}
        spin={0.01}
        palette={['#BFEFFF', '#9FC6FF', '#E6D6FF']}
      />

      {/* ---------------- the view outside ---------------- */}
      <group position={[-30, -8, -168]}>
        <Planet
          radius={46}
          seed={64.9}
          colorDeep="#04111F"
          colorMid="#14618C"
          colorHigh="#C9F6FF"
          colorAtmo="#00E5FF"
          bandScale={3.6}
          turbulence={1.7}
          atmosphere={1.5}
          nightGlow={0.24}
          rotationSpeed={0.005}
          segments={quality.tier === 'low' ? 32 : 72}
          glowIntensity={0.9}
        />
      </group>
      <Planet
        position={[62, 22, -230]}
        radius={14}
        seed={30.2}
        colorDeep="#17101F"
        colorMid="#5B3A82"
        colorHigh="#DCCBFF"
        colorAtmo="#9D4EDD"
        bandScale={3.1}
        atmosphere={0.8}
        segments={32}
        glowIntensity={0.5}
      />
    </group>
  );
}

export default CockpitWorld;
