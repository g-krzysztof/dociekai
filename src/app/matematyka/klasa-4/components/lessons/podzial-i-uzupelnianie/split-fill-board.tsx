'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Plus, RotateCcw, Scissors } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { GridFigure } from '../pole-figury/grid-figure';
import type { GridCell } from '../../../lib/area';
import {
  boundingBox,
  complementParts,
  cutCandidates,
  cutKey,
  partArea,
  partKey,
  splitRegions,
  type FigureCut,
  type RectPart,
} from '../../../lib/area-split';

export interface SplitRound {
  id: string;
  /** Rozmiar planszy w kratkach — figura siedzi w środku. */
  board: { width: number; height: number };
  cells: GridCell[];
  story: string;
  /** Zdanie pokazywane po rozłożeniu figury — puenta tej rundy. */
  moral: string;
}

interface SplitFillBoardProps {
  color: string;
  /** `split` — potnij na prostokąty i dodaj; `fill` — domknij do prostokąta i odejmij. */
  mode: 'split' | 'fill';
  rounds: SplitRound[];
  onComplete?: () => void;
}

const UNIT = 40;

const label = (part: RectPart): string => `${part.width} · ${part.height} = ${partArea(part)}`;

/**
 * Obie metody liczenia pola figury złożonej z prostokątów, na jednym mechanizmie
 * i w dwóch narracjach (ten sam wzorzec co `MoneyPurse`/`AngleBuilder`):
 *
 * - `mode="split"` — dziecko klika linię kratownicy i **tnie** figurę; każdy
 *   kawałek dostaje własne działanie, a wyniki się dodają. Cięcie, po którym
 *   zostaje kawałek niebędący prostokątem, nie jest błędem — po prostu trzeba
 *   ciąć dalej (są figury, na które jedno cięcie nie wystarcza).
 * - `mode="fill"` — figura dostaje przerywaną ramkę prostokąta obejmującego,
 *   a dziecko klika brakujące kawałki. Wtedy działanie idzie w drugą stronę:
 *   pole ramki minus pola braków.
 *
 * O tym, czy dany kawałek jest prostokątem i ile ma pola, rozstrzyga
 * `lib/area-split.ts`, a nie flaga wpisana obok rysunku.
 */
export function SplitFillBoard({ color, mode, rounds, onComplete }: SplitFillBoardProps) {
  const [index, setIndex] = useState(0);
  const [cuts, setCuts] = useState<FigureCut[]>([]);
  const [filled, setFilled] = useState<string[]>([]);
  const [answer, setAnswer] = useState('');
  const [state, setState] = useState<'idle' | 'wrong' | 'right'>('idle');
  const [shake, setShake] = useState(0);

  const allDone = index >= rounds.length;
  const round = rounds[Math.min(index, rounds.length - 1)];
  const isLast = index === rounds.length - 1;

  const split = splitRegions(round.cells, cuts);
  const complement = complementParts(round.cells);
  const candidates = cutCandidates(round.cells);
  const box = boundingBox(round.cells);
  const holes = complement.holes ?? [];

  const decomposed =
    mode === 'split'
      ? split.rectangles !== null && split.rectangles.length > 1
      : holes.length > 0 && holes.every((hole) => filled.includes(partKey(hole)));

  const total = round.cells.length;

  const reset = () => {
    setCuts([]);
    setFilled([]);
    setAnswer('');
    setState('idle');
  };

  const next = () => {
    reset();
    if (isLast) {
      setIndex(rounds.length);
      onComplete?.();
      return;
    }
    setIndex(index + 1);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (Number(answer.trim().replace(',', '.')) === total) {
      setState('right');
      return;
    }
    setState('wrong');
    setShake((value) => value + 1);
  };

  if (allDone) {
    return (
      <div className="border-l-2 bg-white p-5 dark:bg-zinc-900/80 sm:p-6" style={{ borderColor: color }}>
        <p className="flex items-center gap-2 text-base font-bold" style={{ color }}>
          <Check className="h-5 w-5" aria-hidden />
          {mode === 'split' ? 'Umiesz już dzielić figurę na prostokąty' : 'Umiesz już uzupełniać figurę do prostokąta'}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          {mode === 'split'
            ? 'Każdą z tych figur dało się rozłożyć na prostokąty, a pola kawałków wystarczyło dodać. Sposób cięcia wybierasz sam — wynik i tak wychodzi ten sam.'
            : 'Za każdym razem wystarczyło policzyć pole dużego prostokąta i odjąć to, czego w figurze nie ma. Przy jednym brakującym kawałku ta droga jest zwykle najkrótsza.'}
        </p>
      </div>
    );
  }

  const regions = mode === 'split' ? split.rectangles : null;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {mode === 'split' ? 'Podział' : 'Uzupełnianie'} — figura {index + 1} z {rounds.length}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{round.story}</p>
        </div>
        <div className="flex gap-1.5 pt-1">
          {rounds.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: i <= index ? color : `${color}33` }}
            />
          ))}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <motion.div key={shake} animate={shake ? { x: [0, -7, 7, -4, 0] } : undefined}>
          <GridFigure
            width={round.board.width}
            height={round.board.height}
            cells={round.cells}
            color={color}
            unit={UNIT}
            fillOpacity={regions ? 0 : 0.22}
            className="mx-auto w-full max-w-[320px]"
            title={`Figura o polu ${total} kratek`}
          >
            {/* Kawałki po cięciu — każdy w innym natężeniu, z własnym działaniem. */}
            {regions?.map((part, i) => (
              <g key={partKey(part)}>
                <rect
                  x={part.x * UNIT + 2}
                  y={part.y * UNIT + 2}
                  width={part.width * UNIT - 4}
                  height={part.height * UNIT - 4}
                  fill={color}
                  fillOpacity={i % 2 === 0 ? 0.36 : 0.16}
                />
                <text
                  x={(part.x + part.width / 2) * UNIT}
                  y={(part.y + part.height / 2) * UNIT + 4}
                  textAnchor="middle"
                  fontSize={13}
                  fontWeight={700}
                  fill={`color-mix(in oklch, ${color} 88%, black)`}
                >
                  {label(part)}
                </text>
              </g>
            ))}

            {/* Ramka prostokąta obejmującego — tylko w trybie uzupełniania. */}
            {mode === 'fill' && (
              <rect
                x={box.x * UNIT}
                y={box.y * UNIT}
                width={box.width * UNIT}
                height={box.height * UNIT}
                fill="none"
                stroke={color}
                strokeWidth={2}
                strokeDasharray="7 5"
              />
            )}

            {/* Braki do klikania — widoczne w spoczynku, nie dopiero na hover. */}
            {mode === 'fill' &&
              holes.map((hole) => {
                const done = filled.includes(partKey(hole));
                return (
                  <g
                    key={partKey(hole)}
                    className={done ? '' : 'cursor-pointer'}
                    onClick={() => {
                      if (done) return;
                      setFilled([...filled, partKey(hole)]);
                    }}
                    role={done ? undefined : 'button'}
                    aria-label={
                      done ? undefined : `Dołóż brakujący prostokąt ${hole.width} na ${hole.height}`
                    }
                  >
                    <rect
                      x={hole.x * UNIT + 3}
                      y={hole.y * UNIT + 3}
                      width={hole.width * UNIT - 6}
                      height={hole.height * UNIT - 6}
                      fill={done ? '#f59e0b' : color}
                      fillOpacity={done ? 0.3 : 0.08}
                      stroke={done ? '#f59e0b' : color}
                      strokeWidth={2}
                      strokeDasharray={done ? undefined : '5 4'}
                    />
                    <text
                      x={(hole.x + hole.width / 2) * UNIT}
                      y={(hole.y + hole.height / 2) * UNIT + 5}
                      textAnchor="middle"
                      fontSize={done ? 13 : 15}
                      fontWeight={700}
                      fill={done ? '#b45309' : `color-mix(in oklch, ${color} 88%, black)`}
                    >
                      {done ? label(hole) : '＋'}
                    </text>
                  </g>
                );
              })}

            {/* Linie do cięcia — każda jest widocznym celem, nie niewidzialnym paskiem. */}
            {mode === 'split' &&
              candidates.map((cut) => {
                const used = cuts.some((item) => cutKey(item) === cutKey(cut));
                const x1 = cut.dir === 'v' ? cut.at * UNIT : box.x * UNIT;
                const x2 = cut.dir === 'v' ? cut.at * UNIT : (box.x + box.width) * UNIT;
                const y1 = cut.dir === 'h' ? cut.at * UNIT : box.y * UNIT;
                const y2 = cut.dir === 'h' ? cut.at * UNIT : (box.y + box.height) * UNIT;
                return (
                  <g
                    key={cutKey(cut)}
                    className={used ? '' : 'cursor-pointer'}
                    onClick={() => {
                      if (used) return;
                      setCuts([...cuts, cut]);
                    }}
                    role={used ? undefined : 'button'}
                    aria-label={
                      used
                        ? undefined
                        : `Przetnij figurę ${cut.dir === 'v' ? 'pionowo' : 'poziomo'} na pozycji ${cut.at}`
                    }
                  >
                    <line
                      x1={x1}
                      y1={y1}
                      x2={x2}
                      y2={y2}
                      stroke={used ? color : `${color}88`}
                      strokeWidth={used ? 4 : 2}
                      strokeDasharray={used ? undefined : '6 5'}
                    />
                    {!used && (
                      <rect
                        x={cut.dir === 'v' ? x1 - 9 : x1}
                        y={cut.dir === 'h' ? y1 - 9 : y1}
                        width={cut.dir === 'v' ? 18 : x2 - x1}
                        height={cut.dir === 'h' ? 18 : y2 - y1}
                        fill="#fff"
                        fillOpacity={0.001}
                      />
                    )}
                  </g>
                );
              })}
          </GridFigure>
          <p className="mt-1 text-center text-xs text-muted-foreground">
            {mode === 'split'
              ? 'Kliknij przerywaną linię, żeby przeciąć figurę wzdłuż kratownicy.'
              : 'Kliknij przerywany kawałek, którego w figurze brakuje.'}
          </p>
        </motion.div>

        <div>
          <div className="border p-4" style={{ backgroundColor: `${color}0d` }}>
            <p className="text-xs uppercase tracking-wide text-muted-foreground">
              {mode === 'split' ? 'Pola kawałków' : 'Ramka minus braki'}
            </p>
            <AnimatePresence initial={false}>
              {mode === 'split' ? (
                regions ? (
                  <motion.p
                    key="split-eq"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="mt-1 font-mono text-base font-bold leading-relaxed tabular-nums"
                    style={{ color }}
                  >
                    {regions.map((part) => `${part.width} · ${part.height}`).join(' + ')} ={' '}
                    {regions.map((part) => partArea(part)).join(' + ')} = {total}
                  </motion.p>
                ) : (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {cuts.length === 0
                      ? 'Jeszcze nie ciąłeś — na razie to jedna figura, która nie jest prostokątem.'
                      : 'Po tym cięciu został kawałek, który wciąż nie jest prostokątem. Potnij dalej.'}
                  </p>
                )
              ) : (
                <motion.p
                  key="fill-eq"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-1 font-mono text-base font-bold leading-relaxed tabular-nums"
                  style={{ color }}
                >
                  {box.width} · {box.height}
                  {holes
                    .filter((hole) => filled.includes(partKey(hole)))
                    .map((hole) => ` − ${hole.width} · ${hole.height}`)
                    .join('')}
                  {decomposed && ` = ${complement.boxArea} − ${complement.boxArea - total} = ${total}`}
                </motion.p>
              )}
            </AnimatePresence>
          </div>

          {decomposed && state !== 'right' && (
            <form onSubmit={submit} className="mt-3">
              <label className="text-sm font-medium" htmlFor={`area-${round.id}`}>
                Ile kratek ma pole tej figury?
              </label>
              <div className="mt-1 flex gap-2">
                <Input
                  id={`area-${round.id}`}
                  inputMode="numeric"
                  value={answer}
                  onChange={(event) => setAnswer(event.target.value)}
                  className="max-w-[120px]"
                  placeholder="liczba"
                />
                <Button type="submit" size="sm" style={{ backgroundColor: color }}>
                  Sprawdź
                </Button>
              </div>
              {state === 'wrong' && (
                <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 px-3 py-2 text-sm leading-relaxed dark:bg-amber-950/30">
                  Jeszcze nie to. Przeczytaj działanie po lewej i wykonaj je do końca — wszystkie
                  liczby, których potrzebujesz, już tam są.
                </p>
              )}
            </form>
          )}

          {state === 'right' && (
            <motion.div initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} className="mt-3">
              <p
                className="border-l-2 px-3 py-2 text-sm leading-relaxed"
                style={{ borderColor: color, backgroundColor: `${color}0f` }}
              >
                {round.moral}
              </p>
              <Button size="sm" className="mt-3" onClick={next} style={{ backgroundColor: color }}>
                {isLast ? 'Zakończ' : 'Następna figura'}
              </Button>
            </motion.div>
          )}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button size="sm" variant="ghost" onClick={reset}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden />
              {mode === 'split' ? 'Cofnij cięcia' : 'Od nowa'}
            </Button>
            {mode === 'split' && cuts.length > 0 && state !== 'right' && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Scissors className="h-3.5 w-3.5" aria-hidden /> cięcia: {cuts.length}
              </span>
            )}
            {mode === 'fill' && !decomposed && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Plus className="h-3.5 w-3.5" aria-hidden /> braki: {filled.length} z {holes.length}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
