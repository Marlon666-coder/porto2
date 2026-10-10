import { useEffect, useMemo, useRef, type ReactNode } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import type { Triple } from '../../types';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import { getMaterials } from '../../three/materials';

/**
 * Shared building blocks for the six destination worlds.
 * Each destination composes these differently — same vocabulary, distinct
 * architecture, lighting and atmosphere per place.
 */

export interface WorldLightingProps {
  accent: string;
  secondary?: string;
  /**
   * Strength of the key light; dial down for archive-like interiors.
   * NOT named `key` — React reserves that prop name and would swallow it.
   */
  keyLight?: number;
  ambient?: number;
  /** Direction the key light comes from. */
  keyPosition?: Triple;
}

export function WorldLighting({
  accent,
  secondary = '#9D4EDD',
  keyLight = 1.6,
  ambient = 0.24,
  keyPosition = [18, 22, 24],
}: WorldLightingProps) {
  return (
    <group>
      <ambientLight intensity={ambient} color="#8FA8E0" />
      <hemisphereLight args={['#23417F', '#04060E', 0.42]} />
      <directionalLight position={keyPosition} intensity={keyLight} color="#E2ECFF" />
      <directionalLight position={[-20, -8, -24]} intensity={0.55} color={accent} />
      <pointLight position={[0, 5, 6]} intensity={22} distance={34} color={accent} />
      <pointLight position={[-9, 2, -6]} intensity={14} distance={26} color={secondary} />
    </group>
  );
}

/* ------------------------------------------------------------------ */

export interface DestinationTitleProps {
  title: string;
  subtitle?: string;
  accent: string;
  position?: Triple;
  scale?: number;
}

/** The big 3D place-name that greets you on arrival. */
export function DestinationTitle({
  title,
  subtitle,
  accent,
  position = [0, 5.1, -3],
  scale = 1,
}: DestinationTitleProps) {
  return (
    <group position={position}>
      <HoloText
        text={title}
        size={0.42 * scale}
        colorCore="#EAFCFF"
        colorEdge={accent}
        letterSpacingRatio={0.16}
        fontWeight={900}
        resolution={190}
      />
      {subtitle && (
        <HoloText
          text={subtitle}
          size={0.1 * scale}
          position={[0, -0.42 * scale, 0]}
          colorCore="#D8E7FF"
          colorEdge={accent}
          opacityScale={0.75}
          letterSpacingRatio={0.3}
          fontWeight={600}
          variant="ui"
          resolution={110}
        />
      )}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export interface DeckProps {
  radius?: number;
  accent?: string;
  rings?: number;
  gridScale?: number;
}

/** A circular deck with holographic grid and concentric trim rings. */
export function Deck({ radius = 11, accent = '#00E5FF', rings = 3, gridScale = 26 }: DeckProps) {
  const materials = getMaterials();

  return (
    <group>
      <mesh material={materials.darkPanel} position={[0, -0.22, 0]}>
        <cylinderGeometry args={[radius, radius * 0.94, 0.44, 72]} />
      </mesh>
      <group position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <HoloSurface
          width={radius * 2}
          height={radius * 2}
          radial
          color={accent}
          opacity={0.4}
          gridScale={gridScale}
          scanSpeed={0.08}
        />
      </group>
      {Array.from({ length: rings }, (_, index) => (
        <mesh
          key={`deck-trim-${index}`}
          material={materials.trim}
          position={[0, 0.07, 0]}
          rotation={[Math.PI / 2, 0, 0]}
        >
          <torusGeometry args={[radius * (0.4 + (index * 0.55) / rings), 0.05, 6, 80]} />
        </mesh>
      ))}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export interface FloatingGroupProps {
  amplitude?: number;
  speed?: number;
  rotation?: number;
  phase?: number;
  children?: ReactNode;
  position?: Triple;
}

/** Gentle buoyancy for anything that should look suspended in zero gravity. */
export function FloatingGroup({
  amplitude = 0.12,
  speed = 0.6,
  rotation = 0.04,
  phase = 0,
  position = [0, 0, 0],
  children,
}: FloatingGroupProps) {
  const ref = useRef<THREE.Group>(null);
  const base = useMemo(() => position, [position]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed + phase;
    ref.current.position.set(base[0], base[1] + Math.sin(t) * amplitude, base[2]);
    ref.current.rotation.y = Math.sin(t * 0.7) * rotation;
  });

  return (
    <group ref={ref} position={position}>
      {children}
    </group>
  );
}

/* ------------------------------------------------------------------ */

export interface ScanBeamProps {
  width?: number;
  height?: number;
  depth?: number;
  color?: string;
  speed?: number;
  position?: Triple;
}

/** A sweeping scanner plane — reads as "this place is actively indexing". */
export function ScanBeam({
  width = 14,
  height = 0.06,
  depth = 10,
  color = '#00E5FF',
  speed = 0.35,
  position = [0, 0, 0],
}: ScanBeamProps) {
  const ref = useRef<THREE.Mesh>(null);
  const material = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: new THREE.Color(color),
        transparent: true,
        opacity: 0.3,
        blending: THREE.AdditiveBlending,
        depthWrite: false,
      }),
    [color],
  );

  useEffect(() => () => material.dispose(), [material]);

  useFrame((state) => {
    if (!ref.current) return;
    const t = state.clock.elapsedTime * speed;
    const travel = (Math.sin(t) * 0.5 + 0.5) * 6;
    ref.current.position.y = position[1] + travel;
    material.opacity = 0.1 + Math.abs(Math.cos(t)) * 0.3;
  });

  return (
    <mesh ref={ref} material={material} position={position}>
      <boxGeometry args={[width, height, depth]} />
    </mesh>
  );
}

/* ------------------------------------------------------------------ */

export interface InteractiveHoloFrameProps {
  width: number;
  height: number;
  position?: Triple;
  rotation?: Triple;
  accent: string;
  label?: string;
  sublabel?: string;
  onSelect?: () => void;
  /** Accessible description announced on focus by the DOM mirror panel. */
  dimmed?: boolean;
}

/**
 * A clickable holographic display.
 *
 * Used for project bays and certificate slots. The hit area is genuine 3D
 * geometry, so selecting a project means clicking the object floating in the
 * hangar — the DOM panel then opens with the full, accessible detail view.
 */
export function InteractiveHoloFrame({
  width,
  height,
  position = [0, 0, 0],
  rotation = [0, 0, 0],
  accent,
  label,
  sublabel,
  onSelect,
  dimmed = false,
}: InteractiveHoloFrameProps) {
  const materials = getMaterials();
  const groupRef = useRef<THREE.Group>(null);
  const hoverRef = useRef(0);
  const hovered = useRef(false);

  const hitMaterial = useMemo(
    () => new THREE.MeshBasicMaterial({ transparent: true, opacity: 0, depthWrite: false }),
    [],
  );
  useEffect(() => () => hitMaterial.dispose(), [hitMaterial]);

  useFrame((state, delta) => {
    hoverRef.current += ((hovered.current ? 1 : 0) - hoverRef.current) * Math.min(1, delta * 8);
    if (!groupRef.current) return;
    const t = state.clock.elapsedTime;
    groupRef.current.position.set(
      position[0],
      position[1] + Math.sin(t * 0.7 + position[0]) * 0.05,
      position[2] + hoverRef.current * 0.35,
    );
    groupRef.current.scale.setScalar(1 + hoverRef.current * 0.06);
  });

  return (
    <group ref={groupRef} position={position} rotation={rotation}>
      <HoloSurface
        width={width}
        height={height}
        color={accent}
        opacity={dimmed ? 0.3 : 0.6}
        gridScale={10}
        scanSpeed={0.16}
      />
      {/* corner brackets */}
      {[
        [-1, 1],
        [1, 1],
        [-1, -1],
        [1, -1],
      ].map(([sx, sy], index) => (
        <group key={`bracket-${index}`} position={[(sx * width) / 2, (sy * height) / 2, 0.01]}>
          <mesh material={materials.trim}>
            <boxGeometry args={[width * 0.16, 0.025, 0.025]} />
          </mesh>
          <mesh material={materials.trim}>
            <boxGeometry args={[0.025, height * 0.2, 0.025]} />
          </mesh>
        </group>
      ))}

      {label && (
        <HoloText
          text={label}
          size={0.115}
          position={[0, -height / 2 - 0.22, 0.02]}
          colorCore="#EAFCFF"
          colorEdge={accent}
          letterSpacingRatio={0.14}
          fontWeight={700}
          variant="ui"
          resolution={120}
          opacityScale={0.95}
        />
      )}
      {sublabel && (
        <HoloText
          text={sublabel}
          size={0.075}
          position={[0, -height / 2 - 0.4, 0.02]}
          colorCore="#BFD6FF"
          colorEdge={accent}
          letterSpacingRatio={0.22}
          fontWeight={600}
          variant="ui"
          resolution={100}
          opacityScale={0.7}
        />
      )}

      {/* invisible, generously sized hit target */}
      <mesh
        material={hitMaterial}
        position={[0, 0, 0.06]}
        onPointerOver={(event) => {
          event.stopPropagation();
          hovered.current = true;
          document.body.style.cursor = onSelect ? 'pointer' : '';
        }}
        onPointerOut={(event) => {
          event.stopPropagation();
          hovered.current = false;
          document.body.style.cursor = '';
        }}
        onClick={(event) => {
          event.stopPropagation();
          document.body.style.cursor = '';
          onSelect?.();
        }}
      >
        <planeGeometry args={[width * 1.05, height * 1.15]} />
      </mesh>
    </group>
  );
}
