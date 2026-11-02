'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { HOME, run as runScript, type Block, type Run, type Senses, type Sprite } from './engine';

/**
 * Odtwarzacz programu — zielona flaga, czerwony znak stop i podświetlanie
 * wykonywanej instrukcji.
 *
 * Trzy rzeczy warte zapamiętania przy zmianach:
 *
 * - **Flaga ustawia duszka na start.** Prawdziwy Scratch tego nie robi (duszek
 *   zostaje tam, gdzie doszedł) i jest to klasyczne zaskoczenie początkującego.
 *   W pracowni bez tego reset po dwóch uruchomieniach duszek stałby przy
 *   krawędzi i kolejne „przesuń o 50 kroków” nic by nie robiło, więc resetujemy —
 *   a bench mówi wprost, że w Scratchu jest inaczej i po to jest „wróć na start”.
 * - **Stop nie cofa niczego.** Zatrzymuje program w tej klatce, w której jest —
 *   dokładnie jak czerwony znak w Scratchu.
 * - `AudioContext` powstaje **w geście kliknięcia flagi**, bo poza gestem
 *   przeglądarka go zawiesza; brak dźwięku nie może przerwać lekcji, więc
 *   wszystko idzie w `try/catch` i zostaje sama animacja fal przy duszku.
 */

export interface Program {
  sprite: Sprite;
  sound: boolean;
  /** Zakres podświetlonych instrukcji albo `null`, gdy program nie idzie. */
  active: { from: number; to: number } | null;
  running: boolean;
  /** Flaga naciśnięta, ale nie było czego uruchomić — stos bez kapelusza. */
  idle: boolean;
  /** Ostatni przebieg: skończony albo zatrzymany. Z niego czytają werdykty. */
  last: Run | null;
  finished: boolean;
  attempts: number;
  start: () => void;
  stop: () => void;
  clear: () => void;
}

function beep(context: AudioContext) {
  try {
    const osc = context.createOscillator();
    const gain = context.createGain();
    const now = context.currentTime;
    osc.type = 'sine';
    osc.frequency.setValueAtTime(620, now);
    osc.frequency.exponentialRampToValueAtTime(980, now + 0.14);
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.12, now + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.3);
    osc.connect(gain);
    gain.connect(context.destination);
    osc.start(now);
    osc.stop(now + 0.32);
  } catch {
    /* Cisza nie przerywa lekcji. */
  }
}

/**
 * `held` — założenia o świecie na cały przebieg: trzymane strzałki i miejsce mety; podawaj **zapamiętany** obiekt, bo wchodzi do zależności `start`.
 *
 * `carry` — flaga **niczego nie ustawia na start**: kolejny przebieg rusza stamtąd, gdzie duszek stoi
 * (koniec poprzedniego albo miejsce, w którym go zatrzymał stop). To jest prawdziwy Scratch i cała
 * lekcja 29; bez `carry` flaga odstawia duszka na `home`. `clear()` stawia go z powrotem na starcie.
 */
export function useProgram(
  stack: Block[],
  home: Sprite = HOME,
  held?: Senses,
  carry = false
): Program {
  const [current, setCurrent] = useState<Run | null>(null);
  const [at, setAt] = useState(0);
  const [finished, setFinished] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const audio = useRef<AudioContext | null>(null);

  const started = Boolean(current?.started);
  const running = started && !finished;
  const frame = current?.started ? current.frames[Math.min(at, current.frames.length - 1)] : null;

  useEffect(() => {
    if (!running || !current) return;
    const hold = current.frames[at]?.hold ?? 0;
    const timer = window.setTimeout(() => {
      if (at >= current.frames.length - 1) setFinished(true);
      else setAt(at + 1);
    }, hold);
    return () => window.clearTimeout(timer);
  }, [running, current, at]);

  /* Dźwięk pada raz na wejściu w klatkę, która go niesie. */
  useEffect(() => {
    if (!running || !frame?.sound || !audio.current) return;
    beep(audio.current);
  }, [running, frame]);

  const start = useCallback(() => {
    if (!audio.current) {
      try {
        audio.current = new AudioContext();
      } catch {
        audio.current = null;
      }
    }
    void audio.current?.resume().catch(() => undefined);
    setCurrent(runScript(stack, carry && frame ? frame.sprite : home, held));
    setAt(0);
    setFinished(false);
    setAttempts((value) => value + 1);
  }, [stack, home, held, carry, frame]);

  const stop = useCallback(() => setFinished(true), []);

  /**
   * Pełne wyzerowanie odtwarzacza — razem z licznikiem uruchomień. `FixRun`
   * czyta z niego, czy dziecko widziało już program w działaniu, więc bez
   * zerowania reguła „najpierw uruchom, potem poprawiaj" działałaby wyłącznie w
   * pierwszym projekcie, a w drugim i trzecim klocki byłyby odblokowane od razu.
   */
  const clear = useCallback(() => {
    setCurrent(null);
    setAt(0);
    setFinished(false);
    setAttempts(0);
  }, []);

  return {
    sprite: frame?.sprite ?? home,
    sound: Boolean(running && frame?.sound),
    active: running && frame ? { from: frame.from, to: frame.to } : null,
    running,
    idle: current != null && !current.started,
    last: current,
    finished: finished && started,
    attempts,
    start,
    stop,
    clear,
  };
}
