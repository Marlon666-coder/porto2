import { useMemo } from 'react';
import { getScene } from '../data/scenes';
import { COCKPIT_ORIGIN } from '../data/worldLayout';
import { useQuality } from '../hooks/useQuality';
import { useExperience } from '../state/experienceStore';
import type { StageId, Triple } from '../types';
import Comets from '../three/Comets';
import CosmicDust from '../three/CosmicDust';
import NebulaField from '../three/NebulaField';
import StarField from '../three/StarField';

/** The voyage corridor is centred a little ahead of the starting camera. */
const VOYAGE_CENTER: Triple = [0, 0, -200];

/**
 * Which region of space the cosmic backdrop should surround.
 *
 * Star shells are re-centred (once, on stage change — never per frame) on the
 * region the visitor currently occupies. Inside a region the shells stay fixed
 * while the camera moves, which is what produces genuine parallax: near stars
 * sweep past, deep stars barely shift. A backdrop glued to the camera would
 * look like a static image, which is exactly what we are avoiding.
 */
function regionCenter(stage: StageId): Triple {
  const scene = getScene(stage);
  if (scene.world === 'cockpit') return COCKPIT_ORIGIN;
  if (scene.world === 'destination' && scene.worldOrigin) return scene.worldOrigin;
  return VOYAGE_CENTER;
}

/**
 * The persistent universe: star shells, nebulae, dust and comets.
 * Always mounted, so travelling never makes space itself disappear.
 */
export function CosmicWorld() {
  const stage = useExperience((s) => s.stage);
  const phase = useExperience((s) => s.phase);
  const quality = useQuality();

  const center = useMemo(() => regionCenter(stage), [stage]);

  // During the awakening beat the field is deliberately faint; it blooms to
  // full brightness as the visitor enters the universe.
  const awakening = phase !== 'experience' && stage === 'awakening';
  const starOpacity = awakening ? 0.55 : 1;

  return (
    <group position={center}>
      {/* Deep background — barely moves, establishes infinity. */}
      <StarField
        count={quality.deepStarCount}
        radius={6200}
        innerRadius={2600}
        seed={9001}
        sizeScale={0.72}
        opacity={starOpacity * 0.85}
        farFade={9000}
        spin={0.0007}
        flatten={0.68}
      />

      {/* Mid field — the layer that carries most of the parallax. */}
      <StarField
        count={quality.starCount}
        radius={1500}
        innerRadius={260}
        seed={4242}
        sizeScale={1}
        opacity={starOpacity}
        farFade={2400}
        spin={0.0016}
      />

      {/* Near field — fast-moving foreground sparks. */}
      <StarField
        count={Math.round(quality.starCount * 0.12)}
        radius={240}
        innerRadius={40}
        seed={777}
        sizeScale={1.5}
        opacity={starOpacity * 0.9}
        farFade={400}
        spin={0}
      />

      <NebulaField
        layers={quality.nebulaLayers}
        spread={1100}
        seed={20260101}
        intensity={awakening ? 0.55 : 1}
      />

      <CosmicDust count={quality.dustCount} radius={120} opacity={awakening ? 0.25 : 0.55} />

      <Comets count={quality.cometCount} spread={520} />
    </group>
  );
}

export default CosmicWorld;
