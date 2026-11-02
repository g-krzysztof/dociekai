'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileText, Folder, Keyboard, Smartphone, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';

/**
 * Sprawdzian obsługi myszy i klawiatury — jedyna część testu, którą da się
 * zmierzyć naprawdę, a nie zapytać o nią w teście wyboru. Dziecko musi
 * kliknąć dwa razy, przeciągnąć, kliknąć prawym przyciskiem i przepisać
 * zdanie z wszystkimi polskimi znakami.
 *
 * **Punkt liczy się tylko za wykonanie „za pierwszym razem”.** Każde zadanie
 * da się w końcu zrobić (nic nie blokuje przejścia dalej), więc samo „udało
 * się” niczego by nie mierzyło — mierzalne jest to, czy dziecko sięgnęło po
 * właściwy ruch od razu, czy dopiero po podpowiedzi.
 *
 * Na tablecie i telefonie podwójne kliknięcie, przeciąganie myszą i prawy
 * przycisk po prostu nie istnieją, więc jest wyjście awaryjne: te trzy
 * zadania się pomija, a blok raportuje wynik z jednego zadania zamiast
 * z czterech (`total` jest częścią wyniku, więc podsumowanie samo się zgadza).
 */

/** Pangram z kompletem polskich znaków diakrytycznych. */
const PHRASE = 'Zażółć gęślą jaźń';

const POLISH_KEYS = [
  ['ą', 'a'],
  ['ć', 'c'],
  ['ę', 'e'],
  ['ł', 'l'],
  ['ń', 'n'],
  ['ó', 'o'],
  ['ś', 's'],
  ['ź', 'x'],
  ['ż', 'z'],
];

export interface DrillScore {
  score: number;
  total: number;
}

interface MouseKeyboardDrillProps {
  color: string;
  onFinish?: (result: DrillScore) => void;
}

type Task = 'dblclick' | 'drag' | 'rightclick' | 'typing';

const MOUSE_TASKS: Task[] = ['dblclick', 'drag', 'rightclick'];

export function MouseKeyboardDrill({ color, onFinish }: MouseKeyboardDrillProps) {
  const [touchMode, setTouchMode] = useState(false);
  const [index, setIndex] = useState(0);
  const [results, setResults] = useState<Record<string, boolean>>({});
  const [finished, setFinished] = useState(false);

  const tasks: Task[] = touchMode ? ['typing'] : [...MOUSE_TASKS, 'typing'];
  const task = tasks[index];
  const containerRef = useSectionScrollAnchor(`${touchMode}-${index}-${finished}`);

  const complete = (id: Task, firstTry: boolean) => {
    const next = { ...results, [id]: firstTry };
    setResults(next);
    if (index + 1 < tasks.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onFinish?.({
      score: Object.values(next).filter(Boolean).length,
      total: tasks.length,
    });
  };

  const skipMouse = () => {
    setTouchMode(true);
    setIndex(0);
    setResults({});
  };

  if (finished) {
    return (
      <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="mb-4 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
          Mysz i klawiatura — wynik
        </p>
        <ul className="divide-y border">
          {tasks.map((id) => (
            <li key={id} className="flex items-start gap-3 px-4 py-3">
              {results[id] ? (
                <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color: '#16a34a' }} aria-hidden />
              ) : (
                <X className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
              )}
              <span className="text-sm leading-relaxed">
                <strong>{TASK_TITLES[id]}</strong> —{' '}
                {results[id] ? 'poszło od razu.' : TASK_MISS[id]}
              </span>
            </li>
          ))}
        </ul>
        {touchMode && (
          <p className="mt-4 text-sm text-muted-foreground">
            Zadania z myszą pominięte — wróć do nich, gdy usiądziesz przy komputerze z myszą.
            Do reszty kursu mysz naprawdę się przyda.
          </p>
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
        <p className="font-mono text-xs font-bold tracking-wide" style={{ color }}>
          ZADANIE {index + 1} Z {tasks.length}
        </p>
        {!touchMode && index < MOUSE_TASKS.length && (
          <button
            type="button"
            onClick={skipMouse}
            className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary"
          >
            <Smartphone className="h-3.5 w-3.5" aria-hidden />
            Pracuję na tablecie — pomiń zadania z myszą
          </button>
        )}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={task}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {task === 'dblclick' && <DoubleClickTask color={color} onDone={(ok) => complete('dblclick', ok)} />}
          {task === 'drag' && <DragTask color={color} onDone={(ok) => complete('drag', ok)} />}
          {task === 'rightclick' && <RightClickTask color={color} onDone={(ok) => complete('rightclick', ok)} />}
          {task === 'typing' && <TypingTask color={color} onDone={(ok) => complete('typing', ok)} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

const TASK_TITLES: Record<Task, string> = {
  dblclick: 'Podwójne kliknięcie',
  drag: 'Przeciąganie',
  rightclick: 'Prawy przycisk myszy',
  typing: 'Pisanie z polskimi znakami',
};

const TASK_MISS: Record<Task, string> = {
  dblclick: 'udało się dopiero po podpowiedzi. Dwa szybkie kliknięcia pod rząd, bez ruszania myszą.',
  drag: 'udało się dopiero po podpowiedzi. Trzymaj wciśnięty przycisk przez cały czas przeciągania.',
  rightclick: 'udało się dopiero po podpowiedzi. Menu podręczne otwiera prawy przycisk myszy.',
  typing: 'skorzystałeś/aś z podpowiedzi. Polskie znaki wpisuje się prawym Altem (Windows) albo Option (Mac).',
};

/** Wspólna ramka zadania: polecenie u góry, scena pod nim, wskazówka na dole. */
function TaskFrame({
  color,
  brief,
  nudge,
  children,
}: {
  color: string;
  brief: string;
  nudge?: string | null;
  children: ReactNode;
}) {
  return (
    <div>
      <p className="mb-4 text-base font-semibold leading-relaxed">{brief}</p>
      <div className="flex min-h-[180px] items-center justify-center border border-dashed p-6" style={{ borderColor: `${color}59` }}>
        {children}
      </div>
      <div className="mt-3 min-h-[1.25rem]">
        <AnimatePresence>
          {nudge && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-amber-700 dark:text-amber-500"
            >
              {nudge}
            </motion.p>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function DoubleClickTask({ color, onDone }: { color: string; onDone: (firstTry: boolean) => void }) {
  const [singles, setSingles] = useState(0);
  const pending = useRef<number | null>(null);

  // Przeglądarka wysyła przy podwójnym kliknięciu pełną sekwencję
  // `click, click, dblclick`, więc naiwne liczenie `onClick` uznałoby każde
  // poprawne podwójne kliknięcie za dwa pojedyncze i zawsze dawało zero punktów.
  // Pojedyncze kliknięcie liczymy dopiero po 350 ms — `dblclick` zdąży je odwołać.
  useEffect(() => () => {
    if (pending.current) window.clearTimeout(pending.current);
  }, []);

  const registerClick = () => {
    if (pending.current) window.clearTimeout(pending.current);
    pending.current = window.setTimeout(() => {
      pending.current = null;
      setSingles((prev) => prev + 1);
    }, 350);
  };

  const registerDoubleClick = () => {
    if (pending.current) {
      window.clearTimeout(pending.current);
      pending.current = null;
    }
    onDone(singles === 0);
  };

  return (
    <TaskFrame
      color={color}
      brief="Otwórz ten folder — tak jak otwiera się go na pulpicie."
      nudge={singles > 0 ? 'To było jedno kliknięcie. Kliknij dwa razy szybko po sobie, nie ruszając myszą.' : null}
    >
      <button
        type="button"
        onClick={registerClick}
        onDoubleClick={registerDoubleClick}
        className="flex cursor-pointer flex-col items-center gap-2 p-4 transition-colors hover:bg-muted/50"
      >
        <Folder className="h-14 w-14" style={{ color }} aria-hidden />
        <span className="text-sm font-medium">Moje dokumenty</span>
      </button>
    </TaskFrame>
  );
}

function DragTask({ color, onDone }: { color: string; onDone: (firstTry: boolean) => void }) {
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);
  const [clicked, setClicked] = useState(false);
  const dropRef = useRef<HTMLDivElement>(null);
  const startRef = useRef<{ x: number; y: number; moved: boolean } | null>(null);

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    startRef.current = { x: event.clientX, y: event.clientY, moved: false };
    setOffset({ x: 0, y: 0 });
  };

  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    if (!start) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    if (Math.abs(dx) > 4 || Math.abs(dy) > 4) start.moved = true;
    setOffset({ x: dx, y: dy });
  };

  const onPointerUp = (event: ReactPointerEvent<HTMLDivElement>) => {
    const start = startRef.current;
    startRef.current = null;
    setOffset(null);
    if (!start) return;
    if (!start.moved) {
      setClicked(true);
      return;
    }
    const drop = dropRef.current?.getBoundingClientRect();
    const inside =
      drop &&
      event.clientX >= drop.left &&
      event.clientX <= drop.right &&
      event.clientY >= drop.top &&
      event.clientY <= drop.bottom;
    if (inside) onDone(!clicked);
    else setClicked(true);
  };

  return (
    <TaskFrame
      color={color}
      brief="Przeciągnij plik do folderu."
      nudge={
        clicked
          ? 'Samo kliknięcie nie wystarczy: naciśnij i TRZYMAJ przycisk, przesuń plik nad folder i dopiero tam puść.'
          : null
      }
    >
      <div className="flex w-full max-w-md items-center justify-between gap-6">
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          className="flex cursor-grab touch-none select-none flex-col items-center gap-2 active:cursor-grabbing"
          style={{
            transform: offset ? `translate(${offset.x}px, ${offset.y}px)` : undefined,
            zIndex: offset ? 10 : undefined,
            position: 'relative',
          }}
          role="button"
          tabIndex={0}
          aria-label="Plik notatka.txt — przeciągnij go do folderu"
        >
          <FileText className="h-12 w-12" style={{ color }} aria-hidden />
          <span className="text-xs font-medium">notatka.txt</span>
        </div>

        <div
          ref={dropRef}
          className="flex flex-col items-center gap-2 border-2 border-dashed p-4"
          style={{ borderColor: `${color}80` }}
        >
          <Folder className="h-12 w-12" style={{ color }} aria-hidden />
          <span className="text-xs font-medium">Informatyka 4</span>
        </div>
      </div>
    </TaskFrame>
  );
}

function RightClickTask({ color, onDone }: { color: string; onDone: (firstTry: boolean) => void }) {
  const [leftClicks, setLeftClicks] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <TaskFrame
      color={color}
      brief="Otwórz menu podręczne tego pliku — to, w którym są „Zmień nazwę” i „Usuń”."
      nudge={
        leftClicks > 0 && !menuOpen
          ? 'Lewy przycisk tylko zaznacza. Menu podręczne otwiera się prawym przyciskiem myszy (na Macu: dwa palce na gładziku).'
          : null
      }
    >
      <div className="relative">
        <button
          type="button"
          onClick={() => setLeftClicks((prev) => prev + 1)}
          onContextMenu={(event) => {
            event.preventDefault();
            setMenuOpen(true);
          }}
          className="flex cursor-pointer flex-col items-center gap-2 p-4 transition-colors hover:bg-muted/50"
        >
          <FileText className="h-12 w-12" style={{ color }} aria-hidden />
          <span className="text-sm font-medium">wakacje.jpg</span>
        </button>

        <AnimatePresence>
          {menuOpen && (
            <motion.ul
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.15 }}
              className="absolute left-full top-6 z-10 w-44 border bg-background py-1 shadow-lg"
            >
              {['Otwórz', 'Zmień nazwę', 'Kopiuj', 'Usuń'].map((item) => (
                <li key={item}>
                  <button
                    type="button"
                    onClick={() => onDone(leftClicks === 0)}
                    className="w-full cursor-pointer px-3 py-1.5 text-left text-sm hover:bg-muted"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>
    </TaskFrame>
  );
}

function TypingTask({ color, onDone }: { color: string; onDone: (firstTry: boolean) => void }) {
  const [value, setValue] = useState('');
  const [hintShown, setHintShown] = useState(false);
  const typed = value.trimStart();
  const matched = typed.trimEnd() === PHRASE;

  return (
    <div>
      <p className="mb-2 text-base font-semibold leading-relaxed">
        Przepisz to zdanie dokładnie tak, jak jest napisane — z wielką literą i wszystkimi polskimi
        znakami.
      </p>
      <p className="mb-4 text-sm text-muted-foreground">
        To najkrótsze polskie zdanie, w którym są wszystkie znaki z ogonkami i kreskami.
      </p>

      <div className="border border-dashed p-5" style={{ borderColor: `${color}59` }}>
        <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Do przepisania
        </p>
        <p className="mb-4 font-mono text-xl font-bold tracking-wide sm:text-2xl">{PHRASE}</p>

        <label htmlFor="typing-drill" className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Twoje zdanie
        </label>
        <input
          id="typing-drill"
          type="text"
          value={value}
          onChange={(event) => setValue(event.target.value)}
          autoComplete="off"
          autoCorrect="off"
          spellCheck={false}
          placeholder="Tutaj pisz…"
          className="w-full border bg-transparent px-3 py-2 font-mono text-lg outline-none transition-colors focus:border-primary"
        />

        {/* Podgląd znak po znaku — od razu widać, która litera nie zgadza się z wzorem. */}
        <p className="mt-3 flex flex-wrap gap-x-0.5 font-mono text-lg" aria-hidden>
          {PHRASE.split('').map((char, i) => {
            const done = i < typed.length;
            const ok = typed[i] === char;
            return (
              <span
                key={`${char}-${i}`}
                className={cn(
                  'inline-block min-w-[0.6ch]',
                  !done && 'text-muted-foreground/40',
                  done && ok && 'text-emerald-600 dark:text-emerald-400',
                  done && !ok && 'bg-amber-200 text-amber-900 dark:bg-amber-900/60 dark:text-amber-100'
                )}
              >
                {char === ' ' ? ' ' : char}
              </span>
            );
          })}
        </p>

        {matched && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="mt-3 flex items-center gap-2 text-sm font-semibold text-emerald-700 dark:text-emerald-400"
          >
            <Check className="h-4 w-4" aria-hidden />
            Zgadza się co do znaku.
          </motion.p>
        )}
      </div>

      {hintShown && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 border-l-2 pl-3 text-sm leading-relaxed"
          style={{ borderColor: `${color}80` }}
        >
          <p className="mb-2">
            <strong>Windows:</strong> przytrzymaj <strong>prawy Alt</strong> i naciśnij literę.{' '}
            <strong>Mac:</strong> przytrzymaj <strong>Option (⌥)</strong> i naciśnij literę.
            Wielką literę robi Shift — nie Caps Lock.
          </p>
          <ul className="flex flex-wrap gap-x-4 gap-y-1 font-mono text-xs">
            {POLISH_KEYS.map(([letter, key]) => (
              <li key={letter}>
                <span className="font-bold">{letter}</span> = Alt/⌥ + {key}
              </li>
            ))}
          </ul>
        </motion.div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <Button
          onClick={() => onDone(!hintShown)}
          disabled={!matched}
          size="lg"
          style={matched ? { backgroundColor: color } : undefined}
        >
          <Keyboard className="mr-1 h-4 w-4" aria-hidden />
          Gotowe
        </Button>
        {!hintShown ? (
          <button
            type="button"
            onClick={() => setHintShown(true)}
            className="cursor-pointer text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Nie umiem wpisać polskich liter — pokaż jak
          </button>
        ) : (
          <button
            type="button"
            onClick={() => onDone(false)}
            className="cursor-pointer text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
          >
            Pomiń to zadanie
          </button>
        )}
      </div>
    </div>
  );
}
