/**
 * Blok 4 — „Lupa nad monetą” (źródło, pierwszy konsument silnika
 * `source-desk`) — geometria napisu, hotspot i paszport źródła, bez Reacta.
 *
 * Moneta to kompozyt (decyzja autora kursu, 2026-09-26): krążek z ptakiem
 * generuje model sunburst (bez liter — generator nie umie prawdziwego
 * napisu), a legendę PRINCES POLONIE dorysowuje wektorowy SVG na podstawie
 * fotografii denara. Wzór faktów (sprawdzone 2026-09-26, Wikipedia „Denar
 * Princes Polonie”, folder NBP „Historia Monety Polskiej”):
 * - srebro, śr. ok. 19,2 mm (18–20 mm), emisja Bolesława Chrobrego, ok. 1000 r.;
 * - uważany za najstarszy zabytek z nazwą Polski (po łacinie) — w lekcji
 *   ostrożnie „jeden z najstarszych zachowanych zapisów”, bo z tego samego
 *   okresu są też zapisy w kronikach i żywotach (review 2026-10-17);
 * - PRINCES POLONIE = „książę Polski” (łac. princeps Poloniae);
 * - legenda pomija imię władcy, operuje tytułem „princes” (władca);
 * - najliczniej bita moneta Chrobrego (ok. 80 znanych egzemplarzy wszystkich
 *   odmian); awers z ptakiem (dawniej sądzono: orzeł; badania: raczej paw).
 *
 * Litery otoku liczone są deterministycznie (zaokrąglone — hydracja) i z tych
 * samych stałych wynika hotspot słowa POLONIE: lupa zawsze zgadza się
 * z rysunkiem. Stałe środka i promienia skalibrowane do wygenerowanego
 * krążka (kwadrat 880×880, moneta wyśrodkowana).
 */

import type { PassportCard, PassportFieldDef } from '../../source-desk/passport';

export const COIN_VIEWBOX = 200;
/** Środek krążka na wygenerowanym obrazie (jednostki viewBox). */
export const COIN_CX = 102;
export const COIN_CY = 100;
/** Promień okręgu, na którym stoją litery otoku (środek obwódki). */
export const LETTER_RADIUS = 76;

export interface CoinLetter {
  char: string;
  x: number;
  y: number;
  /** Obrót litery w stopniach (promieniowo). */
  rotate: number;
  /** Czy litera należy do słowa POLONIE (szukane lupą). */
  sought: boolean;
}

const round1 = (n: number): number => Math.round(n * 10) / 10;

/** Kąt w stopniach (0 = prawo, 90 = dół w SVG) → punkt na okręgu liter. */
function pointAt(angleDeg: number): { x: number; y: number } {
  const rad = (angleDeg * Math.PI) / 180;
  return {
    x: round1(COIN_CX + LETTER_RADIUS * Math.cos(rad)),
    y: round1(COIN_CY + LETTER_RADIUS * Math.sin(rad)),
  };
}

function arcLetters(
  word: string,
  centerAngle: number,
  spread: number,
  sought: boolean,
  /** Dolny łuk: litery obrócone tak, żeby czytać je normalnie (rysunek pomocniczy). */
  flip: boolean
): CoinLetter[] {
  return word.split('').map((char, i) => {
    // Górny łuk idzie od lewej do prawej przy rosnącym kącie; dolny musi iść
    // odwrotnie (od dołu-lewo do dołu-prawo), inaczej słowo wychodzi wspak.
    const t = word.length === 1 ? 0.5 : i / (word.length - 1);
    const angle = flip ? centerAngle + spread / 2 - t * spread : centerAngle - spread / 2 + t * spread;
    const { x, y } = pointAt(angle);
    return { char, x, y, rotate: round1(flip ? angle - 90 : angle + 90), sought };
  });
}

/**
 * Napis w otoku: PRINCES górą (czytany normalnie), POLONIE dołem.
 * Dolne litery stoją „nogami do środka”, żeby dało się je przeczytać bez
 * obracania monety (podpis pod monetą rozdziela ilustrację od napisu).
 */
export const COIN_LETTERS: CoinLetter[] = [
  ...arcLetters('PRINCES', -90, 96, false, false),
  ...arcLetters('POLONIE', 90, 96, true, true),
];

function boxAround(letters: CoinLetter[]) {
  const xs = letters.map((l) => l.x);
  const ys = letters.map((l) => l.y);
  const pad = 12;
  return {
    x0: Math.min(...xs) - pad,
    y0: Math.min(...ys) - pad,
    x1: Math.max(...xs) + pad,
    y1: Math.max(...ys) + pad,
  };
}

/** Prostokąt wokół liter POLONIE — tam lupa znajduje napis. */
export const HOTSPOT = boxAround(COIN_LETTERS.filter((l) => l.sought));
/** Prostokąt wokół liter PRINCES — drugie słowo, o którym mówi odrzut. */
export const DECOY = boxAround(COIN_LETTERS.filter((l) => !l.sought));

const inBox = (box: typeof HOTSPOT, u: number, v: number): boolean => {
  const x = u * COIN_VIEWBOX;
  const y = v * COIN_VIEWBOX;
  return x >= box.x0 && x <= box.x1 && y >= box.y0 && y <= box.y1;
};

/** Sędzia lupy: pozycja znormalizowana 0–1 → trafienie w hotspot. */
export function isOverHotspot(u: number, v: number): boolean {
  return inBox(HOTSPOT, u, v);
}

/** Gdzie stoi lupa, gdy nie na POLONIE — odrzut mówi, co dziecko widzi. */
export function whereIsLupa(u: number, v: number): 'polonie' | 'princes' | 'ptak' | 'obok' {
  if (inBox(HOTSPOT, u, v)) return 'polonie';
  if (inBox(DECOY, u, v)) return 'princes';
  const dx = u * COIN_VIEWBOX - COIN_CX;
  const dy = v * COIN_VIEWBOX - COIN_CY;
  return Math.hypot(dx, dy) < LETTER_RADIUS - 10 ? 'ptak' : 'obok';
}

// ─── Paszport źródła (silnik `source-desk`) ───

export type PassportField = 'kto' | 'kiedy' | 'po co';

export const PASSPORT_FIELDS: PassportFieldDef<PassportField>[] = [
  { id: 'kto', question: 'Kto kazał ją wybić?' },
  { id: 'kiedy', question: 'Kiedy to było?' },
  { id: 'po co', question: 'Po co komu własna moneta?' },
];

/** Kolejność celowo pomieszana — poprawna karteczka nie stoi zawsze pierwsza. */
export const PASSPORT_BANK: PassportCard<PassportField>[] = [
  { id: 'kupiec', text: 'Kupiec na targu', field: null, whyNot: 'Kupiec monet używa, ale ich nie wybija. Na monecie jest tytuł „princes” — książę, czyli władca. To on kazał ją wybić.' },
  { id: 'tysiaclecie', text: 'Około 1000 lat temu', field: 'kiedy' },
  { id: 'skarbiec', text: 'Żeby leżała w skarbcu i ładnie wyglądała', field: null, whyNot: 'Tę monetę bito tysiącami — była najliczniej bitą monetą Chrobrego. Ozdoby nie wybija się tysiącami; ona służyła do płacenia.' },
  { id: 'wladca', text: 'Władca Polski (Bolesław Chrobry)', field: 'kto' },
  { id: 'sto-lat', text: '100 lat temu', field: null, whyNot: '100 lat temu Polska miała już inne monety. Twoja leżała najgłębiej w wykopalisku — pod skorupą sprzed kilkuset lat.' },
  { id: 'archeolog', text: 'Archeolog', field: null, whyNot: 'Archeolog monety wykopuje z ziemi — tak jak ty przed chwilą. Wybija je władca.' },
  { id: 'placic', text: 'Żeby płacić i pokazać, czyja to ziemia', field: 'po co' },
];
