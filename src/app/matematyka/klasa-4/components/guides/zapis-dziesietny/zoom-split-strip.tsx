'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Search, Scissors, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { pieceFill, pieceStroke } from '../../../lib/fraction';
import { round } from '../../../lib/lines';
import { DECIMAL_PLACES } from '../../../lib/decimal';
import { MiniFraction } from '../../mini-fraction';

const TRACK_W = 320;
const ROW_H = 32;
const STROKE = 2;
const INSET = STROKE / 2;
const SEG_GAP = 3;
const PARTS = 10;
const SEG_W = round((TRACK_W - STROKE - SEG_GAP * (PARTS - 1)) / PARTS);
const LENS_H = 26;

function segX(index: number): number {
  return round(INSET + index * (SEG_W + SEG_GAP));
}

/** Trzy poziomy zbliżenia: całość → dziesiąte → setne → tysięczne. */
const LEVELS = [
  { closed: '1 całość', zoomedFrom: null },
  { closed: 'Jedna dziesiąta pod lupą', zoomedFrom: 0 },
  { closed: 'Jedna setna pod lupą', zoomedFrom: 1 },
] as const;

const LAST_STEP = LEVELS.length * 2 - 1;

interface ZoomSplitStripProps {
  color: string;
}

/**
 * Lupa na pasku: dziecko dzieli całość na 10, wybiera JEDEN kawałek, a ten
 * kawałek rozciąga się na całą szerokość jako nowy pasek — i znów da się go
 * podzielić na 10. Trzy takie zbliżenia to dokładnie trzy pierwsze miejsca po
 * przecinku, więc „setna” nie jest kolejną nazwą do zapamiętania, tylko
 * widocznym skutkiem powtórzenia tego samego ruchu.
 *
 * Odróżnia się od `SplitFoldBoard` (dzieli WSZYSTKIE odcinki naraz, zachowując
 * wartość) i od `FractionBar` (jeden pasek, zmienny mianownik): tu każdy kolejny
 * pasek to powiększenie jednego kawałka z paska wyżej, a nie ta sama całość.
 */
export function ZoomSplitStrip({ color }: ZoomSplitStripProps) {
  const [step, setStep] = useState(0);
  const [picked, setPicked] = useState<number[]>([]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const visibleRows = Math.min(LEVELS.length, Math.floor(step / 2) + 1);
  const isDivided = (row: number) => step >= row * 2 + 1;
  const deepest = visibleRows - 1;
  const finished = step === LAST_STEP;

  const divide = () => setStep((prev) => prev + 1);

  const pick = (row: number, index: number) => {
    setPicked((prev) => {
      const next = [...prev];
      next[row] = index;
      return next;
    });
    setStep((prev) => prev + 1);
  };

  const undo = () => {
    const target = step - 1;
    if (target < 0) return;
    // Cofnięcie wyboru kawałka musi też zabrać sam wybór — inaczej pasek niżej
    // zniknąłby, ale zaznaczenie zostałoby na kawałku wyżej.
    if (step % 2 === 0 && step > 0) setPicked((prev) => prev.slice(0, step / 2 - 1));
    setStep(target);
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="space-y-1">
        {LEVELS.slice(0, visibleRows).map((level, row) => {
          const divided = isDivided(row);
          const chosen = picked[row];
          const place = DECIMAL_PLACES[row];
          const awaitingPick = divided && row === deepest && row < LEVELS.length - 1;

          return (
            <div key={place.name}>
              {level.zoomedFrom !== null && (
                <Lens color={color} index={picked[level.zoomedFrom] ?? 0} />
              )}

              <p className="mb-1.5 flex flex-wrap items-baseline gap-x-2 text-xs font-semibold uppercase tracking-wide">
                <span style={{ color: textColor }}>{divided ? `10 części — ${place.name}` : level.closed}</span>
                {divided && (
                  <span className="font-mono text-sm normal-case tracking-normal" style={{ color }}>
                    każda to {place.unit}
                  </span>
                )}
              </p>

              <svg
                viewBox={`0 0 ${TRACK_W} ${ROW_H}`}
                className="h-auto w-full"
                role="img"
                aria-label={
                  divided
                    ? `Pasek podzielony na dziesięć części — ${place.name}, każda to ${place.unit}`
                    : `${level.closed} — pasek jeszcze niepodzielony`
                }
              >
                {divided ? (
                  Array.from({ length: PARTS }, (_, i) => {
                    const isChosen = chosen === i;
                    return (
                      <motion.rect
                        key={i}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.25, delay: i * 0.03 }}
                        x={segX(i)}
                        y={INSET}
                        width={SEG_W}
                        height={ROW_H - STROKE}
                        rx={5}
                        fill={pieceFill(color, isChosen)}
                        stroke={pieceStroke(color, isChosen)}
                        strokeWidth={STROKE}
                        style={{ cursor: awaitingPick ? 'pointer' : 'default', transition: 'fill .15s ease' }}
                        onClick={awaitingPick ? () => pick(row, i) : undefined}
                      />
                    );
                  })
                ) : (
                  <rect
                    x={INSET}
                    y={INSET}
                    width={TRACK_W - STROKE}
                    height={ROW_H - STROKE}
                    rx={5}
                    fill={pieceFill(color, false)}
                    stroke={pieceStroke(color, false)}
                    strokeWidth={STROKE}
                  />
                )}
              </svg>

              {divided && (
                <p className="mt-1 text-xs text-muted-foreground">
                  <MiniFraction licznik={1} mianownik={place.mianownik} color={textColor} size="sm" /> całości ={' '}
                  <span className="font-mono font-bold" style={{ color: textColor }}>
                    {place.unit}
                  </span>
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3">
        {!finished && !isDivided(deepest) && (
          <button
            type="button"
            onClick={divide}
            className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={{ borderColor: color, color: textColor, backgroundColor: `${color}14` }}
          >
            <Scissors className="h-4 w-4" aria-hidden />
            Podziel na 10 równych części
          </button>
        )}

        {!finished && isDivided(deepest) && deepest < LEVELS.length - 1 && (
          <p className="inline-flex items-center gap-2 text-sm font-semibold" style={{ color: textColor }}>
            <Search className="h-4 w-4 shrink-0" aria-hidden />
            Stuknij dowolny kawałek — obejrzymy go z bliska.
          </p>
        )}

        {finished && (
          <p className="text-sm font-semibold" style={{ color: textColor }}>
            Trzy razy ten sam ruch — i masz trzy pierwsze miejsca po przecinku.
          </p>
        )}

        {step > 0 && (
          <button
            type="button"
            onClick={undo}
            className={cn(
              'inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-muted-foreground',
              'transition-colors hover:text-foreground'
            )}
          >
            <Undo2 className="h-3.5 w-3.5" aria-hidden />
            Cofnij ostatni krok
          </button>
        )}
      </div>

      {finished && (
        <div
          className="mt-5 grid gap-3 border-l-4 p-4 sm:grid-cols-3"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          {DECIMAL_PLACES.map((place) => (
            <p key={place.name} className="text-sm leading-relaxed">
              <span className="font-mono text-lg font-bold" style={{ color }}>
                {place.unit}
              </span>{' '}
              = <MiniFraction licznik={1} mianownik={place.mianownik} color={textColor} /> — jedna{' '}
              <strong style={{ color: textColor }}>{place.forms.one}</strong>
            </p>
          ))}
        </div>
      )}

      {/* Treść odsłaniana klikiem musi stać w DOM od początku (SEO). */}
      <ul className="sr-only">
        {DECIMAL_PLACES.map((place) => (
          <li key={place.name}>
            Jedna {place.forms.one} całości to {place.unit}, czyli 1/{place.mianownik}. Każdy kawałek dzieli
            się na dziesięć jeszcze mniejszych.
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Trapez „lupy” — łączy wybrany kawałek paska wyżej z całą szerokością paska niżej. */
function Lens({ color, index }: { color: string; index: number }) {
  const left = segX(index);
  const right = round(left + SEG_W);

  return (
    <svg viewBox={`0 0 ${TRACK_W} ${LENS_H}`} className="h-auto w-full" aria-hidden focusable="false">
      <motion.path
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        d={`M ${left} 0 L ${right} 0 L ${TRACK_W - INSET} ${LENS_H} L ${INSET} ${LENS_H} Z`}
        fill={`${color}14`}
        stroke={`${color}55`}
        strokeWidth={1.5}
        strokeDasharray="4 3"
      />
    </svg>
  );
}
