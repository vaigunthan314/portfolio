'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { contact } from '@/data/content';

gsap.registerPlugin(ScrollTrigger);

export default function Contact() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        '.contact-reveal',
        { y: 30, opacity: 0 },
        {
          y: 0,
          opacity: 1,
          duration: 0.7,
          stagger: 0.1,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: section,
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
      id="contact"
      className="section-dark section-border-dark py-16 md:py-24 relative"
    >
      <div className="max-w-[1200px] mx-auto px-6 md:px-12 w-full">
        <div className="mb-10">
          <span className="text-mono text-[#d93025] font-bold block mb-1 text-xs contact-reveal">
            {'06 // CONTACT & CHANNELS'}
          </span>
          <h2 className="heading-display text-4xl sm:text-5xl md:text-6xl text-[#f4f3ef] contact-reveal">
            GET IN TOUCH
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-12">
          {/* Direct Links */}
          <div className="lg:col-span-8 space-y-6">
            <div className="contact-reveal border-b border-[#333] pb-4">
              <span className="text-mono text-[#8a8a85] text-[10px] block mb-1">
                PRIMARY EMAIL
              </span>
              <a
                href={`mailto:${contact.email}`}
                className="heading-display text-xl sm:text-3xl text-[#f4f3ef] hover:text-[#d93025] transition-colors"
                data-hover
              >
                {contact.email}
              </a>
            </div>

            <div className="contact-reveal border-b border-[#333] pb-4">
              <span className="text-mono text-[#8a8a85] text-[10px] block mb-1">
                PROFESSIONAL NETWORK
              </span>
              <a
                href={contact.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="heading-display text-xl sm:text-3xl text-[#f4f3ef] hover:text-[#d93025] transition-colors"
                data-hover
              >
                LINKEDIN ↗
              </a>
            </div>

            <div className="contact-reveal border-b border-[#333] pb-4">
              <span className="text-mono text-[#8a8a85] text-[10px] block mb-1">
                CODE REPOSITORIES
              </span>
              <a
                href={contact.github}
                target="_blank"
                rel="noopener noreferrer"
                className="heading-display text-xl sm:text-3xl text-[#f4f3ef] hover:text-[#d93025] transition-colors"
                data-hover
              >
                GITHUB ↗
              </a>
            </div>
          </div>

          {/* Resume Download Card (Factual text only) */}
          <div className="lg:col-span-4 contact-reveal border border-[#8a8a85] p-5 sm:p-6 bg-[#141414]">
            <span className="text-mono text-[#d93025] text-xs font-bold block mb-1.5">
              CURRICULUM VITAE
            </span>
            <h3 className="heading-display text-xl sm:text-2xl text-[#f4f3ef] mb-2.5">
              DOWNLOAD RESUME
            </h3>
            <p className="text-[#8a8a85] text-xs leading-relaxed mb-5">
              Resume covering computer science education, AWS Cloud Practitioner certification, full-stack projects, and internship experience.
            </p>
            <a
              href={contact.resumePath}
              download="Vaigunthan_SL_Resume.pdf"
              className="text-mono text-xs border border-[#d93025] bg-[#d93025] text-[#f4f3ef] hover:bg-transparent hover:text-[#d93025] block w-full text-center py-2.5 transition-colors"
              data-hover
            >
              Get PDF Resume ↓
            </a>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-6 border-t border-[#333] flex items-center justify-start">
          <p className="text-mono text-[#8a8a85] text-[10px] text-left">
            &copy; 2026 VAIGUNTHAN SL
          </p>
        </div>
      </div>
    </section>
  );
}
