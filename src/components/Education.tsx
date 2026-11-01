'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { education, achievements, certifications } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

export default function Education() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.edu-header',
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
        '.edu-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.edu-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.cert-card',
        { y: 35, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.12,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.certs-grid',
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );

      gsap.fromTo(
        '.achievement-row',
        { x: -20, opacity: 0 },
        {
          x: 0,
          opacity: 1,
          duration: 0.5,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: '.achievements-container',
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
      id="education"
      className="section-light section-border-light py-16 md:py-24 relative"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-10 edu-header">
          <span className="text-mono text-[#d93025] font-bold block mb-1 text-xs">
            {'05 // ACADEMICS & CREDENTIALS'}
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-[#0a0a0a]">
            EDUCATION &amp; AWARDS
          </h2>
        </div>

        {/* Education Cards */}
        <div className="edu-grid grid gap-6 md:grid-cols-2 mb-8">
          {education.map((edu) => (
            <div
              key={edu.institution}
              className="edu-card border border-[#0a0a0a] p-5 sm:p-6 bg-[#f4f3ef] flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between border-b border-[#8a8a85] pb-2 mb-3">
                  <span className="text-mono text-[#d93025] font-bold text-xs">
                    {edu.period}
                  </span>
                  <span className="text-mono text-[#8a8a85] text-[10px]">ACADEMIC</span>
                </div>

                <h3 className="heading-display text-xl sm:text-2xl text-[#0a0a0a] mb-1.5">
                  {edu.institution}
                </h3>
                <p className="text-[#0a0a0a] text-sm sm:text-base font-medium mb-2">
                  {edu.degree}
                </p>
                <span className="text-mono text-[#d93025] font-bold text-xs block mb-3">
                  SCORE: {edu.detail}
                </span>
              </div>

              {edu.malaysiaCta && (
                <div className="mt-3 pt-3 border-t border-[#8a8a85] flex flex-col gap-2">
                  <span className="text-mono text-[#8a8a85] text-[10px]">
                    STUDENT MOBILITY EXCHANGE — 12 JAN TO 10 MAY 2026
                  </span>
                  <Link
                    href="/malaysia"
                    className="text-mono text-xs border border-[#0a0a0a] bg-[#0a0a0a] text-[#f4f3ef] hover:bg-transparent hover:text-[#0a0a0a] px-3 py-1.5 transition-colors self-start inline-block"
                  >
                    VIEW MY MALAYSIA JOURNEY ↗
                  </Link>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Certifications: Compact cards */}
        <div className="certs-grid grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
          {certifications.map((cert) => (
            <div
              key={cert.title}
              className="cert-card border border-[#0a0a0a] p-5 sm:p-6 bg-[#f4f3ef] flex flex-col justify-between"
            >
              <div>
                <span className="text-mono text-[#d93025] font-bold text-[10px] block mb-1">
                  OFFICIAL CERTIFICATION
                </span>
                <h3 className="heading-display text-xl sm:text-2xl text-[#0a0a0a] mb-1.5">
                  {cert.title}
                </h3>
                <span className="text-mono text-[#8a8a85] text-[10px] block mb-2.5">
                  ISSUED BY {cert.issuer} • {cert.date}
                </span>
                {cert.validationId && (
                  <div className="p-2 border border-[#8a8a85] bg-[#0a0a0a] text-[#f4f3ef] text-mono text-[10px] mb-3 inline-block">
                    VALIDATION ID: {cert.validationId}
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-[#8a8a85] flex items-center justify-between">
                <a
                  href={cert.verificationUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-mono text-xs border border-[#0a0a0a] text-[#0a0a0a] hover:bg-[#0a0a0a] hover:text-[#f4f3ef] px-3 py-1 transition-colors"
                >
                  Verify Credential ↗
                </a>

                {cert.image && (
                  <div className="relative w-16 h-12 border border-[#0a0a0a] bg-[#0a0a0a] overflow-hidden">
                    <Image
                      src={cert.image}
                      alt={cert.title}
                      fill
                      sizes="64px"
                      className="object-contain"
                    />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Achievements List */}
        <div className="achievements-container pt-6 border-t border-[#0a0a0a]">
          <h3 className="heading-display text-2xl sm:text-3xl text-[#0a0a0a] mb-5">
            HONORS &amp; COMPETITIONS
          </h3>

          <div className="space-y-2.5">
            {achievements.map((ach, idx) => (
              <div
                key={ach}
                className="achievement-row flex items-start gap-3 border-b border-[#8a8a85] pb-2.5"
              >
                <span className="text-mono text-[#d93025] font-bold text-xs mt-0.5">
                  0{idx + 1}
                </span>
                <span className="text-sm sm:text-base text-[#0a0a0a] font-medium">
                  {ach}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
