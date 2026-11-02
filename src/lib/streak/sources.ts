/**
 * Most między serią a kursami. Seria sama z siebie wie tylko o dniach; żeby
 * ocenić odznaki „Droga” i „Mapa”, potrzebuje liczb, które znają kursy.
 *
 * To jedyne miejsce w `lib/streak`, które w ogóle zna istnienie kursów
 * (matematyka, informatyka, historia, język polski) — reszta modułu jest czysta i nie
 * importuje niczego z `app/`. Historia (od 2026-09-25) liczy się do dni serii,
 * do „Dwóch frontów” (dowolne dwa przedmioty jednego dnia) i do odznak za
 * działy, a od 2026-10-08 ma własne „Kurs historii” i „Trzy kursy” — liczone
 * do całego programu, bo kurs jest jeszcze w budowie. Język polski (od
 * 2026-10-16, etap E0) liczy się do dni serii, „Dwóch frontów” i sumy
 * ukończonych działów tak samo jak pozostałe kursy.
 */

import {
  MATH_MODULES,
} from '@/app/matematyka/klasa-4/data/curriculum';
import {
  getModuleLessons as getMathModuleLessons,
  getPublishedLessons as getPublishedMathLessons,
  isGuide,
} from '@/app/matematyka/klasa-4/data/lessons';
import { readMathProgressEntry } from '@/app/matematyka/klasa-4/lib/progress-storage';
import { INFO_MODULES } from '@/app/informatyka/klasa-4/data/curriculum';
import {
  getModuleLessons as getInfoModuleLessons,
  getPublishedLessons as getPublishedInfoLessons,
} from '@/app/informatyka/klasa-4/data/lessons';
import { readInfoProgressEntry } from '@/app/informatyka/klasa-4/lib/progress-storage';
import { HIST_MODULES } from '@/app/historia/klasa-4/data/curriculum';
import {
  getModuleLessons as getHistModuleLessons,
  getPublishedLessons as getPublishedHistLessons,
} from '@/app/historia/klasa-4/data/lessons';
import { readHistProgressEntry } from '@/app/historia/klasa-4/lib/progress-storage';
import { POL_MODULES } from '@/app/jezyk-polski/klasa-4/data/curriculum';
import {
  getModuleLessons as getPolModuleLessons,
  getPublishedLessons as getPublishedPolLessons,
} from '@/app/jezyk-polski/klasa-4/data/lessons';
import { readPolProgressEntry } from '@/app/jezyk-polski/klasa-4/lib/progress-storage';
import type { JourneyInput } from './badges';
import type { LessonKey } from './types';

export type CourseId = 'matematyka' | 'informatyka' | 'historia' | 'polski';

/** Klucz lekcji w serii — kurs w środku, żeby odznaka „Dwa fronty” dała się policzyć. */
export function lessonKey(course: CourseId, moduleSlug: string, lessonSlug: string): LessonKey {
  return `${course}/${moduleSlug}/${lessonSlug}`;
}

interface CompletedLesson {
  key: LessonKey;
  moduleSlug: string;
  course: CourseId;
}

/** Wszystkie lekcje obu kursów doprowadzone do 100% w magazynie konta. */
function completedLessons(store: Storage): CompletedLesson[] {
  const done: CompletedLesson[] = [];

  getPublishedMathLessons().forEach((lesson) => {
    const entry = readMathProgressEntry(store, lesson.moduleSlug, lesson.slug);
    if (entry && entry.total > 0 && entry.completed.length >= entry.total) {
      done.push({
        key: lessonKey('matematyka', lesson.moduleSlug, lesson.slug),
        moduleSlug: lesson.moduleSlug,
        course: 'matematyka',
      });
    }
  });

  getPublishedInfoLessons().forEach((lesson) => {
    const entry = readInfoProgressEntry(store, lesson.moduleSlug, lesson.slug);
    if (entry && entry.total > 0 && entry.completed.length >= entry.total) {
      done.push({
        key: lessonKey('informatyka', lesson.moduleSlug, lesson.slug),
        moduleSlug: lesson.moduleSlug,
        course: 'informatyka',
      });
    }
  });

  getPublishedHistLessons().forEach((lesson) => {
    const entry = readHistProgressEntry(store, lesson.moduleSlug, lesson.slug);
    if (entry && entry.total > 0 && entry.completed.length >= entry.total) {
      done.push({
        key: lessonKey('historia', lesson.moduleSlug, lesson.slug),
        moduleSlug: lesson.moduleSlug,
        course: 'historia',
      });
    }
  });

  getPublishedPolLessons().forEach((lesson) => {
    const entry = readPolProgressEntry(store, lesson.moduleSlug, lesson.slug);
    if (entry && entry.total > 0 && entry.completed.length >= entry.total) {
      done.push({
        key: lessonKey('polski', lesson.moduleSlug, lesson.slug),
        moduleSlug: lesson.moduleSlug,
        course: 'polski',
      });
    }
  });

  return done;
}

/** Klucze wszystkich już ukończonych lekcji — jednorazowy zasiew przy pierwszym uruchomieniu. */
export function backfillLessonKeys(store: Storage): LessonKey[] {
  return completedLessons(store).map((lesson) => lesson.key);
}

/**
 * Liczby dla odznak „Mapa”. Przewodniki matematyki są celowo poza rachunkiem —
 * tak samo jak w `readModuleProgress()` obu kursów, gdzie nieprzeczytany
 * przewodnik nie może blokować statusu „dział ukończony”.
 */
export function readJourney(store: Storage): JourneyInput {
  const done = new Set(completedLessons(store).map((lesson) => lesson.key));

  const moduleComplete = (
    lessons: Array<{ moduleSlug: string; slug: string; status: string }>,
    course: CourseId
  ): boolean =>
    lessons.length > 0 &&
    lessons.every((lesson) => done.has(lessonKey(course, lesson.moduleSlug, lesson.slug)));

  const mathModules = MATH_MODULES.map((module) =>
    getMathModuleLessons(module.slug).filter((lesson) => lesson.status === 'available' && !isGuide(lesson))
  );
  const infoModules = INFO_MODULES.map((module) =>
    getInfoModuleLessons(module.slug).filter((lesson) => lesson.status === 'available')
  );

  const mathDoneModules = mathModules.filter((lessons) => moduleComplete(lessons, 'matematyka'));
  const infoDoneModules = infoModules.filter((lessons) => moduleComplete(lessons, 'informatyka'));
  const histLessons = HIST_MODULES.flatMap((module) => getHistModuleLessons(module.slug));
  const histDoneModules = HIST_MODULES.map((module) =>
    getHistModuleLessons(module.slug).filter((lesson) => lesson.status === 'available')
  ).filter((lessons) => moduleComplete(lessons, 'historia'));
  const polDoneModules = POL_MODULES.map((module) =>
    getPolModuleLessons(module.slug).filter((lesson) => lesson.status === 'available')
  ).filter((lessons) => moduleComplete(lessons, 'polski'));

  const mathWithLessons = mathModules.filter((lessons) => lessons.length > 0);
  const infoWithLessons = infoModules.filter((lessons) => lessons.length > 0);

  return {
    doneModules: mathDoneModules.length + infoDoneModules.length + histDoneModules.length + polDoneModules.length,
    // „Cały kurs” = wszystkie opublikowane dziś działy; kurs rośnie, więc odznaka
    // celowo mierzy się do tego, co faktycznie da się dziś zrobić.
    mathDone: mathWithLessons.length > 0 && mathDoneModules.length === mathWithLessons.length,
    infoDone: infoWithLessons.length > 0 && infoDoneModules.length === infoWithLessons.length,
    histLessonsDone: histLessons.filter((lesson) => done.has(lessonKey('historia', lesson.moduleSlug, lesson.slug))).length,
    histLessonsTotal: histLessons.length,
  };
}
