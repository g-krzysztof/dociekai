'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Hand, PenLine, RotateCcw, Ruler } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Haczyk lekcji o edytorze grafiki — **pierwszy widżet w kursie, który mierzy
 * rękę dziecka**.
 *
 * O narzędziach edytora nie da się przekonać zdaniem „narzędzia są wygodne”.
 * Więc dziecko robi to samo zadanie dwa razy: raz odręcznie (palcem albo
 * myszką), raz narzędziem — a strona liczy, o ile kreska odjechała od prostej
 * i o ile promień koła się waha. To ten sam wzorzec, co para `AbacusDrill` +
 * `PascalinaSim` z lekcji o historii komputera: nie opisuj różnicy, każ ją
 * wykonać dwa razy.
 *
 * Liczby są prawdziwe: `lineWobble` liczy maksymalną odległość punktu kreski od
 * idealnego odcinka, `circleWobble` — rozrzut promienia względem środka ciężkości
 * kreski. Narzędzie zawsze wychodzi na 0,0, bo ono nie rysuje ręką.
 */

const W = 320;
const H = 190;

/** Pinezki zadania „prosta kreska” — kreska ma iść od jednej do drugiej. */
const PIN_A = { x: 46, y: 140 };
const PIN_B = { x: 274, y: 54 };
/** Ile wolno chybić pinezki, żeby próba się liczyła. */
const PIN_TOLERANCE = 38;

interface Point {
  x: number;
  y: number;
}

interface Attempt {
  /** Odchyłka w jednostkach rysunku (px na płótnie 320×190). */
  wobble: number;
  seconds: number;
  points: Point[];
  /** Narzędzie rysuje figurę idealną — trzymamy ją osobno od kreski odręcznej. */
  perfect?: { kind: 'linia'; from: Point; to: Point } | { kind: 'kolo'; c: Point; r: number };
}

type RoundId = 'kreska' | 'kolo';

interface Round {
  id: RoundId;
  task: string;
  hand: string;
  tool: string;
  toolName: string;
  unit: string;
  /** Co znaczy zmierzona liczba — pod tabelką wyników. */
  meaning: string;
}

const ROUNDS: Round[] = [
  {
    id: 'kreska',
    task: 'Połącz dwie pinezki jedną prostą kreską.',
    hand: 'Rysuj od pinezki do pinezki — palcem albo myszką, jednym ruchem.',
    tool: 'To samo narzędziem Linia: przyciśnij przy jednej pinezce, przeciągnij do drugiej i puść.',
    toolName: 'Linia',
    unit: 'odchyłka od prostej',
    meaning:
      'Odchyłka to najdalszy punkt twojej kreski od idealnej prostej między pinezkami. Ręka nigdy nie ma zera — i nie musi.',
  },
  {
    id: 'kolo',
    task: 'Narysuj koło. Ma być okrągłe, nie jajowate.',
    hand: 'Rysuj jednym ruchem i wróć do miejsca, w którym zacząłeś/zaczęłaś.',
    tool: 'To samo narzędziem Elipsa z włączonym „równo”: przyciśnij i przeciągnij na ukos.',
    toolName: 'Elipsa',
    unit: 'wahanie promienia',
    meaning:
      'Wahanie promienia mówi, o ile twoje koło jest w jednym miejscu szersze niż w drugim. Zero znaczy: idealnie okrągłe.',
  },
];

/** Najdalszy punkt kreski od odcinka A–B. */
function lineWobble(points: Point[], from: Point, to: Point): number {
  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const len = Math.hypot(dx, dy) || 1;
  return points.reduce((worst, point) => {
    const distance = Math.abs(dy * point.x - dx * point.y + to.x * from.y - to.y * from.x) / len;
    return Math.max(worst, distance);
  }, 0);
}

/** Rozrzut promienia względem środka ciężkości kreski — miara „okrągłości”. */
function circleWobble(points: Point[]): number {
  const cx = points.reduce((sum, point) => sum + point.x, 0) / points.length;
  const cy = points.reduce((sum, point) => sum + point.y, 0) / points.length;
  const radii = points.map((point) => Math.hypot(point.x - cx, point.y - cy));
  return (Math.max(...radii) - Math.min(...radii)) / 2;
}

function near(a: Point, b: Point, tolerance = PIN_TOLERANCE): boolean {
  return Math.hypot(a.x - b.x, a.y - b.y) <= tolerance;
}

const fmt = (value: number) => value.toFixed(1).replace('.', ',');

interface SteadyHandProps {
  color: string;
  onComplete?: () => void;
}

export function SteadyHand({ color, onComplete }: SteadyHandProps) {
  const [roundIndex, setRoundIndex] = useState(0);
  const [results, setResults] = useState<Record<string, { hand?: Attempt; tool?: Attempt }>>({});
  const [done, setDone] = useState(false);
  const anchorRef = useSectionScrollAnchor(roundIndex);

  const round = ROUNDS[roundIndex];
  const result = results[round.id] ?? {};
  const mode: 'hand' | 'tool' = result.hand ? 'tool' : 'hand';
  const bothDone = Boolean(result.hand && result.tool);
  const lastRound = roundIndex === ROUNDS.length - 1;

  const save = (attempt: Attempt, which: 'hand' | 'tool') => {
    setResults((prev) => ({ ...prev, [round.id]: { ...prev[round.id], [which]: attempt } }));
  };

  const next = () => {
    if (lastRound) {
      setDone(true);
      onComplete?.();
      return;
    }
    setRoundIndex((prev) => prev + 1);
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Próba {roundIndex + 1} z {ROUNDS.length}
        </p>
        <div className="flex gap-1.5" aria-hidden>
          {ROUNDS.map((item, i) => (
            <span
              key={item.id}
              className="h-1.5 w-8"
              style={{
                backgroundColor:
                  i < roundIndex || (i === roundIndex && bothDone) ? color : `${color}25`,
              }}
            />
          ))}
        </div>
      </div>

      <p className="mb-1 text-base font-bold sm:text-lg">{round.task}</p>
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        {mode === 'hand' ? round.hand : round.tool}
      </p>

      <div className="grid gap-5 md:grid-cols-[minmax(0,360px)_1fr]">
        <Sketchpad
          key={`${round.id}-${mode}`}
          round={round}
          mode={mode}
          color={color}
          onAttempt={(attempt) => save(attempt, mode)}
          existing={mode === 'tool' ? result.hand : undefined}
        />

        <div className="min-w-0">
          <Scoreboard round={round} result={result} color={color} />

          <AnimatePresence>
            {bothDone && !done && (
              <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                <button
                  type="button"
                  onClick={next}
                  className="mt-4 w-full cursor-pointer px-4 py-3 text-sm font-bold text-white transition-opacity hover:opacity-90"
                  style={{ backgroundColor: color }}
                >
                  {lastRound ? 'Wiem już, po co są narzędzia' : 'Druga próba: koło'}
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-l-4 bg-muted/40 p-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p className="font-bold">
              Narzędzia w edytorze nie są dla ludzi, którzy nie umieją rysować.
            </p>
            <p className="mt-2">
              Są po to, żeby <strong>twoja ręka nie musiała być maszyną</strong>. Prostą kreskę,
              okrąg, prostokąt i równe wypełnienie kolorem robi za ciebie program — a ty zajmujesz
              się tym, czego program nie wymyśli: co właściwie ma być na tym obrazku. Przez resztę
              lekcji poznasz te narzędzia po kolei.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/** Pole do rysowania — w trybie `hand` zbiera kreskę, w trybie `tool` rysuje figurę idealną. */
function Sketchpad({
  round,
  mode,
  color,
  existing,
  onAttempt,
}: {
  round: Round;
  mode: 'hand' | 'tool';
  color: string;
  /** Kreska odręczna z pierwszej próby — zostaje bladym śladem pod figurą narzędzia. */
  existing?: Attempt;
  onAttempt: (attempt: Attempt) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const startedAt = useRef(0);
  const drawing = useRef(false);
  const [points, setPoints] = useState<Point[]>([]);
  const [preview, setPreview] = useState<{ from: Point; to: Point } | null>(null);
  const [locked, setLocked] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const toCanvas = (event: ReactPointerEvent<SVGSVGElement>): Point => {
    const rect = svgRef.current?.getBoundingClientRect();
    if (!rect) return { x: 0, y: 0 };
    return {
      x: Math.min(W, Math.max(0, ((event.clientX - rect.left) / rect.width) * W)),
      y: Math.min(H, Math.max(0, ((event.clientY - rect.top) / rect.height) * H)),
    };
  };

  const start = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (locked) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    drawing.current = true;
    startedAt.current = performance.now();
    setProblem(null);
    const point = toCanvas(event);
    if (mode === 'hand') setPoints([point]);
    else setPreview({ from: point, to: point });
  };

  const move = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!drawing.current) return;
    const point = toCanvas(event);
    if (mode === 'tool') {
      setPreview((prev) => (prev ? { ...prev, to: point } : prev));
      return;
    }
    setPoints((prev) => {
      const last = prev[prev.length - 1];
      if (last && Math.abs(last.x - point.x) + Math.abs(last.y - point.y) < 2) return prev;
      return [...prev, point];
    });
  };

  const stop = () => {
    if (!drawing.current) return;
    drawing.current = false;
    const seconds = (performance.now() - startedAt.current) / 1000;

    if (mode === 'hand') {
      const complaint = judgeHand(round.id, points);
      if (complaint) {
        setProblem(complaint);
        setPoints([]);
        return;
      }
      const wobble =
        round.id === 'kreska' ? lineWobble(points, PIN_A, PIN_B) : circleWobble(points);
      setLocked(true);
      onAttempt({ wobble, seconds, points });
      return;
    }

    if (!preview) return;
    const complaint = judgeTool(round.id, preview);
    if (complaint) {
      setProblem(complaint);
      setPreview(null);
      return;
    }
    setLocked(true);
    onAttempt({
      wobble: 0,
      seconds,
      points: [],
      perfect:
        round.id === 'kreska'
          ? { kind: 'linia', from: PIN_A, to: PIN_B }
          : { kind: 'kolo', c: midpoint(preview), r: circleRadius(preview) },
    });
  };

  const shape =
    preview && round.id === 'kolo' ? { c: midpoint(preview), r: circleRadius(preview) } : null;

  return (
    <div>
      <div className="border-2" style={{ borderColor: `${color}55` }}>
        <svg
          ref={svgRef}
          viewBox={`0 0 ${W} ${H}`}
          className={cn(
            'block h-auto w-full bg-white',
            locked ? 'cursor-default' : 'cursor-crosshair'
          )}
          style={{ touchAction: 'none' }}
          onPointerDown={start}
          onPointerMove={move}
          onPointerUp={stop}
          onPointerCancel={stop}
          role="application"
          aria-label={
            mode === 'hand' ? 'Pole do rysowania odręcznego' : 'Pole do rysowania narzędziem'
          }
        >
          {/* Ślad odręcznej próby zostaje pod figurą narzędzia — po to, żeby było co porównać */}
          {existing && (
            <polyline
              points={existing.points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="#d4d4d8"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {round.id === 'kreska' && (
            <>
              {[PIN_A, PIN_B].map((pin, i) => (
                <g key={i}>
                  <circle cx={pin.x} cy={pin.y} r={7} fill="#fff" stroke="#a1a1aa" />
                  <circle cx={pin.x} cy={pin.y} r={3.5} fill="#ef4444" />
                </g>
              ))}
            </>
          )}

          {points.length > 1 && (
            <polyline
              points={points.map((point) => `${point.x},${point.y}`).join(' ')}
              fill="none"
              stroke="#1f2937"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          )}

          {mode === 'tool' && preview && round.id === 'kreska' && (
            <line
              x1={preview.from.x}
              y1={preview.from.y}
              x2={preview.to.x}
              y2={preview.to.y}
              stroke={locked ? color : '#a1a1aa'}
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={locked ? undefined : '4 4'}
            />
          )}
          {mode === 'tool' && locked && round.id === 'kreska' && (
            <line
              x1={PIN_A.x}
              y1={PIN_A.y}
              x2={PIN_B.x}
              y2={PIN_B.y}
              stroke={color}
              strokeWidth={3}
              strokeLinecap="round"
            />
          )}
          {mode === 'tool' && shape && (
            <circle
              cx={shape.c.x}
              cy={shape.c.y}
              r={shape.r}
              fill="none"
              stroke={locked ? color : '#a1a1aa'}
              strokeWidth={3}
              strokeDasharray={locked ? undefined : '4 4'}
            />
          )}
        </svg>
      </div>

      <div className="mt-2 flex min-h-[2.25rem] items-start justify-between gap-3">
        <p className="text-xs leading-snug text-muted-foreground">
          {problem ??
            (locked
              ? 'Gotowe — wynik obok.'
              : mode === 'hand'
                ? 'Rysuj jednym ruchem.'
                : 'Przyciśnij i przeciągnij.')}
        </p>
        {!locked && (points.length > 0 || preview) && (
          <button
            type="button"
            onClick={() => {
              setPoints([]);
              setPreview(null);
              setProblem(null);
            }}
            className="inline-flex shrink-0 cursor-pointer items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <RotateCcw className="h-3 w-3" aria-hidden />
            Wyczyść
          </button>
        )}
      </div>
    </div>
  );
}

function midpoint(box: { from: Point; to: Point }): Point {
  return { x: (box.from.x + box.to.x) / 2, y: (box.from.y + box.to.y) / 2 };
}

/** „Równo” jest tu włączone na stałe — narzędzie rysuje koło wpisane w kwadrat przeciągnięcia. */
function circleRadius(box: { from: Point; to: Point }): number {
  return Math.max(Math.abs(box.to.x - box.from.x), Math.abs(box.to.y - box.from.y)) / 2;
}

function judgeHand(id: RoundId, points: Point[]): string | null {
  if (points.length < 8) return 'Za krótka kreska — narysuj całe zadanie jednym ruchem.';
  if (id === 'kreska') {
    const first = points[0];
    const last = points[points.length - 1];
    const ok =
      (near(first, PIN_A) && near(last, PIN_B)) || (near(first, PIN_B) && near(last, PIN_A));
    if (!ok) return 'Zacznij przy jednej pinezce i skończ przy drugiej.';
    return null;
  }
  if (points.length < 18) return 'Koło rysuj wolniej — potrzeba więcej niż kilku punktów.';
  if (!near(points[0], points[points.length - 1], 45))
    return 'Domknij koło — wróć tam, gdzie zacząłeś/zaczęłaś.';
  return null;
}

function judgeTool(id: RoundId, box: { from: Point; to: Point }): string | null {
  if (id === 'kreska') {
    const ok =
      (near(box.from, PIN_A) && near(box.to, PIN_B)) ||
      (near(box.from, PIN_B) && near(box.to, PIN_A));
    if (!ok) return 'Celuj w pinezki: przyciśnij przy jednej, puść przy drugiej.';
    return null;
  }
  if (circleRadius(box) < 28) return 'Przeciągnij dalej — koło ma być większe.';
  return null;
}

function Scoreboard({
  round,
  result,
  color,
}: {
  round: Round;
  result: { hand?: Attempt; tool?: Attempt };
  color: string;
}) {
  const rows: { icon: typeof Hand; label: string; attempt?: Attempt; tone: string }[] = [
    { icon: Hand, label: 'Twoja ręka', attempt: result.hand, tone: '#71717a' },
    { icon: Ruler, label: `Narzędzie ${round.toolName}`, attempt: result.tool, tone: color },
  ];

  return (
    <div>
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {round.unit}
      </p>
      <div className="divide-y border">
        {rows.map((row) => {
          const Icon = row.icon;
          return (
            <div key={row.label} className="flex items-center gap-3 p-3">
              <Icon className="h-4 w-4 shrink-0" style={{ color: row.tone }} aria-hidden />
              <span className="min-w-0 flex-1 text-sm font-medium">{row.label}</span>
              {row.attempt ? (
                <span className="shrink-0 text-right">
                  <span
                    className="block text-lg font-black tabular-nums leading-none"
                    style={{ color: row.tone }}
                  >
                    {fmt(row.attempt.wobble)} px
                  </span>
                  <span className="block text-xs text-muted-foreground tabular-nums">
                    {fmt(row.attempt.seconds)} s
                  </span>
                </span>
              ) : (
                <span className="shrink-0 text-xs text-muted-foreground">— czekam</span>
              )}
            </div>
          );
        })}
      </div>

      {result.hand && result.tool && (
        <p className="mt-3 flex items-start gap-2 text-sm leading-relaxed">
          <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>{round.meaning}</span>
        </p>
      )}
      {!result.hand && (
        <p className="mt-3 flex items-start gap-2 text-xs leading-relaxed text-muted-foreground">
          <PenLine className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
          <span>
            Najpierw ręką. Nie staraj się za bardzo — chodzi o to, ile wychodzi normalnie.
          </span>
        </p>
      )}
    </div>
  );
}
