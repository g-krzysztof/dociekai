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
  ListChecks,
  RotateCcw,
  Trophy,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAuth } from '@/components/auth-context';
import { ModuleIcon } from '@/components/ui/module-icon';
import { GuestProgressNotice } from '@/components/ui/guest-progress-notice';
import { Confetti } from '@/components/ui/confetti';
import { LessonRewardCard } from '@/components/ui/lesson-reward-card';
import { StreakRibbon } from '@/components/streak/streak-ribbon';
import { FacebookFollowNudge } from '@/components/social/facebook-follow';
import { LessonProgressAside } from '@/components/streak/lesson-progress-aside';
import { useLessonStreak } from '@/lib/streak/use-lesson-streak';
import { getProgressStore, readMathProgressEntry, writeMathProgressEntry } from '../lib/progress-storage';
import { scheduleLessonSync } from '../lib/progress-sync';
import type { MathModule } from '../data/curriculum';
import type { MathLesson } from '../data/lessons';

export interface LessonStepMeta {
  id: string;
  /** Etap z szablonu lekcji, np. „Rozgrzewka”. */
  kind: string;
  title: string;
  time: string;
  /** Nazwa ikony obsługiwanej przez ModuleIcon. */
  icon: string;
}

interface LessonProgressValue {
  steps: LessonStepMeta[];
  completed: string[];
  activeId: string;
  color: string;
  /** Licznik resetów kroku — służy jako `key`, więc jego zmiana montuje ćwiczenie od nowa. */
  resetKeys: Record<string, number>;
  isDone: (id: string) => boolean;
  markDone: (id: string) => void;
  resetStep: (id: string) => void;
  setActiveId: (id: string) => void;
}

const LessonProgressContext = createContext<LessonProgressValue | null>(null);

export function useLessonProgress(): LessonProgressValue {
  const ctx = useContext(LessonProgressContext);
  if (!ctx) throw new Error('useLessonProgress musi być użyte wewnątrz <LessonShell>');
  return ctx;
}

/** Oznacza krok jako zaliczony, gdy dziecko skończy ćwiczenie w tym kroku. */
export function useStepDone(stepId: string) {
  const { markDone, isDone } = useLessonProgress();
  const done = isDone(stepId);
  const markStepDone = useCallback(() => markDone(stepId), [markDone, stepId]);
  return { done, markStepDone };
}

/**
 * Kotwica przewijania dla widżetów wielorundowych — mieszka teraz w
 * `@/components/ui/use-section-scroll-anchor` (współdzielona z kursem
 * informatyki). Re-eksport zostaje, bo importuje ją stąd kilkadziesiąt
 * widżetów tego kursu.
 */
export { useSectionScrollAnchor } from '@/components/ui/use-section-scroll-anchor';

interface LessonShellProps {
  lesson: MathLesson;
  mathModule: MathModule;
  steps: LessonStepMeta[];
  /** Lekcja, do której prowadzi przycisk na końcu (jeśli już istnieje). */
  nextLesson?: MathLesson;
  /**
   * Tylko dla `kind: 'podsumowanie'` (zawsze ostatnia lekcja modułu, więc
   * `nextLesson` jest zawsze `undefined`) — kolejny dostępny moduł, do którego
   * prowadzi przycisk na końcu zamiast „Wróć do modułu”. Patrz `[lekcja]/page.tsx`.
   */
  nextModule?: MathModule;
  children: ReactNode;
}

export function LessonShell({
  lesson,
  mathModule,
  steps,
  nextLesson,
  nextModule,
  children,
}: LessonShellProps) {
  const { isAuthenticated, initialLoading } = useAuth();
  /** Wersja koloru modułu bezpieczna jako mały tekst (WCAG 4.5:1) — patrz [modul]/page.tsx. */
  const moduleTextColor = `color-mix(in oklch, ${mathModule.color} 88%, black)`;
  const [completed, setCompleted] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(steps[0]?.id ?? '');
  const [resetKeys, setResetKeys] = useState<Record<string, number>>({});
  const [restored, setRestored] = useState(false);

  // Postęp gościa żyje tylko w tej karcie (sessionStorage), postęp konta jest
  // trwały (localStorage jako cache serwera) — `getProgressStore` wybiera
  // magazyn po stanie logowania. Czekamy na `!initialLoading`, żeby nie
  // przeczytać z niewłaściwego magazynu, zanim stan logowania się ustali.
  useEffect(() => {
    if (initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const entry = readMathProgressEntry(store, lesson.moduleSlug, lesson.slug);
    setCompleted(entry?.completed ?? []);
    setRestored(true);
  }, [initialLoading, isAuthenticated, lesson.moduleSlug, lesson.slug]);

  useEffect(() => {
    if (!restored || initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const data = { completed, total: steps.length };
    writeMathProgressEntry(store, lesson.moduleSlug, lesson.slug, data);
    if (isAuthenticated) scheduleLessonSync(lesson.moduleSlug, lesson.slug, data);
  }, [completed, restored, initialLoading, isAuthenticated, lesson.moduleSlug, lesson.slug, steps.length]);

  // Seria nauki: dzień zalicza się po doprowadzeniu lekcji do 100%, nie po
  // pojedynczym kroku. Hook pilnuje, żeby liczyło się to raz — powrót na dawno
  // ukończoną lekcję niczego nie świętuje.
  const { event: streakEvent, justFinished } = useLessonStreak({
    course: 'matematyka',
    moduleSlug: lesson.moduleSlug,
    lessonSlug: lesson.slug,
    completed,
    total: steps.length,
    restored,
    isAuthenticated,
    initialLoading,
  });

  const markDone = useCallback((id: string) => {
    setCompleted((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  const isDone = useCallback((id: string) => completed.includes(id), [completed]);

  /** Reset pojedynczego kroku: czyścimy odhaczenie i przemontowujemy ćwiczenie. */
  const resetStep = useCallback((id: string) => {
    setCompleted((prev) => prev.filter((item) => item !== id));
    setResetKeys((prev) => ({ ...prev, [id]: (prev[id] ?? 0) + 1 }));
  }, []);

  const value = useMemo<LessonProgressValue>(
    () => ({
      steps,
      completed,
      activeId,
      color: mathModule.color,
      resetKeys,
      isDone,
      markDone,
      resetStep,
      setActiveId,
    }),
    [steps, completed, activeId, mathModule.color, resetKeys, isDone, markDone, resetStep]
  );

  const doneCount = steps.filter((step) => completed.includes(step.id)).length;
  const percent = Math.round((doneCount / steps.length) * 100);
  const finished = doneCount === steps.length;
  const isPodsumowanie = lesson.kind === 'podsumowanie';
  const activeIndex = Math.max(
    0,
    steps.findIndex((step) => step.id === activeId)
  );

  const resetProgress = () => {
    setCompleted([]);
    setResetKeys((prev) => {
      const next = { ...prev };
      steps.forEach((step) => {
        next[step.id] = (next[step.id] ?? 0) + 1;
      });
      return next;
    });
    document.getElementById(steps[0]?.id ?? '')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <LessonProgressContext.Provider value={value}>
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        {/* Pasek postępu przyklejony do góry — widoczny przez całą lekcję */}
        <div className="sticky top-0 z-30 -mx-3 border-b bg-background/85 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
          <div className="flex items-center gap-3">
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                <span className="hidden sm:inline">Krok </span>
                {activeIndex + 1}
                <span className="hidden sm:inline"> z </span>
                <span className="sm:hidden">/</span>
                {steps.length}
              </span>
              <div className="h-2 flex-1 overflow-hidden bg-muted">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: mathModule.color }}
                  animate={{ width: `${percent}%` }}
                  initial={false}
                  transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                />
              </div>
              <span
                className="shrink-0 text-xs font-bold tabular-nums"
                style={{ color: mathModule.color }}
              >
                {percent}%
              </span>
            </div>
            <LessonProgressAside className="border-l pl-3" />
          </div>
          <GuestProgressNotice className="mt-2 border-t pt-2" />
        </div>

        <div className="py-8">
          {/* Okruszki */}
          <nav className="mb-6 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <Link href="/matematyka/klasa-4" className="transition-colors hover:text-primary">
              Matematyka
            </Link>
            <span aria-hidden>/</span>
            <Link
              href={`/matematyka/klasa-4/${mathModule.slug}`}
              className="transition-colors hover:text-primary"
            >
              {mathModule.title}
            </Link>
            <span aria-hidden>/</span>
            <span className="font-medium text-foreground">{lesson.short}</span>
          </nav>

          {/* Nagłówek lekcji — ten sam język co nagłówek modułu: numer jako duży
              element typograficzny, meta jako zwykły tekst, bez plakietek i gradientu. */}
          <header className="mb-10 border-b pb-8">
            <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
              <div className="leading-none">
                <span
                  className="block text-xs font-bold tracking-[0.2em]"
                  style={{ color: moduleTextColor }}
                >
                  {lesson.kind === 'podsumowanie' ? 'PODSUMOWANIE' : 'LEKCJA'}
                </span>
                <span
                  className="block text-6xl font-black leading-[0.85] sm:text-7xl"
                  style={{ color: mathModule.color }}
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
                <ListChecks className="h-3.5 w-3.5 shrink-0" aria-hidden />
                {steps.length} kroków
              </span>
            </div>
          </header>

          <div className="lg:grid lg:grid-cols-[250px_minmax(0,1fr)] lg:gap-10">
            {/* Boczna mapa kroków (desktop) */}
            <aside className="hidden lg:block">
              <div className="sticky top-16 self-start">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                  Plan lekcji
                </p>
                <ol className="space-y-0.5 border-l border-border">
                  {steps.map((step, i) => {
                    const stepDone = completed.includes(step.id);
                    const isActive = step.id === activeId;
                    return (
                      <li key={step.id} className="-ml-px">
                        <a
                          href={`#${step.id}`}
                          className={cn(
                            'flex items-start gap-3 border-l-2 py-2 pl-3 pr-2 text-sm transition-colors',
                            isActive ? 'font-semibold' : 'border-transparent hover:bg-muted/40'
                          )}
                          style={
                            isActive
                              ? { borderColor: mathModule.color, color: mathModule.color }
                              : undefined
                          }
                        >
                          <span
                            className="mt-0.5 w-5 shrink-0 font-mono text-sm font-bold tabular-nums"
                            style={{ color: stepDone ? mathModule.color : undefined }}
                          >
                            {stepDone ? (
                              <Check className="h-4 w-4" />
                            ) : (
                              String(i + 1).padStart(2, '0')
                            )}
                          </span>
                          <span className="min-w-0">
                            <span className="block leading-snug">{step.kind}</span>
                            <span className="block text-xs font-normal text-muted-foreground">
                              {step.time}
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
              {children}

              {lesson.funFact && (
                <LessonRewardCard
                  funFact={lesson.funFact}
                  color={mathModule.color}
                  unlocked={finished}
                  teaser="Czeka na Ciebie ciekawostka ze świata matematyki."
                />
              )}

              {/* Podsumowanie lekcji — płaski kolor modułu zamiast gradientu, bez zaokrągleń,
                  ten sam język co pasmo "featured" na hubie (patrz module-card.tsx). */}
              <section className="scroll-mt-24">
                <div
                  className="relative overflow-hidden border-t-2 p-6 text-center sm:p-10"
                  style={{
                    borderColor: finished ? mathModule.color : 'var(--border)',
                    backgroundColor: finished ? `${mathModule.color}0c` : undefined,
                  }}
                >
                  {finished && <Confetti color={mathModule.color} />}

                  <Trophy
                    className="mx-auto mb-5 h-10 w-10"
                    style={{ color: mathModule.color }}
                    aria-hidden
                  />

                  <h2 className="mb-3 text-2xl font-bold sm:text-3xl">
                    {finished
                      ? isPodsumowanie
                        ? `Moduł ${mathModule.number}: ${mathModule.title} ukończony! 🎉`
                        : 'Lekcja ukończona! 🎉'
                      : `Zrobione: ${doneCount} z ${steps.length} kroków`}
                  </h2>
                  <p className="mx-auto mb-6 max-w-xl text-muted-foreground">
                    {finished
                      ? isPodsumowanie
                        ? 'Przeszedłeś/aś wszystkie lekcje tego modułu i powtórzyłeś/aś je w sprawdzianie. Jeśli któryś blok wypadł słabiej, wróć do niego — reszta poczeka.'
                        : 'Znasz już swój plan nauki, wiesz jak robić notatki i co zrobić z błędem. Teraz najważniejsze: użyj tego jutro na prawdziwej matematyce.'
                      : 'Przejdź wszystkie kroki i wykonaj ćwiczenia — pasek u góry pokaże 100%.'}
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
                        <Link href={`/matematyka/klasa-4/${nextLesson.moduleSlug}/${nextLesson.slug}`}>
                          Następna lekcja: {nextLesson.short}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : isPodsumowanie && nextModule ? (
                      <Button asChild size="lg">
                        <Link href={`/matematyka/klasa-4/${nextModule.slug}`}>
                          Przejdź do modułu {nextModule.number}: {nextModule.title}
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    ) : (
                      <Button asChild size="lg">
                        <Link href={`/matematyka/klasa-4/${mathModule.slug}`}>
                          Wróć do modułu
                          <ArrowRight className="ml-1 h-4 w-4" />
                        </Link>
                      </Button>
                    )}
                    <Button asChild size="lg" variant="outline">
                      <Link href="/matematyka/klasa-4">Zobacz cały program</Link>
                    </Button>
                  </div>
                </div>
              </section>

              <div className="flex justify-between gap-4 pb-4">
                <Link
                  href={`/matematyka/klasa-4/${mathModule.slug}`}
                  className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
                >
                  <ArrowLeft className="h-4 w-4" />
                  {mathModule.title}
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
 * Jeden krok lekcji. Sam pilnuje, który krok jest aktywny (obserwator
 * przecięcia), a nagłówek dostaje z metadanych zarejestrowanych w shellu.
 */
export function LessonSection({ id, children }: { id: string; children: ReactNode }) {
  const { steps, completed, color, resetKeys, resetStep, setActiveId } = useLessonProgress();
  const ref = useRef<HTMLElement>(null);

  const index = steps.findIndex((step) => step.id === id);
  const step = steps[index];
  const done = completed.includes(id);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActiveId(id);
        });
      },
      { rootMargin: '-20% 0px -65% 0px' }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [id, setActiveId]);

  if (!step) return null;

  return (
    <section ref={ref} id={id} className="scroll-mt-20">
      <header className="mb-5 flex items-start gap-4">
        {/* Numer kroku jako typografia — ten sam element co numer modułu na hubie
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
              {step.kind}
            </span>
            <span aria-hidden>·</span>
            <span>{step.time}</span>
          </div>
          <h2 className="flex items-center gap-2 text-xl font-bold leading-snug sm:text-2xl">
            <ModuleIcon name={step.icon} className="h-5 w-5 shrink-0" style={{ color }} />
            {step.title}
          </h2>
        </div>

        {/* Reset ćwiczenia — zawsze w tym samym miejscu, w każdym kroku każdej lekcji */}
        <button
          type="button"
          onClick={() => resetStep(id)}
          aria-label={`Zacznij to zadanie od nowa: ${step.title}`}
          title="Zacznij to zadanie od nowa"
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
