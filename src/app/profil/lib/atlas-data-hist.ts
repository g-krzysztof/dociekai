/**
 * Historia: budowa atlasu postępu na wzór informatyki.
 * Jedyne miejsce, które zamienia surowy postęp z `useHistProgress()` na
 * kształt, w jakim rysuje go profil: kolumny roku (jeden słupek = jeden dział,
 * jedna cegła = jedna lekcja) plus komplet odczytów liczbowych.
 */

import {
  getModuleBySlug,
  HIST_MODULES,
  type HistModule,
} from '@/app/historia/klasa-4/data/curriculum';
import { getModuleLessons, type HistLesson } from '@/app/historia/klasa-4/data/lessons';
import {
  lessonProgressKey,
  type LessonProgress,
  type ProgressStatus,
} from '@/app/historia/klasa-4/lib/progress';
import type { LedgerRow, NextStepModel } from './atlas-shape';

export interface HistAtlasBrick {
  lesson: HistLesson;
  status: ProgressStatus;
  /** Ukończone bloki lekcji — steruje częściowym wypełnieniem cegły. */
  done: number;
  total: number;
}

export interface HistAtlasColumn {
  module: HistModule;
  bricks: HistAtlasBrick[];
  doneLessons: number;
  totalLessons: number;
  status: ProgressStatus;
  /** Dział bez ani jednej opublikowanej lekcji — rysowany jako zapowiedź. */
  planned: boolean;
}

export interface HistAtlasStats {
  percent: number;
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModules: number;
  /** Wszystkie ukończone bloki — liczba bezwzględna. */
  blocks: number;
  startedLessons: number;
}

export interface HistAtlas {
  columns: HistAtlasColumn[];
  stats: HistAtlasStats;
  /** Najwyższy słupek roku — skala wysokości dla wszystkich pozostałych. */
  tallestColumn: number;
}

function brickFor(lesson: HistLesson, lessonProgress: Record<string, LessonProgress>): HistAtlasBrick {
  const entry = lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)];
  return {
    lesson,
    status: entry?.status ?? 'not-started',
    done: entry?.done ?? 0,
    total: entry?.total ?? 0,
  };
}

export function buildHistAtlas(lessonProgress: Record<string, LessonProgress>): HistAtlas {
  let blocks = 0;
  let startedLessons = 0;

  const columns: HistAtlasColumn[] = HIST_MODULES.map((module) => {
    const published = getModuleLessons(module.slug).filter((lesson) => lesson.status === 'available');

    published.forEach((lesson) => {
      const brick = brickFor(lesson, lessonProgress);
      blocks += brick.done;
      if (brick.status === 'in-progress') {
        startedLessons += 1;
      }
    });

    const bricks = published.map((lesson) => brickFor(lesson, lessonProgress));
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
      blocks,
      startedLessons,
    },
  };
}

export const histLessonHref = (lesson: HistLesson): string =>
  `/historia/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

/** Korzeń kursu — `YearPlot` składa z niego linki do działów. */
export const HIST_BASE_PATH = '/historia/klasa-4';

/** Lekcja „do zrobienia teraz" w kształcie, którego oczekuje wspólny `NextStep`. */
export function buildHistNextStep(
  lesson: HistLesson | undefined,
  status: ProgressStatus | undefined
): NextStepModel | undefined {
  if (!lesson) return undefined;
  const lessonModule = getModuleBySlug(lesson.moduleSlug);

  return {
    href: histLessonHref(lesson),
    moduleNumber: lessonModule?.number ?? 0,
    moduleTitle: lessonModule?.title ?? '',
    color: lessonModule?.color ?? '#6366f1',
    short: lesson.short,
    goal: lesson.goal,
    duration: lesson.duration,
    inProgress: status === 'in-progress',
  };
}

export const histLedgerRows = (stats: HistAtlasStats): LedgerRow[] => [
  { label: 'Lekcje', value: `${stats.doneLessons}/${stats.totalLessons}`, hint: 'ukończone w całości' },
  { label: 'Działy', value: `${stats.doneModules}/${stats.totalModules}`, hint: 'zamknięte co do lekcji' },
  { label: 'Bloki', value: `${stats.blocks}`, hint: 'zaliczone ekrany lekcji' },
  { label: 'W toku', value: `${stats.startedLessons}`, hint: 'zaczęte, niedokończone' },
];
