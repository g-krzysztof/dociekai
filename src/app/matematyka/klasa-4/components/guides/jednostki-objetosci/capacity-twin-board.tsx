'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { VESSELS, capacityLabel, formatVolume, volumeLabel } from '../../../lib/volume-units';

type Naming = 'pojemnosc' | 'objetosc';

/** Rozdziela „1,5” od „l”, żeby liczba mogła zostać w miejscu, a zmieniła się sama nazwa. */
function split(label: string): { value: string; unit: string } {
  const at = label.lastIndexOf(' ');
  return { value: label.slice(0, at), unit: label.slice(at + 1) };
}

/**
 * Dwa imiona tej samej wielkości. Przełącznik zmienia **wyłącznie nazwę
 * jednostki** — liczba przed nią zostaje dokładnie ta sama i nawet nie drgnie,
 * bo obie etykiety liczą się z jednej wartości w mililitrach
 * (`capacityLabel`/`volumeLabel` w `lib/volume-units.ts`). To właśnie ma
 * zobaczyć dziecko: 1,5 l i 1,5 dm³ to nie dwa wyniki do przeliczenia, tylko
 * jeden wynik w dwóch słownikach.
 *
 * Nazwa jednostki wymienia się przez `AnimatePresence`, więc ruch przyciąga oko
 * dokładnie tam, gdzie zachodzi zmiana; liczba nie jest animowana w ogóle —
 * jej bezruch jest tu treścią, a nie oszczędnością.
 */
export function CapacityTwinBoard({ color }: { color: string }) {
  const [naming, setNaming] = useState<Naming>('pojemnosc');
  const [openId, setOpenId] = useState<string | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">Nazywaj to samo po:</span>
        {(
          [
            { id: 'pojemnosc' as const, label: 'pojemności (ml, l)' },
            { id: 'objetosc' as const, label: 'objętości (cm³, dm³)' },
          ]
        ).map((option) => (
          <button
            key={option.id}
            type="button"
            onClick={() => setNaming(option.id)}
            aria-pressed={naming === option.id}
            className="cursor-pointer border px-3 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5 hover:shadow-md"
            style={
              naming === option.id
                ? { borderColor: color, backgroundColor: `${color}14`, color: textColor }
                : undefined
            }
          >
            {option.label}
          </button>
        ))}
      </div>

      <ol className="divide-y border bg-white dark:bg-zinc-900/80">
        {VESSELS.map((vessel) => {
          const label = naming === 'pojemnosc' ? capacityLabel(vessel.ml) : volumeLabel(vessel.ml);
          const { value, unit } = split(label);
          const open = openId === vessel.id;

          return (
            <li key={vessel.id}>
              <button
                type="button"
                onClick={() => setOpenId(open ? null : vessel.id)}
                aria-expanded={open}
                className={cn(
                  'flex w-full cursor-pointer items-baseline gap-4 px-4 py-3 text-left transition-colors',
                  'hover:bg-black/[0.03] dark:hover:bg-white/[0.04]',
                )}
              >
                <span className="flex-1 text-sm sm:text-base">{vessel.name}</span>
                <span className="shrink-0 whitespace-nowrap font-mono text-lg font-bold tabular-nums sm:text-xl">
                  <span style={{ color }}>{value}</span>{' '}
                  <span className="relative inline-block">
                    {/* Niewidoczna, najszersza z obu nazw — trzyma szerokość, żeby
                        liczba obok nie przeskakiwała przy zmianie słownika. */}
                    <span aria-hidden className="invisible">
                      {split(volumeLabel(vessel.ml)).unit}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.span
                        key={unit}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 6 }}
                        transition={{ duration: 0.18 }}
                        className="absolute inset-0 text-left"
                        style={{ color: textColor }}
                      >
                        {unit}
                      </motion.span>
                    </AnimatePresence>
                  </span>
                </span>
              </button>

              {open && (
                <motion.p
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="px-4 pb-3 text-sm leading-relaxed text-muted-foreground"
                >
                  {vessel.note}
                </motion.p>
              )}
            </li>
          );
        })}
      </ol>

      <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
        Kliknij naczynie, żeby zobaczyć, skąd ta liczba. Zwróć uwagę na jedno: przy zmianie
        słownika <strong style={{ color: textColor }}>liczba nie drgnęła</strong> — zmieniła się
        tylko nazwa jednostki.
      </p>

      {/* Ta sama treść bez klikania — dla czytników ekranu i wyszukiwarek. */}
      <ul className="sr-only">
        {VESSELS.map((vessel) => (
          <li key={vessel.id}>
            {vessel.name}: {capacityLabel(vessel.ml)}, czyli {volumeLabel(vessel.ml)} (
            {formatVolume(vessel.ml)} ml). {vessel.note}
          </li>
        ))}
      </ul>
    </div>
  );
}
