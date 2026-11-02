'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Droplets, Eraser, TriangleAlert, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  cellKey,
  floodLayers,
  outlineEdges,
  type CellFigure,
  type FloodResult,
  type GridCell,
  type GridEdge,
} from '../../../lib/area';
import { plural } from '../../../lib/plural';

interface Round {
  id: string;
  name: string;
  story: string;
  figure: CellFigure;
  /** Krawędź obrysu, której brakuje — dziura, przez którą kafelki uciekają. */
  gap?: GridEdge;
  /** Podpowiedź pokazywana po poprawnym zalaniu. */
  moral: string;
}

const ROUNDS: Round[] = [
  {
    id: 'lazienka',
    name: 'Podłoga w łazience',
    story:
      'Pan Marek ma ułożyć kafelki na podłodze w łazience. Każdy kafelek to jedna kratka. Stuknij w dowolną kratkę w środku pokoju — kafelki rozleją się same aż do ścian.',
    figure: {
      width: 7,
      height: 5,
      cells: rect(1, 1, 4, 3),
    },
    moral:
      'Tyle kafelków zmieściło się w środku — i to jest właśnie pole tej figury. Pole mierzymy liczbą kwadratów jednostkowych, które figura pokrywa.',
  },
  {
    id: 'pokoj-l',
    name: 'Pokój w kształcie L',
    story:
      'Ten pokój nie jest prostokątem — ma wnękę. Kafelki i tak dojdą wszędzie tam, dokąd puszczą je ściany. Zalej go i policz.',
    figure: {
      width: 7,
      height: 5,
      cells: [...rect(1, 1, 4, 2), ...rect(1, 3, 2, 1)],
    },
    moral:
      'Figura wcale nie musi być prostokątem, żeby mieć pole. Liczysz dokładnie tak samo: ile kratek pokrywa.',
  },
  {
    id: 'taras',
    name: 'Taras z niespodzianką',
    story:
      'Ostatni pokój. Zalej go tak samo jak poprzednie — i uważnie patrz, co się stanie z kafelkami.',
    figure: {
      width: 7,
      height: 5,
      cells: rect(2, 1, 3, 3),
    },
    gap: { dir: 'h', x: 3, y: 1 },
    moral:
      'Dopiero zamknięta figura ma pole. Gdy w obrysie jest choćby jedna przerwa, „środek” przestaje istnieć — kafelki rozlewają się po całej podłodze.',
  },
];

/** Prostokąt komórek — wszystkie figury rund budowane są z takich bloków, nie z ręcznych list. */
function rect(x: number, y: number, w: number, h: number): GridCell[] {
  const cells: GridCell[] = [];
  for (let dy = 0; dy < h; dy += 1) {
    for (let dx = 0; dx < w; dx += 1) cells.push({ x: x + dx, y: y + dy });
  }
  return cells;
}

const UNIT = 44;
/** Odstęp między falami zalewania w ms — kafelki mają płynąć, nie migać. */
const WAVE_MS = 95;

type Phase = 'seed' | 'flooding' | 'outside' | 'escaped' | 'solved';

interface FloodTileBoardProps {
  color: string;
  onComplete?: () => void;
}

/**
 * Nowe pojęcie (nowa interakcja lekcji): pole jako coś, co samo się rozlewa po
 * wnętrzu figury. Dziecko stuka jedną kratkę, a kafelki propagują się falami
 * (BFS z `floodLayers`), zatrzymując się na obrysie — licznik tyka razem z falą,
 * więc liczba kafelków powstaje na oczach dziecka, a nie jest podana.
 *
 * Trzecia runda jest właściwym sednem: obrys ma jedną brakującą krawędź, więc
 * kafelki uciekają na całą planszę. Dziecko musi znaleźć przerwę i ją zamknąć —
 * dopiero wtedy figura ma policzalne pole. Żaden inny widżet kursu nie
 * propaguje: `DealerBoard` rozdaje round-robin, `PeelBoard` przenosi żetony,
 * tutaj wypełnienie samo znajduje granicę i sama granica jest treścią.
 */
export function FloodTileBoard({ color, onComplete }: FloodTileBoardProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [phase, setPhase] = useState<Phase>('seed');
  const [flood, setFlood] = useState<FloodResult | null>(null);
  const [waves, setWaves] = useState(0);
  const [patched, setPatched] = useState(false);
  const [finished, setFinished] = useState(false);
  const timers = useRef<number[]>([]);

  const round = ROUNDS[roundIndex] ?? ROUNDS[ROUNDS.length - 1];
  const containerRef = useSectionScrollAnchor(`${roundIndex}-${phase}-${finished}`);

  const insideKeys = useMemo(
    () => new Set(round.figure.cells.map(cellKey)),
    [round.figure.cells],
  );
  const openEdges = useMemo(
    () => (round.gap && !patched ? [round.gap] : []),
    [round.gap, patched],
  );
  const edges = useMemo(() => {
    const openKeys = new Set(openEdges.map((e) => `${e.dir}:${e.x},${e.y}`));
    return outlineEdges(round.figure).filter((e) => !openKeys.has(`${e.dir}:${e.x},${e.y}`));
  }, [round.figure, openEdges]);

  const target = round.figure.cells.length;

  const clearTimers = useCallback(() => {
    timers.current.forEach((id) => window.clearTimeout(id));
    timers.current = [];
  }, []);

  useEffect(() => clearTimers, [clearTimers]);

  const reset = useCallback(() => {
    clearTimers();
    setFlood(null);
    setWaves(0);
    setPhase('seed');
  }, [clearTimers]);

  const pour = (seed: GridCell) => {
    if (phase === 'flooding') return;
    clearTimers();
    const result = floodLayers(round.figure, seed, openEdges);
    setFlood(result);
    setWaves(0);
    setPhase('flooding');

    result.layers.forEach((_, i) => {
      timers.current.push(
        window.setTimeout(() => setWaves(i + 1), (i + 1) * WAVE_MS),
      );
    });
    timers.current.push(
      window.setTimeout(
        () => {
          if (!result.startedInside) setPhase('outside');
          else if (result.escaped) setPhase('escaped');
          else setPhase('solved');
        },
        (result.layers.length + 1) * WAVE_MS,
      ),
    );
  };

  const patchGap = () => {
    setPatched(true);
    reset();
  };

  const goNext = () => {
    if (roundIndex + 1 < ROUNDS.length) {
      setRoundIndex((i) => i + 1);
      setPatched(false);
      reset();
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  const shownCells = flood ? flood.layers.slice(0, waves).flat() : [];
  const counted = shownCells.length;

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-6 text-center dark:bg-zinc-900/80 sm:p-8">
        <Trophy className="mx-auto mb-4 h-10 w-10" style={{ color }} aria-hidden />
        <h3 className="mb-2 text-xl font-bold">Pole to liczba kratek w środku</h3>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-muted-foreground">
          Pole figury to powierzchnia, którą figura zajmuje — mierzysz ją liczbą kwadratów
          jednostkowych, jakie się w niej mieszczą. Warunek jest jeden: figura musi być zamknięta,
          bo inaczej nie ma czego wypełniać.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      {/* Kropki rund */}
      <div className="mb-4 flex items-center gap-2">
        {ROUNDS.map((item, i) => (
          <span
            key={item.id}
            className="h-1.5 flex-1 transition-colors"
            style={{ backgroundColor: i <= roundIndex ? color : `${color}26` }}
          />
        ))}
        <span className="ml-1 shrink-0 text-xs font-semibold text-muted-foreground tabular-nums">
          {roundIndex + 1}/{ROUNDS.length}
        </span>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={round.id}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ duration: 0.22 }}
        >
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
            {round.name}
          </p>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">{round.story}</p>

          {/* Plansza */}
          <div className="mb-4 flex justify-center overflow-x-auto">
            <svg
              viewBox={`0 0 ${round.figure.width * UNIT} ${round.figure.height * UNIT}`}
              className="h-auto w-full max-w-[520px] touch-none select-none"
              role="group"
              aria-label={`Plansza ${round.figure.width} na ${round.figure.height} kratek z narysowanym pokojem`}
            >
              {/* Kratownica */}
              <g stroke={`${color}30`} strokeWidth={1}>
                {Array.from({ length: round.figure.width + 1 }, (_, i) => (
                  <line
                    key={`v${i}`}
                    x1={i * UNIT}
                    y1={0}
                    x2={i * UNIT}
                    y2={round.figure.height * UNIT}
                  />
                ))}
                {Array.from({ length: round.figure.height + 1 }, (_, i) => (
                  <line
                    key={`h${i}`}
                    x1={0}
                    y1={i * UNIT}
                    x2={round.figure.width * UNIT}
                    y2={i * UNIT}
                  />
                ))}
              </g>

              {/* Kratki wnętrza — widoczna afordancja w spoczynku, nie dopiero na hover */}
              {phase === 'seed' &&
                round.figure.cells.map((cell) => (
                  <rect
                    key={`hint-${cellKey(cell)}`}
                    x={cell.x * UNIT + 3}
                    y={cell.y * UNIT + 3}
                    width={UNIT - 6}
                    height={UNIT - 6}
                    fill={color}
                    fillOpacity={0.08}
                    stroke={color}
                    strokeOpacity={0.45}
                    strokeWidth={1.5}
                    strokeDasharray="5 4"
                  />
                ))}

              {/* Kafelki */}
              {shownCells.map((cell) => (
                <motion.rect
                  key={`tile-${cellKey(cell)}`}
                  initial={{ opacity: 0, scale: 0.35 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                  style={{ transformBox: 'fill-box', transformOrigin: 'center' }}
                  x={cell.x * UNIT + 2}
                  y={cell.y * UNIT + 2}
                  width={UNIT - 4}
                  height={UNIT - 4}
                  fill={color}
                  fillOpacity={insideKeys.has(cellKey(cell)) ? 0.55 : 0.2}
                  stroke={color}
                  strokeOpacity={0.8}
                  strokeWidth={1.5}
                />
              ))}

              {/* Obrys — przerwa w nim jest widoczna, bo krawędzi po prostu nie ma */}
              <g stroke={color} strokeWidth={4} strokeLinecap="square">
                {edges.map((edge) => (
                  <line
                    key={`${edge.dir}${edge.x},${edge.y}`}
                    x1={edge.x * UNIT}
                    y1={edge.y * UNIT}
                    x2={(edge.dir === 'h' ? edge.x + 1 : edge.x) * UNIT}
                    y2={(edge.dir === 'v' ? edge.y + 1 : edge.y) * UNIT}
                  />
                ))}
              </g>

              {/* Warstwa klikalna */}
              {phase !== 'flooding' &&
                phase !== 'escaped' &&
                Array.from({ length: round.figure.width * round.figure.height }, (_, i) => {
                  const cell = {
                    x: i % round.figure.width,
                    y: Math.floor(i / round.figure.width),
                  };
                  const isInside = insideKeys.has(cellKey(cell));
                  return (
                    <rect
                      key={`hit-${cellKey(cell)}`}
                      x={cell.x * UNIT}
                      y={cell.y * UNIT}
                      width={UNIT}
                      height={UNIT}
                      fill="#fff"
                      fillOpacity={0.001}
                      className="cursor-pointer"
                      role="button"
                      tabIndex={isInside ? 0 : -1}
                      aria-label={
                        isInside
                          ? `Zalej kafelkami od kratki w kolumnie ${cell.x + 1}, wierszu ${cell.y + 1}`
                          : `Kratka poza figurą, kolumna ${cell.x + 1}, wiersz ${cell.y + 1}`
                      }
                      onClick={() => pour(cell)}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          pour(cell);
                        }
                      }}
                    />
                  );
                })}
              {/* Dziura — klikalna dopiero, gdy kafelki uciekły */}
              {round.gap && !patched && phase === 'escaped' && (
                <g
                  className="cursor-pointer"
                  onClick={patchGap}
                  role="button"
                  tabIndex={0}
                  aria-label="Zamknij przerwę w obrysie figury"
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      patchGap();
                    }
                  }}
                >
                  <line
                    x1={round.gap.x * UNIT}
                    y1={round.gap.y * UNIT}
                    x2={(round.gap.dir === 'h' ? round.gap.x + 1 : round.gap.x) * UNIT}
                    y2={(round.gap.dir === 'v' ? round.gap.y + 1 : round.gap.y) * UNIT}
                    stroke="transparent"
                    strokeWidth={26}
                  />
                  <motion.line
                    x1={round.gap.x * UNIT}
                    y1={round.gap.y * UNIT}
                    x2={(round.gap.dir === 'h' ? round.gap.x + 1 : round.gap.x) * UNIT}
                    y2={(round.gap.dir === 'v' ? round.gap.y + 1 : round.gap.y) * UNIT}
                    stroke={color}
                    strokeWidth={6}
                    strokeDasharray="7 6"
                    animate={{ opacity: [0.25, 1, 0.25] }}
                    transition={{ duration: 1.1, repeat: Infinity }}
                  />
                </g>
              )}

            </svg>
          </div>

          {/* Licznik */}
          <div
            className="mb-4 flex items-baseline justify-center gap-3 border-t-2 p-3"
            style={{ borderColor: color, backgroundColor: `${color}0f` }}
          >
            <Droplets className="h-5 w-5 self-center" style={{ color }} aria-hidden />
            <span className="text-sm text-muted-foreground">Ułożone kafelki:</span>
            <span
              className="font-mono text-3xl font-bold leading-none tabular-nums"
              style={{ color }}
              data-flood-count={counted}
            >
              {counted}
            </span>
          </div>

          {/* Komunikaty */}
          {phase === 'seed' && (
            <p className="text-center text-sm text-muted-foreground">
              Stuknij w którąkolwiek kratkę zaznaczoną przerywaną linią — to wnętrze pokoju.
            </p>
          )}

          {phase === 'flooding' && (
            <p className="text-center text-sm font-semibold" style={{ color }}>
              Kafelki się rozlewają…
            </p>
          )}

          {phase === 'outside' && (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  Zacząłeś poza figurą, więc kafelki pokryły podłogę <strong>dookoła</strong> pokoju.
                  Pole liczymy w środku figury — spróbuj jeszcze raz od kratki wewnątrz obrysu.
                </span>
              </p>
              <div className="flex justify-center">
                <Button variant="outline" onClick={reset}>
                  <Eraser className="mr-1 h-4 w-4" /> Zetrzyj kafelki
                </Button>
              </div>
            </div>
          )}

          {phase === 'escaped' && (
            <div className="space-y-3">
              <p className="flex items-start gap-2 text-sm leading-relaxed text-amber-700 dark:text-amber-300">
                <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>
                  Kafelki uciekły! Zalały całą podłogę zamiast zatrzymać się na ścianach — bo w
                  obrysie tego pokoju jest <strong>przerwa</strong>. Znajdź ją i stuknij w migającą
                  kreskę, żeby domknąć ścianę.
                </span>
              </p>
            </div>
          )}

          {phase === 'solved' && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
              <div
                className="p-4 text-center"
                style={{ backgroundColor: `${color}12` }}
              >
                <p className="font-mono text-lg font-bold tabular-nums sm:text-xl" style={{ color }}>
                  Pole = {target} {plural(target, { one: 'kratka', few: 'kratki', many: 'kratek' })}
                </p>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{round.moral}</p>
              <div className="mt-4 flex flex-wrap justify-end gap-2">
                <Button variant="outline" onClick={reset}>
                  <Eraser className="mr-1 h-4 w-4" /> Jeszcze raz
                </Button>
                <Button onClick={goNext} style={{ backgroundColor: color }}>
                  {roundIndex + 1 < ROUNDS.length ? (
                    'Następny pokój'
                  ) : (
                    <>
                      <Check className="mr-1 h-4 w-4" /> Zakończ
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
