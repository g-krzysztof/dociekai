'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/components/auth-context';
import { EmailVerificationNotice } from '@/components/ui/email-verification-notice';
import { getModuleBySlug } from '@/app/matematyka/klasa-4/data/curriculum';
import { getModuleBySlug as getInfoModuleBySlug } from '@/app/informatyka/klasa-4/data/curriculum';
import { getModuleBySlug as getHistModuleBySlug } from '@/app/historia/klasa-4/data/curriculum';
import { useMathProgress } from '@/app/matematyka/klasa-4/lib/progress';
import { useInfoProgress } from '@/app/informatyka/klasa-4/lib/progress';
import { useHistProgress } from '@/app/historia/klasa-4/lib/progress';
import { plural } from '@/lib/plural';
import { useStreak } from '@/lib/streak/use-streak';
import type { StreakSnapshot } from '@/lib/streak/types';
import type { User } from '@/types/auth';
import { AccountSheet } from './components/account-sheet';
import { FacebookFooterLink } from '@/components/social/facebook-follow';
import { AtlasSheet } from './components/atlas-sheet';
import { BadgeCase } from './components/badge-case';
import { BadgeShelf } from './components/badge-shelf';
import { CourseRow } from './components/course-row';
import { DisclosurePanel, DisclosureToggle } from './components/disclosure';
import { NextStep } from './components/next-step';
import { RhythmSheet } from './components/rhythm-sheet';
import { StatLedger } from './components/stat-ledger';
import { TodayStrip, type TodayStep } from './components/today-strip';
import { YearPlot } from './components/year-plot';
import type { LedgerRow, NextStepModel, PlotAtlas, PlotStats } from './lib/atlas-shape';
import { buildAtlas, buildNextStep, ledgerRows, MATH_BASE_PATH } from './lib/atlas-data';
import {
  buildInfoAtlas,
  buildInfoNextStep,
  infoLedgerRows,
  INFO_BASE_PATH,
} from './lib/atlas-data-info';
import {
  buildHistAtlas,
  buildHistNextStep,
  histLedgerRows,
  HIST_BASE_PATH,
} from './lib/atlas-data-hist';

const DEFAULT_ACCENT = '#6366f1';

/** Podłoże świata: siatka rysunkowa + poświata w kolorze aktualnego działu. */
function AtlasGround({ accent, children }: { accent: string; children: React.ReactNode }) {
  return (
    <div
      className="profil-atlas min-h-screen"
      style={{ '--atlas-accent': accent } as React.CSSProperties}
    >
      <div className="profil-atlas__grid" aria-hidden />
      <div className="profil-atlas__glow" aria-hidden />
      {children}
    </div>
  );
}

type CourseId = 'matematyka' | 'informatyka' | 'historia';
type PanelId = 'odznaki' | 'rytm' | 'konto';

const COURSE_IDS: CourseId[] = ['matematyka', 'informatyka', 'historia'];
const PANEL_IDS: PanelId[] = ['odznaki', 'rytm', 'konto'];
const LESSON_FORMS = { one: 'lekcja', few: 'lekcje', many: 'lekcji' };

/** Atlasy kursów niosą też liczbę lekcji rozpoczętych — po niej poznać świeże konto. */
type CourseAtlas = PlotAtlas & { stats: PlotStats & { startedLessons: number } };

interface CourseView {
  id: CourseId;
  name: string;
  basePath: string;
  atlas: CourseAtlas;
  step?: NextStepModel;
  ready: boolean;
  ledger: LedgerRow[];
  ledgerClass: string;
  activeSlug: string | null;
  onActive: (slug: string | null) => void;
}

/**
 * Kurs, z którego ostatnio ukończono lekcję — z dni serii, bo postęp kursów nie
 * zapisuje dat. Taśma idzie od najstarszego tygodnia, więc czytamy od końca.
 */
function lastCourse(snapshot: StreakSnapshot): string | null {
  for (let w = snapshot.tape.length - 1; w >= 0; w -= 1) {
    const days = snapshot.tape[w].days;
    for (let d = days.length - 1; d >= 0; d -= 1) {
      const lessons = days[d].lessons;
      if (lessons.length > 0) return lessons[lessons.length - 1].split('/')[0];
    }
  }
  return null;
}

/**
 * Jedna lekcja na dziś ze wszystkich kursów: najpierw ta rozpoczęta (w kursie,
 * w którym ostatnio coś skończono), potem następna w ostatnio używanym kursie,
 * a na świeżym koncie pierwsza z matematyki.
 */
function pickToday(courses: CourseView[], snapshot: StreakSnapshot): TodayStep | undefined {
  const recent = lastCourse(snapshot);
  const withStep = courses.filter((course) => course.step);
  const byRecency = [...withStep].sort(
    (a, b) => Number(b.id === recent) - Number(a.id === recent)
  );
  const chosen = byRecency.find((course) => course.step?.inProgress) ?? byRecency[0];
  if (!chosen?.step) return undefined;
  return {
    course: chosen.name,
    step: chosen.step,
    fresh: chosen.atlas.stats.doneLessons === 0 && chosen.atlas.stats.startedLessons === 0,
  };
}

/** Nagłówek zwiniętego arkusza: tytuł, jedna linia odczytu i przełącznik. */
function SheetHead({
  title,
  summary,
  open,
  onToggle,
  controls,
  label,
}: {
  title: string;
  summary: React.ReactNode;
  open: boolean;
  onToggle: () => void;
  controls: string;
  label: string;
}) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-6 gap-y-2">
      <div className="flex min-w-0 flex-wrap items-baseline gap-x-4 gap-y-1">
        <h2 className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">{title}</h2>
        <p className="profil-micro">{summary}</p>
      </div>
      <DisclosureToggle open={open} onToggle={onToggle} controls={controls}>
        {label}
      </DisclosureToggle>
    </div>
  );
}

function IdentityBand({ user }: { user: User }) {
  const displayName = [user.firstName, user.lastName].filter(Boolean).join(' ') || user.username;

  return (
    <header>
      <div className="w-fit max-w-full">
        <h1 className="text-[clamp(1.6rem,4vw,2.25rem)] font-extrabold leading-[1.1] tracking-[-0.03em]">
          <span className="sr-only">Profil użytkownika: </span>
          {displayName}
        </h1>
        <span
          className="profil-underline mt-2.5 block h-[2px] w-full bg-[var(--atlas-accent)]"
          aria-hidden
        />
      </div>

      <p className="mt-4 max-w-[62ch] text-[15px] leading-relaxed text-[var(--ink-soft)]">
        Tu śledzisz swoje postępy (lub postępy dziecka) we wszystkich kursach.
      </p>
    </header>
  );
}

function ProgramLink({ href }: { href: string }) {
  return (
    <p className="mt-6 text-sm leading-relaxed text-[var(--ink-soft)]">
      Wolisz zobaczyć nazwy wszystkich tematów?{' '}
      <Link
        href={href}
        className="font-semibold text-[var(--ink)] underline decoration-[color-mix(in_oklch,var(--atlas-accent)_60%,transparent)] decoration-2 underline-offset-4 hover:decoration-[var(--atlas-accent)]"
      >
        Pełny program kursu — wszystkie działy i lekcje na jednej stronie
      </Link>
      .
    </p>
  );
}

export function ProfilePageClient() {
  const { user, isAuthenticated, initialLoading } = useAuth();
  const router = useRouter();
  const { lessonProgress, nextLesson, nextLessonStatus, ready } = useMathProgress();
  const { lessonProgress: infoLessonProgress, nextLesson: infoNextLesson, nextLessonStatus: infoNextLessonStatus, ready: infoReady } = useInfoProgress();
  const { lessonProgress: histLessonProgress, nextLesson: histNextLesson, nextLessonStatus: histNextLessonStatus, ready: histReady } = useHistProgress();
  const { snapshot, badges, ready: streakReady } = useStreak({ withBadges: true });
  const [activeSlug, setActiveSlug] = useState<string | null>(null);
  const [infoActiveSlug, setInfoActiveSlug] = useState<string | null>(null);
  const [histActiveSlug, setHistActiveSlug] = useState<string | null>(null);
  const [rhythmActive, setRhythmActive] = useState(false);
  // Kurs rozwinięty jest jeden naraz — trzy wykresy roku jeden pod drugim to
  // znowu ta sama ściana, którą pulpit miał zastąpić. Arkusze niżej są niezależne.
  const [openCourse, setOpenCourse] = useState<CourseId | null>(null);
  const [openPanels, setOpenPanels] = useState<Record<PanelId, boolean>>({
    odznaki: false,
    rytm: false,
    konto: false,
  });

  const atlas = useMemo(() => buildAtlas(lessonProgress), [lessonProgress]);
  const infoAtlas = useMemo(() => buildInfoAtlas(infoLessonProgress), [infoLessonProgress]);
  const histAtlas = useMemo(() => buildHistAtlas(histLessonProgress), [histLessonProgress]);
  const step = useMemo(() => buildNextStep(nextLesson, nextLessonStatus), [nextLesson, nextLessonStatus]);
  const infoStep = useMemo(
    () => buildInfoNextStep(infoNextLesson, infoNextLessonStatus),
    [infoNextLesson, infoNextLessonStatus]
  );
  const histStep = useMemo(
    () => buildHistNextStep(histNextLesson, histNextLessonStatus),
    [histNextLesson, histNextLessonStatus]
  );

  // Wskazanie myszą jest jedno na stronę: wejście na dział jednego kursu gasi
  // wskazanie pozostałych, żeby poświata nie miała dwóch źródeł naraz.
  const clearPointers = () => {
    setActiveSlug(null);
    setInfoActiveSlug(null);
    setHistActiveSlug(null);
    setRhythmActive(false);
  };
  const pointMath = (slug: string | null) => {
    if (slug) clearPointers();
    setActiveSlug(slug);
  };
  const pointInfo = (slug: string | null) => {
    if (slug) clearPointers();
    setInfoActiveSlug(slug);
  };
  const pointHist = (slug: string | null) => {
    if (slug) clearPointers();
    setHistActiveSlug(slug);
  };
  const pointRhythm = (active: boolean) => {
    if (active) clearPointers();
    setRhythmActive(active);
  };

  // Otwarty arkusz zapisuje się w adresie, więc link z kursu albo z chipa serii
  // (`/profil#rytm`, `/profil#historia`) otwiera profil od razu na właściwym miejscu.
  const writeHash = (id: string | null) => {
    const url = `${window.location.pathname}${window.location.search}${id ? `#${id}` : ''}`;
    window.history.replaceState(window.history.state, '', url);
  };
  const toggleCourse = (id: CourseId) => {
    const next = openCourse === id ? null : id;
    setOpenCourse(next);
    writeHash(next);
  };
  const togglePanel = (id: PanelId) => {
    const next = !openPanels[id];
    setOpenPanels((prev) => ({ ...prev, [id]: next }));
    writeHash(next ? id : null);
  };

  const openFromHash = useCallback(() => {
    const hash = window.location.hash.slice(1);
    if ((COURSE_IDS as string[]).includes(hash)) setOpenCourse(hash as CourseId);
    else if ((PANEL_IDS as string[]).includes(hash))
      setOpenPanels((prev) => ({ ...prev, [hash]: true }));
    else return;
    // Strona rysuje się dopiero po sprawdzeniu konta, więc przeglądarka nie
    // znalazła kotwicy przy wczytaniu — przewijamy sami, po otwarciu panelu.
    requestAnimationFrame(() =>
      document.getElementById(hash)?.scrollIntoView({ block: 'start', behavior: 'smooth' })
    );
  }, []);

  const pageReady = !initialLoading && Boolean(user);
  useEffect(() => {
    if (!pageReady) return;
    openFromHash();
    window.addEventListener('hashchange', openFromHash);
    return () => window.removeEventListener('hashchange', openFromHash);
  }, [pageReady, openFromHash]);

  // Bramka konta czeka na sprawdzenie tokena (`initialLoading`), nie na
  // `loading` — ten drugi dotyczy operacji login/register i jest `false` już
  // w pierwszej klatce, więc zalogowany użytkownik bywał odsyłany do /auth.
  useEffect(() => {
    if (!initialLoading && !isAuthenticated) router.replace('/auth?mode=login');
  }, [initialLoading, isAuthenticated, router]);

  // Wskazanie myszą bije spoczynek — inaczej najechanie na dział informatyki
  // przegrywało z kolorem następnej lekcji matematyki i poświata stała w miejscu.
  const accent =
    (rhythmActive ? 'var(--streak)' : undefined) ??
    (activeSlug ? getModuleBySlug(activeSlug)?.color : undefined) ??
    (infoActiveSlug ? getInfoModuleBySlug(infoActiveSlug)?.color : undefined) ??
    (histActiveSlug ? getHistModuleBySlug(histActiveSlug)?.color : undefined) ??
    (nextLesson ? getModuleBySlug(nextLesson.moduleSlug)?.color : undefined) ??
    (infoNextLesson ? getInfoModuleBySlug(infoNextLesson.moduleSlug)?.color : undefined) ??
    (histNextLesson ? getHistModuleBySlug(histNextLesson.moduleSlug)?.color : undefined) ??
    DEFAULT_ACCENT;

  if (initialLoading || !user) {
    return (
      <AtlasGround accent={DEFAULT_ACCENT}>
        <div className="relative mx-auto flex min-h-[60vh] max-w-6xl items-center px-4 sm:px-6">
          <p className="profil-micro" role="status">
            {initialLoading ? 'Wczytywanie profilu…' : 'Przekierowanie do logowania…'}
          </p>
        </div>
      </AtlasGround>
    );
  }

  const courses: CourseView[] = [
    {
      id: 'matematyka',
      name: 'Matematyka',
      basePath: MATH_BASE_PATH,
      atlas,
      step,
      ready,
      ledger: ledgerRows(atlas.stats),
      ledgerClass: 'lg:grid-cols-5',
      activeSlug,
      onActive: pointMath,
    },
    {
      id: 'informatyka',
      name: 'Informatyka',
      basePath: INFO_BASE_PATH,
      atlas: infoAtlas,
      step: infoStep,
      ready: infoReady,
      ledger: infoLedgerRows(infoAtlas.stats),
      ledgerClass: 'sm:grid-cols-4',
      activeSlug: infoActiveSlug,
      onActive: pointInfo,
    },
    {
      id: 'historia',
      name: 'Historia',
      basePath: HIST_BASE_PATH,
      atlas: histAtlas,
      step: histStep,
      ready: histReady,
      ledger: histLedgerRows(histAtlas.stats),
      ledgerClass: 'sm:grid-cols-4',
      activeSlug: histActiveSlug,
      onActive: pointHist,
    },
  ];

  const coursesReady = ready && infoReady && histReady;
  const today = coursesReady ? pickToday(courses, snapshot) : undefined;
  const doneAll = courses.reduce((sum, course) => sum + course.atlas.stats.doneLessons, 0);
  const totalAll = courses.reduce((sum, course) => sum + course.atlas.stats.totalLessons, 0);
  const earned = badges.filter((badge) => badge.earned).length;

  return (
    <AtlasGround accent={accent}>
      <div className="relative mx-auto max-w-6xl px-4 pb-16 pt-9 sm:px-6 lg:pb-20 lg:pt-12">
        <IdentityBand user={user} />
        <EmailVerificationNotice className="mt-6" color="currentColor" />

        {/* Pulpit: dziś, kursy i odznaki mieszczą się w pierwszym ekranie, każdy
            temat w jednym zwartym wierszu. Scena każdego z nich (wykres roku,
            gablota, taśma) leży warstwę niżej, w rozwinięciu. */}
        <div className="mt-8 space-y-5 sm:mt-10 sm:space-y-6">
          <AtlasSheet stamp="Arkusz 01 · dziś">
            <TodayStrip
              snapshot={snapshot}
              ready={streakReady}
              today={today}
              coursesReady={coursesReady}
              onActive={pointRhythm}
            />
          </AtlasSheet>

          <AtlasSheet stamp="Arkusz 02 · kursy">
            <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
              <h2 className="text-xl font-extrabold tracking-[-0.03em] sm:text-2xl">Kursy</h2>
              <p className="profil-micro">
                {coursesReady ? doneAll : 0} z {totalAll} {plural(totalAll, LESSON_FORMS)} zrobionych
              </p>
            </div>

            <ul className="mt-2">
              {courses.map((course) => (
                <CourseRow
                  key={course.id}
                  id={course.id}
                  name={course.name}
                  basePath={course.basePath}
                  atlas={course.atlas}
                  step={course.step}
                  ready={course.ready}
                  activeSlug={course.activeSlug}
                  onActive={course.onActive}
                  open={openCourse === course.id}
                  onToggle={() => toggleCourse(course.id)}
                >
                  <YearPlot
                    basePath={course.basePath}
                    atlas={course.atlas}
                    ready={course.ready}
                    activeSlug={course.activeSlug}
                    onActive={course.onActive}
                  />
                  <div className="mt-8">
                    <NextStep
                      step={course.step}
                      ready={course.ready}
                      fresh={
                        course.atlas.stats.doneLessons === 0 &&
                        course.atlas.stats.startedLessons === 0
                      }
                    />
                  </div>
                  <StatLedger rows={course.ledger} ready={course.ready} className={course.ledgerClass} />
                  <ProgramLink href={`${course.basePath}/program`} />
                </CourseRow>
              ))}
            </ul>
          </AtlasSheet>

          <AtlasSheet id="odznaki" stamp="Arkusz 03 · odznaki">
            <SheetHead
              title="Odznaki"
              summary={
                <>
                  <span className="profil-num text-[var(--ink)]">{streakReady ? earned : 0}</span> z{' '}
                  {badges.length}
                </>
              }
              open={openPanels.odznaki}
              onToggle={() => togglePanel('odznaki')}
              controls="odznaki-wszystkie"
              label="Wszystkie odznaki"
            />
            <div className="mt-5">
              <BadgeShelf badges={badges} ready={streakReady} />
            </div>
            <DisclosurePanel id="odznaki-wszystkie" open={openPanels.odznaki}>
              <BadgeCase badges={badges} ready={streakReady} />
            </DisclosurePanel>
          </AtlasSheet>

          <AtlasSheet id="rytm" stamp="Arkusz 04 · rytm roku">
            <SheetHead
              title="Rytm roku"
              summary={
                <>
                  <span className="profil-num text-[var(--ink)]">
                    {streakReady ? snapshot.totalDays : 0}
                  </span>{' '}
                  dni nauki · rekord{' '}
                  <span className="profil-num text-[var(--ink)]">
                    {streakReady ? snapshot.longest : 0}
                  </span>
                </>
              }
              open={openPanels.rytm}
              onToggle={() => togglePanel('rytm')}
              controls="rytm-szczegoly"
              label="Taśma roku"
            />
            <DisclosurePanel id="rytm-szczegoly" open={openPanels.rytm} className="pt-6">
              <RhythmSheet
                snapshot={snapshot}
                badges={badges}
                ready={streakReady}
                onActive={pointRhythm}
              />
            </DisclosurePanel>
          </AtlasSheet>

          <AtlasSheet id="konto" stamp="Arkusz 05 · konto i dostęp">
            <SheetHead
              title="Konto"
              summary={
                <span className="normal-case tracking-normal text-[var(--ink-soft)]">
                  {user.email}
                </span>
              }
              open={openPanels.konto}
              onToggle={() => togglePanel('konto')}
              controls="konto-ustawienia"
              label="Ustawienia konta"
            />
            <DisclosurePanel id="konto-ustawienia" open={openPanels.konto} className="pt-8">
              <AccountSheet user={user} />
            </DisclosurePanel>
          </AtlasSheet>

          <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[var(--ink-soft)]">
            <span>Nowe lekcje i zagadki co tydzień:</span>
            <FacebookFooterLink
              placement="profile"
              className="font-semibold text-[var(--ink)] underline-offset-4 hover:underline"
            >
              obserwuj DociekAI na Facebooku
            </FacebookFooterLink>
          </p>
        </div>
      </div>
    </AtlasGround>
  );
}
