'use client';

import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Sprout, TreeDeciduous } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { derivedTiers, isSettled, judgeTree, treeSpan, type TreePerson, type TreePlacement } from './tree-judge';
import { DragGhost, useDragToken } from './use-drag-token';

/** Osoba na tacy: sędzia widzi tylko `TreePerson`, dziecko — także trop, z którego wyczytało relację. */
export interface TreeToken extends TreePerson {
  /** Co mówi trop (np. „syn Józefa i Haliny”) — z tego dziecko wnioskuje piętro. */
  trail: string;
  /** Skąd ten trop (np. „podpis na zdjęciu”); bogowie L24 mówią sami za siebie i go nie mają. */
  source?: string;
}

/**
 * Silnik `family-tree` — gest: **dziecko sadza osoby na piętrach drzewa**.
 *
 * Najstarsi schodzą do pnia, najmłodsi wędrują do korony (F-I.3-08). Każda
 * osoba ma trop (rok urodzenia + kto jest czyim dzieckiem albo małżonkiem);
 * piętro wynika z tych dwóch rzeczy. Żaden upuszczony żeton nie jest „zły”:
 * stoi tam, gdzie go postawiono, a gdy dwie osoby się kłócą, drzewo
 * **trzeszczy** — podświetla parę i nazywa ich lata. Gotowe, gdy wszyscy
 * stoją i nic nie trzeszczy.
 *
 * Przeciąganie albo „stuknij osobę, stuknij piętro”.
 */
export function FamilyTree({
  color,
  people,
  tierLabels,
  badge,
  trayLabel = 'Osoby do posadzenia',
  hint,
  completeNote,
  onComplete,
}: {
  color: string;
  people: TreeToken[];
  /** Podpisy pięter od pnia (0) do korony; opcjonalne. */
  tierLabels?: string[];
  /** Dokładka do żetonu na drzewie; `settled` = miejsce potwierdzone relacjami (L24: atrybut boga). */
  badge?: (person: TreeToken, settled: boolean) => ReactNode;
  trayLabel?: string;
  /** Podpowiedź pod drzewem, zanim wszystko stoi (domyślnie — o rodzicach i małżonkach). */
  hint?: ReactNode;
  /** Komunikat po ukończeniu zamiast domyślnego „od … do … minęło lat” (wymaga lat urodzenia). */
  completeNote?: ReactNode;
  onComplete: () => void;
}) {
  const tierCount = useMemo(() => Math.max(...Object.values(derivedTiers(people))) + 1, [people]);
  const [placement, setPlacement] = useState<TreePlacement>({});
  const [selected, setSelected] = useState<string | null>(null);
  const reported = useRef(false);

  const verdict = useMemo(() => judgeTree(people, placement), [people, placement]);
  const byId = useMemo(() => Object.fromEntries(people.map((p) => [p.id, p])), [people]);

  useEffect(() => {
    if (verdict.complete && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [verdict.complete, onComplete]);

  const place = (id: string, target: string | null) => {
    if (target === null) return;
    setSelected(null);
    setPlacement((prev) => {
      const next = { ...prev };
      if (target === 'taca') delete next[id];
      else next[id] = Number(target);
      return next;
    });
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: place,
    onTap: (id) => setSelected((prev) => (prev === id ? null : id)),
  });

  const tray = people.filter((p) => placement[p.id] === undefined);
  const tiers = Array.from({ length: tierCount }, (_, i) => tierCount - 1 - i); // od korony do pnia
  const dragging = drag !== null || selected !== null;
  const span = verdict.complete && !completeNote ? treeSpan(people) : null;

  const token = (p: TreeToken, compact: boolean) => {
    const bad = verdict.badIds.includes(p.id);
    const isSelected = selected === p.id;
    return (
      <motion.button
        key={p.id}
        type="button"
        {...bind(p.id)}
        animate={bad ? { x: [0, -3, 3, -2, 2, 0] } : { x: 0 }}
        transition={{ duration: 0.4 }}
        aria-pressed={isSelected}
        aria-label={`${p.name}${p.born !== undefined ? `, urodzony ${p.born}` : ''}. ${p.trail}`}
        className={cn(
          'touch-none select-none border-2 bg-white text-left text-xs leading-tight dark:bg-zinc-900',
          compact ? 'w-[5.6rem] px-1.5 py-1' : 'px-2 py-1',
          drag?.id === p.id && 'opacity-40'
        )}
        style={{
          borderColor: bad ? 'var(--destructive)' : isSelected ? color : 'var(--border)',
          boxShadow: isSelected ? `0 0 0 2px ${color}` : undefined,
        }}
      >
        <span className="block font-semibold">
          {p.name}{' '}
          {p.born !== undefined && <span className="font-normal text-muted-foreground">· ur. {p.born}</span>}
        </span>
        {compact && badge && placement[p.id] !== undefined && badge(p, isSettled(people, placement, verdict, p.id))}
        {!compact && (
          <>
            <span className="block text-[11px] leading-snug text-muted-foreground">{p.trail}</span>
            {p.source && (
              <span className="mt-0.5 hidden text-[10px] uppercase tracking-wide text-muted-foreground/80 sm:block">{p.source}</span>
            )}
          </>
        )}
      </motion.button>
    );
  };

  return (
    <div className="space-y-4">
      <div
        data-drop="taca"
        className={cn(
          'border-2 border-dashed p-3 transition-colors',
          hover === 'taca' || (selected && placement[selected] !== undefined) ? 'bg-muted/60' : 'bg-muted/20'
        )}
        style={{ borderColor: hover === 'taca' ? color : undefined }}
        onClick={(e) => {
          if (selected && placement[selected] !== undefined && e.target === e.currentTarget) place(selected, 'taca');
        }}
      >
        <p className="mb-2 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Sprout className="h-3.5 w-3.5" aria-hidden /> {trayLabel} ({tray.length})
        </p>
        {tray.length === 0 ? (
          <p className="text-sm text-muted-foreground">Wszyscy już stoją na drzewie.</p>
        ) : (
          <div className="grid grid-cols-2 gap-1.5 sm:gap-2 lg:grid-cols-3">{tray.map((p) => token(p, false))}</div>
        )}
        {selected && placement[selected] !== undefined && (
          <button
            type="button"
            onClick={() => place(selected, 'taca')}
            className="mt-2 border px-2 py-1 text-xs font-medium underline underline-offset-2"
          >
            Zdejmij z drzewa
          </button>
        )}
      </div>

      <div className="relative overflow-hidden border bg-[#f6f1e4] dark:bg-zinc-900/60">
        <svg className="pointer-events-none absolute inset-0 h-full w-full" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden>
          <ellipse cx="50" cy="22" rx="48" ry="26" fill="#9bbf8a" opacity="0.22" />
          <path d="M44 100 C46 70 47 48 47 30 L53 30 C53 48 54 70 56 100 Z" fill="#8a6b4a" opacity="0.22" />
        </svg>
        <div className="relative z-10 divide-y divide-black/5 dark:divide-white/10">
          {tiers.map((tier) => {
            const here = people.filter((p) => placement[p.id] === tier);
            const isTop = tier === tierCount - 1;
            const isBottom = tier === 0;
            return (
              <div
                key={tier}
                data-drop={String(tier)}
                className={cn('relative min-h-[4.75rem] px-3 py-2 transition-colors', hover === String(tier) && 'bg-white/60 dark:bg-white/10')}
                style={hover === String(tier) ? { outline: `2px dashed ${color}`, outlineOffset: -2 } : undefined}
                onClick={(e) => {
                  if (selected && e.target === e.currentTarget) place(selected, String(tier));
                }}
              >
                <p className="pointer-events-none mb-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  {tierLabels?.[tier] ?? (isTop ? 'korona' : isBottom ? 'pień' : 'konary')}
                </p>
                <div
                  className="flex min-h-[2.75rem] flex-wrap items-start justify-center gap-2"
                  onClick={(e) => {
                    if (selected && e.target === e.currentTarget) place(selected, String(tier));
                  }}
                >
                  {here.length === 0 && (
                    <span className="self-center text-xs text-muted-foreground/70">
                      {dragging ? 'Połóż tu' : 'puste piętro'}
                    </span>
                  )}
                  {here.map((p) => token(p, true))}
                </div>
                {selected && (
                  <button
                    type="button"
                    onClick={() => place(selected, String(tier))}
                    className="mt-1 text-xs font-medium underline underline-offset-2"
                    style={{ color }}
                  >
                    Połóż {byId[selected]?.name} tu
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div aria-live="polite" className="min-h-[3rem] text-sm leading-relaxed">
        {verdict.conflicts.length > 0 ? (
          <ul className="space-y-1.5">
            {verdict.conflicts.slice(0, 2).map((c) => (
              <li key={c.ids.join('-') + c.kind} className="border border-destructive/50 bg-destructive/5 px-3 py-2 text-destructive">
                <strong>Drzewo trzeszczy.</strong> {c.message}
              </li>
            ))}
          </ul>
        ) : verdict.complete && completeNote ? (
          <div className="flex items-start gap-3 border-2 p-3" style={{ borderColor: color }}>
            <TreeDeciduous className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <div>{completeNote}</div>
          </div>
        ) : span ? (
          <div className="flex items-start gap-3 border-2 p-3" style={{ borderColor: color }}>
            <TreeDeciduous className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <p>
              <strong>Drzewo stoi.</strong> Od {span.oldest.name} (ur. {span.oldest.born}) do {span.youngest.name} (ur.{' '}
              {span.youngest.born}) minęło {span.years} {plural(span.years, { one: 'rok', few: 'lata', many: 'lat' })} i{' '}
              {span.generations} {plural(span.generations, { one: 'pokolenie', few: 'pokolenia', many: 'pokoleń' })}.{' '}
              <strong>Pokolenie to osoby w podobnym wieku</strong> — każde piętro to jedno.
            </p>
          </div>
        ) : (
          <p className="text-muted-foreground">
            {hint ?? (
              <>
                Przeciągnij osobę na piętro (albo stuknij ją, a potem piętro). Rodzic stoi niżej, jego dziecko — piętro
                wyżej; małżonkowie razem.
              </>
            )}{' '}
            Postawiono {verdict.placed} z {verdict.total}.
          </p>
        )}
      </div>

      <DragGhost drag={drag}>{drag && byId[drag.id] ? token(byId[drag.id], true) : null}</DragGhost>
    </div>
  );
}
