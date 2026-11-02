'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { motion, useScroll, useSpring } from 'framer-motion';
import { ArrowLeft, ArrowRight, BookOpen, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/auth-context';
import { GuestProgressNotice } from '@/components/ui/guest-progress-notice';
import { getProgressStore, readMathProgressEntry, writeMathProgressEntry } from '../../lib/progress-storage';
import { scheduleLessonSync } from '../../lib/progress-sync';
import { CompletionStamp } from '../completion-stamp';
import { GuideRail } from './guide-rail';
import type { GuideActMeta } from './guide-act';
import type { MathModule } from '../../data/curriculum';
import type { MathLesson } from '../../data/lessons';

interface GuideValue {
  acts: GuideActMeta[];
  visited: string[];
  activeId: string;
  color: string;
  markVisited: (id: string) => void;
  setActiveId: (id: string) => void;
}

const GuideContext = createContext<GuideValue | null>(null);

export function useGuide(): GuideValue {
  const ctx = useContext(GuideContext);
  if (!ctx) throw new Error('useGuide musi być użyte wewnątrz <GuideShell>');
  return ctx;
}

interface GuideShellProps {
  lesson: MathLesson;
  mathModule: MathModule;
  acts: GuideActMeta[];
  /** Lekcja, do której prowadzi CTA na końcu przewodnika. */
  nextLesson?: MathLesson;
  /** Sekcja zamykająca — wraca do obietnicy z pierwszego aktu. */
  outro?: ReactNode;
  /** Opcjonalna kolumna po prawej stronie nagłówka (np. odtwarzacz streszczenia). */
  headerAside?: ReactNode;
  children: ReactNode;
}

/**
 * Powłoka przewodnika — odpowiednik `LessonShell`, ale dla treści teoretycznej:
 * bez kroków, bez ćwiczeń, bez punktacji. Zamiast „ukończonych zadań” liczy
 * odwiedzone akty i zapisuje je pod **tym samym kluczem** co lekcje, w tym samym
 * formacie `{ completed, total }` — dzięki temu `useMathProgress` czyta postęp
 * przewodnika bez żadnej zmiany.
 *
 * Uwaga na dług: `LessonShell` jest monolitem (kontener + okruszki + pasek +
 * nagłówek naraz), więc te elementy są tu powtórzone, a nie współdzielone.
 */
export function GuideShell({
  lesson,
  mathModule,
  acts,
  nextLesson,
  outro,
  headerAside,
  children,
}: GuideShellProps) {
  const { isAuthenticated, initialLoading } = useAuth();
  const moduleTextColor = `color-mix(in oklch, ${mathModule.color} 88%, black)`;
  const [visited, setVisited] = useState<string[]>([]);
  const [activeId, setActiveId] = useState<string>(acts[0]?.id ?? '');
  const [restored, setRestored] = useState(false);

  const { scrollYProgress } = useScroll();
  // Sprężyna wyłącznie tutaj — dekoracyjny pasek nie jest asertowany w testach.
  // Wszystko scrubowane w aktach musi zostać czystą funkcją pozycji scrolla.
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24 });

  // Ten sam magazyn co lekcje (`getProgressStore` po stanie logowania) i ten
  // sam kształt `{ completed, total }` — patrz `lesson-shell.tsx`.
  useEffect(() => {
    if (initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const entry = readMathProgressEntry(store, lesson.moduleSlug, lesson.slug);
    setVisited(entry?.completed ?? []);
    setRestored(true);
  }, [initialLoading, isAuthenticated, lesson.moduleSlug, lesson.slug]);

  useEffect(() => {
    if (!restored || initialLoading) return;
    const store = getProgressStore(isAuthenticated);
    const data = { completed: visited, total: acts.length };
    writeMathProgressEntry(store, lesson.moduleSlug, lesson.slug, data);
    if (isAuthenticated) scheduleLessonSync(lesson.moduleSlug, lesson.slug, data);
  }, [visited, restored, initialLoading, isAuthenticated, lesson.moduleSlug, lesson.slug, acts.length]);

  const markVisited = useCallback((id: string) => {
    setVisited((prev) => (prev.includes(id) ? prev : [...prev, id]));
  }, []);

  /** Dotarcie do końca = przeczytane, nawet po przeskoku szyną nawigacji. */
  const markAllVisited = useCallback(() => {
    setVisited((prev) => (prev.length === acts.length ? prev : acts.map((act) => act.id)));
  }, [acts]);

  const value = useMemo<GuideValue>(
    () => ({
      acts,
      visited,
      activeId,
      color: mathModule.color,
      markVisited,
      setActiveId,
    }),
    [acts, visited, activeId, mathModule.color, markVisited]
  );

  const activeIndex = Math.max(
    0,
    acts.findIndex((act) => act.id === activeId)
  );

  return (
    <GuideContext.Provider value={value}>
      <div className="container mx-auto max-w-7xl px-3 sm:px-4">
        {/* Pasek postępu przewijania — te same klasy co pasek lekcji */}
        <div className="sticky top-0 z-30 -mx-3 border-b bg-background/85 px-3 py-2 backdrop-blur sm:-mx-4 sm:px-4">
          <div className="flex items-center gap-3">
            <span className="shrink-0 text-xs font-semibold text-muted-foreground">
              <span className="hidden sm:inline">Rozdział </span>
              {activeIndex + 1}
              <span className="hidden sm:inline"> z </span>
              <span className="sm:hidden">/</span>
              {acts.length}
            </span>
            <div className="h-2 flex-1 overflow-hidden bg-muted">
              <motion.div
                className="h-full origin-left"
                style={{ backgroundColor: mathModule.color, scaleX }}
              />
            </div>
          </div>
          <GuestProgressNotice className="mt-2 border-t pt-2" />
        </div>

        <div className="py-8">
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

          {/* Nagłówek — ten sam język co nagłówek lekcji, ale numeral 00 i kicker PRZEWODNIK */}
          <header className="mb-10 border-b pb-8">
            <div
              className={
                headerAside
                  ? 'grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,1fr)_300px] lg:items-start'
                  : undefined
              }
            >
              <div>
                <div className="flex flex-wrap items-end gap-x-5 gap-y-3">
                  <div className="leading-none">
                    <span
                      className="block text-xs font-bold tracking-[0.2em]"
                      style={{ color: moduleTextColor }}
                    >
                      PRZEWODNIK
                    </span>
                    <span
                      className="block text-6xl font-black leading-[0.85] sm:text-7xl"
                      style={{ color: mathModule.color }}
                    >
                      00
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
                    <BookOpen className="h-3.5 w-3.5 shrink-0" aria-hidden />
                    {acts.length} rozdziałów
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    Bez zadań i quizu — tylko czytanie i klikanie
                  </span>
                </div>
              </div>

              {headerAside && <div className="lg:pt-6">{headerAside}</div>}
            </div>
          </header>

          <GuideRail />

          {children}

          {/* Sekcja zamykająca — jej pojawienie się oznacza przewodnik jako przeczytany */}
          <GuideOutro
            color={mathModule.color}
            onReachEnd={markAllVisited}
            nextLesson={nextLesson}
            moduleSlug={mathModule.slug}
            moduleTitle={mathModule.title}
          >
            {outro}
          </GuideOutro>
        </div>
      </div>
    </GuideContext.Provider>
  );
}

interface GuideOutroProps {
  color: string;
  onReachEnd: () => void;
  nextLesson?: MathLesson;
  moduleSlug: string;
  moduleTitle: string;
  children?: ReactNode;
}

function GuideOutro({
  color,
  onReachEnd,
  nextLesson,
  moduleSlug,
  moduleTitle,
  children,
}: GuideOutroProps) {
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useEffect(() => {
    if (!ref) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) onReachEnd();
        });
      },
      { rootMargin: '0px 0px -20% 0px' }
    );
    observer.observe(ref);
    return () => observer.disconnect();
  }, [ref, onReachEnd]);

  return (
    <section ref={setRef} className="scroll-mt-16 py-12" data-guide-outro>
      <div
        className="relative border-t-2 p-6 sm:p-10"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <CompletionStamp label="Przeczytane" className="right-4 top-4 sm:right-8 sm:top-8" />

        {children}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row">
          {nextLesson ? (
            <Button asChild size="lg">
              <Link href={`/matematyka/klasa-4/${nextLesson.moduleSlug}/${nextLesson.slug}`}>
                Teraz lekcja: {nextLesson.short}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          ) : (
            <Button asChild size="lg">
              <Link href={`/matematyka/klasa-4/${moduleSlug}`}>
                Wróć do modułu
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          )}
          <Button asChild size="lg" variant="outline">
            <Link href={`/matematyka/klasa-4/${moduleSlug}`}>Zobacz cały moduł</Link>
          </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-between gap-4 pb-4">
        <Link
          href={`/matematyka/klasa-4/${moduleSlug}`}
          className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          {moduleTitle}
        </Link>
      </div>
    </section>
  );
}
