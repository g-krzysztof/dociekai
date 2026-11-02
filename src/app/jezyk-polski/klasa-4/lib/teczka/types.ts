/**
 * Teczka autora (E5a) — wszystko, co dziecko samo napisało w kursie: liścik,
 * wizytówka, opis, opowiadanie, zdanie pierwszego wrażenia. Pod koniec roku
 * teczka staje się książeczką do druku (E5c).
 *
 * **Nigdy nie wychodzi z urządzenia** (D3): tekst
 * dziecka może zawierać imiona i szczegóły z domu. Gość — `sessionStorage`,
 * konto — `localStorage`; przy logowaniu teczka gościa przechodzi na konto,
 * przy wylogowaniu znika (wspólne urządzenie), jak pinezki osobiste historii.
 */

export interface TeczkaItem {
  /** Stałe id, zwykle `<moduł>/<lekcja>#<blok>` — zapis tego samego bloku nadpisuje kartkę. */
  id: string;
  /** Lekcja, z której kartka pochodzi (`start/jezyk-dziala`). */
  lesson: string;
  /** Rodzaj kartki: `wizytowka`, `list`, `wrazenie`, `opis`… */
  kind: string;
  /** Tytuł w spisie teczki i książeczki. */
  title: string;
  /** Tekst do pokazania i druku (akapity rozdzielone `\n`). */
  text: string;
  /** Części kartki złożonej z pól (np. wizytówka) — lekcja odtwarza z nich widok. */
  parts?: Record<string, string>;
  /** Do czego kartka się odnosi (np. `bookId` przy pierwszym wrażeniu). */
  ref?: string;
  /** Dziecko wybrało kartkę do książeczki (E5c). */
  inBooklet?: boolean;
  createdAt: number;
  updatedAt: number;
}

export interface TeczkaRecord {
  v: 1;
  items: Record<string, TeczkaItem>;
}

/** Pusta teczka do stanu początkowego Reacta — tylko do czytania (`Object.freeze`). */
export const EMPTY_TECZKA: TeczkaRecord = Object.freeze({ v: 1, items: Object.freeze({}) }) as TeczkaRecord;
