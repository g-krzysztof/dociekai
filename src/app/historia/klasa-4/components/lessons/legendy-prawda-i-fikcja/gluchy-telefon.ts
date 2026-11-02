/**
 * Blok 3 — „Głuchy telefon wieków” (symulator) — dane i sędzia, bez Reacta.
 *
 * Wymyślone zdarzenie w wymyślonych Zawidełkach (miasteczko z L13): młynarz
 * ostrzegł miasto przed powodzią. Opowieść przechodzi przez kolejnych
 * opowiadaczy i sama się zmienia. Dziecko przy każdym pokoleniu stuka to,
 * czego nie było w poprzedniej wersji.
 *
 * **Co jest „nowe”, nie jest kluczem autora** — wynika z porównania tekstów:
 * kawałek jest nowy, gdy w poprzedniej wersji nie było kawałka o tym samym
 * brzmieniu (`newChunks`). Kawałki niezmienione mają identyczny tekst.
 * „Kamienie” (`STONES`) to słowa obecne w każdej wersji — sprawdzane
 * w selfteście, nie wpisywane na wiarę.
 */

export interface Generation {
  who: string;
  when: string;
  chunks: string[];
}

export const GENERATIONS: Generation[] = [
  {
    who: 'Sąsiadka, która to widziała',
    when: '1412',
    chunks: [
      'Wiosną',
      'młynarz Bartosz',
      'zobaczył, że woda w strumieniu szybko rośnie.',
      'Pobiegł na rynek',
      'i krzyczał, żeby ludzie uciekali na wzgórze.',
      'Woda zalała dolne ulice miasta,',
      'ale nikt nie zginął.',
    ],
  },
  {
    who: 'Jej syn',
    when: 'ok. 1440',
    chunks: [
      'W nocy',
      'młynarz Bartosz',
      'usłyszał, jak strumień ryczy.',
      'Pobiegł na rynek',
      'i zbudził całe miasto.',
      'Woda zabrała pół miasta,',
      'ale nikt nie zginął.',
    ],
  },
  {
    who: 'Wnuczka',
    when: 'ok. 1480',
    chunks: [
      'W nocy',
      'dzielny Bartosz',
      'usłyszał, jak coś ryczy w strumieniu.',
      'Chwycił siekierę',
      'i zbudził całe miasto.',
      'Rano woda opadła,',
      'a ludzie mówili, że Bartosz ją przegonił.',
    ],
  },
  {
    who: 'Prawnuk',
    when: 'ok. 1520',
    chunks: [
      'W nocy',
      'rycerz Bartosz',
      'zobaczył w rzece potwora, który wylewał wodę na miasto.',
      'Chwycił siekierę',
      'i walczył z nim do świtu.',
      'Rano woda opadła,',
      'a potwór uciekł.',
    ],
  },
  {
    who: 'Praprawnuczka',
    when: 'ok. 1560',
    chunks: [
      'Dawno temu',
      'rycerz Bartosz',
      'spotkał smoka, który mieszkał w rzece i zalewał miasto wodą z paszczy.',
      'Przebił go mieczem',
      'i walczył z nim do świtu.',
      'Od tamtej pory',
      'rzekę nazywa się Smoczanką.',
    ],
  },
  {
    who: 'Babcia przy piecu',
    when: 'dziś',
    chunks: [
      'Dawno temu',
      'rycerz Bartosz',
      'spotkał smoka, który mieszkał w rzece i zalewał miasto wodą z paszczy.',
      'Przebił go złotym mieczem',
      'po trzech dniach i trzech nocach walki.',
      'Od tamtej pory',
      'rzekę nazywa się Smoczanką, a w Zawidełkach co roku pali się ognisko na pamiątkę.',
    ],
  },
];

/** Kamienie wystające z rzeki: rdzeń słowa, który przetrwał każdą wersję — i co znaczył na początku. */
export const STONES: { stem: string; label: string }[] = [
  { stem: 'bartosz', label: 'prawdziwy człowiek o imieniu Bartosz' },
  { stem: 'miast', label: 'to samo miasto' },
  { stem: 'wod', label: 'woda, która zalewała ulice' },
];

/** Indeksy kawałków wersji `g`, których nie było w wersji `g − 1`. */
export function newChunks(g: number): number[] {
  if (g <= 0) return [];
  const prev = new Set(GENERATIONS[g - 1].chunks);
  return GENERATIONS[g].chunks.map((c, i) => (prev.has(c) ? -1 : i)).filter((i) => i >= 0);
}

export interface DiffVerdict {
  ok: boolean;
  /** Stuknięte, a były już wcześniej. */
  notNew: number[];
  /** Ile nowości jeszcze nie stuknięto. */
  missed: number;
}

export function judgeDiff(g: number, tapped: number[]): DiffVerdict {
  const fresh = new Set(newChunks(g));
  const notNew = tapped.filter((i) => !fresh.has(i));
  const missed = [...fresh].filter((i) => !tapped.includes(i)).length;
  return { ok: notNew.length === 0 && missed === 0, notNew, missed };
}

/** Czy rdzeń występuje w danej wersji (selftest: w każdej). */
export function hasStem(g: number, stem: string): boolean {
  return GENERATIONS[g].chunks.join(' ').toLowerCase().includes(stem.toLowerCase());
}
