/**
 * Przypominajka L2 (z L1 „Co to jest historia?”, dystans 1) — dane i sędzia,
 * bez Reacta.
 *
 * Mini-powtórka reguły półek z „Archiwum postaci”: jedna wymyślona teczka
 * (rycerz Dobromir — postać wymyślona na potrzeby przypominajki), trzy półki
 * podpisane regułą. Poprawna: legendarna (coś jest — miecz i opowieść;
 * czegoś brak — źródła z jego czasów). Że postać jest wymyślona, dziecko
 * dowiaduje się dopiero z werdyktu — wcześniej zdradzałoby odpowiedź.
 */

export type MiniShelf = 'historyczna' | 'legendarna' | 'basniowa';

export const MINI_SHELVES: { id: MiniShelf; rule: string }[] = [
  { id: 'historyczna', rule: 'Wszystko znalezione' },
  { id: 'legendarna', rule: 'Coś jest, czegoś brak' },
  { id: 'basniowa', rule: 'Nic nie znalezione' },
];

export interface MiniFind {
  found: boolean;
  text: string;
}

export const TECZKA_NAME = 'Rycerz Dobromir';

export const TECZKA_FINDS: MiniFind[] = [
  { found: true, text: 'W muzeum leży stary miecz z tabliczką „miecz Dobromira” — ale na samym mieczu nie ma imienia.' },
  { found: true, text: 'Przewodnik opowiada, że Dobromir pokonał smoka.' },
  { found: false, text: 'Żadnego dokumentu ani zapisu kronikarza z jego czasów.' },
  { found: false, text: 'Nikt nie wie, kiedy żył — raz mówi się o jednym wieku, raz o innym.' },
];

export function judgeMiniShelf(shelf: MiniShelf): { ok: boolean; why: string } {
  if (shelf === 'legendarna') {
    return {
      ok: true,
      why: 'Tak: miecz i opowieść są, ale nic z jego czasów nie mówi, że Dobromir żył naprawdę. Coś jest, czegoś brak — jak smok z szafy w poprzedniej lekcji. (Dobromira wymyśliliśmy na tę próbę — prawdziwe legendy jeszcze przed tobą.)',
    };
  }
  if (shelf === 'historyczna') {
    return {
      ok: false,
      why: 'Postać historyczną potwierdzają źródła z jej czasów — dokument albo zapis kogoś, kto wtedy żył. Miecz nie mówi, czyj był, a tabliczkę dopisało muzeum. Sprawdź, czego brakuje w teczce.',
    };
  }
  return {
    ok: false,
    why: 'Baśniowa teczka jest całkiem pusta — a tu jednak coś jest: prawdziwy miecz w muzeum. Sprawdź, co znaleziono.',
  };
}
