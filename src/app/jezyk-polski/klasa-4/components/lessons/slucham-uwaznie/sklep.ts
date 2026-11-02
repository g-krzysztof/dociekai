/**
 * L5 — logika słuchania: pytanie do pani Haliny, sklep, kuchnia, porównanie
 * notatki z nagraniem i karmienie Mruczka. Czyste funkcje (selftest L5).
 *
 * Każdy błąd w kuchni wskazuje fragment nagrania (`span`), który go
 * rozstrzyga — po zakupach można go odsłuchać bez limitu. To nie klucz autora:
 * w nagraniu to stoi, słowo w słowo.
 */

// ── Pytanie do pani Haliny ───────────────────────────────────────────────────

export const PYTANIA = [
  { id: 'mleko', text: 'Ile mleka?', span: 'mleko' },
  { id: 'chleb', text: 'Jaki chleb?', span: 'chleb' },
  { id: 'jablka', text: 'Jakie jabłka?', span: 'jablka' },
  { id: 'maslo', text: 'Kupić masło?', span: 'maslo' },
  { id: 'ser', text: 'Jaki ser?', span: 'ser' },
  { id: 'drozdze', text: 'Ile drożdży?', span: 'drozdze' },
] as const;

export type PytanieId = (typeof PYTANIA)[number]['id'];

/** Odpowiedź: o ser — jedyną rzecz, której nie było w nagraniu — pani Halina odpowiada. */
export function odpowiedz(id: PytanieId): { nowe: boolean; mowi: string; span: string } {
  const p = PYTANIA.find((x) => x.id === id)!;
  if (id === 'ser') return { nowe: true, mowi: 'Ach, przecież ty nie wiesz! Żółty, kostka, ten z dziurami.', span: p.span };
  return { nowe: false, mowi: 'Przecież mówiłam, kochanie. Posłuchaj jeszcze raz w głowie, co powiedziałam.', span: p.span };
}

// ── Sklep ────────────────────────────────────────────────────────────────────

export type RegalId = 'nabial' | 'pieczywo' | 'owoce' | 'pieczenie';

export interface Produkt {
  id: string;
  label: string;
  regal: RegalId;
  /** Jednostka do licznika: „karton 1 l”, „szt.”. */
  jedn: string;
}

export const REGALY: { id: RegalId; label: string; x: number; y: number; w: number; h: number }[] = [
  { id: 'nabial', label: 'nabiał', x: 10, y: 10, w: 120, h: 34 },
  { id: 'pieczywo', label: 'pieczywo', x: 170, y: 10, w: 120, h: 34 },
  { id: 'owoce', label: 'owoce', x: 10, y: 96, w: 120, h: 34 },
  { id: 'pieczenie', label: 'do pieczenia', x: 170, y: 96, w: 120, h: 34 },
];

export const KASA = { x: 110, y: 160, w: 80, h: 30 };

export const PRODUKTY: Produkt[] = [
  { id: 'mleko', label: 'mleko', regal: 'nabial', jedn: 'karton 1 l' },
  { id: 'maslo', label: 'masło', regal: 'nabial', jedn: 'kostka' },
  { id: 'ser-zolty', label: 'ser żółty', regal: 'nabial', jedn: 'kostka' },
  { id: 'ser-bialy', label: 'ser biały', regal: 'nabial', jedn: 'kostka' },
  { id: 'chleb-krojony', label: 'chleb razowy krojony', regal: 'pieczywo', jedn: 'bochenek' },
  { id: 'chleb-niekrojony', label: 'chleb razowy niekrojony', regal: 'pieczywo', jedn: 'bochenek' },
  { id: 'chleb-pszenny', label: 'chleb pszenny', regal: 'pieczywo', jedn: 'bochenek' },
  { id: 'jablko-czerwone', label: 'jabłko czerwone', regal: 'owoce', jedn: 'szt.' },
  { id: 'jablko-zielone', label: 'jabłko zielone', regal: 'owoce', jedn: 'szt.' },
  { id: 'gruszka', label: 'gruszka', regal: 'owoce', jedn: 'szt.' },
  { id: 'drozdze', label: 'drożdże', regal: 'pieczenie', jedn: 'kostka' },
  { id: 'maka', label: 'mąka', regal: 'pieczenie', jedn: 'torebka' },
];

/** Regał, przy którym stoi wózek (środek wózka w prostokącie powiększonym o `zapas`). */
export function regalPrzy(x: number, y: number, zapas = 14): RegalId | null {
  const r = REGALY.find((g) => x >= g.x - zapas && x <= g.x + g.w + zapas && y >= g.y - zapas && y <= g.y + g.h + zapas);
  return r ? r.id : null;
}

export const przyKasie = (x: number, y: number) => x >= KASA.x - 10 && x <= KASA.x + KASA.w + 10 && y >= KASA.y - 14 && y <= KASA.y + KASA.h + 10;

export type Koszyk = Record<string, number>;

export interface BladKuchni {
  /** Co pani Halina mówi na widok zakupów. */
  mowi: string;
  /** Fragment nagrania, który to rozstrzyga (`null` — rzecz spoza listy). */
  span: string | null;
  typ: 'liczba' | 'cecha' | 'zmiana' | 'niewiadoma' | 'nadmiar';
}

const n = (k: Koszyk, id: string) => k[id] ?? 0;

export function kuchnia(k: Koszyk): BladKuchni[] {
  const out: BladKuchni[] = [];
  const mleko = n(k, 'mleko');
  if (mleko !== 2)
    out.push({ span: 'mleko', typ: 'liczba', mowi: mleko === 0 ? 'A mleko? Nie ma mleka!' : mleko < 2 ? 'Tylko litr mleka? Prosiłam o dwa.' : `${mleko} litry mleka? Tyle nie wypiję.` });
  const chleby = n(k, 'chleb-krojony') + n(k, 'chleb-niekrojony') + n(k, 'chleb-pszenny');
  if (n(k, 'chleb-krojony')) out.push({ span: 'chleb', typ: 'cecha', mowi: 'Krojony? Przecież mówiłam: niekrojony, bo krojony mi wysycha.' });
  if (n(k, 'chleb-pszenny')) out.push({ span: 'chleb', typ: 'cecha', mowi: 'Pszenny? Prosiłam o razowy.' });
  if (chleby === 0) out.push({ span: 'chleb', typ: 'cecha', mowi: 'A chleb? Nie ma chleba!' });
  if (n(k, 'chleb-niekrojony') > 1) out.push({ span: 'chleb', typ: 'liczba', mowi: 'Dwa bochenki? Jeden wystarczy.' });
  if (n(k, 'jablko-czerwone')) out.push({ span: 'jablka', typ: 'cecha', mowi: 'Czerwone jabłka? Mówiłam, że są dla mnie za słodkie.' });
  const ziel = n(k, 'jablko-zielone');
  if (ziel !== 4 && !n(k, 'jablko-czerwone'))
    out.push({ span: 'jablka', typ: 'liczba', mowi: ziel === 0 ? 'A jabłka? Nie ma jabłek.' : `${ziel} ${ziel === 1 ? 'jabłko' : ziel < 5 ? 'jabłka' : 'jabłek'}? Prosiłam o cztery.` });
  if (n(k, 'maslo')) out.push({ span: 'maslo', typ: 'zmiana', mowi: 'Masło? Przecież mówiłam, że masła nie trzeba, mam całą kostkę!' });
  if (n(k, 'ser-bialy')) out.push({ span: 'ser', typ: 'niewiadoma', mowi: 'Biały? To nie ten ser, co zawsze. Ja biorę żółty.' });
  if (!n(k, 'ser-bialy') && !n(k, 'ser-zolty')) out.push({ span: 'ser', typ: 'niewiadoma', mowi: 'A ser? Zapomniałeś czy zapomniałaś?' });
  const dr = n(k, 'drozdze');
  if (dr !== 1) out.push({ span: 'drozdze', typ: 'liczba', mowi: dr === 0 ? 'Bez drożdży nie upiekę placka!' : 'Tyle drożdży? Wystarczy jedna kostka.' });
  if (n(k, 'gruszka')) out.push({ span: null, typ: 'nadmiar', mowi: 'Gruszki? Nie prosiłam, ale… niech będą.' });
  if (n(k, 'maka')) out.push({ span: null, typ: 'nadmiar', mowi: 'Mąkę mam, nie prosiłam o nią.' });
  return out;
}

// ── Co ucieka? ───────────────────────────────────────────────────────────────

/** Ślady szczegółu w notatce dziecka (małe litery, bez polskich znaków też). */
export const SLADY: Record<string, RegExp> = {
  mleko: /(dwa|2)\s*(l|litr)/,
  chleb: /niekroj|nie\s*kroj/,
  jablka: /(nie\s*czerw|ziel)/,
  maslo: /(bez|nie|nie\s*bra[cć]|nie\s*kupow).{0,12}mas[lł]|mas[lł]\w*.{0,12}(nie|bez|skre)/,
  ser: /ser/,
  drozdze: /dro[zż]d[zż]/,
};

export const TYP_SZCZEGOLU: Record<string, 'liczba' | 'cecha' | 'zmiana' | 'niewiadoma'> = {
  mleko: 'liczba',
  chleb: 'cecha',
  jablka: 'cecha',
  maslo: 'zmiana',
  ser: 'niewiadoma',
  drozdze: 'liczba',
};

/** Które szczegóły nagrania są w notatce (sama notatka, bez oceny pisowni). */
export function zanotowane(notatka: string): Set<string> {
  const low = notatka.toLowerCase();
  return new Set(Object.keys(SLADY).filter((k) => SLADY[k].test(low)));
}

// ── Karmienie Mruczka ────────────────────────────────────────────────────────

export type Pora = 'rano' | 'wieczor';
export type Miska = 'niebieska' | 'zolta';
export type Karma = 'mokra' | 'sucha' | 'mleko';

export interface Porcja {
  miska: Miska;
  karma: Karma;
  lyzki: number;
}

/** Porcje nałożone o danej porze: `${miska}:${karma}` → łyżki. */
export type Nalozone = Record<string, number>;

export const ZALECENIE: Record<Pora, Porcja> = {
  rano: { miska: 'niebieska', karma: 'mokra', lyzki: 2 },
  wieczor: { miska: 'zolta', karma: 'sucha', lyzki: 3 },
};

/** Co widać na rysunku kota (`kot.tsx`) — ta sama reakcja co w zdaniu. */
export type PozaKota = 'czeka' | 'mruczy' | 'brzuch' | 'miauczy' | 'waha' | 'odchodzi' | 'pelny';

export interface ReakcjaKota {
  ok: boolean;
  mowi: string;
  span: string;
  poza: PozaKota;
}

const KARMA_LABEL: Record<Karma, string> = { mokra: 'mokrej karmy', sucha: 'suchej karmy', mleko: 'mleka' };

export function mruczek(pora: Pora, nal: Nalozone): ReakcjaKota {
  const zal = ZALECENIE[pora];
  const span = pora === 'rano' ? 'rano' : 'wieczor';
  const wpisy = Object.entries(nal).filter(([, v]) => v > 0);
  if (wpisy.some(([k]) => k.endsWith(':mleko'))) return { ok: false, span: 'mleko', poza: 'brzuch', mowi: 'Mruczek wypił mleko… i teraz leży z bolącym brzuchem. Pani Halina prosiła, żeby mleka nie dawać.' };
  if (wpisy.length === 0) return { ok: false, span, poza: 'miauczy', mowi: 'Pusta miska. Mruczek miauczy z pretensją.' };
  const [klucz, lyzki] = wpisy.length === 1 ? wpisy[0] : ['', 0];
  if (wpisy.length > 1) return { ok: false, span, poza: 'waha', mowi: 'Dwie miski naraz? Mruczek przechodzi od jednej do drugiej i nie wie, którą ruszyć.' };
  const [miska, karma] = klucz.split(':') as [Miska, Karma];
  if (miska !== zal.miska) return { ok: false, span, poza: 'odchodzi', mowi: `Mruczek wącha ${miska === 'niebieska' ? 'niebieską' : 'żółtą'} miskę i odchodzi. To nie jego miska o tej porze.` };
  if (karma !== zal.karma) return { ok: false, span, poza: 'odchodzi', mowi: `Mruczek wącha i kręci nosem — o tej porze nie je ${KARMA_LABEL[karma]}.` };
  if (lyzki < zal.lyzki) return { ok: false, span, poza: 'miauczy', mowi: 'Mruczek zjada w mgnieniu oka i miauczy, że mało.' };
  if (lyzki > zal.lyzki) return { ok: false, span, poza: 'pelny', mowi: 'Mruczek je i je… a potem nie może wskoczyć na parapet. Za dużo.' };
  return { ok: true, span, poza: 'mruczy', mowi: 'Mruczek zjada wszystko, myje łapkę i mruczy.' };
}
