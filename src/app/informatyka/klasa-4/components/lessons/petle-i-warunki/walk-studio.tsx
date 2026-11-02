'use client';

import { useCallback, useMemo, useRef, useState } from 'react';
import { MousePointerClick, Repeat } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { TaskShell } from '../../task-shell';
import { GreenFlag, StageView, type SpriteKind } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { blocksToProgram } from '../../scratch/blocks-to-project';
import { ScriptEditor, useScriptEditor, type PaletteItem } from '../../scratch/script-editor';
import type { ScratchSprite } from '../../scratch/program';
import { HOME, make, type Block, type HeldKeys, type Sprite } from '../../scratch/engine';
import { WALK_CRITERIA, judgeWalk, readWalk, type FoundLoop, type WalkReport } from './loops';

/**
 * Zadanie praktyczne lekcji 27 — **wykonywane na stronie**: dziecko układa skrypt
 * z klocków obejmujących (pętla, w niej „jeżeli”) i patrzy, jak żyje jego duszek.
 *
 * `Bench` jest płaski i to jest jego decyzja (patrz `loop-stack.tsx`), więc ten
 * warsztat układa skrypt w **zagnieżdżonym edytorze** (`scratch/script-editor.tsx`,
 * wypromowanym stąd przy lekcji 28): skrypt to drzewo, a upuszczać można w każdą
 * paszczę i pod cały skrypt. Kapelusz z flagą stoi na sztywno — lekcja jest o
 * tym, **gdzie względem pętli leży klocek**, nie o kapeluszach (te były w
 * lekcjach 24 i 26).
 *
 * **Podgląd na scenie ma jedno założenie podane wprost**: przełącznik „trzymam”
 * ogłasza, którą strzałkę duszek dostaje przez cały przebieg (`HeldKeys` w
 * `run()`). Bez tego dziecko nie zobaczyłoby, czy jego „jeżeli klawisz …” działa —
 * a kryterium o klawiszu byłoby sprawdzane na ślepo.
 *
 * Nagrodą jest narzędzie z **pierwszego** bloku lekcji wycelowane w pracę
 * dziecka: każda jego pętla rozwinięta w ciąg, którego nie musiało układać. Przy
 * „zawsze” odpowiedź brzmi „nigdy byś nie skończył/a przepisywać”.
 */

/** Kostiumy makiety: trzy różne figurki, żeby „następny kostium” było widać na scenie. */
const KINDS: SpriteKind[] = ['kot', 'gwiazdka', 'pilka'];

const START: Sprite = {
  ...HOME,
  x: -150,
  y: 0,
  direction: 90,
  rotationStyle: 'lewo-prawo',
  costume: 0,
};

/** Duszek makiety w oczach sędziego — jedyny w projekcie. */
const OWNER: ScratchSprite = {
  name: 'Kot',
  x: START.x,
  y: START.y,
  direction: START.direction,
  visible: true,
  rotationStyle: START.rotationStyle,
  costumes: [],
};

/**
 * Osiem klocków, a zamówienie potrzebuje pięciu — „powiedz” i „jeżeli na brzegu,
 * odbij się” są po to, żeby trzeba było **wybrać**, nie tylko poskładać. Kolejność
 * nie układa się w odpowiedź.
 */
const PALETTE: PaletteItem[] = [
  { type: 'idz' },
  { type: 'powiedz' },
  { type: 'kostium' },
  { type: 'czekaj' },
  { type: 'powtorz' },
  { type: 'zawsze' },
  { type: 'jezeli' },
  { type: 'odbij' },
];

/** Wzorzec zamówienia — pokazujemy **wynik**, nigdy klocków. Ich dziecko ma się domyślić samo. */
const GOAL: Block[] = [
  make('flaga'),
  make('zawsze', undefined, [
    make('kostium'),
    make('czekaj', 0.5),
    make('jezeli', 'klawisz w prawo naciśnięty?', [make('idz', 10)]),
  ]),
];
const GOAL_KEYS: HeldKeys = { prawo: true };

type Side = 'brak' | 'prawo' | 'lewo';

const SIDES: { id: Side; label: string }[] = [
  { id: 'brak', label: 'nic' },
  { id: 'lewo', label: '◀ lewo' },
  { id: 'prawo', label: 'prawo ▶' },
];

function costumeKind(sprite: Sprite): SpriteKind {
  return KINDS[(sprite.costume ?? 0) % KINDS.length];
}

/* ------------------------------------------------------------------ */
/* Zadanie                                                             */
/* ------------------------------------------------------------------ */

interface WalkStudioProps {
  color: string;
  onComplete?: () => void;
}

export function WalkStudio({ color, onComplete }: WalkStudioProps) {
  const [stack, setStack] = useState<Block[]>(() => [make('flaga')]);
  const [side, setSide] = useState<Side>('brak');
  /* Migawka pracy z chwili sprawdzenia: nagroda pokazuje to, co przeszło werdykt, a nie to, co dziecko przestawiło potem. */
  const [checked, setChecked] = useState<{ report: WalkReport; attempt: number } | null>(null);
  const stage = useRef<HTMLDivElement | null>(null);

  const keys = useMemo<HeldKeys>(
    () => (side === 'prawo' ? { prawo: true } : side === 'lewo' ? { lewo: true } : {}),
    [side]
  );
  const program = useProgram(stack, START, keys);
  const { clear } = program;

  const commit = useCallback(
    (next: Block[]) => {
      setStack(next);
      clear();
    },
    [clear]
  );
  const editor = useScriptEditor({ stack, onChange: commit });

  const judge = () => {
    const report = readWalk(blocksToProgram([{ sprite: OWNER, stacks: [stack] }]));
    setChecked((previous) => ({ report, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts: judgeWalk(report), data: null };
  };

  const reset = () => {
    commit([make('flaga')]);
    setSide('brak');
    editor.setArmed(null);
    setChecked(null);
  };

  /** Uruchamia program i, jeśli scena jest poza widokiem, przewija do niej — dla wąskiego ekranu, gdzie stoi nad skryptem. */
  const runInView = () => {
    program.start();
    const box = stage.current?.getBoundingClientRect();
    if (!box || (box.top >= 130 && box.bottom <= window.innerHeight)) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };

  const costumeNumber = ((program.sprite.costume ?? 0) % KINDS.length) + 1;

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Zamawiam u ciebie <strong>duszka, który żyje na scenie</strong>: sam się animuje i
            słucha twoich klawiszy. Trzy rzeczy, które ma umieć, i ani jednej listy klocków —
            dobierzesz je sam/sama:
          </p>
          <ol className="mt-2 list-decimal space-y-1 pl-5">
            <li>
              <strong>animuje się bez końca</strong> — przełącza swoje kostiumy w pętli, z przerwą,
              tak żeby ruch było widać;
            </li>
            <li>
              <strong>reaguje na klawisz</strong> — po naciśnięciu strzałki duszek się przesuwa;
            </li>
            <li>
              <strong>ma jeden warunek</strong> „jeżeli … to”, i to taki, który siedzi{' '}
              <strong>w środku pętli</strong>, a nie raz na jej początku.
            </li>
          </ol>
          <p className="mt-2">
            Kiedy skończysz, przeczytam twój skrypt klocek po klocku. Zobaczę nie tylko to, jakie
            masz klocki, ale też <strong>gdzie leżą</strong> — a różnica między warunkiem w pętli a
            warunkiem nad nią jest w tym zadaniu najważniejsza.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={WALK_CRITERIA}
      workshop={
        <div>
          <p className="mb-3 text-sm leading-relaxed">
            Przeciągnij klocki z dolnego rzędu w przerywane miejsca — także do środka pętli i do
            środka „jeżeli”. <strong>Owalne pola klocków można klikać</strong>: zmieniają wartość.
            Klocek wyciągnięty ze skryptu i puszczony poza nim znika.
          </p>

          <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-4 lg:space-y-0">
            {/*
             * Na wąskim ekranie scena stoi NAD skryptem, a warsztat mierzy tam ~1200 px, więc
             * flaga i paleta nie mieszczą się w jednym widoku. Scena nie jest przyklejona
             * celowo: pasek powłoki dla gościa ma 118 px i przyklejona scena wjeżdżałaby pod
             * niego, chowając flagę. Zamiast tego przycisk pod skryptem uruchamia program i
             * przewija do sceny (`scroll-mt-32` zostawia zapas na ten pasek).
             */}
            <div ref={stage} className="scroll-mt-32 lg:order-last">
              <StageView
                actors={[
                  { id: 'duszek', kind: costumeKind(program.sprite), sprite: program.sprite },
                ]}
                running={program.running}
                onStart={program.start}
                onStop={program.stop}
                note={`kostium ${costumeNumber} z ${KINDS.length}`}
                className="max-w-[230px] lg:max-w-[340px]"
              />
              <div
                className="mx-auto mt-2 flex max-w-[230px] flex-wrap items-center gap-1.5 lg:max-w-[340px]"
                role="group"
                aria-label="Którą strzałkę trzymasz podczas biegu programu"
              >
                <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Trzymam:
                </span>
                {SIDES.map((option) => (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={side === option.id}
                    onClick={() => setSide(option.id)}
                    className={cn(
                      'cursor-pointer border px-2 py-1 text-xs font-medium transition-colors',
                      side === option.id ? 'text-white' : 'hover:bg-muted/50'
                    )}
                    style={
                      side === option.id
                        ? { backgroundColor: color, borderColor: color }
                        : { borderColor: color, color }
                    }
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            <ScriptEditor
              editor={editor}
              stack={stack}
              color={color}
              palette={PALETTE}
              className="lg:order-first"
              afterScript={
                /* Tam, gdzie scena stoi obok skryptu, flaga jest pod ręką — przycisk jest tylko dla wąskiego ekranu. */
                <button
                  type="button"
                  onClick={runInView}
                  className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 lg:hidden"
                  style={{ borderColor: color, color }}
                >
                  <GreenFlag className="h-4 w-4" />
                  Uruchom i pokaż na scenie
                </button>
              }
            />
          </div>
        </div>
      }
      judge={judge}
      onReset={reset}
      acceptedText={
        <>
          Twój duszek żyje — i robi to <strong>kilkoma klockami zamiast kilkudziesięciu</strong>.
          Popatrz niżej, ile klocków musiałbyś/musiałabyś ułożyć, gdyby pętli nie było.
        </>
      }
      reward={
        checked && (
          <Unrolled
            key={checked.attempt}
            loops={checked.report.loops}
            blocks={checked.report.blocks}
            color={color}
          />
        )
      }
      onComplete={onComplete}
    />
  );
}

/** Podgląd celu: gotowy duszek na scenie, sam wynik — klocków celowo nie pokazujemy. */
function GoalPreview({ color }: { color: string }) {
  const program = useProgram(GOAL, START, GOAL_KEYS);

  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
      <StageView
        actors={[{ id: 'duszek', kind: costumeKind(program.sprite), sprite: program.sprite }]}
        running={program.running}
        onStart={program.start}
        onStop={program.stop}
      />
      <div className="text-sm leading-relaxed">
        <p className="flex items-center gap-1.5 font-semibold" style={{ color }}>
          <MousePointerClick className="h-4 w-4 shrink-0" aria-hidden />
          Naciśnij flagę — tak wygląda duszek, który żyje.
        </p>
        <p className="mt-2 text-muted-foreground">
          Nic go nie popycha, a on zmienia kostiumy, bo w jego skrypcie kręci się pętla. W tym
          pokazie{' '}
          <strong className="text-foreground">strzałka w prawo jest trzymana od początku</strong>,
          więc duszek do tego idzie. U ciebie o tym, czy idzie, zdecydujesz sam/sama.
        </p>
      </div>
    </div>
  );
}

/** Nagroda: każda pętla dziecka rozwinięta w ciąg, którego nie musiało układać. */
function Unrolled({ loops, blocks, color }: { loops: FoundLoop[]; blocks: number; color: string }) {
  if (loops.length === 0) return null;

  return (
    <div className="border bg-muted/20 p-4">
      <p
        className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wide"
        style={{ color }}
      >
        <Repeat className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Ile klocków oszczędziły twoje pętle
      </p>
      <ul className="mt-2 space-y-2">
        {loops.map((loop, index) => (
          <li key={index} className="text-sm leading-relaxed">
            <strong>{loop.step.label}</strong> — w środku{' '}
            {count(loop.size, 'klocek', 'klocki', 'klocków')}
            {', '}
            {Number.isFinite(loop.unrolled) ? (
              <>
                bez pętli trzeba by ułożyć <strong>{loop.unrolled}</strong>.
              </>
            ) : (
              <>
                a bez pętli — <strong>nigdy byś nie skończył/skończyła przepisywać</strong>. Ta
                pętla nie ma końca, więc nie da się jej rozpisać na klocki. To jest cała jej siła.
              </>
            )}
          </li>
        ))}
      </ul>
      <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
        Cały twój skrypt to {count(blocks, 'klocek', 'klocki', 'klocków')}.
      </p>
    </div>
  );
}
