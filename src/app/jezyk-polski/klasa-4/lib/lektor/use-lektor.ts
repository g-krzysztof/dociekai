'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { LektorManifest } from './types';

/**
 * Odtwarzacz klipów lektora (E4a). Gra klipy manifestu po kolei, z krótką ciszą
 * między zdaniami i dłuższą między akapitami, i mówi, które zdanie właśnie
 * brzmi (`active` → `activeUnit` w `KorpusText`).
 *
 * - `toggle()` / `play()` / `pause()` — cały tekst (wznawia od miejsca pauzy);
 * - `playFrom(id)` — od wskazanego zdania do końca;
 * - `playOne(id)` — tylko jeden klip (warianty „Przyjdź.” / „Przyjdź!”);
 * - `plays` — ile razy tekst wybrzmiał **w całości od początku** (bez
 *   przeskakiwania): to jest licznik, gdy słuchanie jest zadaniem;
 * - `rate` — `1` albo `0.85` („wolniej”; przeglądarka zachowuje wysokość głosu).
 *
 * Audio startuje wyłącznie z gestu (zasady autoodtwarzania), więc hook niczego
 * nie gra sam. Brak pliku → `error` z id klipu i zatrzymanie, nigdy wyjątek.
 */

export type LektorStatus = 'idle' | 'playing' | 'paused';

export interface LektorOptions {
  /** Cisza między zdaniami (ms). */
  gapMs?: number;
  /** Cisza między akapitami/strofami (ms). */
  blockGapMs?: number;
  /** Tekst wybrzmiał w całości od początku; `plays` to licznik po tym odsłuchu. */
  onFullPlay?: (plays: number) => void;
}

export interface Lektor {
  manifest: LektorManifest;
  status: LektorStatus;
  /** Id klipu, który brzmi albo czeka w pauzie; `null`, gdy nic. */
  active: string | null;
  /** Czas od początku tekstu (ms), do paska postępu. */
  elapsedMs: number;
  totalMs: number;
  plays: number;
  rate: number;
  error: string | null;
  play: () => void;
  pause: () => void;
  toggle: () => void;
  stop: () => void;
  playFrom: (id: string) => void;
  playOne: (id: string) => void;
  setRate: (rate: number) => void;
}

type Mode = 'all' | 'one';

export function useLektor(manifest: LektorManifest, opts: LektorOptions = {}): Lektor {
  const { gapMs = 280, blockGapMs = 650 } = opts;
  const clips = manifest.clips;
  const offsets = useMemo(() => {
    const out: number[] = [];
    let sum = 0;
    for (const c of clips) {
      out.push(sum);
      sum += c.ms;
    }
    return { starts: out, total: sum };
  }, [clips]);

  const [status, setStatus] = useState<LektorStatus>('idle');
  const [index, setIndex] = useState<number | null>(null);
  const [clipMs, setClipMs] = useState(0);
  const [plays, setPlays] = useState(0);
  const [rate, setRateState] = useState(1);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Stan potrzebny w obsłudze zdarzeń audio — w refach, żeby nie łapać starych domknięć.
  const run = useRef({ index: -1, mode: 'all' as Mode, fromStart: false, rate: 1 });
  const playsRef = useRef(0);
  useEffect(() => {
    playsRef.current = plays;
  }, [plays]);
  const onFullPlayRef = useRef(opts.onFullPlay);
  useEffect(() => {
    onFullPlayRef.current = opts.onFullPlay;
  }, [opts.onFullPlay]);

  const clearTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = null;
  };

  const audio = useCallback(() => {
    if (!audioRef.current) audioRef.current = new Audio();
    return audioRef.current;
  }, []);

  const startClip = useCallback(
    (i: number) => {
      const clip = clips[i];
      const el = audio();
      run.current.index = i;
      setIndex(i);
      setClipMs(0);
      setError(null);
      el.src = clip.src;
      el.playbackRate = run.current.rate;
      el.play().catch(() => {
        // Odrzucenie play() (brak pliku, blokada) obsługuje zdarzenie `error`
        // albo zostawiamy pauzę — bez wyjątku w konsoli.
      });
      setStatus('playing');
      // Następny klip ściągamy z wyprzedzeniem, żeby przerwa była tylko ciszą z danych.
      const next = clips[i + 1];
      if (next && run.current.mode === 'all') {
        if (!preloadRef.current) preloadRef.current = new Audio();
        preloadRef.current.preload = 'auto';
        preloadRef.current.src = next.src;
      }
    },
    [audio, clips],
  );

  // Zdarzenia elementu audio — podpinane raz.
  useEffect(() => {
    const el = audio();
    const onTime = () => setClipMs(el.currentTime * 1000);
    const onEnded = () => {
      const { index: i, mode } = run.current;
      if (mode === 'one' || i >= clips.length - 1) {
        const full = mode === 'all' && run.current.fromStart && i === clips.length - 1;
        run.current.index = -1;
        setStatus('idle');
        setIndex(null);
        setClipMs(0);
        if (full) {
          setPlays((p) => p + 1);
          // Licznik po odsłuchu znamy od razu — wywołanie poza updaterem stanu.
          onFullPlayRef.current?.(playsRef.current + 1);
        }
        return;
      }
      const gap = clips[i + 1].block !== clips[i].block ? blockGapMs : gapMs;
      timerRef.current = setTimeout(() => startClip(i + 1), gap / run.current.rate);
    };
    const onError = () => {
      if (run.current.index < 0 || !el.getAttribute('src')) return;
      setError(clips[run.current.index]?.id ?? null);
      clearTimer();
      run.current.index = -1;
      setStatus('idle');
    };
    el.addEventListener('timeupdate', onTime);
    el.addEventListener('ended', onEnded);
    el.addEventListener('error', onError);
    return () => {
      el.removeEventListener('timeupdate', onTime);
      el.removeEventListener('ended', onEnded);
      el.removeEventListener('error', onError);
    };
  }, [audio, clips, gapMs, blockGapMs, startClip]);

  // Sprzątanie przy odmontowaniu.
  useEffect(
    () => () => {
      clearTimer();
      audioRef.current?.pause();
    },
    [],
  );

  const playFrom = useCallback(
    (id: string) => {
      const i = clips.findIndex((c) => c.id === id);
      if (i < 0) return;
      clearTimer();
      run.current.mode = 'all';
      run.current.fromStart = i === 0;
      startClip(i);
    },
    [clips, startClip],
  );

  const playOne = useCallback(
    (id: string) => {
      const i = clips.findIndex((c) => c.id === id);
      if (i < 0) return;
      clearTimer();
      run.current.mode = 'one';
      run.current.fromStart = false;
      startClip(i);
    },
    [clips, startClip],
  );

  const play = useCallback(() => {
    if (!clips.length) return;
    const el = audio();
    if (status === 'paused' && run.current.index >= 0) {
      el.play().catch(() => {});
      setStatus('playing');
      return;
    }
    clearTimer();
    run.current.mode = 'all';
    run.current.fromStart = true;
    startClip(0);
  }, [audio, clips.length, startClip, status]);

  const pause = useCallback(() => {
    if (status !== 'playing') return;
    if (timerRef.current) {
      // Pauza w ciszy między zdaniami: wznowienie zaczyna następne zdanie.
      clearTimer();
      const next = run.current.index + 1;
      run.current.index = next;
      setIndex(next);
      setClipMs(0);
      audio().src = clips[next].src;
    } else {
      audio().pause();
    }
    setStatus('paused');
  }, [audio, clips, status]);

  const stop = useCallback(() => {
    clearTimer();
    audio().pause();
    run.current.index = -1;
    setStatus('idle');
    setIndex(null);
    setClipMs(0);
  }, [audio]);

  const toggle = useCallback(() => (status === 'playing' ? pause() : play()), [pause, play, status]);

  const setRate = useCallback(
    (r: number) => {
      run.current.rate = r;
      setRateState(r);
      audio().playbackRate = r;
    },
    [audio],
  );

  const active = index !== null ? (clips[index]?.id ?? null) : null;
  const elapsedMs = index !== null ? offsets.starts[index] + Math.min(clipMs, clips[index]?.ms ?? 0) : 0;

  return {
    manifest,
    status,
    active,
    elapsedMs,
    totalMs: offsets.total,
    plays,
    rate,
    error,
    play,
    pause,
    toggle,
    stop,
    playFrom,
    playOne,
    setRate,
  };
}
