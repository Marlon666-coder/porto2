import { useEffect, useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { FONT_DISPLAY, FONT_UI } from '../hooks/useFonts';
import { useTextTexture } from '../hooks/useTextTexture';
import type { Triple } from '../types';
import { STABLE_CONTROL, type HologramControl } from './hologramControl';
import { hologramTextFragmentShader, hologramTextVertexShader } from './shaders/hologram';

export interface HoloTextProps {
  text: string;
  /** Height of the glyphs in world units. Width follows the text aspect. */
  size: number;
  position?: Triple;
  rotation?: Triple;
  /** Live control object mutated by the GSAP hologram timeline. */
  control?: HologramControl;
  colorCore?: string;
  colorEdge?: string;
  /** Multiplies the control opacity (lets secondary lines sit back). */
  opacityScale?: number;
  scanStrength?: number;
  aberration?: number;
  /** Canvas resolution of the glyph mask. */
  resolution?: number;
  letterSpacingRatio?: number;
  fontWeight?: number;
  variant?: 'display' | 'ui';
  /** Always face the camera. */
  billboard?: boolean;
  renderOrder?: number;
}

/**
 * Holographic 3D text.
 *
 * The glyphs are rasterised to a canvas (see `useTextTexture`) and then used as
 * an alpha mask by a GLSL shader on a real plane in the scene. That means the
 * words are lit, scanned, RGB-split and depth-sorted inside the cockpit like
 * any other 3D object — not an HTML heading floating above the canvas.
 */
export function HoloText({
  text,
  size,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  control = STABLE_CONTROL,
  colorCore = '#B9F5FF',
  colorEdge = '#4287FF',
  opacityScale = 1,
  scanStrength = 1,
  aberration = 1,
  resolution = 170,
  letterSpacingRatio = 0.1,
  fontWeight = 900,
  variant = 'display',
  billboard = false,
  renderOrder = 10,
}: HoloTextProps) {
  const meshRef = useRef<THREE.Mesh>(null);

  const textureResult = useTextTexture(text, {
    fontSize: resolution,
    fontWeight,
    fontFamily: variant === 'display' ? FONT_DISPLAY : FONT_UI,
    letterSpacing: resolution * letterSpacingRatio,
    uppercase: variant === 'display',
    glow: resolution * 0.1,
    padding: resolution * 0.3,
  });

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: hologramTextVertexShader,
        fragmentShader: hologramTextFragmentShader,
        uniforms: {
          uMap: { value: null },
          uTime: { value: 0 },
          uStability: { value: 1 },
          uOpacity: { value: 0 },
          uGlitch: { value: 0 },
          uAberration: { value: aberration },
          uScanStrength: { value: scanStrength },
          uReveal: { value: 1 },
          uJitter: { value: 1 },
          uColorCore: { value: new THREE.Color(colorCore) },
          uColorEdge: { value: new THREE.Color(colorEdge) },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    [aberration, scanStrength, colorCore, colorEdge],
  );

  useEffect(() => {
    material.uniforms.uMap.value = textureResult?.texture ?? null;
  }, [material, textureResult]);

  useEffect(() => () => material.dispose(), [material]);

  const geometry = useMemo(() => new THREE.PlaneGeometry(1, 1, 1, 1), []);
  useEffect(() => () => geometry.dispose(), [geometry]);

  useFrame((state, delta) => {
    material.uniforms.uTime.value += delta;
    material.uniforms.uStability.value = control.stability;
    material.uniforms.uOpacity.value = control.opacity * opacityScale;
    material.uniforms.uGlitch.value = control.glitch;
    material.uniforms.uReveal.value = control.reveal;

    if (billboard && meshRef.current) {
      meshRef.current.quaternion.copy(state.camera.quaternion);
    }
  });

  if (!textureResult) return null;

  return (
    <mesh
      ref={meshRef}
      geometry={geometry}
      material={material}
      position={position}
      rotation={rotation}
      scale={[size * textureResult.aspect, size, 1]}
      renderOrder={renderOrder}
      frustumCulled={false}
    />
  );
}

export default HoloText;
