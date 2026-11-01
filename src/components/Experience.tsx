'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { experience } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

export default function Experience() {
  const sectionRef = useRef<HTMLElement>(null);
  const lineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      // Header reveal
      gsap.fromTo(
        '.exp-header',
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

      // Line drawing scrubbed
      if (lineRef.current) {
        gsap.fromTo(
          lineRef.current,
          { scaleY: 0 },
          {
            scaleY: 1,
            ease: 'none',
            scrollTrigger: {
              trigger: section,
              start: 'top 75%',
              end: 'bottom 80%',
              scrub: 0.2,
            },
          }
        );
      }

      // Experience cards reveal
      gsap.fromTo(
        '.exp-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.15,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.exp-container',
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
      id="experience"
      className="section-light section-border-light py-16 md:py-24 relative"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-10 exp-header">
          <span className="text-mono text-[#d93025] font-bold block mb-1 text-xs">
            {'03 // INTERNSHIPS & EXPERIENCE'}
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-[#0a0a0a]">
            EXPERIENCE
          </h2>
        </div>

        <div className="relative exp-container">
          {/* Scroll-scrubbed timeline line */}
          <div ref={lineRef} className="timeline-line" />

          {/* Halved vertical spacing */}
          <div className="space-y-8 ml-8 md:ml-0">
            {experience.map((exp, i) => (
              <div
                key={exp.company}
                className={`exp-card relative md:w-[47%] ${
                  i % 2 === 0 ? 'md:ml-auto md:pl-8' : 'md:mr-auto md:pr-8'
                }`}
              >
                {/* Solid red indicator box */}
                <div
                  className={`absolute w-3.5 h-3.5 bg-[#d93025] top-2 ${
                    i % 2 === 0
                      ? '-left-10 md:-left-1.5'
                      : '-left-10 md:auto md:-right-1.5'
                  }`}
                />

                <div className="border border-[#0a0a0a] p-5 sm:p-6 bg-[#f4f3ef]">
                  <div className="flex items-center justify-between mb-2 border-b border-[#8a8a85] pb-1.5">
                    <span className="text-mono text-[#d93025] font-bold text-xs">
                      {exp.period}
                    </span>
                    <span className="text-mono text-[#8a8a85] text-[10px]">INTERNSHIP</span>
                  </div>

                  <h3 className="heading-display text-xl sm:text-2xl text-[#0a0a0a]">
                    {exp.role}
                  </h3>
                  <span className="text-mono text-[#0a0a0a] font-bold text-xs block mt-0.5 mb-2.5">
                    @ {exp.company}
                  </span>

                  <p className="text-[#0a0a0a] text-sm leading-relaxed mb-4 font-normal">
                    {exp.description}
                  </p>

                  {/* Certificate attachment if present */}
                  {exp.certificate && (
                    <div className="pt-3 border-t border-[#8a8a85]">
                      <span className="text-mono text-[#8a8a85] text-[10px] block mb-1.5">
                        COMPLETION CERTIFICATE
                      </span>
                      <div className="relative aspect-[16/10] w-full max-w-xs border border-[#0a0a0a] bg-[#0a0a0a] overflow-hidden">
                        <Image
                          src={exp.certificate}
                          alt={`${exp.company} Certificate`}
                          fill
                          sizes="(max-width: 768px) 100vw, 300px"
                          className="object-contain"
                        />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
