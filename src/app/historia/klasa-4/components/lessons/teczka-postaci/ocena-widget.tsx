'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { allSentences, getFigure } from './postacie';
import { judgeVerdict, type Check } from './teczka';
import { ratingWord, useTeczka } from './teczka-state';
import { RatingSlider } from './wybor-widget';
import { KIND_LOOK } from './biurko-widget';

const MAX_EVIDENCE = 3;

/**
 * Blok 3 — **Moja ocena** (zadanie). Gesty: dwa suwaki oceny (swoim ludziom /
 * innym), przypinanie zdań z teczki jako dowodów (do trzech) i jednego jako
 * kontrargumentu, wybór miary (tamte czasy / nasze). Werdykt strukturalny
 * z `judgeVerdict` — nigdy „dobra/zła ocena”; każdy punkt nazywa, czego
 * brakuje. Na koniec pierwsze wrażenie z bloku 1 obok oceny. `onDone`, gdy
 * wszystkie punkty są spełnione.
 */
export function OcenaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work, update } = useTeczka();
  const fig = work.figure ? getFigure(work.figure) : undefined;
  const [checks, setChecks] = useState<Check[] | null>(null);
  const [mode, setMode] = useState<'dowod' | 'kontra'>('dowod');
  const reported = useRef(false);

  if (!fig) return <p className="text-sm text-muted-foreground">Najpierw wybierz teczkę w bloku 1.</p>;

  const all = allSentences(fig);
  const passed = checks?.every((c) => c.ok) ?? false;

  const toggle = (id: string) => {
    setChecks(null);
    if (mode === 'kontra') {
      update({ counter: work.counter === id ? null : id, evidence: work.evidence.filter((x) => x !== id) });
      return;
    }
    if (work.evidence.includes(id)) update({ evidence: work.evidence.filter((x) => x !== id) });
    else if (work.evidence.length < MAX_EVIDENCE) update({ evidence: [...work.evidence, id], counter: work.counter === id ? null : work.counter });
  };

  const check = () => {
    const c = judgeVerdict(fig, work);
    setChecks(c);
    if (c.every((x) => x.ok) && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  const avg = (work.rating.own + work.rating.others) / 2;
  const moved = work.first !== null ? avg - work.first : 0;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Teraz Ty jesteś historykiem. <strong>Oceń {fig.acc}</strong> — osobno dla dwóch grup ludzi — i uzasadnij ocenę zdaniami
        z teczki. Nie ma tu jednej dobrej odpowiedzi: sprawdzimy tylko, czy Twoja ocena stoi na mocnych nogach.
      </p>

      <div className="grid gap-2 sm:grid-cols-2">
        <RatingSlider color={color} label={`Dla ${fig.own}`} value={work.rating.own} she={fig.she} onChange={(v) => {
            setChecks(null);
            update({ rating: { ...work.rating, own: v } });
          }} />
        <RatingSlider
          color={color}
          label={`Dla ${fig.others}`}
          value={work.rating.others}
          she={fig.she}
          onChange={(v) => {
            setChecks(null);
            update({ rating: { ...work.rating, others: v } });
          }}
        />
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-sm">Stukaj zdania jako:</span>
          {(['dowod', 'kontra'] as const).map((m) => (
            <button
              key={m}
              type="button"
              aria-pressed={mode === m}
              onClick={() => setMode(m)}
              className={cn('border-2 px-2.5 py-1 text-sm', mode === m && 'font-semibold')}
              style={mode === m ? { borderColor: color, color } : undefined}
            >
              {m === 'dowod' ? `dowód (${work.evidence.length}/${MAX_EVIDENCE})` : `kontrargument (${work.counter ? 1 : 0}/1)`}
            </button>
          ))}
        </div>
        <p className="text-xs text-muted-foreground">Kontrargument to zdanie, które mówi przeciw Twojej ocenie — to, co ktoś mógłby Ci odpowiedzieć.</p>
        <ul className="divide-y border bg-white dark:bg-zinc-900">
          {all.map(({ card, sentence }) => {
            const isEv = work.evidence.includes(sentence.id);
            const isCo = work.counter === sentence.id;
            const k = work.kinds[sentence.id] ?? sentence.kind;
            return (
              <li key={sentence.id}>
                <button
                  type="button"
                  aria-pressed={isEv || isCo}
                  onClick={() => toggle(sentence.id)}
                  className="flex w-full items-start gap-2 px-2.5 py-2 text-left text-sm hover:bg-muted/40"
                  style={isEv || isCo ? { background: isEv ? `${color}1a` : 'rgba(127,127,127,0.12)' } : undefined}
                >
                  <span className="mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: KIND_LOOK[k].dot }} aria-label={KIND_LOOK[k].label} />
                  <span className="min-w-0 flex-1">
                    {sentence.text}
                    <span className="block text-xs text-muted-foreground">
                      {card.author}, {card.when}
                    </span>
                  </span>
                  {(isEv || isCo) && (
                    <span className="shrink-0 border px-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ borderColor: isEv ? color : undefined, color: isEv ? color : undefined }}>
                      {isEv ? 'dowód' : 'kontra'}
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <fieldset className="border bg-white p-3 dark:bg-zinc-900">
        <legend className="px-1 text-sm font-semibold">Oceniasz miarą…</legend>
        <div className="flex flex-wrap gap-2">
          {(
            [
              ['tamte', `tamtych czasów — jak ${fig.she ? 'ją' : 'go'} oceniali ludzie wtedy`],
              ['nasze', 'naszych czasów — jak oceniamy dziś'],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              aria-pressed={work.measure === id}
              onClick={() => {
                setChecks(null);
                update({ measure: id });
              }}
              className={cn('border-2 px-2.5 py-1.5 text-left text-sm', work.measure === id && 'font-semibold')}
              style={work.measure === id ? { borderColor: color } : undefined}
            >
              {label}
            </button>
          ))}
        </div>
        {work.measure && (
          <p className="mt-2 text-xs leading-relaxed text-muted-foreground">
            {work.measure === 'tamte'
              ? 'Pamiętaj: wtedy wiele rzeczy uchodziło za zwyczajne — niewolnictwo, wojny o łupy, władza jednej rodziny.'
              : 'Pamiętaj: ludzie tamtych czasów nie znali naszych praw i obyczajów — nie mogli się według nich zachowywać.'}
          </p>
        )}
      </fieldset>

      {!passed && (
        <button type="button" onClick={check} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
          Sprawdź, czy ocena ma mocne nogi
        </button>
      )}

      {checks && (
        <ul className="space-y-1.5">
          {checks.map((c) => (
            <li key={c.id} className="flex gap-2 text-sm">
              <span className={cn('font-bold', c.ok ? 'text-green-700 dark:text-green-400' : 'text-destructive')} aria-hidden>
                {c.ok ? '✓' : '✗'}
              </span>
              <span>
                {c.label}
                {!c.ok && <span className="block text-xs text-destructive">{c.hint}</span>}
              </span>
            </li>
          ))}
        </ul>
      )}

      {passed && work.first !== null && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Na początku, po jednej karcie, Twoje wrażenie brzmiało: „{ratingWord(work.first, fig.she)}”. Teraz, po sześciu świadkach:
          dla {fig.own} — „{ratingWord(work.rating.own, fig.she)}”, dla {fig.others} — „{ratingWord(work.rating.others, fig.she)}”.{' '}
          {Math.abs(moved) >= 1
            ? 'Twoja ocena się przesunęła — tak działa historyk: jeden świadek to za mało.'
            : 'Twoja ocena prawie się nie zmieniła — ale teraz stoi na dowodach, a nie na jednym wierszu czy napisie.'}
        </p>
      )}
    </div>
  );
}
