'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import dynamic from 'next/dynamic';

gsap.registerPlugin(ScrollTrigger);

const SmoothScroll = dynamic(() => import('@/components/SmoothScroll'), {
  ssr: false,
});
const CustomCursor = dynamic(() => import('@/components/CustomCursor'), {
  ssr: false,
});

const MARQUEE_WORDS = [
  'MALAYSIA',
  'INTI',
  'STUDENT MOBILITY',
  'GLOBAL PERSPECTIVE',
  'MALAYSIA',
  'INTI',
  'STUDENT MOBILITY',
  'GLOBAL PERSPECTIVE',
];

function MalaysiaMarquee() {
  return (
    <div className="overflow-hidden border-y border-[#8a8a85] py-3 bg-[#0a0a0a]">
      <div className="marquee-track">
        {MARQUEE_WORDS.map((word, i) => (
          <span
            key={i}
            className="heading-display text-lg sm:text-2xl text-[#8a8a85] whitespace-nowrap mx-6"
          >
            {word} <span className="text-[#d93025] mx-2">•</span>
          </span>
        ))}
      </div>
    </div>
  );
}

export default function MalaysiaPage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.my-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.8,
          stagger: 0.1,
          ease: 'power3.out',
        }
      );

      gsap.fromTo(
        '.my-story-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.08,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: storyRef.current,
            start: 'top 85%',
            toggleActions: 'play none none reverse',
          },
        }
      );
    });

    return () => ctx.revert();
  }, []);

  return (
    <>
      <SmoothScroll />
      <CustomCursor />

      {/* Fixed minimal nav (56px) */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0a] border-b border-[#8a8a85] px-6 md:px-12 h-14 flex items-center justify-between">
        <Link
          href="/"
          className="text-mono text-[#f4f3ef] hover:text-[#d93025] transition-colors text-[11px] sm:text-[12px]"
          data-hover
        >
          ← BACK TO PORTFOLIO
        </Link>
        <span className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px] hidden sm:block">
          VAIGUNTHAN SL — MALAYSIA JOURNEY
        </span>
      </nav>

      {/* Static noise overlay at 4% opacity (no animated SVG) */}
      <div className="film-grain fixed inset-0 z-[9998] pointer-events-none" />

      <main className="bg-[#0a0a0a] text-[#f4f3ef] pt-14">
        {/* First Screen: Heading & Photo visible together at 1440x900 without scrolling */}
        <section
          ref={heroRef}
          className="py-12 md:py-16 px-6 md:px-12 border-b border-[#8a8a85]"
        >
          <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12 items-center">
            {/* Left Column: Heading and Summary */}
            <div className="lg:col-span-7 space-y-4 my-reveal">
              <span className="text-mono text-[#d93025] font-bold block text-[11px] sm:text-[12px] tracking-wider">
                STUDENT MOBILITY EXCHANGE — 2026
              </span>

              <h1
                className="heading-display text-[#f4f3ef] leading-[0.95]"
                style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3rem)' }}
              >
                4 MONTHS. <br />
                <span className="text-[#d93025]">ONE NEW COUNTRY.</span>
              </h1>

              <p className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px]">
                INTI INTERNATIONAL UNIVERSITY, MALAYSIA • 12 JAN TO 10 MAY 2026
              </p>

              <p
                className="text-[#f4f3ef] leading-relaxed font-normal pt-2"
                style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  maxWidth: '42rem',
                }}
              >
                When I got the opportunity to pursue student mobility at INTI
                International University in Malaysia, I packed my bags, left
                everything familiar behind, and took the leap alone. Living and
                studying abroad provided a transformative perspective on global
                collaboration, independent problem-solving, and technology.
              </p>

              {/* Stats row */}
              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-[#8a8a85]">
                <div>
                  <span
                    className="heading-display text-[#d93025] block"
                    style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}
                  >
                    4
                  </span>
                  <span className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px] block mt-0.5">
                    MONTHS ABROAD
                  </span>
                </div>
                <div>
                  <span
                    className="heading-display text-[#d93025] block"
                    style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}
                  >
                    80.5%
                  </span>
                  <span className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px] block mt-0.5">
                    FINAL SCORE
                  </span>
                </div>
                <div>
                  <span
                    className="heading-display text-[#d93025] block"
                    style={{ fontSize: 'clamp(1.5rem, 2.4vw, 2.25rem)' }}
                  >
                    INTI
                  </span>
                  <span className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px] block mt-0.5">
                    UNIVERSITY
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Photo (capped at max-height 70vh) */}
            <div className="lg:col-span-5 my-reveal">
              <div className="relative w-full max-h-[70vh] aspect-[3/4] border-2 border-[#8a8a85] bg-[#141414] overflow-hidden">
                <Image
                  src="/images/vaigunthan-profile.webp"
                  alt="Vaigunthan SL standing in front of INTI International University, Malaysia"
                  fill
                  sizes="(max-width: 1024px) 100vw, 40vw"
                  className="object-cover"
                  priority
                />
              </div>
              <div className="mt-2 flex items-center justify-between border border-[#8a8a85] px-3 py-2 bg-[#141414]">
                <span className="text-mono text-[#f4f3ef] text-[11px] sm:text-[12px]">
                  INTI INTERNATIONAL UNIVERSITY
                </span>
                <span className="text-mono text-[#d93025] text-[11px] sm:text-[12px]">
                  2026
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Marquee Separator */}
        <MalaysiaMarquee />

        {/* Full Story Section */}
        <section
          ref={storyRef}
          className="py-12 md:py-16 lg:py-20 px-6 md:px-12 border-b border-[#8a8a85]"
        >
          <div className="max-w-4xl mx-auto space-y-6 my-story-reveal">
            <span className="text-mono text-[#d93025] font-bold block text-[11px] sm:text-[12px] tracking-wider">
              02 // REFLECTIONS &amp; LEARNING
            </span>

            <h2
              className="heading-display text-[#f4f3ef]"
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3rem)' }}
            >
              NAVIGATING INDEPENDENCE
            </h2>

            <div className="space-y-4">
              <p
                className="text-[#f4f3ef] leading-relaxed font-normal"
                style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  maxWidth: '42rem',
                }}
              >
                What I discovered at INTI International University went far beyond
                course lectures and assignments. Malaysia offered a fresh perspective
                on culture, team dynamics, and problem solving. From collaborating
                with students across multiple countries to navigating an unfamiliar
                environment, each day developed my adaptability.
              </p>

              <p
                className="text-[#f4f3ef] leading-relaxed font-normal"
                style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  maxWidth: '42rem',
                }}
              >
                I maintained focused academic rigor—achieving an 80.5% overall
                score in computing and information technology coursework—while
                actively participating in community activities, hackathons, and
                peer learning sessions.
              </p>

              <p
                className="text-[#f4f3ef] leading-relaxed font-normal"
                style={{
                  fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                  maxWidth: '42rem',
                }}
              >
                This experience proved to be one of the most formative milestones
                of my degree, building the confidence and communication skills
                needed to deliver impactful software in multicultural engineering teams.
              </p>
            </div>
          </div>
        </section>

        {/* Official Certificate Section (capped at max-height 60vh) */}
        <section className="py-12 md:py-16 lg:py-20 px-6 md:px-12 border-b border-[#8a8a85] bg-[#f4f3ef]">
          <div className="max-w-7xl mx-auto w-full">
            <div className="mb-8">
              <span className="text-mono text-[#d93025] font-bold block mb-1 text-[11px] sm:text-[12px] tracking-wider">
                03 // OFFICIAL VERIFICATION
              </span>
              <h2
                className="heading-display text-[#0a0a0a]"
                style={{ fontSize: 'clamp(1.75rem, 3.6vw, 3rem)' }}
              >
                CERTIFICATE OF PARTICIPATION
              </h2>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 relative w-full max-h-[60vh] aspect-[16/11] border-2 border-[#0a0a0a] bg-[#0a0a0a] overflow-hidden">
                <Image
                  src="/images/inti-exchange-cert.webp"
                  alt="Certificate of Participation - Student Mobility Exchange Programme at INTI International University, Malaysia for Vaigunthan SL"
                  fill
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  className="object-contain"
                />
              </div>

              <div className="lg:col-span-5 space-y-4">
                <h3
                  className="heading-display text-[#0a0a0a]"
                  style={{ fontSize: 'clamp(1.25rem, 2vw, 1.75rem)' }}
                >
                  INTI INTERNATIONAL UNIVERSITY
                </h3>
                <p
                  className="text-[#0a0a0a] leading-relaxed font-normal"
                  style={{
                    fontSize: 'clamp(0.95rem, 1.1vw, 1.1rem)',
                    maxWidth: '42rem',
                  }}
                >
                  Certificate of Participation — Student Mobility Exchange
                  Programme, Faculty of Computing and Information Technology.
                </p>
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between border-b border-[#8a8a85] pb-2">
                    <span className="text-mono text-[#d93025] text-[11px] sm:text-[12px] font-bold">
                      PERIOD
                    </span>
                    <span className="text-mono text-[#0a0a0a] text-[11px] sm:text-[12px]">
                      12 Jan – 10 May 2026
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#8a8a85] pb-2">
                    <span className="text-mono text-[#d93025] text-[11px] sm:text-[12px] font-bold">
                      ACADEMIC SCORE
                    </span>
                    <span className="text-mono text-[#0a0a0a] text-[11px] sm:text-[12px] font-bold">
                      80.5%
                    </span>
                  </div>
                  <div className="flex items-center justify-between border-b border-[#8a8a85] pb-2">
                    <span className="text-mono text-[#d93025] text-[11px] sm:text-[12px] font-bold">
                      LOCATION
                    </span>
                    <span className="text-mono text-[#0a0a0a] text-[11px] sm:text-[12px]">
                      Nilai, Negeri Sembilan, Malaysia
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Back to Portfolio CTA */}
        <section className="py-16 md:py-20 px-6 md:px-12 text-center">
          <div className="max-w-xl mx-auto space-y-6">
            <h2
              className="heading-display text-[#f4f3ef]"
              style={{ fontSize: 'clamp(1.75rem, 3.6vw, 2.5rem)' }}
            >
              EXPLORE WORK &amp; SKILLS
            </h2>
            <p className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px]">
              RETURN TO FULL EXPERIENCE, PROJECTS AND VERIFIED CREDENTIALS
            </p>
            <div>
              <Link
                href="/"
                className="text-mono text-xs border border-[#d93025] text-[#d93025] hover:bg-[#d93025] hover:text-[#f4f3ef] px-6 py-2.5 transition-colors inline-block"
                data-hover
              >
                ← BACK TO PORTFOLIO
              </Link>
            </div>
          </div>
        </section>

        {/* Footer */}
        <div className="border-t border-[#8a8a85] px-6 md:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px]">
            &copy; 2026 VAIGUNTHAN SL
          </p>
          <p className="text-mono text-[#8a8a85] text-[11px] sm:text-[12px]">
            SOLID FLAT COLOR TOKENS
          </p>
        </div>
      </main>
    </>
  );
}
