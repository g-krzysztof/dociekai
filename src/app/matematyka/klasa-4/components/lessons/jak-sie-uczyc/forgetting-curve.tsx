'use client';

import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/** Dni, w których można zaplanować powtórkę. */
const REVIEW_DAYS = [1, 3, 7] as const;
type ReviewDay = (typeof REVIEW_DAYS)[number];

const DAYS = 14;
/** Po ilu dniach zapominamy większość materiału bez powtórki. */
const BASE_STRENGTH = 1.35;
/** Ile razy „mocniejsza” jest pamięć po każdej kolejnej powtórce. */
const STRENGTH_GROWTH = 2.15;

const WIDTH = 640;
const HEIGHT = 280;
const PAD_L = 44;
const PAD_R = 18;
const PAD_T = 18;
const PAD_B = 40;
const PLOT_W = WIDTH - PAD_L - PAD_R;
const PLOT_H = HEIGHT - PAD_T - PAD_B;

const xOf = (day: number) => PAD_L + (day / DAYS) * PLOT_W;
const yOf = (retention: number) => PAD_T + (1 - retention) * PLOT_H;

/**
 * Ile materiału zostaje w głowie po `day` dniach przy danych powtórkach.
 * Model uproszczony (krzywa Ebbinghausa): po każdej powtórce pamięć wraca do 100%
 * i słabnie wolniej niż poprzednio.
 */
function retentionAt(day: number, reviews: number[]): number {
  const past = reviews.filter((r) => r <= day);
  const last = past.length ? past[past.length - 1] : 0;
  const strength = BASE_STRENGTH * STRENGTH_GROWTH ** past.length;
  return Math.exp(-(day - last) / strength);
}

function buildPath(reviews: number[]): string {
  const steps = 280;
  let path = '';
  for (let i = 0; i <= steps; i += 1) {
    const day = (i / steps) * DAYS;
    // Pionowy skok w górę dokładnie w dniu powtórki
    const x = xOf(day);
    const y = yOf(retentionAt(day, reviews));
    path += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)},${y.toFixed(1)} `;
  }
  return path.trim();
}

interface ForgettingCurveProps {
  color: string;
  onComplete?: () => void;
}

/** Interaktywny wykres: jak powtórki zmieniają to, ile pamiętasz po dwóch tygodniach. */
export function ForgettingCurve({ color, onComplete }: ForgettingCurveProps) {
  const [reviews, setReviews] = useState<ReviewDay[]>([]);

  const sorted = useMemo(() => [...reviews].sort((a, b) => a - b), [reviews]);
  const path = useMemo(() => buildPath(sorted), [sorted]);
  const emptyPath = useMemo(() => buildPath([]), []);
  const areaPath = `${path} L${xOf(DAYS)},${yOf(0)} L${xOf(0)},${yOf(0)} Z`;

  const finalRetention = Math.round(retentionAt(DAYS, sorted) * 100);
  const allOn = reviews.length === REVIEW_DAYS.length;

  useEffect(() => {
    if (allOn) onComplete?.();
  }, [allOn, onComplete]);

  const toggle = (day: ReviewDay) =>
    setReviews((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
        Dziś na lekcji rozumiesz wszystko w 100%. Ale pamięć działa jak dziurawe wiadro — bez
        powtórek po dwóch tygodniach zostaje w niej mniej niż jedna piąta. Włącz powtórki i zobacz,
        co się dzieje z krzywą.
      </p>

      {/* Przełączniki powtórek */}
      <div className="mb-4 flex flex-wrap gap-2">
        {REVIEW_DAYS.map((day) => {
          const active = reviews.includes(day);
          return (
            <button
              key={day}
              type="button"
              onClick={() => toggle(day)}
              aria-pressed={active}
              className={cn(
                'cursor-pointer border px-4 py-2 text-sm font-semibold transition-all',
                active ? 'text-white shadow-md' : 'hover:-translate-y-0.5 hover:shadow-sm'
              )}
              style={
                active
                  ? { backgroundColor: color, borderColor: color }
                  : { borderColor: `${color}59`, color }
              }
            >
              {active ? '✓ ' : '+ '}
              Powtórka po {day === 1 ? '1 dniu' : `${day} dniach`}
            </button>
          );
        })}
      </div>

      {/* Wykres */}
      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
          className="h-auto w-full min-w-[420px]"
          role="img"
          aria-label={`Wykres zapamiętywania. Przy ${reviews.length} powtórkach po ${DAYS} dniach pamiętasz około ${finalRetention} procent materiału.`}
        >
          <defs>
            <linearGradient id="curve-fill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity="0.32" />
              <stop offset="100%" stopColor={color} stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Siatka pozioma */}
          {[0, 0.25, 0.5, 0.75, 1].map((level) => (
            <g key={level} className="text-muted-foreground">
              <line
                x1={PAD_L}
                y1={yOf(level)}
                x2={WIDTH - PAD_R}
                y2={yOf(level)}
                stroke="currentColor"
                strokeOpacity={level === 0 ? 0.45 : 0.15}
                strokeDasharray={level === 0 ? undefined : '4 6'}
              />
              <text
                x={PAD_L - 10}
                y={yOf(level) + 4}
                textAnchor="end"
                fill="currentColor"
                className="text-[11px]"
              >
                {level * 100}%
              </text>
            </g>
          ))}

          {/* Opisy dni */}
          {[0, 1, 3, 7, 14].map((day) => (
            <text
              key={day}
              x={xOf(day)}
              y={HEIGHT - PAD_B + 20}
              textAnchor="middle"
              fill="currentColor"
              className="text-[11px] text-muted-foreground"
            >
              {day === 0 ? 'lekcja' : `${day} dz.`}
            </text>
          ))}

          {/* Krzywa bez powtórek — punkt odniesienia */}
          <path
            d={emptyPath}
            fill="none"
            stroke="currentColor"
            strokeOpacity={0.35}
            strokeWidth={2}
            strokeDasharray="5 5"
            className="text-muted-foreground"
          />

          {/* Wypełnienie pod aktualną krzywą */}
          <motion.path
            key={`area-${sorted.join('-')}`}
            d={areaPath}
            fill="url(#curve-fill)"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6 }}
          />

          {/* Aktualna krzywa — rysuje się od nowa po każdej zmianie */}
          <motion.path
            key={`line-${sorted.join('-')}`}
            d={path}
            fill="none"
            stroke={color}
            strokeWidth={3.5}
            strokeLinecap="round"
            initial={{ pathLength: 0 }}
            animate={{ pathLength: 1 }}
            transition={{ duration: 0.9, ease: 'easeOut' }}
          />

          {/* Znaczniki powtórek */}
          {sorted.map((day) => (
            <g key={day}>
              <line
                x1={xOf(day)}
                y1={yOf(1)}
                x2={xOf(day)}
                y2={yOf(0)}
                stroke={color}
                strokeOpacity={0.3}
                strokeDasharray="3 4"
              />
              <motion.circle
                cx={xOf(day)}
                cy={yOf(1)}
                r={7}
                fill="#fff"
                stroke={color}
                strokeWidth={3.5}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 300, damping: 14 }}
                style={{ transformOrigin: `${xOf(day)}px ${yOf(1)}px` }}
              />
            </g>
          ))}

          {/* Wynik na końcu krzywej */}
          <motion.g
            key={`end-${sorted.join('-')}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <circle cx={xOf(DAYS)} cy={yOf(finalRetention / 100)} r={6} fill={color} />
            <text
              x={xOf(DAYS) - 8}
              y={yOf(finalRetention / 100) - 12}
              textAnchor="end"
              fill={color}
              className="text-[15px] font-bold"
            >
              {finalRetention}%
            </text>
          </motion.g>
        </svg>
      </div>

      {/* Odczyt wyniku */}
      <div
        className="mt-4 flex flex-col gap-3 p-4 sm:flex-row sm:items-center"
        style={{ backgroundColor: `${color}12` }}
      >
        <span
          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-extrabold text-white"
          style={{ backgroundColor: color }}
        >
          {finalRetention}%
        </span>
        <p className="text-sm leading-relaxed">
          {reviews.length === 0 && (
            <>
              <strong>Bez powtórek</strong> po dwóch tygodniach zostaje ci w głowie tylko{' '}
              {finalRetention}% lekcji. Dlatego przed sprawdzianem wszystko wygląda jak nowe.
            </>
          )}
          {reviews.length === 1 && (
            <>
              Jedna powtórka i już jest lepiej — <strong>{finalRetention}%</strong>. Dodaj kolejną i
              zobacz, jak krzywa robi się coraz bardziej płaska.
            </>
          )}
          {reviews.length === 2 && (
            <>
              Dwie powtórki: <strong>{finalRetention}%</strong>. Każda kolejna powtórka „przykleja”
              wiedzę na dłużej. Zostało jeszcze jedno pole do włączenia.
            </>
          )}
          {allOn && (
            <>
              Trzy krótkie powtórki (po 1 dniu, po 3 dniach i po tygodniu) i pamiętasz{' '}
              <strong>{finalRetention}%</strong> — a zajęły razem może 20 minut.{' '}
              <strong>To jest cały sekret.</strong>
            </>
          )}
        </p>
      </div>

      {/* Zasada 1-3-7 */}
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          { day: '1 dzień', what: 'Przeczytaj notatkę i zrób jedno zadanie z lekcji.', time: '5 min' },
          { day: '3 dni', what: 'Zasłoń notatkę i powiedz regułę własnymi słowami.', time: '5 min' },
          { day: '7 dni', what: 'Zrób dwa zadania z tego tematu bez zaglądania.', time: '10 min' },
        ].map((item) => (
          <div key={item.day} className="border p-4">
            <div className="mb-1 flex items-center justify-between">
              <span className="font-bold" style={{ color }}>
                Po {item.day}
              </span>
              <span className="text-xs text-muted-foreground">{item.time}</span>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground">{item.what}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
