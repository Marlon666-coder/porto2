import { useMemo } from 'react';
import * as THREE from 'three';
import { portfolio } from '../../data/portfolio';
import { DESTINATION_ACCENTS, DESTINATION_ORIGINS } from '../../data/worldLayout';
import { useQuality } from '../../hooks/useQuality';
import { openCertificate } from '../../state/navigation';
import HoloText from '../../three/HoloText';
import { DataColumns, LightStrip, OrbitNodes, RadialStruts, StationRing } from '../../three/Structures';
import { getMaterials } from '../../three/materials';
import {
  Deck,
  DestinationTitle,
  InteractiveHoloFrame,
  ScanBeam,
  WorldLighting,
} from './shared';

const ACCENT = DESTINATION_ACCENTS.certificates;

/**
 * PLANET 05 — CERTIFICATES
 * A digital archive vault. Each certificate (or reserved empty slot) is a
 * floating holographic plate in an arc; selecting one opens the enlarged view.
 */
export function CertificatesWorld() {
  const quality = useQuality();
  const materials = getMaterials();
  const certificates = portfolio.certificates;

  const slots = useMemo(() => {
    const count = Math.max(1, certificates.length);
    const perRow = Math.min(4, count);
    return certificates.map((certificate, index) => {
      const row = Math.floor(index / perRow);
      const column = index % perRow;
      const columnsInRow = Math.min(perRow, count - row * perRow);
      const t = columnsInRow === 1 ? 0 : column / (columnsInRow - 1) - 0.5;
      const angle = t * 0.86;
      const radius = 8.2;
      return {
        certificate,
        position: [
          Math.sin(angle) * radius,
          3.5 - row * 2.9,
          -radius * Math.cos(angle) + 5.4,
        ] as [number, number, number],
        rotation: [0, -angle, 0] as [number, number, number],
      };
    });
  }, [certificates]);

  return (
    <group position={DESTINATION_ORIGINS.certificates}>
      <WorldLighting accent={ACCENT} secondary="#9D4EDD" keyLight={0.95} ambient={0.22} keyPosition={[10, 18, 20]} />

      <Deck radius={11} accent={ACCENT} rings={3} gridScale={30} />

      {/* ---------------- vault shell ---------------- */}
      <mesh material={materials.interior} position={[0, 5, -1]}>
        <cylinderGeometry args={[13.2, 13.2, 11, 56, 1, true, Math.PI * 0.42, Math.PI * 1.16]} />
      </mesh>
      {/* vault storage cells on the rear wall */}
      {Array.from({ length: 28 }, (_, index) => {
        const column = index % 7;
        const row = Math.floor(index / 7);
        const angle = Math.PI * 0.58 + (column / 6) * Math.PI * 0.84;
        const radius = 12.6;
        return (
          <mesh
            key={`cell-${index}`}
            material={index % 3 === 0 ? materials.emissiveMagenta : materials.darkPanel}
            position={[Math.sin(angle) * radius, 1.5 + row * 2.1, Math.cos(angle) * radius]}
            rotation={[0, angle, 0]}
          >
            <boxGeometry args={[1.5, 1.5, 0.3]} />
          </mesh>
        );
      })}
      <StationRing radius={13.4} tube={0.2} rotation={[Math.PI / 2, 0, 0]} position={[0, 10.2, -1]} segments={72} />
      <RadialStruts count={12} innerRadius={11} outerRadius={13.4} thickness={0.14} position={[0, 10.2, -1]} rotation={[Math.PI / 2, 0, 0]} />
      {[0, 1, 2].map((index) => (
        <LightStrip
          key={`vault-strip-${index}`}
          length={17}
          position={[0, 9.4 - index * 0.4, -1 + index * 2.4]}
          color={index % 2 ? '#FF38C7' : '#9FE8FF'}
          opacity={0.42}
        />
      ))}

      {/* ---------------- certificate plates ---------------- */}
      {slots.map(({ certificate, position, rotation }) => (
        <group key={certificate.id}>
          <InteractiveHoloFrame
            width={2.7}
            height={1.95}
            position={position}
            rotation={rotation}
            accent={ACCENT}
            label={certificate.isPlaceholder ? 'EMPTY SLOT' : certificate.title}
            sublabel={certificate.isPlaceholder ? 'RESERVED' : certificate.issuer}
            onSelect={() => openCertificate(certificate.id)}
            dimmed={Boolean(certificate.isPlaceholder)}
          />
          {certificate.isPlaceholder && (
            <mesh position={[position[0], position[1], position[2] + 0.03]} rotation={rotation}>
              <ringGeometry args={[0.2, 0.23, 32]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={0.45}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
                side={THREE.DoubleSide}
              />
            </mesh>
          )}
        </group>
      ))}

      {/* ---------------- indexing scanners ---------------- */}
      <ScanBeam width={20} depth={18} color={ACCENT} speed={0.26} position={[0, 0.4, 0]} />
      <ScanBeam width={18} depth={16} color="#9D4EDD" speed={0.17} position={[0, 1.2, 0]} />

      <DataColumns count={quality.tier === 'low' ? 10 : 26} radius={12.2} height={8} color={ACCENT} seed={717} />
      <OrbitNodes count={quality.tier === 'low' ? 8 : 22} radius={10} spread={6} speed={0.34} size={0.055} color="#FFB3E6" />

      <HoloText
        text="ARCHIVE · SELECT A RECORD"
        size={0.095}
        position={[0, 0.95, 6.8]}
        colorCore="#FFD9F3"
        colorEdge={ACCENT}
        variant="ui"
        fontWeight={600}
        letterSpacingRatio={0.3}
        resolution={110}
        opacityScale={0.6}
      />

      <DestinationTitle title="Certificates" subtitle="Digital Archive · Credential Vault" accent={ACCENT} position={[0, 7.4, -3]} />
    </group>
  );
}

export default CertificatesWorld;
