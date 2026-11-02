'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Check, Eye, Play, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Przerwa 20-20-20 zrobiona naprawdę, a nie opisana.
 *
 * Blok kończy się dopiero wtedy, gdy dziecko przez dwadzieścia sekund
 * faktycznie nie patrzyło w ekran — dlatego licznik jest celowo wygaszony
 * (nie ma na co zerkać), a koniec zgłasza krótki dźwięk. `AudioContext`
 * powstaje w geście kliknięcia „Zaczynam”, bo przeglądarki blokują dźwięk
 * uruchamiany bez udziału użytkownika; gdy dźwięk jest niedostępny, zostaje
 * sam komunikat na ekranie.
 */

const BREAK_SECONDS = 20;

type Phase = 'idle' | 'running' | 'done';

interface EyeBreakTimerProps {
  color: string;
  onComplete?: () => void;
}

export function EyeBreakTimer({ color, onComplete }: EyeBreakTimerProps) {
  const [phase, setPhase] = useState<Phase>('idle');
  const [left, setLeft] = useState(BREAK_SECONDS);
  const audioRef = useRef<AudioContext | null>(null);

  useEffect(() => {
    return () => {
      void audioRef.current?.close();
    };
  }, []);

  useEffect(() => {
    if (phase !== 'running') return;
    const deadline = Date.now() + BREAK_SECONDS * 1000;
    const tick = window.setInterval(() => {
      const remaining = Math.max(0, Math.ceil((deadline - Date.now()) / 1000));
      setLeft(remaining);
      if (remaining === 0) {
        window.clearInterval(tick);
        setPhase('done');
        chime(audioRef.current);
        onComplete?.();
      }
    }, 200);
    return () => window.clearInterval(tick);
  }, [phase, onComplete]);

  const start = () => {
    // Kontekst dźwięku musi powstać w geście użytkownika, inaczej zostaje zawieszony.
    try {
      audioRef.current ??= new AudioContext();
      void audioRef.current.resume();
    } catch {
      audioRef.current = null;
    }
    setLeft(BREAK_SECONDS);
    setPhase('running');
  };

  const percent = Math.round(((BREAK_SECONDS - left) / BREAK_SECONDS) * 100);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-5 space-y-3 text-sm leading-relaxed sm:text-base">
        <p>
          Kiedy patrzysz w ekran, mrugasz nawet <strong>trzy razy rzadziej</strong> niż zwykle, a
          mięsień, który ustawia oko na bliską odległość, cały czas jest napięty. Stąd pieczenie i
          suchość oczu po dłuższej pracy — nie z samego „siedzenia przy komputerze”, tylko z tego,
          że oko przez godzinę nie zmienia odległości patrzenia.
        </p>
        <p>
          Lekarstwo jest krótkie i nazywa się <strong>zasadą 20-20-20</strong>: co{' '}
          <strong>20 minut</strong> pracy patrz przez <strong>20 sekund</strong> na coś oddalonego
          o co najmniej <strong>20 stóp</strong>, czyli jakieś <strong>6 metrów</strong>. Oko się
          rozluźnia, a ty prawie nie tracisz czasu.
        </p>
      </div>

      {phase === 'idle' && (
        <div
          className="border-t-2 p-5 text-center sm:p-6"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <Eye className="mx-auto mb-3 h-8 w-8" style={{ color }} aria-hidden />
          <p className="mx-auto mb-4 max-w-md text-sm leading-relaxed">
            Zrób ją teraz na próbę. Rozejrzyj się i wybierz coś naprawdę daleko: okno, drzwi na
            końcu korytarza, drzewo na podwórku. Po kliknięciu <strong>odwróć wzrok od ekranu</strong> —
            gdy miną 20 sekund, usłyszysz krótki sygnał.
          </p>
          <Button onClick={start} size="lg" style={{ backgroundColor: color }}>
            <Play className="mr-1 h-4 w-4" aria-hidden />
            Zaczynam przerwę
          </Button>
        </div>
      )}

      {phase === 'running' && (
        <div className="border-t-2 p-6 text-center sm:p-10" style={{ borderColor: color }}>
          <p className="text-2xl font-bold text-muted-foreground/60 sm:text-3xl">
            Patrz w dal, nie tutaj
          </p>
          <p className="mx-auto mt-2 max-w-sm text-sm text-muted-foreground/60">
            Sygnał odezwie się sam. Zerkanie na licznik nie liczy się jako przerwa.
          </p>

          <div className="mx-auto mt-6 h-1.5 max-w-sm overflow-hidden bg-muted">
            <motion.div
              className="h-full"
              style={{ backgroundColor: `${color}66` }}
              animate={{ width: `${percent}%` }}
              initial={false}
              transition={{ duration: 0.2, ease: 'linear' }}
            />
          </div>

          <p className="mt-3 font-mono text-sm tabular-nums text-muted-foreground/40" aria-live="off">
            {left} s
          </p>

          <button
            type="button"
            onClick={() => {
              setPhase('idle');
              setLeft(BREAK_SECONDS);
            }}
            className="mt-5 inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground/60 transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Przerwij i zacznij od nowa
          </button>
        </div>
      )}

      {phase === 'done' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-t-2 p-5 sm:p-6"
          style={{ borderColor: '#16a34a', backgroundColor: '#16a34a12' }}
        >
          <p className="mb-3 flex items-center gap-2 text-lg font-bold">
            <Check className="h-5 w-5 shrink-0" style={{ color: '#16a34a' }} aria-hidden />
            Tyle to trwało
          </p>
          <p className="mb-4 text-sm leading-relaxed">
            Dwadzieścia sekund na trzy razy w ciągu godziny to minuta. Tyle kosztuje cię to, żeby
            wieczorem oczy nie piekły. Ustaw sobie przypomnienie w telefonie albo połóż obok
            zegarek — na początku nikt nie pamięta o przerwach sam z siebie.
          </p>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Co jeszcze robi się w przerwie
          </p>
          <ul className="mt-2 space-y-1.5 text-sm leading-relaxed text-muted-foreground">
            <li>
              <strong className="text-foreground">Co 45 minut wstań</strong> na dłużej: przejdź się,
              rozprostuj plecy, napij się wody.
            </li>
            <li>
              <strong className="text-foreground">Poruszaj barkami i szyją</strong> — to one dostają
              najbardziej, gdy głowa jest wysunięta do przodu.
            </li>
            <li>
              <strong className="text-foreground">Nie zamieniaj przerwy na telefon.</strong> Ekran
              telefonu jest jeszcze bliżej oczu niż monitor, więc oko wcale nie odpoczywa.
            </li>
          </ul>
        </motion.div>
      )}
    </div>
  );
}

/** Krótki dwutonowy sygnał końca przerwy — cichy, żeby nie przestraszył. */
function chime(context: AudioContext | null) {
  if (!context) return;
  try {
    const now = context.currentTime;
    [
      { freq: 880, at: 0 },
      { freq: 1174.7, at: 0.18 },
    ].forEach(({ freq, at }) => {
      const oscillator = context.createOscillator();
      const gain = context.createGain();
      oscillator.type = 'sine';
      oscillator.frequency.value = freq;
      gain.gain.setValueAtTime(0.0001, now + at);
      gain.gain.exponentialRampToValueAtTime(0.07, now + at + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + at + 0.16);
      oscillator.connect(gain).connect(context.destination);
      oscillator.start(now + at);
      oscillator.stop(now + at + 0.2);
    });
  } catch {
    /* dźwięk jest dodatkiem — brak wsparcia nie może przerwać lekcji */
  }
}
