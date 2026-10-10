import * as THREE from 'three';

/**
 * Shared material library.
 *
 * Materials are created once and reused by every station, hull and console in
 * the universe. Two reasons:
 *  1. Fewer unique materials = fewer shader programs and fewer GPU state
 *     changes per frame.
 *  2. Worlds mount and unmount constantly as the visitor travels; recreating
 *     identical materials each time would thrash the GPU.
 *
 * They intentionally live for the lifetime of the page. `disposeSharedMaterials`
 * exists for completeness (hot-reload / teardown).
 */

export interface MaterialLibrary {
  hull: THREE.MeshStandardMaterial;
  panel: THREE.MeshStandardMaterial;
  trim: THREE.MeshStandardMaterial;
  darkPanel: THREE.MeshStandardMaterial;
  interior: THREE.MeshStandardMaterial;
  glass: THREE.MeshStandardMaterial;
  emissiveCyan: THREE.MeshStandardMaterial;
  emissiveBlue: THREE.MeshStandardMaterial;
  emissiveViolet: THREE.MeshStandardMaterial;
  emissiveMagenta: THREE.MeshStandardMaterial;
  lightStrip: THREE.MeshBasicMaterial;
}

let library: MaterialLibrary | null = null;

function emissive(color: string, intensity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: new THREE.Color('#060A18'),
    emissive: new THREE.Color(color),
    emissiveIntensity: intensity,
    metalness: 0.35,
    roughness: 0.25,
  });
}

export function getMaterials(): MaterialLibrary {
  if (library) return library;

  library = {
    hull: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#2C3650'),
      metalness: 0.9,
      roughness: 0.36,
      envMapIntensity: 1.05,
    }),
    panel: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#1B2235'),
      metalness: 0.82,
      roughness: 0.5,
      envMapIntensity: 0.85,
    }),
    trim: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#5E6E95'),
      metalness: 0.96,
      roughness: 0.2,
      envMapIntensity: 1.35,
    }),
    darkPanel: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#0A0E1C'),
      metalness: 0.6,
      roughness: 0.68,
      envMapIntensity: 0.5,
    }),
    // BackSide: used for shells the camera sits *inside* (cockpit walls, domes).
    interior: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#151C2E'),
      metalness: 0.74,
      roughness: 0.56,
      envMapIntensity: 0.7,
      side: THREE.BackSide,
    }),
    glass: new THREE.MeshStandardMaterial({
      color: new THREE.Color('#06121F'),
      metalness: 0.2,
      roughness: 0.06,
      transparent: true,
      opacity: 0.18,
      side: THREE.DoubleSide,
      envMapIntensity: 1.6,
    }),
    emissiveCyan: emissive('#00E5FF', 1.6),
    emissiveBlue: emissive('#4287FF', 1.5),
    emissiveViolet: emissive('#9D4EDD', 1.4),
    emissiveMagenta: emissive('#FF38C7', 1.3),
    lightStrip: new THREE.MeshBasicMaterial({
      color: new THREE.Color('#9FE8FF'),
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    }),
  };

  return library;
}

export function disposeSharedMaterials(): void {
  if (!library) return;
  for (const material of Object.values(library)) material.dispose();
  library = null;
}
