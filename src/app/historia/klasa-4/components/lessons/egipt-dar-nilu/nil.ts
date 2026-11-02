/**
 * L19 — Egipt darem Nilu: czysta logika i sędziowie czterech bloków (bez Reacta).
 *
 * Fakty z bazy: F-III.3-01 (państwo ok. 3000 p.n.e.), -05 (wylew i muł), -06 (kanały),
 * -08/-09 (Dolny i Górny Egipt), -10 (oazy), -11…-16 (społeczeństwo), -17 (Menes),
 * -21 (Herodot o rolniku). Spoza bazy (z komentarzem przy danych): trzy pory roku
 * (Achet, Peret, Szemu), skala nilometru Pliniusza Starszego, wizyta Herodota.
 */

// ─── Blok 1: rok nad Nilem ───────────────────────────────────────────────

/** Miesiąc roku nad Nilem liczony od lipca (0) — wtedy rusza wylew. */
export const MONTHS = ['lip', 'sie', 'wrz', 'paź', 'lis', 'gru', 'sty', 'lut', 'mar', 'kwi', 'maj', 'cze'];

/**
 * Trzy pory roku Egipcjan, po cztery miesiące: Achet (wylew), Peret (wyjście
 * ziemi spod wody — siew i wzrost), Szemu (żniwa i niska woda). Przybliżenie
 * do naszych miesięcy — kalendarz egipski przesuwał się względem pór roku.
 */
export const SEASONS = [
  { id: 'achet', name: 'Achet', what: 'wylew', from: 0 },
  { id: 'peret', name: 'Peret', what: 'siew i wzrost', from: 4 },
  { id: 'szemu', name: 'Szemu', what: 'żniwa', from: 8 },
] as const;

export function seasonAt(t: number) {
  const m = ((t % 12) + 12) % 12;
  return m >= 8 ? SEASONS[2] : m >= 4 ? SEASONS[1] : SEASONS[0];
}

/** Głębokość wody na polu (0–1) w chwili t (miesiące od lipca). */
export function waterOnField(t: number): number {
  if (t < 0.5 || t >= 4) return 0;
  if (t < 2.5) return (t - 0.5) / 2;
  return 1 - (t - 2.5) / 1.5;
}

/** Wilgotność mułu po zejściu wody (1 = mokry czarny muł, 0 = spękany). */
export function mudWetness(t: number): number {
  if (t < 4) return t < 0.5 ? 0 : 1;
  if (t <= 5.5) return 1;
  return Math.max(0, 1 - (t - 5.5) / 1);
}

export const SOW_FROM = 4;
export const SOW_TO = 5.5;

export type SowVerdict = 'przed-wylewem' | 'pod-woda' | 'w-pore' | 'za-pozno';

export function judgeSowing(t: number): SowVerdict {
  if (t < 0.5) return 'przed-wylewem';
  if (t < SOW_FROM) return 'pod-woda';
  if (t <= SOW_TO) return 'w-pore';
  return 'za-pozno';
}

export const SOW_TEXT: Record<SowVerdict, string> = {
  'przed-wylewem':
    'Ziemia była twarda i sucha, a za kilka tygodni przyszła woda — i zabrała ziarno ze sobą. Za wcześnie.',
  'pod-woda': 'Pole było pod wodą — ziarno spłynęło z nurtem. Trzeba poczekać, aż woda zejdzie.',
  'w-pore':
    'W samą porę! Woda zeszła, a muł był jeszcze mokry i czarny. Ziarno wykiełkowało, a w porze Szemu przyszły żniwa.',
  'za-pozno':
    'Za późno — muł wysechł na skorupę i popękał. Ziarno leży na twardej ziemi i nie kiełkuje.',
};

/**
 * Skala nilometru w łokciach (łokieć ≈ pół metra). Pola leżą na tarasach coraz
 * wyżej nad rzeką, wioska — na wzniesieniu. Wysokości dobrane tak, żeby wynik
 * zgadzał się ze skalą zapisaną przez Pliniusza Starszego (Historia naturalna
 * V 58: 12 łokci — głód, 13 — bieda, 14 — radość, 15 — spokój, 16 — obfitość).
 */
export const FIELD_HEIGHTS = [12.5, 13.3, 13.8, 15.5];
export const VILLAGE_HEIGHT = 17;
export const SCALE_MIN = 10;
export const SCALE_MAX = 20;

/** Trzy lata do odczytu — w tej kolejności. */
export const FLOOD_YEARS = [16, 12, 18];

export type YearKind = 'glod' | 'bieda' | 'dobry' | 'zalanie';

export interface FloodOutcome {
  level: number;
  fields: number;
  village: boolean;
  kind: YearKind;
}

export function floodOutcome(level: number): FloodOutcome {
  const fields = FIELD_HEIGHTS.filter((h) => h <= level).length;
  const village = level >= VILLAGE_HEIGHT;
  const kind: YearKind = village ? 'zalanie' : fields === 0 ? 'glod' : fields < 3 ? 'bieda' : 'dobry';
  return { level, fields, village, kind };
}

/** Odczyt nilometru: kreska dziecka najwyżej pół łokcia od linii wody. */
export function judgeReading(marker: number, level: number): boolean {
  return Math.abs(marker - level) <= 0.5;
}

export type RuleLabel = 'glod' | 'dobry' | 'zalanie';

export const RULE_LABELS: { id: RuleLabel; text: string }[] = [
  { id: 'zalanie', text: 'zalane wioski' },
  { id: 'glod', text: 'głód' },
  { id: 'dobry', text: 'dobry rok' },
];

/**
 * Tabliczka na schodku nilometru — sędzią jest ten sam mechanizm, który dziecko
 * oglądało (ile pól dostało wodę, czy woda doszła do wioski), nie klucz autora.
 */
export function judgeRuleLabel(label: RuleLabel, level: number): { ok: boolean; why?: string } {
  const o = floodOutcome(level);
  if (o.kind === label) return { ok: true };
  const pola = o.fields === 1 ? '1 pole' : `${o.fields} ${o.fields >= 2 && o.fields <= 4 ? 'pola' : 'pól'}`;
  if (o.kind === 'bieda')
    return {
      ok: false,
      why: `Przy ${level} łokciach woda dochodzi do ${o.fields === 1 ? 'jednego pola' : `${pola}`} z ${FIELD_HEIGHTS.length} — to jeszcze nie ${label === 'glod' ? 'głód' : 'dobry rok'}, raczej chudy rok.`,
    };
  if (o.kind === 'glod') return { ok: false, why: `Przy ${level} łokciach woda nie dochodzi do żadnego pola.` };
  if (o.kind === 'dobry')
    return {
      ok: false,
      why: `Przy ${level} łokciach woda dochodzi do ${pola} z ${FIELD_HEIGHTS.length} i nie sięga wioski (${VILLAGE_HEIGHT} łokci) — to dobry rok.`,
    };
  return { ok: false, why: `Przy ${level} łokciach woda wchodzi już do wioski — domy z cegły mułowej rozmakają.` };
}

// ─── Blok 2: zielona wstęga ──────────────────────────────────────────────

export type Cell = '.' | 'd' | 'v' | 'D' | 'f' | '1' | '2' | '3' | '4' | '5';

export interface FloodGrid {
  cols: number;
  rows: number;
  cell: number;
  at: (c: number, r: number) => Cell;
}

export function makeGrid(rows: string[], cell: number): FloodGrid {
  const cols = rows[0]?.length ?? 0;
  return {
    cols,
    rows: rows.length,
    cell,
    at: (c, r) => (r < 0 || r >= rows.length || c < 0 || c >= cols ? '.' : (rows[r][c] as Cell)),
  };
}

export const isRiverCell = (k: Cell) => k === 'v' || k === 'D' || k === 'f';
export const isOasisCell = (k: Cell) => k >= '1' && k <= '5';

/**
 * Pociągnięcie pędzla w punkcie (x, y) układu mapy. Komórki wylewu dotknięte
 * pędzlem rozlewają farbę dalej po swojej wstędze (do `spread` px od palca),
 * oaza zielenieje cała. Pustynia farby nie przyjmuje — zwracamy ją osobno,
 * żeby widżet mógł pokazać, jak piasek „wypija” kolor.
 */
export function brush(
  grid: FloodGrid,
  painted: ReadonlySet<number>,
  x: number,
  y: number,
  radius: number,
  spread = 45
): { wet: number[]; dry: number[] } {
  const { cell, cols } = grid;
  const wet = new Set<number>();
  const dry: number[] = [];
  const seeds: number[] = [];
  const c0 = Math.floor((x - radius) / cell);
  const c1 = Math.floor((x + radius) / cell);
  const r0 = Math.floor((y - radius) / cell);
  const r1 = Math.floor((y + radius) / cell);
  for (let r = r0; r <= r1; r++)
    for (let c = c0; c <= c1; c++) {
      const cx = (c + 0.5) * cell;
      const cy = (r + 0.5) * cell;
      if (Math.hypot(cx - x, cy - y) > radius) continue;
      const k = grid.at(c, r);
      if (k === '.') continue;
      const id = r * cols + c;
      if (k === 'd') dry.push(id);
      else seeds.push(id);
    }
  // Rozlewanie: BFS po komórkach tego samego rodzaju wody (dolina+delta+Fajum albo jedna oaza).
  const queue = [...seeds];
  for (const s of seeds) wet.add(s);
  while (queue.length) {
    const id = queue.shift()!;
    const c = id % cols;
    const r = Math.floor(id / cols);
    const k = grid.at(c, r);
    for (const [dc, dr] of [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
      [1, 1],
      [-1, -1],
      [1, -1],
      [-1, 1],
    ]) {
      const nc = c + dc;
      const nr = r + dr;
      const nk = grid.at(nc, nr);
      const nid = nr * cols + nc;
      if (wet.has(nid)) continue;
      const same = isOasisCell(k) ? nk === k : isRiverCell(nk);
      if (!same) continue;
      if (!isOasisCell(k) && Math.hypot((nc + 0.5) * cell - x, (nr + 0.5) * cell - y) > spread) continue;
      wet.add(nid);
      queue.push(nid);
    }
  }
  return { wet: [...wet].filter((id) => !painted.has(id)), dry };
}

export interface FloodStats {
  /** Udział pomalowanej doliny, delty i Fajum (0–1). */
  river: number;
  /** Ile oaz (1–5) już zieleni się choć w połowie. */
  oases: string[];
  /** Pomalowane komórki jako procent całego lądu na mapie. */
  greenOfLand: number;
}

export function floodStats(grid: FloodGrid, painted: ReadonlySet<number>): FloodStats {
  let river = 0;
  let riverPainted = 0;
  let land = 0;
  let green = 0;
  const oasisAll: Record<string, number> = {};
  const oasisPainted: Record<string, number> = {};
  for (let r = 0; r < grid.rows; r++)
    for (let c = 0; c < grid.cols; c++) {
      const k = grid.at(c, r);
      if (k === '.') continue;
      land++;
      const p = painted.has(r * grid.cols + c);
      if (p) green++;
      if (isRiverCell(k)) {
        river++;
        if (p) riverPainted++;
      } else if (isOasisCell(k)) {
        oasisAll[k] = (oasisAll[k] ?? 0) + 1;
        if (p) oasisPainted[k] = (oasisPainted[k] ?? 0) + 1;
      }
    }
  const oases = Object.keys(oasisAll).filter((k) => (oasisPainted[k] ?? 0) * 2 >= oasisAll[k]);
  return {
    river: river ? riverPainted / river : 0,
    oases: oases.sort(),
    greenOfLand: land ? (green / land) * 100 : 0,
  };
}

export const RIVER_GOAL = 0.9;
export const OASES_GOAL = 2;

/** Dolny i Górny Egipt: nazwy od biegu rzeki, a Nil płynie z południa na północ. */
export type HalfLabel = 'dolny' | 'gorny';
export type Half = 'polnoc' | 'poludnie';

export function judgeHalf(label: HalfLabel, half: Half): { ok: boolean; why?: string } {
  const good = label === 'dolny' ? 'polnoc' : 'poludnie';
  if (half === good) return { ok: true };
  return {
    ok: false,
    why:
      label === 'dolny'
        ? 'Na mapie to „dół”, ale nie dla rzeki. Zobacz, w którą stronę płyną fale — „dolny” znaczy bliżej ujścia, jak dolny bieg rzeki.'
        : 'Górny bieg rzeki jest tam, skąd woda przypływa. Zobacz, w którą stronę płyną fale.',
  };
}

// ─── Blok 3: dokąd płynie zboże ──────────────────────────────────────────

/**
 * Opowieść podpisana jako rekonstrukcja: liczby worków są wymyślone, ale
 * kierunek przepływu (podatek do spichlerzy faraona, część dla świątyń, ziarno
 * na siew) zgadza się z tym, co wiemy z papirusów i scen z grobowców.
 */
export type StopId = 'faraon' | 'swiatynia' | 'siew';

export interface GrainStop {
  id: StopId;
  who: string;
  says: string;
  /** Kto z tego żyje — zapala się na piramidzie społecznej. */
  feeds: LevelId[];
  good: number;
  bad: number;
}

export type LevelId = 'faraon' | 'kaplani' | 'urzednicy' | 'zolnierze' | 'rzemieslnicy' | 'chlopi' | 'niewolnicy';

export const PYRAMID: { id: LevelId; name: string }[] = [
  { id: 'faraon', name: 'faraon' },
  { id: 'kaplani', name: 'kapłani' },
  { id: 'urzednicy', name: 'urzędnicy i pisarze' },
  { id: 'zolnierze', name: 'żołnierze' },
  { id: 'rzemieslnicy', name: 'rzemieślnicy i kupcy' },
  { id: 'chlopi', name: 'chłopi' },
  { id: 'niewolnicy', name: 'niewolnicy' },
];

export const STOPS: GrainStop[] = [
  {
    id: 'faraon',
    who: 'Spichlerz faraona',
    says: 'Należy się faraonowi. Z jego spichlerza chleb dostaną urzędnicy, żołnierze i robotnicy przy budowach.',
    feeds: ['faraon', 'urzednicy', 'zolnierze', 'rzemieslnicy'],
    good: 5,
    bad: 2,
  },
  {
    id: 'swiatynia',
    who: 'Świątynia',
    says: 'Dla świątyni boga. Z tego żyją kapłani.',
    feeds: ['kaplani'],
    good: 2,
    bad: 1,
  },
  {
    id: 'siew',
    who: 'Ziarno na siew',
    says: 'Tego nie wolno zjeść — za rok trzeba będzie znowu zasiać pole.',
    feeds: ['chlopi'],
    good: 3,
    bad: 3,
  },
];

export const HARVEST = { good: 20, bad: 8 };
/** Tyle worków rodzina Ipiego zjada od żniw do żniw (w tej opowieści). */
export const FAMILY_NEEDS = 8;

export function leftAfter(year: 'good' | 'bad', upTo: number): number {
  let left = HARVEST[year];
  for (let i = 0; i < upTo; i++) left -= STOPS[i][year];
  return left;
}

export function judgeScoop(
  scooped: number,
  stop: GrainStop,
  year: 'good' | 'bad'
): { ok: boolean; why?: string } {
  const due = stop[year];
  if (scooped === due) return { ok: true };
  if (scooped > due)
    return {
      ok: false,
      why: `Za dużo — pisarz zapisał ${due}, a ty odsypujesz ${scooped}. Ipi straciłby ${scooped - due} ${scooped - due === 1 ? 'worek' : 'worki'} za darmo.`,
    };
  return { ok: false, why: `Za mało — pisarz zapisał ${due}. Policz jeszcze raz.` };
}

// ─── Blok 4: Herodot ─────────────────────────────────────────────────────

/**
 * Herodot, Dzieje II 14 — omówienie własnymi słowami (nie cytat z przekładu).
 * Herodot pisze o rolnikach z okolic poniżej Memfis, czyli z delty.
 */
export type HerodotId = 'trud' | 'orac' | 'rzeka' | 'czeka';

export const HERODOT: { id: HerodotId; text: string }[] = [
  { id: 'trud', text: 'Tamtejsi rolnicy zbierają plony z mniejszym trudem niż wszyscy inni ludzie.' },
  { id: 'orac', text: 'Nie muszą orać pługiem ani kopać motyką.' },
  { id: 'rzeka', text: 'Rzeka sama przychodzi i nawadnia im pola.' },
  { id: 'czeka', text: 'Kiedy woda odpłynie, każdy obsiewa pole i spokojnie czeka na żniwa.' },
];

export type NoteId = 'siew' | 'glod' | 'zalanie' | 'kanaly' | 'podatek';

export interface LessonNote {
  id: NoteId;
  from: string;
  text: string;
  /** Zdania Herodota, które ta notatka podważa — po słowach, które powtarza. */
  against: HerodotId[];
}

export const NOTES: LessonNote[] = [
  {
    id: 'siew',
    from: 'Rok nad Nilem',
    text: 'Siew trzeba trafić w kilka tygodni: za wcześnie woda zabiera ziarno, za późno muł wysycha.',
    against: ['czeka', 'trud'],
  },
  {
    id: 'glod',
    from: 'Nilometr',
    text: 'Przy 12 łokciach rzeka nie przyszła do żadnego pola — był głód.',
    against: ['rzeka', 'trud'],
  },
  {
    id: 'zalanie',
    from: 'Nilometr',
    text: 'Przy 18 łokciach woda weszła do wioski i rozmoczyła domy.',
    against: ['trud', 'czeka'],
  },
  {
    id: 'kanaly',
    from: 'Zielona wstęga',
    text: 'Dalej od rzeki woda sama nie dochodzi — trzeba kopać kanały i sypać groble.',
    against: ['orac', 'rzeka', 'trud'],
  },
  {
    id: 'podatek',
    from: 'Dokąd płynie zboże',
    text: 'Z 20 worków Ipi oddał 7 — faraonowi i świątyni.',
    against: [],
  },
];

/** Półka na notatki, o których Herodot w ogóle nie pisze. */
export const SILENT = 'milczy';

export function judgeNote(note: NoteId, target: HerodotId | typeof SILENT): { ok: boolean; why?: string } {
  const n = NOTES.find((x) => x.id === note)!;
  if (target === SILENT) {
    if (n.against.length === 0) return { ok: true };
    return { ok: false, why: 'Herodot o tym pisze — poszukaj zdania, któremu ta notatka przeczy.' };
  }
  if (n.against.includes(target)) return { ok: true };
  if (n.against.length === 0)
    return {
      ok: false,
      why: 'To zdanie nie mówi nic o podatkach. Herodot o oddawaniu zboża w ogóle nie pisze — to też jest ważne.',
    };
  return { ok: false, why: 'Ta notatka nie przeczy temu zdaniu. Przeczytaj, o czym ono mówi.' };
}

/**
 * Gdzie i kiedy Herodot ma rację. Zamiast paszportu z faktami, których dziecko
 * nie miało skąd wziąć: dziecko ustawia poziom Nilu i stawia Herodota przy
 * jednym z pól, a każde zdanie źródła sędziuje ten sam mechanizm co nilometr
 * (`floodOutcome`) i wstęga (za groblą woda sama nie dochodzi).
 */
export type SpotId = 'brzeg' | 'taras' | 'grobla';

export const SPOTS: { id: SpotId; name: string; height: number | null }[] = [
  { id: 'brzeg', name: 'pole nad samym brzegiem', height: FIELD_HEIGHTS[0] },
  { id: 'taras', name: 'pole na najwyższym tarasie', height: FIELD_HEIGHTS[FIELD_HEIGHTS.length - 1] },
  { id: 'grobla', name: 'pole za groblą, daleko od rzeki', height: null },
];

/** Suwak Nilu — wioska (17) mieści się w zakresie, grobla (19,5) nie. */
export const CHECK_MIN = 11;
export const CHECK_MAX = 19;

export function judgeHerodotAt(id: HerodotId, level: number, spot: SpotId): { ok: boolean; why?: string } {
  const s = SPOTS.find((x) => x.id === spot)!;
  const o = floodOutcome(level);
  const reached = s.height !== null && level >= s.height;
  const notReached =
    s.height === null
      ? 'Za groblą woda sama nie dochodzi — trzeba kopać kanał.'
      : `Woda stanęła na ${level} łokciach, a to pole leży na ${s.height} — nie doszła.`;
  switch (id) {
    case 'rzeka':
      return reached ? { ok: true } : { ok: false, why: notReached };
    case 'orac':
      return reached
        ? { ok: true }
        : { ok: false, why: 'Bez wylewu nie ma miękkiego mułu — twardą ziemię trzeba skopać motyką.' };
    case 'trud':
      if (o.kind === 'dobry') return { ok: true };
      if (o.kind === 'zalanie') return { ok: false, why: 'Woda w wiosce — ludzie ratują domy, to nie jest lekki rok.' };
      return { ok: false, why: `Przy ${level} łokciach wodę dostaje ${o.fields} z ${FIELD_HEIGHTS.length} pól — w kraju jest bieda.` };
    case 'czeka':
      if (o.village) return { ok: false, why: 'Woda weszła do wioski — nikt spokojnie nie czeka, wszyscy ratują domy.' };
      return reached ? { ok: true } : { ok: false, why: 'Na to pole woda nie przyszła — nie ma czego obsiać.' };
  }
}

/** Ile z lat odczytanych na nilometrze (`FLOOD_YEARS`) dawało Herodotowi rację nad samym brzegiem. */
export function herodotYears(): number[] {
  return FLOOD_YEARS.filter((l) => HERODOT.every((h) => judgeHerodotAt(h.id, l, 'brzeg').ok));
}
