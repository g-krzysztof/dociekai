'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Twarz } from '../../twarz/twarz';
import { Choragiewka, Podworko } from './podworko';
import { STRONA_LABEL, type Strona } from './argumenty';

/**
 * L6, blok 1 „Zebranie na podwórku” — **gest nowy dla kursu: wbija swoją
 * chorągiewkę w plan podwórka.** Połowa na ogródek (chcą pani Halina i
 * Zuzia), połowa na boisko (Tymek i Ola). Chorągiewka wbita bez powodu się
 * chwieje, a pan Bogdan pyta „A dlaczego?” — bez „bo” nie stoi.
 */

export interface Flaga {
  strona: Strona;
  /** Miejsce na osi 0–100. */
  x: number;
}

interface Props {
  color: string;
  flaga: Flaga | null;
  onFlaga: (f: Flaga) => void;
}

export function Zebranie({ color, flaga, onFlaga }: Props) {
  const wrap = useRef<HTMLDivElement>(null);
  const [ghost, setGhost] = useState<{ x: number; y: number } | null>(null);
  const dragging = useRef(false);
  const [pyta, setPyta] = useState(false);

  useEffect(() => {
    if (!flaga) return;
    const t = window.setTimeout(() => setPyta(true), 700);
    return () => window.clearTimeout(t);
  }, [flaga]);

  const place = (clientX: number, clientY: number) => {
    const svg = wrap.current?.querySelector('svg');
    if (!svg) return;
    const r = svg.getBoundingClientRect();
    if (clientX < r.left || clientX > r.right || clientY < r.top || clientY > r.bottom) return;
    const x = Math.round(((clientX - r.left) / r.width) * 100);
    if (x > 47 && x < 53) return; // na samej granicy chorągiewki nie wbijesz — wybierz stronę
    onFlaga({ strona: x < 50 ? 'ogrodek' : 'boisko', x });
    setPyta(false);
  };

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    dragging.current = true;
    setGhost({ x: e.clientX, y: e.clientY });
  };
  const move = (e: PointerEvent<HTMLButtonElement>) => dragging.current && setGhost({ x: e.clientX, y: e.clientY });
  const up = (e: PointerEvent<HTMLButtonElement>) => {
    dragging.current = false;
    setGhost(null);
    place(e.clientX, e.clientY);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Na podwórku jest pusty plac. Pani Halina i Zuzia chcą tam <strong>ogródek</strong>, Tymek i Ola — <strong>boisko</strong>.
        Pan Bogdan prowadzi zebranie. Weź swoją chorągiewkę i wbij ją po tej stronie, którą wybierasz.
      </p>
      <div className="mt-3 grid items-start gap-3 sm:grid-cols-[1fr_150px]">
        <div ref={wrap} className="relative" role="img" aria-label="Plan podwórka: lewa połowa ogródek, prawa boisko">
          <Podworko>
            {flaga && <Choragiewka x={flaga.x * 3} y={118} color={color} chwieje={pyta} label="ja" />}
          </Podworko>
          <div className="mt-1 flex justify-between text-xs text-muted-foreground">
            <span>ogródek</span>
            <span>boisko</span>
          </div>
        </div>
        <div className="flex flex-row items-center gap-3 sm:flex-col">
          <button
            type="button"
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={() => {
              dragging.current = false;
              setGhost(null);
            }}
            className="cursor-grab touch-none border-2 border-dashed px-3 py-2"
            style={{ borderColor: color }}
            aria-label="Twoja chorągiewka — przeciągnij na plan podwórka"
          >
            <svg width="30" height="44" viewBox="-4 -42 30 46" aria-hidden className="pointer-events-none">
              <line x1="0" y1="0" x2="0" y2="-38" stroke="#5b4a2e" strokeWidth="2.5" />
              <path d="M 0 -38 L 22 -31 L 0 -24 Z" fill={color} />
            </svg>
          </button>
          <div className="flex items-center gap-2">
            <Twarz kto="bogdan" mina={pyta ? 'zdziwienie' : 'spokoj'} size={64} label="pan Bogdan" />
            <p className="text-sm italic" aria-live="polite">
              {pyta && flaga ? `${STRONA_LABEL[flaga.strona][0].toUpperCase()}${STRONA_LABEL[flaga.strona].slice(1)}? A dlaczego?` : 'Pan Bogdan'}
            </p>
          </div>
        </div>
      </div>
      <p className="mt-3 min-h-[2.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {pyta && flaga && 'Chorągiewka się chwieje. Zdanie bez „bo” to tylko upór — zaraz znajdziesz dla niej powód.'}
      </p>
      {ghost && (
        <div className="pointer-events-none fixed z-[100]" style={{ left: ghost.x - 4, top: ghost.y - 40 }}>
          <svg width="30" height="44" viewBox="-4 -42 30 46" aria-hidden>
            <line x1="0" y1="0" x2="0" y2="-38" stroke="#5b4a2e" strokeWidth="2.5" />
            <path d="M 0 -38 L 22 -31 L 0 -24 Z" fill={color} />
          </svg>
        </div>
      )}
    </div>
  );
}
