'use client';

import { useEffect, useState } from 'react';
import { ArrowRight, Check, RotateCcw, X } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DoodlePad, DoodleThumb } from './doodle-pad';
import {
  PAIRS,
  featurize,
  guess,
  isDrawable,
  type Doodle,
  type Example,
  type Guess,
  type Pair,
  type TrayId,
} from './doodle';

/**
 * Blok 2 — **własny model z własnych rysunków** `[4.4]`.
 *
 * To jest „tablica trenowania modelu” z programu, zrobiona
 * w przeglądarce, na danych wytworzonych na miejscu — dokładnie tak, jak każe
 * uwaga o AI w klasie 4 (żadnych kont, żadnych zdjęć dziecka wysyłanych w sieć).
 * Dziecko rysuje przykłady do dwóch tac, a potem sprawdza maszynę na rysunkach,
 * których ona jeszcze nie widziała.
 *
 * Najważniejsza jest tu jedna rzecz: **odpowiedź maszyny ma zawsze
 * uzasadnienie, które widać.** Pod każdym werdyktem stoją trzy rysunki z tac,
 * najbardziej podobne do nowego, i to one głosują. Kiedy maszyna się pomyli,
 * dziecko widzi, który z jego przykładów ją zmylił — pomyłka przestaje być
 * „głupim komputerem”, a staje się skutkiem danych. Na tym stoi blok 3.
 *
 * Rysunki ze sprawdzianu **nie trafiają do tac** i strona mówi to wprost —
 * inaczej sprawdzian uczyłby maszynę odpowiedzi, o które ją pyta.
 */

export interface TestRun {
  expected: TrayId;
  doodle: Doodle;
  vec: number[];
  result: Guess;
}

export interface Trained {
  pair: Pair;
  examples: Example[];
  tests: TestRun[];
}

const MIN_PER_TRAY = 4;
const MAX_PER_TRAY = 8;

type Stage = 'train' | 'test' | 'done';

function testPrompts(pair: Pair): { expected: TrayId; text: string }[] {
  return [
    { expected: 'a', text: `Narysuj ${pair.a.acc} — nowy rysunek, którego maszyna jeszcze nie widziała.` },
    { expected: 'b', text: `Narysuj ${pair.b.acc}.` },
    {
      expected: 'a',
      text: `Narysuj ${pair.a.acc} jeszcze raz, ale inaczej niż dotąd: bardzo małe, w rogu kartki albo trochę krzywe.`,
    },
  ];
}

let nextId = 0;

export function DrawTrainer({
  color,
  onComplete,
  onTrained,
}: {
  color: string;
  onComplete?: () => void;
  onTrained?: (trained: Trained) => void;
}) {
  const [pair, setPair] = useState<Pair | null>(null);
  const [examples, setExamples] = useState<Example[]>([]);
  const [doodle, setDoodle] = useState<Doodle>([]);
  const [stage, setStage] = useState<Stage>('train');
  const [tests, setTests] = useState<TestRun[]>([]);
  const [shown, setShown] = useState<TestRun | null>(null);
  const anchor = useSectionScrollAnchor(stage);

  useEffect(() => {
    if (pair && examples.length > 0) onTrained?.({ pair, examples, tests });
  }, [pair, examples, tests, onTrained]);

  const inTray = (tray: TrayId) => examples.filter((example) => example.tray === tray);
  const ready = inTray('a').length >= MIN_PER_TRAY && inTray('b').length >= MIN_PER_TRAY;
  const drawable = isDrawable(doodle);

  const addTo = (tray: TrayId) => {
    const vec = featurize(doodle);
    if (!vec || inTray(tray).length >= MAX_PER_TRAY) return;
    nextId += 1;
    setExamples((current) => [...current, { id: `rys-${nextId}`, doodle, vec, tray }]);
    setDoodle([]);
  };

  const prompts = pair ? testPrompts(pair) : [];
  const prompt = prompts[tests.length];

  const check = () => {
    const vec = featurize(doodle);
    if (!vec || !prompt) return;
    const result = guess(vec, examples);
    if (!result) return;
    const run: TestRun = { expected: prompt.expected, doodle, vec, result };
    setShown(run);
    setTests((current) => [...current, run]);
    setDoodle([]);
  };

  const nextTest = () => {
    setShown(null);
    if (tests.length >= prompts.length) {
      setStage('done');
      onComplete?.();
    }
  };

  const retrain = () => {
    setTests([]);
    setShown(null);
    setStage('train');
  };

  if (!pair) {
    return (
      <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm leading-relaxed sm:text-base">
          Wybierz dwie rzeczy, które nauczysz maszynę odróżniać. Ona nie wie o nich nic — nie wie nawet, jak wygląda
          kreska. Wszystko, co będzie umiała, weźmie z <strong>twoich rysunków</strong>.
        </p>
        <div className="mt-4 flex flex-wrap gap-2">
          {PAIRS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setPair(item)}
              className="cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              {item.a.name} i {item.b.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-xs text-muted-foreground">
          Rysunki zostają w twojej przeglądarce. Maszyna liczy wszystko tutaj, na tej stronie.
        </p>
      </div>
    );
  }

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div ref={anchor} className="space-y-5 lg:grid lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-6 lg:space-y-0">
        <div>
          <p className="mb-2 min-h-[2.5rem] text-sm font-semibold leading-snug" style={{ color }}>
            {stage === 'train'
              ? `Rysuj na zmianę: ${pair.a.acc} i ${pair.b.acc}. Każdy rysunek trochę inny.`
              : stage === 'test' && prompt && !shown
                ? `Sprawdzian ${tests.length + 1} z ${prompts.length}: ${prompt.text}`
                : stage === 'test'
                  ? 'Zobacz, co odpowiedziała maszyna.'
                  : 'Sprawdzian skończony.'}
          </p>

          <DoodlePad doodle={doodle} onChange={setDoodle} color={color} disabled={stage === 'done' || !!shown} />

          {stage === 'train' && (
            <div className="mt-3 grid grid-cols-2 gap-2">
              {(['a', 'b'] as const).map((tray) => (
                <button
                  key={tray}
                  type="button"
                  onClick={() => addTo(tray)}
                  disabled={!drawable || inTray(tray).length >= MAX_PER_TRAY}
                  className="cursor-pointer border px-2 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                  style={{ borderColor: color, color }}
                >
                  do tacy »{pair[tray].name}«
                </button>
              ))}
            </div>
          )}

          {stage === 'test' && !shown && (
            <button
              type="button"
              onClick={check}
              disabled={!drawable}
              className="mt-3 w-full cursor-pointer border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              Pokaż maszynie
            </button>
          )}
        </div>

        <div className="min-w-0">
          {stage === 'train' && (
            <>
              <Trays pair={pair} examples={examples} color={color} onRemove={(id) => setExamples((all) => all.filter((e) => e.id !== id))} />
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                W każdej tacy potrzeba co najmniej {MIN_PER_TRAY} rysunków. Rysuj każdy trochę inaczej — większy, mniejszy,
                krzywy — bo maszyna ma zobaczyć, co w nich <strong>wspólne</strong>, a nie zapamiętać jeden.
              </p>
              {ready && (
                <button
                  type="button"
                  onClick={() => setStage('test')}
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
                  style={{ borderColor: color, color }}
                >
                  Maszyna się nauczyła — sprawdź ją
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </button>
              )}
            </>
          )}

          {stage === 'test' && shown && (
            <Verdict run={shown} pair={pair} color={color} onNext={nextTest} last={tests.length >= prompts.length} />
          )}

          {stage === 'test' && !shown && (
            <div className="space-y-3">
              <Trays pair={pair} examples={examples} color={color} compact />
              <p className="text-sm leading-relaxed text-muted-foreground">
                Rysunki ze sprawdzianu <strong>nie trafiają do tac</strong>. Maszyna uczy się tylko z tego, co w nich
                leży — sprawdzian ma pokazać, czy to wystarczy.
              </p>
            </div>
          )}

          {stage === 'done' && <Summary tests={tests} pair={pair} color={color} onRetrain={retrain} />}
        </div>
      </div>
    </div>
  );
}

function Trays({
  pair,
  examples,
  color,
  onRemove,
  compact,
}: {
  pair: Pair;
  examples: Example[];
  color: string;
  onRemove?: (id: string) => void;
  compact?: boolean;
}) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {(['a', 'b'] as const).map((tray) => {
        const items = examples.filter((example) => example.tray === tray);
        return (
          <div key={tray} className="border p-3">
            <p className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide">
              <span style={{ color }}>taca »{pair[tray].name}«</span>
              <span className="tabular-nums text-muted-foreground">
                {items.length}
                {!compact && ` / ${MIN_PER_TRAY}`}
              </span>
            </p>
            <div className="flex min-h-[52px] flex-wrap gap-1.5">
              {items.map((example) => (
                <div key={example.id} className="group relative border">
                  <DoodleThumb doodle={example.doodle} size={compact ? 40 : 52} />
                  {onRemove && (
                    <button
                      type="button"
                      onClick={() => onRemove(example.id)}
                      aria-label="Wyjmij ten rysunek z tacy"
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 cursor-pointer items-center justify-center border bg-white text-muted-foreground transition-colors hover:text-foreground dark:bg-zinc-900"
                    >
                      <X className="h-3 w-3" aria-hidden />
                    </button>
                  )}
                </div>
              ))}
              {!compact &&
                Array.from({ length: Math.max(0, MIN_PER_TRAY - items.length) }).map((_, index) => (
                  <div key={`pusty-${index}`} className="h-[54px] w-[54px] border border-dashed" />
                ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function Verdict({
  run,
  pair,
  color,
  onNext,
  last,
}: {
  run: TestRun;
  pair: Pair;
  color: string;
  onNext: () => void;
  last: boolean;
}) {
  const right = run.result.tray === run.expected;
  const wrongVoters = run.result.neighbors.filter((n) => n.example.tray !== run.expected).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="border">
          <DoodleThumb doodle={run.doodle} size={72} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">maszyna mówi</p>
          <p className="text-2xl font-black uppercase tracking-tight" style={{ color: right ? color : '#52525b' }}>
            {pair[run.result.tray].name}
          </p>
          <p className="flex items-center gap-1.5 text-sm">
            {right ? (
              <>
                <Check className="h-4 w-4" style={{ color }} aria-hidden /> zgadza się
              </>
            ) : (
              <>
                <X className="h-4 w-4 text-zinc-500" aria-hidden /> a to miało być: {pair[run.expected].name}
              </>
            )}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          skąd to wie — trzy najbardziej podobne rysunki z twoich tac
        </p>
        <div className="flex flex-wrap gap-3">
          {run.result.neighbors.map((neighbor, index) => (
            <div key={neighbor.example.id} className="text-center">
              <div
                className="relative border-2"
                style={{ borderColor: neighbor.example.tray === run.result.tray ? color : '#a1a1aa' }}
              >
                <DoodleThumb doodle={neighbor.example.doodle} size={56} />
                <span
                  className="absolute -left-2 -top-2 flex h-5 w-5 items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: neighbor.example.tray === run.result.tray ? color : '#a1a1aa' }}
                >
                  {index + 1}
                </span>
              </div>
              <p className="mt-1 text-[11px] text-muted-foreground">z tacy »{pair[neighbor.example.tray].name}«</p>
            </div>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed">
        {right ? (
          <>
            Maszyna nie wie, czym jest {pair[run.expected].name}. Znalazła wśród twoich rysunków trzy najbardziej
            podobne do nowego i sprawdziła, z której tacy jest ich więcej. {run.result.votes[run.result.tray]} z 3 głosów —
            taca »{pair[run.result.tray].name}«.
          </>
        ) : (
          <>
            Pomyliła się — i widać dlaczego. {wrongVoters === 3 ? 'Wszystkie trzy' : 'Dwa z trzech'} najbardziej podobne
            rysunki leżą w tacy »{pair[run.result.tray].name}«. Nie chodzi o to, że maszyna jest głupia: ten rysunek po
            prostu bardziej przypomina tamte przykłady niż twoje rysunki z tacy »{pair[run.expected].name}«.
          </>
        )}
      </p>

      <button
        type="button"
        onClick={onNext}
        className="inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
        style={{ borderColor: color, color }}
      >
        {last ? 'Zobacz wynik sprawdzianu' : 'Następny rysunek'}
        <ArrowRight className="h-4 w-4" aria-hidden />
      </button>
    </div>
  );
}

function Summary({
  tests,
  pair,
  color,
  onRetrain,
}: {
  tests: TestRun[];
  pair: Pair;
  color: string;
  onRetrain: () => void;
}) {
  const hits = tests.filter((run) => run.result.tray === run.expected).length;
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-3">
        {tests.map((run, index) => {
          const right = run.result.tray === run.expected;
          return (
            <div key={index} className="text-center">
              <div className="border-2" style={{ borderColor: right ? color : '#a1a1aa' }}>
                <DoodleThumb doodle={run.doodle} size={64} />
              </div>
              <p className="mt-1 text-xs">
                {right ? <Check className="mr-0.5 inline h-3 w-3" style={{ color }} /> : <X className="mr-0.5 inline h-3 w-3 text-zinc-500" />}
                {pair[run.result.tray].name}
              </p>
            </div>
          );
        })}
      </div>
      <div className="p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
        <p className="font-semibold">
          Maszyna rozpoznała {hits} z {tests.length}.
        </p>
        <p className="mt-2">
          {hits === tests.length
            ? `Nikt nie wpisał jej, jak wygląda ${pair.a.name} ani ${pair.b.name} — nauczyła się tego wyłącznie z rysunków, które sam/sama jej dałeś/dałaś.`
            : 'Pomyłka nie jest usterką programu — to skutek przykładów. Maszyna zna tylko twoje tace, więc myli się tam, gdzie nowy rysunek bardziej przypomina przykłady z drugiej tacy.'}{' '}
          Twoje tace przechodzą do następnego bloku: tam zobaczysz, co się stanie, kiedy zaczniesz je psuć.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetrain}
        className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-xs text-muted-foreground transition-colors hover:bg-muted"
      >
        <RotateCcw className="h-3.5 w-3.5" aria-hidden />
        dorysuj przykłady i sprawdź jeszcze raz
      </button>
    </div>
  );
}
