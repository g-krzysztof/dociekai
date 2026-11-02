/**
 * Czysta treść zadania praktycznego lekcji o zestawie komputerowym — sprzęt do
 * wyboru i werdykt o kierunku każdego kabla. Widżet (`desk-wiring.tsx`) tylko
 * to rysuje.
 *
 * Poprzednia wersja odbierała to zadanie **plikiem**: dziecko wypisywało swój
 * zestaw w edytorze tekstu, podpisywało każde urządzenie słowem „wejście”,
 * „wyjście” albo „obie strony” i wracało z `.txt`/`.docx` do sprawdzenia.
 * Użytkownik odrzucił ten model 2026-09-19 — i po namyśle widać, że rozbijał
 * się o wszystko poza tematem lekcji: wyjście ze strony, „Zapisz jako”,
 * odnalezienie pliku, a w werdykcie słownik rdzeni zgadujący, co dziecko miało
 * na myśli, pisząc „kart wifi”.
 *
 * Zostaje to, co w tamtym zadaniu było naprawdę dobre: **dziecko podejmuje tu
 * decyzje, które da się sprawdzić co do jednej**. Tyle że zamiast pisać słowo
 * w Notatniku, wpina kabel — a urządzenie dwukierunkowe potrzebuje dwóch, więc
 * „obie strony” przestaje być trzecim słowem do wybrania z listy i staje się
 * rzeczą, którą widać na biurku.
 *
 * Wyjątki zależne od sprzętu, który dziecko naprawdę ma, rozstrzygamy **na jego
 * korzyść** — dlatego ekran dotykowy, słuchawki z mikrofonem i urządzenie
 * wielofunkcyjne stoją na półce jako **osobne urządzenia**, a nie jako
 * przypadki szczególne zwykłego ekranu, słuchawek i drukarki. To dziecko
 * rozstrzyga, który z nich ma u siebie, i to jest pierwsza decyzja tego
 * zadania.
 */

export type Side = 'in' | 'out';
export type Flow = Side | 'both';

export const SIDE_LABEL: Record<Side, string> = {
  in: 'wejścia',
  out: 'wyjścia',
};

export interface DeviceDef {
  id: string;
  name: string;
  /** Co to jest — jedno półzdanie pod nazwą, żeby wybór nie był zgadywanką. */
  what: string;
  flow: Flow;
  /** Dlaczego kierunek jest taki, a nie inny. Pełne zdanie, bez „źle”. */
  why: string;
}

/**
 * Sprzęt, który dziecko ma szansę mieć u siebie. Kolejność jest kolejnością na
 * półce: najpierw to, co ma prawie każdy, potem rzeczy rzadsze — a urządzenia
 * dwukierunkowe są **wymieszane z resztą**, nie zebrane na końcu, bo inaczej
 * dziecko rozpoznawałoby je po pozycji zamiast po tym, co robią.
 */
export const DEVICES: DeviceDef[] = [
  {
    id: 'klawiatura',
    name: 'Klawiatura',
    what: 'klawisze pod palcami',
    flow: 'in',
    why: 'każdy klawisz to znak wysłany do komputera. Litery, które widzisz, rysuje już ekran — klawiatura tylko je podaje.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    what: 'zwykły ekran, bez dotyku',
    flow: 'out',
    why: 'komputer policzył obraz i ci go pokazuje. Przez zwykły ekran nic nie wraca do komputera.',
  },
  {
    id: 'mysz',
    name: 'Mysz',
    what: 'ruch po biurku i kliknięcia',
    flow: 'in',
    why: 'do komputera idzie informacja „przesunięto o tyle, kliknięto tutaj”. Strzałkę na ekranie dorysowuje monitor.',
  },
  {
    id: 'pendrive',
    name: 'Pendrive',
    what: 'pamięć w kieszeni',
    flow: 'both',
    why: 'kopiujesz na niego pliki — dane do niego wchodzą; kopiujesz z niego — wychodzą. Sam nic nie liczy, tylko przechowuje.',
  },
  {
    id: 'gladzik',
    name: 'Gładzik',
    what: 'płytka pod klawiaturą laptopa',
    flow: 'in',
    why: 'gładzik robi dokładnie to samo co mysz: podaje komputerowi ruch twojego palca. Sam nic ci nie pokazuje.',
  },
  {
    id: 'glosniki',
    name: 'Głośniki',
    what: 'dźwięk na cały pokój',
    flow: 'out',
    why: 'muzyka, głos z filmu, sygnał błędu — wszystko to wychodzi z komputera. W drugą stronę przez głośnik nic nie idzie.',
  },
  {
    id: 'dotykowy',
    name: 'Ekran dotykowy',
    what: 'ekran tabletu albo laptopa z dotykiem',
    flow: 'both',
    why: 'pokazuje obraz policzony przez komputer i przyjmuje dotknięcia twojego palca — to naprawdę dwie drogi w jednym szkle.',
  },
  {
    id: 'sluchawki',
    name: 'Słuchawki',
    what: 'same słuchawki, bez mikrofonu',
    flow: 'out',
    why: 'słuchawki oddają ci dźwięk z komputera i nic mu nie podają.',
  },
  {
    id: 'mikrofon',
    name: 'Mikrofon',
    what: 'osobny, na biurku',
    flow: 'in',
    why: 'twój głos zamieniony na sygnał wchodzi do komputera. Bez mikrofonu komputer cię nie słyszy.',
  },
  {
    id: 'headset',
    name: 'Słuchawki z mikrofonem',
    what: 'zestaw do gier i rozmów',
    flow: 'both',
    why: 'dźwięk z komputera leci do twoich uszu, a twój głos w drugą stronę — jedna obudowa, dwa kierunki.',
  },
  {
    id: 'kamerka',
    name: 'Kamerka',
    what: 'nad ekranem albo osobna',
    flow: 'in',
    why: 'obraz z twojego pokoju wchodzi do komputera. Dopiero stamtąd leci dalej — na przykład do babci.',
  },
  {
    id: 'drukarka',
    name: 'Drukarka',
    what: 'tylko drukuje',
    flow: 'out',
    why: 'zwykła drukarka bierze plik z komputera i odkłada go na kartce. W drugą stronę nic przez nią nie wraca.',
  },
  {
    id: 'wielofunkcyjne',
    name: 'Urządzenie wielofunkcyjne',
    what: 'drukuje i skanuje',
    flow: 'both',
    why: 'drukuje (plik → papier, czyli wyjście) i skanuje (papier → plik, czyli wejście). Dwa urządzenia w jednej obudowie.',
  },
  {
    id: 'kontroler',
    name: 'Kontroler do gier',
    what: 'pad z drążkami',
    flow: 'in',
    why: 'kontroler podaje komputerowi, co naciskasz. To, co dzieje się potem w grze, rysuje już ekran.',
  },
  {
    id: 'skaner',
    name: 'Skaner',
    what: 'osobny, ze szklaną płytą',
    flow: 'in',
    why: 'skaner zamienia kartkę w plik: papier wchodzi do komputera, nic z niego nie wychodzi.',
  },
  {
    id: 'router',
    name: 'Router',
    what: 'pudełko z antenami i lampkami',
    flow: 'both',
    why: 'przez router dane wychodzą do internetu i tą samą drogą wracają — strony, filmy i wiadomości płyną w obie strony.',
  },
];

export const deviceById = (id: string): DeviceDef => DEVICES.find((item) => item.id === id)!;

/** Ile urządzeń trzeba zebrać, żeby to był spis zestawu, a nie jedno urządzenie. */
export const MIN_DEVICES = 5;
/** Sufit — nie z powodu ekranu, tylko dlatego, że osiem kabli to już cały zestaw. */
export const MAX_DEVICES = 8;

/** Ile kabli i po których stronach potrzebuje urządzenie. */
export function needed(flow: Flow): Side[] {
  return flow === 'both' ? ['in', 'out'] : [flow];
}

export interface Verdict {
  ok: boolean;
  /** Zdanie dla dziecka. Przy pomyłce mówi dlaczego, nigdy samo „źle”. */
  note: string;
  /** Czy brakuje jeszcze jednego kabla — widżet podświetla wtedy gniazdo. */
  missing?: Side;
}

/**
 * Werdykt dla jednego urządzenia. Cztery różne sytuacje i **każda dostaje inne
 * zdanie** — „popraw” nie uczy niczego, a „mysz to wejście, bo do komputera
 * idzie informacja o ruchu” uczy.
 */
export function judge(device: DeviceDef, sides: Side[]): Verdict {
  const want = needed(device.flow);
  const has = (side: Side) => sides.includes(side);

  if (sides.length === 0) {
    return { ok: false, note: 'Jeszcze bez kabla — wpięcie go jest właśnie zadaniem.', missing: want[0] };
  }

  if (device.flow === 'both') {
    if (has('in') && has('out')) {
      return { ok: true, note: `Dwa kable i słusznie: ${device.why}` };
    }
    const missing: Side = has('in') ? 'out' : 'in';
    return {
      ok: false,
      note: `Dobrze, ale to dopiero połowa — ${device.why} Wepnij drugi kabel po stronie ${SIDE_LABEL[missing]}.`,
      missing,
    };
  }

  if (sides.length > 1) {
    return {
      ok: false,
      note: `Jeden kabel tu wystarczy: ${device.why}`,
    };
  }

  if (has(device.flow)) {
    return { ok: true, note: device.why };
  }

  return {
    ok: false,
    note: `Kabel stoi po drugiej stronie, niż płynie informacja: ${device.why}`,
  };
}

/** Ile kabli powinno stać po danej stronie w gotowym zestawie. */
export function countSide(ids: string[], side: Side): number {
  return ids.filter((id) => needed(deviceById(id).flow).includes(side)).length;
}
