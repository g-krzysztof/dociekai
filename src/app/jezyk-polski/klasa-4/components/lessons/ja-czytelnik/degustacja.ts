import type { Korpus } from '../../../lib/korpus/types';

/**
 * L2 „Ja, czytelnik” — czysta logika (bez Reacta).
 *
 * **Ślepa degustacja:** otwarcie = pierwsze zdania pierwszego odcinka książki
 * z Czytelni (rejestr O1–O6; O6 = „Złota kaczka”, bo Twain wypadł — D6a), więc nagrania są te same co w Czytelni. Talerz
 * stoi na stole w odległości 0 (daleko) … 100 (tuż przy tobie); gust wynika z
 * dwóch talerzy przysuniętych najbliżej — z gestów, nie z ankiety.
 *
 * **Plan czytania:** odcinki-żetony rozkładane na dni (`YYYY-MM-DD` → liczba
 * odcinków, jak `ShelfEntry.plan`); daty lokalne, nigdy UTC.
 */

/** Kolejność talerzy na stole (O1–O6) — gatunki i nastroje przemieszane. */
export const PLATES = ['krasnoludki', 'ksiega-dzungli', 'brzydkie-kaczatko', 'dwoch-takich', 'zlota-kaczka', 'krol-macius'] as const;
export type PlateId = (typeof PLATES)[number];

/** Odległość talerza na starcie — środek stołu: ani blisko, ani daleko. */
export const START_DISTANCE = 50;

const wordCount = (text: string) => text.split(/\s+/).filter((w) => /\p{L}/u.test(w)).length;

/**
 * Zdania otwarcia: od początku, aż uzbiera się `min` słów; na końcu zdania,
 * nie dalej niż `max` (chyba że już pierwsze zdanie jest dłuższe).
 */
export function openingUnits(k: Korpus, min = 110, max = 210): string[] {
  const out: string[] = [];
  let words = 0;
  for (const u of k.units) {
    const w = wordCount(u.text);
    if (out.length && words + w > max) break;
    out.push(u.id);
    words += w;
    if (words >= min) break;
  }
  return out;
}

export function openingWords(k: Korpus, units: string[]): number {
  return units.reduce((sum, id) => sum + wordCount(k.unitById[id].text), 0);
}

/** Talerze od najbliższego; remis — kolejność na stole. */
export function byCloseness(dist: Record<string, number>): PlateId[] {
  return [...PLATES].sort((a, b) => (dist[b] ?? START_DISTANCE) - (dist[a] ?? START_DISTANCE) || PLATES.indexOf(a) - PLATES.indexOf(b));
}

/** Czy dziecko w ogóle coś przesunęło — gust z sześciu talerzy na środku nic nie mówi. */
export function hasPreference(dist: Record<string, number>): boolean {
  const values = PLATES.map((p) => dist[p] ?? START_DISTANCE);
  return Math.max(...values) - Math.min(...values) >= 15;
}

export interface PlateInfo {
  id: string;
  title: string;
  genre: string;
  mood: string;
}

/**
 * Wniosek z ruchów dziecka: dwa talerze przysunięte najbliżej i co je łączy.
 * Bez rodzaju gramatycznego („przysunięte”, nie „przysunąłeś”).
 */
export function gustMessage(order: PlateId[], info: Record<string, PlateInfo>): string {
  const [a, b] = order.map((id) => info[id]);
  if (!a || !b) return '';
  const genres =
    a.genre === b.genre
      ? `dwie pozycje z jednego gatunku: ${a.genre}`
      : `${a.genre} i ${b.genre}`;
  return `Najbliżej siebie przysunięte: „${a.title}” i „${b.title}” — ${genres}. Nastroje: ${a.mood}; ${b.mood}. To twój gust, wyczytany z twoich ruchów. Inna kolejność niż u kogoś innego to nie błąd.`;
}

// ── Plan czytania ───────────────────────────────────────────────────────────

/** Lokalna data `YYYY-MM-DD` (nigdy UTC). */
export function localDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

/** `count` kolejnych dni od `today` (włącznie). Liczone w południe — bez pułapki zmiany czasu. */
export function nextDays(today: string, count: number): string[] {
  const [y, m, d] = today.split('-').map(Number);
  return Array.from({ length: count }, (_, i) => localDate(new Date(y, m - 1, d + i, 12)));
}

const WEEKDAYS = ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota'];
const WEEKDAYS_SHORT = ['nd', 'pn', 'wt', 'śr', 'cz', 'pt', 'sb'];
const MONTHS_GEN = ['stycznia', 'lutego', 'marca', 'kwietnia', 'maja', 'czerwca', 'lipca', 'sierpnia', 'września', 'października', 'listopada', 'grudnia'];

export function dayParts(date: string): { weekday: string; short: string; day: number; month: string; weekend: boolean } {
  const [y, m, d] = date.split('-').map(Number);
  const dt = new Date(y, m - 1, d, 12);
  const wd = dt.getDay();
  return { weekday: WEEKDAYS[wd], short: WEEKDAYS_SHORT[wd], day: d, month: MONTHS_GEN[m - 1], weekend: wd === 0 || wd === 6 };
}

export const placedCount = (plan: Record<string, number>) => Object.values(plan).reduce((s, n) => s + Math.max(0, n), 0);

/** Żeton na dzień — tylko dopóki są żetony do rozłożenia. */
export function addToDay(plan: Record<string, number>, day: string, total: number): Record<string, number> {
  if (placedCount(plan) >= total) return plan;
  return { ...plan, [day]: (plan[day] ?? 0) + 1 };
}

export function removeFromDay(plan: Record<string, number>, day: string): Record<string, number> {
  if (!plan[day]) return plan;
  const next = { ...plan, [day]: plan[day] - 1 };
  if (next[day] <= 0) delete next[day];
  return next;
}

/** Które odcinki wypadają którego dnia (odcinki idą po kolei, dni po kolei). */
export function episodesByDay(plan: Record<string, number>): Record<string, number[]> {
  const out: Record<string, number[]> = {};
  let n = 1;
  for (const day of Object.keys(plan).sort()) {
    out[day] = [];
    for (let i = 0; i < plan[day]; i += 1) out[day].push(n++);
  }
  return out;
}

/** Ostatni dzień z odcinkiem — gdy wszystkie żetony leżą; inaczej `null`. */
export function planEnd(plan: Record<string, number>, total: number): string | null {
  if (placedCount(plan) < total) return null;
  const days = Object.keys(plan).filter((d) => plan[d] > 0).sort();
  return days.at(-1) ?? null;
}

export function endMessage(plan: Record<string, number>, total: number): string {
  const placed = placedCount(plan);
  if (placed === 0) return 'Połóż pierwszy odcinek na dniu, w którym zaczniesz.';
  const end = planEnd(plan, total);
  if (!end) {
    const left = total - placed;
    return `Zostało ${left} ${left === 1 ? 'odcinek' : left < 5 ? 'odcinki' : 'odcinków'} do rozłożenia.`;
  }
  const p = dayParts(end);
  return `Przy tym planie skończysz w ${p.weekday === 'niedziela' ? 'niedzielę' : p.weekday === 'środa' ? 'środę' : p.weekday === 'sobota' ? 'sobotę' : p.weekday}, ${p.day} ${p.month}.`;
}

/** Podpowiedź dla dnia z wieloma odcinkami — bez blokady. */
export function heavyDayNote(count: number, minutesPerEpisode: number): string | null {
  if (count < 3) return null;
  return `${count} odcinki jednego dnia to ok. ${count * minutesPerEpisode} minut czytania. Da się — ale to dużo.`;
}

// ── Pierwsze wrażenie ───────────────────────────────────────────────────────

/** Wskazówka „wciągacza”: 0 = nudno … 100 = nie mogę się oderwać. Kąt w stopniach (−90 lewo, 90 prawo). */
export const gaugeAngle = (value: number) => Math.round(((Math.max(0, Math.min(100, value)) - 50) / 50) * 90);

/** Wartość z punktu na tarczy (środek tarczy `cx, cy`, punkt `x, y` w tym samym układzie). */
export function gaugeFromPoint(cx: number, cy: number, x: number, y: number): number {
  const angle = Math.atan2(x - cx, cy - y); // 0 = pionowo w górę
  const deg = Math.max(-90, Math.min(90, (angle * 180) / Math.PI));
  return Math.round(((deg + 90) / 180) * 100);
}

export function gaugeLabel(value: number): string {
  if (value < 20) return 'nudno';
  if (value < 45) return 'tak sobie';
  if (value < 70) return 'ciekawie';
  if (value < 90) return 'wciąga';
  return 'nie mogę się oderwać';
}

/** Niska wskazówka: wolno zmienić książkę. */
export const LOW_GAUGE = 30;
