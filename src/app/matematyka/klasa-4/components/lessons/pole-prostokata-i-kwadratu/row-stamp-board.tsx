'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowDown, Check, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { plural } from '../../../lib/plural';
import { buildRowTiling, type RectangleSpec } from '../../../lib/rectangle-area';

interface Round {
  id: string;
  spec: RectangleSpec;
  story: string;
  /** Co ma wyjść z tej rundy — zdanie pod planszą po jej zakończeniu. */
  moral: string;
}

const ROUNDS: Round[] = [
  {
    id: 'blat',
    spec: { width: 5, height: 3 },
    story: 'Blat stołu wyłożony kwadratowymi płytkami.',
    moral: 'Każdy rząd był taki sam, więc zamiast liczyć piętnaście płytek, wystarczyło policzyć jeden rząd i rzędy.',
  },
  {
    id: 'chusteczka',
    spec: { width: 4, height: 4 },
    story: 'Serwetka o równych bokach — kwadrat.',
    moral: 'W kwadracie oba boki są takie same, więc mnożysz bok przez samego siebie.',
  },
  {
    id: 'korytarz',
    spec: { width: 6, height: 2 },
    story: 'Wąski korytarz wyłożony płytkami.',
    moral: 'Nawet gdy rzędy są tylko dwa, zasada się nie zmienia: kratki w rzędzie razy liczba rzędów.',
  },
];

const UNIT = 36;
const MAX_W = 6;
const MAX_H = 4;

/**
 * Rozgrzewka lekcji o wzorze: dziecko układa **jeden** rząd kafelków klikając
 * kratkę po kratce, a potem powiela ten rząd w dół przyciskiem. Zdanie pod
 * planszą buduje się razem z kafelkami, więc mnożenie pojawia się jako skrót do
 * liczenia, którego dziecko właśnie samo zaniechało — nie jako podany wzór.
 */
export function RowStampBoard({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [laid, setLaid] = useState<number[]>([]);
  const [rows, setRows] = useState(0);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const { spec } = round;
  const tiling = buildRowTiling(spec);
  const rowDone = laid.length === spec.width;
  const finished = rows === spec.height;
  const isLast = index === ROUNDS.length - 1;
  const allDone = index >= ROUNDS.length;

  const layCell = (x: number) => {
    if (laid.includes(x)) return;
    setLaid([...laid, x].sort((a, b) => a - b));
  };

  const stamp = () => {
    if (!rowDone || finished) return;
    setRows(Math.min(rows === 0 ? 2 : rows + 1, spec.height));
  };

  const resetRound = () => {
    setLaid([]);
    setRows(0);
  };

  const next = () => {
    resetRound();
    if (isLast) {
      setIndex(ROUNDS.length);
      onComplete?.();
      return;
    }
    setIndex(index + 1);
  };

  // Rząd wzorcowy liczy się jako pierwszy powielony rząd — stąd `rows || (rowDone ? 1 : 0)`.
  const visibleRows = rows > 0 ? rows : rowDone ? 1 : 0;
  const counted = visibleRows > 0 ? tiling.rows[visibleRows - 1].runningTotal : laid.length;

  /** Kafelki leżące na planszy: rząd wzorcowy układany klikami, reszta powielana w dół. */
  const tiles: { x: number; y: number }[] = [
    ...laid.map((x) => ({ x, y: 0 })),
    ...Array.from({ length: Math.max(visibleRows - 1, 0) }, (_, i) => i + 1).flatMap((y) =>
      Array.from({ length: spec.width }, (_, x) => ({ x, y }))
    ),
  ];

  if (allDone) {
    return (
      <div className="border-l-2 bg-white p-5 dark:bg-zinc-900/80 sm:p-6" style={{ borderColor: color }}>
        <p className="flex items-center gap-2 text-base font-bold" style={{ color }}>
          <Check className="h-5 w-5" aria-hidden /> Trzy prostokąty, trzy razy ten sam skrót
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Za każdym razem wystarczyło ułożyć jeden rząd i policzyć rzędy. To jest cały wzór na pole
          prostokąta — reszta lekcji tylko nada mu nazwę.
        </p>
      </div>
    );
  }

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            Prostokąt {index + 1} z {ROUNDS.length}
          </p>
          <p className="text-sm font-medium">{round.story}</p>
        </div>
        <div className="flex gap-1.5">
          {ROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{ backgroundColor: i <= index ? color : `${color}33` }}
            />
          ))}
        </div>
      </div>

      <p className="mb-3 text-sm leading-relaxed">
        {!rowDone
          ? 'Kliknij kolejne kratki, żeby ułożyć kafelki w górnym rzędzie — cały rząd, od lewej do prawej.'
          : !finished
            ? 'Rząd gotowy. Nie układaj reszty ręcznie — powiel ten rząd w dół.'
            : round.moral}
      </p>

      <div className="grid items-center gap-5 md:grid-cols-[auto_1fr]">
        <svg
          viewBox={`0 0 ${MAX_W * UNIT} ${MAX_H * UNIT}`}
          className="mx-auto w-full max-w-[280px]"
          role="img"
          aria-label={`Prostokąt ${spec.width} na ${spec.height} kratki, ułożono ${counted}`}
        >
          {/* Kratownica całej planszy */}
          <g stroke={`${color}22`} strokeWidth={1}>
            {Array.from({ length: MAX_W + 1 }, (_, i) => (
              <line key={`v${i}`} x1={i * UNIT} y1={0} x2={i * UNIT} y2={MAX_H * UNIT} />
            ))}
            {Array.from({ length: MAX_H + 1 }, (_, i) => (
              <line key={`h${i}`} x1={0} y1={i * UNIT} x2={MAX_W * UNIT} y2={i * UNIT} />
            ))}
          </g>

          {/* Ułożone kafelki */}
          <AnimatePresence>
            {tiles.map(({ x, y }) => (
              <motion.rect
                key={`${y}-${x}`}
                initial={{ opacity: 0, scale: 0.4 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.22, delay: y === 0 ? 0 : x * 0.04 }}
                x={x * UNIT + 2}
                y={y * UNIT + 2}
                width={UNIT - 4}
                height={UNIT - 4}
                fill={color}
                fillOpacity={y === 0 ? 0.55 : 0.32}
                stroke={color}
                strokeWidth={1.5}
              />
            ))}
          </AnimatePresence>

          {/* Cele do klikania w rzędzie wzorcowym */}
          {!rowDone &&
            Array.from({ length: spec.width }, (_, x) => x)
              .filter((x) => !laid.includes(x))
              .map((x) => (
                <rect
                  key={`target-${x}`}
                  x={x * UNIT + 3}
                  y={3}
                  width={UNIT - 6}
                  height={UNIT - 6}
                  fill={color}
                  fillOpacity={0.08}
                  stroke={color}
                  strokeWidth={1.5}
                  strokeDasharray="4 3"
                  className="cursor-pointer"
                  onClick={() => layCell(x)}
                  role="button"
                  aria-label={`Połóż kafelek w kolumnie ${x + 1}`}
                />
              ))}

          {/* Obrys docelowego prostokąta */}
          <rect
            x={0}
            y={0}
            width={spec.width * UNIT}
            height={spec.height * UNIT}
            fill="none"
            stroke={color}
            strokeWidth={3}
          />
        </svg>

        <div>
          <div className="border p-4" style={{ backgroundColor: `${color}0d` }}>
            <p className="font-mono text-lg font-bold tabular-nums sm:text-xl" style={{ color }}>
              {!rowDone
                ? `${laid.length} z ${spec.width} w rzędzie`
                : `${tiling.perRow} · ${visibleRows} = ${counted}`}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {!rowDone
                ? 'kafelki w rzędzie wzorcowym'
                : `${tiling.perRow} w rzędzie · ${visibleRows} ${plural(visibleRows, {
                    one: 'rząd',
                    few: 'rzędy',
                    many: 'rzędów',
                  })} = ${counted} ${plural(counted, { one: 'kratka', few: 'kratki', many: 'kratek' })}`}
            </p>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              onClick={stamp}
              disabled={!rowDone || finished}
              style={{ backgroundColor: color }}
            >
              <ArrowDown className="mr-1 h-4 w-4" aria-hidden /> Powiel rząd
            </Button>
            {finished && (
              <Button size="sm" variant="outline" onClick={next}>
                {isLast ? 'Zakończ' : 'Następny prostokąt'}
              </Button>
            )}
            <Button size="sm" variant="ghost" onClick={resetRound}>
              <RotateCcw className="mr-1 h-4 w-4" aria-hidden /> Od nowa
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
