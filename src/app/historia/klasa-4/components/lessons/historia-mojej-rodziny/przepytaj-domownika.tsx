'use client';

import { useMemo, useState } from 'react';
import { Check, MessageCircleQuestion, Pin, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { TaskShell, type ProofOutcome } from '@/components/block-lesson/task-shell';
import { PracticeTask } from '@/components/block-lesson/practice-task';
import {
  isValidPersonalYear,
  removePersonalPin,
  setPersonalPin,
  type PersonalRole,
} from '../../../lib/timeline/personal-storage';
import { timelineNow, useTimelinePins } from '../../../lib/timeline/use-timeline-pins';
import {
  INTERVIEW_CRITERIA,
  OWN_ID,
  QUESTION_BANK,
  judgeFamilyYear,
  judgeInterview,
  ownQuestionForm,
  type InterviewData,
} from './wywiad';

const WHO = ['babcia lub dziadek', 'mama lub tata', 'inny bliski dorosły'] as const;

/**
 * Blok 4 — **„Przepytaj domownika”** (zadanie). Praca dzieje się w lekcji:
 * dziecko wybiera i układa trzy pytania do wywiadu (z banku albo własne),
 * a sędzia sprawdza **strukturę zestawu** (czas, opowieść, ślad) i nazywa
 * konkret. Nagroda: **karta wywiadu z jego trzema pytaniami**, którą weźmie do
 * rozmowy (poza ekranem — lista kontrolna `PracticeTask` jako dodatek), oraz
 * dobrowolne **lata rodzinne na Osi dziejów** (same lata, bez imion, tylko na tym
 * urządzeniu). Blok kończy się na przyjętej karcie — lata można pominąć.
 */
export function PrzepytajDomownika({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [chosen, setChosen] = useState<string[]>([]);
  const [own, setOwn] = useState('');
  const [locked, setLocked] = useState(false);
  const [who, setWho] = useState<(typeof WHO)[number]>(WHO[0]);

  const ownForm = useMemo(() => ownQuestionForm(own), [own]);
  const count = chosen.length + (own.trim() ? 1 : 0);

  const toggle = (id: string) => {
    if (locked) return;
    setChosen((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const judge = (): ProofOutcome<InterviewData> => judgeInterview(chosen, own);

  const questionsOnCard = [
    ...chosen.map((id) => QUESTION_BANK.find((q) => q.id === id)?.text ?? ''),
    ...(own.trim() && ownForm.valid ? [own.trim()] : []),
  ].filter(Boolean);

  return (
    <div className="space-y-5">
      <TaskShell<InterviewData>
        color={color}
        brief={
          <>
            <p>
              Najlepszym źródłem o historii twojej rodziny jest ktoś, kto ją pamięta. Dziś przygotujesz{' '}
              <strong>wywiad z kimś bliskim, kto pamięta więcej niż ty</strong> — z babcią, dziadkiem, rodzicem albo innym
              dorosłym, którego znasz od zawsze. Wybierz <strong>trzy pytania</strong> z listy albo napisz własne.
            </p>
          </>
        }
        criteria={INTERVIEW_CRITERIA}
        criteriaHeading="Czego będę szukać w twoim zestawie pytań"
        workshopLabel="Twoje trzy pytania"
        workshop={
          <div className="space-y-4">
            <ul className="space-y-2">
              {QUESTION_BANK.map((q) => {
                const on = chosen.includes(q.id);
                return (
                  <li key={q.id}>
                    <button
                      type="button"
                      role="checkbox"
                      aria-checked={on}
                      disabled={locked}
                      onClick={() => toggle(q.id)}
                      className={cn(
                        'flex w-full items-start gap-3 border-2 px-3 py-2.5 text-left text-sm leading-snug transition-colors',
                        on ? 'bg-muted/60 font-medium' : 'hover:bg-muted/30',
                        locked && !on && 'opacity-40'
                      )}
                      style={{ borderColor: on ? color : 'var(--border)' }}
                    >
                      <span
                        className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center border"
                        style={on ? { backgroundColor: color, borderColor: color } : { borderColor: 'var(--border)' }}
                      >
                        {on && <Check className="h-3.5 w-3.5 text-white" aria-hidden />}
                      </span>
                      {q.text}
                    </button>
                  </li>
                );
              })}
            </ul>

            <div>
              <label htmlFor={OWN_ID} className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Albo własne pytanie
              </label>
              <input
                id={OWN_ID}
                value={own}
                disabled={locked}
                onChange={(e) => setOwn(e.target.value.slice(0, 140))}
                placeholder="np. Jak świętowaliście urodziny, kiedy byłaś/eś mała/y?"
                className="w-full border-2 bg-white px-3 py-2 text-sm dark:bg-zinc-900"
              />
              {own.trim() && !ownForm.valid && ownForm.problem && (
                <p className="mt-1 text-xs text-amber-700 dark:text-amber-400">{ownForm.problem}</p>
              )}
            </div>

            <p className="text-sm tabular-nums text-muted-foreground" aria-live="polite">
              Wybrano: <strong style={{ color }}>{count}</strong> z 3
            </p>
          </div>
        }
        judge={judge}
        canCheck={count > 0}
        checkLabel="Sprawdź mój zestaw"
        acceptedText={
          <p>
            Dobry zestaw: pytasz o <strong>czas</strong> (wyjdzie rok), o <strong>opowieść</strong> (rozmówca nie odpowie
            jednym słowem) i o <strong>ślad</strong> (będzie co obejrzeć). Tak przygotowuje się wywiad
            historyk.
          </p>
        }
        onReset={() => {
          setChosen([]);
          setOwn('');
        }}
        onComplete={() => {
          setLocked(true);
          onComplete();
        }}
        reward={
          <div className="space-y-5">
            <div className="border-2 bg-white p-4 dark:bg-zinc-900" style={{ borderColor: color }}>
              <p className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
                <MessageCircleQuestion className="h-4 w-4" aria-hidden /> Karta wywiadu
              </p>
              <div role="radiogroup" aria-label="Z kim rozmawiasz" className="mb-3 flex flex-wrap gap-2">
                {WHO.map((w) => (
                  <button
                    key={w}
                    type="button"
                    role="radio"
                    aria-checked={who === w}
                    onClick={() => setWho(w)}
                    className="border-2 px-2.5 py-1 text-xs font-medium"
                    style={who === w ? { borderColor: color, backgroundColor: `${color}1f` } : { borderColor: 'var(--border)' }}
                  >
                    {w}
                  </button>
                ))}
              </div>
              <p className="mb-2 text-sm text-muted-foreground">Rozmówca: <strong className="text-foreground">{who}</strong></p>
              <ol className="space-y-3">
                {questionsOnCard.map((q, i) => (
                  <li key={i} className="text-sm leading-snug">
                    <span className="font-mono font-bold tabular-nums" style={{ color }}>{i + 1}.</span> {q}
                    <span className="mt-2 block border-b border-dashed" aria-hidden>&nbsp;</span>
                  </li>
                ))}
              </ol>
              <p className="mt-3 text-xs text-muted-foreground">
                Pod pytaniem zostaw miejsce na zapis — zanotuj najważniejsze słowa i rok, o którym usłyszysz.
              </p>
            </div>

            <PracticeTask
              color={color}
              brief={<p><strong>Po rozmowie</strong> — to dzieje się poza ekranem, więc sprawdź sam/a.</p>}
              sections={[
                {
                  label: 'Rozmowa',
                  items: [
                    'Zadałem/am wszystkie trzy pytania i dałem/am rozmówcy czas na odpowiedź.',
                    'Zanotowałem/am przynajmniej jeden rok, który padł w rozmowie.',
                    'Poprosiłem/am o pokazanie pamiątki albo zdjęcia, o którym była mowa.',
                  ],
                },
              ]}
              doneText="Rozmowa zrobiona. Masz teraz coś, czego nie znajdzie w żadnej książce — źródło ustne z twojej rodziny."
            />

            <RodzinneLata color={color} />
          </div>
        }
      />
    </div>
  );
}

// ─── Lata rodzinne na osi ───

const ROLE_LABEL: Record<PersonalRole, string> = {
  ja: 'ja',
  rodzic: 'rodzic',
  dziadek: 'babcia lub dziadek',
};

function RodzinneLata({ color }: { color: string }) {
  const now = timelineNow();
  const { personal, ready, getStore } = useTimelinePins();
  const [text, setText] = useState<Partial<Record<PersonalRole, string>>>({});
  const [error, setError] = useState<{ role: PersonalRole; text: string } | null>(null);

  const save = (role: PersonalRole) => {
    const year = Number((text[role] ?? '').trim());
    if (!isValidPersonalYear(year, now)) {
      setError({ role, text: `Wpisz rok między 1900 a ${now} (cztery cyfry).` });
      return;
    }
    const clash = judgeFamilyYear(personal, role, year);
    if (clash) {
      setError({ role, text: clash });
      return;
    }
    setError(null);
    setPersonalPin(getStore(), role, year, now);
    setText((prev) => ({ ...prev, [role]: '' }));
  };

  if (!ready) return null;

  const roles: PersonalRole[] = ['dziadek', 'rodzic', 'ja'];
  const known = roles.filter((r) => personal[r] !== undefined);

  return (
    <div className="space-y-3 border p-4">
      <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide" style={{ color }}>
        <Pin className="h-4 w-4" aria-hidden /> Lata rodzinne na twojej osi · dobrowolnie
      </p>
      <p className="text-sm leading-relaxed">
        Możesz przypiąć <strong>same lata</strong> — bez imion. Zostają tylko na tym urządzeniu, nie jadą na serwer.
        Rozmowa pewnie podpowie rok urodzenia babci albo dziadka; rodzic zwykle go zna.
      </p>

      <ul className="space-y-2">
        {roles.map((role) => (
          <li key={role} className="flex flex-wrap items-center gap-2 text-sm">
            <span className="w-36 shrink-0 font-medium">{ROLE_LABEL[role]}</span>
            {role === 'ja' ? (
              <span className="text-muted-foreground">
                {personal.ja ? `ur. ${personal.ja} (przypięty w pierwszej lekcji)` : 'rok przypinasz w pierwszej lekcji'}
              </span>
            ) : personal[role] !== undefined ? (
              <>
                <span className="font-semibold tabular-nums">ur. {personal[role]}</span>
                <button
                  type="button"
                  onClick={() => removePersonalPin(getStore(), role, now)}
                  className="inline-flex items-center gap-1 text-xs text-muted-foreground underline underline-offset-2"
                >
                  <X className="h-3 w-3" aria-hidden /> usuń
                </button>
              </>
            ) : (
              <form
                className="flex items-center gap-2"
                onSubmit={(e) => {
                  e.preventDefault();
                  save(role);
                }}
              >
                <input
                  inputMode="numeric"
                  maxLength={4}
                  aria-label={`Rok urodzenia: ${ROLE_LABEL[role]}`}
                  value={text[role] ?? ''}
                  onChange={(e) => setText((prev) => ({ ...prev, [role]: e.target.value.replace(/\D/g, '') }))}
                  placeholder="rok"
                  className="w-20 border-2 bg-white px-2 py-1 text-center tabular-nums dark:bg-zinc-900"
                />
                <button type="submit" className="px-3 py-1 text-xs font-semibold text-white" style={{ backgroundColor: color }}>
                  Przypnij
                </button>
              </form>
            )}
          </li>
        ))}
      </ul>

      {error && (
        <p className="border border-destructive/50 bg-destructive/5 px-3 py-2 text-sm text-destructive" aria-live="polite">
          {error.text}
        </p>
      )}

      {known.length >= 2 && <RodzinnaOs color={color} pins={personal} />}
    </div>
  );
}

function RodzinnaOs({ color, pins }: { color: string; pins: Partial<Record<PersonalRole, number>> }) {
  const entries = (Object.keys(pins) as PersonalRole[])
    .map((role) => ({ role, year: pins[role] as number }))
    .sort((a, b) => a.year - b.year);
  const first = entries[0].year;
  const last = entries[entries.length - 1].year;
  const lo = first - 6;
  const hi = last + 6;
  const x = (year: number) => 6 + ((year - lo) / (hi - lo)) * 88;

  return (
    <figure className="space-y-1">
      <svg viewBox="0 0 100 34" className="h-auto w-full" role="img" aria-label="Rodzinna oś: lata urodzenia kolejnych pokoleń">
        <line x1="4" y1="16" x2="96" y2="16" stroke="currentColor" strokeOpacity="0.35" strokeWidth="0.6" />
        {entries.map((e) => (
          <g key={e.role}>
            <circle cx={x(e.year)} cy="16" r="2" fill={color} />
            <text x={x(e.year)} y="9" textAnchor="middle" fontSize="3.4" fontWeight="700" fill="currentColor">
              {ROLE_LABEL[e.role] === 'babcia lub dziadek' ? 'babcia/dziadek' : ROLE_LABEL[e.role]}
            </text>
            <text x={x(e.year)} y="26" textAnchor="middle" fontSize="3.6" fill="currentColor">
              {e.year}
            </text>
          </g>
        ))}
      </svg>
      <figcaption className="text-xs text-muted-foreground">
        {entries.slice(1).map((e, i) => {
          const gap = e.year - entries[i].year;
          return (
            <span key={e.role} className="mr-3">
              {ROLE_LABEL[entries[i].role]} → {ROLE_LABEL[e.role]}: {gap} {plural(gap, { one: 'rok', few: 'lata', many: 'lat' })}
            </span>
          );
        })}
        Tyle zwykle trwa jedno pokolenie. Te lata widać też na Osi dziejów.
      </figcaption>
    </figure>
  );
}
