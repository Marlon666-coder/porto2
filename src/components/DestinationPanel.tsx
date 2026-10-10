import type { ComponentType } from 'react';
import { isDestination } from '../data/scenes';
import { useExperience } from '../state/experienceStore';
import type { DestinationId } from '../types';
import AboutPanel from './panels/AboutPanel';
import CertificatesPanel, { CertificateDetailModal } from './panels/CertificatesPanel';
import ContactPanel from './panels/ContactPanel';
import EducationPanel from './panels/EducationPanel';
import ProjectsPanel, { ProjectDetailModal } from './panels/ProjectsPanel';
import SkillsPanel from './panels/SkillsPanel';

const PANELS: Record<DestinationId, ComponentType> = {
  about: AboutPanel,
  projects: ProjectsPanel,
  skills: SkillsPanel,
  education: EducationPanel,
  certificates: CertificatesPanel,
  contact: ContactPanel,
};

/** Shows the information panel for whichever destination is active. */
export function DestinationPanel() {
  const stage = useExperience((s) => s.stage);
  const phase = useExperience((s) => s.phase);
  const transitionPhase = useExperience((s) => s.transitionPhase);

  if (phase !== 'experience') return null;
  if (!isDestination(stage)) return null;
  // Stay hidden while the warp is covering the screen.
  if (transitionPhase === 'out' || transitionPhase === 'swap') return null;

  const Panel = PANELS[stage];

  return (
    <>
      <Panel />
      <ProjectDetailModal />
      <CertificateDetailModal />
    </>
  );
}

export default DestinationPanel;
