'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Bench } from '../../scratch/bench';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { type Block, type BlockType, type Category } from '../../scratch/engine';

/**
 * Pokaz krok po kroku — **pierwszy skrypt zbudowany ręką dziecka**, a nie
 * obejrzany na filmie.
 *
 * Blok `pokaz` w tym kursie nie znaczy „przewiń slajdy”. Każdy z pięciu kroków
 * odhacza się dopiero wtedy, gdy dziecko wykona **prawdziwy gest** w makiecie:
 * otworzy kategorię, przeciągnie klocek, doczepi drugi, naciśnie flagę. Krok
 * zaliczony zostaje zaliczony na dobre (`latch`), żeby przejście do następnej
 * kategorii nie odbierało poprzedniego znaczka.
 *
 * Kolejność kroków to kolejność, w której naprawdę buduje się skrypt w Scratchu:
 * najpierw **co go uruchomi** (kapelusz), potem **co ma się stać** — i dopiero na
 * końcu flaga. Dzięki temu zanim dojdzie wolna pracownia (`BlockBench`), dziecko
 * ma już w palcach cały gest.
 */

interface Step {
  label: string;
  detail: string;
  done: (state: { stack: Block[]; category: Category; ran: boolean }) => boolean;
}

const STEPS: Step[] = [
  {
    label: 'Otwórz kategorię Zdarzenia',
    detail: 'Klocki są poukładane kolorami. Żółte to zdarzenia, czyli „co ma to uruchomić”.',
    done: ({ category }) => category === 'zdarzenia',
  },
  {
    label: 'Przeciągnij kapelusz z flagą do skryptu',
    detail:
      'Ten klocek ma zaokrąglony wierzch — nic nad niego nie wejdzie. Zawsze stoi na samej górze.',
    done: ({ stack }) => stack[0]?.type === 'flaga',
  },
  {
    label: 'Z kategorii Wygląd doczep „powiedz”',
    detail: 'Doczep go POD kapeluszem, tak żeby oba klocki tworzyły jeden słupek.',
    done: ({ stack }) => stack.some((block) => block.type === 'powiedz'),
  },
  {
    label: 'Z kategorii Ruch doczep „przesuń o … kroków”',
    detail: 'Trzeci klocek na samym spodzie. Możesz kliknąć białe pole i zmienić liczbę kroków.',
    done: ({ stack }) => stack.some((block) => block.type === 'idz'),
  },
  {
    label: 'Naciśnij zieloną flagę nad sceną',
    detail: 'Dopiero teraz duszek wykona wszystko sam, po kolei, z góry na dół.',
    done: ({ ran }) => ran,
  },
];

const AVAILABLE: BlockType[] = ['flaga', 'powiedz', 'pokaz', 'ukryj', 'idz', 'wroc'];

/** Stała pusta lista — nowa tablica w każdym renderze zrywałaby zależności efektu niżej. */
const EMPTY: Block[] = [];

interface FirstScriptProps {
  color: string;
  onComplete?: () => void;
}

export function FirstScript({ color, onComplete }: FirstScriptProps) {
  const [stacks, setStacks] = useState<Block[][]>([[]]);
  const [category, setCategory] = useState<Category>('ruch');
  const [latched, setLatched] = useState<number[]>([]);

  const program = useProgram(stacks[0] ?? []);
  const reported = useRef(false);

  const stack = stacks[0] ?? EMPTY;
  const ran = program.attempts > 0 && !program.idle;

  /* Krok raz zaliczony zostaje zaliczony — inaczej zmiana kategorii kasowałaby znaczek. */
  useEffect(() => {
    setLatched((prev) => {
      const fresh = STEPS.map((step, index) =>
        step.done({ stack, category, ran }) ? index : -1
      ).filter((index) => index >= 0 && !prev.includes(index));
      return fresh.length ? [...prev, ...fresh] : prev;
    });
  }, [stack, category, ran]);

  const allDone = latched.length === STEPS.length;
  const current = STEPS.findIndex((_step, index) => !latched.includes(index));

  useEffect(() => {
    if (!allDone || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [allDone, onComplete]);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm font-semibold sm:text-base">
          Zbuduj trzyklockowy skrypt — krok po kroku, razem ze mną.
        </p>
        <p className="text-xs tabular-nums text-muted-foreground">
          kroków: {latched.length}/{STEPS.length}
        </p>
      </div>
      <p className="mb-4 text-xs text-muted-foreground">
        Każdy krok odhacza się sam, gdy naprawdę go wykonasz.
      </p>

      <ol className="mb-4 space-y-1.5">
        {STEPS.map((step, index) => {
          const done = latched.includes(index);
          const active = index === current;
          return (
            <li
              key={step.label}
              className={cn(
                'flex items-start gap-2.5 border-l-2 py-1 pl-3 transition',
                done ? 'border-transparent opacity-55' : active ? '' : 'border-transparent opacity-45'
              )}
              style={active && !done ? { borderColor: color } : undefined}
            >
              <span
                className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full text-[10px] font-bold tabular-nums text-white"
                style={{ backgroundColor: done ? color : '#a1a1aa' }}
              >
                {done ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
              </span>
              <span className="min-w-0 text-sm leading-snug">
                <span className={cn('block', done && 'line-through')}>{step.label}</span>
                {active && !done && (
                  <span className="mt-0.5 block text-xs text-muted-foreground">{step.detail}</span>
                )}
              </span>
            </li>
          );
        })}
      </ol>

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
          scriptHint="Tu powstanie skrypt. Zacznij od kapelusza z zieloną flagą."
        />
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
            running={program.running}
            onStart={program.start}
            onStop={program.stop}
          />
          {program.idle && (
            <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
              Flaga naciśnięta, a duszek stoi. Bo flaga uruchamia tylko te klocki, nad którymi stoi
              kapelusz <strong>„kiedy kliknięto zieloną flagę”</strong>.
            </p>
          )}
        </div>
      </div>

      <AnimatePresence>
        {allDone && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="text-sm font-semibold" style={{ color }}>
              To jest program. Naprawdę — cały.
            </p>
            <p className="mt-2 text-sm leading-relaxed">
              Ma dokładnie to, co musi mieć każdy program: <strong>co go uruchamia</strong>{' '}
              (kapelusz z flagą) i <strong>co ma się stać</strong> — po kolei, z góry na dół. Nic
              więcej nie jest potrzebne, żeby coś już działało.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
              Zwróć uwagę, jak szybko to poszło. Duszek nie mówił „Cześć!” przez chwilę i dopiero
              potem ruszał — zrobił obie rzeczy w jednym mgnieniu. Komputer nie czeka na ciebie,{' '}
              <strong className="text-foreground">chyba że mu każesz</strong>.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
