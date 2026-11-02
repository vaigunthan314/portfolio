'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';

export default function CustomCursor() {
  const cursorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Only enable on desktop pointer devices
    if (window.matchMedia('(pointer: coarse)').matches) return;

    const cursor = cursorRef.current;
    if (!cursor) return;

    // Use gsap.quickTo for instant transforms without layout thrashing
    gsap.set(cursor, { xPercent: -50, yPercent: -50 });
    const setX = gsap.quickTo(cursor, 'x', { duration: 0.15, ease: 'power3' });
    const setY = gsap.quickTo(cursor, 'y', { duration: 0.15, ease: 'power3' });

    // Initialize in the center of the viewport
    setX(window.innerWidth / 2);
    setY(window.innerHeight / 2);

    const onMouseMove = (e: MouseEvent) => {
      setX(e.clientX);
      setY(e.clientY);
    };

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a, button, [data-hover]')) {
        cursor.classList.add('hovered');
      }
    };

    const onMouseOut = (e: MouseEvent) => {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('a, button, [data-hover]')) {
        cursor.classList.remove('hovered');
      }
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('mouseover', onMouseOver, { passive: true });
    window.addEventListener('mouseout', onMouseOut, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseover', onMouseOver);
      window.removeEventListener('mouseout', onMouseOut);
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
