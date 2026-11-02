'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Choragiewka, Podworko } from './podworko';
import { STRONA_LABEL, karta, komentarzMiejsca, miejsce, type Strona } from './argumenty';

/**
 * L6, blok 4 „Druga strona” `[1.6]` — **gest nowy dla kursu: staje na
 * planie podwórka** w dowolnym miejscu między ogródkiem a boiskiem (także na
 * granicy — kompromis), po przeczytaniu argumentów obu stron. Każde miejsce
 * jest przyjęte, jeśli dziecko przypnie przy sobie jeden argument (z dowolnej
 * strony), który je tam postawił. Przesunięcie od chorągiewki — nazwane bez
 * oceny.
 */

interface Props {
  color: string;
  flaga: { strona: Strona; x: number };
  przypiete: Record<Strona, string[]>;
  mojeZdanie: string | null;
  onComplete: () => void;
}

export function DrugaStrona({ color, flaga, przypiete, mojeZdanie, onComplete }: Props) {
  const [x, setX] = useState<number | null>(null);
  const [arg, setArg] = useState<string | null>(null);
  const [gotowe, setGotowe] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const drag = useRef(false);

  useEffect(() => {
    if (gotowe) onComplete();
  }, [gotowe, onComplete]);

  const set = (clientX: number) => {
    const r = ref.current?.getBoundingClientRect();
    if (!r) return;
    setX(Math.round(Math.max(2, Math.min(98, ((clientX - r.left) / r.width) * 100))));
    setGotowe(false);
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture?.(e.pointerId);
    drag.current = true;
    set(e.clientX);
  };

  const wszystkie = [
    ...przypiete.ogrodek.map((id) => ({ id, text: karta(id).text, s: 'ogrodek' as Strona })),
    ...przypiete.boisko.map((id) => ({ id, text: karta(id).text, s: 'boisko' as Strona })),
    ...(mojeZdanie ? [{ id: 'moje', text: mojeZdanie, s: flaga.strona }] : []),
  ];

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Przeczytaj powody obu stron. Potem stań na planie tam, gdzie teraz jesteś — przy ogródku, przy boisku albo na granicy. Każde
        miejsce jest dobre, jeśli wiesz, co cię tam postawiło.
      </p>
      <div
        ref={ref}
        onPointerDown={down}
        onPointerMove={(e) => drag.current && set(e.clientX)}
        onPointerUp={() => (drag.current = false)}
        onPointerCancel={() => (drag.current = false)}
        className="relative mt-3 cursor-pointer touch-none"
        role="slider"
        aria-label="Twoje miejsce na podwórku: od ogródka do boiska"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={x ?? 50}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setX((v) => Math.max(2, (v ?? 50) - 5));
          if (e.key === 'ArrowRight') setX((v) => Math.min(98, (v ?? 50) + 5));
        }}
      >
        <Podworko>
          <Choragiewka x={flaga.x * 3} y={118} color="#a8a29e" label="chorągiewka" />
          {x !== null && (
            <g transform={`translate(${x * 3} 100)`}>
              <circle cx="0" cy="-26" r="7" fill={color} />
              <path d="M -9 -16 L 9 -16 L 6 6 L -6 6 Z" fill={color} />
              <text x="0" y="-12" textAnchor="middle" fontSize="7" fill="#fff" fontWeight="700">
                ja
              </text>
            </g>
          )}
        </Podworko>
      </div>
      <div className="mt-1 flex justify-between text-xs text-muted-foreground">
        <span>ogródek</span>
        <span>granica</span>
        <span>boisko</span>
      </div>

      <p className="mt-4 text-sm font-medium">Który powód cię tam postawił? Przypnij go przy sobie.</p>
      <ul className="mt-2 grid gap-1.5 sm:grid-cols-2">
        {wszystkie.map((a) => (
          <li key={a.id}>
            <button
              type="button"
              onClick={() => {
                setArg(a.id);
                setGotowe(false);
              }}
              aria-pressed={arg === a.id}
              className="w-full border px-2 py-1.5 text-left text-sm leading-snug"
              style={{ borderColor: arg === a.id ? color : undefined, backgroundColor: arg === a.id ? `color-mix(in srgb, ${color} 10%, transparent)` : undefined }}
            >
              <span className="text-xs text-muted-foreground">{a.id === 'moje' ? 'twoje zdanie' : STRONA_LABEL[a.s]} · </span>
              {a.text}
            </button>
          </li>
        ))}
      </ul>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={() => setGotowe(true)}
          disabled={x === null || !arg}
          className="border-2 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color, borderColor: color }}
        >
          Tu stoję
        </button>
        <span className="text-sm text-muted-foreground">{x === null ? 'Stuknij albo przeciągnij po planie, gdzie stajesz.' : !arg ? 'Wybierz powód.' : ''}</span>
      </div>
      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {gotowe && x !== null && (
          <>
            {komentarzMiejsca(x, flaga.strona)} {miejsce(x) !== 'granica' && miejsce(x) !== flaga.strona && `(Chorągiewka stała: ${STRONA_LABEL[flaga.strona]}.)`}
          </>
        )}
      </p>
    </div>
  );
}
