'use client';

import { useId, useRef, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import type { Project } from '@/lib/types';
import { safeHref } from '@/lib/asset';
import { EASE, gsap, MOTION_OK, useIsoLayoutEffect } from '@/lib/gsap';
import MagneticButton from '@/components/ui/MagneticButton';
import SafeImage from '@/components/ui/SafeImage';

interface ProjectCardProps {
  project: Project;
  index: number;
  total: number;
}

/** Splits "SAVOR — Restaurant Ordering Website" into a name and a kind. */
function splitTitle(title: string): { name: string; kind: string } {
  const [name, ...rest] = title.split(' — ');
  return { name: name ?? title, kind: rest.join(' — ') };
}

/**
 * One project, presented as a large editorial card.
 * Even cards are black, odd cards are off-white, so the list alternates.
 * The thumbnail uses the project's screenshot when one is configured; until
 * then it shows a typographic cover built from the real project name.
 */
export function ProjectCard({ project, index, total }: ProjectCardProps) {
  const dark = index % 2 === 0;
  const tone = dark ? 'dark' : 'light';
  const { name, kind } = splitTitle(project.title);
  const [expanded, setExpanded] = useState(false);
  const descriptionId = useId();
  const cardRef = useRef<HTMLElement>(null);

  const repo = safeHref(project.repository.url);
  const demo = safeHref(project.demo.url);

  // Card rises in; then its stack tags follow one by one.
  useIsoLayoutEffect(() => {
    const card = cardRef.current;
    if (!card) return undefined;
    const mm = gsap.matchMedia();
    mm.add(MOTION_OK, () => {
      const tl = gsap.timeline({ scrollTrigger: { trigger: card, start: 'top 82%', once: true } });
      tl.from(card, { y: 60, opacity: 0, duration: 1.1, ease: EASE })
        .from(card.querySelectorAll('[data-cover]'), { scale: 1.08, duration: 1.4, ease: EASE }, 0)
        .from(card.querySelectorAll('[data-tag]'), { y: 12, opacity: 0, duration: 0.5, ease: EASE, stagger: 0.05 }, 0.45);
    });
    return () => mm.revert();
  }, []);

  const surface = dark ? 'bg-ink text-paper' : 'bg-paper-2 text-ink';
  const muted = dark ? 'text-mute' : 'text-mute-dark';
  const line = dark ? 'border-ink-2' : 'border-ink/10';

  return (
    <article ref={cardRef} className={`overflow-hidden rounded-[2rem] ${surface}`} aria-labelledby={`${project.id}-title`}>
      <div className="grid lg:grid-cols-12">
        {/* Cover */}
        <div className={`group relative aspect-[16/11] overflow-hidden lg:col-span-6 lg:aspect-auto lg:min-h-[34rem] ${index % 2 === 1 ? 'lg:order-2' : ''}`}>
          <div data-cover className="absolute inset-0 transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]">
            {project.image ? (
              <SafeImage
                src={project.image}
                alt={`${name} screenshot`}
                sizes="(min-width: 1024px) 45vw, 95vw"
                className="object-cover"
                fallbackLabel={name}
              />
            ) : (
              <div className={`cover-grid absolute inset-0 flex flex-col justify-between p-8 md:p-12 ${dark ? 'bg-ink-1 text-paper' : 'bg-paper text-ink'}`}>
                <span className={`font-mono text-label ${muted}`}>
                  {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
                </span>
                <span aria-hidden="true" className="text-[clamp(3rem,7vw,6.5rem)] font-semibold leading-[0.9] tracking-[-0.06em]">
                  {name}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="flex flex-col p-7 md:p-12 lg:col-span-6">
          <div className={`flex items-center justify-between text-label uppercase ${muted}`}>
            <span>{kind || 'Project'}</span>
            {project.status ? (
              <span className="inline-flex items-center gap-2">
                <span className={`h-1.5 w-1.5 rounded-full ${dark ? 'bg-paper' : 'bg-ink'}`} aria-hidden="true" />
                {project.status}
              </span>
            ) : null}
          </div>

          <h3 id={`${project.id}-title`} className="mt-8 text-headline font-semibold">
            {name}
          </h3>
          <p className="mt-4 text-lead">{project.tagline}</p>

          <div className="mt-6">
            <p
              id={descriptionId}
              className={`text-[1rem] leading-relaxed ${muted} ${expanded ? '' : 'line-clamp-4'}`}
            >
              {project.description}
            </p>
            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              aria-controls={descriptionId}
              className={`mt-3 inline-flex items-center gap-1 text-[0.875rem] font-medium underline-offset-4 hover:underline ${dark ? 'text-paper' : 'text-ink'}`}
            >
              {expanded ? 'Show less' : 'Read more'}
              <ChevronDown
                aria-hidden="true"
                className={`h-4 w-4 transition-transform duration-300 ${expanded ? 'rotate-180' : ''}`}
                strokeWidth={1.75}
              />
            </button>
          </div>

          {project.stack.length > 0 ? (
            <ul className={`mt-8 flex flex-wrap gap-2 border-t pt-8 ${line}`} aria-label="Technologies used">
              {project.stack.map((tech) => (
                <li
                  key={tech}
                  data-tag
                  className={`rounded-full border px-3 py-1 text-[0.8125rem] transition-colors duration-300 ${
                    dark ? 'border-ink-2 hover:border-paper/50' : 'border-ink/15 hover:border-ink/50'
                  }`}
                >
                  {tech}
                </li>
              ))}
            </ul>
          ) : null}

          {repo || demo ? (
            <div className="mt-auto flex flex-wrap gap-3 pt-10">
              {demo ? (
                <MagneticButton href={demo} external tone={tone} variant="solid" icon="external">
                  Live demo
                </MagneticButton>
              ) : null}
              {repo ? (
                <MagneticButton href={repo} external tone={tone} variant="outline" icon="external">
                  Source code
                </MagneticButton>
              ) : null}
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default ProjectCard;
