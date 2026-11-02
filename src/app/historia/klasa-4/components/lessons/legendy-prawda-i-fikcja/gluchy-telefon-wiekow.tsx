'use client';

import { Fragment, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { GENERATIONS, STONES, judgeDiff, newChunks, type DiffVerdict } from './gluchy-telefon';

const REVEAL_MS = 380;

/** Podświetla w tekście „kamienie” — rdzenie słów obecne w każdej wersji. */
function withStones(text: string, color: string) {
  const re = new RegExp(`(\\S*(?:${STONES.map((s) => s.stem).join('|')})\\S*)`, 'gi');
  const parts = text.split(re);
  return parts.map((p, i) =>
    i % 2 === 1 ? (
      <span key={i} className="border-b-2 font-semibold" style={{ borderColor: color }}>
        {p}
      </span>
    ) : (
      <Fragment key={i}>{p}</Fragment>
    )
  );
}

/**
 * Blok 3 — **„Głuchy telefon wieków”** (symulator).
 *
 * Gest nowy w kursie: **zatrzymuje opowieść w kolejnych pokoleniach
 * i stuka, co dodano**. Opowieść przechodzi sama (kawałki nowej wersji
 * wjeżdżają po kolei nad poprzednią); dziecko stuka kawałki, których nie było
 * wcześniej, i sprawdza (`judgeDiff` — porównanie tekstów). Dopiero potem
 * podaje opowieść dalej. Na końcu pierwsza i ostatnia wersja obok siebie
 * z kamieniami, które przetrwały.
 */
export function GluchyTelefonWiekow({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [g, setG] = useState(0);
  const [revealed, setRevealed] = useState(GENERATIONS[0].chunks.length);
  const [tapped, setTapped] = useState<number[]>([]);
  const [verdict, setVerdict] = useState<DiffVerdict | null>(null);
  const [finished, setFinished] = useState(false);
  const [done, setDone] = useState(false);

  const gen = GENERATIONS[g];
  const prev = g > 0 ? GENERATIONS[g - 1] : null;
  const fullyShown = revealed >= gen.chunks.length;
  const accepted = g === 0 || verdict?.ok === true;
  const last = g === GENERATIONS.length - 1;
  const freshCount = newChunks(g).length;

  useEffect(() => {
    if (fullyShown) return;
    const t = window.setTimeout(() => setRevealed((n) => n + 1), REVEAL_MS);
    return () => window.clearTimeout(t);
  }, [revealed, fullyShown]);

  const pass = () => {
    if (last) {
      setFinished(true);
      return;
    }
    setG(g + 1);
    setRevealed(0);
    setTapped([]);
    setVerdict(null);
  };

  const toggle = (i: number) => {
    if (accepted || !fullyShown) return;
    setVerdict(null);
    setTapped((t) => (t.includes(i) ? t.filter((x) => x !== i) : [...t, i]));
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        Zawidełki, wiosna 1412 roku <span className="text-muted-foreground">(zdarzenie wymyślone do ćwiczenia)</span>.
        Ktoś widział, co się stało, i opowiedział to synowi. Syn — swojej córce. I tak dalej, przez sześćset lat.
        Przy każdym opowiadaczu <strong>stuknij to, czego nie było w poprzedniej wersji</strong>.
      </p>

      {/* Łańcuch opowiadaczy */}
      <ol className="flex items-start gap-1 overflow-x-auto pb-1" aria-label="Opowiadacze">
        {GENERATIONS.map((p, i) => (
          <li key={p.who} className="flex shrink-0 items-start gap-1">
            <div className={cn('flex w-[62px] flex-col items-center text-center', i > g && 'opacity-35')}>
              <span
                className={cn('flex h-9 w-9 items-center justify-center rounded-full border-2', i === g && 'text-white')}
                style={{ borderColor: i <= g ? color : undefined, backgroundColor: i === g ? color : undefined }}
              >
                <User className="h-4 w-4" aria-hidden />
              </span>
              <span className="mt-1 text-[10px] leading-tight">{p.who}</span>
              <span className="font-mono text-[10px] tabular-nums text-muted-foreground">{p.when}</span>
            </div>
            {i < GENERATIONS.length - 1 && <ArrowRight className="mt-2.5 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />}
          </li>
        ))}
      </ol>

      {!finished && (
        <div className="space-y-3">
          {prev && (
            <div className="border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground">
              <p className="text-[11px] font-semibold uppercase tracking-wide">
                Poprzednia wersja — {prev.who.toLowerCase()}, {prev.when}:
              </p>
              <p className="font-serif">{prev.chunks.join(' ')}</p>
            </div>
          )}

          <div className="border bg-amber-50/60 p-4 dark:bg-zinc-900/60">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
              {gen.who} · {gen.when} {g > 0 && '— opowiada dalej'}
            </p>
            <p className="font-serif text-[17px] leading-loose">
              {gen.chunks.map((c, i) => {
                const on = tapped.includes(i);
                const wrong = verdict?.notNew.includes(i);
                const isNew = accepted && g > 0 && newChunks(g).includes(i);
                return (
                  <motion.span
                    key={`${g}-${i}`}
                    initial={g === 0 ? false : { opacity: 0, y: -6 }}
                    animate={i < revealed ? { opacity: 1, y: 0 } : { opacity: 0, y: -6 }}
                    className="inline"
                  >
                    {g === 0 ? (
                      <span>{c}</span>
                    ) : (
                      <button
                        type="button"
                        disabled={accepted || !fullyShown}
                        aria-pressed={on}
                        onClick={() => toggle(i)}
                        className={cn(
                          'rounded-sm px-0.5 text-left transition-colors disabled:cursor-default',
                          on && 'bg-sky-200/90 dark:bg-sky-700/60',
                          isNew && 'bg-sky-200/90 dark:bg-sky-700/60',
                          wrong && 'underline decoration-destructive decoration-wavy decoration-2 underline-offset-4'
                        )}
                      >
                        {c}
                      </button>
                    )}{' '}
                  </motion.span>
                );
              })}
            </p>
          </div>

          {g > 0 && fullyShown && !accepted && (
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={tapped.length === 0}
                onClick={() => setVerdict(judgeDiff(g, tapped))}
                className="px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
                style={{ backgroundColor: color }}
              >
                Sprawdź zmiany
              </button>
              <span className="text-sm text-muted-foreground">
                stuknięte: {tapped.length}
              </span>
            </div>
          )}

          {verdict && !verdict.ok && (
            <div className="space-y-1 border-l-2 border-destructive pl-3 text-sm leading-relaxed" aria-live="polite">
              {verdict.notNew.map((i) => (
                <p key={i}>
                  <strong>„{gen.chunks[i]}”</strong> — tak samo było u poprzedniego opowiadacza. Porównaj z szarym tekstem wyżej.
                </p>
              ))}
              {verdict.missed > 0 && (
                <p>
                  {verdict.missed === 1 ? 'Jedna zmiana' : `${verdict.missed} ${plural(verdict.missed, { one: 'zmiana', few: 'zmiany', many: 'zmian' })}`} jeszcze
                  się ukrywa. Czytaj kawałek po kawałku: czy dokładnie te słowa były wyżej?
                </p>
              )}
            </div>
          )}

          {accepted && fullyShown && (
            <div className="flex flex-wrap items-center gap-3">
              {g > 0 && (
                <p className="text-sm">
                  {freshCount} {plural(freshCount, { one: 'zmiana', few: 'zmiany', many: 'zmian' })} w jednym opowiadaniu.
                  {g === 2 && ' Zwróć uwagę: nikt nie skłamał celowo — każdy opowiedział trochę ciekawiej.'}
                  {g === 4 && ' Opowieść dostała zakończenie, które tłumaczy nazwę rzeki.'}
                </p>
              )}
              <button
                type="button"
                onClick={pass}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                {last ? 'Porównaj początek i koniec' : 'Podaj opowieść dalej'} <ArrowRight className="h-4 w-4" aria-hidden />
              </button>
            </div>
          )}
        </div>
      )}

      {finished && (
        <div className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            {[GENERATIONS[0], GENERATIONS[GENERATIONS.length - 1]].map((p) => (
              <div key={p.who} className="border bg-amber-50/60 p-3 dark:bg-zinc-900/60">
                <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {p.who} · {p.when}
                </p>
                <p className="mt-1 font-serif text-[15px] leading-relaxed">{withStones(p.chunks.join(' '), color)}</p>
              </div>
            ))}
          </div>
          <p className="text-sm leading-relaxed">
            Młynarz został rycerzem, ryczący strumień — smokiem, a ucieczka na wzgórze — walką na miecze. Ale coś przetrwało
            wszystkie sześć wersji: {STONES.map((s) => s.label).join(', ')}. To są <strong>kamienie wystające z rzeki</strong> —
            od nich historyk zaczyna, gdy chce sprawdzić legendę. Tak rośnie każda legenda: z prawdziwego zdarzenia, do którego
            każde pokolenie coś dokłada.
          </p>
          {!done && (
            <button
              type="button"
              onClick={() => {
                setDone(true);
                onComplete();
              }}
              className="px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              Rozumiem, jak rośnie legenda
            </button>
          )}
        </div>
      )}
    </div>
  );
}
