'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import {
  DIM_LABEL,
  netFaceGroups,
  netTotalArea,
  type FacePairId,
  type NetFaceGroup,
} from '../../../lib/box-net';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';

interface Round {
  id: string;
  spec: BoxSpec;
  /** Kolejność, w jakiej pokazujemy kafelki wymiarów — stała, więc SSR i klient
   *  renderują to samo (żadnego `Math.random`). */
  order: FacePairId[];
  story: string;
  moral: string;
}

const ROUNDS: Round[] = [
  {
    id: 'karton',
    spec: { width: 8, depth: 5, height: 3 },
    order: ['przod-tyl', 'gora-dol', 'lewo-prawo'],
    story: 'Karton na książki. Trzy wiersze rachunku, trzy pary ścian — dopasuj każdej jej wymiary.',
    moral:
      'Każda para ścian bierze dwa z trzech wymiarów bryły. Trzeci wymiar jest wtedy „na wylot" — to grubość, której na tej ścianie nie widać.',
  },
  {
    id: 'pudelko',
    spec: { width: 10, depth: 4, height: 6 },
    order: ['lewo-prawo', 'przod-tyl', 'gora-dol'],
    story: 'Wyższe i węższe pudełko. Ta sama tabela, inne liczby — sprawdź, czy schemat działa tak samo.',
    moral:
      'Kolejność wierszy nigdy się nie zmienia: dno z wiekiem, przód z tyłem, boki. Zmieniają się tylko liczby.',
  },
  {
    id: 'slupek',
    spec: { width: 6, depth: 6, height: 3 },
    order: ['gora-dol', 'lewo-prawo', 'przod-tyl'],
    story:
      'Uwaga na tę bryłę: długość i szerokość są równe, więc dwa kafelki mają te same liczby. Patrz na NAZWY wymiarów, nie tylko na liczby.',
    moral:
      'Gdy dwa wymiary są równe, dwie pary ścian wychodzą identyczne. Liczby się powtarzają, ale wiersze rachunku wciąż są trzy.',
  },
];

/**
 * Przykłady, ale nie do oglądania — **do wypełnienia**. Zamiast odsłaniać gotowe
 * kroki (wzorzec `NetDimensionSteps`/`VolumeSteps`), dziecko samo obsadza trzy
 * wiersze „rachunku za karton": do każdej pary ścian dobiera parę wymiarów, a
 * suma dopisuje się na dole dopiero po trafieniu. To jest ta jedna czynność,
 * która w polu powierzchni sprawia realny kłopot — nie mnożenie, tylko
 * rozstrzygnięcie, które dwa wymiary tworzą którą ścianę.
 *
 * Kafelki są podpisane **nazwami wymiarów**, nie samymi liczbami — dlatego
 * ostatnia runda może mieć dwa kafelki o identycznych liczbach (bryła 6 × 6 × 3)
 * i wciąż być rozstrzygalna. Zła odpowiedź drga i tłumaczy, nigdy nie blokuje.
 *
 * Wszystkie liczby liczy `netFaceGroups`/`netTotalArea` — te same funkcje, które
 * w poprzedniej lekcji liczyły pole siatki.
 */
export function SurfaceLedger({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [filled, setFilled] = useState<FacePairId[]>([]);
  const [wrong, setWrong] = useState<FacePairId | null>(null);
  const [finished, setFinished] = useState(false);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const groups = netFaceGroups(round.spec);
  const complete = filled.length === groups.length;
  const containerRef = useSectionScrollAnchor(`${index}-${filled.length}-${finished}`);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const currentRow = groups[filled.length];
  const remaining = round.order.filter((pair) => !filled.includes(pair));
  const runningTotal = filled.reduce(
    (sum, pair) => sum + 2 * (groups.find((g) => g.pair === pair)?.area ?? 0),
    0,
  );

  const pick = (pair: FacePairId) => {
    if (complete) return;
    if (currentRow && pair === currentRow.pair) {
      setWrong(null);
      setFilled([...filled, pair]);
      return;
    }
    setWrong(pair);
  };

  const goNext = () => {
    setFilled([]);
    setWrong(null);
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div
        ref={containerRef}
        className="border-t-2 p-5 sm:p-6"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <p className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: textColor }}>
          <Check className="h-5 w-5 shrink-0" aria-hidden />
          Trzy rachunki wypełnione
        </p>
        <p className="text-base leading-relaxed">
          Zawsze tak samo: trzy wiersze, w każdym dwa wymiary i podwojenie. Stąd wzór{' '}
          <strong>P = 2 · (a · b + a · c + b · c)</strong>.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="max-w-xl text-sm leading-relaxed text-muted-foreground">{round.story}</p>
        <p className="text-sm text-muted-foreground">
          Bryła{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {ROUNDS.length}
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,220px)_1fr]">
        <SolidSketch
          spec={round.spec}
          color={color}
          labels={[
            `${round.spec.width} ${UNIT}`,
            `${round.spec.depth} ${UNIT}`,
            `${round.spec.height} ${UNIT}`,
          ]}
          className="mx-auto h-auto w-full max-w-[220px]"
          ariaLabel={`Prostopadłościan ${round.spec.width} na ${round.spec.depth} na ${round.spec.height} centymetrów`}
        />

        <div>
          {/* Rachunek */}
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b" style={{ backgroundColor: `${color}0d` }}>
                <th className="px-3 py-2 font-semibold">Para ścian</th>
                <th className="px-3 py-2 font-semibold">Wymiary</th>
                <th className="px-3 py-2 text-right font-semibold">Razem</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {groups.map((group, i) => {
                const isFilled = filled.includes(group.pair);
                const isCurrent = !complete && i === filled.length;
                return (
                  <tr
                    key={group.pair}
                    style={isCurrent ? { backgroundColor: `${color}0d` } : undefined}
                  >
                    <td className="px-3 py-2">{group.label}</td>
                    <td className="px-3 py-2 font-mono tabular-nums">
                      {isFilled ? (
                        <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                          {group.sides[0]} · {group.sides[1]} = {group.area}
                        </motion.span>
                      ) : (
                        <span className={cn('text-muted-foreground', isCurrent && 'font-bold')}>
                          {isCurrent ? '← wybierz niżej' : '—'}
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-right font-mono font-bold tabular-nums">
                      {isFilled ? (
                        <span style={{ color }}>2 · {group.area} = {2 * group.area}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="border-t-2" style={{ borderColor: color }}>
                <td className="px-3 py-2 font-semibold" colSpan={2}>
                  Pole powierzchni
                </td>
                <td
                  className="px-3 py-2 text-right font-mono text-lg font-black tabular-nums"
                  style={{ color }}
                >
                  {runningTotal} {UNIT}²
                </td>
              </tr>
            </tfoot>
          </table>

          {/* Kafelki wymiarów */}
          {!complete && currentRow && (
            <motion.div
              key={`${round.id}-${filled.length}-${wrong ?? 'none'}`}
              animate={wrong ? { x: [0, -8, 8, -5, 5, 0] } : undefined}
              transition={{ duration: 0.4 }}
              className="mt-4"
            >
              <p className="mb-2 text-sm">
                Które dwa wymiary tworzą ścianę{' '}
                <strong style={{ color: textColor }}>{currentRow.label}</strong>?
              </p>
              <div className="grid gap-2 sm:grid-cols-3">
                {remaining.map((pair) => {
                  const group = groups.find((g) => g.pair === pair);
                  if (!group) return null;
                  return (
                    <button
                      key={pair}
                      type="button"
                      onClick={() => pick(pair)}
                      className="cursor-pointer border px-3 py-2.5 text-left transition-all hover:-translate-y-0.5 hover:border-primary/60 hover:shadow-md"
                      style={
                        wrong === pair
                          ? { borderColor: color, backgroundColor: `${color}0d` }
                          : undefined
                      }
                    >
                      <span className="block text-xs text-muted-foreground">
                        {DIM_LABEL[group.dims[0]]} × {DIM_LABEL[group.dims[1]]}
                      </span>
                      <span className="font-mono text-base font-bold tabular-nums">
                        {group.sides[0]} · {group.sides[1]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {wrong && !complete && (
              <motion.p
                key="wrong"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                Jeszcze nie. Wyobraź sobie tę ścianę: którymi dwoma wymiarami bryły da się ją zmierzyć,
                stojąc na wprost niej?
              </motion.p>
            )}
            {complete && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p
                  className="border-l-2 px-4 py-3 font-mono text-base font-bold tabular-nums"
                  style={{ borderColor: color, color, backgroundColor: `${color}0d` }}
                >
                  2 · ({groups.map((g) => g.area).join(' + ')}) = {netTotalArea(round.spec)} {UNIT}²
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: textColor }}>
                  {round.moral}
                </p>
                <Button onClick={goNext} className="mt-3" style={{ backgroundColor: color }}>
                  {index + 1 < ROUNDS.length ? 'Następna bryła' : 'Gotowe'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ul className="sr-only">
        {ROUNDS.map((item) => (
          <li key={item.id}>
            Bryła {item.spec.width} × {item.spec.depth} × {item.spec.height} {UNIT}:{' '}
            {netFaceGroups(item.spec)
              .map(
                (g: NetFaceGroup) =>
                  `${g.label} to ${DIM_LABEL[g.dims[0]]} razy ${DIM_LABEL[g.dims[1]]}, czyli ${g.sides[0]} · ${g.sides[1]} = ${g.area}, dwa razy ${2 * g.area}`,
              )
              .join('; ')}
            . Pole powierzchni {netTotalArea(item.spec)} {UNIT}². {item.moral}
          </li>
        ))}
      </ul>
    </div>
  );
}
