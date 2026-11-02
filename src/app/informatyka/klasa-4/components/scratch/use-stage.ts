'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import type { Sprite } from './engine';
import { runStage, type ActorDef, type StageRun, type Trigger } from './stage-engine';

/**
 * Odtwarzacz sceny wielu duszków — odpowiednik `use-program.ts` dla
 * `stage-engine.ts`.
 *
 * Różnica jest jedna, ale zasadnicza: tam klatki szły po indeksach, tutaj idą po
 * **osi czasu**. Klatka trzyma się `hold` milisekund, a `hold` bierze się z
 * odstępu do następnej klatki — dzięki temu duszek, który czeka 2 s, i duszek,
 * który czeka 0,5 s, są na jednej scenie policzone tym samym zegarem.
 *
 * `fire(trigger)` zastępuje `start()`: scenę uruchamia **zdarzenie**, a nie
 * „program”. Zielona flaga, klawisz i kliknięcie duszka to trzy różne
 * wyzwalacze i to jest cała treść pierwszego bloku lekcji.
 */

export interface StagePlayer {
  sprites: Record<string, Sprite>;
  running: boolean;
  finished: boolean;
  sound: boolean;
  /** Czas bieżącej klatki w milisekundach — pod oś czasu. */
  now: number;
  /** Ostatni przebieg: z niego czytają werdykty. */
  last: StageRun | null;
  /** Wyzwalacz, który nikogo nie obudził — żaden duszek go nie słucha. */
  idle: boolean;
  fire: (trigger: Trigger) => void;
  stop: () => void;
  clear: () => void;
}

export function useStage(actors: ActorDef[]): StagePlayer {
  const [run, setRun] = useState<StageRun | null>(null);
  const [at, setAt] = useState(0);
  const [finished, setFinished] = useState(false);
  const timer = useRef<number | null>(null);

  const home = useMemo(() => {
    const map: Record<string, Sprite> = {};
    for (const actor of actors) map[actor.id] = { ...actor.home };
    return map;
  }, [actors]);

  const started = Boolean(run?.started);
  const running = started && !finished;
  const frame = run?.started ? run.frames[Math.min(at, run.frames.length - 1)] : null;

  /*
   * Odliczanie stoi na łańcuszku `setTimeout`, a nie na efekcie zależnym od
   * `at`: klatki bywają odległe o kilka sekund i jeden zegar na klatkę jest
   * prostszy do zatrzymania niż efekt, który przy każdym renderze trzeba by
   * zakładać od nowa.
   */
  const step = useCallback((source: StageRun, index: number) => {
    if (timer.current) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => {
      if (index + 1 >= source.frames.length) {
        setFinished(true);
        return;
      }
      setAt(index + 1);
      step(source, index + 1);
    }, source.frames[index]?.hold ?? 0);
  }, []);

  const fire = useCallback(
    (trigger: Trigger) => {
      const next = runStage(actors, trigger);
      setRun(next);
      setAt(0);
      setFinished(!next.started);
      if (next.started) step(next, 0);
    },
    [actors, step]
  );

  const stop = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setFinished(true);
  }, []);

  const clear = useCallback(() => {
    if (timer.current) window.clearTimeout(timer.current);
    setRun(null);
    setAt(0);
    setFinished(false);
  }, []);

  return {
    sprites: frame?.sprites ?? home,
    running,
    finished: finished && started,
    sound: Boolean(running && frame?.sound),
    now: frame?.t ?? 0,
    last: run,
    idle: run != null && !run.started,
    fire,
    stop,
    clear,
  };
}
