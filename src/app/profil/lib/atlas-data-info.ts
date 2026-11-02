/**
 * Informatyka: budowa atlastu postępu na wzór matematyki.
 * Jedyne miejsce, które zamienia surowy postęp z `useInfoProgress()` na
 * kształt, w jakim rysuje go profil: kolumny roku (jeden słupek = jeden dział,
 * jedna cegła = jedna lekcja) plus komplet odczytów liczbowych.
 */

import {
  getModuleBySlug,
  INFO_MODULES,
  type InfoModule,
} from '@/app/informatyka/klasa-4/data/curriculum';
import { getModuleLessons, type InfoLesson } from '@/app/informatyka/klasa-4/data/lessons';
import {
  lessonProgressKey,
  type LessonProgress,
  type ProgressStatus,
} from '@/app/informatyka/klasa-4/lib/progress';
import type { LedgerRow, NextStepModel } from './atlas-shape';

export interface InfoAtlasBrick {
  lesson: InfoLesson;
  status: ProgressStatus;
  /** Ukończone bloki lekcji — steruje częściowym wypełnieniem cegły. */
  done: number;
  total: number;
}

export interface InfoAtlasColumn {
  module: InfoModule;
  bricks: InfoAtlasBrick[];
  doneLessons: number;
  totalLessons: number;
  status: ProgressStatus;
  /** Dział bez ani jednej opublikowanej lekcji — rysowany jako zapowiedź. */
  planned: boolean;
}

export interface InfoAtlasStats {
  percent: number;
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModules: number;
  /** Wszystkie ukończone bloki — liczba bezwzględna. */
  blocks: number;
  startedLessons: number;
}

export interface InfoAtlas {
  columns: InfoAtlasColumn[];
  stats: InfoAtlasStats;
  /** Najwyższy słupek roku — skala wysokości dla wszystkich pozostałych. */
  tallestColumn: number;
}

function brickFor(lesson: InfoLesson, lessonProgress: Record<string, LessonProgress>): InfoAtlasBrick {
  const entry = lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)];
  return {
    lesson,
    status: entry?.status ?? 'not-started',
    done: entry?.done ?? 0,
    total: entry?.total ?? 0,
  };
}

export function buildInfoAtlas(lessonProgress: Record<string, LessonProgress>): InfoAtlas {
  let blocks = 0;
  let startedLessons = 0;

  const columns: InfoAtlasColumn[] = INFO_MODULES.map((module) => {
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

export const infoLessonHref = (lesson: InfoLesson): string =>
  `/informatyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`;

/** Korzeń kursu — `YearPlot` składa z niego linki do działów. */
export const INFO_BASE_PATH = '/informatyka/klasa-4';

/** Lekcja „do zrobienia teraz" w kształcie, którego oczekuje wspólny `NextStep`. */
export function buildInfoNextStep(
  lesson: InfoLesson | undefined,
  status: ProgressStatus | undefined
): NextStepModel | undefined {
  if (!lesson) return undefined;
  const lessonModule = getModuleBySlug(lesson.moduleSlug);

  return {
    href: infoLessonHref(lesson),
    moduleNumber: lessonModule?.number ?? 0,
    moduleTitle: lessonModule?.title ?? '',
    color: lessonModule?.color ?? '#6366f1',
    short: lesson.short,
    goal: lesson.goal,
    duration: lesson.duration,
    inProgress: status === 'in-progress',
  };
}

export const infoLedgerRows = (stats: InfoAtlasStats): LedgerRow[] => [
  { label: 'Lekcje', value: `${stats.doneLessons}/${stats.totalLessons}`, hint: 'ukończone w całości' },
  { label: 'Działy', value: `${stats.doneModules}/${stats.totalModules}`, hint: 'zamknięte co do lekcji' },
  { label: 'Bloki', value: `${stats.blocks}`, hint: 'zaliczone ekrany lekcji' },
  { label: 'W toku', value: `${stats.startedLessons}`, hint: 'zaczęte, niedokończone' },
];
