'use client';

import { useEffect, useRef, useState } from 'react';

/**
 * Blok 2 (ćwiczenie): **dlaczego godzina ma 60 minut?** Dziecko liczy
 * kciukiem po paliczkach czterech palców jednej dłoni (3 × 4 = 12), stukając
 * każdy paliczek. Potem każdy palec drugiej dłoni, który zegnie, to jeden
 * tuzin — paliczki przelicza się same. 5 × 12 = 60. To **hipoteza** badaczy
 * (nie wiemy na pewno, jak liczyli Sumerowie); pewne jest, że liczyli
 * sześćdziesiątkami — stąd 60 minut i 60 sekund (baza F-III.2-11).
 */

const FINGERS = 4;
const PHALANGES = 3;
const DOZEN = FINGERS * PHALANGES;
// paliczki: palec (wskazujący → mały), od czubka do nasady
const FX = [40, 66, 92, 116];
const FTOP = [18, 8, 14, 30];
const SEG = 26;

export function PalceSzescdziesiat({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [tapped, setTapped] = useState<number[]>([]);
  const [bent, setBent] = useState(0);
  const [flash, setFlash] = useState(-1);
  const completed = useRef(false);

  const firstDozen = tapped.length === DOZEN;
  const total = firstDozen ? DOZEN * Math.max(1, bent) : tapped.length;
  const finished = bent === 5 && flash < 0;

  useEffect(() => {
    if (flash < 0) return;
    if (flash >= DOZEN) {
      const t = window.setTimeout(() => setFlash(-1), 200);
      return () => window.clearTimeout(t);
    }
    const t = window.setTimeout(() => setFlash((f) => f + 1), 70);
    return () => window.clearTimeout(t);
  }, [flash]);

  useEffect(() => {
    if (finished && !completed.current) {
      completed.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const tapSeg = (i: number) => {
    if (firstDozen || tapped.includes(i)) return;
    const next = [...tapped, i];
    setTapped(next);
    if (next.length === DOZEN) setBent(1);
  };

  const bendNext = () => {
    if (!firstDozen || bent >= 5 || flash >= 0) return;
    setBent((b) => b + 1);
    setFlash(0);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Policz tak, jak — według jednej z hipotez — mogli liczyć Sumerowie. Na lewej dłoni{' '}
        <strong>stukaj kciukiem kolejne paliczki</strong> czterech palców (bez kciuka). Ile ich jest?
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* lewa dłoń */}
        <figure className="space-y-1">
          <svg viewBox="0 0 160 190" className="mx-auto block h-auto w-full max-w-[240px]" role="group" aria-label="Lewa dłoń z paliczkami">
            <path d="M28 100 Q 24 170 70 182 Q 126 186 132 120 L 132 100 Z" fill="#f1c9a5" stroke="#c08a5c" />
            <path d="M28 120 Q 6 104 10 82 Q 16 72 26 84 L 40 104" fill="#f1c9a5" stroke="#c08a5c" />
            {FX.map((x, f) =>
              Array.from({ length: PHALANGES }, (_, p) => {
                const i = f * PHALANGES + p;
                const on = tapped.includes(i);
                const lit = flash >= 0 && flash > i;
                return (
                  <g key={i}>
                    <rect
                      x={x - 11}
                      y={FTOP[f] + p * SEG}
                      width="22"
                      height={SEG - 2}
                      rx="9"
                      fill={lit ? '#fde047' : on ? color : '#f1c9a5'}
                      stroke="#c08a5c"
                      onClick={() => tapSeg(i)}
                      className={firstDozen ? '' : 'cursor-pointer'}
                      role="button"
                      aria-label={`Paliczek ${p + 1} palca ${f + 1}${on ? ' — policzony' : ''}`}
                    />
                    {on && (
                      <text x={x} y={FTOP[f] + p * SEG + 16} textAnchor="middle" fontSize="11" fontWeight="700" fill="#fff" pointerEvents="none">
                        {tapped.indexOf(i) + 1}
                      </text>
                    )}
                  </g>
                );
              })
            )}
          </svg>
          <figcaption className="text-center text-xs text-muted-foreground">lewa dłoń — paliczki</figcaption>
        </figure>

        {/* prawa dłoń: tuziny */}
        <figure className="space-y-1">
          <svg viewBox="0 0 160 190" className={`mx-auto block h-auto w-full max-w-[240px] ${firstDozen && bent < 5 ? 'cursor-pointer' : ''}`} onClick={bendNext} role="button" aria-label="Prawa dłoń — stuknij, żeby zgiąć kolejny palec (kolejny tuzin)" aria-disabled={!firstDozen || bent >= 5}>
            <path d="M28 100 Q 24 170 70 182 Q 126 186 132 120 L 132 100 Z" fill="#f1c9a5" stroke="#c08a5c" />
            {[0, 1, 2, 3, 4].map((k) => {
              const isBent = k < bent;
              const x = [16, 44, 70, 96, 120][k];
              const top = [80, 16, 6, 12, 28][k];
              return <rect key={k} x={x - 10} y={isBent ? 92 : top} width="20" height={isBent ? 22 : 100 - top} rx="9" fill={isBent ? color : '#f1c9a5'} stroke="#c08a5c" transform={k === 0 ? 'rotate(-28 16 100)' : undefined} />;
            })}
          </svg>
          <figcaption className="text-center text-xs text-muted-foreground">prawa dłoń — tuziny ({bent} z 5)</figcaption>
        </figure>
      </div>

      <p className="text-center font-mono text-3xl font-bold tabular-nums" style={{ color }} aria-live="polite">
        {total}
      </p>

      {firstDozen && bent < 5 && (
        <p className="text-sm leading-relaxed">
          Dwanaście paliczków — jeden <strong>tuzin</strong>. Na prawej dłoni zgiął się pierwszy palec. <strong>Stuknij prawą dłoń</strong>, żeby
          policzyć kolejny tuzin.
        </p>
      )}
      {finished && (
        <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: color }}>
          <p className="text-sm leading-relaxed">
            Pięć palców po dwanaście: <strong>5 × 12 = 60</strong>. Sumerowie liczyli sześćdziesiątkami — i dlatego do dziś
            godzina ma 60 minut, a minuta 60 sekund. Dwunastka też została: 12 godzin na tarczy zegara i 12 miesięcy w roku.
          </p>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Uwaga: to, że liczyli właśnie na paliczkach, jest <strong>hipotezą</strong> badaczy — ładną i prawdopodobną, ale
            niesprawdzoną. Pewne jest tylko to, że liczyli sześćdziesiątkami.
          </p>
        </div>
      )}
    </div>
  );
}
