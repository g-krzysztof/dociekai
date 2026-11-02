'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FlipHorizontal, FlipVertical, RotateCcw, RotateCw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Ćwiczenie o różnicy między obrotem a odbiciem — **układanka, nie pytanie**.
 *
 * Dziecko dostaje rybkę i wzór, do którego ma ją doprowadzić czterema
 * przyciskami. Nic nie jest oceniane słowami: przy jednym z celów da się kręcić
 * do rana i nigdy nie trafić, bo **obrót nie zamienia lewej strony z prawą** —
 * i dopiero to, że licznik ruchów rośnie, a rybka wraca do tego samego, pokazuje
 * różnicę, której żadne zdanie nie tłumaczy.
 *
 * Stan to para `(r, f)`: najpierw ewentualne odbicie w poziomie, potem `r`
 * ćwiartek obrotu w prawo — czyli dokładnie to, co robi `transform:
 * rotate(90r) scaleX(-1)`. Dzięki temu przyciski są prostym rachunkiem na dwóch
 * liczbach, a nie osobnym opisem każdego z ośmiu ustawień:
 *  - obrót w prawo/lewo   → `r ± 1`
 *  - odbicie w poziomie   → `r → -r`, `f → !f`
 *  - odbicie w pionie     → `r → 2 - r`, `f → !f`
 *
 * Najkrótsze rozwiązanie liczy przeszukiwanie wszerz po ośmiu ustawieniach
 * (`shortest`), więc żadna liczba w podpowiedzi nie jest wpisana z ręki.
 */

interface Pose {
  r: number;
  f: boolean;
}

type Move = 'prawo' | 'lewo' | 'poziom' | 'pion';

const MOVES: { id: Move; label: string; icon: typeof RotateCw }[] = [
  { id: 'prawo', label: 'Obróć w prawo', icon: RotateCw },
  { id: 'lewo', label: 'Obróć w lewo', icon: RotateCcw },
  { id: 'poziom', label: 'Odbij w poziomie', icon: FlipHorizontal },
  { id: 'pion', label: 'Odbij w pionie', icon: FlipVertical },
];

function apply(pose: Pose, move: Move): Pose {
  switch (move) {
    case 'prawo':
      return { r: (pose.r + 1) % 4, f: pose.f };
    case 'lewo':
      return { r: (pose.r + 3) % 4, f: pose.f };
    case 'poziom':
      return { r: (4 - pose.r) % 4, f: !pose.f };
    case 'pion':
    default:
      return { r: (6 - pose.r) % 4, f: !pose.f };
  }
}

const START: Pose = { r: 0, f: false };
const key = (pose: Pose) => `${pose.r}${pose.f ? 'f' : ''}`;

/** Przeszukiwanie wszerz po ośmiu ustawieniach — stąd „najkrócej: N ruchów”. */
function shortest(from: Pose, to: Pose): number {
  const seen = new Map<string, number>([[key(from), 0]]);
  const queue: Pose[] = [from];
  while (queue.length > 0) {
    const pose = queue.shift() as Pose;
    const steps = seen.get(key(pose)) ?? 0;
    if (key(pose) === key(to)) return steps;
    MOVES.forEach((move) => {
      const next = apply(pose, move.id);
      if (seen.has(key(next))) return;
      seen.set(key(next), steps + 1);
      queue.push(next);
    });
  }
  return 0;
}

interface Task {
  id: string;
  brief: string;
  target: Pose;
  /** Zdanie po trafieniu — mówi, co się właśnie stało, nie „brawo”. */
  learned: string;
}

const TASKS: Task[] = [
  {
    id: 'w-dol',
    brief: 'Ustaw rybkę tak, żeby płynęła w dół.',
    target: { r: 1, f: false },
    learned:
      'Ćwierć obrotu w prawo. Cztery takie obroty i rybka jest z powrotem tam, gdzie zaczęła.',
  },
  {
    id: 'w-lewo',
    brief: 'Teraz ustaw rybkę tak, żeby płynęła w lewo — grzbietem wciąż do góry.',
    target: { r: 0, f: true },
    learned:
      'To jest odbicie, nie obrót. Możesz kręcić rybką do rana: obrót przesunie ją w kółko, ale nigdy nie zamieni lewej strony z prawą.',
  },
  {
    id: 'brzuchem',
    brief: 'Rybka ma płynąć w prawo, ale brzuchem do góry.',
    target: { r: 2, f: true },
    learned:
      'Odbicie w pionie. Zwróć uwagę: to nie to samo co pół obrotu — po półobrocie rybka płynęłaby w lewo.',
  },
  {
    id: 'w-gore',
    brief: 'Ustaw rybkę pyszczkiem do góry.',
    target: { r: 3, f: false },
    learned:
      'Jeden obrót w lewo albo trzy w prawo — wychodzi na to samo. W edytorze grafiki menu zwykle daje oba, żeby nie klikać trzy razy.',
  },
  {
    id: 'mieszane',
    brief:
      'Ostatnie ustawienie wygląda prawie jak poprzednie — rybka znów pyszczkiem do góry. Prawie. Doprowadź ją dokładnie do wzoru.',
    target: { r: 1, f: true },
    learned:
      'Wzór wyglądał prawie tak samo jak poprzedni, a samym obrotem nie dało się do niego dojść — płetwa wypada po drugiej stronie. Potrzebne było odbicie i obrót razem. Dopiero we dwa dają wszystkie osiem ustawień.',
  },
];

function Fish({ pose, ghost = false }: { pose: Pose; ghost?: boolean }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="block h-auto w-full"
      style={{
        transform: `rotate(${pose.r * 90}deg) scaleX(${pose.f ? -1 : 1})`,
        transition: 'transform 260ms ease',
      }}
      role="img"
      aria-label={`Rybka ustawiona ${pose.r * 90} stopni${pose.f ? ', odbita lustrzanie' : ''}`}
    >
      <g opacity={ghost ? 0.5 : 1}>
        <polygon points="20,50 2,30 2,70" fill="#f97316" />
        <polygon points="42,32 60,32 51,16" fill="#fb923c" />
        <polygon points="40,66 54,66 46,80" fill="#fb923c" />
        <ellipse cx={50} cy={50} rx={32} ry={20} fill="#fdba74" />
        <path d="M30 50 q10 -9 20 0 q-10 9 -20 0" fill="#f97316" opacity={0.7} />
        <circle cx={66} cy={44} r={4.5} fill="#1f2937" />
        <circle cx={67.4} cy={42.6} r={1.5} fill="#ffffff" />
      </g>
    </svg>
  );
}

interface TurnPuzzleProps {
  color: string;
  onComplete?: () => void;
}

export function TurnPuzzle({ color, onComplete }: TurnPuzzleProps) {
  const [index, setIndex] = useState(0);
  const [pose, setPose] = useState<Pose>(START);
  const [moves, setMoves] = useState(0);
  const [spins, setSpins] = useState(0);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);
  const [best, setBest] = useState<number[]>([]);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${done}`);

  const task = TASKS[index];
  const par = shortest(START, task.target);
  /* Obrót nie zmienia `f`, więc gdy cel ma inne `f`, kręcenie jest ślepą uliczką. */
  const spinningInVain = spins >= 5 && task.target.f !== pose.f;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const push = (move: Move) => {
    if (solved) return;
    const next = apply(pose, move);
    const count = moves + 1;
    setPose(next);
    setMoves(count);
    setSpins(move === 'prawo' || move === 'lewo' ? spins + 1 : 0);
    if (key(next) === key(task.target)) {
      setSolved(true);
      setBest((prev) => [...prev, count]);
    }
  };

  const nextTask = () => {
    if (index === TASKS.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPose(START);
    setMoves(0);
    setSpins(0);
    setSolved(false);
  };

  const restart = () => {
    setPose(START);
    setMoves(0);
    setSpins(0);
  };

  if (done) {
    const total = best.reduce((sum, value) => sum + value, 0);
    const parTotal = TASKS.reduce((sum, item) => sum + shortest(START, item.target), 0);
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Pięć ustawień w {total} ruchach (najkrócej dałoby się w {parTotal}).
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Jeden kształt da się ustawić na <strong>osiem</strong> sposobów i ani jednego więcej:
          cztery obroty i te same cztery obroty w odbiciu. Obrót i odbicie to dwie różne rzeczy —
          żadną liczbą obrotów nie zrobisz lustra.
        </p>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          W edytorze grafiki obrót i odbicie leżą w tym samym menu obok siebie i łatwo je pomylić.
          Teraz już wiesz, po czym poznać, którego z nich potrzebujesz: jeśli lewa strona ma zostać
          po lewej — obrót. Jeśli ma przejść na prawą — odbicie.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Ustawienie {index + 1} z {TASKS.length}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          twoje ruchy: <strong className="text-foreground">{moves}</strong> · najkrócej: {par}
        </p>
      </div>

      <p className="mb-4 text-sm leading-relaxed sm:text-base">{task.brief}</p>

      <div className="grid items-center gap-4 sm:grid-cols-[1fr_auto_1fr]">
        <figure className="mx-auto w-full max-w-[180px]">
          <div
            className="border-2 p-3"
            style={{ borderColor: solved ? color : `${color}44`, backgroundColor: `${color}08` }}
          >
            <Fish pose={pose} />
          </div>
          <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">
            Twoja rybka
          </figcaption>
        </figure>

        <span className="hidden text-center text-xs uppercase tracking-wide text-muted-foreground sm:block">
          ma wyglądać
          <br />
          tak jak
        </span>

        <figure className="mx-auto w-full max-w-[180px]">
          <div className="border-2 border-dashed border-zinc-300 p-3 dark:border-zinc-600">
            <Fish pose={task.target} ghost />
          </div>
          <figcaption className="mt-1.5 text-center text-xs text-muted-foreground">Wzór</figcaption>
        </figure>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {MOVES.map((move) => {
          const Icon = move.icon;
          return (
            <button
              key={move.id}
              type="button"
              onClick={() => push(move.id)}
              disabled={solved}
              className={cn(
                'flex items-center justify-center gap-1.5 border-2 px-2 py-2.5 text-xs font-medium transition',
                'hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/5'
              )}
              style={{ borderColor: `${color}55` }}
            >
              <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              {move.label}
            </button>
          );
        })}
      </div>

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{task.learned}</span>
            </p>
            <button
              type="button"
              onClick={nextTask}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {index === TASKS.length - 1 ? 'Podsumowanie' : 'Następne ustawienie'}
            </button>
          </motion.div>
        ) : spinningInVain ? (
          <motion.p
            key="spin"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            Kręcisz w kółko — i tak będzie dalej. Obrót przestawia rybkę na cztery strony, ale{' '}
            <strong>nigdy nie zamieni jej lewej strony z prawą</strong>. Do tego jest osobny ruch.
          </motion.p>
        ) : null}
      </AnimatePresence>

      {!solved && moves > 0 && (
        <button
          type="button"
          onClick={restart}
          className="mt-3 text-xs text-muted-foreground underline underline-offset-4"
        >
          Ustaw rybkę od nowa
        </button>
      )}
    </div>
  );
}
