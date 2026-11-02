/**
 * Gramatyka formuł arkusza kalkulacyjnego — adresy komórek, rozbiór formuły,
 * jej obliczenie i przesuwanie adresów przy kopiowaniu.
 *
 * Konsumenci: **widżety lekcji `arkusz-pierwsze-kroki`** i **`test-koncowy`** — dziecko
 * wpisuje formuły tak, jak wpisałoby je w polskim Excelu albo w LibreOffice:
 * `=SUMA(B2:B6)`, średnik między argumentami, przecinek w liczbie — tak, jak w polskim Excelu.
 * Nazwy funkcji rozpoznajemy też po angielsku (`SUM`), a `shiftFormula` przesuwa
 * adresy przy kopiowaniu uchwytem wypełniania.
 *
 * Trzy decyzje, które wyglądają na drobiazgi i nimi nie są:
 *
 * 1. **Liczba z jednostką jest tekstem.** `12 zł` wpisane w komórkę to dla
 *    arkusza napis, nie liczba — i `SUMA` go po cichu pomija. To jeden z
 *    najczęstszych błędów w pierwszym arkuszu, więc `parseLiteral` odwzorowuje
 *    go wiernie zamiast „pomagać”.
 * 2. **Nie zgadujemy funkcji, których nie znamy.** Formuła z nieznaną funkcją
 *    daje `#NIEZNANE`. Strona kursu nie ma prawa pokazać liczby, której nie
 *    policzyła.
 * 3. **Pusta komórka w działaniu to zero, a tekst to błąd `#ARG!`** — tak jak w
 *    Excelu. Za to w zakresie (`SUMA(B2:B6)`) tekst i puste są pomijane.
 */

export interface CellRef {
  col: number;
  row: number;
  absCol: boolean;
  absRow: boolean;
  sheet: string | null;
  /** Odwołanie do całej kolumny (`B:B`) — wtedy `row` nie ma znaczenia. */
  wholeColumn?: boolean;
}

/* ------------------------------------------------------------------ */
/* Adresy                                                              */
/* ------------------------------------------------------------------ */

/** 0 → A, 25 → Z, 26 → AA. */
export function colName(col: number): string {
  let name = '';
  let value = col + 1;
  while (value > 0) {
    const rest = (value - 1) % 26;
    name = String.fromCharCode(65 + rest) + name;
    value = Math.floor((value - 1) / 26);
  }
  return name;
}

export function colIndex(letters: string): number {
  let value = 0;
  for (const char of letters.toUpperCase()) value = value * 26 + (char.charCodeAt(0) - 64);
  return value - 1;
}

/** Adres komórki w zapisie A1, liczony od zera: `addr(1, 1)` → `B2`. */
export function addr(col: number, row: number): string {
  return `${colName(col)}${row + 1}`;
}

/** `B2`, `$B$2` → `{ col: 1, row: 1 }`. */
export function parseAddr(text: string): { col: number; row: number } | null {
  const match = /^\$?([A-Za-z]{1,3})\$?(\d+)$/.exec(text.trim());
  if (!match) return null;
  const row = Number(match[2]) - 1;
  if (row < 0) return null;
  return { col: colIndex(match[1]), row };
}

/* ------------------------------------------------------------------ */
/* Nazwy funkcji                                                       */
/* ------------------------------------------------------------------ */

/** Nazwa kanoniczna (angielska, jak w pliku) ← każda nazwa, pod którą dziecko ją zna. */
const FUNCTION_NAMES: Record<string, string> = {
  SUM: 'SUM',
  SUMA: 'SUM',
  AVERAGE: 'AVERAGE',
  ŚREDNIA: 'AVERAGE',
  SREDNIA: 'AVERAGE',
  MIN: 'MIN',
  MAX: 'MAX',
  COUNT: 'COUNT',
  'ILE.LICZB': 'COUNT',
  COUNTA: 'COUNTA',
  'ILE.NIEPUSTYCH': 'COUNTA',
  ROUND: 'ROUND',
  ZAOKR: 'ROUND',
  IF: 'IF',
  JEŻELI: 'IF',
  JEZELI: 'IF',
};

/** Funkcje, które coś **zbierają** z wielu komórek — liczą sumę, średnią, skrajność. */
export const AGGREGATES = new Set(['SUM', 'AVERAGE', 'MIN', 'MAX', 'COUNT', 'COUNTA']);

export function canonicalFunction(name: string): string | null {
  return FUNCTION_NAMES[name.toUpperCase()] ?? null;
}

/* ------------------------------------------------------------------ */
/* Tokeny                                                              */
/* ------------------------------------------------------------------ */

export type TokenKind =
  | 'num'
  | 'str'
  | 'bool'
  | 'ref'
  | 'fn'
  | 'name'
  | 'op'
  | 'lparen'
  | 'rparen'
  | 'sep'
  | 'colon'
  | 'bad';

export interface Token {
  kind: TokenKind;
  text: string;
  start: number;
  end: number;
  value?: number;
  ref?: CellRef;
}

const LETTER = /[A-Za-zĄĆĘŁŃÓŚŹŻąćęłńóśźż_]/;
const NAME_CHAR = /[A-Za-z0-9ĄĆĘŁŃÓŚŹŻąćęłńóśźż_.]/;

/**
 * Rozbiera formułę (bez wiodącego `=`) na tokeny z pozycjami w tekście —
 * pozycje są potrzebne do kolorowania adresów w pasku formuły i do przepisania
 * formuły z przesuniętymi adresami bez ruszania reszty tekstu.
 */
export function tokenize(source: string): Token[] {
  const tokens: Token[] = [];
  let i = 0;

  const push = (kind: TokenKind, start: number, end: number, extra: Partial<Token> = {}) =>
    tokens.push({ kind, text: source.slice(start, end), start, end, ...extra });

  while (i < source.length) {
    const char = source[i];

    if (/\s/.test(char)) {
      i += 1;
      continue;
    }

    if (char === '"') {
      const start = i;
      i += 1;
      let value = '';
      while (i < source.length) {
        if (source[i] === '"' && source[i + 1] === '"') {
          value += '"';
          i += 2;
        } else if (source[i] === '"') {
          i += 1;
          break;
        } else {
          value += source[i];
          i += 1;
        }
      }
      tokens.push({ kind: 'str', text: value, start, end: i });
      continue;
    }

    /* Nazwa arkusza w apostrofach: 'Moje dane'!B2 */
    if (char === "'") {
      const close = source.indexOf("'!", i + 1);
      if (close > i) {
        const sheet = source.slice(i + 1, close).replace(/''/g, "'");
        const ref = readRef(source, close + 2);
        if (ref) {
          push('ref', i, ref.end, { ref: { ...ref.ref, sheet } });
          i = ref.end;
          continue;
        }
      }
      push('bad', i, i + 1);
      i += 1;
      continue;
    }

    if (/\d/.test(char)) {
      const start = i;
      /* „B2” zaczyna się od litery, więc cyfra na starcie to zawsze liczba. */
      while (i < source.length && /\d/.test(source[i])) i += 1;
      const decimal = source[i];
      const decimalAllowed = decimal === '.' || decimal === ',';
      if (decimalAllowed && /\d/.test(source[i + 1] ?? '')) {
        i += 1;
        while (i < source.length && /\d/.test(source[i])) i += 1;
      }
      const text = source.slice(start, i).replace(',', '.');
      push('num', start, i, { value: Number(text) });
      continue;
    }

    if (char === '$' || LETTER.test(char)) {
      /* Najpierw: czy to adres (albo kolumna `B:B`)? */
      const ref = readRef(source, i);
      if (ref && source[ref.end] !== '(' && !NAME_CHAR.test(source[ref.end] ?? '') && source[ref.end] !== '!') {
        push('ref', i, ref.end, { ref: ref.ref });
        i = ref.end;
        continue;
      }

      const start = i;
      if (char === '$') {
        push('bad', i, i + 1);
        i += 1;
        continue;
      }
      while (i < source.length && NAME_CHAR.test(source[i])) i += 1;
      const name = source.slice(start, i);

      /* Nazwa arkusza bez apostrofów: Arkusz1!B2 */
      if (source[i] === '!') {
        const sheetRef = readRef(source, i + 1);
        if (sheetRef) {
          push('ref', start, sheetRef.end, { ref: { ...sheetRef.ref, sheet: name } });
          i = sheetRef.end;
          continue;
        }
      }

      let look = i;
      while (look < source.length && source[look] === ' ') look += 1;
      if (source[look] === '(') {
        push('fn', start, i);
        continue;
      }
      const upper = name.toUpperCase();
      if (upper === 'TRUE' || upper === 'PRAWDA') push('bool', start, i, { value: 1 });
      else if (upper === 'FALSE' || upper === 'FAŁSZ' || upper === 'FALSZ') push('bool', start, i, { value: 0 });
      else push('name', start, i);
      continue;
    }

    if (char === '(') {
      push('lparen', i, i + 1);
      i += 1;
      continue;
    }
    if (char === ')') {
      push('rparen', i, i + 1);
      i += 1;
      continue;
    }
    if (char === ';' || char === ',') {
      push('sep', i, i + 1);
      i += 1;
      continue;
    }
    if (char === ':') {
      push('colon', i, i + 1);
      i += 1;
      continue;
    }
    if ((char === '<' || char === '>') && (source[i + 1] === '=' || (char === '<' && source[i + 1] === '>'))) {
      push('op', i, i + 2);
      i += 2;
      continue;
    }
    if ('+-*/^&%=<>'.includes(char)) {
      push('op', i, i + 1);
      i += 1;
      continue;
    }

    push('bad', i, i + 1);
    i += 1;
  }

  return tokens;
}

/** Czyta `$B$2` albo `B:B` od pozycji `at`. */
function readRef(source: string, at: number): { ref: CellRef; end: number } | null {
  const cell = /^(\$?)([A-Za-z]{1,3})(\$?)(\d{1,7})/.exec(source.slice(at));
  if (cell) {
    const row = Number(cell[4]) - 1;
    if (row < 0) return null;
    return {
      ref: { col: colIndex(cell[2]), row, absCol: cell[1] === '$', absRow: cell[3] === '$', sheet: null },
      end: at + cell[0].length,
    };
  }
  /* Cała kolumna, np. B:B — zapisujemy ją jako dwa odwołania do tej samej kolumny. */
  const column = /^(\$?)([A-Za-z]{1,3})(?=:\$?[A-Za-z]{1,3}(?![A-Za-z0-9(]))/.exec(source.slice(at));
  if (column) {
    return {
      ref: { col: colIndex(column[2]), row: 0, absCol: column[1] === '$', absRow: true, sheet: null, wholeColumn: true },
      end: at + column[0].length,
    };
  }
  return null;
}

/* ------------------------------------------------------------------ */
/* Drzewo formuły                                                      */
/* ------------------------------------------------------------------ */

export type FormulaNode =
  | { k: 'num'; v: number }
  | { k: 'str'; v: string }
  | { k: 'bool'; v: boolean }
  | { k: 'ref'; ref: CellRef }
  | { k: 'range'; a: CellRef; b: CellRef }
  | { k: 'fn'; name: string | null; raw: string; args: FormulaNode[] }
  | { k: 'name'; v: string }
  | { k: 'un'; op: string; e: FormulaNode }
  | { k: 'bin'; op: string; l: FormulaNode; r: FormulaNode };

export class FormulaSyntaxError extends Error {}

/** Rozbiór formuły bez `=`. Rzuca `FormulaSyntaxError` ze zdaniem dla dziecka. */
export function parseFormula(source: string): FormulaNode {
  const tokens = tokenize(source);
  if (tokens.length === 0) throw new FormulaSyntaxError('Po znaku = nic nie ma.');
  const bad = tokens.find((token) => token.kind === 'bad');
  if (bad) throw new FormulaSyntaxError(`Znak „${bad.text}” nie pasuje do formuły.`);

  let pos = 0;
  const peek = () => tokens[pos];
  const next = () => tokens[pos++];
  const isOp = (...ops: string[]) => peek()?.kind === 'op' && ops.includes(peek()!.text);

  const comparison = (): FormulaNode => {
    let left = concat();
    while (isOp('=', '<>', '<', '>', '<=', '>=')) {
      const op = next().text;
      left = { k: 'bin', op, l: left, r: concat() };
    }
    return left;
  };
  const concat = (): FormulaNode => {
    let left = additive();
    while (isOp('&')) {
      next();
      left = { k: 'bin', op: '&', l: left, r: additive() };
    }
    return left;
  };
  const additive = (): FormulaNode => {
    let left = multiplicative();
    while (isOp('+', '-')) {
      const op = next().text;
      left = { k: 'bin', op, l: left, r: multiplicative() };
    }
    return left;
  };
  const multiplicative = (): FormulaNode => {
    let left = power();
    while (isOp('*', '/')) {
      const op = next().text;
      left = { k: 'bin', op, l: left, r: power() };
    }
    return left;
  };
  const power = (): FormulaNode => {
    let left = unary();
    while (isOp('^')) {
      next();
      left = { k: 'bin', op: '^', l: left, r: unary() };
    }
    return left;
  };
  const unary = (): FormulaNode => {
    if (isOp('-', '+')) {
      const op = next().text;
      return { k: 'un', op, e: unary() };
    }
    let node = primary();
    while (isOp('%')) {
      next();
      node = { k: 'un', op: '%', e: node };
    }
    return node;
  };
  const primary = (): FormulaNode => {
    const token = next();
    if (!token) throw new FormulaSyntaxError('Formuła urywa się w połowie.');
    switch (token.kind) {
      case 'num':
        return { k: 'num', v: token.value ?? 0 };
      case 'str':
        return { k: 'str', v: token.text };
      case 'bool':
        return { k: 'bool', v: token.value === 1 };
      case 'name':
        return { k: 'name', v: token.text };
      case 'ref': {
        if (peek()?.kind === 'colon') {
          next();
          const end = next();
          if (!end || end.kind !== 'ref' || !end.ref)
            throw new FormulaSyntaxError('Po dwukropku brakuje drugiego adresu zakresu.');
          return { k: 'range', a: token.ref!, b: { ...end.ref, sheet: end.ref.sheet ?? token.ref!.sheet } };
        }
        if (token.ref!.wholeColumn) throw new FormulaSyntaxError('Sama kolumna bez zakresu nic nie znaczy.');
        return { k: 'ref', ref: token.ref! };
      }
      case 'fn': {
        const open = next();
        if (!open || open.kind !== 'lparen') throw new FormulaSyntaxError(`Po ${token.text} brakuje nawiasu.`);
        const args: FormulaNode[] = [];
        if (peek()?.kind === 'rparen') {
          next();
        } else {
          for (;;) {
            args.push(comparison());
            const after = next();
            if (!after) throw new FormulaSyntaxError('Brakuje nawiasu zamykającego.');
            if (after.kind === 'rparen') break;
            if (after.kind !== 'sep')
              throw new FormulaSyntaxError(
                'Argumenty funkcji oddziela się średnikiem, a zakres dwukropkiem: B2:B6.'
              );
          }
        }
        return { k: 'fn', name: canonicalFunction(token.text), raw: token.text, args };
      }
      case 'lparen': {
        const inner = comparison();
        const close = next();
        if (!close || close.kind !== 'rparen') throw new FormulaSyntaxError('Brakuje nawiasu zamykającego.');
        return inner;
      }
      default:
        throw new FormulaSyntaxError(`„${token.text}” stoi w złym miejscu.`);
    }
  };

  const tree = comparison();
  if (pos < tokens.length) {
    const extra = tokens[pos];
    if (extra.kind === 'colon')
      throw new FormulaSyntaxError('Zakres zapisuje się dwoma adresami: od B2 do B6 to B2:B6.');
    throw new FormulaSyntaxError(`„${extra.text}” stoi w złym miejscu.`);
  }
  return tree;
}

/* ------------------------------------------------------------------ */
/* Wartości i obliczanie                                               */
/* ------------------------------------------------------------------ */

export type ErrorCode = '#DZIEL/0!' | '#ARG!' | '#NAZWA?' | '#ADR!' | '#CYKL!' | '#BŁĄD!' | '#NIEZNANE';

export type CellValue =
  | { t: 'num'; v: number }
  | { t: 'str'; v: string }
  | { t: 'bool'; v: boolean }
  | { t: 'empty' }
  | { t: 'err'; code: ErrorCode; message?: string };

const EMPTY: CellValue = { t: 'empty' };
const err = (code: ErrorCode, message?: string): CellValue => ({ t: 'err', code, message });

/**
 * Zawartość komórki wpisana z klawiatury, zanim cokolwiek policzymy.
 * `'12` wymusza tekst (tak jak w prawdziwym arkuszu), `12 zł` jest tekstem sam z
 * siebie — i to jest wierne, nie złośliwe.
 */
export function parseLiteral(raw: string): CellValue {
  const text = raw.trim();
  if (text === '') return EMPTY;
  if (raw.startsWith("'")) return { t: 'str', v: raw.slice(1) };
  const number = /^[-+]?\d+([.,]\d+)?$/;
  if (number.test(text)) return { t: 'num', v: Number(text.replace(',', '.')) };
  return { t: 'str', v: raw };
}

export function isFormula(raw: string | undefined): boolean {
  return !!raw && raw.startsWith('=') && raw.length > 1;
}

/** Arkusz do obliczenia: surowe zawartości komórek pod adresami A1. */
export type RawCells = Record<string, string>;

export interface EvaluateOptions {
  /** Nazwa bieżącego arkusza — odwołanie do innego arkusza daje `#ADR!`. */
  sheet?: string | null;
  /** Wynik zapisany przez prawdziwy program, gdy nie umiemy formuły policzyć sami. */
  fallback?: (address: string) => CellValue | undefined;
}

/**
 * Oblicza cały arkusz. Zwraca wartość każdej niepustej komórki. Pętla odwołań
 * (formuła liczy samą siebie, choćby przez zakres) daje `#CYKL!` zamiast
 * zawieszać stronę.
 */
export function evaluateSheet(cells: RawCells, options: EvaluateOptions): Record<string, CellValue> {
  const cache = new Map<string, CellValue>();
  const visiting = new Set<string>();
  const addresses = Object.keys(cells);
  const maxRow = addresses.reduce((max, key) => Math.max(max, parseAddr(key)?.row ?? 0), 0);

  const valueAt = (col: number, row: number): CellValue => {
    const key = addr(col, row);
    const cached = cache.get(key);
    if (cached) return cached;
    const raw = cells[key];
    if (raw === undefined) return EMPTY;
    if (!isFormula(raw)) {
      const literal = parseLiteral(raw);
      cache.set(key, literal);
      return literal;
    }
    if (visiting.has(key)) return err('#CYKL!', 'Formuła liczy samą siebie.');
    visiting.add(key);
    let result: CellValue;
    try {
      const tree = parseFormula(raw.slice(1));
      result = scalar(evaluateNode(tree));
    } catch (error) {
      result =
        error instanceof FormulaSyntaxError ? err('#BŁĄD!', error.message) : err('#BŁĄD!', 'Nie da się tego policzyć.');
    }
    visiting.delete(key);
    if (result.t === 'err' && result.code === '#NIEZNANE') result = options.fallback?.(key) ?? result;
    cache.set(key, result);
    return result;
  };

  const sameSheet = (ref: CellRef) =>
    ref.sheet === null || options.sheet === undefined || options.sheet === null || ref.sheet === options.sheet;

  /** Węzeł może dać pojedynczą wartość albo listę (zakres). */
  const evaluateNode = (node: FormulaNode): CellValue | CellValue[] => {
    switch (node.k) {
      case 'num':
        return { t: 'num', v: node.v };
      case 'str':
        return { t: 'str', v: node.v };
      case 'bool':
        return { t: 'bool', v: node.v };
      case 'name':
        return err('#NAZWA?', `Nie znam nazwy „${node.v}”.`);
      case 'ref':
        if (!sameSheet(node.ref)) return err('#NIEZNANE');
        return valueAt(node.ref.col, node.ref.row);
      case 'range': {
        if (!sameSheet(node.a)) return err('#NIEZNANE');
        const box = rangeBox(node.a, node.b, maxRow);
        const list: CellValue[] = [];
        for (let row = box.r1; row <= box.r2; row += 1)
          for (let col = box.c1; col <= box.c2; col += 1) list.push(valueAt(col, row));
        return list;
      }
      case 'un': {
        const value = number(scalar(evaluateNode(node.e)));
        if (value.t === 'err') return value;
        if (node.op === '-') return { t: 'num', v: -value.v };
        if (node.op === '%') return { t: 'num', v: value.v / 100 };
        return value;
      }
      case 'bin':
        return binary(node.op, scalar(evaluateNode(node.l)), scalar(evaluateNode(node.r)));
      case 'fn':
        return callFunction(node);
    }
  };

  const callFunction = (node: Extract<FormulaNode, { k: 'fn' }>): CellValue => {
    if (!node.name) {
      /* Znana z nazwy w innym programie, ale nie u nas — nie udajemy, że umiemy. */
      return err('#NIEZNANE', `Nie umiem policzyć funkcji ${node.raw}.`);
    }
    if (node.name === 'IF') {
      const test = scalar(evaluateNode(node.args[0] ?? { k: 'bool', v: false }));
      if (test.t === 'err') return test;
      const truthy = test.t === 'bool' ? test.v : test.t === 'num' ? test.v !== 0 : false;
      const branch = node.args[truthy ? 1 : 2];
      return branch ? scalar(evaluateNode(branch)) : { t: 'bool', v: truthy };
    }
    if (node.name === 'ROUND') {
      const value = number(scalar(evaluateNode(node.args[0] ?? { k: 'num', v: 0 })));
      const digits = number(scalar(evaluateNode(node.args[1] ?? { k: 'num', v: 0 })));
      if (value.t === 'err') return value;
      if (digits.t === 'err') return digits;
      const factor = 10 ** Math.trunc(digits.v);
      return { t: 'num', v: Math.round(value.v * factor) / factor };
    }

    const numbers: number[] = [];
    let filled = 0;
    for (const arg of node.args) {
      const value = evaluateNode(arg);
      if (Array.isArray(value)) {
        for (const item of value) {
          if (item.t === 'err') return item;
          if (item.t !== 'empty') filled += 1;
          if (item.t === 'num') numbers.push(item.v);
        }
      } else {
        if (value.t === 'err') return value;
        if (value.t !== 'empty') filled += 1;
        if (value.t === 'num') numbers.push(value.v);
        else if (value.t === 'bool') numbers.push(value.v ? 1 : 0);
        else if (value.t === 'str' && arg.k !== 'ref') {
          const parsed = parseLiteral(value.v);
          if (parsed.t !== 'num') return err('#ARG!', 'Wśród argumentów jest tekst.');
          numbers.push(parsed.v);
        }
      }
    }

    switch (node.name) {
      case 'SUM':
        return { t: 'num', v: numbers.reduce((sum, item) => sum + item, 0) };
      case 'AVERAGE':
        return numbers.length === 0
          ? err('#DZIEL/0!', 'Nie ma ani jednej liczby, z której dałoby się policzyć średnią.')
          : { t: 'num', v: numbers.reduce((sum, item) => sum + item, 0) / numbers.length };
      case 'MIN':
        return { t: 'num', v: numbers.length ? Math.min(...numbers) : 0 };
      case 'MAX':
        return { t: 'num', v: numbers.length ? Math.max(...numbers) : 0 };
      case 'COUNT':
        return { t: 'num', v: numbers.length };
      case 'COUNTA':
        return { t: 'num', v: filled };
      default:
        return err('#NIEZNANE');
    }
  };

  const result: Record<string, CellValue> = {};
  for (const key of addresses) {
    const at = parseAddr(key);
    if (at) result[key] = valueAt(at.col, at.row);
  }
  return result;
}

function scalar(value: CellValue | CellValue[]): CellValue {
  if (!Array.isArray(value)) return value;
  /* Zakres w miejscu jednej liczby (np. =B2:B6+1) — arkusz by tu zgłosił błąd. */
  return value.length === 1 ? value[0] : err('#ARG!', 'Zakres stoi tam, gdzie powinna być jedna liczba.');
}

function number(value: CellValue): { t: 'num'; v: number } | Extract<CellValue, { t: 'err' }> {
  switch (value.t) {
    case 'num':
      return value;
    case 'empty':
      return { t: 'num', v: 0 };
    case 'bool':
      return { t: 'num', v: value.v ? 1 : 0 };
    case 'err':
      return value;
    case 'str':
      return err('#ARG!', `„${value.v}” to tekst, a nie liczba — nie da się tego dodać ani pomnożyć.`) as Extract<
        CellValue,
        { t: 'err' }
      >;
  }
}

function binary(op: string, left: CellValue, right: CellValue): CellValue {
  if (op === '&') {
    if (left.t === 'err') return left;
    if (right.t === 'err') return right;
    return { t: 'str', v: `${plain(left)}${plain(right)}` };
  }
  if (['=', '<>', '<', '>', '<=', '>='].includes(op)) {
    if (left.t === 'err') return left;
    if (right.t === 'err') return right;
    const a = left.t === 'num' ? left.v : plain(left);
    const b = right.t === 'num' ? right.v : plain(right);
    switch (op) {
      case '=':
        return { t: 'bool', v: a === b };
      case '<>':
        return { t: 'bool', v: a !== b };
      case '<':
        return { t: 'bool', v: a < b };
      case '>':
        return { t: 'bool', v: a > b };
      case '<=':
        return { t: 'bool', v: a <= b };
      default:
        return { t: 'bool', v: a >= b };
    }
  }
  const a = number(left);
  if (a.t === 'err') return a;
  const b = number(right);
  if (b.t === 'err') return b;
  switch (op) {
    case '+':
      return { t: 'num', v: a.v + b.v };
    case '-':
      return { t: 'num', v: a.v - b.v };
    case '*':
      return { t: 'num', v: a.v * b.v };
    case '/':
      return b.v === 0 ? err('#DZIEL/0!', 'Nie da się dzielić przez zero.') : { t: 'num', v: a.v / b.v };
    case '^':
      return { t: 'num', v: a.v ** b.v };
    default:
      return err('#BŁĄD!');
  }
}

function plain(value: CellValue): string {
  switch (value.t) {
    case 'num':
      return String(value.v);
    case 'str':
      return value.v;
    case 'bool':
      return value.v ? 'PRAWDA' : 'FAŁSZ';
    default:
      return '';
  }
}

/* ------------------------------------------------------------------ */
/* Zakresy i odwołania                                                 */
/* ------------------------------------------------------------------ */

export interface Box {
  c1: number;
  r1: number;
  c2: number;
  r2: number;
}

export function rangeBox(a: CellRef, b: CellRef, maxRow: number): Box {
  const whole = a.wholeColumn || b.wholeColumn;
  return {
    c1: Math.min(a.col, b.col),
    c2: Math.max(a.col, b.col),
    r1: whole ? 0 : Math.min(a.row, b.row),
    r2: whole ? maxRow : Math.max(a.row, b.row),
  };
}

export function boxContains(box: Box, col: number, row: number): boolean {
  return col >= box.c1 && col <= box.c2 && row >= box.r1 && row <= box.r2;
}

export interface FormulaReference {
  box: Box;
  /** Czy to zakres (`B2:B6`), a nie pojedyncza komórka. */
  range: boolean;
  sheet: string | null;
  /** Pozycja w tekście formuły (bez `=`), do kolorowania. */
  start: number;
  end: number;
}

/**
 * Wszystkie odwołania formuły, w kolejności z tekstu. Nie wymaga poprawnej
 * formuły — kolorowanie w pasku formuły działa także w trakcie pisania.
 */
export function formulaReferences(source: string, maxRow = 1000): FormulaReference[] {
  const tokens = tokenize(source);
  const found: FormulaReference[] = [];
  for (let i = 0; i < tokens.length; i += 1) {
    const token = tokens[i];
    if (token.kind !== 'ref' || !token.ref) continue;
    const colon = tokens[i + 1];
    const end = tokens[i + 2];
    if (colon?.kind === 'colon' && end?.kind === 'ref' && end.ref) {
      found.push({
        box: rangeBox(token.ref, end.ref, maxRow),
        range: true,
        sheet: token.ref.sheet ?? end.ref.sheet,
        start: token.start,
        end: end.end,
      });
      i += 2;
    } else if (!token.ref.wholeColumn) {
      found.push({
        box: { c1: token.ref.col, c2: token.ref.col, r1: token.ref.row, r2: token.ref.row },
        range: false,
        sheet: token.ref.sheet,
        start: token.start,
        end: token.end,
      });
    }
  }
  return found;
}

/** Wszystkie funkcje użyte w formule — nazwy kanoniczne, nieznane jako `null`. */
export function formulaFunctions(source: string): (string | null)[] {
  return tokenize(source)
    .filter((token) => token.kind === 'fn')
    .map((token) => canonicalFunction(token.text));
}

/**
 * **Martwa formuła** — taka, która nie odwołuje się do żadnej komórki: `=12+15+9`.
 * Wygląda jak formuła i daje dobry wynik, ale po zmianie danych nie drgnie, więc
 * dla arkusza jest tym samym co liczba wpisana z ręki.
 */
export function isDeadFormula(raw: string): boolean {
  return isFormula(raw) && formulaReferences(raw.slice(1)).length === 0;
}

/* ------------------------------------------------------------------ */
/* Kopiowanie formuły — przesuwanie adresów                            */
/* ------------------------------------------------------------------ */

/**
 * Przepisuje formułę tak, jak robi to arkusz przy kopiowaniu o `dCol` kolumn i
 * `dRow` wierszy: adresy względne przesuwają się, a te z `$` stoją w miejscu.
 * Reszta tekstu (spacje, nazwy funkcji, liczby) zostaje nietknięta.
 */
export function shiftFormula(source: string, dCol: number, dRow: number): string {
  const tokens = tokenize(source);
  let out = '';
  let last = 0;
  for (const token of tokens) {
    if (token.kind !== 'ref' || !token.ref) continue;
    out += source.slice(last, token.start);
    out += refText(token.ref, dCol, dRow);
    last = token.end;
  }
  return out + source.slice(last);
}

function refText(ref: CellRef, dCol: number, dRow: number): string {
  const col = ref.absCol ? ref.col : ref.col + dCol;
  const row = ref.absRow ? ref.row : ref.row + dRow;
  if (col < 0 || (!ref.wholeColumn && row < 0)) return '#ADR!';
  const sheet = ref.sheet === null ? '' : /^[A-Za-z0-9_]+$/.test(ref.sheet) ? `${ref.sheet}!` : `'${ref.sheet.replace(/'/g, "''")}'!`;
  const colPart = `${ref.absCol ? '$' : ''}${colName(col)}`;
  if (ref.wholeColumn) return `${sheet}${colPart}`;
  return `${sheet}${colPart}${ref.absRow ? '$' : ''}${row + 1}`;
}

/* ------------------------------------------------------------------ */
/* Wyświetlanie                                                        */
/* ------------------------------------------------------------------ */

const NUMBER_FORMAT = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 2, useGrouping: false });

/** Liczba po polsku, najwyżej dwa miejsca po przecinku — tak, jak pokaże ją wąska kolumna. */
export function formatNumber(value: number): string {
  return NUMBER_FORMAT.format(value);
}

export function displayValue(value: CellValue | undefined): string {
  if (!value) return '';
  switch (value.t) {
    case 'num':
      return formatNumber(value.v);
    case 'str':
      return value.v;
    case 'bool':
      return value.v ? 'PRAWDA' : 'FAŁSZ';
    case 'err':
      return value.code === '#NIEZNANE' ? '?' : value.code;
    default:
      return '';
  }
}
