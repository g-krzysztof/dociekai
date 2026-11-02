/**
 * Pinezki osobiste Osi dziejów — rok urodzenia dziecka (L1) i lata rodzinne
 * (L5). **Nigdy nie wychodzą z urządzenia** (zasada prywatności kursu):
 * nie ma dla nich trasy API ani wpisu w synchronizacji z kontem.
 *
 * Magazyn jak postęp kursu: gość — `sessionStorage` (jedna karta), konto —
 * `localStorage`. Przy logowaniu pinezki gościa przechodzą do `localStorage`,
 * przy wylogowaniu znikają razem z postępem (wspólne urządzenie: następne
 * dziecko nie powinno zobaczyć cudzego roku urodzenia). Konsekwencja, świadomie
 * przyjęta: po wylogowaniu i ponownym logowaniu rok urodzenia trzeba przypiąć
 * od nowa — serwer go nie zna. Oś pokazuje wtedy puste miejsce „twoja pinezka”.
 *
 * Zawartość: **same lata i role** („ja”, „babcia”) — bez imion, bez miejsc.
 */

export const PERSONAL_PINS_KEY = 'dociekai:hist-os-osobiste';

/** Zdarzenie DOM po każdej zmianie pinezek osobistych — `useTimelinePins` je nasłuchuje. */
export const TIMELINE_CHANGED_EVENT = 'dociekai:hist-timeline-changed';

/** Role są zamkniętą listą — żadnego wolnego tekstu, który mógłby zawierać imię. */
export const PERSONAL_ROLES = {
  ja: 'ja',
  rodzic: 'rodzic',
  dziadek: 'dziadek lub babcia',
} as const;

export type PersonalRole = keyof typeof PERSONAL_ROLES;

export interface PersonalPin {
  role: PersonalRole;
  /** Rok urodzenia (n.e.). */
  year: number;
}

export type PersonalPins = Partial<Record<PersonalRole, number>>;

/** Rozsądny zakres: babcia sprzed 1900 r. albo rok z przyszłości to pomyłka palca. */
export function isValidPersonalYear(year: number, now: number): boolean {
  return Number.isInteger(year) && year >= 1900 && year <= now;
}

function parse(raw: string | null, now: number): PersonalPins {
  if (!raw) return {};
  try {
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') return {};
    const out: PersonalPins = {};
    (Object.keys(PERSONAL_ROLES) as PersonalRole[]).forEach((role) => {
      const year = (parsed as Record<string, unknown>)[role];
      if (typeof year === 'number' && isValidPersonalYear(year, now)) out[role] = year;
    });
    return out;
  } catch {
    return {};
  }
}

export function readPersonalPins(store: Storage, now: number): PersonalPins {
  try {
    return parse(store.getItem(PERSONAL_PINS_KEY), now);
  } catch {
    return {};
  }
}

function write(store: Storage, pins: PersonalPins): void {
  try {
    if (Object.keys(pins).length === 0) store.removeItem(PERSONAL_PINS_KEY);
    else store.setItem(PERSONAL_PINS_KEY, JSON.stringify(pins));
  } catch {
    // Pełny albo zablokowany magazyn: pinezka zostaje tylko na ekranie do przeładowania.
  }
  window.dispatchEvent(new Event(TIMELINE_CHANGED_EVENT));
}

export function setPersonalPin(store: Storage, role: PersonalRole, year: number, now: number): void {
  if (!isValidPersonalYear(year, now)) return;
  write(store, { ...readPersonalPins(store, now), [role]: year });
}

export function removePersonalPin(store: Storage, role: PersonalRole, now: number): void {
  const pins = readPersonalPins(store, now);
  delete pins[role];
  write(store, pins);
}

/** Logowanie: pinezki gościa (ta karta) → konto na tym urządzeniu; na koncie wygrywa to, co już było. */
export function adoptSessionPersonalPins(now: number): void {
  try {
    const session = readPersonalPins(window.sessionStorage, now);
    if (Object.keys(session).length === 0) return;
    write(window.localStorage, { ...session, ...readPersonalPins(window.localStorage, now) });
    window.sessionStorage.removeItem(PERSONAL_PINS_KEY);
  } catch {
    // brak dostępu do magazynu — nic do przeniesienia
  }
}

/** Wylogowanie: pinezki osobiste znikają z obu magazynów. */
export function clearPersonalPins(): void {
  try {
    window.localStorage.removeItem(PERSONAL_PINS_KEY);
    window.sessionStorage.removeItem(PERSONAL_PINS_KEY);
  } catch {
    // jw.
  }
  window.dispatchEvent(new Event(TIMELINE_CHANGED_EVENT));
}
