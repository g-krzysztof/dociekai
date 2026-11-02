'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { GoogleIcon } from '@/components/ui/google-icon';
import { motion, useReducedMotion } from 'framer-motion';
import { Flame, Snowflake } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { plural } from '@/lib/plural';
import { nextMilestone } from '@/lib/streak/derive';
import type { StreakEvent } from '@/lib/streak/record';
import { BadgeMark } from './badge-mark';
import { DAY_FORMS } from './streak-count';
import { WeekStrip } from './week-strip';

/**
 * Wstążka serii na karcie końcowej lekcji — moment, w którym nawyk faktycznie
 * powstaje. Świętuje tylko **pierwszą lekcję danego dnia**: druga dostaje jedno
 * ciche zdanie, bo powtórzone konfetti przestaje cokolwiek znaczyć.
 *
 * Choreografia jest jedna i trwa ~1,3 s: zapala się dzisiejsza kratka, potem
 * przeskakuje licznik, na końcu ląduje stempel odznaki. Przy
 * `prefers-reduced-motion` wszystkie trzy stany pojawiają się od razu.
 */

const IGNITE_MS = 120;
const COUNT_MS = 420;
const STAMP_MS = 900;

interface StreakRibbonProps {
  /** Wynik zapisu serii. `null` u gościa i dopóki lekcja nie jest skończona. */
  event: StreakEvent | null;
  /** Lekcja właśnie przekroczyła 100% w tej wizycie. */
  justFinished: boolean;
  isGuest: boolean;
}

export function StreakRibbon({ event, justFinished, isGuest }: StreakRibbonProps) {
  const reduced = useReducedMotion();
  const [phase, setPhase] = useState(reduced ? 3 : 0);

  const celebrate = Boolean(event?.dayCounted);

  useEffect(() => {
    if (!celebrate || reduced) return;
    setPhase(0);
    const timers = [
      setTimeout(() => setPhase(1), IGNITE_MS),
      setTimeout(() => setPhase(2), COUNT_MS),
      setTimeout(() => setPhase(3), STAMP_MS),
    ];
    return () => timers.forEach(clearTimeout);
  }, [celebrate, reduced, event?.snapshot.today]);

  if (isGuest) return justFinished ? <GuestInvite /> : null;
  if (!event) return null;

  const { snapshot, streakBefore, streakAfter, newBadges } = event;

  if (!celebrate) {
    return (
      <p className="mx-auto mb-6 flex max-w-xl items-center justify-center gap-2 text-sm text-muted-foreground">
        <Flame className="h-4 w-4 text-[var(--streak)]" fill="var(--streak)" aria-hidden />
        Dzień masz już zaliczony. Seria: {snapshot.streak} {plural(snapshot.streak, DAY_FORMS)} nauki.
      </p>
    );
  }

  const shown = phase >= 2 ? streakAfter : streakBefore;
  const next = nextMilestone(streakAfter);
  const fullWeek = snapshot.week.slice(0, 5).every((day) => day.state === 'done');
  const frozen = snapshot.frozenThisWeek.length;

  return (
    <div className="mx-auto mb-7 max-w-xl border-t-2 border-[var(--streak)] bg-[color-mix(in_oklch,var(--streak)_7%,transparent)] px-5 py-5 text-left sm:px-6">
      <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4">
        <div className="flex items-center gap-3">
          <Flame
            className="h-9 w-9 shrink-0 text-[var(--streak)]"
            fill="var(--streak)"
            strokeWidth={1.8}
            aria-hidden
          />
          <div>
            <p className="flex items-baseline gap-2">
              <motion.span
                key={shown}
                initial={reduced ? false : { y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                className="text-4xl font-extrabold leading-none tabular-nums tracking-tight text-[var(--streak-ink)]"
              >
                {shown}
              </motion.span>
              <span className="text-sm font-semibold text-muted-foreground">
                {plural(shown, DAY_FORMS)} nauki
              </span>
            </p>
            <p className="mt-1 text-sm font-bold uppercase tracking-[0.1em] text-[var(--streak-ink)]">
              {streakBefore === 0 ? 'Seria zaczęta' : fullWeek ? 'Pełny tydzień!' : 'Dzień zaliczony'}
            </p>
          </div>
        </div>

        <WeekStrip
          days={snapshot.week}
          today={snapshot.today}
          cell={20}
          labels
          ignite={phase >= 1 ? snapshot.today : undefined}
        />
      </div>

      {next && (
        <p className="mt-4 text-sm text-muted-foreground">
          Do odznaki za {next.target} {plural(next.target, DAY_FORMS)} nauki zostało{' '}
          <span className="font-semibold tabular-nums text-foreground">{next.left}</span>{' '}
          {plural(next.left, DAY_FORMS)}.
        </p>
      )}

      {frozen > 0 && (
        <p className="mt-2 flex items-center gap-1.5 text-sm text-muted-foreground">
          <Snowflake className="h-4 w-4 shrink-0 text-[var(--streak-cold)]" aria-hidden />
          {frozen === 1 ? 'Jeden dzień w tym tygodniu uratowała zamrażarka.' : `${frozen} dni w tym tygodniu uratowały zamrażarki.`}
        </p>
      )}

      {newBadges.length > 0 && phase >= 3 && (
        <div className="mt-5 space-y-4 border-t border-[color-mix(in_oklch,var(--streak)_25%,transparent)] pt-5">
          {newBadges.map((badge) => (
            <div key={badge.id} className="flex items-center gap-4">
              <BadgeMark badge={badge} size={56} stamp={!reduced} />
              <div>
                <p className="text-lg font-bold leading-tight">
                  <span className="text-[var(--streak-ink)]">Nowa odznaka:</span> {badge.name}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{badge.note}</p>
              </div>
            </div>
          ))}
          <Link
            href="/profil#rytm"
            className="inline-block text-sm font-semibold underline-offset-4 hover:underline"
          >
            Zobacz wszystkie odznaki
          </Link>
        </div>
      )}
    </div>
  );
}

/**
 * Gość właśnie skończył lekcję — najlepszy moment na konto, jaki serwis ma.
 * Zdanie jest prawdziwe co do joty: dzień faktycznie by się zaliczył, tylko nie
 * ma go gdzie zapisać.
 */
function GuestInvite() {
  return (
    <div className="mx-auto mb-7 max-w-xl border-t-2 border-[var(--streak)] bg-[color-mix(in_oklch,var(--streak)_6%,transparent)] px-5 py-5 text-left sm:px-6">
      <div className="flex items-start gap-3">
        <Flame className="h-8 w-8 shrink-0 text-[var(--streak)] opacity-45" strokeWidth={1.8} aria-hidden />
        <div>
          <p className="text-base font-bold">To byłby dziś dzień 1 Twojej serii.</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Serię liczymy tylko na koncie — postęp gościa znika razem z kartą przeglądarki. Załóż
            konto teraz, a ta lekcja od razu zaliczy dzisiejszy dzień.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Button asChild size="sm">
              <Link href="/auth?mode=register">
                <GoogleIcon className="mr-1.5" />
                Załóż konto
              </Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href="/auth?mode=login">
                <GoogleIcon className="mr-1.5" />
                Zaloguj się
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
