import { useEffect, useMemo, useRef } from 'react';
import { useThree } from '@react-three/fiber';
import gsap from 'gsap';
import { audio } from '../audio/audioEngine';
import { portfolio } from '../data/portfolio';
import { setExperience, useExperience } from '../state/experienceStore';
import { clamp } from '../utils/math';
import { EnergyCore, HoloRings } from '../three/EnergyCore';
import HoloText from '../three/HoloText';
import { ProjectionBeam, RisingParticles } from '../three/HoloSurfaces';
import {
  descriptorControl,
  hologramControl,
  mapControl,
  resetHologramControls,
} from '../three/hologramControl';
import { useQuality } from '../hooks/useQuality';
import UniverseMap from './UniverseMap';

/**
 * Persists across remounts: the full 10-beat reveal is a first-time event.
 * Coming back from a destination replays a short, respectful version instead of
 * making the visitor sit through the whole thing again.
 */
let hasRevealedOnce = false;

/**
 * ============================================================================
 *  SCENE 07 — THE MAIN HOLOGRAM REVEAL
 * ============================================================================
 *
 *  Activation sequence, in order:
 *   1. cockpit lights dim          6. vertical energy beam rises
 *   2. projector engages           7. beam intensifies into a projection
 *   3. energy core ignites         8. two brief, controlled glitches
 *   4. holographic rings emerge    9. the text materialises bottom-up
 *   5. particles rise              10. the hologram stabilises and stays put
 *
 *  Everything is driven by GSAP tweening plain objects in `hologramControl`,
 *  which the shaders read each frame. Once `stability` reaches 1 the flicker
 *  term in the shader is multiplied by zero — so the final message is crisp and
 *  completely stable, by construction rather than by luck.
 */
export function HologramStage() {
  const stage = useExperience((s) => s.stage);
  const reducedMotion = useExperience((s) => s.reducedMotion);
  const quality = useQuality();
  const viewport = useThree((state) => state.viewport);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Keeps the long welcome line readable from phones to ultrawide displays.
  const fit = useMemo(() => clamp(viewport.aspect / 1.55, 0.52, 1), [viewport.aspect]);

  useEffect(() => {
    const ms = reducedMotion ? 0.3 : 1;
    timelineRef.current?.kill();

    const hc = hologramControl;
    const dc = descriptorControl;
    const mc = mapControl;

    if (stage === 'cockpit-entry') {
      // Dormant: the projector is idling, waiting to be activated.
      const timeline = gsap.timeline();
      timeline
        .to(hc, { charge: 0.14, ringSpread: 0.2, duration: 1.4 * ms, ease: 'power2.out' }, 0)
        .to(hc, { opacity: 0, reveal: 0, beam: 0, stability: 0, lightDim: 0, duration: 0.5 * ms }, 0)
        .to([dc, mc], { opacity: 0, duration: 0.4 * ms }, 0);
      timelineRef.current = timeline;
      setExperience({ hologramPhase: 'dormant' });
      return () => {
        timeline.kill();
      };
    }

    if (stage === 'universe') {
      // The welcome message folds away and becomes the navigation map.
      const timeline = gsap.timeline();
      timeline
        .to([hc, dc], { opacity: 0, duration: 0.55 * ms, ease: 'power2.in' }, 0)
        .to(hc, { charge: 0.9, beam: 0.4, ringSpread: 1, lightDim: 0.35, duration: 0.9 * ms }, 0)
        .to(
          mc,
          {
            opacity: 1,
            ringSpread: 1,
            stability: 1,
            reveal: 1,
            duration: 1.3 * ms,
            ease: 'power3.out',
          },
          0.3 * ms,
        )
        .call(
          () => {
            audio.cue('hologram');
          },
          undefined,
          0.3 * ms,
        );
      timelineRef.current = timeline;
      setExperience({ hologramPhase: 'map' });
      return () => {
        timeline.kill();
      };
    }

    if (stage !== 'hologram') {
      resetHologramControls();
      return undefined;
    }

    /* ---------------- the full reveal ---------------- */
    const quick = hasRevealedOnce;
    const timeline = gsap.timeline();

    // Start from zero so a replay is always identical.
    hc.charge = 0.14;
    hc.ringSpread = 0.2;
    hc.opacity = 0;
    hc.reveal = 0;
    hc.stability = 0;
    hc.beam = 0;
    hc.glitch = 0;
    dc.opacity = 0;
    dc.reveal = 0;
    dc.stability = 0;
    mc.opacity = 0;

    if (quick) {
      timeline
        .to(hc, { lightDim: 0.5, charge: 1, ringSpread: 1, beam: 1, duration: 0.7 * ms }, 0)
        .to(hc, { opacity: 1, reveal: 1, stability: 1, duration: 0.8 * ms, ease: 'power2.out' }, 0.15 * ms)
        .to(dc, { opacity: 1, reveal: 1, stability: 1, duration: 0.6 * ms }, 0.5 * ms)
        .call(() => setExperience({ hologramPhase: 'stable' }), undefined, 0.9 * ms);
      timelineRef.current = timeline;
      return () => {
        timeline.kill();
      };
    }

    timeline
      // 1 — the deck dims and the projector spins up.
      .call(
        () => {
          setExperience({ hologramPhase: 'charging' });
          audio.cue('core');
        },
        undefined,
        0,
      )
      .to(hc, { lightDim: 0.62, duration: 0.95 * ms, ease: 'power2.inOut' }, 0)
      // 2/3 — energy core ignites above the platform.
      .to(hc, { charge: 0.45, duration: 1.05 * ms, ease: 'power2.out' }, 0.25 * ms)
      // 4 — holographic rings emerge and begin to rotate.
      .to(hc, { ringSpread: 1, duration: 1.55 * ms, ease: 'power3.out' }, 0.8 * ms)
      .to(hc, { charge: 0.86, duration: 1.1 * ms, ease: 'sine.inOut' }, 1.1 * ms)
      // 5/6 — the vertical beam rises.
      .call(
        () => setExperience({ hologramPhase: 'projecting' }),
        undefined,
        1.35 * ms,
      )
      .to(hc, { beam: 1, duration: 1.0 * ms, ease: 'power2.out' }, 1.35 * ms)
      // 7 — the beam intensifies into a luminous projection.
      .to(hc, { charge: 1, duration: 0.8 * ms, ease: 'power1.inOut' }, 2.2 * ms)
      .call(
        () => {
          audio.cue('hologram');
        },
        undefined,
        2.45 * ms,
      )
      // 9 — the text materialises from the bottom up.
      .to(hc, { opacity: 1, duration: 0.45 * ms }, 2.5 * ms)
      .to(hc, { reveal: 1, duration: 1.05 * ms, ease: 'power2.inOut' }, 2.5 * ms)
      .to(hc, { stability: 0.42, duration: 0.6 * ms }, 2.6 * ms)
      // 8 — two brief, deliberate glitches. Short by design: the message must
      //     stay readable, so each burst is barely a tenth of a second.
      .to(hc, { glitch: 1, duration: 0.1 * ms, ease: 'none' }, 3.0 * ms)
      .to(hc, { glitch: 0, duration: 0.3 * ms, ease: 'power2.out' }, 3.12 * ms)
      .to(hc, { glitch: 0.55, duration: 0.07 * ms, ease: 'none' }, 3.58 * ms)
      .to(hc, { glitch: 0, duration: 0.26 * ms, ease: 'power2.out' }, 3.66 * ms)
      // 10 — lock in. From here on the hologram is perfectly steady.
      .to(hc, { stability: 1, duration: 1.1 * ms, ease: 'power2.out' }, 3.95 * ms)
      .to(
        dc,
        { opacity: 1, reveal: 1, stability: 1, duration: 1.0 * ms, ease: 'power2.out' },
        4.35 * ms,
      )
      // Bring a little cockpit light back so the room does not stay black.
      .to(hc, { lightDim: 0.44, duration: 1.3 * ms, ease: 'power1.inOut' }, 4.3 * ms)
      .call(
        () => {
          hasRevealedOnce = true;
          setExperience({ hologramPhase: 'stable' });
        },
        undefined,
        5.0 * ms,
      );

    timelineRef.current = timeline;
    return () => {
      timeline.kill();
    };
  }, [stage, reducedMotion]);

  useEffect(
    () => () => {
      timelineRef.current?.kill();
      resetHologramControls();
    },
    [],
  );

  const identity = portfolio.identity;
  const particleCount = quality.tier === 'low' ? 140 : quality.tier === 'medium' ? 300 : 520;

  return (
    <group>
      {/* projector volume */}
      <ProjectionBeam control={hologramControl} radius={1.25} height={3.9} position={[0, 0.2, 0]} />
      <RisingParticles
        control={hologramControl}
        count={particleCount}
        radius={1.9}
        height={3.9}
        color="#8CEBFF"
      />

      <group position={[0, 1.0, 0]}>
        <EnergyCore control={hologramControl} radius={0.4} />
        <HoloRings control={hologramControl} count={4} baseRadius={0.92} />
      </group>

      {/* ---------------- the message ---------------- */}
      <group position={[0, 0, 0.55]}>
        <HoloText
          text={identity.welcomeLine}
          size={0.185 * fit}
          position={[0, 3.26, 0]}
          control={hologramControl}
          colorCore="#CFF6FF"
          colorEdge="#4287FF"
          opacityScale={0.82}
          letterSpacingRatio={0.2}
          fontWeight={700}
          resolution={150}
        />

        {/* The primary visual focus. */}
        <HoloText
          text={identity.displayName}
          size={0.58 * fit}
          position={[0, 2.62, 0]}
          control={hologramControl}
          colorCore="#EAFCFF"
          colorEdge="#00E5FF"
          letterSpacingRatio={0.12}
          fontWeight={900}
          resolution={220}
          scanStrength={0.85}
          aberration={1.25}
        />

        {identity.descriptors.map((descriptor, index) => (
          <HoloText
            key={descriptor}
            text={descriptor}
            size={0.1 * fit}
            position={[0, 2.12 - index * 0.17 * fit, 0]}
            control={descriptorControl}
            colorCore="#DCEBFF"
            colorEdge="#9D4EDD"
            opacityScale={0.78}
            letterSpacingRatio={0.26}
            fontWeight={600}
            variant="ui"
            resolution={120}
          />
        ))}
      </group>

      {/* ---------------- scene 08: navigation map ---------------- */}
      <UniverseMap control={mapControl} fit={fit} />
    </group>
  );
}

export default HologramStage;
