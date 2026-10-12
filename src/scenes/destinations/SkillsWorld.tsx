import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import { GlowShell } from '../../three/Planet';
import { DataColumns, LightStrip, OrbitNodes, StationRing } from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import { Deck, DestinationTitle, ScanBeam, WorldLighting } from './shared';

const ACCENT = DESTINATION_ACCENTS.skills;

/**
 * One skill category rendered as an orbital diagram: a labelled node riding its
 * own inclined ring, with a satellite per technology in that category.
 */
function SkillOrbit({
  title,
  items,
  index,
  total,
  color,
}: {
  title: string;
  items: string[];
  index: number;
  total: number;
  color: string;
}) {
  const ringRef = useRef<THREE.Group>(null);
  const nodeRef = useRef<THREE.Group>(null);

  // Spread the rings evenly between an inner and outer radius so the whole
  // orbital diagram always fits inside the lab shell no matter how many skill
  // categories there are (adding categories tightens the spacing instead of
  // growing past the walls / equipment pods).
  const INNER = 2.3;
  const OUTER = 7.3;
  const radius = total <= 1 ? INNER : INNER + (index / (total - 1)) * (OUTER - INNER);
  const tilt = -0.5 + (index / Math.max(1, total - 1)) * 1.0;
  const speed = 0.22 - (index / Math.max(1, total)) * 0.14;

  useFrame((state, delta) => {
    if (ringRef.current) ringRef.current.rotation.z += delta * speed;
    if (nodeRef.current) {
      const t = state.clock.elapsedTime * speed;
      nodeRef.current.position.set(Math.cos(t) * radius, Math.sin(t) * radius, 0);
    }
  });

  return (
    <group rotation={[Math.PI / 2 + tilt, 0, index * 0.5]}>
      <group ref={ringRef}>
        <mesh rotation={[0, 0, 0]}>
          <torusGeometry args={[radius, 0.012, 6, 128]} />
          <meshBasicMaterial color={color} transparent opacity={0.45} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* technology satellites on the ring */}
        {items.slice(0, 6).map((item, itemIndex) => {
          const angle = (itemIndex / Math.max(1, Math.min(items.length, 6))) * Math.PI * 2;
          return (
            <mesh key={item} position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}>
              <sphereGeometry args={[0.055, 10, 8]} />
              <meshBasicMaterial color={color} transparent opacity={0.9} blending={THREE.AdditiveBlending} depthWrite={false} />
            </mesh>
          );
        })}
      </group>

      {/* the category marker, with a counter-rotated billboard label */}
      <group ref={nodeRef}>
        <mesh>
          <icosahedronGeometry args={[0.1, 1]} />
          <meshBasicMaterial color="#F4F7FF" transparent opacity={0.95} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        <GlowShell radius={0.1} color={color} intensity={0.9} power={2} scale={3} segments={12} />
        <HoloText
          text={title}
          size={0.088}
          position={[0, 0.24, 0]}
          colorCore="#EAFCFF"
          colorEdge={color}
          variant="ui"
          fontWeight={700}
          letterSpacingRatio={0.16}
          resolution={110}
          opacityScale={0.95}
          billboard
        />
      </group>
    </group>
  );
}

/**
 * PLANET 03 — SKILLS
 * A technology laboratory: a central reactor column surrounded by one orbital
 * diagram per skill category. No invented proficiency bars — each ring simply
 * carries the technologies in that category.
 */
export function SkillsWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const skills = portfolio.skills;
  const columnRef = useRef<THREE.Mesh>(null);

  useFrame((state, delta) => {
    if (columnRef.current) {
      columnRef.current.rotation.y += delta * 0.18;
      const scale = 1 + Math.sin(state.clock.elapsedTime * 1.6) * 0.03;
      columnRef.current.scale.set(scale, 1, scale);
    }
  });

  return (
    <group position={DESTINATION_ORIGINS.skills}>
      <WorldLighting accent={ACCENT} secondary="#00E5FF" keyLight={1.2} ambient={0.26} keyPosition={[16, 20, 22]} />

      <Deck radius={11} accent={ACCENT} rings={4} gridScale={34} />

      {/* ---------------- central reactor column ---------------- */}
      <group position={[0, 0, -1]}>
        <mesh material={materials.trim} position={[0, 0.2, 0]}>
          <cylinderGeometry args={[1.5, 1.8, 0.4, 32]} />
        </mesh>
        <mesh ref={columnRef} position={[0, 3.4, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 6.4, 24, 1, true]} />
          <meshBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.35}
            blending={THREE.AdditiveBlending}
            depthWrite={false}
            side={THREE.DoubleSide}
          />
        </mesh>
        <mesh material={materials.panel} position={[0, 6.9, 0]}>
          <cylinderGeometry args={[1.1, 0.7, 0.7, 24]} />
        </mesh>
        <GlowShell radius={0.6} color={ACCENT} intensity={0.8} power={2} scale={2.4} segments={18} />
        <pointLight position={[0, 3.4, 0]} intensity={26} distance={20} color={ACCENT} />

        {/* the orbital diagrams */}
        <group position={[0, 3.3, 0]}>
          {skills.map((group, index) => (
            <SkillOrbit
              key={group.id}
              title={group.title}
              items={group.items}
              index={index}
              total={skills.length}
              color={index % 2 === 0 ? ACCENT : '#00E5FF'}
            />
          ))}
        </group>
      </group>

      {/* ---------------- lab equipment pods ---------------- */}
      {[0, 1, 2, 3, 4, 5].map((index) => {
        const angle = (index / 6) * Math.PI * 2 + 0.4;
        const radius = 8.6;
        return (
          <group
            key={`pod-${index}`}
            position={[Math.cos(angle) * radius, 0.9, Math.sin(angle) * radius]}
            rotation={[0, -angle + Math.PI / 2, 0]}
          >
            <mesh material={materials.panel}>
              <boxGeometry args={[2.1, 1.8, 1.2]} />
            </mesh>
            <mesh material={materials.trim} position={[0, 1, 0]}>
              <boxGeometry args={[2.2, 0.1, 1.3]} />
            </mesh>
            <group position={[0, 0.5, 0.63]} rotation={[-0.45, 0, 0]}>
              <HoloSurface
                width={1.7}
                height={0.8}
                color={index % 2 ? '#00E5FF' : ACCENT}
                opacity={0.5}
                gridScale={10}
                frame={false}
              />
            </group>
            <mesh material={materials.glass} position={[0, 1.9, 0]}>
              <cylinderGeometry args={[0.55, 0.55, 1.6, 18, 1, true]} />
            </mesh>
            <mesh position={[0, 1.9, 0]}>
              <icosahedronGeometry args={[0.3, 1]} />
              <meshBasicMaterial
                color={index % 2 ? ACCENT : '#00E5FF'}
                wireframe
                transparent
                opacity={0.6}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}

      {/* ---------------- lab shell ---------------- */}
      <mesh material={materials.interior} position={[0, 4, 0]}>
        <cylinderGeometry args={[13.5, 13.5, 9, 48, 1, true, Math.PI * 0.45, Math.PI * 1.1]} />
      </mesh>
      {[0, 1, 2].map((index) => (
        <LightStrip
          key={`lab-strip-${index}`}
          length={16}
          position={[0, 7.6 - index * 0.3, -2 + index * 2]}
          color={index % 2 ? '#9D4EDD' : '#9FE8FF'}
          opacity={0.4}
        />
      ))}
      <StationRing radius={13} tube={0.18} rotation={[Math.PI / 2, 0, 0]} position={[0, 8.4, 0]} segments={72} />

      <DataColumns count={quality.tier === 'low' ? 10 : 24} radius={12.4} height={6} color={ACCENT} seed={88} />
      <OrbitNodes count={quality.tier === 'low' ? 10 : 28} radius={10.5} spread={5} speed={0.45} size={0.055} color="#CBA8FF" />
      <ScanBeam width={22} depth={22} color={ACCENT} speed={0.18} position={[0, 0.5, 0]} />

      <DestinationTitle title="Skills" subtitle="Research Laboratory · Tech Index" accent={ACCENT} position={[0, 7.9, -3]} />
    </group>
  );
}

export default SkillsWorld;
