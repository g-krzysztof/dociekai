'use client';

import { LessonsSwiper } from '@/app/coding-course/components/lessons-swiper';
import { Code, Lightbulb, Trophy } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { HeroSection } from '@/components/hero-section';
import { DecorativeFrame } from '@/components/decorative-frame';

export const CodingCourseClient = () => {
  return (
    <div>
      
      {/* Hero z ładnym tłem - w kontenerze */}
      <div className="container mx-auto px-3 sm:px-4 max-w-7xl">
        <HeroSection 
          title="Kurs Kodowania"
          description="Dla Dzieci od 7 lat! Naucz się programowania od podstaw poprzez interaktywne lekcje i praktyczne projekty."
          backgroundImage="/images/hero/coding-hero-background-with-dots.webp"
          buttons={[]}
        />
      </div>

      <div className="container mx-auto px-3 sm:px-4 max-w-7xl py-8">
        
        {/* Wybierz lekcję */}
        <section className="mb-16 mt-8">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">Wybierz lekcję i rozpocznij naukę</h2>
            <p className="text-muted-foreground text-lg">Kliknij w lekcję, aby rozpocząć swoją przygodę z programowaniem</p>
          </div>
          <LessonsSwiper />
        </section>

        {/* Sekcja korzyści */}
        <section
          className="py-8 rounded-3xl mb-16 bg-gradient-to-b from-slate-100 to-white dark:from-slate-800 dark:to-slate-900"
        >
          <div className="text-center mb-12 px-4">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Poznaj świat programowania!</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Nasz kurs to idealna brama do fascynującego świata kodowania dla młodych umysłów. 
              Praktyczne zadania, ciekawe wyzwania i przyjazne wyjaśnienia sprawiają, że nauka programowania staje się przygodą!
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-4 max-w-6xl mx-auto px-2">
            <DecorativeFrame glowingBorder glowColor='#d64c29' glowRadius={150}>
                <div className="inline-flex p-5 bg-gradient-to-br from-primary/20 to-primary/10 rounded-2xl mb-6 shadow-lg">
                  <Code className="h-10 w-10 text-primary" />
                </div>
                <h3 className="font-bold text-2xl mb-3">Interaktywne lekcje</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Nie tylko teoria! Twórz prawdziwy kod w przeglądarce i natychmiast zobacz efekty swojej pracy.
                </p>
            </DecorativeFrame>

            <DecorativeFrame glowingBorder glowColor='#fe9a00' glowRadius={150}>  
                <div className="inline-flex p-5 bg-gradient-to-br from-amber-500/20 to-amber-500/10 rounded-2xl mb-6 shadow-lg">
                  <Lightbulb className="h-10 w-10 text-amber-500" />
                </div>
                <h3 className="font-bold text-2xl mb-3">Krok po kroku</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Zaczynamy od podstaw! Proste wyjaśnienia i praktyczne przykłady sprawiają, że każdy może się nauczyć.
                </p>
            </DecorativeFrame>

            <DecorativeFrame glowingBorder glowColor='#00c950' glowRadius={150}>
                <div className="inline-flex p-5 bg-gradient-to-br from-green-500/20 to-green-500/10 rounded-2xl mb-6 shadow-lg">
                  <Trophy className="h-10 w-10 text-green-500" />
                </div>
                <h3 className="font-bold text-2xl mb-3">Śledź postępy</h3>
                <p className="text-muted-foreground text-base leading-relaxed">
                  Rozwiązuj quizy i ukończ kolejne lekcje. Programowanie to umiejętność przyszłości!
                </p>
            </DecorativeFrame>
             <DecorativeFrame glowingBorder glowColor='#d64c29' glowRadius={150}>
              <div className="flex flex-col items-center text-center gap-4">
                <h2 className="text-2xl font-bold leading-tight">
                  Gotowy na pierwszą lekcję?
                </h2>
                <p className="text-muted-foreground text-sm">
                  Kurs jest całkowicie darmowy. Zacznij już teraz!
                </p>
                <Link
                  href="/coding-course/lesson01"
                  className="group relative w-full overflow-hidden rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 block"
                >
                  {/* plik z public/ — custom loader i tak go nie transformuje (src/lib/media/loader.ts) */}
                  <Image
                    src="/images/coding-course.jpg"
                    alt="Rozpocznij kurs kodowania"
                    width={400}
                    height={240}
                    className="w-full object-cover transition-transform duration-500 group-hover:scale-105"
                    unoptimized
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex items-end justify-center pb-2">
                    <span className="text-white font-bold text-lg drop-shadow-lg">
                      Rozpocznij kurs →
                    </span>
                  </div>
                </Link>
                {/* {!isAuthenticated && (
                  <Link href="/auth?mode=register&returnUrl=/coding-course" className="w-full">
                    <Button size="sm" className="w-full">
                      Załóż darmowe konto
                    </Button>
                  </Link>
                )} */}
              </div>
            </DecorativeFrame>
          </div>
        </section>
      </div>
    </div>
  );
};
