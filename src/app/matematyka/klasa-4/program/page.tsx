import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CURRICULUM_STATS, MATH_MODULES } from '../data/curriculum';
import {
  getModuleLessons,
  getPublishedLessons,
  getPublishedTeachingLessons,
  isGuide,
} from '../data/lessons';

/**
 * Spis treści całego kursu — jedna strona, wszystkie działy i wszystkie lekcje.
 *
 * Powstała z powodu indeksacyjnego: hub (`YearShelf`) renderuje listę lekcji
 * tylko dla otwartego działu, a strony działów są linkowane wyłącznie z huba,
 * więc lekcje leżały cztery kliknięcia od strony głównej i były praktycznie
 * osierocone. Ta strona spłaszcza to do dwóch kliknięć: stopka → spis treści →
 * lekcja. Jest w całości serwerowa (zero JS, zero stanu postępu), więc każdy
 * link istnieje w HTML-u od razu, bez interakcji.
 *
 * Dla użytkownika to jest widok „pokaż mi wszystko naraz”, którego półka na
 * hubie celowo nie daje — tam wybiera się dział po dziale.
 */

const URL = 'https://dociekai.pl/matematyka/klasa-4/program';
const TITLE = 'Program kursu matematyki dla klasy 4 — spis wszystkich lekcji | DociekAI';
const DESCRIPTION = `Pełny spis treści kursu matematyki dla klasy 4: ${CURRICULUM_STATS.modules} działów i wszystkie lekcje online, od liczb naturalnych po bryły. Zgodny z podstawą programową MEiN.`;

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    siteName: 'Dociekai.pl',
    locale: 'pl_PL',
    type: 'website',
  },
};

export const dynamic = 'force-static';

export default function ProgramPage() {
  // Rozdzielone celowo: „lekcja” i „przewodnik” to dwa różne typy treści
  // (patrz `MathLesson.kind`), a wspólna liczba rozjeżdżałaby się z „~65 lekcji
  // online” podawanym na hubie.
  const lessonCount = getPublishedTeachingLessons().length;
  const guideCount = getPublishedLessons().length - lessonCount;

  return (
    <div className="container mx-auto max-w-5xl px-3 py-10 sm:px-4">
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href="/matematyka" className="transition-colors hover:text-primary">
          Matematyka
        </Link>
        <span aria-hidden>/</span>
        <Link href="/matematyka/klasa-4" className="transition-colors hover:text-primary">
          Klasa 4
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">Program kursu</span>
      </nav>

      <header className="border-b pb-8">
        <span className="block text-xs font-bold tracking-[0.2em] text-primary">SPIS TREŚCI</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Program kursu matematyki dla klasy 4
        </h1>
        <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
          Cały rok nauki na jednej stronie: {CURRICULUM_STATS.modules} działów zgodnych z podstawą
          programową MEiN, {CURRICULUM_STATS.topics} jednostek tematycznych oraz {lessonCount}{' '}
          lekcji i {guideCount} przewodników gotowych do przerobienia. Kolejne udostępniamy
          stopniowo — pozycje oznaczone jako „wkrótce” są już zaplanowane.
        </p>
        <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {CURRICULUM_STATS.modules} działów · {lessonCount} lekcji · {guideCount} przewodników ·{' '}
          {CURRICULUM_STATS.hours} godzin nauki
        </p>
      </header>

      <div className="mt-12 space-y-14">
        {MATH_MODULES.map((mathModule) => {
          const lessons = getModuleLessons(mathModule.slug);
          const moduleTextColor = `color-mix(in oklch, ${mathModule.color} 88%, black)`;

          return (
            <section key={mathModule.slug} id={`dzial-${mathModule.slug}`} className="scroll-mt-8">
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2 border-b pb-4">
                <span
                  className="font-mono text-4xl font-black leading-none tabular-nums sm:text-5xl"
                  style={{ color: mathModule.color }}
                  aria-hidden
                >
                  {String(mathModule.number).padStart(2, '0')}
                </span>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <Link
                    href={`/matematyka/klasa-4/${mathModule.slug}`}
                    className="hover:underline"
                  >
                    {mathModule.title}
                  </Link>
                </h2>
                <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  tydz. {mathModule.weeks} · {mathModule.hours}
                </span>
              </div>

              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                {mathModule.goal}
              </p>

              {lessons.length > 0 ? (
                <ol className="mt-5 divide-y border-t">
                  {lessons.map((lesson) => (
                    <li key={lesson.slug} className="flex items-baseline gap-3 py-3">
                      <span
                        className="w-7 shrink-0 font-mono text-sm font-bold tabular-nums"
                        style={{ color: moduleTextColor }}
                        aria-hidden
                      >
                        {isGuide(lesson) ? '·' : String(lesson.number).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        {lesson.status === 'available' ? (
                          <Link
                            href={`/matematyka/klasa-4/${lesson.moduleSlug}/${lesson.slug}`}
                            className="font-medium hover:underline"
                          >
                            {lesson.short}
                          </Link>
                        ) : (
                          <span className="font-medium text-muted-foreground">{lesson.short}</span>
                        )}
                        <span className="block text-sm leading-snug text-muted-foreground">
                          {lesson.goal}
                        </span>
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                        {lesson.status === 'available' ? lesson.duration : 'wkrótce'}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 border-t pt-5 text-sm text-muted-foreground">
                  Lekcje tego działu są w przygotowaniu.
                </p>
              )}

              <Link
                href={`/matematyka/klasa-4/${mathModule.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: moduleTextColor }}
              >
                Strona działu: {mathModule.title}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>

      <div className="mt-16 border-t pt-6">
        <Link
          href="/matematyka/klasa-4"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do strony kursu
        </Link>
      </div>
    </div>
  );
}
