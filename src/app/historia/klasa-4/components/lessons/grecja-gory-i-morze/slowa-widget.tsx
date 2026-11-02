'use client';

import { useMemo, useRef, useState } from 'react';
import { Highlighter, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { GREEK, GREEK_TOTAL, PARTS, WORKSHOP_GOAL, compose, tokenize, type ComposeVerdict } from './slowa';

/**
 * Blok 4 — **Greckie słowa po polsku**. Najpierw zakreślacz: dziecko poluje na
 * słowa greckiego pochodzenia w opisie zwykłego dnia; każde znalezione rozkłada
 * się na greckie cząstki. Potem warsztat: dziecko skleja dwie cząstki w słowo —
 * sędzią jest to, czy takie słowo naprawdę istnieje po polsku.
 */
const LINES = tokenize();

export function SlowaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [found, setFound] = useState<string[]>([]);
  const [last, setLast] = useState<{ key?: string; note?: string; miss?: string } | null>(null);
  const [hintLine, setHintLine] = useState<number | null>(null);
  const [slots, setSlots] = useState<[string | null, string | null]>([null, null]);
  const [built, setBuilt] = useState<string[]>([]);
  const [verdict, setVerdict] = useState<ComposeVerdict | null>(null);
  const [picked, setPicked] = useState<string | null>(null);
  const reported = useRef(false);

  const huntDone = found.length === GREEK_TOTAL;
  const workshopDone = built.length >= WORKSHOP_GOAL;

  const tapWord = (t: (typeof LINES)[number][number]) => {
    if (huntDone || t.kind === 'sep') return;
    if (t.kind === 'gr') {
      setLast({ key: t.key });
      setHintLine(null);
      if (!found.includes(t.key)) setFound((prev) => [...prev, t.key]);
    } else if (t.kind === 'obce') setLast({ miss: t.note });
    else setLast({ miss: `„${t.text}” — zwykłe polskie słowo, słowiańskie.` });
  };

  const hint = () => {
    const li = LINES.findIndex((line) => line.some((t) => t.kind === 'gr' && !found.includes(t.key)));
    setHintLine(li);
  };

  const fill = (part: string, slot?: 0 | 1) => {
    if (workshopDone) return;
    const i = slot ?? (slots[0] === null ? 0 : 1);
    const next: [string | null, string | null] = [...slots] as [string | null, string | null];
    next[i] = part;
    setPicked(null);
    if (next[0] && next[1]) {
      const v = compose(next[0], next[1]);
      setVerdict(v);
      setSlots([null, null]);
      if (v.kind === 'slowo' && !v.known && !built.includes(v.word)) {
        const b = [...built, v.word];
        setBuilt(b);
        if (b.length >= WORKSHOP_GOAL && !reported.current) {
          reported.current = true;
          onDone();
        }
      }
    } else {
      setSlots(next);
      setVerdict(null);
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (target === 'slot-0') fill(id, 0);
      else if (target === 'slot-1') fill(id, 1);
    },
    onTap: (id) => (picked === id ? fill(id) : setPicked(id)),
    disabled: !huntDone || workshopDone,
  });

  const lastGreek = last?.key ? GREEK[last.key] : null;
  const foundSet = useMemo(() => new Set(found), [found]);

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Grecy mówią z nami do dziś — w słowach. <strong>Zakreślaczem stukaj słowa, które przyszły z greki.</strong>{' '}
        Jest ich {GREEK_TOTAL}. Znalezione: <strong>{found.length}</strong>.
      </p>

      <div className="border bg-[#fdfaf0] p-4 text-base leading-[2.1] dark:bg-zinc-900 sm:text-lg">
        <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Highlighter className="h-3.5 w-3.5" style={{ color }} aria-hidden /> Mój dzień
        </p>
        {LINES.map((line, li) => (
          <span key={li} className={cn(hintLine === li && 'bg-amber-100 dark:bg-amber-900/40')}>
            {line.map((t) =>
              t.kind === 'sep' ? (
                <span key={t.id}>{t.text}</span>
              ) : (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => tapWord(t)}
                  className={cn('rounded-sm px-0.5 hover:bg-yellow-100 dark:hover:bg-yellow-900/30', t.kind === 'gr' && foundSet.has(t.key) && 'bg-yellow-300 font-semibold dark:bg-yellow-600/60')}
                >
                  {t.text}
                </button>
              )
            )}{' '}
          </span>
        ))}
      </div>

      {lastGreek && (
        <div className="border-l-4 p-3 text-sm" style={{ borderColor: color }} role="status">
          <p className="mb-1.5 font-semibold">{lastGreek.lemma}</p>
          <div className="flex flex-wrap items-center gap-2">
            {lastGreek.parts.map((p, i) => (
              <span key={i} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden>+</span>}
                <span className="hist-split border bg-white px-2 py-1 dark:bg-zinc-900">
                  <span className="italic">{p.gr}</span> <span className="text-muted-foreground">= „{p.pl}”</span>
                </span>
              </span>
            ))}
          </div>
          {lastGreek.note && <p className="mt-1.5 text-muted-foreground">{lastGreek.note}</p>}
        </div>
      )}
      {last?.miss && <p className="text-sm text-muted-foreground" role="status">{last.miss}</p>}
      {!huntDone && found.length >= 4 && (
        <button type="button" onClick={hint} className="text-xs underline">
          podpowiedź: w którym zdaniu jeszcze coś jest?
        </button>
      )}
      <style>{`.hist-split{animation:histsplit .45s ease-out}@keyframes histsplit{from{transform:scale(.6);opacity:0}}@media (prefers-reduced-motion: reduce){.hist-split{animation:none}}`}</style>

      {huntDone && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Grecy składali słowa z cząstek jak z klocków — a my robimy tak do dziś. <strong>Sklej dwie cząstki w
            prawdziwe polskie słowo</strong>: przeciągnij je na dwa miejsca warsztatu albo stuknij dwa razy. Zbuduj{' '}
            {WORKSHOP_GOAL} słowa, których nie było w tekście.
          </p>
          <div className="flex flex-wrap gap-1.5">
            {PARTS.map((p) => (
              <button
                key={p.id}
                type="button"
                {...bind(p.id)}
                disabled={workshopDone}
                className="touch-none border-2 bg-white px-2 py-1 text-left text-sm dark:bg-zinc-900"
                style={{ borderColor: picked === p.id ? color : undefined }}
              >
                <span className="font-semibold">{p.id}</span>
                <span className="block text-[11px] leading-tight text-muted-foreground">{p.pl}</span>
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            {([0, 1] as const).map((i) => (
              <div key={i} className="flex items-center gap-2">
                {i === 1 && <span aria-hidden>+</span>}
                <button
                  type="button"
                  data-drop={`slot-${i}`}
                  onClick={() => (picked ? fill(picked, i) : slots[i] && setSlots((s) => (i === 0 ? [null, s[1]] : [s[0], null])))}
                  className={cn('flex h-11 min-w-24 items-center justify-center gap-1 border-2 border-dashed px-3 text-sm font-semibold', hover === `slot-${i}` && 'bg-muted')}
                  style={{ borderColor: hover === `slot-${i}` ? color : undefined }}
                >
                  {slots[i] ?? <span className="font-normal text-muted-foreground">{i === 0 ? 'pierwsza' : 'druga'}</span>}
                  {slots[i] && <X className="h-3 w-3 opacity-50" aria-hidden />}
                </button>
              </div>
            ))}
          </div>
          {verdict && (
            <p className={cn('text-sm', verdict.kind === 'slowo' ? '' : 'text-destructive')} role="status">
              {verdict.kind === 'slowo' ? (
                <>
                  <strong style={{ color }}>{verdict.word}</strong> — „{verdict.means}”.
                  {verdict.known && ' To słowo było już w tekście — zbuduj inne.'}
                </>
              ) : (
                verdict.why
              )}
            </p>
          )}
          <p className="text-sm">
            Twoje słowa: {built.length ? built.map((w) => <strong key={w} className="mr-2">{w}</strong>) : <span className="text-muted-foreground">jeszcze żadnego</span>} ({built.length} z {WORKSHOP_GOAL})
          </p>
          <DragGhost drag={drag}>
            <span className="border-2 bg-white px-2 py-1 text-sm font-semibold dark:bg-zinc-900">{drag?.id}</span>
          </DragGhost>
        </div>
      )}

      {workshopDone && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Grecy żyli dwa i pół tysiąca lat temu, a ich cząstki wciąż służą do budowania nowych słów — tak powstały
          „telefon” i „dinozaur”, choć żaden Grek ich nie znał. Tak rozchodzą się słowa: razem ze statkami, kupcami
          i szkołami — od zatoki do zatoki.
        </div>
      )}
    </div>
  );
}
