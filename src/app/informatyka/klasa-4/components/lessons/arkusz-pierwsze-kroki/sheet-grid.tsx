'use client';

import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type KeyboardEvent,
  type PointerEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  addr,
  colName,
  displayValue,
  evaluateSheet,
  formulaReferences,
  shiftFormula,
  tokenize,
  type Box,
  type CellValue,
  type RawCells,
} from '../../../lib/formula';

/**
 * Makieta arkusza wspólna dla widżetów lekcji `arkusz-pierwsze-kroki`.
 *
 * To **nie jest** zabawka udająca arkusz — liczy naprawdę (`lib/formula.ts`) i ma
 * trzy gesty, które w prawdziwym programie są codziennością, a na stronie kursu
 * pojawiają się pierwszy raz:
 *
 * 1. **zaznaczanie zakresu przeciągnięciem** — z niego rysuje się wykres i z
 *    niego bierze się `B2:B6` w formule;
 * 2. **wskazywanie adresu w formule kliknięciem** — dziecko pisze `=`, stuka w
 *    komórkę i adres wpisuje się sam, obwiedziony tym samym kolorem co w formule.
 *    Tak buduje formuły każdy, kto robi to na co dzień, i tak znika połowa
 *    literówek w adresach;
 * 3. **uchwyt wypełniania** — kwadracik w rogu komórki, który kopiuje formułę w
 *    dół albo w bok i **przesuwa w niej adresy**.
 *
 * Trzy decyzje, każda wyniesiona z poprzednich modułów:
 *
 * - **Stan wskazywania żyje w React, nie w fokusie pola.** Na dotyku stuknięcie w
 *   komórkę potrafi zabrać fokus z pola formuły; gdyby od fokusu zależało, czy
 *   stuknięcie wpisuje adres, na tablecie formuły nie dałoby się zbudować.
 * - **Przeciąganie trzyma wskaźnik** (`setPointerCapture`) i szuka komórki pod
 *   palcem przez `elementFromPoint` — lekcja 28 nauczyła, że bez tego puszczenie
 *   palca poza siatką zostawia widżet w trybie przeciągania.
 * - **`touch-action: none` tylko tam, gdzie jest gest przeciągania.** Siatka, w
 *   którą się tylko stuka, nie może blokować przewijania strony na telefonie.
 */

export const REF_COLORS = ['#2563eb', '#dc2626', '#7c3aed', '#059669', '#c2410c'];

export interface Cell {
  col: number;
  row: number;
}

export function boxOf(a: Cell, b: Cell): Box {
  return {
    c1: Math.min(a.col, b.col),
    c2: Math.max(a.col, b.col),
    r1: Math.min(a.row, b.row),
    r2: Math.max(a.row, b.row),
  };
}

export function boxText(box: Box): string {
  const start = addr(box.c1, box.r1);
  return box.c1 === box.c2 && box.r1 === box.r2 ? start : `${start}:${addr(box.c2, box.r2)}`;
}

export function sameBox(a: Box | null | undefined, b: Box | null | undefined): boolean {
  return !!a && !!b && a.c1 === b.c1 && a.c2 === b.c2 && a.r1 === b.r1 && a.r2 === b.r2;
}

function inBox(box: Box | null | undefined, col: number, row: number): boolean {
  return !!box && col >= box.c1 && col <= box.c2 && row >= box.r1 && row <= box.r2;
}

/** Obwódka zakresu rysowana cieniem wewnętrznym na krawędziach komórek, które leżą na brzegu. */
function edgeShadows(box: Box, col: number, row: number, color: string, width = 2): string[] {
  const shadows: string[] = [];
  if (row === box.r1) shadows.push(`inset 0 ${width}px 0 0 ${color}`);
  if (row === box.r2) shadows.push(`inset 0 -${width}px 0 0 ${color}`);
  if (col === box.c1) shadows.push(`inset ${width}px 0 0 0 ${color}`);
  if (col === box.c2) shadows.push(`inset -${width}px 0 0 0 ${color}`);
  return shadows;
}

/* ------------------------------------------------------------------ */
/* Siatka                                                              */
/* ------------------------------------------------------------------ */

export type GesturePhase = 'start' | 'move' | 'end';

export interface SheetGridProps {
  cols: number;
  rows: number;
  cells: RawCells;
  values: Record<string, CellValue>;
  color: string;
  /** Szerokość kolumn w pikselach; brakujące dostają 64. */
  widths?: number[];
  /** Zaznaczenie (podświetlone tło + ramka w kolorze lekcji). */
  selection?: Box | null;
  /** Komórka aktywna — biała w środku zaznaczenia, jak w prawdziwym arkuszu. */
  active?: Cell | null;
  /**
   * Stuknięcie albo przeciągnięcie po komórkach. `range` pozwala ciągnąć (i
   * blokuje przewijanie strony nad siatką), `cell` przyjmuje tylko stuknięcie.
   */
  mode?: 'cell' | 'range' | 'none';
  onGesture?: (box: Box, origin: Cell, phase: GesturePhase) => void;
  /** Kolorowe obwódki odwołań formuły w edycji. */
  highlights?: { box: Box; color: string }[];
  /** Adres → numer; zmiana numeru odpala mignięcie komórki (przeliczyła się). */
  flashes?: Record<string, number>;
  /** Dodatkowy wygląd pojedynczej komórki (np. oznaczona jako martwa). */
  decorate?: (address: string) => { className?: string; style?: React.CSSProperties; badge?: ReactNode } | undefined;
  /** Uchwyt wypełniania przy komórce aktywnej. */
  onFill?: (from: Cell, to: Box, phase: GesturePhase) => void;
  fillPreview?: Box | null;
  /** Komórki, których nie wypełnia się uchwytem (np. nagłówki). */
  canFill?: (from: Cell) => boolean;
  caption?: ReactNode;
  className?: string;
}

export function SheetGrid({
  cols,
  rows,
  cells,
  values,
  color,
  widths,
  selection,
  active,
  mode = 'cell',
  onGesture,
  highlights,
  flashes,
  decorate,
  onFill,
  fillPreview,
  canFill,
  caption,
  className,
}: SheetGridProps) {
  const drag = useRef<{ kind: 'select' | 'fill'; origin: Cell; last: Cell; pointer: number } | null>(null);

  const cellAt = (x: number, y: number): Cell | null => {
    const element = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-cell]');
    if (!element) return null;
    return { col: Number(element.dataset.col), row: Number(element.dataset.row) };
  };

  const fillBox = (origin: Cell, to: Cell): Box => {
    /* Uchwyt ciągnie w jedną stronę — tę, w którą palec odjechał dalej. */
    const down = Math.abs(to.row - origin.row) >= Math.abs(to.col - origin.col);
    return down
      ? { c1: origin.col, c2: origin.col, r1: Math.min(origin.row, to.row), r2: Math.max(origin.row, to.row) }
      : { c1: Math.min(origin.col, to.col), c2: Math.max(origin.col, to.col), r1: origin.row, r2: origin.row };
  };

  const down = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0 && event.pointerType === 'mouse') return;
    const target = event.target as HTMLElement;
    const handle = target.closest('[data-fill]');
    if (handle && active && onFill) {
      event.preventDefault();
      event.currentTarget.setPointerCapture(event.pointerId);
      drag.current = { kind: 'fill', origin: active, last: active, pointer: event.pointerId };
      onFill(active, fillBox(active, active), 'start');
      return;
    }
    const element = target.closest<HTMLElement>('[data-cell]');
    if (!element || mode === 'none' || !onGesture) return;
    const cell = { col: Number(element.dataset.col), row: Number(element.dataset.row) };
    /* Bez tego stuknięcie w komórkę zabiera fokus z pola formuły. */
    event.preventDefault();
    drag.current = { kind: 'select', origin: cell, last: cell, pointer: event.pointerId };
    /*
     * W trybie „komórka” stuknięcie liczy się dopiero po puszczeniu palca —
     * inaczej każde przewinięcie strony zaczęte na siatce zaznaczałoby komórkę.
     */
    if (mode === 'range') {
      event.currentTarget.setPointerCapture(event.pointerId);
      onGesture(boxOf(cell, cell), cell, 'start');
    }
  };

  const move = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    if (current.kind === 'select' && mode !== 'range') return;
    const cell = cellAt(event.clientX, event.clientY);
    if (!cell || (cell.col === current.last.col && cell.row === current.last.row)) return;
    current.last = cell;
    if (current.kind === 'fill') onFill?.(current.origin, fillBox(current.origin, cell), 'move');
    else onGesture?.(boxOf(current.origin, cell), current.origin, 'move');
  };

  const up = (event: PointerEvent<HTMLDivElement>) => {
    const current = drag.current;
    if (!current || current.pointer !== event.pointerId) return;
    drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId))
      event.currentTarget.releasePointerCapture(event.pointerId);
    if (current.kind === 'fill') {
      onFill?.(current.origin, fillBox(current.origin, current.last), 'end');
      return;
    }
    if (mode === 'cell') {
      /* Przewijanie (pointercancel) albo puszczenie gdzie indziej to nie stuknięcie. */
      if (event.type === 'pointercancel') return;
      const cell = cellAt(event.clientX, event.clientY);
      if (!cell || cell.col !== current.origin.col || cell.row !== current.origin.row) return;
      onGesture?.(boxOf(cell, cell), cell, 'start');
      onGesture?.(boxOf(cell, cell), cell, 'end');
      return;
    }
    onGesture?.(boxOf(current.origin, current.last), current.origin, 'end');
  };

  const columnWidths = Array.from({ length: cols }, (_, index) => widths?.[index] ?? 64);
  const template = `26px ${columnWidths.map((width) => `${width}px`).join(' ')}`;
  const draggable = mode === 'range' || !!onFill;

  return (
    <div className={cn('max-w-full', className)}>
      <div className="max-w-full overflow-x-auto pb-1">
        <div
          role="grid"
          aria-rowcount={rows + 1}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={up}
          className="inline-grid select-none border-l border-t bg-white text-[13px] dark:bg-zinc-950"
          style={{ gridTemplateColumns: template, touchAction: draggable ? 'none' : undefined }}
        >
          <div className="border-b border-r bg-muted/60" />
          {columnWidths.map((_, col) => {
            const lit = inBox(selection, col, selection?.r1 ?? -1);
            return (
              <div
                key={`h${col}`}
                className="border-b border-r bg-muted/60 py-0.5 text-center text-[11px] font-medium text-muted-foreground"
                style={lit ? { backgroundColor: `${color}22`, color } : undefined}
              >
                {colName(col)}
              </div>
            );
          })}

          {Array.from({ length: rows }, (_, row) => (
            <GridRow
              key={row}
              row={row}
              cols={cols}
              cells={cells}
              values={values}
              color={color}
              selection={selection}
              active={active}
              highlights={highlights}
              flashes={flashes}
              decorate={decorate}
              fillPreview={fillPreview}
              showHandle={!!onFill && !!active && active.row === row && (canFill?.(active) ?? true)}
              activeCol={active?.col ?? -1}
            />
          ))}
        </div>
      </div>
      {caption && <div className="mt-1 text-xs text-muted-foreground">{caption}</div>}
    </div>
  );
}

function GridRow({
  row,
  cols,
  cells,
  values,
  color,
  selection,
  active,
  highlights,
  flashes,
  decorate,
  fillPreview,
  showHandle,
  activeCol,
}: {
  row: number;
  cols: number;
  cells: RawCells;
  values: Record<string, CellValue>;
  color: string;
  selection?: Box | null;
  active?: Cell | null;
  highlights?: { box: Box; color: string }[];
  flashes?: Record<string, number>;
  decorate?: SheetGridProps['decorate'];
  fillPreview?: Box | null;
  showHandle: boolean;
  activeCol: number;
}) {
  const rowLit = !!selection && row >= selection.r1 && row <= selection.r2;
  return (
    <>
      <div
        className="flex items-center justify-center border-b border-r bg-muted/60 text-[11px] font-medium tabular-nums text-muted-foreground"
        style={rowLit ? { backgroundColor: `${color}22`, color } : undefined}
      >
        {row + 1}
      </div>
      {Array.from({ length: cols }, (_, col) => {
        const address = addr(col, row);
        const value = values[address];
        const raw = cells[address];
        const selected = inBox(selection, col, row);
        const isActive = active?.col === col && active?.row === row;
        const extra = decorate?.(address);
        const shadows: string[] = [];
        for (const item of highlights ?? []) if (inBox(item.box, col, row)) shadows.push(...edgeShadows(item.box, col, row, item.color));
        if (fillPreview && inBox(fillPreview, col, row)) shadows.push(...edgeShadows(fillPreview, col, row, '#71717a', 2));
        if (selection && selected) shadows.push(...edgeShadows(selection, col, row, color, 2));

        const numeric = value?.t === 'num';
        /* Tekst wychodzi na pustą komórkę obok — jak w prawdziwym arkuszu, gdzie wniosek pisze się w jednej komórce. */
        const spills = value?.t === 'str' && col < cols - 1 && !cells[addr(col + 1, row)];
        const error = value?.t === 'err';
        const flash = flashes?.[address];

        return (
          <div
            key={address}
            role="gridcell"
            data-cell
            data-col={col}
            data-row={row}
            aria-label={`${address}: ${displayValue(value) || 'pusta'}`}
            className={cn(
              'relative flex h-7 min-w-0 cursor-cell items-center border-b border-r px-1.5',
              spills && 'z-[1] overflow-visible',
              numeric ? 'justify-end tabular-nums' : 'justify-start',
              error && 'justify-center text-[11px] font-semibold text-red-600',
              selected && !isActive && 'bg-[var(--sel)]',
              extra?.className
            )}
            style={
              {
                '--sel': `${color}14`,
                boxShadow: shadows.length ? shadows.join(', ') : undefined,
                ...extra?.style,
              } as React.CSSProperties
            }
            title={raw && raw.startsWith('=') ? raw : undefined}
          >
            <AnimatePresence>
              {flash !== undefined && (
                <motion.span
                  key={flash}
                  className="pointer-events-none absolute inset-0"
                  initial={{ backgroundColor: `${color}55` }}
                  animate={{ backgroundColor: `${color}00` }}
                  transition={{ duration: 1.1 }}
                />
              )}
            </AnimatePresence>
            <span className={cn('relative', spills ? 'whitespace-nowrap' : 'min-w-0 truncate')}>{displayValue(value)}</span>
            {extra?.badge}
            {showHandle && col === activeCol && (
              <span
                data-fill
                aria-label="Uchwyt wypełniania — przeciągnij, żeby skopiować"
                className="absolute -bottom-[5px] -right-[5px] z-10 h-[11px] w-[11px] cursor-crosshair border-2 border-white"
                style={{ backgroundColor: color, touchAction: 'none' }}
              />
            )}
          </div>
        );
      })}
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Pasek formuły                                                       */
/* ------------------------------------------------------------------ */

export interface FormulaBarProps {
  color: string;
  active: Cell | null;
  /** Zawartość aktywnej komórki (surowa — formuła, nie wynik). */
  content: string;
  /** `null` — pasek tylko pokazuje; tekst — trwa edycja. */
  draft: string | null;
  editable: boolean;
  inputRef?: React.RefObject<HTMLInputElement | null>;
  onDraft?: (text: string, caret: number) => void;
  onCaret?: (caret: number) => void;
  onCommit?: () => void;
  onCancel?: () => void;
  onStart?: () => void;
  /** Zamiast zawartości — zasłona (np. zanim dziecko zasłuży na zajrzenie do środka). */
  locked?: ReactNode;
  placeholder?: string;
}

export function FormulaBar({
  color,
  active,
  content,
  draft,
  editable,
  inputRef,
  onDraft,
  onCaret,
  onCommit,
  onCancel,
  onStart,
  locked,
  placeholder,
}: FormulaBarProps) {
  const editing = draft !== null;
  const text = editing ? draft : content;
  const references = useMemo(
    () => (text.startsWith('=') ? formulaReferences(text.slice(1)) : []),
    [text]
  );

  const key = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      onCommit?.();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel?.();
    }
  };

  return (
    <div className="flex items-stretch border bg-white text-sm dark:bg-zinc-950">
      <div className="flex w-12 shrink-0 items-center justify-center border-r font-mono text-xs font-semibold">
        {active ? addr(active.col, active.row) : ''}
      </div>
      <div
        className="flex w-8 shrink-0 items-center justify-center border-r font-serif text-sm italic"
        style={{ color }}
        aria-hidden
      >
        fx
      </div>
      {locked ? (
        <div className="flex min-h-9 min-w-0 flex-1 items-center px-2 text-xs text-muted-foreground">{locked}</div>
      ) : editable ? (
        <input
          ref={inputRef}
          value={text}
          placeholder={placeholder}
          onFocus={() => {
            if (!editing) onStart?.();
          }}
          onChange={(event) => onDraft?.(event.target.value, event.target.selectionStart ?? event.target.value.length)}
          onKeyUp={(event) => onCaret?.(event.currentTarget.selectionStart ?? 0)}
          onMouseUp={(event) => onCaret?.(event.currentTarget.selectionStart ?? 0)}
          onTouchEnd={(event) => onCaret?.(event.currentTarget.selectionStart ?? 0)}
          onKeyDown={key}
          inputMode="text"
          autoCapitalize="off"
          autoCorrect="off"
          spellCheck={false}
          aria-label="Pasek formuły"
          className="min-h-9 min-w-0 flex-1 bg-transparent px-2 font-mono text-[13px] outline-none"
        />
      ) : (
        <div className="flex min-h-9 min-w-0 flex-1 items-center overflow-x-auto whitespace-nowrap px-2 font-mono text-[13px]">
          <ColoredFormula text={text} references={references} />
        </div>
      )}
      {editing && (
        <div className="flex shrink-0 border-l">
          <button
            type="button"
            onPointerDown={(event) => event.preventDefault()}
            onClick={onCancel}
            aria-label="Anuluj"
            className="flex w-9 cursor-pointer items-center justify-center text-muted-foreground hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
          <button
            type="button"
            onPointerDown={(event) => event.preventDefault()}
            onClick={onCommit}
            aria-label="Zatwierdź"
            className="flex w-9 cursor-pointer items-center justify-center text-white"
            style={{ backgroundColor: color }}
          >
            <Check className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

/** Formuła z adresami w kolorach obwódek na siatce. */
export function ColoredFormula({
  text,
  references,
}: {
  text: string;
  references?: ReturnType<typeof formulaReferences>;
}) {
  if (!text.startsWith('=')) return <span>{text}</span>;
  const refs = references ?? formulaReferences(text.slice(1));
  const parts: ReactNode[] = ['='];
  let last = 0;
  const body = text.slice(1);
  refs.forEach((ref, index) => {
    parts.push(body.slice(last, ref.start));
    parts.push(
      <span key={index} className="font-semibold" style={{ color: REF_COLORS[index % REF_COLORS.length] }}>
        {body.slice(ref.start, ref.end)}
      </span>
    );
    last = ref.end;
  });
  parts.push(body.slice(last));
  return <span>{parts}</span>;
}

/** Klawisze, których na telefonie trzeba szukać po trzech ekranach klawiatury. */
export function SymbolPad({
  color,
  symbols,
  onInsert,
}: {
  color: string;
  symbols: string[];
  onInsert: (text: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1">
      {symbols.map((symbol) => (
        <button
          key={symbol}
          type="button"
          onPointerDown={(event) => event.preventDefault()}
          onClick={() => onInsert(symbol)}
          className="min-w-8 cursor-pointer border bg-white px-2 py-1 font-mono text-xs font-semibold transition-colors hover:bg-muted dark:bg-zinc-950"
          style={{ borderColor: `${color}55` }}
        >
          {symbol}
        </button>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Edycja: stan arkusza, wskazywanie, wypełnianie                      */
/* ------------------------------------------------------------------ */

/** Czy w tym miejscu formuły kliknięcie w komórkę ma dopisać adres. */
function pointSlot(text: string, caret: number): 'insert' | 'replace' | null {
  if (!text.startsWith('=')) return null;
  const before = text.slice(0, caret).replace(/\s+$/, '');
  if (before === '=') return 'insert';
  const tokens = tokenize(before.slice(1));
  const last = tokens[tokens.length - 1];
  if (!last) return 'insert';
  if (last.kind === 'ref') return 'replace';
  if (last.kind === 'op' || last.kind === 'lparen' || last.kind === 'sep' || last.kind === 'colon') return 'insert';
  return null;
}

export interface SheetEditorOptions {
  initial: RawCells;
  cols: number;
  rows: number;
  /** Czy dziecko może zmienić tę komórkę. */
  editable?: (cell: Cell) => boolean;
  /** Wywoływane po każdej zmianie zawartości (wpis, wypełnienie). */
  onChange?: (cells: RawCells, changed: string[]) => void;
  /**
   * Początek formuły dla komórki, w którą dziecko stuknęło (`raw` — co w niej teraz stoi;
   * `null` = zostaw zwykłe zaznaczenie). Edycja rusza od razu, z tym tekstem zamiast
   * zawartości, bez trafiania palcem w pasek formuły — zgłoszone 2026-10-17: stuknięcie
   * obok pola zostawiało arkusz poza edycją, a przeciąganie po pomiarach tylko je zaznaczało.
   */
  autoStart?: (cell: Cell, raw: string) => string | null;
  /**
   * Czy wskazanie zakresu (co najmniej dwóch komórek) w tej komórce kończy formułę: po
   * puszczeniu palca brakujące nawiasy domykają się, a wpis zatwierdza sam — bez szukania ✓.
   */
  commitOnPoint?: (cell: Cell) => boolean;
}

export function useSheetEditor({ initial, cols, rows, editable, onChange, autoStart, commitOnPoint }: SheetEditorOptions) {
  const [cells, setCellsState] = useState<RawCells>(initial);
  const [active, setActive] = useState<Cell | null>(null);
  const [selection, setSelection] = useState<Box | null>(null);
  const [draft, setDraftState] = useState<string | null>(null);
  const [fillPreview, setFillPreview] = useState<Box | null>(null);
  const [hint, setHint] = useState<string | null>(null);
  const [flashes, setFlashes] = useState<Record<string, number>>({});
  const caret = useRef(0);
  const pointSpan = useRef<{ start: number; end: number } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const autoStartRef = useRef(autoStart);
  autoStartRef.current = autoStart;
  const commitOnPointRef = useRef(commitOnPoint);
  commitOnPointRef.current = commitOnPoint;
  const cellsRef = useRef(cells);
  cellsRef.current = cells;
  /* Przy szybkim przeciąganiu kolejne ruchy przychodzą przed przerysowaniem — tekst formuły czytamy z refa. */
  const draftRef = useRef<string | null>(null);
  const setDraft = useCallback((text: string | null) => {
    draftRef.current = text;
    setDraftState(text);
  }, []);

  const values = useMemo(() => evaluateSheet(cells, {}), [cells]);
  const valuesRef = useRef(values);

  const canEdit = useCallback((cell: Cell | null) => !!cell && (editable?.(cell) ?? true), [editable]);

  /** Zmienia zawartość i zaznacza mignięciem każdą komórkę, której WYNIK się zmienił. */
  const apply = useCallback(
    (next: RawCells, changed: string[], flashChanged = false) => {
      const before = valuesRef.current;
      const after = evaluateSheet(next, {});
      valuesRef.current = after;
      const moved: Record<string, number> = {};
      for (const key of new Set([...Object.keys(before), ...Object.keys(after)])) {
        if (changed.includes(key) && !flashChanged) continue;
        if (displayValue(before[key]) !== displayValue(after[key])) moved[key] = Date.now() + Math.random();
      }
      if (Object.keys(moved).length) setFlashes((current) => ({ ...current, ...moved }));
      cellsRef.current = next;
      setCellsState(next);
      onChange?.(next, changed);
    },
    [onChange]
  );

  const setCell = useCallback(
    (address: string, raw: string) => {
      const next = { ...cellsRef.current };
      if (raw.trim() === '') delete next[address];
      else next[address] = raw;
      apply(next, [address]);
    },
    [apply]
  );

  const replaceAll = useCallback((next: RawCells) => apply(next, Object.keys(next)), [apply]);

  /*
   * Fokus wraca do paska w następnej klatce — ale tylko wtedy, gdy edycja wciąż trwa.
   * Spóźniona klatka po zatwierdzeniu (przeciągnięcie kończy się wpisem w tym samym
   * ruchu) dawała fokus polu, a to — przez `onFocus` — otwierało edycję od nowa:
   * znikał uchwyt wypełniania i arkusz stał w edycji, z której nie było widać wyjścia.
   */
  const focusInput = (at: number) => {
    requestAnimationFrame(() => {
      const input = inputRef.current;
      if (!input || draftRef.current === null) return;
      input.focus({ preventScroll: true });
      input.setSelectionRange(at, at);
    });
  };

  const commit = useCallback(() => {
    const text = draftRef.current;
    if (text === null || !active) return;
    setCell(addr(active.col, active.row), text.trim() === '=' ? '' : text);
    setDraft(null);
    setHint(null);
    pointSpan.current = null;
    inputRef.current?.blur();
  }, [active, setCell, setDraft]);

  const cancel = useCallback(() => {
    setDraft(null);
    setHint(null);
    pointSpan.current = null;
    inputRef.current?.blur();
  }, [setDraft]);

  const select = useCallback(
    (cell: Cell) => {
      setActive(cell);
      setSelection(boxOf(cell, cell));
      setDraft(null);
      setHint(null);
      pointSpan.current = null;
    },
    [setDraft]
  );

  /** Stuknięcie/przeciągnięcie po siatce: wskazywanie adresu albo zwykłe zaznaczenie. */
  const gesture = useCallback(
    (box: Box, origin: Cell, phase: GesturePhase) => {
      const current = draftRef.current;
      if (current !== null && current.startsWith('=')) {
        const text = current;
        let span = pointSpan.current;
        if (phase === 'start') {
          let at = Math.min(caret.current, text.length);
          let slot = pointSlot(text, at);
          /* Kursor wpadł w środek słowa (stuknięcie w pasek) — a za ostatnim znakiem adres pasuje: tam go wstawiamy. */
          if (!slot && at < text.length && pointSlot(text, text.length)) {
            at = text.length;
            slot = pointSlot(text, at);
          }
          if (!slot) {
            setHint('Najpierw wpisz znak działania, na przykład + albo *, a potem wskaż komórkę.');
            return;
          }
          let start = at;
          if (slot === 'replace') {
            const tokens = tokenize(text.slice(1, at));
            let first = tokens.length - 1;
            if (tokens[first - 1]?.kind === 'colon' && tokens[first - 2]?.kind === 'ref') first -= 2;
            start = 1 + tokens[first].start;
          }
          span = { start, end: at };
        }
        if (!span) return;
        /*
         * Wskazany adres to ODCINEK tekstu [start, end). Każdy ruch palca podmienia
         * ten sam odcinek — pozycji kursora w polu nie czytamy, bo przeglądarka
         * przesuwa ją sama przy każdej programowej zmianie tekstu, a ruchy
         * przychodzą szybciej niż przerysowanie.
         */
        const reference = boxText(box);
        const next = text.slice(0, span.start) + reference + text.slice(span.end);
        /* Samo stuknięcie w jedną komórkę nie kończy — to może być początek przeciągania na raty. */
        const range = box.r1 !== box.r2 || box.c1 !== box.c2;
        if (phase === 'end' && range && active && commitOnPointRef.current?.(active)) {
          const missing = (next.match(/\(/g)?.length ?? 0) - (next.match(/\)/g)?.length ?? 0);
          setCell(addr(active.col, active.row), next + ')'.repeat(Math.max(0, missing)));
          setDraft(null);
          setHint(null);
          pointSpan.current = null;
          inputRef.current?.blur();
          return;
        }
        pointSpan.current = { start: span.start, end: span.start + reference.length };
        caret.current = span.start + reference.length;
        setDraft(next);
        setHint(null);
        focusInput(caret.current);
        return;
      }

      if (current !== null && active) {
        /* Zwykły tekst w edycji — stuknięcie w inną komórkę zatwierdza wpis, jak w arkuszu. */
        setCell(addr(active.col, active.row), current);
        setDraft(null);
      }
      if (phase === 'start') setActive(origin);
      setSelection(box);
      setHint(null);
      if (phase !== 'start' || !canEdit(origin)) return;
      const prefix = autoStartRef.current?.(origin, cellsRef.current[addr(origin.col, origin.row)] ?? '');
      if (!prefix) return;
      setDraft(prefix);
      caret.current = prefix.length;
      pointSpan.current = null;
      focusInput(prefix.length);
    },
    [active, canEdit, setCell, setDraft]
  );

  /** Otwiera edycję aktywnej komórki. `false`, gdy nie ma czego otwierać albo edycja już trwa — szkicu nie nadpisujemy. */
  const startEdit = useCallback((): boolean => {
    if (!active || !canEdit(active) || draftRef.current !== null) return false;
    const current = cellsRef.current[addr(active.col, active.row)] ?? '';
    setDraft(current);
    caret.current = current.length;
    return true;
  }, [active, canEdit, setDraft]);

  const changeDraft = useCallback((text: string, at: number) => {
    setDraft(text);
    caret.current = at;
    pointSpan.current = null;
    setHint(null);
  }, [setDraft]);

  const insert = useCallback(
    (symbol: string) => {
      if (!active || !canEdit(active)) return;
      const editing = draftRef.current;
      const text = editing ?? cellsRef.current[addr(active.col, active.row)] ?? '';
      const at = editing === null ? text.length : Math.min(caret.current, text.length);
      const next = text.slice(0, at) + symbol + text.slice(at);
      caret.current = at + symbol.length;
      pointSpan.current = null;
      setDraft(next);
      focusInput(caret.current);
    },
    [active, canEdit, setDraft]
  );

  /** Uchwyt wypełniania: kopiuje zawartość komórki źródłowej z przesunięciem adresów. */
  const fill = useCallback(
    (from: Cell, to: Box, phase: GesturePhase) => {
      if (phase !== 'end') {
        setFillPreview(to);
        return;
      }
      setFillPreview(null);
      const source = cellsRef.current[addr(from.col, from.row)];
      if (source === undefined) return;
      const next = { ...cellsRef.current };
      const changed: string[] = [];
      for (let row = to.r1; row <= to.r2; row += 1) {
        for (let col = to.c1; col <= to.c2; col += 1) {
          if (col === from.col && row === from.row) continue;
          if (!canEdit({ col, row })) continue;
          const address = addr(col, row);
          next[address] = source.startsWith('=')
            ? `=${shiftFormula(source.slice(1), col - from.col, row - from.row)}`
            : source;
          changed.push(address);
        }
      }
      if (changed.length === 0) return;
      apply(next, changed, true);
      setSelection(to);
      setDraft(null);
    },
    [apply, canEdit, setDraft]
  );

  const content = active ? cells[addr(active.col, active.row)] ?? '' : '';
  const editingText = draft ?? content;
  const highlights = editingText.startsWith('=')
    ? formulaReferences(editingText.slice(1), rows).map((ref, index) => ({
        box: ref.box,
        color: REF_COLORS[index % REF_COLORS.length],
      }))
    : [];

  return {
    cells,
    values,
    active,
    selection,
    draft,
    hint,
    flashes,
    fillPreview,
    inputRef,
    content,
    highlights,
    cols,
    rows,
    setCell,
    replaceAll,
    select,
    gesture,
    startEdit,
    changeDraft,
    setCaret: (at: number) => {
      caret.current = at;
    },
    commit,
    cancel,
    insert,
    fill,
    canEdit,
    setSelection,
    setActive,
  };
}

export type SheetEditor = ReturnType<typeof useSheetEditor>;
