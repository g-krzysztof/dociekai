'use client';

import { useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { SolidSpinner } from '../../solid-spinner';
import { boxEdgeGroups, type BoxAxis, type BoxSpec } from '../../../lib/solids';

/** Wymiary w centymetrach — te same liczby jadą do rysunku i do podpisów. */
const SPEC: BoxSpec = { width: 5, height: 3, depth: 4 };
/** Kolejność do czytania na głos: długość, szerokość, wysokość. */
const DISPLAY_ORDER: BoxAxis[] = ['x', 'z', 'y'];

/**
 * Nowe pojęcie: dwanaście krawędzi to nie dwanaście różnych długości. Kliknięcie
 * jednej krawędzi podświetla **całą czwórkę krawędzi równoległych** i nazywa
 * wymiar, którym ta czwórka jest. Po trzech kliknięciach na ekranie zostają trzy
 * liczby — i to jest cały opis bryły.
 *
 * Podział na czwórki liczy `boxEdgeGroups` z `lib/solids.ts`, tą samą funkcją,
 * z której korzystają przykłady i klucz odpowiedzi — nie ma tu drugiej,
 * ręcznie wpisanej listy krawędzi.
 */
export function EdgeGroupBoard({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const groups = useMemo(() => boxEdgeGroups(SPEC), []);
  const [found, setFound] = useState<BoxAxis[]>([]);
  const [active, setActive] = useState<BoxAxis | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const complete = found.length === groups.length;

  const marked = groups
    .filter((group) => found.includes(group.axis))
    .flatMap((group) => group.edgeIds);

  /** Stan czytany z domknięcia, `onComplete` wołane osobnym wyrażeniem po
   *  setterze — nigdy z wnętrza funkcji-updatera. */
  const pick = (edgeId: string) => {
    const group = groups.find((item) => item.edgeIds.includes(edgeId));
    if (!group) return;
    setActive(group.axis);
    if (found.includes(group.axis)) return;
    const next = [...found, group.axis];
    setFound(next);
    if (next.length === groups.length) onComplete?.();
  };

  const ordered = DISPLAY_ORDER.flatMap((axis) =>
    groups.filter((group) => group.axis === axis)
  );

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="grid items-center gap-6 md:grid-cols-[300px_1fr]">
        <SolidSpinner
          spec={SPEC}
          color={color}
          picking={{ part: 'krawedzie', marked, onPick: pick }}
          ariaLabel="Prostopadłościan do obracania — kliknij krawędź, żeby podświetlić całą grupę krawędzi tej samej długości"
        />

        <div>
          <p className="text-lg font-bold sm:text-xl">Kliknij dowolną krawędź</p>
          <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
            Podświetlą się wszystkie krawędzie tej samej długości. Znajdź wszystkie trzy grupy.
          </p>

          <ul className="mt-4 space-y-2">
            {ordered.map((group) => {
              const known = found.includes(group.axis);
              return (
                <li
                  key={group.axis}
                  className="flex items-baseline gap-3 border-l-4 py-1.5 pl-3"
                  style={{ borderColor: active === group.axis ? color : known ? `${color}66` : `${color}1f` }}
                >
                  <span
                    className="w-16 shrink-0 font-mono text-xl font-black tabular-nums"
                    style={{ color: known ? color : `${color}40` }}
                  >
                    {known ? `${group.length} cm` : '?'}
                  </span>
                  <span className="text-sm leading-relaxed">
                    {known ? (
                      <>
                        <strong style={{ color: textColor }}>{group.label}</strong> — cztery krawędzie
                        po {group.length} cm
                      </>
                    ) : (
                      <span className="text-muted-foreground">jeszcze nieodkryta grupa</span>
                    )}
                  </span>
                </li>
              );
            })}
          </ul>

          {complete && (
            <motion.div
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-5 border-l-4 py-2 pl-4"
              style={{ borderColor: color, backgroundColor: `${color}0c` }}
            >
              <p className="font-mono text-2xl font-black tabular-nums" style={{ color }}>
                {SPEC.width} × {SPEC.depth} × {SPEC.height} cm
              </p>
              <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed">
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                Dwanaście krawędzi to trzy czwórki: 3 × 4 = 12. Trzy długości wystarczą, żeby opisać
                całą bryłę — i to właśnie one nazywają się długością, szerokością i wysokością.
              </p>
            </motion.div>
          )}
        </div>
      </div>

      {/* Ten sam rozkład zawsze w DOM — klik go tylko odsłania. */}
      <ul className="sr-only">
        {ordered.map((group) => (
          <li key={group.axis}>
            {group.label}: cztery krawędzie po {group.length} cm.
          </li>
        ))}
      </ul>
    </div>
  );
}
