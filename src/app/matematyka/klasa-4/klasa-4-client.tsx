'use client';

import Link from 'next/link';
import { GoogleIcon } from '@/components/ui/google-icon';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-context';
import { YearShelf } from '@/components/ui/course-shelf/year-shelf';
import { YearProgressRail } from '@/components/ui/course-shelf/year-progress-rail';
import type { ShelfGroup } from '@/components/ui/course-shelf/types';
import { GuestProgressNotice } from '@/components/ui/guest-progress-notice';
import { EmailVerificationNotice } from '@/components/ui/email-verification-notice';
import { StreakStrip } from '@/components/streak/streak-strip';
import { SkillThreadNote } from './components/skill-thread-note';
import { CURRICULUM_STATS, DIFFICULTY_LEVELS, LESSON_TEMPLATE, MATH_MODULES } from './data/curriculum';
import { MATH_LESSONS } from './data/lessons';
import { useMathProgress } from './lib/progress';

const BASE_PATH = '/matematyka/klasa-4';

/** Odcinki roku na półce — podpisy grup grzbietów. */
const SHELF_GROUPS: ShelfGroup[] = [
  { track: 'start', label: 'Start', weeks: 'tydz. 1' },
  { track: 'semestr-1', label: 'Semestr 1', weeks: 'tydz. 2–15' },
  { track: 'semestr-2', label: 'Semestr 2', weeks: 'tydz. 16–32' },
  { track: 'final', label: 'Finał', weeks: 'koniec roku' },
];

/**
 * Hub kursu matematyki klasy 4 — „półka roku".
 *
 * Program nie jest już pionową osią dziesięciu wierszy (5–9 tys. px scrolla,
 * bez poczucia przejścia z działu do działu), tylko dziesięcioma pionowymi
 * grzbietami w jednym ekranie: `YearShelf`. Pozostałe sekcje strony są
 * świadomie spłaszczone do gęstych bloków tekstu z cienkimi liniami zamiast
 * kart z ikonami — cała barwa strony należy do półki.
 */

/** Trzy rzeczy, których rodzic szuka, zanim posadzi dziecko przed kursem. */
const PARENT_NOTES = [
  {
    title: 'Zgodne z podstawą programową',
    accent: '#2563eb',
    text: 'Zakres opracowany na podstawie rozporządzenia MEiN dla klas IV–VIII oraz rozkładów materiału serii Matematyka z plusem (GWO) i Matematyka z kluczem (Nowa Era).',
  },
  {
    title: 'Konkret przed abstrakcją',
    accent: '#16a34a',
    text: 'Każde nowe pojęcie wprowadzamy na przykładach z życia i rysunkach, dopiero potem pojawia się reguła. Bez nadmiaru formalizmu i wkuwania definicji.',
  },
  {
    title: 'Każdy w swoim tempie',
    accent: '#ea580c',
    text: 'Zadania na czterech poziomach trudności (K/P/R/D) pozwalają zarówno nadrobić zaległości, jak i sięgnąć po trudniejsze wyzwania.',
  },
];

export const Klasa4Client = () => {
  const { isAuthenticated } = useAuth();
  const { moduleProgress, lessonProgress, courseProgress, nextLesson, nextLessonStatus, ready } =
    useMathProgress();

  return (
    <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            Matematyka — klasa 4
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Cały rok w dziesięciu działach — od liczb naturalnych po bryły. Kliknij grzbiet, żeby
            otworzyć dział i zobaczyć jego lekcje.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {CURRICULUM_STATS.modules} działów · {CURRICULUM_STATS.onlineLessons} lekcji online ·{' '}
            {CURRICULUM_STATS.hours} godzin · podstawa programowa MEiN
          </p>
        </div>

        <YearProgressRail
          modules={MATH_MODULES}
          basePath={BASE_PATH}
          courseProgress={courseProgress}
          moduleProgress={moduleProgress}
          nextLesson={nextLesson}
          nextLessonStatus={nextLessonStatus}
          ready={ready}
        />
      </header>

      <GuestProgressNotice className="mt-6" />
      <EmailVerificationNotice className="mt-6" />
      <StreakStrip className="mt-6" />

      <section aria-label="Program roku" className="mt-8">
        <YearShelf
          modules={MATH_MODULES}
          lessons={MATH_LESSONS}
          groups={SHELF_GROUPS}
          basePath={BASE_PATH}
          isAuxiliary={(lesson) => lesson.kind === 'przewodnik'}
          moduleProgress={moduleProgress}
          lessonProgress={lessonProgress}
          nextLesson={nextLesson}
          ready={ready}
        />

        {/* Półka pokazuje lekcje tylko otwartego działu — spis treści jest
            wersją „wszystko naraz", i zarazem jedynym miejscem, z którego
            każda lekcja ma link w HTML bez klikania. */}
        <p className="mt-4 text-sm text-muted-foreground">
          Wolisz zobaczyć wszystko naraz?{' '}
          <Link
            href="/matematyka/klasa-4/program"
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Pełny program kursu — {CURRICULUM_STATS.modules} działów i wszystkie lekcje na jednej
            stronie
          </Link>
          .
        </p>
      </section>

      <SkillThreadNote className="mt-8" />

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Każda lekcja ma ten sam rytm
        </h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Dziecko wie, czego się spodziewać, a rodzic — ile to potrwa.
        </p>

        <ol className="mt-7 grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {LESSON_TEMPLATE.map((step) => (
            <li key={step.step} className="border-t-2 border-primary/25 pt-3">
              <p className="flex items-baseline gap-2">
                <span className="font-mono text-lg font-bold tabular-nums text-primary">
                  {step.step}
                </span>
                <span className="font-bold leading-tight">{step.title}</span>
              </p>
              <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
                {step.time}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>

        <div className="mt-9 border-t pt-6">
          <p className="text-sm font-bold">
            Ćwiczenia w każdej lekcji mają cztery poziomy trudności
          </p>
          <dl className="mt-4 grid gap-x-7 gap-y-4 sm:grid-cols-2 lg:grid-cols-4">
            {DIFFICULTY_LEVELS.map((level) => (
              <div key={level.code}>
                <dt className="flex items-baseline gap-2 font-semibold">
                  <span className="font-mono text-base font-bold text-primary">{level.code}</span>
                  {level.name}
                </dt>
                <dd className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  {level.description}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dla rodziców</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Kurs powstał na bazie podstawy programowej i rzeczywistych rozkładów materiału używanych w
          polskich szkołach.
        </p>

        <div className="mt-7 grid gap-x-8 gap-y-7 md:grid-cols-3">
          {PARENT_NOTES.map((note) => (
            <article key={note.title} className="border-t-2 pt-3" style={{ borderColor: note.accent }}>
              <h3 className="text-lg font-bold leading-snug">{note.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{note.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="mt-16 border-t pt-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-xl">
            <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Zacznij od testu diagnostycznego
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Sprawdzisz, co dziecko już umie, i od razu będziesz wiedzieć, które tematy warto
              powtórzyć przed startem.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/matematyka/klasa-4/start">Rozpocznij kurs</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="outline">
                <Link href="/auth?mode=register&returnUrl=/matematyka/klasa-4">
                  <GoogleIcon />
                  Załóż darmowe konto
                </Link>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-7 text-sm text-muted-foreground">
          Szukasz czegoś na rozluźnienie?{' '}
          <Link
            href="/gry-edukacyjne"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            Sprawdź gry matematyczne
          </Link>
        </p>
      </section>
    </div>
  );
};
