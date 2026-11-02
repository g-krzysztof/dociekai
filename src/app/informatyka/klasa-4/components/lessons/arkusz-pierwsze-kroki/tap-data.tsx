'use client';

import { useCallback, useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, Hand, Lightbulb, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  addr,
  displayValue,
  evaluateSheet,
  formatNumber,
  formulaReferences,
  isDeadFormula,
  isFormula,
  type RawCells,
} from '../../../lib/formula';
import { FormulaBar, SheetGrid, SymbolPad, useSheetEditor, type Cell } from './sheet-grid';
import { ChartView } from './chart-view';
import type { ChartModel } from './chart';
import { directionIn, numbersIn, sameNumber } from './conclusion';

/**
 * Blok 4 — ćwiczenie. **Dane, których nie wymyślił nikt z nas: dziecko robi je
 * własną ręką.**
 *
 * Do tej pory arkusze w lekcji miały cudze liczby i cudze pytania, więc wniosek
 * dało się zapisać z góry. Tutaj nie: dziecko stuka przez pięć sekund, na
 * zmianę prawą i lewą ręką (na zmianę — żeby zmęczenie rozłożyło się po równo;
 * to jest prawdziwy kawałek planowania doświadczenia, powiedziany wprost), a
 * liczby **wpadają do arkusza**. Potem samo liczy średnie formułą i pisze wniosek.
 *
 * Wniosek jest **wolnym tekstem sprawdzanym jawnymi regułami** (`conclusion.ts`),
 * a nie wyborem z listy — bo prawdziwej odpowiedzi nie znamy przed pomiarem.
 * Reguła, której nie było jeszcze w kursie: **zdanie musi się zgadzać z liczbami
 * dziecka**. „Prawą stukam więcej” jest dobre u jednego i fałszywe u drugiego.
 *
 * Przy małej różnicy widżet mówi uczciwie, że przy trzech próbach to może być
 * przypadek, i przyjmuje „prawie tak samo” — nie udajemy, że trzy pomiary
 * rozstrzygają cokolwiek na dziesiąte części stuknięcia.
 */

const DURATION = 5000;
const COOLDOWN = 900;
const TRIES: ('prawa' | 'lewa')[] = ['prawa', 'lewa', 'prawa', 'lewa', 'prawa', 'lewa'];

type Phase = 'measure' | 'formula' | 'conclude' | 'done';

function cellsFor(results: number[]): RawCells {
  const cells: RawCells = { A1: 'Próba', B1: 'prawa', C1: 'lewa', A2: '1.', A3: '2.', A4: '3.', A5: 'średnio' };
  results.forEach((value, index) => {
    const col = TRIES[index] === 'prawa' ? 'B' : 'C';
    cells[`${col}${Math.floor(index / 2) + 2}`] = String(value);
  });
  return cells;
}

interface TapDataProps {
  color: string;
  /** Pomiary po zakończeniu — lekcja przekazuje je do zadania praktycznego. */
  onData?: (results: number[]) => void;
  onComplete?: () => void;
}

export function TapData({ color, onData, onComplete }: TapDataProps) {
  const [phase, setPhase] = useState<Phase>('measure');
  const [results, setResults] = useState<number[]>([]);
  const [averages, setAverages] = useState<{ right: number; left: number } | null>(null);
  const anchorRef = useSectionScrollAnchor(phase === 'measure' ? 0 : 1);

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      {phase === 'measure' && (
        <Measure
          color={color}
          results={results}
          onResult={(value) => setResults((current) => [...current, value])}
          onDone={() => {
            onData?.(results);
            setPhase('formula');
          }}
        />
      )}
      {phase === 'formula' && (
        <Averages
          color={color}
          results={results}
          onDone={(right, left) => {
            setAverages({ right, left });
            setPhase('conclude');
          }}
        />
      )}
      {(phase === 'conclude' || phase === 'done') && averages && (
        <Conclude
          color={color}
          results={results}
          averages={averages}
          onDone={() => {
            if (phase === 'done') return;
            setPhase('done');
            onComplete?.();
          }}
        />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 1. Pomiar                                                           */
/* ------------------------------------------------------------------ */

function Measure({
  color,
  results,
  onResult,
  onDone,
}: {
  color: string;
  results: number[];
  onResult: (value: number) => void;
  onDone: () => void;
}) {
  const [count, setCount] = useState(0);
  const [running, setRunning] = useState(false);
  const [remaining, setRemaining] = useState(DURATION);
  const [cooling, setCooling] = useState(false);
  const started = useRef(0);
  const counter = useRef(0);
  const finished = results.length >= TRIES.length;
  const hand = TRIES[Math.min(results.length, TRIES.length - 1)];

  const values = useMemo(() => evaluateSheet(cellsFor(results), {}), [results]);
  const lastAddress = results.length
    ? `${TRIES[results.length - 1] === 'prawa' ? 'B' : 'C'}${Math.floor((results.length - 1) / 2) + 2}`
    : null;

  useEffect(() => {
    if (!running) return;
    const timer = window.setInterval(() => {
      const left = DURATION - (performance.now() - started.current);
      if (left <= 0) {
        window.clearInterval(timer);
        setRunning(false);
        setRemaining(DURATION);
        setCooling(true);
        onResult(counter.current);
        window.setTimeout(() => setCooling(false), COOLDOWN);
      } else {
        setRemaining(left);
      }
    }, 50);
    return () => window.clearInterval(timer);
  }, [running, onResult]);

  const tap = () => {
    if (finished || cooling) return;
    if (!running) {
      started.current = performance.now();
      counter.current = 1;
      setCount(1);
      setRemaining(DURATION);
      setRunning(true);
      return;
    }
    counter.current += 1;
    setCount(counter.current);
  };

  const pointer = (event: PointerEvent<HTMLButtonElement>) => {
    event.preventDefault();
    tap();
  };
  const key = (event: KeyboardEvent<HTMLButtonElement>) => {
    if ((event.key === ' ' || event.key === 'Enter') && !event.repeat) {
      event.preventDefault();
      tap();
    }
  };

  return (
    <div>
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Pytanie badawcze: <strong>którą ręką stukasz szybciej?</strong> Zrobisz sześć pomiarów po pięć sekund —{' '}
          <strong>na zmianę</strong> prawą i lewą ręką, żeby zmęczenie rozłożyło się po równo. Stukaj jednym palcem (albo
          klikaj myszką) tak szybko, jak umiesz. Liczby same wpiszą się do arkusza.
        </p>
      </div>

      <div className="space-y-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,230px)] sm:gap-5 sm:space-y-0">
        <div>
          {!finished ? (
            <>
              <p className="mb-2 flex items-center gap-2 text-sm">
                <span className="font-mono text-xs text-muted-foreground">
                  pomiar {results.length + 1} z {TRIES.length}
                </span>
                <span className="inline-flex items-center gap-1 font-semibold" style={{ color }}>
                  <Hand className={cn('h-4 w-4', hand === 'lewa' && '-scale-x-100')} aria-hidden />
                  {hand === 'prawa' ? 'PRAWĄ' : 'LEWĄ'} ręką
                </span>
              </p>
              <button
                type="button"
                onPointerDown={pointer}
                onKeyDown={key}
                disabled={cooling}
                className={cn(
                  'relative flex h-44 w-full cursor-pointer select-none flex-col items-center justify-center overflow-hidden border-2 transition-colors',
                  cooling && 'cursor-default opacity-60'
                )}
                style={{ borderColor: color, touchAction: 'manipulation', backgroundColor: running ? `${color}10` : undefined }}
                aria-label={running ? `Stukaj! ${count}` : `Stuknij, żeby zacząć pomiar ${hand} ręką`}
              >
                {running && (
                  <span
                    className="absolute bottom-0 left-0 h-1.5"
                    style={{ width: `${(remaining / DURATION) * 100}%`, backgroundColor: color }}
                    aria-hidden
                  />
                )}
                <span className="font-mono text-5xl font-bold tabular-nums" style={{ color }}>
                  {running ? count : cooling ? results[results.length - 1] : '0'}
                </span>
                <span className="mt-1 text-sm text-muted-foreground">
                  {running
                    ? `stukaj! zostało ${(remaining / 1000).toFixed(1).replace('.', ',')} s`
                    : cooling
                      ? 'koniec — zmiana ręki'
                      : 'stuknij, żeby zacząć'}
                </span>
              </button>
            </>
          ) : (
            <div className="space-y-3 p-3" style={{ backgroundColor: `${color}14` }}>
              <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
                <Check className="h-4 w-4" aria-hidden /> Sześć pomiarów w arkuszu
              </p>
              <p className="text-sm leading-relaxed">
                To są <strong>twoje dane</strong> — nikt inny nie ma takich samych. Każdy pomiar trochę się różni, nawet tą
                samą ręką, i dlatego do wniosku nie wystarczy jedna próba. Policzmy średnie.
              </p>
              <button
                type="button"
                onClick={onDone}
                className="border px-3 py-1.5 text-sm font-semibold text-white"
                style={{ backgroundColor: color, borderColor: color }}
              >
                Dalej: policz średnie
              </button>
            </div>
          )}
        </div>

        <SheetGrid
          cols={3}
          rows={5}
          widths={[62, 58, 58]}
          cells={cellsFor(results)}
          values={values}
          color={color}
          mode="none"
          flashes={lastAddress ? { [lastAddress]: results.length } : undefined}
          decorate={(address) =>
            address.endsWith('1') && address.length === 2
              ? { className: 'font-semibold' }
              : address === lastAddress
                ? { style: { fontWeight: 700 } }
                : undefined
          }
        />
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Średnie formułą                                                  */
/* ------------------------------------------------------------------ */

function Averages({
  color,
  results,
  onDone,
}: {
  color: string;
  results: number[];
  onDone: (right: number, left: number) => void;
}) {
  const [note, setNote] = useState<{ ok: boolean; text: ReactNode } | null>(null);
  const reported = useRef(false);
  const expected = useMemo(() => {
    const right = results.filter((_, index) => TRIES[index] === 'prawa');
    const left = results.filter((_, index) => TRIES[index] === 'lewa');
    const mean = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;
    return { right: mean(right), left: mean(left), rightSum: right.reduce((a, b) => a + b, 0), leftSum: left.reduce((a, b) => a + b, 0) };
  }, [results]);

  /** Kontrola jednej średniej — `col` 1 to prawa (B), 2 to lewa (C). */
  const checkOne = useCallback(
    (cells: RawCells, col: number): { ok: boolean; text?: ReactNode } => {
      const address = addr(col, 4);
      const raw = cells[address];
      const who = col === 1 ? 'prawej' : 'lewej';
      if (!raw) return { ok: false };
      if (!isFormula(raw)) return { ok: false, text: <>W {address} stoi zwykła liczba albo napis. Średnią ma policzyć formuła.</> };
      if (isDeadFormula(raw))
        return { ok: false, text: <>W {address} są same liczby — martwa średnia. Zaznacz komórki z pomiarami {who} ręki.</> };
      const values = evaluateSheet(cells, {});
      const value = values[address];
      if (value?.t === 'err' && value.code === '#CYKL!')
        return { ok: false, text: <>Średnia w {address} liczy samą siebie. Zakres ma kończyć się na wierszu 4.</> };
      const refs = formulaReferences(raw.slice(1));
      const covered = [1, 2, 3].filter((row) => refs.some((ref) => ref.box.c1 <= col && ref.box.c2 >= col && ref.box.r1 <= row && ref.box.r2 >= row));
      const foreign = refs.some((ref) => ref.box.c1 !== col || ref.box.c2 !== col);
      if (foreign)
        return { ok: false, text: <>Średnia {who} ręki sięga do innej kolumny. Obwódka ma objąć tylko pomiary {who} ręki.</> };
      if (covered.length < 3)
        return {
          ok: false,
          text: (
            <>
              Średnia w {address} bierze {covered.length === 1 ? 'jeden pomiar' : `${covered.length} pomiary`} z trzech. Zaznacz
              wszystkie trzy.
            </>
          ),
        };
      const target = col === 1 ? expected.right : expected.left;
      const sum = col === 1 ? expected.rightSum : expected.leftSum;
      if (value?.t === 'num' && Math.abs(value.v - sum) < 0.001 && Math.abs(sum - target) > 0.001)
        return {
          ok: false,
          text: (
            <>
              W {address} wyszło {formatNumber(value.v)} — to <strong>suma</strong> trzech pomiarów, a nie średnia. Średnia to
              suma podzielona przez liczbę pomiarów; <strong>ŚREDNIA</strong> zrobi to sama.
            </>
          ),
        };
      if (value?.t !== 'num' || Math.abs(value.v - target) > 0.01)
        return { ok: false, text: <>W {address} wyszło {displayValue(value)}, a średnia {who} ręki to {formatNumber(target)}.</> };
      return { ok: true };
    },
    [expected]
  );

  const judge = useCallback(
    (cells: RawCells, changed: string[]) => {
      const right = checkOne(cells, 1);
      const left = checkOne(cells, 2);
      if (right.ok && left.ok) {
        setNote({ ok: true, text: null });
        if (!reported.current) {
          reported.current = true;
          window.setTimeout(() => onDone(expected.right, expected.left), 1400);
        }
        return;
      }
      const touchedRight = changed.includes('B5');
      const problem = (touchedRight ? right.text ?? left.text : left.text ?? right.text) ?? null;
      if (right.ok && !cells.C5)
        setNote({ ok: true, text: <>Prawa ręka policzona. Teraz lewa — złap uchwyt B5 i przeciągnij w bok do C5.</> });
      else if (problem) setNote({ ok: false, text: problem });
    },
    [checkOne, expected, onDone]
  );

  const editable = useCallback(({ col, row }: Cell) => row === 4 && (col === 1 || col === 2), []);
  const sheet = useSheetEditor({ initial: cellsFor(results), cols: 3, rows: 5, editable, onChange: judge });
  const activeEditable = !!sheet.active && editable(sheet.active);

  return (
    <div>
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Trzy pomiary na rękę to za dużo, żeby je porównywać na oko. Policz <strong>średnią</strong> każdej ręki. Stuknij w{' '}
          <strong>B5</strong>, wpisz <strong>=ŚREDNIA(</strong>, przeciągnij palcem po pomiarach prawej ręki (B2 do B4), zamknij
          nawias i zatwierdź. Lewą rękę policzysz, <strong>kopiując formułę uchwytem w bok</strong>.
        </p>
      </div>

      <div className="space-y-3 sm:max-w-[360px]">
        <FormulaBar
          color={color}
          active={sheet.active}
          content={sheet.content}
          draft={sheet.draft}
          editable={activeEditable}
          inputRef={sheet.inputRef}
          onStart={sheet.startEdit}
          onDraft={sheet.changeDraft}
          onCaret={sheet.setCaret}
          onCommit={sheet.commit}
          onCancel={sheet.cancel}
          placeholder={activeEditable ? 'zacznij od =' : 'stuknij w B5'}
        />
        {activeEditable && <SymbolPad color={color} symbols={['=', 'ŚREDNIA(', ':', ')', '+', '/']} onInsert={sheet.insert} />}
        <SheetGrid
          cols={3}
          rows={5}
          widths={[62, 58, 58]}
          cells={sheet.cells}
          values={sheet.values}
          color={color}
          active={sheet.active}
          selection={sheet.selection}
          mode="range"
          onGesture={sheet.gesture}
          highlights={sheet.highlights}
          flashes={sheet.flashes}
          onFill={sheet.draft === null ? sheet.fill : undefined}
          fillPreview={sheet.fillPreview}
          canFill={(cell) => cell.row === 4 && cell.col === 1 && isFormula(sheet.cells.B5)}
          decorate={(address) => (address.endsWith('1') && address.length === 2 ? { className: 'font-semibold' } : undefined)}
        />
        {sheet.hint && <p className="text-xs text-amber-700 dark:text-amber-400">{sheet.hint}</p>}

        {note && (note.text || note.ok) && (
          <p
            className={cn(
              'border-l-2 p-3 text-sm leading-relaxed',
              note.ok ? 'bg-emerald-50 dark:bg-emerald-950/30' : 'border-amber-500 bg-amber-50 dark:bg-amber-950/30'
            )}
            style={note.ok ? { borderColor: color } : undefined}
          >
            {note.text ?? (
              <>
                <strong>Obie średnie policzone.</strong> Prawa: {formatNumber(expected.right)}, lewa:{' '}
                {formatNumber(expected.left)}. Za chwilę wniosek.
              </>
            )}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Wniosek                                                          */
/* ------------------------------------------------------------------ */

interface Rule {
  id: string;
  label: string;
  ok: boolean;
  note?: ReactNode;
}

function Conclude({
  color,
  results,
  averages,
  onDone,
}: {
  color: string;
  results: number[];
  averages: { right: number; left: number };
  onDone: () => void;
}) {
  const [text, setText] = useState('');
  const [checked, setChecked] = useState<string | null>(null);
  const diff = averages.right - averages.left;
  const gap = Math.abs(diff);
  const rounded = Math.round(gap * 10) / 10;

  const model: ChartModel = {
    kind: 'column',
    categories: ['prawa ręka', 'lewa ręka'],
    series: [{ name: 'średnio', values: [averages.right, averages.left] }],
    namedCategories: true,
  };

  const rules = useMemo<Rule[] | null>(() => {
    if (checked === null) return null;
    const source = checked;
    const lower = source.toLowerCase();
    const rightAt = lower.search(/(?<![\p{L}])praw/u);
    const leftAt = lower.search(/(?<![\p{L}])lew/u);
    const both = /(?<![\p{L}])(obie|obiema|oboma|obu|każdą|każda)(?![\p{L}])/u.test(lower);
    const subject: 'prawa' | 'lewa' | null =
      rightAt === -1 && leftAt === -1 ? null : leftAt === -1 || (rightAt !== -1 && rightAt < leftAt) ? 'prawa' : 'lewa';
    const direction = directionIn(source);

    const handOk = subject !== null || (both && direction === 'same');
    const directionOk = direction !== null;

    let agrees = false;
    let agreeNote: ReactNode = null;
    if (direction === 'same') {
      agrees = gap < 1.5;
      if (!agrees)
        agreeNote = (
          <>
            Średnie różnią się o {formatNumber(rounded)} stuknięcia — to za dużo na „tyle samo”.
          </>
        );
    } else if (direction && subject) {
      const subjectDiff = subject === 'prawa' ? diff : -diff;
      agrees = direction === 'more' ? subjectDiff > 0 : subjectDiff < 0;
      if (!agrees)
        agreeNote =
          gap === 0 ? (
            <>Średnie wyszły dokładnie równe — żadna ręka nie była szybsza.</>
          ) : (
            <>
              Z twoich liczb wychodzi odwrotnie: {subject === 'prawa' ? 'prawa' : 'lewa'} ręka ma średnio{' '}
              {formatNumber(subject === 'prawa' ? averages.right : averages.left)}, a{' '}
              {subject === 'prawa' ? 'lewa' : 'prawa'} {formatNumber(subject === 'prawa' ? averages.left : averages.right)}.
            </>
          );
    } else if (direction && !subject) {
      agreeNote = <>Nie wiem, której ręki dotyczy to porównanie.</>;
    }

    const facts = [averages.right, averages.left, gap, ...results];
    const numberOk = numbersIn(source).some((value) => facts.some((fact) => sameNumber(value, fact)));

    return [
      { id: 'reka', label: 'Mówi, o której ręce.', ok: handOk, note: handOk ? undefined : <>Napisz, czy chodzi o prawą, czy o lewą rękę.</> },
      {
        id: 'kierunek',
        label: 'Porównuje: więcej, mniej albo tyle samo.',
        ok: directionOk,
        note: directionOk ? undefined : <>Brakuje słowa porównania — „więcej”, „szybciej”, „mniej”, „tyle samo”.</>,
      },
      { id: 'zgodne', label: 'Zgadza się z twoimi liczbami.', ok: handOk && directionOk && agrees, note: agreeNote },
      {
        id: 'liczba',
        label: 'Powołuje się na liczbę z arkusza.',
        ok: numberOk,
        note: numberOk ? undefined : (
          <>
            Dopisz liczbę: średnią którejś ręki albo <strong>o ile</strong> się różnią (u ciebie około {formatNumber(rounded)}).
          </>
        ),
      },
    ];
  }, [checked, averages, diff, gap, rounded, results]);

  const allOk = !!rules && rules.every((rule) => rule.ok);
  const reported = useRef(false);
  useEffect(() => {
    if (allOk && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [allOk, onDone]);

  return (
    <div>
      <div className="mb-4 border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm leading-relaxed">
          Arkusz policzył, wykres pokazuje. Ostatni krok robi już tylko człowiek: <strong>wniosek</strong>. Napisz jedno
          zdanie, które odpowiada na pytanie badawcze — i które da się sprawdzić w twoich liczbach.
        </p>
      </div>

      <div className="space-y-4 sm:grid sm:grid-cols-[minmax(0,1fr)_minmax(0,300px)] sm:gap-5 sm:space-y-0">
        <div className="space-y-3">
          <label className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground" htmlFor="tap-conclusion">
            Mój wniosek
          </label>
          <textarea
            id="tap-conclusion"
            value={text}
            onChange={(event) => setText(event.target.value)}
            rows={3}
            placeholder="np. …ręką stukam … o …"
            className="w-full resize-y border bg-white p-2 text-sm leading-relaxed outline-none focus:border-current dark:bg-zinc-950"
            style={{ color: undefined }}
          />
          <button
            type="button"
            onClick={() => setChecked(text)}
            disabled={text.trim().length < 5}
            className="border px-3 py-1.5 text-sm font-semibold text-white transition-opacity disabled:cursor-default disabled:opacity-40"
            style={{ backgroundColor: color, borderColor: color }}
          >
            Sprawdź wniosek
          </button>

          {rules && (
            <ul className="space-y-1.5">
              {rules.map((rule) => (
                <li key={rule.id} className="flex items-start gap-2 text-sm">
                  <span
                    className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
                    style={{ backgroundColor: rule.ok ? color : '#d4643a' }}
                    aria-hidden
                  >
                    {rule.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                  </span>
                  <span className="min-w-0 leading-snug">
                    {rule.label}
                    {!rule.ok && rule.note && (
                      <span className="mt-0.5 block text-xs leading-relaxed text-amber-700 dark:text-amber-400">{rule.note}</span>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          )}

          <AnimatePresence>
            {allOk && (
              <motion.div
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-2 p-3 text-sm leading-relaxed"
                style={{ backgroundColor: `${color}14` }}
              >
                <p className="font-semibold" style={{ color }}>
                  To jest wniosek z danych.
                </p>
                <p>
                  Nie „wydaje mi się”, tylko zdanie, które każdy może sprawdzić w twoim arkuszu. Tabela zebrała liczby,
                  formuła je policzyła, wykres pokazał różnicę — a <strong>powiedzieć, co z tego wynika, musiał człowiek</strong>.
                </p>
                {gap < 2 && (
                  <p className="flex items-start gap-1.5">
                    <Lightbulb className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                    <span>
                      Uczciwie: przy trzech pomiarach różnica {formatNumber(rounded)} stuknięcia może być przypadkiem.
                      Naukowiec zrobiłby więcej pomiarów, zanim ogłosiłby zwycięzcę.
                    </span>
                  </p>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="space-y-2">
          <div className="border p-2">
            <ChartView model={model} color={color} title="Średnio stuknięć w 5 sekund" />
          </div>
          <p className="text-xs leading-relaxed text-muted-foreground">
            Pomiary: prawa {results.filter((_, i) => TRIES[i] === 'prawa').join(', ')} · lewa{' '}
            {results.filter((_, i) => TRIES[i] === 'lewa').join(', ')}
          </p>
        </div>
      </div>
    </div>
  );
}
