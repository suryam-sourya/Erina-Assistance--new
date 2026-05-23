/**
 * useDispatchAlarm — plays a synthesized emergency siren using the Web Audio API.
 *
 * No external audio files required. Generates a two-tone wailing siren
 * (high-low oscillator sweep) entirely in the browser.
 *
 * Usage:
 *   const { playAlarm, stopAlarm } = useDispatchAlarm();
 *   playAlarm();  // starts the siren
 *   stopAlarm();  // silences it
 */

import { useRef, useCallback } from 'react';

export function useDispatchAlarm() {
  const audioCtxRef = useRef<AudioContext | null>(null);
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainRef = useRef<GainNode | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isPlayingRef = useRef(false);

  const stopAlarm = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (oscillatorRef.current) {
      try {
        oscillatorRef.current.stop();
      } catch (_) {
        // already stopped
      }
      oscillatorRef.current.disconnect();
      oscillatorRef.current = null;
    }
    if (gainRef.current) {
      gainRef.current.disconnect();
      gainRef.current = null;
    }
    if (audioCtxRef.current) {
      audioCtxRef.current.close();
      audioCtxRef.current = null;
    }
    isPlayingRef.current = false;
  }, []);

  const playAlarm = useCallback(() => {
    // Prevent double-starting
    if (isPlayingRef.current) return;
    isPlayingRef.current = true;

    // Safari / older browser guard
    const AudioContextClass =
      typeof window !== 'undefined'
        ? (window.AudioContext || (window as any).webkitAudioContext)
        : null;

    if (!AudioContextClass) return;

    const ctx = new AudioContextClass();
    audioCtxRef.current = ctx;

    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // start high
    gain.gain.setValueAtTime(0.35, ctx.currentTime);     // volume

    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();

    oscillatorRef.current = osc;
    gainRef.current = gain;

    // Sweep frequency high → low → high every 600ms (classic wailing siren)
    let sweepUp = false;
    intervalRef.current = setInterval(() => {
      if (!oscillatorRef.current || !audioCtxRef.current) return;
      sweepUp = !sweepUp;
      oscillatorRef.current.frequency.exponentialRampToValueAtTime(
        sweepUp ? 880 : 440,
        audioCtxRef.current.currentTime + 0.55
      );
    }, 600);

    // Auto-stop after 5 seconds so it doesn't blare forever
    setTimeout(() => {
      stopAlarm();
    }, 5000);
  }, [stopAlarm]);

  return { playAlarm, stopAlarm };
}
