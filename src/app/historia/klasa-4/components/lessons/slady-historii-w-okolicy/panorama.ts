/**
 * L13, blok 2 — „Cztery sposoby pamiętania”. Panorama ulicy w Zawidełkach,
 * w której miasteczko upamiętniło swoją bohaterkę — **wymyśloną** nauczycielkę
 * Helenę Wierzbicką (F-II.3-04: bohaterowie regionalni to często nauczyciele,
 * działacze, artyści). Cztery formy pamięci to słownik `[2.3]`; reszta rzeczy
 * na ulicy to wabiki — każdy mówi, dlaczego nie jest pamiątką.
 */

export const PANORAMA_W = 1800;
export const PANORAMA_H = 300;

export type FormId = 'tablica' | 'ulica' | 'pomnik' | 'mural';

export interface StreetThing {
  id: string;
  x: number;
  y: number;
  r: number;
  /** Forma pamięci — albo `null` dla wabika. */
  form: FormId | null;
  name: string;
  note: string;
}

export const FORMS: Record<FormId, string> = {
  tablica: 'tablica pamiątkowa',
  ulica: 'nazwa ulicy',
  pomnik: 'pomnik',
  mural: 'mural',
};

export const THINGS: StreetThing[] = [
  {
    id: 'piekarnia',
    x: 150,
    y: 120,
    r: 34,
    form: null,
    name: 'Szyld piekarni',
    note: 'Szyld mówi, co tu można kupić. O nikim nie przypomina.',
  },
  {
    id: 'tablica',
    x: 485,
    y: 190,
    r: 24,
    form: 'tablica',
    name: 'Tablica przy drzwiach szkoły',
    note: '„W tej szkole w latach 1928–1966 uczyła Helena Wierzbicka. Wdzięczni uczniowie.” Tablicę wiesza się tam, gdzie ktoś żył albo pracował.',
  },
  {
    id: 'ulica',
    x: 640,
    y: 92,
    r: 26,
    form: 'ulica',
    name: 'Tabliczka z nazwą ulicy',
    note: '„ul. Heleny Wierzbickiej”. Nazwa ulicy to pamiątka, którą mieszkańcy powtarzają codziennie — na listach, w adresach, w rozmowach.',
  },
  {
    id: 'fontanna',
    x: 860,
    y: 215,
    r: 34,
    form: null,
    name: 'Fontanna',
    note: 'Ładna i chłodna w upał, ale nie ma na niej imienia ani daty. Nie upamiętnia nikogo.',
  },
  {
    id: 'pomnik',
    x: 1080,
    y: 150,
    r: 40,
    form: 'pomnik',
    name: 'Pomnik w parku',
    note: 'Kobieta z otwartą książką. Na cokole: „Helena Wierzbicka, nauczycielka. Mieszkańcy Zawidełek”. Pomnik stawia się, żeby pamięć stała w jednym miejscu przez długie lata.',
  },
  {
    id: 'plakat',
    x: 1300,
    y: 165,
    r: 30,
    form: null,
    name: 'Plakat festynu',
    note: 'Plakat zapowiada festyn w sobotę. Za tydzień ktoś go zerwie — pamiątka ma zostać na długo.',
  },
  {
    id: 'mural',
    x: 1530,
    y: 140,
    r: 44,
    form: 'mural',
    name: 'Mural na ścianie domu',
    note: 'Uczniowie z farbami w rękach i nauczycielka z książką. Mural namalowała młodzież z miejscowej szkoły w 2023 roku. Pamiątka nowa — a opowiada o dawnych czasach.',
  },
  {
    id: 'przystanek',
    x: 1720,
    y: 200,
    r: 30,
    form: null,
    name: 'Przystanek autobusowy',
    note: 'Przystanek przyda się w drodze do szkoły, ale nie opowiada o niczyim życiu.',
  },
];

export const FORM_COUNT = THINGS.filter((t) => t.form).length;

/** Kim była — dopiero po znalezieniu wszystkich czterech form. Postać wymyślona. */
export const WHO =
  'Helena Wierzbicka (postać wymyślona) uczyła w szkole w Zawidełkach przez prawie czterdzieści lat. W czasie II wojny światowej, gdy okupanci zakazali uczenia historii Polski i polskiej literatury, uczyła tego dzieci po kryjomu, w domach — choć groziło jej za to więzienie. Po wojnie założyła w miasteczku pierwszą bibliotekę.';

/** Przesunięcie widoku po przeciągnięciu — w granicach panoramy. */
export function clampPan(x: number, viewW: number): number {
  return Math.max(0, Math.min(PANORAMA_W - viewW, x));
}
