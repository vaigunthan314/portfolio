'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { projects, type Project } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

function ProjectCard({
  project,
  index,
}: {
  project: Project;
  index: number;
}) {
  return (
    <div className="project-card border border-[#8a8a85] bg-[#0a0a0a] flex flex-col justify-between h-full p-5 sm:p-6 transition-all duration-200 hover:border-[#d93025]">
      <div>
        {/* Top label */}
        <div className="flex items-center justify-between border-b border-[#333] pb-2.5 mb-4">
          <span className="text-mono text-[#d93025] font-bold text-xs">
            {`0${index + 1} // BUILD`}
          </span>
          <span className="text-mono text-[#8a8a85] text-[10px] truncate max-w-[150px]">
            {project.tagline}
          </span>
        </div>

        {/* Compact image showcase (180-200px) */}
        <div className="relative h-[180px] w-full border border-[#333] bg-[#141414] overflow-hidden mb-4">
          <Image
            src={project.image}
            alt={`${project.title} interface`}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
            className="object-contain"
          />
        </div>

        {/* Title */}
        <h3 className="heading-display text-2xl sm:text-3xl text-[#f4f3ef] mb-2 leading-tight">
          {project.title}
        </h3>

        {/* Short description (max 3 lines) */}
        <p className="text-[#8a8a85] text-xs sm:text-sm leading-relaxed mb-4 line-clamp-3">
          {project.description}
        </p>

        {/* Compact tech tags */}
        <div className="flex flex-wrap gap-1.5 mb-6">
          {project.tech.map((t) => (
            <span
              key={t}
              className="text-mono text-[10px] border border-[#333] text-[#f4f3ef] px-2 py-0.5 bg-[#141414]"
            >
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Action links */}
      <div className="pt-3 border-t border-[#333] flex items-center gap-3">
        {project.hasLiveDemo && project.liveUrl ? (
          <a
            href={project.liveUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-mono text-xs border border-[#d93025] bg-[#d93025] text-[#f4f3ef] hover:bg-transparent hover:text-[#d93025] px-3 py-1.5 transition-colors"
          >
            Live Demo ↗
          </a>
        ) : (
          <span className="text-mono text-[10px] text-[#8a8a85] border border-[#333] px-2.5 py-1">
            {project.liveNote ?? 'NO WEB DEMO'}
          </span>
        )}
        <a
          href={project.codeUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="text-mono text-xs border border-[#8a8a85] text-[#f4f3ef] hover:border-[#f4f3ef] px-3 py-1.5 transition-colors"
        >
          Source ↗
        </a>
      </div>
    </div>
  );
}

export default function Projects() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.projects-header',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.project-card',
        { y: 40, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.projects-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="projects"
      className="section-dark section-border-dark py-16 md:py-24 relative"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-10 projects-header">
          <span className="text-mono text-[#d93025] font-bold block mb-1 text-xs">
            {'04 // SELECTED WORK'}
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-[#f4f3ef]">
            PROJECTS
          </h2>
        </div>

        {/* 3 columns on xl (1280px+), 2 on md (768px+), 1 on mobile */}
        <div className="projects-grid grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {projects.map((project, i) => (
            <ProjectCard key={project.title} project={project} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
