'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { FractionNotation } from '../../fraction-notation';
import { buildPieSlices } from '../../../lib/fraction';
import { round } from '../../../lib/lines';

const VIEW = 320;
const CENTER = { x: 160, y: 158 };
const CAKE_R = 74;
const CHAIR_RING = 132;
const CHAIR_R = 15;
const MAX_GUESTS = 10;
const MIN_GUESTS = 2;
/** Ile różnych liczb gości trzeba wypróbować, żeby taśma dała się porównać. */
const TARGET_TRIES = 5;

const START_SEATS = [0, 2, 5, 7];

interface SliceTrailLabProps {
  color: string;
  onComplete?: () => void;
}

function chairPoint(index: number) {
  const angle = ((-90 + index * (360 / MAX_GUESTS)) * Math.PI) / 180;
  return {
    x: round(CENTER.x + Math.cos(angle) * CHAIR_RING),
    y: round(CENTER.y + Math.sin(angle) * CHAIR_RING),
  };
}

/**
 * Flagowy widżet lekcji, celowo w Rozgrzewce (a nie w „Nowym pojęciu" jak
 * dwie poprzednie lekcje modułu) — reguła ma zostać ODKRYTA, zanim ktokolwiek
 * ją nazwie.
 *
 * Dziecko sadza i zabiera gości przy okrągłym stole (klik w krzesło), a tort
 * na środku natychmiast dzieli się na tyle równych kawałków, ilu jest gości.
 * Nowość mechaniczna: każda nowa liczba gości zostawia TRWAŁY ślad na
 * „taśmie porównawczej" pod stołem — pasek o długości jednego kawałka,
 * podpisany 1/n. Widżet nie pokazuje więc gotowego porównania: dziecko samo
 * buduje sobie wykres porównawczy z własnego eksplorowania, a dopiero potem
 * odczytuje z niego regułę. Żaden wcześniejszy widżet w kursie nie kumulował
 * historii własnych prób jako narzędzia porównania (`RoundingMachine` odtwarza
 * kroki jednej reguły, `PeelBoard` przenosi te same żetony) — tu porównanie
 * jest produktem ubocznym zabawy.
 */
export function SliceTrailLab({ color, onComplete }: SliceTrailLabProps) {
  const [seated, setSeated] = useState<Set<number>>(() => new Set(START_SEATS));
  const [trail, setTrail] = useState<number[]>(() => [START_SEATS.length]);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrongKey, setWrongKey] = useState(0);

  const guests = seated.size;
  const ready = trail.length >= TARGET_TRIES;
  const sortedTrail = [...trail].sort((a, b) => a - b);
  const biggest = sortedTrail[0];
  const solved = picked !== null && picked === biggest;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const toggleChair = (index: number) => {
    const next = new Set(seated);
    if (next.has(index)) next.delete(index);
    else next.add(index);
    setSeated(next);
    if (next.size >= MIN_GUESTS && next.size <= MAX_GUESTS && !trail.includes(next.size)) {
      setTrail((prev) => [...prev, next.size]);
    }
  };

  const pick = (mianownik: number) => {
    if (solved) return;
    if (mianownik === biggest) {
      setPicked(mianownik);
      return;
    }
    setPicked(mianownik);
    setWrongKey((prev) => prev + 1);
  };

  const slices = guests >= MIN_GUESTS ? buildPieSlices(CENTER, CAKE_R, guests) : [];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
        Jeden tort, różne przyjęcia
      </p>
      <p className="mb-5 text-sm leading-relaxed sm:text-base">
        Klikaj w krzesła, żeby sadzać i zabierać gości. Tort jest zawsze ten sam — dzieli się na
        tyle równych kawałków, ilu jest gości przy stole. Każda nowa liczba gości zostawia ślad na
        taśmie pod spodem.
      </p>

      <div className="grid gap-6 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        {/* Stół z gośćmi */}
        <div>
          <svg
            viewBox={`0 0 ${VIEW} ${VIEW}`}
            className="mx-auto h-auto w-full max-w-[320px] select-none"
            role="group"
            aria-label={`Okrągły stół z ${MAX_GUESTS} krzesłami, zajętych: ${guests}`}
          >
            {/* Blat */}
            <circle cx={CENTER.x} cy={CENTER.y} r={CAKE_R + 20} fill={`${color}0f`} stroke={color} strokeOpacity={0.25} strokeWidth={2} />

            {/* Tort */}
            {guests >= MIN_GUESTS ? (
              slices.map((slice, i) => (
                <path
                  key={`${guests}-${i}`}
                  d={slice.path}
                  fill={i === 0 ? color : `${color}1f`}
                  stroke={color}
                  strokeWidth={2}
                  strokeLinejoin="round"
                />
              ))
            ) : (
              <circle cx={CENTER.x} cy={CENTER.y} r={CAKE_R} fill={`${color}1f`} stroke={color} strokeWidth={2} />
            )}

            {/* Krzesła */}
            {Array.from({ length: MAX_GUESTS }, (_, i) => {
              const point = chairPoint(i);
              const taken = seated.has(i);
              return (
                <g
                  key={i}
                  role="button"
                  tabIndex={0}
                  aria-pressed={taken}
                  aria-label={`Krzesło ${i + 1}${taken ? ' — zajęte' : ' — wolne'}`}
                  style={{ cursor: 'pointer' }}
                  onClick={() => toggleChair(i)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      toggleChair(i);
                    }
                  }}
                >
                  <circle cx={point.x} cy={point.y} r={CHAIR_R + 6} fill="transparent" />
                  <circle
                    cx={point.x}
                    cy={point.y}
                    r={CHAIR_R}
                    fill={taken ? color : 'transparent'}
                    stroke={color}
                    strokeOpacity={taken ? 1 : 0.45}
                    strokeWidth={2}
                    strokeDasharray={taken ? undefined : '4 3'}
                    style={{ transition: 'fill 0.15s ease' }}
                  />
                  {taken && <circle cx={point.x} cy={round(point.y - 3)} r={5} fill="white" fillOpacity={0.85} />}
                </g>
              );
            })}
          </svg>

          <div className="mt-3 flex items-center justify-center gap-5">
            <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color: textColor }}>
              <Users className="h-4 w-4" aria-hidden />
              <span className="tabular-nums">{guests}</span> {guests === 1 ? 'gość' : 'gości'}
            </p>
            {guests >= MIN_GUESTS ? (
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">każdy dostaje</span>
                <FractionNotation licznik={1} mianownik={guests} color={color} licznikRevealed mianownikRevealed size="md" />
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">Posadź przy stole co najmniej dwoje gości.</p>
            )}
          </div>
        </div>

        {/* Taśma porównawcza */}
        <div>
          <div className="mb-3 flex items-baseline justify-between gap-3">
            <p className="text-sm font-bold" style={{ color: textColor }}>
              Taśma porównawcza
            </p>
            <p className="text-xs text-muted-foreground tabular-nums">
              {Math.min(trail.length, TARGET_TRIES)}/{TARGET_TRIES} prób
            </p>
          </div>

          <ul className="space-y-1.5">
            <AnimatePresence initial={false}>
              {sortedTrail.map((mianownik) => {
                const isPicked = picked === mianownik;
                const isBiggest = mianownik === biggest;
                return (
                  <motion.li
                    key={mianownik}
                    layout
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25, ease: 'easeOut' }}
                  >
                    <motion.button
                      type="button"
                      disabled={!ready || solved}
                      onClick={() => pick(mianownik)}
                      animate={isPicked && !solved ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
                      key={`${mianownik}-${isPicked && !solved ? wrongKey : 'calm'}`}
                      transition={{ duration: 0.35 }}
                      className={cn(
                        'flex w-full items-center gap-3 border px-2 py-1.5 text-left transition-colors',
                        ready && !solved && 'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                        !ready && 'cursor-default',
                        solved && isBiggest && 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/40'
                      )}
                      style={
                        solved && isBiggest
                          ? undefined
                          : { borderColor: isPicked && !solved ? '#fb7185' : `${color}33` }
                      }
                    >
                      <span className="w-10 shrink-0 text-center font-mono text-sm font-bold tabular-nums" style={{ color }}>
                        1/{mianownik}
                      </span>
                      <span className="relative h-6 flex-1" style={{ backgroundColor: `${color}12` }}>
                        <motion.span
                          layout
                          className="absolute inset-y-0 left-0 block"
                          style={{
                            width: `${round(100 / mianownik)}%`,
                            backgroundColor: solved && isBiggest ? '#10b981' : color,
                          }}
                        />
                      </span>
                      <span className="w-16 shrink-0 text-right text-[11px] text-muted-foreground tabular-nums">
                        {mianownik} gości
                      </span>
                    </motion.button>
                  </motion.li>
                );
              })}
            </AnimatePresence>
          </ul>

          {!ready && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Wypróbuj jeszcze {TARGET_TRIES - trail.length}{' '}
              {TARGET_TRIES - trail.length === 1 ? 'inną liczbę gości' : 'inne liczby gości'} — taśma
              porówna je za Ciebie.
            </p>
          )}

          {ready && !solved && (
            <p className="mt-3 text-sm font-semibold leading-relaxed" style={{ color: textColor }}>
              {picked === null
                ? 'Spójrz na taśmę i kliknij ten kawałek, który jest największy.'
                : 'Jeszcze nie ten — najdłuższy pasek to największy kawałek. Kliknij jeszcze raz.'}
            </p>
          )}
        </div>
      </div>

      {solved && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex flex-wrap items-center justify-between gap-4 bg-emerald-50 p-4 dark:bg-emerald-950/40"
        >
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-hidden />
            <p className="max-w-2xl text-sm leading-relaxed text-emerald-900 dark:text-emerald-100">
              <strong>1/{biggest} to największy kawałek na taśmie</strong> — bo tort dzieliło
              najmniej gości. Im więcej osób dzieli tę samą całość, tym mniejszy kawałek dostaje
              każda z nich. To znaczy, że przy tym samym liczniku <strong>większy mianownik daje
              mniejszy ułamek</strong>.
            </p>
          </div>
          <Button onClick={() => onComplete?.()} style={{ backgroundColor: color }} className="gap-1.5 text-white hover:opacity-90">
            Dalej
            <ArrowRight className="h-4 w-4" />
          </Button>
        </motion.div>
      )}
    </div>
  );
}
