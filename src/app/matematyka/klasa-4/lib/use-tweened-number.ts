'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { animate, useReducedMotion } from 'framer-motion';

/** Wartość albo funkcja licząca ją z bieżącej — jak argument `setState`. */
type NumberUpdater = number | ((current: number) => number);

const resolveUpdater = (next: NumberUpdater, current: number): number =>
  typeof next === 'function' ? next(current) : next;

export interface TweenedNumber {
  /** Bieżąca wartość — w trakcie tweenu tyka co klatkę. */
  value: number;
  /**
   * Ustaw natychmiast, bez animacji. Do ciągłego przeciągania (`pointermove`
   * sam daje płynność) i do resetu rundy, gdzie skok jest zamierzony.
   */
  set: (next: NumberUpdater) => void;
  /**
   * Przejdź do wartości krótkim tweenem (`animate()` z framer-motion). Do
   * przycisków krokowych (+5°, ±10 cm, ×10) i strzałek klawiatury — klik daje
   * płynny ruch zamiast cięcia, także gdy autoplay rolki przeklikuje widżet.
   * `onArrive` dostaje dokładną wartość końcową (równą `target`).
   */
  tweenTo: (target: NumberUpdater, onArrive?: (final: number) => void) => void;
  /** Przerwij trwający tween w miejscu (np. na `pointerdown`, gdy dziecko łapie uchwyt). */
  stop: () => void;
}

interface Options {
  /** Długość tweenu w sekundach (domyślnie 0.36). */
  duration?: number;
}

/**
 * Stan liczbowy z dwoma trybami zapisu: skokowym (`set`) i animowanym
 * (`tweenTo`). Wzorowany na `clock-jumps.tsx` — `ref` trzyma bieżącą wartość
 * (start kolejnego tweenu i odczyt dla funkcji-updatera), a `onUpdate`
 * synchronizuje stan Reacta. Ostatnia klatka tweenu to dokładnie `target`,
 * więc stan zostaje deterministyczny i asertowalny; `prefers-reduced-motion`
 * degraduje `tweenTo` do skoku. Jedna implementacja dla wszystkich widżetów
 * krokowych kursu („ta funkcja stoi raz, dla wszystkich”).
 */
export function useTweenedNumber(
  initial: number | (() => number),
  { duration = 0.36 }: Options = {},
): TweenedNumber {
  const [value, setValue] = useState(initial);
  const valueRef = useRef(value);
  const controlsRef = useRef<{ stop: () => void } | null>(null);
  const reduced = useReducedMotion();

  const stop = useCallback(() => {
    controlsRef.current?.stop();
    controlsRef.current = null;
  }, []);

  // Zatrzymaj wiszący tween przy odmontowaniu (zmiana rundy potrafi odmontować widżet).
  useEffect(() => stop, [stop]);

  const set = useCallback(
    (next: NumberUpdater) => {
      stop();
      const resolved = resolveUpdater(next, valueRef.current);
      valueRef.current = resolved;
      setValue(resolved);
    },
    [stop],
  );

  const tweenTo = useCallback(
    (target: NumberUpdater, onArrive?: (final: number) => void) => {
      stop();
      const from = valueRef.current;
      const to = resolveUpdater(target, from);
      if (reduced || to === from) {
        valueRef.current = to;
        setValue(to);
        onArrive?.(to);
        return;
      }
      controlsRef.current = animate(from, to, {
        duration,
        // Równomierne easeInOut (jak `clock-jumps.tsx`) — dla krótkiego skoku o
        // kilka stopni/cm czyta się jak płynny przejazd, nie snap + dociągnięcie.
        ease: 'easeInOut',
        onUpdate: (latest) => {
          valueRef.current = latest;
          setValue(latest);
        },
        onComplete: () => {
          controlsRef.current = null;
          valueRef.current = to;
          setValue(to);
          onArrive?.(to);
        },
      });
    },
    [duration, reduced, stop],
  );

  return { value, set, tweenTo, stop };
}
