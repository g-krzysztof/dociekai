'use client';

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { BlockChip } from '../../scratch/bench';
import { StageView, LetterArt } from '../../scratch/stage-view';
import { useStage } from '../../scratch/use-stage';
import { HOME, make, type Sprite } from '../../scratch/engine';
import { oneByOne, shownAt, together, type ActorDef, type StageRun } from '../../scratch/stage-engine';
import { TimeTrack } from './time-track';

/**
 * „Pulpit czasu” — trzy litery, trzy czekania i jedno pytanie: po kolei czy naraz.
 *
 * Skrypt każdej litery jest **z góry dany i identyczny** (`kiedy flaga → ukryj →
 * czekaj … → pokaż`), a jedyne, co dziecko zmienia, to liczba w czekaniu —
 * ustawiana **przeciągnięciem znacznika po osi czasu**, nie wpisywana. Dzięki
 * temu trzy zlecenia („po kolei”, „naraz”, „po kolei od końca”) są trzema
 * różnymi układami znaczników, które widać jeszcze zanim program ruszy: równe
 * czekania układają się w pionową kreskę, różne — w schodki.
 *
 * To jest też miejsce, w którym do lekcji wchodzi para `ukryj`/`pokaż` i wzorzec,
 * bez którego Z-8 nie ma prawa zadziałać: **litera musi zniknąć w pierwszej
 * milisekundzie programu**, inaczej „pojawia się” nic nie znaczy, bo była
 * widoczna od początku.
 *
 * Werdykt czyta **czasy z przebiegu**, nie ustawienia suwaków — te same funkcje
 * (`shownAt`, `oneByOne`, `together`), którymi potem sprawdzany jest program dziecka
 * w zadaniu.
 */

const LETTERS = [
  { id: 'k', letter: 'K', x: -110 },
  { id: 'o', letter: 'O', x: 0 },
  { id: 't', letter: 'T', x: 110 },
];

/** Oś ma trzy sekundy i zatrzaskuje się co ćwierć — tyle wystarczy, by schodki były widoczne. */
const SPAN = 3;
const SNAP = 0.25;

interface Order {
  title: string;
  brief: string;
  check: (times: (number | null)[]) => { ok: boolean; note: string };
}

const ORDERS: Order[] = [
  {
    title: 'Po kolei',
    brief: 'Niech litery pojawią się jedna po drugiej: najpierw K, potem O, na końcu T.',
    check: (times) => {
      if (!oneByOne(times))
        return {
          ok: false,
          note: 'Co najmniej dwie litery pojawiły się w tej samej chwili. Rozsuń ich znaczniki na osi.',
        };
      const [k, o, t] = times as number[];
      if (!(k < o && o < t))
        return { ok: false, note: 'Pojawiają się po kolei, ale w złej kolejności — miało być K, O, T.' };
      return { ok: true, note: 'Na osi widać schodki: każda litera ma swoją chwilę, jedna po drugiej.' };
    },
  },
  {
    title: 'Wszystkie naraz',
    brief: 'A teraz niech wszystkie trzy pojawią się w tej samej chwili.',
    check: (times) =>
      together(times)
        ? {
            ok: true,
            note: 'Trzy znaczki w jednej pionowej kresce — to właśnie znaczy „jednocześnie”.',
          }
        : {
            ok: false,
            note: 'Litery wciąż pojawiają się w różnych chwilach. Ustaw wszystkie trzy znaczniki dokładnie jeden nad drugim.',
          },
  },
  {
    title: 'Po kolei, od końca',
    brief: 'Ostatnie zlecenie: znowu po kolei, ale zaczyna T, a K pojawia się jako ostatnie.',
    check: (times) => {
      if (!oneByOne(times))
        return { ok: false, note: 'Znowu któreś dwie litery trafiły w tę samą chwilę.' };
      const [k, o, t] = times as number[];
      if (!(t < o && o < k))
        return { ok: false, note: 'Kolejność się nie zgadza — miało być T, potem O, na końcu K.' };
      return {
        ok: true,
        note: 'Kolejność pojawiania się nie ma nic wspólnego z tym, jak duszki leżą na scenie — decyduje wyłącznie czekanie.',
      };
    },
  },
];

interface TimeDeskProps {
  color: string;
  onComplete?: () => void;
}

export function TimeDesk({ color, onComplete }: TimeDeskProps) {
  const [waits, setWaits] = useState<number[]>([0.5, 0.5, 0.5]);
  const [at, setAt] = useState(0);

  const actors = useMemo<ActorDef[]>(
    () =>
      LETTERS.map((item, index) => ({
        id: item.id,
        name: `Litera ${item.letter}`,
        home: { ...HOME, x: item.x, y: 0, visible: true } as Sprite,
        scripts: [[make('flaga'), make('ukryj'), make('czekaj', waits[index]), make('pokaz')]],
      })),
    [waits]
  );

  const stage = useStage(actors);
  const anchorRef = useSectionScrollAnchor(at);

  const done = at >= ORDERS.length;
  const order = ORDERS[Math.min(at, ORDERS.length - 1)];
  const verdict = !done && stage.finished && stage.last ? judge(stage.last, actors, order) : null;

  const next = () => {
    const following = at + 1;
    setAt(following);
    /* Po ostatnim zleceniu oś zostaje taka, jaką dziecko właśnie zrobiło — to jest wynik bloku. */
    if (following < ORDERS.length) stage.clear();
    else onComplete?.();
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!done && (
        <div className="mb-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Zlecenie {at + 1} z {ORDERS.length} · {order.title}
          </p>
          <p className="mt-1 text-sm leading-relaxed">{order.brief}</p>
        </div>
      )}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,300px)]">
        <div className="min-w-0">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Przeciągnij znaczniki — to są liczby w klockach „czekaj”
          </p>
          <div className="border bg-muted/20 p-3">
            {LETTERS.map((item, index) => (
              <WaitRow
                key={item.id}
                letter={item.letter}
                value={waits[index]}
                locked={stage.running}
                onChange={(value) =>
                  setWaits((current) => current.map((old, i) => (i === index ? value : old)))
                }
              />
            ))}
          </div>

          <div className="mt-3">
            <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Skrypt każdej litery — ten sam, różni się tylko liczbą
            </p>
            <div className="flex flex-wrap gap-4">
              {LETTERS.map((item, index) => (
                <div key={item.id} className="w-fit">
                  <div className="mb-1 flex items-center gap-1.5">
                    <LetterArt letter={item.letter} className="h-5 w-5 rounded-[4px] text-[11px] sm:h-5 sm:w-5 sm:text-[11px]" />
                  </div>
                  <BlockChip block={make('flaga')} />
                  <BlockChip block={make('ukryj')} />
                  <BlockChip block={make('czekaj', waits[index])} />
                  <BlockChip block={make('pokaz')} />
                </div>
              ))}
            </div>
          </div>
        </div>

        <div>
          <StageView
            actors={LETTERS.map((item) => ({
              id: item.id,
              kind: 'kot',
              letter: item.letter,
              sprite: stage.sprites[item.id] ?? { ...HOME, x: item.x, y: 0, visible: true },
            }))}
            running={stage.running}
            onStart={() => stage.fire({ kind: 'flaga' })}
            onStop={stage.stop}
          />
          <TimeTrack
            className="mt-3"
            rows={LETTERS.map((item) => ({ id: item.id, letter: item.letter, label: `Litera ${item.letter}` }))}
            run={stage.last}
            now={stage.now}
          />
        </div>
      </div>

      {!done && (
        <div className="mt-4 border-t pt-3">
          {verdict ? (
            <div
              className={cn(
                'p-3',
                !verdict.ok && 'border-l-2 border-amber-500 bg-amber-50 dark:bg-amber-950/30'
              )}
              style={verdict.ok ? { backgroundColor: `${color}14` } : undefined}
            >
              <p
                className="flex items-center gap-2 text-sm font-semibold"
                style={verdict.ok ? { color } : undefined}
              >
                {verdict.ok && <Check className="h-4 w-4 shrink-0" aria-hidden />}
                {verdict.ok ? 'Zlecenie wykonane.' : 'Jeszcze nie.'}
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">{verdict.note}</p>
              {verdict.ok && (
                <button
                  type="button"
                  onClick={next}
                  className="mt-2.5 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
                  style={{ borderColor: color, color }}
                >
                  {at + 1 < ORDERS.length ? 'Następne zlecenie' : 'Kończę blok'}
                </button>
              )}
            </div>
          ) : (
            <p className="text-xs leading-relaxed text-muted-foreground">
              Ustaw znaczniki i naciśnij <strong className="text-foreground">zieloną flagę</strong>{' '}
              nad sceną. Sprawdzam nie to, co ustawiłeś/ustawiłaś, tylko{' '}
              <strong className="text-foreground">kiedy litery naprawdę się pojawiły</strong>.
            </p>
          )}
        </div>
      )}

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Trzy zlecenia, trzy układy na osi.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Zapamiętaj wzorzec, bo wróci w zadaniu: <strong>ukryj na samym początku</strong>,
            odczekaj tyle, ile ma czekać ta litera, i dopiero wtedy{' '}
            <strong>pokaż</strong>. Różne czekania dają schodki, równe — jedną kreskę.
          </p>
        </div>
      )}
    </div>
  );
}

function judge(run: StageRun, actors: ActorDef[], order: Order) {
  const times = actors.map((actor) => shownAt(run, actor.id, actor.home));
  if (times.some((time) => time == null))
    return { ok: false, note: 'Któraś litera w ogóle się nie pokazała — naciśnij flagę jeszcze raz.' };
  return order.check(times);
}

/* ------------------------------------------------------------------ */

/** Jeden wiersz osi z przeciąganym znacznikiem czekania. */
function WaitRow({
  letter,
  value,
  locked,
  onChange,
}: {
  letter: string;
  value: number;
  locked?: boolean;
  onChange: (value: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const aim = (event: { clientX: number }) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
    onChange(Math.round((ratio * SPAN) / SNAP) * SNAP);
  };

  const down = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (locked) return;
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    aim(event);
  };

  return (
    <div className="mb-2 flex items-center gap-2 last:mb-0">
      <LetterArt letter={letter} className="h-6 w-6 shrink-0 rounded-[5px] text-xs sm:h-6 sm:w-6 sm:text-xs" />
      <div
        ref={track}
        role="slider"
        tabIndex={0}
        aria-label={`Czekanie litery ${letter} w sekundach`}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={SPAN}
        onPointerDown={down}
        onPointerMove={(event) => dragging.current && aim(event)}
        onPointerUp={() => (dragging.current = false)}
        onPointerCancel={() => (dragging.current = false)}
        onKeyDown={(event) => {
          if (event.key === 'ArrowLeft') onChange(Math.max(0, value - SNAP));
          else if (event.key === 'ArrowRight') onChange(Math.min(SPAN, value + SNAP));
          else return;
          event.preventDefault();
        }}
        className={cn(
          'relative h-8 flex-1 touch-none border-b border-dashed',
          locked ? 'opacity-50' : 'cursor-grab active:cursor-grabbing'
        )}
      >
        <span className="absolute inset-x-0 top-1/2 h-px bg-border" aria-hidden />
        {Array.from({ length: SPAN + 1 }).map((_tick, i) => (
          <span
            key={i}
            className="absolute top-1/2 h-2 w-px -translate-y-1/2 bg-zinc-300"
            style={{ left: `${(i / SPAN) * 100}%` }}
            aria-hidden
          />
        ))}
        <span
          className="absolute top-1/2 flex h-6 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#ffab19] text-[11px] font-bold tabular-nums text-white shadow-sm"
          style={{ left: `${(value / SPAN) * 100}%` }}
        >
          {value.toFixed(2).replace(/0$/, '')} s
        </span>
      </div>
    </div>
  );
}
