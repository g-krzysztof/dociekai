'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { buildCircleDiagram, type CircleDiagram } from '../../../lib/circle';

const VIEW_SIZE = 220;
const DIAGRAM: CircleDiagram = buildCircleDiagram({ x: 110, y: 110 }, 88);

type PartId = 'srodek' | 'promien' | 'srednica' | 'cieciwa';

interface Task {
  part: PartId;
  prompt: string;
  label: string;
}

const TASKS: Task[] = [
  { part: 'srodek', prompt: 'Kliknij środek koła.', label: 'środek' },
  { part: 'promien', prompt: 'Kliknij promień.', label: 'promień' },
  { part: 'srednica', prompt: 'Kliknij średnicę.', label: 'średnica' },
  { part: 'cieciwa', prompt: 'A teraz kliknij cięciwę — uważaj, żeby nie pomylić jej ze średnicą.', label: 'cięciwa' },
];

const MUTED = '#9ca3af';

interface CirclePartsHuntProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Rozgrzewka: to samo koło co w przewodniku słownika koła, ale teraz dziecko
 * klika wprost w narysowany element (nie w przycisk z opisem) — ten sam duch
 * audytu co `IntersectingLinesAudit`, tu zastosowany do przypominania
 * słownictwa zamiast liczenia. Błędny klik to potrząśnięcie i ponowna próba,
 * nigdy blokada.
 */
export function CirclePartsHunt({ color, onComplete }: CirclePartsHuntProps) {
  const [index, setIndex] = useState(0);
  const [solved, setSolved] = useState(false);
  const [shakeId, setShakeId] = useState<PartId | null>(null);

  const task = TASKS[index];
  const isLast = index === TASKS.length - 1;
  const { center, radiusEnd, diameterA, diameterB, chordA, chordB } = DIAGRAM;

  const handlePick = (part: PartId) => {
    if (solved) return;
    if (part === task.part) {
      setSolved(true);
      return;
    }
    setShakeId(part);
    setTimeout(() => setShakeId(null), 400);
  };

  const next = () => {
    if (!isLast) {
      setIndex((prev) => prev + 1);
      setSolved(false);
      return;
    }
    onComplete?.();
  };

  const colorOf = (part: PartId) => (solved && part === task.part ? '#10b981' : part === task.part ? color : MUTED);
  const widthOf = (part: PartId) => (solved && part === task.part ? 5 : 3);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {TASKS.map((_, i) => (
          <span
            key={i}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= index ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {index + 1}/{TASKS.length}
        </span>
      </div>

      <p className="mb-4 text-center text-sm font-semibold leading-relaxed sm:text-base">{task.prompt}</p>

      <svg
        viewBox={`0 0 ${VIEW_SIZE} ${VIEW_SIZE}`}
        className="mx-auto h-auto w-full max-w-[340px] touch-none select-none"
        role="img"
        aria-label="Koło z zaznaczonym środkiem, promieniem, średnicą i cięciwą do kliknięcia"
      >
        <circle cx={center.x} cy={center.y} r={DIAGRAM.radius} fill="none" stroke={`${color}55`} strokeWidth={2.5} />

        {/* Cięciwa */}
        <motion.g
          animate={shakeId === 'cieciwa' ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
          transition={{ duration: 0.35 }}
        >
          <line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke="transparent" strokeWidth={24} className="cursor-pointer" onClick={() => handlePick('cieciwa')} />
          <line x1={chordA.x} y1={chordA.y} x2={chordB.x} y2={chordB.y} stroke={colorOf('cieciwa')} strokeWidth={widthOf('cieciwa')} strokeLinecap="round" pointerEvents="none" />
        </motion.g>

        {/* Średnica */}
        <motion.g
          animate={shakeId === 'srednica' ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
          transition={{ duration: 0.35 }}
        >
          <line x1={diameterA.x} y1={diameterA.y} x2={diameterB.x} y2={diameterB.y} stroke="transparent" strokeWidth={24} className="cursor-pointer" onClick={() => handlePick('srednica')} />
          <line x1={diameterA.x} y1={diameterA.y} x2={diameterB.x} y2={diameterB.y} stroke={colorOf('srednica')} strokeWidth={widthOf('srednica')} strokeLinecap="round" pointerEvents="none" />
        </motion.g>

        {/* Promień */}
        <motion.g
          animate={shakeId === 'promien' ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
          transition={{ duration: 0.35 }}
        >
          <line x1={center.x} y1={center.y} x2={radiusEnd.x} y2={radiusEnd.y} stroke="transparent" strokeWidth={24} className="cursor-pointer" onClick={() => handlePick('promien')} />
          <line x1={center.x} y1={center.y} x2={radiusEnd.x} y2={radiusEnd.y} stroke={colorOf('promien')} strokeWidth={widthOf('promien')} strokeLinecap="round" pointerEvents="none" />
        </motion.g>

        {/* Środek */}
        <motion.g
          animate={shakeId === 'srodek' ? { x: [0, -4, 4, -4, 4, 0] } : undefined}
          transition={{ duration: 0.35 }}
        >
          <circle cx={center.x} cy={center.y} r={20} fill="transparent" className="cursor-pointer" onClick={() => handlePick('srodek')} />
          <circle cx={center.x} cy={center.y} r={solved && task.part === 'srodek' ? 8 : 6} fill={colorOf('srodek')} pointerEvents="none" />
        </motion.g>
      </svg>

      {solved && (
        <motion.p
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-center text-sm font-semibold text-emerald-700 dark:text-emerald-300"
        >
          To jest {task.label}.
        </motion.p>
      )}

      {solved && (
        <div className="mt-4 flex justify-end">
          <Button onClick={next} style={{ backgroundColor: color }} className="text-white hover:opacity-90">
            {isLast ? 'Do cyrkla' : 'Dalej'}
          </Button>
        </div>
      )}
    </div>
  );
}
