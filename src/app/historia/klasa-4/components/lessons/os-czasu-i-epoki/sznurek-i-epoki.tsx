'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Check, GripHorizontal, MoveHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { anchorAstro, toAstro } from '../../../lib/timeline/dating';
import { astroToU, ERAS, gapU, GAP_PX, PAD_PX, pxToU, ticksFor, uToAstro, uToPx } from '../../../lib/timeline/scale';
import { timelineNow } from '../../../lib/timeline/use-timeline-pins';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { OsDziejow } from '../../timeline/os-dziejow';
import { labelWidth } from '../../timeline/timeline-axis';
import {
  BOUNDARIES,
  boundaryWhen,
  cardWhen,
  EVENT_CARDS,
  eraOf,
  judgeBoundary,
  judgeOrder,
  liveYearLabel,
  orderMessage,
  type Boundary,
  type BoundaryVerdict,
  type OrderVerdict,
} from './epoki';

type Phase = 'sznurek' | 'skala' | 'granice';

const SLOT_COUNT = EVENT_CARDS.length;

/**
 * Blok 2 — **Pierwsza prawdziwa oś** (`os-czasu`).
 *
 * Trzy kroki na jednej osi „od piramid do dziś”:
 *  1. **sznurek** — sześć kart w kolejności od najdawniejszej (sędzia `judgeOrder`
 *     wskazuje parę sąsiadów i ich daty);
 *  2. **skala** — te same karty, które na sznurku wisiały w równych odstępach,
 *     rozjeżdżają się na prawdziwe miejsca: piramidy samotnie po lewej, reszta
 *     ściśnięta po prawej;
 *  3. **granice** — gest nowy w kursie: **przesuwa granice epok** (uchwyty na
 *     pasach) z równego podziału na wydarzenia graniczne; uchwyt pokazuje rok
 *     na żywo, sędzia `judgeBoundary` przyjmuje z tolerancją i dociąga.
 * Pinezki pismo / 476 / 1492 / 1918 wiszą na Osi dziejów po zaliczeniu bloku.
 */
export function SznurekIEpoki({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [phase, setPhase] = useState<Phase>('sznurek');
  const [order, setOrder] = useState<string[]>([]);
  const [allLocked, setAllLocked] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    if (allLocked && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [allLocked, onComplete]);

  return (
    <div className="space-y-5">
      <Sznurek
        color={color}
        solved={phase !== 'sznurek'}
        showEras={allLocked}
        onSolved={(slots) => {
          setOrder(slots);
          setPhase('skala');
        }}
      />

      {phase !== 'sznurek' && (
        <EpokiAxis
          color={color}
          order={order}
          phase={phase}
          onScale={() => setPhase('granice')}
          onAllLocked={() => setAllLocked(true)}
        />
      )}

      {(allLocked || done) && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Cztery granice wiszą teraz na <strong>twojej Osi dziejów</strong>. Przełącz ją na „Cała ludzkość”: podziałka
            gęstnieje przy dzisiejszym dniu, dokładnie jak zegar, który przybliżałeś/łaś na początku lekcji. Inaczej
            300 000 lat i ostatnie sto lat nie zmieściłyby się na jednym ekranie.
          </p>
          <OsDziejow color={color} lesson={lesson} defaultMode="piramidy" />
        </div>
      )}
    </div>
  );
}

// ─── Krok 1: sznurek ──────────────────────────────────────────────────────────

function Sznurek({
  color,
  solved,
  showEras,
  onSolved,
}: {
  color: string;
  solved: boolean;
  showEras: boolean;
  onSolved: (slots: string[]) => void;
}) {
  const now = timelineNow();
  const [slots, setSlots] = useState<(string | null)[]>(() => Array(SLOT_COUNT).fill(null));
  const [selected, setSelected] = useState<string | null>(null);
  const [verdict, setVerdict] = useState<OrderVerdict | null>(null);

  const tray = EVENT_CARDS.filter((card) => !slots.includes(card.id));

  const place = (cardId: string, target: string | null) => {
    setVerdict(null);
    setSelected(null);
    if (!target?.startsWith('slot-')) return;
    const index = Number(target.slice(5));
    setSlots((prev) => {
      const next = [...prev];
      const from = next.indexOf(cardId);
      const occupant = next[index];
      if (from >= 0) next[from] = occupant ?? null; // zamiana miejscami
      next[index] = cardId;
      return next;
    });
  };

  const { drag, hover, bind } = useDragToken({
    disabled: solved,
    onDrop: place,
    onTap: (id) => {
      // Stuknięcie w kartę na sznurku, gdy inna jest wybrana — zamiana miejscami.
      const index = slots.indexOf(id);
      if (selected && selected !== id && index >= 0) place(selected, `slot-${index}`);
      else setSelected((s) => (s === id ? null : id));
    },
  });

  const tapSlot = (index: number) => {
    if (solved) return;
    if (selected) place(selected, `slot-${index}`);
    else if (slots[index]) setSelected(slots[index]);
  };

  const check = () => {
    const result = judgeOrder(slots, now);
    setVerdict(result);
    if (result.ok) onSolved(slots as string[]);
  };

  const card = (id: string) => EVENT_CARDS.find((c) => c.id === id)!;
  const wrongSlot = verdict && !verdict.ok && verdict.reason === 'kolejnosc' ? verdict.slot : null;

  // Funkcja, nie komponent: komponent zdefiniowany w renderze montowałby się od nowa
  // przy każdym ruchu palca i zrywał przeciąganie (pointer capture).
  const renderToken = (id: string, inSlot?: boolean) => {
    const c = card(id);
    return (
      <button
        key={id}
        type="button"
        {...bind(id)}
        onClick={(e) => e.stopPropagation()}
        className={cn(
          'flex w-full touch-none items-start gap-2 border bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900',
          solved ? 'cursor-default' : 'cursor-grab',
          selected === id && 'ring-2',
          drag?.id === id && 'opacity-40'
        )}
        style={selected === id ? { ['--tw-ring-color' as string]: color } : undefined}
        aria-pressed={selected === id}
        aria-label={`${c.label}, ${cardWhen(c)}${inSlot ? '' : '. Przeciągnij na sznurek albo stuknij i wybierz miejsce.'}`}
      >
        <span className="min-w-0 flex-1 leading-snug">{c.label}</span>
        <span className="shrink-0 font-mono text-xs tabular-nums text-muted-foreground">{cardWhen(c)}</span>
      </button>
    );
  };

  return (
    <div className="space-y-3">
      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        <ol className="relative space-y-1.5 border-l-2 pl-4" style={{ borderColor: color }} aria-label="Sznurek: od najdawniejszego do najnowszego">
          <li className="-ml-4 pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">↑ najdawniejsze</li>
          {slots.map((id, index) => (
            <li key={index} className="relative">
              <span
                className="absolute -left-[1.4rem] top-3 h-2.5 w-2.5 rounded-full border-2 bg-background"
                style={{ borderColor: color }}
                aria-hidden
              />
              <div
                data-drop={`slot-${index}`}
                onClick={() => tapSlot(index)}
                className={cn(
                  'flex min-h-[2.6rem] items-center gap-2 border border-dashed',
                  hover === `slot-${index}` && 'bg-muted',
                  (wrongSlot === index || wrongSlot === index - 1) && 'border-destructive bg-destructive/5',
                  id && 'border-solid'
                )}
              >
                <span className="w-6 shrink-0 text-center font-mono text-xs font-bold" style={{ color }}>
                  {index + 1}
                </span>
                {id ? (
                  <div className="min-w-0 flex-1 py-0.5 pr-0.5">
                    {renderToken(id, true)}
                    {showEras && (
                      <p className="px-2.5 pt-0.5 text-xs italic text-muted-foreground">
                        {eraOf(anchorAstro(card(id).dating, now))}
                      </p>
                    )}
                  </div>
                ) : (
                  <span className="text-xs text-muted-foreground">{selected ? 'stuknij, żeby tu powiesić' : '…'}</span>
                )}
              </div>
            </li>
          ))}
          <li className="-ml-4 pl-4 text-xs font-semibold uppercase tracking-wide text-muted-foreground">↓ najnowsze</li>
        </ol>

        {!solved && (
          <div className="space-y-1.5">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Karty</p>
            {tray.length === 0 ? (
              <p className="text-sm text-muted-foreground">Wszystkie wiszą. Sprawdź kolejność.</p>
            ) : (
              tray.map((c) => renderToken(c.id))
            )}
          </div>
        )}
      </div>

      {!solved && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={check}
            disabled={tray.length > 0}
            className="border-2 px-4 py-2 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: color, color }}
          >
            Sprawdź kolejność
          </button>
        </div>
      )}
      {verdict && (
        <p aria-live="polite" className={cn('text-sm', verdict.ok ? 'font-semibold text-success' : 'text-destructive')}>
          {orderMessage(verdict)}
        </p>
      )}

      <DragGhost drag={drag}>
        {drag && <span className="block border bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900">{card(drag.id).label}</span>}
      </DragGhost>
    </div>
  );
}

// ─── Krok 2–3: oś w skali i granice epok ──────────────────────────────────────

const ROW_H = 30;
const ROWS = BOUNDARIES.length;
const STRIP_TOP = ROWS * ROW_H + 26;
const STRIP_H = 20;
const HEIGHT = STRIP_TOP + STRIP_H + 40;
/** Minimalny odstęp między uchwytami w pikselach — żeby nie dało się ich nałożyć. */
const MIN_GAP = 8;

function EpokiAxis({
  color,
  order,
  phase,
  onScale,
  onAllLocked,
}: {
  color: string;
  order: string[];
  phase: Phase;
  onScale: () => void;
  onAllLocked: () => void;
}) {
  const now = timelineNow();
  const boxRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState(0);
  const [scaled, setScaled] = useState(false);

  useEffect(() => {
    const node = boxRef.current;
    if (!node) return;
    const observer = new ResizeObserver(([entry]) => setWidth(Math.round(entry.contentRect.width)));
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  // Uchwyty startują z równego podziału — „a gdyby epoki były równe?”.
  const [handles, setHandles] = useState<Record<string, number>>(() =>
    Object.fromEntries(BOUNDARIES.map((b, i) => [b.id, uToAstro((i + 1) / (ROWS + 1), 'piramidy', timelineNow())]))
  );
  const [locked, setLocked] = useState<string[]>([]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [verdicts, setVerdicts] = useState<Record<string, BoundaryVerdict | undefined>>({});
  const [blockedBy, setBlockedBy] = useState<{ id: string; by: string } | null>(null);

  const g = gapU('piramidy', now);
  const astroPx = (astro: number) => {
    const u = astroToU(astro, 'piramidy', now);
    return uToPx(u, u > g, width);
  };
  const pxAstro = (px: number) => uToAstro(pxToU(px, width, 'piramidy', now), 'piramidy', now);

  const allLocked = locked.length === BOUNDARIES.length;
  useEffect(() => {
    if (allLocked) onAllLocked();
  }, [allLocked, onAllLocked]);

  const cards = order.map((id, i) => {
    const card = EVENT_CARDS.find((c) => c.id === id)!;
    const astro = anchorAstro(card.dating, now);
    const evenPx = width ? PAD_PX + ((i + 1) / (order.length + 1)) * (width - 2 * PAD_PX) : 0;
    return { card, n: i + 1, px: scaled ? astroPx(astro) : evenPx };
  });

  const limits = (index: number) => {
    const prev = BOUNDARIES[index - 1];
    const next = BOUNDARIES[index + 1];
    return {
      min: prev ? astroPx(handles[prev.id]) + MIN_GAP : PAD_PX,
      max: next ? astroPx(handles[next.id]) - MIN_GAP : width - PAD_PX,
      prev,
      next,
    };
  };

  const moveTo = (b: Boundary, index: number, px: number) => {
    const { min, max, prev, next } = limits(index);
    const clamped = Math.min(Math.max(px, min), max);
    if (px < min && prev && !locked.includes(prev.id)) setBlockedBy({ id: b.id, by: prev.id });
    else if (px > max && next && !locked.includes(next.id)) setBlockedBy({ id: b.id, by: next.id });
    else if (px < min || px > max) setBlockedBy({ id: b.id, by: (px < min ? prev : next)!.id });
    else setBlockedBy(null);
    setHandles((h) => ({ ...h, [b.id]: pxAstro(clamped) }));
    setVerdicts((v) => ({ ...v, [b.id]: undefined }));
  };

  const release = (b: Boundary) => {
    const result = judgeBoundary(b, handles[b.id]);
    setVerdicts((v) => ({ ...v, [b.id]: result }));
    if (result.ok) {
      setHandles((h) => ({ ...h, [b.id]: toAstro(b.year) }));
      setLocked((l) => (l.includes(b.id) ? l : [...l, b.id]));
      setBlockedBy(null);
    }
  };

  const pointerPx = (event: PointerEvent) => {
    const rect = boxRef.current?.getBoundingClientRect();
    return rect ? event.clientX - rect.left : 0;
  };

  const handleProps = (b: Boundary, index: number) => ({
    onPointerDown: (event: PointerEvent<HTMLButtonElement>) => {
      if (locked.includes(b.id) || phase !== 'granice') return;
      event.currentTarget.setPointerCapture(event.pointerId);
      setDragging(b.id);
    },
    onPointerMove: (event: PointerEvent<HTMLButtonElement>) => {
      if (dragging !== b.id) return;
      moveTo(b, index, pointerPx(event));
    },
    onPointerUp: () => {
      if (dragging !== b.id) return;
      setDragging(null);
      release(b);
    },
    onPointerCancel: () => setDragging(null),
    onKeyDown: (event: KeyboardEvent<HTMLButtonElement>) => {
      if (locked.includes(b.id) || phase !== 'granice') return;
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const step = width * (event.shiftKey ? 0.05 : 0.005);
        moveTo(b, index, astroPx(handles[b.id]) + (event.key === 'ArrowLeft' ? -step : step));
      } else if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        release(b);
      }
    },
  });

  const eraEdgesPx = width ? [0, ...BOUNDARIES.map((b) => astroPx(handles[b.id])), width] : [];
  const gapLeft = width ? uToPx(g, false, width) : 0;
  const focused = BOUNDARIES.find((b) => verdicts[b.id] && !verdicts[b.id]!.ok);
  const focusedVerdict = focused ? verdicts[focused.id] : undefined;
  const blocked = blockedBy ? BOUNDARIES.find((b) => b.id === blockedBy.by) : undefined;

  return (
    <div className="space-y-3">
      {phase === 'skala' && !scaled && (
        <p className="text-sm leading-relaxed">
          Na sznurku karty wiszą w równych odstępach — jakby między piramidami a zamkiem minęło tyle samo lat, co między
          Kolumbem a Kopernikiem. Rozciągnij sznurek na prawdziwą oś, gdzie każde sto lat zajmuje tyle samo miejsca.
        </p>
      )}
      {phase === 'granice' && (
        <p className="text-sm leading-relaxed">
          Historycy dzielą dzieje na <strong>epoki</strong>. Ktoś podzielił oś na pięć równych kawałków — ale epok nie
          wyznacza linijka, tylko wielkie wydarzenia. Przeciągnij każdą granicę na jej wydarzenie. Uchwyt pokazuje, w
          którym roku właśnie stoi.
        </p>
      )}

      <div ref={boxRef} className="relative w-full select-none overflow-hidden" style={{ height: HEIGHT }}>
        {width > 0 && (
          <>
            {/* Pasy epok — od uchwytów (w kroku „skala” jeden szary pas) */}
            <div
              className="absolute overflow-hidden border border-border bg-muted/40"
              style={{ top: STRIP_TOP, left: 0, right: 0, height: STRIP_H }}
              aria-hidden
            >
              {phase === 'granice' &&
                ERAS.map((era, i) => (
                  <div
                    key={era.id}
                    className="absolute inset-y-0"
                    style={{ left: eraEdgesPx[i], width: Math.max(0, eraEdgesPx[i + 1] - eraEdgesPx[i]), background: era.color.replace(/0\.1\d\)/, '0.32)') }}
                  />
                ))}
            </div>
            {/* Szczelina roku zero — bez komentarza (to temat L8) */}
            <div className="absolute bg-background" style={{ top: STRIP_TOP - 3, left: gapLeft, width: GAP_PX, height: STRIP_H + 6 }} aria-hidden>
              <svg width={GAP_PX} height={STRIP_H + 6} className="text-muted-foreground">
                <line x1={2} y1={STRIP_H + 5} x2={6} y2={1} stroke="currentColor" strokeWidth={1.2} />
                <line x1={8} y1={STRIP_H + 5} x2={12} y2={1} stroke="currentColor" strokeWidth={1.2} />
              </svg>
            </div>

            {/* Nazwy epok pod pasem, gdy jest miejsce */}
            {phase === 'granice' &&
              ERAS.map((era, i) => {
                const left = eraEdgesPx[i];
                const w = eraEdgesPx[i + 1] - left;
                if (w < labelWidth(era.label) - 12) return null;
                return (
                  <span
                    key={era.id}
                    className="absolute truncate text-center text-[10px] italic leading-none text-muted-foreground"
                    style={{ top: STRIP_TOP + STRIP_H + 4, left, width: w }}
                  >
                    {era.label}
                  </span>
                );
              })}

            {/* Podziałka co 1000 lat */}
            {ticksFor('piramidy', now)
              .filter((t) => t.major)
              .map((tick) => {
                const px = uToPx(tick.u, tick.afterGap, width);
                const w = labelWidth(tick.label) - 10;
                return (
                  <span
                    key={tick.label}
                    className="absolute whitespace-nowrap text-center text-[10px] tabular-nums text-muted-foreground"
                    style={{ top: STRIP_TOP + STRIP_H + 20, left: Math.min(Math.max(px - w / 2, 0), width - w), width: w }}
                    aria-hidden
                  >
                    {tick.label}
                  </span>
                );
              })}

            {/* Karty jako numerowane kropki na pasie — rozjeżdżają się do skali */}
            {cards.map(({ card, n, px }) => (
              <span
                key={card.id}
                className="absolute flex h-5 w-5 -translate-x-1/2 items-center justify-center rounded-full border-2 border-background text-[10px] font-bold text-white transition-[left] duration-1000 ease-out"
                style={{ left: px, top: STRIP_TOP, background: color, zIndex: 2 }}
                title={`${n}. ${card.label} — ${cardWhen(card)}`}
                aria-hidden
              >
                {n}
              </span>
            ))}

            {/* Uchwyty granic — każdy w swoim rzędzie, żeby się nie nakładały */}
            {phase === 'granice' &&
              BOUNDARIES.map((b, index) => {
                const px = astroPx(handles[b.id]);
                const isLocked = locked.includes(b.id);
                const rejected = verdicts[b.id] && !verdicts[b.id]!.ok;
                const text = `${b.label} · ${boundaryWhen(b)}`;
                const w = Math.min(labelWidth(text) + 30, width);
                const top = index * ROW_H;
                return (
                  <div key={b.id}>
                    <span
                      className="absolute w-0.5 -translate-x-1/2"
                      style={{
                        left: px,
                        top: top + 26,
                        height: STRIP_TOP + STRIP_H - top - 26,
                        background: rejected ? 'var(--destructive)' : isLocked ? color : 'var(--foreground)',
                        opacity: isLocked ? 0.9 : 0.6,
                        zIndex: 3,
                      }}
                      aria-hidden
                    />
                    {dragging === b.id && (
                      <span
                        className="absolute -translate-x-1/2 whitespace-nowrap bg-foreground px-1.5 text-[11px] font-semibold tabular-nums text-background"
                        style={{ left: Math.min(Math.max(px, 40), width - 40), top: STRIP_TOP - 18, zIndex: 4 }}
                        aria-hidden
                      >
                        {liveYearLabel(handles[b.id])}
                      </span>
                    )}
                    <button
                      type="button"
                      {...handleProps(b, index)}
                      disabled={isLocked}
                      aria-label={`Granica: ${text}. Teraz stoi w roku ${liveYearLabel(handles[b.id])}. Przesuwaj strzałkami, Enter — puść.`}
                      className={cn(
                        'absolute flex h-6 touch-none items-center gap-1 whitespace-nowrap border-2 px-2 text-[11px] font-semibold',
                        isLocked ? 'cursor-default text-white' : 'cursor-grab bg-background',
                        dragging === b.id && 'cursor-grabbing shadow-md'
                      )}
                      style={{
                        top,
                        left: Math.min(Math.max(px - w / 2, 0), width - w),
                        width: w,
                        borderColor: rejected ? 'var(--destructive)' : color,
                        background: isLocked ? color : undefined,
                        zIndex: 5,
                      }}
                    >
                      {isLocked ? <Check className="h-3 w-3 shrink-0" aria-hidden /> : <MoveHorizontal className="h-3 w-3 shrink-0" aria-hidden />}
                      <span className="truncate">{text}</span>
                      {!isLocked && <GripHorizontal className="ml-auto h-3 w-3 shrink-0 text-muted-foreground" aria-hidden />}
                    </button>
                  </div>
                );
              })}
          </>
        )}
      </div>

      {phase === 'skala' && !scaled && (
        <button
          type="button"
          onClick={() => setScaled(true)}
          className="border-2 px-4 py-2 text-sm font-semibold"
          style={{ borderColor: color, color }}
        >
          Rozciągnij do prawdziwej skali
        </button>
      )}
      {phase === 'skala' && scaled && (
        <div className="space-y-3">
          <p className="text-sm leading-relaxed">
            Kolejność ta sama — ale odstępy prawdziwe. Piramidy stoją samotnie po lewej, a pięć pozostałych kart
            ścisnęło się w ostatniej ćwierci osi. <strong>Im bliżej dziś, tym gęściej od wydarzeń.</strong> Najstarsze są
            po lewej, najnowsze po prawej — tak rysuje się każdą oś czasu.
          </p>
          <button
            type="button"
            onClick={onScale}
            className="border-2 px-4 py-2 text-sm font-semibold"
            style={{ borderColor: color, color }}
          >
            Podziel oś na epoki
          </button>
        </div>
      )}

      {phase === 'granice' && (
        <p
          aria-live="polite"
          className={cn('min-h-[2.5rem] text-sm', allLocked ? 'font-semibold text-success' : focusedVerdict || blocked ? 'text-destructive' : 'text-muted-foreground')}
        >
          {allLocked
            ? 'Pięć epok: prehistoria, starożytność, średniowiecze, nowożytność i współczesność. Spójrz na pasy — każdy następny jest węższy.'
            : blocked && blockedBy
              ? `Na drodze stoi granica „${blocked.label}” — granice nie mogą się minąć. ${locked.includes(blocked.id) ? 'Ta stoi już na swoim miejscu, więc twoja musi być po jej drugiej stronie.' : 'Przesuń najpierw ją.'}`
              : focused && focusedVerdict && !focusedVerdict.ok
                ? `„${focused.label}” to ${boundaryWhen(focused)}, a granica stoi ok. ${focusedVerdict.offBy} lat ${focusedVerdict.direction === 'wczesniej' ? 'za późno' : 'za wcześnie'} — przesuń ją w ${focusedVerdict.direction === 'wczesniej' ? 'lewo' : 'prawo'}.`
                : `Na miejscu: ${locked.length} z ${BOUNDARIES.length}.`}
        </p>
      )}
    </div>
  );
}

