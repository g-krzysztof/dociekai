'use client';

import { useEffect, useRef, useState } from 'react';
import { recordLessonCompleted, type StreakEvent } from './record';
import type { CourseId } from './sources';

/**
 * Wykrywa moment, w którym lekcja przekracza 100%, i zalicza dzień. Wspólne dla
 * obu powłok lekcji, bo reguła jest jedna niezależnie od przedmiotu.
 *
 * Najważniejsza jest tu **linia odniesienia**: przy pierwszym odczycie po
 * przywróceniu postępu zapamiętujemy, czy lekcja była już skończona. Bez tego
 * każde wejście na dawno ukończoną lekcję odpalałoby konfetti od nowa.
 * Skasowanie kroków i przejście lekcji jeszcze raz liczy się normalnie — to
 * prawdziwa praca, nie obejście.
 */
export function useLessonStreak(params: {
  course: CourseId;
  moduleSlug: string;
  lessonSlug: string;
  /** Ukończone kroki/bloki lekcji. */
  completed: string[];
  /** Ile kroków/bloków ma cała lekcja. */
  total: number;
  /** Postęp odczytany z magazynu — wcześniej nie ma czego porównywać. */
  restored: boolean;
  isAuthenticated: boolean;
  initialLoading: boolean;
}): { event: StreakEvent | null; justFinished: boolean } {
  const { course, moduleSlug, lessonSlug, completed, total, restored, isAuthenticated, initialLoading } =
    params;

  const baseline = useRef<boolean | null>(null);
  const [event, setEvent] = useState<StreakEvent | null>(null);
  const [justFinished, setJustFinished] = useState(false);

  // Zmiana lekcji albo zalogowanie się w trakcie czyta postęp z innego magazynu,
  // więc linia odniesienia musi zostać ustalona od nowa.
  useEffect(() => {
    baseline.current = null;
    setEvent(null);
    setJustFinished(false);
  }, [moduleSlug, lessonSlug, isAuthenticated]);

  useEffect(() => {
    if (!restored || initialLoading || total === 0) return;
    const complete = completed.length >= total;

    if (baseline.current === null) {
      baseline.current = complete;
      return;
    }

    if (complete && !baseline.current) {
      baseline.current = true;
      setJustFinished(true);
      setEvent(recordLessonCompleted({ course, moduleSlug, lessonSlug, isAuthenticated }));
    } else if (!complete && baseline.current) {
      baseline.current = false;
      setJustFinished(false);
      setEvent(null);
    }
  }, [completed, total, restored, initialLoading, isAuthenticated, course, moduleSlug, lessonSlug]);

  return { event, justFinished };
}
