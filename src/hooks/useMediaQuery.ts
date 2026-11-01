'use client';

import { useSyncExternalStore } from 'react';

function subscribeReducedMotion(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
  mq.addEventListener('change', callback);
  return () => mq.removeEventListener('change', callback);
}

function getReducedMotionSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

function subscribeMobile(callback: () => void) {
  if (typeof window === 'undefined') return () => {};
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
}

function getMobileSnapshot() {
  if (typeof window === 'undefined') return false;
  return window.innerWidth < 768;
}

export function useReducedMotion() {
  return useSyncExternalStore(subscribeReducedMotion, getReducedMotionSnapshot, () => false);
}

export function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, getMobileSnapshot, () => false);
}

function getLowPowerSnapshot() {
  if (typeof window === 'undefined') return false;
  const isMobile = window.innerWidth < 768;
  const conn = (navigator as unknown as { connection?: { effectiveType?: string } }).connection;
  const slow = conn?.effectiveType === '2g' || conn?.effectiveType === 'slow-2g';
  return isMobile && !!slow;
}

export function useLowPower() {
  return useSyncExternalStore(subscribeMobile, getLowPowerSnapshot, () => false);
}
