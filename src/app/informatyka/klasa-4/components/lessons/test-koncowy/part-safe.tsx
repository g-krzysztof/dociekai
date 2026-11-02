'use client';

import { useState } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CheckBar, type ItemProps, type PartItem } from './test-frame';

/**
 * Część D testu — **bezpieczeństwo, sztuczna inteligencja i wspólna praca**.
 * Trzy zadania, w których o wyniku decyduje to, co dziecko **ustawi albo
 * złoży**, a nie to, którą z trzech odpowiedzi wybierze:
 *
 * 1. **Hasło z klocków** — trzy przypadkowe słowa, cyfra lub znak, i żadnego
 *    klocka „o tobie” (imię, rok urodzenia).
 * 2. **Notatka z generatora** — dziecko znajduje w niej zdania z błędem, zanim
 *    trafi do jego referatu. Sprawdzanie wyniku maszyny jest umiejętnością, a
 *    tekst pisany pewnym tonem jest w tym najtrudniejszy.
 * 3. **Udostępnianie dokumentu** — trzy ustawienia naraz: kto ma dostęp, co
 *    może zrobić i komu wysłać zaproszenie.
 */

/* ------------------------------------------------------------------ */
/* 1. Hasło                                                            */
/* ------------------------------------------------------------------ */

interface Chip {
  id: string;
  text: string;
  kind: 'word' | 'personal' | 'extra';
}

const CHIPS: Chip[] = [
  { id: 'kasia', text: 'Kasia', kind: 'personal' },
  { id: 'rower', text: 'rower', kind: 'word' },
  { id: '2015', text: '2015', kind: 'personal' },
  { id: 'chmura', text: 'chmura', kind: 'word' },
  { id: 'siedem', text: '7', kind: 'extra' },
  { id: 'gitara', text: 'gitara', kind: 'word' },
  { id: 'wykrzyknik', text: '!', kind: 'extra' },
  { id: 'slonik', text: 'słonik', kind: 'word' },
  { id: 'zielony', text: 'zielony', kind: 'word' },
];

function PasswordItem({ color, onDone }: ItemProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const chosen = picked.map((id) => CHIPS.find((chip) => chip.id === id)!).filter(Boolean);
  const words = chosen.filter((chip) => chip.kind === 'word').length;
  const personal = chosen.some((chip) => chip.kind === 'personal');
  const extra = chosen.some((chip) => chip.kind === 'extra');
  const ok = words >= 3 && !personal && extra;
  const password = chosen.map((chip) => chip.text).join('');

  const toggle = (id: string) => {
    if (checked) return;
    setPicked((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : prev.length >= 6 ? prev : [...prev, id]));
  };

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  const rows = [
    { ok: words >= 3, text: words >= 3 ? 'Co najmniej trzy przypadkowe słowa — długości nie da się odgadnąć.' : 'Za mało słów: trzy przypadkowe słowa to długość, której nie zgadnie żaden program w rozsądnym czasie.' },
    { ok: !personal, text: !personal ? 'Nic w haśle nie zdradza, kim jesteś.' : 'W haśle jest imię albo rok urodzenia — od nich programy łamiące hasła zaczynają, a pół klasy je zna.' },
    { ok: extra, text: extra ? 'Jest cyfra albo znak specjalny.' : 'Brakuje cyfry albo znaku — wiele stron tego wymaga.' },
  ];

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Założ hasło do konta w szkolnej grze. Złóż je z klocków: <strong>stuknij klocek</strong>, żeby go dodać, stuknij
        jeszcze raz w pasku, żeby zdjąć. Możesz użyć najwyżej sześciu.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        {CHIPS.map((chip) => {
          const used = picked.includes(chip.id);
          return (
            <button
              key={chip.id}
              type="button"
              disabled={checked}
              onClick={() => toggle(chip.id)}
              aria-pressed={used}
              className={cn('min-h-10 cursor-pointer border-2 px-3 font-mono text-sm', used ? 'bg-muted text-muted-foreground line-through' : 'hover:bg-muted/40')}
            >
              {chip.text}
            </button>
          );
        })}
      </div>

      <div className="mt-3 min-h-[3.5rem] border-2 border-dashed px-3 py-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Twoje hasło</p>
        {picked.length ? (
          <p className="mt-1 flex flex-wrap items-center gap-1 font-mono text-lg">
            {chosen.map((chip) => (
              <button key={chip.id} type="button" onClick={() => toggle(chip.id)} disabled={checked} className="cursor-pointer px-1 hover:bg-muted" aria-label={`Zdejmij klocek ${chip.text}`}>
                {chip.text}
              </button>
            ))}
          </p>
        ) : (
          <p className="mt-1 text-sm text-muted-foreground">(jeszcze puste)</p>
        )}
      </div>

      <CheckBar
        color={color}
        ready={picked.length >= 2}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Złóż hasło z co najmniej dwóch klocków."
        explain={
          <>
            <p className="mb-1.5 font-mono text-xs text-muted-foreground">Sprawdzone hasło: {password}</p>
            <ul className="space-y-1.5">
              {rows.map((row, index) => (
                <li key={index} className="flex items-start gap-2">
                  {row.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />}
                  <span>{row.text}</span>
                </li>
              ))}
            </ul>
          </>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 2. Notatka z generatora                                             */
/* ------------------------------------------------------------------ */

const CLAIMS = [
  { id: 'c1', text: 'Wilk jest ssakiem z rodziny psowatych.', wrong: false },
  { id: 'c2', text: 'Wilki żyją zwykle w grupach zwanych watahami.', wrong: false },
  { id: 'c3', text: 'Wilk ma sześć łap i dwa skrzydła.', wrong: true },
  { id: 'c4', text: 'Młode wilki są karmione mlekiem matki.', wrong: false },
  { id: 'c5', text: 'Wilki są roślinożerne i żywią się wyłącznie trawą.', wrong: true },
  { id: 'c6', text: 'Wycie wilka bywa słychać z bardzo daleka.', wrong: false },
];

function ClaimsItem({ color, onDone }: ItemProps) {
  const [flagged, setFlagged] = useState<string[]>([]);
  const [checked, setChecked] = useState(false);

  const ok = CLAIMS.every((claim) => flagged.includes(claim.id) === claim.wrong);

  const toggle = (id: string) => {
    if (checked) return;
    setFlagged((prev) => (prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]));
  };

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Generator napisał notatkę o wilkach do twojego referatu. Zanim ją wkleisz, <strong>zaznacz zdania, w których jest
        błąd</strong>. Zaznaczaj tylko takie — poprawne zdania zostaw.
      </p>
      <div className="mt-3 border bg-muted/20 p-3 text-sm leading-relaxed sm:text-base">
        {CLAIMS.map((claim) => {
          const on = flagged.includes(claim.id);
          const showRight = checked && claim.wrong;
          const showWrongFlag = checked && on && !claim.wrong;
          return (
            <button
              key={claim.id}
              type="button"
              disabled={checked}
              onClick={() => toggle(claim.id)}
              aria-pressed={on}
              className={cn(
                'mr-1 inline cursor-pointer border-b-2 border-transparent px-0.5 text-left transition-colors disabled:cursor-default',
                on && !checked && 'border-amber-500 bg-amber-500/20',
                showRight && 'border-emerald-500 bg-emerald-500/15',
                showWrongFlag && 'border-rose-500 bg-rose-500/15 line-through',
                !on && !checked && 'hover:bg-muted'
              )}
            >
              {claim.text}
            </button>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Zaznaczone do sprawdzenia: {flagged.length}.</p>
      <CheckBar
        color={color}
        ready={true}
        checked={checked}
        ok={ok}
        onCheck={check}
        explain={
          <p>
            Błędne były dwa zdania: o sześciu łapach i skrzydłach oraz o wilkach roślinożernych. Generator pisze tak samo pewnie, gdy ma rację i gdy zmyśla —
            dlatego wynik zawsze sprawdza człowiek, zanim trafi do pracy.
          </p>
        }
      />
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* 3. Udostępnianie                                                    */
/* ------------------------------------------------------------------ */

const PEOPLE = [
  { id: 'ala', label: 'Ala (klasa 4)', classmate: true },
  { id: 'kuba', label: 'Kuba (klasa 4)', classmate: true },
  { id: 'zosia', label: 'Zosia (klasa 4)', classmate: true },
  { id: 'obcy', label: 'jan.k@sklep-promocje.xyz', classmate: false },
];

const ACCESS = [
  { id: 'wskazane', label: 'Tylko osoby, które wskażę' },
  { id: 'link', label: 'Każdy, kto ma link' },
];

const ROLES = [
  { id: 'ogladac', label: 'Tylko oglądać' },
  { id: 'komentowac', label: 'Komentować' },
  { id: 'edytowac', label: 'Edytować' },
];

function ShareItem({ color, onDone }: ItemProps) {
  const [invited, setInvited] = useState<string[]>([]);
  const [access, setAccess] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [checked, setChecked] = useState(false);

  const peopleOk = PEOPLE.every((person) => invited.includes(person.id) === person.classmate);
  const accessOk = access === 'wskazane';
  const roleOk = role === 'komentowac';
  const ok = peopleOk && accessOk && roleOk;

  const check = () => {
    setChecked(true);
    onDone(ok);
  };

  const rows = [
    {
      ok: accessOk,
      text: accessOk ? 'Dostęp tylko dla wskazanych osób — link nie wyląduje u obcych.' : 'Każdy, kto ma link, ma dostęp — a link łatwo przekazać dalej. Plan klasy ma zobaczyć tylko klasa.',
    },
    {
      ok: roleOk,
      text: roleOk
        ? 'Komentowanie: koledzy zostawiają uwagi, ale nie nadpisują cudzego tekstu.'
        : role === 'edytowac'
          ? 'Edytowanie pozwala kolegom zmieniać twój tekst wprost — a uwagę do cudzej pracy zostawia się jako komentarz.'
          : 'Samo oglądanie nie pozwala zostawić uwagi, a klasa miała móc ją zostawić.',
    },
    {
      ok: peopleOk,
      text: peopleOk ? 'Zaproszeni są dokładnie koledzy z klasy.' : 'Zaproś Alę, Kubę i Zosię — i nikogo, kogo nie znasz. Obcy adres to nie kolega.',
    },
  ];

  return (
    <div>
      <p className="text-sm leading-relaxed sm:text-base">
        Udostępniasz klasie <strong>plan wycieczki</strong>. Koledzy mają móc zostawić uwagi, ale nie zmieniać twojego
        tekstu, a nikt obcy nie może go zobaczyć. Ustaw okno udostępniania.
      </p>

      <div className="mt-3 grid gap-4 border bg-muted/20 p-3 sm:grid-cols-3">
        <fieldset disabled={checked}>
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kto ma dostęp</legend>
          <div className="mt-2 space-y-1.5">
            {ACCESS.map((item) => (
              <button key={item.id} type="button" aria-pressed={access === item.id} onClick={() => setAccess(item.id)} className={cn('min-h-10 w-full cursor-pointer border px-2.5 text-left text-xs', access === item.id ? 'bg-muted font-semibold' : 'hover:bg-muted/40')} style={access === item.id ? { borderColor: color } : undefined}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={checked}>
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Co mogą robić</legend>
          <div className="mt-2 space-y-1.5">
            {ROLES.map((item) => (
              <button key={item.id} type="button" aria-pressed={role === item.id} onClick={() => setRole(item.id)} className={cn('min-h-10 w-full cursor-pointer border px-2.5 text-left text-xs', role === item.id ? 'bg-muted font-semibold' : 'hover:bg-muted/40')} style={role === item.id ? { borderColor: color } : undefined}>
                {item.label}
              </button>
            ))}
          </div>
        </fieldset>
        <fieldset disabled={checked}>
          <legend className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Kogo zaprosić</legend>
          <div className="mt-2 space-y-1.5">
            {PEOPLE.map((person) => {
              const on = invited.includes(person.id);
              return (
                <button key={person.id} type="button" aria-pressed={on} onClick={() => setInvited((prev) => (prev.includes(person.id) ? prev.filter((item) => item !== person.id) : [...prev, person.id]))} className={cn('flex min-h-10 w-full cursor-pointer items-center gap-2 border px-2.5 text-left text-xs', on ? 'bg-muted font-semibold' : 'hover:bg-muted/40')} style={on ? { borderColor: color } : undefined}>
                  <span className={cn('grid h-4 w-4 shrink-0 place-items-center border', on && 'bg-foreground text-background')} aria-hidden>
                    {on && <Check className="h-3 w-3" strokeWidth={3.5} />}
                  </span>
                  <span className="min-w-0 break-words">{person.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>
      </div>

      <CheckBar
        color={color}
        ready={access !== null && role !== null && invited.length > 0}
        checked={checked}
        ok={ok}
        onCheck={check}
        readyHint="Ustaw dostęp, rolę i wybierz, kogo zaprosić."
        explain={
          <ul className="space-y-1.5">
            {rows.map((row, index) => (
              <li key={index} className="flex items-start gap-2">
                {row.ok ? <Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" aria-hidden /> : <X className="mt-0.5 h-4 w-4 shrink-0 text-rose-600" aria-hidden />}
                <span>{row.text}</span>
              </li>
            ))}
          </ul>
        }
      />
    </div>
  );
}

export const SAFE_ITEMS: PartItem[] = [
  { id: 'haslo', title: 'Hasło z klocków', Item: PasswordItem },
  { id: 'generator', title: 'Błędy w notatce z generatora', Item: ClaimsItem },
  { id: 'udostepnianie', title: 'Ustawienia udostępniania', Item: ShareItem },
];
