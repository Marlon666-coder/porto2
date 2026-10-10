import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import Planet, { GlowShell } from '../../three/Planet';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import {
  LightStrip,
  OrbitNodes,
  PanoramicWindow,
  RadialStruts,
  StationRing,
} from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import {
  Deck,
  DestinationTitle,
  FloatingGroup,
  ScanBeam,
  WorldLighting,
} from './shared';

const ACCENT = DESTINATION_ACCENTS.about;

/**
 * PLANET 01 — ABOUT ME
 * An orbital observatory hanging above a luminous ocean world. The deck opens
 * onto a curved window; the planet below is the main light source, so the whole
 * set is lit from underneath.
 */
export function AboutWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const about = portfolio.about;

  return (
    <group position={DESTINATION_ORIGINS.about}>
      <WorldLighting accent={ACCENT} secondary="#4287FF" keyLight={1.1} ambient={0.26} keyPosition={[-10, -18, -30]} />

      {/* ---------------- the world below ---------------- */}
      <group position={[-4, -54, -62]}>
        <Planet
          radius={34}
          seed={101.4}
          colorDeep="#03121E"
          colorMid="#0F5E8A"
          colorHigh="#D6FAFF"
          colorAtmo="#00E5FF"
          bandScale={3.4}
          turbulence={1.6}
          atmosphere={1.6}
          nightGlow={0.26}
          rotationSpeed={0.005}
          segments={quality.tier === 'low' ? 32 : 72}
          glowIntensity={1}
        />
        <GlowShell radius={34} color="#00E5FF" intensity={0.3} power={3.6} scale={1.34} />
      </group>

      {/* ---------------- observatory structure ---------------- */}
      <Deck radius={10.5} accent={ACCENT} rings={3} gridScale={30} />
      <PanoramicWindow radius={12.5} height={6.4} arc={Math.PI * 0.95} mullions={9} position={[0, 2.6, 0]} />

      {/* outer structural rings + spokes */}
      <StationRing radius={13.4} tube={0.22} rotation={[Math.PI / 2, 0, 0]} position={[0, 6, 0]} segments={80} />
      <StationRing radius={13.4} tube={0.22} rotation={[Math.PI / 2, 0, 0]} position={[0, -0.6, 0]} segments={80} />
      <RadialStruts count={10} innerRadius={10} outerRadius={13.4} thickness={0.16} position={[0, 6, 0]} rotation={[Math.PI / 2, 0, 0]} />

      {/* rear bulkhead so the deck feels enclosed */}
      <mesh material={materials.interior} position={[0, 3.2, 0]}>
        <cylinderGeometry args={[13, 13, 7.6, 48, 1, true, Math.PI * 0.52, Math.PI * 0.96]} />
      </mesh>
      {[-0.5, 0, 0.5].map((offset, index) => (
        <LightStrip
          key={`ceiling-strip-${index}`}
          length={13}
          position={[offset * 5, 6.3, 2]}
          color={index % 2 ? '#4287FF' : '#9FE8FF'}
          opacity={0.45}
        />
      ))}

      {/* ---------------- holographic portrait frame ---------------- */}
      <FloatingGroup position={[-4.4, 2.9, -2.6]} amplitude={0.08} speed={0.5}>
        <group rotation={[0, 0.42, 0]}>
          <HoloSurface width={2.5} height={3.2} color={ACCENT} opacity={0.5} gridScale={12} scanSpeed={0.14} />
          <mesh material={materials.trim} position={[0, 0, -0.04]}>
            <boxGeometry args={[2.7, 3.4, 0.05]} />
          </mesh>
          <ScanBeam width={2.5} depth={0.1} color={ACCENT} speed={0.5} position={[0, -1.5, 0.05]} />
          <HoloText
            text="VISUAL ID"
            size={0.085}
            position={[0, -1.82, 0.02]}
            colorCore="#DCEBFF"
            colorEdge={ACCENT}
            variant="ui"
            fontWeight={600}
            letterSpacingRatio={0.3}
            resolution={100}
            opacityScale={0.75}
          />
        </group>
      </FloatingGroup>

      {/* ---------------- focus-area readouts ---------------- */}
      {about.focusAreas.slice(0, 4).map((area, index) => (
        <FloatingGroup
          key={area}
          position={[4.3 + (index % 2) * 0.5, 4.1 - index * 0.95, -1.4]}
          amplitude={0.05}
          speed={0.45 + index * 0.1}
          phase={index}
        >
          <group rotation={[0, -0.5, 0]}>
            <HoloSurface width={2.9} height={0.52} color={ACCENT} opacity={0.4} gridScale={8} frame={false} />
            <HoloText
              text={area}
              size={0.1}
              position={[0, 0, 0.03]}
              colorCore="#EAFCFF"
              colorEdge={ACCENT}
              variant="ui"
              fontWeight={600}
              letterSpacingRatio={0.2}
              resolution={110}
              opacityScale={0.9}
            />
          </group>
        </FloatingGroup>
      ))}

      {/* ---------------- survey probes ---------------- */}
      <OrbitNodes count={quality.tier === 'low' ? 10 : 26} radius={12} spread={4} speed={0.3} size={0.07} color="#9FD8FF" />

      <DestinationTitle title="About Me" subtitle="Orbital Observatory · Deck 01" accent={ACCENT} position={[0, 5.9, -3.4]} />
    </group>
  );
}

export default AboutWorld;
