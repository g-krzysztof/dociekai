'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Highlighter, ScrollText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ACTS, DAYS, YEARS, cellKey, judgeKalendarze, type CellError, type CellKey } from './swieta';

const RED = '#DC143C';

/**
 * L11 blok 3 — źródło: ustawy o świętach z lat 1919–1990. Dziecko czyta
 * półkę ustaw i **maluje czerwonym flamastrem kartki trzech kalendarzy**
 * (1938, 1960, 1995) — stuknięciem albo pociągnięciem palca po kilku
 * kartkach. Sędzia wyprowadza prawdę z ustaw i każdy błąd nazywa ustawą.
 */
export function KtoUstala({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [red, setRed] = useState<Set<CellKey>>(() => new Set());
  const [errors, setErrors] = useState<CellError[] | null>(null);
  const [solved, setSolved] = useState(false);
  const paint = useRef<boolean | null>(null);
  const reported = useRef(false);

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [solved, onComplete]);

  const apply = (key: CellKey, value: boolean) => {
    setRed((prev) => {
      if (prev.has(key) === value) return prev;
      const next = new Set(prev);
      if (value) next.add(key);
      else next.delete(key);
      return next;
    });
    setErrors(null);
  };

  const onDown = (key: CellKey, e: ReactPointerEvent) => {
    if (solved) return;
    e.preventDefault();
    paint.current = !red.has(key);
    apply(key, paint.current);
  };

  const onMove = (e: ReactPointerEvent) => {
    if (paint.current === null) return;
    const el = document.elementFromPoint(e.clientX, e.clientY)?.closest<HTMLElement>('[data-cell]');
    if (el?.dataset.cell) apply(el.dataset.cell as CellKey, paint.current);
  };

  const onUp = () => {
    paint.current = null;
  };

  const check = () => {
    const errs = judgeKalendarze(red);
    setErrors(errs);
    if (errs.length === 0) setSolved(true);
  };

  const errKeys = new Set(errors?.map((e) => e.key));

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Czy te trzy dni zawsze były czerwone? Nie. O tym, który dzień jest świętem państwowym,
        decyduje <strong>ustawa</strong> — prawo uchwalone przez władze. Na półce leży sześć ustaw.
        Przeczytaj je, a potem pomaluj na czerwono kartki, które w danym roku były świętem.
      </p>

      {/* Półka ustaw */}
      <ol className="space-y-2">
        {ACTS.map((a) => (
          <li key={a.year} className="flex gap-3 border bg-white p-2.5 dark:bg-zinc-900/80">
            <ScrollText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
            <div>
              <p className="text-xs font-semibold">
                Ustawa z {a.date} r.{' '}
                <span className="font-normal text-muted-foreground">{a.quote ? '· cytat, pisownia oryginału' : '· w skrócie'}</span>
              </p>
              <p className={cn(a.quote && 'font-serif italic')}>{a.quote ? `„${a.text}”` : a.text}</p>
            </div>
          </li>
        ))}
      </ol>

      {/* Trzy kalendarze */}
      <div>
        <p className="mb-2 flex items-center gap-1.5 text-xs text-muted-foreground">
          <Highlighter className="h-3.5 w-3.5" style={{ color: RED }} aria-hidden />
          Stuknij kartkę albo przeciągnij palcem po kilku — flamaster maluje, drugi raz zmazuje.
        </p>
        <div className="grid grid-cols-3 gap-2 sm:gap-4" onPointerMove={onMove} onPointerUp={onUp} onPointerLeave={onUp} onPointerCancel={onUp}>
          {YEARS.map((year) => (
            <div key={year} className="border bg-white p-2 dark:bg-zinc-900/80">
              <p className="mb-2 text-center font-mono text-sm font-bold">{year}</p>
              <div className="space-y-1.5">
                {DAYS.map((d) => {
                  const key = cellKey(year, d.id);
                  const on = red.has(key);
                  return (
                    <button
                      key={d.id}
                      type="button"
                      data-cell={key}
                      onPointerDown={(e) => onDown(key, e)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          if (!solved) apply(key, !on);
                        }
                      }}
                      aria-pressed={on}
                      className={cn(
                        'block w-full touch-none border py-1.5 text-center text-xs font-semibold transition-colors sm:text-sm',
                        solved ? 'cursor-default' : 'cursor-pointer',
                        errKeys.has(key) && 'ring-2 ring-destructive'
                      )}
                      style={on ? { background: RED, borderColor: RED, color: 'white' } : undefined}
                    >
                      {d.label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {!solved && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={check}
            className="cursor-pointer border px-4 py-2 font-semibold"
            style={{ borderColor: color, color }}
          >
            Sprawdź kalendarze
          </button>
          {errors && errors.length > 0 && (
            <ul className="space-y-1 text-destructive" aria-live="polite">
              {errors.map((e) => (
                <li key={e.key}>{e.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {solved && (
        <div className="space-y-2 p-3" style={{ backgroundColor: `${color}14` }} aria-live="polite">
          <p className="flex items-center gap-2 font-semibold" style={{ color }}>
            <Check className="h-4 w-4" aria-hidden /> Kalendarze zgadzają się z ustawami.
          </p>
          <p>
            Przez ponad czterdzieści lat 11 listopada był zwykłym dniem pracy i nauki, a w 1960 roku
            czerwona była kartka 22 lipca. Władze, które rządziły wtedy Polską, chciały, żeby ludzie
            świętowali co innego. A jednak wielu pamiętało: 11 listopada przychodzili pod pomniki i
            groby żołnierzy, choć mogło to sprowadzić kłopoty.
          </p>
          <p>
            <strong>Ustawa może zmienić kolor kartki w kalendarzu. Pamięć zostaje we wspólnocie</strong> —
            i to ona sprawiła, że w 1989 roku święto wróciło.
          </p>
        </div>
      )}
    </div>
  );
}
