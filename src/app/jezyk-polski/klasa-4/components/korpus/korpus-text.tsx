'use client';

import {
  Fragment,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { tokenAtPoint, tokenRange, type Rect } from '../../lib/korpus/judges';
import type { Korpus, Token, Unit } from '../../lib/korpus/types';

/**
 * Renderer tekstu z adnotacją (silnik `korpus`, E2). Jeden komponent na
 * wszystkie gesty na tekście:
 * - `pick="word" | "unit" | "span"` — stuknięcie wyrazu, zdania/wersu albo
 *   fragmentu `[[…]]` (para stuknięć „słowo → dowód” składa lekcja z dwóch
 *   kolejnych `onPick`);
 * - `highlighter` — zakreślacz: pociągnięcie palcem po wyrazach (trafienie
 *   liczone geometrią, `tokenAtPoint`), zakres idzie do `onHighlight`;
 * - `gaps` — luki zamiast wyrazów, cele `data-drop="gap:<id>"` dla `useDragToken`;
 * - `dropOnWords` — każdy wyraz jest celem `data-drop="w:<id>"` (upuść słowo na słowo);
 * - `activeUnit` — wyróżnione zdanie (lektor albo linijka czytania);
 * - `afterBlock` — wstawka po akapicie/strofie o danym indeksie (np. „koniec pierwszej części”).
 *
 * Werdykty liczą sędziowie z `lib/korpus/judges.ts`; tutaj tylko wygląd i gest.
 */

export type KorpusMark = 'picked' | 'ok' | 'bad' | 'hint' | 'dim';

export interface GapSlot {
  placed: string | null;
  state?: 'ok' | 'bad';
}

interface KorpusTextProps {
  korpus: Korpus;
  /** Kolor kursu/modułu — obwódki i podświetlenia. */
  color: string;
  pick?: 'none' | 'word' | 'unit' | 'span';
  /** Ogranicza stukanie do tych id (np. tylko wypowiedzi); pominięte = wszystko. */
  pickable?: string[];
  onPick?: (id: string) => void;
  /** Aktywny zakreślacz (kolor CSS); `null` — zakreślanie wyłączone. */
  highlighter?: string | null;
  onHighlight?: (tokenIds: string[]) => void;
  /** Zakreślenia: id tokenu → kolor CSS. */
  highlights?: Record<string, string>;
  /** Wygląd: id wyrazu, zdania albo fragmentu → znacznik. */
  marks?: Record<string, KorpusMark>;
  activeUnit?: string | null;
  afterBlock?: Record<number, ReactNode>;
  gaps?: Record<string, GapSlot>;
  onGapTap?: (tokenId: string) => void;
  dropOnWords?: boolean;
  /** Podświetlenie celu upuszczenia (`hover` z `useDragToken`, np. `w:t3`). */
  dropHover?: string | null;
  className?: string;
}

const MARK_ORDER: KorpusMark[] = ['bad', 'ok', 'picked', 'hint', 'dim'];

function strongestMark(ids: string[], marks?: Record<string, KorpusMark>): KorpusMark | undefined {
  if (!marks) return undefined;
  const found = ids.map((id) => marks[id]).filter(Boolean) as KorpusMark[];
  return MARK_ORDER.find((m) => found.includes(m));
}

function markStyle(mark: KorpusMark | undefined, color: string): CSSProperties {
  switch (mark) {
    case 'picked':
      return { backgroundColor: `color-mix(in srgb, ${color} 18%, transparent)`, boxShadow: `inset 0 -2px 0 ${color}` };
    case 'ok':
      return { backgroundColor: 'color-mix(in srgb, #16a34a 18%, transparent)', boxShadow: 'inset 0 -2px 0 #16a34a' };
    case 'bad':
      return { backgroundColor: 'color-mix(in srgb, #dc2626 14%, transparent)', boxShadow: 'inset 0 -2px 0 #dc2626' };
    case 'hint':
      return { textDecoration: `underline dashed ${color}`, textUnderlineOffset: '4px' };
    case 'dim':
      return { opacity: 0.4 };
    default:
      return {};
  }
}

const activate = (fn: () => void) => (e: KeyboardEvent) => {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    fn();
  }
};

export function KorpusText({
  korpus,
  color,
  pick = 'none',
  pickable,
  onPick,
  highlighter = null,
  onHighlight,
  highlights,
  marks,
  activeUnit = null,
  afterBlock,
  gaps,
  onGapTap,
  dropOnWords = false,
  dropHover = null,
  className = '',
}: KorpusTextProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const stroke = useRef<{ from: string; rects: { id: string; rect: Rect }[] } | null>(null);
  const [preview, setPreviewState] = useState<Set<string> | null>(null);
  // Podgląd także w refie: `pointerup` może przyjść przed renderem z ostatnim `pointermove`.
  const previewRef = useRef<Set<string> | null>(null);
  const setPreview = (next: Set<string> | null) => {
    previewRef.current = next;
    setPreviewState(next);
  };

  const canPick = (id: string) => !pickable || pickable.includes(id);
  const pickSpanOf = (t: Token) => t.spanIds.find(canPick);

  // ── zakreślacz: pociągnięcie po wyrazach ──
  const wordRects = () =>
    [...(rootRef.current?.querySelectorAll<HTMLElement>('[data-word]') ?? [])].map((el) => ({
      id: el.dataset.token!,
      rect: el.getBoundingClientRect(),
    }));

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    if (!highlighter || e.button > 0) return;
    const rects = wordRects();
    const from = tokenAtPoint(rects, e.clientX, e.clientY, 4);
    if (!from) return;
    e.preventDefault();
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* syntetyczne zdarzenia w testach */
    }
    stroke.current = { from, rects };
    setPreview(new Set([from]));
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const s = stroke.current;
    if (!s) return;
    const to = tokenAtPoint(s.rects, e.clientX, e.clientY, 10);
    if (to) setPreview(new Set(tokenRange(korpus, s.from, to)));
  };

  const finishStroke = () => {
    const s = stroke.current;
    stroke.current = null;
    const range = previewRef.current ? [...previewRef.current] : [];
    setPreview(null);
    if (s && range.length) onHighlight?.(range);
  };

  const renderToken = (t: Token, isLast: boolean): ReactNode => {
    const after = isLast ? '' : t.after;
    if (t.type === 'punct') {
      return (
        <span key={t.id} data-token={t.id} style={markStyle(strongestMark([t.id], marks), color)}>
          {t.form}
          {after}
        </span>
      );
    }

    const gap = gaps?.[t.id];
    if (gap) {
      const dropId = `gap:${t.id}`;
      const hot = dropHover === dropId;
      return (
        <span key={t.id}>
          <span
            data-token={t.id}
            data-drop={dropId}
            role={onGapTap ? 'button' : undefined}
            tabIndex={onGapTap ? 0 : undefined}
            onClick={onGapTap ? () => onGapTap(t.id) : undefined}
            onKeyDown={onGapTap ? activate(() => onGapTap(t.id)) : undefined}
            className="inline-block min-w-[5ch] border-b-2 px-1 text-center font-semibold"
            style={{
              borderColor: gap.state === 'bad' ? '#dc2626' : gap.state === 'ok' ? '#16a34a' : color,
              backgroundColor: hot ? `color-mix(in srgb, ${color} 22%, transparent)` : undefined,
            }}
          >
            {gap.placed ?? ' '}
          </span>
          {after}
        </span>
      );
    }

    const mark = strongestMark([t.id, ...t.spanIds], marks);
    const hl = preview?.has(t.id) ? highlighter : highlights?.[t.id];
    const dropId = dropOnWords ? `w:${t.id}` : undefined;
    const wordPick = pick === 'word' && canPick(t.id);
    const spanPick = pick === 'span' ? pickSpanOf(t) : undefined;
    const tappable = wordPick || Boolean(spanPick);
    const doPick = () => onPick?.(wordPick ? t.id : spanPick!);

    return (
      <span key={t.id}>
        <span
          data-token={t.id}
          data-word=""
          data-drop={dropId}
          role={tappable ? 'button' : undefined}
          tabIndex={tappable ? 0 : undefined}
          onClick={tappable ? doPick : undefined}
          onKeyDown={tappable ? activate(doPick) : undefined}
          className={tappable ? 'cursor-pointer hover:underline' : undefined}
          style={{
            ...markStyle(mark, color),
            ...(hl ? { backgroundColor: hl } : {}),
            ...(dropId && dropHover === dropId ? { outline: `2px solid ${color}`, outlineOffset: 1 } : {}),
          }}
        >
          {t.form}
        </span>
        {after}
      </span>
    );
  };

  const renderUnit = (u: Unit, trailing: string): ReactNode => {
    const tokens = u.tokenIds.map((id) => korpus.tokenById[id]);
    const unitPick = pick === 'unit' && canPick(u.id);
    const mark = marks?.[u.id];
    const active = activeUnit === u.id;
    const body = tokens.map((t, i) => renderToken(t, i === tokens.length - 1));
    return (
      <span key={u.id}>
        <span
          data-unit={u.id}
          role={unitPick ? 'button' : undefined}
          tabIndex={unitPick ? 0 : undefined}
          onClick={unitPick ? () => onPick?.(u.id) : undefined}
          onKeyDown={unitPick ? activate(() => onPick?.(u.id)) : undefined}
          className={unitPick ? 'cursor-pointer hover:underline' : undefined}
          style={{
            ...markStyle(mark, color),
            ...(active ? { backgroundColor: `color-mix(in srgb, ${color} 12%, transparent)` } : {}),
          }}
        >
          {body}
        </span>
        {trailing}
      </span>
    );
  };

  return (
    <div
      ref={rootRef}
      className={`select-none text-base leading-relaxed sm:text-lg ${highlighter ? 'touch-none cursor-text' : ''} ${className}`}
      onPointerDown={highlighter ? onPointerDown : undefined}
      onPointerMove={highlighter ? onPointerMove : undefined}
      onPointerUp={highlighter ? finishStroke : undefined}
      onPointerCancel={highlighter ? finishStroke : undefined}
    >
      {korpus.blocks.map((unitIds, b) => (
        <Fragment key={b}>
          {korpus.layout === 'verse' ? (
            <div className="mb-4 last:mb-0">
              {unitIds.map((id) => (
                <div key={id}>{renderUnit(korpus.unitById[id], '')}</div>
              ))}
            </div>
          ) : (
            <p className="mb-3 last:mb-0">
              {unitIds.map((id, i) => renderUnit(korpus.unitById[id], i < unitIds.length - 1 ? ' ' : ''))}
            </p>
          )}
          {afterBlock?.[b]}
        </Fragment>
      ))}
    </div>
  );
}
