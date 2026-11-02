'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Flag } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { DAY_NAMES, DAYS, EVENTS, judgeRoot, punishable, RULE_BOUNDARY, SENTENCE, WORDS } from './lacina';

/**
 * Blok 3 — **Łacina wokół nas i prawo**. Dwa gesty:
 *  1. przykleja łaciński korzeń do polskiego słowa w zdaniu (przeciąga albo
 *     stuk-stuk) — sędzią jest brzmienie; po trafieniu słowo zdradza, co znaczyło;
 *  2. **wbija flagę nowego regulaminu w pasek tygodnia** (przeciąga w bok) —
 *     to, co było przed flagą, blednie: prawo nie działa wstecz.
 */
export function LacinaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [glued, setGlued] = useState<string[]>([]);
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<{ word: string; message: string } | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const [flag, setFlag] = useState<number | null>(null);
  const [flagMsg, setFlagMsg] = useState<string | null>(null);
  const [lawDone, setLawDone] = useState(false);
  const stripRef = useRef<HTMLDivElement>(null);
  const flagDrag = useRef(false);
  const reported = useRef(false);
  const latinDone = glued.length === WORDS.length;

  useEffect(() => {
    if (lawDone && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [lawDone, onDone]);

  const glue = (rootId: string, target: string | null) => {
    if (!target?.startsWith('slowo-')) return;
    const wordId = target.slice(6);
    if (glued.includes(wordId)) return;
    setSelected(null);
    const v = judgeRoot(rootId, wordId);
    if (v.ok) {
      setGlued((g) => [...g, wordId]);
      setOpened(wordId);
      setError(null);
    } else setError({ word: wordId, message: v.message });
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: glue,
    onTap: (id) => setSelected((s) => (s === id ? null : id)),
  });

  const boundaryAt = (clientX: number) => {
    const el = stripRef.current;
    if (!el) return null;
    const r = el.getBoundingClientRect();
    return Math.max(0, Math.min(DAYS.length, Math.round(((clientX - r.left) / r.width) * DAYS.length)));
  };

  const dropFlag = (b: number) => {
    setFlag(b);
    if (b === RULE_BOUNDARY) {
      setFlagMsg(null);
      setLawDone(true);
    } else setFlagMsg(`Flaga stoi ${b === 0 ? 'przed poniedziałkiem' : `po dniu: ${DAY_NAMES[b - 1]}`}. A regulamin uchwalono w środę rano — przesuń ją.`);
  };

  const tile = (id: string) => {
    const w = WORDS.find((x) => x.id === id)!;
    return (
      <button
        key={id}
        type="button"
        {...bind(id)}
        aria-pressed={selected === id}
        className={cn('touch-none select-none border-2 bg-white px-2.5 py-1 font-serif text-sm font-semibold italic dark:bg-zinc-900', drag?.id === id && 'opacity-40')}
        style={{ borderColor: selected === id ? color : 'var(--border)' }}
      >
        {w.latin}
      </button>
    );
  };

  const parts = SENTENCE.split(/(\{[a-z]+\})/);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <p className="text-sm leading-relaxed">
          Rzymianie mówili po łacinie. Z łaciny wyrosły włoski, hiszpański, francuski i rumuński — a mnóstwo słów
          przeszło też do polskiego. <strong>Przyklej łaciński korzeń do słowa w zdaniu</strong> (przeciągnij albo stuknij
          korzeń, potem słowo).
        </p>
        <div className="flex flex-wrap gap-1.5">{WORDS.filter((w) => !glued.includes(w.id)).map((w) => tile(w.id))}</div>
        <p className="border bg-white p-3 text-base leading-loose dark:bg-zinc-900/70">
          {parts.map((part, i) => {
            const m = part.match(/^\{([a-z]+)\}$/);
            if (!m) return <span key={i}>{part}</span>;
            const w = WORDS.find((x) => x.id === m[1])!;
            const done = glued.includes(w.id);
            const isHover = hover === `slowo-${w.id}`;
            return (
              <span
                key={i}
                data-drop={done ? undefined : `slowo-${w.id}`}
                role="button"
                tabIndex={0}
                onClick={() => (done ? setOpened(w.id) : selected && glue(selected, `slowo-${w.id}`))}
                className={cn('relative mx-0.5 inline-block border-b-2 px-0.5 font-semibold', isHover && 'bg-muted')}
                style={{ borderColor: done ? color : isHover || selected ? color : 'var(--border)' }}
              >
                {w.pl}
                {done && <span className="ml-1 font-serif text-xs italic" style={{ color }}>← {w.latin}</span>}
              </span>
            );
          })}
        </p>
        <div aria-live="polite" className="min-h-[1.5rem] text-sm">
          {error && <p className="text-destructive">{error.message}</p>}
          {opened && (
            <p>
              <span className="font-serif italic">{WORDS.find((w) => w.id === opened)!.latin}</span> znaczyło:{' '}
              {WORDS.find((w) => w.id === opened)!.meaning}.
            </p>
          )}
        </div>
      </div>

      {latinDone && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Rzymianie zostawili też prawo — spisane już w V w. p.n.e. na dwunastu tablicach na Forum. Jedna z jego zasad
            brzmi: <strong>prawo nie działa wstecz</strong>. Sprawdź ją w klasie. W tym tygodniu na lekcjach grali na
            telefonie: Ola w poniedziałek, Kuba we wtorek i w piątek, Zosia w czwartek. <strong>Regulamin „kto gra na
            lekcji, oddaje telefon do końca dnia” klasa uchwaliła w środę rano.</strong> Wbij flagę regulaminu w tydzień.
          </p>
          <div className="relative pt-9">
            <div
              ref={stripRef}
              className="grid select-none grid-cols-5 border"
              onPointerMove={(e) => {
                if (!flagDrag.current) return;
                const b = boundaryAt(e.clientX);
                if (b !== null) setFlag(b);
              }}
              onPointerUp={(e) => {
                if (!flagDrag.current) return;
                flagDrag.current = false;
                const b = boundaryAt(e.clientX);
                if (b !== null) dropFlag(b);
              }}
            >
              {DAYS.map((d, i) => {
                const evs = EVENTS.filter((e) => e.day === i);
                const after = flag !== null && i >= flag;
                return (
                  <div
                    key={d}
                    role="button"
                    tabIndex={0}
                    aria-label={`Wbij flagę rano w dniu: ${DAY_NAMES[i]}`}
                    onClick={() => !lawDone && dropFlag(i)}
                    className="min-h-[5.5rem] border-r p-1.5 text-xs last:border-r-0"
                  >
                    <p className="font-semibold uppercase text-muted-foreground">{d}</p>
                    {evs.map((e) => (
                      <p
                        key={e.who + e.day}
                        className={cn('mt-1 border px-1 py-0.5', flag === null ? '' : after ? 'border-destructive bg-destructive/10 font-semibold text-destructive' : 'opacity-50 line-through')}
                      >
                        {e.who} 📱
                      </p>
                    ))}
                  </div>
                );
              })}
            </div>
            {/* Flaga na granicy dni. */}
            <button
              type="button"
              aria-label="Flaga regulaminu — przeciągnij na granicę dni"
              disabled={lawDone}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                flagDrag.current = true;
              }}
              onPointerMove={(e) => {
                if (!flagDrag.current) return;
                const b = boundaryAt(e.clientX);
                if (b !== null) setFlag(b);
              }}
              onPointerUp={(e) => {
                if (!flagDrag.current) return;
                flagDrag.current = false;
                const b = boundaryAt(e.clientX);
                if (b !== null) dropFlag(b);
              }}
              className="absolute top-0 flex -translate-x-1/2 touch-none cursor-grab flex-col items-center"
              style={{ left: `${((flag ?? 0) / DAYS.length) * 100}%`, color }}
            >
              <Flag className="h-7 w-7" fill="currentColor" aria-hidden />
              <span className="absolute top-7 h-[6rem] w-0.5" style={{ background: color }} />
            </button>
          </div>
          <div aria-live="polite" className="text-sm leading-relaxed">
            {flagMsg && <p className="text-destructive">{flagMsg}</p>}
            {lawDone && (
              <p className="border-2 p-3" style={{ borderColor: color }}>
                Ukarać można tylko tych, którzy grali od środy:{' '}
                {punishable(RULE_BOUNDARY).map((e) => `${e.acc} (${DAY_NAMES[e.day]})`).join(' i ')}. Ola w poniedziałek i Kuba we
                wtorek grali, zanim zasada istniała — <strong>prawo nie działa wstecz</strong>, po łacinie{' '}
                <em>lex retro non agit</em>. Rzymianie wymyślili też drugą zasadę, której używamy do dziś:{' '}
                <em>pacta sunt servanda</em> — umów trzeba dotrzymywać. Polskie prawo, jak prawo większości Europy, wyrosło
                z prawa rzymskiego.
              </p>
            )}
          </div>
        </motion.div>
      )}

      <DragGhost drag={drag}>{drag ? tile(drag.id) : null}</DragGhost>
    </div>
  );
}
