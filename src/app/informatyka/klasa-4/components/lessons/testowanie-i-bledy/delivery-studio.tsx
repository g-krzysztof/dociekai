'use client';

import { useRef, useState } from 'react';
import { Flag, MousePointerClick, Repeat2, Undo2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { TaskShell } from '../../task-shell';
import { Bench } from '../../scratch/bench';
import { GreenFlag, StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { HOME, make, type Block, type BlockType, type Category, type Sprite } from '../../scratch/engine';
import {
  DELIVERY_CRITERIA,
  endOf,
  judgeDelivery,
  runTwice,
  sameEnd,
  sameTrip,
  travelled,
  type Pass,
  type Passes,
} from './delivery';

/**
 * Zadanie praktyczne lekcji 29 — **wykonywane na stronie**, na tym samym `Benchu` i tej samej
 * scenie co bloki 2–4, i pierwsze, którego werdykt **uruchamia program dziecka dwa razy**.
 *
 * Zamówienie jest autorskie (program nie ma tu zadania obowiązkowego) i celowo
 * nie brzmi jak lista klocków, tylko jak **lista testów**: co ma być prawdą po uruchomieniu.
 * Dziecko dostaje ją z góry, bo cała lekcja jest o tym, że test pisze się **przed** uruchomieniem.
 *
 * **Scena nie odstawia kota na start** (`useProgram(…, carry)`) — dokładnie tak jak zielona flaga
 * w prawdziwym Scratchu. Dlatego dziecko może usterkę z bloku 3 zobaczyć u siebie, zanim odda
 * pracę: kliknąć flagę drugi raz i zobaczyć kota, który rusza z prawej strony. Werdykt robi to
 * samo, tylko uczciwie i zawsze: `runTwice`.
 *
 * Nagrodą jest ten sam przedmiot, którym dziecko posługiwało się w blokach 2 i 3 — **tabela
 * dwóch przebiegów** — tyle że wypełniona jego własnym programem.
 */

const PALETTE: BlockType[] = ['flaga', 'wroc', 'idz', 'czekaj', 'powiedz', 'dzwiek'];

/** Wzorzec zamówienia — pokazujemy **wynik**, nigdy klocków. Ich dziecko ma się domyślić samo. */
const GOAL: Block[] = [
  make('flaga'),
  make('wroc'),
  make('idz', 50),
  make('czekaj', 0.5),
  make('idz', 50),
  make('czekaj', 0.5),
  make('idz', 50),
  make('czekaj', 0.5),
  make('idz', 50),
  make('powiedz', 'Jestem tu!'),
];

interface DeliveryStudioProps {
  color: string;
  onComplete?: () => void;
}

export function DeliveryStudio({ color, onComplete }: DeliveryStudioProps) {
  const [stacks, setStacks] = useState<Block[][]>([[]]);
  const [category, setCategory] = useState<Category>('zdarzenia');
  const stack = stacks[0] ?? [];
  const program = useProgram(stack, HOME, undefined, true);
  const stage = useRef<HTMLDivElement>(null);

  const judge = () => {
    const passes = runTwice(stack);
    return { verdicts: judgeDelivery(stack, passes), data: passes };
  };

  const reset = () => {
    setStacks([[]]);
    setCategory('zdarzenia');
    program.clear();
  };

  /** Uruchamia program i, jeśli scena stoi poza widokiem (wąski ekran: pod skryptem), przewija do niej. */
  const runInView = () => {
    program.start();
    const box = stage.current?.getBoundingClientRect();
    if (!box || (box.top >= 130 && box.bottom <= window.innerHeight)) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <TaskShell<Passes>
      color={color}
      brief={
        <>
          <p>
            Zrób <strong>kota-listonosza</strong>. Po kliknięciu zielonej flagi kot rusza z lewej
            strony sceny, przechodzi na prawą — <strong>tak, żeby było widać, jak idzie</strong> — i
            na koniec się melduje, że dotarł.
          </p>
          <p className="mt-2">
            I jeden warunek, o który chodzi w całej lekcji: ma to zrobić{' '}
            <strong>tak samo za każdym razem</strong>. Za pierwszym kliknięciem flagi, za drugim i za
            dziesiątym.
          </p>
          <p className="mt-2">
            Nie podaję ci gotowego skryptu — klocki dobierz sam/sama. Podaję coś innego:{' '}
            <strong>testy, które twój program ma przejść</strong>. Uruchomię go u ciebie{' '}
            <strong>dwa razy pod rząd</strong> i porównam oba przebiegi.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={DELIVERY_CRITERIA}
      workshop={
        <div>
          <p className="mb-3 text-sm leading-relaxed">
            Ułóż skrypt i <strong>uruchom go zieloną flagą</strong>. Potem kliknij flagę{' '}
            <strong>jeszcze raz</strong> — bez stawiania kota na starcie — i sprawdź sam/sama, czy za
            drugim razem wyszło to samo.
          </p>
          <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
            <div>
              <Bench
                color={color}
                stacks={stacks}
                onStacksChange={setStacks}
                available={PALETTE}
                category={category}
                onCategoryChange={setCategory}
                active={program.active ? { stack: 0, ...program.active } : null}
                locked={program.running}
                scriptHint="Pusto. Każdy skrypt zaczyna się kapeluszem z zieloną flagą."
              />
              {/* Tam, gdzie scena stoi obok skryptu, flaga jest pod ręką — przycisk jest tylko dla wąskiego ekranu. */}
              <button
                type="button"
                onClick={runInView}
                disabled={program.running}
                className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
                style={{ borderColor: color, color }}
              >
                <GreenFlag className="h-4 w-4" />
                Uruchom i pokaż na scenie
              </button>
            </div>
            {/* `scroll-mt-32` zostawia zapas na pasek powłoki, który dla gościa ma 118 px na telefonie. */}
            <div ref={stage} className="scroll-mt-32">
              <StageView
                actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
                grid
                running={program.running}
                onStart={program.start}
                onStop={program.stop}
              />
              <StandingCat color={color} sprite={program.sprite} runs={program.attempts} />
              <button
                type="button"
                onClick={program.clear}
                disabled={program.attempts === 0 || program.running}
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: color, color }}
              >
                <Undo2 className="h-3.5 w-3.5" aria-hidden />
                Postaw kota z powrotem na starcie
              </button>
              {program.idle && (
                <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
                  Flaga naciśnięta, kot stoi. Nad twoimi klockami nie ma kapelusza{' '}
                  <strong>„kiedy kliknięto zieloną flagę”</strong>, więc flaga nie ma czego
                  uruchomić.
                </p>
              )}
            </div>
          </div>
        </div>
      }
      judge={judge}
      renderReport={(passes) => <Report passes={passes} color={color} />}
      onReset={reset}
      acceptedText={
        <>
          Twój program <strong>daje ten sam wynik za każdym razem</strong> — a to jest rzecz, której
          większość pierwszych programów nie potrafi. Zapis obu przebiegów, które u ciebie
          wykonałam, masz wyżej: w tabeli i na dwóch scenach.
        </>
      }
      onComplete={onComplete}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Podgląd celu i licznik pod sceną                                    */
/* ------------------------------------------------------------------ */

/** Gdzie kot stoi teraz i które to uruchomienie — bez tego drugiego kliknięcia nie widać, że kot nie wrócił na start. */
function StandingCat({ color, sprite, runs }: { color: string; sprite: Sprite; runs: number }) {
  return (
    <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
      <span className="font-mono tabular-nums" data-testid="standing-cat">
        kot stoi w x: {Math.round(sprite.x)}, y: {Math.round(sprite.y)}
      </span>
      {runs > 0 && (
        <span className="inline-flex items-center gap-1 tabular-nums" style={{ color }}>
          <Repeat2 className="h-3.5 w-3.5" aria-hidden />
          uruchomienie nr {runs}
        </span>
      )}
    </p>
  );
}

/** Podgląd zamówienia: sam wynik, bez klocków. Też nie odstawia kota na start — klikany dwa razy, robi to samo. */
function GoalPreview({ color }: { color: string }) {
  const program = useProgram(GOAL, HOME, undefined, true);
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
      <StageView
        actors={[{ id: 'kot', kind: 'kot', sprite: program.sprite, sound: program.sound }]}
        running={program.running}
        onStart={program.start}
        onStop={program.stop}
      />
      <div className="text-sm leading-relaxed">
        <p className="flex items-center gap-1.5 font-semibold" style={{ color }}>
          <MousePointerClick className="h-4 w-4 shrink-0" aria-hidden />
          Naciśnij flagę dwa razy — tak ma to wyglądać.
        </p>
        <p className="mt-2 text-muted-foreground">
          Liczba kroków i słowa w dymku będą u ciebie własne. Liczy się to, że{' '}
          <strong className="text-foreground">za drugim razem jest identycznie jak za pierwszym</strong>.
        </p>
        {program.attempts > 0 && (
          <button
            type="button"
            onClick={program.clear}
            disabled={program.running}
            className="mt-2 inline-flex cursor-pointer items-center gap-1.5 text-xs text-muted-foreground transition-colors hover:text-primary disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Undo2 className="h-3 w-3" aria-hidden />
            Kot z powrotem na start
          </button>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport — tabela dwóch przebiegów                                    */
/* ------------------------------------------------------------------ */

function Spot({ state }: { state: Sprite }) {
  return (
    <span className="font-mono text-xs tabular-nums">
      x: {Math.round(state.x)}, y: {Math.round(state.y)}
    </span>
  );
}

function Report({ passes, color }: { passes: Passes; color: string }) {
  const { first, second } = passes;
  if (!first.run.started) return null;

  const repeats = sameTrip(passes);
  const rows: [string, Pass][] = [
    ['pierwszy', first],
    ['drugi', second],
  ];

  return (
    <div className="space-y-4">
      <div>
        <p className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
          <Flag className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Uruchomiłam twój program dwa razy
        </p>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[320px] border-collapse text-sm">
            <thead>
              <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                <th className="py-1 pr-2 font-semibold">przebieg</th>
                <th className="py-1 pr-2 font-semibold">kot zaczął w</th>
                <th className="py-1 font-semibold">skończył w</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, pass]) => (
                <tr key={label} className="border-b last:border-0">
                  <td className="py-1.5 pr-2">{label}</td>
                  <td className="py-1.5 pr-2 text-muted-foreground">
                    <Spot state={pass.start} />
                  </td>
                  <td className="py-1.5">
                    <Spot state={endOf(pass)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p
          className={cn(
            'mt-2 p-2.5 text-sm leading-relaxed',
            repeats ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'bg-amber-50 dark:bg-amber-950/30'
          )}
        >
          {repeats ? (
            <>
              Oba wiersze kończą się tym samym — <strong>twój program jest powtarzalny</strong>. W
              pierwszym przebiegu kot pokonał{' '}
              {count(Math.abs(travelled(first)), 'krok', 'kroki', 'kroków')}.
            </>
          ) : sameEnd(passes) ? (
            <>
              Końce się zgadzają, ale to sprawka ściany: <strong>drugi przebieg zaczął się przy
              prawej krawędzi</strong>, więc kot nie miał dokąd iść.
            </>
          ) : (
            <>
              Wiersze się różnią. <strong>Drugi przebieg zaczął się tam, gdzie skończył
              pierwszy</strong> — i właśnie dlatego skończył gdzie indziej.
            </>
          )}
        </p>
      </div>

      <div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {rows.map(([label, pass]) => (
            <li key={label}>
              <StageView
                actors={[{ id: `kot-${label}`, kind: 'kot', sprite: endOf(pass) }]}
                ghosts={[{ kind: 'kot', x: pass.start.x, y: pass.start.y }]}
                note={`po ${label === 'pierwszy' ? 'pierwszym' : 'drugim'} uruchomieniu`}
                className="mx-0"
              />
            </li>
          ))}
        </ul>
        <p className="mt-2 text-xs text-muted-foreground">
          Blada sylwetka pokazuje, gdzie kot stał, zanim ruszył.
        </p>
      </div>
    </div>
  );
}
