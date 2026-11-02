'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';
import { ClockFace } from '../../clock-face';
import { HAND_DETAILS, type HandDetail } from './guide-content';

export function ActWskazowki({ color }: { color: string }) {
  return (
    <GuideAct id="wskazowki" mode="flow">
      <WskazowkiBody color={color} />
    </GuideAct>
  );
}

function WskazowkiBody({ color }: { color: string }) {
  const [selected, setSelected] = useState<HandDetail['id'] | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const detail = HAND_DETAILS.find((item) => item.id === selected);

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Trzy wskazówki</h2>
      <p className="mb-8 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Zwykły zegar ma trzy wskazówki, każda o innej długości i innej prędkości. Kliknij nazwę,
        żeby zobaczyć, która to która i co dokładnie odmierza.
      </p>

      <div className="mb-6 grid items-center gap-6 sm:grid-cols-[220px_1fr]">
        <ClockFace
          color={color}
          hours24={10}
          minutes={10}
          seconds={30}
          showSecondHand
          highlightHand={selected}
          size={220}
          ariaLabel="Tarcza zegara pokazująca godzinę 10:10 z widoczną wskazówką sekundową"
        />

        <div>
          <div className="mb-4 grid grid-cols-3 gap-2">
            {HAND_DETAILS.map((item) => {
              const active = item.id === selected;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setSelected((prev) => (prev === item.id ? null : item.id))}
                  aria-pressed={active}
                  className={cn(
                    'cursor-pointer border-2 px-2 py-3 text-center text-xs font-bold transition-all sm:text-sm',
                    !active && 'hover:-translate-y-0.5 hover:shadow-md'
                  )}
                  style={{
                    borderColor: active ? color : `${color}40`,
                    backgroundColor: active ? `${color}1f` : `${color}0a`,
                    color: active ? textColor : undefined,
                  }}
                >
                  {item.label}
                  {!active && <span className="sr-only"> — {item.fact}</span>}
                </button>
              );
            })}
          </div>

          <motion.div
            layout
            className="min-h-[92px] border-l-4 p-3 sm:p-4"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <AnimatePresence mode="wait">
              {detail ? (
                <motion.p
                  key={detail.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="text-sm leading-relaxed sm:text-base"
                >
                  {detail.fact}
                </motion.p>
              ) : (
                <motion.p
                  key="placeholder"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-sm text-muted-foreground"
                >
                  Kliknij jedną z trzech wskazówek powyżej.
                </motion.p>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>

      <Beat at={0.6}>
        <div
          className="grid gap-2 border-l-4 p-4 text-center sm:grid-cols-3 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <p className="font-mono text-base font-black tabular-nums sm:text-lg">
            60 sekund = <span style={{ color: textColor }}>1 minuta</span>
          </p>
          <p className="font-mono text-base font-black tabular-nums sm:text-lg">
            60 minut = <span style={{ color: textColor }}>1 godzina</span>
          </p>
          <p className="font-mono text-base font-black tabular-nums sm:text-lg">
            24 godziny = <span style={{ color: textColor }}>1 doba</span>
          </p>
        </div>
      </Beat>
    </>
  );
}
