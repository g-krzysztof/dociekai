'use client';

import {
  useLayoutEffect,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { cn } from '@/lib/utils';
import {
  addColumn,
  addRow,
  duplicateBlock,
  editSpans,
  imageBlock,
  indexOfBlock,
  insertAfter,
  joinWithNext,
  joinWithPrevious,
  moveBlock,
  paintSpans,
  pasteText,
  removeBlock,
  removeColumn,
  removeRow,
  setCell,
  setList,
  splitBlock,
  tableBlock,
  textBlock,
  textOf,
  uniformPaint,
  updateBlock,
  type Align,
  type ImageBlock,
  type ListKind,
  type ParaStyle,
  type TableBlock,
  type TextBlock,
  type WriterBlock,
  type WriterPicture,
} from './model';
import { ImageView, TableView } from './objects-view';
import { TextView } from './text-view';
import { ALL_TOOLS, Toolbar, type TableOp, type WriterActions, type WriterFont, type WriterTool } from './toolbar';

/**
 * **MiniWriter** — edytor dokumentów w kursie. Dziecko formatuje w nim tekst tak,
 * jak w Wordzie albo LibreOffice, ale **na stronie**: nic nie każe wyjść z kursu i
 * niczego nie trzeba zapisywać ani wgrywać. Dokument, który z niego wychodzi
 * (`toDoc` z `model.ts`), czytają te same werdykty, które czytały pliki.
 *
 * Edytor **nie trzyma dokumentu** — stan zostaje w lekcji (`blocks` + `onChange`),
 * tak samo jak przy `TaskShell`: werdykt domyka się na bieżącym stanie lekcji.
 * `onChange` musi być zastosowany od razu (zwykłe `setState`), bo pole tekstowe
 * jest sterowane.
 *
 * Jak to działa i czego edytor **nie** robi, jest opisane przy `TextView`: kolor i
 * zakreślacz malują dowolny fragment, a krój, pogrubienie, kursywa, podkreślenie,
 * wyrównanie, styl i lista są własnością całego akapitu.
 */

export interface WriterPaste {
  /** Akapit, do którego wklejono. */
  id: string;
  text: string;
}

interface MiniWriterProps {
  color: string;
  blocks: WriterBlock[];
  onChange: (blocks: WriterBlock[]) => void;
  /** Które narzędzia są w pasku — domyślnie wszystkie. */
  tools?: readonly WriterTool[];
  fonts?: WriterFont[];
  pictures?: WriterPicture[];
  /** Dowód wklejenia: wołane przy każdym wklejeniu tekstu do akapitu. */
  onPaste?: (paste: WriterPaste) => void;
  label?: string;
  /** Wysokość kartki, po której zaczyna się przewijanie w jej wnętrzu. */
  maxHeight?: string;
}

/** Historia cofania przywiązana do konkretnej wersji dokumentu — zmiana z zewnątrz ją unieważnia. */
interface History {
  current: WriterBlock[];
  past: WriterBlock[][];
  /** Akapit, w którym trwa seria pisania (pisanie zbiera się w jeden krok cofania). */
  burst: { id: string; at: number } | null;
}

const BURST_MS = 1000;
const HISTORY_LIMIT = 60;

/** Punktor albo numer każdej pozycji listy; kolejne numerowane akapity liczą się razem. */
function markers(blocks: WriterBlock[]): Map<string, string> {
  const map = new Map<string, string>();
  let n = 0;
  for (const block of blocks) {
    if (block.type === 'text' && block.list === 'number') {
      n += 1;
      map.set(block.id, `${n}.`);
    } else {
      n = 0;
      if (block.type === 'text' && block.list === 'bullet') map.set(block.id, '•');
    }
  }
  return map;
}

export function MiniWriter({
  color,
  blocks,
  onChange,
  tools = ALL_TOOLS,
  fonts = [],
  pictures = [],
  onPaste,
  label = 'Dokument',
  maxHeight = 'min(60vh, 34rem)',
}: MiniWriterProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selected, setSelected] = useState<{ id: string; from: number; to: number } | null>(null);
  const [cell, setCellFocus] = useState<{ id: string; row: number; column: number } | null>(null);
  const [history, setHistory] = useState<History>({ current: blocks, past: [], burst: null });

  const fields = useRef(new Map<string, HTMLTextAreaElement>());
  const pendingFocus = useRef<{ id: string; from: number; to: number } | null>(null);

  const past = history.current === blocks ? history.past : [];
  const active = blocks.find((block) => block.id === activeId) ?? null;
  const activeText = active?.type === 'text' ? active : null;
  const toolSet = new Set(tools);

  /* Kursor i zaznaczenie po operacji, która przebudowała listę akapitów. */
  useLayoutEffect(() => {
    const focus = pendingFocus.current;
    if (!focus) return;
    pendingFocus.current = null;
    const element = fields.current.get(focus.id);
    if (!element) return;
    element.focus();
    element.setSelectionRange(focus.from, focus.to);
  });

  const commit = (
    next: WriterBlock[],
    options: { focus?: { id: string; offset: number }; typing?: string } = {}
  ) => {
    if (next === blocks) return;
    const now = Date.now();
    const continuing =
      options.typing !== undefined &&
      history.burst?.id === options.typing &&
      history.current === blocks &&
      now - history.burst.at < BURST_MS;
    const nextPast = continuing ? past : [...past, blocks].slice(-HISTORY_LIMIT);
    setHistory({
      current: next,
      past: nextPast,
      burst: options.typing !== undefined ? { id: options.typing, at: now } : null,
    });
    if (options.focus) {
      pendingFocus.current = { id: options.focus.id, from: options.focus.offset, to: options.focus.offset };
      setActiveId(options.focus.id);
    }
    onChange(next);
  };

  const undo = () => {
    const previous = past[past.length - 1];
    if (!previous) return;
    setHistory({ current: previous, past: past.slice(0, -1), burst: null });
    /* Cofnięcie potrafi zabrać akapit, w którym stał kursor — wtedy kursor idzie na jego miejsce. */
    if (activeId && !previous.some((block) => block.id === activeId)) {
      const target = previous[Math.min(Math.max(indexOfBlock(blocks, activeId), 0), previous.length - 1)];
      setActiveId(target.id);
      if (target.type === 'text') {
        const end = textOf(target.spans).length;
        pendingFocus.current = { id: target.id, from: end, to: end };
      }
    }
    onChange(previous);
  };

  /**
   * Po zmianie z listy rozwijanej pole tekstowe dostaje fokus z powrotem, z tym samym
   * zaznaczeniem. Tylko wtedy, gdy fokus nigdzie indziej nie trafił: dziecko bywa
   * szybsze niż klatka animacji i kliknięcie w inny akapit nie może zostać cofnięte.
   */
  const refocus = () => {
    if (!activeId) return;
    const element = fields.current.get(activeId);
    if (!element) return;
    const { selectionStart, selectionEnd } = element;
    requestAnimationFrame(() => {
      const now = document.activeElement;
      if (now && now !== document.body && !(now instanceof HTMLSelectElement)) return;
      element.focus({ preventScroll: true });
      element.setSelectionRange(selectionStart, selectionEnd);
    });
  };

  const patchActive = (patch: Partial<TextBlock>) => {
    if (!activeText) return;
    commit(updateBlock(blocks, activeText.id, patch));
    refocus();
  };

  const focusNeighbor = (id: string, direction: -1 | 1): boolean => {
    let index = indexOfBlock(blocks, id) + direction;
    while (index >= 0 && index < blocks.length && blocks[index].type !== 'text') index += direction;
    const target = blocks[index];
    const element = target ? fields.current.get(target.id) : undefined;
    if (!element) return false;
    element.focus();
    const at = direction === -1 ? element.value.length : 0;
    element.setSelectionRange(at, at);
    return true;
  };

  const selectionRange = (block: TextBlock) => {
    const length = textOf(block.spans).length;
    return selected && selected.id === block.id && selected.to > selected.from
      ? { from: selected.from, to: Math.min(selected.to, length), whole: false }
      : { from: 0, to: length, whole: true };
  };

  const actions: WriterActions = {
    undo,
    setStyle: (style: ParaStyle) => patchActive({ style }),
    toggle: (key) => activeText && patchActive({ [key]: !activeText[key] }),
    setAlign: (align: Align) => patchActive({ align }),
    setList: (kind: ListKind) => {
      if (!activeText) return;
      commit(blocks.map((block) => (block.id === activeText.id ? setList(activeText, kind) : block)));
      refocus();
    },
    setFont: (name) => patchActive({ font: name }),
    paint: (kind, value) => {
      if (!activeText) return;
      const range = selectionRange(activeText);
      commit(
        updateBlock(blocks, activeText.id, {
          spans: paintSpans(activeText.spans, range.from, range.to, { [kind]: value }),
        })
      );
      refocus();
    },
    insertParagraph: () => {
      const created = textBlock('');
      commit(insertAfter(blocks, activeId, created), { focus: { id: created.id, offset: 0 } });
    },
    insertImage: (pictureId) => {
      const created = imageBlock(pictureId);
      commit(insertAfter(blocks, activeId, created));
      setActiveId(created.id);
    },
    insertTable: () => {
      const created = tableBlock(3, 3);
      commit(insertAfter(blocks, activeId, created));
      setActiveId(created.id);
    },
    move: (by) => active && commit(moveBlock(blocks, active.id, by)),
    duplicate: () => active && commit(duplicateBlock(blocks, active.id)),
    remove: () => {
      if (!active || blocks.length < 2) return;
      const index = indexOfBlock(blocks, active.id);
      const next = removeBlock(blocks, active.id);
      setActiveId(next[Math.min(index, next.length - 1)]?.id ?? null);
      commit(next);
    },
    setWrap: (wrap) => active?.type === 'image' && commit(updateBlock(blocks, active.id, { wrap })),
    tableOp: (op: TableOp) => {
      if (active?.type !== 'table') return;
      const at = cell && cell.id === active.id ? cell : null;
      const row = at?.row ?? active.cells.length - 1;
      const column = at?.column ?? (active.cells[0]?.length ?? 1) - 1;
      const apply: Record<TableOp, (table: TableBlock) => TableBlock> = {
        'row+': addRow,
        'column+': addColumn,
        'row-': (table) => removeRow(table, row),
        'column-': (table) => removeColumn(table, column),
      };
      commit(blocks.map((block) => (block.id === active.id ? apply[op](active) : block)));
    },
  };

  const handleKey = (event: KeyboardEvent<HTMLTextAreaElement>, block: TextBlock) => {
    if (event.nativeEvent.isComposing) return;
    const element = event.currentTarget;
    const start = element.selectionStart;
    const end = element.selectionEnd;
    const length = element.value.length;
    const plain = !event.shiftKey && !event.ctrlKey && !event.metaKey && !event.altKey;

    if ((event.ctrlKey || event.metaKey) && !event.shiftKey && event.key.toLowerCase() === 'z') {
      event.preventDefault();
      undo();
      return;
    }

    if (event.key === 'Enter' && plain) {
      event.preventDefault();
      /* Zaznaczenie znika przy Enterze, tak jak przy pisaniu każdej innej litery. */
      const cut =
        start === end
          ? blocks
          : updateBlock(blocks, block.id, {
              spans: editSpans(block.spans, element.value.slice(0, start) + element.value.slice(end)),
            });
      const result = splitBlock(cut, block.id, start);
      commit(result.blocks, { focus: result.focus });
      return;
    }

    if (event.key === 'Backspace' && plain && start === 0 && end === 0) {
      const result = joinWithPrevious(blocks, block.id);
      if (result) {
        event.preventDefault();
        commit(result.blocks, { focus: result.focus });
      }
      return;
    }

    if (event.key === 'Delete' && plain && start === length && end === length) {
      const result = joinWithNext(blocks, block.id);
      if (result) {
        event.preventDefault();
        commit(result.blocks, { focus: result.focus });
      }
      return;
    }

    if (plain && start === 0 && end === 0 && (event.key === 'ArrowLeft' || event.key === 'ArrowUp')) {
      if (focusNeighbor(block.id, -1)) event.preventDefault();
    } else if (
      plain &&
      start === length &&
      end === length &&
      (event.key === 'ArrowRight' || event.key === 'ArrowDown')
    ) {
      if (focusNeighbor(block.id, 1)) event.preventDefault();
    }
  };

  const handlePaste = (event: ClipboardEvent<HTMLTextAreaElement>, block: TextBlock) => {
    const text = event.clipboardData.getData('text/plain');
    if (!text) return;
    onPaste?.({ id: block.id, text });
    /* Jedna linia trafia do pola tak, jak zawsze; kilka linii to kilka akapitów. */
    if (!/[\r\n]/.test(text.replace(/[\r\n]+$/, ''))) return;
    event.preventDefault();
    const element = event.currentTarget;
    const result = pasteText(blocks, block.id, element.selectionStart, element.selectionEnd, text);
    commit(result.blocks, { focus: result.focus });
  };

  const handleText = (id: string, value: string) => {
    const block = blocks.find((item) => item.id === id);
    if (!block || block.type !== 'text') return;
    commit(updateBlock(blocks, id, { spans: editSpans(block.spans, value) }), { typing: id });
  };

  const handleSelection = (id: string, from: number, to: number) => {
    setSelected((old) => (old && old.id === id && old.from === from && old.to === to ? old : { id, from, to }));
  };

  /* Klik w pustą część kartki pod dokumentem stawia kursor na końcu ostatniego akapitu. */
  const clickBelow = () => {
    const last = blocks[blocks.length - 1];
    if (last?.type === 'text') {
      const element = fields.current.get(last.id);
      element?.focus();
      const at = element?.value.length ?? 0;
      element?.setSelectionRange(at, at);
      return;
    }
    const created = textBlock('');
    commit([...blocks, created], { focus: { id: created.id, offset: 0 } });
  };

  const numbers = markers(blocks);
  const familyOf = (name: string | null) => fonts.find((font) => font.name === name)?.css;

  const renderText = (block: TextBlock, index: number): ReactNode => (
    <TextView
      key={block.id}
      block={block}
      index={index}
      marker={numbers.get(block.id) ?? null}
      active={block.id === activeId}
      color={color}
      family={familyOf(block.font)}
      register={(id, element) => {
        if (element) fields.current.set(id, element);
        else fields.current.delete(id);
      }}
      onActivate={setActiveId}
      onText={handleText}
      onKey={handleKey}
      onSelection={handleSelection}
      onPaste={handlePaste}
    />
  );

  const renderImage = (block: ImageBlock) => (
    <ImageView
      key={block.id}
      block={block}
      picture={pictures.find((picture) => picture.id === block.picture)}
      active={block.id === activeId}
      color={color}
      onActivate={setActiveId}
    />
  );

  const items: ReactNode[] = [];
  for (let i = 0; i < blocks.length; i += 1) {
    const block = blocks[i];
    const next = blocks[i + 1];
    if (block.type === 'text') items.push(renderText(block, i));
    else if (block.type === 'image') {
      /* „Tekst opływa obraz” oglądamy jako tekst obok obrazu; „w wierszu” — jako obraz w osobnej linii. */
      if (block.wrap === 'float' && next?.type === 'text') {
        items.push(
          <div key={block.id} className="flex items-start gap-3">
            {renderImage(block)}
            <div className="min-w-0 flex-1">{renderText(next, i + 1)}</div>
          </div>
        );
        i += 1;
      } else items.push(renderImage(block));
    } else
      items.push(
        <TableView
          key={block.id}
          block={block}
          active={block.id === activeId}
          color={color}
          onActivate={setActiveId}
          onCell={(id, row, column, value) =>
            commit(blocks.map((item) => (item.id === id && item.type === 'table' ? setCell(item, row, column, value) : item)), {
              typing: `${id}:${row}:${column}`,
            })
          }
          onFocusCell={(id, row, column) => setCellFocus({ id, row, column })}
        />
      );
  }

  const range = activeText ? selectionRange(activeText) : null;
  const paint = activeText && range ? (uniformPaint(activeText.spans, range.from, range.to) ?? { color: undefined, highlight: undefined }) : { color: undefined, highlight: undefined };

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <Toolbar
        color={color}
        tools={toolSet}
        active={active}
        hasSelection={range !== null && !range.whole}
        fonts={fonts}
        pictures={pictures}
        canUndo={past.length > 0}
        canRemove={blocks.length > 1}
        paint={paint}
        actions={actions}
      />
      <div
        role="group"
        aria-label={label}
        className={cn('overflow-y-auto bg-white px-4 py-3 text-zinc-900 sm:px-6 sm:py-4')}
        style={{ maxHeight }}
      >
        {items}
        <div aria-hidden className="min-h-10 cursor-text" onClick={clickBelow} />
      </div>
    </div>
  );
}
