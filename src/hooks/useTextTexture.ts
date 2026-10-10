/**
 * Canvas → CanvasTexture text generator.
 *
 * Why not a font atlas / Text3D: shipping (or downloading) a typeface file is an
 * asset that can fail, and an SDF atlas pipeline is overkill here. Rendering the
 * glyphs to a 2D canvas gives us crisp, letter-spaced display type with zero
 * network dependency, and the resulting texture feeds a real GLSL hologram
 * shader on actual 3D geometry in the scene — so the words are genuinely
 * projected into the cockpit rather than being an HTML heading on top of it.
 */

import { useEffect, useState } from 'react';
import * as THREE from 'three';
import { FONT_DISPLAY, useFontsReady } from './useFonts';

export interface TextTextureOptions {
  /** Canvas pixel height of the glyphs. Higher = crisper, more VRAM. */
  fontSize?: number;
  fontWeight?: number | string;
  fontFamily?: string;
  /** Extra space between glyphs, in canvas pixels. */
  letterSpacing?: number;
  uppercase?: boolean;
  /** Transparent padding around the text (canvas pixels). */
  padding?: number;
  /** Soft outer glow baked into the alpha mask. */
  glow?: number;
  /** Hard cap on canvas width; the text is scaled down to fit. */
  maxWidth?: number;
}

export interface TextTextureResult {
  texture: THREE.CanvasTexture;
  /** width / height of the generated canvas — use it to size the plane. */
  aspect: number;
  width: number;
  height: number;
}

const MAX_CANVAS = 4096;

function measure(
  ctx: CanvasRenderingContext2D,
  characters: string[],
  letterSpacing: number,
): number {
  let total = 0;
  for (let i = 0; i < characters.length; i += 1) {
    total += ctx.measureText(characters[i]).width;
    if (i < characters.length - 1) total += letterSpacing;
  }
  return total;
}

export function buildTextTexture(
  text: string,
  options: TextTextureOptions = {},
): TextTextureResult | null {
  const {
    fontSize = 160,
    fontWeight = 900,
    fontFamily = FONT_DISPLAY,
    letterSpacing = fontSize * 0.08,
    uppercase = true,
    padding = fontSize * 0.42,
    glow = fontSize * 0.14,
    maxWidth = MAX_CANVAS,
  } = options;

  const content = (uppercase ? text.toUpperCase() : text).trim();
  if (!content) return null;

  const canvas = document.createElement('canvas');
  const probe = canvas.getContext('2d');
  if (!probe) {
    console.warn('[text] 2D canvas unavailable — skipping holographic text texture.');
    return null;
  }

  const characters = Array.from(content);
  probe.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
  const rawWidth = measure(probe, characters, letterSpacing);

  const available = Math.min(maxWidth, MAX_CANVAS) - padding * 2;
  const scale = rawWidth > available && rawWidth > 0 ? available / rawWidth : 1;

  const scaledFont = Math.max(8, Math.floor(fontSize * scale));
  const scaledSpacing = letterSpacing * scale;
  const scaledPadding = padding * scale;
  const scaledGlow = glow * scale;

  const ctx = canvas.getContext('2d');
  if (!ctx) return null;
  ctx.font = `${fontWeight} ${scaledFont}px ${fontFamily}`;
  const finalWidth = measure(ctx, characters, scaledSpacing);

  canvas.width = Math.min(MAX_CANVAS, Math.ceil(finalWidth + scaledPadding * 2));
  canvas.height = Math.min(MAX_CANVAS, Math.ceil(scaledFont * 1.42 + scaledPadding * 2));

  // Setting width/height resets the context state — reapply it.
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = `${fontWeight} ${scaledFont}px ${fontFamily}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';

  if (scaledGlow > 0) {
    ctx.shadowColor = 'rgba(255,255,255,0.85)';
    ctx.shadowBlur = scaledGlow;
  }

  let x = (canvas.width - finalWidth) / 2;
  const y = canvas.height / 2;
  for (const char of characters) {
    ctx.fillText(char, x, y);
    x += ctx.measureText(char).width + scaledSpacing;
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.minFilter = THREE.LinearFilter;
  texture.magFilter = THREE.LinearFilter;
  texture.generateMipmaps = false;
  texture.wrapS = THREE.ClampToEdgeWrapping;
  texture.wrapT = THREE.ClampToEdgeWrapping;
  texture.needsUpdate = true;

  return {
    texture,
    aspect: canvas.width / canvas.height,
    width: canvas.width,
    height: canvas.height,
  };
}

export function useTextTexture(
  text: string,
  options: TextTextureOptions = {},
): TextTextureResult | null {
  const fontsReady = useFontsReady();
  const [result, setResult] = useState<TextTextureResult | null>(null);
  const optionsKey = JSON.stringify(options);

  useEffect(() => {
    let built: TextTextureResult | null = null;
    try {
      built = buildTextTexture(text, JSON.parse(optionsKey) as TextTextureOptions);
    } catch (error) {
      console.warn('[text] failed to build text texture', error);
      built = null;
    }
    setResult(built);

    return () => {
      // Explicit GPU cleanup — canvas textures are not garbage collected.
      built?.texture.dispose();
    };
    // `fontsReady` is a dependency on purpose: the texture is redrawn once the
    // display face is available so the first paint is never the fallback font.
  }, [text, optionsKey, fontsReady]);

  return result;
}
