'use client';

import { useEffect, useRef } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

// One shared instance: the intro loader stops/starts this one, never a second.
let globalLenis: Lenis | null = null;

export function stopLenis(): void {
  globalLenis?.stop();
}

export function startLenis(): void {
  globalLenis?.start();
}

export function scrollLenisToTop(): void {
  globalLenis?.scrollTo(0, { immediate: true });
}

export function scrollLenisTo(target: number | HTMLElement): void {
  if (globalLenis) {
    globalLenis.scrollTo(target, { immediate: true });
  } else if (typeof target === 'number') {
    window.scrollTo(0, target);
  } else {
    target.scrollIntoView();
  }
}

export default function SmoothScroll({ children }: { children?: React.ReactNode }) {
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    // One instance only (Strict Mode / HMR safe): release any previous one.
    if (globalLenis) {
      globalLenis.destroy();
      globalLenis = null;
    }

    // Disable autoRaf so GSAP controls ticking exclusively without conflict
    const lenis = new Lenis({
      lerp: 0.1,
      touchMultiplier: 1.5,
      autoRaf: false,
    });

    lenisRef.current = lenis;
    globalLenis = lenis;

    // Start stopped if the intro loader is still on screen (html.loading)
    if (typeof document !== 'undefined' && document.documentElement.classList.contains('loading')) {
      lenis.stop();
    }

    // Synchronize Lenis scroll with GSAP ScrollTrigger
    lenis.on('scroll', ScrollTrigger.update);

    const tickerCallback = (time: number) => {
      lenis.raf(time * 1000);
    };

    gsap.ticker.add(tickerCallback);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(tickerCallback);
      lenis.destroy();
      if (globalLenis === lenis) globalLenis = null;
    };
  }, []);

  return <>{children}</>;
}
