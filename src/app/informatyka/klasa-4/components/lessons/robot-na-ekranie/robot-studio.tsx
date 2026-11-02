'use client';

import { useCallback, useId, useMemo, useRef, useState } from 'react';
import { Crosshair, MousePointerClick, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell } from '../../task-shell';
import { GreenFlag, StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { Script } from '../../scratch/loop-stack';
import { ScriptEditor, useScriptEditor, type PaletteItem } from '../../scratch/script-editor';
import { META_CONDITION, TOUCH_RADIUS, make, type Block, type Senses, type Sprite } from '../../scratch/engine';
import {
  COUNTED_STACK,
  METAS,
  META_RANGE,
  ROBOT_CRITERIA,
  ROBOT_START,
  driveAll,
  judgeRobot,
  type MetaRun,
  type Outcome,
} from './mission';

/**
 * Zadanie praktyczne lekcji 28 — **wykonywane na stronie**: dziecko układa skrypt
 * robota, który sam dojeżdża do mety i sam daje znać, że dojechał. Skrypt to
 * drzewo (pętla, w niej „jeżeli … w przeciwnym razie”), więc warsztat stoi na
 * edytorze z lekcji 27 (`scratch/script-editor.tsx`).
 *
 * **Scena jest gotowa**: robot na starcie, gwiazdka-meta przed nim. Dziecko układa
 * tylko skrypt — i może **przestawiać metę suwakiem**, żeby sprawdzić, czy robot
 * staje przy niej także tam, gdzie nikt go nie przygotował. To jest ten sam test,
 * który wykona werdykt (trzy mety), tyle że pierwszy raz dziecko robi go samo.
 *
 * Czujnik jest w polu „jeżeli” **wybierany z trzech** (krawędź, czarna linia,
 * meta), a domyślny jest pierwszy — zły. Dziecko musi więc zdecydować, o co robot
 * ma pytać, zamiast dostać właściwe pytanie w gotowym klocku.
 *
 * Nagrodą jest **ten sam test dla robota, który liczy kroki**: program z bloku
 * „Cztery przejazdy” pasuje do jednej mety z trzech, a robot dziecka do wszystkich
 * — bo o żadnej nie wiedział z góry.
 */

/**
 * Osiem klocków, a zamówienie potrzebuje pięciu. „Jeżeli” bez „w przeciwnym
 * razie” jest pułapką: robot dotknie mety, powie, że dojechał, i pojedzie dalej.
 * Kolejność nie układa się w odpowiedź.
 */
const PALETTE: PaletteItem[] = [
  { type: 'powiedz' },
  { type: 'idz' },
  { type: 'jezeli', note: 'jedna część: „to”' },
  { type: 'dzwiek' },
  { type: 'powtorz' },
  { type: 'jezeli_inaczej', note: 'dwie części: „to” i „w przeciwnym razie”' },
  { type: 'czekaj' },
  { type: 'zawsze' },
];

/** Czujniki, które mają sens na tej scenie — tylko jeden z nich jest właściwy. */
const SENSORS = ['dotykasz krawędzi?', 'dotykasz czarnej linii?', META_CONDITION];
const VALUE_SETS = { jezeli: SENSORS, jezeli_inaczej: SENSORS };

const DEFAULT_META = 120;

/** Wzorzec zamówienia — pokazujemy **wynik**, nigdy klocków. Ich dziecko ma się domyślić samo. */
const GOAL: Block[] = [
  make('flaga'),
  make('zawsze', undefined, [
    make('jezeli_inaczej', META_CONDITION, [make('powiedz', 'Jestem tu!')], [make('idz', 10)]),
  ]),
];

function metaSprite(x: number): Sprite {
  return { ...ROBOT_START, x, y: 0, rotationStyle: 'nie obracaj' };
}

function sensesAt(x: number): Senses {
  return { meta: { x, y: 0 } };
}

/* ------------------------------------------------------------------ */
/* Zadanie                                                             */
/* ------------------------------------------------------------------ */

interface RobotStudioProps {
  color: string;
  onComplete?: () => void;
}

export function RobotStudio({ color, onComplete }: RobotStudioProps) {
  const [stack, setStack] = useState<Block[]>(() => [make('flaga')]);
  const [metaX, setMetaX] = useState(DEFAULT_META);
  const stage = useRef<HTMLDivElement | null>(null);
  const sliderId = useId();

  const senses = useMemo(() => sensesAt(metaX), [metaX]);
  const program = useProgram(stack, ROBOT_START, senses);
  const { clear } = program;

  const commit = useCallback(
    (next: Block[]) => {
      setStack(next);
      clear();
    },
    [clear]
  );
  const editor = useScriptEditor({ stack, onChange: commit, valueSets: VALUE_SETS });

  /** Przestawiona meta unieważnia poprzedni przebieg — robot wraca na start, bo widz zobaczy nowy świat. */
  const moveMeta = (x: number) => {
    setMetaX(x);
    clear();
  };

  const reset = () => {
    commit([make('flaga')]);
    setMetaX(DEFAULT_META);
    editor.setArmed(null);
  };

  /** Uruchamia program i, jeśli scena jest poza widokiem, przewija do niej — dla wąskiego ekranu, gdzie stoi nad skryptem. */
  const runInView = () => {
    program.start();
    const box = stage.current?.getBoundingClientRect();
    if (!box || (box.top >= 130 && box.bottom <= window.innerHeight)) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stage.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            Zamawiam u ciebie <strong>robota, który sam dojeżdża do mety</strong> i{' '}
            <strong>sam daje znać, że dojechał</strong>. Scenę masz gotową: robot stoi na starcie po
            lewej, a meta — gwiazdka — gdzieś przed nim. Układasz tylko jego skrypt.
          </p>
          <p className="mt-2">
            Jest przy tym jeden warunek, o który chodzi w całej lekcji:{' '}
            <strong>o zatrzymaniu robota ma decydować czujnik, a nie odliczona liczba kroków</strong>.
            Robot ma jechać w pętli i przy każdym kroku pytać: czy już dotykam mety? Dopóki nie —
            jedzie. Kiedy tak — staje i mówi, że dojechał.
          </p>
          <p className="mt-2">
            Zanim przyjmę pracę, przestawię metę w trzy miejsca —{' '}
            <strong>blisko, w połowie drogi i daleko</strong> — i puszczę na każdym twój program.
            Robot, który liczy kroki, trafiłby najwyżej w jedną. Możesz to sprawdzić sam/sama: suwak
            pod sceną przestawia metę.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      criteria={ROBOT_CRITERIA}
      workshop={
        <div>
          <p className="mb-3 text-sm leading-relaxed">
            Przeciągnij klocki z dolnego rzędu w przerywane miejsca — także do środka pętli i do{' '}
            <strong>obu części</strong> klocka „jeżeli … w przeciwnym razie”.{' '}
            <strong>Owalne pola klocków można klikać</strong>: zmieniają wartość — tak wybierzesz
            czujnik. Klocek wyciągnięty ze skryptu i puszczony poza nim znika.
          </p>

          <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)] lg:gap-4 lg:space-y-0">
            {/*
             * Na wąskim ekranie scena stoi NAD skryptem i nie jest przyklejona — pasek powłoki
             * dla gościa ma tam 118 px i wjeżdżałaby pod niego, chowając flagę. Zamiast tego
             * przycisk pod skryptem uruchamia program i przewija do sceny.
             */}
            <div ref={stage} className="scroll-mt-32 lg:order-last">
              <StageView
                actors={[
                  { id: 'meta', kind: 'gwiazdka', sprite: metaSprite(metaX) },
                  { id: 'robot', kind: 'kot', sprite: program.sprite },
                ]}
                running={program.running}
                onStart={program.start}
                onStop={program.stop}
                className="max-w-[230px] lg:max-w-[340px]"
              />
              <div className="mx-auto mt-2 max-w-[230px] lg:max-w-[340px]">
                <label
                  htmlFor={sliderId}
                  className="flex items-center justify-between gap-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground"
                >
                  <span className="flex items-center gap-1.5">
                    <Crosshair className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
                    Przestaw metę
                  </span>
                  <span className="font-mono normal-case tabular-nums">x = {metaX}</span>
                </label>
                <input
                  id={sliderId}
                  type="range"
                  min={META_RANGE.min}
                  max={META_RANGE.max}
                  step={META_RANGE.step}
                  value={metaX}
                  onChange={(event) => moveMeta(Number(event.target.value))}
                  className="mt-1 w-full cursor-pointer"
                  style={{ accentColor: color }}
                />
              </div>
            </div>

            <ScriptEditor
              editor={editor}
              stack={stack}
              color={color}
              palette={PALETTE}
              title="Skrypt robota"
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
      judge={() => judgeRobot(stack)}
      onReset={reset}
      renderReport={(data) => (
        <MetaStrips heading="Twój robot na trzech metach" runs={data.runs} color={color} />
      )}
      acceptedText={
        <>
          Twój robot dojeżdża do mety <strong>dlatego, że ją wyczuł</strong> — na wszystkich trzech,
          choć żadnej z nich nie znał z góry. Niżej ten sam test dla robota, który liczy kroki.
        </>
      }
      reward={<Contrast color={color} />}
      onComplete={onComplete}
    />
  );
}

/** Podgląd celu: robot z czujnikiem na scenie, z metą, którą można przestawić — sam wynik, bez klocków. */
function GoalPreview({ color }: { color: string }) {
  const [spot, setSpot] = useState(1);
  const senses = useMemo(() => sensesAt(METAS[spot].x), [spot]);
  const program = useProgram(GOAL, ROBOT_START, senses);
  const { clear } = program;

  const next = () => {
    setSpot((value) => (value + 1) % METAS.length);
    clear();
  };

  return (
    <div className="grid gap-3 border bg-muted/20 p-3 sm:grid-cols-[minmax(0,260px)_minmax(0,1fr)] sm:items-center">
      <StageView
        actors={[
          { id: 'meta', kind: 'gwiazdka', sprite: metaSprite(METAS[spot].x) },
          { id: 'robot', kind: 'kot', sprite: program.sprite },
        ]}
        running={program.running}
        onStart={program.start}
        onStop={program.stop}
      />
      <div className="text-sm leading-relaxed">
        <p className="flex items-center gap-1.5 font-semibold" style={{ color }}>
          <MousePointerClick className="h-4 w-4 shrink-0" aria-hidden />
          Naciśnij flagę — tak jedzie robot z czujnikiem.
        </p>
        <p className="mt-2 text-muted-foreground">
          Nikt mu nie liczy kroków, a on i tak staje przy gwiazdce. Przestaw metę i puść go jeszcze
          raz — <strong className="text-foreground">stanie przy niej znowu</strong>. Program jest
          ten sam.
        </p>
        <button
          type="button"
          onClick={next}
          className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Star className="h-4 w-4" aria-hidden />
          Meta stoi: {METAS[spot].label}
        </button>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport i nagroda                                                    */
/* ------------------------------------------------------------------ */

const OUTCOME: Record<Outcome, string> = {
  stanal: 'stanął przy mecie',
  dalej: 'dotknął mety i pojechał dalej',
  krotko: 'nie dojechał',
};

/** Trzy paski — po jednym na metę: gdzie stoi meta, którędy jechał robot i gdzie skończył. */
function MetaStrips({ heading, runs, color }: { heading: string; runs: MetaRun[]; color: string }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        {heading}
      </p>
      <ul className="mt-2 space-y-2.5">
        {runs.map((item) => (
          <li key={item.meta.id}>
            <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-xs leading-snug">
              <span>
                meta <strong>{item.meta.label}</strong>
              </span>
              <span
                className={cn(
                  item.outcome === 'stanal' ? 'text-muted-foreground' : 'text-amber-700 dark:text-amber-400'
                )}
              >
                {OUTCOME[item.outcome]}
              </span>
            </p>
            <Strip item={item} color={color} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/** Gwiazdka o promieniu 9 — punkty policzone raz, żeby nie liczyć sinusów przy renderze (hydracja). */
const STAR = '0,-9 2.1,-2.9 8.6,-2.8 3.4,1.1 5.3,7.3 0,3.6 -5.3,7.3 -3.4,1.1 -8.6,-2.8 -2.1,-2.9';

function Strip({ item, color }: { item: MetaRun; color: string }) {
  const start = item.path[0];
  const { final, touched, meta } = item;

  return (
    <svg
      viewBox="-240 -16 480 32"
      className="mt-1 h-8 w-full max-w-[420px] border bg-white dark:bg-zinc-950"
      role="img"
      aria-label={`Meta ${meta.label}: robot ${OUTCOME[item.outcome]}.`}
    >
      {/* Brzegi sceny, do których robot nie wyjdzie. */}
      <line x1={-205} x2={-205} y1={-7} y2={7} stroke="currentColor" strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700" />
      <line x1={205} x2={205} y1={-7} y2={7} stroke="currentColor" strokeWidth={1.5} className="text-zinc-300 dark:text-zinc-700" />
      <line x1={-205} x2={205} y1={0} y2={0} stroke="currentColor" strokeWidth={1} className="text-zinc-200 dark:text-zinc-800" />

      {/* Tyle, ile mierzy „dotykasz mety?” — od tego miejsca czujnik się zapala. */}
      <rect
        x={meta.x - TOUCH_RADIUS}
        y={-11}
        width={TOUCH_RADIUS * 2}
        height={22}
        fill={color}
        fillOpacity={0.14}
        stroke={color}
        strokeWidth={1}
        strokeDasharray="4 3"
      />
      <polygon points={STAR} transform={`translate(${meta.x} 0)`} fill="#f2b01e" stroke="#b7791f" strokeWidth={0.8} />

      <circle cx={start.x} cy={0} r={3} fill="none" stroke={color} strokeWidth={1.5} />
      <line x1={start.x} x2={final.x} y1={0} y2={0} stroke={color} strokeWidth={3} strokeLinecap="round" opacity={0.85} />
      {touched && item.outcome === 'dalej' && (
        <line x1={touched.x} x2={touched.x} y1={-13} y2={13} stroke="#d4643a" strokeWidth={2} />
      )}
      <path d={`M ${final.x - 7} -6 L ${final.x + 8} 0 L ${final.x - 7} 6 Z`} fill={color} />
    </svg>
  );
}

/** Ten sam test dla programu liczącego kroki — kontrast, który zamyka lekcję. */
function Contrast({ color }: { color: string }) {
  const runs = useMemo(() => driveAll(COUNTED_STACK), []);
  const hits = runs.filter((item) => item.outcome === 'stanal').length;

  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        Ten sam test dla robota, który liczy kroki
      </p>
      <div className="mt-2 overflow-x-auto pb-1">
        <Script blocks={COUNTED_STACK} />
      </div>
      <div className="mt-2">
        <MetaStrips heading="Robot liczący kroki na trzech metach" runs={runs} color={color} />
      </div>
      <p className="mt-3 text-sm leading-relaxed">
        Robot liczący kroki trafił w{' '}
        <strong>
          {hits} z {METAS.length}
        </strong>{' '}
        met — w tę, pod którą go napisano. Twój robot stanął przy każdej z nich, bo nikt nie podał mu
        odległości: pytał o nią czujnika.
      </p>
    </div>
  );
}
