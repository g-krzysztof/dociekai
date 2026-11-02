/**
 * Jedyne miejsce, które zamienia surowy postęp z `useMathProgress()` na
 * kształt, w jakim rysuje go profil: kolumny roku (jeden słupek = jeden dział,
 * jedna cegła = jedna lekcja) plus komplet odczytów liczbowych.
 *
 * Świadomie nie liczy niczego, czego nie ma w danych — kurs kodowania nie
 * śledzi postępu w ogóle, a gry i fiszki trzymają własne klucze w localStorage
 * i nie wchodzą tu, dopóki nie zostaną włączone osobną decyzją.
 */

import { getModuleBySlug, MATH_MODULES, type MathModule } from '@/app/matematyka/klasa-4/data/curriculum';
import { getModuleLessons, isGuide, type MathLesson } from '@/app/matematyka/klasa-4/data/lessons';
import {
  lessonProgressKey,
  type LessonProgress,
  type ProgressStatus,
} from '@/app/matematyka/klasa-4/lib/progress';
import type { LedgerRow, NextStepModel } from './atlas-shape';

export interface AtlasBrick {
  lesson: MathLesson;
  status: ProgressStatus;
  /** Ukończone kroki lekcji — steruje częściowym wypełnieniem cegły. */
  done: number;
  total: number;
}

export interface AtlasColumn {
  module: MathModule;
  bricks: AtlasBrick[];
  doneLessons: number;
  totalLessons: number;
  status: ProgressStatus;
  /** Dział bez ani jednej opublikowanej lekcji — rysowany jako zapowiedź. */
  planned: boolean;
}

export interface AtlasStats {
  percent: number;
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModules: number;
  /** Wszystkie ukończone kroki, łącznie z przewodnikami — liczba bezwzględna. */
  steps: number;
  startedLessons: number;
  guidesDone: number;
  guidesTotal: number;
}

export interface Atlas {
  columns: AtlasColumn[];
  stats: AtlasStats;
  /** Najwyższy słupek roku — skala wysokości dla wszystkich pozostałych. */
  tallestColumn: number;
}

function brickFor(lesson: MathLesson, lessonProgress: Record<string, LessonProgress>): AtlasBrick {
  const entry = lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)];
  return {
    lesson,
    status: entry?.status ?? 'not-started',
    done: entry?.done ?? 0,
    total: entry?.total ?? 0,
  };
}

export function buildAtlas(lessonProgress: Record<string, LessonProgress>): Atlas {
  let steps = 0;
  let startedLessons = 0;
  let guidesDone = 0;
  let guidesTotal = 0;

  const columns: AtlasColumn[] = MATH_MODULES.map((module) => {
    const published = getModuleLessons(module.slug).filter((lesson) => lesson.status === 'available');

    published.forEach((lesson) => {
      const brick = brickFor(lesson, lessonProgress);
      steps += brick.done;
      if (isGuide(lesson)) {
        guidesTotal += 1;
        if (brick.status === 'done') guidesDone += 1;
      } else if (brick.status === 'in-progress') {
        startedLessons += 1;
      }
    });

    // Przewodniki nie decydują o zaliczeniu działu (ta sama zasada co w
    // `lib/progress.ts`), więc nie stają się cegłami słupka.
    const bricks = published.filter((lesson) => !isGuide(lesson)).map((lesson) => brickFor(lesson, lessonProgress));
    const doneLessons = bricks.filter((brick) => brick.status === 'done').length;
    const status: ProgressStatus =
      bricks.length > 0 && doneLessons === bricks.length
        ? 'done'
        : bricks.some((brick) => brick.status !== 'not-started')
          ? 'in-progress'
          : 'not-started';

    return {
      module,
      bricks,
      doneLessons,
      totalLessons: bricks.length,
      status,
      planned: bricks.length === 0,
    };
  });

  const live = columns.filter((column) => !column.planned);
  const doneLessons = live.reduce((sum, column) => sum + column.doneLessons, 0);
  const totalLessons = live.reduce((sum, column) => sum + column.totalLessons, 0);

  return {
    columns,
    tallestColumn: Math.max(1, ...columns.map((column) => column.totalLessons)),
    stats: {
      percent: totalLessons > 0 ? Math.round((doneLessons / totalLessons) * 100) : 0,
      doneLessons,
      totalLessons,
      doneModules: live.filter((column) => column.status === 'done').length,
      totalModules: live.length,
      steps,
      startedLessons,
      guidesDone,
      guidesTotal,
    },
  };
}

export const lessonHref = (lesson: MathLesson): string =>
  `/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

/** Korzeń kursu — `YearPlot` składa z niego linki do działów. */
export const MATH_BASE_PATH = '/matematyka/klasa-4';

/** Lekcja „do zrobienia teraz" w kształcie, którego oczekuje wspólny `NextStep`. */
export function buildNextStep(
  lesson: MathLesson | undefined,
  status: ProgressStatus | undefined
): NextStepModel | undefined {
  if (!lesson) return undefined;
  const lessonModule = getModuleBySlug(lesson.moduleSlug);

  return {
    href: lessonHref(lesson),
    moduleNumber: lessonModule?.number ?? 0,
    moduleTitle: lessonModule?.title ?? '',
    color: lessonModule?.color ?? '#6366f1',
    short: lesson.short,
    goal: lesson.goal,
    duration: lesson.duration,
    inProgress: status === 'in-progress',
  };
}

export const ledgerRows = (stats: AtlasStats): LedgerRow[] => [
  { label: 'Lekcje', value: `${stats.doneLessons}/${stats.totalLessons}`, hint: 'ukończone w całości' },
  { label: 'Działy', value: `${stats.doneModules}/${stats.totalModules}`, hint: 'zamknięte co do lekcji' },
  { label: 'Kroki', value: `${stats.steps}`, hint: 'zaliczone ekrany lekcji' },
  { label: 'W toku', value: `${stats.startedLessons}`, hint: 'zaczęte, niedokończone' },
  { label: 'Przewodniki', value: `${stats.guidesDone}/${stats.guidesTotal}`, hint: 'teoria przed lekcją' },
];
