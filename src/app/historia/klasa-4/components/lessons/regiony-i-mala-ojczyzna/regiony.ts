import { REGION_SHAPES, type RegionId } from '../../hist-map/geo-regiony';

/**
 * Dane i sędziowie L12 — słowa z geografią (haczyk) i układanka regionów (mapa).
 *
 * Fakty o regionach: baza F-II.2-09…17, F-II.2-22. Spoza bazy (komentarz przy
 * zdaniu): unia lubelska 1569, Ziemia Lubuska w Brandenburgii od XIII w. do 1945,
 * Łódź przemysłowa od lat 20. XIX w., Śląsk w Koronie Czeskiej od XIV w., potem
 * w monarchii Habsburgów i od 1742 w Prusach, czarnoziemy kujawskie i solanki
 * Inowrocławia i Ciechocinka, meczety tatarskie w Kruszynianach i Bohonikach.
 */

export { REGION_SHAPES, type RegionId };

export const ALL_REGIONS: RegionId[] = REGION_SHAPES.map((r) => r.id);

export function regionName(id: RegionId): string {
  return REGION_SHAPES.find((r) => r.id === id)!.name;
}

// ─── Haczyk: „Na dwór czy na pole?” ─────────────────────────────────────────

export interface WordOption {
  id: string;
  word: string;
  /** Gdzie tak się mówi (w uproszczeniu do kawałków mapy). */
  where: RegionId[];
  /** Jedno zdanie po wybraniu. */
  note: string;
}

export interface WordQuestion {
  id: string;
  prompt: string;
  options: WordOption[];
}

/**
 * Regionalizmy: na pole / na dwór i pyry / kartofle — baza F-II.2-07; szneka —
 * Pomorze i Kujawy (Gdańsk, Bydgoszcz, Toruń: „szneka z glancem”); borówka
 * w znaczeniu czarnej jagody — Małopolska i Śląsk (NCK, „Ojczysty — dodaj do
 * ulubionych”: „BORÓWKI czy JAGODY”). Granice gwar nie biegną po granicach
 * regionów — lekcja mówi o tym wprost.
 */
export const WORD_QUESTIONS: WordQuestion[] = [
  {
    id: 'dwor',
    prompt: 'Po lekcjach wychodzisz pobawić się przed dom. Wychodzisz…',
    options: [
      {
        id: 'na-dwor',
        word: 'na dwór',
        where: ALL_REGIONS.filter((r) => r !== 'malopolska'),
        note: 'Tak mówi większość Polski. Dawniej „dwór” to było podwórze przed domem.',
      },
      {
        id: 'na-pole',
        word: 'na pole',
        where: ['malopolska'],
        note: 'Tak mówi się w Krakowie, Rzeszowie i okolicach. Dla nich „na dwór” brzmi dziwnie — i odwrotnie.',
      },
    ],
  },
  {
    id: 'ziemniaki',
    prompt: 'Na obiad są kotlet, surówka i…',
    options: [
      {
        id: 'ziemniaki',
        word: 'ziemniaki',
        where: ALL_REGIONS,
        note: 'To słowo rozumieją wszyscy w Polsce — jest w każdej książce kucharskiej.',
      },
      {
        id: 'kartofle',
        word: 'kartofle',
        where: ['slask', 'malopolska', 'ziemia-lodzka', 'mazowsze', 'lubelszczyzna'],
        note: '„Kartofel” przyszedł z języka niemieckiego. Słychać go na południu i w środku Polski.',
      },
      {
        id: 'pyry',
        word: 'pyry',
        where: ['wielkopolska'],
        note: 'Pyry jedzą w Poznaniu i całej Wielkopolsce — a pyry z gzikiem to tamtejsze danie.',
      },
    ],
  },
  {
    id: 'szneka',
    prompt: 'W piekarni kupujesz słodką bułkę z kruszonką. Prosisz o…',
    options: [
      {
        id: 'drozdzowka',
        word: 'drożdżówkę',
        where: ALL_REGIONS,
        note: 'Tak powiesz w każdej piekarni w Polsce.',
      },
      {
        id: 'szneka',
        word: 'sznekę',
        where: ['pomorze', 'kujawy'],
        note: 'W Gdańsku, Bydgoszczy i Toruniu kupuje się „sznekę z glancem” — bułkę z lukrem.',
      },
    ],
  },
  {
    id: 'jagody',
    prompt: 'W lesie zbierasz małe granatowe owoce, od których robi się fioletowy język. To…',
    options: [
      {
        id: 'jagody',
        word: 'jagody',
        where: ALL_REGIONS.filter((r) => r !== 'malopolska' && r !== 'slask'),
        note: 'Tak mówi Mazowsze i większość kraju.',
      },
      {
        id: 'borowki',
        word: 'borówki',
        where: ['malopolska', 'slask'],
        note: 'Na południu to borówki. A na Mazowszu „borówka” to zupełnie inny, czerwony owoc!',
      },
    ],
  },
];

/** Kawałki mapy, w których mówi się tak jak dziecko we wszystkich odpowiedziach. */
export function speakLikeYou(chosen: Record<string, string>): RegionId[] {
  let left = new Set<RegionId>(ALL_REGIONS);
  for (const q of WORD_QUESTIONS) {
    const opt = q.options.find((o) => o.id === chosen[q.id]);
    if (!opt) continue;
    left = new Set(opt.where.filter((r) => left.has(r)));
  }
  return ALL_REGIONS.filter((r) => left.has(r));
}

/** Czy któraś odpowiedź zawęża mapę (czyli dziecko użyło choć jednego regionalizmu)? */
export function narrowed(chosen: Record<string, string>): boolean {
  return speakLikeYou(chosen).length < ALL_REGIONS.length;
}

// ─── Układanka: co ukształtowało region ─────────────────────────────────────

export type ReasonId = 'granice' | 'krajobraz' | 'sasiedzi' | 'stolica';

export const REASONS: { id: ReasonId; title: string; short: string }[] = [
  { id: 'granice', title: 'Długo w granicach innego państwa', short: 'inne państwo' },
  { id: 'krajobraz', title: 'Krajobraz i to, z czego się żyło', short: 'z czego się żyło' },
  { id: 'sasiedzi', title: 'Sąsiedzi i ich wpływy', short: 'sąsiedzi' },
  { id: 'stolica', title: 'Stolica — albo jej brak', short: 'stolica' },
];

export interface RegionStory {
  id: RegionId;
  reason: ReasonId;
  /** Jedno zdanie po ułożeniu kawałka. */
  text: string;
}

export const REGION_STORIES: RegionStory[] = [
  {
    id: 'wielkopolska',
    reason: 'stolica',
    text: 'Tu powstało państwo Polan, a Gniezno było pierwszą stolicą. Żyzne pola — od wieków region rolników.',
  },
  {
    id: 'malopolska',
    reason: 'stolica',
    text: 'Kraków przez setki lat był stolicą i domem królów. Tu powstał pierwszy polski uniwersytet.',
  },
  {
    id: 'mazowsze',
    reason: 'stolica',
    text: 'Mazowsze przez kilkaset lat miało własnych książąt. Pod koniec XVI wieku król przeniósł się do Warszawy — i stolica jest tu do dziś.',
  },
  {
    id: 'pomorze',
    reason: 'krajobraz',
    text: 'Morze i ujście Wisły: Gdańsk przez setki lat był największym polskim portem. Na Kaszubach do dziś mówi się po kaszubsku.',
  },
  {
    id: 'warmia-mazury',
    reason: 'granice',
    text: 'Przez wieki było tu państwo zakonu krzyżackiego — stąd tyle ceglanych zamków między jeziorami i lasami.',
  },
  {
    id: 'podlasie',
    reason: 'sasiedzi',
    // Meczety tatarskie: Kruszyniany i Bohoniki (XVIII–XIX w.).
    text: 'Spotykali się tu Polacy, Litwini, Białorusini i Tatarzy — obok kościołów stoją cerkwie, a w dwóch wsiach drewniane meczety.',
  },
  {
    id: 'slask',
    reason: 'granice',
    // Korona Czeska od XIV w., Habsburgowie, od 1742 Prusy (F-II.2-17 + atlas).
    text: 'Śląsk przez setki lat należał do Czech, potem do Austrii i Prus — dlatego mieszały się tu wpływy polskie, czeskie i niemieckie. Pod ziemią: węgiel.',
  },
  {
    id: 'kujawy',
    reason: 'krajobraz',
    // Czarnoziemy kujawskie; solanki i tężnie w Inowrocławiu i Ciechocinku.
    text: 'Czarna, bardzo żyzna ziemia i sól spod ziemi — w Inowrocławiu i Ciechocinku do dziś oddycha się solanką przy tężniach.',
  },
  {
    id: 'ziemia-lubuska',
    reason: 'granice',
    // W Brandenburgii od połowy XIII w.; w Polsce od 1945.
    text: 'Przez prawie siedemset lat leżała w granicach Brandenburgii i Niemiec. Do Polski wróciła w 1945 roku, a zamieszkali tu ludzie przesiedleni ze wschodu.',
  },
  {
    id: 'lubelszczyzna',
    reason: 'sasiedzi',
    // Unia lubelska 1569.
    text: 'Leżała na drodze z Polski na Litwę i Ruś. W Lublinie w 1569 roku Polska i Litwa zawarły unię.',
  },
  {
    id: 'ziemia-lodzka',
    reason: 'krajobraz',
    // Łódź fabryczna od lat 20. XIX w.
    text: 'Łódź w XIX wieku wyrosła z małego miasteczka na miasto setek fabryk tkanin — praca ściągała tu ludzi z daleka.',
  },
];

export function storyOf(id: RegionId): RegionStory {
  return REGION_STORIES.find((s) => s.id === id)!;
}

/** Sędzia kawałka: pasuje tylko do własnego miejsca na konturze (kształt jest dowodem). */
export function judgePiece(piece: RegionId, slot: RegionId): { ok: true } | { ok: false; why: string } {
  if (piece === slot) return { ok: true };
  const a = REGION_SHAPES.find((r) => r.id === piece)!;
  const b = REGION_SHAPES.find((r) => r.id === slot)!;
  const wa = a.box[2] - a.box[0];
  const wb = b.box[2] - b.box[0];
  const ha = a.box[3] - a.box[1];
  const hb = b.box[3] - b.box[1];
  const sea = (r: typeof a) => r.box[1] < 60;
  if (sea(b) && !sea(a)) return { ok: false, why: 'To miejsce sięga morza, a twój kawałek nie ma brzegu.' };
  if (wa > wb * 1.35) return { ok: false, why: 'Kawałek jest wyraźnie szerszy niż ta dziura — nie zmieści się.' };
  if (wa * 1.35 < wb) return { ok: false, why: 'Kawałek jest za wąski na tę dziurę — zostałaby szpara.' };
  if (ha > hb * 1.35) return { ok: false, why: 'Kawałek jest wyższy niż ta dziura — wystaje.' };
  if (ha * 1.35 < hb) return { ok: false, why: 'Kawałek jest za niski na tę dziurę.' };
  return { ok: false, why: 'Rozmiar podobny, ale brzegi się nie zgadzają — porównaj kształt.' };
}

// ─── Trzy stolice ───────────────────────────────────────────────────────────

export interface Capital {
  id: 'gniezno' | 'krakow' | 'warszawa';
  name: string;
  /** Kiedy była stolicą — to z tego dziecko wyprowadza kolejność. */
  when: string;
  order: number;
  lonlat: readonly [number, number];
}

/** F-II.2-22; Kraków stolicą od połowy XI w. (Kazimierz Odnowiciel), Warszawa — koniec XVI w. (F-II.2-15). */
export const CAPITALS: Capital[] = [
  { id: 'warszawa', name: 'Warszawa', when: 'od końca XVI wieku', order: 3, lonlat: [21.01, 52.23] },
  { id: 'gniezno', name: 'Gniezno', when: 'X wiek', order: 1, lonlat: [17.6, 52.53] },
  { id: 'krakow', name: 'Kraków', when: 'od połowy XI wieku', order: 2, lonlat: [19.94, 50.06] },
];

/** Korona jedzie do miasta: przyjmuje tylko następną stolicę w czasie. */
export function judgeCrown(at: number, to: Capital['id']): { ok: true } | { ok: false; why: string } {
  const target = CAPITALS.find((c) => c.id === to)!;
  if (target.order === at + 1) return { ok: true };
  if (target.order <= at) return { ok: false, why: `${target.name} już była stolicą — korona jedzie dalej w czasie, nie wstecz.` };
  const next = CAPITALS.find((c) => c.order === at + 1)!;
  return {
    ok: false,
    why: `${target.name} — ${target.when}. A ${next.name} — ${next.when}. Co było wcześniej?`,
  };
}
