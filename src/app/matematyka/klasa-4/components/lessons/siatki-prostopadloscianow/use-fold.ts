'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));
/** Stan trzymamy zaokrąglony do dwóch miejsc — jest wtedy wprost porównywalny w testach. */
const round2 = (value: number) => Math.round(value * 100) / 100;

/**
 * Jedna liczba 0–1, którą można albo ustawić od razu (przeciąganie suwaka),
 * albo dojechać do niej animacją (przycisk „Złóż"). Oba widżety lekcji
 * o siatkach sterują składaniem dokładnie w ten sposób, więc mechanizm stoi
 * raz, tutaj.
 *
 * Animacja jest zwykłym `requestAnimationFrame` nad stanem Reacta — nie
 * `MotionValue` — bo złożenie siatki liczy się w JS-ie z tej liczby
 * (`foldPieces`), a nie animuje atrybutem CSS.
 */
export function useFoldValue(initial: number, duration = 900) {
  const [value, setValue] = useState(initial);
  const valueRef = useRef(initial);
  const frameRef = useRef<number | null>(null);

  const write = useCallback((next: number) => {
    valueRef.current = next;
    setValue(next);
  }, []);

  const stop = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  const set = useCallback(
    (next: number) => {
      stop();
      write(round2(clamp01(next)));
    },
    [stop, write]
  );

  const nudge = useCallback(
    (delta: number) => {
      stop();
      write(round2(clamp01(valueRef.current + delta)));
    },
    [stop, write]
  );

  const animateTo = useCallback(
    (target: number, onDone?: () => void) => {
      stop();
      const from = valueRef.current;
      const started = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - started) / duration);
        // easeInOutQuad — karton odchyla się miękko, bez skoku na starcie
        const eased = progress < 0.5 ? 2 * progress * progress : 1 - (-2 * progress + 2) ** 2 / 2;
        write(round2(from + (target - from) * eased));

        if (progress < 1) {
          frameRef.current = requestAnimationFrame(tick);
          return;
        }
        frameRef.current = null;
        onDone?.();
      };

      frameRef.current = requestAnimationFrame(tick);
    },
    [duration, stop, write]
  );

  return { value, set, nudge, animateTo, stop };
}
