'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check, MousePointerClick, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  addr,
  displayValue,
  evaluateSheet,
  formulaFunctions,
  formulaReferences,
  isDeadFormula,
  isFormula,
  type RawCells,
} from '../../../lib/formula';
import { ColoredFormula, FormulaBar, SheetGrid, SymbolPad, useSheetEditor, type Cell } from './sheet-grid';

/**
 * Blok 2 — wyjaśnienie. **Adres komórki to nie ozdoba, tylko przepis na to,
 * skąd wziąć liczbę.** Pokazane przez konsekwencję, nie przez definicję.
 *
 * Trzy kroki na jednym arkuszu (zakupy na wycieczkę):
 *
 * 1. Kolega policzył pierwszy wiersz formułą `=4*3` — wynik się zgadza. Dziecko
 *    **przeciąga uchwyt wypełniania** w dół i każdy wiersz dostaje 12 zł: sok,
 *    bułki, bilety. Formuła mówiła, **jakie liczby** wziąć, a nie **skąd** —
 *    więc skopiowana do innego wiersza dalej bierze te same;
 * 2. dziecko pisze formułę od nowa, **wskazując komórki** zamiast wpisywać
 *    liczby, i przeciąga ją jeszcze raz. Z boku rośnie lista tego, co naprawdę
 *    wpisało się w komórki: `=B3*C3`, `=B4*C4`… — adresy przesuwają się same;
 * 3. sumę wszystkiego liczy `SUMA` z **zakresem zaznaczonym przeciągnięciem**.
 *    Zakres obejmujący własną komórkę daje błąd pętli i widżet nazywa go wprost.
 *
 * Komórka `D2` jest zablokowana w kroku 1, żeby nikt nie poprawił formuły
 * kolegi, zanim zobaczy, co z niej wynika po skopiowaniu.
 *
 * Uproszczenie z 2026-10-17: dziecko dopisywało swoją formułę ZA starą
 * (`=4*3=B2*C2` → PRAWDA) i nie wiedziało, co dalej. Dlatego na wejściu w krok 2
 * D2 jest czyszczona, `=` (a w kroku 4 `=SUMA(`) wpisuje się samo po stuknięciu
 * w komórkę, nawias domyka się przy zatwierdzeniu, kopiowanie jest zamknięte,
 * dopóki formuła nie jest dobra, a obok rośnie lista „krok po kroku” odhaczana
 * z tego, co naprawdę stoi w pasku formuły.
 */

const COLS = 4;
const ROWS = 7;
const WIDTHS = [118, 52, 52, 66];

const START: RawCells = {
  A1: 'Produkt',
  B1: 'Cena',
  C1: 'Sztuk',
  D1: 'Razem',
  A2: 'sok',
  B2: '4',
  C2: '3',
  D2: '=4*3',
  A3: 'bułka',
  B3: '3',
  C3: '3',
  A4: 'jabłko',
  B4: '2',
  C4: '5',
  A5: 'bilet do muzeum',
  B5: '15',
  C5: '3',
  A6: 'bilet na autobus',
  B6: '5',
  C6: '6',
  A7: 'wszystko razem',
};

const TOTAL = 106;
const LINE_ROWS = [1, 2, 3, 4, 5];

type Phase = 'copy-dead' | 'rewrite' | 'fill-live' | 'sum' | 'done';

interface Note {
  tone: 'ok' | 'no';
  text: ReactNode;
}

/** Czy wiersz `row` (od zera) liczy cenę razy sztuki z WŁASNEGO wiersza. */
function lineIsLive(cells: RawCells, row: number): boolean {
  const raw = cells[addr(3, row)];
  if (!isFormula(raw) || isDeadFormula(raw!)) return false;
  const refs = formulaReferences(raw!.slice(1));
  const touches = (col: number) => refs.some((ref) => ref.box.c1 <= col && ref.box.c2 >= col && ref.box.r1 <= row && ref.box.r2 >= row);
  return touches(1) && touches(2);
}

interface PointFormulaProps {
  color: string;
  onComplete?: () => void;
}

export function PointFormula({ color, onComplete }: PointFormulaProps) {
  const [phase, setPhase] = useState<Phase>('copy-dead');
  const [note, setNote] = useState<Note | null>(null);

  const editable = useCallback(
    ({ col, row }: Cell) => {
      /* Po skończeniu wolno zmieniać ceny i sztuki — żeby zobaczyć, że wszystko żyje. */
      if (phase === 'done' && (col === 1 || col === 2)) return row >= 1 && row <= 5;
      if (col !== 3) return false;
      if (phase === 'copy-dead') return row >= 2 && row <= 5;
      if (phase === 'sum' || phase === 'done') return row >= 1 && row <= 6;
      return row >= 1 && row <= 5;
    },
    [phase]
  );

  const judge = useCallback(
    (cells: RawCells, changed: string[]) => {
      const values = evaluateSheet(cells, {});
      const value = (address: string) => values[address];

      if (phase === 'copy-dead') {
        const copied = LINE_ROWS.slice(1).filter((row) => cells[addr(3, row)] === '=4*3');
        if (copied.length === 0) return;
        if (copied.length < 4) {
          setNote({ tone: 'no', text: <>Ciągnij dalej — aż do wiersza 6, żeby zobaczyć wszystkie zakupy.</> });
          return;
        }
        setPhase('rewrite');
        setNote({
          tone: 'no',
          text: (
            <>
              <strong>Każdy wiersz kosztuje 12 zł</strong> — bułki, jabłka i bilety do muzeum też. Formuła{' '}
              <span className="font-mono">=4*3</span> mówi, <strong>jakie liczby</strong> wziąć, a nie{' '}
              <strong>skąd</strong>. Skopiowana piętro niżej dalej mnoży cztery przez trzy. D2 jest już pusta — napisz
              w niej lepszą formułę.
            </>
          ),
        });
        return;
      }

      if (phase === 'rewrite') {
        if (!changed.includes('D2')) return;
        const raw = cells.D2 ?? '';
        if (raw === '') return;
        if (!isFormula(raw)) {
          setNote({ tone: 'no', text: <>Formuła zaczyna się od znaku <strong>=</strong>. Bez niego arkusz zapisze zwykły napis.</> });
          return;
        }
        if (/[=<>]/.test(raw.slice(1))) {
          setNote({
            tone: 'no',
            text: (
              <>
                W formule może być <strong>tylko jeden</strong> znak <strong>=</strong> — na samym początku. Stuknij{' '}
                <strong>„Wyczyść D2”</strong> i zacznij od pustej komórki.
              </>
            ),
          });
          return;
        }
        if (isDeadFormula(raw)) {
          setNote({
            tone: 'no',
            text: (
              <>
                To wciąż same liczby — po skopiowaniu znów wyjdzie 12 zł wszędzie. Zamiast pisać{' '}
                <span className="font-mono">4</span>, <strong>stuknij w komórkę B2</strong>, w której ta cena stoi.
              </>
            ),
          });
          return;
        }
        const result = value('D2');
        if (!lineIsLive(cells, 1) || result?.t !== 'num' || result.v !== 12) {
          setNote({
            tone: 'no',
            text: (
              <>
                Wyszło <strong>{displayValue(result)}</strong>, a sok to 4 zł razy 3 sztuki. Potrzebna jest cena (B2){' '}
                <strong>razy</strong> liczba sztuk (C2).
              </>
            ),
          });
          return;
        }
        setPhase('fill-live');
        setNote({
          tone: 'ok',
          text: (
            <>
              Wynik ten sam co u kolegi — <strong>12 zł</strong>. Różnica jest w środku, a wyjdzie na jaw przy
              kopiowaniu.
            </>
          ),
        });
        return;
      }

      if (phase === 'fill-live') {
        const live = LINE_ROWS.filter((row) => lineIsLive(cells, row));
        const correct = LINE_ROWS.every((row) => {
          const item = value(addr(3, row));
          const price = Number(cells[addr(1, row)]);
          const count = Number(cells[addr(2, row)]);
          return item?.t === 'num' && item.v === price * count;
        });
        if (live.length === LINE_ROWS.length && correct) {
          setPhase('sum');
          setNote({
            tone: 'ok',
            text: (
              <>
                Pięć wierszy, pięć różnych wyników — z <strong>jednej</strong> formuły. Arkusz przepisał ją w każdym wierszu,
                przesuwając adresy o tyle, o ile przesunęła się komórka. Zostało policzyć wszystko razem.
              </>
            ),
          });
        } else if (changed.length > 0 && LINE_ROWS.slice(1).some((row) => changed.includes(addr(3, row)))) {
          setNote({ tone: 'no', text: <>Jeszcze nie wszystkie wiersze — przeciągnij uchwyt z D2 aż do D6.</> });
        }
        return;
      }

      if (phase === 'sum') {
        if (!changed.includes('D7')) return;
        const raw = cells.D7 ?? '';
        const result = value('D7');
        if (!isFormula(raw)) {
          setNote({ tone: 'no', text: <>Tu też formuła: zacznij od <strong>=SUMA(</strong>.</> });
          return;
        }
        if (isDeadFormula(raw)) {
          setNote({ tone: 'no', text: <>Same liczby — martwa suma. Zaznacz przeciągnięciem komórki, które ma zsumować.</> });
          return;
        }
        if (result?.t === 'err' && result.code === '#CYKL!') {
          setNote({
            tone: 'no',
            text: (
              <>
                <strong>Błąd pętli.</strong> Zakres obejmuje też D7 — suma próbuje dodać samą siebie i nigdy nie skończy.
                Zaznacz tylko <span className="font-mono">D2:D6</span>.
              </>
            ),
          });
          return;
        }
        if (result?.t === 'err') {
          setNote({ tone: 'no', text: <>Arkusz zgłasza błąd {result.code}. {result.message}</> });
          return;
        }
        if (result?.t !== 'num' || result.v !== TOTAL) {
          setNote({
            tone: 'no',
            text: (
              <>
                Wyszło <strong>{displayValue(result)}</strong>. Sprawdź obwódkę na arkuszu — czy obejmuje wszystkie pięć
                wierszy zakupów, od D2 do D6?
              </>
            ),
          });
          return;
        }
        const usesSum = formulaFunctions(raw.slice(1)).includes('SUM');
        setPhase('done');
        setNote({
          tone: 'ok',
          text: usesSum ? (
            <>
              <strong>106 zł.</strong> I ten wynik też żyje: zmień cenę biletu, a przeliczy się wiersz i suma. Zakres{' '}
              <span className="font-mono">D2:D6</span> znaczy „od D2 do D6” — przy stu wierszach wygląda tak samo krótko.
            </>
          ) : (
            <>
              <strong>106 zł, dobrze.</strong> Dodawanie komórka po komórce działa, ale przy stu wierszach zajęłoby cały
              ekran. <span className="font-mono">=SUMA(D2:D6)</span> mówi to samo krócej.
            </>
          ),
        });
        onComplete?.();
      }
    },
    [phase, onComplete]
  );

  /* Stuknięcie w pustą komórkę docelową od razu zaczyna formułę — bez celowania w pasek. */
  const autoStart = ({ col, row }: Cell, raw: string) =>
    raw ? null : phase === 'rewrite' && col === 3 && row === 1 ? '=' : phase === 'sum' && col === 3 && row === 6 ? '=SUMA(' : null;
  /* Suma kończy się na zakresie — po przeciągnięciu po D2:D6 zatwierdza się sama. */
  const commitOnPoint = ({ col, row }: Cell) => phase === 'sum' && col === 3 && row === 6;
  const sheet = useSheetEditor({ initial: START, cols: COLS, rows: ROWS, editable, onChange: judge, autoStart, commitOnPoint });

  const { setCell, select } = sheet;

  /* Formuła kolegi zrobiła swoje — w kroku 2 dziecko zaczyna od pustej D2, a nie dopisuje za `=4*3`. */
  const entered = useRef<Phase>(phase);
  useEffect(() => {
    if (entered.current === phase) return;
    entered.current = phase;
    if (phase !== 'rewrite') return;
    setCell('D2', '');
    select({ col: 3, row: 1 });
  }, [phase, setCell, select]);

  const editing = sheet.draft !== null;
  const activeEditable = !!sheet.active && editable(sheet.active);
  const activeAddress = sheet.active ? addr(sheet.active.col, sheet.active.row) : null;
  const step = STEPS[phase];
  const target = phase === 'sum' ? 'D7' : 'D2';
  /* Co stoi w komórce, nad którą dziecko teraz pracuje — w trakcie edycji to szkic z paska. */
  const working = (activeAddress === target ? sheet.draft : null) ?? sheet.cells[target] ?? '';
  const flat = working.replace(/\s+/g, '').toUpperCase();

  /** Pusta komórka w kroku 2 i 4 dostaje początek formuły sama — dziecko od razu wskazuje komórki. */
  const startEdit = () => {
    if (!sheet.startEdit()) return;
    if (!activeAddress || sheet.cells[activeAddress]) return;
    if (phase === 'rewrite' && activeAddress === 'D2') sheet.insert('=');
    if (phase === 'sum' && activeAddress === 'D7') sheet.insert('=SUMA(');
  };

  /** Brakujący nawias domykamy przy zatwierdzeniu — o nawiasy ta lekcja nie jest. */
  const commit = () => {
    const text = sheet.draft;
    if (text !== null && text.startsWith('=')) {
      const missing = (text.match(/\(/g)?.length ?? 0) - (text.match(/\)/g)?.length ?? 0);
      if (missing > 0) sheet.changeDraft(text + ')'.repeat(missing), text.length + missing);
    }
    sheet.commit();
  };

  const restart = () => {
    sheet.cancel();
    setCell(target, '');
    select(phase === 'sum' ? { col: 3, row: 6 } : { col: 3, row: 1 });
    setNote(null);
  };

  const checklist: { label: ReactNode; done: boolean }[] | null =
    phase === 'rewrite'
      ? [
          { label: <>Stuknij w pustą komórkę <strong>D2</strong> — znak = wpisze się sam</>, done: flat.startsWith('=') },
          { label: <>Stuknij w komórkę <strong>B2</strong> (cena) — jej adres wpisze się sam</>, done: /^=B2/.test(flat) },
          { label: <>Stuknij przycisk <strong>*</strong> pod paskiem</>, done: /^=B2\*/.test(flat) },
          { label: <>Stuknij w komórkę <strong>C2</strong> (sztuki)</>, done: flat === '=B2*C2' },
          { label: <>Zatwierdź przyciskiem ✓ przy pasku albo klawiszem Enter</>, done: false },
        ]
      : phase === 'sum'
        ? [
            { label: <>Stuknij w pustą komórkę <strong>D7</strong> — =SUMA( wpisze się samo</>, done: flat.startsWith('=SUMA(') },
            { label: <>Przeciągnij palcem po siatce <strong>od D2 do D6</strong> i puść — suma zatwierdzi się sama</>, done: false },
          ]
        : null;
  const nextIndex = checklist ? checklist.findIndex((item) => !item.done) : -1;
  const wrongCell = !editing && !!activeAddress && !activeEditable && phase !== 'done';
  const canRestart = (phase === 'rewrite' || phase === 'sum') && !!sheet.cells[target] && note?.tone === 'no';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-4 flex flex-wrap gap-1.5">
        {(['copy-dead', 'rewrite', 'fill-live', 'sum'] as Phase[]).map((item, index) => {
          const order = ['copy-dead', 'rewrite', 'fill-live', 'sum', 'done'];
          const past = order.indexOf(phase) > index;
          const current = phase === item;
          return (
            <span
              key={item}
              className={cn('inline-flex items-center gap-1 border px-2 py-0.5 text-[11px] font-semibold', !past && !current && 'text-muted-foreground')}
              style={current ? { borderColor: color, color } : past ? { backgroundColor: `${color}14`, borderColor: `${color}44` } : undefined}
            >
              {past && <Check className="h-3 w-3" aria-hidden />}
              {index + 1}. {STEPS[item].short}
            </span>
          );
        })}
      </div>

      <div className="space-y-4 lg:grid lg:grid-cols-[minmax(0,320px)_minmax(0,1fr)] lg:gap-5 lg:space-y-0">
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">Zakupy na wycieczkę · ceny w złotych</p>
          <FormulaBar
            color={color}
            active={sheet.active}
            content={sheet.content}
            draft={sheet.draft}
            editable={activeEditable}
            inputRef={sheet.inputRef}
            onStart={startEdit}
            onDraft={sheet.changeDraft}
            onCaret={sheet.setCaret}
            onCommit={commit}
            onCancel={sheet.cancel}
            placeholder={activeEditable ? 'zacznij od =' : undefined}
          />
          {/* Miejsce na przyciski jest zarezerwowane — inaczej siatka podskakuje pod palcem w trakcie przeciągania. */}
          <div className={cn((!activeEditable || phase === 'copy-dead') && 'invisible')} aria-hidden={!activeEditable || phase === 'copy-dead'}>
            <SymbolPad
              color={color}
              symbols={phase === 'sum' || phase === 'done' ? ['=', 'SUMA(', ':', ')', '+'] : ['=', '*', '+']}
              onInsert={sheet.insert}
            />
          </div>
          <SheetGrid
            cols={COLS}
            rows={ROWS}
            widths={WIDTHS}
            cells={sheet.cells}
            values={sheet.values}
            color={color}
            active={sheet.active}
            selection={sheet.selection}
            mode="range"
            onGesture={sheet.gesture}
            highlights={sheet.highlights}
            flashes={sheet.flashes}
            onFill={editing ? undefined : sheet.fill}
            fillPreview={sheet.fillPreview}
            canFill={(cell) =>
              phase !== 'rewrite' &&
              cell.col === 3 &&
              cell.row >= 1 &&
              cell.row <= 5 &&
              isFormula(sheet.cells[addr(cell.col, cell.row)])
            }
            decorate={(address) =>
              address.endsWith('1') && address.length === 2
                ? { className: 'font-semibold' }
                : address === 'A7'
                  ? { className: 'font-semibold' }
                  : undefined
            }
          />
          {sheet.hint && <p className="text-xs text-amber-700 dark:text-amber-400">{sheet.hint}</p>}
        </div>

        <div className="space-y-3">
          <div className="border-l-2 pl-3" style={{ borderColor: color }}>
            <p className="flex items-start gap-1.5 text-sm font-semibold leading-snug">
              <MousePointerClick className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              {step.title}
            </p>
            <div className="mt-1 text-sm leading-relaxed">{step.body}</div>
            {checklist && (
              <ol className="mt-2 space-y-1 text-sm">
                {checklist.map((item, index) => {
                  const current = index === nextIndex;
                  return (
                    <li key={index} className={cn('flex items-start gap-2', !item.done && !current && 'text-muted-foreground')}>
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] font-semibold"
                        style={
                          item.done
                            ? { backgroundColor: color, borderColor: color, color: 'white' }
                            : current
                              ? { borderColor: color, color }
                              : undefined
                        }
                      >
                        {item.done ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
                      </span>
                      <span className={cn(current && 'font-semibold')}>{item.label}</span>
                    </li>
                  );
                })}
              </ol>
            )}
            {wrongCell && (
              <p className="mt-2 text-xs text-amber-700 dark:text-amber-400">
                Komórka {activeAddress} jest teraz zamknięta. Stuknij w <strong>{target}</strong>.
              </p>
            )}
            {canRestart && (
              <button
                type="button"
                onClick={restart}
                className="mt-2 inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs font-semibold"
                style={{ borderColor: color, color }}
              >
                <RotateCcw className="h-3.5 w-3.5" aria-hidden />
                Wyczyść {target} i zacznij od nowa
              </button>
            )}
          </div>

          {note && (
            <motion.p
              key={String(note.text)}
              initial={{ opacity: 0, y: 4 }}
              animate={{ opacity: 1, y: 0 }}
              className={cn(
                'border-l-2 p-3 text-sm leading-relaxed',
                note.tone === 'ok' ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
              )}
              style={note.tone === 'ok' ? { borderColor: color } : undefined}
            >
              {note.text}
            </motion.p>
          )}

          <div className="border p-3">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              Co naprawdę siedzi w kolumnie D
            </p>
            <ul className="mt-1.5 space-y-0.5 font-mono text-xs">
              {[...LINE_ROWS, 6].map((row) => {
                const address = addr(3, row);
                const raw = sheet.cells[address];
                return (
                  <li key={address} className="flex items-baseline gap-2">
                    <span className="w-6 shrink-0 text-muted-foreground">{address}</span>
                    {raw ? (
                      <span className={cn(isDeadFormula(raw) && 'text-amber-700 dark:text-amber-400')}>
                        <ColoredFormula text={raw} />
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}

const STEPS: Record<Phase, { short: string; title: string; body: ReactNode }> = {
  'copy-dead': {
    short: 'formuła kolegi',
    title: 'Skopiuj formułę kolegi w dół',
    body: (
      <>
        Kolega policzył sok: w D2 wpisał <span className="font-mono">=4*3</span> i wyszło 12 zł. Stuknij w D2, złap{' '}
        <strong>mały kwadracik w jego prawym dolnym rogu</strong> i przeciągnij w dół aż do D6.
      </>
    ),
  },
  rewrite: {
    short: 'adresy',
    title: 'Napisz formułę, która wie, skąd brać liczby',
    body: (
      <>
        Zamiast wpisywać liczby, <strong>pokaż arkuszowi komórki</strong>, w których one stoją: cenę i liczbę sztuk.
      </>
    ),
  },
  'fill-live': {
    short: 'kopiowanie',
    title: 'Skopiuj swoją formułę w dół',
    body: (
      <>
        Ten sam ruch co na początku: stuknij w D2, złap <strong>mały kwadracik w prawym dolnym rogu</strong> i przeciągnij
        w dół do D6. Patrz na listę poniżej.
      </>
    ),
  },
  sum: {
    short: 'suma',
    title: 'Policz wszystko razem',
    body: (
      <>
        <strong>SUMA</strong> dodaje wszystkie komórki z zaznaczonego kawałka arkusza — wystarczy go pokazać.
      </>
    ),
  },
  done: {
    short: 'gotowe',
    title: 'Gotowe',
    body: <>Zmień dowolną cenę albo liczbę sztuk i popatrz, co się przeliczy.</>,
  },
};
