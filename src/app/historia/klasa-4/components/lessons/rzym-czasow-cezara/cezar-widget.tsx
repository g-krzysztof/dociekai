'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { judgeTrust, SOURCES, VERDICT_TEXT, type SourceId, type Trust, type Verdict } from './cezar';

/**
 * Blok 3 — **Cezar: bohater czy tyran?** Gest: trzy źródła z paszportem
 * (kto, kiedy, po co); dziecko ustawia suwak „jak bardzo ufam” przy każdym,
 * a dopiero potem ogłasza ocenę. Sędzia strukturalny (`judgeTrust`): czy
 * wzięło pod uwagę, kto pisze. `onDone` po ogłoszeniu oceny.
 */
export function CezarWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [trust, setTrust] = useState<Trust>({ cezar: 50, cyceron: 50, swetoniusz: 50 });
  const [touched, setTouched] = useState<SourceId[]>([]);
  const [check, setCheck] = useState<ReturnType<typeof judgeTrust> | null>(null);
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const reported = useRef(false);
  const trustOk = check?.ok === true;

  useEffect(() => {
    if (verdict && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [verdict, onDone]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        {SOURCES.map((s) => (
          <div key={s.id} className="flex flex-col border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900/70">
            <p className="font-semibold">
              {s.author}, {s.title}
            </p>
            <dl className="mt-1 space-y-0.5 text-xs text-muted-foreground">
              <div>
                <dt className="inline font-semibold">Kto: </dt>
                <dd className="inline">{s.who}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Kiedy: </dt>
                <dd className="inline">{s.when}</dd>
              </div>
              <div>
                <dt className="inline font-semibold">Po co: </dt>
                <dd className="inline">{s.why}</dd>
              </div>
            </dl>
            <p className="mt-2 flex-1 italic">„{s.says}”</p>
            <label className="mt-3 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Jak bardzo ufam: <span style={{ color }}>{trust[s.id]}%</span>
              <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={trust[s.id]}
                disabled={trustOk}
                onChange={(e) => {
                  setTrust((t) => ({ ...t, [s.id]: Number(e.target.value) }));
                  setTouched((tt) => (tt.includes(s.id) ? tt : [...tt, s.id]));
                  setCheck(null);
                }}
                className="mt-1 block w-full cursor-ew-resize"
                style={{ accentColor: color }}
              />
            </label>
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">Streszczenia źródeł — własnymi słowami.</p>

      {!trustOk && (
        <button
          type="button"
          disabled={touched.length < 3}
          onClick={() => setCheck(judgeTrust(trust))}
          className="border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-50"
          style={{ borderColor: color, color }}
        >
          {touched.length < 3 ? `Ustaw wszystkie trzy suwaki (${touched.length}/3)` : 'Sprawdź moje zaufanie'}
        </button>
      )}

      <div aria-live="polite" className="text-sm leading-relaxed">
        {check && !check.ok && <p className="border border-destructive/50 bg-destructive/5 p-3 text-destructive">{check.message}</p>}
        {trustOk && (
          <div className="space-y-2">
            <p>
              <strong>Dobrze — patrzysz, kto pisze i po co.</strong> Teraz twoja ocena: kim był Cezar?
            </p>
            <div className="flex flex-wrap gap-2">
              {(
                [
                  ['bohater', 'Bohaterem'],
                  ['tyran', 'Tyranem'],
                  ['jedno-i-drugie', 'Jednym i drugim'],
                ] as const
              ).map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setVerdict(id)}
                  className={cn('border-2 bg-white px-3 py-1.5 text-sm dark:bg-zinc-900', verdict === id && 'font-semibold')}
                  style={{ borderColor: verdict === id ? color : 'var(--border)' }}
                >
                  {label}
                </button>
              ))}
            </div>
            {verdict && (
              <p className="border-2 p-3" style={{ borderColor: color }}>
                {VERDICT_TEXT[verdict]} Każda z tych odpowiedzi jest do obrony — jeśli wiesz, na którym źródle ją opierasz.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
