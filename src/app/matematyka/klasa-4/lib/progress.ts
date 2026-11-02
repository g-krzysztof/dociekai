'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/auth-context';
import { getProgressStore, migrateLegacyAnonymousProgress, readMathProgressEntry } from './progress-storage';
import { pullServerProgressOnce, MATH_PROGRESS_SYNCED_EVENT } from './progress-sync';
import { MATH_MODULES, getModuleBySlug } from '../data/curriculum';
import {
  getModuleLessons,
  getPublishedLessons,
  getPublishedTeachingLessons,
  isGuide,
  type MathLesson,
} from '../data/lessons';

export type ProgressStatus = 'not-started' | 'in-progress' | 'done';

export interface LessonProgress {
  status: ProgressStatus;
  done: number;
  total: number;
}

export interface ModuleProgress {
  status: ProgressStatus;
  doneLessons: number;
  totalLessons: number;
}

export interface CourseProgress {
  doneLessons: number;
  totalLessons: number;
  doneModules: number;
  totalModulesWithLessons: number;
}

/** Klucz do mapy `lessonProgress` zwracanej przez `useMathProgress`. */
export function lessonProgressKey(moduleSlug: string, lessonSlug: string): string {
  return `${moduleSlug}/${lessonSlug}`;
}

/** Czyta postęp jednej lekcji z magazynu wybranego dla bieżącego stanu logowania. */
function readLessonProgress(lesson: MathLesson, store: Storage): LessonProgress {
  const entry = readMathProgressEntry(store, lesson.moduleSlug, lesson.slug);
  if (!entry || entry.completed.length === 0) {
    return { status: 'not-started', done: 0, total: entry?.total ?? 0 };
  }
  const status: ProgressStatus =
    entry.total > 0 && entry.completed.length >= entry.total ? 'done' : 'in-progress';
  return { status, done: entry.completed.length, total: entry.total };
}

function readModuleProgress(
  moduleSlug: string,
  lessonProgress: Record<string, LessonProgress>
): ModuleProgress {
  // Przewodniki celowo poza liczeniem: nieprzeczytany przewodnik nie może
  // blokować statusu „moduł ukończony”.
  const lessons = getModuleLessons(moduleSlug).filter(
    (lesson) => lesson.status === 'available' && !isGuide(lesson)
  );
  if (lessons.length === 0) return { status: 'not-started', doneLessons: 0, totalLessons: 0 };

  const results = lessons.map(
    (lesson) => lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)]
  );
  const doneLessons = results.filter((r) => r?.status === 'done').length;
  const anyStarted = results.some((r) => r && r.status !== 'not-started');
  const status: ProgressStatus =
    doneLessons === lessons.length ? 'done' : anyStarted ? 'in-progress' : 'not-started';

  return { status, doneLessons, totalLessons: lessons.length };
}

function readCourseProgress(moduleProgress: Record<string, ModuleProgress>): CourseProgress {
  const lessons = getPublishedTeachingLessons();
  const modulesWithLessons = Array.from(new Set(lessons.map((lesson) => lesson.moduleSlug)));
  const doneLessons = Object.values(moduleProgress).reduce((sum, m) => sum + m.doneLessons, 0);
  const doneModules = modulesWithLessons.filter(
    (slug) => moduleProgress[slug]?.status === 'done'
  ).length;

  return {
    doneLessons,
    totalLessons: lessons.length,
    doneModules,
    totalModulesWithLessons: modulesWithLessons.length,
  };
}

/**
 * Pierwsza nieukończona opublikowana lekcja w kolejności programu (moduł, potem
 * numer lekcji). Bez przewodników — CTA „następna lekcja” ma celować w lekcję.
 */
function findNextLesson(lessonProgress: Record<string, LessonProgress>): MathLesson | undefined {
  const ordered = [...getPublishedTeachingLessons()].sort((a, b) => {
    const moduleA = getModuleBySlug(a.moduleSlug)?.number ?? 0;
    const moduleB = getModuleBySlug(b.moduleSlug)?.number ?? 0;
    return moduleA !== moduleB ? moduleA - moduleB : a.number - b.number;
  });
  return ordered.find(
    (lesson) => lessonProgress[lessonProgressKey(lesson.moduleSlug, lesson.slug)]?.status !== 'done'
  );
}

/**
 * Postęp kursu — z sessionStorage dla gościa, z localStorage (cache konta,
 * scalany z serwerem) dla zalogowanego usera. Dostępny dopiero po
 * zamontowaniu i ustaleniu stanu logowania (SSR nie widzi żadnego z
 * magazynów), stąd `ready`. Do użytku na hubie (kafelki modułów, podsumowanie
 * „Twój postęp”) i na stronie modułu (odznaka w nagłówku, status przy każdym
 * temacie, CTA „kontynuuj”).
 */
export function useMathProgress() {
  const { isAuthenticated, initialLoading } = useAuth();
  const [lessonProgress, setLessonProgress] = useState<Record<string, LessonProgress>>({});
  const [moduleProgress, setModuleProgress] = useState<Record<string, ModuleProgress>>({});
  const [courseProgress, setCourseProgress] = useState<CourseProgress | null>(null);
  const [nextLesson, setNextLesson] = useState<MathLesson | undefined>(undefined);
  const [nextLessonStatus, setNextLessonStatus] = useState<ProgressStatus | undefined>(undefined);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (initialLoading) return;

    const readAndDerive = () => {
      const store = getProgressStore(isAuthenticated);
      const lessons: Record<string, LessonProgress> = {};
      getPublishedLessons().forEach((lesson) => {
        lessons[lessonProgressKey(lesson.moduleSlug, lesson.slug)] = readLessonProgress(lesson, store);
      });

      const modules: Record<string, ModuleProgress> = {};
      MATH_MODULES.forEach((module) => {
        modules[module.slug] = readModuleProgress(module.slug, lessons);
      });

      const next = findNextLesson(lessons);

      setLessonProgress(lessons);
      setModuleProgress(modules);
      setCourseProgress(readCourseProgress(modules));
      setNextLesson(next);
      setNextLessonStatus(
        next ? lessons[lessonProgressKey(next.moduleSlug, next.slug)]?.status : undefined
      );
      setReady(true);
    };

    if (isAuthenticated) {
      void pullServerProgressOnce();
    } else {
      migrateLegacyAnonymousProgress();
    }

    readAndDerive();

    // Merge/pull w tle (login, doczytanie z serwera) kończy się asynchronicznie
    // i po cichu dopisuje do magazynu — to zdarzenie każe przeczytać go ponownie.
    window.addEventListener(MATH_PROGRESS_SYNCED_EVENT, readAndDerive);
    return () => window.removeEventListener(MATH_PROGRESS_SYNCED_EVENT, readAndDerive);
  }, [isAuthenticated, initialLoading]);

  return { lessonProgress, moduleProgress, courseProgress, nextLesson, nextLessonStatus, ready };
}
