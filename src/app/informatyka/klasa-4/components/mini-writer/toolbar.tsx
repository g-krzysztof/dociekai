'use client';

import { useState, type ReactNode } from 'react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  ArrowDown,
  ArrowUp,
  Bold,
  Copy,
  ImagePlus,
  Italic,
  List,
  ListOrdered,
  Minus,
  Pilcrow,
  Plus,
  Table2,
  Trash2,
  Underline,
  Undo2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Align, ImageBlock, ListKind, ParaStyle, WriterBlock, WriterPicture } from './model';

/** Narzędzia paska — lekcja włącza tylko te, których uczy jej blok. */
export type WriterTool =
  | 'undo'
  | 'style'
  | 'font'
  | 'emphasis'
  | 'align'
  | 'list'
  | 'color'
  | 'highlight'
  | 'insert'
  | 'arrange';

export const ALL_TOOLS: readonly WriterTool[] = [
  'undo',
  'style',
  'font',
  'emphasis',
  'align',
  'list',
  'color',
  'highlight',
  'insert',
  'arrange',
];

/** Krój czcionki na liście: nazwa dla dziecka i rodzina CSS, którą ją rysujemy. */
export interface WriterFont {
  name: string;
  css: string;
}

export interface Swatch {
  name: string;
  /** `null` — zdjęcie barwy. */
  value: string | null;
}

export const TEXT_COLORS: Swatch[] = [
  { name: 'czarny', value: null },
  { name: 'czerwony', value: '#dc2626' },
  { name: 'pomarańczowy', value: '#ea580c' },
  { name: 'zielony', value: '#16a34a' },
  { name: 'niebieski', value: '#2563eb' },
  { name: 'fioletowy', value: '#9333ea' },
];

export const HIGHLIGHTS: Swatch[] = [
  { name: 'brak', value: null },
  { name: 'żółty', value: '#fde047' },
  { name: 'zielony', value: '#86efac' },
  { name: 'różowy', value: '#f9a8d4' },
  { name: 'niebieski', value: '#93c5fd' },
];

export type TableOp = 'row+' | 'column+' | 'row-' | 'column-';

export interface WriterActions {
  undo: () => void;
  setStyle: (style: ParaStyle) => void;
  toggle: (key: 'bold' | 'italic' | 'underline') => void;
  setAlign: (align: Align) => void;
  setList: (kind: ListKind) => void;
  setFont: (name: string | null) => void;
  paint: (kind: 'color' | 'highlight', value: string | null) => void;
  insertParagraph: () => void;
  insertImage: (pictureId: string) => void;
  insertTable: () => void;
  move: (by: -1 | 1) => void;
  duplicate: () => void;
  remove: () => void;
  setWrap: (wrap: ImageBlock['wrap']) => void;
  tableOp: (op: TableOp) => void;
}

const STYLE_OPTIONS: { value: ParaStyle; label: string }[] = [
  { value: 'normal', label: 'Zwykły tekst' },
  { value: 'title', label: 'Tytuł' },
  { value: 'h1', label: 'Nagłówek 1' },
  { value: 'h2', label: 'Nagłówek 2' },
  { value: 'h3', label: 'Nagłówek 3' },
];

const ALIGNS: { value: Align; label: string; icon: ReactNode }[] = [
  { value: 'left', label: 'Do lewej', icon: <AlignLeft className="h-4 w-4" aria-hidden /> },
  { value: 'center', label: 'Wyśrodkuj', icon: <AlignCenter className="h-4 w-4" aria-hidden /> },
  { value: 'right', label: 'Do prawej', icon: <AlignRight className="h-4 w-4" aria-hidden /> },
  { value: 'justify', label: 'Wyjustuj', icon: <AlignJustify className="h-4 w-4" aria-hidden /> },
];

function Group({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-1">
      {children}
    </div>
  );
}

function IconButton({
  label,
  pressed,
  disabled,
  color,
  onClick,
  children,
}: {
  label: string;
  pressed?: boolean;
  disabled?: boolean;
  color: string;
  onClick: () => void;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      aria-pressed={pressed}
      disabled={disabled}
      onClick={onClick}
      className={cn(
        'inline-flex h-9 min-w-9 items-center justify-center gap-1.5 border px-2 text-sm transition-colors',
        'disabled:cursor-not-allowed disabled:opacity-40',
        !disabled && !pressed && 'hover:bg-black/5 dark:hover:bg-white/5'
      )}
      style={
        pressed
          ? { borderColor: color, backgroundColor: `${color}22`, color }
          : undefined
      }
    >
      {children}
    </button>
  );
}

function Swatches({
  label,
  items,
  current,
  disabled,
  onPick,
}: {
  label: string;
  items: Swatch[];
  current: string | null | undefined;
  disabled: boolean;
  onPick: (value: string | null) => void;
}) {
  return (
    <div role="group" aria-label={label} className="flex shrink-0 items-center gap-1">
      {items.map((item) => (
        <button
          key={item.name}
          type="button"
          disabled={disabled}
          aria-label={`${label}: ${item.name}`}
          title={`${label}: ${item.name}`}
          aria-pressed={current === item.value}
          onClick={() => onPick(item.value)}
          className={cn(
            'relative h-7 w-7 border-2 transition-transform disabled:cursor-not-allowed disabled:opacity-40',
            current === item.value ? 'border-zinc-900 dark:border-white' : 'border-black/20',
            !disabled && 'hover:scale-110'
          )}
          style={{ backgroundColor: item.value ?? undefined }}
        >
          {item.value === null && (
            <span
              aria-hidden
              className="absolute inset-0 flex items-center justify-center bg-white text-xs font-bold text-zinc-900"
            >
              ×
            </span>
          )}
        </button>
      ))}
    </div>
  );
}

interface ToolbarProps {
  color: string;
  tools: ReadonlySet<WriterTool>;
  active: WriterBlock | null;
  /** W aktywnym akapicie zaznaczono fragment tekstu. */
  hasSelection: boolean;
  fonts: WriterFont[];
  pictures: WriterPicture[];
  canUndo: boolean;
  canRemove: boolean;
  /** Kolor i zakreślacz zaznaczenia (albo całego akapitu) — do zaznaczenia aktywnej próbki. */
  paint: { color: string | null | undefined; highlight: string | null | undefined };
  actions: WriterActions;
}

export function Toolbar({
  color,
  tools,
  active,
  hasSelection,
  fonts,
  pictures,
  canUndo,
  canRemove,
  paint,
  actions,
}: ToolbarProps) {
  const [picking, setPicking] = useState(false);
  const text = active?.type === 'text' ? active : null;
  const has = (tool: WriterTool) => tools.has(tool);

  return (
    <div
      role="toolbar"
      aria-label="Formatowanie dokumentu"
      /* Przyciski nie odbierają fokusu polu tekstowemu — inaczej zaznaczenie znikałoby przed kliknięciem. */
      onMouseDown={(event) => {
        if (!(event.target instanceof Element) || !event.target.closest('select')) event.preventDefault();
      }}
      className="border-b bg-muted/30 p-2"
    >
      {/* Na telefonie jeden wiersz przewijany palcem; od `sm` narzędzia zawijają się i widać je wszystkie. */}
      <div className="-mx-2 flex flex-nowrap items-center gap-x-4 gap-y-2 overflow-x-auto px-2 pb-1 sm:mx-0 sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-0">
        {has('undo') && (
          <Group label="Cofanie">
            <IconButton label="Cofnij" color={color} disabled={!canUndo} onClick={actions.undo}>
              <Undo2 className="h-4 w-4" aria-hidden />
            </IconButton>
          </Group>
        )}

        {has('style') && (
          <select
            aria-label="Styl akapitu"
            disabled={!text}
            value={text?.style ?? 'normal'}
            onChange={(event) => actions.setStyle(event.currentTarget.value as ParaStyle)}
            className="h-9 shrink-0 border bg-background px-2 text-sm disabled:opacity-40"
          >
            {STYLE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        )}

        {has('font') && fonts.length > 0 && (
          <select
            aria-label="Krój czcionki"
            disabled={!text}
            value={text?.font ?? ''}
            onChange={(event) => actions.setFont(event.currentTarget.value || null)}
            className="h-9 max-w-40 shrink-0 border bg-background px-2 text-sm disabled:opacity-40"
          >
            <option value="">Domyślny krój</option>
            {fonts.map((font) => (
              <option key={font.name} value={font.name}>
                {font.name}
              </option>
            ))}
          </select>
        )}

        {has('emphasis') && (
          <Group label="Wyróżnienie całego akapitu">
            <IconButton
              label="Pogrubienie akapitu"
              color={color}
              disabled={!text}
              pressed={text?.bold ?? false}
              onClick={() => actions.toggle('bold')}
            >
              <Bold className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Kursywa akapitu"
              color={color}
              disabled={!text}
              pressed={text?.italic ?? false}
              onClick={() => actions.toggle('italic')}
            >
              <Italic className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Podkreślenie akapitu"
              color={color}
              disabled={!text}
              pressed={text?.underline ?? false}
              onClick={() => actions.toggle('underline')}
            >
              <Underline className="h-4 w-4" aria-hidden />
            </IconButton>
          </Group>
        )}

        {has('align') && (
          <Group label="Wyrównanie">
            {ALIGNS.map((item) => (
              <IconButton
                key={item.value}
                label={item.label}
                color={color}
                disabled={!text}
                pressed={(text?.align ?? 'left') === item.value}
                onClick={() => actions.setAlign(item.value)}
              >
                {item.icon}
              </IconButton>
            ))}
          </Group>
        )}

        {has('list') && (
          <Group label="Lista">
            <IconButton
              label="Lista punktowana"
              color={color}
              disabled={!text}
              pressed={text?.list === 'bullet'}
              onClick={() => actions.setList('bullet')}
            >
              <List className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton
              label="Lista numerowana"
              color={color}
              disabled={!text}
              pressed={text?.list === 'number'}
              onClick={() => actions.setList('number')}
            >
              <ListOrdered className="h-4 w-4" aria-hidden />
            </IconButton>
          </Group>
        )}

        {has('color') && (
          <Swatches
            label="Kolor liter"
            items={TEXT_COLORS}
            current={paint.color}
            disabled={!text}
            onPick={(value) => actions.paint('color', value)}
          />
        )}
        {has('highlight') && (
          <Swatches
            label="Zakreślacz"
            items={HIGHLIGHTS}
            current={paint.highlight}
            disabled={!text}
            onPick={(value) => actions.paint('highlight', value)}
          />
        )}

        {has('insert') && (
          <Group label="Wstaw">
            <IconButton label="Wstaw akapit" color={color} onClick={actions.insertParagraph}>
              <Pilcrow className="h-4 w-4" aria-hidden />
              <Plus className="h-3 w-3" aria-hidden />
            </IconButton>
            {pictures.length > 0 && (
              <IconButton
                label="Wstaw obraz"
                color={color}
                pressed={picking}
                onClick={() => setPicking((open) => !open)}
              >
                <ImagePlus className="h-4 w-4" aria-hidden />
              </IconButton>
            )}
            <IconButton label="Wstaw tabelę" color={color} onClick={actions.insertTable}>
              <Table2 className="h-4 w-4" aria-hidden />
            </IconButton>
          </Group>
        )}

        {has('arrange') && (
          <Group label="Akapit, obraz albo tabela">
            <IconButton label="Przesuń wyżej" color={color} disabled={!active} onClick={() => actions.move(-1)}>
              <ArrowUp className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton label="Przesuń niżej" color={color} disabled={!active} onClick={() => actions.move(1)}>
              <ArrowDown className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton label="Powiel" color={color} disabled={!active} onClick={actions.duplicate}>
              <Copy className="h-4 w-4" aria-hidden />
            </IconButton>
            <IconButton label="Usuń" color={color} disabled={!active || !canRemove} onClick={actions.remove}>
              <Trash2 className="h-4 w-4" aria-hidden />
            </IconButton>
          </Group>
        )}
      </div>

      {/* Drugi wiersz ma stałą wysokość: przełączanie się między blokami nie ma przesuwać kartki. */}
      <div className="mt-2 flex min-h-9 flex-wrap items-center gap-2 text-sm text-muted-foreground">
        {picking ? (
          <>
            <span className="font-medium text-foreground">Wybierz obraz:</span>
            {pictures.map((picture) => (
              <button
                key={picture.id}
                type="button"
                aria-label={`Wstaw obraz: ${picture.name}`}
                onClick={() => {
                  actions.insertImage(picture.id);
                  setPicking(false);
                }}
                className="border bg-white p-0.5 hover:border-zinc-900"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={picture.src} alt="" draggable={false} className="h-12 w-auto" />
              </button>
            ))}
            <button type="button" onClick={() => setPicking(false)} className="underline">
              Anuluj
            </button>
          </>
        ) : active?.type === 'image' ? (
          <>
            <span className="font-medium text-foreground">Obraz:</span>
            <IconButton
              label="Obraz w wierszu"
              color={color}
              pressed={active.wrap === 'inline'}
              onClick={() => actions.setWrap('inline')}
            >
              <span className="px-1">W wierszu</span>
            </IconButton>
            <IconButton
              label="Tekst opływa obraz"
              color={color}
              pressed={active.wrap === 'float'}
              onClick={() => actions.setWrap('float')}
            >
              <span className="px-1">Tekst obok</span>
            </IconButton>
          </>
        ) : active?.type === 'table' ? (
          <>
            <span className="font-medium text-foreground">Tabela:</span>
            <IconButton label="Dodaj wiersz" color={color} onClick={() => actions.tableOp('row+')}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              <span>wiersz</span>
            </IconButton>
            <IconButton label="Dodaj kolumnę" color={color} onClick={() => actions.tableOp('column+')}>
              <Plus className="h-3.5 w-3.5" aria-hidden />
              <span>kolumna</span>
            </IconButton>
            <IconButton label="Usuń wiersz" color={color} onClick={() => actions.tableOp('row-')}>
              <Minus className="h-3.5 w-3.5" aria-hidden />
              <span>wiersz</span>
            </IconButton>
            <IconButton label="Usuń kolumnę" color={color} onClick={() => actions.tableOp('column-')}>
              <Minus className="h-3.5 w-3.5" aria-hidden />
              <span>kolumna</span>
            </IconButton>
          </>
        ) : text ? (
          <span className="text-xs sm:text-sm">
            {hasSelection
              ? 'Kolor i zakreślacz malują zaznaczone litery.'
              : 'Bez zaznaczenia kolor maluje cały akapit — zaznacz fragment, żeby pomalować tylko jego.'}
            <span className="hidden sm:inline">
              {' '}
              Styl, krój, pogrubienie i wyrównanie dotyczą całego akapitu.
            </span>
          </span>
        ) : (
          <span className="text-xs sm:text-sm">Kliknij akapit, obraz albo tabelę, żeby je sformatować.</span>
        )}
      </div>
    </div>
  );
}
