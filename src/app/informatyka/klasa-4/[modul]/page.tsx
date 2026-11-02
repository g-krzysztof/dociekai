import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, CalendarDays, Layers } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { TopicRow } from '@/components/ui/course-module/topic-row';
import {
  LessonProgressBadge,
  ModuleCtaButton,
  ModuleStatusBadge,
} from '../components/module-progress';
import { INFO_MODULES, getModuleBySlug, topicsWord } from '../data/curriculum';
import { getLessonForTopic, getModuleLessons } from '../data/lessons';
import { ModulZMaterialami } from '@/app/materialy/components/materialy-modulu';

/**
 * Strona modułu kursu informatyki — spis tematów działu z postępem dziecka.
 *
 * Odznaki postępu i CTA „Rozpocznij / Kontynuuj / Powtórz” to te same
 * komponenty co w `/matematyka/klasa-4/[modul]` (`@/components/ui/course-module`),
 * zasilone `useInfoProgress()` przez `components/module-progress.tsx`. Względem
 * matematyki brak ilustracji modułu (czeka na własny język wizualny) i przewodników
 * — jedna jednostka tematyczna to jedna lekcja (patrz `data/lessons.ts`).
 */

interface ModulePageProps {
  params: Promise<{ modul: string }>;
}

export const dynamic = 'force-static';
/** Tylko moduły z programu — reszta ścieżek to 404, bez renderowania na żądanie. */
export const dynamicParams = false;

export function generateStaticParams() {
  return INFO_MODULES.map((item) => ({ modul: item.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { modul } = await params;
  const infoModule = getModuleBySlug(modul);

  if (!infoModule) return { title: 'Nie znaleziono modułu | DociekAI' };

  const title = `${infoModule.title} — informatyka klasa 4 | DociekAI`;

  return {
    title,
    description: infoModule.goal,
    alternates: { canonical: `https://dociekai.pl/informatyka/klasa-4/${infoModule.slug}` },
    openGraph: {
      title,
      description: infoModule.goal,
      url: `https://dociekai.pl/informatyka/klasa-4/${infoModule.slug}`,
      siteName: 'Dociekai.pl',
      locale: 'pl_PL',
      type: 'article',
    },
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { modul } = await params;
  const infoModule = getModuleBySlug(modul);

  if (!infoModule) notFound();

  const index = INFO_MODULES.findIndex((m) => m.slug === infoModule.slug);
  const previous = index > 0 ? INFO_MODULES[index - 1] : null;
  const next = index < INFO_MODULES.length - 1 ? INFO_MODULES[index + 1] : null;

  const facts = [
    { icon: Layers, label: 'Tematów', value: String(infoModule.lessons.length) },
    { icon: Clock, label: 'Czas', value: infoModule.hours },
    { icon: CalendarDays, label: 'Tygodnie', value: infoModule.weeks },
  ];

  const availableLessons = getModuleLessons(infoModule.slug).filter(
    (lesson) => lesson.status === 'available'
  );

  /** Wersja koloru modułu bezpieczna jako mały tekst (WCAG 4.5:1). */
  const moduleTextColor = `color-mix(in oklch, ${infoModule.color} 88%, black)`;

  return (
    <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <Link
        href="/informatyka/klasa-4"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do programu informatyki
      </Link>

      <header className="mb-14">
        <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
          <div className="leading-none">
            <span
              className="block text-xs font-bold tracking-[0.2em]"
              style={{ color: moduleTextColor }}
            >
              MODUŁ
            </span>
            <span
              className="block text-6xl font-black leading-[0.85] sm:text-7xl lg:text-8xl"
              style={{ color: infoModule.color }}
            >
              {String(infoModule.number).padStart(2, '0')}
            </span>
          </div>
          <Typography variant="h1" className="pb-1 sm:pb-2">
            {infoModule.title}
          </Typography>
        </div>

        <div className="mt-8 max-w-3xl">
          <Typography className="text-muted-foreground">{infoModule.intro}</Typography>

          {infoModule.highlights.length > 0 && (
            <p className="mt-3 text-sm font-semibold" style={{ color: moduleTextColor }}>
              {infoModule.highlights.join('  ·  ')}
            </p>
          )}

          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-4 text-sm text-muted-foreground">
            {facts.map(({ icon: Icon, label, value }) => (
              <span key={label} className="inline-flex items-center gap-1.5">
                <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {label} <span className="font-bold text-foreground">{value}</span>
              </span>
            ))}
            <ModuleStatusBadge
              moduleSlug={infoModule.slug}
              firstLessonNumber={availableLessons[0]?.number}
            />
          </div>

          {availableLessons[0] && <ModuleCtaButton lessons={availableLessons} className="mt-6" />}
        </div>
      </header>

      {/* Lista tematów — spis treści, nie siatka kart: numery jako typografia,
          cienkie linie między wierszami zamiast obwódek wokół każdego z osobna. */}
      <ModulZMaterialami modulHref={`/informatyka/klasa-4/${infoModule.slug}`}>
        <section className="mb-16 max-w-4xl">
          <div className="border-b pb-3">
            <Typography variant="h2" className="border-none text-2xl font-bold md:text-3xl">
              Czego się nauczysz
            </Typography>
            <Typography variant="muted" className="mt-1">
              {infoModule.lessons.length} {topicsWord(infoModule.lessons.length)} w tym module.
              Lekcje online udostępniamy stopniowo.
            </Typography>
          </div>

          <ol className="divide-y">
            {infoModule.lessons.map((topic, i) => {
              const topicLesson = getLessonForTopic(infoModule.slug, i);
              const isReady = topicLesson?.status === 'available';

              return isReady ? (
                <li key={topic} id={`temat-${i + 1}`} className="scroll-mt-24">
                  <TopicRow
                    href={`/informatyka/klasa-4/${infoModule.slug}/${topicLesson.slug}`}
                    color={infoModule.color}
                    index={i + 1}
                    topic={topic}
                    status={<LessonProgressBadge lesson={topicLesson} color={infoModule.color} />}
                  />
                </li>
              ) : (
                // `px-5` jak w `TopicRow` — moduł w budowie miesza oba rodzaje
                // wierszy, a numery mają stać w jednej kolumnie.
                <li
                  key={topic}
                  id={`temat-${i + 1}`}
                  className="flex scroll-mt-24 items-start gap-4 px-5 py-5"
                >
                  <span
                    className="w-10 shrink-0 text-2xl font-black leading-none sm:text-3xl"
                    style={{ color: infoModule.color }}
                  >
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <span className="flex-1 py-1 text-sm leading-relaxed sm:text-base">{topic}</span>
                  <span className="mt-1 shrink-0 text-sm font-medium text-muted-foreground">
                    wkrótce
                  </span>
                </li>
              );
            })}
          </ol>
        </section>

        <nav className="mb-16 max-w-4xl border-t pt-6" aria-label="Nawigacja między modułami">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/informatyka/klasa-4/${previous.slug}`}
                className="group flex items-center gap-3"
              >
                <ArrowLeft className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:-translate-x-1" />
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Poprzedni moduł
                  </span>
                  <span
                    className="block truncate text-lg font-bold"
                    style={{ color: `color-mix(in oklch, ${previous.color} 88%, black)` }}
                  >
                    {previous.title}
                  </span>
                </span>
              </Link>
            ) : (
              <span />
            )}

            {next && (
              <Link
                href={`/informatyka/klasa-4/${next.slug}`}
                className="group flex items-center justify-end gap-3 text-right sm:col-start-2"
              >
                <span className="min-w-0">
                  <span className="block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                    Następny moduł
                  </span>
                  <span
                    className="block truncate text-lg font-bold"
                    style={{ color: `color-mix(in oklch, ${next.color} 88%, black)` }}
                  >
                    {next.title}
                  </span>
                </span>
                <ArrowRight className="h-5 w-5 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" />
              </Link>
            )}
          </div>
        </nav>
      </ModulZMaterialami>
    </div>
  );
}
