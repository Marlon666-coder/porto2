/**
 * Device-aware quality budget.
 *
 * Detection happens once; the result is then modulated by two runtime signals:
 *  - `degraded` — set by the FPS watchdog when the GPU cannot keep up.
 *  - `reducedMotion` — honours the OS setting and the in-app toggle.
 *
 * Every 3D component reads its particle counts from here instead of hardcoding
 * numbers, so one place controls the whole visual load.
 */

import { useMemo } from 'react';
import { useExperience } from '../state/experienceStore';
import type { QualitySettings, QualityTier } from '../types';

function detectTier(): { tier: QualityTier; isMobile: boolean; isTouch: boolean } {
  if (typeof window === 'undefined') {
    return { tier: 'medium', isMobile: false, isTouch: false };
  }

  const isTouch =
    window.matchMedia?.('(pointer: coarse)').matches ||
    'ontouchstart' in window ||
    navigator.maxTouchPoints > 0;

  const narrow = window.matchMedia?.('(max-width: 900px)').matches ?? window.innerWidth < 900;
  const isMobile = isTouch && narrow;

  const cores = navigator.hardwareConcurrency ?? 4;
  const memory = (navigator as unknown as { deviceMemory?: number }).deviceMemory ?? 4;

  let tier: QualityTier = 'high';
  if (isMobile) tier = cores >= 6 ? 'medium' : 'low';
  else if (cores <= 4 || memory <= 2) tier = 'medium';

  return { tier, isMobile, isTouch };
}

let cached: QualitySettings | null = null;

function buildSettings(): QualitySettings {
  const { tier, isMobile, isTouch } = detectTier();

  const presets: Record<QualityTier, Omit<QualitySettings, 'tier' | 'isMobile' | 'isTouch'>> = {
    high: {
      dpr: [1, 1.9],
      starCount: 26000,
      deepStarCount: 9000,
      dustCount: 2600,
      asteroidCount: 820,
      nebulaLayers: 7,
      postProcessing: true,
      bloomIntensity: 0.95,
      shadows: false,
      cometCount: 5,
      particleSize: 1,
    },
    medium: {
      dpr: [1, 1.5],
      starCount: 13000,
      deepStarCount: 4500,
      dustCount: 1200,
      asteroidCount: 420,
      nebulaLayers: 5,
      postProcessing: true,
      bloomIntensity: 0.7,
      shadows: false,
      cometCount: 3,
      particleSize: 1.1,
    },
    low: {
      dpr: [0.85, 1.2],
      starCount: 6500,
      deepStarCount: 2200,
      dustCount: 520,
      asteroidCount: 190,
      nebulaLayers: 3,
      postProcessing: false,
      bloomIntensity: 0.45,
      shadows: false,
      cometCount: 2,
      particleSize: 1.25,
    },
  };

  return { tier, isMobile, isTouch, ...presets[tier] };
}

export function getBaseQuality(): QualitySettings {
  if (!cached) cached = buildSettings();
  return cached;
}

function degradeOnce(settings: QualitySettings): QualitySettings {
  const nextTier: QualityTier = settings.tier === 'high' ? 'medium' : 'low';
  return {
    ...settings,
    tier: nextTier,
    dpr: [Math.max(0.75, settings.dpr[0] - 0.15), Math.max(1, settings.dpr[1] - 0.4)],
    starCount: Math.round(settings.starCount * 0.5),
    deepStarCount: Math.round(settings.deepStarCount * 0.5),
    dustCount: Math.round(settings.dustCount * 0.45),
    asteroidCount: Math.round(settings.asteroidCount * 0.5),
    nebulaLayers: Math.max(2, settings.nebulaLayers - 2),
    postProcessing: false,
    cometCount: Math.max(1, settings.cometCount - 2),
  };
}

export function useQuality(): QualitySettings {
  const degraded = useExperience((s) => s.degraded);
  const reducedMotion = useExperience((s) => s.reducedMotion);

  return useMemo(() => {
    let settings = getBaseQuality();
    if (degraded) settings = degradeOnce(settings);
    if (reducedMotion) {
      settings = {
        ...settings,
        dustCount: Math.round(settings.dustCount * 0.4),
        cometCount: 0,
        bloomIntensity: settings.bloomIntensity * 0.7,
      };
    }
    return settings;
  }, [degraded, reducedMotion]);
}
