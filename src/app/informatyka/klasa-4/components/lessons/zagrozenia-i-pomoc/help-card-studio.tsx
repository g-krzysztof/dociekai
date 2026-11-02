'use client';

import { useState, type ReactNode } from 'react';
import { Lock, Newspaper } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskShell } from '../../task-shell';
import {
  CONTACTS,
  EMPTY_SLOTS,
  MIN_ROLES,
  ROLES,
  Z3_CRITERIA,
  judgeZ3,
  peopleReady,
  type CardState,
  type PersonRow,
  type Slots,
} from './z3';

/**
 * Zadanie obowiązkowe **Z-3** — w całości w lekcji: dziecko wypełnia kartkę
 * „gdzie szukam pomocy”, tę, którą potem powiesi przy biurku.
 *
 * Kartka zaczyna się od **ludzi**, bo z trudną sprawą idzie się najpierw do kogoś,
 * kogo się zna — i dlatego numery odblokowują się dopiero po trzech osobach.
 * Rolę osoby dziecko wskazuje z listy pięciu (jedna z nich to pułapka: ktoś, kogo
 * zna tylko z gry), a jego własne słowa to tylko imię. Numery i adresy wpisuje z
 * **ulotki** obok, ale pola na kartce nazywają się **sytuacjami** („Komuś dzieje
 * się krzywda — natychmiast”), nie instytucjami, a ulotka jest w innej kolejności
 * i mówi, czym jest każdy numer: żeby przepisać we właściwe miejsce, trzeba
 * zrozumieć, do czego który służy. Strona porównuje wpisane wartości znak po
 * znaku (`z3.ts`).
 *
 * Nagrodą jest sama kartka złożona z tego, co dziecko wpisało — dokładnie ta, o
 * którą prosi ostatnie zdanie wskazówek do Z-3 („warto wydrukować i powiesić przy
 * biurku”). Treść kartki **nie jest nigdzie zapisywana**: imiona bliskich osób
 * żyją tylko do przeładowania strony.
 */

/**
 * Ulotka z tablicy w szkole — w innej kolejności niż pola na kartce i z opisami
 * własnymi słowami ulotki. Dane jak w `CONTACTS` (stan: wrzesień 2026).
 */
const FLYER: { value: string; text: string }[] = [
  { value: '112', text: 'numer alarmowy' },
  { value: 'dyzurnet.pl', text: 'zgłaszanie nielegalnych treści w sieci' },
  {
    value: '116 111',
    text: 'Telefon Zaufania dla Dzieci i Młodzieży (Fundacja Dajemy Dzieciom Siłę). Bezpłatny i anonimowy, dla osób w wieku 7–18 lat.',
  },
  {
    value: '800 100 100',
    text: 'telefon dla rodziców i nauczycieli w sprawie bezpieczeństwa dzieci. Pon.–czw. 10:00–14:00, pt. 12:00–15:00.',
  },
  { value: '116111.pl', text: 'anonimowy kontakt online z Telefonem Zaufania — całą dobę.' },
];

const ROWS = 4;

const blankPeople = (): PersonRow[] => Array.from({ length: ROWS }, () => ({ role: null, name: '' }));

interface HelpCardStudioProps {
  color: string;
  onComplete?: () => void;
}

export function HelpCardStudio({ color, onComplete }: HelpCardStudioProps) {
  const [people, setPeople] = useState<PersonRow[]>(blankPeople);
  const [slots, setSlots] = useState<Slots>(EMPTY_SLOTS);
  /* Migawka kartki z chwili sprawdzenia: nagroda pokazuje to, co przeszło werdykt, a nie to, co dziecko przestawiło potem. */
  const [checked, setChecked] = useState<{ card: CardState; attempt: number } | null>(null);

  const ready = peopleReady(people);

  const patchPerson = (index: number, patch: Partial<PersonRow>) =>
    setPeople((current) => current.map((row, at) => (at === index ? { ...row, ...patch } : row)));

  const judge = () => {
    const card: CardState = { people: people.map((row) => ({ ...row })), slots: { ...slots } };
    setChecked((previous) => ({ card, attempt: (previous?.attempt ?? 0) + 1 }));
    return judgeZ3(card);
  };

  const reset = () => {
    setPeople(blankPeople());
    setSlots(EMPTY_SLOTS);
    setChecked(null);
  };

  return (
    <TaskShell
      color={color}
      brief={
        <>
          <p>
            <strong>Zadanie Z-3.</strong> Przygotuj w dokumencie tekstowym listę osób i instytucji,
            do których możesz się zwrócić w sytuacji poczucia zagrożenia, oraz numerów telefonów
            zaufania i adresów stron internetowych, z których możesz skorzystać w takiej sytuacji.
          </p>
          <p className="mt-3">
            Dokumentem jest kartka niżej — ta, którą potem powiesisz przy biurku. Zaczyna się od{' '}
            <strong>ludzi</strong>, bo z trudną sprawą idzie się najpierw do kogoś, kogo się zna;{' '}
            <strong>numery odblokują się dopiero wtedy, gdy na kartce staną trzy osoby</strong>.
          </p>
          <p className="mt-3">
            Numerów i adresów <strong>nie zgadujesz</strong> — masz je na ulotce obok. Ulotka mówi,
            czym jest każdy numer, a kartka pyta o sytuacje: <strong>do którego dzwonisz, kiedy</strong>.
            Przepisz je dokładnie: na tej liście jedna cyfra to różnica między numerem, który działa,
            a takim, który nie.
          </p>
        </>
      }
      criteria={Z3_CRITERIA}
      workshop={
        <div className="space-y-5 lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,290px)] lg:gap-x-6 lg:gap-y-5 lg:space-y-0">
          <section className="lg:col-start-1 lg:row-start-1">
            <SectionTitle number="1" color={color}>
              Najpierw ludzie
            </SectionTitle>
            <p className="mb-3 text-sm leading-relaxed text-muted-foreground">
              Wskaż, kim jest osoba, i wpisz jej imię. Potrzeba co najmniej{' '}
              {MIN_ROLES} osób <strong className="text-foreground">z różnych miejsc</strong> —
              gdyby jedna była poza zasięgiem, ma być ktoś następny.
            </p>
            <div className="space-y-3">
              {people.map((row, index) => (
                <fieldset key={index} className="border p-3">
                  <legend className="px-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    Osoba {index + 1}
                  </legend>
                  <div className="flex flex-wrap gap-1.5" role="group" aria-label={`Kim jest osoba ${index + 1}`}>
                    {ROLES.map((role) => {
                      const chosen = row.role === role.id;
                      return (
                        <button
                          key={role.id}
                          type="button"
                          aria-pressed={chosen}
                          onClick={() => patchPerson(index, { role: chosen ? null : role.id })}
                          className={cn(
                            'cursor-pointer border px-2.5 py-1 text-left text-xs leading-snug transition-colors',
                            chosen ? 'text-white' : 'hover:bg-muted/50'
                          )}
                          style={
                            chosen
                              ? { backgroundColor: color, borderColor: color }
                              : { borderColor: `${color}66` }
                          }
                        >
                          {role.label}
                        </button>
                      );
                    })}
                  </div>
                  <input
                    value={row.name}
                    onChange={(event) => patchPerson(index, { name: event.target.value })}
                    aria-label={`Imię osoby ${index + 1}`}
                    placeholder={ROLES.find((role) => role.id === row.role)?.example ?? 'imię'}
                    maxLength={40}
                    autoComplete="off"
                    className="mt-2.5 w-full border bg-white px-2.5 py-1.5 text-sm dark:bg-zinc-900/60"
                  />
                </fieldset>
              ))}
            </div>
          </section>

          <Flyer className="lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:sticky lg:top-24 lg:self-start" />

          <section className="lg:col-start-1 lg:row-start-2">
            <SectionTitle number="2" color={color}>
              Potem numery i adresy
            </SectionTitle>
            {!ready && (
              <p className="mb-3 flex items-start gap-2 border-l-2 pl-3 text-sm leading-relaxed text-muted-foreground" style={{ borderColor: color }}>
                <Lock className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                Numery odblokują się, kiedy na kartce będą trzy osoby z różnych miejsc.
              </p>
            )}
            <div className={cn('space-y-4', !ready && 'opacity-50')}>
              {(['telefon', 'strona'] as const).map((kind) => (
                <div key={kind}>
                  <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
                    {kind === 'telefon' ? 'Telefony' : 'Strony internetowe'}
                  </p>
                  <div className="space-y-2.5">
                    {CONTACTS.filter((contact) => contact.kind === kind).map((contact) => (
                      <label key={contact.id} className="block">
                        <span className="mb-1 block text-sm leading-snug">{contact.situation}</span>
                        <input
                          value={slots[contact.id]}
                          onChange={(event) =>
                            setSlots((current) => ({ ...current, [contact.id]: event.target.value }))
                          }
                          disabled={!ready}
                          maxLength={40}
                          autoComplete="off"
                          spellCheck={false}
                          autoCapitalize="none"
                          inputMode={kind === 'telefon' ? 'tel' : 'url'}
                          placeholder={kind === 'telefon' ? 'numer' : 'adres strony'}
                          className="w-full max-w-[260px] border bg-white px-2.5 py-1.5 font-mono text-sm tabular-nums disabled:cursor-not-allowed dark:bg-zinc-900/60"
                        />
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      }
      judge={judge}
      onReset={reset}
      acceptedText={
        <>
          Kartka jest kompletna: ludzie z różnych miejsc i numery co do cyfry. Zostało to, co
          najważniejsze — <strong>przepisz ją na papier albo wydrukuj i powieś przy biurku</strong>.
          Lista, która jest tylko na ekranie, nie pomoże w chwili, w której będzie potrzebna.
        </>
      }
      reward={checked && <HelpCard key={checked.attempt} card={checked.card} color={color} />}
      onComplete={onComplete}
    />
  );
}

function SectionTitle({ number, color, children }: { number: string; color: string; children: ReactNode }) {
  return (
    <p className="mb-2 flex items-baseline gap-2 text-sm font-bold" style={{ color }}>
      <span className="font-mono tabular-nums">{number}</span>
      {children}
    </p>
  );
}

/** Ulotka ze spisem — to z niej dziecko przepisuje numery. */
function Flyer({ className }: { className?: string }) {
  return (
    <aside
      aria-label="Ulotka z numerami"
      className={cn('border-2 border-dashed bg-amber-50/70 p-3 dark:bg-zinc-900/60', className)}
    >
      <p className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide text-muted-foreground">
        <Newspaper className="h-3.5 w-3.5 shrink-0" aria-hidden />
        Ulotka z tablicy w szkole
      </p>
      <p className="mt-1 text-sm font-bold">Gdzie szukać pomocy</p>
      <ul className="mt-3 space-y-2.5">
        {FLYER.map((item) => (
          <li key={item.value}>
            <span className="font-mono text-base font-bold tabular-nums">{item.value}</span>
            <span className="block text-xs leading-snug text-muted-foreground">{item.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-[10px] text-muted-foreground">Numery i godziny: stan na wrzesień 2026.</p>
    </aside>
  );
}

/** Kartka, która ma wisieć przy biurku — z tego, co dziecko wpisało. */
function HelpCard({ card, color }: { card: CardState; color: string }) {
  const seen = new Set<string>();
  const people = card.people.filter((row) => {
    const role = ROLES.find((item) => item.id === row.role);
    if (!role?.helper || row.name.trim() === '' || seen.has(`${row.role}:${row.name.trim()}`)) return false;
    seen.add(`${row.role}:${row.name.trim()}`);
    return true;
  });

  return (
    <div className="border-2 bg-white p-4 dark:bg-zinc-900/70" style={{ borderColor: color }}>
      <p className="mb-3 border-b pb-2 text-center text-sm font-bold uppercase tracking-wider" style={{ color }}>
        Gdzie szukam pomocy
      </p>

      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Najpierw ludzie</p>
      <ul className="mb-4 space-y-1.5">
        {people.map((row, index) => (
          <li key={index} className="flex items-start gap-2 text-sm leading-snug">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
            <span className="min-w-0 break-words">
              <strong>{row.name.trim()}</strong>
              <span className="text-xs text-muted-foreground"> — {ROLES.find((role) => role.id === row.role)?.label}</span>
            </span>
          </li>
        ))}
      </ul>

      <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">Potem numery i adresy</p>
      <ul className="space-y-1.5">
        {CONTACTS.map((contact) => (
          <li key={contact.id} className="text-sm leading-snug">
            <span className="font-mono font-bold tabular-nums" style={{ color }}>
              {contact.value}
            </span>{' '}
            <span className="text-xs text-muted-foreground">
              — {contact.institution}. {contact.situation}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
