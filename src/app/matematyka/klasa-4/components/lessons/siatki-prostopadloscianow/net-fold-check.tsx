'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Hand } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NetView } from './net-view';
import { useFoldValue } from './use-fold';
import {
  cellKey,
  cubeNetPieces,
  foldCubeNet,
  netConnected,
  FACE_SHORT,
  type BoxFaceId,
  type NetCell,
} from '../../../lib/box-net';

/** Plansza, po której wędrują kwadraty — z zapasem, żeby dało się przełożyć kwadrat na drugą stronę. */
const BOARD = { cols: 6, rows: 5 };
const VIEW_W = 440;
const VIEW_H = 300;
const PAD = 26;
const CELL = Math.min((VIEW_W - 2 * PAD) / BOARD.cols, (VIEW_H - 2 * PAD) / BOARD.rows);
const ORIGIN_X = (VIEW_W - CELL * BOARD.cols) / 2;
const ORIGIN_Y = (VIEW_H - CELL * BOARD.rows) / 2;

/** Układ wyśrodkowany na planszy — wzory opisujemy „od zera", niezależnie od rozmiaru planszy. */
function place(shape: [number, number][]): NetCell[] {
  const cols = Math.max(...shape.map(([col]) => col)) + 1;
  const rows = Math.max(...shape.map(([, row]) => row)) + 1;
  const dc = Math.floor((BOARD.cols - cols) / 2);
  const dr = Math.floor((BOARD.rows - rows) / 2);
  return shape.map(([col, row]) => ({ col: col + dc, row: row + dr }));
}

interface Round {
  id: string;
  cells: NetCell[];
  story: string;
}

/** Cztery układy do oceny: dwa są siatkami, dwa tylko tak wyglądają. */
const JUDGE_ROUNDS: Round[] = [
  {
    id: 'krzyz',
    cells: place([
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [1, 2],
      [1, 3],
    ]),
    story: 'Sześć kwadratów ułożonych w krzyż.',
  },
  {
    id: 'prostokat',
    cells: place([
      [0, 0],
      [1, 0],
      [2, 0],
      [0, 1],
      [1, 1],
      [2, 1],
    ]),
    story: 'Sześć kwadratów w równiutkim prostokącie 3 na 2. Wygląda najporządniej ze wszystkich.',
  },
  {
    id: 'wiatrak',
    cells: place([
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [0, 2],
      [2, 2],
    ]),
    story: 'Układ symetryczny jak wiatraczek — po dwa kwadraty na dole, trzy w środku, jeden na górze.',
  },
  {
    id: 'zygzak',
    cells: place([
      [0, 0],
      [0, 1],
      [1, 1],
      [1, 2],
      [2, 2],
      [2, 3],
    ]),
    story: 'Schodki: kwadraty schodzą w dół, przesuwając się co dwa o jeden w bok.',
  },
];

/** Trzy układy do naprawy — każdy da się uratować przełożeniem jednego kwadratu. */
const REPAIR_ROUNDS: Round[] = [
  {
    id: 'kwadrat-z-ogonem',
    cells: place([
      [0, 0],
      [1, 0],
      [0, 1],
      [1, 1],
      [2, 1],
      [3, 1],
    ]),
    story: 'Kwadrat 2 na 2 i doczepiony do niego ogon z dwóch kwadratów.',
  },
  {
    id: 'litera-l',
    cells: place([
      [0, 0],
      [0, 1],
      [0, 2],
      [0, 3],
      [1, 3],
      [2, 3],
    ]),
    story: 'Duża litera L: cztery kwadraty w słupku i dwa w stopce.',
  },
  {
    id: 'slupek',
    cells: place([
      [0, 0],
      [0, 1],
      [1, 1],
      [0, 2],
      [1, 2],
      [1, 3],
    ]),
    story: 'Dwie kolumny po trzy kwadraty, przesunięte względem siebie o jeden.',
  },
];

type Phase = 'edit' | 'folding' | 'result';

interface NetFoldCheckProps {
  /** `judge` — oceń układ i sprawdź składając; `repair` — przełóż jeden kwadrat, żeby siatka się domknęła. */
  mode: 'judge' | 'repair';
  color: string;
  onComplete?: () => void;
}

/**
 * Składanie siatki jako **sprawdzian układu**: dziecko nie porównuje rysunku
 * z listą „dozwolonych" wzorów, tylko każe siatce się złożyć i patrzy, co
 * z tego wyjdzie. O werdykcie decyduje `foldCubeNet` — spacer po kwadratach
 * pilnujący, na którą ścianę bryły trafia każdy z nich — a animacja pokazuje
 * dokładnie to samo: przy złym układzie dwa kwadraty naprawdę nachodzą na
 * siebie, a jedna ściana zostaje odkryta.
 *
 * Jeden mechanizm, dwie narracje (ten sam wzorzec co `MoneyPurse`/`AngleBuilder`):
 * - `judge` — cztery gotowe układy do oceny „złoży się / nie złoży się";
 * - `repair` — układ, który się nie domyka, i jeden kwadrat do przełożenia.
 */
export function NetFoldCheck({ mode, color, onComplete }: NetFoldCheckProps) {
  const rounds = mode === 'judge' ? JUDGE_ROUNDS : REPAIR_ROUNDS;

  const [index, setIndex] = useState(0);
  const [cells, setCells] = useState<NetCell[]>(rounds[0].cells);
  const [phase, setPhase] = useState<Phase>('edit');
  const [answer, setAnswer] = useState<'tak' | 'nie' | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [moves, setMoves] = useState(0);
  const [solved, setSolved] = useState<string[]>([]);

  const { value: fold, set: setFold, animateTo } = useFoldValue(0, 1100);

  const round = rounds[Math.min(index, rounds.length - 1)];
  const result = foldCubeNet(cells);
  const pieces = cubeNetPieces(result);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const finished = solved.length === rounds.length;
  const answeredRight = answer !== null && (answer === 'tak') === result.ok;

  const startFold = () => {
    setPhase('folding');
    animateTo(1, () => setPhase('result'));
  };

  const judge = (choice: 'tak' | 'nie') => {
    if (phase !== 'edit') return;
    setAnswer(choice);
    startFold();
  };

  const unfold = () => {
    setFold(0);
    setPhase('edit');
    setNote(null);
  };

  const goNext = () => {
    const nextIndex = index + 1;
    const done = [...new Set([...solved, round.id])];
    setSolved(done);
    setFold(0);
    setPhase('edit');
    setAnswer(null);
    setPicked(null);
    setNote(null);
    setMoves(0);

    if (nextIndex < rounds.length) {
      setIndex(nextIndex);
      setCells(rounds[nextIndex].cells);
    }
    if (done.length === rounds.length) onComplete?.();
  };

  const tapCell = (col: number, row: number) => {
    if (mode !== 'repair' || phase !== 'edit') return;
    const key = cellKey({ col, row });
    const taken = cells.some((cell) => cellKey(cell) === key);

    if (taken) {
      if (picked === key) {
        setPicked(null);
        return;
      }
      const rest = cells.filter((cell) => cellKey(cell) !== key);
      if (!netConnected(rest)) {
        setNote('Bez tego kwadratu siatka rozpadłaby się na dwa osobne kawałki. Weź inny.');
        return;
      }
      setPicked(key);
      setNote(null);
      return;
    }

    if (!picked) {
      setNote('Najpierw stuknij kwadrat, który chcesz przełożyć.');
      return;
    }

    const rest = cells.filter((cell) => cellKey(cell) !== picked);
    const next = [...rest, { col, row }];
    if (!netConnected(next)) {
      setNote('Kwadrat musi stykać się z resztą siatki całą krawędzią — samym rogiem to za mało.');
      return;
    }

    setCells(next);
    setPicked(null);
    setNote(null);
    setMoves(moves + 1);
  };

  const faceList = result.ok
    ? result.cells
        .map((cell) => (cell.face ? FACE_SHORT[cell.face as BoxFaceId] : '?'))
        .join(' · ')
    : '';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <div className="flex items-center gap-2">
          {rounds.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: solved.includes(item.id) ? color : `${color}33`,
                outline: i === index && !finished ? `2px solid ${color}` : undefined,
                outlineOffset: '2px',
              }}
              aria-hidden
            />
          ))}
          <span className="ml-1 text-xs font-semibold text-muted-foreground">
            {mode === 'judge' ? 'układ' : 'siatka'} {Math.min(index + 1, rounds.length)} z {rounds.length}
          </span>
        </div>
        {mode === 'repair' && (
          <span className="text-xs font-semibold text-muted-foreground">
            przełożone kwadraty: <span className="font-mono tabular-nums">{moves}</span>
          </span>
        )}
      </div>

      <p className="mb-4 text-base leading-relaxed sm:text-lg">
        {finished ? (
          mode === 'judge' ? (
            <>
              Cztery układy sprawdzone. Zapamiętaj najważniejsze:{' '}
              <strong style={{ color: textColor }}>sześć kwadratów to za mało, żeby mówić
              o siatce</strong> — muszą jeszcze trafić na sześć różnych ścian.
            </>
          ) : (
            <>
              Wszystkie trzy naprawione. Za każdym razem wystarczył{' '}
              <strong style={{ color: textColor }}>jeden kwadrat przełożony w inne miejsce</strong> —
              bo o siatce decyduje układ, a nie liczba kwadratów.
            </>
          )
        ) : (
          <>
            {round.story}{' '}
            {mode === 'judge' ? (
              <strong style={{ color: textColor }}>Złoży się w pudełko?</strong>
            ) : (
              <strong style={{ color: textColor }}>
                Przełóż jeden kwadrat tak, żeby siatka się domknęła.
              </strong>
            )}
          </>
        )}
      </p>

      <div className="border" style={{ borderColor: `${color}33` }}>
        <AnimatePresence mode="wait" initial={false}>
          {phase === 'edit' ? (
            <motion.div key="board" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <svg
                viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
                className="h-auto w-full"
                role="img"
                aria-label={`Układ sześciu kwadratów na kartce w kratkę: ${round.story}`}
              >
                {Array.from({ length: BOARD.rows }).map((_, row) =>
                  Array.from({ length: BOARD.cols }).map((__, col) => {
                    const key = cellKey({ col, row });
                    const filled = cells.some((cell) => cellKey(cell) === key);
                    const isPicked = picked === key;
                    const clickable = mode === 'repair';

                    return (
                      <rect
                        key={key}
                        x={ORIGIN_X + col * CELL}
                        y={ORIGIN_Y + row * CELL}
                        width={CELL}
                        height={CELL}
                        fill={filled ? `${color}${isPicked ? '73' : '3d'}` : `${color}08`}
                        stroke={filled ? color : `${color}40`}
                        strokeWidth={filled ? 1.6 : 1}
                        strokeDasharray={filled ? undefined : '4 4'}
                        onClick={clickable ? () => tapCell(col, row) : undefined}
                        className={cn(clickable && 'cursor-pointer')}
                      />
                    );
                  })
                )}
                {picked && (
                  <rect
                    x={ORIGIN_X + Number(picked.split(':')[0]) * CELL + 4}
                    y={ORIGIN_Y + Number(picked.split(':')[1]) * CELL + 4}
                    width={CELL - 8}
                    height={CELL - 8}
                    fill="none"
                    stroke={color}
                    strokeWidth={2}
                    strokeDasharray="5 4"
                  />
                )}
              </svg>
            </motion.div>
          ) : (
            <motion.div key="fold" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <NetView
                pieces={pieces}
                t={fold}
                color={color}
                labels="nazwy"
                frame={{ width: BOARD.cols, height: BOARD.rows }}
                highlight={phase === 'result' ? result.clash : []}
                ariaLabel={
                  phase === 'result'
                    ? result.ok
                      ? 'Złożone pudełko'
                      : 'Układ po złożeniu — dwa kwadraty nachodzą na siebie'
                    : 'Siatka w trakcie składania'
                }
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {mode === 'repair' && phase === 'edit' && (
        <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
          <Hand className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            {picked
              ? 'Teraz stuknij puste pole, w które ma trafić ten kwadrat.'
              : 'Stuknij kwadrat, który chcesz przełożyć — potem puste pole obok siatki.'}
          </span>
        </p>
      )}

      <AnimatePresence mode="wait">
        {note && (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-2 text-sm leading-relaxed text-muted-foreground"
          >
            {note}
          </motion.p>
        )}
      </AnimatePresence>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        {mode === 'judge' && phase === 'edit' && !finished && (
          <>
            {(['tak', 'nie'] as const).map((choice) => (
              <button
                key={choice}
                type="button"
                onClick={() => judge(choice)}
                className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-all hover:-translate-y-0.5"
                style={{ borderColor: color, color: textColor }}
              >
                {choice === 'tak' ? 'Złoży się' : 'Nie złoży się'}
              </button>
            ))}
          </>
        )}

        {mode === 'repair' && phase === 'edit' && !finished && (
          <button
            type="button"
            onClick={startFold}
            className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ borderColor: color, backgroundColor: `${color}14`, color: textColor }}
          >
            Złóż i sprawdź
          </button>
        )}

        {phase === 'result' && !result.ok && mode === 'repair' && (
          <button
            type="button"
            onClick={unfold}
            className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ borderColor: color, color: textColor }}
          >
            Rozłóż i popraw
          </button>
        )}

        {phase === 'result' && (mode === 'judge' || result.ok) && !finished && (
          <button
            type="button"
            onClick={goNext}
            className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
            style={{ borderColor: color, backgroundColor: `${color}14`, color: textColor }}
          >
            {index + 1 < rounds.length
              ? mode === 'judge'
                ? 'Następny układ'
                : 'Następna siatka'
              : 'Zakończ'}
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        {phase === 'result' && (
          <motion.div
            key={`${round.id}-${result.ok}-${moves}`}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-4 pl-4"
            style={{ borderColor: result.ok ? color : '#dc2626' }}
          >
            {mode === 'judge' && (
              <p className="mb-1 text-sm font-bold" style={{ color: answeredRight ? textColor : '#b91c1c' }}>
                {answeredRight ? 'Dobrze!' : 'Nie tym razem — ale złożenie właśnie to pokazało.'}
              </p>
            )}
            <p className="text-sm leading-relaxed sm:text-base">{result.message}</p>
            {result.ok && (
              <p className="mt-1 font-mono text-xs tabular-nums text-muted-foreground">{faceList}</p>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {finished && (
        <p className="mt-4 flex items-start gap-3 border p-3 text-sm leading-relaxed sm:text-base"
          style={{ backgroundColor: `${color}0f`, borderColor: `${color}59` }}
        >
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            {mode === 'judge'
              ? 'Sześcian ma dokładnie 11 różnych siatek — a kwadraty da się ułożyć na dużo więcej sposobów. Dlatego każdy nowy układ trzeba sprawdzić składaniem, a nie samym spojrzeniem.'
              : 'Zwróć uwagę, co psuło każdy z tych układów: dwa kwadraty schodziły się na tej samej ścianie, a inna zostawała odkryta. Przełożenie jednego kwadratu zdejmuje ten konflikt.'}
          </span>
        </p>
      )}

      {/* Treść wszystkich układów zawsze w DOM — widżet odsłania je po kolei. */}
      <ul className="sr-only">
        {rounds.map((item) => (
          <li key={item.id}>
            {item.story} {foldCubeNet(item.cells).message}
          </li>
        ))}
      </ul>
    </div>
  );
}
