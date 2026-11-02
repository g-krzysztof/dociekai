import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { CURRICULUM_STATS, POL_MODULES } from '../data/curriculum';
import { getModuleLessons, getPublishedLessons } from '../data/lessons';
import { SoundNote } from '../components/module-progress';

/**
 * Spis treści całego kursu — jedna strona, wszystkie moduły i wszystkie lekcje.
 * Kalka kursu historii.
 *
 * Istnieje z powodu indeksacyjnego (ta sama lekcja co przy matematyce): strony
 * modułów są linkowane wyłącznie z huba, więc lekcje leżą głęboko i łatwo je
 * osierocić. Ta strona spłaszcza to do dwóch kliknięć. Jest w całości serwerowa
 * (zero JS, zero stanu postępu), więc każdy link istnieje w HTML-u od razu.
 */

const URL = 'https://dociekai.pl/jezyk-polski/klasa-4/program';
const TITLE = 'Program kursu języka polskiego dla klasy 4 — spis wszystkich lekcji | DociekAI';
const DESCRIPTION =
  'Pełny spis treści kursu języka polskiego dla klasy 4 szkoły podstawowej, zgodny z podstawą programową 2026.';

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
  const readyCount = getPublishedLessons().length;

  return (
    <div className="container mx-auto max-w-5xl px-3 py-10 sm:px-4">
      <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
        <Link href="/jezyk-polski" className="transition-colors hover:text-primary">
          Język polski
        </Link>
        <span aria-hidden>/</span>
        <Link href="/jezyk-polski/klasa-4" className="transition-colors hover:text-primary">
          Klasa 4
        </Link>
        <span aria-hidden>/</span>
        <span className="font-medium text-foreground">Program kursu</span>
      </nav>

      <header className="border-b pb-8">
        <span className="block text-xs font-bold tracking-[0.2em] text-primary">SPIS TREŚCI</span>
        <h1 className="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">
          Program kursu języka polskiego dla klasy 4
        </h1>
        {POL_MODULES.length === 0 ? (
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            Program kursu jest w opracowaniu — układamy moduły i lekcje zgodnie z podstawą
            programową 2026. Gdy tylko pierwszy moduł będzie gotowy, pojawi się na tej stronie.
          </p>
        ) : (
          <>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              Cały rok nauki na jednej stronie: {CURRICULUM_STATS.modules} modułów zgodnych z
              podstawą programową, {CURRICULUM_STATS.topics} lekcji, z czego {readyCount} gotowych
              do przerobienia. Kolejne udostępniamy stopniowo — pozycje oznaczone jako „wkrótce”
              są już zaplanowane.
            </p>
            <p className="mt-3 max-w-3xl text-sm leading-relaxed text-muted-foreground/80">
              Kurs ćwiczy na stronie to, co da się uczciwie sprawdzić bez nauczyciela: słowa,
              zdania, pisownię, czytanie ze zrozumieniem i budowę tekstu. Nie zastępuje lekcji
              polskiego w szkole — dłuższe wypracowania, czytanie lektur z klasą i rozmowa o nich
              zostają w szkole.
            </p>
            <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
              {CURRICULUM_STATS.modules} modułów · {CURRICULUM_STATS.topics} lekcji ·{' '}
              {CURRICULUM_STATS.hours} godzin nauki
            </p>
          </>
        )}
      </header>

      <div className="mt-12 space-y-14">
        {POL_MODULES.map((polModule) => {
          const lessons = getModuleLessons(polModule.slug);
          const moduleTextColor = `color-mix(in oklch, ${polModule.color} 88%, black)`;

          return (
            <section key={polModule.slug} id={`modul-${polModule.slug}`} className="scroll-mt-8">
              <div className="flex flex-wrap items-end gap-x-5 gap-y-2 border-b pb-4">
                <span
                  className="font-mono text-4xl font-black leading-none tabular-nums sm:text-5xl"
                  style={{ color: polModule.color }}
                  aria-hidden
                >
                  {String(polModule.number).padStart(2, '0')}
                </span>
                <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                  <Link href={`/jezyk-polski/klasa-4/${polModule.slug}`} className="hover:underline">
                    {polModule.title}
                  </Link>
                </h2>
                <span className="ml-auto font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
                  tydz. {polModule.weeks} · {polModule.hours}
                </span>
              </div>

              <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground">
                {polModule.goal}
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
                        {String(lesson.number).padStart(2, '0')}
                      </span>
                      <span className="min-w-0 flex-1">
                        {lesson.status === 'available' ? (
                          <Link
                            href={`/jezyk-polski/klasa-4/${lesson.moduleSlug}/${lesson.slug}`}
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
                        <SoundNote lesson={lesson} />
                      </span>
                      <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                        {lesson.status === 'available' ? lesson.duration : 'wkrótce'}
                      </span>
                    </li>
                  ))}
                </ol>
              ) : (
                <p className="mt-5 border-t pt-5 text-sm text-muted-foreground">
                  Lekcje tego modułu są w przygotowaniu.
                </p>
              )}

              <Link
                href={`/jezyk-polski/klasa-4/${polModule.slug}`}
                className="mt-5 inline-flex items-center gap-1.5 text-sm font-semibold underline-offset-4 hover:underline"
                style={{ color: moduleTextColor }}
              >
                Strona modułu: {polModule.title}
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Link>
            </section>
          );
        })}
      </div>

      <div className="mt-16 border-t pt-6">
        <Link
          href="/jezyk-polski/klasa-4"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden />
          Wróć do strony kursu
        </Link>
      </div>
    </div>
  );
}
