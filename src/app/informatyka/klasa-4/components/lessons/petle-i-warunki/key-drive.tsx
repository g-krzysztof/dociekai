'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Check, Keyboard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { StageView } from '../../scratch/stage-view';
import { HOME, applyBlock, make, type Block, type Sprite } from '../../scratch/engine';
import { Script } from '../../scratch/loop-stack';

/**
 * „Weź ster” — sterowanie duszkiem **naprawdę wciskanymi klawiszami**, w dwóch
 * wersjach, między którymi jest cała różnica między demem a grą.
 *
 * - **kapeluszem** `kiedy klawisz … naciśnięty` — skrypt rusza na naciśnięcie, a
 *   przy trzymaniu klawisza system dokłada powtórzenia dopiero po pół sekundy.
 *   Stąd zacięcie, które każde dziecko zna z pisania: *a … aaaaaaa*.
 * - **pętlą** `zawsze [jeżeli klawisz … naciśnięty to …]` — program pyta o
 *   klawisz trzydzieści razy na sekundę, więc rusza w tej samej chwili, w której
 *   palec dotknie klawisza.
 *
 * **Werdykt jest pomiarem, nie opinią.** Obie wersje mierzą czas zbierania tych
 * samych trzech gwiazdek i podsumowanie składa się z dwóch liczb, które dziecko
 * samo wypracowało palcami. Nie piszemy „pętla jest lepsza” — piszemy, ile
 * sekund różnicy wyszło u ciebie.
 *
 * Silnik jest tu **własny i chodzi na żywo**: `run()` liczy przebieg z góry, a
 * przebieg liczony z góry nie ma palców. Zegar tyka co 40 ms (tyle samo, co
 * obieg pętli w Scratchu), a pojedynczy klocek wykonuje wspólne `applyBlock`,
 * żeby duszek ruszał się dokładnie tak samo jak w pozostałych blokach modułu.
 */

const TICK = 40;
/** Ile system czeka, zanim zacznie powtarzać trzymany klawisz. Stąd bierze się zacięcie. */
const REPEAT_DELAY = 550;

type Mode = 'kapelusz' | 'petla';
type Side = 'prawo' | 'lewo';

const STARS = [
  { id: 'a', x: -200, y: 0 },
  { id: 'b', x: 40, y: 0 },
  { id: 'c', x: 170, y: 0 },
];

const START: Sprite = { ...HOME, x: -110, y: 0, direction: 90, rotationStyle: 'lewo-prawo' };

const MODE_LABEL: Record<Mode, string> = {
  kapelusz: 'kapeluszem „kiedy klawisz naciśnięty”',
  petla: 'pętlą „zawsze + jeżeli”',
};

/** Ruch w jedną stronę: nos we właściwą stronę i krok. Ten sam w obu wersjach. */
function stepBlocks(side: Side): Block[] {
  return [make('kierunek', side === 'prawo' ? 90 : -90), make('idz', 10)];
}

interface KeyDriveProps {
  color: string;
  onComplete?: () => void;
}

export function KeyDrive({ color, onComplete }: KeyDriveProps) {
  const [mode, setMode] = useState<Mode>('kapelusz');
  const [sprite, setSprite] = useState<Sprite>(START);
  const [taken, setTaken] = useState<string[]>([]);
  const [times, setTimes] = useState<Partial<Record<Mode, number>>>({});
  const [live, setLive] = useState(false);
  const [done, setDone] = useState(false);

  const held = useRef<Partial<Record<Side, number>>>({});
  const started = useRef<number | null>(null);
  const anchorRef = useSectionScrollAnchor(Object.keys(times).length);

  const scripts = useMemo<Record<Mode, Block[][]>>(
    () => ({
      kapelusz: [
        [make('klawisz', 'strzałka w prawo'), ...stepBlocks('prawo')],
        [make('klawisz', 'strzałka w lewo'), ...stepBlocks('lewo')],
      ],
      petla: [
        [
          make('flaga'),
          make('zawsze', undefined, [
            make('jezeli', 'klawisz w prawo naciśnięty?', stepBlocks('prawo')),
            make('jezeli', 'klawisz w lewo naciśnięty?', stepBlocks('lewo')),
          ]),
        ],
      ],
    }),
    []
  );

  const reset = useCallback(() => {
    held.current = {};
    started.current = null;
    setSprite(START);
    setTaken([]);
    setLive(false);
  }, []);

  const step = useCallback(
    (side: Side) => {
      setSprite((current) => {
        const next = { ...current };
        for (const block of stepBlocks(side)) applyBlock(block, next);
        return next;
      });
      if (started.current === null) {
        started.current = performance.now();
        setLive(true);
      }
    },
    []
  );

  /* Zegar na żywo. W wersji z kapeluszem powtórzenia wchodzą dopiero po zwłoce systemu. */
  useEffect(() => {
    const timer = window.setInterval(() => {
      const now = performance.now();
      (Object.keys(held.current) as Side[]).forEach((side) => {
        const since = held.current[side];
        if (since === undefined) return;
        if (mode === 'petla' || now - since >= REPEAT_DELAY) step(side);
      });
    }, TICK);
    return () => window.clearInterval(timer);
  }, [mode, step]);

  /* Zebranie gwiazdki liczymy z położenia duszka, nie z liczby naciśnięć. */
  useEffect(() => {
    const hit = STARS.find((star) => !taken.includes(star.id) && Math.abs(sprite.x - star.x) < 24);
    if (!hit) return;
    const next = [...taken, hit.id];
    setTaken(next);
    if (next.length === STARS.length && started.current !== null) {
      const seconds = Math.round(((performance.now() - started.current) / 1000) * 10) / 10;
      setTimes((current) => ({ ...current, [mode]: Math.min(current[mode] ?? Infinity, seconds) }));
      setLive(false);
      started.current = null;
    }
  }, [sprite, taken, mode]);

  const press = (side: Side) => {
    if (held.current[side] !== undefined) return;
    held.current[side] = performance.now();
    step(side);
  };

  const release = (side: Side) => {
    delete held.current[side];
  };

  useEffect(() => {
    const up = () => {
      held.current = {};
    };
    window.addEventListener('pointerup', up);
    window.addEventListener('blur', up);
    return () => {
      window.removeEventListener('pointerup', up);
      window.removeEventListener('blur', up);
    };
  }, []);

  const both = times.kapelusz !== undefined && times.petla !== undefined;

  const finish = () => {
    setDone(true);
    onComplete?.();
  };

  const switchMode = (next: Mode) => {
    setMode(next);
    reset();
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed">
        Zbierz trzy gwiazdki, sterując duszkiem strzałkami. Zrób to{' '}
        <strong>dwa razy: raz każdą wersją skryptu</strong> — a potem porównaj, ile ci to zajęło.
        Skrypty robią dokładnie to samo, różnią się tylko tym, <strong>kiedy pytają o klawisz</strong>.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {(['kapelusz', 'petla'] as Mode[]).map((id) => (
          <button
            key={id}
            type="button"
            onClick={() => switchMode(id)}
            className={cn(
              'cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors',
              mode === id ? 'text-white' : 'hover:bg-muted/50'
            )}
            style={mode === id ? { backgroundColor: color, borderColor: color } : { borderColor: color, color }}
          >
            {MODE_LABEL[id]}
            {times[id] !== undefined && <span className="ml-2 font-mono text-xs tabular-nums">{times[id]} s</span>}
          </button>
        ))}
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)]">
        <div>
          <div
            tabIndex={0}
            role="group"
            aria-label="Sterowanie duszkiem — kliknij i użyj strzałek"
            onKeyDown={(event) => {
              if (event.key !== 'ArrowRight' && event.key !== 'ArrowLeft') return;
              event.preventDefault();
              press(event.key === 'ArrowRight' ? 'prawo' : 'lewo');
            }}
            onKeyUp={(event) => {
              if (event.key === 'ArrowRight') release('prawo');
              if (event.key === 'ArrowLeft') release('lewo');
            }}
            className="focus-visible:outline-2"
            style={{ outlineColor: color }}
          >
            <StageView
              actors={[{ id: 'duszek', kind: 'kot', sprite }]}
              targets={STARS.filter((star) => !taken.includes(star.id)).map((star) => ({ x: star.x, y: star.y }))}
              running={live}
              note={`gwiazdki: ${taken.length} z ${STARS.length}`}
            />
          </div>

          <div className="mt-2 flex items-center gap-2">
            {(['lewo', 'prawo'] as Side[]).map((side) => (
              <button
                key={side}
                type="button"
                onPointerDown={() => press(side)}
                onPointerUp={() => release(side)}
                onPointerLeave={() => release(side)}
                className="flex-1 cursor-pointer select-none border py-2 text-lg font-bold transition-colors hover:bg-muted/50"
                style={{ borderColor: color, color }}
                aria-label={side === 'lewo' ? 'w lewo' : 'w prawo'}
              >
                {side === 'lewo' ? '◀' : '▶'}
              </button>
            ))}
            <button
              type="button"
              onClick={reset}
              className="cursor-pointer border px-3 py-2 text-sm transition-colors hover:bg-muted/50"
            >
              od nowa
            </button>
          </div>
          <p className="mt-2 flex items-start gap-1.5 text-[11px] leading-snug text-muted-foreground">
            <Keyboard className="mt-0.5 h-3.5 w-3.5 shrink-0" aria-hidden />
            Kliknij scenę i steruj strzałkami — albo trzymaj palec na przyciskach pod nią.
          </p>
        </div>

        <div>
          <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
            Skrypt w tej wersji
          </p>
          <div className="mt-2 space-y-4 overflow-x-auto pb-1">
            {scripts[mode].map((stack, index) => (
              <Script key={index} blocks={stack} />
            ))}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            {mode === 'kapelusz' ? (
              <>
                <strong className="text-foreground">Dwa skrypty, dwa kapelusze.</strong> Każdy rusza
                na swoje naciśnięcie. Gdy trzymasz klawisz, system dokłada powtórzenia — ale dopiero
                po pół sekundy. Tak samo zacina się litera przy pisaniu.
              </>
            ) : (
              <>
                <strong className="text-foreground">Jeden skrypt, jedna pętla.</strong> Program pyta
                o oba klawisze na każdym obiegu, czyli jakieś 30 razy na sekundę. Nic nie czeka, bo
                nikt nie czeka na naciśnięcie — sprawdzamy, czy klawisz <em>jest</em> wciśnięty.
              </>
            )}
          </p>

          <Scoreboard color={color} times={times} />

          {both && !done && (
            <button
              type="button"
              onClick={finish}
              className="mt-3 cursor-pointer border px-3 py-1.5 text-sm font-medium transition-colors hover:bg-muted/50"
              style={{ borderColor: color, color }}
            >
              Kończę blok
            </button>
          )}
        </div>
      </div>

      {done && (
        <div className="mt-4 p-3" style={{ backgroundColor: `${color}14` }}>
          <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Ster w twoich rękach.
          </p>
          <p className="mt-1.5 text-sm leading-relaxed">
            Obie wersje działają i obie są poprawne — ale w grach sterowanie robi się{' '}
            <strong>pętlą z warunkiem</strong>, bo pytanie „czy klawisz jest teraz wciśnięty?” pada
            wtedy bez przerwy, a nie raz na naciśnięcie. To ten sam wniosek, co blok wyżej: warunek
            ma sens, kiedy siedzi w czymś, co się kręci.
          </p>
        </div>
      )}
    </div>
  );
}

function Scoreboard({ color, times }: { color: string; times: Partial<Record<Mode, number>> }) {
  const a = times.kapelusz;
  const b = times.petla;

  return (
    <div className="mt-4 border-t pt-3">
      <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
        Twój czas
      </p>
      <ul className="mt-2 space-y-1 text-sm">
        {(['kapelusz', 'petla'] as Mode[]).map((id) => (
          <li key={id} className={cn('leading-relaxed', times[id] === undefined && 'text-muted-foreground')}>
            {MODE_LABEL[id]} —{' '}
            {times[id] !== undefined ? (
              <strong className="font-mono tabular-nums">{times[id]} s</strong>
            ) : (
              'jeszcze nie zebrane'
            )}
          </li>
        ))}
      </ul>
      {a !== undefined && b !== undefined && (
        <p className="mt-2 text-sm leading-relaxed">
          {b < a ? (
            <>
              Pętlą było szybciej o <strong>{Math.round((a - b) * 10) / 10} s</strong> — i nie
              dlatego, że duszek chodzi szybciej. Chodzi tyle samo; to ty nie musiałeś/musiałaś
              czekać na powtórzenie klawisza.
            </>
          ) : (
            <>
              U ciebie wyszło podobnie albo szybciej kapeluszem — zdarza się, jeśli stukasz klawisz
              zamiast go trzymać. Spróbuj obu wersji jeszcze raz, <strong>trzymając</strong> strzałkę
              bez puszczania: właśnie tam widać różnicę.
            </>
          )}
        </p>
      )}
    </div>
  );
}
