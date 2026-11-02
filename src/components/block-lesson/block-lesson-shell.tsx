'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Clock,
  Layers,
  RotateCcw,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { useAuth } from '@/components/auth-context';
import { GuestProgressNotice } from '@/components/ui/guest-progress-notice';
import { Confetti } from '@/components/ui/confetti';
import { LessonRewardCard } from '@/components/ui/lesson-reward-card';
import { StreakRibbon } from '@/components/streak/streak-ribbon';
import { FacebookFollowNudge } from '@/components/social/facebook-follow';
import { LessonProgressAside } from '@/components/streak/lesson-progress-aside';
import { useLessonStreak } from '@/lib/streak/use-lesson-streak';
import type { CourseId } from '@/lib/streak/sources';
import type { LessonFunFact } from '@/components/ui/lesson-reward-card';
import { getProgressStore, type StoredLessonProgress } from '@/lib/course-progress/storage';

/**
 * Wspólna powłoka lekcji **blokowych** — kursów, w których kształt lekcji wynika
 * z tematu, a nie ze sztywnego szablonu (informatyka, historia). Wypromowana
 * z `app/informatyka/klasa-4/components/lesson-shell.tsx` 2026-09-25, przy
 * drugim konsumencie. Matematyka ma własną, krokową `LessonShell` i tu nie wchodzi.
 *
 * Powłoka przyjmuje **listę bloków zdefiniowaną przez samą lekcję** — dowolnej
 * długości i w dowolnej kolejności. **Paletę rodzajów bloków podaje kurs**
 * (`palette`): każdy przedmiot ma własną, zamkniętą listę opisaną w swoim
 * programie, a powłoka zna tylko
 * etykietę i ikonę rodzaju. Z kursu przychodzą też: magazyn postępu i sync,
 * identyfikator serii nauki, ścieżka kursu i zapowiedź ciekawostki.
 *
 * Wspólne dla wszystkich lekcji jest tylko to, co obiecują huby kursów: zapowiedź
 * tematu i czasu na wejściu (plus opcjonalny slot `entry` — w historii
 * Przypominajka), ponumerowane bloki (z nich liczy się postęp i seria nauki)
 * i zakończenie czymś, co dziecko zrobiło samo (`finishNote` podaje lekcja).
 *
 * Kursy nie używają tego pliku wprost, tylko przez własną nakładkę
 * (`InfoLessonShell`, `HistLessonShell`), która wiąże konfigurację kursu
 * i zawęża typ `kind` do jego palety.
 *
 * Zadania praktyczne stoją obok: `TaskShell` (praca w lekcji z werdyktem)
 * i `PracticeTask` (lista kontrolna — tylko dla pracy poza ekranem).
 */

export interface BlockKindDef {
  label: string;
  icon: LucideIcon;
}

/** Zamknięta paleta rodzajów bloków jednego kursu. */
export type BlockPalette = Record<string, BlockKindDef>;

export interface BlockMeta<K extends string = string> {
  id: string;
  /** Rodzaj bloku z palety kursu — z niego bierze się etykieta i domyślna ikona. */
  kind: K;
  title: string;
  /** Orientacyjny czas bloku, np. „4 min”. */
  time: string;
  /** Nadpisanie ikony palety, gdy temat bloku ma wyraźniejszy symbol. */
  icon?: LucideIcon;
}

/** To, czego powłoka potrzebuje z wpisu lekcji — wspólny kształt `InfoLesson` i `HistLesson`. */
export interface BlockLessonInfo {
  moduleSlug: string;
  slug: string;
  kind: 'lekcja' | 'podsumowanie';
  number: number;
  title: string;
  short: string;
  goal: string;
  duration: string;
  funFact?: LessonFunFact;
}

/** To, czego powłoka potrzebuje z modułu. */
export interface BlockModuleInfo {
  number: number;
  slug: string;
  title: string;
  color: string;
}

/** Konfiguracja kursu — stała, podawana przez nakładkę kursu, nie przez lekcję. */
export interface BlockCourseConfig {
  /** Identyfikator w serii nauki (`lessonKey` = `<course>/<moduł>/<lekcja>`). */
  course: CourseId;
  /** Okruszek i link „Zobacz cały program”, np. „Informatyka”. */
  courseLabel: string;
  /** Ścieżka hubu kursu, np. `/informatyka/klasa-4`. */
  basePath: string;
  palette: BlockPalette;
  readEntry: (store: Storage, moduleSlug: string, lessonSlug: string) => StoredLessonProgress | null;
  writeEntry: (
    store: Storage,
    moduleSlug: string,
    lessonSlug: string,
    data: StoredLessonProgress
  ) => void;
  scheduleSync: (moduleSlug: string, lessonSlug: string, data: StoredLessonProgress) => void;
  /** Zapowiedź zablokowanej ciekawostki, np. „…ze świata komputerów”. */
  funFactTeaser: string;
}

/** 1 blok, 2–4 bloki, 5+ bloków. */
const blocksWord = (count: number) =>
  plural(count, { one: 'blok', few: 'bloki', many: 'bloków' });

interface LessonProgressValue {
  blocks: BlockMeta[];
  palette: BlockPalette;
  completed: string[];
  activeId: string;
  color: string;
  /** Licznik resetów bloku — służy jako `key`, więc jego zmiana montuje ćwiczenie od nowa. */
  resetKeys: Record<string, number>;
  isDone: (id: string) => boolean;
  markDone: (id: string) => void;
  resetBlock: (id: string) => void;
  setActiveId: (id: string) => void;
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

export function useLessonProgress(): LessonProgressValue {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) throw new Error('useLessonProgress musi być użyte wewnątrz powłoki lekcji blokowej');
  return ctx;
}

/**
 * Jak `useLessonProgress`, ale poza powłoką zwraca `null` zamiast rzucać — dla
 * komponentów, które działają i w lekcji, i poza nią (Oś dziejów historii).
 */
export function useOptionalLessonProgress(): LessonProgressValue | null {
  return useContext(LessonProgressContext);
}

/** Oznacza blok jako zaliczony, gdy dziecko skończy to, co w nim jest do zrobienia. */
export function useBlockDone(blockId: string) {
  const { markDone, isDone } = useLessonProgress();
  const done = isDone(blockId);
  const markBlockDone = useCallback(() => markDone(blockId), [markDone, blockId]);
  return { done, markBlockDone };
}

export interface BlockLessonShellProps {
  config: BlockCourseConfig;
  lesson: BlockLessonInfo;
  lessonModule: BlockModuleInfo;
  /** Sekwencja bloków tej konkretnej lekcji — źródło numeracji i postępu. */
  blocks: BlockMeta[];
  nextLesson?: BlockLessonInfo;
  /** Tylko dla `kind: 'podsumowanie'` — kolejny dostępny moduł. */
  nextModule?: BlockModuleInfo;
  /**
   * Zdanie w kartce końcowej. Domyślne jest celowo o samej pracy dziecka —
   * lekcje różnią się tematem, więc konkret podaje lekcja, a nie powłoka.
   */
  finishNote?: ReactNode;
  /**
   * Coś przed pierwszym blokiem, co **nie liczy się do postępu** — w historii
   * karta Przypominajki (pytanie z lekcji 1, 3 albo 8 wstecz).
   */
  entry?: ReactNode;
  children: ReactNode;
}

export function BlockLessonShell({
  config,
  lesson,
  lessonModule,
  blocks,
  nextLesson,
  nextModule,
  finishNote = 'Wszystkie bloki za tobą — i w każdym z nich coś zrobiłeś/zrobiłaś sam/sama.',
  entry,
  children,
}: BlockLessonShellProps) {
  const { course, courseLabel, basePath, palette, readEntry, writeEntry, scheduleSync, funFactTeaser } =
    config;
  const { isAuthenticated, initialLoading } = useAuth();
  /** Wersja koloru modułu bezpieczna jako mały tekst (WCAG 4.5:1) — patrz [modul]/page.tsx. */
  const moduleTextColor = `color-mix(in oklch, ${lessonModule.color} 88%, black)`;
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(blocks[0]?.id ?? '');
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});
  const [restored, setRestored] = useState(false);

  // Postęp gościa żyje tylko w tej karcie (sessionStorage), postęp konta jest
  // trwały (localStorage jako cache serwera). Czekamy na `!initialLoading`,
  // żeby nie przeczytać z niewłaściwego magazynu, zanim stan logowania się ustali.
  useEffect(() => {
    if (initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const entry = readEntry(store, lesson.moduleSlug, lesson.slug);
    setCompleted(entry?.completed ?? []);
    setRestored(true);
  }, [initialLoading, isAuthenticated, lesson.moduleSlug, lesson.slug, readEntry]);

  useEffect(() => {
    if (!restored || initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const data = { completed, total: blocks.length };
    writeEntry(store, lesson.moduleSlug, lesson.slug, data);
    if (isAuthenticated) scheduleSync(lesson.moduleSlug, lesson.slug, data);
  }, [
    completed,
    restored,
    initialLoading,
    isAuthenticated,
    lesson.moduleSlug,
    lesson.slug,
    blocks.length,
    writeEntry,
    scheduleSync,
  ]);

  // Seria nauki liczy dzień po doprowadzeniu lekcji do 100% — ta sama reguła
  // i ten sam hook we wszystkich kursach, bo seria jest wspólna.
  const { event: streakEvent, justFinished } = useLessonStreak({
    course,
    moduleSlug: lesson.moduleSlug,
    lessonSlug: lesson.slug,
    completed,
    total: blocks.length,
    restored,
    isAuthenticated,
    initialLoading,
  });

  const markDone = useCallback((id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const isDone = useCallback((id: string) => completed.includes(id), [completed]);

  /** Reset pojedynczego bloku: czyścimy odhaczenie i przemontowujemy ćwiczenie. */
  const resetBlock = useCallback((id: string) => {
    setCompleted((prev) => prev.filter((item) => item !== id));
    setResetKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const value = useMemo<LessonProgressValue>(
    () => ({
      blocks,
      palette,
      completed,
      activeId,
      color: lessonModule.color,
      resetKeys,
      isDone,
      markDone,
      resetBlock,
      setActiveId,
    }),
    [blocks, palette, completed, activeId, lessonModule.color, resetKeys, isDone, markDone, resetBlock]
  );

  const doneCount = blocks.filter((block) => completed.includes(block.id)).length;
  const percent = Math.round((doneCount / blocks.length) * 100);
  const finished = doneCount === blocks.length;
  const isPodsumowanie = lesson.kind === 'podsumowanie';
  const activeIndex = Math.max(
    0,
    blocks.findIndex((block) => block.id === activeId)
  );

  const resetProgress = () => {
    setCompleted([]);
    setResetKeys((prev) => {
      const next = { ...prev };
      blocks.forEach((block) => {
        next[block.id] = (next[block.id] ?? 0) + 1;
      });
      return next;
    });
    document.getElementById(blocks[0]?.id ?? '')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LessonProgressContext.Provider value={value}>
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        {/* Pasek postępu przyklejony do góry — widoczny przez całą lekcję */}
        <div className="sticky top-0 z-30 -mx-3 border-b bg-background/85 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                {finished ? (
                  'Ukończono'
                ) : (
                  <>
                    <span className="hidden sm:inline">Blok </span>
                    {activeIndex + 1}
                    <span className="hidden sm:inline"> z </span>
                    <span className="sm:hidden">/</span>
                    {blocks.length}
                  </>
                )}
              </span>
              <div className="h-2 flex-1 overflow-hidden bg-muted">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: lessonModule.color }}
                  animate={{ width: `${percent}%` }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span
                className="shrink-0 text-xs font-bold tabular-nums"
                style={{ color: lessonModule.color }}
              >
                {percent}%
              </span>
            </div>
            <LessonProgressAside className="border-l pl-3" />
          </div>
          <GuestProgressNotice className="mt-2 border-t pt-2" color={lessonModule.color} />
        </div>

        <div className="py-8">
          {/* Okruszki */}
          <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Link href={basePath} className="transition-colors hover:text-primary">
              {courseLabel}
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`${basePath}/${lessonModule.slug}`}
              className="transition-colors hover:text-primary"
            >
              {lessonModule.title}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">{lesson.short}</span>
          </nav>

          {/* Nagłówek lekcji — numer jako duży element typograficzny, meta jako
              zwykły tekst, bez plakietek i gradientu (ten sam język co strona modułu). */}
          <header className="mb-10 border-b pb-8">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
              <div className="leading-none">
                <span
                  className="block text-xs font-bold tracking-[0.2em]"
                  style={{ color: moduleTextColor }}
                >
                  {isPodsumowanie ? 'PODSUMOWANIE' : 'LEKCJA'}
                </span>
                <span
                  className="block text-6xl font-black leading-[0.85] sm:text-7xl"
                  style={{ color: lessonModule.color }}
                >
                  {String(lesson.number).padStart(2, '0')}
                </span>
              </div>
              <h1 className="pb-1 text-3xl font-extrabold tracking-tight sm:pb-2 lg:text-4xl lg:leading-tight">
                {lesson.title}
              </h1>
            </div>

            <p className="mt-6 max-w-3xl text-base leading-relaxed text-muted-foreground sm:text-lg">
              {lesson.goal}
            </p>

            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <span className="inline-flex items-center gap-1.5">
                <Clock className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {lesson.duration}
              </span>
              <span className="inline-flex items-center gap-1.5">
                <Layers className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {blocks.length} {blocksWord(blocks.length)}
              </span>
            </div>
          </header>

          <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
            {/* Boczna mapa bloków (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-16 self-start">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Z czego składa się ta lekcja
                </p>
                <ol className="space-y-0.5 border-l border-border">
                  {blocks.map((block, i) => {
                    const blockDone = completed.includes(block.id);
                    const isActive = block.id === activeId;
                    return (
                      <li key={block.id} className="-ml-px">
                        <a
                          href={`#${block.id}`}
                          className={cn(
                            'flex items-start gap-3 border-l-2 py-2 pl-3 pr-2 text-sm transition-colors',
                            isActive ? 'font-semibold' : 'border-transparent hover:bg-muted/40'
                          )}
                          style={
                            isActive
                              ? { borderColor: lessonModule.color, color: lessonModule.color }
                              : undefined
                          }
                        >
                          <span
                            className="mt-0.5 w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                            style={{ color: blockDone ? lessonModule.color : undefined }}
                          >
                            {blockDone ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              String(i + 1).padStart(2, '0')
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block leading-snug">{palette[block.kind]?.label ?? block.kind}</span>
                            <span className="block text-xs font-normal text-muted-foreground">
                              {block.time}
                            </span>
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ol>

                {doneCount > 0 && (
                  <button
                    type="button"
                    onClick={resetProgress}
                    className="mt-4 inline-flex cursor-pointer items-center gap-1.5 px-3 text-xs text-muted-foreground transition-colors hover:text-primary"
                  >
                    <RotateCcw className="h-3 w-3" />
                    Zacznij lekcję od nowa
                  </button>
                )}
              </div>
            </aside>

            <div className="min-w-0 space-y-8">
              {entry}
              {children}

              {lesson.funFact && (
                <LessonRewardCard
                  funFact={lesson.funFact}
                  color={lessonModule.color}
                  unlocked={finished}
                  teaser={funFactTeaser}
                />
              )}

              <section className="scroll-mt-24">
                <div
                  className="relative overflow-hidden border-t-2 p-6 text-center sm:p-10"
                  style={{
                    borderColor: finished ? lessonModule.color : 'var(--border)',
                    backgroundColor: finished ? `${lessonModule.color}0c` : undefined,
                  }}
                >
                  {finished && <Confetti color={lessonModule.color} />}

                  <Trophy
                    className="mx-auto mb-5 h-10 w-10"
                    style={{ color: lessonModule.color }}
                    aria-hidden
                  />

                  <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                    {finished
                      ? isPodsumowanie
                        ? `Moduł ${lessonModule.number}: ${lessonModule.title} ukończony! 🎉`
                        : 'Lekcja ukończona! 🎉'
                      : `Zrobione: ${doneCount} z ${blocks.length} ${blocks.length === 1 ? 'bloku' : 'bloków'}`}
                  </h2>
                  <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
                    {finished
                      ? finishNote
                      : 'Przejdź wszystkie bloki i zrób to, co w nich jest do zrobienia — pasek u góry pokaże 100%.'}
                  </p>

                  {finished && (
                    <>
                      <StreakRibbon event={streakEvent} justFinished={justFinished} isGuest={!isAuthenticated} />
                      {isAuthenticated && <FacebookFollowNudge event={streakEvent} />}
                    </>
                  )}

                  <div className="flex flex-col justify-center gap-3 sm:flex-row">
                    {nextLesson ? (
                      <Button asChild size="lg">
                        <Link
                          href={`${basePath}/${nextLesson.moduleSlug}/${nextLesson.slug}`}
                        >
                          Następna lekcja: {nextLesson.short}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : isPodsumowanie && nextModule ? (
                      <Button asChild size="lg">
                        <Link href={`${basePath}/${nextModule.slug}`}>
                          Przejdź do modułu {nextModule.number}: {nextModule.title}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <Link href={`${basePath}/${lessonModule.slug}`}>
                          Wróć do modułu
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="lg" variant="outline">
                      <Link href={basePath}>Zobacz cały program</Link>
                    </Button>
                  </div>
                </div>
              </section>

              <div className="flex justify-between gap-4 pb-4">
                <Link
                  href={`${basePath}/${lessonModule.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {lessonModule.title}
                </Link>
                <button
                  type="button"
                  onClick={resetProgress}
                  className="inline-flex cursor-pointer items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary lg:hidden"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Od nowa
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LessonProgressContext.Provider>
  );
}

/**
 * Jeden blok lekcji. Sam pilnuje, który blok jest aktywny (obserwator
 * przecięcia), a nagłówek składa z metadanych zarejestrowanych w powłoce
 * i etykiety rodzaju bloku z palety.
 */
export function LessonBlock({ id, children }: { id: string; children: ReactNode }) {
  const { blocks, palette, completed, color, resetKeys, resetBlock, setActiveId } = useLessonProgress();
  const ref = useRef<HTMLElement>(null);

  const index = blocks.findIndex((block) => block.id === id);
  const block = blocks[index];
  const done = completed.includes(id);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveId(id);
            return;
          }
          // Blok wychodzi z pasa. Sąsiad mógł stać w pasie cały czas (granica
          // dwóch bloków w pasie, przewinięcie tam i z powrotem) i nie dostanie
          // własnego zdarzenia — aktywny jest ten, który przecina środek pasa.
          const probe = window.innerHeight * 0.275;
          for (const other of blocks) {
            const rect = document.getElementById(other.id)?.getBoundingClientRect();
            if (rect && rect.top <= probe && rect.bottom >= probe) {
              setActiveId(other.id);
              break;
            }
          }
        });
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, blocks, setActiveId]);

  if (!block) return null;

  const kind = palette[block.kind];
  const Icon = block.icon ?? kind?.icon;

  return (
    <section ref={ref} id={id} data-lesson-block={id} className="scroll-mt-20">
      <header className="mb-5 flex items-start gap-4">
        {/* Numer bloku jako typografia — ten sam element co numer modułu na hubie
            i numer tematu na stronie modułu, nie ikonka w kolorowym pudełku. */}
        <span
          className="w-11 shrink-0 font-mono text-3xl font-bold leading-none tabular-nums sm:w-12 sm:text-4xl"
          style={{ color }}
          aria-hidden
        >
          {done ? <Check className="h-8 w-8" /> : String(index + 1).padStart(2, '0')}
        </span>
        <div className="min-w-0 flex-1 pt-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-muted-foreground">
            <span className="font-semibold uppercase tracking-wide" style={{ color }}>
              {kind?.label ?? block.kind}
            </span>
            <span aria-hidden>·</span>
            <span>{block.time}</span>
          </div>
          <h2 className="flex items-center gap-2 text-xl font-bold leading-snug sm:text-2xl">
            {Icon && <Icon className="h-5 w-5 shrink-0" style={{ color }} aria-hidden />}
            {block.title}
          </h2>
        </div>

        {/* Reset ćwiczenia — zawsze w tym samym miejscu, w każdym bloku każdej lekcji */}
        <button
          type="button"
          onClick={() => resetBlock(id)}
          aria-label={`Zacznij ten blok od nowa: ${block.title}`}
          title="Zacznij ten blok od nowa"
          className="mt-1 inline-flex shrink-0 cursor-pointer items-center gap-1.5 border px-2.5 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:border-primary/50 hover:text-primary"
        >
          <RotateCcw className="h-3.5 w-3.5" aria-hidden />
          <span className="hidden sm:inline">Od nowa</span>
        </button>
      </header>

      {/* Zmiana klucza montuje ćwiczenie od zera — nie trzeba API resetu w każdym widgecie */}
      <div key={resetKeys[id] ?? 0}>{children}</div>
    </section>
  );
}
