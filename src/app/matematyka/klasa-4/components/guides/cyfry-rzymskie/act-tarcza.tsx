'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { GuideAct } from '../guide-act';
import { RomanOdometer } from '../../roman-odometer';
import { romanChunksOf, ROMAN_RULES, toRoman } from '../../../lib/roman';

const COLUMNS = [
  { label: 'tysiące', multiplier: 1000, max: 3 },
  { label: 'setki', multiplier: 100, max: 9 },
  { label: 'dziesiątki', multiplier: 10, max: 9 },
  { label: 'jedności', multiplier: 1, max: 9 },
];

const MAX_VALUE = 3999;

export function ActTarcza({ color }: { color: string }) {
  const [digits, setDigits] = useState([2, 0, 2, 6]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const value = digits.reduce((sum, digit, i) => sum + digit * COLUMNS[i].multiplier, 0);
  const chunks = romanChunksOf(value);

  const step = (index: number, delta: number) => {
    setDigits((prev) => {
      const next = [...prev];
      const max = COLUMNS[index].max;
      next[index] = Math.max(0, Math.min(max, next[index] + delta));
      return next;
    });
  };

  return (
    <GuideAct id="tarcza" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Pobaw się</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Bez zadania i bez poprawnej odpowiedzi. Kręć cyframi i patrz, co się dzieje z zapisem —
        każde miejsce dziesiętne ma swój kolor, a fragmenty z odejmowaniem są podkreślone.
      </p>

      <div className="mb-6 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <div className="mb-5 flex justify-center">
          <RomanOdometer value={value} color={color} label="wartość" />
        </div>

        <div className="mb-6 flex justify-center gap-3 sm:gap-6">
          {COLUMNS.map((column, i) => (
            <div key={column.label} className="flex flex-col items-center gap-1.5">
              <button
                type="button"
                onClick={() => step(i, 1)}
                aria-label={`Zwiększ ${column.label}`}
                disabled={digits[i] >= column.max}
                className="cursor-pointer border p-1.5 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ borderColor: `${color}59`, color }}
              >
                <ChevronUp className="h-4 w-4" />
              </button>
              <span
                className="font-mono text-3xl font-black tabular-nums sm:text-4xl"
                style={{ color }}
              >
                {digits[i]}
              </span>
              <button
                type="button"
                onClick={() => step(i, -1)}
                aria-label={`Zmniejsz ${column.label}`}
                disabled={digits[i] <= 0}
                className="cursor-pointer border p-1.5 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
                style={{ borderColor: `${color}59`, color }}
              >
                <ChevronDown className="h-4 w-4" />
              </button>
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs">
                {column.label}
              </span>
            </div>
          ))}
        </div>

        <div className="flex min-h-[56px] flex-wrap items-baseline justify-center gap-x-1">
          {value === 0 ? (
            <span className="text-sm text-muted-foreground">
              Rzymianie nie mieli znaku na zero — ustaw cokolwiek większego od zera.
            </span>
          ) : (
            chunks.map((chunk) => (
              <span
                key={chunk.place}
                className="font-mono text-3xl font-black leading-none sm:text-4xl"
                style={{
                  color,
                  opacity:
                    chunk.place === 'tysiące'
                      ? 1
                      : chunk.place === 'setki'
                        ? 0.85
                        : chunk.place === 'dziesiątki'
                          ? 0.7
                          : 0.55,
                  textDecoration: chunk.subtractive ? 'underline' : undefined,
                  textUnderlineOffset: '6px',
                }}
                title={`${chunk.place}: ${chunk.value}`}
              >
                {chunk.symbols}
              </span>
            ))
          )}
        </div>

        {chunks.some((chunk) => chunk.subtractive) && (
          <p className="mt-3 text-center text-xs text-muted-foreground">
            Podkreślone fragmenty to te, w których mniejszy symbol stoi przed większym.
          </p>
        )}
      </div>

      <p className="mb-6 max-w-2xl text-base leading-relaxed sm:text-lg">
        Więcej niż <strong>{MAX_VALUE}</strong> ({toRoman(MAX_VALUE)}) tymi siedmioma znakami nie
        zapiszesz — zabrakłoby symbolu większego od M. Dlatego w szkole kończymy na 3000.
      </p>

      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h3 className="mb-1 text-lg font-bold">Zasady w pięciu zdaniach</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Tyle wystarczy, żeby zapisać i odczytać każdą liczbę do 3000.
        </p>
        <ol className="divide-y border">
          {ROMAN_RULES.map((rule, index) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span
                className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {index + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
        <p className="mt-3 text-xs" style={{ color: textColor }}>
          Te same pięć zdań znajdziesz jako ściągę na końcu lekcji.
        </p>
      </section>
    </GuideAct>
  );
}
