'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

type StreetType = 'pozioma' | 'pionowa' | 'ukosna';

interface Street {
  id: string;
  name: string;
  type: StreetType;
  x1?: number;
  y1?: number;
  x2?: number;
  y2?: number;
  x?: number;
  y?: number;
  labelX: number;
  labelY: number;
  anchor: 'start' | 'end';
}

/**
 * Plan osiedla: 3 ulice poziome, 2 pionowe i 1 ukośna (parkowa).
 * Rundy: znajdź wszystkie równoległe do Akacjowej → wszystkie prostopadłe →
 * policz pary równoległych (3 pary poziome + 1 para pionowa = 4).
 */
const STREETS: Street[] = [
  { id: 'lipowa', name: 'Lipowa', type: 'pozioma', y: 70, x1: 30, x2: 300, labelX: 14, labelY: 64, anchor: 'start' },
  { id: 'akacjowa', name: 'Akacjowa', type: 'pozioma', y: 130, x1: 30, x2: 300, labelX: 14, labelY: 124, anchor: 'start' },
  { id: 'polna', name: 'Polna', type: 'pozioma', y: 190, x1: 30, x2: 300, labelX: 14, labelY: 184, anchor: 'start' },
  { id: 'krotka', name: 'Krótka', type: 'pionowa', x: 80, y1: 30, y2: 230, labelX: 82, labelY: 24, anchor: 'start' },
  { id: 'dluga', name: 'Długa', type: 'pionowa', x: 230, y1: 30, y2: 230, labelX: 232, labelY: 24, anchor: 'start' },
  { id: 'parkowa', name: 'Parkowa', type: 'ukosna', x1: 300, y1: 55, x2: 262, y2: 230, labelX: 294, labelY: 48, anchor: 'end' },
];

const PARALLEL_TO_AKACJOWA = ['lipowa', 'polna'];
const PERPENDICULAR_TO_AKACJOWA = ['krotka', 'dluga'];
const PAIR_COUNT_OPTIONS = [3, 4, 5, 6];
const PAIR_COUNT_ANSWER = 4;

interface StreetPlanChallengeProps {
  color: string;
  onComplete?: () => void;
}

export function StreetPlanChallenge({ color, onComplete }: StreetPlanChallengeProps) {
  const [phase, setPhase] = useState<0 | 1 | 2>(0);
  const [selected, setSelected] = useState<string[]>([]);
  const [shakeId, setShakeId] = useState<string | null>(null);
  const [pickedCount, setPickedCount] = useState<number | null>(null);
  const [pickedWrong, setPickedWrong] = useState(false);
  const [finished, setFinished] = useState(false);

  const target = phase === 0 ? PARALLEL_TO_AKACJOWA : PERPENDICULAR_TO_AKACJOWA;
  const phaseSolved = target.every((id) => selected.includes(id));

  const relationWord = phase === 0 ? 'równoległe' : 'prostopadłe';

  const clickStreet = (street: Street) => {
    if (finished || pickedCount !== null) return;
    if (target.includes(street.id)) {
      if (!selected.includes(street.id)) setSelected((prev) => [...prev, street.id]);
    } else {
      setShakeId(street.id);
      setTimeout(() => setShakeId(null), 400);
    }
  };

  const advancePhase = () => {
    if (phase === 0) {
      setPhase(1);
      setSelected([]);
    } else {
      setPhase(2);
      setSelected([]);
    }
  };

  const pickCount = (value: number) => {
    if (pickedCount !== null) return;
    if (value === PAIR_COUNT_ANSWER) {
      setPickedCount(value);
    } else {
      setPickedWrong(true);
      setTimeout(() => setPickedWrong(false), 400);
    }
  };

  const finish = () => {
    setFinished(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-lg font-bold leading-snug sm:text-xl">
        {phase === 0 && 'Kliknij WSZYSTKIE ulice RÓWNOLEGŁE do Akacjowej.'}
        {phase === 1 && 'Kliknij WSZYSTKIE ulice PROSTOPADŁE do Akacjowej.'}
        {phase === 2 && 'Ile par RÓWNOLEGŁYCH ulic widać na planie osiedla?'}
      </p>

      <svg
        viewBox="0 0 320 240"
        className="h-auto w-full select-none border"
        role="img"
        aria-label="Plan osiedla z ulicami: Lipowa, Akacjowa, Polna, Krótka, Długa i Parkowa"
      >
        {STREETS.map((street) => {
          const isSelected = selected.includes(street.id);
          const isShaking = shakeId === street.id;
          const lineColor = isSelected ? color : `color-mix(in oklch, ${color} 45%, black)`;
          return (
            <motion.g
              key={street.id}
              animate={isShaking ? { x: [0, -5, 5, -5, 5, 0] } : undefined}
              transition={{ duration: 0.4 }}
            >
              {/* Szeroki, niewidoczny obszar kliknięcia */}
              <line
                x1={street.type === 'pionowa' ? street.x : street.x1}
                y1={street.type === 'pozioma' ? street.y : street.y1}
                x2={street.type === 'pionowa' ? street.x : street.x2}
                y2={street.type === 'pozioma' ? street.y : street.y2}
                stroke="transparent"
                strokeWidth={14}
                style={{ cursor: 'pointer' }}
                onClick={() => clickStreet(street)}
              />
              <line
                x1={street.type === 'pionowa' ? street.x : street.x1}
                y1={street.type === 'pozioma' ? street.y : street.y1}
                x2={street.type === 'pionowa' ? street.x : street.x2}
                y2={street.type === 'pozioma' ? street.y : street.y2}
                stroke={lineColor}
                strokeWidth={isSelected ? 5 : 3.5}
              />
              <text
                x={street.labelX}
                y={street.labelY}
                textAnchor={street.anchor}
                style={{ fontSize: 13, fontWeight: 800 }}
                fill={lineColor}
              >
                {street.name}
              </text>
            </motion.g>
          );
        })}
      </svg>

      {phase < 2 && (
        <div className="mt-3 flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">
            {phaseSolved ? (
              <span className="font-semibold text-emerald-600">
                Świetnie! Znalazłeś/aś wszystkie ulice {relationWord} do Akacjowej.
              </span>
            ) : (
              <>
                Zaznaczono {selected.length} z {target.length}. Ulica, która nie jest {relationWord},
                zapuka tylko w ekran.
              </>
            )}
          </p>
          {phaseSolved && (
            <Button onClick={advancePhase}>{phase === 0 ? 'Teraz prostopadłe →' : 'Teraz policz pary →'}</Button>
          )}
        </div>
      )}

      {phase === 2 && (
        <>
          <p className="mb-3 mt-4 text-sm text-muted-foreground">
            Podpowiedź: policz pary wśród ulic poziomych i osobno pary wśród pionowych. Ulica
            Parkowa nie jest równoległa do żadnej innej.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            {PAIR_COUNT_OPTIONS.map((value) => (
              <motion.button
                key={value}
                type="button"
                onClick={() => pickCount(value)}
                disabled={pickedCount !== null}
                animate={pickedWrong && value !== PAIR_COUNT_ANSWER ? { x: [0, -6, 6, -6, 6, 0] } : undefined}
                transition={{ duration: 0.4 }}
                className={cn(
                  'h-14 w-14 cursor-pointer border font-mono text-xl font-bold transition-all disabled:cursor-not-allowed',
                  !pickedCount && 'hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md',
                  pickedCount === value && 'border-emerald-500 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40'
                )}
              >
                {value}
              </motion.button>
            ))}
          </div>
          {pickedCount !== null && (
            <div className="mt-4 flex items-center justify-between gap-3">
              <motion.p
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-sm leading-relaxed text-emerald-700"
              >
                <strong>Dobrze!</strong> Trzy pary wśród ulic poziomych (Lipowa–Akacjowa,
                Lipowa–Polna, Akacjowa–Polna) i jedna para wśród pionowych (Krótka–Długa) — razem 4.
              </motion.p>
              <Button onClick={finish}>Zakończ</Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}