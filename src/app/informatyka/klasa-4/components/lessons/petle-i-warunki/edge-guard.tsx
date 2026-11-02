'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { StageView } from '../../scratch/stage-view';
import { useProgram } from '../../scratch/use-program';
import { HOME, atEdge, make, type Block, type Sprite } from '../../scratch/engine';
import { DragGhost, LooseBlock, Script, Slot } from '../../scratch/loop-stack';

/**
 * „Trzy miejsca dla jednego klocka” — blok, w którym warunek dostaje swoje
 * miejsce w czasie, a nie tylko w skrypcie.
 *
 * Dziecko ma jeden klocek („jeżeli na brzegu, odbij się”) i trzy miejsca, w
 * które da się go włożyć: nad pętlą, w pętli i pod pętlą. Każde z nich
 * **naprawdę uruchamia** program i każde kończy się czymś innym:
 *
 * - **nad pętlą** — warunek sprawdza się raz, w chwili, gdy duszek stoi na
 *   środku sceny. Nic się nie dzieje, a potem duszek dochodzi do krawędzi i tam
 *   zostaje. To jest najczęstszy błąd początkującego i dlatego jest tu pierwszy.
 * - **w pętli** — warunek jest sprawdzany na każdym obiegu, więc pyta o krawędź
 *   dokładnie wtedy, kiedy duszek jej dotyka.
 * - **pod pętlą** — nie wykona się nigdy. `zawsze` nie ma w Scratchu wypustki u
 *   dołu i to nie jest kaprys rysownika; klocek leży wtedy obok skryptu.
 *
 * **Blok kończy się dopiero po sprawdzeniu wszystkich trzech.** Nie dlatego, że
 * lubimy komplet, tylko dlatego, że cała treść tego bloku mieszka w różnicy
 * między nimi — a podsumowanie na końcu jest zbudowane z tego, co dziecko samo
 * zobaczyło, nie z gotowego akapitu.
 */

type Spot = 'nad' | 'w' | 'pod';

const SPOT_LABEL: Record<Spot, string> = {
  nad: 'nad pętlą',
  w: 'w pętli',
  pod: 'pod pętlą',
};

const START: Sprite = { ...HOME, x: -150, y: 0, direction: 90, rotationStyle: 'lewo-prawo' };

interface EdgeGuardProps {
  color: string;
  onComplete?: () => void;
}

export function EdgeGuard({ color, onComplete }: EdgeGuardProps) {
  const [spot, setSpot] = useState<Spot | null>(null);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [seen, setSeen] = useState<Partial<Record<Spot, string>>>({});
  const [done, setDone] = useState(false);
  const slots = useRef<Partial<Record<Spot, HTMLElement | null>>>({});
  const anchorRef = useSectionScrollAnchor(Object.keys(seen).length);

  const guard = useMemo(() => make('odbij'), []);
  const stack = useMemo<Block[]>(
    () => [
      make('flaga'),
      ...(spot === 'nad' ? [guard] : []),
      make('zawsze', undefined, [make('idz', 25), ...(spot === 'w' ? [guard] : [])]),
    ],
    [spot, guard]
  );

  const program = useProgram(stack, START);
  const { finished, last, running } = program;

  /* Wynik przebiegu opisujemy tym, co duszek naprawdę zrobił — nie tym, gdzie leży klocek. */
  useEffect(() => {
    if (!finished || !last || !spot || seen[spot]) return;
    const stuck = atEdge(last.frames[last.frames.length - 1]?.sprite ?? START);
    const note =
      spot === 'w'
        ? `Duszek odbił się ${last.bounces} razy i chodzi tam i z powrotem. Warunek jest sprawdzany na każdym obiegu pętli, więc pyta o krawędź dokładnie wtedy, kiedy duszek jej dotyka.`
        : spot === 'nad'
          ? `Warunek sprawdził się raz — zanim duszek w ogóle ruszył, stojąc na środku sceny. Nie było wtedy żadnej krawędzi, więc nic nie zrobił. ${stuck ? 'Potem duszek doszedł do brzegu i tam został.' : 'Dalej pętla przesuwa go bez żadnej kontroli.'}`
          : 'Klocek nawet nie drgnął — leży obok skryptu. Pod pętlą „zawsze” nic się nie wykona, bo ta pętla się nie kończy; dlatego w Scratchu nie ma ona u dołu wypustki, do której dałoby się cokolwiek doczepić.';
    setSeen((current) => ({ ...current, [spot]: note }));
  }, [finished, last, spot, seen]);

  const tried = Object.keys(seen).length;
  const ready = tried === 3 && spot === 'w';

  const drop = useCallback(
    (x: number, y: number) => {
      setDrag(null);
      for (const key of Object.keys(slots.current) as Spot[]) {
        const rect = slots.current[key]?.getBoundingClientRect();
        if (!rect) continue;
        const near = 14;
        if (x >= rect.left - near && x <= rect.right + near && y >= rect.top - near && y <= rect.bottom + near) {
          setSpot(key);
          program.clear();
          return;
        }
      }
    },
    [program]
  );

  useEffect(() => {
    if (!drag) return;
    const move = (event: PointerEvent) => setDrag({ x: event.clientX, y: event.clientY });
    const up = (event: PointerEvent) => drop(event.clientX, event.clientY);
    window.addEventListener('pointermove', move);
    window.addEventListener('pointerup', up);
    return () => {
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerup', up);
    };
  }, [drag, drop]);

  const place = (target: Spot) => {
    setSpot(target);
    program.clear();
  };

  const finish = () => {
    setDone(true);
    onComplete?.();
  };

  const slot = (id: Spot) => (node: HTMLElement | null) => {
    slots.current[id] = node;
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Ten duszek ma chodzić po scenie tam i z powrotem, a nie wtapiać się w krawędź. Masz jeden
        klocek i <strong>trzy miejsca</strong>, w które da się go włożyć. Sprawdź wszystkie trzy —
        każde uruchom zieloną flagą i popatrz, co robi duszek.
      </p>

      <div className="mt-4 space-y-4 lg:grid lg:gap-4 lg:space-y-0 lg:grid-cols-[minmax(0,1fr)_minmax(0,320px)]">
        <div className="contents lg:block">
          {/* Wyświetlacz zostaje na ekranie: na wąskim ekranie scena stoi nad skryptem i jest przyklejona. */}
          <div className="sticky top-9 z-10 -mx-4 bg-white px-4 pb-2 dark:bg-zinc-900 sm:-mx-5 sm:px-5 lg:static lg:mx-0 lg:bg-transparent lg:px-0 lg:pb-0 lg:dark:bg-transparent">
            <StageView
              actors={[{ id: 'duszek', kind: 'kot', sprite: program.sprite }]}
              running={running}
              onStart={program.start}
              onStop={program.stop}
              note={spot ? `klocek ${SPOT_LABEL[spot]}` : 'klocek leży obok'}
            />
          </div>
          <p className="mt-2 text-[11px] leading-snug text-muted-foreground">
            Pętla „zawsze” nie kończy się sama — zatrzymaj program czerwonym znakiem, kiedy zobaczysz
            już dość.
          </p>
        </div>

        <div className="lg:order-first">
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Skrypt duszka
          </p>
          <div className="mt-2 overflow-x-auto pb-1">
            <Script
              blocks={stack}
              renderMouth={(path, block) =>
                block.type === 'zawsze' && spot !== 'w' ? (
                  <div ref={slot('w')}>
                    <Slot color={color} label="w pętli" onClick={() => place('w')} />
                  </div>
                ) : null
              }
              renderAfter={(path, block) => {
                if (block.type === 'flaga')
                  return spot === 'nad' ? null : (
                    <div ref={slot('nad')}>
                      <Slot color={color} label="nad pętlą" onClick={() => place('nad')} />
                    </div>
                  );
                if (block.type !== 'zawsze') return null;
                return spot === 'pod' ? (
                  <div className="mt-3 border-l-2 border-dashed pl-2" style={{ borderColor: color }}>
                    <LooseBlock block={guard} onPointerDown={(event) => setDrag({ x: event.clientX, y: event.clientY })} />
                    <p className="mt-1 text-[10px] leading-tight text-muted-foreground">
                      leży obok skryptu — nic go nie uruchomi
                    </p>
                  </div>
                ) : (
                  <div className="mt-1" ref={slot('pod')}>
                    <Slot color={color} label="pod pętlą" onClick={() => place('pod')} />
                  </div>
                );
              }}
            />
          </div>

          {!spot && (
            <div className="mt-4 border-t pt-3">
              <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                Klocek do włożenia
              </p>
              <LooseBlock
                block={guard}
                grabbed={Boolean(drag)}
                onPointerDown={(event) => setDrag({ x: event.clientX, y: event.clientY })}
              />
              <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
                Przeciągnij go na jedno z przerywanych miejsc (albo po prostu w nie stuknij).
              </p>
            </div>
          )}

          <Trials color={color} seen={seen} spot={spot} started={program.attempts > 0} />

          {ready && !done && (
            <button
              type="button"
              onClick={finish}
              className="mt-3 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              Kończę blok
            </button>
          )}
          {tried === 3 && spot !== 'w' && !done && (
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Wszystkie trzy sprawdzone. Zostaw klocek w tym miejscu, w którym duszek naprawdę chodzi
              tam i z powrotem.
            </p>
          )}
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Warunek mieszka w pętli.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            <strong>Warunek sprawdzony raz to prawie zawsze warunek sprawdzony za wcześnie.</strong>{' '}
            Program pyta „czy jestem na brzegu?” tylko w tej chwili, w której stoi na tym klocku —
            a nie przez cały czas. Żeby pytał bez przerwy, trzeba go włożyć w pętlę, która bez
            przerwy się kręci.
          </p>
        </div>
      )}

      {drag && <DragGhost block={guard} x={drag.x} y={drag.y} />}
    </div>
  );
}

/** Kartoteka prób — trzy wiersze, każdy wypełniony tym, co dziecko naprawdę zobaczyło. */
function Trials({
  color,
  seen,
  spot,
  started,
}: {
  color: string;
  seen: Partial<Record<Spot, string>>;
  spot: Spot | null;
  started: boolean;
}) {
  const spots: Spot[] = ['nad', 'w', 'pod'];

  return (
    <div className="mt-4 border-t pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        Co się stało · {Object.keys(seen).length} z 3
      </p>
      <ul className="mt-2 space-y-2">
        {spots.map((id) => {
          const note = seen[id];
          const here = spot === id;
          return (
            <li key={id} className={cn('text-sm leading-relaxed', !note && 'text-muted-foreground')}>
              <strong className={cn(!note && 'font-medium')}>{SPOT_LABEL[id]}</strong>
              {' — '}
              {note ?? (here && !started ? 'uruchom zieloną flagą' : 'jeszcze nie sprawdzone')}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
