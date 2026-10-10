import { useEffect, useMemo, useRef, useState } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { destinationOrder, sceneMap } from '../data/scenes';
import { DESTINATION_ACCENTS } from '../data/worldLayout';
import { audio } from '../audio/audioEngine';
import { goToDestination } from '../state/navigation';
import type { DestinationId } from '../types';
import HoloText from '../three/HoloText';
import { GlowShell } from '../three/Planet';
import type { HologramControl } from '../three/hologramControl';

interface MapNodeProps {
  id: DestinationId;
  index: number;
  total: number;
  control: HologramControl;
  radius: number;
  fit: number;
}

/**
 * One selectable world in the holographic navigation map.
 * These are real 3D objects with real raycast hit areas — clicking a planet
 * flies the camera to that destination.
 */
function MapNode({ id, index, total, control, radius, fit }: MapNodeProps) {
  const scene = sceneMap[id];
  const accent = DESTINATION_ACCENTS[id];
  const groupRef = useRef<THREE.Group>(null);
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);
  const hoverAmount = useRef(0);

  const angleOffset = (index / total) * Math.PI * 2;
  const tilt = (index % 3) * 0.18 - 0.18;

  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(accent),
        transparent: true,
        opacity: 0.9,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [accent],
  );

  const wireMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#F4F7FF'),
        wireframe: true,
        transparent: true,
        opacity: 0.35,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  useEffect(
    () => () => {
      material.dispose();
      wireMaterial.dispose();
    },
    [material, wireMaterial],
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    const t = state.clock.elapsedTime;
    const angle = angleOffset + t * 0.14;
    const spread = control.ringSpread;

    group.position.set(
      Math.cos(angle) * radius * spread,
      Math.sin(angle * 1.6 + index) * 0.16 + tilt,
      Math.sin(angle) * radius * spread * 0.62,
    );

    hoverAmount.current += (((hovered ? 1 : 0) as number) - hoverAmount.current) * Math.min(1, delta * 9);
    const scale = (0.9 + hoverAmount.current * 0.55) * spread;
    group.scale.setScalar(Math.max(0.001, scale));

    material.opacity = control.opacity * (0.72 + hoverAmount.current * 0.28);
    wireMaterial.opacity = control.opacity * (0.22 + hoverAmount.current * 0.5);

    if (meshRef.current) meshRef.current.rotation.y += delta * 0.4;
  });

  const nodeRadius = 0.14 * fit;

  return (
    <group ref={groupRef}>
      <mesh
        ref={meshRef}
        material={material}
        onPointerOver={(event) => {
          event.stopPropagation();
          setHovered(true);
          document.body.style.cursor = 'pointer';
          audio.cue('ui');
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          setHovered(false);
          document.body.style.cursor = '';
        }}
        onClick={(event) => {
          event.stopPropagation();
          document.body.style.cursor = '';
          goToDestination(id);
        }}
      >
        <sphereGeometry args={[nodeRadius, 20, 14]} />
      </mesh>
      <mesh material={wireMaterial} scale={1.55}>
        <sphereGeometry args={[nodeRadius, 10, 7]} />
      </mesh>
      <GlowShell radius={nodeRadius} color={accent} intensity={0.9} power={2.1} scale={2.8} segments={14} />
      <HoloText
        text={scene.label}
        size={0.085 * fit}
        position={[0, nodeRadius + 0.18 * fit, 0]}
        control={control}
        colorCore="#F4F7FF"
        colorEdge={accent}
        variant="ui"
        fontWeight={700}
        letterSpacingRatio={0.16}
        resolution={110}
        opacityScale={0.95}
        billboard
      />
    </group>
  );
}

export interface UniverseMapProps {
  control: HologramControl;
  /** Responsive scale factor shared with the hologram text. */
  fit: number;
}

/**
 * SCENE 08 — the portfolio universe.
 *
 * The welcome hologram morphs into a navigation map: six worlds orbiting a
 * central core, each one a direct shortcut into a portfolio destination.
 */
export function UniverseMap({ control, fit }: UniverseMapProps) {
  const groupRef = useRef<THREE.Group>(null);
  const viewport = useThree((state) => state.viewport);

  const coreMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#CFF6FF'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [],
  );

  const orbitMaterial = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color('#4287FF'),
        transparent: true,
        opacity: 0,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  useEffect(
    () => () => {
      coreMaterial.dispose();
      orbitMaterial.dispose();
    },
    [coreMaterial, orbitMaterial],
  );

  useFrame((_state, delta) => {
    coreMaterial.opacity = control.opacity * 0.85;
    orbitMaterial.opacity = control.opacity * 0.3;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.05;
      groupRef.current.visible = control.opacity > 0.01;
    }
  });

  const radius = 1.75 * fit * Math.min(1.1, Math.max(0.7, viewport.aspect));

  return (
    <group ref={groupRef} position={[0, 1.55, 0]} visible={false}>
      {/* central core */}
      <mesh material={coreMaterial}>
        <icosahedronGeometry args={[0.14 * fit, 1]} />
      </mesh>
      <GlowShell radius={0.14 * fit} color="#00E5FF" intensity={1} power={2} scale={3.4} segments={16} />

      {/* orbital plane guide */}
      <mesh material={orbitMaterial} rotation={[-Math.PI / 2, 0, 0]} scale={[1, 0.62, 1]}>
        <ringGeometry args={[radius * 0.985, radius * 1.015, 96]} />
      </mesh>

      {destinationOrder.map((id, index) => (
        <MapNode
          key={id}
          id={id}
          index={index}
          total={destinationOrder.length}
          control={control}
          radius={radius}
          fit={fit}
        />
      ))}
    </group>
  );
}

export default UniverseMap;
