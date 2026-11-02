/**
 * Blok 2 — „Archiwum postaci” — dane i sędzia, bez Reacta.
 *
 * Każda teczka ma te same cztery szuflady (gdzie? kiedy? dokument? ślad dziś?).
 * Półka wynika z tego, **co dziecko znalazło**, nie z klucza autora:
 * wszystko → postać historyczna, coś → legendarna, nic → baśniowa
 * (F-I.1-05…07). Dlatego sędzia liczy szuflady, a nie sprawdza listy.
 *
 * Fakty spoza bazy (sprawdzone 2026-09-26):
 * - Skłodowska-Curie: ur. 7 XI 1867 w Warszawie przy ul. Freta 16 (dziś Muzeum
 *   Marii Skłodowskiej-Curie), zm. 1934; Nobel z fizyki 1903 i z chemii 1911
 *   (F-I.1-12); jej notatniki laboratoryjne są w Bibliothèque nationale de France
 *   w ołowianych pudełkach, bo wciąż promieniują.
 * - Kopernik: ur. 1473 w Toruniu, zm. 1543 we Fromborku; autograf „O obrotach”
 *   w Bibliotece Jagiellońskiej; szczątki odnalezione w katedrze we Fromborku
 *   (2005), tożsamość potwierdzona w 2008 r. porównaniem DNA z włosami
 *   z należącej do niego książki.
 * - Robin Hood: najstarsza wzmianka to „rymy o Robin Hoodzie” w poemacie
 *   „Piers Plowman” (ok. 1377) — o opowieściach, nie o człowieku; las Sherwood
 *   i Nottingham istnieją.
 * - Smok Wawelski: pierwszy zapis w kronice Wincentego Kadłubka (przełom XII
 *   i XIII w.); Smocza Jama to prawdziwa jaskinia w zboczu Wawelu, ale **nie** jest śladem
 *   smoka — nazwę dała jej legenda (jak dąb Robin Hooda), więc szuflada „ślad” pusta. **Kości
 *   „smoka” przy katedrze celowo pomijamy** — to materiał L14.
 * - Królewna Śnieżka: baśń spisana przez braci Grimm (wyd. 1812).
 */

export type DrawerId = 'gdzie' | 'kiedy' | 'dokument' | 'slad';

export const DRAWERS: Record<DrawerId, string> = {
  gdzie: 'Gdzie żył?',
  kiedy: 'Kiedy żył?',
  dokument: 'Dokument z jego czasów',
  slad: 'Ślad, który można dziś zobaczyć',
};

export const DRAWER_ORDER: DrawerId[] = ['gdzie', 'kiedy', 'dokument', 'slad'];

export interface DrawerFind {
  /** Czy w szufladzie leży prawdziwy dowód. */
  found: boolean;
  text: string;
}

export interface Folder {
  id: string;
  name: string;
  drawers: Record<DrawerId, DrawerFind>;
}

/** Kolejność w szafie wymieszana: półki nie idą po kolei. */
export const FOLDERS: Folder[] = [
  {
    id: 'robin',
    name: 'Robin Hood',
    drawers: {
      gdzie: { found: true, text: 'Las Sherwood i miasto Nottingham w Anglii — istnieją naprawdę, można tam pojechać.' },
      kiedy: {
        found: false,
        text: 'Opowieści umieszczają go raz w jednym stuleciu, raz w innym. Żadnej pewnej daty.',
      },
      dokument: {
        found: false,
        text: 'Najstarszy zapis (wiersz sprzed ponad 600 lat) wspomina tylko „rymowanki o Robin Hoodzie” — mówi o opowieściach, nie o człowieku.',
      },
      slad: {
        found: false,
        text: 'W Sherwood rośnie stary dąb, który pokazuje się turystom jako jego kryjówkę. Tak go nazwano przez opowieść — nie przez dowód.',
      },
    },
  },
  {
    id: 'curie',
    name: 'Maria Skłodowska-Curie',
    drawers: {
      gdzie: { found: true, text: 'Warszawa, ulica Freta 16 — tu się urodziła. Dziś w tym domu jest jej muzeum.' },
      kiedy: { found: true, text: 'Urodziła się 7 listopada 1867 roku, zmarła w 1934 roku.' },
      dokument: { found: true, text: 'Dyplomy dwóch Nagród Nobla: z fizyki (1903) i z chemii (1911).' },
      slad: {
        found: true,
        text: 'Jej zeszyty z laboratorium promieniują do dziś — biblioteka w Paryżu trzyma je w ołowianych pudełkach.',
      },
    },
  },
  {
    id: 'sniezka',
    name: 'Królewna Śnieżka',
    drawers: {
      gdzie: { found: false, text: '„Za siedmioma górami, za siedmioma lasami” — takiego miejsca nie ma na żadnej mapie.' },
      kiedy: { found: false, text: '„Dawno, dawno temu” — bez roku, bez stulecia.' },
      dokument: {
        found: false,
        text: 'Pusto. Opowieść spisali bracia Grimm ponad 200 lat temu — ale jako baśń, nie jako kronikę.',
      },
      slad: { found: false, text: 'Pusto. Ani grobu, ani zamku, ani chatki krasnoludków.' },
    },
  },
  {
    id: 'smok',
    name: 'Smok Wawelski',
    drawers: {
      gdzie: { found: true, text: 'Wzgórze Wawel w Krakowie — istnieje, stoi na nim zamek królów.' },
      kiedy: {
        found: false,
        text: '„Za czasów króla Kraka” — ale sam Krak też jest postacią z legendy. Daty brak.',
      },
      dokument: {
        found: false,
        text: 'Pierwszy zapisał tę opowieść kronikarz Wincenty Kadłubek ok. 800 lat temu — setki lat po czasach, o których pisał. Smoka nie widział; zapisał to, co opowiadano.',
      },
      slad: {
        found: false,
        text: 'Smocza Jama w zboczu Wawelu. Jaskinia jest prawdziwa — ale nazwę dała jej legenda. Śladu smoka w niej nie ma.',
      },
    },
  },
  {
    id: 'kopernik',
    name: 'Mikołaj Kopernik',
    drawers: {
      gdzie: { found: true, text: 'Urodził się w Toruniu, przez wiele lat pracował we Fromborku.' },
      kiedy: { found: true, text: 'Urodził się w 1473 roku, zmarł w 1543 roku.' },
      dokument: {
        found: true,
        text: 'Jego książka „O obrotach sfer niebieskich”, pisana jego własną ręką, leży w bibliotece w Krakowie.',
      },
      slad: {
        found: true,
        text: 'Jego grób we Fromborku. Naukowcy potwierdzili go, porównując DNA z włosami znalezionymi w jego książce.',
      },
    },
  },
];

export type Shelf = 'wszystko' | 'czesc' | 'nic';

export const SHELVES: Record<Shelf, { rule: string; term: string; meaning: string }> = {
  wszystko: {
    rule: 'wszystkie szuflady pełne',
    term: 'postać historyczna',
    meaning: 'żyła naprawdę — i zostawiła ślady',
  },
  czesc: {
    rule: 'coś jest, czegoś brak',
    term: 'postać legendarna',
    meaning: 'prawda miesza się ze zmyśleniem',
  },
  nic: {
    rule: 'wszystkie szuflady puste',
    term: 'postać baśniowa',
    meaning: 'wymyślona — nie wiadomo gdzie ani kiedy',
  },
};

export const SHELF_ORDER: Shelf[] = ['wszystko', 'czesc', 'nic'];

export function foundCount(folder: Folder): number {
  return DRAWER_ORDER.filter((d) => folder.drawers[d].found).length;
}

export function shelfFor(folder: Folder): Shelf {
  const n = foundCount(folder);
  return n === DRAWER_ORDER.length ? 'wszystko' : n === 0 ? 'nic' : 'czesc';
}

/** Werdykt odłożenia — przy pomyłce nazywa konkretną szufladę, która przesądza. */
export function judgeShelf(folder: Folder, shelf: Shelf): { ok: boolean; note?: string } {
  const right = shelfFor(folder);
  if (right === shelf) return { ok: true };
  const found = DRAWER_ORDER.filter((d) => folder.drawers[d].found);
  const empty = DRAWER_ORDER.filter((d) => !folder.drawers[d].found);
  if (shelf === 'nic') {
    return { ok: false, note: `Coś jednak w tej teczce jest: szuflada „${DRAWERS[found[0]]}” nie jest pusta.` };
  }
  if (shelf === 'wszystko') {
    return { ok: false, note: `Nie wszystko się znalazło — pusta jest szuflada „${DRAWERS[empty[0]]}”.` };
  }
  // shelf === 'czesc'
  return right === 'wszystko'
    ? { ok: false, note: 'Niczego tu nie brakuje — wszystkie cztery szuflady mają prawdziwy dowód.' }
    : { ok: false, note: 'Tu nie ma ani jednego prawdziwego śladu — wszystkie cztery szuflady są puste.' };
}
