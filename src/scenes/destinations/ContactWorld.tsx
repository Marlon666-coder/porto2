import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import Planet, { GlowShell } from '../../three/Planet';
import { DataColumns, LightStrip, PanoramicWindow, StationRing } from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import { Deck, DestinationTitle, FloatingGroup, WorldLighting } from './shared';

const ACCENT = DESTINATION_ACCENTS.contact;

/** Expanding transmission rings — a visible "signal leaving the antenna". */
function TransmissionRings({ count = 5, color = ACCENT }: { count?: number; color?: string }) {
  const refs = useRef<Array<THREE.Mesh | null>>([]);

  const materials = useMemo(
    () =>
      Array.from(
        { length: count },
        () =>
          new THREE.MeshBasicMaterial({
            color: new THREE.Color(color),
            transparent: true,
            opacity: 0,
            blending: THREE.AdditiveBlending,
            depthWrite: false,
            side: THREE.DoubleSide,
          }),
      ),
    [count, color],
  );

  useEffect(
    () => () => {
      for (const material of materials) material.dispose();
    },
    [materials],
  );

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    for (let i = 0; i < count; i += 1) {
      const mesh = refs.current[i];
      if (!mesh) continue;
      const phase = (t * 0.35 + i / count) % 1;
      const scale = 0.2 + phase * 5.4;
      mesh.scale.setScalar(scale);
      materials[i].opacity = (1 - phase) * 0.5;
    }
  });

  return (
    <group rotation={[0, 0, 0]}>
      {Array.from({ length: count }, (_, index) => (
        <mesh
          key={`tx-ring-${index}`}
          ref={(node) => {
            refs.current[index] = node;
          }}
          material={materials[index]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[1, 0.012, 4, 72]} />
        </mesh>
      ))}
    </group>
  );
}

/**
 * PLANET 06 — CONTACT
 * A communications terminal: a steerable dish, a wall of signal readouts and a
 * transmission beam pointed at a distant world. The actual contact links live in
 * the accessible DOM terminal panel.
 */
export function ContactWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const channels = portfolio.contact.channels;
  const dishRef = useRef<THREE.Group>(null);
  const beamRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    const t = state.clock.elapsedTime;
    if (dishRef.current) {
      dishRef.current.rotation.y = -0.4 + Math.sin(t * 0.18) * 0.22;
      dishRef.current.rotation.x = -0.5 + Math.sin(t * 0.13) * 0.08;
    }
    if (beamRef.current) {
      const material = beamRef.current.material as THREE.MeshBasicMaterial;
      material.opacity = 0.12 + Math.abs(Math.sin(t * 0.9)) * 0.22;
    }
  });

  return (
    <group position={DESTINATION_ORIGINS.contact}>
      <WorldLighting accent={ACCENT} secondary="#00E5FF" keyLight={1.15} ambient={0.25} keyPosition={[-16, 16, 24]} />

      <Deck radius={10} accent={ACCENT} rings={3} gridScale={26} />
      <PanoramicWindow radius={11.5} height={6} arc={Math.PI} mullions={7} position={[0, 2.6, 0]} />

      <mesh material={materials.interior} position={[0, 3.4, 0]}>
        <cylinderGeometry args={[12, 12, 8, 48, 1, true, Math.PI * 0.5, Math.PI]} />
      </mesh>
      <StationRing radius={12.2} tube={0.2} rotation={[Math.PI / 2, 0, 0]} position={[0, 7.3, 0]} segments={72} />
      {[0, 1].map((index) => (
        <LightStrip
          key={`comms-strip-${index}`}
          length={14}
          position={[0, 6.6 - index * 0.35, 2 + index * 2.4]}
          color={index % 2 ? '#00E5FF' : '#9FE8FF'}
          opacity={0.45}
        />
      ))}

      {/* ---------------- main terminal console ---------------- */}
      <group position={[0, 0, -4.4]}>
        <mesh material={materials.panel} position={[0, 0.8, 0]}>
          <boxGeometry args={[6.4, 1.6, 1.4]} />
        </mesh>
        <mesh material={materials.trim} position={[0, 1.66, 0]}>
          <boxGeometry args={[6.6, 0.1, 1.5]} />
        </mesh>
        <group position={[0, 1.35, 0.6]} rotation={[-0.55, 0, 0]}>
          <HoloSurface width={5.6} height={1.1} color={ACCENT} opacity={0.55} gridScale={14} frame={false} />
        </group>

        {/* one status lamp per configured channel */}
        {channels.map((channel, index) => {
          const x = -2.6 + index * 1.3;
          return (
            <group key={channel.id} position={[x, 1.78, 0.1]}>
              <mesh material={channel.enabled ? materials.emissiveCyan : materials.darkPanel}>
                <cylinderGeometry args={[0.14, 0.14, 0.08, 14]} />
              </mesh>
              {channel.enabled && (
                <GlowShell radius={0.14} color="#00E5FF" intensity={0.8} power={2} scale={2.4} segments={12} />
              )}
            </group>
          );
        })}
      </group>

      {/* ---------------- the dish ---------------- */}
      <group position={[-6.6, 1.2, -2.4]}>
        <mesh material={materials.trim} position={[0, 0.4, 0]}>
          <cylinderGeometry args={[0.45, 0.65, 0.8, 16]} />
        </mesh>
        <mesh material={materials.panel} position={[0, 1.4, 0]}>
          <cylinderGeometry args={[0.22, 0.22, 1.6, 12]} />
        </mesh>
        <group ref={dishRef} position={[0, 2.4, 0]}>
          <mesh material={materials.hull} rotation={[0, 0, 0]}>
            <sphereGeometry args={[1.9, 32, 20, 0, Math.PI * 2, 0, Math.PI * 0.42]} />
          </mesh>
          <mesh material={materials.trim} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.02, 0]}>
            <torusGeometry args={[1.78, 0.07, 6, 48]} />
          </mesh>
          <mesh material={materials.trim} position={[0, 1.5, 0]}>
            <cylinderGeometry args={[0.05, 0.05, 2.4, 6]} />
          </mesh>
          <mesh material={materials.emissiveCyan} position={[0, 2.6, 0]}>
            <sphereGeometry args={[0.16, 12, 10]} />
          </mesh>
          <group position={[0, 0.6, 0]}>
            <TransmissionRings count={5} />
          </group>
        </group>
      </group>

      {/* ---------------- the transmission beam ---------------- */}
      <mesh ref={beamRef} position={[2, 3.4, -26]} rotation={[Math.PI / 2, 0, 0.08]}>
        <cylinderGeometry args={[0.1, 0.5, 46, 10, 1, true]} />
        <meshBasicMaterial
          color={ACCENT}
          transparent
          opacity={0.2}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          side={THREE.DoubleSide}
        />
      </mesh>

      {/* ---------------- the world being hailed ---------------- */}
      <Planet
        position={[6, 6, -84]}
        radius={20}
        seed={9.3}
        colorDeep="#060D22"
        colorMid="#22407F"
        colorHigh="#C6D8FF"
        colorAtmo="#4287FF"
        bandScale={3.6}
        atmosphere={1.4}
        nightGlow={0.22}
        rotationSpeed={0.006}
        segments={quality.tier === 'low' ? 28 : 56}
        glowIntensity={0.85}
      />

      {/* ---------------- headline ---------------- */}
      <FloatingGroup position={[0, 4.3, -3.2]} amplitude={0.06} speed={0.45}>
        <HoloText
          text={portfolio.contact.heading}
          size={0.38}
          colorCore="#EAFCFF"
          colorEdge={ACCENT}
          letterSpacingRatio={0.16}
          fontWeight={900}
          resolution={190}
        />
        <HoloText
          text="OPEN CHANNEL · AWAITING TRANSMISSION"
          size={0.088}
          position={[0, -0.4, 0]}
          colorCore="#CFE4FF"
          colorEdge="#00E5FF"
          variant="ui"
          fontWeight={600}
          letterSpacingRatio={0.3}
          resolution={110}
          opacityScale={0.7}
        />
      </FloatingGroup>

      <DataColumns count={quality.tier === 'low' ? 8 : 20} radius={11.4} height={5} color={ACCENT} seed={606} />

      <DestinationTitle title="Contact" subtitle="Communications Terminal" accent={ACCENT} position={[0, 6.7, -2]} scale={0.8} />
    </group>
  );
}

export default ContactWorld;
