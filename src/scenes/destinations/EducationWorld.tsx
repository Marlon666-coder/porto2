import * as THREE from 'three';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import Planet, { GlowShell } from '../../three/Planet';
import { DataColumns, LightStrip, OrbitNodes, StationRing } from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import { Deck, DestinationTitle, FloatingGroup, ScanBeam, WorldLighting } from './shared';

const ACCENT = DESTINATION_ACCENTS.education;

/**
 * PLANET 04 — EDUCATION
 * An orbital archive built around a luminous horizontal timeline. Each entry is
 * a node on the beam with a holographic information panel above it.
 */
export function EducationWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const entries = portfolio.education;

  const span = 9;

  return (
    <group position={DESTINATION_ORIGINS.education}>
      <WorldLighting accent={ACCENT} secondary="#4287FF" keyLight={1.05} ambient={0.24} keyPosition={[-12, 20, 26]} />

      <Deck radius={11.5} accent={ACCENT} rings={2} gridScale={28} />

      {/* ---------------- archive shell ---------------- */}
      <mesh material={materials.interior} position={[0, 4.4, -1]}>
        <cylinderGeometry args={[14, 14, 10, 56, 1, true, Math.PI * 0.4, Math.PI * 1.2]} />
      </mesh>
      {/* tiered archive shelving arcs */}
      {[0, 1, 2].map((tier) => (
        <group key={`tier-${tier}`} position={[0, 1.6 + tier * 2.1, -1]}>
          <mesh material={materials.panel} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[12.4 - tier * 0.5, 0.26, 6, 60, Math.PI * 1.15]} />
          </mesh>
          <LightStrip
            length={18 - tier * 1.5}
            position={[0, 0.42, 10.5 - tier * 0.6]}
            color={tier % 2 ? '#4287FF' : '#9FE8FF'}
            opacity={0.4}
          />
        </group>
      ))}
      <StationRing radius={13.6} tube={0.2} rotation={[Math.PI / 2, 0, 0]} position={[0, 9.1, -1]} segments={72} />

      {/* ---------------- the luminous timeline ---------------- */}
      <group position={[0, 2.5, 1.2]}>
        {/* beam */}
        <mesh>
          <boxGeometry args={[span * 2, 0.055, 0.055]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.85}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>
        <mesh scale={[1, 4, 4]}>
          <boxGeometry args={[span * 2, 0.055, 0.055]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.12}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
          />
        </mesh>

        {/* tick marks */}
        {Array.from({ length: 13 }, (_, index) => {
          const x = -span + (index / 12) * span * 2;
          const major = index % 4 === 0;
          return (
            <mesh key={`tick-${index}`} position={[x, major ? -0.2 : -0.12, 0]}>
              <boxGeometry args={[0.02, major ? 0.4 : 0.24, 0.02]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={major ? 0.7 : 0.35}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          );
        })}

        {/* one node + panel per education entry */}
        {entries.map((entry, index) => {
          const count = Math.max(1, entries.length);
          const x = count === 1 ? 0 : -span * 0.72 + (index / (count - 1)) * span * 1.44;
          return (
            <group key={entry.id} position={[x, 0, 0]}>
              <mesh>
                <sphereGeometry args={[0.13, 16, 12]} />
                <meshBasicMaterial
                  color="#F4F7FF"
                  transparent
                  opacity={0.95}
                  blending={THREE.AdditiveBlending}
                  depthWrite={false}
                />
              </mesh>
              <GlowShell radius={0.13} color={ACCENT} intensity={1} power={2} scale={3.4} segments={14} />

              <mesh material={materials.trim} position={[0, 0.7, 0]}>
                <boxGeometry args={[0.02, 1.4, 0.02]} />
              </mesh>

              <FloatingGroup position={[0, 2.5, 0]} amplitude={0.07} speed={0.5} phase={index}>
                <HoloSurface width={5.4} height={2.5} color={ACCENT} opacity={0.42} gridScale={16} scanSpeed={0.12} />
                <HoloText
                  text={entry.institution}
                  size={0.26}
                  position={[0, 0.72, 0.04]}
                  colorCore="#EAFCFF"
                  colorEdge={ACCENT}
                  letterSpacingRatio={0.14}
                  fontWeight={900}
                  resolution={170}
                />
                <HoloText
                  text={entry.program}
                  size={0.145}
                  position={[0, 0.3, 0.04]}
                  colorCore="#D8E7FF"
                  colorEdge="#4287FF"
                  variant="ui"
                  fontWeight={600}
                  letterSpacingRatio={0.22}
                  resolution={130}
                  opacityScale={0.9}
                />
                <mesh position={[0, 0.05, 0.04]}>
                  <boxGeometry args={[3.4, 0.012, 0.012]} />
                  <meshBasicMaterial
                    color={ACCENT}
                    transparent
                    opacity={0.6}
                    blending={THREE.AdditiveBlending}
                    depthWrite={false}
                  />
                </mesh>
                <HoloText
                  text={entry.period}
                  size={0.17}
                  position={[0, -0.26, 0.04]}
                  colorCore="#EAFCFF"
                  colorEdge={ACCENT}
                  letterSpacingRatio={0.3}
                  fontWeight={700}
                  resolution={140}
                />
                <HoloText
                  text={entry.detail ?? ''}
                  size={0.085}
                  position={[0, -0.72, 0.04]}
                  colorCore="#BFD6FF"
                  colorEdge="#4287FF"
                  variant="ui"
                  fontWeight={600}
                  letterSpacingRatio={0.2}
                  resolution={100}
                  opacityScale={0.7}
                />
                <ScanBeam width={5.4} depth={0.08} color={ACCENT} speed={0.3} position={[0, -1.2, 0.05]} />
              </FloatingGroup>
            </group>
          );
        })}
      </group>

      {/* ---------------- the world below ---------------- */}
      <Planet
        position={[14, -36, -52]}
        radius={26}
        seed={77.7}
        colorDeep="#060F22"
        colorMid="#1A4E7A"
        colorHigh="#CFEEFF"
        colorAtmo="#00E5FF"
        bandScale={3.2}
        atmosphere={1.3}
        nightGlow={0.2}
        rotationSpeed={0.005}
        segments={quality.tier === 'low' ? 28 : 56}
        glowIntensity={0.8}
      />

      <DataColumns count={quality.tier === 'low' ? 10 : 26} radius={13} height={7} color="#4287FF" seed={404} />
      <OrbitNodes count={quality.tier === 'low' ? 8 : 18} radius={11.5} spread={6} speed={0.26} size={0.06} color="#9FD8FF" />

      <DestinationTitle title="Education" subtitle="Orbital Archive · Academic Record" accent={ACCENT} position={[0, 7.6, -2]} />
    </group>
  );
}

export default EducationWorld;
