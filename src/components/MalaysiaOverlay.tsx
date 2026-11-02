'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';

/**
 * Full-screen intercepted-route overlay for /malaysia. The home page stays
 * mounted underneath, so its scroll position, loader and hero never restart.
 */
export default function MalaysiaOverlay({ children }: { children: ReactNode }) {
  const router = useRouter();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const y = window.scrollY;
    rootRef.current?.focus({ preventScroll: true });

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') router.back();
    };
    window.addEventListener('keydown', onKeyDown);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      // Safety net: closing must leave the home page exactly where it was.
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (Math.abs(window.scrollY - y) > 2) window.scrollTo(0, y);
        });
      });
    };
  }, [router]);

  return (
    <div
      ref={rootRef}
      data-lenis-prevent
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-[9995] overflow-y-auto overscroll-contain bg-[#0a0a0a] outline-none"
    >
      {children}
    </div>
  );
}
