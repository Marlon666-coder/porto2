import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing';
import { HalfFloatType } from 'three';
import { useQuality } from '../hooks/useQuality';

/**
 * Post-processing.
 *
 * Deliberately minimal and deliberately optional: bloom sells the emissive
 * holograms and engine glow, and the vignette focuses the frame. Both are
 * switched off on low-tier devices and whenever the FPS watchdog degrades
 * quality — the scene is authored so it still reads well without them.
 *
 * DESKTOP "BLACK GLITCH" NOTES
 * ----------------------------
 * This component only runs where `postProcessing` is true (i.e. desktop /
 * high-mid tiers), which is exactly where some users saw intermittent black
 * flashes. Two things fixed that:
 *
 *  1. `multisampling={0}`. MSAA on the EffectComposer's internal render target
 *     is a well-known source of black / corrupted frames on several desktop GPU
 *     + ANGLE combinations (notably Intel iGPUs under Chromium). Bloom does not
 *     need MSAA — the base scene already renders antialiased — so turning it off
 *     on the composer removes the artefact with no visible quality loss.
 *
 *  2. `frameBufferType={HalfFloatType}`. The deep-space scene is almost entirely
 *     very dark values with a few bright emissives. A low-precision (8-bit)
 *     buffer quantises those dark values and, combined with the bloom threshold,
 *     can momentarily crush whole regions to pure black. A half-float buffer
 *     keeps the dark range smooth and stable.
 *
 * The slightly higher luminance threshold also stops faint dark areas from
 * being pushed through the bloom pass and flickering.
 */
export function Effects() {
  const quality = useQuality();

  if (!quality.postProcessing) return null;

  return (
    <EffectComposer
      multisampling={0}
      frameBufferType={HalfFloatType}
      enableNormalPass={false}
    >
      <Bloom
        intensity={quality.bloomIntensity}
        luminanceThreshold={0.3}
        luminanceSmoothing={0.4}
        mipmapBlur
      />
      <Vignette offset={0.26} darkness={0.68} />
    </EffectComposer>
  );
}

export default Effects;
