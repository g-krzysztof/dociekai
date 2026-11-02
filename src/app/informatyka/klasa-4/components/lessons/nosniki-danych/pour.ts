import { DISC_IDS, MEDIA, type Medium } from './media-capacity';

/**
 * Czysta logika zadania **Z-1** w wersji „w lekcji”: dyskietki do wyboru,
 * rachunek „ile dyskietek wejdzie na płytę” i notatka do uzupełnienia wraz z
 * jej sprawdzeniem. Widżet (`floppy-pour.tsx`) tylko to rysuje.
 *
 * Wszystkie liczby, które dziecko ma wpisać albo rozpoznać, wynikają z JEGO
 * wyboru dyskietek — notatka buduje się dla pary, którą wybrało, więc nie ma
 * jednej „dobrej odpowiedzi do ściągnięcia”.
 */

export type FloppyId = 'd525' | 'd35' | 'd35ed';

export interface Floppy {
  id: FloppyId;
  name: string;
  /** Nazwa do wstawiania w zdania: „3,5″”. */
  short: string;
  mb: number;
  capacityLabel: string;
  /** Skąd wiadomo, ile mieści — z dwóch źródeł bloku `SourceScan`. */
  source: string;
  /** Format obudowy: 5,25″ jest większa, obie 3,5″ są tej samej wielkości. */
  body: '525' | '35';
}

/** Posortowane rosnąco po pojemności — kolejność kolumn i zdań w notatce z tego wynika. */
export const FLOPPIES: Floppy[] = [
  {
    id: 'd525',
    name: 'Dyskietka 5,25″',
    short: '5,25″',
    mb: 1.2,
    capacityLabel: '1,2 MB',
    source: 'wg źródła B',
    body: '525',
  },
  {
    id: 'd35',
    name: 'Dyskietka 3,5″',
    short: '3,5″',
    mb: 1.44,
    capacityLabel: '1,44 MB',
    source: 'wg źródeł A i B',
    body: '35',
  },
  {
    id: 'd35ed',
    name: 'Dyskietka 3,5″ ED',
    short: '3,5″ ED',
    mb: 2.88,
    capacityLabel: '2,88 MB',
    source: 'wg źródła B',
    body: '35',
  },
];

export type DiscId = (typeof DISC_IDS)[number];

export const DISCS: (Medium & { id: DiscId; short: string })[] = DISC_IDS.map((id) => ({
  ...MEDIA.find((medium) => medium.id === id)!,
  id,
  short: id === 'bd' ? 'Blu-ray' : id.toUpperCase(),
}));

/** Ile całych dyskietek mieści płyta. Epsilon chroni przed 486,0000001 → 485. */
export const floppiesOn = (discMb: number, floppyMb: number): number =>
  Math.floor(discMb / floppyMb + 1e-9);

/** Grubość dyskietki 3,5″ — do ciekawostki o stosie. Grubości 5,25″ źródła nie podają zgodnie, więc jej nie używamy. */
export const FLOPPY_35_MM = 3.3;

export const PHOTO_MB = 4;

/* ── Sypanie ──────────────────────────────────────────────────────────────── */

/**
 * Jak długo trzeba trzymać przycisk, żeby płyta się zapełniła. Większa płyta
 * trzyma dłużej — ale nie proporcjonalnie, bo Blu-ray po 70 sekundach nikogo
 * by już nie cieszył.
 */
export const FILL_MS: Record<DiscId, number> = { cd: 1800, dvd: 2800, bd: 4000 };

/**
 * Wypełnienie płyty po `ms` trzymania. Potęga sprawia, że na początku widać
 * pojedyncze dyskietki (1, 2, 3…), a potem licznik zaczyna pędzić — i właśnie
 * to przyspieszenie jest obrazem różnicy rzędów wielkości.
 */
export function fillAfter(disc: DiscId, ms: number): number {
  const exponent = disc === 'cd' ? 3 : 4;
  return Math.min(1, (Math.max(0, ms) / FILL_MS[disc]) ** exponent);
}

export function floppiesAt(disc: DiscId, fill: number, floppy: Floppy): number {
  const total = floppiesOn(DISCS.find((item) => item.id === disc)!.mb, floppy.mb);
  return fill >= 1 ? total : Math.min(total, Math.floor(fill * total));
}

/* ── Notatka ──────────────────────────────────────────────────────────────── */

export type Slot =
  | { kind: 'number'; id: string; disc: DiscId; floppy: Floppy; expected: number }
  | { kind: 'choice'; id: string; options: string[]; correct: number }
  | { kind: 'text'; id: string };

export interface NoteLine {
  id: string;
  /** Tekst z lukami. Zdanie „wpisane za dziecko” nie ma żadnej luki. */
  parts: (string | Slot)[];
}

export type Answers = Record<string, string | number | undefined>;

const MAGNITUDES = ['kilkadziesiąt', 'kilkaset', 'kilka tysięcy'];

function magnitude(value: number): number {
  if (value < 100) return 0;
  if (value < 1000) return 1;
  return 2;
}

/**
 * Notatka dla wybranej pary. `small` mieści mniej (więc trzeba jej więcej
 * sztuk), `big` — więcej. Zdanie o DVD bierze zawsze `small`: dla każdej pary
 * wychodzi wtedy 3263 albo 3916, czyli uczciwe „kilka tysięcy”.
 */
export function buildNote(pair: [Floppy, Floppy]): NoteLine[] {
  const [small, big] = [...pair].sort((a, b) => a.mb - b.mb);
  const dvd = floppiesOn(4700, small.mb);

  return [
    {
      id: 'para',
      parts: [
        `Porównuję dyskietki ${small.short} (${small.capacityLabel}) i ${big.short} (${big.capacityLabel}).`,
      ],
    },
    {
      id: 'cd',
      parts: [
        'Na jedną płytę CD zmieści się około ',
        { kind: 'number', id: 'cd', disc: 'cd', floppy: big, expected: floppiesOn(700, big.mb) },
        ` dyskietek ${big.short}.`,
      ],
    },
    {
      id: 'dvd',
      parts: [
        'Płyta DVD to ',
        { kind: 'choice', id: 'dvd', options: MAGNITUDES, correct: magnitude(dvd) },
        ` dyskietek ${small.short}.`,
      ],
    },
    {
      id: 'bd',
      parts: [
        'Na płytę Blu-ray weszło aż ',
        {
          kind: 'number',
          id: 'bd',
          disc: 'bd',
          floppy: small,
          expected: floppiesOn(25_000, small.mb),
        },
        ` dyskietek ${small.short}.`,
      ],
    },
    {
      id: 'porownanie',
      parts: [
        `Dyskietek ${small.short} trzeba zawsze `,
        { kind: 'choice', id: 'wiecej', options: ['więcej', 'mniej'], correct: 0 },
        ` niż ${big.short}, bo jedna mieści `,
        { kind: 'choice', id: 'miesci', options: ['więcej', 'mniej'], correct: 1 },
        '.',
      ],
    },
    {
      id: 'zdjecie',
      parts: [
        `Jedno zdjęcie z telefonu (ok. ${PHOTO_MB} MB) `,
        { kind: 'choice', id: 'zdjecie', options: ['zmieści się', 'nie zmieści się'], correct: 1 },
        ` nawet na dyskietce ${big.short}.`,
      ],
    },
    {
      id: 'wlasne',
      parts: [{ kind: 'text', id: 'wlasne' }],
    },
  ];
}

/** Liczba wpisana przez dziecko: „486”, „ok. 500”, „20 833”, „20.833”. */
export function readNumber(raw: string): number | null {
  const joined = raw.replace(/(\d)[\s .](?=\d{3}(?!\d))/g, '$1');
  const match = joined.match(/\d+(?:,\d+)?/);
  if (!match) return null;
  const value = Number(match[0].replace(',', '.'));
  return Number.isFinite(value) ? value : null;
}

const near = (value: number, target: number, share: number) =>
  Math.abs(value - target) <= Math.max(1, target * share);

export interface LineVerdict {
  ok: boolean;
  hint?: string;
}

const pl = (value: number) => value.toLocaleString('pl-PL');

const discShort = (id: DiscId) => DISCS.find((disc) => disc.id === id)!.short;

function judgeSlot(slot: Slot, answers: Answers, pair: [Floppy, Floppy]): LineVerdict {
  const answer = answers[slot.id];

  if (slot.kind === 'text') {
    const words = String(answer ?? '').match(/\p{L}{2,}/gu) ?? [];
    return words.length >= 3
      ? { ok: true }
      : {
          ok: false,
          hint: 'Dopisz tu jedno pełne zdanie od siebie — co cię zdziwiło albo co zauważasz.',
        };
  }

  if (slot.kind === 'choice') {
    if (answer === undefined) return { ok: false, hint: 'Stuknij kropki, żeby wybrać słowo.' };
    if (answer === slot.correct) return { ok: true };
    if (slot.id === 'dvd') {
      return {
        ok: false,
        hint: 'Zajrzyj do pomiaru DVD i policz cyfry: dwie cyfry to kilkadziesiąt, trzy — kilkaset, cztery — kilka tysięcy.',
      };
    }
    if (slot.id === 'zdjecie') {
      const big = [...pair].sort((a, b) => b.mb - a.mb)[0];
      return {
        ok: false,
        hint: `Zdjęcie ma ok. ${PHOTO_MB} MB, a dyskietka ${big.short} tylko ${big.capacityLabel}. Co jest większe?`,
      };
    }
    return {
      ok: false,
      hint: 'Porównaj dwie kolumny w swoich pomiarach: przy której dyskietce liczby są większe?',
    };
  }

  const value = readNumber(String(answer ?? ''));
  if (value === null) return { ok: false, hint: 'Wpisz liczbę z twoich pomiarów.' };
  if (near(value, slot.expected, 0.05)) return { ok: true };

  /* Liczba z innej kratki tabeli to najczęstsza pomyłka — nazwijmy, z której. */
  for (const disc of DISCS) {
    for (const floppy of pair) {
      if (disc.id === slot.disc && floppy.id === slot.floppy.id) continue;
      if (near(value, floppiesOn(disc.mb, floppy.mb), 0.02)) {
        return {
          ok: false,
          hint: `To wynik z innej kratki: ${disc.short} i dyskietka ${floppy.short}. Tu chodzi o ${discShort(slot.disc)} i dyskietkę ${slot.floppy.short}.`,
        };
      }
    }
  }
  return {
    ok: false,
    hint: `Nie zgadza się z pomiarem. Zajrzyj do tabeli: wiersz ${discShort(slot.disc)}, kolumna ${slot.floppy.short}.`,
  };
}

/** Werdykt dla całego punktu: pierwsza luka, która się nie zgadza, mówi, co poprawić. */
export function judgeLine(line: NoteLine, answers: Answers, pair: [Floppy, Floppy]): LineVerdict {
  for (const part of line.parts) {
    if (typeof part === 'string') continue;
    const verdict = judgeSlot(part, answers, pair);
    if (!verdict.ok) return verdict;
  }
  return { ok: true };
}

/** Notatka jako zwykły tekst — do zapisania w pliku `.txt`. */
export function noteAsText(lines: NoteLine[], answers: Answers): string {
  const body = lines.map((line) => {
    const text = line.parts
      .map((part) => {
        if (typeof part === 'string') return part;
        const answer = answers[part.id];
        if (part.kind === 'choice') return typeof answer === 'number' ? part.options[answer] : '…';
        return String(answer ?? '').trim();
      })
      .join('');
    return `- ${text}`;
  });
  return ['Nośniki danych — moje spostrzeżenia', '', ...body, ''].join('\r\n');
}

export { pl };
