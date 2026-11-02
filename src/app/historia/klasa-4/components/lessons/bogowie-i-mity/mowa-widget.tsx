'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { judgePhrase, PHRASES, SENTENCES } from './mowa';

const BY_ID = Object.fromEntries(PHRASES.map((p) => [p.id, p]));

/**
 * Blok 3 — **Mitologia w naszej mowie**. Gest: dziecko przeciąga wyrażenie
 * z mitu (albo stuka je, a potem zdanie) w lukę zdania z dzisiejszego życia.
 * Sędzią jest znaczenie wyrażenia; po trafieniu odsłania się mit, z którego
 * wyrażenie pochodzi. Gotowe, gdy wszystkie sześć zdań jest pełnych.
 */
export function MowaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [filled, setFilled] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [error, setError] = useState<{ sentence: string; message: string } | null>(null);
  const [opened, setOpened] = useState<string | null>(null);
  const reported = useRef(false);

  const used = new Set(Object.values(filled));
  const tray = PHRASES.filter((p) => !used.has(p.id));
  const complete = SENTENCES.every((s) => filled[s.id]);

  useEffect(() => {
    if (complete && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [complete, onDone]);

  const place = (phraseId: string, target: string | null) => {
    if (!target?.startsWith('mowa-')) return;
    const sentenceId = target.slice(5);
    if (filled[sentenceId]) return;
    setSelected(null);
    const verdict = judgePhrase(phraseId, sentenceId);
    if (verdict.ok) {
      setFilled((f) => ({ ...f, [sentenceId]: phraseId }));
      setError(null);
      setOpened(sentenceId);
    } else {
      setError({ sentence: sentenceId, message: verdict.message });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: place,
    onTap: (id) => setSelected((prev) => (prev === id ? null : id)),
  });

  const chip = (id: string) => (
    <button
      key={id}
      type="button"
      {...bind(id)}
      aria-pressed={selected === id}
      className={cn(
        'touch-none select-none border-2 bg-white px-2.5 py-1.5 text-sm font-semibold italic dark:bg-zinc-900',
        drag?.id === id && 'opacity-40'
      )}
      style={{ borderColor: selected === id ? color : 'var(--border)', boxShadow: selected === id ? `0 0 0 2px ${color}` : undefined }}
    >
      {BY_ID[id].text}
    </button>
  );

  return (
    <div className="space-y-4">
      <div className="sticky top-16 z-10 border bg-muted/90 p-3 backdrop-blur">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Wyrażenia z mitów ({tray.length})
        </p>
        {tray.length ? (
          <div className="flex flex-wrap gap-1.5">{tray.map((p) => chip(p.id))}</div>
        ) : (
          <p className="text-sm text-muted-foreground">Wszystkie wyrażenia trafiły na swoje miejsce.</p>
        )}
      </div>

      <ol className="space-y-3">
        {SENTENCES.map((s, i) => {
          const phraseId = filled[s.id];
          const [before, after] = s.text.split('___');
          const isHover = hover === `mowa-${s.id}`;
          return (
            <li key={s.id} className="border bg-white p-3 dark:bg-zinc-900/70">
              <p className="text-sm leading-relaxed sm:text-base">
                <span className="mr-2 font-mono text-xs font-bold" style={{ color }}>
                  {String(i + 1).padStart(2, '0')}
                </span>
                {before}
                {phraseId ? (
                  <button
                    type="button"
                    onClick={() => setOpened((o) => (o === s.id ? null : s.id))}
                    className="mx-0.5 inline-flex items-center gap-1 border-b-2 font-semibold italic"
                    style={{ borderColor: color, color }}
                  >
                    {BY_ID[phraseId].text}
                    <BookOpen className="h-3.5 w-3.5" aria-label="pokaż mit" />
                  </button>
                ) : (
                  <span
                    data-drop={`mowa-${s.id}`}
                    role="button"
                    tabIndex={0}
                    onClick={() => selected && place(selected, `mowa-${s.id}`)}
                    onKeyDown={(e) => {
                      if ((e.key === 'Enter' || e.key === ' ') && selected) place(selected, `mowa-${s.id}`);
                    }}
                    className={cn(
                      'mx-0.5 inline-block min-w-[7.5rem] border-2 border-dashed px-2 text-center align-baseline text-muted-foreground',
                      (isHover || selected) && 'bg-muted'
                    )}
                    style={{ borderColor: isHover || selected ? color : undefined }}
                  >
                    {selected ? 'tu?' : '…'}
                  </span>
                )}
                {after}
              </p>
              {error?.sentence === s.id && !phraseId && (
                <p className="mt-2 border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive" aria-live="polite">
                  {error.message}
                </p>
              )}
              <AnimatePresence initial={false}>
                {phraseId && opened === s.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="mt-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
                      <strong>Skąd to wyrażenie?</strong> {BY_ID[phraseId].myth}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ol>

      {complete && (
        <p className="border-2 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <strong>Sześć mitów w jednym dniu z twojego życia.</strong> Mówisz mitami, nawet o tym nie wiedząc: te
          wyrażenia przetrwały ponad dwa i pół tysiąca lat, bo ludzie wciąż opowiadają sobie te same historie.
        </p>
      )}

      <DragGhost drag={drag}>{drag ? chip(drag.id) : null}</DragGhost>
    </div>
  );
}
