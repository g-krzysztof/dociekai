/**
 * L18 — makieta opowieści. Czysta logika i format adnotacji świata
 * przedstawionego (T-L18-1, T-L18-3). Selftest: `scripts/polski-l18-selftest.mjs`.
 *
 * Tekstu autora tu nie ma — akapity bierzemy z `ODC_1` książki Czytelni
 * (dzielone pustą linią, co do znaku). Adnotacja to lista fraz na akapit:
 * każda fraza to dosłowny fragment akapitu i jej **rola** w świecie opowieści.
 * Teatr stawia frazę według roli, a dziecko tylko ją wyciąga z tekstu.
 *
 *  - `tlo` — miejsce akcji (karta tła na szynie u góry);
 *  - `lampa` — czas akcji: pora roku, pora dnia, „dawno temu” (lampa się zapala, niebo zmienia kolor);
 *  - `deski` — bohater albo inna postać (figurka na patyczku);
 *  - `tasma` — zdarzenie (wsuwa się na taśmę pod rampą i gra na scenie);
 *  - `narrator` — słowa, które **nie są rzeczą ze świata**: opinia, uczucie, porównanie,
 *    komentarz, „ja” opowiadającego — wpadają do ręki zza kulis.
 *
 * Ta sama fraza może wystąpić w akapicie kilka razy — wszystkie wystąpienia
 * są nią (dłuższe frazy wybierają pierwsze, więc „Prześlicznie i cudownie”
 * nie oddaje „Prześlicznie” krótszej frazie).
 */

export type Miejsce = 'tlo' | 'lampa' | 'deski' | 'tasma';
export type Rola = Miejsce | 'narrator';

/** Kolor nieba po zapaleniu lampy. */
export type Pora = 'dzien' | 'wieczor' | 'noc' | 'lato' | 'zima' | 'wiosna' | 'jesien' | 'dawno';

/** Wycinanki, które teatr umie postawić; fraza bez ikony dostaje ogólną dla swojej roli. */
export const IKONY = {
  tlo: ['wies', 'pole', 'stog', 'las', 'woda', 'zamek', 'lisc', 'miasto', 'dom', 'grota', 'gory', 'pokoj'],
  deski: ['kaczka', 'bocian', 'czlowiek', 'krol', 'dziecko', 'wilk', 'zwierze', 'kon', 'ptak'],
  tasma: ['jajo', 'piskle', 'iskra'],
} as const;
export type IkonaTla = (typeof IKONY.tlo)[number];
export type IkonaPostaci = (typeof IKONY.deski)[number];
export type IkonaZdarzenia = (typeof IKONY.tasma)[number];
export type Ikona = IkonaTla | IkonaPostaci | IkonaZdarzenia;

export interface FrazaSrc {
  tekst: string;
  rola: Rola;
  ikona?: Ikona;
  /** Tylko dla `lampa`. */
  pora?: Pora;
}

export interface Otwarcie {
  bookId: string;
  /** Adnotacja akapitów odc. 1 od początku: `frazy[i]` = frazy akapitu `i`. Długość = zakres otwarcia. */
  frazy: FrazaSrc[][];
  /** Ile akapitów widać od razu (reszta po „Czytaj dalej”). */
  start: number;
  /** Jedno zdanie o fikcji pod gotową makietą (tor dziecka) — tylko tam, gdzie świat miesza prawdziwe z wymyślonym. */
  fikcja?: string;
}

export interface Fraza extends FrazaSrc {
  /** `<akapit>-<n>` — stałe w obrębie otwarcia. */
  id: string;
  akapit: number;
}

/** Kawałek akapitu do wyświetlenia: wyraz (z frazą albo bez) albo odstęp/znak. */
export interface Kawalek {
  tekst: string;
  wyraz: boolean;
  fraza?: string;
}

export const MIEJSCA: Miejsce[] = ['tlo', 'lampa', 'deski', 'tasma'];

/** Akapity odcinka (pusta linia dzieli), bez zmian w tekście. */
export const akapity = (body: string): string[] => body.split(/\n\s*\n/);

export function frazyOtwarcia(o: Otwarcie): Fraza[] {
  return o.frazy.flatMap((lista, akapit) => lista.map((f, n) => ({ ...f, id: `${akapit}-${n}`, akapit })));
}

/** Zakresy `[od, do)` wystąpień fraz w akapicie; dłuższe najpierw, bez nakładania. Fraza nieznaleziona rzuca. */
export function zakresy(akapit: string, frazy: Fraza[]): { od: number; do: number; id: string }[] {
  const zajete: { od: number; do: number; id: string }[] = [];
  const kolejnosc = [...frazy].sort((a, b) => b.tekst.length - a.tekst.length);
  for (const f of kolejnosc) {
    let znaleziona = false;
    let i = akapit.indexOf(f.tekst);
    while (i >= 0) {
      const j = i + f.tekst.length;
      if (!zajete.some((z) => i < z.do && z.od < j)) {
        zajete.push({ od: i, do: j, id: f.id });
        znaleziona = true;
      }
      i = akapit.indexOf(f.tekst, i + 1);
    }
    if (!znaleziona) throw new Error(`Fraza „${f.tekst}” (${f.id}) nie występuje w akapicie albo nachodzi na dłuższą.`);
  }
  return zajete.sort((a, b) => a.od - b.od);
}

const WYRAZ = /[\p{L}\p{N}]+(?:[-’'][\p{L}\p{N}]+)*/gu;

/** Akapit pocięty na wyrazy i resztę; wyraz w zakresie frazy niesie jej id. */
export function podziel(akapit: string, frazy: Fraza[]): Kawalek[] {
  const z = zakresy(akapit, frazy);
  const out: Kawalek[] = [];
  let pos = 0;
  for (const m of akapit.matchAll(WYRAZ)) {
    const i = m.index!;
    if (i > pos) out.push({ tekst: akapit.slice(pos, i), wyraz: false });
    const fr = z.find((r) => i >= r.od && i < r.do);
    out.push({ tekst: m[0], wyraz: true, ...(fr ? { fraza: fr.id } : {}) });
    pos = i + m[0].length;
  }
  if (pos < akapit.length) out.push({ tekst: akapit.slice(pos), wyraz: false });
  return out;
}

/** Co stoi w którym miejscu (kolejność postawienia). */
export function scena(frazy: Fraza[], postawione: string[]): Record<Rola, Fraza[]> {
  const out: Record<Rola, Fraza[]> = { tlo: [], lampa: [], deski: [], tasma: [], narrator: [] };
  for (const id of postawione) {
    const f = frazy.find((x) => x.id === id);
    if (f) out[f.rola].push(f);
  }
  return out;
}

/** Puste miejsca sceny (w stałej kolejności) i czy ręka zza kulis coś trzyma. */
export function braki(frazy: Fraza[], postawione: string[]): { miejsca: Miejsce[]; reka: boolean } {
  const s = scena(frazy, postawione);
  return { miejsca: MIEJSCA.filter((m) => s[m].length === 0), reka: s.narrator.length > 0 };
}

export const gotowa = (frazy: Fraza[], postawione: string[]) => {
  const b = braki(frazy, postawione);
  return b.miejsca.length === 0 && b.reka;
};

/** Pytanie, które zadaje puste miejsce (bez nazw terminów — te przychodzą po bloku). */
export const PYTANIE: Record<Miejsce, string> = {
  tlo: 'Szyna u góry jest pusta — gdzie to się dzieje?',
  lampa: 'Lampa wisi zgaszona — kiedy to się dzieje?',
  deski: 'Na deskach nikogo nie ma — kto tu jest?',
  tasma: 'Taśma pod sceną stoi — co się dzieje?',
};

/** Czy w widocznych akapitach jest jeszcze fraza dla danego miejsca (inaczej: czytaj dalej). */
export function jestWWidocznych(frazy: Fraza[], widoczne: number, m: Rola): boolean {
  return frazy.some((f) => f.akapit < widoczne && f.rola === m);
}

/** Ostatnia zapalona pora (ostatnia postawiona fraza lampy). */
export function pora(frazy: Fraza[], postawione: string[]): Pora | null {
  const l = scena(frazy, postawione).lampa;
  return l.length ? (l[l.length - 1].pora ?? 'dzien') : null;
}

// ---------------------------------------------------------------------------
// T-L18-1 — „Brzydkie kaczątko”, akapity 0–3 odc. 1 (blok 1).
// Uczucie bohaterki („Nudziło jej się bardzo”) też idzie do ręki: o kaczce mówi
// narrator, który zagląda do jej głowy — zaczep do bloku 2.

export const KACZATKO: Otwarcie = {
  bookId: 'brzydkie-kaczatko',
  start: 4,
  frazy: [
    [
      { tekst: 'Prześlicznie i cudownie', rola: 'narrator' },
      { tekst: 'Prześlicznie', rola: 'narrator' },
      { tekst: 'na wsi', rola: 'tlo', ikona: 'wies' },
      { tekst: 'Lato gorące, pogodne', rola: 'lampa', pora: 'lato' },
      { tekst: 'żółte zboże na polach', rola: 'tlo', ikona: 'pole' },
      { tekst: 'owies jeszcze zielony', rola: 'tlo', ikona: 'pole' },
      { tekst: 'na łąkach wielkie stogi pachnącego siana', rola: 'tlo', ikona: 'stog' },
      { tekst: 'bociany przechadzają się powoli', rola: 'deski', ikona: 'bocian' },
      { tekst: 'bo takim językiem nauczyły się mówić od matek', rola: 'narrator' },
      { tekst: 'Dokoła wielkie lasy, cieniste, szumiące', rola: 'tlo', ikona: 'las' },
      { tekst: 'głębokie i ciche jeziora', rola: 'tlo', ikona: 'woda' },
    ],
    [
      { tekst: 'jasne słońce', rola: 'lampa', pora: 'dzien' },
      { tekst: 'stary zamek z wieżycami i gankami', rola: 'tlo', ikona: 'zamek' },
      { tekst: 'szeroką wstęgą wolno płynącej wody', rola: 'tlo', ikona: 'woda' },
      { tekst: 'wielkie liście łopianu', rola: 'tlo', ikona: 'lisc' },
      { tekst: 'jak w cienistym lesie', rola: 'narrator' },
    ],
    [
      { tekst: 'młoda kaczka', rola: 'deski', ikona: 'kaczka' },
      { tekst: 'usłała sobie gniazdo i siedziała na jajach', rola: 'tasma', ikona: 'jajo' },
      { tekst: 'Nudziło jej się bardzo', rola: 'narrator' },
      { tekst: 'żadna z sąsiadek', rola: 'deski', ikona: 'kaczka' },
      { tekst: 'w tak piękną pogodę', rola: 'lampa', pora: 'lato' },
      { tekst: 'jak przykuta', rola: 'narrator' },
    ],
    [
      { tekst: 'Skończyło się wreszcie jej udręczenie', rola: 'narrator' },
      { tekst: 'jajka zaczęły pękać', rola: 'tasma', ikona: 'jajo' },
      { tekst: 'główka pisklęcia co chwila wysuwała się z innej skorupki', rola: 'tasma', ikona: 'piskle' },
    ],
  ],
};
