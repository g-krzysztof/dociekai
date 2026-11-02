'use client';

import { useState } from 'react';
import { plural } from '@/lib/plural';
import { DAY_FORMS } from '@/components/streak/streak-count';
import type { BadgeState } from '@/lib/streak/badges';
import { humanDate, schoolYearLabel } from '@/lib/streak/school-calendar';
import type { StreakSnapshot, WeekColumn } from '@/lib/streak/types';
import { StatLedger } from './stat-ledger';
import { YearTape } from './year-tape';

/**
 * Arkusz rytmu — seria widziana jako pomiar, nie jako gra.
 *
 * To jest ta sama prawda, którą w kursie widać jako płomień i konfetti, tylko
 * w drugim rejestrze: tu liczy się rejestr roku, a nie zachęta na jutro. Dlatego
 * na scenie stoi **taśma roku**, a nie licznik — i dlatego liczbą, którą arkusz
 * powtarza najczęściej, są dni nauki łącznie, czyli ta, która nigdy nie spada.
 */

const LESSON_FORMS = { one: 'lekcja', few: 'lekcje', many: 'lekcji' };
const BADGE_FORMS = { one: 'odznaka', few: 'odznaki', many: 'odznak' };

function weekDetail(week: WeekColumn): string {
  const lessons = week.days.flatMap((day) => day.lessons);
  const math = lessons.filter((key) => key.startsWith('matematyka/')).length;
  const info = lessons.filter((key) => key.startsWith('informatyka/')).length;
  const hist = lessons.filter((key) => key.startsWith('historia/')).length;

  if (lessons.length === 0) return `${week.doneCount} z 5 dni nauki`;

  const parts = [
    math > 0 ? `${math} z matematyki` : null,
    info > 0 ? `${info} z informatyki` : null,
    hist > 0 ? `${hist} z historii` : null,
  ].filter(Boolean);

  return `${week.doneCount} z 5 dni · ${lessons.length} ${plural(lessons.length, LESSON_FORMS)}: ${parts.join(', ')}`;
}

function tapeLabel(snapshot: StreakSnapshot): string {
  const active = snapshot.tape.filter((week) => week.doneCount > 0).length;
  if (active === 0) {
    return `Taśma roku szkolnego ${schoolYearLabel(snapshot.today)} — jeszcze pusta, ${snapshot.tape.length} tygodni przed Tobą.`;
  }
  const best = Math.max(...snapshot.tape.map((week) => week.doneCount));
  return `Taśma roku szkolnego ${schoolYearLabel(snapshot.today)}: ${active} ${plural(active, { one: 'tydzień', few: 'tygodnie', many: 'tygodni' })} z nauką, najlepszy tydzień ${best} z 5 dni, łącznie ${snapshot.totalDays} ${plural(snapshot.totalDays, DAY_FORMS)} nauki.`;
}

interface RhythmSheetProps {
  snapshot: StreakSnapshot;
  badges: BadgeState[];
  ready: boolean;
  /** Wskazanie myszą przestawia poświatę całej strony na barwę serii. */
  onActive: (active: boolean) => void;
}

export function RhythmSheet({ snapshot, badges, ready, onActive }: RhythmSheetProps) {
  const [activeWeek, setActiveWeek] = useState<string | null>(null);
  const week = snapshot.tape.find((column) => column.start === activeWeek);
  const earned = badges.filter((badge) => badge.earned).length;
  const fresh = ready && snapshot.totalDays === 0;

  const readout = week
    ? { lead: `Tydzień od ${humanDate(week.start)}`, detail: weekDetail(week) }
    : {
        lead: (
          <>
            Rok szkolny {schoolYearLabel(snapshot.today)}
            <span className="hidden sm:inline"> · wskaż tydzień</span>
          </>
        ),
        detail: (
          <>
            <span className="text-[var(--ink)]">{ready ? snapshot.totalDays : 0}</span> dni nauki ·
            rekord <span className="text-[var(--ink)]">{ready ? snapshot.longest : 0}</span> · {' '}
            <span className="text-[var(--ink)]">{ready ? earned : 0}</span>{' '}
            {plural(earned, BADGE_FORMS)}
          </>
        ),
      };

  return (
    <div
      onMouseEnter={() => onActive(true)}
      onMouseLeave={() => {
        onActive(false);
        setActiveWeek(null);
      }}
    >
      {/* Dokładnie dwa wiersze odczytu — wskazanie tygodnia na taśmie nie może
          przesuwać niczego pod spodem. */}
      <div className="h-[2.15rem] overflow-hidden">
        <p className="profil-micro truncate text-[11px]">{readout.lead}</p>
        <p className="profil-micro mt-1 truncate text-[11px]">{readout.detail}</p>
      </div>

      <p className="mt-5 max-w-3xl text-sm leading-relaxed text-[var(--ink-soft)]">
        Seria liczy <span className="text-[var(--ink)]">dni nauki</span>: weekendy, ferie i dni
        wolne nic nie kosztują, a lekcja w weekend i tak dokłada dzień. Opuszczony dzień nauki
        ratuje <span className="text-[var(--ink)]">zamrażarka</span> — dwie na tydzień, zużywają
        się same i odnawiają w poniedziałek.
      </p>

      <section className="mt-9">
        <div className="flex items-baseline justify-between gap-4 border-t border-[var(--rule-faint)] pt-3">
          <h3 className="profil-micro text-[var(--ink-soft)]">
            Taśma roku <span className="text-[var(--ink-faint)]">· tydzień po tygodniu</span>
          </h3>
          <p className="profil-num shrink-0 text-[11px] text-[var(--ink-soft)]">
            {schoolYearLabel(snapshot.today)}
          </p>
        </div>

        <YearTape
          weeks={snapshot.tape}
          label={tapeLabel(snapshot)}
          activeWeek={activeWeek}
          onActive={setActiveWeek}
          ready={ready}
        />

        {fresh && (
          <p className="mt-4 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
            Cały rok stoi pusty i czeka.{' '}
            <span className="text-[var(--ink)]">
              Dzień zalicza się po doprowadzeniu jednej lekcji do stu procent
            </span>{' '}
            — w dowolnym kursie.
          </p>
        )}
      </section>

      <StatLedger
        rows={[
          {
            label: 'Seria',
            value: ready ? `${snapshot.streak}` : '—',
            hint: 'dni nauki jeden po drugim',
          },
          {
            label: 'Rekord',
            value: ready ? `${snapshot.longest}` : '—',
            hint: snapshot.longestEndedOn
              ? `najdłuższa seria, do ${humanDate(snapshot.longestEndedOn)}`
              : 'najdłuższa seria w historii konta',
          },
          {
            label: 'Dni nauki',
            value: ready ? `${snapshot.totalDays}` : '—',
            hint: 'wszystkie dni z ukończoną lekcją — ta liczba nigdy nie spada',
          },
          {
            label: 'Lekcje',
            value: ready ? `${snapshot.totalLessons}` : '—',
            hint: 'ukończone w stu procentach, we wszystkich kursach',
          },
          {
            label: 'Odznaki',
            value: ready ? `${earned}/${badges.length}` : '—',
            hint: 'za rytm, drogę, mapę roku i charakter',
          },
        ]}
        ready={ready}
        className="lg:grid-cols-5"
      />
    </div>
  );
}
