'use client';

import { useEffect, useRef, useState } from 'react';
import { Pause, Phone, Play } from 'lucide-react';
import { useLektor, type LektorManifest } from '../../../lib/lektor';

/**
 * Odtwarzacz wiadomości głosowej z **jawnym limitem odsłuchań** (L5). Bez
 * przewijania i bez „od zdania” — jak prawdziwa wiadomość na telefonie.
 * Odsłuchanie liczy się przy każdym starcie od początku; pauza i wznowienie
 * to wciąż to samo odsłuchanie. Po wyczerpaniu limitu nagranie się zamyka.
 */
export function Odtwarzacz({
  manifest,
  limit,
  color,
  title,
  onUsed,
}: {
  manifest: LektorManifest;
  limit: number;
  color: string;
  title: string;
  onUsed?: (n: number) => void;
}) {
  const lektor = useLektor(manifest);
  const [used, setUsed] = useState(0);
  const wasPlaying = useRef(false);
  const left = limit - used;
  const { status } = lektor;

  // Koniec odsłuchu (powrót do „idle” po graniu) zamyka nagranie przy wyczerpanym limicie.
  useEffect(() => {
    if (status === 'playing') wasPlaying.current = true;
    if (status === 'idle' && wasPlaying.current) {
      wasPlaying.current = false;
      onUsed?.(used);
    }
  }, [status, used, onUsed]);

  const start = () => {
    if (status === 'paused') {
      lektor.play();
      return;
    }
    if (left <= 0) return;
    setUsed((u) => u + 1);
    lektor.play();
  };

  const closed = left <= 0 && status === 'idle';

  return (
    <div className="flex items-center gap-3 border p-3" style={{ borderColor: color }}>
      <Phone className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground" aria-live="polite">
          {closed
            ? 'Wiadomość się zamknęła — zostały ci notatki.'
            : status === 'playing'
              ? 'Słuchasz…'
              : `Odsłuchania: ${used} z ${limit}`}
        </p>
      </div>
      <button
        type="button"
        onClick={status === 'playing' ? lektor.pause : start}
        disabled={closed}
        className="flex h-11 w-11 shrink-0 items-center justify-center text-white disabled:opacity-30"
        style={{ backgroundColor: color }}
        aria-label={status === 'playing' ? 'Pauza' : 'Odsłuchaj wiadomość'}
      >
        {status === 'playing' ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
      </button>
    </div>
  );
}
