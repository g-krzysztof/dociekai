'use client';

import { useMemo, useState, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, BarChart3, Check, LineChart, MessageCircleQuestion, PieChart, Wrench } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { evaluateSheet, formatNumber, type Box, type RawCells } from '../../../lib/formula';
import { SheetGrid, boxText } from './sheet-grid';
import { chartFromBox, chartMax, chartMin, CHART_KIND_LABEL, type ChartKind, type ChartModel } from './chart';
import { ChartView } from './chart-view';

/**
 * Blok 3 — debugowanie. **Wykres rysuje się z zaznaczenia, a nie z tego, co
 * autor miał na myśli.**
 *
 * Trzy reklamacje, każda z innej rodziny usterek, i każda wierna temu, co robi
 * prawdziwy arkusz (`chart.ts`):
 *
 * 1. **zaznaczony wiersz „Razem”** — program nie wie, że to suma, i rysuje ją jako
 *    piątą klasę; najwyższy słupek to „Razem”, a prawdziwe klasy robią się
 *    karzełkami;
 * 2. **zaznaczenie bez kolumny z nazwami** — podpisy to „1, 2, 3…” i z wykresu
 *    nie da się odczytać, który dzień był najzimniejszy;
 * 3. **zły rodzaj wykresu** — zakres jest dobry, ale wzrost fasoli pokazany kołem
 *    zamienia centymetry w „procent całości”, choć żadnej całości tu nie ma.
 *
 * Gest jest nowy w kursie: **wykres przerysowuje się w trakcie przeciągania**, a
 * pod nim na żywo zmienia się zdanie „co z tego wykresu wyczyta czytelnik”. Nie
 * oceniamy wykresu słowem „źle” — pokazujemy, jaką odpowiedź da komuś, kto go
 * zobaczy. To jest dokładnie ta miara, po której ocenia się wykres w życiu.
 */

interface Case {
  id: string;
  title: string;
  complaint: string;
  question: string;
  cells: RawCells;
  rows: number;
  widths: number[];
  start: Box;
  kind: ChartKind;
  /** Czy zaznaczenie i rodzaj naprawiają usterkę; `why` — zdanie o tym, co jeszcze nie gra. */
  check: (model: ChartModel, box: Box, kind: ChartKind) => { fixed: boolean; why?: ReactNode };
  answer: (model: ChartModel, kind: ChartKind) => ReactNode;
  lesson: ReactNode;
}

const CASES: Case[] = [
  {
    id: 'razem',
    title: 'Zbiórka nakrętek',
    complaint: 'Na gazetkę szkolną: „Wykres jest dziwny. Wszystkie klasy wyglądają, jakby nic nie zebrały”.',
    question: 'Która klasa zebrała najwięcej nakrętek?',
    rows: 6,
    widths: [70, 64],
    cells: {
      A1: 'Klasa',
      B1: 'kg',
      A2: '4a',
      B2: '36',
      A3: '4b',
      B3: '33',
      A4: '4c',
      B4: '30',
      A5: '4d',
      B5: '41',
      A6: 'Razem',
      B6: '=SUMA(B2:B5)',
    },
    start: { c1: 0, r1: 0, c2: 1, r2: 5 },
    kind: 'column',
    check: (model) => {
      if (model.categories.includes('Razem'))
        return { fixed: false, why: <>Na wykresie wciąż stoi słupek „Razem”, czyli wszystkie klasy naraz.</> };
      if (!model.namedCategories) return { fixed: false, why: <>Pod słupkami nie ma nazw klas — zaznacz też kolumnę A.</> };
      const missing = ['4a', '4b', '4c', '4d'].filter((item) => !model.categories.includes(item));
      if (missing.length) return { fixed: false, why: <>Z wykresu wypadło: {missing.join(', ')}.</> };
      if (model.series.length !== 1) return { fixed: false, why: <>Zaznacz tylko nazwy klas i kilogramy.</> };
      return { fixed: true };
    },
    answer: (model) => {
      const top = chartMax(model);
      if (!top) return 'Nic — na wykresie nie ma liczb.';
      if (top.label === 'Razem')
        return (
          <>
            „<strong>Razem</strong>, {formatNumber(top.value)} kg”. Tylko że Razem nie jest klasą — to wszystkie klasy
            dodane do siebie.
          </>
        );
      if (!model.namedCategories)
        return <>„Słupek numer {top.label}”. Która to klasa? Z wykresu się nie dowiesz.</>;
      return (
        <>
          „Klasa <strong>{top.label}</strong> — {formatNumber(top.value)} kg.”
        </>
      );
    },
    lesson: (
      <>
        Program nie wie, że „Razem” to suma. Dla niego to po prostu piąty wiersz z liczbą, więc rysuje piąty słupek — i
        to najwyższy, bo zawiera wszystkie pozostałe. <strong>Wiersza podsumowania nie zaznacza się do wykresu.</strong>
      </>
    ),
  },
  {
    id: 'podpisy',
    title: 'Pogoda z okna',
    complaint: 'Z zeszytu do przyrody: „Mam wykres temperatur, ale nie wiem, który to dzień”.',
    question: 'Którego dnia rano było najzimniej?',
    rows: 8,
    widths: [70, 64],
    cells: {
      A1: 'Dzień',
      B1: '°C',
      A2: 'pon',
      B2: '6',
      A3: 'wt',
      B3: '8',
      A4: 'śr',
      B4: '4',
      A5: 'czw',
      B5: '5',
      A6: 'pt',
      B6: '9',
      A7: 'sob',
      B7: '11',
      A8: 'nd',
      B8: '10',
    },
    start: { c1: 1, r1: 0, c2: 1, r2: 7 },
    kind: 'line',
    check: (model) => {
      if (!model.namedCategories)
        return { fixed: false, why: <>Pod wykresem wciąż są numery zamiast dni. Nazwy stoją w kolumnie A.</> };
      if (model.categories.length < 7) return { fixed: false, why: <>Na wykresie jest mniej niż siedem dni.</> };
      if (model.series.length !== 1 || model.series[0].values.some((value) => value === null))
        return { fixed: false, why: <>W zaznaczeniu jest coś, co nie jest temperaturą.</> };
      return { fixed: true };
    },
    answer: (model) => {
      const low = chartMin(model);
      if (!low) return 'Nic — na wykresie nie ma liczb.';
      if (!model.namedCategories)
        return (
          <>
            „W punkcie numer <strong>{low.label}</strong> — {formatNumber(low.value)}°C”. Tylko który to dzień tygodnia?
          </>
        );
      return (
        <>
          „<strong>{DAY_NAMES[low.label] ?? low.label}</strong> — {formatNumber(low.value)}°C.”
        </>
      );
    },
    lesson: (
      <>
        Liczby bez podpisów to połowa wykresu. Program bierze podpisy z <strong>pierwszej kolumny zaznaczenia</strong>, o
        ile jest w niej tekst — więc kolumnę z nazwami zaznacza się <strong>razem</strong> z liczbami.
      </>
    ),
  },
  {
    id: 'rodzaj',
    title: 'Fasola na parapecie',
    complaint: 'Z projektu na przyrodę: „Nauczycielka pyta, czemu fasola ma procenty”.',
    question: 'Jak rosła fasola?',
    rows: 7,
    widths: [70, 64],
    cells: {
      A1: 'Pomiar',
      B1: 'cm',
      A2: 'tydz. 1',
      B2: '2',
      A3: 'tydz. 2',
      B3: '4',
      A4: 'tydz. 3',
      B4: '7',
      A5: 'tydz. 4',
      B5: '11',
      A6: 'tydz. 5',
      B6: '14',
      A7: 'tydz. 6',
      B7: '18',
    },
    start: { c1: 0, r1: 0, c2: 1, r2: 6 },
    kind: 'pie',
    check: (model, _box, kind) => {
      if (!model.namedCategories || model.categories.length < 6)
        return { fixed: false, why: <>Zaznaczenie było dobre — wróć do A1:B7.</> };
      if (kind === 'pie')
        return { fixed: false, why: <>Zakres jest w porządku. Kłopot jest w tym, jakim kształtem go narysowano.</> };
      return { fixed: true };
    },
    answer: (model, kind) => {
      const values = model.series[0]?.values.filter((value): value is number => value !== null) ?? [];
      if (values.length === 0) return 'Nic — na wykresie nie ma liczb.';
      if (kind === 'pie') {
        const total = values.reduce((sum, value) => sum + value, 0);
        const last = values[values.length - 1];
        return (
          <>
            „W szóstym tygodniu fasola miała <strong>{Math.round((last / total) * 100)}% całości</strong>”. Całości czego?
            Wysokości z sześciu tygodni nie składają się w żadną całość.
          </>
        );
      }
      const rising = values.every((value, index) => index === 0 || value >= values[index - 1]);
      return rising ? (
        <>
          „Rosła <strong>co tydzień</strong>: od {formatNumber(values[0])} do {formatNumber(values[values.length - 1])} cm.”
        </>
      ) : (
        <>„Raz rosła, raz malała.”</>
      );
    },
    lesson: (
      <>
        Koło pokazuje <strong>części jednej całości</strong> — na przykład, jak klasa podzieliła się głosami. Pomiary w
        kolejnych tygodniach nie są kawałkami niczego, tylko <strong>zmianą w czasie</strong>, a zmianę najlepiej widać na
        linii.
      </>
    ),
  },
];

/** Z przyimkiem, bo „w wtorek” kłuje w oczy. */
const DAY_NAMES: Record<string, string> = {
  pon: 'W poniedziałek',
  wt: 'We wtorek',
  śr: 'W środę',
  czw: 'W czwartek',
  pt: 'W piątek',
  sob: 'W sobotę',
  nd: 'W niedzielę',
};

const KINDS: { kind: ChartKind; icon: typeof BarChart3 }[] = [
  { kind: 'column', icon: BarChart3 },
  { kind: 'line', icon: LineChart },
  { kind: 'pie', icon: PieChart },
];

interface ChartRangeProps {
  color: string;
  onComplete?: () => void;
}

export function ChartRange({ color, onComplete }: ChartRangeProps) {
  const [index, setIndex] = useState(0);
  const [finished, setFinished] = useState(false);
  const anchorRef = useSectionScrollAnchor(index);
  const current = CASES[index];

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/60 sm:p-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <p className="text-[11px] font-semibold uppercase tracking-wide" style={{ color }}>
          Reklamacja {index + 1} z {CASES.length}
        </p>
        <div className="flex gap-1" aria-hidden>
          {CASES.map((item, i) => (
            <span
              key={item.id}
              className="h-1.5 w-6"
              style={{ backgroundColor: i < index || (i === index && finished) ? color : i === index ? `${color}66` : '#d4d4d8' }}
            />
          ))}
        </div>
      </div>

      <CaseBench
        key={current.id}
        item={current}
        color={color}
        last={index === CASES.length - 1}
        onNext={() => {
          if (index < CASES.length - 1) setIndex(index + 1);
          else if (!finished) {
            setFinished(true);
            onComplete?.();
          }
        }}
        finished={finished}
      />
    </div>
  );
}

function CaseBench({
  item,
  color,
  last,
  onNext,
  finished,
}: {
  item: Case;
  color: string;
  last: boolean;
  onNext: () => void;
  finished: boolean;
}) {
  const [box, setBox] = useState<Box>(item.start);
  const [kind, setKind] = useState<ChartKind>(item.kind);
  const [touched, setTouched] = useState(false);
  const values = useMemo(() => evaluateSheet(item.cells, {}), [item.cells]);
  const model = useMemo(() => chartFromBox(values, box, kind), [values, box, kind]);
  const status = item.check(model, box, kind);
  const top = item.id === 'podpisy' ? chartMin(model) : item.id === 'razem' ? chartMax(model) : null;

  return (
    <div className="space-y-4">
      <div className="border-l-2 pl-3" style={{ borderColor: color }}>
        <p className="text-sm font-semibold">{item.title}</p>
        <p className="mt-0.5 text-sm italic leading-relaxed text-muted-foreground">{item.complaint}</p>
      </div>

      <div className="space-y-4 sm:grid sm:grid-cols-[minmax(0,180px)_minmax(0,1fr)] sm:gap-5 sm:space-y-0">
        <div className="space-y-3">
          <SheetGrid
            cols={2}
            rows={item.rows}
            widths={item.widths}
            cells={item.cells}
            values={values}
            color={color}
            selection={box}
            active={null}
            mode="range"
            onGesture={(next, _origin, phase) => {
              setBox(next);
              if (phase === 'end') setTouched(true);
            }}
            decorate={(address) => (address === 'A1' || address === 'B1' ? { className: 'font-semibold' } : undefined)}
          />
          <p className="text-xs text-muted-foreground">
            Zaznaczenie: <strong className="font-mono text-foreground">{boxText(box)}</strong>
            <br />
            Przeciągnij palcem po arkuszu, żeby zaznaczyć inaczej.
          </p>
          <div>
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Rodzaj wykresu</p>
            <div className="flex gap-1">
              {KINDS.map(({ kind: option, icon: Icon }) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    setKind(option);
                    setTouched(true);
                  }}
                  aria-pressed={kind === option}
                  title={CHART_KIND_LABEL[option]}
                  className={cn(
                    'flex h-9 flex-1 cursor-pointer items-center justify-center border transition-colors',
                    kind === option ? 'text-white' : 'hover:bg-muted'
                  )}
                  style={kind === option ? { backgroundColor: color, borderColor: color } : undefined}
                >
                  <Icon className="h-4 w-4" aria-hidden />
                  <span className="sr-only">{CHART_KIND_LABEL[option]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <div className="mx-auto max-w-[380px] border p-2">
            <ChartView model={model} color={color} highlightIndex={top?.index ?? null} />
          </div>

          <div className="space-y-1.5 bg-muted/40 p-3 text-sm leading-relaxed">
            <p className="flex items-start gap-1.5 font-semibold">
              <MessageCircleQuestion className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              Czytelnik pyta: {item.question}
            </p>
            <p>
              <span className="text-muted-foreground">Wykres mu odpowiada: </span>
              {item.answer(model, kind)}
            </p>
          </div>

          <AnimatePresence mode="wait" initial={false}>
            {status.fixed ? (
              <motion.div
                key="fixed"
                initial={{ opacity: 0, y: 4 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="space-y-2 p-3"
                style={{ backgroundColor: `${color}14` }}
              >
                <p className="flex items-center gap-1.5 text-sm font-semibold" style={{ color }}>
                  <Check className="h-4 w-4" aria-hidden /> Naprawione
                </p>
                <p className="text-sm leading-relaxed">{item.lesson}</p>
                {!(last && finished) && (
                  <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex cursor-pointer items-center gap-1.5 border px-3 py-1.5 text-sm font-semibold text-white"
                    style={{ backgroundColor: color, borderColor: color }}
                  >
                    {last ? 'Zamknij reklamacje' : 'Następna reklamacja'}
                    <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                )}
              </motion.div>
            ) : (
              <motion.p
                key={touched ? 'why' : 'start'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-start gap-1.5 text-sm leading-relaxed"
              >
                <Wrench className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                <span>
                  {touched ? status.why : 'Ta odpowiedź się nie zgadza. Popraw zaznaczenie albo rodzaj wykresu, aż wykres odpowie dobrze.'}
                </span>
              </motion.p>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
