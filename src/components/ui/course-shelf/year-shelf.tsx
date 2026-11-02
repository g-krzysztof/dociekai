'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowRight, BookOpen, Check, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { img } from '@/lib/media';
import { ModuleIcon } from '@/components/ui/module-icon';
import {
  shelfLessonKey,
  topicsWord,
  type ShelfGroup,
  type ShelfLesson,
  type ShelfLessonProgress,
  type ShelfModule,
  type ShelfModuleProgress,
} from './types';

/**
 * Półka roku — zastępuje dawny „rocznik" (pionową oś dziesięciu wierszy, przez
 * którą trzeba było przescrollować pół strony, żeby zobaczyć program).
 *
 * Cały rok to teraz dziesięć pionowych grzbietów w jednym ekranie: zamknięty
 * grzbiet niesie numer, tytuł czytany z góry na dół i słupek wypełnienia
 * (= postęp modułu), a otwarty rozsuwa sąsiadów i pokazuje listę lekcji na
 * miejscu. Scroll żyje wyłącznie wewnątrz otwartego działu, nigdy na mapie.
 *
 * Grzbiety są pogrupowane w cztery odcinki roku (start / semestr 1 / semestr 2
 * / finał) z podpisem nad każdym — to one dają „poczucie przechodzenia działów",
 * którego brakowało jednolitej osi.
 *
 * Poniżej `lg` półka obraca się w stos poziomych listew: ta sama hierarchia,
 * ten sam jeden ekran, tylko oś zamieniona.
 */

interface ResolvedGroup extends ShelfGroup {
  modules: ShelfModule[];
}

interface YearShelfProps {
  /** Moduły kursu w kolejności programu. */
  modules: ShelfModule[];
  /** Wszystkie lekcje kursu — półka sama filtruje je po module. */
  lessons: ShelfLesson[];
  /** Odcinki roku z podpisami (Start / Semestr 1 / …). */
  groups: ShelfGroup[];
  /** Korzeń tras kursu, np. `/matematyka/klasa-4`. */
  basePath: string;
  moduleProgress: Record<string, ShelfModuleProgress>;
  lessonProgress: Record<string, ShelfLessonProgress>;
  nextLesson?: ShelfLesson;
  ready: boolean;
  /**
   * Lekcja pomocnicza (w matematyce: przewodnik) — nie liczy się do ukończenia
   * działu i dostaje „·" zamiast numeru. Kurs bez takiego typu treści pomija prop.
   */
  isAuxiliary?: (lesson: ShelfLesson) => boolean;
}

export function YearShelf({
  modules,
  lessons,
  groups: groupLabels,
  basePath,
  moduleProgress,
  lessonProgress,
  nextLesson,
  ready,
  isAuxiliary = () => false,
}: YearShelfProps) {
  /** Domyślnie otwarty jest „Start" — deterministycznie, żeby SSR i pierwsze
   *  malowanie się zgadzały. Dopiero gdy postęp jest odczytany, półka sama
   *  przesuwa się na moduł, w którym user faktycznie stoi. */
  const [openSlug, setOpenSlug] = useState<string>(modules[0]?.slug ?? '');
  const [mounted, setMounted] = useState(false);
  /** Wybór usera (klik albo hash w URL) wygrywa z automatycznym ustawieniem. */
  const pinned = useRef(false);
  const faceRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  const groups: ResolvedGroup[] = useMemo(
    () =>
      groupLabels
        .map(({ track, label, weeks }) => ({
          track,
          label,
          weeks,
          modules: modules.filter((module) => module.track === track),
        }))
        .filter((group) => group.modules.length > 0),
    [groupLabels, modules]
  );

  useEffect(() => {
    setMounted(true);
    const hash = decodeURIComponent(window.location.hash.replace('#dzial-', ''));
    if (hash && modules.some((module) => module.slug === hash)) {
      pinned.current = true;
      setOpenSlug(hash);
    }
  }, [modules]);

  useEffect(() => {
    if (!ready || pinned.current || !nextLesson) return;
    setOpenSlug(nextLesson.moduleSlug);
  }, [ready, nextLesson]);

  const open = useCallback((slug: string) => {
    pinned.current = true;
    setOpenSlug(slug);
    window.history.replaceState(null, '', `#dzial-${slug}`);
  }, []);

  /** Strzałki przenoszą fokus wzdłuż półki i od razu otwierają grzbiet —
   *  klawiaturą przegląda się rok tak samo jak myszą. */
  const onFaceKeyDown = useCallback(
    (event: React.KeyboardEvent, index: number) => {
      // Grzbiet jest linkiem do strony działu (patrz `Spine`), a link reaguje
      // tylko na Enter — Spacja musi więc rozwijać dział jawnie, tak jak
      // robił to `<button>` przed zmianą.
      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault();
        open(modules[index].slug);
        return;
      }

      const keys = ['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End'];
      if (!keys.includes(event.key)) return;
      event.preventDefault();

      const last = modules.length - 1;
      const next =
        event.key === 'Home'
          ? 0
          : event.key === 'End'
            ? last
            : event.key === 'ArrowLeft' || event.key === 'ArrowUp'
              ? Math.max(0, index - 1)
              : Math.min(last, index + 1);

      const slug = modules[next].slug;
      open(slug);
      faceRefs.current[slug]?.focus();
    },
    [modules, open]
  );

  return (
    <div className="flex flex-col gap-5 lg:h-[clamp(25rem,58vh,33rem)] lg:flex-row lg:gap-5">
      {groups.map((group) => {
        const holdsOpen = group.modules.some((module) => module.slug === openSlug);

        return (
          <section
            key={group.track}
            aria-label={`${group.label} · ${group.weeks}`}
            className={cn(
              'flex flex-col gap-2 lg:min-h-0',
              'lg:[flex-basis:0] lg:[flex-grow:var(--group-grow)]',
              'transition-[flex-grow] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none'
            )}
            style={{ '--group-grow': holdsOpen ? 1 : 0 } as React.CSSProperties}
          >
            {/* Zakres tygodni dochodzi tylko przy odcinku, w którym stoi otwarty
                dział — zamknięty grzbietownik jest za wąski na pełny podpis, a
                informacja i tak jest potrzebna dopiero, gdy się w nim jest. */}
            <p className="whitespace-nowrap font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
              {group.label}
              {holdsOpen && <span className="font-normal"> · {group.weeks}</span>}
            </p>

            <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
              {group.modules.map((module) => (
                <Spine
                  key={module.slug}
                  module={module}
                  moduleLessons={lessons
                    .filter((lesson) => lesson.moduleSlug === module.slug)
                    .sort((a, b) => a.number - b.number)}
                  basePath={basePath}
                  isAuxiliary={isAuxiliary}
                  isOpen={module.slug === openSlug}
                  mounted={mounted}
                  progress={moduleProgress[module.slug]}
                  lessonProgress={lessonProgress}
                  index={modules.findIndex((entry) => entry.slug === module.slug)}
                  onOpen={open}
                  onKeyDown={onFaceKeyDown}
                  registerFace={(element) => {
                    faceRefs.current[module.slug] = element;
                  }}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

interface SpineProps {
  module: ShelfModule;
  /** Lekcje tego modułu, posortowane — półka nie sięga po dane kursu sama. */
  moduleLessons: ShelfLesson[];
  basePath: string;
  isAuxiliary: (lesson: ShelfLesson) => boolean;
  isOpen: boolean;
  mounted: boolean;
  progress?: ShelfModuleProgress;
  lessonProgress: Record<string, ShelfLessonProgress>;
  index: number;
  onOpen: (slug: string) => void;
  onKeyDown: (event: React.KeyboardEvent, index: number) => void;
  registerFace: (element: HTMLAnchorElement | null) => void;
}

function Spine({
  module,
  moduleLessons,
  basePath,
  isAuxiliary,
  isOpen,
  mounted,
  progress,
  lessonProgress,
  index,
  onOpen,
  onKeyDown,
  registerFace,
}: SpineProps) {
  const isAvailable = module.status === 'available';
  const isDone = progress?.status === 'done';
  const number = String(module.number).padStart(2, '0');
  /** Ile lekcji dział w ogóle ma — liczone z `lessons.ts`, nie z postępu, żeby
   *  licznik stał w HTML-u od razu (SSR), a nie dopiero po odczycie magazynu.
   *  Bez przewodników: to ta sama podstawa, na której liczy się ukończenie. */
  const publishedLessons = moduleLessons.filter(
    (item) => item.status === 'available' && !isAuxiliary(item)
  ).length;
  const doneLessons = progress?.doneLessons ?? 0;
  const started = progress ? progress.status !== 'not-started' : false;
  /** Dział otwarty samym przewodnikiem: `0/0` byłoby bez sensu, a pusta stopka
   *  czytałaby się jak „nic tu nie ma" — ikona mówi, że jest już co czytać. */
  const guideOnly =
    publishedLessons === 0 && moduleLessons.some((item) => item.status === 'available');
  const percent =
    progress && progress.totalLessons > 0
      ? Math.round((progress.doneLessons / progress.totalLessons) * 100)
      : 0;
  const faceId = `grzbiet-${module.slug}`;
  const panelId = `dzial-panel-${module.slug}`;

  return (
    <div
      className={cn(
        'group/spine relative flex min-w-0 flex-col border border-border/70',
        '-mt-px first:mt-0 lg:-ml-px lg:mt-0 lg:first:ml-0 lg:flex-row',
        'lg:[flex-basis:0] lg:[flex-grow:var(--spine-grow)] lg:[min-width:var(--spine-min)]',
        'transition-[flex-grow,min-width] duration-[600ms] ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none',
        // Kolor modułu w rozmiarze body jest za jasny na białym i za ciemny na
        // czarnym — stąd dwa domieszania zamiast surowego `module.color`.
        // Klasy, nie `style`, bo inline nadpisałby wariant `dark:`.
        '[--mod-text:color-mix(in_oklch,var(--mod)_84%,black)]',
        'dark:[--mod-text:color-mix(in_oklch,var(--mod)_72%,white)]',
        isOpen && 'z-10'
      )}
      style={
        {
          '--mod': module.color,
          '--spine-grow': isOpen ? 1 : 0,
          '--spine-min': isOpen ? '19rem' : '3.5rem',
        } as React.CSSProperties
      }
    >
      {/* Grzbiet jest linkiem do strony działu, choć zwykły klik go tylko
          rozwija (`preventDefault`). Powód jest indeksacyjny: panel z linkami
          renderuje się wyłącznie dla otwartego działu, więc dopóki grzbiet był
          `<button>`, dziewięć z dziesięciu działów nie miało w HTML-u ani
          jednej kotwicy i cały kurs był dla robota zbiorem stron osieroconych.
          Przy okazji działa bez JS i obsługuje ctrl/średni klik oraz „otwórz w
          nowej karcie". */}
      <Link
        ref={registerFace}
        id={faceId}
        href={`${basePath}/${module.slug}`}
        aria-expanded={isOpen}
        aria-controls={panelId}
        onClick={(event) => {
          // Modyfikatory i klik środkowym zostawiamy przeglądarce — user
          // świadomie prosi wtedy o nawigację, nie o rozwinięcie półki.
          if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
            return;
          }
          event.preventDefault();
          onOpen(module.slug);
        }}
        onKeyDown={(event) => onKeyDown(event, index)}
        className={cn(
          'relative flex shrink-0 cursor-pointer items-center gap-3 overflow-hidden px-3 py-3 text-left outline-none',
          'transition-[background-color,box-shadow,transform] duration-300 motion-reduce:transition-none',
          'focus-visible:ring-2 focus-visible:ring-[var(--mod)] focus-visible:ring-inset',
          'lg:h-full lg:w-14 lg:flex-col lg:items-stretch lg:gap-4 lg:px-0 lg:py-4',
          isOpen
            ? 'bg-[color-mix(in_oklch,var(--mod)_18%,transparent)] shadow-[inset_0_4px_0_var(--mod)] dark:bg-[color-mix(in_oklch,var(--mod)_28%,transparent)] lg:shadow-[inset_4px_0_0_var(--mod)]'
            : 'bg-[color-mix(in_oklch,var(--mod)_8%,transparent)] hover:bg-[color-mix(in_oklch,var(--mod)_16%,transparent)] dark:bg-[color-mix(in_oklch,var(--mod)_16%,transparent)] dark:hover:bg-[color-mix(in_oklch,var(--mod)_26%,transparent)] hover:lg:-translate-y-1.5'
        )}
      >
        {/* Wypełnienie = postęp modułu. Rośnie od lewej (mobile) albo od dołu
            (desktop) i animuje się dopiero po zamontowaniu, więc pierwsze, co
            robi półka po wejściu na stronę, to pokazanie, ile roku masz za sobą. */}
        <span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 left-0 w-[var(--fill)] transition-[width,height] duration-1000 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none lg:inset-x-0 lg:inset-y-auto lg:bottom-0 lg:h-[var(--fill)] lg:w-auto"
          style={
            {
              '--fill': mounted ? `${percent}%` : '0%',
              backgroundColor: 'color-mix(in oklch, var(--mod) 30%, transparent)',
            } as React.CSSProperties
          }
        />

        <span
          className={cn(
            'relative shrink-0 select-none text-center font-mono text-lg font-bold leading-none tabular-nums lg:text-xl'
          )}
          style={
            isAvailable
              ? { color: 'var(--mod-text)' }
              : {
                  color: `${module.color}2e`,
                  WebkitTextStroke: `1px ${module.color}99`,
                }
          }
          aria-hidden
        >
          {number}
        </span>

        <span
          className={cn(
            'relative min-w-0 flex-1 truncate text-sm font-semibold leading-tight',
            // `self-center` zamiast rozciągnięcia: w `vertical-rl` blok zaczyna się
            // przy prawej krawędzi, więc rozciągnięty na całą szerokość grzbietu
            // tytuł przyklejałby się do prawej zamiast stać w osi.
            'lg:[writing-mode:vertical-rl] lg:self-center lg:text-[0.9375rem]',
            isAvailable ? 'text-foreground' : 'text-muted-foreground'
          )}
        >
          {module.title}
        </span>

        <span className="relative flex shrink-0 items-center gap-1.5 lg:flex-col-reverse lg:gap-2">
          {!isAvailable ? (
            <Lock className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          ) : isDone ? (
            <Check className="h-4 w-4" style={{ color: 'var(--mod-text)' }} aria-hidden />
          ) : publishedLessons > 0 ? (
            // Nietknięty dział też pokazuje `0/m` — sama liczba lekcji to
            // informacja, której szukasz przed wejściem w dział; wygaszony
            // kolor odróżnia „jeszcze nie zacząłem" od realnie rozpoczętego.
            <span
              className={cn(
                'font-mono text-[10px] font-bold tabular-nums',
                !started && 'text-muted-foreground'
              )}
              style={started ? { color: 'var(--mod-text)' } : undefined}
            >
              {doneLessons}/{publishedLessons}
            </span>
          ) : guideOnly ? (
            <BookOpen className="h-3.5 w-3.5 text-muted-foreground" aria-hidden />
          ) : null}
          <ChevronRight
            className={cn(
              'h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 motion-reduce:transition-none lg:hidden',
              isOpen && 'rotate-90'
            )}
            aria-hidden
          />
        </span>
      </Link>

      {isOpen && (
        <ModulePanel
          id={panelId}
          labelledBy={faceId}
          module={module}
          moduleLessons={moduleLessons}
          basePath={basePath}
          isAuxiliary={isAuxiliary}
          progress={progress}
          lessonProgress={lessonProgress}
        />
      )}
    </div>
  );
}

/**
 * Czy w liście lekcji zostało coś pod dolną krawędzią. Panel działu ma na
 * desktopie stałą wysokość, a nakładkowe paski przewijania (macOS, iOS) są w
 * spoczynku niewidoczne — bez tego jedynym sygnałem „jedzie dalej" byłby
 * przypadkowo ucięty wiersz.
 */
function useHasMoreBelow<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const measure = () =>
      setHasMore(element.scrollHeight - element.scrollTop - element.clientHeight > 4);

    measure();
    element.addEventListener('scroll', measure, { passive: true });
    const observer = new ResizeObserver(measure);
    observer.observe(element);

    return () => {
      element.removeEventListener('scroll', measure);
      observer.disconnect();
    };
  }, []);

  return { ref, hasMore };
}

interface ModulePanelProps {
  id: string;
  labelledBy: string;
  module: ShelfModule;
  moduleLessons: ShelfLesson[];
  basePath: string;
  isAuxiliary: (lesson: ShelfLesson) => boolean;
  progress?: ShelfModuleProgress;
  lessonProgress: Record<string, ShelfLessonProgress>;
}

function ModulePanel({
  id,
  labelledBy,
  module,
  moduleLessons: lessons,
  basePath,
  isAuxiliary,
  progress,
  lessonProgress,
}: ModulePanelProps) {
  const statusOf = (lesson: ShelfLesson) =>
    lessonProgress[shelfLessonKey(lesson.moduleSlug, lesson.slug)];

  /** Do czego prowadzi główny przycisk działu: pierwsza nieukończona lekcja
   *  (bez przewodników — te są materiałem pomocniczym), a gdy wszystko zrobione,
   *  pełna strona modułu. */
  const teachingLessons = lessons.filter(
    (lesson) => lesson.status === 'available' && !isAuxiliary(lesson)
  );
  const resume = teachingLessons.find((lesson) => statusOf(lesson)?.status !== 'done');
  /** Dział świeżo otwarty przewodnikiem, jeszcze bez ani jednej lekcji. Bez tej
   *  gałęzi `resume` jest puste i stopka kłamie „Cały dział ukończony”. */
  const firstGuide = teachingLessons.length === 0
    ? lessons.find((lesson) => lesson.status === 'available')
    : undefined;
  const started = progress ? progress.doneLessons > 0 : false;
  const { ref: listRef, hasMore } = useHasMoreBelow<HTMLUListElement>();

  return (
    <div
      id={id}
      role="region"
      aria-labelledby={labelledBy}
      className="flex min-h-0 min-w-0 flex-1 flex-col gap-4 bg-[color-mix(in_oklch,var(--mod)_4%,transparent)] p-4 sm:p-5"
    >
      <div className="flex items-start gap-4">
        <div className="min-w-0 flex-1">
          <h3 className="flex items-start gap-2 text-lg font-bold leading-snug sm:text-xl">
            <ModuleIcon
              name={module.icon}
              className="mt-0.5 h-5 w-5 shrink-0"
              style={{ color: 'var(--mod-text)' }}
            />
            {module.title}
          </h3>
          <p className="mt-1.5 font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
            tydz. {module.weeks} · {module.hours} · {module.lessons.length}{' '}
            {topicsWord(module.lessons.length)}
            {progress && progress.totalLessons > 0 && (
              <span style={{ color: 'var(--mod-text)' }}>
                {' '}
                · {progress.doneLessons}/{progress.totalLessons} lekcji
              </span>
            )}
          </p>
          <p className="mt-2.5 max-w-2xl text-sm leading-relaxed text-muted-foreground">
            {module.goal}
          </p>
        </div>

        {/* Ilustracja modułu z podłożoną, przesuniętą ramką — motyw „okazu
            przypiętego przy wpisie" przeniesiony z dawnego rocznika. Kurs bez
            ustalonego języka wizualnego (informatyka) po prostu jej nie podaje. */}
        {module.image && (
        <div className="relative hidden aspect-[4/3] w-28 shrink-0 sm:block lg:w-24">
          <span
            aria-hidden
            className="absolute inset-0 translate-x-2 translate-y-2 border-2"
            style={{ borderColor: 'var(--mod)' }}
          />
          <div className="absolute inset-0 overflow-hidden border border-border bg-background">
            <Image
              src={img(module.image)}
              alt=""
              width={160}
              height={120}
              className="h-full w-full object-contain"
            />
          </div>
        </div>
        )}
      </div>

      <div className="relative flex min-h-0 flex-1 flex-col">
        <ul
          ref={listRef}
          className={cn(
            'min-h-0 max-w-2xl flex-1 overflow-y-auto pr-3',
            // Wymuszony klasyczny pasek przewijania w kolorze działu: nakładkowe
            // paski macOS/iOS są w spoczynku niewidoczne, więc lista 17 lekcji
            // wyglądałaby na skończoną po ósmej pozycji.
            '[scrollbar-color:color-mix(in_oklch,var(--mod)_45%,transparent)_transparent] [scrollbar-width:thin]',
            '[&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-track]:bg-transparent',
            '[&::-webkit-scrollbar-thumb]:rounded-none [&::-webkit-scrollbar-thumb]:bg-[color-mix(in_oklch,var(--mod)_45%,transparent)]'
          )}
          aria-label={`Lekcje: ${module.title}`}
        >
          {lessons.map((lesson) => {
            const state = statusOf(lesson);
            const done = state?.status === 'done';
            const inProgress = state?.status === 'in-progress';
            const marker = isAuxiliary(lesson) ? '·' : String(lesson.number);

            const body = (
              <>
                <span
                  className="w-4 shrink-0 text-right font-mono text-[11px] font-bold tabular-nums"
                  style={{ color: lesson.status === 'available' ? 'var(--mod-text)' : undefined }}
                  aria-hidden
                >
                  {marker}
                </span>
                <span
                  className={cn(
                    'min-w-0 flex-1 text-sm leading-snug',
                    lesson.status === 'available'
                      ? 'text-foreground group-hover/lesson:underline'
                      : 'text-muted-foreground'
                  )}
                >
                  {lesson.short}
                </span>
                <span className="shrink-0 whitespace-nowrap text-[11px] font-medium text-muted-foreground">
                  {lesson.status !== 'available' ? (
                    'wkrótce'
                  ) : done ? (
                    <Check
                      className="h-3.5 w-3.5"
                      style={{ color: 'var(--mod-text)' }}
                      aria-hidden
                    />
                  ) : inProgress ? (
                    <span style={{ color: 'var(--mod-text)' }}>
                      {state?.done}/{state?.total}
                    </span>
                  ) : (
                    lesson.duration
                  )}
                </span>
              </>
            );

            return (
              <li key={lesson.slug} className="border-b border-border/60">
                {lesson.status === 'available' ? (
                  <Link
                    href={`${basePath}/${module.slug}/${lesson.slug}`}
                    className="group/lesson flex items-baseline gap-2.5 py-2.5 outline-none lg:py-1.5 focus-visible:ring-2 focus-visible:ring-[var(--mod)]"
                  >
                    {body}
                  </Link>
                ) : (
                  <span className="flex items-baseline gap-2.5 py-2.5 lg:py-1.5">{body}</span>
                )}
              </li>
            );
          })}
        </ul>
        {/* Wygaszenie dolnej krawędzi — jedyny sygnał, że lista jedzie dalej,
            odkąd panel ma stałą wysokość, a nakładkowe paski przewijania są
            niewidoczne w spoczynku. */}
        <span
          aria-hidden
          className={cn(
            'pointer-events-none absolute inset-x-0 bottom-0 h-9 max-w-2xl bg-gradient-to-t from-background/75 via-background/20 to-transparent transition-opacity duration-200 motion-reduce:transition-none',
            hasMore ? 'opacity-100' : 'opacity-0'
          )}
        />
      </div>

      <div className="mt-auto flex flex-wrap items-center gap-x-5 gap-y-2 border-t pt-3 text-sm">
        {module.status !== 'available' ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Ten dział jest w przygotowaniu
          </span>
        ) : resume ? (
          <Link
            href={`${basePath}/${module.slug}/${resume.slug}`}
            className="inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline"
            style={{ color: 'var(--mod-text)' }}
          >
            {started ? 'Kontynuuj' : 'Zacznij'}: {resume.short}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        ) : firstGuide ? (
          <>
            <Link
              href={`${basePath}/${module.slug}/${firstGuide.slug}`}
              className="inline-flex items-center gap-1.5 font-bold underline-offset-4 hover:underline"
              style={{ color: 'var(--mod-text)' }}
            >
              Zacznij: {firstGuide.short}
              <ArrowRight className="h-4 w-4" aria-hidden />
            </Link>
            <span className="text-muted-foreground">Lekcje w przygotowaniu</span>
          </>
        ) : teachingLessons.length === 0 ? (
          <span className="inline-flex items-center gap-1.5 text-muted-foreground">
            <Lock className="h-3.5 w-3.5" aria-hidden />
            Lekcje w przygotowaniu
          </span>
        ) : (
          <span
            className="inline-flex items-center gap-1.5 font-bold"
            style={{ color: 'var(--mod-text)' }}
          >
            <Check className="h-4 w-4" aria-hidden />
            Cały dział ukończony
          </span>
        )}

        <Link
          href={`${basePath}/${module.slug}`}
          className="ml-auto inline-flex items-center gap-1.5 text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
        >
          Strona działu
          <ChevronRight className="h-4 w-4" aria-hidden />
        </Link>
      </div>
    </div>
  );
}
