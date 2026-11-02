import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, Clock, CalendarDays, Layers } from 'lucide-react';
import { Typography } from '@/components/ui/typography';
import { ModuleStatusBadge } from '../components/module-status-badge';
import { ModuleHeaderStamp } from '../components/module-header-stamp';
import { LessonProgressBadge } from '../components/lesson-progress-badge';
import { ModuleCtaButton } from '../components/module-cta-button';
import { TopicRow } from '@/components/ui/course-module/topic-row';
import { GuideRow } from '../components/guide-row';
import { SummaryRow } from '../components/summary-row';
import { MATH_MODULES, getModuleBySlug, topicsWord } from '../data/curriculum';
import { getLessonForTopic, getModuleGuides, getModuleLessons, isGuide } from '../data/lessons';
import type { MathLesson } from '../data/lessons';
import { img } from '@/lib/media';
import { ModulZMaterialami } from '@/app/materialy/components/materialy-modulu';

interface ModulePageProps {
  params: Promise<{ modul: string }>;
}

export const dynamic = 'force-static';

export function generateStaticParams() {
  return MATH_MODULES.map((item) => ({ modul: item.slug }));
}

export async function generateMetadata({ params }: ModulePageProps): Promise<Metadata> {
  const { modul } = await params;
  const mathModule = getModuleBySlug(modul);

  if (!mathModule) return { title: 'Nie znaleziono modułu | DociekAI' };

  const title = `${mathModule.title} — matematyka klasa 4 | DociekAI`;

  return {
    title,
    description: mathModule.goal,
    alternates: { canonical: `https://dociekai.pl/matematyka/klasa-4/${mathModule.slug}` },
    openGraph: {
      title,
      description: mathModule.goal,
      url: `https://dociekai.pl/matematyka/klasa-4/${mathModule.slug}`,
      siteName: 'Dociekai.pl',
      locale: 'pl_PL',
      type: 'article',
    },
  };
}

export default async function ModulePage({ params }: ModulePageProps) {
  const { modul } = await params;
  const mathModule = getModuleBySlug(modul);

  if (!mathModule) notFound();

  const index = MATH_MODULES.findIndex((m) => m.slug === mathModule.slug);
  const previous = index > 0 ? MATH_MODULES[index - 1] : null;
  const next = index < MATH_MODULES.length - 1 ? MATH_MODULES[index + 1] : null;

  const facts = [
    { icon: Layers, label: 'Tematów', value: String(mathModule.lessons.length) },
    { icon: Clock, label: 'Czas', value: mathModule.hours },
    { icon: CalendarDays, label: 'Tygodnie', value: mathModule.weeks },
  ];

  const availableLessons = getModuleLessons(mathModule.slug).filter(
    (lesson) => lesson.status === 'available'
  );
  const teachingLessons = availableLessons.filter((lesson) => !isGuide(lesson));
  /** Do odznaki w nagłówku — przewodnik nie jest „pierwszą lekcją” modułu. */
  const firstLesson = teachingLessons[0];

  /** Przewodniki wpięte w listę tematów, pogrupowane po indeksie tematu,
   *  przed którym mają się pojawić (`beforeTopic`, brak = koniec listy). */
  const guidesBeforeTopic = new Map<number, MathLesson[]>();
  for (const guide of getModuleGuides(mathModule.slug)) {
    const anchor = guide.beforeTopic ?? mathModule.lessons.length;
    const bucket = guidesBeforeTopic.get(anchor) ?? [];
    bucket.push(guide);
    guidesBeforeTopic.set(anchor, bucket);
  }

  /** Dostępny przewodnik dostaje pełny `GuideRow`; planowany (`status: 'soon'`)
   *  wiersz „wkrótce” w tym samym stylu co jeszcze nieopracowany temat niżej —
   *  to zapowiedź, nie link, więc bez numeracji i bez odznaki postępu. */
  const renderGuideRow = (guide: MathLesson) =>
    guide.status === 'available' ? (
      <li key={guide.slug}>
        <GuideRow guide={guide} color={mathModule.color} />
      </li>
    ) : (
      <li key={guide.slug} className="flex items-start gap-4 py-5">
        <span className="w-10 shrink-0" aria-hidden />
        <span className="flex-1 py-1">
          <span className="block text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
            Przewodnik
          </span>
          <span className="text-sm leading-relaxed sm:text-base">{guide.title}</span>
        </span>
        <span className="mt-1 shrink-0 text-sm font-medium text-muted-foreground">wkrótce</span>
      </li>
    );

  /** Wersja koloru modułu bezpieczna jako mały tekst (WCAG 4.5:1) — sam mathModule.color
   *  wystarcza tylko przy dużym, grubym tekście (numer modułu). */
  const moduleTextColor = `color-mix(in oklch, ${mathModule.color} 88%, black)`;

  return (
    <div className="container mx-auto max-w-7xl px-3 py-8 sm:px-4">
      {/* Powrót */}
      <Link
        href="/matematyka/klasa-4"
        className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
      >
        <ArrowLeft className="h-4 w-4" />
        Wróć do programu matematyki
      </Link>

      {/* Nagłówek modułu — numer jako duży element typograficzny zamiast plakietki;
          ilustracja "odklejona" od kontenera zamiast osadzona w kolorowym pudełku. */}
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
              style={{ color: mathModule.color }}
            >
              {String(mathModule.number).padStart(2, '0')}
            </span>
          </div>
          <Typography variant="h1" className="pb-1 sm:pb-2">
            {mathModule.title}
          </Typography>
        </div>

        <div className="mt-8 grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-[1fr_224px] md:items-start md:gap-10">
          <div className="order-2 md:order-1">
            <Typography className="text-muted-foreground">{mathModule.intro}</Typography>

            {mathModule.highlights.length > 0 && (
              <p className="mt-3 text-sm font-semibold" style={{ color: moduleTextColor }}>
                {mathModule.highlights.join('  ·  ')}
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
                moduleSlug={mathModule.slug}
                firstLessonNumber={firstLesson?.number}
              />
            </div>

            {availableLessons[0] && <ModuleCtaButton lessons={availableLessons} className="mt-6" />}
          </div>

          {/* Ilustracja bez ramki/tła — stoi swobodnie na białym tle strony, lekki obrót
              zamiast obwódki sygnalizuje, że to celowa kompozycja, nie kontener UI. */}
          <div className="order-1 mx-auto w-40 -rotate-3 sm:w-48 md:order-2 md:mx-0 md:w-full">
            <div className="relative aspect-[4/3]">
              <Image
                src={img(mathModule.image)}
                alt={`Ilustracja modułu: ${mathModule.title}`}
                width={224}
                height={168}
                className="absolute inset-0 h-full w-full object-contain"
                priority
              />
              <ModuleHeaderStamp moduleSlug={mathModule.slug} />
            </div>
          </div>
        </div>
      </header>

      {/* Lista tematów — spis treści, nie siatka kart: numery jako typografia,
          cienkie linie między wierszami zamiast obwódek wokół każdego z osobna.
          Przewodniki (bez numeracji, bez wliczania do statystyk poniżej) są
          wpięte między tematy wg `beforeTopic`, nie tylko na starcie modułu. */}
      <ModulZMaterialami modulHref={`/matematyka/klasa-4/${mathModule.slug}`}>
        <section className="mb-16 max-w-4xl">
          <div className="border-b pb-3">
            <Typography variant="h2" className="border-none text-2xl font-bold md:text-3xl">
              Czego się nauczysz
            </Typography>
            <Typography variant="muted" className="mt-1">
              {mathModule.lessons.length} {topicsWord(mathModule.lessons.length)} w tym module.
              Lekcje online udostępniamy stopniowo.
            </Typography>
          </div>

          <ol className="divide-y">
            {mathModule.lessons.flatMap((topic, i) => {
              const rows = (guidesBeforeTopic.get(i) ?? []).map(renderGuideRow);

              const topicLesson = getLessonForTopic(mathModule.slug, i);
              const isReady = topicLesson?.status === 'available';

              const topicAnchorId = `temat-${i + 1}`;

              rows.push(
                isReady && topicLesson.kind === 'podsumowanie' ? (
                  <li key={topic} id={topicAnchorId} className="scroll-mt-24">
                    <SummaryRow lesson={topicLesson} color={mathModule.color} index={i + 1} />
                  </li>
                ) : isReady ? (
                  <li key={topic} id={topicAnchorId} className="scroll-mt-24">
                    <TopicRow
                      href={`/matematyka/klasa-4/${mathModule.slug}/${topicLesson.slug}`}
                      color={mathModule.color}
                      index={i + 1}
                      topic={topic}
                      status={<LessonProgressBadge lesson={topicLesson} color={mathModule.color} />}
                    />
                  </li>
                ) : (
                  <li
                    key={topic}
                    id={topicAnchorId}
                    className="flex scroll-mt-24 items-start gap-4 py-5"
                  >
                    <span
                      className="w-10 shrink-0 text-2xl font-black leading-none sm:text-3xl"
                      style={{ color: mathModule.color }}
                    >
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span className="flex-1 py-1 text-sm leading-relaxed sm:text-base">
                      {topic}
                    </span>
                    <span className="mt-1 shrink-0 text-sm font-medium text-muted-foreground">
                      wkrótce
                    </span>
                  </li>
                )
              );

              return rows;
            })}
            {(guidesBeforeTopic.get(mathModule.lessons.length) ?? []).map(renderGuideRow)}
          </ol>
        </section>

        {/* Nawigacja między modułami — tytuł podświetlony kolorem docelowego modułu,
          bez obwódek: ten sam język co reszta strony. */}
        <nav className="mb-16 max-w-4xl border-t pt-6" aria-label="Nawigacja między modułami">
          <div className="grid grid-cols-[minmax(0,1fr)] gap-8 sm:grid-cols-2">
            {previous ? (
              <Link
                href={`/matematyka/klasa-4/${previous.slug}`}
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
                href={`/matematyka/klasa-4/${next.slug}`}
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
