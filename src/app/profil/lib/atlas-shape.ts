/**
 * Kształt danych, na którym rysują komponenty profilu — wspólny dla każdego
 * kursu. Matematyka i informatyka mają własne `curriculum.ts` i własne typy
 * lekcji, ale arkusz roku potrzebuje z nich zawsze tego samego: numeru działu,
 * koloru, cegieł i kilku liczb. Dzięki temu `YearPlot`/`NextStep`/`StatLedger`
 * istnieją raz, a nie w kopii na kurs (kopie rozjeżdżały się przy każdej
 * poprawce — stąd ten plik).
 *
 * Typy są celowo minimalne i strukturalne: `Atlas` z `atlas-data.ts` oraz
 * `InfoAtlas` z `atlas-data-info.ts` pasują tu bez żadnej konwersji.
 */

export type PlotStatus = 'not-started' | 'in-progress' | 'done';

export interface PlotModule {
  number: number;
  slug: string;
  title: string;
  color: string;
  hours: string;
}

export interface PlotBrick {
  lesson: { slug: string };
  status: PlotStatus;
  /** Ukończone ekrany lekcji — steruje częściowym wypełnieniem cegły. */
  done: number;
  total: number;
}

export interface PlotColumn {
  module: PlotModule;
  bricks: PlotBrick[];
  doneLessons: number;
  totalLessons: number;
  /** Dział bez ani jednej opublikowanej lekcji — nie dostaje własnego słupka. */
  planned: boolean;
}

export interface PlotStats {
  percent: number;
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModules: number;
}

export interface PlotAtlas {
  columns: PlotColumn[];
  stats: PlotStats;
  /** Najwyższy słupek roku — skala wysokości dla wszystkich pozostałych. */
  tallestColumn: number;
}

/** Lekcja „do zrobienia teraz", odcięta od typów konkretnego kursu. */
export interface NextStepModel {
  href: string;
  moduleNumber: number;
  moduleTitle: string;
  color: string;
  short: string;
  goal: string;
  duration: string;
  inProgress: boolean;
}

/** Jeden odczyt w rejestrze liczb pod wykresem. */
export interface LedgerRow {
  label: string;
  value: string;
  hint: string;
}
