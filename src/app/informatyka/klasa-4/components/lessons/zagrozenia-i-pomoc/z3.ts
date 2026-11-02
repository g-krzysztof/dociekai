import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofOutcome } from '../../task-shell';

/**
 * Werdykt dla zadania obowiązkowego **Z-3** — kartki „gdzie szukam pomocy”,
 * wypełnianej na stronie.
 *
 * To jedyne zadanie w kursie, w którym **błąd w jednej cyfrze ma prawdziwą
 * cenę**: kartka wisi przy biurku po to, żeby w złym momencie nie trzeba było
 * niczego szukać. Numery są więc porównywane **co do cyfry**, po usunięciu
 * spacji i myślników („116-111” i „116 111” to ten sam numer, „116 11” już nie).
 *
 * Dowodem nie jest proza dziecka. Pierwsza wersja czytała jego listę słownikiem
 * rdzeni („mama”, „wychowawc-”, „pedagog-”…) i zgadywała, kogo dziecko miało na
 * myśli. Teraz dziecko **wskazuje rolę osoby z listy pięciu** (skończona liczba
 * możliwości, jedna z nich to pułapka), a jego własne słowa — imię — są tylko
 * imieniem: sprawdzamy, że jest, nie co znaczy. Numery i adresy wpisuje ze
 * spisu w lekcji, **do pola nazwanego sytuacją**, nie nazwą instytucji — więc
 * musi wiedzieć, do czego który służy, a strona porównuje wartość znak po znaku.
 *
 * Kolejność „najpierw osoby, dopiero potem instytucje” wymusza kartka, nie
 * sędzia: sekcja z numerami odblokowuje się po trzech osobach (`peopleReady`).
 * Kryterium, które nie może się nie powieść, byłoby teatrem.
 */

/* Osoby -------------------------------------------------------------------- */

export type RoleId = 'rodzic' | 'nauczyciel' | 'pedagog' | 'bliski' | 'obcy';

export interface Role {
  id: RoleId;
  label: string;
  /** Do kogoś takiego idzie się po pomoc. `false` to pułapka. */
  helper: boolean;
  /** Podpowiedź w polu imienia — żeby było widać, że ma być z imienia. */
  example: string;
}

export const ROLES: Role[] = [
  { id: 'rodzic', label: 'rodzic albo opiekun', helper: true, example: 'np. mama Anna' },
  { id: 'nauczyciel', label: 'wychowawca albo nauczyciel', helper: true, example: 'np. pani Ewa' },
  { id: 'pedagog', label: 'pedagog albo psycholog szkolny', helper: true, example: 'np. pan Marek' },
  { id: 'bliski', label: 'ktoś dorosły spoza domu', helper: true, example: 'np. babcia Basia, trener Piotr' },
  { id: 'obcy', label: 'ktoś, kogo znam tylko z gry albo czatu', helper: false, example: 'nick' },
];

export interface PersonRow {
  role: RoleId | null;
  name: string;
}

/** Ile różnych osób musi stać na kartce, żeby odblokować numery — i żeby zadanie mogło być przyjęte. */
export const MIN_ROLES = 3;

const NAME = /\p{L}{2,}/u;

function roleOf(id: RoleId | null): Role | undefined {
  return ROLES.find((role) => role.id === id);
}

/** Wiersz z osobą, do której naprawdę można pójść, i z imieniem. */
function validRows(people: PersonRow[]): PersonRow[] {
  return people.filter((row) => roleOf(row.role)?.helper && NAME.test(row.name));
}

function distinctRoles(people: PersonRow[]): RoleId[] {
  return Array.from(new Set(validRows(people).map((row) => row.role as RoleId)));
}

/** Trzy różne osoby z imionami — od tego momentu kartka pozwala wpisać numery. */
export function peopleReady(people: PersonRow[]): boolean {
  return distinctRoles(people).length >= MIN_ROLES;
}

/* Numery i adresy ---------------------------------------------------------- */

export type SlotId = 'rozmowa' | 'alarm' | 'rodzice' | 'pisanie' | 'zglos';

export interface Contact {
  id: SlotId;
  kind: 'telefon' | 'strona';
  /** Dokładnie tak, jak ma stać na kartce. */
  value: string;
  institution: string;
  /** Pole na kartce nazywa się sytuacją, nie instytucją — żeby trzeba było wiedzieć, do czego który numer służy. */
  situation: string;
}

/**
 * Dane zweryfikowane do lekcji (stan: wrzesień 2026, Z-3).
 * Zmieniają się — telefon dla rodziców ma godziny pracy — więc przy przeglądzie
 * kursu trzeba je sprawdzić od nowa, także w ulotce (`help-card-studio.tsx`).
 */
export const CONTACTS: Contact[] = [
  {
    id: 'rozmowa',
    kind: 'telefon',
    value: '116 111',
    institution: 'Telefon Zaufania dla Dzieci i Młodzieży',
    situation: 'Chcę z kimś porozmawiać i nikomu nie mówić, kim jestem.',
  },
  {
    id: 'alarm',
    kind: 'telefon',
    value: '112',
    institution: 'numer alarmowy',
    situation: 'Komuś dzieje się krzywda albo grozi mu niebezpieczeństwo — natychmiast.',
  },
  {
    id: 'rodzice',
    kind: 'telefon',
    value: '800 100 100',
    institution: 'telefon dla rodziców i nauczycieli',
    situation: 'Mama, tata albo nauczyciel chce zapytać, jak zadbać o bezpieczeństwo dziecka.',
  },
  {
    id: 'pisanie',
    kind: 'strona',
    value: '116111.pl',
    institution: 'anonimowy kontakt online z Telefonem Zaufania',
    situation: 'Wolę napisać niż zadzwonić — nadal anonimowo.',
  },
  {
    id: 'zglos',
    kind: 'strona',
    value: 'dyzurnet.pl',
    institution: 'zgłaszanie nielegalnych treści w sieci',
    situation: 'W sieci jest groźna treść i chcę ją zgłosić.',
  },
];

export type Slots = Record<SlotId, string>;

export const EMPTY_SLOTS: Slots = { rozmowa: '', alarm: '', rodzice: '', pisanie: '', zglos: '' };

export interface CardState {
  people: PersonRow[];
  slots: Slots;
}

/** Numer w samych cyfrach; adres bez protokołu, „www” i ukośnika na końcu. */
function keyOf(kind: Contact['kind'], text: string): string {
  return kind === 'telefon'
    ? text.replace(/\D/g, '')
    : text.trim().toLowerCase().replace(/^https?:\/\//, '').replace(/^www\./, '').replace(/\/+$/, '');
}

type Check =
  | { state: 'ok' }
  | { state: 'pusto' }
  /** Wpisano poprawny numer, ale innej instytucji. */
  | { state: 'zamiana'; other: Contact }
  | { state: 'zle'; hint: string };

function check(contact: Contact, typed: string): Check {
  const key = keyOf(contact.kind, typed);
  if (key === '') return { state: 'pusto' };
  const right = keyOf(contact.kind, contact.value);
  if (key === right) return { state: 'ok' };

  const other = CONTACTS.find(
    (item) => item.id !== contact.id && item.kind === contact.kind && keyOf(item.kind, typed) === keyOf(item.kind, item.value)
  );
  if (other) return { state: 'zamiana', other };

  if (contact.kind === 'strona') return { state: 'zle', hint: 'adres nie zgadza się co do znaku' };
  if (key.length !== right.length)
    return {
      state: 'zle',
      hint: `${key.length < right.length ? 'brakuje cyfry' : 'jest o cyfrę za dużo'} — wpisano ${count(key.length, 'cyfrę', 'cyfry', 'cyfr')}, a ten numer ma ${count(right.length, 'cyfrę', 'cyfry', 'cyfr')}`,
    };
  const wrong = Array.from(key).filter((digit, at) => digit !== right[at]).length;
  return { state: 'zle', hint: wrong === 1 ? 'jedna cyfra się nie zgadza' : `różnią się ${count(wrong, 'cyfra', 'cyfry', 'cyfr')}` };
}

/* Kryteria i werdykt ------------------------------------------------------- */

export const Z3_CRITERIA: ProofCriterion[] = [
  { id: 'osoby', label: 'Na kartce jest co najmniej troje ludzi z twojego otoczenia — z różnych miejsc, każdy z imienia.' },
  { id: 'telefony', label: 'Trzy numery telefonów zgadzają się co do cyfry i stoją przy właściwej sytuacji: 116 111, 800 100 100, 112.' },
  { id: 'strony', label: 'Dwa adresy stron zgadzają się co do znaku: 116111.pl i dyzurnet.pl.' },
];

function judgePeople(people: PersonRow[]) {
  const roles = distinctRoles(people);
  const strangers = people.some((row) => row.role === 'obcy');
  const nameless = people.filter((row) => roleOf(row.role)?.helper && !NAME.test(row.name));
  const missing = ROLES.filter((role) => role.helper && !roles.includes(role.id));

  if (strangers)
    return {
      ok: false,
      note: 'Na kartce stoi ktoś, kogo znasz tylko z gry albo czatu. Do takiej osoby nie idzie się po pomoc — to dokładnie ten ktoś, o kim była rozmowa w pierwszym bloku. Usuń ten wiersz albo wybierz kogoś, kogo możesz zobaczyć na własne oczy.',
    };

  if (roles.length >= MIN_ROLES)
    return {
      ok: true,
      note: `Na kartce: ${validRows(people)
        .filter((row, at, all) => all.findIndex((other) => other.role === row.role) === at)
        .map((row) => `${roleOf(row.role)?.label} — ${row.name.trim()}`)
        .join('; ')}.`,
    };

  if (roles.length === 0 && nameless.length === 0)
    return {
      ok: false,
      note: 'Na kartce nie ma jeszcze żadnej osoby. Zacznij od kogoś, kogo znasz: rodzica albo opiekuna, wychowawcy, pedagoga, kogoś dorosłego spoza domu — wskaż, kim jest, i wpisz imię.',
    };

  const parts = [] as string[];
  if (nameless.length > 0)
    parts.push(
      `Przy „${roleOf(nameless[0].role)?.label}” brakuje imienia — lista ma być konkretna: „mama Anna”, a nie „rodzic”.`
    );
  parts.push(
    `Masz ${count(roles.length, 'osobę', 'osoby', 'osób')} z różnych miejsc, a potrzeba ${MIN_ROLES}. Dopisz kogoś jeszcze — na przykład ${missing.map((role) => role.label).join(' albo ')}.`
  );
  return { ok: false, note: parts.join(' ') };
}

function judgeContacts(kind: Contact['kind'], slots: Slots, ready: boolean) {
  const contacts = CONTACTS.filter((contact) => contact.kind === kind);
  const results = contacts.map((contact) => ({ contact, result: check(contact, slots[contact.id]) }));
  const bad = results.filter((item) => item.result.state !== 'ok');

  if (bad.length === 0)
    return {
      ok: true,
      note:
        kind === 'telefon'
          ? `Wszystkie trzy numery zgadzają się co do cyfry: ${contacts.map((contact) => contact.value).join(', ')}.`
          : 'Oba adresy są: 116111.pl i dyzurnet.pl.',
    };

  if (!ready && results.every((item) => item.result.state === 'pusto'))
    return { ok: false, note: 'Najpierw ludzie: numery odblokują się, kiedy na kartce staną trzy osoby.' };

  const lines = bad.map(({ contact, result }) => {
    const where = `„${contact.situation.replace(/[.!]$/, '')}”`;
    if (result.state === 'pusto') return `${where}: pole jest puste`;
    if (result.state === 'zamiana')
      return `${where}: wpisano „${slots[contact.id].trim()}”, a to ${result.other.institution} — ta sytuacja potrzebuje innego`;
    if (result.state === 'zle') return `${where}: „${slots[contact.id].trim()}” — ${result.hint}`;
    return where;
  });

  return {
    ok: false,
    note: `${lines.join('. ')}. ${kind === 'telefon' ? 'Na tej kartce to jedyny błąd, który naprawdę kosztuje — porównaj z ulotką cyfra po cyfrze.' : 'Porównaj z ulotką znak po znaku.'}`,
  };
}

export function judgeZ3({ people, slots }: CardState): ProofOutcome<null> {
  const ready = peopleReady(people);
  return {
    data: null,
    verdicts: {
      osoby: judgePeople(people),
      telefony: judgeContacts('telefon', slots, ready),
      strony: judgeContacts('strona', slots, ready),
    },
  };
}
