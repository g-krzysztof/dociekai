'use client';

import { useMemo, useState } from 'react';
import { Check, Hammer, Lightbulb, Play, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { Script } from '../../scratch/loop-stack';
import { StageView } from '../../scratch/stage-view';
import { HOME, make, run } from '../../scratch/engine';

/**
 * Blok 2 — **testowanie na wybranych danych** `[2.2]`, pokazane przez odwrócenie
 * ról: zadaniem dziecka nie jest sprawić, żeby program działał, tylko
 * **znaleźć dane, przy których przestaje**.
 *
 * Program jest poprawny dla liczby, którą wpisał jego autor, i to jest cała
 * rzecz: „u mnie działa” nie jest wynikiem testu, tylko opisem jednej próby.
 * Scena ma skończoną szerokość, więc przy dużej liczbie kroków kot zatrzymuje
 * się na krawędzi — i mimo to melduje, że jest na miejscu. Usterka nie siedzi
 * więc w żadnym klocku; siedzi w **danych, których nikt nie sprawdził**.
 *
 * Tabela rośnie z prób dziecka i zostaje na ekranie do końca bloku — to ten sam
 * przedmiot, który wraca w zadaniu praktycznym, tyle że tam wypełnia go już
 * program dziecka.
 */

interface Trial {
  steps: number;
  /** Gdzie kot miał stanąć, gdyby obietnica była prawdziwa. */
  expected: number;
  actual: number;
  ok: boolean;
  /** Próba autora, wpisana z góry — od niej zaczyna się „u mnie działa”. */
  author?: boolean;
}

const START_X = HOME.x;
const AUTHOR_STEPS = 100;

/** Ile złamań kończy blok. Jedno mogłoby być przypadkiem. */
const NEEDED = 2;

function trial(steps: number): Trial {
  const stack = [make('flaga'), make('wroc'), make('idz', steps), make('powiedz', 'jestem na miejscu')];
  const result = run(stack, HOME);
  const actual = Math.round(result.frames[result.frames.length - 1]?.sprite.x ?? START_X);
  const expected = START_X + steps;
  return { steps, expected, actual, ok: Math.abs(expected - actual) <= 1 };
}

interface BreakItProps {
  color: string;
  onComplete?: () => void;
}

export function BreakIt({ color, onComplete }: BreakItProps) {
  const [steps, setSteps] = useState(140);
  const [trials, setTrials] = useState<Trial[]>(() => [{ ...trial(AUTHOR_STEPS), author: true }]);
  const [last, setLast] = useState<Trial | null>(null);
  const [done, setDone] = useState(false);

  const broken = trials.filter((item) => !item.ok).length;
  const anchorRef = useSectionScrollAnchor(broken >= NEEDED);

  const stack = useMemo(
    () => [make('flaga'), make('wroc'), make('idz', steps), make('powiedz', 'jestem na miejscu')],
    [steps]
  );

  const test = () => {
    const result = trial(steps);
    const at = trials.findIndex((item) => item.steps === result.steps);
    /*
     * Ta sama liczba wpisana drugi raz podmienia swój wiersz, zamiast dokładać
     * kolejny — inaczej dwa uruchomienia jednej danej liczyłyby się jak dwa
     * złamania i blok kończyłby się przed czasem.
     */
    const next = at === -1 ? [...trials, result] : trials.map((item, i) => (i === at ? result : item));
    setLast(result);
    setTrials(next);
    if (!done && next.filter((item) => !item.ok).length >= NEEDED) {
      setDone(true);
      onComplete?.();
    }
  };

  /* Podpowiedź dopiero wtedy, gdy dziecko naprawdę szukało — nie po pierwszej próbie. */
  const hint = !done && trials.length >= 4 && broken === 0;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Autor tego programu mówi: <strong>„u mnie działa”</strong>. Jego obietnica brzmi: kot
          przechodzi <strong>dokładnie tyle kroków, ile wpiszesz</strong>, i melduje, że jest na
          miejscu. Sprawdził to na stu krokach i uznał, że skończył.
        </p>
        <p className="mt-2 flex items-start gap-1.5 text-sm leading-relaxed">
          <Hammer className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            <strong>Twoje zadanie jest odwrotne niż zwykle: złam ten program.</strong> Znajdź{' '}
            {NEEDED} różne liczby, przy których obietnica przestaje być prawdziwa.
          </span>
        </p>
      </div>

      <div className="space-y-4 lg:grid lg:gap-5 lg:space-y-0 lg:grid-cols-[minmax(0,340px)_minmax(0,1fr)]">
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite: { ...HOME, x: last?.actual ?? START_X, say: last ? 'jestem na miejscu' : null } }]}
            targets={
              last
                ? [
                    {
                      /* Cel bywa poza sceną i wtedy właśnie o to chodzi — celownik zostaje na brzegu, a podpis mówi prawdę. */
                      x: Math.max(-195, Math.min(195, last.expected)),
                      y: 0,
                      label: Math.abs(last.expected) > 205 ? 'miał stanąć poza sceną' : 'tu miał stanąć',
                    },
                  ]
                : undefined
            }
            grid
            note={last ? `po teście: ${last.steps} kroków` : 'scena'}
          />

          <div className="mx-auto mt-3 max-w-[340px] space-y-2">
            <label className="flex items-center gap-2 text-sm">
              <span className="shrink-0">Kroki:</span>
              <input
                type="number"
                value={steps}
                min={-200}
                max={500}
                step={5}
                onChange={(event) => setSteps(Math.round(Number(event.target.value) || 0))}
                className="w-24 border px-2 py-1 font-mono text-sm tabular-nums"
              />
            </label>
            <input
              type="range"
              value={steps}
              min={-200}
              max={500}
              step={5}
              onChange={(event) => setSteps(Number(event.target.value))}
              className="w-full cursor-pointer accent-current"
              style={{ color }}
              aria-label="Ile kroków ma zrobić kot"
            />
            <button
              type="button"
              onClick={test}
              className="flex w-full cursor-pointer items-center justify-center gap-1.5 border py-2 text-sm font-semibold text-white transition-opacity hover:opacity-90"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Play className="h-4 w-4" aria-hidden /> Uruchom test
            </button>
          </div>

          <div className="mx-auto mt-3 max-w-[340px] overflow-x-auto pb-1">
            <Script blocks={stack} />
          </div>
        </div>

        <div className="space-y-3">
          <div>
            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
              Tabela testów
            </p>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[320px] border-collapse text-sm">
                <thead>
                  <tr className="border-b text-left text-[11px] uppercase tracking-wide text-muted-foreground">
                    <th className="py-1 pr-2 font-semibold">kroki</th>
                    <th className="py-1 pr-2 font-semibold">miał stanąć</th>
                    <th className="py-1 pr-2 font-semibold">stanął</th>
                    <th className="py-1 font-semibold">zgadza się?</th>
                  </tr>
                </thead>
                <tbody>
                  {trials.map((item) => (
                    <tr
                      key={item.steps}
                      className={cn(
                        'border-b last:border-0',
                        !item.ok && 'bg-amber-50 dark:bg-amber-950/30'
                      )}
                    >
                      <td className="py-1.5 pr-2 font-mono tabular-nums">
                        {item.steps}
                        {item.author && (
                          <span className="ml-1 text-[10px] uppercase text-muted-foreground">autor</span>
                        )}
                      </td>
                      <td className="py-1.5 pr-2 font-mono tabular-nums text-muted-foreground">
                        x: {item.expected}
                      </td>
                      <td className="py-1.5 pr-2 font-mono tabular-nums">x: {item.actual}</td>
                      <td className="py-1.5">
                        {item.ok ? (
                          <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400">
                            <Check className="h-3.5 w-3.5 shrink-0" aria-hidden /> tak
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 font-semibold text-amber-700 dark:text-amber-400">
                            <X className="h-3.5 w-3.5 shrink-0" aria-hidden /> nie
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-1.5 text-xs text-muted-foreground">
              Złamane obietnice: <strong className="text-foreground">{broken}</strong> z {NEEDED}.
            </p>
          </div>

          {hint && (
            <div className="flex items-start gap-2 bg-muted/50 p-3 text-sm leading-relaxed">
              <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Nie szukaj w środku — tam wszystko działa. Programy pękają na{' '}
                <strong>brzegach</strong>: przy największych liczbach, jakie da się wpisać, przy
                najmniejszych i przy zerze.
              </span>
            </div>
          )}

          {done && (
            <div className="p-3" style={{ backgroundColor: `${color}14` }}>
              <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
                <Check className="h-4 w-4 shrink-0" aria-hidden /> Złamane.
              </p>
              <p className="mt-1.5 text-sm leading-relaxed">
                Scena ma skończoną szerokość i kot nie umie z niej wyjść — przy dużej liczbie
                kroków staje na krawędzi, a mimo to melduje, że jest na miejscu. To samo dzieje się
                po lewej stronie. <strong>Żaden klocek nie jest tu zepsuty</strong>: usterka siedzi
                w danych, których nikt nie sprawdził.
              </p>
              <p className="mt-2 text-sm leading-relaxed">
                Stąd zasada, która zostaje na zawsze: <strong>dane do testu bierze się z brzegów, nie
                ze środka</strong> — zero, największa możliwa, mniejsza od zera. Autor sprawdził sto
                i przestał.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
