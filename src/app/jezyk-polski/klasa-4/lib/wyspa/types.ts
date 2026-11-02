/**
 * Wyspa (moduł 4) — stan między lekcjami: słowa zebrane do magazynu i rzeczy
 * postawione na wyspie. Jak Teczka **nigdy nie wychodzi z urządzenia** (dziecko
 * wpisuje imiona i nazwę wyspy). Gość — `sessionStorage`, konto — `localStorage`.
 */

/** Rzecz postawiona na wyspie słowem (L14): `slowo` = id wyrazu z palety lekcji, x/y w procentach planszy (0–100, zaokrąglone do 0,1). */
export interface WyspaRzecz { id: string; slowo: string; x: number; y: number; ile?: number; tabliczka?: 'ten' | 'ta' | 'to'; imie?: string }
/** Tort z L16: kształt, smak każdego piętra od dołu (1–3), kolor lukru. */
export interface WyspaTort { ksztalt: 'okragly' | 'kwadratowy'; pietra: ('czekoladowy' | 'waniliowy' | 'malinowy' | 'cytrynowy')[]; kolor: 'bialy' | 'rozowy' | 'zielony' }
/**
 * `tor` — wyścig ślimaków przejechany w L16; `tort` — ostatni przyjęty tort;
 * `kot` — miejsce kota w domku z L17.
 */
export interface WyspaRecord {
  v: 1; magazyn: string[]; rzeczy: WyspaRzecz[]; nazwa?: string; tor?: true; tort?: WyspaTort;
  /** L17 — id strefy domku, w której dziecko zostawiło kota (np. `na-szafie`). */
  kot?: string;
  updatedAt: number;
}

/** Pusta wyspa do stanu początkowego Reacta — tylko do czytania (`Object.freeze`). */
export const EMPTY_WYSPA: WyspaRecord = Object.freeze({
  v: 1,
  magazyn: Object.freeze([]),
  rzeczy: Object.freeze([]),
  updatedAt: 0,
}) as unknown as WyspaRecord;
