/**
 * Central scene controller.
 *
 * Every way of moving through the universe (wheel, swipe, arrow keys, HUD
 * buttons, scene dots, destination menu, hologram CTAs) funnels through
 * `goTo()`. That single door is what makes the animation lock reliable: rapid
 * repeated input can never start a second camera timeline on top of a running
 * one, and heavy world swaps always happen while a flare or warp hides the cut.
 */

import { audio } from '../audio/audioEngine';
import {
  SHIP_ENTRY_PUSH,
  getScene,
  isDestination,
  navigationOrder,
  sceneMap,
} from '../data/scenes';
import type { DestinationId, StageId, TransitionKind } from '../types';
import { cameraBus } from '../three/cameraBus';
import { getExperience, setExperience } from './experienceStore';
import { TRANSITION_TIMING, scaled, wait } from './transitionTiming';

function motionScale(): number {
  return getExperience().reducedMotion ? 0.3 : 1;
}

function resolveKind(from: StageId, to: StageId): TransitionKind {
  const fromScene = getScene(from);
  const toScene = getScene(to);

  if (fromScene.world === toScene.world) {
    // Two different destination worlds are far apart in space -> warp.
    if (toScene.world === 'destination' && from !== to) return 'warp';
    return 'glide';
  }
  // The scripted boarding beat gets the cinematic light flare.
  if (fromScene.world === 'voyage' && to === 'cockpit-entry') return 'flare';
  return 'warp';
}

function cameraCommandFor(stage: StageId, fromIndex = 0) {
  const scene = getScene(stage);
  let poses = scene.path.slice(fromIndex);

  /**
   * Some scenes open with a zero-duration "arrival" pose. Those exist purely so
   * the rig can be snapped into place after a world swap, behind the flare or
   * warp. When we glide into such a scene with the screen fully visible, playing
   * that pose would teleport the camera for one frame — so it is dropped.
   */
  if (fromIndex === 0 && poses.length > 1) {
    poses = poses.filter(
      (pose, index) => index === poses.length - 1 || (pose.duration ?? 2.4) > 0.02,
    );
  }

  return {
    poses,
    parallax: scene.parallax ?? 0.8,
    drift: scene.drift,
    motionScale: motionScale(),
  };
}

/* ------------------------------------------------------------------ */
/* Core navigation                                                     */
/* ------------------------------------------------------------------ */

export async function goTo(target: StageId): Promise<void> {
  const state = getExperience();

  if (!sceneMap[target]) return;
  if (state.phase === 'boot' || state.phase === 'loading') return;
  // The animation lock. There is deliberately no force override: cancelling a
  // transition mid-flight would let the cancelled call's `finally` clear the
  // veil while the new transition is still mid-fade.
  if (state.isTransitioning) return;
  if (state.stage === target) return;

  const from = state.stage;
  const kind = resolveKind(from, target);
  const ms = motionScale();

  setExperience({
    isTransitioning: true,
    previousStage: from,
    transitionKind: kind,
    menuOpen: false,
    activeProjectId: null,
    activeCertificateId: null,
  });

  // Destination panels hide during travel and reappear on arrival.
  if (!isDestination(target)) setExperience({ panelOpen: false });
  else if (isDestination(from) && from !== target) setExperience({ panelOpen: false });

  try {
    if (kind === 'glide') {
      setExperience({ stage: target, transitionPhase: 'in' });
      audio.cue('glide');
      await cameraBus.play(cameraCommandFor(target));
    } else if (kind === 'flare') {
      setExperience({ transitionPhase: 'out' });
      audio.cue('board');
      // Dive toward the cockpit window while the overlay blooms to white.
      if (!getExperience().reducedMotion) {
        await cameraBus.play({
          poses: [SHIP_ENTRY_PUSH],
          parallax: 0.2,
          motionScale: ms,
        });
      } else {
        await wait(scaled(TRANSITION_TIMING.flareOut, ms));
      }

      setExperience({ stage: target, transitionPhase: 'swap' });
      const scene = getScene(target);
      cameraBus.snap(scene.path[0], scene.parallax ?? 0.5, scene.drift);
      await wait(scaled(TRANSITION_TIMING.flareHold, ms));

      setExperience({ transitionPhase: 'in' });
      await cameraBus.play(cameraCommandFor(target, 1));
    } else {
      // warp
      setExperience({ transitionPhase: 'out' });
      audio.cue('warp');
      await wait(scaled(TRANSITION_TIMING.warpOut, ms));

      setExperience({ stage: target, transitionPhase: 'swap' });
      const scene = getScene(target);
      cameraBus.snap(scene.path[0], scene.parallax ?? 0.7, scene.drift);
      await wait(scaled(TRANSITION_TIMING.warpHold, ms));

      setExperience({ transitionPhase: 'in' });
      await cameraBus.play(cameraCommandFor(target, 1));
    }
  } catch (error) {
    // A failed tween must never leave the UI permanently locked.
    console.warn('[navigation] transition interrupted', error);
    setExperience({ stage: target });
  } finally {
    setExperience({ transitionPhase: 'idle', isTransitioning: false });
    if (isDestination(target)) {
      setExperience({ panelOpen: true, hologramPhase: 'dormant' });
      audio.cue('arrive');
    }
    if (target === 'universe') setExperience({ hologramPhase: 'map' });
    if (getScene(target).world === 'voyage') setExperience({ hologramPhase: 'dormant' });
  }
}

/* ------------------------------------------------------------------ */
/* Relative navigation                                                 */
/* ------------------------------------------------------------------ */

export function nextStage(): void {
  const { stage, isTransitioning } = getExperience();
  if (isTransitioning) return;
  const index = navigationOrder.indexOf(stage);
  if (index < 0 || index >= navigationOrder.length - 1) return;
  void goTo(navigationOrder[index + 1]);
}

export function previousStage(): void {
  const { stage, isTransitioning } = getExperience();
  if (isTransitioning) return;
  const index = navigationOrder.indexOf(stage);
  if (index <= 0) return;
  void goTo(navigationOrder[index - 1]);
}

export function goToDestination(id: DestinationId): void {
  void goTo(id);
}

export function returnToUniverse(): void {
  void goTo('universe');
}

/* ------------------------------------------------------------------ */
/* Lifecycle                                                           */
/* ------------------------------------------------------------------ */

export function enterUniverse(): void {
  const state = getExperience();
  if (state.phase === 'experience') return;
  setExperience({ phase: 'experience', hudVisible: true });
  audio.cue('launch');
  void goTo('starfield');
}

/**
 * SCENE 01. Played as soon as the renderer is warm, while the boot overlay is
 * still up — so the very first thing the visitor sees is a slow, live drift
 * into the dark rather than a frozen frame.
 */
export function startAwakening(): void {
  const scene = getScene('awakening');
  cameraBus.snap(
    { position: [0, 0, 92], target: scene.path[0].target, fov: 42 },
    0.1,
    { amplitude: 0.3, speed: 0.06 },
  );
  void cameraBus.play({
    poses: scene.path,
    parallax: scene.parallax,
    drift: scene.drift,
    motionScale: motionScale(),
  });
}

/** Jump straight to the centrepiece without sitting through the voyage. */
export function skipIntro(): void {
  const state = getExperience();
  setExperience({ phase: 'experience', hudVisible: true });
  if (state.stage === 'hologram') return;
  void goTo('hologram');
}

/* ------------------------------------------------------------------ */
/* UI toggles                                                          */
/* ------------------------------------------------------------------ */

export function toggleMenu(): void {
  const { menuOpen } = getExperience();
  setExperience({ menuOpen: !menuOpen });
  audio.cue('ui');
}

export function closeMenu(): void {
  if (getExperience().menuOpen) setExperience({ menuOpen: false });
}

export function openProject(id: string): void {
  setExperience({ activeProjectId: id });
  audio.cue('open');
}

export function closeProject(): void {
  if (getExperience().activeProjectId) {
    setExperience({ activeProjectId: null });
    audio.cue('ui');
  }
}

export function openCertificate(id: string): void {
  setExperience({ activeCertificateId: id });
  audio.cue('open');
}

export function closeCertificate(): void {
  if (getExperience().activeCertificateId) {
    setExperience({ activeCertificateId: null });
    audio.cue('ui');
  }
}

export function togglePanel(): void {
  const { panelOpen } = getExperience();
  setExperience({ panelOpen: !panelOpen });
  audio.cue('ui');
}

export function toggleSound(): void {
  const next = !getExperience().soundEnabled;
  setExperience({ soundEnabled: next });
  if (next) {
    void audio.enable();
    audio.cue('ui');
  } else {
    audio.disable();
  }
}

export function toggleReducedMotion(): void {
  const next = !getExperience().reducedMotion;
  setExperience({ reducedMotion: next });
  audio.cue('ui');
}
