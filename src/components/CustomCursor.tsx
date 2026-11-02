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

    const onMouseEnterInteractive = () => cursor.classList.add('hovered');
    const onMouseLeaveInteractive = () => cursor.classList.remove('hovered');

    window.addEventListener('mousemove', onMouseMove, { passive: true });

    const attachListeners = () => {
      document.querySelectorAll('a, button, [data-hover]').forEach((el) => {
        el.removeEventListener('mouseenter', onMouseEnterInteractive);
        el.removeEventListener('mouseleave', onMouseLeaveInteractive);
        el.addEventListener('mouseenter', onMouseEnterInteractive);
        el.addEventListener('mouseleave', onMouseLeaveInteractive);
      });
    };

    attachListeners();

    const observer = new MutationObserver(() => {
      attachListeners();
    });

    observer.observe(document.body, { childList: true, subtree: true });

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      observer.disconnect();
    };
  }, []);

  return <div ref={cursorRef} className="custom-cursor" aria-hidden="true" />;
}
