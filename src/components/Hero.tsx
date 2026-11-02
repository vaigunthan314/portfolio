'use client';

import { useEffect, useLayoutEffect, useRef, useState, useCallback } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { TOTAL_FRAMES, FRAME_PATH, FRAME_MOBILE_PATH } from '@/data/content';
import { useReducedMotion } from '@/hooks/useMediaQuery';
import { useSound } from '@/context/SoundContext';
import { stopLenis, startLenis, scrollLenisToTop } from './SmoothScroll';

gsap.registerPlugin(ScrollTrigger);

const useIsomorphicLayoutEffect = typeof window !== 'undefined' ? useLayoutEffect : useEffect;

const BLOCKED_KEYS = new Set([' ', 'Space', 'ArrowUp', 'ArrowDown', 'PageUp', 'PageDown', 'Home', 'End']);

let isScrollLocked = false;
let releaseScrollLock: (() => void) | null = null;

/** Freeze the page while the intro loader is visible. */
function lockScroll() {
  if (typeof window === 'undefined' || isScrollLocked) return;
  isScrollLocked = true;

  const root = document.documentElement;
  root.classList.add('loading');
  if ('scrollRestoration' in history) history.scrollRestoration = 'manual';
  window.scrollTo(0, 0);
  scrollLenisToTop();
  stopLenis();

  const options: AddEventListenerOptions = { capture: true, passive: false };
  const block = (e: Event) => e.preventDefault();
  const blockKeys = (e: KeyboardEvent) => {
    if (BLOCKED_KEYS.has(e.key) || BLOCKED_KEYS.has(e.code)) e.preventDefault();
  };
  const reset = () => {
    window.scrollTo(0, 0);
    scrollLenisToTop();
  };

  window.addEventListener('wheel', block, options);
  window.addEventListener('touchmove', block, options);
  window.addEventListener('keydown', blockKeys, options);
  window.addEventListener('scroll', reset, { capture: true, passive: true });

  releaseScrollLock = () => {
    window.removeEventListener('wheel', block, true);
    window.removeEventListener('touchmove', block, true);
    window.removeEventListener('keydown', blockKeys, true);
    window.removeEventListener('scroll', reset, true);
    root.classList.remove('loading');
    window.scrollTo(0, 0);
    scrollLenisToTop();
    startLenis();
    ScrollTrigger.refresh();
  };
}

function unlockScroll() {
  if (!isScrollLocked || !releaseScrollLock) return;
  isScrollLocked = false;
  releaseScrollLock();
  releaseScrollLock = null;
}

interface FrameEdgeColors {
  top: [number, number, number];
  bottom: [number, number, number];
  left: [number, number, number];
  right: [number, number, number];
}

export default function Hero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasShiftRef = useRef<HTMLDivElement>(null);
  const introBeatRef = useRef<HTMLDivElement>(null);

  // Letterbox fill elements (top/bottom or left/right bands)
  const topBarRef = useRef<HTMLDivElement>(null);
  const bottomBarRef = useRef<HTMLDivElement>(null);
  const leftBarRef = useRef<HTMLDivElement>(null);
  const rightBarRef = useRef<HTMLDivElement>(null);

  // Overlay text references
  const beat1Ref = useRef<HTMLDivElement>(null);
  const beat2Ref = useRef<HTMLDivElement>(null);
  const beat3Ref = useRef<HTMLDivElement>(null);

  // Mobile vs Desktop resolution tracking
  const isMobileRef = useRef<boolean>(false);
  const nativeWidthRef = useRef<number>(1920);
  const nativeHeightRef = useRef<number>(1080);

  // Memory-safe ImageBitmap sliding window cache (+/-20 frames)
  const blobCacheRef = useRef<(Blob | null)[]>(new Array(TOTAL_FRAMES).fill(null));
  const bitmapCacheRef = useRef<Map<number, ImageBitmap>>(new Map());
  const decodingSetRef = useRef<Set<number>>(new Set());

  // Priority queue for background fetches (at most 4 concurrent, nearest to scroll position)
  const activeFetchesRef = useRef<number>(0);
  const fetchingSetRef = useRef<Set<number>>(new Set());
  const currentTargetFrameRef = useRef<number>(0);

  // Frame metadata (edge colors for letterbox fill)
  const framesMetaRef = useRef<FrameEdgeColors[] | null>(null);

  // Animation and rendering refs
  const lastDrawnFrameRef = useRef<number>(-1);
  const lastCenterIdxRef = useRef<number>(-1);

  // Viewport metrics
  const metricsRef = useRef({
    vw: 1920,
    vh: 1080,
    aspect: 16 / 9,
    cssW: 1920,
    cssH: 1080,
    cssX: 0,
    cssY: 0,
  });

  // Intro loader states & audio
  const loaderRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  // The inline head script adds `loading` before first paint on a full load of
  // `/`. If it is missing, this is a client-side remount (back from /malaysia),
  // so the loader must stay dismissed.
  const loaderShouldRun = useRef<boolean | null>(null);
  if (loaderShouldRun.current === null) {
    loaderShouldRun.current =
      typeof document !== 'undefined' && document.documentElement.classList.contains('loading');
  }
  const [isLoaderDismissed, setIsLoaderDismissed] = useState<boolean>(!loaderShouldRun.current);

  const reducedMotion = useReducedMotion();
  const { soundOn, hasEnded, showTapHint, toggleSound, startAudio } = useSound();

  // Helper to resolve mobile vs desktop frame asset path
  const getFramePath = useCallback((idx: number) => {
    return isMobileRef.current ? FRAME_MOBILE_PATH(idx + 1) : FRAME_PATH(idx + 1);
  }, []);

  // Size canvas backing store strictly at native frame resolution
  const sizeCanvas = useCallback(() => {
    const container = containerRef.current;
    const vw = container?.clientWidth || (typeof window !== 'undefined' ? window.innerWidth : 1920);
    const vh = container?.clientHeight || (typeof window !== 'undefined' ? window.innerHeight : 1080);
    const aspect = vw / vh;

    // Detect screen width under 768px for mobile frames
    const isMobile = vw < 768;
    isMobileRef.current = isMobile;
    nativeWidthRef.current = isMobile ? 1080 : 1920;
    nativeHeightRef.current = isMobile ? 608 : 1080;
    const nativeW = nativeWidthRef.current;
    const nativeH = nativeHeightRef.current;

    // Backing store is native frame resolution (never smaller, never larger)
    const canvas = canvasRef.current;
    if (canvas) {
      if (canvas.width !== nativeW || canvas.height !== nativeH) {
        canvas.width = nativeW;
        canvas.height = nativeH;
      }
    }

    // Contain-fit calculation with no zoom
    let cssW: number;
    let cssH: number;
    let cssX: number;
    let cssY: number;

    if (aspect >= 1) {
      // Landscape: Contain-fit native frame, centered, no cropping
      const scale = Math.min(vw / nativeW, vh / nativeH);
      cssW = nativeW * scale;
      cssH = nativeH * scale;
      cssX = (vw - cssW) / 2;
      cssY = (vh - cssH) / 2;
    } else {
      // Portrait / narrow: Cover-fit centered on subject
      const scale = Math.max(vw / nativeW, vh / nativeH);
      cssW = nativeW * scale;
      cssH = nativeH * scale;
      cssX = (vw - cssW) / 2;
      cssY = (vh - cssH) / 2;
    }

    metricsRef.current = { vw, vh, aspect, cssW, cssH, cssX, cssY };

    if (canvas) {
      canvas.style.width = `${cssW}px`;
      canvas.style.height = `${cssH}px`;
      canvas.style.left = `${cssX}px`;
      canvas.style.top = `${cssY}px`;
      canvas.style.position = 'absolute';
      canvas.style.imageRendering = 'auto';
    }

    // Size letterbox bars
    if (topBarRef.current) topBarRef.current.style.height = `${Math.ceil(cssY)}px`;
    if (bottomBarRef.current) bottomBarRef.current.style.height = `${Math.ceil(cssY)}px`;
    if (leftBarRef.current) leftBarRef.current.style.width = `${Math.ceil(cssX)}px`;
    if (rightBarRef.current) rightBarRef.current.style.width = `${Math.ceil(cssX)}px`;
  }, []);

  // Fetch frame blob progressively (supports priority high for initial frames)
  const fetchFrameBlob = useCallback(async (idx: number, isHighPriority = false): Promise<Blob | null> => {
    if (blobCacheRef.current[idx]) return blobCacheRef.current[idx];
    try {
      const init: RequestInit = isHighPriority ? { priority: 'high' } : {};
      const res = await fetch(getFramePath(idx), init);
      if (!res.ok) return null;
      const b = await res.blob();
      blobCacheRef.current[idx] = b;
      return b;
    } catch {
      return null;
    }
  }, [getFramePath]);

  // Draw frame on canvas (draws only when frame index changes)
  const drawFrame = useCallback((frameIdx: number, force = false) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const clampedIdx = Math.max(0, Math.min(TOTAL_FRAMES - 1, frameIdx));
    if (!force && clampedIdx === lastDrawnFrameRef.current) return;

    // Find exact or nearest loaded bitmap
    let bmp = bitmapCacheRef.current.get(clampedIdx);
    if (!bmp) {
      let nearestDist = Infinity;
      for (const [k, b] of bitmapCacheRef.current.entries()) {
        const d = Math.abs(k - clampedIdx);
        if (d < nearestDist) {
          nearestDist = d;
          bmp = b;
        }
      }
    }

    if (!bmp) return;
    lastDrawnFrameRef.current = clampedIdx;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    // Draw frame pixels at native resolution
    ctx.drawImage(bmp, 0, 0, nativeWidthRef.current, nativeHeightRef.current);

    // Update letterbox bars with sampled edge colors
    const meta = framesMetaRef.current ? framesMetaRef.current[clampedIdx] : null;
    if (meta) {
      const topColor = `rgb(${meta.top[0]}, ${meta.top[1]}, ${meta.top[2]})`;
      const bottomColor = `rgb(${meta.bottom[0]}, ${meta.bottom[1]}, ${meta.bottom[2]})`;
      const leftColor = `rgb(${meta.left[0]}, ${meta.left[1]}, ${meta.left[2]})`;
      const rightColor = `rgb(${meta.right[0]}, ${meta.right[1]}, ${meta.right[2]})`;

      if (topBarRef.current) topBarRef.current.style.backgroundColor = topColor;
      if (bottomBarRef.current) bottomBarRef.current.style.backgroundColor = bottomColor;
      if (leftBarRef.current) leftBarRef.current.style.backgroundColor = leftColor;
      if (rightBarRef.current) rightBarRef.current.style.backgroundColor = rightColor;
    } else {
      const fallbackColor = clampedIdx >= 215 ? '#fcfcfc' : '#0a0a0a';
      if (topBarRef.current) topBarRef.current.style.backgroundColor = fallbackColor;
      if (bottomBarRef.current) bottomBarRef.current.style.backgroundColor = fallbackColor;
      if (leftBarRef.current) leftBarRef.current.style.backgroundColor = fallbackColor;
      if (rightBarRef.current) rightBarRef.current.style.backgroundColor = fallbackColor;
    }
  }, []);

  // Queue of at most 4 background connections nearest to current target scroll position
  const pumpFetchQueueRef = useRef<() => void>(() => {});

  const pumpFetchQueue = useCallback(() => {
    if (typeof window === 'undefined') return;
    const maxConcurrent = 4;

    while (activeFetchesRef.current < maxConcurrent) {
      let bestIdx = -1;
      let minDistance = Infinity;
      const target = currentTargetFrameRef.current;

      for (let i = 0; i < TOTAL_FRAMES; i++) {
        if (!blobCacheRef.current[i] && !fetchingSetRef.current.has(i)) {
          const dist = Math.abs(i - target);
          if (dist < minDistance) {
            minDistance = dist;
            bestIdx = i;
          }
        }
      }

      if (bestIdx === -1) break;

      const idxToFetch = bestIdx;
      fetchingSetRef.current.add(idxToFetch);
      activeFetchesRef.current++;

      fetchFrameBlob(idxToFetch).finally(() => {
        fetchingSetRef.current.delete(idxToFetch);
        activeFetchesRef.current--;

        const currentTarget = currentTargetFrameRef.current;
        if (
          Math.abs(idxToFetch - currentTarget) <= 20 &&
          blobCacheRef.current[idxToFetch] &&
          !bitmapCacheRef.current.has(idxToFetch)
        ) {
          createImageBitmap(blobCacheRef.current[idxToFetch]!)
            .then((bmp) => {
              if (Math.abs(idxToFetch - currentTargetFrameRef.current) <= 20) {
                bitmapCacheRef.current.set(idxToFetch, bmp);
                if (lastDrawnFrameRef.current === idxToFetch) {
                  drawFrame(idxToFetch, true);
                }
              } else {
                bmp.close();
              }
            })
            .catch(() => {});
        }
        pumpFetchQueueRef.current();
      });
    }
  }, [fetchFrameBlob, drawFrame]);

  useEffect(() => {
    pumpFetchQueueRef.current = pumpFetchQueue;
  }, [pumpFetchQueue]);

  // Sliding window ImageBitmap cache manager (+/-20 frames)
  const updateBitmapWindow = useCallback(
    (centerIdx: number) => {
      if (typeof window === 'undefined' || typeof createImageBitmap === 'undefined') return;
      currentTargetFrameRef.current = centerIdx;
      pumpFetchQueue();

      if (Math.abs(centerIdx - lastCenterIdxRef.current) < 2) return;
      lastCenterIdxRef.current = centerIdx;

      const minIdx = Math.max(0, centerIdx - 20);
      const maxIdx = Math.min(TOTAL_FRAMES - 1, centerIdx + 20);

      // 1. Evict bitmaps outside sliding window (+/-20 frames)
      for (const [key, bmp] of bitmapCacheRef.current.entries()) {
        if (key < minIdx || key > maxIdx) {
          bmp.close();
          bitmapCacheRef.current.delete(key);
        }
      }

      // 2. Decode missing frames within window nearest to centerIdx
      const missingIndices: number[] = [];
      for (let i = minIdx; i <= maxIdx; i++) {
        if (!bitmapCacheRef.current.has(i) && !decodingSetRef.current.has(i) && blobCacheRef.current[i]) {
          missingIndices.push(i);
        }
      }
      missingIndices.sort((a, b) => Math.abs(a - centerIdx) - Math.abs(b - centerIdx));

      for (let j = 0; j < Math.min(missingIndices.length, 6); j++) {
        const i = missingIndices[j];
        decodingSetRef.current.add(i);
        createImageBitmap(blobCacheRef.current[i]!)
          .then((bmp) => {
            decodingSetRef.current.delete(i);
            if (i >= minIdx && i <= maxIdx) {
              bitmapCacheRef.current.set(i, bmp);
              if (lastDrawnFrameRef.current === i) {
                drawFrame(i, true);
              }
            } else {
              bmp.close();
            }
          })
          .catch(() => {
            decodingSetRef.current.delete(i);
          });
      }
    },
    [drawFrame, pumpFetchQueue]
  );

  useIsomorphicLayoutEffect(() => {
    sizeCanvas();
  }, [sizeCanvas]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    let resizeTimer: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        sizeCanvas();
        drawFrame(lastDrawnFrameRef.current, true);
        ScrollTrigger.refresh();
      }, 50);
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener('resize', handleResize);

    return () => {
      clearTimeout(resizeTimer);
      ro.disconnect();
      window.removeEventListener('resize', handleResize);
    };
  }, [sizeCanvas, drawFrame]);

  const loaderDoneRef = useRef(false);

  const dismissLoader = useCallback(() => {
    const finish = () => {
      loaderDoneRef.current = true;
      setIsLoaderDismissed(true);
      unlockScroll();
    };
    if (loaderRef.current) {
      gsap.to(loaderRef.current, {
        yPercent: -100,
        duration: 0.85,
        ease: 'power4.inOut',
        onComplete: finish,
      });
    } else {
      finish();
    }
  }, []);

  // Load frames-meta.json and start progressive loader + audio flow
  useEffect(() => {
    let isCancelled = false;
    // Only a full page load of the home page shows the loader.
    const runLoader = loaderShouldRun.current === true && !loaderDoneRef.current;

    if (runLoader) lockScroll();

    fetch('/frames-meta.json')
      .then((res) => res.json())
      .then((data: FrameEdgeColors[]) => {
        if (!isCancelled) {
          framesMetaRef.current = data;
          drawFrame(Math.max(0, lastDrawnFrameRef.current), true);
        }
      })
      .catch(() => {});

    // Audio is the first thing called when the loader mounts (never blocks it)
    if (runLoader) startAudio();

    // VSL initials animation
    const letters = ['.vsl-char-0', '.vsl-char-1', '.vsl-char-2'];
    gsap.set(letters, { opacity: 0, y: 15 });
    gsap.to(letters, {
      opacity: 1,
      y: 0,
      stagger: 0.35,
      duration: 0.6,
      ease: 'power3.out',
    });

    // Reset progress bar
    if (progressBarRef.current) {
      gsap.set(progressBarRef.current, { scaleX: 0 });
    }

    // Preload first 3 frames via link rel="preload"
    if (typeof document !== 'undefined') {
      for (let i = 0; i < 3; i++) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = getFramePath(i);
        document.head.appendChild(link);
      }
    }

    const startTime = Date.now();
    let loadedInitial20 = false;
    let finishTriggered = false;

    const triggerDismiss = () => {
      if (!runLoader || isCancelled || finishTriggered) return;
      finishTriggered = true;
      dismissLoader();
    };

    // Failsafe: never leave a visitor stuck behind the loader.
    const failsafeTimer = runLoader ? setTimeout(triggerDismiss, 8000) : undefined;

    // The loader always finishes on its own after 2–3 seconds, once the first
    // 20 frames are ready. It never waits for a click, tap or key press.
    const checkReady = () => {
      if (!runLoader || isCancelled || finishTriggered) return;
      const elapsed = Date.now() - startTime;

      if ((elapsed >= 2000 && loadedInitial20) || elapsed >= 3000) {
        triggerDismiss();
      } else {
        setTimeout(checkReady, 50);
      }
    };

    // Preload initial 20 frames at high priority; progress bar reflects first 20 frames
    let initialLoadedCount = 0;
    const initialLoads: Promise<void>[] = [];
    for (let i = 0; i < 20; i++) {
      initialLoads.push(
        fetchFrameBlob(i, true).then(async (blob) => {
          initialLoadedCount++;
          const pct = Math.min(1, initialLoadedCount / 20);
          if (progressBarRef.current) {
            gsap.to(progressBarRef.current, {
              scaleX: pct,
              duration: 0.15,
              ease: 'power1.out',
              transformOrigin: 'left',
            });
          }
          if (blob && typeof createImageBitmap !== 'undefined') {
            const bmp = await createImageBitmap(blob);
            if (!isCancelled) {
              bitmapCacheRef.current.set(i, bmp);
              if (i === 0) {
                drawFrame(0, true);
              }
            } else {
              bmp.close();
            }
          }
        })
      );
    }

    Promise.all(initialLoads).finally(() => {
      loadedInitial20 = true;
      checkReady();
      // Pump queue for remaining frames (at most 4 at a time)
      pumpFetchQueue();
    });

    checkReady();

    return () => {
      isCancelled = true;
      if (failsafeTimer) clearTimeout(failsafeTimer);
      if (runLoader) unlockScroll();
    };
  }, [fetchFrameBlob, drawFrame, startAudio, dismissLoader, getFramePath, pumpFetchQueue]);

  const mapProgressToFrame = (p: number): number => {
    if (p <= 0.15) {
      return Math.round((p / 0.15) * 32);
    } else if (p <= 0.35) {
      const rel = (p - 0.15) / (0.35 - 0.15);
      return Math.round(33 + rel * (65 - 33));
    } else if (p <= 0.82) {
      const rel = (p - 0.35) / (0.82 - 0.35);
      return Math.round(66 + rel * (155 - 66));
    } else {
      const rel = (p - 0.82) / (1.00 - 0.82);
      return Math.round(156 + rel * (TOTAL_FRAMES - 1 - 156));
    }
  };

  // GSAP ScrollTrigger timeline & pinned hero
  useEffect(() => {
    const wrapper = wrapperRef.current;
    const container = containerRef.current;
    if (!wrapper || !container) return;

    const ctx = gsap.context(() => {
      const heroTl = gsap.timeline({
        scrollTrigger: {
          trigger: wrapper,
          start: 'top top',
          end: 'bottom bottom',
          pin: container,
          pinSpacing: true,
          scrub: 0.1,
          invalidateOnRefresh: true,
          onUpdate: (self) => {
            if (reducedMotion) return;
            const progress = self.progress;
            const frameIndex = Math.min(
              TOTAL_FRAMES - 1,
              Math.max(0, mapProgressToFrame(progress))
            );

            updateBitmapWindow(frameIndex);
            drawFrame(frameIndex);

            if (containerRef.current) {
              containerRef.current.style.backgroundColor =
                progress >= 0.82 ? '#fcfcfc' : '#0a0a0a';
            }
          },
        },
      });

      heroTl.to({}, { duration: 1.0 }, 0);

      gsap.set(beat1Ref.current, { opacity: 1 });
      gsap.set([beat2Ref.current, beat3Ref.current], { opacity: 0 });
      gsap.set(introBeatRef.current, { opacity: 0, x: -20 });

      heroTl.to(beat1Ref.current, { opacity: 0, duration: 0.05, ease: 'none' }, 0.10);

      heroTl
        .to(beat2Ref.current, { opacity: 1, duration: 0.04, ease: 'none' }, 0.15)
        .to(beat2Ref.current, { opacity: 1, duration: 0.12, ease: 'none' }, 0.19)
        .to(beat2Ref.current, { opacity: 0, duration: 0.04, ease: 'none' }, 0.32);

      heroTl
        .to(beat3Ref.current, { opacity: 1, duration: 0.05, ease: 'none' }, 0.36)
        .to(beat3Ref.current, { opacity: 1, duration: 0.34, ease: 'none' }, 0.41)
        .to(beat3Ref.current, { opacity: 0, duration: 0.05, ease: 'none' }, 0.77);

      // Intro beat: translate canvas right ~22vw (no scale)
      heroTl
        .to(
          canvasShiftRef.current,
          { x: '22vw', ease: 'power2.inOut', duration: 0.10 },
          0.82
        )
        .to(
          introBeatRef.current,
          { opacity: 1, x: 0, ease: 'power2.out', duration: 0.10 },
          0.84
        );
    }, wrapperRef);

    if (document.fonts) {
      document.fonts.ready.then(() => ScrollTrigger.refresh());
    }

    return () => {
      ctx.revert();
    };
  }, [reducedMotion, updateBitmapWindow, drawFrame]);

  return (
    <>
      {/* Intro Loader Screen (Solid #0a0a0a, Letter-by-Letter VSL, Thin Red Progress Bar) */}
      <div
        ref={loaderRef}
        className={`fixed inset-0 z-[100000] bg-[#0a0a0a] flex flex-col items-center justify-center transition-opacity ${
          isLoaderDismissed ? 'pointer-events-none opacity-0' : 'opacity-100'
        }`}
      >
        <div className="flex flex-col items-center justify-center text-center px-6">
          <div className="flex items-center gap-3 mb-6">
            <span className="vsl-char-0 heading-display text-7xl sm:text-9xl text-[#f4f3ef] tracking-wider">
              V
            </span>
            <span className="vsl-char-1 heading-display text-7xl sm:text-9xl text-[#d93025] tracking-wider">
              S
            </span>
            <span className="vsl-char-2 heading-display text-7xl sm:text-9xl text-[#f4f3ef] tracking-wider">
              L
            </span>
          </div>

          <span className="text-mono text-xs sm:text-sm text-[#8a8a85] tracking-widest mb-6">
            VAIGUNTHAN SL
          </span>

          {/* Thin red progress bar */}
          <div className="w-48 sm:w-64 h-[2px] bg-[#1f1f1f] overflow-hidden">
            <div
              ref={progressBarRef}
              className="h-full bg-[#d93025] w-full transform origin-left"
            />
          </div>

        </div>

        {/* Fixed bottom-right sound button (24px margin, mono 12px, outlined, solid colours) */}
        <div className="absolute bottom-6 right-6 z-20 flex items-center gap-3">
          {showTapHint && (
            <span className="text-mono text-[11px] sm:text-[12px] text-[#d93025] tracking-wider animate-pulse">
              TAP ANYWHERE FOR SOUND
            </span>
          )}
          <button
            onClick={toggleSound}
            disabled={hasEnded}
            type="button"
            className={`text-mono text-[12px] border px-3 py-1.5 transition-colors ${
              soundOn
                ? 'border-[#d93025] text-[#d93025] bg-[#0a0a0a]'
                : 'border-[#8a8a85] text-[#8a8a85] hover:text-[#f4f3ef] hover:border-[#f4f3ef]'
            } ${hasEnded ? 'opacity-40 cursor-not-allowed' : ''}`}
          >
            {soundOn ? 'SOUND ON' : 'SOUND OFF'}
          </button>
        </div>
      </div>

      {/* Hero Pinned Wrapper (500vh: clean pin with zero gap to next section) */}
      <div
        ref={wrapperRef}
        className="hero-pinned-wrapper relative w-full h-[500vh] bg-[#0a0a0a]"
        id="hero"
      >
        <div
          ref={containerRef}
          className="relative top-0 left-0 w-screen h-screen overflow-hidden bg-[#0a0a0a] transition-colors duration-300"
        >
          {/* Letterbox solid color fill bars (outside the frame) */}
          <div ref={topBarRef} className="absolute top-0 left-0 right-0 z-10 pointer-events-none" />
          <div ref={bottomBarRef} className="absolute bottom-0 left-0 right-0 z-10 pointer-events-none" />
          <div ref={leftBarRef} className="absolute top-0 bottom-0 left-0 z-10 pointer-events-none" />
          <div ref={rightBarRef} className="absolute top-0 bottom-0 right-0 z-10 pointer-events-none" />

          {/* Canvas Wrapper (translates right +22vw at intro beat) */}
          <div
            ref={canvasShiftRef}
            className="absolute inset-0 w-full h-full"
          >
            {/* Single Canvas: 100% pure original frame, native 1920x1080 backing store */}
            <canvas
              ref={canvasRef}
              aria-label="Scroll-scrubbed interactive sequence"
            />
          </div>

          {/* Overlay Text (z-20, placed beside head/shoulder to never obscure face) */}
          <div className="absolute inset-0 pointer-events-none z-20 flex items-center justify-center p-6 md:p-12">
            {/* Beat 1: Initial badge */}
            <div
              ref={beat1Ref}
              className="absolute bottom-10 left-6 md:bottom-16 md:left-14 text-left max-w-xl"
            >
              <div className="bg-[#0a0a0a] border border-[#8a8a85] px-4 py-2.5 inline-block">
                <div className="text-mono text-[#d93025] font-bold text-xs tracking-widest mb-0.5">
                  VAIGUNTHAN SL
                </div>
                <div className="text-mono text-[#f4f3ef] text-xs tracking-wider">
                  CLOUD-ENABLED FULL-STACK DEVELOPER
                </div>
              </div>
            </div>

            {/* Beat 2 (Frames 40-100): "I BUILD / THINGS / THAT SHIP." (on left, clear of head) */}
            <div
              ref={beat2Ref}
              className="absolute left-6 md:left-14 lg:left-20 top-1/2 -translate-y-1/2 text-left max-w-2xl select-none"
            >
              <h1
                className="heading-display text-[#f4f3ef] leading-[0.9]"
                style={{ fontSize: 'clamp(2rem, 4.2vw, 3.85rem)' }}
              >
                I BUILD
                <br />
                THINGS
                <br />
                <span className="text-[#d93025]">THAT SHIP.</span>
              </h1>
            </div>

            {/* Beat 3 (Headphones Frames 100-214): "CLOUD. / FULL-STACK. / REAL PROJECTS." (on right, clear of head) */}
            <div
              ref={beat3Ref}
              className="absolute right-6 md:right-14 lg:right-20 top-1/2 -translate-y-1/2 text-right max-w-2xl select-none"
            >
              <h2
                className="heading-display text-[#f4f3ef] leading-[0.9]"
                style={{ fontSize: 'clamp(2rem, 4.2vw, 3.85rem)' }}
              >
                CLOUD.
                <br />
                FULL-STACK.
                <br />
                <span className="text-[#d93025]">REAL PROJECTS.</span>
              </h2>
            </div>

            {/* Beat 4 / Intro Section: Final ~18% on solid #fcfcfc background */}
            <div
              id="about"
              ref={introBeatRef}
              className="absolute left-6 md:left-12 lg:left-16 top-[54%] md:top-1/2 md:-translate-y-1/2 max-w-[34rem] text-left pointer-events-auto"
            >
              <div className="space-y-2.5 sm:space-y-3">
                <span className="text-mono text-[#8a8a85] font-bold text-[11px] sm:text-xs block">
                  01 // ABOUT ME
                </span>

                <h3
                  className="heading-display text-[#0a0a0a] leading-tight"
                  style={{ fontSize: 'clamp(1.75rem, 3.2vw, 2.75rem)' }}
                >
                  I AM <span className="text-[#d93025]">VAIGUNTHAN SL</span>
                </h3>

                <div className="text-mono text-[#d93025] font-bold text-xs sm:text-sm tracking-wider">
                  CLOUD-ENABLED FULL-STACK DEVELOPER
                </div>

                <p
                  className="text-[#0a0a0a] leading-relaxed font-normal"
                  style={{ fontSize: 'clamp(0.85rem, 0.95vw, 0.95rem)' }}
                >
                  A 3rd-year enthusiastic B.Tech student seeking opportunities to apply technical and problem-solving skills in a dynamic organization. Passionate about learning emerging technologies and contributing to innovative real-world solutions.
                </p>

                <p
                  className="text-[#555555] leading-relaxed font-normal text-xs sm:text-sm"
                  style={{ fontSize: 'clamp(0.75rem, 0.85vw, 0.85rem)' }}
                >
                  A Cloud-Enabled Full-Stack Developer is a software engineer who designs and builds both the user-facing side (frontend) and the server side (backend) of an application, and uses cloud computing infrastructure to deploy, scale, and manage it.
                </p>

                {/* Row of 3 chips */}
                <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-1">
                  <span className="text-mono text-[9px] sm:text-[11px] border border-[#0a0a0a] text-[#0a0a0a] bg-[#fcfcfc] px-2 py-0.5 sm:px-2.5 sm:py-1">
                    AWS CERTIFIED CLOUD PRACTITIONER
                  </span>
                  <span className="text-mono text-[9px] sm:text-[11px] border border-[#0a0a0a] text-[#0a0a0a] bg-[#fcfcfc] px-2 py-0.5 sm:px-2.5 sm:py-1">
                    STUDIED IN MALAYSIA
                  </span>
                  <span className="text-mono text-[9px] sm:text-[11px] border border-[#0a0a0a] text-[#0a0a0a] bg-[#fcfcfc] px-2 py-0.5 sm:px-2.5 sm:py-1">
                    10+ EVENTS: HACKATHONS, PRESENTATIONS &amp; MORE
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
