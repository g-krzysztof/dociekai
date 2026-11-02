'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight } from 'lucide-react';
import { Beat, GuideAct } from '../guide-act';
import { CalendarGrid } from '../../calendar-grid';
import { COUNTING_EXAMPLES, type CountingExample } from './guide-content';
import { daysBetween, fromMonthHighlight, toMonthHighlight } from '../../../lib/calendar';

function CountingCard({ color, example }: { color: string; example: CountingExample }) {
  const [revealed, setRevealed] = useState(false);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const total = daysBetween(
    example.fromDay,
    example.monthIndex,
    example.toDay,
    example.toMonthIndex,
    example.year
  );

  return (
    <div className="border-l-4 p-4 sm:p-5" style={{ borderColor: color, backgroundColor: `${color}0c` }}>
      <p className="mb-4 text-base font-semibold leading-relaxed sm:text-lg">{example.prompt}</p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2">
        <CalendarGrid
          color={color}
          monthIndex={example.monthIndex}
          year={example.year}
          days={
            revealed
              ? fromMonthHighlight(example.fromDay, example.monthIndex, example.year)
              : [{ day: example.fromDay, kind: 'start' }]
          }
        />
        <CalendarGrid
          color={color}
          monthIndex={example.toMonthIndex}
          year={example.year}
          days={revealed ? toMonthHighlight(example.toDay) : []}
        />
      </div>

      {!revealed ? (
        <button
          type="button"
          onClick={() => setRevealed(true)}
          className="cursor-pointer border-2 px-4 py-2 text-sm font-semibold transition-colors sm:text-base"
          style={{ borderColor: color, color: textColor }}
        >
          Policz dni
        </button>
      ) : (
        <AnimatePresence>
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-wrap items-center gap-2 text-base font-semibold sm:text-lg"
          >
            <ArrowRight className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            To{' '}
            <span className="font-mono font-black tabular-nums" style={{ color: textColor }}>
              {total} {total === 1 ? 'dzień' : 'dni'}
            </span>
          </motion.p>
        </AnimatePresence>
      )}
    </div>
  );
}

export function ActLiczenieDni({ color }: { color: string }) {
  return (
    <GuideAct id="liczenie-dni" mode="flow">
      <LiczenieDniBody color={color} />
    </GuideAct>
  );
}

function LiczenieDniBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Liczenie dni</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Żeby policzyć, ile dni zostało do jakiejś daty, nie trzeba liczyć „w głowie” wszystkiego
        naraz. Wystarczy najpierw doliczyć do końca bieżącego miesiąca, a potem doliczyć resztę w
        kolejnym — dokładnie tak, jak przy liczeniu w pamięci na osi liczbowej.
      </p>

      <div className="space-y-6">
        {COUNTING_EXAMPLES.map((example, i) => (
          <Beat key={example.id} at={0.15 + i * 0.25}>
            <p
              className="mb-2 text-xs font-bold uppercase tracking-wide"
              style={{ color: textColor }}
            >
              Przykład {i + 1}
            </p>
            <CountingCard color={color} example={example} />
          </Beat>
        ))}
      </div>
    </>
  );
}
