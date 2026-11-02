'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent, type RefObject } from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toRoman } from '../../../lib/timeline/dating';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { OsDziejow } from '../../timeline/os-dziejow';
import {
  centuryNumber,
  formatCentury,
  formatYear,
  judgeShelf,
  SHELF_CARDS_BC,
  SHELVES_BC,
  shelfRange,
  type Verdict,
} from './wieki';

/** Po prawej od szczeliny — cztery pierwsze wieki naszej ery; to je dziecko odbija. */
const CE_SHELVES = [1, 2, 3, 4];

/**
 * Blok 3 — **Lustro p.n.e.** (`os-czasu`).
 *
 * Gest nowy w kursie: **składa oś jak kartkę na szczelinie roku zero** —
 * ciągnie brzeg naszej ery w lewo, półki I–IV odbijają się na drugą stronę,
 * a dalsze (do VIII p.n.e.) dorysowują się same. Potem odkłada cztery karty
 * p.n.e. na półki; ta sama reguła z kciukiem, tylko lata liczą się w lewo.
 * Zaliczenie bloku włącza na Osi dziejów podpisy wieków (`ROMAN_CENTURIES_FROM`).
 */
export function LustroPne({
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
  const [fold, setFold] = useState(0);
  const folded = fold >= 1;
  const [placed, setPlaced] = useState<Record<string, number>>({});
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const [armed, setArmed] = useState<string | null>(null);
  const reported = useRef(false);
  const frameRef = useRef<HTMLDivElement>(null);
  const foldDrag = useFoldDrag(fold, (f) => setFold(f >= 0.999 ? 1 : f), frameRef);

  const remaining = SHELF_CARDS_BC.filter((c) => placed[c.id] === undefined);
  const finished = remaining.length === 0;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const place = (id: string, target: string) => {
    const card = SHELF_CARDS_BC.find((c) => c.id === id);
    if (!card) return;
    const bc = target.startsWith('pne-');
    const shelf = Number(target.split('-')[1]);
    const v = judgeShelf(card.year, shelf, bc);
    setVerdict(v);
    setArmed(null);
    if (v.ok) setPlaced((p) => ({ ...p, [id]: shelf }));
  };

  const { bind, drag, hover } = useDragToken({
    disabled: !folded || finished,
    onDrop: (id, target) => {
      if (target && (target.startsWith('pne-') || target.startsWith('ne-'))) place(id, target);
    },
    onTap: (id) => setArmed((a) => (a === id ? null : id)),
  });

  const shelfCount = (century: number) => SHELF_CARDS_BC.filter((c) => placed[c.id] === century).length;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Szczelina roku zero to lustro. Po prawej stoją wieki naszej ery. <strong>Złap ich brzeg i złóż oś w lewo</strong>{' '}
        — przez lustro.
      </p>

      <div ref={frameRef} className="relative select-none">
        <div className="grid grid-cols-[repeat(8,minmax(0,1fr))_10px_repeat(4,minmax(0,1fr))] gap-0.5">
          {SHELVES_BC.map((c) => {
            const visible = folded && (c <= 4 || fold >= 1);
            return (
              <ShelfCell
                key={`pne-${c}`}
                drop={`pne-${c}`}
                century={c}
                bc
                visible={visible}
                delay={folded ? (c - 1) * 90 : 0}
                hover={hover === `pne-${c}`}
                filled={shelfCount(c)}
                color={color}
                onClick={() => armed && folded && place(armed, `pne-${c}`)}
              />
            );
          })}
          <div className="relative" aria-label="szczelina roku zero">
            <svg className="absolute inset-0 h-full w-full text-muted-foreground" preserveAspectRatio="none" viewBox="0 0 10 40" aria-hidden>
              <line x1={2} y1={40} x2={4.5} y2={0} stroke="currentColor" strokeWidth={0.8} />
              <line x1={5.5} y1={40} x2={8} y2={0} stroke="currentColor" strokeWidth={0.8} />
            </svg>
          </div>
          {CE_SHELVES.map((c) => (
            <ShelfCell
              key={`ne-${c}`}
              drop={`ne-${c}`}
              century={c}
              bc={false}
              visible
              delay={0}
              hover={hover === `ne-${c}`}
              filled={0}
              color={color}
              onClick={() => armed && folded && place(armed, `ne-${c}`)}
            />
          ))}
        </div>

        {/* Kartka, która przechodzi przez lustro: kopia półek n.e. obraca się wokół szczeliny */}
        {!folded && fold > 0 && <FoldingPage fold={fold} color={color} />}

        {/* Brzeg osi do chwycenia: cała część n.e. — przeciągnij w lewo albo stuknij */}
        {!folded && (
          <div
            {...foldDrag}
            role="button"
            tabIndex={-1}
            aria-hidden
            className="absolute inset-y-0 cursor-grab touch-none active:cursor-grabbing"
            style={{ left: 'calc((100% - 10px) * 8 / 12 + 10px)', right: 0 }}
          />
        )}
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <ArrowLeft className="h-3 w-3" aria-hidden /> lata p.n.e. rosną w lewo
        </span>
        <span className="flex items-center gap-1">
          lata n.e. rosną w prawo <ArrowRight className="h-3 w-3" aria-hidden />
        </span>
      </div>

      {!folded && <FoldHandle fold={fold} color={color} handlers={foldDrag} />}

      {folded && (
        <>
          <p className="text-sm leading-relaxed">
            Odbicie jest dokładne: <strong>I wiek p.n.e. to lata od 100 do 1 p.n.e.</strong> — zaczyna się od roku z dwoma
            zerami i liczy się w dół, do szczeliny. Dalej w lewo: II, III… Odłóż karty na półki. Kciuk działa tak samo.
          </p>

          {!finished && (
            <div className="flex flex-wrap gap-2">
              {remaining.map((card) => (
                <button
                  key={card.id}
                  type="button"
                  {...bind(card.id)}
                  className={cn('flex touch-none select-none flex-col border-2 bg-background px-3 py-1.5 text-left', armed === card.id && 'bg-muted')}
                  style={{ borderColor: color }}
                >
                  <span className="font-mono text-lg font-bold tabular-nums">{formatYear(card.year)}</span>
                  <span className="text-[11px] text-muted-foreground">{card.event}</span>
                </button>
              ))}
            </div>
          )}
          <DragGhost drag={drag}>
            {drag && (
              <span className="border-2 bg-background px-3 py-1 font-mono text-lg font-bold" style={{ borderColor: color }}>
                {formatYear(SHELF_CARDS_BC.find((c) => c.id === drag.id)?.year ?? 1)}
              </span>
            )}
          </DragGhost>

          {verdict && !finished && (
            <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
              {verdict.ok ? <strong className="text-success">{verdict.message}</strong> : verdict.message}
            </p>
          )}

          {Object.keys(placed).length > 0 && (
            <ul className="space-y-0.5 text-sm">
              {SHELF_CARDS_BC.filter((c) => placed[c.id] !== undefined).map((c) => (
                <li key={c.id}>
                  <span className="font-mono font-semibold tabular-nums">{formatYear(c.year)}</span> — {c.event} →{' '}
                  <strong>{formatCentury(centuryNumber(c.year), true)}</strong>
                </li>
              ))}
            </ul>
          )}
        </>
      )}

      {(finished || done) && (
        <div className="space-y-3 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Od teraz <strong>twoja Oś dziejów podpisuje wieki</strong> cyframi rzymskimi — po lewej od szczeliny kursywą
            (p.n.e.), po prawej pogrubione (n.e.). Zobacz, ile wieków dzieli piramidy od dziś.
          </p>
          <OsDziejow color={color} lesson={lesson} lockMode />
        </div>
      )}
    </div>
  );
}

function ShelfCell({
  drop,
  century,
  bc,
  visible,
  delay,
  hover,
  filled,
  color,
  onClick,
}: {
  drop: string;
  century: number;
  bc: boolean;
  visible: boolean;
  delay: number;
  hover: boolean;
  filled: number;
  color: string;
  onClick: () => void;
}) {
  const { first, last } = shelfRange(century, bc);
  return (
    <button
      type="button"
      data-drop={visible ? drop : undefined}
      onClick={onClick}
      disabled={!visible}
      aria-label={visible ? `Półka ${toRoman(century)} wiek${bc ? ' p.n.e.' : ''}` : 'pusta półka'}
      className={cn(
        'flex h-24 min-w-0 flex-col items-center justify-between border-b-4 px-0.5 py-1 transition-all duration-300',
        visible ? 'bg-muted/30 opacity-100' : 'border-dashed bg-transparent opacity-30',
        hover && 'bg-muted'
      )}
      style={{ borderBottomColor: visible ? color : undefined, transitionDelay: `${delay}ms` }}
    >
      <span className={cn('font-serif text-[11px] font-bold leading-none sm:text-sm', bc && 'italic')} style={{ color: visible ? color : undefined }}>
        {visible ? toRoman(century) : ''}
      </span>
      <span className="flex flex-col items-center gap-0.5">
        {Array.from({ length: filled }, (_, i) => (
          <span key={i} className="h-2 w-2 rounded-full" style={{ background: color }} />
        ))}
      </span>
      {visible && (
        <span className="text-center text-[8px] leading-tight tabular-nums text-muted-foreground sm:text-[10px]">
          {first}
          <br />–{last}
        </span>
      )}
    </button>
  );
}

/** Kopia półek n.e. obracana wokół szczeliny — widać, jak przechodzą przez lustro. */
function FoldingPage({ fold, color }: { fold: number; color: string }) {
  return (
    <div
      className="pointer-events-none absolute inset-y-0 grid grid-cols-4 gap-0.5"
      style={{
        // Prawa część siatki: 4 z 12 kolumn + szczelina; obrót wokół lewego brzegu (szczeliny).
        left: 'calc((100% - 10px) * 8 / 12 + 10px)',
        right: 0,
        transformOrigin: 'left center',
        transform: `perspective(700px) rotateY(${-180 * fold}deg)`,
      }}
      aria-hidden
    >
      {CE_SHELVES.map((c) => (
        <div key={c} className="flex h-24 items-start justify-center border-b-4 bg-background/90 pt-1" style={{ borderBottomColor: color }}>
          <span className="font-serif text-[11px] font-bold sm:text-sm" style={{ color, transform: fold > 0.5 ? 'scaleX(-1)' : undefined }}>
            {toRoman(c)}
          </span>
        </div>
      ))}
    </div>
  );
}

/**
 * Składanie przeciągnięciem: ruch w lewo o `span` (szerokość ramki) = pełne złożenie.
 * Stuknięcie bez ruchu składa samo, a puszczenie od 35% drogi domyka animacją
 * (poniżej — kartka wraca). Wspólne dla brzegu osi i uchwytu pod nią.
 */
function useFoldDrag(fold: number, onChange: (f: number) => void, frameRef: RefObject<HTMLDivElement | null>) {
  const startRef = useRef<{ x: number; fold: number; moved: boolean } | null>(null);
  const foldRef = useRef(fold);
  foldRef.current = fold;
  const animRef = useRef<number | null>(null);

  useEffect(() => () => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
  }, []);

  const animateTo = (target: number) => {
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    const from = foldRef.current;
    const t0 = performance.now();
    const ms = 250 + 450 * Math.abs(target - from);
    const step = (now: number) => {
      const t = Math.min(1, (now - t0) / ms);
      const eased = 1 - (1 - t) * (1 - t);
      onChange(t >= 1 ? target : from + (target - from) * eased);
      animRef.current = t < 1 ? requestAnimationFrame(step) : null;
    };
    animRef.current = requestAnimationFrame(step);
  };

  const onPointerDown = (e: PointerEvent<HTMLElement>) => {
    if (e.button > 0) return;
    if (animRef.current !== null) cancelAnimationFrame(animRef.current);
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Bez przechwycenia ruch działa, dopóki wskaźnik jest nad elementem.
    }
    startRef.current = { x: e.clientX, fold: foldRef.current, moved: false };
  };
  const onPointerMove = (e: PointerEvent<HTMLElement>) => {
    const s = startRef.current;
    if (!s) return;
    const dx = s.x - e.clientX;
    if (!s.moved && Math.abs(dx) < 6) return;
    s.moved = true;
    const span = (frameRef.current?.getBoundingClientRect().width ?? 600) * 0.5;
    onChange(Math.max(0, Math.min(1, s.fold + dx / span)));
  };
  const onPointerUp = () => {
    const s = startRef.current;
    startRef.current = null;
    if (!s) return;
    animateTo(!s.moved || foldRef.current >= 0.35 ? 1 : 0);
  };
  const onKeyDown = (e: KeyboardEvent<HTMLElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      animateTo(1);
    }
  };

  return { onPointerDown, onPointerMove, onPointerUp, onPointerCancel: onPointerUp, onKeyDown };
}

/** Uchwyt składania pod osią: ciągnięty w lewo albo stuknięty. */
function FoldHandle({
  fold,
  color,
  handlers,
}: {
  fold: number;
  color: string;
  handlers: ReturnType<typeof useFoldDrag>;
}) {
  return (
    <div className="relative h-12 border bg-muted/30">
      <span className="absolute inset-y-0 left-3 flex items-center text-xs text-muted-foreground">← do lustra</span>
      <div
        role="slider"
        tabIndex={0}
        aria-label="Złóż oś przez lustro — ciągnij w lewo albo stuknij"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(fold * 100)}
        {...handlers}
        className="absolute inset-y-1 flex w-24 cursor-grab touch-none items-center justify-center border-2 bg-background text-xs font-semibold outline-none focus-visible:ring-2 active:cursor-grabbing"
        style={{ right: `calc(${fold * 60}% + 4px)`, borderColor: color, color }}
      >
        ← złóż
      </div>
    </div>
  );
}
