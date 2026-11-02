'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Beat, GuideAct } from '../guide-act';
import { isLeapYear } from '../../../lib/calendar';
import { LEAP_YEAR_CHIPS, CENTURY_YEAR_CHIPS } from './guide-content';

/** Tekst uzasadnienia pod wybranym rokiem — pełne stulecia mają osobną ścieżkę (wyjątek ÷400). */
function leapVerdict(year: number): string {
  if (year % 100 === 0) {
    return isLeapYear(year)
      ? `${year} to pełne stulecie, ale dzieli się przez 400 (${year} : 400 = ${year / 400} dokładnie) — więc jednak rok przestępny.`
      : `${year} dzieli się przez 4, ale to pełne stulecie, które nie dzieli się przez 400 — więc to wyjątkowo rok zwykły.`;
  }
  if (isLeapYear(year)) {
    return `${year} : 4 = ${year / 4} dokładnie — rok przestępny, luty ma 29 dni.`;
  }
  const q = Math.floor(year / 4);
  return `${year} : 4 = ${q} reszta ${year - q * 4} — nie wychodzi równo, więc rok zwykły, luty ma 28 dni.`;
}

function YearChip({
  color,
  year,
  selected,
  onSelect,
}: {
  color: string;
  year: number;
  selected: boolean;
  onSelect: (year: number) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onSelect(year)}
      aria-pressed={selected}
      className={cn(
        'cursor-pointer border-2 px-3 py-2 font-mono text-sm font-bold tabular-nums transition-all sm:px-4 sm:text-base',
        !selected && 'hover:-translate-y-0.5'
      )}
      style={{
        borderColor: selected ? color : `${color}40`,
        backgroundColor: selected ? `${color}1f` : `${color}0a`,
      }}
    >
      {year}
    </button>
  );
}

export function ActRokPrzestepny({ color }: { color: string }) {
  return (
    <GuideAct id="rok-przestepny" mode="flow">
      <RokPrzestepnyBody color={color} />
    </GuideAct>
  );
}

function RokPrzestepnyBody({ color }: { color: string }) {
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedCentury, setSelectedCentury] = useState<number | null>(null);
  const active = selectedCentury ?? selectedYear;
  const leap = active !== null ? isLeapYear(active) : null;
  const reason = active !== null ? leapVerdict(active) : null;

  return (
    <>
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Rok przestępny</h2>
      <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg">
        Ziemia okrąża Słońce nie w dokładnie 365 dni, tylko w około{' '}
        <span className="font-mono font-black tabular-nums" style={{ color: textColor }}>
          365,25
        </span>{' '}
        dnia. Gdyby kalendarz co roku miał sztywno 365 dni, po stu latach pory roku
        rozjechałyby się z datami o cały miesiąc. Rozwiązanie: co jakiś czas dokładamy jeden
        dodatkowy dzień — 29 lutego.
      </p>

      <Beat at={0.2} className="mb-6">
        <p className="mb-3 text-sm font-semibold" style={{ color: textColor }}>
          Kliknij rok, żeby sprawdzić, czy jest przestępny:
        </p>
        <div className="flex flex-wrap gap-2">
          {LEAP_YEAR_CHIPS.map((year) => (
            <YearChip
              key={year}
              color={color}
              year={year}
              selected={selectedYear === year}
              onSelect={(y) => {
                setSelectedYear(y);
                setSelectedCentury(null);
              }}
            />
          ))}
        </div>
      </Beat>

      <Beat at={0.35} className="mb-8">
        <motion.div
          layout
          className="min-h-[64px] border-l-4 p-4 sm:p-5"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <AnimatePresence mode="wait">
            {active !== null ? (
              <motion.p
                key={active}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="text-sm leading-relaxed sm:text-base"
              >
                <strong style={{ color: leap ? textColor : undefined }}>
                  {leap ? 'Rok przestępny. ' : 'Rok zwykły. '}
                </strong>
                {reason}
              </motion.p>
            ) : (
              <motion.p
                key="placeholder"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-sm text-muted-foreground"
              >
                Wybierz rok powyżej.
              </motion.p>
            )}
          </AnimatePresence>
        </motion.div>
      </Beat>

      <Beat at={0.55}>
        <div className="border-2 border-dashed p-4 sm:p-5" style={{ borderColor: `${color}59` }}>
          <p className="mb-1 text-sm font-bold" style={{ color: textColor }}>
            Ciekawostka: reguła „co 4 lata” ma jeden wyjątek
          </p>
          <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
            Pełne stulecia (lata kończące się dwoma zerami) są przestępne tylko wtedy, gdy dzielą
            się przez 400 — nie wystarczy podzielność przez 4.
          </p>
          <div className="flex flex-wrap gap-2">
            {CENTURY_YEAR_CHIPS.map((year) => (
              <YearChip
                key={year}
                color={color}
                year={year}
                selected={selectedCentury === year}
                onSelect={(y) => {
                  setSelectedCentury(y);
                  setSelectedYear(null);
                }}
              />
            ))}
          </div>
        </div>
      </Beat>
    </>
  );
}
