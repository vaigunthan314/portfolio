'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

let globalLenis: Lenis | null = null;

export function getLenis(): Lenis | null {
  return globalLenis;
}

export function stopLenis(): void {
  globalLenis?.stop();
}

export function startLenis(): void {
  globalLenis?.start();
}

export function scrollLenisToTop(): void {
  if (globalLenis) {
    globalLenis.scrollTo(0, { immediate: true });
  }
}

export default function SmoothScroll({ children }: { children?: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (globalLenis) {
      globalLenis.destroy();
      globalLenis = null;
    }

    // Faster, lighter Lenis scroll feel: lerp 0.1, smoothWheel on, no heavy duration easing
    const lenis = new Lenis({
      lerp: 0.1,
      wheelMultiplier: 1.2,
      touchMultiplier: 1.5,
      smoothWheel: true,
      autoRaf: false,
    });

    globalLenis = lenis;
    lenisRef.current = lenis;

    // Start Lenis stopped if loader is active (html.loading)
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('loading')) {
      lenis.stop();
    }

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(500, 33);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (globalLenis === lenis) {
        globalLenis = null;
      }
    };
  }, []);

  return <>{children}</>;
}
