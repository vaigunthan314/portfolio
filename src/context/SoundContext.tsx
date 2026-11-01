'use client';

import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';

interface SoundContextType {
  soundOn: boolean;
  isPlaying: boolean;
  hasEnded: boolean;
  showTapHint: boolean;
  needsUserGesture: boolean;
  toggleSound: () => void;
  startAudio: () => void;
}

const SoundContext = createContext<SoundContextType>({
  soundOn: false,
  isPlaying: false,
  hasEnded: false,
  showTapHint: false,
  needsUserGesture: false,
  toggleSound: () => {},
  startAudio: () => {},
});

// Module-level singleton state (persists across re-renders and client navigation; resets on full page reload)
let globalAudio: HTMLAudioElement | null = null;
let hasEnded = false;
let userMuted = false;
let wasPlayingBeforeHidden = false;
let fadeInterval: NodeJS.Timeout | null = null;
let unlockListenersAttached = false;
let cleanupUnlockListeners: (() => void) | null = null;

const UNLOCK_EVENTS = ['pointerdown', 'click', 'keydown', 'touchend'] as const;

function getAudio(): HTMLAudioElement | null {
  if (globalAudio) return globalAudio;
  if (typeof document !== 'undefined') {
    globalAudio = document.getElementById('bg-intro-audio') as HTMLAudioElement | null;
  }
  return globalAudio;
}

function fadeInVolume(targetVol = 0.8, durationMs = 1000) {
  const audio = getAudio();
  if (!audio) return;
  if (fadeInterval) {
    clearInterval(fadeInterval);
    fadeInterval = null;
  }
  audio.volume = 0;
  let currentVol = 0;
  const steps = 20;
  const stepTime = durationMs / steps;
  const stepVol = targetVol / steps;

  fadeInterval = setInterval(() => {
    currentVol = Math.min(targetVol, currentVol + stepVol);
    const el = getAudio();
    if (el) {
      el.volume = currentVol;
    }
    if (currentVol >= targetVol) {
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
    }
  }, stepTime);
}

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [soundOn, setSoundOn] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [hasEndedState, setHasEndedState] = useState<boolean>(hasEnded);
  const [showTapHint, setShowTapHint] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  const removeUnlockListeners = useCallback(() => {
    if (cleanupUnlockListeners) {
      cleanupUnlockListeners();
      cleanupUnlockListeners = null;
    }
    unlockListenersAttached = false;
  }, []);

  const handleUnlock = useCallback(() => {
    removeUnlockListeners();
    setShowTapHint(false);

    if (hasEnded || userMuted) return;
    const audio = getAudio();
    if (!audio) return;

    audio.removeAttribute('muted');
    audio.defaultMuted = false;
    audio.muted = false;
    setSoundOn(true);
    fadeInVolume(0.8, 1000);

    if (audio.paused) {
      audio.play().catch(() => {});
    }
  }, [removeUnlockListeners]);

  const attachUnlockListeners = useCallback(() => {
    if (unlockListenersAttached || hasEnded) return;
    unlockListenersAttached = true;

    const onGesture = () => {
      handleUnlock();
    };

    UNLOCK_EVENTS.forEach((evt) => {
      window.addEventListener(evt, onGesture, { passive: true, once: true });
    });

    cleanupUnlockListeners = () => {
      UNLOCK_EVENTS.forEach((evt) => {
        window.removeEventListener(evt, onGesture);
      });
    };
  }, [handleUnlock]);

  const startAudio = useCallback(() => {
    if (hasEnded) return;
    const audio = getAudio();
    if (!audio) return;

    // If already playing unmuted with sound, keep state ON
    if (!audio.paused && !audio.muted && audio.currentTime > 0) {
      setSoundOn(true);
      setShowTapHint(false);
      return;
    }

    // Attempt 1: Call audio.play() with sound (fade to 0.8 over ~1s)
    audio.removeAttribute('muted');
    audio.defaultMuted = false;
    audio.muted = false;
    audio.volume = 0;

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          // Autoplay with sound allowed by browser
          userMuted = false;
          setSoundOn(true);
          setShowTapHint(false);
          fadeInVolume(0.8, 1000);
          removeUnlockListeners();
        })
        .catch(() => {
          // Autoplay blocked by browser policy (NotAllowedError)
          // Immediately set audio.muted = true and call audio.play() again
          if (hasEnded) return;
          audio.setAttribute('muted', '');
          audio.defaultMuted = true;
          audio.muted = true;
          audio.play().catch(() => {});
          setSoundOn(false); // While muted by fallback, show SOUND OFF
          setShowTapHint(true); // Show "TAP ANYWHERE FOR SOUND" in loader
          attachUnlockListeners();
        });
    }
  }, [attachUnlockListeners, removeUnlockListeners]);

  const toggleSound = useCallback(() => {
    if (hasEnded) return;
    const audio = getAudio();
    if (!audio) return;

    if (soundOn) {
      // User clicked OFF: pause audio
      audio.pause();
      userMuted = true;
      setSoundOn(false);
      removeUnlockListeners();
      setShowTapHint(false);
    } else {
      // User clicked ON: resume from same position or unmute fallback
      userMuted = false;
      audio.removeAttribute('muted');
      audio.defaultMuted = false;
      audio.muted = false;
      setSoundOn(true);
      removeUnlockListeners();
      setShowTapHint(false);
      audio.play().then(() => {
        fadeInVolume(0.8, 1000);
      }).catch(() => {});
    }
  }, [soundOn, removeUnlockListeners]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    globalAudio = audio;

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    const handleEnded = () => {
      // PLAY ONCE: module-level flag hasEnded = true
      hasEnded = true;
      userMuted = true;
      setHasEndedState(true);
      setSoundOn(false);
      setShowTapHint(false);
      removeUnlockListeners();
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
    };

    const handleVisibilityChange = () => {
      if (hasEnded) return;
      const currentAudio = getAudio();
      if (!currentAudio) return;

      if (document.hidden) {
        if (!currentAudio.paused) {
          wasPlayingBeforeHidden = true;
          currentAudio.pause();
        }
      } else {
        if (wasPlayingBeforeHidden && !userMuted && !hasEnded) {
          currentAudio.play().catch(() => {});
        }
        wasPlayingBeforeHidden = false;
      }
    };

    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);
    audio.addEventListener('ended', handleEnded);
    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
      audio.removeEventListener('ended', handleEnded);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      if (fadeInterval) {
        clearInterval(fadeInterval);
        fadeInterval = null;
      }
      removeUnlockListeners();
    };
  }, [removeUnlockListeners]);

  return (
    <SoundContext.Provider
      value={{
        soundOn,
        isPlaying,
        hasEnded: hasEndedState,
        showTapHint,
        needsUserGesture: showTapHint,
        toggleSound,
        startAudio,
      }}
    >
      {/* Exactly ONE audio element singleton without loop attribute */}
      <audio
        ref={audioRef}
        id="bg-intro-audio"
        preload="auto"
        playsInline
        muted
      >
        <source src="/audio/intro-bgm.m4a" type="audio/mp4" />
        <source src="/audio/intro-bgm.mp3" type="audio/mpeg" />
      </audio>
      {children}
    </SoundContext.Provider>
  );
}

export function useSound() {
  return useContext(SoundContext);
}
