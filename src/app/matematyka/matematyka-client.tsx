'use client';

import Link from 'next/link';
import SparklesBackground from '@/components/ui/SparklesBackground';
import { CourseOrbitNode } from '@/components/ui/course-orbit-node';
import { CourseSoonNode } from '@/components/ui/course-soon-node';
import { COURSES } from './data/courses';

const availableCourses = COURSES.filter((course) => course.status === 'available');

export const MatematykaClient = () => {
  return (
    <div className="relative overflow-hidden bg-background">
      <SparklesBackground count={90} className="opacity-50" />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full opacity-20 blur-[100px]"
        style={{ background: 'radial-gradient(circle, #2563eb, transparent 70%)' }}
      />

      <div className="relative container mx-auto flex flex-col items-center justify-between px-3 py-14 sm:px-4 sm:py-20">
        {/* Hero */}
        <div className="max-w-5xl pb-12 text-center sm:pb-16">
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl lg:text-6xl">
            Matematyka — wybierz swój kurs
          </h1>
          <p className="mx-auto mt-4 max-w-xxxl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Kursy matematyki dla szkoły podstawowej, ułożone krok po kroku zgodnie z podstawą
            programową MEiN. <br />
            Zacznij od klasy 4 — kolejne roczniki są w przygotowaniu.
          </p>
          <p className="mt-3 text-sm text-muted-foreground/70">
            {availableCourses.length} {availableCourses.length === 1 ? 'kurs gotowy' : 'kursy gotowe'} do startu —
            kolejne w drodze.
          </p>
        </div>

        {/* Ścieżka kursów */}
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
          <CourseSoonNode delay={COURSES.length * 0.12} />
        </div>

        {/* Treść SEO — kontekst kursów */}
        <div className="mt-16 border-t pt-12 sm:mt-20 sm:pt-16">
          <div className="mx-auto">
            <h2 className="text-2xl font-bold text-foreground sm:text-3xl">
              Nauka matematyki online, krok po kroku
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Każdy kurs matematyki DociekAI powstaje na bazie podstawy programowej MEiN i
              rzeczywistych rozkładów materiału używanych w polskich szkołach. Zamiast suchej
              teorii — interaktywne lekcje, przewodniki wprowadzające nowe pojęcia i podsumowania
              modułowe sprawdzające, co naprawdę zostało w głowie.
            </p>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Szukasz krótszej, szybszej formy ćwiczeń zamiast pełnego kursu? Sprawdź nasze{' '}
              <Link href="/gry-edukacyjne" className="font-medium text-primary hover:underline">
                gry edukacyjne
              </Link>{' '}
              — świetnie uzupełniają naukę z kursu i działają od razu w przeglądarce, bez
              rejestracji.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
