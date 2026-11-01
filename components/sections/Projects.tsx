import { portfolio } from '@/data/portfolio';
import SectionHeader from '@/components/ui/SectionHeader';
import ProjectCard from './ProjectCard';

export function Projects() {
  const projects = portfolio.projects.filter((project) => !project.isExample);

  return (
    <section id="projects" tabIndex={-1} aria-labelledby="projects-title" className="bg-paper py-24 text-ink outline-none md:py-36">
      <div className="mx-auto max-w-shell px-5 md:px-10">
        <SectionHeader
          index="03"
          label="Selected work"
          title="Projects that ship."
          titleId="projects-title"
          tone="light"
          intro={`${projects.length} live projects, each with source code and a working demo.`}
        />
        <div className="space-y-6 md:space-y-10">
          {projects.map((project, index) => (
            <ProjectCard key={project.id} project={project} index={index} total={projects.length} />
          ))}
        </div>
      </div>
    </section>
  );
}

export default Projects;
