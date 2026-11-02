import {
  BULLET,
  finishDoc,
  headingLevel,
  type DocContent,
  type DocParagraph,
  type DocRun,
  type DocTable,
} from '../../lib/doc-model';

/**
 * Model edytora dokumentów w kursie — **czyste funkcje, zero Reacta**.
 *
 * Edytor jest blokowy: dokument to lista akapitów, obrazów i tabel. Akapit ma
 * własności **całego akapitu** (styl, wyrównanie, lista, krój, pogrubienie,
 * kursywa, podkreślenie) i **kolor zaznaczonych liter** (`Span`). Tylko kolor i
 * zakreślacz są przypisywane do fragmentu — z rozmysłu: tekst pisze się w
 * zwykłym `<textarea>` (dotyk, klawiatury ekranowe i podpowiedzi działają tak,
 * jak dziecko jest przyzwyczajone), a barwy rysuje warstwa pod spodem. Kolor nie
 * zmienia szerokości liter, więc obie warstwy leżą dokładnie na sobie; krój i
 * pogrubienie zmieniłyby — dlatego są własnością akapitu, a nie fragmentu.
 *
 * Wyjście, `toDoc`, jest tym samym modelem, który daje parser plików
 * (`lib/doc-model.ts`), więc sędziowie zadań nie widzą różnicy.
 */

/* ------------------------------------------------------------------ */
/* Typy                                                                */
/* ------------------------------------------------------------------ */

/** Fragment tekstu z barwą. Sąsiednie fragmenty o tych samych barwach są zawsze sklejone. */
export interface Span {
  text: string;
  color: string | null;
  highlight: string | null;
}

export type ParaStyle = 'normal' | 'title' | 'h1' | 'h2' | 'h3';
export type ListKind = 'bullet' | 'number';
export type Align = 'left' | 'center' | 'right' | 'justify';

export interface TextBlock {
  id: string;
  type: 'text';
  spans: Span[];
  style: ParaStyle;
  align: Align | null;
  list: ListKind | null;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  font: string | null;
}

export interface ImageBlock {
  id: string;
  type: 'image';
  /** Identyfikator obrazu z listy `pictures` podanej edytorowi. */
  picture: string;
  wrap: 'inline' | 'float';
}

export interface TableBlock {
  id: string;
  type: 'table';
  cells: string[][];
}

export type WriterBlock = TextBlock | ImageBlock | TableBlock;

export interface WriterPicture {
  id: string;
  /** Adres obrazu w stronie (`/…` albo `data:`). */
  src: string;
  /** Nazwa obrazu — trafia do `DocContent.images` i do opisu alternatywnego. */
  name: string;
}

/** Nazwy stylów tak, jak je widzi dziecko i jak zapisuje je model dokumentu. */
export const STYLE_NAMES: Record<ParaStyle, string | null> = {
  normal: null,
  title: 'Tytuł',
  h1: 'Nagłówek 1',
  h2: 'Nagłówek 2',
  h3: 'Nagłówek 3',
};

/* ------------------------------------------------------------------ */
/* Tworzenie                                                           */
/* ------------------------------------------------------------------ */

let counter = 0;

/** Kolejny identyfikator bloku. Rosnący licznik: stabilny między renderami, bez losowości. */
export function newId(): string {
  counter += 1;
  return `b${counter}`;
}

export function textBlock(text = '', patch: Partial<Omit<TextBlock, 'id' | 'type' | 'spans'>> = {}): TextBlock {
  return {
    id: newId(),
    type: 'text',
    spans: text ? [{ text, color: null, highlight: null }] : [],
    style: 'normal',
    align: null,
    list: null,
    bold: false,
    italic: false,
    underline: false,
    font: null,
    ...patch,
  };
}

export function imageBlock(picture: string, wrap: ImageBlock['wrap'] = 'inline'): ImageBlock {
  return { id: newId(), type: 'image', picture, wrap };
}

export function tableBlock(rows: number, columns: number): TableBlock {
  return {
    id: newId(),
    type: 'table',
    cells: Array.from({ length: rows }, () => Array.from({ length: columns }, () => '')),
  };
}

/**
 * Surowy tekst na akapity: jedna linia to jeden akapit, **puste linie zostają
 * pustymi akapitami** (to materiał do poprawiania, nie do wygładzania) i bez
 * żadnego formatowania.
 */
export function blocksFromText(raw: string): TextBlock[] {
  return raw.split(/\r?\n/).map((line) => textBlock(line));
}

/* ------------------------------------------------------------------ */
/* Tekst i fragmenty                                                   */
/* ------------------------------------------------------------------ */

export function textOf(spans: Span[]): string {
  return spans.map((span) => span.text).join('');
}

const same = (a: Span, b: Span) => a.color === b.color && a.highlight === b.highlight;

/** Skleja sąsiednie fragmenty o tych samych barwach i wyrzuca puste. */
export function tidy(spans: Span[]): Span[] {
  const out: Span[] = [];
  for (const span of spans) {
    if (span.text === '') continue;
    const last = out[out.length - 1];
    if (last && same(last, span)) out[out.length - 1] = { ...last, text: last.text + span.text };
    else out.push({ ...span });
  }
  return out;
}

/** Wycina zakres `[from, to)` z listy fragmentów. */
export function sliceSpans(spans: Span[], from: number, to: number): Span[] {
  const out: Span[] = [];
  let at = 0;
  for (const span of spans) {
    const start = Math.max(from, at);
    const end = Math.min(to, at + span.text.length);
    if (end > start) out.push({ ...span, text: span.text.slice(start - at, end - at) });
    at += span.text.length;
  }
  return out;
}

/** Barwa fragmentu, w którym stoi znak o podanym numerze (albo ostatniego, gdy numer jest poza tekstem). */
function styleAt(spans: Span[], index: number): Pick<Span, 'color' | 'highlight'> {
  let at = 0;
  for (const span of spans) {
    if (index < at + span.text.length) return { color: span.color, highlight: span.highlight };
    at += span.text.length;
  }
  const last = spans[spans.length - 1];
  return last ? { color: last.color, highlight: last.highlight } : { color: null, highlight: null };
}

/**
 * Zmiana tekstu w `<textarea>` na zmianę fragmentów. Wspólny początek i koniec
 * starego i nowego tekstu zostają z barwami, a to, co wpisane w środku, dziedziczy
 * barwę znaku **przed** kursorem — tak jak w każdym edytorze: pisząc w środku
 * zielonej frazy, piszesz na zielono.
 */
export function editSpans(spans: Span[], next: string): Span[] {
  const old = textOf(spans);
  if (old === next) return spans;
  let head = 0;
  const limit = Math.min(old.length, next.length);
  while (head < limit && old[head] === next[head]) head += 1;
  let tail = 0;
  while (
    tail < limit - head &&
    old[old.length - 1 - tail] === next[next.length - 1 - tail]
  )
    tail += 1;

  const inserted = next.slice(head, next.length - tail);
  const inherit = styleAt(spans, Math.max(0, head - 1));
  return tidy([
    ...sliceSpans(spans, 0, head),
    ...(inserted ? [{ text: inserted, ...inherit }] : []),
    ...sliceSpans(spans, old.length - tail, old.length),
  ]);
}

/** Nadaje zakresowi `[from, to)` barwę (albo ją zdejmuje, gdy wartość to `null`). */
export function paintSpans(
  spans: Span[],
  from: number,
  to: number,
  patch: Partial<Pick<Span, 'color' | 'highlight'>>
): Span[] {
  if (to <= from) return spans;
  const length = textOf(spans).length;
  const a = Math.max(0, from);
  const b = Math.min(length, to);
  if (b <= a) return spans;
  return tidy([
    ...sliceSpans(spans, 0, a),
    ...sliceSpans(spans, a, b).map((span) => ({ ...span, ...patch })),
    ...sliceSpans(spans, b, length),
  ]);
}

/** Barwa, którą ma cały zakres — `undefined`, gdy zakres jest pomieszany albo pusty. */
export function uniformPaint(
  spans: Span[],
  from: number,
  to: number
): Pick<Span, 'color' | 'highlight'> | undefined {
  const parts = sliceSpans(spans, from, to);
  if (parts.length === 0) return undefined;
  const [first, ...rest] = parts;
  return rest.every((part) => same(first, part))
    ? { color: first.color, highlight: first.highlight }
    : undefined;
}

/* ------------------------------------------------------------------ */
/* Operacje na dokumencie                                              */
/* ------------------------------------------------------------------ */

export function indexOfBlock(blocks: WriterBlock[], id: string): number {
  return blocks.findIndex((block) => block.id === id);
}

export function updateBlock(
  blocks: WriterBlock[],
  id: string,
  patch: Partial<TextBlock> | Partial<ImageBlock> | Partial<TableBlock>
): WriterBlock[] {
  return blocks.map((block) => (block.id === id ? ({ ...block, ...patch } as WriterBlock) : block));
}

/**
 * Enter: dwa akapity. W środku nagłówka oba zostają nagłówkami; **na końcu**
 * nagłówka dalej pisze się zwykły tekst. Lista rodzi kolejną pozycję listy, a
 * Enter w **pustej** pozycji listy kończy listę — tak jak w Wordzie.
 */
export function splitBlock(
  blocks: WriterBlock[],
  id: string,
  at: number
): { blocks: WriterBlock[]; focus: { id: string; offset: number } } {
  const index = indexOfBlock(blocks, id);
  const block = blocks[index];
  if (!block || block.type !== 'text') return { blocks, focus: { id, offset: at } };

  if (block.list && block.spans.length === 0)
    return {
      blocks: updateBlock(blocks, id, { list: null }),
      focus: { id, offset: 0 },
    };

  const length = textOf(block.spans).length;
  const after: TextBlock = {
    ...block,
    id: newId(),
    spans: sliceSpans(block.spans, at, length),
    ...(block.style === 'normal' || at < length
      ? {}
      : /* Enter na końcu tytułu: dalej pisze się zwykły tekst, bez ozdób, które dostał tytuł. */
        {
          style: 'normal' as const,
          bold: false,
          italic: false,
          underline: false,
          align: null,
          font: null,
          list: null,
        }),
  };
  const before: TextBlock = { ...block, spans: sliceSpans(block.spans, 0, at) };
  return {
    blocks: [...blocks.slice(0, index), before, after, ...blocks.slice(index + 1)],
    focus: { id: after.id, offset: 0 },
  };
}

/**
 * Wklejenie tekstu z kilku linii. Pierwsza linia trafia w miejsce zaznaczenia,
 * każda następna to **nowy akapit**, a ogon akapitu (to, co stało za zaznaczeniem)
 * dokleja się do ostatniej — tak zachowuje się każdy edytor. Wklejona linia
 * dziedziczy barwę znaku przed kursorem, jak przy pisaniu.
 */
export function pasteText(
  blocks: WriterBlock[],
  id: string,
  from: number,
  to: number,
  raw: string
): { blocks: WriterBlock[]; focus: { id: string; offset: number } } {
  const index = indexOfBlock(blocks, id);
  const block = blocks[index];
  const lines = raw.replace(/\r/g, '').split('\n');
  if (!block || block.type !== 'text' || lines.length < 2)
    return { blocks, focus: { id, offset: from } };

  const length = textOf(block.spans).length;
  const head = sliceSpans(block.spans, 0, from);
  const tail = sliceSpans(block.spans, to, length);
  const inherit = styleAt(block.spans, Math.max(0, from - 1));
  const plain = { color: null, highlight: null };
  const own = (text: string, spans: Span[]): Span[] => tidy([...spans, ...(text ? [{ text, ...plain }] : [])]);

  const first: TextBlock = {
    ...block,
    spans: tidy([...head, ...(lines[0] ? [{ text: lines[0], ...inherit }] : [])]),
  };
  const rest = lines.slice(1).map((line, i): TextBlock => {
    const last = i === lines.length - 2;
    return {
      ...block,
      id: newId(),
      style: 'normal',
      spans: last ? tidy([...own(line, []), ...tail]) : own(line, []),
    };
  });
  const focusOn = rest[rest.length - 1];
  return {
    blocks: [...blocks.slice(0, index), first, ...rest, ...blocks.slice(index + 1)],
    focus: { id: focusOn.id, offset: lines[lines.length - 1].length },
  };
}

/**
 * Backspace na początku akapitu. Z poprzednim akapitem tekstowym się skleja
 * (zostaje własność **poprzedniego**), pusty akapit po prostu znika, a przy
 * obrazie albo tabeli nie dzieje się nic — usuwa się je osobnym przyciskiem.
 * Zwraca `null`, gdy nie ma czego robić.
 */
export function joinWithPrevious(
  blocks: WriterBlock[],
  id: string
): { blocks: WriterBlock[]; focus: { id: string; offset: number } } | null {
  const index = indexOfBlock(blocks, id);
  const block = blocks[index];
  const previous = blocks[index - 1];
  if (!block || block.type !== 'text' || !previous) return null;

  if (previous.type === 'text') {
    const at = textOf(previous.spans).length;
    const merged: TextBlock = { ...previous, spans: tidy([...previous.spans, ...block.spans]) };
    return {
      blocks: [...blocks.slice(0, index - 1), merged, ...blocks.slice(index + 1)],
      focus: { id: previous.id, offset: at },
    };
  }
  if (block.spans.length === 0 && blocks.length > 1)
    return { blocks: blocks.filter((item) => item.id !== id), focus: { id: previous.id, offset: 0 } };
  return null;
}

/** Delete na końcu akapitu: dokleja następny akapit tekstowy do tego. */
export function joinWithNext(
  blocks: WriterBlock[],
  id: string
): { blocks: WriterBlock[]; focus: { id: string; offset: number } } | null {
  const index = indexOfBlock(blocks, id);
  const block = blocks[index];
  const next = blocks[index + 1];
  if (!block || block.type !== 'text' || !next || next.type !== 'text') return null;
  const at = textOf(block.spans).length;
  const merged: TextBlock = { ...block, spans: tidy([...block.spans, ...next.spans]) };
  return {
    blocks: [...blocks.slice(0, index), merged, ...blocks.slice(index + 2)],
    focus: { id, offset: at },
  };
}

export function moveBlock(blocks: WriterBlock[], id: string, by: -1 | 1): WriterBlock[] {
  const index = indexOfBlock(blocks, id);
  const target = index + by;
  if (index < 0 || target < 0 || target >= blocks.length) return blocks;
  const next = blocks.slice();
  [next[index], next[target]] = [next[target], next[index]];
  return next;
}

/** Kopia bloku tuż pod oryginałem — tak działa „kopiuj i wklej” na całym akapicie. */
export function duplicateBlock(blocks: WriterBlock[], id: string): WriterBlock[] {
  const index = indexOfBlock(blocks, id);
  const block = blocks[index];
  if (!block) return blocks;
  const copy: WriterBlock =
    block.type === 'table'
      ? { ...block, id: newId(), cells: block.cells.map((row) => row.slice()) }
      : block.type === 'text'
        ? { ...block, id: newId(), spans: block.spans.map((span) => ({ ...span })) }
        : { ...block, id: newId() };
  return [...blocks.slice(0, index + 1), copy, ...blocks.slice(index + 1)];
}

export function removeBlock(blocks: WriterBlock[], id: string): WriterBlock[] {
  return blocks.length > 1 ? blocks.filter((block) => block.id !== id) : blocks;
}

export function insertAfter(blocks: WriterBlock[], id: string | null, block: WriterBlock): WriterBlock[] {
  const index = id === null ? blocks.length - 1 : indexOfBlock(blocks, id);
  return [...blocks.slice(0, index + 1), block, ...blocks.slice(index + 1)];
}

/**
 * Przycisk listy. Wpisany z klawiatury punktor („- ”, „1. ”) **znika z tekstu**,
 * kiedy akapit staje się prawdziwą listą — inaczej dziecko dostałoby myślnik i
 * kropkę naraz, czyli dokładnie to, przed czym ostrzega lekcja o listach.
 */
export function setList(block: TextBlock, kind: ListKind | null): TextBlock {
  if (kind === null || block.list === kind) return { ...block, list: null };
  const text = textOf(block.spans);
  const match = text.match(BULLET);
  return {
    ...block,
    list: kind,
    spans: match ? tidy(sliceSpans(block.spans, match[0].length, text.length)) : block.spans,
  };
}

/* Tabela. */

export function setCell(block: TableBlock, row: number, column: number, value: string): TableBlock {
  return {
    ...block,
    cells: block.cells.map((line, r) =>
      r === row ? line.map((cell, c) => (c === column ? value : cell)) : line
    ),
  };
}

export function addRow(block: TableBlock): TableBlock {
  const columns = block.cells[0]?.length ?? 1;
  return { ...block, cells: [...block.cells, Array.from({ length: columns }, () => '')] };
}

export function addColumn(block: TableBlock): TableBlock {
  return { ...block, cells: block.cells.map((row) => [...row, '']) };
}

export function removeRow(block: TableBlock, row: number): TableBlock {
  return block.cells.length > 1 ? { ...block, cells: block.cells.filter((_, r) => r !== row) } : block;
}

export function removeColumn(block: TableBlock, column: number): TableBlock {
  return (block.cells[0]?.length ?? 0) > 1
    ? { ...block, cells: block.cells.map((row) => row.filter((_, c) => c !== column)) }
    : block;
}

/* ------------------------------------------------------------------ */
/* Wyjście: model dokumentu                                            */
/* ------------------------------------------------------------------ */

const EMPTY_PARAGRAPH: Omit<DocParagraph, 'text' | 'runs'> = {
  style: null,
  heading: null,
  list: false,
  typedBullet: false,
  ordered: null,
  align: null,
  hasImage: false,
  imageWrap: null,
  breaks: 0,
};

/**
 * Dokument z edytora w tym samym kształcie, w jakim czyta go parser plików.
 *
 * Trzy rzeczy zrobione **tak samo jak w parserze**, żeby sędzia nie rozróżniał
 * źródeł: ręczne złamania wiersza (`\n`) **nie wchodzą do tekstu**, tylko do
 * licznika `breaks`; punktor wpisany z klawiatury zapala `typedBullet`, a
 * prawdziwa lista go gasi; tekst tabeli nie trafia do tekstu dokumentu — stoi w
 * `tables`.
 */
export function toDoc(blocks: WriterBlock[], pictures: WriterPicture[] = []): DocContent {
  const paragraphs: DocParagraph[] = [];
  const tables: DocTable[] = [];
  const images: string[] = [];

  for (const block of blocks) {
    if (block.type === 'table') {
      tables.push({
        rows: block.cells.length,
        columns: block.cells.reduce((max, row) => Math.max(max, row.length), 0),
        cells: block.cells.map((row) => row.map((cell) => cell.trim())),
      });
    } else if (block.type === 'image') {
      images.push(pictures.find((picture) => picture.id === block.picture)?.name ?? block.picture);
      paragraphs.push({
        ...EMPTY_PARAGRAPH,
        text: '',
        runs: [],
        hasImage: true,
        imageWrap: block.wrap,
      });
    } else {
      const runs: DocRun[] = block.spans
        .map((span) => ({
          text: span.text.replace(/\n/g, ''),
          bold: block.bold,
          italic: block.italic,
          underline: block.underline,
          color: span.color,
          highlight: span.highlight,
          font: block.font,
          size: null,
        }))
        .filter((run) => run.text !== '');
      const text = runs.map((run) => run.text).join('');
      const typed = !block.list && BULLET.test(text);
      const style = STYLE_NAMES[block.style];
      paragraphs.push({
        ...EMPTY_PARAGRAPH,
        text,
        runs,
        style,
        heading: headingLevel(style),
        list: block.list !== null || typed,
        typedBullet: typed,
        ordered: block.list ? block.list === 'number' : typed ? /^\s*\d+[.)]/.test(text) : null,
        align: block.align,
        breaks: (textOf(block.spans).match(/\n/g) ?? []).length,
      });
    }
  }
  return finishDoc({ paragraphs, tables, images });
}
