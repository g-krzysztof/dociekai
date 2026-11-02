'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { FractionPie } from '../../fraction-pie';
import { FractionNotation } from '../../fraction-notation';
import { DENOMINATOR_OPTIONS } from './guide-content';

export function ActLicznikIMianownik({ color }: { color: string }) {
  const [mianownik, setMianownik] = useState<number>(4);
  const [filled, setFilled] = useState<Set<number>>(new Set());
  const [licznikRevealed, setLicznikRevealed] = useState(false);
  const [mianownikRevealed, setMianownikRevealed] = useState(false);
  const licznik = filled.size;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const changeMianownik = (next: number) => {
    setMianownik(next);
    setFilled(new Set());
  };

  const toggleSlice = (index: number) => {
    setFilled((prev) => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  };

  return (
    <GuideAct id="licznik-i-mianownik" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Licznik i mianownik</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Wybierz, na ile części dzielimy całość, potem stuknij te kawałki, które bierzesz.
      </p>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Na ile części?
        </span>
        {DENOMINATOR_OPTIONS.map((option) => {
          const active = option === mianownik;
          return (
            <button
              key={option}
              type="button"
              onClick={() => changeMianownik(option)}
              aria-pressed={active}
              className={cn(
                'cursor-pointer border px-3 py-1.5 font-mono text-sm font-bold transition-all',
                !active && 'hover:-translate-y-0.5 hover:shadow-md'
              )}
              style={
                active
                  ? { borderColor: color, backgroundColor: `${color}14`, color }
                  : { borderColor: `${color}40`, color: textColor }
              }
            >
              {option}
            </button>
          );
        })}
      </div>

      <div className="grid items-center gap-8 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6 md:grid-cols-[220px_1fr]">
        <FractionPie
          color={color}
          mianownik={mianownik}
          filled={filled}
          onToggleSlice={toggleSlice}
          ariaLabel={`Koło podzielone na ${mianownik} części, kliknij kawałki, żeby je zamalować`}
        />

        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center sm:gap-10">
          <FractionNotation
            licznik={licznik}
            mianownik={mianownik}
            color={color}
            licznikRevealed={licznikRevealed}
            mianownikRevealed={mianownikRevealed}
            onClickLicznik={() => setLicznikRevealed(true)}
            onClickMianownik={() => setMianownikRevealed(true)}
          />

          <div className="max-w-xs text-center sm:text-left">
            {!licznikRevealed && !mianownikRevealed && (
              <p className="text-sm text-muted-foreground">
                Kliknij którąś z liczb obok, żeby poznać jej nazwę.
              </p>
            )}
            {mianownikRevealed && (
              <p className="mb-2 text-sm leading-relaxed sm:text-base">
                <strong style={{ color: textColor }}>Mianownik</strong> mówi, na ile równych
                części podzielono całość. Stoi pod kreską.
              </p>
            )}
            {licznikRevealed && (
              <p className="text-sm leading-relaxed sm:text-base">
                <strong style={{ color: textColor }}>Licznik</strong> mówi, ile z tych części
                bierzesz albo zamalowujesz. Stoi nad kreską.
              </p>
            )}
          </div>
        </div>
      </div>

      <p className="mt-4 text-xs" style={{ color: textColor }}>
        Stuknij dowolny kawałek koła jeszcze raz, żeby go odznaczyć — spróbuj kilku różnych
        podziałów.
      </p>
    </GuideAct>
  );
}
