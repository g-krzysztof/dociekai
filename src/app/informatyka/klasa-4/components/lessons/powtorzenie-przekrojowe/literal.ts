import { count } from '../../../lib/plural';

/**
 * Dane i werdykty bloku „Dosłowniak” — trzy polecenia z trzech działów roku,
 * wszystkie o tym samym: **maszyna robi dokładnie to, co jej powiesz, a czego
 * nie powiesz, tam wstawia coś od siebie** (wartość domyślną).
 *
 * Moduł jest czysty (bez Reacta), żeby werdykty dało się przeliczyć w teście
 * bez przeglądarki. Liczby w `judge` są te same, które rysują sceny w
 * `literal-scenes.tsx` — dziecko ocenia wynik oczami, a strona tym samym
 * wzorem, więc nigdy się nie rozjadą.
 */

export type FieldValue = string | number;
/** To, co dziecko powiedziało samo — pola pominięte dostają wartość domyślną. */
export type Told = Record<string, FieldValue>;
export type Values = Record<string, FieldValue>;

interface FieldBase {
  id: string;
  label: string;
  /** Zdanie Dosłowniaka o tym, dlaczego wstawił to od siebie (pierwsza osoba). */
  why: string;
}

export interface SliderField extends FieldBase {
  kind: 'slider';
  min: number;
  max: number;
  step: number;
  fallback: number;
  format: (value: number) => string;
}

export interface ChipsField extends FieldBase {
  kind: 'chips';
  options: { id: string; label: string }[];
  fallback: string;
}

export type Field = SliderField | ChipsField;

export interface Verdict {
  ok: boolean;
  /** Po jednym wpisie na każdą pozycję listy „Chcesz, żeby…”. */
  wants: boolean[];
  /** Co maszyna zrobiła — zdania w pierwszej osobie. */
  did: string[];
  /** Zdania o tym, co się nie zgadza — bez podawania wartości do wpisania. */
  problems: string[];
  /** Pola, które za to odpowiadają. */
  broken: string[];
}

export type RoundId = 'kot' | 'napis' | 'plik';

export interface Round {
  id: RoundId;
  /** Numer działu (1–8), z którego pochodzi polecenie. */
  module: number;
  world: string;
  /** Polecenie tak, jak powiedziałby je człowiek. */
  say: string;
  wants: string[];
  fields: Field[];
  judge: (values: Values) => Verdict;
}

export function effective(round: Round, told: Told): Values {
  const values: Values = {};
  for (const field of round.fields) values[field.id] = told[field.id] ?? field.fallback;
  return values;
}

export const sameValues = (a: Values, b: Values) => Object.keys(a).every((key) => a[key] === b[key]);

/* ------------------------------------------------------------------ */
/* 1 · Scratch: kot i domek                                            */
/* ------------------------------------------------------------------ */

/** Kot ma 30 jednostek szerokości, domek zaczyna się w 240 — stąd okno 170–210. */
export const CAT = { width: 30, houseX: 240, reachedFrom: 170, clearTo: 210, world: 330 } as const;

const kot: Round = {
  id: 'kot',
  module: 6,
  world: 'Scratch',
  say: 'Przesuń kota trochę w prawo.',
  wants: ['Kot dotarł do domku', 'Kot stoi przed domkiem, a nie w jego ścianie'],
  fields: [
    {
      id: 'kroki',
      kind: 'slider',
      label: 'O ile kroków?',
      why: '„Trochę” nic mi nie mówi, więc wziąłem najmniej, co się da.',
      min: 0,
      max: 300,
      step: 5,
      fallback: 1,
      format: (value) => count(value, 'krok', 'kroki', 'kroków'),
    },
  ],
  judge: (values) => {
    const steps = values.kroki as number;
    const reached = steps >= CAT.reachedFrom;
    const clear = steps <= CAT.clearTo;
    const problems: string[] = [];
    if (!reached) {
      problems.push(
        steps < 40 ? 'Kot ledwo drgnął — do domku jest jeszcze daleko.' : 'Kot poszedł, ale do domku wciąż mu kawałek brakuje.'
      );
    }
    if (!clear) problems.push('Kot wszedł w ścianę domku — poszedł za daleko.');
    return {
      ok: reached && clear,
      wants: [reached, clear],
      did: [`Przesunąłem kota o ${count(steps, 'krok', 'kroki', 'kroków')} w prawo.`],
      problems,
      broken: reached && clear ? [] : ['kroki'],
    };
  },
};

/* ------------------------------------------------------------------ */
/* 2 · Grafika: napis na plakacie                                      */
/* ------------------------------------------------------------------ */

export const POSTER = {
  text: 'WITAJCIE!',
  width: 300,
  height: 150,
  /** Krój stałej szerokości: znak ma 0,6 wysokości, więc napis ma szerokość `chars × 0,6 × rozmiar`. */
  glyph: 0.6,
  /** Ile razy pomniejszony plakat oglądany z ostatniej ławki. */
  far: 0.3,
  /** Najmniejsza wysokość liter, którą z daleka da się jeszcze odczytać. */
  legible: 10,
  /** Napis szerszy niż to dotyka brzegów plakatu. */
  fitWidth: 280,
} as const;

/** Najmniejszy i największy rozmiar, przy którym napis jest czytelny i się mieści. */
export const POSTER_MIN = Math.ceil(POSTER.legible / POSTER.far);
export const POSTER_MAX = Math.floor(POSTER.fitWidth / (POSTER.text.length * POSTER.glyph));

const PLACE_TEXT: Record<string, string> = {
  gora: 'u góry, przy lewej krawędzi',
  srodek: 'na środku',
  dol: 'na dole, przy lewej krawędzi',
};

const napis: Round = {
  id: 'napis',
  module: 3,
  world: 'Grafika',
  say: 'Zrób napis większy i ładnie go ustaw.',
  wants: [
    'Z ostatniej ławki da się go przeczytać',
    'Napis mieści się na plakacie',
    'Napis stoi na środku plakatu',
  ],
  fields: [
    {
      id: 'rozmiar',
      kind: 'slider',
      label: 'Jakiej wielkości?',
      why: '„Większy” to dla mnie o jeden punkt więcej niż było.',
      min: 12,
      max: 100,
      step: 2,
      fallback: 13,
      format: (value) => `${value} pkt`,
    },
    {
      id: 'miejsce',
      kind: 'chips',
      label: 'Gdzie go postawić?',
      why: '„Ładnie” nic mi nie mówi, więc zostawiłem go tam, gdzie był.',
      options: [
        { id: 'gora', label: 'u góry, przy lewej krawędzi' },
        { id: 'srodek', label: 'na środku' },
        { id: 'dol', label: 'na dole, przy lewej krawędzi' },
      ],
      fallback: 'gora',
    },
  ],
  judge: (values) => {
    const size = values.rozmiar as number;
    const place = values.miejsce as string;
    const readable = size >= POSTER_MIN;
    const fits = size <= POSTER_MAX;
    const centred = place === 'srodek';
    const problems: string[] = [];
    if (!readable) problems.push('Z ostatniej ławki napis jest szarą plamką — nikt go nie przeczyta.');
    if (!fits) problems.push('Napis wychodzi poza plakat — brzegi go obcinają.');
    if (!centred) problems.push('Napis nie stoi na środku plakatu.');
    const broken = [...(readable && fits ? [] : ['rozmiar']), ...(centred ? [] : ['miejsce'])];
    return {
      ok: readable && fits && centred,
      wants: [readable, fits, centred],
      did: [`Ustawiłem napis na ${size} pkt ${PLACE_TEXT[place]}.`],
      problems,
      broken,
    };
  },
};

/* ------------------------------------------------------------------ */
/* 3 · Pliki: zapis zdjęcia                                            */
/* ------------------------------------------------------------------ */

export const MAIL_LIMIT_MB = 10;

const NAMES: Record<string, string> = { bez: 'Bez nazwy', img: 'IMG_4821', opis: 'wakacje-morze-2026' };
const FORMATS: Record<string, { ext: string; mb: number }> = {
  bmp: { ext: 'bmp', mb: 34 },
  png: { ext: 'png', mb: 12 },
  jpg: { ext: 'jpg', mb: 2.4 },
};
const FOLDERS: Record<string, string> = { pobrane: 'Pobrane', pulpit: 'Pulpit', wakacje: 'Obrazy › Wakacje' };

export interface SavedFile {
  name: string;
  folder: string;
  folderName: string;
  mb: number;
}

export function fileFrom(values: Values): SavedFile {
  const format = FORMATS[values.format as string];
  return {
    name: `${NAMES[values.nazwa as string]}.${format.ext}`,
    folder: values.folder as string,
    folderName: FOLDERS[values.folder as string],
    mb: format.mb,
  };
}

export const formatMb = (mb: number) => `${String(mb).replace('.', ',')} MB`;

const plik: Round = {
  id: 'plik',
  module: 1,
  world: 'Pliki',
  say: 'Zapisz to zdjęcie.',
  wants: [
    `Babcia dostanie zdjęcie mailem — załącznik może mieć najwyżej ${MAIL_LIMIT_MB} MB`,
    'Jutro znajdziesz je w folderze „Obrazy › Wakacje”',
    'Nazwa pliku mówi, co to za zdjęcie',
  ],
  fields: [
    {
      id: 'nazwa',
      kind: 'chips',
      label: 'Jak ma się nazywać?',
      why: 'Nie podałeś nazwy, więc nazwałem go „Bez nazwy”.',
      options: [
        { id: 'bez', label: 'Bez nazwy' },
        { id: 'img', label: 'IMG_4821' },
        { id: 'opis', label: 'wakacje-morze-2026' },
      ],
      fallback: 'bez',
    },
    {
      id: 'format',
      kind: 'chips',
      label: 'W jakim formacie?',
      why: 'Formatu też nie podałeś — zapisuję w BMP, bo tak mam ustawione.',
      options: [
        { id: 'bmp', label: 'BMP' },
        { id: 'png', label: 'PNG' },
        { id: 'jpg', label: 'JPG' },
      ],
      fallback: 'bmp',
    },
    {
      id: 'folder',
      kind: 'chips',
      label: 'Gdzie go położyć?',
      why: 'Miejsca nie podałeś, więc wrzuciłem go do „Pobrane”, jak wszystko.',
      options: [
        { id: 'pobrane', label: 'Pobrane' },
        { id: 'pulpit', label: 'Pulpit' },
        { id: 'wakacje', label: 'Obrazy › Wakacje' },
      ],
      fallback: 'pobrane',
    },
  ],
  judge: (values) => {
    const file = fileFrom(values);
    const small = file.mb <= MAIL_LIMIT_MB;
    const home = values.folder === 'wakacje';
    const named = values.nazwa === 'opis';
    const problems: string[] = [];
    if (!small) problems.push(`Załącznik ma ${formatMb(file.mb)} — poczta babci go nie przyjmie.`);
    if (!home) problems.push(`Plik leży w „${file.folderName}”, a nie w folderze „Obrazy › Wakacje”.`);
    if (!named) problems.push(`Nazwa „${file.name}” nic nie mówi o tym, co jest na zdjęciu.`);
    return {
      ok: small && home && named,
      wants: [small, home, named],
      did: [`Zapisałem plik „${file.name}” w folderze „${file.folderName}” i dołączyłem go do maila (${formatMb(file.mb)}).`],
      problems,
      broken: [...(named ? [] : ['nazwa']), ...(small ? [] : ['format']), ...(home ? [] : ['folder'])],
    };
  },
};

export const ROUNDS: Round[] = [kot, napis, plik];

/** Zdanie całej lekcji — dziecko dochodzi do niego samo, po trzech poleceniach. */
export const SENTENCE = {
  color: '#ca8a04',
  lead: 'Zdanie roku',
  text: 'Komputer robi dokładnie to, co mu powiesz — dlatego najpierw pomyśl, a na końcu sprawdź, czy wyszło to, o co ci chodziło.',
} as const;
