'use client';

import { useEffect, useState } from 'react';
import { Check, RotateCcw } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { BLOCKS as BLOCK_DEFS, HOME, countInside, make, type Block, type Sprite } from '../../scratch/engine';
import { Script } from '../../scratch/loop-stack';

/**
 * „Zwiń to, co się powtarza” — haczyk lekcji 27: dziecko wskazuje w rozpisanym
 * skrypcie miejsce, od którego wszystko zaczyna się od nowa, i zwija powtarzający
 * się fragment w pętlę.
 *
 * Pętla *jest* zwinięciem powtórzenia, więc dowodem jest scena: pierwszy przebieg
 * rysuje kotem kwadrat (potem trójkąt) prawdziwą linią, a wersja zwinięta ma
 * przejść **dokładnie po tym samym śladzie**.
 *
 * Przebudowane 2026-10-14 po zgłoszeniu „sam jako dorosły nie umiem tego zrobić”.
 * Poprzednia wersja kazała przeciągnąć zaznaczenie po „turze” — słowo nic dziecku
 * nie mówiło, przeciąganie po klockach nie działało palcem (`pointerenter` nie
 * strzela przy dotyku), a ślad był czterema nakładającymi się sylwetkami, w których
 * nie dało się zobaczyć kwadratu. Teraz:
 *
 * 1. **Pytanie jest o to, co widać na scenie**: „od którego klocka kot zaczyna
 *    rysować drugi bok?”. W trakcie biegu świecą klocki właśnie rysowanego boku,
 *    więc odpowiedź da się wypatrzyć, a nie zgadywać.
 * 2. **Jedno stuknięcie zamiast przeciągania.** Początek powtórki jest zawsze pod
 *    flagą, więc wystarczy wskazać, gdzie zaczyna się drugi raz.
 * 3. **Najpierw uruchom, potem wskazuj** — stukanie jest zablokowane do pierwszego
 *    przebiegu, bo bez śladu na scenie pytanie o „drugi bok” nie ma sensu.
 */

const START: Sprite = { ...HOME, x: -60, y: 60, direction: 90, rotationStyle: 'lewo-prawo' };

interface Round {
  title: string;
  brief: string;
  /** Skrypt w wersji rozpisanej — klocek po klocku, tak jak pisze go dziecko. */
  seed: () => Block[];
  /** Zdanie po zwinięciu. */
  done: string;
}

const ROUNDS: Round[] = [
  {
    title: 'Kwadrat',
    brief:
      'Ten skrypt rysuje kotem kwadrat. Naciśnij zieloną flagę nad sceną i patrz, które klocki świecą, kiedy kot rysuje kolejne boki.',
    seed: () => [
      make('flaga'),
      ...Array.from({ length: 4 }, () => [make('idz', 120), make('obroc', 90), make('czekaj', 0.5)]).flat(),
    ],
    done: 'Dwanaście klocków pod flagą zmieściło się w czterech: pętla i trzy klocki jednego boku.',
  },
  {
    title: 'Trójkąt i podpis',
    brief:
      'Teraz trójkąt — a na sam koniec kot coś mówi. Uruchom, popatrz na scenę i znów znajdź klocek, od którego zaczyna się drugi bok.',
    seed: () => [
      make('flaga'),
      ...Array.from({ length: 3 }, () => [make('idz', 120), make('obroc', 120), make('czekaj', 0.5)]).flat(),
      make('powiedz', 'Gotowe!'),
    ],
    done: 'Pętla objęła trzy boki, a „powiedz” został pod nią — zdarza się raz, więc nie ma czego powtarzać.',
  },
];

/** Czy dwa klocki są takie same z punktu widzenia powtórzenia: ten sam typ i ta sama wartość. */
function same(a: Block, b: Block): boolean {
  return a.type === b.type && String(a.value ?? '') === String(b.value ?? '') && !a.inner && !b.inner;
}

function sameRun(blocks: Block[], from: number, at: number, length: number): boolean {
  for (let i = 0; i < length; i += 1) {
    const left = blocks[from + i];
    const right = blocks[at + i];
    if (!left || !right || !same(left, right)) return false;
  }
  return true;
}

/** Ile razy pod rząd, licząc od `from`, powtarza się fragment o długości `length`. */
function repeats(blocks: Block[], from: number, length: number): number {
  let count = 1;
  while (sameRun(blocks, from, from + count * length, length)) count += 1;
  return count;
}

/** Najkrótszy fragment, z którego złożony jest zaznaczony kawałek — albo jego cała długość. */
function period(blocks: Block[], from: number, length: number): number {
  for (let step = 1; step < length; step += 1) {
    if (length % step !== 0) continue;
    let ok = true;
    for (let at = step; at < length && ok; at += step) ok = sameRun(blocks, from, from + at, step);
    if (ok) return step;
  }
  return length;
}

/** Napis klocka tak, jak stoi w skrypcie — do podpowiedzi „szukaj drugiego takiego”. */
function label(block: Block): string {
  return BLOCK_DEFS[block.type].label.replace('{}', String(block.value ?? ''));
}

type Judgement =
  | { kind: 'ok'; times: number; length: number }
  | { kind: 'shorter'; sides: number }
  | { kind: 'first' }
  | { kind: 'once' };

/** Dziecko wskazało klocek `at` jako początek drugiego boku; pierwszy bok to więc klocki 1…at-1. */
function judge(blocks: Block[], at: number): Judgement {
  if (at === 1) return { kind: 'first' };
  const length = at - 1;
  const times = repeats(blocks, 1, length);
  if (times < 2) return { kind: 'once' };
  const unit = period(blocks, 1, length);
  if (unit < length) return { kind: 'shorter', sides: length / unit };
  return { kind: 'ok', times, length };
}

type Point = { x: number; y: number };

interface LoopFoldProps {
  color: string;
  onComplete?: () => void;
}

export function LoopFold({ color, onComplete }: LoopFoldProps) {
  const [at, setAt] = useState(0);
  const [blocks, setBlocks] = useState<Block[]>(() => ROUNDS[0].seed());
  const [pick, setPick] = useState<number | null>(null);
  const [folded, setFolded] = useState(false);
  /** Ślad bieżącego przebiegu i ślad pierwszego, rozpisanego — po nim ma przejść pętla. */
  const [live, setLive] = useState<Point[]>([]);
  const [first, setFirst] = useState<Point[]>([]);
  const program = useProgram(blocks, START);
  const anchorRef = useSectionScrollAnchor(at);

  const done = at >= ROUNDS.length;
  const round = ROUNDS[Math.min(at, ROUNDS.length - 1)];
  const verdict = pick != null ? judge(blocks, pick) : null;
  /* Zwinięty skrypt zalicza rundę dopiero po uruchomieniu — chodzi o porównanie śladu. */
  const proved = folded && program.finished;
  const sx = Math.round(program.sprite.x);
  const sy = Math.round(program.sprite.y);

  /* Linia rośnie za kotem: każde nowe miejsce na scenie to kolejny punkt łamanej. */
  useEffect(() => {
    if (!program.running) return;
    setLive((points) => {
      const last = points[points.length - 1];
      return last && last.x === sx && last.y === sy ? points : [...points, { x: sx, y: sy }];
    });
  }, [program.running, sx, sy]);

  /* Ślad rozpisanej wersji zostaje na scenie na szaro — przez niego przechodzi potem pętla. */
  useEffect(() => {
    if (program.finished && !folded) setFirst(live);
  }, [program.finished, folded, live]);

  const run = () => {
    setLive([{ x: START.x, y: START.y }]);
    program.start();
  };

  const tap = (index: number) => {
    if (folded || program.attempts === 0 || index === 0) return;
    setPick(index);
  };

  const fold = () => {
    if (pick == null || verdict?.kind !== 'ok') return;
    const { times, length } = verdict;
    const body = blocks.slice(1, 1 + length).map((block) => make(block.type, block.value));
    setBlocks([blocks[0], make('powtorz', times, body), ...blocks.slice(1 + length * times)]);
    setPick(null);
    setFolded(true);
    setLive([]);
    program.clear();
  };

  const nextRound = () => {
    const following = at + 1;
    setAt(following);
    setPick(null);
    setFolded(false);
    setLive([]);
    setFirst([]);
    program.clear();
    if (following < ROUNDS.length) setBlocks(ROUNDS[following].seed());
    else onComplete?.();
  };

  /* Kapelusz flagi nie jest poleceniem dla kota, więc nie wchodzi do licznika. */
  const count = countInside(blocks) - 1;
  const ok = verdict?.kind === 'ok' ? verdict : null;
  const lines = [
    ...(folded && first.length > 1 ? [{ points: first, color: '#d4d4d8', width: 14 }] : []),
    ...(live.length > 1 ? [{ points: live, color }] : []),
  ];

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!done && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Skrypt {at + 1} z {ROUNDS.length} · {round.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{round.brief}</p>
        </div>
      )}

      {!done && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
          <div>
            <div className="flex items-baseline justify-between gap-3 border-b pb-2">
              <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
                Skrypt kota
              </p>
              <p className="font-mono text-xs tabular-nums text-muted-foreground">
                klocków pod flagą: <strong className="text-foreground">{count}</strong>
              </p>
            </div>

            <div className="mt-3 overflow-x-auto pb-1">
              <Script
                blocks={blocks}
                decorate={(path) => {
                  const index = Number(path);
                  if (path.includes('.') || Number.isNaN(index)) return undefined;
                  const active = program.active;
                  return {
                    running: Boolean(active && index >= active.from && index <= active.to),
                    marked: Boolean(ok && index >= 1 && index <= ok.length) || (!ok && pick === index),
                  };
                }}
                onBlockDown={(path) => {
                  if (!path.includes('.')) tap(Number(path));
                }}
                renderAfter={(path) => {
                  const index = Number(path);
                  if (!ok || path.includes('.') || index < ok.length || index % ok.length !== 0 || index / ok.length > ok.times)
                    return null;
                  return (
                    <p className="my-0.5 pl-1 text-[11px] font-semibold" style={{ color }}>
                      ↑ bok {index / ok.length}
                    </p>
                  );
                }}
              />
            </div>

            <div className="mt-3 border-t pt-3">
              {program.attempts === 0 ? (
                <p className="text-xs leading-relaxed text-muted-foreground">
                  <strong className="text-foreground">Najpierw uruchom.</strong> Zielona flaga jest nad
                  sceną obok. Zanim zaczniesz coś skracać, zobacz, co ten program robi.
                </p>
              ) : folded ? (
                <Folded color={color} proved={proved} note={round.done} onNext={nextRound} last={at + 1 === ROUNDS.length} />
              ) : (
                <Picker color={color} blocks={blocks} verdict={verdict} onFold={fold} />
              )}
            </div>
          </div>

          <div>
            <StageView
              actors={[{ id: 'duszek', kind: 'kot', sprite: program.sprite }]}
              lines={lines}
              running={program.running}
              onStart={run}
              onStop={program.stop}
              note={folded ? 'wersja z pętlą' : 'wersja rozpisana'}
            />
            {folded && (
              <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
                Szara linia to ślad wersji rozpisanej. Kot z pętlą ma przejść dokładnie po niej.
              </p>
            )}
          </div>
        </div>
      )}

      {done && (
        <div className="p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Oba skrypty zwinięte.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            <strong>Pętla to nie skrót dla leniwych.</strong> To zapis tej samej myśli: „narysuj bok,
            i tak cztery razy”. Program robi dokładnie to samo, co dwanaście klocków pod rząd — ale
            gdy zechcesz większy kwadrat, zmienisz liczbę kroków raz, a nie cztery razy. I to jest
            prawdziwy powód, dla którego programiści piszą pętle.
          </p>
        </div>
      )}
    </div>
  );
}

function Picker({
  color,
  blocks,
  verdict,
  onFold,
}: {
  color: string;
  blocks: Block[];
  verdict: Judgement | null;
  onFold: () => void;
}) {
  if (!verdict)
    return (
      <p className="text-sm leading-relaxed">
        <strong>Teraz stuknij w skrypcie klocek, od którego kot zaczyna rysować drugi bok.</strong>{' '}
        <span className="text-muted-foreground">
          Wszystko nad nim to pierwszy bok — i dalej w skrypcie te same klocki stoją jeszcze raz.
        </span>
      </p>
    );

  if (verdict.kind === 'ok')
    return (
      <div className="p-3" style={{ backgroundColor: `${color}14` }}>
        <p className="text-sm leading-relaxed">
          Tak! Jeden bok to <strong>{verdict.length} klocki</strong>, a w skrypcie stoją one{' '}
          <strong>{verdict.times} razy</strong> pod rząd — popatrz na podpisy „bok 1, bok 2…”.
          Zamiast przepisywać je {verdict.times} razy, można powiedzieć: „powtórz {verdict.times} razy”.
        </p>
        <button
          type="button"
          onClick={onFold}
          className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          Zwiń w pętlę „powtórz {verdict.times} razy”
        </button>
      </div>
    );

  const note =
    verdict.kind === 'first'
      ? 'To pierwszy klocek pierwszego boku — od niego wszystko się zaczyna. Szukaj niżej: gdzie zaczyna się DRUGI bok?'
      : verdict.kind === 'shorter'
        ? `Od tego miejsca skrypt rzeczywiście zaczyna się od nowa — ale nad nim zmieściły się już ${verdict.sides} boki. Szukaj wyżej.`
        : `Od tego klocka skrypt nie zaczyna się tak, jak pod flagą. Pod flagą stoi „${label(blocks[1])}”. Gdzie ten sam klocek pojawia się drugi raz?`;

  return (
    <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
      <p className="flex items-center gap-2 text-sm font-semibold">
        <RotateCcw className="h-4 w-4 shrink-0" aria-hidden />
        Jeszcze nie to.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">{note}</p>
    </div>
  );
}

function Folded({
  color,
  proved,
  note,
  onNext,
  last,
}: {
  color: string;
  proved: boolean;
  note: string;
  onNext: () => void;
  last: boolean;
}) {
  return (
    <div className="p-3" style={{ backgroundColor: `${color}14` }}>
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Zwinięte. {note}
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">
        {proved
          ? 'Kot przeszedł dokładnie po szarym śladzie. Ten sam rysunek, ten sam program — tylko mniej klocków.'
          : 'Teraz naciśnij zieloną flagę jeszcze raz i sprawdź, czy kot przejdzie po szarym śladzie.'}
      </p>
      {proved && (
        <button
          type="button"
          onClick={onNext}
          className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          {last ? 'Kończę blok' : 'Następny skrypt'}
        </button>
      )}
    </div>
  );
}
