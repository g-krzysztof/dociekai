'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Minus, Plus } from 'lucide-react';
import { imgMap } from '@/lib/media';
import { toRoman } from '../../../lib/timeline/dating';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { getCorePin } from '../../../lib/timeline/pins';
import { STAGES, TASKS, YEAR_MAX, YEAR_MIN, judgeStop, stageAt } from './orly';

const IMAGES = imgMap(Object.fromEntries(STAGES.map((s) => [s.id, s.image])));

/** Wiek roku n.e. — reguła kciuka z L7. */
function century(year: number) {
  return Math.floor((year - 1) / 100) + 1;
}

/**
 * L10 blok 2 (oś czasu) — **suwak stuleci, pod którym zmienia się orzeł**.
 * Trzy zadania: zatrzymaj w chwili, gdy orzeł dostaje / traci / odzyskuje
 * koronę. Sędzia `judgeStop` mówi, co jest na obrazie w roku dziecka. Na
 * koniec pinezka „orzeł w koronie” (1295).
 */
export function OrzelPrzezWieki({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [year, setYear] = useState(1100);
  const [taskIdx, setTaskIdx] = useState(0);
  const [message, setMessage] = useState<string | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const stage = stageAt(year);
  const task = TASKS[taskIdx];
  const allSolved = taskIdx >= TASKS.length;

  const move = (y: number) => {
    setYear(Math.max(YEAR_MIN, Math.min(YEAR_MAX, Math.round(y))));
    setMessage(null);
  };

  const stop = () => {
    if (!task) return;
    const v = judgeStop(task, year);
    if (v.ok) {
      setSolved((s) => [...s, task.done]);
      setTaskIdx((i) => i + 1);
      setMessage(null);
    } else setMessage(v.message);
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-[110px_1fr] gap-3 border p-3 sm:grid-cols-[220px_1fr] sm:gap-4 sm:p-5">
        <div className="relative aspect-square w-full bg-white">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.div
              key={stage.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35 }}
              className="absolute inset-0"
            >
              <Image
                src={IMAGES[stage.id]}
                alt={stage.alt}
                width={220}
                height={220}
                className="h-full w-full object-contain"
              />
            </motion.div>
          </AnimatePresence>
        </div>
        <div className="min-w-0 space-y-2 text-sm leading-relaxed">
          <p className="font-mono text-2xl tabular-nums sm:text-3xl" aria-live="polite">
            {year} <span className="text-lg text-muted-foreground">· {toRoman(century(year))} w.</span>
          </p>
          <p className="text-base font-semibold" style={{ color }}>
            {stage.title}
          </p>
          <p>{stage.text}</p>
          <p className="text-xs text-muted-foreground">
            Źródło: {stage.source} Wikimedia Commons, domena publiczna.
          </p>
        </div>
      </div>

      {/* suwak lat — tuż pod obrazem, żeby wyświetlacz i sterowanie były widoczne naraz */}
      <div className="space-y-2">
        <input
          type="range"
          min={YEAR_MIN}
          max={YEAR_MAX}
          step={1}
          value={year}
          onChange={(e) => move(Number(e.target.value))}
          aria-label="Rok"
          className="w-full cursor-pointer"
          style={{ accentColor: color }}
        />
        <div className="flex justify-between font-mono text-[11px] text-muted-foreground">
          <span>X w.</span>
          <span>XIV w.</span>
          <span>XVIII w.</span>
          <span>XXI w.</span>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5">
          {[-10, -1, 1, 10].map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => move(year + d)}
              className="flex h-9 min-w-12 cursor-pointer items-center justify-center gap-0.5 border px-2 font-mono text-sm hover:bg-muted"
              aria-label={`${d > 0 ? 'Dalej' : 'Wstecz'} o ${Math.abs(d)} ${Math.abs(d) === 1 ? 'rok' : 'lat'}`}
            >
              {d < 0 ? <Minus className="h-3 w-3" aria-hidden /> : <Plus className="h-3 w-3" aria-hidden />}
              {Math.abs(d)}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 border bg-muted/40 p-4 text-sm">
        {solved.map((s) => (
          <p key={s} className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            {s}
          </p>
        ))}
        {task && (
          <div className="flex flex-wrap items-center gap-3">
            <p className="font-semibold">{task.prompt}</p>
            <button
              type="button"
              onClick={stop}
              className="cursor-pointer border bg-white px-3 py-1.5 font-semibold hover:bg-muted dark:bg-zinc-900"
              style={{ borderColor: color, color }}
            >
              Tu! ({year})
            </button>
          </div>
        )}
        {message && (
          <p className="text-destructive" aria-live="polite">
            {message}
          </p>
        )}
      </div>

      {allSolved && (
        <motion.section initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3">
          <p className="text-sm leading-relaxed">
            Orzeł zmieniał się razem z Polską: dostał koronę z królem, w zaborach był znakiem ludzi,
            nie państwa, stracił ją i odzyskał. Dlatego godło to nie obrazek — to{' '}
            <strong>opowieść o państwie w jednym znaku</strong>. Przypnij jej początek na Osi
            dziejów.
          </p>
          <PrzypnijPinezke
            pin={getCorePin('orzel-w-koronie')}
            color={color}
            lesson={lesson}
            done={done}
            onPinned={onComplete}
          />
        </motion.section>
      )}
    </div>
  );
}
