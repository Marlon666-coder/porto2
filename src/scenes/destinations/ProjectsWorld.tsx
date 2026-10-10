import { useMemo } from 'react';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import { openProject } from '../../state/navigation';
import HoloText from '../../three/HoloText';
import { HoloSurface } from '../../three/HoloSurfaces';
import Planet from '../../three/Planet';
import { DataColumns, LightStrip, OrbitNodes, StationRing } from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import {
  DestinationTitle,
  FloatingGroup,
  InteractiveHoloFrame,
  ScanBeam,
  WorldLighting,
} from './shared';

const ACCENT = DESTINATION_ACCENTS.projects;

/**
 * PLANET 02 — PROJECTS
 * A spaceship hangar: ribbed arches overhead, a gantry rail, an open bay door
 * to space, and one floating holographic display per project. Clicking a
 * display opens the full project panel.
 */
export function ProjectsWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const projects = portfolio.projects;

  // Lay the bays out in a shallow arc so all of them face the camera.
  const bays = useMemo(() => {
    const count = Math.max(1, projects.length);
    return projects.map((project, index) => {
      const t = count === 1 ? 0 : index / (count - 1) - 0.5;
      const angle = t * 0.95;
      const radius = 7.6;
      return {
        project,
        position: [Math.sin(angle) * radius, 2.75 + Math.cos(index * 1.7) * 0.25, -radius * Math.cos(angle) + 5.2] as [
          number,
          number,
          number,
        ],
        rotation: [0, -angle, 0] as [number, number, number],
      };
    });
  }, [projects]);

  return (
    <group position={DESTINATION_ORIGINS.projects}>
      <WorldLighting accent={ACCENT} secondary="#00E5FF" keyLight={1.35} ambient={0.22} keyPosition={[14, 24, 18]} />

      {/* ---------------- hangar floor ---------------- */}
      <mesh material={materials.darkPanel} position={[0, -0.3, -2]}>
        <boxGeometry args={[34, 0.6, 38]} />
      </mesh>
      <group position={[0, 0.02, -2]} rotation={[-Math.PI / 2, 0, 0]}>
        <HoloSurface width={32} height={36} color={ACCENT} opacity={0.3} gridScale={34} scanSpeed={0.05} frame={false} />
      </group>
      {/* floor guidance lines */}
      {[-7, 0, 7].map((x, index) => (
        <LightStrip
          key={`floor-line-${index}`}
          length={30}
          thickness={0.07}
          position={[x, 0.06, -2]}
          rotation={[0, Math.PI / 2, 0]}
          color="#4287FF"
          opacity={0.35}
        />
      ))}

      {/* ---------------- structural arches ---------------- */}
      {[-9, -3, 3, 9].map((z, index) => (
        <group key={`arch-${index}`} position={[0, 0, z]}>
          <mesh material={materials.hull} position={[0, 7.4, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[13.5, 0.34, 8, 48, Math.PI]} />
          </mesh>
          <mesh material={materials.panel} position={[-13.4, 3.6, 0]}>
            <boxGeometry args={[0.7, 7.6, 0.8]} />
          </mesh>
          <mesh material={materials.panel} position={[13.4, 3.6, 0]}>
            <boxGeometry args={[0.7, 7.6, 0.8]} />
          </mesh>
          <LightStrip length={22} position={[0, 7.1, 0]} color={index % 2 ? '#9FE8FF' : '#4287FF'} opacity={0.4} />
        </group>
      ))}

      {/* ---------------- gantry rail + crane ---------------- */}
      <mesh material={materials.trim} position={[0, 6.4, -2]}>
        <boxGeometry args={[0.5, 0.4, 34]} />
      </mesh>
      <group position={[3.2, 5.6, 1]}>
        <mesh material={materials.panel}>
          <boxGeometry args={[1.6, 1, 2.4]} />
        </mesh>
        <mesh material={materials.trim} position={[0, -1.4, 0]}>
          <cylinderGeometry args={[0.06, 0.06, 2.6, 6]} />
        </mesh>
        <mesh material={materials.emissiveCyan} position={[0, -2.8, 0]}>
          <boxGeometry args={[0.8, 0.3, 0.8]} />
        </mesh>
      </group>

      {/* ---------------- open bay door to space ---------------- */}
      <mesh material={materials.hull} position={[0, 7.8, -20.5]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[11.5, 0.6, 8, 48, Math.PI]} />
      </mesh>
      <mesh material={materials.darkPanel} position={[0, 11.4, -20.5]}>
        <boxGeometry args={[23, 1.4, 1.6]} />
      </mesh>
      <ScanBeam width={22} depth={1.2} color={ACCENT} speed={0.22} position={[0, 0.4, -20]} />
      <Planet
        position={[-6, -2, -74]}
        radius={22}
        seed={55.1}
        colorDeep="#0A1024"
        colorMid="#27478F"
        colorHigh="#B8CDFF"
        colorAtmo="#4287FF"
        bandScale={3.8}
        atmosphere={1.2}
        rotationSpeed={0.007}
        segments={quality.tier === 'low' ? 28 : 56}
        glowIntensity={0.7}
      />

      {/* ---------------- project bays ---------------- */}
      {bays.map(({ project, position, rotation }) => (
        <group key={project.id}>
          <InteractiveHoloFrame
            width={3.1}
            height={2.1}
            position={position}
            rotation={rotation}
            accent={ACCENT}
            label={project.title.length > 26 ? `${project.title.slice(0, 24)}…` : project.title}
            sublabel={project.stack.length ? project.stack.slice(0, 3).join(' · ') : 'OPEN SLOT'}
            onSelect={() => openProject(project.id)}
            dimmed={project.stack.length === 0}
          />
          {/* a miniature wireframe "world" spinning inside each bay */}
          <FloatingGroup position={[position[0], position[1] - 0.05, position[2] + 0.5]} amplitude={0.06} speed={0.8}>
            <mesh>
              <icosahedronGeometry args={[0.32, 1]} />
              <meshBasicMaterial color={ACCENT} wireframe transparent opacity={0.5} />
            </mesh>
          </FloatingGroup>
          {/* emitter plinth beneath the bay */}
          <mesh material={materials.trim} position={[position[0], 0.18, position[2] + 0.2]}>
            <cylinderGeometry args={[0.7, 0.85, 0.36, 18]} />
          </mesh>
          <mesh material={materials.emissiveBlue} position={[position[0], 0.38, position[2] + 0.2]}>
            <cylinderGeometry args={[0.5, 0.5, 0.06, 18]} />
          </mesh>
        </group>
      ))}

      {/* ---------------- ambience ---------------- */}
      <DataColumns count={quality.tier === 'low' ? 8 : 20} radius={14} height={5} color="#4287FF" seed={312} />
      <OrbitNodes count={quality.tier === 'low' ? 8 : 20} radius={9} spread={5} speed={0.4} size={0.06} color="#9FD8FF" />
      <StationRing radius={12.6} tube={0.12} rotation={[Math.PI / 2, 0, 0]} position={[0, 0.3, -2]} segments={72} />

      <HoloText
        text="HANGAR BAY · SELECT A DISPLAY"
        size={0.1}
        position={[0, 0.9, 6.6]}
        colorCore="#CFE4FF"
        colorEdge={ACCENT}
        variant="ui"
        fontWeight={600}
        letterSpacingRatio={0.3}
        resolution={110}
        opacityScale={0.62}
      />

      <DestinationTitle title="Projects" subtitle="Hangar Bay · Build Archive" accent={ACCENT} position={[0, 5.9, -4]} />
    </group>
  );
}

export default ProjectsWorld;
