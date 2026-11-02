'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Undo2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { SolidSpinner } from '../../solid-spinner';
import { boxEdgeGroups, boxSkeletonLength, type BoxAxis, type BoxSpec } from '../../../lib/solids';

/** Prawdziwe centymetry — te same liczby jadą na rysunek, do patyczków i do wyniku. */
const SPEC: BoxSpec = { width: 8, height: 3, depth: 5 };
const TOTAL = boxSkeletonLength(SPEC);
/** Kolejność tacki: od najdłuższego patyczka. */
const TRAY_ORDER: BoxAxis[] = ['x', 'z', 'y'];
const CUBE_WIRE = 60;
const CUBE_EDGE = CUBE_WIRE / 12;

/**
 * Zadanie problemowe: zbuduj szkielet pudełka z patyczków i policz, ile drutu
 * poszło. Dziecko nie wpisuje wzoru — bierze patyczki z tacki, a wzór
 * `4 · (a + b + c)` układa się sam z tego, co zostało zużyte. Druga runda
 * odwraca działanie: znany jest cały drut, szukana krawędź sześcianu.
 *
 * Przekroczenie limitu nie blokuje — tacka drga i tłumaczy, dlaczego czwarty
 * patyczek danej długości jest ostatni (zasada „żaden klik nie jest złym
 * kliknięciem"), a `Cofnij ostatni patyczek` odkręca każdy ruch.
 */
export function StickFrame({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const groups = useMemo(() => boxEdgeGroups(SPEC), []);
  const [placed, setPlaced] = useState<string[]>([]);
  const [refused, setRefused] = useState<BoxAxis | null>(null);
  const [round, setRound] = useState<1 | 2>(1);
  const [guess, setGuess] = useState('');
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);

  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const usedWire = placed.reduce((sum, edgeId) => {
    const group = groups.find((item) => item.edgeIds.includes(edgeId));
    return sum + (group?.length ?? 0);
  }, 0);
  const frameDone = placed.length === groups.reduce((n, g) => n + g.edgeIds.length, 0);

  const usedIn = (axis: BoxAxis) =>
    placed.filter((edgeId) => groups.find((g) => g.axis === axis)?.edgeIds.includes(edgeId)).length;

  const addStick = (axis: BoxAxis) => {
    const group = groups.find((item) => item.axis === axis);
    if (!group) return;
    const free = group.edgeIds.find((edgeId) => !placed.includes(edgeId));
    if (!free) {
      setRefused(axis);
      return;
    }
    setRefused(null);
    const next = [...placed, free];
    setPlaced(next);
  };

  const undo = () => {
    setRefused(null);
    setPlaced(placed.slice(0, -1));
  };

  const checkCube = () => {
    const value = Number(guess.replace(',', '.').trim());
    if (value === CUBE_EDGE) {
      setWrong(false);
      setSolved(true);
      onComplete?.();
      return;
    }
    setWrong(true);
  };

  const trayGroups = TRAY_ORDER.flatMap((axis) => groups.filter((group) => group.axis === axis));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex items-center gap-2">
        {[1, 2].map((n) => (
          <span
            key={n}
            className="h-2 w-8"
            style={{ backgroundColor: n <= round ? color : `${color}26` }}
            aria-hidden
          />
        ))}
        <span className="ml-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Runda {round} z 2
        </span>
      </div>

      {round === 1 ? (
        <>
          <p className="mb-4 text-sm leading-relaxed sm:text-base">
            Chcesz zbudować z patyczków sam <strong>szkielet</strong> pudełka o wymiarach{' '}
            <strong style={{ color: textColor }}>
              {SPEC.width} cm × {SPEC.depth} cm × {SPEC.height} cm
            </strong>{' '}
            — same krawędzie, bez ścianek. Bierz patyczki z tacki i sprawdź, ile drutu na to pójdzie.
          </p>

          <div className="grid items-center gap-6 md:grid-cols-[300px_1fr]">
            <SolidSpinner
              spec={SPEC}
              color={color}
              marked={placed}
              ariaLabel={`Szkielet pudełka ${SPEC.width} na ${SPEC.depth} na ${SPEC.height} centymetrów — ${placed.length} z 12 krawędzi ułożonych`}
            />

            <div>
              <p className="mb-2 text-xs font-bold uppercase tracking-wide" style={{ color: textColor }}>
                Tacka z patyczkami
              </p>
              <div className="grid gap-2">
                {trayGroups.map((group) => {
                  const used = usedIn(group.axis);
                  const full = used === group.edgeIds.length;
                  return (
                    <motion.button
                      key={group.axis}
                      type="button"
                      onClick={() => addStick(group.axis)}
                      animate={refused === group.axis ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                      transition={{ duration: 0.35 }}
                      className="flex cursor-pointer items-center justify-between gap-3 border px-4 py-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-md"
                      style={{
                        borderColor: full ? color : `${color}40`,
                        backgroundColor: full ? `${color}0c` : undefined,
                      }}
                    >
                      <span className="flex items-center gap-3">
                        <span
                          className="h-1.5 rounded-full"
                          style={{
                            width: `${group.length * 5}px`,
                            backgroundColor: color,
                          }}
                          aria-hidden
                        />
                        <span className="font-mono text-base font-bold tabular-nums" style={{ color }}>
                          {group.length} cm
                        </span>
                      </span>
                      <span className="font-mono text-sm tabular-nums text-muted-foreground">
                        {used}/{group.edgeIds.length}
                      </span>
                    </motion.button>
                  );
                })}
              </div>

              <AnimatePresence>
                {refused && (
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="mt-3 text-sm leading-relaxed text-muted-foreground"
                  >
                    Czwarty patyczek tej długości był ostatni — każdy wymiar prostopadłościanu
                    powtarza się dokładnie cztery razy. Weź patyczek innej długości.
                  </motion.p>
                )}
              </AnimatePresence>

              <div className="mt-4 flex flex-wrap items-center gap-3 border-t pt-4">
                <p className="font-mono text-2xl font-black tabular-nums" style={{ color }}>
                  {usedWire} cm
                </p>
                <p className="text-sm text-muted-foreground">
                  zużytego drutu · {placed.length}/12 krawędzi
                </p>
                {placed.length > 0 && !frameDone && (
                  <button
                    type="button"
                    onClick={undo}
                    className="ml-auto inline-flex cursor-pointer items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
                  >
                    <Undo2 className="h-4 w-4" aria-hidden />
                    Cofnij ostatni patyczek
                  </button>
                )}
              </div>

              {frameDone && (
                <motion.div
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-4 border-l-4 py-2 pl-4"
                  style={{ borderColor: color, backgroundColor: `${color}0c` }}
                >
                  <p className="font-mono text-lg font-black tabular-nums" style={{ color }}>
                    4 · ({SPEC.width} + {SPEC.depth} + {SPEC.height}) = {TOTAL} cm
                  </p>
                  <p className="mt-1 text-sm leading-relaxed">
                    Nie trzeba było dodawać dwunastu liczb — wystarczyło zsumować trzy wymiary
                    i pomnożyć przez cztery, bo każdy z nich powtarza się cztery razy.
                  </p>
                  <Button
                    size="sm"
                    className="mt-3"
                    onClick={() => setRound(2)}
                    style={{ backgroundColor: color }}
                  >
                    Druga runda: w drugą stronę
                  </Button>
                </motion.div>
              )}
            </div>
          </div>
        </>
      ) : (
        <div className="grid items-center gap-6 md:grid-cols-[300px_1fr]">
          <SolidSpinner
            spec={{ width: 3.6, height: 3.6, depth: 3.6 }}
            color={color}
            ariaLabel="Sześcian — szkielet z drutu o nieznanej długości krawędzi"
          />
          <div>
            <p className="mb-4 text-sm leading-relaxed sm:text-base">
              Masz <strong style={{ color: textColor }}>{CUBE_WIRE} cm</strong> drutu i chcesz zgiąć
              z niego szkielet <strong>sześcianu</strong> — tak, żeby nie została ani jedna
              resztka. Jak długa może być jego krawędź?
            </p>

            <motion.div
              animate={wrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
              transition={{ duration: 0.35 }}
              className="flex flex-wrap items-center gap-3"
            >
              <Input
                inputMode="decimal"
                value={guess}
                disabled={solved}
                onChange={(event) => {
                  setGuess(event.target.value);
                  setWrong(false);
                }}
                onKeyDown={(event) => event.key === 'Enter' && checkCube()}
                className="w-28 font-mono text-lg tabular-nums"
                aria-label="Długość krawędzi sześcianu w centymetrach"
              />
              <span className="font-mono text-sm text-muted-foreground">cm</span>
              {!solved && (
                <Button size="sm" onClick={checkCube} style={{ backgroundColor: color }}>
                  Sprawdź
                </Button>
              )}
            </motion.div>

            {wrong && !solved && (
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                Jeszcze nie to. Sześcian ma dwanaście krawędzi i wszystkie są równe — więc cały drut
                dzieli się na dwanaście jednakowych kawałków. Spróbuj dalej.
              </p>
            )}

            {solved && (
              <motion.div
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 border-l-4 py-2 pl-4"
                style={{ borderColor: color, backgroundColor: `${color}0c` }}
              >
                <p className="font-mono text-lg font-black tabular-nums" style={{ color }}>
                  {CUBE_WIRE} : 12 = {CUBE_EDGE} cm
                </p>
                <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  Sprawdzenie: 12 · {CUBE_EDGE} = {CUBE_WIRE} cm. Tam, gdzie w pierwszej rundzie
                  mnożyłeś, tutaj dzielisz — to jedno i to samo działanie, tylko czytane od końca.
                </p>
              </motion.div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
