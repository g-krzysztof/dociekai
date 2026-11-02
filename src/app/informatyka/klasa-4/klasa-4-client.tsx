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
import { CURRICULUM_STATS, INFO_MODULES } from './data/curriculum';
import { INFO_LESSONS } from './data/lessons';
import { useInfoProgress } from './lib/progress';

/**
 * Hub kursu informatyki klasy 4 — ta sama „półka roku" co w matematyce
 * (`@/components/ui/course-shelf`), z danymi tego kursu.
 *
 * Jedyna sekcja, która świadomie odbiega od huba matematyki, to „Każda lekcja
 * ma swój kształt": matematyka obiecuje tam jeden rytm dla wszystkich lekcji,
 * a informatyka wprost obiecuje jego brak.
 */

const BASE_PATH = '/informatyka/klasa-4';

/** Odcinki roku na półce — podpisy grup grzbietów (tygodnie z curriculum.ts). */
const SHELF_GROUPS: ShelfGroup[] = [
  { track: 'start', label: 'Start', weeks: 'tydz. 1' },
  { track: 'semestr-1', label: 'Semestr 1', weeks: 'tydz. 2–14' },
  { track: 'semestr-2', label: 'Semestr 2', weeks: 'tydz. 15–30' },
  { track: 'final', label: 'Finał', weeks: 'tydz. 31–35' },
];

/** Z czego lekcja może być zbudowana — paleta, nie sekwencja. */
const LESSON_BLOCKS = [
  { name: 'Haczyk', description: 'Pytanie albo zaskakujący fakt, który otwiera temat.' },
  { name: 'Wyjaśnienie', description: 'Pojęcie pokazane na konkretnym przykładzie.' },
  { name: 'Pokaz krok po kroku', description: '„Zrób to razem ze mną” w prawdziwym programie.' },
  { name: 'Symulator', description: 'Interaktywny widget na stronie — do wyklikania i zepsucia.' },
  { name: 'Ćwiczenie', description: 'Zadanie z odpowiedzią sprawdzaną od razu.' },
  { name: 'Zadanie praktyczne', description: 'Praca we własnym programie plus lista kontrolna.' },
  { name: 'Dylemat', description: 'Sytuacja bez jednej dobrej odpowiedzi — etyka, AI, bezpieczeństwo.' },
  { name: 'Debugowanie', description: 'Gotowy program z błędem do znalezienia i naprawienia.' },
];

/** Trzy rzeczy, których rodzic szuka, zanim posadzi dziecko przed kursem. */
const PARENT_NOTES = [
  {
    title: 'Nowa podstawa programowa 2026',
    accent: '#7c3aed',
    text: 'Program opracowany na podstawie rozporządzenia MEN z 11 marca 2026 r., które obowiązuje w klasie 4 od 1 września 2026 r. — a nie na starszej, wycofywanej podstawie z 2017 r.',
  },
  {
    title: 'Bezpieczeństwo nie jest dodatkiem',
    accent: '#2563eb',
    text: 'Cały dział o internecie kończy się gotową listą osób, instytucji i numerów, do których dziecko może się zwrócić. Do wydrukowania i powieszenia przy biurku.',
  },
  {
    title: 'Sztuczna inteligencja bez magii',
    accent: '#db2777',
    text: 'Dziecko nie tylko używa narzędzi AI, ale samo trenuje prosty model i widzi, jak zmiana danych zmienia jego odpowiedzi. Tego wymaga nowa podstawa.',
  },
];

export const Klasa4Client = () => {
  const { isAuthenticated } = useAuth();
  const { moduleProgress, lessonProgress, courseProgress, nextLesson, nextLessonStatus, ready } =
    useInfoProgress();

  return (
    <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <header className="flex flex-col gap-7 lg:flex-row lg:items-end lg:justify-between lg:gap-10">
        <div className="min-w-0">
          <h1 className="text-3xl font-extrabold leading-[1.05] tracking-tight sm:text-4xl lg:text-5xl">
            Informatyka — klasa 4
          </h1>
          <p className="mt-3 max-w-2xl leading-relaxed text-muted-foreground">
            Cały rok w dziesięciu działach — od pierwszego pliku po własną grę w Scratchu i trening
            modelu sztucznej inteligencji. Kliknij grzbiet, żeby otworzyć dział i zobaczyć jego
            lekcje.
          </p>
          <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {CURRICULUM_STATS.modules} działów · {CURRICULUM_STATS.topics} lekcji ·{' '}
            {CURRICULUM_STATS.hours} godzin · podstawa programowa 2026
          </p>
        </div>

        <YearProgressRail
          modules={INFO_MODULES}
          basePath={BASE_PATH}
          courseProgress={courseProgress}
          moduleProgress={moduleProgress}
          nextLesson={nextLesson}
          nextLessonStatus={nextLessonStatus}
          ready={ready}
        />
      </header>

      <GuestProgressNotice className="mt-6" color="#7c3aed" />
      <EmailVerificationNotice className="mt-6" color="#7c3aed" />
      <StreakStrip className="mt-6" />

      <section aria-label="Program roku" className="mt-8">
        <YearShelf
          modules={INFO_MODULES}
          lessons={INFO_LESSONS}
          groups={SHELF_GROUPS}
          basePath={BASE_PATH}
          moduleProgress={moduleProgress}
          lessonProgress={lessonProgress}
          nextLesson={nextLesson}
          ready={ready}
        />

        <p className="mt-4 text-sm text-muted-foreground">
          Wolisz zobaczyć wszystko naraz?{' '}
          <Link
            href={`${BASE_PATH}/program`}
            className="font-semibold text-foreground underline-offset-4 hover:underline"
          >
            Pełny program kursu — {CURRICULUM_STATS.modules} działów i wszystkie lekcje na jednej
            stronie
          </Link>
          .
        </p>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Każda lekcja ma swój własny kształt
        </h2>
        <p className="mt-2 max-w-3xl leading-relaxed text-muted-foreground">
          Informatyka nie ma jednego rytmu dla wszystkich lekcji i celowo go nie udaje. Lekcja o
          rozpoznawaniu podejrzanych treści, lekcja o obracaniu fragmentu rysunku i lekcja o
          trenowaniu modelu AI to trzy różne rzeczy — więc mają trzy różne przebiegi. Każda lekcja
          składa się z bloków dobranych do tematu:
        </p>

        <ul className="mt-7 grid gap-x-7 gap-y-6 sm:grid-cols-2 lg:grid-cols-4">
          {LESSON_BLOCKS.map((block) => (
            <li key={block.name} className="border-t-2 border-primary/25 pt-3">
              <p className="font-bold leading-tight">{block.name}</p>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {block.description}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-9 border-t pt-6">
          <p className="text-sm font-bold">Cztery rzeczy są wspólne dla każdej lekcji</p>
          <ol className="mt-3 grid gap-x-7 gap-y-2 text-sm leading-relaxed text-muted-foreground sm:grid-cols-2">
            <li>Na wejściu wiadomo, czego lekcja dotyczy i ile zajmie.</li>
            <li>Kończy się czymś, co dziecko zrobiło samo — nie samym czytaniem.</li>
            <li>Zadania praktyczne mają listę kontrolną „czy udało się”.</li>
            <li>Postęp widać co do bloku, więc wiadomo, gdzie się skończyło.</li>
          </ol>
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">Dla rodziców</h2>
        <p className="mt-2 max-w-2xl leading-relaxed text-muted-foreground">
          Kurs powstaje na bazie podstawy programowej obowiązującej w klasie 4 od września 2026 r.
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
              Kurs jest w budowie — program już nie
            </h2>
            <p className="mt-2 leading-relaxed text-muted-foreground">
              Wszystkie działy i lekcje są rozpisane i widoczne powyżej. Treści udostępniamy
              stopniowo; pozycje oznaczone „wkrótce” są już zaplanowane co do tematu.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={`${BASE_PATH}/program`}>Zobacz pełny program</Link>
            </Button>
            {!isAuthenticated && (
              <Button asChild size="lg" variant="outline">
                <Link href={`/auth?mode=register&returnUrl=${BASE_PATH}`}>
                  <GoogleIcon />
                  Załóż darmowe konto
                </Link>
              </Button>
            )}
          </div>
        </div>

        <p className="mt-7 text-sm text-muted-foreground">
          W międzyczasie sprawdź{' '}
          <Link
            href="/matematyka/klasa-4"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            kurs matematyki dla klasy 4
          </Link>{' '}
          albo{' '}
          <Link
            href="/coding-course"
            className="font-medium text-primary underline-offset-4 hover:underline"
          >
            kurs kodowania
          </Link>
          .
        </p>
      </section>
    </div>
  );
};
