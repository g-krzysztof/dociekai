'use client';

import Link from 'next/link';
import SparklesBackground from '@/components/ui/SparklesBackground';
import { CourseOrbitNode } from '@/components/ui/course-orbit-node';
import { CourseSoonNode } from '@/components/ui/course-soon-node';
import { COURSES } from './data/courses';

const availableCourses = COURSES.filter((course) => course.status === 'available');

/** Katalog kursów historii — ta sama „ścieżka kursów” co w matematyce i informatyce. */
export const HistoriaClient = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      <SparklesBackground count={90} className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #9a3412, transparent 70%)' }}
      />

      <div className="relative container mx-auto flex flex-col items-center justify-between px-3 py-14 sm:px-4 sm:py-20">
        <div className="max-w-5xl pb-12 text-center sm:pb-16">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Historia — wybierz swój kurs
          </h1>
          <p className="mx-auto mt-4 max-w-xxxl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kursy historii dla szkoły podstawowej, zgodne z nową podstawą programową 2026. <br />
            Zaczynamy od klasy 4 — warsztatu historyka i starożytności.
          </p>
          <p className="mt-3 text-sm text-muted-foreground/70">
            {availableCourses.length > 0
              ? `${availableCourses.length} ${availableCourses.length === 1 ? 'kurs gotowy' : 'kursy gotowe'} do startu — kolejne w drodze.`
              : 'Pierwszy kurs jest w budowie — wróć tu niebawem.'}
          </p>
        </div>

        <div className="flex max-w-4xl flex-col">
          {COURSES.map((course, i) => (
            <CourseOrbitNode
              key={course.slug}
              course={course}
              index={i + 1}
              hasTop={i > 0}
              hasBottom
            />
          ))}
          <CourseSoonNode
            delay={COURSES.length * 0.12}
            text="Kursy historii dla kolejnych klas szkoły podstawowej przygotujemy po klasie 4."
          />
        </div>

        <div className="mt-16 border-t pt-12 sm:mt-20 sm:pt-16">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Historia, którą się przeżywa, a nie tylko czyta
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zamiast wkuwania dat — praca historyka: źródła, mapy, oś czasu i pytanie „skąd to
              wiemy?”. Dziecko samo odkrywa, jak wylewał Nil, kto naprawdę głosował w Atenach i
              dlaczego rzymska woda płynęła akweduktem.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zajrzyj też do{' '}
              <Link href="/matematyka" className="font-medium text-primary hover:underline">
                kursów matematyki
              </Link>{' '}
              i{' '}
              <Link href="/informatyka" className="font-medium text-primary hover:underline">
                informatyki
              </Link>
              .
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
