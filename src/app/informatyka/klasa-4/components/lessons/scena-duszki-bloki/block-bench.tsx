'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bench } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { useProgram } from '../../scratch/use-program';
import { HOME, type Block, type BlockType, type Category, type Run } from '../../scratch/engine';

/**
 * Symulator — wolna pracownia z trzema zamówieniami.
 *
 * **Werdykt czyta przebieg, nie listę klocków.** `check()` dostaje `Run` i pyta o
 * to, co duszek naprawdę zrobił i w jakiej kolejności — nigdy o to, z czego
 * dziecko to złożyło. Dlatego każde zamówienie da się wykonać na kilka sposobów
 * (trzy razy „przesuń o 100 kroków” albo raz „przesuń o 100” i dwa „przesuń o 50”), a podpowiedź po
 * nieudanym przebiegu mówi, **co było widać na scenie**, a nie jakiego klocka
 * brakuje. To ta sama zasada, co w `ToolBench` z lekcji o edytorze grafiki:
 * sprawdzamy wykonaną robotę, nie wybór z menu.
 *
 * Zamówienia rosną i każde niesie inną myśl: pierwsze — że skrypt wykonuje się w
 * kolejności klocków; drugie — że program zajmuje czas i bez „czekaj” nie ma go
 * jak zobaczyć; trzecie — że scena ma krawędzie, a duszek zostaje tam, dokąd
 * doszedł, dopóki mu nie każesz wrócić.
 */

interface Order {
  id: string;
  text: ReactNode;
  hint: string;
  check: (run: Run) => { ok: boolean; note: string };
}

const EDGE_REACHED = 185;

function indexOf(run: Run, kind: string, after = -1): number {
  return run.log.findIndex((step, i) => i > after && step.kind === kind);
}

const ORDERS: Order[] = [
  {
    id: 'przywitanie',
    text: (
      <>
        Duszek ma się <strong>przywitać</strong>, a dopiero potem przejść w prawo.
      </>
    ),
    hint: 'Kapelusz z flagą, klocek z mówieniem i klocek z krokami.',
    check: (run) => {
      const say = indexOf(run, 'mowa');
      const move = indexOf(run, 'ruch');
      if (say < 0) return { ok: false, note: 'Duszek nic nie powiedział — nad sceną nie było dymka.' };
      if (move < 0) return { ok: false, note: 'Duszek stoi tam, gdzie stał. Nie było czym go ruszyć.' };
      if (say > move)
        return {
          ok: false,
          note: 'Najpierw ruszył, a dopiero potem się odezwał. Kolejność zdarzeń to kolejność klocków — zamień je miejscami.',
        };
      return { ok: true, note: 'Przywitał się i poszedł — dokładnie w tej kolejności, w której leżą klocki.' };
    },
  },
  {
    id: 'znikanie',
    text: (
      <>
        Duszek ma <strong>zniknąć</strong>, chwilę go nie ma, a potem pojawia się z powrotem.
      </>
    ),
    hint: 'Dwa klocki z kategorii Wygląd — i coś z Kontroli pomiędzy nimi.',
    check: (run) => {
      const hide = indexOf(run, 'ukrycie');
      if (hide < 0) return { ok: false, note: 'Duszek ani na moment nie zniknął.' };
      const show = indexOf(run, 'pokazanie', hide);
      if (show < 0) return { ok: false, note: 'Zniknął i już nie wrócił — na scenie została pustka.' };
      const wait = run.log.findIndex(
        (step, i) => i > hide && i < show && step.kind === 'czekanie'
      );
      if (wait < 0)
        return {
          ok: false,
          note: 'Zniknął i pojawił się w tym samym mgnieniu, więc na scenie nie było tego widać. Komputer robi wszystko od razu — chyba że każesz mu poczekać.',
        };
      return { ok: true, note: 'Zniknął, naprawdę go przez chwilę nie było, i wrócił.' };
    },
  },
  {
    id: 'krawedz',
    text: (
      <>
        Duszek ma dojść do <strong>prawej krawędzi</strong> sceny, postać tam chwilę, zagrać dźwięk i{' '}
        <strong>wrócić na start</strong>.
      </>
    ),
    hint: 'Kroków trzeba więcej niż jeden raz. Białe pole w klocku kliknij, żeby zmienić liczbę.',
    check: (run) => {
      const stood = run.frames.some((frame) => frame.sprite.x >= EDGE_REACHED);
      if (!stood)
        return {
          ok: false,
          note:
            run.peakX >= EDGE_REACHED
              ? 'Duszek dotarł do krawędzi, ale nie było tego widać nawet przez moment — program przeleciał przez wszystko naraz i wrócił, zanim zdążyłeś/zdążyłaś spojrzeć.'
              : 'Duszek nie doszedł do krawędzi. Scena jest szersza, niż się wydaje — policz, ile razy trzeba go pchnąć.',
        };
      const lastMove = run.log.reduce((at, step, i) => (step.kind === 'ruch' ? i : at), -1);
      const sound = indexOf(run, 'dzwiek', lastMove);
      if (sound < 0) return { ok: false, note: 'Doszedł i postał, ale nic nie zagrało.' };
      const back = indexOf(run, 'powrot', sound);
      if (back < 0) return { ok: false, note: 'Został przy krawędzi. Sam z siebie nie wróci.' };
      const end = run.frames[run.frames.length - 1];
      if (Math.abs(end.sprite.x - HOME.x) > 12)
        return { ok: false, note: 'Wrócił, ale potem znowu gdzieś poszedł — sprawdź, co jest pod klockiem powrotu.' };
      return { ok: true, note: 'Doszedł, postał, zagrał i wrócił. Cztery rzeczy w jednej kolejności.' };
    },
  },
];

const AVAILABLE: BlockType[] = ['flaga', 'idz', 'wroc', 'powiedz', 'pokaz', 'ukryj', 'dzwiek', 'czekaj'];

interface BlockBenchProps {
  color: string;
  onComplete?: () => void;
}

export function BlockBench({ color, onComplete }: BlockBenchProps) {
  const [at, setAt] = useState(0);
  const [stacks, setStacks] = useState<Block[][]>([[]]);
  const [category, setCategory] = useState<Category>('zdarzenia');

  const program = useProgram(stacks[0] ?? []);
  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(at);

  const order = ORDERS[Math.min(at, ORDERS.length - 1)];
  const verdict = program.finished && program.last ? order.check(program.last) : null;
  const done = at >= ORDERS.length;

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const advance = () => {
    setStacks([[]]);
    setCategory('zdarzenia');
    program.clear();
    setAt(at + 1);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy zamówienia, trzy działające programy — twoje.
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {[
            ['Kolejność', 'Duszek robi to, co stoi wyżej, a potem to, co niżej. Zawsze.'],
            ['Czas', 'Bez „czekaj” cały program dzieje się w jednym mgnieniu — widać tylko wynik.'],
            ['Miejsce', 'Scena ma krawędzie, a duszek zostaje tam, dokąd doszedł.'],
          ].map(([title, body]) => (
            <div key={title} className="border-l-2 p-3" style={{ borderColor: color }}>
              <p className="text-sm font-semibold">{title}</p>
              <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-sm leading-relaxed">
          Za każdym razem układałeś/układałaś klocki od nowa i za każdym razem musiałeś/musiałaś
          je <strong>uruchomić, żeby się dowiedzieć</strong>, czy dobrze. To nie jest obejście —
          tak wygląda programowanie. Program sprawdza się przez uruchomienie.
        </p>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Zamówienie {at + 1} z {ORDERS.length}
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          uruchomień: {program.attempts}
        </p>
      </div>
      <p className="mb-1 text-sm leading-relaxed">{order.text}</p>
      <p className="mb-4 text-xs text-muted-foreground">{order.hint}</p>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <Bench
          color={color}
          stacks={stacks}
          onStacksChange={setStacks}
          available={AVAILABLE}
          category={category}
          onCategoryChange={setCategory}
          active={program.active ? { stack: 0, ...program.active } : null}
          locked={program.running}
          scriptHint="Pusto. Każdy skrypt zaczyna się kapeluszem z zieloną flagą."
        />
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
            running={program.running}
            onStart={program.start}
            onStop={program.stop}
          />
          <p className="mt-1.5 text-[11px] leading-snug text-muted-foreground">
            W tej pracowni duszek wraca na start przy każdym naciśnięciu flagi. W prawdziwym
            Scratchu zostaje tam, dokąd doszedł — i właśnie po to jest klocek „wróć na start”.
          </p>
          {program.idle && (
            <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
              Flaga naciśnięta, duszek stoi. Nad twoimi klockami nie ma kapelusza{' '}
              <strong>„kiedy kliknięto zieloną flagę”</strong>, więc flaga nie ma czego uruchomić.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence mode="wait">
        {verdict && (
          <motion.div
            key={`${order.id}-${program.attempts}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className={cn(
              'mt-4 p-3 text-sm leading-relaxed',
              !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
            style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
          >
            <p className="flex items-start gap-2">
              {verdict.ok && <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />}
              <span>{verdict.note}</span>
            </p>
            {verdict.ok && (
              <button
                type="button"
                onClick={advance}
                className="mt-3 px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {at === ORDERS.length - 1 ? 'Co z tego wyszło?' : 'Następne zamówienie'}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
