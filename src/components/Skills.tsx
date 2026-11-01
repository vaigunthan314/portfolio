'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { skillTree } from '@/data/content';
import { useReducedMotion, useIsMobile } from '@/hooks/useMediaQuery';
import dynamic from 'next/dynamic';

gsap.registerPlugin(ScrollTrigger);

const SkillsScene = dynamic(() => import('./SkillsScene'), {
  ssr: false,
  loading: () => null,
});

export default function Skills() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinContainerRef = useRef<HTMLDivElement>(null);

  const trunkPathRef = useRef<SVGPathElement>(null);
  const branchPath1Ref = useRef<SVGPathElement>(null);
  const branchPath2Ref = useRef<SVGPathElement>(null);
  const branchPath3Ref = useRef<SVGPathElement>(null);

  const reducedMotion = useReducedMotion();
  const isMobile = useIsMobile();

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinContainerRef.current;
    if (!section || !pin) return;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set('.skill-leaf-node', { opacity: 1, scale: 1 });
        gsap.set('.tree-branch-header', { opacity: 1 });
        gsap.set('.tree-svg-line', { strokeDashoffset: 0 });
        return;
      }

      // Initial state: leaves hidden, lines set to full strokeDashoffset
      gsap.set('.skill-leaf-node', { opacity: 0, scale: 0.8, transformOrigin: 'center center' });
      gsap.set('.tree-branch-header', { opacity: 0, y: -10 });

      const lines = [
        trunkPathRef.current,
        branchPath1Ref.current,
        branchPath2Ref.current,
        branchPath3Ref.current,
      ].filter(Boolean) as SVGPathElement[];

      lines.forEach((line) => {
        const len = line.getTotalLength ? line.getTotalLength() : 300;
        gsap.set(line, { strokeDasharray: len, strokeDashoffset: len });
      });

      // Pinned GSAP scrubbed timeline over 250vh
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: 'top top',
          end: 'bottom bottom',
          pin: pin,
          pinSpacing: true,
          scrub: 0.5,
          invalidateOnRefresh: true,
        },
      });

      // 1. Draw trunk down
      if (trunkPathRef.current) {
        tl.to(trunkPathRef.current, { strokeDashoffset: 0, duration: 0.4, ease: 'none' }, 0);
      }

      // 2. Draw branch lines and reveal branch headers
      if (branchPath1Ref.current && branchPath2Ref.current && branchPath3Ref.current) {
        tl.to(
          [branchPath1Ref.current, branchPath2Ref.current, branchPath3Ref.current],
          { strokeDashoffset: 0, duration: 0.5, ease: 'none', stagger: 0.05 },
          0.3
        );
      }
      tl.to('.tree-branch-header', { opacity: 1, y: 0, duration: 0.3, stagger: 0.08, ease: 'power2.out' }, 0.5);

      // 3. Reveal each of the 10 skill leaves one by one (staggered 0.1s)
      // Passed leaves stay solid #f4f3ef, newest highlights in #d93025
      const leafSelectors = Array.from({ length: 10 }, (_, i) => `.leaf-node-${i + 1}`);

      leafSelectors.forEach((sel, idx) => {
        const startTime = 0.8 + idx * 0.14;
        const prevSelectors = leafSelectors.slice(0, idx);

        // Pop in the new leaf
        tl.to(
          sel,
          {
            opacity: 1,
            scale: 1,
            duration: 0.2,
            ease: 'back.out(1.5)',
          },
          startTime
        );

        // Highlight newest leaf in red, prior leaves in white
        tl.to(
          `${sel} .leaf-box`,
          {
            borderColor: '#d93025',
            color: '#d93025',
            duration: 0.1,
          },
          startTime
        );

        if (prevSelectors.length > 0) {
          prevSelectors.forEach((p) => {
            tl.to(
              `${p} .leaf-box`,
              {
                borderColor: '#8a8a85',
                color: '#f4f3ef',
                duration: 0.1,
              },
              startTime
            );
          });
        }
      });
    }, sectionRef);

    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => ctx.revert();
  }, [reducedMotion, isMobile]);

  return (
    <section
      ref={sectionRef}
      id="skills"
      className="relative w-full h-[250vh] bg-[#0a0a0a] text-[#f4f3ef]"
    >
      <div
        ref={pinContainerRef}
        className="sticky top-0 left-0 w-full h-screen overflow-hidden flex flex-col items-center justify-center p-4 sm:p-8"
      >
        {/* Giant Outlined Background "SKILLS" */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none select-none z-0">
          <span
            style={{
              WebkitTextStroke: '1px #1f1f1f',
              color: 'transparent',
              fontSize: 'clamp(6rem, 18vw, 22rem)',
              lineHeight: 1,
            }}
            className="heading-display font-bold opacity-70"
          >
            SKILLS
          </span>
        </div>

        {/* Tree Container */}
        <div className="relative z-10 w-full max-w-6xl mx-auto flex flex-col items-center h-full justify-between py-6">
          
          {/* Header & Root Node */}
          <div className="flex items-center justify-center gap-4 mb-2">
            <div className="border border-[#d93025] px-5 py-2 bg-[#0a0a0a] flex items-center gap-3">
              <span className="w-2.5 h-2.5 bg-[#d93025]" />
              <span className="heading-display text-2xl sm:text-3xl text-[#f4f3ef] tracking-widest">
                SKILLS // ROOT
              </span>
            </div>

            {/* Small 3D Rotating Geometry beside root */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 border border-[#8a8a85] bg-[#0a0a0a]">
              <SkillsScene />
            </div>
          </div>

          {/* Desktop Tree View (Fanning Out) */}
          {!isMobile ? (
            <div className="relative w-full flex-1 max-h-[580px]">
              {/* SVG Connector Lines */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox="0 0 1000 500"
                fill="none"
              >
                {/* Trunk */}
                <path
                  ref={trunkPathRef}
                  className="tree-svg-line"
                  d="M 500,0 L 500,70"
                  stroke="#d93025"
                  strokeWidth="2"
                />

                {/* Branch 1 to Technical */}
                <path
                  ref={branchPath1Ref}
                  className="tree-svg-line"
                  d="M 500,70 Q 350,70 200,120"
                  stroke="#8a8a85"
                  strokeWidth="2"
                />

                {/* Branch 2 to Cloud */}
                <path
                  ref={branchPath2Ref}
                  className="tree-svg-line"
                  d="M 500,70 L 500,120"
                  stroke="#8a8a85"
                  strokeWidth="2"
                />

                {/* Branch 3 to People */}
                <path
                  ref={branchPath3Ref}
                  className="tree-svg-line"
                  d="M 500,70 Q 650,70 800,120"
                  stroke="#8a8a85"
                  strokeWidth="2"
                />

                {/* Connectors to leaves in Technical (left column) */}
                <line x1="200" y1="140" x2="200" y2="450" stroke="#333" strokeWidth="1" strokeDasharray="3 3" />

                {/* Connectors to leaves in Cloud (center column) */}
                <line x1="500" y1="140" x2="500" y2="350" stroke="#333" strokeWidth="1" strokeDasharray="3 3" />

                {/* Connectors to leaves in People (right column) */}
                <line x1="800" y1="140" x2="800" y2="450" stroke="#333" strokeWidth="1" strokeDasharray="3 3" />
              </svg>

              {/* 3 Branch Clusters */}
              <div className="grid grid-cols-3 gap-6 w-full h-full pt-16">
                
                {/* Branch 1: TECHNICAL */}
                <div className="flex flex-col items-center">
                  <div className="tree-branch-header border border-[#8a8a85] px-4 py-1.5 bg-[#141414] mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#d93025]" />
                    <span className="text-mono text-xs font-bold text-[#d93025]">TECHNICAL</span>
                  </div>

                  <div className="space-y-4 w-full max-w-[240px]">
                    {skillTree.branches[0].skills.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`skill-leaf-node leaf-node-${idx + 1} flex items-center gap-2`}
                      >
                        <span className="w-1.5 h-1.5 bg-[#d93025] flex-shrink-0" />
                        <div className="leaf-box border border-[#8a8a85] bg-[#0a0a0a] px-3.5 py-2 w-full flex items-center justify-between transition-colors">
                          <span className="heading-display text-lg text-[#f4f3ef]">{s.name}</span>
                          <span className="text-mono text-[10px] text-[#8a8a85]">{s.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch 2: CLOUD */}
                <div className="flex flex-col items-center">
                  <div className="tree-branch-header border border-[#8a8a85] px-4 py-1.5 bg-[#141414] mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#d93025]" />
                    <span className="text-mono text-xs font-bold text-[#d93025]">CLOUD</span>
                  </div>

                  <div className="space-y-4 w-full max-w-[240px]">
                    {skillTree.branches[1].skills.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`skill-leaf-node leaf-node-${idx + 5} flex items-center gap-2`}
                      >
                        <span className="w-1.5 h-1.5 bg-[#d93025] flex-shrink-0" />
                        <div className="leaf-box border border-[#8a8a85] bg-[#0a0a0a] px-3.5 py-2 w-full flex items-center justify-between transition-colors">
                          <span className="heading-display text-lg text-[#f4f3ef]">{s.name}</span>
                          <span className="text-mono text-[10px] text-[#8a8a85]">{s.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Branch 3: PEOPLE */}
                <div className="flex flex-col items-center">
                  <div className="tree-branch-header border border-[#8a8a85] px-4 py-1.5 bg-[#141414] mb-6 flex items-center gap-2">
                    <span className="w-2 h-2 bg-[#d93025]" />
                    <span className="text-mono text-xs font-bold text-[#d93025]">PEOPLE</span>
                  </div>

                  <div className="space-y-4 w-full max-w-[240px]">
                    {skillTree.branches[2].skills.map((s, idx) => (
                      <div
                        key={s.id}
                        className={`skill-leaf-node leaf-node-${idx + 7} flex items-center gap-2`}
                      >
                        <span className="w-1.5 h-1.5 bg-[#d93025] flex-shrink-0" />
                        <div className="leaf-box border border-[#8a8a85] bg-[#0a0a0a] px-3.5 py-2 w-full flex items-center justify-between transition-colors">
                          <span className="heading-display text-lg text-[#f4f3ef]">{s.name}</span>
                          <span className="text-mono text-[10px] text-[#8a8a85]">{s.id}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          ) : (
            /* Mobile Vertical Tree View */
            <div className="w-full flex-1 overflow-y-auto px-4 py-2 space-y-6">
              {skillTree.branches.map((branch) => (
                <div key={branch.name} className="border-l-2 border-[#d93025] pl-4 space-y-2">
                  <span className="text-mono text-xs font-bold text-[#d93025] block">
                    {`// ${branch.name}`}
                  </span>
                  <div className="grid grid-cols-1 gap-2">
                    {branch.skills.map((s) => {
                      const overallIdx = parseInt(s.id, 10);
                      return (
                        <div
                          key={s.id}
                          className={`skill-leaf-node leaf-node-${overallIdx} border border-[#8a8a85] bg-[#0a0a0a] px-3 py-1.5 flex items-center justify-between`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 bg-[#d93025]" />
                            <span className="heading-display text-base text-[#f4f3ef]">
                              {s.name}
                            </span>
                          </div>
                          <span className="text-mono text-[10px] text-[#8a8a85]">{s.id}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Bottom helper label */}
          <div className="text-mono text-[10px] sm:text-xs text-[#8a8a85] mt-2">
            {'02 // TECHNICAL ARSENAL • SCROLL-INTERACTIVE ARCHITECTURE'}
          </div>
        </div>
      </div>
    </section>
  );
}
