'use client';

import { useEffect, useState, useRef } from 'react';
import { navLinks } from '@/data/content';
import { useSound } from '@/context/SoundContext';

export default function Navbar() {
  const { soundOn, hasEnded, toggleSound } = useSound();
  const [activeSection, setActiveSection] = useState<string>('');
  const [visible, setVisible] = useState<boolean>(false);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const visibleRef = useRef<boolean>(false);
  const lastScrollYRef = useRef<number>(0);

  useEffect(() => {
    const onScroll = () => {
      const scrollY = window.scrollY;
      const totalDoc = document.documentElement.scrollHeight - window.innerHeight;
      const pct = totalDoc > 0 ? scrollY / totalDoc : 0;
      if (progressBarRef.current) {
        progressBarRef.current.style.transform = `scaleX(${pct})`;
      }

      // Hero check: hide header completely during the pinned hero
      const hero = document.getElementById('hero');
      const heroEnd = hero
        ? hero.offsetTop + hero.offsetHeight - window.innerHeight - 50
        : window.innerHeight * 6.0;

      if (scrollY < heroEnd) {
        // Completely hidden during hero
        if (visibleRef.current) {
          visibleRef.current = false;
          setVisible(false);
        }
      } else {
        // After hero ends: show when scrolling up or at rest
        const isScrollingUp = scrollY < lastScrollYRef.current;
        const shouldBeVisible = isScrollingUp || scrollY > heroEnd + 100;
        if (visibleRef.current !== shouldBeVisible) {
          visibleRef.current = shouldBeVisible;
          setVisible(shouldBeVisible);
        }
      }

      lastScrollYRef.current = scrollY;
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    // IntersectionObserver for active section highlight
    const hashLinks = navLinks.filter((l) => l.href.startsWith('#'));
    const sectionIds = hashLinks.map((l) => l.href.replace('#', ''));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      {
        rootMargin: '-20% 0px -60% 0px',
        threshold: 0,
      }
    );

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => {
      window.removeEventListener('scroll', onScroll);
      observer.disconnect();
    };
  }, []);

  const handleHashClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();

    if (href === '#about') {
      // ABOUT scrolls to the hero's final intro beat
      const introTarget = document.getElementById('about-intro') || document.getElementById('about');
      if (introTarget) {
        introTarget.scrollIntoView({ behavior: 'smooth' });
        return;
      }
      const hero = document.getElementById('hero');
      if (hero) {
        const targetScroll = hero.offsetTop + hero.offsetHeight - window.innerHeight;
        window.scrollTo({ top: targetScroll, behavior: 'smooth' });
        return;
      }
    }

    const id = href.replace('#', '');
    const target = document.getElementById(id);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <>
      {/* Solid Red Scroll Progress Bar */}
      <div
        ref={progressBarRef}
        className="scroll-progress-bar"
        style={{ transform: 'scaleX(0)' }}
      />

      {/* Slimmer (56px) Navigation Bar: Hidden during pinned hero */}
      <header
        className={`fixed top-0 left-0 right-0 z-[9990] h-[56px] bg-[#0a0a0a] border-b border-[#8a8a85] transition-transform duration-300 ${
          visible ? 'translate-y-0 pointer-events-auto' : '-translate-y-full pointer-events-none'
        }`}
      >
        <div className="max-w-7xl mx-auto h-full px-6 md:px-12 flex items-center justify-between">
          <a
            href="#hero"
            onClick={(e) => handleHashClick(e, '#hero')}
            className="text-mono font-bold text-xs tracking-widest text-[#f4f3ef] hover:text-[#d93025] transition-colors"
            data-hover
          >
            VAIGUNTHAN SL
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => {
              const id = link.href.replace('#', '');
              const isActive = activeSection === id;

              return (
                <a
                  key={link.href}
                  href={link.href}
                  onClick={(e) => handleHashClick(e, link.href)}
                  className={`text-mono text-xs font-medium tracking-wider transition-colors ${
                    isActive
                      ? 'text-[#d93025] border-b border-[#d93025] pb-0.5'
                      : 'text-[#8a8a85] hover:text-[#f4f3ef]'
                  }`}
                  data-hover
                >
                  {link.label}
                </a>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleSound}
              disabled={hasEnded}
              type="button"
              className={`text-mono text-xs border px-3 py-1 transition-colors ${
                soundOn
                  ? 'border-[#d93025] text-[#d93025] bg-[#0a0a0a]'
                  : 'border-[#8a8a85] text-[#8a8a85] hover:text-[#f4f3ef] hover:border-[#f4f3ef]'
              } ${hasEnded ? 'opacity-40 cursor-not-allowed' : ''}`}
              data-hover
            >
              {soundOn ? 'SOUND ON' : 'SOUND OFF'}
            </button>

            <a
              href="/Vaigunthan_SL_Resume.pdf"
              download="Vaigunthan_SL_Resume.pdf"
              className="text-mono text-xs border border-[#d93025] text-[#d93025] hover:bg-[#d93025] hover:text-[#f4f3ef] px-3 py-1 transition-colors hidden sm:inline-block"
              data-hover
            >
              RESUME ↓
            </a>
          </div>
        </div>
      </header>
    </>
  );
}
