/**
 * Blok 1 — „Legenda z dwoma zakreślaczami” (źródło) — dane i sędzia, bez Reacta.
 *
 * Dziecko zakreśla fragmenty legendy dwoma kolorami: zielony = **da się
 * sprawdzić**, różowy = **zmyślone albo nie do sprawdzenia**. Potem wysuwa
 * szuflady z dowodami. **Rodzaj fragmentu nie jest kluczem autora** — wynika
 * z szuflad, które dziecko samo otwiera: fragment, który któraś szuflada
 * potwierdza, jest sprawdzalny; fragment, dla którego szuflada mówi „brak
 * śladu”, jest zmyślony; „nie wiadomo” przyjmujemy w obu kolorach.
 *
 * Fakty w szufladach (sprawdzone 2026-10-10):
 * - Smocza Jama — jaskinia w skale wzgórza wawelskiego; pierwszą wersję
 *   legendy spisał Wincenty Kadłubek ok. 1200 r. (synowie Kraka, bydło
 *   z siarką), szewc Skuba dopiero u Marcina Bielskiego (XVI w.) — pl/en
 *   Wikipedia „Smok wawelski”, „Smocza Jama”;
 * - Kopiec Krakusa rozkopany w latach 1934–1937, grobu nie znaleziono —
 *   Wikipedia „Kopiec Krakusa”; baza F-II.3-11 (prawdziwa jest smocza jama);
 * - Lech, Czech i Rus — po raz pierwszy w Kronice wielkopolskiej (XIII w.)
 *   i u Dalimila (1314) — Wikipedia „Lech, Czech i Rus”; baza F-II.T1-01…03;
 *   pochodzenie nazwy Gniezna od „gniazda” — prawdopodobne, niepewne
 *   (pułapka z karty lekcji).
 */

export type Marker = 'sprawdzalne' | 'zmyslone';
export type Evidence = 'jest' | 'brak' | 'niewiadomo';

export interface LegendFragment {
  id: string;
  text: string;
}

export interface Finding {
  frag: string;
  result: Evidence;
  /** Co dokładnie szuflada mówi o tym fragmencie — konkret do werdyktu. */
  note: string;
}

export interface Drawer {
  id: string;
  /** Napis na froncie szuflady. */
  label: string;
  /** Co leży w środku — jedno, dwa zdania. */
  inside: string;
  findings: Finding[];
}

export interface Legend {
  id: string;
  title: string;
  /** Zdanie nad tekstem. */
  intro: string;
  fragments: LegendFragment[];
  drawers: Drawer[];
}

export const SMOK: Legend = {
  id: 'smok',
  title: 'O smoku spod Wawelu',
  intro: 'Tak opowiada się ją dziś — naszymi słowami.',
  fragments: [
    { id: 's1', text: 'Dawno temu na wzgórzu Wawel nad Wisłą stał gród.' },
    { id: 's2', text: 'Rządził nim mądry książę Krak.' },
    { id: 's3', text: 'W jaskini pod wzgórzem' },
    { id: 's4', text: 'zamieszkał straszny smok.' },
    { id: 's5', text: 'Co tydzień pożerał owce i krowy mieszkańców.' },
    { id: 's6', text: 'Szewc Skuba wypchał barana siarką i podrzucił go pod jaskinię.' },
    { id: 's7', text: 'Smok pożarł barana, wypił pół Wisły i pękł.' },
    { id: 's8', text: 'Wisła płynie pod Wawelem do dziś,' },
    { id: 's9', text: 'a jaskinię nazywa się Smoczą Jamą.' },
  ],
  drawers: [
    {
      id: 'wzgorze',
      label: 'Wzgórze i rzeka',
      inside: 'Plan Krakowa i raport archeologów: na wzgórzu Wawel ponad tysiąc lat temu stał gród, a Wisła opływa wzgórze od zachodu i południa.',
      findings: [
        { frag: 's1', result: 'jest', note: 'archeolodzy znaleźli ślady grodu na Wawelu sprzed ponad tysiąca lat.' },
        { frag: 's8', result: 'jest', note: 'wystarczy spojrzeć na plan miasta albo stanąć nad rzeką.' },
      ],
    },
    {
      id: 'jaskinia',
      label: 'Jaskinia',
      inside: 'Zdjęcie i opis: w skale wzgórza jest prawdziwa jaskinia z korytarzami i komorami. Można do niej wejść, a na każdym planie Krakowa podpisano ją „Smocza Jama”.',
      findings: [
        { frag: 's3', result: 'jest', note: 'jaskinia naprawdę jest w skale wzgórza — można do niej wejść.' },
        { frag: 's9', result: 'jest', note: 'tak jest podpisana na planach miasta i tablicach — to da się zobaczyć.' },
      ],
    },
    {
      id: 'warstwy',
      label: 'Warstwy ziemi',
      inside: 'Wykopaliska na wzgórzu: kości krów, owiec i świń, garnki, narzędzia, monety. Kości owiec są — ale to resztki jedzenia mieszkańców. Kości smoka nie ma w żadnej warstwie.',
      findings: [
        { frag: 's4', result: 'brak', note: 'w żadnej warstwie ziemi na wzgórzu nie znaleziono kości smoka.' },
        { frag: 's5', result: 'brak', note: 'kości owiec i krów są, ale to resztki obiadów mieszkańców — żaden ślad nie mówi o smoku.' },
        { frag: 's7', result: 'brak', note: 'nie ma po nim ani kości, ani śladu — a rzeki nie wypije żadne zwierzę.' },
      ],
    },
    {
      id: 'kopiec',
      label: 'Kopiec Krakusa',
      inside: 'Na drugim brzegu Wisły stoi stary kopiec nazywany Kopcem Krakusa. W latach 1934–1937 archeolodzy go rozkopali. Grobu w środku nie znaleźli.',
      findings: [
        { frag: 's2', result: 'niewiadomo', note: 'kopiec stoi, ale grobu w nim nie ma — nie wiemy, czy Krak żył. Oba kolory są tu w porządku.' },
      ],
    },
    {
      id: 'kroniki',
      label: 'Stare kroniki',
      inside: 'Najstarszą wersję legendy spisał ok. 1200 roku kronikarz Wincenty Kadłubek. U niego smoka pokonują synowie Kraka. Szewc pojawia się dopiero w kronice z XVI wieku — prawie czterysta lat później.',
      findings: [
        { frag: 's6', result: 'brak', note: 'najstarsza kronika w ogóle nie zna szewca — dopisano go po prawie czterystu latach.' },
      ],
    },
  ],
};

export const LECH: Legend = {
  id: 'lech',
  title: 'O Lechu i białym orle',
  intro: 'Teraz sam/a. Ta sama metoda, bez podpowiedzi.',
  fragments: [
    { id: 'l1', text: 'Trzej bracia — Lech, Czech i Rus — wędrowali przez puszczę.' },
    { id: 'l2', text: 'Lech stanął na wzgórzu wśród jezior.' },
    { id: 'l3', text: 'Na starym dębie zobaczył gniazdo, a w nim białego orła na tle czerwonego nieba.' },
    { id: 'l4', text: 'Na wzgórzu stanął gród' },
    { id: 'l5', text: 'i nazwano go Gnieznem — od gniazda.' },
    { id: 'l6', text: 'Białego orła mamy w godle do dziś.' },
  ],
  drawers: [
    {
      id: 'wzgorze-lecha',
      label: 'Wzgórze w Gnieźnie',
      inside: 'Gniezno leży wśród jezior, a jego najwyższe wzgórze nazywa się Wzgórzem Lecha. Archeolodzy znaleźli na nim ślady grodu sprzed ponad tysiąca lat.',
      findings: [
        { frag: 'l2', result: 'jest', note: 'wzgórze i jeziora można zobaczyć w Gnieźnie do dziś.' },
        { frag: 'l4', result: 'jest', note: 'ślady grodu na wzgórzu odkopali archeolodzy.' },
      ],
    },
    {
      id: 'kroniki-lecha',
      label: 'Stare kroniki',
      inside: 'Pierwsi kronikarze Polski nic nie wiedzą o Lechu. Trzej bracia pojawiają się w kronikach dopiero w XIII wieku — kilkaset lat po tym, jak powstało państwo.',
      findings: [
        { frag: 'l1', result: 'brak', note: 'braci nie zna żaden kronikarz z wcześniejszych wieków — pojawiają się dopiero po kilkuset latach.' },
        { frag: 'l3', result: 'brak', note: 'nikt nie zostawił śladu tamtego dnia — orzeł w gnieździe to obraz z opowieści.' },
      ],
    },
    {
      id: 'godlo',
      label: 'Godło',
      inside: 'Pamiętasz pieczęcie z orłem? Biały orzeł w czerwonym polu jest w godle Polski — to opisuje ustawa.',
      findings: [
        { frag: 'l6', result: 'jest', note: 'godło można obejrzeć na każdej szkole i każdym urzędzie.' },
      ],
    },
    {
      id: 'slownik',
      label: 'Słownik',
      inside: 'Językoznawcy uważają, że nazwa Gniezno może pochodzić od słowa „gniazdo”. Ale pewności nie ma — są też inne wyjaśnienia.',
      findings: [
        { frag: 'l5', result: 'niewiadomo', note: 'to możliwe, ale nie pewne. Oba kolory są tu w porządku.' },
      ],
    },
  ],
};

export type Marks = Record<string, Marker | undefined>;

/** Co szuflady mówią o fragmencie (przy pierwszym znalezisku; fragment opisuje jedna szuflada). */
export function evidenceFor(legend: Legend, fragId: string): Finding | undefined {
  for (const d of legend.drawers) {
    const f = d.findings.find((x) => x.frag === fragId);
    if (f) return f;
  }
  return undefined;
}

/** Fragmenty, o których mówi otwarta szuflada (do stempli przy tekście). */
export function stampsFor(legend: Legend, opened: string[]): Record<string, Evidence> {
  const out: Record<string, Evidence> = {};
  for (const d of legend.drawers) {
    if (!opened.includes(d.id)) continue;
    for (const f of d.findings) out[f.frag] = f.result;
  }
  return out;
}

export interface MarkMiss {
  id: string;
  text: string;
  marked: Marker;
  drawer: string;
  note: string;
}

export interface MarksVerdict {
  ok: boolean;
  /** Zakreślenia, którym przeczą szuflady. */
  wrong: MarkMiss[];
  /** Fragmenty bez koloru. */
  unmarked: number;
}

/**
 * Zestawia zakreślenia dziecka z tym, co mówią szuflady. Zielony przy „brak
 * śladu” albo różowy przy „jest” to pomyłka — z notatką szuflady.
 */
export function judgeMarks(legend: Legend, marks: Marks): MarksVerdict {
  const wrong: MarkMiss[] = [];
  let unmarked = 0;
  for (const frag of legend.fragments) {
    const m = marks[frag.id];
    if (!m) {
      unmarked += 1;
      continue;
    }
    const drawer = legend.drawers.find((d) => d.findings.some((f) => f.frag === frag.id));
    const ev = evidenceFor(legend, frag.id);
    if (!ev || !drawer || ev.result === 'niewiadomo') continue;
    const expected: Marker = ev.result === 'jest' ? 'sprawdzalne' : 'zmyslone';
    if (m !== expected) wrong.push({ id: frag.id, text: frag.text, marked: m, drawer: drawer.label, note: ev.note });
  }
  return { ok: wrong.length === 0 && unmarked === 0, wrong, unmarked };
}

/** Każdy fragment ma swoją szufladę — sprawdzane w selfteście, żeby nie zgubić fragmentu bez dowodu. */
export function fragmentsWithoutEvidence(legend: Legend): string[] {
  return legend.fragments.filter((f) => !evidenceFor(legend, f.id)).map((f) => f.id);
}
