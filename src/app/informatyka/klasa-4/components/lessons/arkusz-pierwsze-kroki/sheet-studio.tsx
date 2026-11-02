'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { BarChart3, Check, Minus, Plus, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell, type ProofCriterion, type ProofOutcome, type ProofVerdicts } from '../../task-shell';
import {
  addr,
  displayValue,
  evaluateSheet,
  formatNumber,
  formulaFunctions,
  formulaReferences,
  isDeadFormula,
  isFormula,
  type Box,
  type CellValue,
  type RawCells,
} from '../../../lib/formula';
import { FormulaBar, SheetGrid, SymbolPad, boxOf, boxText, useSheetEditor, type Cell, type GesturePhase } from './sheet-grid';
import { ChartView } from './chart-view';
import { chartFromBox } from './chart';

/**
 * Blok 5 — zadanie praktyczne. **Ten sam eksperyment co w bloku 4, złożony w
 * jeden arkusz w trzech ruchach.**
 *
 * Przebudowa z 2026-10-17. Pierwsza wersja dawała wolny arkusz 5 × 9, pięć
 * kryteriów, podgląd celu z gotowym arkuszem i wniosek pisany wolnym tekstem —
 * użytkownik ocenił ją jako „zbyt wymagającą, długą i skomplikowaną”: to wstęp
 * do arkusza dla dziesięciolatka, ma być zabawą. Teraz:
 *
 * - **tabela stoi gotowa** (pomiary dziecka z bloku 4 albo przykładowe) i nie da
 *   się jej zepsuć — edytowalne są tylko komórki średnich;
 * - **trzy ruchy, każdy jednym znanym gestem**: średnia (stuknij B5, przeciągnij
 *   po pomiarach, uchwytem w bok do C5 — `=ŚREDNIA(` i nawias wpisują się same),
 *   wykres (przeciągnij zaznaczenie, jeden przycisk) i **zdanie składane z
 *   klocków** zamiast wolnego tekstu (która ręka + o ile);
 * - werdykt ma trzy punkty i sprawdza je na **liczbach dziecka**: zdanie musi
 *   zgadzać się z jego średnimi, więc nie da się go przepisać z przykładu;
 * - **nagrodą jest zabawa**: „spraw, żeby lewa ręka wygrała” — dziecko podbija
 *   pomiary, średnie i wykres przeliczają się same, a jego zdanie, zwykły tekst,
 *   w pewnej chwili przestaje być prawdą. To ta sama lekcja co w bloku 1
 *   (żywe formuły kontra martwe wpisy), tym razem na jego własnej pracy.
 */

const SAMPLE = { right: [32, 35, 34], left: [27, 29, 30] };

interface Measurements {
  right: number[];
  left: number[];
  own: boolean;
}

function split(results: number[] | null): Measurements {
  if (!results || results.length < 6) return { ...SAMPLE, own: false };
  return {
    right: results.filter((_, index) => index % 2 === 0).slice(0, 3),
    left: results.filter((_, index) => index % 2 === 1).slice(0, 3),
    own: true,
  };
}

function sheetCells(data: { right: number[]; left: number[] }): RawCells {
  const cells: RawCells = { A1: 'Próba', B1: 'prawa', C1: 'lewa', A5: 'średnio' };
  data.right.forEach((value, i) => {
    cells[`A${i + 2}`] = `${i + 1}.`;
    cells[`B${i + 2}`] = String(value);
    cells[`C${i + 2}`] = String(data.left[i]);
  });
  return cells;
}

const COLS = 3;
const ROWS = 5;
const WIDTHS = [78, 64, 64];
/** Wiersz średnich (od zera) i wiersze pomiarów. */
const MEAN_ROW = 4;
const FIRST = 1;
const LAST = 3;

const mean = (list: number[]) => list.reduce((sum, value) => sum + value, 0) / list.length;

/* ------------------------------------------------------------------ */
/* Sędziowie trzech ruchów — czyste funkcje                            */
/* ------------------------------------------------------------------ */

type MeanState = 'empty' | 'typed' | 'dead' | 'not-average' | 'range' | 'ok';

/** Co stoi w komórce średniej kolumny `col`. */
function meanState(cells: RawCells, col: number): MeanState {
  const raw = cells[addr(col, MEAN_ROW)];
  if (!raw) return 'empty';
  if (!isFormula(raw)) return 'typed';
  if (isDeadFormula(raw)) return 'dead';
  if (!formulaFunctions(raw.slice(1)).includes('AVERAGE')) return 'not-average';
  const refs = formulaReferences(raw.slice(1));
  const exact = refs.length === 1 && refs[0].box.c1 === col && refs[0].box.c2 === col && refs[0].box.r1 === FIRST && refs[0].box.r2 === LAST;
  return exact ? 'ok' : 'range';
}

function meanNote(state: MeanState, address: string, column: string): ReactNode {
  switch (state) {
    case 'empty':
      return <>{address} jest jeszcze pusta.</>;
    case 'typed':
      return (
        <>
          W {address} stoi liczba wpisana z ręki. Arkusz jej nie przeliczy — wpisz formułę <span className="font-mono">=ŚREDNIA(</span>.
        </>
      );
    case 'dead':
      return <>W {address} formuła nie bierze żadnej komórki z pomiarami. Stuknij w {address} i przeciągnij palcem po pomiarach.</>;
    case 'not-average':
      return <>W {address} jest formuła, ale nie średnia. Potrzebna jest <span className="font-mono">ŚREDNIA</span>.</>;
    case 'range':
      return <>Średnia w {address} nie bierze wszystkich trzech pomiarów ręki {column}. Stuknij w {address} i przeciągnij od wiersza 2 do 4.</>;
    case 'ok':
      return null;
  }
}

type ChartState = 'none' | 'one-hand' | 'with-mean' | 'other' | 'ok';

function chartState(box: Box | null): ChartState {
  if (!box) return 'none';
  if (box.r2 >= MEAN_ROW) return 'with-mean';
  if (box.c2 < 2 || box.c1 > 1) return 'one-hand';
  if (box.r1 > FIRST || box.r2 < LAST) return 'other';
  return 'ok';
}

const CHART_NOTE: Record<Exclude<ChartState, 'ok'>, string> = {
  none: 'Wykresu jeszcze nie ma.',
  'one-hand': 'Wykres pokazuje tylko jedną rękę. Zaznacz obie kolumny pomiarów: prawą i lewą.',
  'with-mean': 'Do wykresu wpadł wiersz „średnio” — średnia stoi wtedy wśród pomiarów jak jeszcze jedna próba. Zaznacz tylko do wiersza 4.',
  other: 'Wykres nie obejmuje wszystkich trzech prób. Zaznacz od wiersza 1 (albo 2) do wiersza 4.',
};

type Hand = 'prawa' | 'lewa' | 'tak-samo';

interface Sentence {
  hand: Hand | null;
  by: number;
}

function sentenceText({ hand, by }: Sentence): string {
  if (hand === 'tak-samo') return 'Obiema rękami stukam tak samo szybko.';
  const who = hand === 'prawa' ? 'Prawą' : hand === 'lewa' ? 'Lewą' : '…';
  return `${who} ręką stukam średnio o ${by} ${by === 1 ? 'raz' : 'razy'} więcej.`;
}

/** Czy zdanie jest prawdą dla tych pomiarów. „O ile” przyjmujemy zaokrąglone w dół albo w górę. */
function sentenceTrue({ hand, by }: Sentence, right: number[], left: number[]): boolean {
  const diff = mean(right) - mean(left);
  if (hand === 'tak-samo') return Math.abs(diff) < 0.5;
  if (hand === 'prawa' && diff <= 0) return false;
  if (hand === 'lewa' && diff >= 0) return false;
  return Math.abs(by - Math.abs(diff)) < 1;
}

/* ------------------------------------------------------------------ */
/* Zadanie                                                             */
/* ------------------------------------------------------------------ */

const CRITERIA: ProofCriterion[] = [
  { id: 'srednie', label: 'Średnie obu rąk liczy arkusz — formułą z trzech pomiarów, nie z ręki.' },
  { id: 'wykres', label: 'Wykres pokazuje pomiary obu rąk, bez wiersza ze średnimi.' },
  { id: 'zdanie', label: 'Zdanie mówi, która ręka stuka więcej i o ile — zgodnie z twoimi średnimi.' },
];

interface StudioReport {
  cells: RawCells;
  chart: Box;
  sentence: Sentence;
}

interface SheetStudioProps {
  color: string;
  /** Pomiary z bloku 4 (na zmianę: prawa, lewa, …) — jeśli dziecko je zrobiło. */
  results: number[] | null;
  onComplete?: () => void;
}

export function SheetStudio({ color, results, onComplete }: SheetStudioProps) {
  const data = useMemo(() => split(results), [results]);
  const initial = useMemo(() => sheetCells(data), [data]);
  const editable = ({ col, row }: Cell) => row === MEAN_ROW && (col === 1 || col === 2);
  /*
   * Stuknięcie w B5 bez dobrej średniej zaczyna ją od nowa — także po nieudanej próbie,
   * żeby nie dało się utknąć na zatwierdzonym `=ŚREDNIA()`. C5 dopiero wtedy, gdy B5 jest
   * gotowa — wcześniej stuknięcie w nią nic nie zaczyna, bo C5 wypełnia uchwyt.
   */
  const autoStart = ({ col, row }: Cell) => {
    if (row !== MEAN_ROW) return null;
    if (col === 1 && meanState(sheet.cells, 1) !== 'ok') return '=ŚREDNIA(';
    if (col === 2 && meanState(sheet.cells, 1) === 'ok' && meanState(sheet.cells, 2) !== 'ok') return '=ŚREDNIA(';
    return null;
  };
  /* Średnia kończy się na zakresie — po puszczeniu palca zatwierdza się sama, ✓ nie trzeba szukać. */
  const commitOnPoint = ({ col, row }: Cell) => row === MEAN_ROW && (col === 1 || col === 2);
  const sheet = useSheetEditor({ initial, cols: COLS, rows: ROWS, editable, autoStart, commitOnPoint });
  const [chartBox, setChartBox] = useState<Box | null>(null);
  const [sentence, setSentence] = useState<Sentence>({ hand: null, by: 0 });
  const [checked, setChecked] = useState<{ report: StudioReport; attempt: number } | null>(null);

  const right = meanState(sheet.cells, 1);
  const left = meanState(sheet.cells, 2);
  const chart = chartState(chartBox);
  const meansDone = right === 'ok' && left === 'ok';
  const chartDone = chart === 'ok';
  const sentenceDone = sentence.hand === 'tak-samo' || (!!sentence.hand && sentence.by > 0);
  const current = !meansDone ? 0 : !chartDone ? 1 : !sentenceDone ? 2 : 3;

  const activeAddress = sheet.active ? addr(sheet.active.col, sheet.active.row) : null;
  const activeEditable = !!sheet.active && editable(sheet.active);
  const selection = sheet.selection;
  const canChart = !!selection && selection.c2 > selection.c1 && selection.r2 > selection.r1;
  const model = chartBox ? chartFromBox(sheet.values, chartBox, 'column') : null;
  const draftFlat = (sheet.draft ?? '').replace(/\s+/g, '').toUpperCase();

  /** Pusta komórka średniej dostaje `=ŚREDNIA(` sama — dziecko od razu przeciąga po pomiarach. */
  const startEdit = () => {
    if (!sheet.startEdit()) return;
    if (activeAddress && activeEditable && !sheet.cells[activeAddress]) sheet.insert('=ŚREDNIA(');
  };

  /** Szkic, przy którym dziecko nacisnęło ✓ za wcześnie — podpowiedź znika, gdy szkic się zmieni. */
  const [earlyCommit, setEarlyCommit] = useState<string | null>(null);

  /** Brakujący nawias domykamy przy zatwierdzeniu — o nawiasy ta lekcja nie jest. */
  const commit = () => {
    const text = sheet.draft;
    /* `=ŚREDNIA(` bez ani jednej komórki zatwierdzone dałoby #DZIEL/0! i ślepy zaułek — czekamy na pomiary. */
    if (text !== null && isFormula(text) && formulaReferences(text.slice(1)).length === 0) {
      setEarlyCommit(text);
      return;
    }
    if (text !== null && text.startsWith('=')) {
      const missing = (text.match(/\(/g)?.length ?? 0) - (text.match(/\)/g)?.length ?? 0);
      if (missing > 0) sheet.changeDraft(text + ')'.repeat(missing), text.length + missing);
    }
    sheet.commit();
  };

  const judge = (): ProofOutcome<StudioReport> => {
    const verdicts: ProofVerdicts = {};
    verdicts.srednie = meansDone
      ? { ok: true, note: <>B5 i C5 liczą średnie formułą — przeliczą się same, gdy zmienisz pomiar.</> }
      : { ok: false, note: right !== 'ok' ? meanNote(right, 'B5', 'prawej') : meanNote(left, 'C5', 'lewej') };
    verdicts.wykres = chartDone
      ? { ok: true, note: <>Wykres z {boxText(chartBox!)}: trzy próby, dwie ręce.</> }
      : { ok: false, note: CHART_NOTE[chart as Exclude<ChartState, 'ok'>] };
    const r = mean(data.right);
    const l = mean(data.left);
    if (!sentenceDone) {
      verdicts.zdanie = { ok: false, note: 'Zdanie nie jest jeszcze złożone — wybierz rękę i ustaw, o ile.' };
    } else if (sentenceTrue(sentence, data.right, data.left)) {
      verdicts.zdanie = { ok: true, note: <>„{sentenceText(sentence)}” — zgadza się z twoimi średnimi.</> };
    } else {
      verdicts.zdanie = {
        ok: false,
        note: (
          <>
            „{sentenceText(sentence)}” — sprawdź w arkuszu: prawa ma średnio <strong>{formatNumber(r)}</strong>, lewa{' '}
            <strong>{formatNumber(l)}</strong>. Która liczba jest większa i o ile?
          </>
        ),
      };
    }
    const report = { cells: sheet.cells, chart: chartBox ?? { c1: 0, r1: 0, c2: 2, r2: 3 }, sentence };
    setChecked((previous) => ({ report, attempt: (previous?.attempt ?? 0) + 1 }));
    return { verdicts, data: report };
  };

  const reset = () => {
    sheet.cancel();
    sheet.replaceAll(initial);
    sheet.setActive(null);
    sheet.setSelection(null);
    setChartBox(null);
    setSentence({ hand: null, by: 0 });
  };

  const meanSteps = [
    { label: <>Stuknij w pustą komórkę <strong>B5</strong> — <span className="font-mono">=ŚREDNIA(</span> wpisze się samo</>, done: right === 'ok' || (activeAddress === 'B5' && draftFlat.startsWith('=ŚREDNIA(')) },
    { label: <>Przeciągnij palcem po pomiarach prawej ręki, <strong>od B2 do B4</strong>, i puść — średnia policzy się sama</>, done: right === 'ok' },
    { label: <>Złap <strong>kwadracik w rogu B5</strong> i przeciągnij go w prawo, do C5</>, done: left === 'ok' },
  ];
  /*
   * Przeciągnięcie po jednej kolumnie pomiarów POZA edycją (nie stuknięto B5, edycja
   * anulowana, ✓ wcześniej) też liczy średnią — tam, gdzie jej jeszcze brakuje. Instrukcja
   * mówi „stuknij B5, przeciągnij”, ale samo przeciągnięcie znaczy to samo i nie może
   * kończyć się niczym.
   */
  const gesture = (box: Box, origin: Cell, phase: GesturePhase) => {
    sheet.gesture(box, origin, phase);
    if (phase !== 'end' || sheet.draft !== null) return;
    if (box.c1 !== box.c2 || box.c1 < 1 || box.r1 < FIRST || box.r2 > LAST || box.r1 === box.r2) return;
    const target = right !== 'ok' ? 1 : left !== 'ok' ? 2 : null;
    if (target === null) return;
    const cell = { col: target, row: MEAN_ROW };
    sheet.setCell(addr(target, MEAN_ROW), `=ŚREDNIA(${boxText(box)})`);
    sheet.setActive(cell);
    sheet.setSelection(boxOf(cell, cell));
  };

  const meanProblem =
    earlyCommit !== null && earlyCommit === sheet.draft ? (
      <>Jeszcze nie — średnia nie ma z czego liczyć. Przeciągnij palcem po pomiarach <strong>od B2 do B4</strong>.</>
    ) : right !== 'ok' && right !== 'empty' ? (
      meanNote(right, 'B5', 'prawej')
    ) : left !== 'ok' && left !== 'empty' ? (
      meanNote(left, 'C5', 'lewej')
    ) : null;

  const steps: { title: string; body: ReactNode }[] = [
    {
      title: 'Policz średnie',
      body: (
        <div className="space-y-2">
          <Checklist color={color} items={meanSteps} />
          {meanProblem && <p className="text-xs text-amber-700 dark:text-amber-400">{meanProblem}</p>}
        </div>
      ),
    },
    {
      title: 'Wstaw wykres',
      body: (
        <div className="space-y-2">
          <p className="text-sm leading-relaxed">
            Przeciągnij palcem po arkuszu <strong>od A1 do C4</strong> — podpisy i pomiary, bez wiersza „średnio”. Potem stuknij
            przycisk.
          </p>
          {chart !== 'none' && chart !== 'ok' && <p className="text-xs text-amber-700 dark:text-amber-400">{CHART_NOTE[chart]}</p>}
        </div>
      ),
    },
    {
      title: 'Powiedz, co widać',
      body: <SentenceBuilder color={color} sentence={sentence} onChange={setSentence} />,
    },
  ];

  return (
    <TaskShell<StudioReport>
      color={color}
      criteria={CRITERIA}
      brief={
        <>
          <p>
            Zrób z pomiarów prawdziwy arkusz w <strong>trzech ruchach</strong>: niech arkusz sam policzy średnie, narysuje
            wykres, a ty powiedz jednym zdaniem, która ręka wygrała.
          </p>
          <p className="mt-2 text-muted-foreground">
            {data.own
              ? 'Pomiary stoją już w arkuszu — to te, które sam/sama zebrałeś/zebrałaś w bloku 4.'
              : 'Pomiary stoją już w arkuszu. To przykładowe liczby — swoje zbierzesz w bloku 4 i wtedy tu wrócą.'}
          </p>
        </>
      }
      workshopLabel="Twój arkusz"
      workshop={
        <div className="grid gap-5 lg:grid-cols-[minmax(0,260px)_minmax(0,1fr)]">
          <div className="min-w-0 space-y-2">
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
              placeholder={activeEditable ? 'stuknij tutaj' : undefined}
            />
            {/* Miejsce na przyciski jest zarezerwowane — inaczej siatka podskakuje pod palcem w trakcie przeciągania. */}
            <div className={cn(!activeEditable && 'invisible')} aria-hidden={!activeEditable}>
              <SymbolPad color={color} symbols={['ŚREDNIA(', ':', ')']} onInsert={sheet.insert} />
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
              onGesture={gesture}
              highlights={sheet.highlights}
              flashes={sheet.flashes}
              onFill={sheet.draft === null ? sheet.fill : undefined}
              fillPreview={sheet.fillPreview}
              canFill={(cell) => cell.row === MEAN_ROW && cell.col === 1 && isFormula(sheet.cells.B5)}
              decorate={(address) =>
                (address.length === 2 && address.endsWith('1')) || address === 'A5' ? { className: 'font-semibold' } : undefined
              }
            />
            {sheet.hint && <p className="text-xs text-amber-700 dark:text-amber-400">{sheet.hint}</p>}
            <button
              type="button"
              disabled={!canChart}
              onClick={() => selection && setChartBox(selection)}
              className="inline-flex w-full cursor-pointer items-center justify-center gap-1.5 border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-40"
              style={{ borderColor: color, color }}
            >
              <BarChart3 className="h-4 w-4" aria-hidden />
              {selection && canChart ? `Wstaw wykres z ${boxText(selection)}` : 'Zaznacz dane, żeby wstawić wykres'}
            </button>
            {model && (
              <div className="border bg-white p-2 dark:bg-zinc-950">
                <ChartView model={model} color={color} title="Stuknięcia w 5 sekund" />
              </div>
            )}
          </div>

          <ol className="space-y-3">
            {steps.map((step, index) => {
              const done = index < current;
              const now = index === current;
              return (
                <li
                  key={step.title}
                  className={cn('border-l-2 pl-3', !now && 'opacity-70')}
                  style={{ borderColor: now || done ? color : undefined }}
                >
                  <p className="flex items-center gap-2 text-sm font-semibold">
                    <span
                      className="flex h-6 w-6 shrink-0 items-center justify-center border text-xs"
                      style={done ? { backgroundColor: color, borderColor: color, color: 'white' } : now ? { borderColor: color, color } : undefined}
                    >
                      {done ? <Check className="h-3.5 w-3.5" aria-hidden /> : index + 1}
                    </span>
                    Ruch {index + 1}: {step.title}
                  </p>
                  {(now || (index === 2 && current === 3)) && <div className="mt-2">{step.body}</div>}
                </li>
              );
            })}
            {current === 3 && (
              <li className="text-sm font-semibold" style={{ color }}>
                Wszystkie trzy ruchy zrobione — stuknij „Sprawdź mój arkusz”.
              </li>
            )}
          </ol>
        </div>
      }
      judge={judge}
      checkLabel="Sprawdź mój arkusz"
      onReset={reset}
      resetLabel="Zacznij od samych pomiarów"
      acceptedText={
        <>
          Średnie, które <strong>przeliczą się same</strong>, wykres z pomiarów i zdanie, które każdy sprawdzi w twoich liczbach.
          A teraz zabawa poniżej.
        </>
      }
      reward={checked && <LeftWins key={checked.attempt} report={checked.report} color={color} />}
      onComplete={onComplete}
    />
  );
}

function Checklist({ color, items }: { color: string; items: { label: ReactNode; done: boolean }[] }) {
  const next = items.findIndex((item) => !item.done);
  return (
    <ol className="space-y-1 text-sm">
      {items.map((item, index) => (
        <li key={index} className={cn('flex items-start gap-2', !item.done && index !== next && 'text-muted-foreground')}>
          <span
            className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border text-[11px] font-semibold"
            style={item.done ? { backgroundColor: color, borderColor: color, color: 'white' } : index === next ? { borderColor: color, color } : undefined}
          >
            {item.done ? <Check className="h-3 w-3" aria-hidden /> : index + 1}
          </span>
          <span className={cn(index === next && 'font-semibold')}>{item.label}</span>
        </li>
      ))}
    </ol>
  );
}

const HANDS: { id: Hand; label: string }[] = [
  { id: 'prawa', label: 'Prawą ręką' },
  { id: 'lewa', label: 'Lewą ręką' },
  { id: 'tak-samo', label: 'Obiema tak samo' },
];

function SentenceBuilder({ color, sentence, onChange }: { color: string; sentence: Sentence; onChange: (next: Sentence) => void }) {
  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">Popatrz na średnie i na wykres. Złóż zdanie:</p>
      <div className="flex flex-wrap gap-1.5">
        {HANDS.map((hand) => {
          const on = sentence.hand === hand.id;
          return (
            <button
              key={hand.id}
              type="button"
              aria-pressed={on}
              onClick={() => onChange({ ...sentence, hand: hand.id })}
              className={cn('cursor-pointer border px-2.5 py-1 text-sm', on ? 'font-semibold text-white' : 'hover:bg-muted')}
              style={on ? { backgroundColor: color, borderColor: color } : undefined}
            >
              {hand.label}
            </button>
          );
        })}
      </div>
      {sentence.hand && sentence.hand !== 'tak-samo' && (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span>stukam średnio o</span>
          <button
            type="button"
            onClick={() => onChange({ ...sentence, by: Math.max(0, sentence.by - 1) })}
            aria-label="Mniej"
            className="flex h-8 w-8 cursor-pointer items-center justify-center border hover:bg-muted"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-8 text-center font-mono text-base font-bold tabular-nums">{sentence.by}</span>
          <button
            type="button"
            onClick={() => onChange({ ...sentence, by: Math.min(60, sentence.by + 1) })}
            aria-label="Więcej"
            className="flex h-8 w-8 cursor-pointer items-center justify-center border text-white"
            style={{ backgroundColor: color, borderColor: color }}
          >
            <Plus className="h-4 w-4" />
          </button>
          <span>razy więcej.</span>
        </div>
      )}
      {sentence.hand && <p className="border bg-muted/30 px-3 py-2 text-sm italic">„{sentenceText(sentence)}”</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Nagroda: spraw, żeby przegrana ręka wygrała                         */
/* ------------------------------------------------------------------ */

function numberAt(values: Record<string, CellValue>, address: string): number {
  const value = values[address];
  return value?.t === 'num' ? value.v : 0;
}

function LeftWins({ report, color }: { report: StudioReport; color: string }) {
  const [cells, setCells] = useState<RawCells>(report.cells);
  const [active, setActive] = useState<Cell>({ col: 2, row: 1 });
  const [flashes, setFlashes] = useState<Record<string, number>>({});
  const values = useMemo(() => evaluateSheet(cells, {}), [cells]);

  const activeAddress = addr(active.col, active.row);
  const isMeasurement = (cell: Cell) => cell.col >= 1 && cell.col <= 2 && cell.row >= FIRST && cell.row <= LAST;
  const read = (col: number) => [FIRST, 2, LAST].map((row) => numberAt(values, addr(col, row)));
  const right = read(1);
  const left = read(2);
  const meanRight = numberAt(values, 'B5');
  const meanLeft = numberAt(values, 'C5');
  /* Wyzwanie stawia przegraną rękę — u dziecka, któremu lepiej poszło lewą, zabawa jest odwrotna. */
  const startValues = useMemo(() => evaluateSheet(report.cells, {}), [report.cells]);
  const underdog: 'prawa' | 'lewa' = numberAt(startValues, 'B5') < numberAt(startValues, 'C5') ? 'prawa' : 'lewa';
  const won = underdog === 'lewa' ? meanLeft > meanRight : meanRight > meanLeft;
  const stillTrue = sentenceTrue(report.sentence, right, left);
  const model = chartFromBox(values, report.chart, 'column');
  const changed = Object.keys(report.cells).some((key) => report.cells[key] !== cells[key]);

  const bump = (delta: number) => {
    const current = values[activeAddress];
    if (current?.t !== 'num') return;
    const next = { ...cells, [activeAddress]: formatNumber(Math.max(0, current.v + delta)) };
    const after = evaluateSheet(next, {});
    const moved: Record<string, number> = {};
    for (const key of Object.keys(after))
      if (key !== activeAddress && displayValue(values[key]) !== displayValue(after[key])) moved[key] = Date.now() + Math.random();
    setFlashes((previous) => ({ ...previous, ...moved }));
    setCells(next);
  };

  return (
    <div className="space-y-4 border bg-muted/20 p-4">
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        Zabawa: spraw, żeby {underdog} ręka wygrała
      </p>
      <p className="text-sm leading-relaxed">
        Stuknij w <strong>pomiar</strong> i zmieniaj go plusem i minusem. Patrz, co arkusz przeliczy sam — i co z twoim zdaniem.
      </p>

      <div className="grid gap-4 sm:grid-cols-[minmax(0,260px)_minmax(0,360px)]">
        <div className="min-w-0 space-y-2">
          <SheetGrid
            cols={COLS}
            rows={ROWS}
            widths={WIDTHS}
            cells={cells}
            values={values}
            color={color}
            active={active}
            selection={{ c1: active.col, c2: active.col, r1: active.row, r2: active.row }}
            mode="cell"
            highlights={[]}
            flashes={flashes}
            onGesture={(_box, origin, phase) => phase === 'start' && isMeasurement(origin) && setActive(origin)}
            decorate={(address) =>
              address === 'B5' || address === 'C5'
                ? { className: 'font-semibold', style: { backgroundColor: `${color}12` } }
                : address.length === 2 && address.endsWith('1')
                  ? { className: 'font-semibold' }
                  : undefined
            }
          />
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{activeAddress}</span>
            <button
              type="button"
              onClick={() => bump(-1)}
              aria-label="Zmniejsz o 1"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border hover:bg-muted"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-10 text-center font-mono font-bold tabular-nums">{displayValue(values[activeAddress])}</span>
            <button
              type="button"
              onClick={() => bump(1)}
              aria-label="Zwiększ o 1"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border text-white"
              style={{ backgroundColor: color, borderColor: color }}
            >
              <Plus className="h-4 w-4" />
            </button>
            {changed && (
              <button
                type="button"
                onClick={() => setCells(report.cells)}
                className="ml-1 inline-flex cursor-pointer items-center gap-1 text-xs text-muted-foreground underline underline-offset-4 hover:text-primary"
              >
                <RotateCcw className="h-3 w-3" aria-hidden />
                przywróć moje liczby
              </button>
            )}
          </div>
        </div>

        <div className="mx-auto w-full max-w-[360px] space-y-3 sm:mx-0">
          <div className="border bg-white p-2 dark:bg-zinc-950">
            <ChartView model={model} color={color} title="Twój wykres" />
          </div>
          <div className="border bg-white p-3 text-sm dark:bg-zinc-950">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Twoje zdanie</p>
            <p className="mt-1 italic">„{sentenceText(report.sentence)}”</p>
            <p
              className={cn('mt-1 text-xs font-semibold', stillTrue ? 'text-emerald-700 dark:text-emerald-400' : 'text-amber-700 dark:text-amber-400')}
            >
              {stillTrue ? 'Prawda dla tych liczb.' : 'Już nieprawda!'}
            </p>
          </div>
        </div>
      </div>

      {won && (
        <p className="border-l-2 bg-emerald-50 p-3 text-sm leading-relaxed dark:bg-emerald-950/30" style={{ borderColor: color }}>
          <strong>{underdog === 'lewa' ? 'Lewa' : 'Prawa'} wygrała!</strong> Średnie i wykres przeliczyły się same, bo stoją w nich formuły. A twoje zdanie się nie
          zmieniło — to zwykły tekst, jak martwe liczby z bloku 1. Arkusz liczy za ciebie, ale <strong>wniosek trzeba
          sprawdzić samemu</strong>.
        </p>
      )}
    </div>
  );
}
