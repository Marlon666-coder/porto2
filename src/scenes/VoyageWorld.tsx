import { useMemo } from 'react';
import { VOYAGE } from '../data/worldLayout';
import { useQuality } from '../hooks/useQuality';
import { useExperience } from '../state/experienceStore';
import AsteroidField from '../three/AsteroidField';
import Planet, { GlowShell, PlanetRing } from '../three/Planet';
import Spacecraft from '../three/Spacecraft';

/**
 * SCENES 01–05: the deep-space voyage.
 *
 * A gigantic ringed planet, a distant gas giant, an asteroid belt, a luminous
 * host world and the spacecraft itself — all real geometry at real relative
 * scale, laid out along the -Z corridor so flying forward genuinely passes them.
 */
export function VoyageWorld() {
  const quality = useQuality();
  const stage = useExperience((s) => s.stage);
  const transitionPhase = useExperience((s) => s.transitionPhase);

  // Engines spool up as the camera closes in — a lighting cue, not a gimmick.
  const throttle = useMemo(() => {
    if (transitionPhase === 'out' && stage === 'ship-approach') return 1;
    switch (stage) {
      case 'ship-approach':
        return 0.78;
      case 'asteroid-belt':
        return 0.45;
      default:
        return 0.3;
    }
  }, [stage, transitionPhase]);

  return (
    <group>
      {/* ---------------- lighting ---------------- */}
      <ambientLight intensity={0.16} color="#8FA8E0" />
      <hemisphereLight args={['#2B4E9B', '#05070F', 0.38]} />
      {/* Key light from the distant star. */}
      <directionalLight position={[220, 140, 180]} intensity={2.1} color="#DCE9FF" />
      {/* Cool rim so hulls read against the void. */}
      <directionalLight position={[-180, -60, -220]} intensity={0.75} color="#4287FF" />
      <pointLight position={[120, 44, -520]} intensity={900} distance={900} color="#9D4EDD" />

      {/* ---------------- scene 03: the ringed giant ---------------- */}
      <group position={VOYAGE.ringedPlanet.position}>
        <Planet
          radius={VOYAGE.ringedPlanet.radius}
          seed={3.7}
          colorDeep="#1A1226"
          colorMid="#6B4E8F"
          colorHigh="#E3D7FF"
          colorAtmo="#9D4EDD"
          bandScale={5.4}
          turbulence={2.1}
          atmosphere={1.1}
          nightGlow={0.1}
          rotationSpeed={0.016}
          segments={quality.tier === 'low' ? 32 : 72}
          glowIntensity={0.6}
          tilt={0.26}
        />
        <group rotation={[0.26, 0, 0.12]}>
          <PlanetRing
            innerRadius={VOYAGE.ringedPlanet.radius * 1.45}
            outerRadius={VOYAGE.ringedPlanet.radius * 2.65}
            colorA="#C7B4E8"
            colorB="#6FA8FF"
            opacity={0.9}
            segments={quality.tier === 'low' ? 96 : 200}
          />
          <PlanetRing
            innerRadius={VOYAGE.ringedPlanet.radius * 2.8}
            outerRadius={VOYAGE.ringedPlanet.radius * 3.1}
            colorA="#8FA8D8"
            colorB="#FF38C7"
            opacity={0.4}
            rotationSpeed={-0.012}
            segments={quality.tier === 'low' ? 64 : 140}
          />
        </group>
      </group>

      {/* ---------------- a distant gas giant + its moon ---------------- */}
      <group position={VOYAGE.distantGiant.position}>
        <Planet
          radius={VOYAGE.distantGiant.radius}
          seed={21.4}
          colorDeep="#201024"
          colorMid="#8E3F6B"
          colorHigh="#FFD2EC"
          colorAtmo="#FF38C7"
          bandScale={7.2}
          turbulence={2.8}
          atmosphere={1.3}
          nightGlow={0.16}
          rotationSpeed={0.008}
          segments={quality.tier === 'low' ? 24 : 48}
          glowIntensity={0.75}
        />
        <Planet
          position={[-92, 26, 48]}
          radius={11}
          seed={8.1}
          colorDeep="#0D1120"
          colorMid="#3C4A66"
          colorHigh="#C3D4F2"
          colorAtmo="#4287FF"
          bandScale={2.4}
          atmosphere={0.5}
          segments={24}
          glow={false}
        />
      </group>

      {/* ---------------- scene 04: the asteroid belt ---------------- */}
      <group rotation={[0.22, 0, 0.42]}>
        <AsteroidField
          count={quality.asteroidCount}
          center={VOYAGE.asteroidBelt.center}
          innerRadius={VOYAGE.asteroidBelt.innerRadius}
          outerRadius={VOYAGE.asteroidBelt.outerRadius}
          thickness={14}
          orbitSpeed={0.016}
          minScale={0.6}
          maxScale={4.6}
        />
      </group>
      {/* A shattered planetoid anchoring the belt. */}
      <Planet
        position={[VOYAGE.asteroidBelt.center[0], VOYAGE.asteroidBelt.center[1], VOYAGE.asteroidBelt.center[2]]}
        radius={14}
        seed={45.2}
        colorDeep="#15161C"
        colorMid="#4A4046"
        colorHigh="#B8AEB4"
        colorAtmo="#9D4EDD"
        bandScale={2.2}
        turbulence={3.4}
        atmosphere={0.35}
        rotationSpeed={0.03}
        segments={quality.tier === 'low' ? 20 : 40}
        glow={false}
      />

      {/* ---------------- scene 05: the host world + the ship ---------------- */}
      <group position={VOYAGE.hostPlanet.position}>
        <Planet
          radius={VOYAGE.hostPlanet.radius}
          seed={64.9}
          colorDeep="#04111F"
          colorMid="#14618C"
          colorHigh="#C9F6FF"
          colorAtmo="#00E5FF"
          bandScale={3.6}
          turbulence={1.7}
          atmosphere={1.5}
          nightGlow={0.22}
          rotationSpeed={0.006}
          segments={quality.tier === 'low' ? 32 : 80}
          glowIntensity={0.95}
        />
        <GlowShell radius={VOYAGE.hostPlanet.radius} color="#00E5FF" intensity={0.35} power={3.4} scale={1.4} />
      </group>

      <group position={VOYAGE.spacecraft.position}>
        <Spacecraft throttle={throttle} detail={quality.tier === 'low' ? 'low' : 'high'} />
      </group>

      {/* ---------------- distant planetary systems ---------------- */}
      <Planet
        position={[-320, 120, -760]}
        radius={26}
        seed={88.3}
        colorDeep="#0B0F24"
        colorMid="#2B3E86"
        colorHigh="#9FB8FF"
        colorAtmo="#4287FF"
        bandScale={4.1}
        atmosphere={0.8}
        segments={24}
        glowIntensity={0.4}
      />
      <Planet
        position={[260, -150, -900]}
        radius={38}
        seed={12.6}
        colorDeep="#1B0A14"
        colorMid="#7A2446"
        colorHigh="#FFC2D8"
        colorAtmo="#FF38C7"
        bandScale={5.2}
        atmosphere={0.9}
        segments={24}
        glowIntensity={0.5}
      />
    </group>
  );
}

export default VoyageWorld;
