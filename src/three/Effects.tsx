import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { useQuality } from '../hooks/useQuality';

/**
 * Post-processing.
 *
 * Deliberately minimal and deliberately optional: bloom sells the emissive
 * holograms and engine glow, and the vignette focuses the frame. Both are
 * switched off on low-tier devices and whenever the FPS watchdog degrades
 * quality — the scene is authored so it still reads well without them.
 */
export function Effects() {
  const quality = useQuality();

  if (!quality.postProcessing) return null;

  return (
    <EffectComposer multisampling={quality.tier === 'high' ? 2 : 0}>
      <Bloom
        intensity={quality.bloomIntensity}
        luminanceThreshold={0.22}
        luminanceSmoothing={0.3}
        mipmapBlur
      />
      <Vignette offset={0.26} darkness={0.72} />
    </EffectComposer>
  );
}

export default Effects;
