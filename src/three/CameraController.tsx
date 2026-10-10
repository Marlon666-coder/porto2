import { useEffect, useMemo, useRef } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { INITIAL_POSE } from '../data/scenes';
import { getExperience } from '../state/experienceStore';
import type { CameraPose } from '../types';
import { damp } from '../utils/math';
import { pointer } from '../utils/pointer';
import { registerCameraBus, type CameraCommand } from './cameraBus';

interface Rig {
  px: number;
  py: number;
  pz: number;
  tx: number;
  ty: number;
  tz: number;
  fov: number;
  parallax: number;
  driftAmplitude: number;
  driftSpeed: number;
  impulse: number;
}

/**
 * The one and only camera rig.
 *
 * Design notes
 * ------------
 *  - GSAP animates a plain JS object (`rig`), never React state. `useFrame`
 *    then copies it onto the Three.js camera. Nothing re-renders while the
 *    camera moves, which is what keeps the choreography at frame rate.
 *  - Mouse parallax and idle drift are added *on top* of the authored pose, so
 *    a scene can be framed precisely while still feeling alive.
 *  - `cameraBus` exposes play/snap/impulse to the DOM-side navigation
 *    controller; only one timeline can exist at a time, which is the mechanism
 *    behind the animation lock.
 */
export function CameraController() {
  const camera = useThree((state) => state.camera) as THREE.PerspectiveCamera;

  const rig = useRef<Rig>({
    px: INITIAL_POSE.position[0],
    py: INITIAL_POSE.position[1],
    pz: INITIAL_POSE.position[2],
    tx: INITIAL_POSE.target[0],
    ty: INITIAL_POSE.target[1],
    tz: INITIAL_POSE.target[2],
    fov: INITIAL_POSE.fov ?? 50,
    parallax: 0.2,
    driftAmplitude: 0.4,
    driftSpeed: 0.1,
    impulse: 0,
  });

  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const pendingResolve = useRef<(() => void) | null>(null);
  const lookTarget = useMemo(() => new THREE.Vector3(), []);
  const lastFov = useRef(-1);

  useEffect(() => {
    /**
     * Killing a timeline must always settle its promise. If it did not, a
     * `goTo()` awaiting that promise would hang forever and the navigation lock
     * would never release — the UI would silently freeze. This is the single
     * most important invariant in the rig.
     */
    const stop = () => {
      const timeline = timelineRef.current;
      timelineRef.current = null;
      timeline?.kill();
      const resolve = pendingResolve.current;
      pendingResolve.current = null;
      resolve?.();
    };

    const snap = (
      pose: CameraPose,
      parallax = 0.7,
      drift?: { amplitude: number; speed: number },
    ) => {
      stop();
      const r = rig.current;
      r.px = pose.position[0];
      r.py = pose.position[1];
      r.pz = pose.position[2];
      r.tx = pose.target[0];
      r.ty = pose.target[1];
      r.tz = pose.target[2];
      if (pose.fov) r.fov = pose.fov;
      r.parallax = parallax;
      if (drift) {
        r.driftAmplitude = drift.amplitude;
        r.driftSpeed = drift.speed;
      }
    };

    const play = (command: CameraCommand) =>
      new Promise<void>((resolve) => {
        const { poses, parallax, drift, motionScale = 1 } = command;
        if (!poses || poses.length === 0) {
          resolve();
          return;
        }

        stop();
        pendingResolve.current = resolve;

        const settle = () => {
          if (pendingResolve.current === resolve) pendingResolve.current = null;
          timelineRef.current = null;
          resolve();
        };

        const timeline = gsap.timeline({
          onComplete: settle,
          onInterrupt: settle,
        });

        const total = poses.reduce((sum, pose) => sum + (pose.duration ?? 2.4), 0) * motionScale;

        poses.forEach((pose) => {
          const duration = Math.max(0.01, (pose.duration ?? 2.4) * motionScale);
          timeline.to(rig.current, {
            px: pose.position[0],
            py: pose.position[1],
            pz: pose.position[2],
            tx: pose.target[0],
            ty: pose.target[1],
            tz: pose.target[2],
            fov: pose.fov ?? rig.current.fov,
            duration,
            ease: pose.ease ?? 'power2.inOut',
          });
        });

        // Ease the interactive feel in parallel with the move.
        if (typeof parallax === 'number') {
          timeline.to(
            rig.current,
            { parallax, duration: Math.max(0.3, total * 0.8), ease: 'power1.out' },
            0,
          );
        }
        if (drift) {
          timeline.to(
            rig.current,
            {
              driftAmplitude: drift.amplitude,
              driftSpeed: drift.speed,
              duration: Math.max(0.3, total),
              ease: 'power1.out',
            },
            0,
          );
        }

        timelineRef.current = timeline;
      });

    const impulse = (strength: number, duration = 0.5) => {
      if (getExperience().reducedMotion) return;
      gsap.killTweensOf(rig.current, 'impulse');
      rig.current.impulse = strength;
      gsap.to(rig.current, { impulse: 0, duration, ease: 'power2.out' });
    };

    const restore = registerCameraBus({ play, snap, impulse, stop });
    return () => {
      stop();
      restore();
    };
  }, []);

  useFrame((state, delta) => {
    const r = rig.current;
    const clamped = Math.min(delta, 0.05);
    const reduced = getExperience().reducedMotion;

    // Smooth the raw pointer so the parallax never snaps.
    pointer.smoothX = damp(pointer.smoothX, reduced ? 0 : pointer.x, 3.2, clamped);
    pointer.smoothY = damp(pointer.smoothY, reduced ? 0 : pointer.y, 3.2, clamped);

    const t = state.clock.elapsedTime;
    const driftScale = reduced ? 0 : 1;
    const driftX = Math.sin(t * r.driftSpeed * 1.7) * r.driftAmplitude * driftScale;
    const driftY = Math.cos(t * r.driftSpeed * 1.3) * r.driftAmplitude * 0.6 * driftScale;

    const shake = r.impulse;
    const shakeX = shake > 0 ? (Math.random() - 0.5) * shake : 0;
    const shakeY = shake > 0 ? (Math.random() - 0.5) * shake : 0;

    const parallaxX = pointer.smoothX * r.parallax * 1.5;
    const parallaxY = pointer.smoothY * r.parallax * 0.95;

    camera.position.set(
      r.px + parallaxX + driftX + shakeX,
      r.py + parallaxY + driftY + shakeY,
      r.pz,
    );

    if (Math.abs(r.fov - lastFov.current) > 0.01) {
      camera.fov = r.fov;
      camera.updateProjectionMatrix();
      lastFov.current = r.fov;
    }

    // Look slightly with the pointer for a natural head-turn feel.
    lookTarget.set(
      r.tx + pointer.smoothX * r.parallax * 0.45,
      r.ty + pointer.smoothY * r.parallax * 0.3,
      r.tz,
    );
    camera.lookAt(lookTarget);
  });

  return null;
}

export default CameraController;
