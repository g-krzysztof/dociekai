/**
 * L13, blok 1 — „Miasteczko, które mówi”. Modelowe, **wymyślone** miasteczko
 * Zawidełki (jawnie podpisane w lekcji; żadnych przykładów z podręcznika).
 *
 * Dziecko stuka trop na planie (zbliżenie mówi, co widać), a potem odkłada go:
 * na kolumnę wieku osi miasteczka — gdy trop mówi KIEDY — albo na półkę
 * „co tu było” — gdy mówi tylko CO. Sędzia nie zna klucza autora: wiek liczy
 * z daty na tropie (reguła kciuka z L7), a dla rynku z reguły w zbliżeniu
 * (prostokątny rynek = lokacja w XIII–XIV w., F-II.3-06). Z każdego
 * przyjętego tropu zostaje reguła, której dziecko użyje we wsi (blok 4).
 */

/** Kolumny osi miasteczka: wieki XIII…XXI. */
export const CENTURIES = [13, 14, 15, 16, 17, 18, 19, 20, 21] as const;
export type Century = (typeof CENTURIES)[number];

/** Cel upuszczenia: wiek albo półka „co tu było”. */
export type Slot = Century | 'co';

export type RuleId = 'nazwa-budowla' | 'nazwa-zawod' | 'ksztalt' | 'data' | 'budynek' | 'pamiec';

export interface Rule {
  id: RuleId;
  /** Rodzaj śladu — kryterium zadania we wsi: budynek, nazwa, pamiątka. */
  group: 'budynek' | 'nazwa' | 'pamiatka' | 'plac';
  short: string;
  text: string;
}

export const RULES: Record<RuleId, Rule> = {
  'nazwa-budowla': {
    id: 'nazwa-budowla',
    group: 'nazwa',
    short: 'Nazwa od budowli',
    text: 'Ulica nazwana od budowli → ta budowla kiedyś tu stała, nawet jeśli dziś jej nie widać.',
  },
  'nazwa-zawod': {
    id: 'nazwa-zawod',
    group: 'nazwa',
    short: 'Nazwa od zawodu',
    text: 'Ulica nazwana od zawodu → kiedyś pracowali tu ludzie tego zawodu.',
  },
  ksztalt: {
    id: 'ksztalt',
    group: 'plac',
    short: 'Kształt placu',
    text: 'Prostokątny rynek, z ulicami wychodzącymi z rogów → miasto założone według planu w średniowieczu.',
  },
  data: {
    id: 'data',
    group: 'pamiatka',
    short: 'Data na pamiątce',
    text: 'Data wykuta na pomniku albo budynku → kiedy coś się stało albo zostało zbudowane; napis obok mówi, dlaczego.',
  },
  budynek: {
    id: 'budynek',
    group: 'budynek',
    short: 'Budynek i jego praca',
    text: 'Budynek mówi, czym żyli ludzie albo co przyszło do miejscowości (dworzec = kolej, młyn = mąka ze zboża).',
  },
  pamiec: {
    id: 'pamiec',
    group: 'pamiatka',
    short: 'Imię na pamiątce',
    text: 'Imię na pomniku, ulicy, tablicy albo muralu → ktoś, kogo mieszkańcy chcą pamiętać. Pamiątka bywa nowa, a opowiada o dawnych czasach.',
  },
};

export type TraceId = 'rynek' | 'zamkowa' | 'mlynska' | 'garbarska' | 'kolumna' | 'dworzec' | 'mural';

export interface Trace {
  id: TraceId;
  label: string;
  /** Co widać w zbliżeniu — jedyne źródło odpowiedzi. */
  zoom: string;
  /** Rok wypisany na tropie (o czym trop mówi) — wiek liczy sędzia. */
  year?: number;
  /** Dopuszczalne wieki z reguły (rynek). */
  ruleCenturies?: Century[];
  /** Trop mówi tylko, CO tu było. */
  whatOnly?: boolean;
  rule: RuleId;
  /** Co plan „przypomina sobie” po przyjęciu tropu. */
  remembers: string;
}

export const TRACES: Trace[] = [
  {
    id: 'rynek',
    label: 'Rynek',
    zoom:
      'Rynek to prawie idealny prostokąt, a ulice wychodzą z jego rogów pod kątem prostym. Taki plan rysowano, gdy miasto zakładano od nowa, na pustym miejscu — w Polsce najczęściej w XIII i XIV wieku.',
    ruleCenturies: [13, 14],
    rule: 'ksztalt',
    remembers: 'Miasteczko założono według planu w średniowieczu.',
  },
  {
    id: 'zamkowa',
    label: 'ul. Zamkowa',
    zoom:
      'Ulica pnie się na wzgórze. Zamku nie ma — w trawie stoją tylko resztki murów. Kiedy go zbudowano i kiedy zniknął? Nazwa ulicy tego nie mówi.',
    whatOnly: true,
    rule: 'nazwa-budowla',
    remembers: 'Na wzgórzu stał zamek.',
  },
  {
    id: 'mlynska',
    label: 'ul. Młyńska',
    zoom:
      'Ulica schodzi do strumienia i tam się kończy. Młyna nie widać — w wodzie leży tylko kilka obrobionych kamieni. Na żadnym nie ma daty.',
    whatOnly: true,
    rule: 'nazwa-budowla',
    remembers: 'Nad strumieniem kręciło się koło młyna.',
  },
  {
    id: 'garbarska',
    label: 'ul. Garbarska',
    zoom:
      'Garbarz zamieniał skóry zwierząt w skórę na buty, pasy i siodła. Potrzebował dużo wody — i ta ulica biegnie wzdłuż strumienia. Daty nigdzie nie ma.',
    whatOnly: true,
    rule: 'nazwa-zawod',
    remembers: 'Nad wodą pracowali garbarze.',
  },
  {
    id: 'kolumna',
    label: 'Kolumna na rynku',
    zoom: 'Na cokole kamiennej kolumny wykuto rok 1710 i słowa: „za ocalenie od zarazy”.',
    year: 1710,
    rule: 'data',
    remembers: 'W 1710 roku zaraza ominęła miasteczko — mieszkańcy podziękowali kolumną.',
  },
  {
    id: 'dworzec',
    label: 'Dworzec',
    zoom: 'Nad wejściem ceglanego dworca widać rok 1885. Od tego roku do miasteczka przyjeżdżał pociąg.',
    year: 1885,
    rule: 'budynek',
    remembers: 'W 1885 roku dotarła tu kolej.',
  },
  {
    id: 'mural',
    label: 'Mural z lotnikiem',
    zoom:
      'Mural namalowano w 2021 roku. Pokazuje lotnika, który urodził się w miasteczku i w 1940 roku walczył w obronie Wielkiej Brytanii. Na oś miasteczka kładziemy to, o czym ślad opowiada.',
    year: 1940,
    rule: 'pamiec',
    remembers: 'W 1940 roku lotnik z miasteczka walczył nad Anglią.',
  },
];

export function getTrace(id: TraceId): Trace {
  return TRACES.find((t) => t.id === id)!;
}

/** Wiek roku n.e. — reguła kciuka z L7 (1900 → XIX, 1901 → XX). */
export function centuryOf(year: number): number {
  return Math.ceil(year / 100);
}

const ROMAN: Record<number, string> = {
  13: 'XIII', 14: 'XIV', 15: 'XV', 16: 'XVI', 17: 'XVII', 18: 'XVIII', 19: 'XIX', 20: 'XX', 21: 'XXI',
};
export const roman = (c: number) => ROMAN[c] ?? String(c);

export type PlaceVerdict = { ok: true } | { ok: false; note: string };

/** Sędzia jednego upuszczenia. */
export function judgePlace(t: Trace, slot: Slot): PlaceVerdict {
  if (t.whatOnly) {
    if (slot === 'co') return { ok: true };
    return {
      ok: false,
      note: `${t.label} mówi, CO tu było, ale nie mówi KIEDY — na tropie nie ma żadnej daty. Odłóż go na półkę „Co tu było”.`,
    };
  }
  if (slot === 'co') {
    return {
      ok: false,
      note:
        t.year !== undefined
          ? `Na tym tropie jest rok ${t.year} — on mówi, KIEDY. Połóż go na osi, na kolumnie jego wieku.`
          : `${t.label} to nie nazwa, tylko kształt — a zbliżenie mówi, w których wiekach rysowano takie place. Połóż go na osi.`,
    };
  }
  if (t.ruleCenturies) {
    if (t.ruleCenturies.includes(slot)) return { ok: true };
    return {
      ok: false,
      note: `${roman(slot)} wiek? Zbliżenie mówi, że prostokątne rynki rysowano w XIII i XIV wieku. Przesuń go tam.`,
    };
  }
  const c = centuryOf(t.year!);
  if (slot === c) return { ok: true };
  const last2 = t.year! % 100;
  const head = Math.floor(t.year! / 100);
  const thumb =
    last2 === 0
      ? `zasłoń dwie ostatnie cyfry — zostaje ${head}, a końcówka to 00, więc wiek ${roman(head)}`
      : `zasłoń dwie ostatnie cyfry — zostaje ${head}, końcówka nie jest 00, więc dodaj jeden: wiek ${roman(c)}`;
  const extra = t.id === 'mural' && slot === 21 ? ' Mural jest nowy, ale opowiada o 1940 roku — liczy się to, o czym mówi.' : '';
  return { ok: false, note: `Rok ${t.year}: ${thumb}.${extra}` };
}

export type Placement = Partial<Record<TraceId, Slot>>;

/** Wszystkie tropy leżą na dobrych miejscach. */
export function allPlaced(p: Placement): boolean {
  return TRACES.every((t) => {
    const s = p[t.id];
    return s !== undefined && judgePlace(t, s).ok;
  });
}

/** Reguły zebrane z przyjętych tropów — bez powtórzeń, w kolejności tropów. */
export function earnedRules(p: Placement): RuleId[] {
  const out: RuleId[] = [];
  for (const t of TRACES) {
    const s = p[t.id];
    if (s !== undefined && judgePlace(t, s).ok && !out.includes(t.rule)) out.push(t.rule);
  }
  return out;
}
