'use client';

import { useMemo, useRef, useState, type ReactNode } from 'react';
import { Copy, Info, MousePointerClick } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell } from '../../task-shell';
import { Bench } from '../../scratch/bench';
import { GreenFlag, LetterArt, StageView } from '../../scratch/stage-view';
import { useStage } from '../../scratch/use-stage';
import { HOME, make, type Block, type BlockType, type Category, type Sprite } from '../../scratch/engine';
import { oneByOne, together, type ActorDef } from '../../scratch/stage-engine';
import { MIN_LETTERS, Z8_CRITERIA, judgeZ8, type NameLetter, type Z8Report } from './z8';
import { TimeTrack } from './time-track';

/**
 * Zadanie obowiązkowe **Z-8** — litery imienia — **wykonywane na stronie**.
 *
 * Dziecko **wpisuje swoje imię**, a każda litera staje się osobnym duszkiem na scenie (to jest
 * dokładnie porównywalna wartość, więc werdykt niczego nie zgaduje). Potem układa skrypty na
 * tej samej pracowni klocków, na której pracowało w bloku „Miało być naraz” — jeden duszek naraz,
 * z zakładkami jak lista duszków w Scratchu — i uruchamia je na scenie z osią czasu.
 *
 * Werdykt **uruchamia program dziecka** (`runStage`) i patrzy na zegar: kiedy każda litera się
 * pojawiła i kiedy znikła. Dwie drogi do tego samego wyniku, obie z treści zadania — różne
 * czekania i komunikat — są uznawane; o kształcie skryptu werdykt nie rozstrzyga.
 *
 * Nagrodą jest jego program odtworzony z powrotem na osi czasu: **schodki u góry, jedna pionowa
 * kreska na dole** — dowód, którego nie trzeba tłumaczyć słowami.
 *
 * Trzy rzeczy, które robią z tego zadanie, a nie żmudną robotę:
 * - **kopiowanie skryptów do liter, które jeszcze nic nie mają** — jak przeciągnięcie skryptu na
 *   duszka w Scratchu; nie nadpisuje pracy, którą dziecko już poprawiło;
 * - **czekanie do pięciu sekund** (`WAITS`), bo trzy domyślne wartości (0,5 / 1 / 2 s) dają tylko
 *   trzy różne chwile, a imię ma ich do dziesięciu;
 * - **mniejsze kafelki liter** przy dłuższym imieniu (`tileFor`), żeby dziesięć liter mieściło się
 *   na scenie bez zachodzenia na siebie.
 */

/** Najdłuższe imię: tyle liter mieści scena z mniejszymi kafelkami. */
const MAX_LETTERS = 10;

const PALETTE: BlockType[] = ['flaga', 'odbior', 'nadaj', 'pokaz', 'ukryj', 'czekaj'];

/** Do pięciu sekund co pół: wystarcza na imię o dziesięciu literach i na nadawcę „znikaj” po nich. */
const WAITS = [0.5, 1, 1.5, 2, 2.5, 3, 3.5, 4, 5];
const VALUE_SETS = { czekaj: WAITS };

const CAT_HOME: Sprite = { ...HOME, x: -170, y: -95, visible: false };
const LETTER_Y = 20;

/** Kafelek litery, gdy imię jest długie — zwykły ma 44–48 px, a dziesięć liter na scenie 300 px szerokości potrzebuje 24. */
const TILE_MEDIUM = 'h-8 w-8 rounded-[8px] text-base sm:h-8 sm:w-8 sm:text-base';
const TILE_SMALL = 'h-6 w-6 rounded-[6px] text-xs sm:h-6 sm:w-6 sm:text-xs';

export function tileFor(count: number): string | undefined {
  if (count >= 9) return TILE_SMALL;
  if (count >= 7) return TILE_MEDIUM;
  return undefined;
}

interface CastLetter extends NameLetter {
  x: number;
}

/** Litery imienia rozstawione równo po scenie: do sześciu co 80 jednostek, dalej gęściej, ale zawsze w jednej linii. */
function castOf(name: string): CastLetter[] {
  const letters = [...name];
  const gap = letters.length > 1 ? Math.min(80, 400 / (letters.length - 1)) : 0;
  return letters.map((letter, index) => ({
    id: `l${index}`,
    letter,
    x: Math.round(-(gap * (letters.length - 1)) / 2 + index * gap),
  }));
}

/** Same litery, do dziesięciu — reszta znaków (spacje, cyfry, myślniki) nie jest literą imienia. */
function sanitize(value: string): string {
  return [...value.normalize('NFC')].filter((char) => /\p{L}/u.test(char)).slice(0, MAX_LETTERS).join('');
}

/** Każdy duszek ma stałą liczbę miejsc na skrypty: litera dwa, Kot jedno. */
const EMPTY_LETTER: Block[][] = [[], []];
const EMPTY_CAT: Block[][] = [[]];

const slotsOf = (id: string): Block[][] => (id === 'kot' ? EMPTY_CAT : EMPTY_LETTER);

const isBlank = (slots?: Block[][]) => !slots || slots.every((stack) => stack.length === 0);

/** Kopia skryptu z nowymi `id` klocków — te same `id` w dwóch duszkach mieszałyby klucze w pracowni. */
const cloneStack = (stack: Block[]): Block[] => stack.map((block) => make(block.type, block.value));

function labelsOf(id: string, letter?: string): string[] {
  return id === 'kot'
    ? ['Kot · skrypt 1']
    : [`Litera ${letter?.toUpperCase()} · skrypt 1`, `Litera ${letter?.toUpperCase()} · skrypt 2`];
}

/** Wzorzec zlecenia — trzy litery, które pokazują się po kolei i znikają razem. */
const DEMO = [
  { id: 'a', letter: 'A', x: -80, wait: 0.6 },
  { id: 'l', letter: 'L', x: 0, wait: 1.2 },
  { id: 'o', letter: 'O', x: 80, wait: 1.8 },
];

const DEMO_ACTORS: ActorDef[] = [
  {
    id: 'kot',
    name: 'Kot',
    home: CAT_HOME,
    scripts: [[make('flaga'), make('czekaj', 3), make('nadaj', 'znikaj')]],
  },
  ...DEMO.map((item) => ({
    id: item.id,
    name: `Litera ${item.letter}`,
    home: { ...HOME, x: item.x, y: LETTER_Y, visible: true } as Sprite,
    scripts: [
      [make('flaga'), make('ukryj'), make('czekaj', item.wait), make('pokaz')],
      [make('odbior', 'znikaj'), make('ukryj')],
    ],
  })),
];

interface NameStudioProps {
  color: string;
  onComplete?: () => void;
}

export function NameStudio({ color, onComplete }: NameStudioProps) {
  const [name, setName] = useState('');
  const [scripts, setScripts] = useState<Record<string, Block[][]>>({});
  const [tab, setTab] = useState('l0');
  const [category, setCategory] = useState<Category>('zdarzenia');
  const [copied, setCopied] = useState<number | null>(null);
  const stageBox = useRef<HTMLDivElement>(null);

  const cast = useMemo(() => castOf(name), [name]);
  const tile = tileFor(cast.length);

  const actors = useMemo<ActorDef[]>(
    () => [
      { id: 'kot', name: 'Kot', home: CAT_HOME, scripts: (scripts.kot ?? []).filter((stack) => stack.length > 0) },
      ...cast.map((item) => ({
        id: item.id,
        name: `Litera ${item.letter.toUpperCase()}`,
        home: { ...HOME, x: item.x, y: LETTER_Y, visible: true } as Sprite,
        scripts: (scripts[item.id] ?? []).filter((stack) => stack.length > 0),
      })),
    ],
    [cast, scripts]
  );
  const stage = useStage(actors);

  /* Imię mogło się skrócić pod zakładką, na której stoi dziecko. */
  const activeId = tab === 'kot' || cast.some((item) => item.id === tab) ? tab : (cast[0]?.id ?? 'kot');
  const active = cast.find((item) => item.id === activeId);
  const copyTargets = cast.filter((item) => item.id !== activeId && isBlank(scripts[item.id]));
  const canCopy = activeId !== 'kot' && !isBlank(scripts[activeId]) && copyTargets.length > 0;

  const pick = (id: string) => {
    setTab(id);
    setCopied(null);
  };

  const copy = () => {
    const source = scripts[activeId];
    if (!source) return;
    setScripts((previous) => {
      const next = { ...previous };
      for (const target of copyTargets) next[target.id] = source.map(cloneStack);
      return next;
    });
    setCopied(copyTargets.length);
  };

  const reset = () => {
    setScripts({});
    setTab('l0');
    setCopied(null);
    setCategory('zdarzenia');
    stage.clear();
  };

  /** Uruchamia program i, jeśli scena stoi poza widokiem (wąski ekran: pod skryptami), przewija do niej. */
  const runInView = () => {
    stage.fire({ kind: 'flaga' });
    const box = stageBox.current?.getBoundingClientRect();
    if (!box || (box.top >= 130 && box.bottom <= window.innerHeight)) return;
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    stageBox.current?.scrollIntoView({ behavior: calm ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <TaskShell<Z8Report>
      color={color}
      criteria={Z8_CRITERIA}
      judge={() => judgeZ8(cast, actors)}
      renderReport={(report) => <Z8ReportView report={report} color={color} />}
      onReset={reset}
      onComplete={onComplete}
      brief={
        <>
          <p className="border-l-2 pl-3 italic" style={{ borderColor: color }}>
            Utwórz program, w którym duszkami będą litery twojego imienia. Po uruchomieniu projektu
            na scenie powinny pojawiać się kolejne litery, aż będzie widoczne całe imię. Następnie
            wszystkie litery powinny jednocześnie zniknąć.
          </p>
          <p className="mt-3">
            Wszystko, czego to wymaga, robiłeś/robiłaś już dzisiaj: <strong>ukryj na starcie</strong>
            , <strong>różne czekania</strong> na pojawianie się po kolei i{' '}
            <strong>jeden komunikat</strong> na wspólne zniknięcie.
          </p>
          <p className="mt-2">
            Uruchomię twój program u siebie na scenie i <strong>zmierzę zegarem</strong>, kiedy
            pojawia się i znika każda litera.
          </p>
        </>
      }
      goal={<GoalPreview color={color} />}
      workshop={
        <div>
          <div className="max-w-sm">
            <label
              htmlFor="z8-imie"
              className="text-xs font-semibold uppercase tracking-wide text-muted-foreground"
            >
              Twoje imię
            </label>
            <input
              id="z8-imie"
              type="text"
              value={name}
              onChange={(event) => {
                setName(sanitize(event.target.value));
                setCopied(null);
              }}
              autoComplete="off"
              spellCheck={false}
              placeholder="np. Zosia"
              className="mt-1 w-full border bg-white px-3 py-2 text-base font-semibold tracking-wide outline-none focus:border-foreground dark:bg-zinc-900"
            />
            <p className="mt-1 flex items-start gap-1.5 text-xs leading-relaxed text-muted-foreground">
              <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
              <span>
                Od {MIN_LETTERS} do {MAX_LETTERS} liter — każda będzie osobnym duszkiem. Imię jest
                dłuższe? Wpisz to, jak cię wołają w domu. Zostaje tylko na tej stronie i znika po jej
                zamknięciu.
              </span>
            </p>
          </div>

          {cast.length === 0 ? (
            <p className="mt-4 border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground" style={{ borderColor: color }}>
              Zacznij od imienia. Kiedy je wpiszesz, z każdej litery zrobię osobnego duszka i pojawi
              się miejsce na jego skrypty.
            </p>
          ) : (
            <>
              <div className="mt-4">
                <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Duszki — wybierz, którego skrypty układasz
                </p>
                <div className="flex flex-wrap gap-1.5" role="group" aria-label="Duszki">
                  <TabButton
                    selected={activeId === 'kot'}
                    onClick={() => pick('kot')}
                    color={color}
                    label="Kot"
                    blank={isBlank(scripts.kot)}
                  >
                    <span className="text-xs font-semibold">Kot</span>
                  </TabButton>
                  {cast.map((item) => (
                    <TabButton
                      key={item.id}
                      selected={activeId === item.id}
                      onClick={() => pick(item.id)}
                      color={color}
                      label={`Litera ${item.letter.toUpperCase()}`}
                      blank={isBlank(scripts[item.id])}
                    >
                      <LetterArt
                        letter={item.letter}
                        className="h-6 w-6 rounded-[5px] text-xs sm:h-6 sm:w-6 sm:text-xs"
                      />
                    </TabButton>
                  ))}
                </div>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Kropka przy duszku znaczy, że ma już jakiś skrypt.
                </p>
              </div>

              <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
                <div>
                  <Bench
                    key={activeId}
                    color={color}
                    stacks={scripts[activeId] ?? slotsOf(activeId)}
                    onStacksChange={(next) => {
                      setScripts((previous) => ({ ...previous, [activeId]: next }));
                      setCopied(null);
                    }}
                    available={PALETTE}
                    category={category}
                    onCategoryChange={setCategory}
                    locked={stage.running}
                    stackLabels={labelsOf(activeId, active?.letter)}
                    valueSets={VALUE_SETS}
                    scriptHint="Każdy skrypt zaczyna się od kapelusza."
                  />

                  {activeId !== 'kot' && (
                    <div className="mt-3">
                      <button
                        type="button"
                        onClick={copy}
                        disabled={!canCopy}
                        className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40"
                        style={{ borderColor: color, color }}
                      >
                        <Copy className="h-4 w-4" aria-hidden />
                        Skopiuj skrypty tej litery do pozostałych, jeszcze pustych
                      </button>
                      <p className="mt-1 text-[11px] leading-relaxed text-muted-foreground">
                        {copied != null ? (
                          <>
                            Skopiowane do {copied}{' '}
                            {copied === 1 ? 'litery' : 'liter'}. Kopie są <strong>identyczne</strong>{' '}
                            — czekanie w każdej trzeba jeszcze dopasować. Litery, które już mają
                            skrypty, zostają nietknięte.
                          </>
                        ) : (
                          <>Tak jak w Scratchu: skrypt można przenieść na innego duszka, zamiast układać go od nowa.</>
                        )}
                      </p>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={runInView}
                    disabled={stage.running}
                    className="mt-3 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50 disabled:cursor-not-allowed disabled:opacity-40 lg:hidden"
                    style={{ borderColor: color, color }}
                  >
                    <GreenFlag className="h-4 w-4" />
                    Uruchom i pokaż na scenie
                  </button>
                </div>

                {/* `scroll-mt-32` zostawia zapas na pasek powłoki, który dla gościa ma 118 px na telefonie. */}
                <div ref={stageBox} className="scroll-mt-32">
                  <StageView
                    actors={[
                      { id: 'kot', kind: 'kot', sprite: stage.sprites.kot ?? CAT_HOME },
                      ...cast.map((item) => ({
                        id: item.id,
                        kind: 'kot' as const,
                        letter: item.letter,
                        letterClass: tile,
                        sprite:
                          stage.sprites[item.id] ?? { ...HOME, x: item.x, y: LETTER_Y, visible: true },
                      })),
                    ]}
                    running={stage.running}
                    onStart={() => stage.fire({ kind: 'flaga' })}
                    onStop={stage.stop}
                  />
                  <TimeTrack
                    className="mt-3"
                    rows={[
                      { id: 'kot', label: 'Kot' },
                      ...cast.map((item) => ({
                        id: item.id,
                        letter: item.letter,
                        label: `Litera ${item.letter.toUpperCase()}`,
                      })),
                    ]}
                    run={stage.last}
                    now={stage.now}
                  />
                  {stage.idle && (
                    <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
                      Flaga naciśnięta, a na scenie cisza. Żaden duszek nie ma skryptu, który
                      zaczyna się od kapelusza <strong>„kiedy kliknięto zieloną flagę”</strong>.
                    </p>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      }
      acceptedText={
        <>
          To twój program, uruchomiony u mnie na scenie — razem z twoim imieniem. Popatrz na oś
          czasu wyżej: <strong>schodki na górze, jedna pionowa kreska na dole</strong>. Dokładnie o
          to chodziło w całej lekcji.
        </>
      }
    />
  );
}

/** Zakładka duszka — jak jego miniatura na liście duszków w Scratchu. */
function TabButton({
  selected,
  onClick,
  color,
  label,
  blank,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  color: string;
  label: string;
  blank: boolean;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={selected}
      aria-label={`${label}${blank ? '' : ' — ma skrypty'}`}
      className={cn(
        'relative inline-flex h-9 min-w-9 cursor-pointer items-center justify-center border px-1.5 transition-colors',
        selected ? 'bg-muted/60' : 'hover:bg-muted/40'
      )}
      style={{ borderColor: selected ? color : undefined, boxShadow: selected ? `inset 0 -2px 0 ${color}` : undefined }}
    >
      {children}
      {!blank && (
        <span
          className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border border-white dark:border-zinc-900"
          style={{ backgroundColor: color }}
          aria-hidden
        />
      )}
    </button>
  );
}

/** Podgląd zamówienia: sam wynik, bez klocków. */
function GoalPreview({ color }: { color: string }) {
  const stage = useStage(DEMO_ACTORS);
  return (
    <div className="grid gap-3 border bg-muted/20 p-3 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
      <div>
        <StageView
          actors={DEMO.map((item) => ({
            id: item.id,
            kind: 'kot' as const,
            letter: item.letter,
            sprite: stage.sprites[item.id] ?? { ...HOME, x: item.x, y: LETTER_Y, visible: true },
          }))}
          running={stage.running}
          onStart={() => stage.fire({ kind: 'flaga' })}
          onStop={stage.stop}
        />
        <p className="mt-2 flex items-center justify-center gap-1.5 text-xs font-semibold" style={{ color }}>
          <MousePointerClick className="h-3.5 w-3.5 shrink-0" aria-hidden />
          Naciśnij flagę — tak ma to wyglądać.
        </p>
      </div>
      <div>
        <TimeTrack
          rows={DEMO.map((item) => ({ id: item.id, letter: item.letter, label: `Litera ${item.letter}` }))}
          run={stage.last}
          now={stage.now}
        />
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          U ciebie będą litery <strong className="text-foreground">twojego imienia</strong> i twoje
          własne czekania. Liczy się kształt na osi: najpierw{' '}
          <strong className="text-foreground">schodki</strong>, potem{' '}
          <strong className="text-foreground">jedna kreska</strong>.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Raport — program dziecka odtworzony na osi czasu                    */
/* ------------------------------------------------------------------ */

function Z8ReportView({ report, color }: { report: Z8Report; color: string }) {
  const { actors, letters, name } = report;
  const stage = useStage(actors);
  const tile = tileFor(letters.length);
  const shown = letters.map((item) => item.shown);
  const hidden = letters.map((item) => item.hidden);
  const homeOf = (id: string): Sprite => actors.find((actor) => actor.id === id)?.home ?? HOME;

  return (
    <div className="border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Twój program, uruchomiony na mojej scenie
      </p>
      <p className="mt-1 text-sm">
        Imię: <strong>{name || '—'}</strong>
        {letters.length > 0 && <> · {letters.length} duszków-liter</>}
      </p>

      {letters.length > 0 && (
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {letters.map((item) => (
            <div key={item.id} className="text-center">
              <LetterArt letter={item.letter} className="mx-auto h-9 w-9 rounded-[7px] text-base sm:h-9 sm:w-9 sm:text-base" />
              <p className="mt-1 text-[10px] tabular-nums leading-tight text-muted-foreground">
                {item.shown != null ? `${(item.shown / 1000).toFixed(1)} s` : '—'}
                {' → '}
                {item.hidden != null ? `${(item.hidden / 1000).toFixed(1)} s` : '—'}
              </p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,300px)_minmax(0,1fr)]">
        <div>
          <StageView
            actors={letters.map((item) => ({
              id: item.id,
              kind: 'kot' as const,
              letter: item.letter,
              letterClass: tile,
              sprite: stage.sprites[item.id] ?? homeOf(item.id),
            }))}
            running={stage.running}
            onStart={() => stage.fire({ kind: 'flaga' })}
            onStop={stage.stop}
          />
          <p className="mt-2 text-center text-xs text-muted-foreground">
            Naciśnij flagę — to twoje skrypty, tyle że puszczone jeszcze raz.
          </p>
        </div>

        <div className="min-w-0">
          <TimeTrack
            rows={[
              { id: 'kot', label: 'Kot' },
              ...letters.map((item) => ({
                id: item.id,
                letter: item.letter,
                label: `Litera ${item.letter.toUpperCase()}`,
              })),
            ]}
            run={stage.last ?? report.run}
            now={stage.now}
            note={summary(shown, hidden)}
          />
        </div>
      </div>
    </div>
  );
}

function summary(shown: (number | null)[], hidden: (number | null)[]): string {
  const appear = oneByOne(shown) ? 'schodki' : 'jedna kreska albo bałagan';
  const vanish = together(hidden) ? 'jedna pionowa kreska' : 'schodki';
  return `Pojawianie się: ${appear}. Znikanie: ${vanish}.`;
}
