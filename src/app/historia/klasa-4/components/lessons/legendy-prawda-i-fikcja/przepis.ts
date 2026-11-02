/**
 * Blok 4 — „Legenda według przepisu” (zadanie) — dane i sędzia, bez Reacta.
 *
 * Dziecko składa legendę z kafelków w czterech linijkach zwoju, według
 * przepisu wyczytanego z bloków 1–3: kamień (miejsce, które każdy może dziś
 * zobaczyć) → bohater → cud → zakończenie, które tłumaczy nazwę. Nazwa to
 * osobny kafelek („Dąb Kasi”) i **musi wynikać z opowieści**: sędzia
 * sprawdza, czy jej źródło (bohater albo cud) stoi w legendzie dziecka.
 *
 * Rodzaj kafelka to właściwość, którą dziecko samo sprawdza pytaniem
 * z lekcji: czy to miejsce można dziś zobaczyć? czy taki człowiek mógł żyć?
 * czy ktokolwiek to sprawdzi? — nie przynależność wymyślona przez autora.
 */

export type TileKind = 'miejsce' | 'bajkowe-miejsce' | 'bohater' | 'cud' | 'nazwa' | 'koniec-bez-nazwy' | 'imie';

export interface Tile {
  id: string;
  kind: TileKind;
  text: string;
  /** Miejsca: rzeczownik do nazwy („Dąb”). */
  noun?: string;
  /** Bohater i cud: dopełniacz do nazwy („Kasi”). */
  genitive?: string;
  /** Imię (kafelek nazwy): id kafelka, z którego się wzięło. */
  from?: string;
}

export const PLACES: Tile[] = [
  { id: 'dab', kind: 'miejsce', text: 'Dawno temu pod starym dębem przy drodze', noun: 'Dąb' },
  { id: 'studnia', kind: 'miejsce', text: 'Dawno temu przy studni na rynku', noun: 'Studnia' },
  { id: 'rzeka', kind: 'miejsce', text: 'Dawno temu nad rzeką za miastem', noun: 'Rzeka' },
  { id: 'kamien', kind: 'miejsce', text: 'Dawno temu przy wielkim kamieniu na polu', noun: 'Kamień' },
  { id: 'gora', kind: 'miejsce', text: 'Dawno temu pod górą nad wsią', noun: 'Góra' },
  { id: 'zamek', kind: 'miejsce', text: 'Dawno temu w zamku na skale', noun: 'Zamek' },
  { id: 'palac', kind: 'bajkowe-miejsce', text: 'Dawno temu w szklanym pałacu za siedmioma górami' },
  { id: 'chmura', kind: 'bajkowe-miejsce', text: 'Dawno temu na chmurze nad lasem' },
];

export const HEROES: Tile[] = [
  { id: 'kasia', kind: 'bohater', text: 'mieszkała pasterka Kasia.', genitive: 'Kasi' },
  { id: 'kowal', kind: 'bohater', text: 'żył kowal Wojciech.', genitive: 'Kowala' },
];

export const WONDERS: Tile[] = [
  { id: 'niedzwiedz', kind: 'cud', text: 'Pewnej nocy z wody wyszedł kamienny niedźwiedź i przemówił ludzkim głosem.', genitive: 'Niedźwiedzia' },
  { id: 'diabel', kind: 'cud', text: 'Pewnej nocy przyszedł diabeł i obiecał worek złota.', genitive: 'Diabła' },
  { id: 'ptak', kind: 'cud', text: 'Pewnego dnia złoty ptak wskazał, gdzie ukryto skarb.', genitive: 'Ptaka' },
];

export const ENDINGS: Tile[] = [
  { id: 'nazwa', kind: 'nazwa', text: 'Od tamtej pory ludzie nazywają to miejsce' },
  { id: 'szczesliwie', kind: 'koniec-bez-nazwy', text: 'I żyli długo i szczęśliwie.' },
  { id: 'nikt', kind: 'koniec-bez-nazwy', text: 'A co było dalej, nikt nie pamięta.' },
];

/** Kafelki imion — z każdego bohatera i cudu (także tych, których dziecko nie użyje). */
export const NAMES: Tile[] = [...HEROES, ...WONDERS].map((t) => ({
  id: `imie-${t.id}`,
  kind: 'imie' as const,
  text: t.genitive!,
  from: t.id,
}));

export const ALL_TILES: Tile[] = [...PLACES, ...HEROES, ...WONDERS, ...ENDINGS, ...NAMES];

export const getTile = (id: string) => ALL_TILES.find((t) => t.id === id);

/** Linijki zwoju: cztery linijki legendy + miejsce na imię przy zakończeniu. */
export type SlotId = 'l1' | 'l2' | 'l3' | 'l4' | 'imie';
export const LINES: SlotId[] = ['l1', 'l2', 'l3', 'l4'];
export type Scroll = Partial<Record<SlotId, string>>;

/** Pełna nazwa, gdy zakończenie nazywa miejsce i imię jest — np. „Dąb Kasi”. */
export function placeName(scroll: Scroll): string | null {
  const place = scroll.l1 ? getTile(scroll.l1) : undefined;
  const name = scroll.imie ? getTile(scroll.imie) : undefined;
  if (!place?.noun || !name) return null;
  return `${place.noun} ${name.text}`;
}

/** Tekst legendy dziecka, gotowy do przeczytania. */
export function legendText(scroll: Scroll): string {
  const parts: string[] = [];
  for (const s of LINES) {
    const t = scroll[s] ? getTile(scroll[s]!) : undefined;
    if (!t) continue;
    if (t.kind === 'nazwa') {
      const n = placeName(scroll);
      parts.push(`${t.text} ${n ? `„${n}”` : '…'}.`);
    } else parts.push(t.text);
  }
  return parts.join(' ');
}

export interface RecipeVerdicts {
  kamien: { ok: boolean; note: string };
  bohater: { ok: boolean; note: string };
  cud: { ok: boolean; note: string };
  koniec: { ok: boolean; note: string };
}

const KIND_SAYS: Record<TileKind, string> = {
  miejsce: 'to miejsce, które można zobaczyć',
  'bajkowe-miejsce': 'tego miejsca nikt nigdy nie zobaczy',
  bohater: 'to człowiek, który mógł tam żyć',
  cud: 'to cud — nikt go nie sprawdzi',
  nazwa: 'to zakończenie',
  'koniec-bez-nazwy': 'to zakończenie',
  imie: 'to samo imię, bez zdania',
};

export function judgeRecipe(scroll: Scroll): RecipeVerdicts {
  const t = (s: SlotId) => (scroll[s] ? getTile(scroll[s]!) : undefined);
  const l1 = t('l1');
  const l2 = t('l2');
  const l3 = t('l3');
  const l4 = t('l4');

  const kamien = !l1
    ? { ok: false, note: 'Pierwsza linijka jest pusta.' }
    : l1.kind === 'miejsce'
      ? { ok: true, note: `„${l1.text}” — ${l1.noun?.toLowerCase()} każdy może dziś zobaczyć. To twój kamień.` }
      : l1.kind === 'bajkowe-miejsce'
        ? { ok: false, note: `„${l1.text}” — takiego miejsca nikt nie zobaczy. Legenda zaczyna się od czegoś prawdziwego, jak Wawel i jaskinia.` }
        : { ok: false, note: `Na początku stoi „${l1.text}”, a ${KIND_SAYS[l1.kind]}. Legenda zaczyna się od miejsca.` };

  const bohater = !l2
    ? { ok: false, note: 'Druga linijka jest pusta.' }
    : l2.kind === 'bohater'
      ? { ok: true, note: `„${l2.text}” — bohater, który mógł tam żyć, jak młynarz Bartosz.` }
      : { ok: false, note: `W drugiej linijce stoi „${l2.text}” — ${KIND_SAYS[l2.kind]}. Tu potrzebny jest bohater.` };

  const cud = !l3
    ? { ok: false, note: 'Trzecia linijka jest pusta.' }
    : l3.kind === 'cud'
      ? { ok: true, note: `„${l3.text}” — tego nikt nie sprawdzi. To część zmyślona.` }
      : { ok: false, note: `W trzeciej linijce stoi „${l3.text}” — ${KIND_SAYS[l3.kind]}. Legenda potrzebuje cudu.` };

  let koniec: { ok: boolean; note: string };
  const name = t('imie');
  if (!l4) koniec = { ok: false, note: 'Czwarta linijka jest pusta.' };
  else if (l4.kind === 'koniec-bez-nazwy')
    koniec = { ok: false, note: `„${l4.text}” niczego nie tłumaczy. Legenda kończy się tym, co zostało do dziś — jak Smocza Jama albo rzeka Smoczanka.` };
  else if (l4.kind !== 'nazwa') koniec = { ok: false, note: `W czwartej linijce stoi „${l4.text}” — ${KIND_SAYS[l4.kind]}. Tu ma być zakończenie.` };
  else if (!name) koniec = { ok: false, note: 'Zakończenie mówi „nazywają to miejsce…”, ale nazwy jeszcze nie ma. Dołóż imię.' };
  else if (!l1?.noun) koniec = { ok: false, note: 'Najpierw kamień w pierwszej linijce — od niego bierze się nazwa.' };
  else {
    const used = [l2?.id, l3?.id].includes(name.from);
    const source = getTile(name.from!)!;
    koniec = used
      ? { ok: true, note: `„${placeName(scroll)}” — nazwa wynika z twojej opowieści i tłumaczy, skąd się wzięła.` }
      : {
          ok: false,
          note: `„${placeName(scroll)}” — ale w twojej legendzie nie ma ${source.kind === 'bohater' ? 'tego bohatera' : 'tego cudu'} („${source.text}”). Nazwa ma wynikać z opowieści.`,
        };
  }

  return { kamien, bohater, cud, koniec };
}
