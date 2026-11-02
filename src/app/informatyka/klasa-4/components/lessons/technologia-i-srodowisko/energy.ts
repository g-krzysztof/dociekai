/**
 * Liczby i rachunki lekcji `technologia-i-srodowisko` — bez Reacta, żeby każdy
 * blok liczył z tych samych danych i żeby dało się je sprawdzić osobno.
 *
 * **Wszystkie moce są przykładowe, ale z prawdziwego rzędu wielkości** — tyle,
 * ile typowo pokazuje watomierz wpięty między gniazdko a urządzenie. Konkretny
 * telewizor czy dekoder może brać inaczej i lekcja mówi to dziecku wprost.
 * Te same urządzenia wracają w blokach 2, 3 i 5 z tymi samymi liczbami: lodówka
 * z bloku 2 (600 Wh na dobę) to średnio 25 W, czyli dokładnie tyle, ile pokazuje
 * licznik w nocy w bloku 3, a czuwanie salonu z bloku 3 (23,5 W) jest czuwaniem
 * gniazdka „Salon” w zadaniu.
 */

/**
 * Miarka lekcji: **zagotowanie litra wody w czajniku ≈ 100 Wh**. Podgrzanie
 * kilograma wody o 85 °C to 356 kJ, czyli 99 Wh — waty i watogodziny są dla
 * dziesięciolatka abstrakcją, a czajnik stoi w każdej kuchni.
 */
export const KETTLE_WH = 100;

/** Liczba z polskim przecinkiem: 0,5 · 12 · 2,4. */
export function num(value: number, digits = 1): string {
  const rounded = Number(value.toFixed(digits));
  return rounded.toLocaleString('pl-PL', { maximumFractionDigits: digits });
}

/** Waty z jednym miejscem po przecinku tylko wtedy, gdy są potrzebne: 0,5 W · 23,5 W · 2000 W. */
export function formatW(watts: number): string {
  return `${num(watts, 1)} W`;
}

export function formatWh(wh: number): string {
  if (wh >= 1000) return `${num(wh / 1000, 1)} kWh`;
  return `${num(wh, 0)} Wh`;
}

/** Polska odmiana „czajnik”; ułamek zawsze w dopełniaczu liczby pojedynczej („2,4 czajnika”). */
export function kettleWord(count: number): string {
  if (!Number.isInteger(count)) return 'czajnika';
  if (count === 1) return 'czajnik';
  const last = count % 10;
  const lastTwo = count % 100;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return 'czajniki';
  return 'czajników';
}

/** „2,4 czajnika”, „6 czajników”, „2282 czajniki” — do dziesięciu z jednym miejscem po przecinku. */
export function formatKettles(wh: number): string {
  const raw = wh / KETTLE_WH;
  const value = raw >= 10 ? Math.round(raw) : Number(raw.toFixed(1));
  return `${num(value, 1)} ${kettleWord(value)}`;
}

/** Minuty od północy → „07:30”. Koniec doby to „24:00”, a nie znów „00:00”. */
export function clock(minutes: number): string {
  if (minutes >= 1440) return '24:00';
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`;
}

/** Minuty → „7:30” bez zera wiodącego, tak jak mówi się o godzinach w zdaniu. */
export function hour(minutes: number): string {
  const m = ((Math.round(minutes) % 1440) + 1440) % 1440;
  return `${Math.floor(m / 60)}:${String(m % 60).padStart(2, '0')}`;
}

/** Zaokrąglenie współrzędnych liczonych z sin/cos — serwer i przeglądarka muszą narysować to samo. */
export const r2 = (value: number) => Math.round(value * 100) / 100;

// ─── Blok 2: doba w przyspieszeniu ─────────────────────────────────────────

export type Interval = readonly [from: number, to: number];

export interface DayDevice {
  id: string;
  name: string;
  /** Moc w chwili pracy, W. */
  power: number;
  /** Kiedy pracuje w ciągu doby, w minutach od północy. */
  intervals: Interval[];
  /** Jedno zdanie o tym, skąd bierze się jego wynik — do podsumowania. */
  why: string;
}

/** Sprężarka lodówki włącza się sama: kwadrans co godzinę, razem 6 godzin na dobę. */
const FRIDGE_CYCLES: Interval[] = Array.from({ length: 24 }, (_, h) => [h * 60, h * 60 + 15] as const);

export const DAY_DEVICES: DayDevice[] = [
  {
    id: 'czajnik',
    name: 'Czajnik',
    power: 2000,
    intervals: [
      [420, 423],
      [930, 933],
      [1170, 1173],
    ],
    why: '2000 W, ale trzy razy po trzy minuty — razem 9 minut.',
  },
  {
    id: 'lodowka',
    name: 'Lodówka',
    power: 100,
    intervals: FRIDGE_CYCLES,
    why: 'jej sprężarka bierze 100 W, dwadzieścia razy mniej niż czajnik — ale włącza się sama co godzinę, razem na 6 godzin.',
  },
  {
    id: 'telewizor',
    name: 'Telewizor',
    power: 100,
    intervals: [[1080, 1260]],
    why: '100 W przez trzy wieczorne godziny.',
  },
  {
    id: 'router',
    name: 'Router Wi-Fi',
    power: 10,
    intervals: [[0, 1440]],
    why: 'tylko 10 W — ale przez całą dobę, bez przerwy.',
  },
  {
    id: 'ladowarka',
    name: 'Ładowarka telefonu',
    power: 10,
    intervals: [[1320, 1440]],
    why: '10 W przez dwie godziny ładowania.',
  },
];

/** Energia zużyta od północy do minuty `t`, Wh. */
export function energyUntil(device: DayDevice, t: number): number {
  let minutes = 0;
  for (const [from, to] of device.intervals) {
    if (t > from) minutes += Math.min(t, to) - from;
  }
  return (device.power * minutes) / 60;
}

export const isOnAt = (device: DayDevice, t: number) => device.intervals.some(([from, to]) => t >= from && t < to);

/**
 * Podział puli żetonów proporcjonalnie do udziałów — metodą największych
 * reszt, żeby suma zawsze wyszła równo `total`.
 */
export function splitTokens(values: number[], total: number): number[] {
  const sum = values.reduce((acc, value) => acc + value, 0);
  if (sum === 0) return values.map(() => 0);
  const exact = values.map((value) => (value / sum) * total);
  const floors = exact.map(Math.floor);
  let left = total - floors.reduce((acc, value) => acc + value, 0);
  const order = exact
    .map((value, index) => ({ index, rest: value - Math.floor(value) }))
    .sort((a, b) => b.rest - a.rest);
  for (const { index } of order) {
    if (left <= 0) break;
    floors[index] += 1;
    left -= 1;
  }
  return floors;
}

// ─── Blok 3 i zadanie: dom nocą ────────────────────────────────────────────

/**
 * - `needed` — pracuje naprawdę (lodówka chłodzi); wyłączenie ma skutki,
 * - `family` — sprawa domu (router: jedni potrzebują go w nocy, inni nie),
 * - `waste`  — czuwa na darmo; to jest prąd do odzyskania,
 * - `tiny`   — czuwa, ale bierze tak mało, że przepisy już się tym zajęły,
 * - `off`    — naprawdę wyłączone, 0 W (czajnik: w dzień rekordzista, w nocy niewinny).
 */
export type NightKind = 'needed' | 'family' | 'waste' | 'tiny' | 'off';

export type Room = 'kuchnia' | 'przedpokoj' | 'salon' | 'pokoj';

export const ROOM_NAMES: Record<Room, string> = {
  kuchnia: 'Kuchnia',
  przedpokoj: 'Przedpokój',
  salon: 'Salon',
  pokoj: 'Pokój Oli',
};

export interface NightDevice {
  id: string;
  name: string;
  room: Room;
  kind: NightKind;
  /** Ile bierze w nocy, W. */
  watts: number;
  /** Co robi w nocy — zdanie, które dziecko czyta po znalezieniu urządzenia. */
  note: string;
}

/** Noc w lekcji trwa 8 godzin — od 23:00 do 7:00, kiedy wszyscy śpią. */
export const NIGHT_HOURS = 8;

export const NIGHT_DEVICES: NightDevice[] = [
  {
    id: 'lodowka',
    name: 'Lodówka',
    room: 'kuchnia',
    kind: 'needed',
    watts: 25,
    note: 'Chłodzi cały czas: co jakiś czas sama włącza sprężarkę. Średnio wychodzi 25 W — to ta sama lodówka, która w dobie zjadła 6 czajników. Ona nie czuwa, tylko pracuje.',
  },
  {
    id: 'mikrofalowka',
    name: 'Mikrofalówka',
    room: 'kuchnia',
    kind: 'waste',
    watts: 1,
    note: 'Świeci jej zegar. Całą noc pokazuje godzinę kuchni, w której wszyscy śpią.',
  },
  {
    id: 'czajnik',
    name: 'Czajnik',
    room: 'kuchnia',
    kind: 'off',
    watts: 0,
    note: 'Wyłączony czajnik nie bierze nic: nie ma zegara, lampki ani czuwania. W dzień był rekordzistą mocy, w nocy jest niewinny.',
  },
  {
    id: 'router',
    name: 'Router Wi-Fi',
    room: 'przedpokoj',
    kind: 'family',
    watts: 10,
    note: 'Pracuje całą dobę, bo ktoś w domu może chcieć internetu. Czy w nocy musi — to decyzja domu: w jednych domach w nocy nic z niego nie korzysta, w innych działa kamera albo alarm.',
  },
  {
    id: 'telewizor',
    name: 'Telewizor',
    room: 'salon',
    kind: 'tiny',
    watts: 0.5,
    note: 'Czerwona kropka: telewizor czeka na pilota. Pół wata to naprawdę mało — nowe urządzenia w zwykłym czuwaniu mogą brać najwyżej około pół wata, bo tak stanowią przepisy Unii Europejskiej.',
  },
  {
    id: 'dekoder',
    name: 'Dekoder telewizji',
    room: 'salon',
    kind: 'waste',
    watts: 12,
    note: 'Wygląda na wyłączony, ale czuwa „w sieci”: jest gotowy do szybkiego startu i pobiera aktualizacje. Bierze prawie tyle, co włączony — dwadzieścia cztery razy więcej niż telewizor obok.',
  },
  {
    id: 'konsola',
    name: 'Konsola do gier',
    room: 'salon',
    kind: 'waste',
    watts: 8,
    note: 'Tryb szybkiego uruchamiania: konsola śpi płytko, żeby rano włączyć się w dwie sekundy. W jej ustawieniach można to zmienić na tryb oszczędzania energii.',
  },
  {
    id: 'soundbar',
    name: 'Głośnik pod telewizorem',
    room: 'salon',
    kind: 'waste',
    watts: 3,
    note: 'Nie ma żadnej lampki — nic nie zdradza, że czuwa. A czuwa: czeka na dźwięk z telewizora.',
  },
  {
    id: 'komputer',
    name: 'Komputer',
    room: 'pokoj',
    kind: 'waste',
    watts: 2,
    note: 'Uśpiony, nie wyłączony — pulsująca lampka mówi „śpię, ale jestem gotowy”. Uśpienie jest dobre na krótką przerwę w dzień; na noc komputer lepiej wyłączyć.',
  },
  {
    id: 'monitor',
    name: 'Monitor',
    room: 'pokoj',
    kind: 'tiny',
    watts: 0.5,
    note: 'Czeka na sygnał z komputera. Pół wata — mało. Ale tuż obok czuwa ktoś, kto bierze więcej.',
  },
  {
    id: 'glosniki',
    name: 'Głośniki przy komputerze',
    room: 'pokoj',
    kind: 'waste',
    watts: 3,
    note: 'Bez lampki, ale ich zasilacz w gniazdku jest ciepły — a skoro grzeje, to znaczy, że bierze prąd.',
  },
  {
    id: 'ladowarka',
    name: 'Ładowarka bez telefonu',
    room: 'pokoj',
    kind: 'tiny',
    watts: 0.1,
    note: 'Ładowarka bez telefonu bierze prawie nic — mniej niż jedną dziesiątą wata. Wyjmuj ją z gniazdka i tak, ale dla bezpieczeństwa i porządku, nie dla prądu.',
  },
];

/** Czuwanie urządzeń jednego pokoju — z tych samych liczb liczy zadanie z programatorami. */
export function standbyOf(ids: string[]): number {
  return NIGHT_DEVICES.filter((device) => ids.includes(device.id)).reduce((acc, device) => acc + device.watts, 0);
}
