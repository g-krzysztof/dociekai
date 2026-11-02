/**
 * L16 „Wyścig i tort” — blok 1: karty przysłówków (T-L16-1, napisane dla
 * kursu), odcinki toru i fizyka przejazdu. Czysta logika.
 *
 * Zasada gry: **karta robi dokładnie to, co mówi jej słowo** — „szybko”
 * przyspiesza, „cicho” wycisza muszlę, „prosto” prostuje ruch. Czego słowo
 * nie mówi, tego karta nie zmienia (zwykły ślimak kołysze się trochę na boki
 * i stuka muszlą). Wynik przejazdu zależy tylko od karty, nigdy od szybkości
 * palca: palec wyznacza drogę, a rywal porusza się w proporcji do ślimaka
 * dziecka, więc refleks nic nie daje.
 */

export type KartaId = 'szybko' | 'powoli' | 'ostroznie' | 'cicho' | 'prosto' | 'zygzakiem' | 'szybciej';

export interface Karta {
  id: KartaId;
  slowo: string;
  /** Prędkość w jednostkach planszy na sekundę. */
  tempo: number;
  /** Kołysanie na boki (amplituda w jednostkach planszy). */
  chwiej: number;
  /** Trzyma się lodu. */
  przyczepna: boolean;
  /** Muszla nie stuka. */
  cicha: boolean;
}

const ZWYKLE = 45;
const WOLNO = 28;
const ZWYKLE_CHWIEJ = 5;

export const KARTY: Record<KartaId, Karta> = {
  szybko: { id: 'szybko', slowo: 'szybko', tempo: 75, chwiej: ZWYKLE_CHWIEJ, przyczepna: false, cicha: false },
  powoli: { id: 'powoli', slowo: 'powoli', tempo: WOLNO, chwiej: ZWYKLE_CHWIEJ, przyczepna: false, cicha: false },
  ostroznie: { id: 'ostroznie', slowo: 'ostrożnie', tempo: WOLNO, chwiej: 1, przyczepna: true, cicha: false },
  cicho: { id: 'cicho', slowo: 'cicho', tempo: ZWYKLE, chwiej: ZWYKLE_CHWIEJ, przyczepna: false, cicha: true },
  prosto: { id: 'prosto', slowo: 'prosto', tempo: ZWYKLE, chwiej: 0, przyczepna: false, cicha: false },
  zygzakiem: { id: 'zygzakiem', slowo: 'zygzakiem', tempo: ZWYKLE, chwiej: 16, przyczepna: false, cicha: false },
  szybciej: { id: 'szybciej', slowo: 'szybciej', tempo: 105, chwiej: ZWYKLE_CHWIEJ, przyczepna: false, cicha: false },
};

/** Ręka kart — kolejność stała, „szybciej” składa się dopiero w finale. */
export const REKA: KartaId[] = ['powoli', 'cicho', 'szybko', 'zygzakiem', 'ostroznie', 'prosto'];

// ── Tor ──

export type OdcinekId = 'prosta' | 'lod' | 'pies' | 'kladka' | 'final';

export interface Odcinek {
  id: OdcinekId;
  nazwa: string;
  opis: string;
  /** Droga ślimaka dziecka (plansza 240 × 320, start na dole). */
  d: string;
  /** Strefa przeszkody jako ułamek drogi. */
  strefa?: [number, number];
  /** Droga i tempo rywala. */
  rywal?: { d: string; tempo: number; karta?: KartaId };
}

const PROSTA = 'M150 296 L150 30';
const PROSTA_RYWALA = 'M90 296 L90 30';

export const ODCINKI: Odcinek[] = [
  {
    id: 'prosta',
    nazwa: 'Prosta',
    opis: 'Obok startuje rywal. Pełznie żwawo — szybciej niż zwykły ślimak.',
    d: PROSTA,
    rywal: { d: PROSTA_RYWALA, tempo: 60 },
  },
  {
    id: 'lod',
    nazwa: 'Lód na zakręcie',
    opis: 'Na zakręcie zamarzła kałuża. Za zakrętem jest rów.',
    d: 'M180 296 L180 210 Q180 150 120 150 Q60 150 60 90 L60 30',
    strefa: [0.24, 0.8],
  },
  {
    id: 'pies',
    nazwa: 'Śpiący pies',
    opis: 'Przy drodze śpi pies. Budzi go każdy stuk.',
    d: 'M60 296 L60 230 Q60 170 120 170 Q180 170 180 110 L180 30',
    strefa: [0.3, 0.75],
  },
  {
    id: 'kladka',
    nazwa: 'Wąska kładka',
    opis: 'Przez strumień prowadzi kładka — wąska jak deska.',
    d: 'M120 296 L120 30',
    strefa: [0.32, 0.66],
  },
  {
    id: 'final',
    nazwa: 'Finał',
    opis: 'Rywal położył na swoim ślimaku kartę „szybko”.',
    d: PROSTA,
    rywal: { d: PROSTA_RYWALA, tempo: KARTY.szybko.tempo, karta: 'szybko' },
  },
];

/** Połowa szerokości kładki: ślimak, który kołysze się szerzej, spada. */
export const POL_KLADKI = 4;

export type Upadek = 'poslizg' | 'pies' | 'woda' | 'rywal' | 'remis';
export type Przejazd = { wynik: 'meta' } | { wynik: 'upadek'; rodzaj: Upadek; przy: number };

/** Co się stanie z ślimakiem z tą kartą na tym odcinku — rozstrzygnięte z góry, zanim ruszy. */
export function przejazd(o: Odcinek, k: KartaId): Przejazd {
  const karta = KARTY[k];
  if (o.id === 'lod' && !karta.przyczepna && karta.tempo > WOLNO) return { wynik: 'upadek', rodzaj: 'poslizg', przy: o.strefa![0] + 0.06 };
  if (o.id === 'pies' && !karta.cicha) return { wynik: 'upadek', rodzaj: 'pies', przy: o.strefa![0] };
  if (o.id === 'kladka' && karta.chwiej > POL_KLADKI) return { wynik: 'upadek', rodzaj: 'woda', przy: o.strefa![0] + 0.05 };
  if (o.rywal) {
    if (karta.tempo < o.rywal.tempo) return { wynik: 'upadek', rodzaj: 'rywal', przy: Math.round((karta.tempo / o.rywal.tempo) * 1000) / 1000 };
    if (karta.tempo === o.rywal.tempo) return { wynik: 'upadek', rodzaj: 'remis', przy: 1 };
  }
  return { wynik: 'meta' };
}

/** Postęp rywala przy danym postępie ślimaka dziecka (rywal rusza się tylko razem z nim). */
export function postepRywala(o: Odcinek, k: KartaId, frac: number): number {
  if (!o.rywal) return 0;
  return Math.min(1, (frac * o.rywal.tempo) / KARTY[k].tempo);
}

/** Zdanie po przejeździe — konkret, nie ocena. */
export function coSieStalo(o: Odcinek, k: KartaId, p: Przejazd): string {
  const s = `„${KARTY[k].slowo}”`;
  if (p.wynik === 'meta') {
    if (o.id === 'prosta') return `Meta przed rywalem! Z kartą ${s} ślimak pełzł szybciej niż on.`;
    if (o.id === 'lod') return `Meta! Z kartą ${s} ślimak sunął po lodzie tak wolno, że ani razu się nie poślizgnął.`;
    if (o.id === 'pies') return `Meta! Z kartą ${s} muszla ani razu nie stuknęła — pies śpi dalej.`;
    if (o.id === 'kladka') return `Meta! Z kartą ${s} ślimak nie kołysał się na boki i przeszedł środkiem kładki.`;
    return `Wygrana! Karta ${s} jest mocniejsza niż „szybko” rywala.`;
  }
  switch (p.rodzaj) {
    case 'poslizg':
      return k === 'szybko'
        ? `Z kartą ${s} ślimak wjechał na lód za szybko — poślizg i rów.`
        : `Z kartą ${s} ślimak pełznie zwyczajnym tempem, a na lodzie to za dużo — poślizg i rów.`;
    case 'pies':
      return `Muszla stuknęła o kamień i pies się obudził. Ślimak schował się w muszli. Karta ${s} nie mówi nic o stukaniu.`;
    case 'woda':
      return k === 'zygzakiem'
        ? `Z kartą ${s} ślimak pełzł od brzegu do brzegu — i zsunął się z kładki do wody.`
        : `Z kartą ${s} ślimak kołysał się na boki, jak to ślimak — kładka jest za wąska, plusk!`;
    case 'rywal':
      return `Rywal był na mecie pierwszy. Z kartą ${s} Twój ślimak pełznie wolniej niż on.`;
    case 'remis':
      return 'Remis! Oba ślimaki pełzły szybko — dokładnie tak samo. Żeby wygrać, trzeba czegoś więcej niż „szybko”.';
  }
}

/** Ile odcinków toru zostało przejechanych do mety (w kolejności). */
export function ileZaliczonych(zaliczone: Partial<Record<OdcinekId, KartaId>>): number {
  let n = 0;
  for (const o of ODCINKI) {
    if (!zaliczone[o.id]) break;
    n += 1;
  }
  return n;
}

// ── Geometria drogi ──

export interface Probki {
  x: number[];
  y: number[];
  s: number[];
  len: number;
}

type Pkt = [number, number];

/** Próbkuje drogę z poleceń M/L/Q (tylko takie są w danych) co ok. 2 jednostki. */
export function probkuj(d: string): Probki {
  const tok = d.match(/[MLQ]|-?\d+(?:\.\d+)?/g) ?? [];
  const pts: Pkt[] = [];
  let cur: Pkt = [0, 0];
  let i = 0;
  const num = () => Number(tok[i++]);
  while (i < tok.length) {
    const c = tok[i++];
    if (c === 'M') {
      cur = [num(), num()];
      pts.push(cur);
    } else if (c === 'L') {
      const p: Pkt = [num(), num()];
      const n = Math.max(1, Math.ceil(Math.hypot(p[0] - cur[0], p[1] - cur[1]) / 2));
      for (let j = 1; j <= n; j++) pts.push([cur[0] + ((p[0] - cur[0]) * j) / n, cur[1] + ((p[1] - cur[1]) * j) / n]);
      cur = p;
    } else if (c === 'Q') {
      const k: Pkt = [num(), num()];
      const p: Pkt = [num(), num()];
      const approx = Math.hypot(k[0] - cur[0], k[1] - cur[1]) + Math.hypot(p[0] - k[0], p[1] - k[1]);
      const n = Math.max(2, Math.ceil(approx / 2));
      for (let j = 1; j <= n; j++) {
        const t = j / n;
        const a = (1 - t) * (1 - t);
        const b = 2 * (1 - t) * t;
        const e = t * t;
        pts.push([a * cur[0] + b * k[0] + e * p[0], a * cur[1] + b * k[1] + e * p[1]]);
      }
      cur = p;
    }
  }
  const x: number[] = [];
  const y: number[] = [];
  const s: number[] = [];
  let acc = 0;
  pts.forEach((p, j) => {
    if (j > 0) acc += Math.hypot(p[0] - pts[j - 1][0], p[1] - pts[j - 1][1]);
    x.push(p[0]);
    y.push(p[1]);
    s.push(acc);
  });
  return { x, y, s, len: acc };
}

const r1 = (n: number) => Math.round(n * 10) / 10;

/** Punkt drogi przy ułamku `frac`, z kołysaniem `chwiej` w poprzek drogi; `kat` w stopniach (0 = w górę planszy). */
export function punkt(p: Probki, frac: number, chwiej = 0): { x: number; y: number; kat: number } {
  const cel = Math.max(0, Math.min(1, frac)) * p.len;
  let j = 1;
  while (j < p.s.length - 1 && p.s[j] < cel) j++;
  const s0 = p.s[j - 1];
  const s1 = p.s[j];
  const t = s1 > s0 ? (cel - s0) / (s1 - s0) : 0;
  const dx = p.x[j] - p.x[j - 1];
  const dy = p.y[j] - p.y[j - 1];
  const dl = Math.hypot(dx, dy) || 1;
  const off = chwiej * Math.sin(cel / 11);
  // normalna w lewo od kierunku jazdy
  const x = p.x[j - 1] + dx * t + (dy / dl) * off;
  const y = p.y[j - 1] + dy * t - (dx / dl) * off;
  const kat = (Math.atan2(dx, -dy) * 180) / Math.PI;
  return { x: r1(x), y: r1(y), kat: Math.round(kat) };
}

/** Najbliższy punkt drogi do (x, y): ułamek drogi i odległość. */
export function najblizszy(p: Probki, x: number, y: number): { frac: number; dist: number } {
  let best = 0;
  let bd = Infinity;
  for (let j = 0; j < p.x.length; j++) {
    const d = Math.hypot(p.x[j] - x, p.y[j] - y);
    if (d < bd) {
      bd = d;
      best = j;
    }
  }
  return { frac: p.len ? p.s[best] / p.len : 0, dist: bd };
}

/** Palec dalej od drogi niż tyle jednostek nie prowadzi ślimaka. */
export const TOLERANCJA = 40;
/** Palec może wyprzedzić dotychczasową drogę najwyżej o tyle jednostek (prowadzenie, nie skok na metę). */
export const ZASIEG = 50;

/** Nowy cel ślimaka po ruchu palca: rośnie tylko, gdy palec jest przy drodze i niedaleko przed celem. */
export function prowadz(p: Probki, cel: number, x: number, y: number): number {
  const n = najblizszy(p, x, y);
  if (n.dist > TOLERANCJA) return cel;
  if ((n.frac - cel) * p.len > ZASIEG) return cel;
  return Math.max(cel, n.frac);
}

/** Polyline fragmentu drogi [a, b] (do rysowania lodu i kładki). */
export function fragment(p: Probki, a: number, b: number): string {
  const out: string[] = [];
  for (let j = 0; j < p.x.length; j++) {
    const f = p.s[j] / p.len;
    if (f >= a && f <= b) out.push(`${r1(p.x[j])},${r1(p.y[j])}`);
  }
  return out.join(' ');
}

// ── Finał: składanie „szybciej” ──

/** Kafelki karty finałowej: „szybko” + „-ciej” → „szybciej” (stopniowanie — tylko zajrzenie, bez terminu). */
export const KAFELKI = { rdzen: 'szybko', koncowka: '-ciej', razem: 'szybciej' } as const;
