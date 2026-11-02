'use client';

import { useState, type CSSProperties } from 'react';
import { motion } from 'framer-motion';
import { Check, FolderClosed, FolderOpen, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  DRAWERS,
  DRAWER_ORDER,
  FOLDERS,
  SHELVES,
  SHELF_ORDER,
  judgeShelf,
  type DrawerId,
  type Shelf,
} from './archiwum';

/**
 * Blok 2 — **„Archiwum postaci”** (śledztwo). Gest nowy w kursie: dziecko
 * **otwiera teczki i wysuwa szuflady**, a potem odkłada teczkę na półkę według
 * tego, co znalazło. Półki są podpisane regułą („coś jest, czegoś brak”), nie
 * nazwą kategorii — nazwy (historyczna / legendarna / baśniowa) pojawiają się
 * dopiero na końcu, jako imię dla tego, co dziecko samo rozdzieliło.
 *
 * Odłożyć można dopiero teczkę z wysuniętymi wszystkimi szufladami — półka
 * zależy od dowodów, więc najpierw trzeba je obejrzeć.
 */
export function ArchiwumPostaci({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [opened, setOpened] = useState<Record<string, DrawerId[]>>({});
  const [shelved, setShelved] = useState<Record<string, Shelf>>({});
  const [activeId, setActiveId] = useState<string | null>(null);
  const [wrong, setWrong] = useState<{ shelf: Shelf; note: string; n: number } | null>(null);

  const active = FOLDERS.find((f) => f.id === activeId);
  const activeOpened = active ? (opened[active.id] ?? []) : [];
  const readyToShelve = !!active && activeOpened.length === DRAWER_ORDER.length;
  const allShelved = Object.keys(shelved).length === FOLDERS.length;

  const openDrawer = (drawer: DrawerId) => {
    if (!active || activeOpened.includes(drawer)) return;
    setOpened({ ...opened, [active.id]: [...activeOpened, drawer] });
  };

  const shelve = (shelf: Shelf) => {
    if (!active || !readyToShelve) return;
    const verdict = judgeShelf(active, shelf);
    if (!verdict.ok) {
      setWrong((prev) => ({ shelf, note: verdict.note ?? '', n: (prev?.n ?? 0) + 1 }));
      return;
    }
    setWrong(null);
    const next = { ...shelved, [active.id]: shelf };
    setShelved(next);
    setActiveId(null);
    if (Object.keys(next).length === FOLDERS.length) onComplete();
  };

  return (
    <div className="space-y-4">
      <p className="text-base leading-relaxed">
        W archiwum leży pięć teczek. Otwórz każdą, wysuń wszystkie cztery szuflady i sprawdź, co w nich jest. Potem odłóż
        teczkę na półkę — według tego, <strong>co znalazłeś/znalazłaś</strong>.
      </p>

      {/* Szafa: teczki jeszcze nieodłożone */}
      <div className="grid grid-cols-5 gap-1.5 rounded-lg border bg-amber-50/60 p-2 dark:bg-zinc-900/60 sm:gap-3 sm:p-3">
        {FOLDERS.map((folder) => {
          const isShelved = !!shelved[folder.id];
          const isActive = folder.id === activeId;
          const count = (opened[folder.id] ?? []).length;
          const Icon = isActive ? FolderOpen : FolderClosed;
          return (
            <button
              key={folder.id}
              type="button"
              disabled={isShelved}
              onClick={() => {
                setActiveId(isActive ? null : folder.id);
                setWrong(null);
              }}
              aria-pressed={isActive}
              className={cn(
                'flex min-h-[92px] flex-col items-center justify-start gap-1 rounded-md border-2 px-1 pb-1.5 pt-2 text-center transition-all',
                isShelved ? 'border-dashed opacity-30' : 'bg-white hover:-translate-y-0.5 dark:bg-zinc-900',
                isActive && '-translate-y-1 shadow-md'
              )}
              style={{ borderColor: isActive ? color : undefined }}
            >
              <Icon className="h-6 w-6 shrink-0" style={{ color }} aria-hidden />
              <span className="text-[11px] font-semibold leading-tight sm:text-xs">{folder.name}</span>
              {!isShelved && count > 0 && (
                <span className="mt-auto text-[10px] text-muted-foreground">{count}/4</span>
              )}
            </button>
          );
        })}
      </div>

      {/* Otwarta teczka */}
      {active && (
        <div className="rounded-lg border-2 bg-white p-3 dark:bg-zinc-900/80 sm:p-4" style={{ borderColor: `${color}55` }}>
          <p className="mb-3 text-sm font-semibold">
            Teczka: <span style={{ color }}>{active.name}</span>
          </p>
          <div className="grid gap-2 sm:grid-cols-2">
            {DRAWER_ORDER.map((drawer) => {
              const isOpen = activeOpened.includes(drawer);
              const find = active.drawers[drawer];
              return (
                <button
                  key={drawer}
                  type="button"
                  onClick={() => openDrawer(drawer)}
                  disabled={isOpen}
                  className={cn(
                    'relative min-h-[64px] overflow-hidden rounded-md border text-left transition-colors',
                    isOpen ? 'cursor-default' : 'bg-amber-100/70 hover:bg-amber-100 dark:bg-amber-900/30'
                  )}
                >
                  {isOpen ? (
                    <motion.div
                      initial={{ y: -12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      className={cn('flex h-full gap-2 p-2.5', find.found ? 'bg-emerald-50 dark:bg-emerald-950/40' : 'bg-zinc-50 dark:bg-zinc-800/60')}
                    >
                      {find.found ? (
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-700" aria-label="znaleziono" />
                      ) : (
                        <X className="mt-0.5 h-4 w-4 shrink-0 text-zinc-400" aria-label="pusto" />
                      )}
                      <span className="text-sm leading-snug">
                        <span className="block text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {DRAWERS[drawer]}
                        </span>
                        {find.text}
                      </span>
                    </motion.div>
                  ) : (
                    <span className="flex h-full items-center justify-between gap-2 px-3 py-2">
                      <span className="text-sm font-medium">{DRAWERS[drawer]}</span>
                      <span className="h-1.5 w-8 shrink-0 rounded-full bg-amber-700/50" aria-hidden />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {!readyToShelve && (
            <p className="mt-2 text-xs text-muted-foreground">Stuknij szufladę, żeby ją wysunąć.</p>
          )}
        </div>
      )}

      {/* Półki */}
      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {SHELF_ORDER.map((shelf) => {
          const onShelf = FOLDERS.filter((f) => shelved[f.id] === shelf);
          const shaking = wrong?.shelf === shelf;
          return (
            <motion.button
              key={shaking ? `${shelf}-${wrong?.n}` : shelf}
              type="button"
              disabled={!readyToShelve}
              onClick={() => shelve(shelf)}
              initial={shaking ? { x: 0 } : false}
              animate={shaking ? { x: [0, -8, 8, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.4 }}
              className={cn(
                'flex min-h-[84px] flex-col rounded-md border-b-8 border-l border-r border-t bg-white px-2 py-2 text-left sm:px-3 transition-shadow dark:bg-zinc-900',
                readyToShelve && 'ring-2 ring-offset-1 hover:shadow-md',
                shaking && 'border-red-400'
              )}
              style={{
                borderBottomColor: shaking ? undefined : '#a16207',
                ...(readyToShelve ? ({ '--tw-ring-color': `${color}66` } as CSSProperties) : {}),
              }}
            >
              <span className="text-[10px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground sm:text-xs">
                <span className="sr-only">półka: </span>{SHELVES[shelf].rule}
              </span>
              {allShelved && (
                <span className="text-xs font-bold leading-tight sm:text-sm" style={{ color }}>
                  {SHELVES[shelf].term}
                </span>
              )}
              <span className="mt-1 flex flex-wrap gap-1">
                {onShelf.map((f) => (
                  <span key={f.id} className="rounded bg-muted px-1.5 py-0.5 text-[11px] font-medium">
                    {f.name}
                  </span>
                ))}
              </span>
            </motion.button>
          );
        })}
      </div>

      <div className="min-h-[1.5rem] text-sm leading-relaxed" aria-live="polite">
        {wrong ? (
          <p className="text-red-700 dark:text-red-400">Nie ta półka. {wrong.note}</p>
        ) : allShelved ? (
          <div className="space-y-2 rounded-lg border bg-muted/40 p-4">
            <p>
              Tak właśnie pracuje historyk: nie pyta „czy to ciekawa opowieść?”, tylko{' '}
              <strong>„skąd to wiemy?”</strong>.
            </p>
            <ul className="space-y-1">
              {SHELF_ORDER.map((shelf) => (
                <li key={shelf}>
                  <strong style={{ color }}>{SHELVES[shelf].term}</strong> — {SHELVES[shelf].meaning}.
                </li>
              ))}
            </ul>
            <p>
              Historia stara się opowiadać o tym, co naprawdę się zdarzyło — i dlatego sprawdza ślady. Legenda może mieć prawdziwe miejsce — Wawel stoi — i
              nadal nie być historią.
            </p>
          </div>
        ) : readyToShelve ? (
          <p className="text-muted-foreground">Wszystkie szuflady wysunięte — wybierz półkę.</p>
        ) : null}
      </div>
    </div>
  );
}
