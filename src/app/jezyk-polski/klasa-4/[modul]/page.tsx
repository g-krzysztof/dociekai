import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, CalendarDays, Layers } from 'lucide-react';
import { img } from '@/lib/media';
import { Typography } from '@/components/ui/typography';
import { TopicRow } from '@/components/ui/course-module/topic-row';
import {
  LessonProgressBadge,
  ModuleCtaButton,
  ModuleStatusBadge,
  SoundNote,
} from '../components/module-progress';
import { POL_MODULES, getModuleBySlug, topicsWord } from '../data/curriculum';
import { getLessonForTopic, getModuleLessons } from '../data/lessons';
import { ModulZMaterialami } from '@/app/materialy/components/materialy-modulu';

/**
 * Strona modułu kursu języka polskiego — spis tematów modułu z postępem dziecka.
 * Kalka kursu historii: te same odznaki i CTA co w matematyce i informatyce
 * (`@/components/ui/course-module`), zasilone `usePolProgress()` przez
 * `components/module-progress.tsx`.
 * Jedna jednostka tematyczna to jedna lekcja (patrz `data/lessons.ts`).
 */

interface ModulePageProps {
  params: Promise<{ modul: string }>;
}

export const dynamic = 'force-static';
/** Tylko moduły z programu — reszta ścieżek to 404, bez renderowania na żądanie. */
export const dynamicParams = false;

export function generateStaticParams() {
  return POL_MODULES.map((item) => ({ modul: item.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { modul } = await params;
  const polModule = getModuleBySlug(modul);

  if (!polModule) return { title: 'Nie znaleziono modułu | DociekAI' };

  const title = `${polModule.title} — język polski klasa 4 | DociekAI`;

  return {
    title,
    description: polModule.goal,
    alternates: { canonical: `https://dociekai.pl/jezyk-polski/klasa-4/${polModule.slug}` },
    openGraph: {
      title,
      description: polModule.goal,
      url: `https://dociekai.pl/jezyk-polski/klasa-4/${polModule.slug}`,
      siteName: 'Dociekai.pl',
      locale: 'pl_PL',
      type: 'article',
    },
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { modul } = await params;
  const polModule = getModuleBySlug(modul);

  if (!polModule) notFound();

  const index = POL_MODULES.findIndex((m) => m.slug === polModule.slug);
  const previous = index > 0 ? POL_MODULES[index - 1] : null;
  const next = index < POL_MODULES.length - 1 ? POL_MODULES[index + 1] : null;

  const facts = [
    { icon: Layers, label: 'Tematów', value: String(polModule.lessons.length) },
    { icon: Clock, label: 'Czas', value: polModule.hours },
    { icon: CalendarDays, label: 'Tygodnie', value: polModule.weeks },
  ];

  const availableLessons = getModuleLessons(polModule.slug).filter(
    (lesson) => lesson.status === 'available'
  );

  /** Wersja koloru modułu bezpieczna jako mały tekst (WCAG 4.5:1). */
  const moduleTextColor = `color-mix(in oklch, ${polModule.color} 88%, black)`;

  return (
    <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-4">
      <Link
        href="/jezyk-polski/klasa-4"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do programu języka polskiego
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
              style={{ color: polModule.color }}
            >
              {String(polModule.number).padStart(2, '0')}
            </span>
          </div>
          <Typography variant="h1" className="pb-1 sm:pb-2">
            {polModule.title}
          </Typography>
        </div>

        <div className="mt-8 flex flex-wrap items-start gap-x-8 gap-y-6">
          <div className="max-w-3xl flex-1 basis-64">
            <Typography className="text-muted-foreground">{polModule.intro}</Typography>

            {polModule.highlights.length > 0 && (
              <p className="mt-3 text-sm font-semibold" style={{ color: moduleTextColor }}>
                {polModule.highlights.join('  ·  ')}
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
                moduleSlug={polModule.slug}
                firstLessonNumber={availableLessons[0]?.number}
              />
            </div>

            {availableLessons[0] && <ModuleCtaButton lessons={availableLessons} className="mt-6" />}
          </div>

          {/* Okładka modułu — stoi swobodnie, lekki obrót zamiast ramki.
              Moduł bez ustalonej ilustracji po prostu nie podaje `image`
              i ten blok się nie renderuje. */}
          {polModule.image && (
            <div className="w-40 shrink-0 -rotate-3 sm:w-48">
              <div className="relative aspect-[4/3]">
                <Image
                  src={img(polModule.image)}
                  alt={`Ilustracja modułu: ${polModule.title}`}
                  width={224}
                  height={168}
                  className="absolute inset-0 h-full w-full object-contain"
                  priority
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Lista tematów — spis treści, nie siatka kart: numery jako typografia,
          cienkie linie między wierszami zamiast obwódek wokół każdego z osobna. */}
      <ModulZMaterialami modulHref={`/jezyk-polski/klasa-4/${polModule.slug}`}>
        <section className="mb-16 max-w-4xl">
          <div className="border-b pb-3">
            <Typography variant="h2" className="border-none text-2xl font-bold md:text-3xl">
              Czego się nauczysz
            </Typography>
            <Typography variant="muted" className="mt-1">
              {polModule.lessons.length} {topicsWord(polModule.lessons.length)} w tym module. Lekcje
              online udostępniamy stopniowo.
            </Typography>
          </div>

          <ol className="divide-y">
            {polModule.lessons.map((topic, i) => {
              const topicLesson = getLessonForTopic(polModule.slug, i);
              const isReady = topicLesson?.status === 'available';

              return isReady ? (
                <li key={topic} id={`temat-${i + 1}`} className="scroll-mt-24">
                  <TopicRow
                    href={`/jezyk-polski/klasa-4/${polModule.slug}/${topicLesson.slug}`}
                    color={polModule.color}
                    index={i + 1}
                    topic={
                      <>
                        {topic}
                        <SoundNote lesson={topicLesson} />
                      </>
                    }
                    status={<LessonProgressBadge lesson={topicLesson} color={polModule.color} />}
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
                    style={{ color: polModule.color }}
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
                href={`/jezyk-polski/klasa-4/${previous.slug}`}
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
                href={`/jezyk-polski/klasa-4/${next.slug}`}
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
