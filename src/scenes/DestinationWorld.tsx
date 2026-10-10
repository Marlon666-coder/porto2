import { Suspense, useEffect, useState, type ComponentType } from 'react';
import { isDestination } from '../data/scenes';
import { useExperience } from '../state/experienceStore';
import type { DestinationId } from '../types';
import AboutWorld from './destinations/AboutWorld';
import CertificatesWorld from './destinations/CertificatesWorld';
import ContactWorld from './destinations/ContactWorld';
import EducationWorld from './destinations/EducationWorld';
import ProjectsWorld from './destinations/ProjectsWorld';
import SkillsWorld from './destinations/SkillsWorld';

const WORLDS: Record<DestinationId, ComponentType> = {
  about: AboutWorld,
  projects: ProjectsWorld,
  skills: SkillsWorld,
  education: EducationWorld,
  certificates: CertificatesWorld,
  contact: ContactWorld,
};

/**
 * Mounts exactly one destination world at a time.
 *
 * The six worlds live in genuinely different regions of space and each one is a
 * substantial set, so keeping them all resident would waste a lot of GPU for
 * geometry nobody can see. The swap happens while the warp transition fills the
 * screen, so the visitor never sees anything pop in.
 *
 * The last visited destination is remembered for one extra beat so unmounting
 * cannot race the transition and leave an empty frame.
 */
export function DestinationWorld() {
  const stage = useExperience((s) => s.stage);
  const transitionPhase = useExperience((s) => s.transitionPhase);
  const [active, setActive] = useState<DestinationId | null>(
    isDestination(stage) ? stage : null,
  );

  useEffect(() => {
    if (isDestination(stage)) {
      setActive(stage);
      return;
    }
    // Leaving the destinations: hold the set until the overlay has covered the
    // screen, then release its GPU resources.
    if (transitionPhase === 'idle') setActive(null);
  }, [stage, transitionPhase]);

  if (!active) return null;
  const World = WORLDS[active];

  return (
    <Suspense fallback={null}>
      <World />
    </Suspense>
  );
}

export default DestinationWorld;
