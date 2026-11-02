'use client';

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { RotateCcw, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { DoodlePad, DoodleThumb } from './doodle-pad';
import {
  PAIRS,
  featurize,
  guess,
  isDrawable,
  sampleDoodle,
  sampleTrays,
  type Doodle,
  type Example,
  type Guess,
  type Pair,
  type TrayId,
} from './doodle';
import type { Trained } from './draw-trainer';

/**
 * Blok 3 — **zmień dane, zobacz wynik** `[4.4]`.
 *
 * Wymaganie mówi wprost: *obserwuje, jak dane wpływają na jego wyniki*. Żeby
 * to było obserwowanie, a nie czytanie, w tym bloku **rysunek do rozpoznania
 * stoi w miejscu przez cały czas** — zmieniają się wyłącznie tace. Werdykt
 * przelicza się po każdym ruchu palca, bez przycisku, więc związek „ruszyłem
 * dane → maszyna zmieniła zdanie” jest natychmiastowy.
 *
 * Trzy doświadczenia, trzy sposoby, w jakie dane rządzą modelem, i każde ma
 * wynik pewny, niezależny od tego, jak dziecko rysuje:
 *
 * 1. **Pomyłka w danych** — przekładanie rysunków do złej tacy. Maszyna pyta
 *    trzech sąsiadów, więc jeden zły przykład zwykle zostaje przegłosowany,
 *    a dwa już nie; przełożenie wszystkich zawsze odwraca werdykt.
 * 2. **Za mało przykładów** — zabieranie z jednej tacy. Przy jednym rysunku
 *    w tacy dwóch z trzech sąsiadów musi pochodzić z drugiej, więc werdykt
 *    odwraca się najpóźniej wtedy.
 * 3. **Coś spoza tac** — maszyna nie ma przycisku „nie wiem”. Zna dwie tace,
 *    więc każdy rysunek wrzuca do jednej z nich.
 *
 * Tace są **dziecka**, z bloku 2. Kto przyszedł tu bez nich, dostaje rysunki
 * przykładowe i strona mówi to wprost.
 */

type Place = TrayId | 'kosz';

interface Setup {
  own: boolean;
  pair: Pair;
  examples: Example[];
  probe: { doodle: Doodle; vec: number[] };
}

/**
 * Rysunek do rozpoznania musi być na starcie rozpoznany dobrze — inaczej
 * pierwsze doświadczenie nie miałoby czego odwracać. Najpierw bierzemy
 * rysunek dziecka ze sprawdzianu, a gdy żaden się nie nadaje, przykładowy.
 */
function buildSetup(trained: Trained | null): Setup {
  if (trained) {
    const { pair, examples, tests } = trained;
    const enough = (['a', 'b'] as const).every((tray) => examples.filter((e) => e.tray === tray).length >= 3);
    if (enough) {
      const fromTest = tests.find((run) => run.expected === 'a' && guess(run.vec, examples)?.tray === 'a');
      if (fromTest) return { own: true, pair, examples, probe: { doodle: fromTest.doodle, vec: fromTest.vec } };
      const sample = findProbe(pair, examples);
      if (sample) return { own: true, pair, examples, probe: sample };
    }
  }
  const pair = PAIRS[0];
  const examples = sampleTrays(pair, 5);
  return { own: false, pair, examples, probe: findProbe(pair, examples)! };
}

function findProbe(pair: Pair, examples: Example[]) {
  for (let seed = 60; seed < 120; seed += 1) {
    const doodle = sampleDoodle(pair.a.id, seed);
    const vec = featurize(doodle);
    if (vec && guess(vec, examples)?.tray === 'a') return { doodle, vec };
  }
  return null;
}

interface Row {
  change: string;
  outcome: string;
}

export function DataLab({
  color,
  onComplete,
  trained,
}: {
  color: string;
  onComplete?: () => void;
  trained: Trained | null;
}) {
  /* Tace ustalamy raz, przy wejściu — w trakcie doświadczeń dane mają zmieniać się tylko z ręki dziecka. */
  const [setup] = useState(() => buildSetup(trained));
  const { pair, probe } = setup;
  const original = useMemo(
    () => Object.fromEntries(setup.examples.map((e) => [e.id, e.tray])) as Record<string, Place>,
    [setup]
  );
  const [places, setPlaces] = useState<Record<string, Place>>(original);
  const [step, setStep] = useState(0);
  const [solved, setSolved] = useState(false);
  const [rows, setRows] = useState<Row[]>([]);
  /** Ile przykładów trzeba było przełożyć w doświadczeniu 1 — od tego zależy, co mówi komunikat. */
  const [movedToFlip, setMovedToFlip] = useState(0);
  const [stranger, setStranger] = useState<Doodle>([]);
  const [strangerGuess, setStrangerGuess] = useState<{ doodle: Doodle; result: Guess } | null>(null);
  const anchor = useSectionScrollAnchor(step);

  const live = (map: Record<string, Place>) =>
    setup.examples
      .filter((example) => map[example.id] !== 'kosz')
      .map((example) => ({ ...example, tray: map[example.id] as TrayId }));

  const current = guess(probe.vec, live(places));
  /** Głosowanie przed jakąkolwiek zmianą danych. */
  const startVotes = useMemo(() => guess(probe.vec, setup.examples)?.votes ?? { a: 3, b: 0 }, [probe, setup]);
  const flipped = current?.tray === 'b';

  const apply = (next: Record<string, Place>) => {
    setPlaces(next);
    if (solved) return;
    const result = guess(probe.vec, live(next));
    if (result?.tray !== 'b') return;
    setSolved(true);
    if (step === 0) {
      const moved = setup.examples.filter((e) => next[e.id] !== original[e.id]).length;
      setMovedToFlip(moved);
      setRows((all) => [
        ...all,
        {
          change: `${count(moved, 'rysunek przełożony', 'rysunki przełożone', 'rysunków przełożonych')} do złej tacy`,
          outcome: `mówi »${pair.b.name}«, choć to ${pair.a.name}`,
        },
      ]);
    } else if (step === 1) {
      const left = setup.examples.filter((e) => original[e.id] === 'a' && next[e.id] === 'a').length;
      const taken = setup.examples.filter((e) => original[e.id] === 'a' && next[e.id] === 'kosz').length;
      setRows((all) => [
        ...all,
        {
          change: `z tacy »${pair.a.name}« zabrane: ${taken}, zostało: ${left}`,
          outcome: `mówi »${pair.b.name}«, choć to ${pair.a.name}`,
        },
      ]);
    }
  };

  const move = (id: string, to: Place) => {
    if (places[id] === to) return;
    apply({ ...places, [id]: to });
  };

  const nextStep = () => {
    setPlaces(original);
    setSolved(false);
    setStep((value) => value + 1);
  };

  const showStranger = () => {
    const vec = featurize(stranger);
    if (!vec) return;
    const result = guess(vec, live(original));
    if (!result) return;
    setStrangerGuess({ doodle: stranger, result });
    setRows((all) => [
      ...all,
      { change: 'rysunek, którego nie ma w żadnej tacy', outcome: `i tak mówi »${pair[result.tray].name}«` },
    ]);
    setStep(3);
    onComplete?.();
  };

  const neighborRank = new Map(current?.neighbors.map((n, index) => [n.example.id, index + 1]) ?? []);

  const goals = [
    <>
      <strong>Doświadczenie 1 — pomyłka w danych.</strong> Przekładaj rysunki z tacy »{pair.a.name}« do tacy »
      {pair.b.name}« (przeciągnij albo stuknij), aż maszyna zmieni zdanie. Zacznij od tych z numerkami — to one
      głosują.
    </>,
    <>
      <strong>Doświadczenie 2 — za mało przykładów.</strong> Wszystko wróciło na miejsce. Teraz stukaj rysunki w tacy »
      {pair.a.name}«, żeby je <strong>zabrać</strong> — aż maszyna przestanie rozpoznawać {pair.a.acc}.
    </>,
    <>
      <strong>Doświadczenie 3 — coś spoza tac.</strong> Tace znów są całe. Narysuj coś, czego nie ma w żadnej z nich —
      na przykład {pair.stranger}.
    </>,
  ];

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        {setup.own ? (
          <>
            To są <strong>twoje tace z poprzedniego bloku</strong> i rysunek, który maszyna rozpoznała dobrze.
          </>
        ) : (
          <>
            Nie masz jeszcze własnych tac, więc pracujesz na <strong>przykładowych rysunkach</strong> — jeśli wolisz
            swoje, wróć do bloku 2 i narysuj co najmniej trzy w każdej tacy.
          </>
        )}{' '}
        Rysunek do rozpoznania <strong>nie zmieni się ani o kreskę</strong>. Zmieniać będziesz tylko dane.
      </p>

      <div ref={anchor} className="mt-5">
        {step < 3 && (
          <p className="mb-4 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
            {goals[step]}
          </p>
        )}

        {step < 2 && (
          <div className="space-y-4 lg:grid lg:grid-cols-[220px_minmax(0,1fr)] lg:gap-6 lg:space-y-0">
            {/* Wyświetlacz werdyktu — przyklejony na wąskim ekranie, żeby był widoczny przy stukaniu w tace. */}
            <div className="sticky top-9 z-10 -mx-5 border-b bg-white px-5 py-3 dark:bg-zinc-900 sm:-mx-6 sm:px-6 lg:static lg:mx-0 lg:self-start lg:border lg:p-4">
              <ProbePanel probe={probe.doodle} result={current} pair={pair} color={color} flipped={flipped} />
            </div>

            <div className="space-y-3">
              {(['a', 'b'] as const).map((tray) => (
                <TrayBox
                  key={tray}
                  tray={tray}
                  pair={pair}
                  color={color}
                  items={setup.examples.filter((e) => places[e.id] === tray)}
                  original={original}
                  ranks={neighborRank}
                  winner={current?.tray}
                  mode={step === 0 ? 'move' : tray === 'a' ? 'remove' : 'locked'}
                  disabled={solved}
                  onTap={(id) => move(id, step === 0 ? (tray === 'a' ? 'b' : 'a') : 'kosz')}
                  onDrop={(id, target) => move(id, target)}
                />
              ))}
              {step === 1 && (
                <Bin
                  items={setup.examples.filter((e) => places[e.id] === 'kosz')}
                  disabled={solved}
                  onRestore={(id) => move(id, original[id])}
                />
              )}
            </div>
          </div>
        )}

        {step < 2 && solved && (
          <div className="mt-4 p-4 text-sm leading-relaxed" style={{ backgroundColor: `${color}12` }}>
            <p>
              <strong>Maszyna zmieniła zdanie</strong> — a rysunek do rozpoznania ani drgnął.{' '}
              {step === 1
                ? 'Kiedy w jednej tacy zostaje mało rysunków, sąsiadami prawie zawsze są rysunki z drugiej. Model, któremu pokazano dużo jednego, a mało drugiego, prawie wszystko wrzuca do tego pierwszego.'
                : startVotes.a === 2 && movedToFlip === 1
                  ? 'Wystarczył jeden przełożony rysunek, bo głosowanie od początku było na styk — dwa do jednego. Jeden zły przykład w najbliższym sąsiedztwie przeważył.'
                  : 'Liczą się te przykłady, które są najbardziej podobne — to one głosują. Jeden zły przykład wśród dobrych zostaje przegłosowany, a kilka już nie.'}
            </p>
            <button
              type="button"
              onClick={nextStep}
              className="mt-3 inline-flex cursor-pointer items-center gap-2 border bg-white px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted dark:bg-zinc-900"
              style={{ borderColor: color, color }}
            >
              <RotateCcw className="h-4 w-4" aria-hidden />
              Odłóż wszystko na miejsce i idź dalej
            </button>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-3 sm:flex sm:items-start sm:gap-6 sm:space-y-0">
            <div className="sm:w-[260px]">
              <DoodlePad doodle={stranger} onChange={setStranger} color={color} />
              <button
                type="button"
                onClick={showStranger}
                disabled={!isDrawable(stranger)}
                className="mt-3 w-full cursor-pointer border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
                style={{ borderColor: color, color }}
              >
                Pokaż maszynie
              </button>
            </div>
            <p className="text-sm leading-relaxed text-muted-foreground sm:flex-1">
              Maszyna zna tylko dwie tace: »{pair.a.name}« i »{pair.b.name}«. Ciekawe, co powie na rysunek, który nie
              pasuje do żadnej z nich.
            </p>
          </div>
        )}

        {strangerGuess && (
          <div className="flex items-center gap-4">
            <div className="border">
              <DoodleThumb doodle={strangerGuess.doodle} size={80} />
            </div>
            <div>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">maszyna mówi</p>
              <p className="text-2xl font-black uppercase tracking-tight" style={{ color }}>
                {pair[strangerGuess.result.tray].name}
              </p>
              <p className="text-sm text-muted-foreground">bez chwili wahania</p>
            </div>
          </div>
        )}

        {rows.length > 0 && (
          <div className="mt-5 p-4" style={{ backgroundColor: `${color}12` }}>
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide" style={{ color }}>
                  <th className="pb-2 pr-3 font-semibold">co zmieniłem/zmieniłam w danych</th>
                  <th className="pb-2 font-semibold">co zrobiła maszyna</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, index) => (
                  <tr key={index} className="border-t align-top">
                    <td className="py-2 pr-3">{row.change}</td>
                    <td className="py-2">{row.outcome}</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {step === 3 && (
              <div className="mt-3 space-y-2 text-sm leading-relaxed">
                <p>
                  Nie ma w niej przycisku „nie wiem”. Zna dwie tace, więc <strong>każdy</strong> rysunek wrzuca do jednej
                  z nich — i mówi to tym samym tonem, co wtedy, gdy ma rację.
                </p>
                <p>
                  Trzy doświadczenia, jeden wniosek: <strong>model jest dokładnie tak dobry jak jego przykłady</strong>.
                  Pomyłka w tacy staje się pomyłką w odpowiedzi, mała taca przegrywa z dużą, a to, czego w tacach nie
                  było, i tak dostaje jakąś etykietę. Dlatego odpowiedź maszyny zawsze trzeba sprawdzić.
                </p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProbePanel({
  probe,
  result,
  pair,
  color,
  flipped,
}: {
  probe: Doodle;
  result: Guess | null;
  pair: Pair;
  color: string;
  flipped: boolean;
}) {
  return (
    <div className="flex items-center gap-4 lg:flex-col lg:items-start lg:gap-3">
      <div className="shrink-0 border">
        <DoodleThumb doodle={probe} size={84} />
      </div>
      <div className="min-w-0">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">rysunek do rozpoznania — maszyna mówi</p>
        <p
          className="text-2xl font-black uppercase tracking-tight transition-colors"
          style={{ color: flipped ? '#b45309' : color }}
          aria-live="polite"
        >
          {result ? pair[result.tray].name : '—'}
        </p>
        {result && (
          <p className="text-xs tabular-nums text-muted-foreground">
            głosy: {pair.a.name} {result.votes.a} · {pair.b.name} {result.votes.b}
          </p>
        )}
      </div>
    </div>
  );
}

function TrayBox({
  tray,
  pair,
  color,
  items,
  original,
  ranks,
  winner,
  mode,
  disabled,
  onTap,
  onDrop,
}: {
  tray: TrayId;
  pair: Pair;
  color: string;
  items: Example[];
  original: Record<string, Place>;
  ranks: Map<string, number>;
  winner?: TrayId;
  mode: 'move' | 'remove' | 'locked';
  disabled: boolean;
  onTap: (id: string) => void;
  onDrop: (id: string, target: Place) => void;
}) {
  return (
    <div data-drop-tray={tray} className="border p-3">
      <p className="mb-2 flex items-baseline justify-between text-xs font-semibold uppercase tracking-wide">
        <span style={{ color }}>taca »{pair[tray].name}«</span>
        <span className="tabular-nums text-muted-foreground">{items.length}</span>
      </p>
      <div className="flex min-h-[60px] flex-wrap gap-2">
        {items.map((example) => {
          const rank = ranks.get(example.id);
          const misplaced = original[example.id] !== tray;
          return (
            <DraggableThumb
              key={example.id}
              example={example}
              draggable={mode === 'move' && !disabled}
              tappable={mode !== 'locked' && !disabled}
              onTap={() => onTap(example.id)}
              onDrop={(target) => target && target !== tray && onDrop(example.id, target)}
              label={mode === 'remove' ? 'Zabierz ten rysunek' : `Przełóż do drugiej tacy`}
            >
              {rank && (
                <span
                  className="absolute -left-2 -top-2 z-10 flex h-5 w-5 items-center justify-center text-[11px] font-bold text-white"
                  style={{ backgroundColor: example.tray === winner ? color : '#a1a1aa' }}
                >
                  {rank}
                </span>
              )}
              {misplaced && (
                <span className="absolute -bottom-2 left-1/2 z-10 -translate-x-1/2 bg-amber-100 px-1 text-[9px] font-bold uppercase text-amber-800">
                  nie tu
                </span>
              )}
              {mode === 'remove' && !disabled && (
                <span className="absolute -right-1.5 -top-1.5 z-10 flex h-5 w-5 items-center justify-center border bg-white text-muted-foreground dark:bg-zinc-900">
                  <Trash2 className="h-3 w-3" aria-hidden />
                </span>
              )}
              <div
                className="border-2"
                style={{ borderColor: rank ? (example.tray === winner ? color : '#a1a1aa') : 'transparent' }}
              >
                <DoodleThumb doodle={example.doodle} size={52} />
              </div>
            </DraggableThumb>
          );
        })}
      </div>
    </div>
  );
}

function Bin({
  items,
  disabled,
  onRestore,
}: {
  items: Example[];
  disabled: boolean;
  onRestore: (id: string) => void;
}) {
  return (
    <div className="border border-dashed p-3">
      <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        <Trash2 className="h-3.5 w-3.5" aria-hidden />
        zabrane — stuknij, żeby oddać
      </p>
      <div className="flex min-h-[40px] flex-wrap gap-1.5">
        {items.map((example) => (
          <button
            key={example.id}
            type="button"
            disabled={disabled}
            onClick={() => onRestore(example.id)}
            className="cursor-pointer border opacity-60 transition-opacity hover:opacity-100 disabled:cursor-default"
            aria-label="Oddaj ten rysunek do tacy"
          >
            <DoodleThumb doodle={example.doodle} size={36} />
          </button>
        ))}
      </div>
    </div>
  );
}

/**
 * Miniatura, którą da się przeciągnąć do drugiej tacy albo po prostu stuknąć.
 * Przeciąganie jest własne, na zdarzeniach wskaźnika: miejsce upuszczenia
 * rozpoznajemy po `data-drop-tray` pod palcem, pomijając samą przeciąganą
 * miniaturę (inaczej zawsze „upuszczałaby się” we własnej tacy).
 */
function DraggableThumb({
  example,
  draggable,
  tappable,
  onTap,
  onDrop,
  label,
  children,
}: {
  example: Example;
  draggable: boolean;
  tappable: boolean;
  onTap: () => void;
  onDrop: (target: Place | null) => void;
  label: string;
  children: ReactNode;
}) {
  const node = useRef<HTMLButtonElement>(null);
  const start = useRef<{ x: number; y: number } | null>(null);
  /**
   * Po przeciągnięciu przeglądarka i tak wysyła `click` — a stan `offset` jest
   * już wtedy wyzerowany, więc bez tej flagi upuszczony rysunek od razu
   * wracałby stuknięciem do tacy, z której przyszedł.
   */
  const justDragged = useRef(false);
  const [offset, setOffset] = useState<{ x: number; y: number } | null>(null);

  const down = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!draggable) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    start.current = { x: event.clientX, y: event.clientY };
  };

  const moveHandler = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dx = event.clientX - start.current.x;
    const dy = event.clientY - start.current.y;
    if (offset || Math.hypot(dx, dy) > 6) setOffset({ x: dx, y: dy });
  };

  const up = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (!start.current) return;
    const dragged = offset !== null;
    start.current = null;
    setOffset(null);
    try {
      event.currentTarget.releasePointerCapture(event.pointerId);
    } catch {
      /* nic */
    }
    if (!dragged) return;
    justDragged.current = true;
    const under = document
      .elementsFromPoint(event.clientX, event.clientY)
      .filter((element) => !node.current?.contains(element))
      .map((element) => element.closest<HTMLElement>('[data-drop-tray]'))
      .find(Boolean);
    onDrop((under?.dataset.dropTray as Place | undefined) ?? null);
  };

  return (
    <button
      ref={node}
      type="button"
      data-example={example.id}
      aria-label={label}
      disabled={!tappable}
      onClick={() => {
        if (justDragged.current) {
          justDragged.current = false;
          return;
        }
        onTap();
      }}
      onPointerDown={down}
      onPointerMove={moveHandler}
      onPointerUp={up}
      onPointerCancel={() => {
        start.current = null;
        setOffset(null);
      }}
      className={cn(
        'relative cursor-pointer select-none disabled:cursor-default',
        draggable && 'touch-none',
        offset && 'z-30 shadow-lg'
      )}
      style={offset ? { transform: `translate(${offset.x}px, ${offset.y}px)` } : undefined}
    >
      {children}
    </button>
  );
}
