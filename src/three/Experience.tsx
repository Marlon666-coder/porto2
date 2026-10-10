import { Suspense, useCallback, useEffect, useRef } from 'react';
import { AdaptiveDpr, Preload } from '@react-three/drei';
import { Canvas, useFrame, useThree, type RootState } from '@react-three/fiber';
import * as THREE from 'three';
import { getScene } from '../data/scenes';
import { useQuality } from '../hooks/useQuality';
import { getExperience, setExperience, useExperience } from '../state/experienceStore';
import CosmicWorld from '../scenes/CosmicWorld';
import CockpitWorld from '../scenes/CockpitWorld';
import DestinationWorld from '../scenes/DestinationWorld';
import VoyageWorld from '../scenes/VoyageWorld';
import CameraController from './CameraController';
import Effects from './Effects';
import PerfGuard from './PerfGuard';
import SpaceEnvironment from './SpaceEnvironment';
import WarpStreaks from './WarpStreaks';
import ThreeErrorBoundary from '../components/ThreeErrorBoundary';

/**
 * Signals that the universe is actually on screen.
 *
 * The loading progress bar is tied to real work — asset decoding via drei's
 * loading manager plus this warm-up probe — rather than a fake timer. As soon
 * as a handful of frames have been rendered (shaders compiled, first draw
 * submitted) the experience is declared ready and the intro can proceed.
 */
function ReadyProbe() {
  const frames = useRef(0);

  useFrame(() => {
    if (getExperience().sceneReady) return;
    frames.current += 1;
    if (frames.current >= 4) {
      setExperience({ sceneReady: true });
    }
  });

  return null;
}

/** Keeps the renderer healthy and reports context loss instead of dying quietly. */
function RendererGuard() {
  const gl = useThree((state) => state.gl);

  useEffect(() => {
    const canvas = gl.domElement;

    const onLost = (event: Event) => {
      event.preventDefault();
      console.error(
        '[webgl] context lost. The browser or GPU driver released the renderer; reload to restore the experience.',
      );
    };
    const onRestored = () => {
      console.info('[webgl] context restored.');
    };

    canvas.addEventListener('webglcontextlost', onLost as EventListener, false);
    canvas.addEventListener('webglcontextrestored', onRestored, false);

    return () => {
      canvas.removeEventListener('webglcontextlost', onLost as EventListener);
      canvas.removeEventListener('webglcontextrestored', onRestored);
    };
  }, [gl]);

  return null;
}

/** Mounts only the heavy world group the current stage needs. */
function ActiveWorlds() {
  const stage = useExperience((s) => s.stage);
  const world = getScene(stage).world;

  return (
    <>
      {world === 'voyage' && <VoyageWorld />}
      {world === 'cockpit' && <CockpitWorld />}
      <DestinationWorld />
    </>
  );
}

export function Experience() {
  const quality = useQuality();

  const onCreated = useCallback((state: RootState) => {
    state.gl.toneMapping = THREE.ACESFilmicToneMapping;
    state.gl.toneMappingExposure = 1.08;
    state.gl.setClearColor(new THREE.Color('#03040B'), 1);
    // Shadows are intentionally off everywhere: everything emissive is cheaper
    // and reads better in space than real-time shadow maps.
    state.gl.shadowMap.enabled = false;
  }, []);

  return (
    <Canvas
      className="experience-canvas"
      dpr={quality.dpr}
      camera={{ fov: 50, near: 0.12, far: 14000, position: [0, 0, 92] }}
      gl={{
        antialias: quality.tier !== 'low',
        alpha: false,
        stencil: false,
        depth: true,
        powerPreference: 'high-performance',
        preserveDrawingBuffer: false,
      }}
      onCreated={onCreated}
      // The HUD lives in the DOM above the canvas; Three.js only needs to
      // raycast the interactive 3D objects.
      flat={false}
    >
      <color attach="background" args={['#03040B']} />

      <CameraController />
      <RendererGuard />
      <ReadyProbe />
      <PerfGuard />
      <AdaptiveDpr pixelated={false} />

      <Suspense fallback={null}>
        <SpaceEnvironment />
        <CosmicWorld />
        <ActiveWorlds />
        <Preload all />
      </Suspense>

      <WarpStreaks count={quality.tier === 'low' ? 90 : 190} />

      {/*
        Post-processing is a visual bonus, never a dependency. If the effect
        chain fails to initialise on an unusual driver, the boundary drops it
        and the scene keeps rendering.
      */}
      <ThreeErrorBoundary label="post-processing">
        <Effects />
      </ThreeErrorBoundary>
    </Canvas>
  );
}

export default Experience;
