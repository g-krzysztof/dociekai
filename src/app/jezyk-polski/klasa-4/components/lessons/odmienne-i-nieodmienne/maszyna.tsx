'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { CalendarClock, Hash, User } from 'lucide-react';
import { DZWIGNIE, podpis, type Dzwignia, type Dzwignie } from './odmiana';

/**
 * Wspólne części odmieniarki L13: dźwignia (przeciąganie w dół z oporem,
 * próg 70 % = pociągnięcie, sprężyna wraca; stuknięcie też pociąga) i panel
 * trzech dźwigni z położeniem pod każdą.
 */

const IKONA = { ile: Hash, kto: User, kiedy: CalendarClock } as const;
const PYTANIE = { ile: 'ile?', kto: 'kto?', kiedy: 'kiedy?' } as const;
const SKOK = 64;
export const PROG = 0.7;

export function DzwigniaMaszyny({
  k,
  d,
  color,
  disabled,
  pociagnieta,
  onPull,
}: {
  k: Dzwignia;
  d: Dzwignie;
  color: string;
  disabled?: boolean;
  pociagnieta?: boolean;
  onPull: (k: Dzwignia) => void;
}) {
  const [y, setY] = useState(0);
  const [trzyma, setTrzyma] = useState(false);
  const start = useRef<{ y: number; id: number; moved: boolean; fired: boolean } | null>(null);
  const Ikona = IKONA[k];

  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (disabled || e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* działa i bez przechwycenia */
    }
    start.current = { y: e.clientY, id: e.pointerId, moved: false, fired: false };
    setTrzyma(true);
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    const s = start.current;
    if (!s || s.id !== e.pointerId) return;
    const dy = Math.max(0, Math.min(SKOK, e.clientY - s.y));
    if (dy > 4) s.moved = true;
    // Opór: im niżej, tym ciężej.
    setY(Math.round(dy * (1 - dy / (SKOK * 3))));
    if (!s.fired && dy >= SKOK * PROG) {
      s.fired = true;
      onPull(k);
    }
  };
  const up = () => {
    const s = start.current;
    start.current = null;
    setTrzyma(false);
    setY(0);
    if (s && !s.moved && !disabled) onPull(k);
  };
  const key = (e: KeyboardEvent<HTMLButtonElement>) => {
    if (disabled) return;
    if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') {
      e.preventDefault();
      onPull(k);
    }
  };

  return (
    <div className="flex flex-col items-center gap-1">
      <span className="flex items-center gap-1 text-xs font-semibold" style={{ color }}>
        <Ikona className="h-3.5 w-3.5" aria-hidden />
        {PYTANIE[k]}
      </span>
      <div className="relative h-[104px] w-10 border bg-zinc-100 dark:bg-zinc-800" aria-hidden={false}>
        <span aria-hidden className="absolute left-1/2 top-2 bottom-2 w-1 -translate-x-1/2 bg-zinc-300 dark:bg-zinc-600" />
        <button
          type="button"
          aria-label={`Pociągnij dźwignię ${PYTANIE[k]}`}
          disabled={disabled}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          onKeyDown={key}
          className="absolute left-1/2 top-1 h-9 w-9 touch-none rounded-full border-2 bg-white shadow disabled:opacity-40 dark:bg-zinc-900 cursor-grab"
          style={{
            borderColor: color,
            transform: `translate(-50%, ${y}px)`,
            transition: trzyma ? 'none' : 'transform 260ms cubic-bezier(.3,1.6,.5,1)',
            background: pociagnieta ? `${color}33` : undefined,
          }}
          data-testid={`dzwignia-${k}`}
        />
      </div>
      <span className="min-h-[1.25rem] font-mono text-xs tabular-nums">{podpis(d, k)}</span>
    </div>
  );
}

export function PanelDzwigni({
  d,
  color,
  disabled,
  pociagniete = [],
  onPull,
}: {
  d: Dzwignie;
  color: string;
  disabled?: boolean;
  pociagniete?: readonly Dzwignia[];
  onPull: (k: Dzwignia) => void;
}) {
  return (
    <div className="flex justify-center gap-4 sm:gap-6">
      {DZWIGNIE.map((k) => (
        <DzwigniaMaszyny key={k} k={k} d={d} color={color} disabled={disabled} pociagnieta={pociagniete.includes(k)} onPull={onPull} />
      ))}
    </div>
  );
}

/** Wałki maszyny: okienko z wyrazem, który właśnie wyszedł. `klucz` zmienia się przy każdym przejściu, żeby wałki „mignęły”. */
export function Walki({ tekst, klucz, color, pusty }: { tekst: string; klucz: string | number; color: string; pusty?: string }) {
  return (
    <div className="relative flex h-16 items-center justify-center overflow-hidden border-2 bg-[#fbf9f3] dark:bg-zinc-800" style={{ borderColor: color }}>
      <span aria-hidden className="absolute inset-x-0 top-0 h-2 bg-[repeating-linear-gradient(90deg,#a8a29e_0_3px,transparent_3px_7px)] opacity-60" />
      <span aria-hidden className="absolute inset-x-0 bottom-0 h-2 bg-[repeating-linear-gradient(90deg,#a8a29e_0_3px,transparent_3px_7px)] opacity-60" />
      {tekst ? (
        <span key={klucz} className="font-serif text-2xl font-semibold animate-in slide-in-from-top-4 fade-in duration-300" data-testid="walki">
          {tekst}
        </span>
      ) : (
        <span className="text-sm text-muted-foreground">{pusty}</span>
      )}
    </div>
  );
}
