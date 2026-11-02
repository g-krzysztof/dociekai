/**
 * Blok 3 L4 — „Łańcuch miasteczka”: dane i sędziowie, bez Reacta.
 *
 * Kroniczka **wymyślonego** miasteczka nad rzeką (oznaczone w treści). Każda
 * karta ma rok i jedno zdanie, które mówi, *dlaczego* to się stało — więc
 * strzałkę przyczyna → skutek dziecko wywodzi z tekstu karty, a nie zgaduje
 * klucz autora. Dwie reguły, obie jawne:
 *
 *  1. **czas** — strzałka pod prąd czasu (od późniejszej karty do wcześniejszej)
 *     jest odrzucana od razu: skutek nie może zdarzyć się przed przyczyną;
 *  2. **tekst** — strzałka w przód, której nie potwierdza zdanie karty-skutku,
 *     jest wskazana przy sprawdzeniu z odesłaniem do tego zdania.
 *
 * Każda karta poza pierwszą ma dokładnie jedną przyczynę w kronice. Jarmark ma
 * trzy skutki, a most jest naraz skutkiem i przyczyną — puenta bloku.
 */

export interface TownCard {
  id: string;
  year: number;
  title: string;
  /** Zdanie kroniki — w nim jest „dlaczego”. */
  text: string;
  /** Id karty, którą zdanie podaje jako przyczynę (brak — pierwsza karta). */
  cause?: string;
  /** Fragment zdania, który wskazuje przyczynę — podświetlany w odrzucie. */
  causeHint?: string;
}

export const TOWN_CARDS: TownCard[] = [
  {
    id: 'powodz',
    year: 1298,
    title: 'Powódź',
    text: 'Wiosenna powódź porwała jedyny prom. Całe lato nikt nie mógł przeprawić się przez rzekę.',
  },
  {
    id: 'most',
    year: 1310,
    title: 'Most',
    text: 'Mieszczanie, którzy po powodzi zostali bez przeprawy, zbudowali most na dębowych palach — taki, którego woda nie porwie.',
    cause: 'powodz',
    causeHint: 'po powodzi zostali bez przeprawy',
  },
  {
    id: 'jarmark',
    year: 1324,
    title: 'Jarmark',
    text: 'Odkąd po moście można przejść suchą nogą, kupcy z obu brzegów zjeżdżają co tydzień na plac przy rzece.',
    cause: 'most',
    causeHint: 'po moście można przejść suchą nogą',
  },
  {
    id: 'droga',
    year: 1337,
    title: 'Kamienna droga',
    text: 'Wozy kupców jadących na jarmark grzęzły w błocie, więc wyłożono drogę do miasta kamieniem.',
    cause: 'jarmark',
    causeHint: 'kupców jadących na jarmark',
  },
  {
    id: 'spichlerz',
    year: 1342,
    title: 'Spichlerz',
    text: 'Na jarmarku sprzedaje się tyle zboża, że trzeba było postawić spichlerz, żeby przechować je do zimy.',
    cause: 'jarmark',
    causeHint: 'Na jarmarku sprzedaje się tyle zboża',
  },
  {
    id: 'szkola',
    year: 1368,
    title: 'Szkoła',
    text: 'Kupcy, którzy wzbogacili się na jarmarku, chcieli, żeby ich dzieci umiały pisać i liczyć — przy kościele otwarto szkołę.',
    cause: 'jarmark',
    causeHint: 'wzbogacili się na jarmarku',
  },
];

export interface Arrow {
  from: string;
  to: string;
}

export function cardById(id: string): TownCard | undefined {
  return TOWN_CARDS.find((c) => c.id === id);
}

export type DrawVerdict =
  | { ok: true }
  | { ok: false; reason: 'ta-sama' | 'pod-prad' | 'juz-jest'; message: string };

/** Sędzia rysowania — działa od razu, przy puszczeniu strzałki. Tylko reguła czasu. */
export function judgeDraw(arrow: Arrow, existing: Arrow[]): DrawVerdict {
  if (arrow.from === arrow.to) return { ok: false, reason: 'ta-sama', message: 'Strzałka musi prowadzić do innej karty.' };
  const a = cardById(arrow.from);
  const b = cardById(arrow.to);
  if (!a || !b) return { ok: false, reason: 'ta-sama', message: 'Nie ma takiej karty.' };
  if (existing.some((x) => x.from === arrow.from && x.to === arrow.to)) {
    return { ok: false, reason: 'juz-jest', message: 'Ta strzałka już jest.' };
  }
  if (b.year <= a.year) {
    return {
      ok: false,
      reason: 'pod-prad',
      message: `„${b.title}” (${b.year}) to wcześniej niż „${a.title}” (${a.year}). Skutek nie może zdarzyć się przed przyczyną — strzałka nie płynie pod prąd czasu.`,
    };
  }
  return { ok: true };
}

export interface ChainVerdict {
  ok: boolean;
  /** Strzałki w przód, których nie potwierdza zdanie karty-skutku. */
  unsupported: { arrow: Arrow; hint: string; cardTitle: string }[];
  /** Karty (poza pierwszą) bez strzałki wchodzącej. */
  withoutCause: TownCard[];
}

/** Sędzia całości — przy „Sprawdź łańcuch”. */
export function judgeChain(arrows: Arrow[]): ChainVerdict {
  const unsupported = arrows
    .filter((a) => cardById(a.to)?.cause !== a.from)
    .map((a) => {
      const to = cardById(a.to)!;
      return { arrow: a, hint: to.causeHint ?? '', cardTitle: to.title };
    });
  const withoutCause = TOWN_CARDS.filter(
    (c) => c.cause && !arrows.some((a) => a.to === c.id && a.from === c.cause)
  );
  return { ok: unsupported.length === 0 && withoutCause.length === 0, unsupported, withoutCause };
}

export type Role = 'tylko-przyczyna' | 'skutek-i-przyczyna' | 'tylko-skutek';

/** Rola każdej karty — liczona ze strzałek dziecka. */
export function roles(arrows: Arrow[]): Record<string, Role> {
  const out: Record<string, Role> = {};
  for (const c of TOWN_CARDS) {
    const isEffect = arrows.some((a) => a.to === c.id);
    const isCause = arrows.some((a) => a.from === c.id);
    out[c.id] = isEffect && isCause ? 'skutek-i-przyczyna' : isCause ? 'tylko-przyczyna' : 'tylko-skutek';
  }
  return out;
}
