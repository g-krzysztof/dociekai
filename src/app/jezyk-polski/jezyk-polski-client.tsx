'use client';

import Link from 'next/link';
import SparklesBackground from '@/components/ui/SparklesBackground';
import { CourseOrbitNode } from '@/components/ui/course-orbit-node';
import { CourseSoonNode } from '@/components/ui/course-soon-node';
import { COURSES } from './data/courses';

const availableCourses = COURSES.filter((course) => course.status === 'available');

/** Katalog kursów języka polskiego — ta sama „ścieżka kursów” co w innych przedmiotach. */
export const JezykPolskiClient = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      <SparklesBackground count={90} className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #0e7490, transparent 70%)' }}
      />

      <div className="relative container mx-auto flex flex-col items-center justify-between px-3 py-14 sm:px-4 sm:py-20">
        <div className="max-w-5xl pb-12 text-center sm:pb-16">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Język polski — wybierz swój kurs
          </h1>
          <p className="mx-auto mt-4 max-w-xxxl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kursy języka polskiego dla szkoły podstawowej, zgodne z nową podstawą programową 2026.{' '}
            <br />
            Zaczynamy od klasy 4 — słów, zdań, opowieści i pierwszych własnych tekstów.
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
            text="Kursy języka polskiego dla kolejnych klas szkoły podstawowej przygotujemy po klasie 4."
          />
        </div>

        <div className="mt-16 border-t pt-12 sm:mt-20 sm:pt-16">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Polski, którym się mówi i pisze, a nie tylko czyta
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Zamiast wkuwania regułek — praca ze słowem: słownictwo i części mowy, zdania
              i przecinki, ortografia, czytanie ze zrozumieniem, baśnie, mity i wiersze. Dziecko
              ćwiczy na stronie to, co da się uczciwie sprawdzić, i pisze własne krótkie teksty.
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
