/**
 * L10 blok 2 — orzeł przez wieki. Etapy i sędzia suwaka, bez Reacta.
 *
 * Fakty: F-II.T1-07 (Piastowie, orzeł na pieczęciach i tarczach), F-II.T1-08
 * (1295, Przemysł II, korona), F-II.T1-09 (Jagiellonowie: złote szpony, dziób,
 * korona, łuski), F-II.T1-10 (zabory — symbol Polaków, nie państwa),
 * F-II.T1-11 (1918), F-II.T1-12 (po II wojnie bez korony, 1989 korona wraca).
 * Korona wróciła nowelą konstytucji z 29 XII 1989 (ustawą o godle — 9 II 1990);
 * trzymamy się daty z bazy, a sędzia przyjmuje oba lata.
 *
 * Wizerunki — wszystkie z Wikimedia Commons, domena publiczna:
 *  - pieczęć Przemysła I, 1252, rycina F. Piekosińskiego (1899)
 *    — File:Przemysl I seal 1252 (16839441).png
 *  - pieczęć Przemysła II, 1295, rewers z orłem, rycina F. Piekosińskiego (1899)
 *    — File:Przemysl II seal 1295 (16839933).png
 *  - herb króla Zygmunta Starego w armoriale z 1509 r.
 *    — File:Coat of arms of Žygimantas Senasis with Polish Eagle and Lithuanian Vytis (Waykimas), 1509.jpg
 *  - herb powstania styczniowego, 1863 — File:Coat of arms of the January Uprising.svg
 *  - godło II RP, wzór z 1927 r. (Z. Kamiński) — File:Coat of arms of Poland (1928–1939).svg
 *  - godło bez korony (1955–1980) — File:Coat of arms of Poland (1955-1980).svg
 *  - godło dziś, wzór urzędowy — File:Coat of arms of Poland-official.svg
 */

import { img } from '@/lib/media';

export const YEAR_MIN = 960;
export const YEAR_MAX = 2026;

export interface EagleStage {
  id: string;
  from: number;
  to: number;
  crown: boolean;
  /** Czy orzeł jest znakiem państwa (w zaborach — nie). */
  state: boolean;
  title: string;
  text: string;
  image: string;
  source: string;
  alt: string;
}

export const STAGES: EagleStage[] = [
  {
    id: 'piastowie',
    from: YEAR_MIN,
    to: 1294,
    crown: false,
    state: true,
    title: 'Piastowie: orzeł na tarczy',
    text: 'Książęta z rodu Piastów kładą orła na pieczęciach i tarczach. Ptak rozkłada skrzydła — ale korony nie ma.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1252-przemysl-i.jpg'),
    source: 'Pieczęć księcia Przemysła I, 1252 r. (rycina z 1899 r.). Orzeł na tarczy rycerza.',
    alt: 'Okrągła pieczęć: rycerz w kolczudze stoi z chorągwią, na jego tarczy orzeł bez korony',
  },
  {
    id: 'przemysl',
    from: 1295,
    to: 1385,
    crown: true,
    state: true,
    title: 'Przemysł II: orzeł dostaje koronę',
    text: 'Przemysł II, syn Przemysła I, koronuje się na króla i daje orłowi złotą koronę. Od teraz orzeł to znak króla — a potem całego państwa.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1295-przemysl-ii.jpg'),
    source: 'Pieczęć króla Przemysła II, 1295 r., strona z orłem (rycina z 1899 r.).',
    alt: 'Okrągła pieczęć z napisem w otoku, w środku tarcza z orłem z rozłożonymi skrzydłami i koroną na głowie',
  },
  {
    id: 'jagiellonowie',
    from: 1386,
    to: 1794,
    crown: true,
    state: true,
    title: 'Jagiellonowie i królowie elekcyjni',
    text: 'Orzeł Korony dostaje złote szpony, dziób i koronę. Stoi obok Pogoni — znaku Litwy, bo król rządzi obydwoma krajami.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1509-zygmunt.jpg'),
    source: 'Herb króla Zygmunta Starego w księdze herbów z 1509 r.',
    alt: 'Strona starej księgi: tarcza podzielona na cztery pola, w dwóch biały orzeł w złotej koronie na czerwieni, w dwóch jeździec Pogoni, nad tarczą hełm z koroną',
  },
  {
    id: 'zabory',
    from: 1795,
    to: 1917,
    crown: true,
    state: false,
    title: 'Zabory: orzeł bez państwa',
    text: 'Polski nie ma na mapie. Orzeł nie jest już znakiem państwa — jest znakiem ludzi, którzy o nią walczą. W powstaniu styczniowym (1863) stanął na tarczy obok Pogoni i Michała Archanioła.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1863-powstanie.png'),
    source: 'Herb powstania styczniowego, 1863 r. (rysunek współczesny).',
    alt: 'Tarcza pod koroną podzielona na trzy pola: biały orzeł, jeździec Pogoni i święty Michał',
  },
  {
    id: 'niepodlegla',
    from: 1918,
    to: 1944,
    crown: true,
    state: true,
    title: 'Niepodległa: orzeł wraca',
    text: 'W 1918 r. Polska wraca na mapę, a Orzeł Biały — na urzędy. W 1927 r. narysowano mu nowy, urzędowy wzór.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1927.png'),
    source: 'Godło Rzeczypospolitej, wzór z 1927 r. (Zygmunt Kamiński).',
    alt: 'Biały orzeł w złotej koronie na czerwonej tarczy',
  },
  {
    id: 'bez-korony',
    from: 1945,
    to: 1988,
    crown: false,
    state: true,
    title: 'Po wojnie: orzeł bez korony',
    text: 'Nowa władza po II wojnie światowej zdejmuje orłowi koronę — korona kojarzyła się jej z królami i dawną Polską.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-1955.png'),
    source: 'Godło z lat 1955–1980 (wzór bez korony).',
    alt: 'Biały orzeł bez korony na czerwonej tarczy',
  },
  {
    id: 'dzis',
    from: 1989,
    to: YEAR_MAX,
    crown: true,
    state: true,
    title: 'Dziś: korona wraca',
    text: 'W 1989 r. orzeł odzyskuje koronę. Takiego zobaczysz w szkole, na paszporcie i na każdej polskiej monecie.',
    image: img('/images/historia/lekcje/symbole-narodowe/orzel-dzis.png'),
    source: 'Godło Rzeczypospolitej Polskiej — wzór urzędowy.',
    alt: 'Biały orzeł w złotej koronie, ze złotym dziobem i szponami, na czerwonej tarczy',
  },
];

export function stageAt(year: number): EagleStage {
  return STAGES.find((s) => year >= s.from && year <= s.to) ?? STAGES[STAGES.length - 1];
}

export interface EagleTask {
  id: 'dostaje' | 'traci' | 'odzyskuje';
  prompt: string;
  /** Rok zmiany i ostatni rok, który jeszcze uznajemy za „chwilę zmiany”. */
  year: number;
  until: number;
  done: string;
}

export const TASKS: EagleTask[] = [
  {
    id: 'dostaje',
    prompt: 'Zatrzymaj suwak w chwili, gdy orzeł DOSTAJE koronę.',
    year: 1295,
    until: 1305,
    done: '1295 — koronacja Przemysła II. Pierwszy orzeł w koronie.',
  },
  {
    id: 'traci',
    prompt: 'Teraz znajdź chwilę, gdy orzeł TRACI koronę.',
    year: 1945,
    until: 1955,
    done: 'Po II wojnie światowej — orzeł bez korony.',
  },
  {
    id: 'odzyskuje',
    prompt: 'I ostatnia: kiedy orzeł ODZYSKUJE koronę?',
    year: 1989,
    until: 1995,
    done: '1989 — korona wraca i zostaje do dziś.',
  },
];

export type StopVerdict = { ok: true } | { ok: false; message: string };

/**
 * Sędzia zatrzymania. Odpowiedź wynika z obrazu pod suwakiem: dziecko widzi
 * koronę albo jej brak, a odrzut mówi, co jest na obrazie w tym roku.
 */
export function judgeStop(task: EagleTask, year: number): StopVerdict {
  if (year >= task.year && year <= task.until) return { ok: true };
  const s = stageAt(year);
  const crownWord = s.crown ? 'ma koronę' : 'nie ma korony';
  if (year < task.year) {
    return {
      ok: false,
      message: `W ${year} r. orzeł ${crownWord} (${s.title.toLowerCase()}). To jeszcze nie ta zmiana — przesuń dalej.`,
    };
  }
  const changed = stageAt(task.year);
  return {
    ok: false,
    message: `Za daleko: w ${year} r. orzeł ${crownWord} już od ${changed.from} r. Cofnij suwak do chwili, w której obraz się zmienia.`,
  };
}
