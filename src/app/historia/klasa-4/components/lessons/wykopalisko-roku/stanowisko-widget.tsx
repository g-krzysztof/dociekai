'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { MikroZadanie } from './mikro-zadania';
import { LAYERS, type LayerId, type Verdict } from './warstwy';
import { useWykop } from './wykop-state';

const COLS = 12;
const ROWS = 3;
const NEED = Math.ceil(COLS * ROWS * 0.7);

/**
 * Blok 1 — **Stanowisko roku**. Gest: odsłania pędzelkiem (przeciąganie
 * po warstwie albo Enter) kolejne warstwy od góry; spod ziemi wychodzi
 * znalezisko, a ono otwiera mikro-zadanie w geście z tamtego modułu.
 * Nieudane — od razu jeszcze raz; liczba prób trafia do mapy roku.
 * `onDone` po szóstej warstwie.
 */
export function StanowiskoWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const { work, update } = useWykop();
  const [cleared, setCleared] = useState<Record<string, Set<number>>>({});
  const [msg, setMsg] = useState<string | null>(null);
  const brushing = useRef(false);
  const reported = useRef(false);

  const active = LAYERS.find((l) => !work.solved.includes(l.id));
  const cells = (id: LayerId) => cleared[id] ?? new Set<number>();
  const found = (id: LayerId) => cells(id).size >= NEED;

  const brushAt = (id: LayerId, el: HTMLElement, x: number, y: number) => {
    const r = el.getBoundingClientRect();
    const col = Math.floor(((x - r.left) / r.width) * COLS);
    const row = Math.floor(((y - r.top) / r.height) * ROWS);
    const hit: number[] = [];
    for (let dr = -1; dr <= 1; dr++)
      for (let dc = -1; dc <= 1; dc++) {
        const rr = row + dr;
        const cc = col + dc;
        if (rr >= 0 && rr < ROWS && cc >= 0 && cc < COLS && Math.abs(dr) + Math.abs(dc) < 2) hit.push(rr * COLS + cc);
      }
    setCleared((c) => {
      const s = new Set(c[id] ?? []);
      hit.forEach((h) => s.add(h));
      return { ...c, [id]: s };
    });
  };

  const onDown = (id: LayerId) => (e: PointerEvent<HTMLDivElement>) => {
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia też działa
    }
    brushing.current = true;
    brushAt(id, e.currentTarget, e.clientX, e.clientY);
  };
  const onMove = (id: LayerId) => (e: PointerEvent<HTMLDivElement>) => {
    if (brushing.current) brushAt(id, e.currentTarget, e.clientX, e.clientY);
  };
  const stopBrush = () => {
    brushing.current = false;
  };
  const onKey = (id: LayerId) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key !== 'Enter' && e.key !== ' ') return;
    e.preventDefault();
    setCleared((c) => {
      const s = new Set(c[id] ?? []);
      const nextRow = Math.floor(s.size / COLS);
      for (let k = 0; k < COLS; k++) s.add(Math.min(nextRow, ROWS - 1) * COLS + k);
      return { ...c, [id]: s };
    });
  };

  const onTry = (id: LayerId) => (v: Verdict) => {
    update((w) => ({ ...w, tries: { ...w.tries, [id]: (w.tries[id] ?? 0) + 1 } }));
    if (!v.ok) {
      setMsg(v.message);
      return;
    }
    setMsg(null);
    const solved = work.solved.includes(id) ? work.solved : [...work.solved, id];
    update((w) => ({ ...w, solved: w.solved.includes(id) ? w.solved : [...w.solved, id] }));
    if (solved.length >= LAYERS.length && !reported.current) {
      reported.current = true;
      onDone();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Pierwsza lekcja w warsztacie historyka nauczyła Cię: <strong>im głębiej, tym dawniej</strong>. Tu w jednym wykopie leży cały
        Twój rok. <strong>Przeciągnij palcem po warstwie</strong> jak pędzelkiem (albo stuknij ją i naciśnij Enter), aż wyjdzie
        znalezisko. Każde ma dla Ciebie małe zadanie. Takiego stanowiska z sześcioma epokami naraz nie ma — to model roku.
      </p>

      <div className="border-2 border-[#6b5a45]">
        <div className="h-3 bg-[#7da35a]" aria-hidden />
        {LAYERS.map((l, i) => {
          const solved = work.solved.includes(l.id);
          const isActive = active?.id === l.id;
          const open = solved || (isActive && found(l.id));
          const c = cells(l.id);
          return (
            <div key={l.id}>
              <div className="relative h-16 sm:h-[4.5rem]" style={{ background: l.soil }}>
                {/* Odsłonięte dno warstwy ze znaleziskiem. */}
                <div className="absolute inset-0 flex items-center justify-between gap-2 bg-[#f3ead7]/85 px-3 text-sm dark:bg-zinc-800/85">
                  <span className="min-w-0 leading-tight">
                    <span className="block text-[11px] uppercase tracking-wide text-muted-foreground">
                      {i + 1}. warstwa · {l.when}
                    </span>
                    <span className="block font-semibold">{open ? l.find : '…'}</span>
                  </span>
                  {solved && (
                    <span className="flex shrink-0 items-center gap-1 text-xs font-semibold" style={{ color }}>
                      <Check className="h-4 w-4" aria-hidden />
                      {l.era}
                    </span>
                  )}
                </div>
                {/* Ziemia do zmiecenia — tylko w warstwie, na której pracujesz. */}
                {!solved && (
                  <div
                    role={isActive ? 'button' : undefined}
                    tabIndex={isActive ? 0 : -1}
                    aria-label={isActive ? `Warstwa ${i + 1} — odsłoń pędzelkiem` : undefined}
                    onPointerDown={isActive ? onDown(l.id) : undefined}
                    onPointerMove={isActive ? onMove(l.id) : undefined}
                    onPointerUp={stopBrush}
                    onPointerCancel={stopBrush}
                    onKeyDown={isActive ? onKey(l.id) : undefined}
                    className={cn('absolute inset-0 grid touch-none', isActive ? 'cursor-crosshair' : 'pointer-events-none')}
                    style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, gridTemplateRows: `repeat(${ROWS}, 1fr)` }}
                  >
                    {Array.from({ length: COLS * ROWS }, (_, k) => (
                      <span
                        key={k}
                        className="transition-opacity duration-300"
                        style={{
                          background: l.soil,
                          opacity: c.has(k) ? 0 : 1,
                          backgroundImage: 'radial-gradient(rgba(0,0,0,0.12) 1px, transparent 1.5px)',
                          backgroundSize: '7px 7px',
                        }}
                      />
                    ))}
                  </div>
                )}
                {isActive && !open && (
                  <span className="pointer-events-none absolute right-2 top-1 text-[11px] font-semibold text-white/90 drop-shadow">
                    {c.size === 0 ? 'tu kop' : `${Math.round((c.size / NEED) * 100)}%`}
                  </span>
                )}
              </div>
              {isActive && open && (
                <div className="border-y-2 border-[#6b5a45] bg-white p-3 dark:bg-zinc-900">
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                    {l.era} · {l.when} · zadanie z {l.from}
                  </p>
                  <MikroZadanie layer={l.id} color={color} onTry={onTry(l.id)} />
                  {msg && <p className="mt-2 text-sm text-destructive">{msg} Spróbuj jeszcze raz.</p>}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {!active && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Cały wykop odsłonięty: sześć warstw, od Rzymu na górze po łowców na samym dnie. Najgłębiej leży to, co najdawniejsze —
          i każdą warstwę trzeba było umieć przeczytać.{' '}
          {(() => {
            const first = LAYERS.filter((l) => (work.tries[l.id] ?? 1) <= 1).length;
            return `${first} z 6 zadań ${plural(first, { one: 'poszło', few: 'poszły', many: 'poszło' })} Ci za pierwszym razem.`;
          })()}
        </p>
      )}
    </div>
  );
}
