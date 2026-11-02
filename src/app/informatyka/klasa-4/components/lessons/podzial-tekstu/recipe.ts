/**
 * Wspólne dane lekcji o podziale tekstu — **jeden dokument na cztery bloki**.
 *
 * Wszystkie widżety tej lekcji pracują na tym samym przepisie na koktajl
 * truskawkowy, bo dokładnie ten przepis dziecko napisze za chwilę samo w
 * zadaniu obowiązkowym **Z-10**. Dzięki temu każdy blok jest próbą generalną
 * innego podpunktu zadania: `OutlineBuilder` — podziału na etapy i ich
 * zatytułowania, `TitleTest` — sensowności tych tytułów, `StepShuffle` —
 * kolejności kroków. `GreenOnly` trzyma własne tokeny, bo potrzebuje słów wraz z
 * ich miejscem w zdaniu — to samo słowo raz jest tam przedmiotem, a raz miarą.
 *
 * Przepis jest tu też **pierwszym w kursie tekstem, który da się wykonać**:
 * kroki mają warunki wstępne (`needs`) i skutki (`gives`), więc `StepShuffle`
 * naprawdę sprawdza, czy da się je wykonać w podanej kolejności, zamiast
 * porównywać z jedną zapisaną odpowiedzią. To jest most do modułu 5
 * („przepis to algorytm”), zapowiedziany w programie kursu.
 */

/** Rola bloku w dokumencie — z niej wynika, jaki styl jest poprawny. */
export type BlockRole = 'tytul' | 'naglowek' | 'tekst';

export interface DocBlock {
  id: string;
  text: string;
  role: BlockRole;
  /** Do którego etapu należy ten blok (indeks nagłówka), `-1` dla wstępu. */
  section: number;
}

export const DOC: DocBlock[] = [
  { id: 'tytul', text: 'Przepis na koktajl truskawkowy', role: 'tytul', section: -1 },
  {
    id: 'wstep',
    text: 'Koktajl robi się w kwadrans, a wychodzą z niego dwie duże szklanki.',
    role: 'tekst',
    section: -1,
  },
  { id: 'h1', text: 'Czego potrzebujesz', role: 'naglowek', section: 0 },
  {
    id: 'p1',
    text: 'Składniki: truskawki, banan, jogurt naturalny i łyżeczka miodu.',
    role: 'tekst',
    section: 0,
  },
  {
    id: 'p2',
    text: 'Przedmioty: blender, nóż, deska do krojenia i dwie szklanki.',
    role: 'tekst',
    section: 0,
  },
  { id: 'h2', text: 'Przygotowanie owoców', role: 'naglowek', section: 1 },
  {
    id: 'p3',
    text: 'Umyj truskawki pod zimną wodą i odetnij im szypułki.',
    role: 'tekst',
    section: 1,
  },
  {
    id: 'p4',
    text: 'Obierz banana i pokrój go nożem na desce na grube plastry.',
    role: 'tekst',
    section: 1,
  },
  { id: 'h3', text: 'Miksowanie i podanie', role: 'naglowek', section: 2 },
  {
    id: 'p5',
    text: 'Wrzuć owoce do blendera, dolej jogurt z miodem i miksuj pół minuty.',
    role: 'tekst',
    section: 2,
  },
  {
    id: 'p6',
    text: 'Przelej koktajl do dwóch szklanek i wypij, zanim osiądzie piana.',
    role: 'tekst',
    section: 2,
  },
];

/* ── Przepis jako algorytm ────────────────────────────────────────────────── */

export interface Step {
  id: string;
  text: string;
  /** Co musi już być zrobione, żeby ten krok dało się wykonać. */
  needs: string[];
  /** Co ten krok zmienia w świecie. */
  gives: string[];
  /** Zdanie, którym maszyna tłumaczy, dlaczego się zatrzymała. */
  blocked: string;
}

/**
 * Kroki w kolejności, w jakiej dziecko je dostaje — **celowo pomieszanej**.
 * Poprawnych kolejności jest więcej niż jedna (mycie truskawek i obieranie
 * banana są niezależne), więc sprawdzamy wykonalność, nie zgodność z wzorcem.
 */
export const STEPS: Step[] = [
  {
    id: 'miksuj',
    text: 'Miksuj pół minuty',
    needs: ['w-blenderze'],
    gives: ['zmiksowane'],
    blocked: 'Włączasz blender… a w środku jest pusto. Nie ma czego miksować.',
  },
  {
    id: 'umyj',
    text: 'Umyj truskawki i odetnij szypułki',
    needs: [],
    gives: ['truskawki-gotowe'],
    blocked: '',
  },
  {
    id: 'przelej',
    text: 'Przelej koktajl do szklanek',
    needs: ['zmiksowane'],
    gives: ['podane'],
    blocked: 'Przechylasz blender nad szklankami… i nic z niego nie leci.',
  },
  {
    id: 'wrzuc',
    text: 'Wrzuć owoce i jogurt do blendera',
    needs: ['truskawki-gotowe', 'banan-gotowy'],
    gives: ['w-blenderze'],
    blocked:
      'Sięgasz po owoce, ale truskawki są jeszcze z szypułkami albo banan w skórce. Do blendera tak nie wrzucisz.',
  },
  {
    id: 'obierz',
    text: 'Obierz banana i pokrój na plastry',
    needs: [],
    gives: ['banan-gotowy'],
    blocked: '',
  },
];

export interface RunResult {
  /** Indeks kroku, na którym przepis się zaciął; `-1` gdy przeszedł cały. */
  failedAt: number;
  message: string;
}

/**
 * Wykonuje przepis krok po kroku, dokładnie w podanej kolejności. To jest cała
 * różnica między tą lekcją a listą do zapamiętania: maszyna **naprawdę próbuje**
 * i zatrzymuje się na pierwszym kroku, którego nie da się zrobić.
 */
export function runRecipe(order: Step[]): RunResult {
  const world = new Set<string>();
  for (let i = 0; i < order.length; i += 1) {
    const step = order[i];
    const missing = step.needs.filter((need) => !world.has(need));
    if (missing.length > 0) return { failedAt: i, message: step.blocked };
    step.gives.forEach((token) => world.add(token));
  }
  return {
    failedAt: -1,
    message: 'Koktajl gotowy. Każdy krok dało się wykonać w tej kolejności, w jakiej go ustawiłeś/ustawiłaś.',
  };
}
