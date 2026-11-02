/**
 * Blok 1 — **Szlakiem Pawła**. Dziecko czyta dziennik podróży i stuka
 * miasto, o którym mówi zdanie; statek (albo wędrowiec) płynie tam sam,
 * a w nowym mieście wyrasta gmina. Sędzią jest tekst dziennika — następne
 * miasto jest w nim nazwane, nie zgadywane.
 *
 * Trasy według Dziejów Apostolskich (rozdz. 13–28), uproszczone do miast,
 * które da się rozróżnić na mapie; daty podróży w przybliżeniu, jak
 * w tradycyjnej chronologii (np. Encyclopaedia Britannica, „Saint Paul”).
 * Współrzędne: rzut mapy z `grecja-gory-i-morze/geo-srodziemne.ts`
 * (scripts/historia-grecja-geo.py: lon −10…42, lat 29…56, szer. 600).
 */

export type XY = readonly [number, number];

/** Ten sam rzut co `MED_LAND` (prostokątny z poprawką cos 42,5°). */
export function medXY(lon: number, lat: number): XY {
  return [Math.round((lon + 10) * 11.5385 * 10) / 10, Math.round((56 - lat) * 15.6503 * 10) / 10];
}

export type CityId =
  | 'antiochia'
  | 'salamina'
  | 'pafos'
  | 'perge'
  | 'ikonium'
  | 'troada'
  | 'filippi'
  | 'tesaloniki'
  | 'ateny'
  | 'korynt'
  | 'efez'
  | 'cezarea'
  | 'jerozolima'
  | 'kreta'
  | 'malta'
  | 'syrakuzy'
  | 'puteoli'
  | 'rzym';

export interface City {
  id: CityId;
  name: string;
  /** Dopełniacz — do zdań „list do mieszkańców …”. */
  gen: string;
  xy: XY;
  port: boolean;
  /** Gdzie stoi podpis względem kropki. */
  label: 'l' | 'r' | 't' | 'b';
}

const city = (id: CityId, name: string, gen: string, lon: number, lat: number, port: boolean, label: City['label']): City => ({
  id,
  name,
  gen,
  xy: medXY(lon, lat),
  port,
  label,
});

export const CITIES: readonly City[] = [
  city('antiochia', 'Antiochia', 'Antiochii', 36.16, 36.2, false, 'b'),
  city('salamina', 'Salamina', 'Salaminy', 33.9, 35.18, true, 't'),
  city('pafos', 'Pafos', 'Pafos', 32.41, 34.76, true, 'b'),
  city('perge', 'Perge', 'Perge', 30.85, 36.96, true, 'b'),
  city('ikonium', 'Ikonium', 'Ikonium', 32.49, 37.87, false, 't'),
  city('troada', 'Troada', 'Troady', 26.16, 39.75, true, 'r'),
  city('filippi', 'Filippi', 'Filippi', 24.29, 41.01, false, 't'),
  city('tesaloniki', 'Tesaloniki', 'Tesalonik', 22.94, 40.64, true, 'b'),
  city('ateny', 'Ateny', 'Aten', 23.73, 37.98, true, 'r'),
  city('korynt', 'Korynt', 'Koryntu', 22.88, 37.91, true, 'l'),
  city('efez', 'Efez', 'Efezu', 27.34, 37.94, true, 'r'),
  city('cezarea', 'Cezarea', 'Cezarei', 34.89, 32.5, true, 'l'),
  city('jerozolima', 'Jerozolima', 'Jerozolimy', 35.23, 31.78, false, 'b'),
  city('kreta', 'Kreta', 'Krety', 24.8, 34.93, true, 'b'),
  city('malta', 'Malta', 'Malty', 14.4, 35.9, true, 'b'),
  city('syrakuzy', 'Syrakuzy', 'Syrakuz', 15.29, 37.07, true, 'r'),
  city('puteoli', 'Puteoli', 'Puteoli', 14.12, 40.82, true, 'r'),
  city('rzym', 'Rzym', 'Rzymu', 12.48, 41.89, false, 't'),
];

export function getCity(id: CityId): City {
  const c = CITIES.find((x) => x.id === id);
  if (!c) throw new Error(`Nie ma miasta „${id}”`);
  return c;
}

/** Gminy, które były, zanim przyszedł Paweł (Dz 11, 26: w Antiochii pierwszy raz nazwano uczniów chrześcijanami). */
export const OLD_GMINY: readonly CityId[] = ['jerozolima', 'antiochia'];

export interface Step {
  to: CityId;
  /** Zdanie dziennika — nazywa miasto, do którego trzeba stuknąć. */
  log: string;
  by: 'morze' | 'lad';
}

export interface Journey {
  id: string;
  title: string;
  start: CityId;
  steps: readonly Step[];
  /** Kadr mapy: wschód (podróże 1–3) albo całe morze (droga do Rzymu). */
  view: 'wschod' | 'calosc';
}

export const JOURNEYS: readonly Journey[] = [
  {
    id: 'p1',
    title: 'Pierwsza podróż · ok. 46–48 r.',
    start: 'antiochia',
    view: 'wschod',
    steps: [
      { to: 'salamina', by: 'morze', log: 'Paweł i jego towarzysz Barnaba wsiedli w Antiochii na statek i popłynęli na wyspę Cypr, do portu Salamina.' },
      { to: 'pafos', by: 'lad', log: 'Przeszli całą wyspę, aż do Pafos — tam mieszkał rzymski namiestnik Cypru.' },
      { to: 'perge', by: 'morze', log: 'Z Pafos przepłynęli na stały ląd, do miasta Perge.' },
      { to: 'ikonium', by: 'lad', log: 'Dalej szli pieszo, w góry, rzymską drogą do Ikonium.' },
      { to: 'antiochia', by: 'lad', log: 'Wrócili do Antiochii, skąd wyruszyli, i opowiedzieli gminie, co widzieli.' },
    ],
  },
  {
    id: 'p2',
    title: 'Druga podróż · ok. 49–52 r.',
    start: 'antiochia',
    view: 'wschod',
    steps: [
      { to: 'troada', by: 'lad', log: 'Tym razem Paweł przeszedł pieszo przez całą Azję Mniejszą — aż do portu Troada nad Morzem Egejskim.' },
      { to: 'filippi', by: 'morze', log: 'Przepłynął do Europy i doszedł do Filippi. Tu powstała pierwsza gmina chrześcijan w Europie.' },
      { to: 'tesaloniki', by: 'lad', log: 'Rzymską drogą, Via Egnatia, poszedł na zachód, do wielkiego portu Tesaloniki.' },
      { to: 'ateny', by: 'morze', log: 'Popłynął na południe, do Aten. Na agorze rozmawiał z filozofami, ale uwierzyło niewielu.' },
      { to: 'korynt', by: 'lad', log: 'Przeszedł do Koryntu, miasta dwóch portów. Mieszkał tam półtora roku i szył namioty, żeby zarobić na życie.' },
      { to: 'antiochia', by: 'morze', log: 'Statkiem wrócił na wschód, do Antiochii.' },
    ],
  },
  {
    id: 'p3',
    title: 'Trzecia podróż · ok. 53–57 r.',
    start: 'antiochia',
    view: 'wschod',
    steps: [
      { to: 'efez', by: 'lad', log: 'Znów poszedł lądem na zachód, do Efezu — jednego z największych miast imperium. Został tam prawie trzy lata.' },
      { to: 'korynt', by: 'morze', log: 'Popłynął odwiedzić gminę w Koryncie. Stąd napisał list do chrześcijan w Rzymie, choć sam nigdy tam nie był.' },
      { to: 'cezarea', by: 'morze', log: 'Statkiem wrócił na wschód, do portu Cezarea.' },
      { to: 'jerozolima', by: 'lad', log: 'Poszedł do Jerozolimy. Tam go aresztowano.' },
    ],
  },
  {
    id: 'p4',
    title: 'Droga do Rzymu — jako więzień · ok. 60–61 r.',
    start: 'cezarea',
    view: 'calosc',
    steps: [
      { to: 'kreta', by: 'morze', log: 'Paweł był obywatelem rzymskim, więc zażądał sądu u cesarza. Wysłano go z Cezarei statkiem. Z trudem dopłynęli do Krety — zaczynała się pora jesiennych burz.' },
      { to: 'malta', by: 'morze', log: 'Burza niosła statek dwa tygodnie, aż rozbił się u brzegów Malty. Wszyscy dopłynęli do lądu.' },
      { to: 'syrakuzy', by: 'morze', log: 'Po zimie inny statek zabrał ich na Sycylię, do Syrakuz.' },
      { to: 'puteoli', by: 'morze', log: 'Dalej do Puteoli w Italii — portu, do którego przypływały statki ze zbożem z Egiptu. Paweł spotkał tu chrześcijan — gmina była tu przed nim.' },
      { to: 'rzym', by: 'lad', log: 'Ostatni odcinek pieszo, Drogą Appijską, do Rzymu. Na drodze czekali już na niego chrześcijanie z Rzymu.' },
    ],
  },
];

export type TapVerdict = { ok: true } | { ok: false; message: string };

/** Sędzia stuknięcia: dziennik nazywa jedno miasto — wszystko inne dostaje odpowiedź z treści dziennika. */
export function judgeTap(step: Step, tapped: CityId, visited: readonly CityId[]): TapVerdict {
  if (tapped === step.to) return { ok: true };
  const t = getCity(tapped);
  const want = getCity(step.to);
  if (visited.includes(tapped)) {
    return { ok: false, message: `${t.name} — tu Paweł już był. Dziennik mówi teraz o mieście ${want.name}.` };
  }
  return { ok: false, message: `To ${t.name}. Przeczytaj dziennik jeszcze raz — kolejne miasto ma w nim swoją nazwę: ${want.name}.` };
}

/** Miasta z gminą po przejściu `upTo` kroków (licząc wszystkie podróże po kolei). */
export function gminyAfter(journeyIndex: number, stepIndex: number): CityId[] {
  const out = new Set<CityId>(OLD_GMINY);
  JOURNEYS.forEach((j, ji) => {
    j.steps.forEach((s, si) => {
      if (ji < journeyIndex || (ji === journeyIndex && si < stepIndex)) {
        if (s.to !== 'jerozolima' && s.to !== 'kreta' && s.to !== 'malta' && s.to !== 'syrakuzy') out.add(s.to);
      }
    });
  });
  return [...out];
}

/** Gminy założone przez Pawła w trzech podróżach (bez drogi do Rzymu, gdzie płynął jako więzień). */
export const PAUL_GMINY: readonly CityId[] = (() => {
  const s = new Set<CityId>();
  JOURNEYS.slice(0, 3).forEach((j) => j.steps.forEach((st) => !OLD_GMINY.includes(st.to) && s.add(st.to)));
  return [...s];
})();

// ─── Listy Pawła ────────────────────────────────────────────────────────────

export interface Letter {
  id: string;
  title: string;
  /** Do mieszkańców jakiego miasta. */
  to: CityId;
  people: string;
}

/** Tylko listy, których autorstwa Pawła historycy nie podważają. */
export const LETTERS: readonly Letter[] = [
  { id: 'l-tes', title: 'List do Tesaloniczan', to: 'tesaloniki', people: 'Tesaloniczanie' },
  { id: 'l-kor', title: 'List do Koryntian', to: 'korynt', people: 'Koryntianie' },
  { id: 'l-fil', title: 'List do Filipian', to: 'filippi', people: 'Filipianie' },
  { id: 'l-rzy', title: 'List do Rzymian', to: 'rzym', people: 'Rzymianie' },
];

export function judgeLetter(letterId: string, city: CityId): TapVerdict {
  const l = LETTERS.find((x) => x.id === letterId);
  if (!l) return { ok: false, message: 'Nie ma takiego listu.' };
  if (l.to === city) return { ok: true };
  const want = getCity(l.to);
  const got = getCity(city);
  return {
    ok: false,
    message: `${l.people} to mieszkańcy ${want.gen}, a ten list kładziesz w mieście ${got.name}. Adres jest w nazwie listu.`,
  };
}

// ─── Szlaki ─────────────────────────────────────────────────────────────────

export interface Route {
  id: string;
  name: string;
  kind: 'droga' | 'morze';
  pts: readonly XY[];
  /** Czy szlak doprowadza do Rzymu (albo do jego portu Puteoli). */
  toRome: boolean;
}

const r = (id: string, name: string, kind: Route['kind'], toRome: boolean, ll: [number, number][]): Route => ({
  id,
  name,
  kind,
  toRome,
  pts: ll.map(([lon, lat]) => medXY(lon, lat)),
});

/**
 * Najważniejsze drogi i szlaki morskie wschodniej części imperium — przebiegi
 * orientacyjne, na podstawie modelu ORBIS (Stanford, orbis.stanford.edu)
 * i map dróg rzymskich; nie są to dokładne trasy.
 */
export const ROUTES: readonly Route[] = [
  r('egnatia', 'Via Egnatia — droga przez Macedonię', 'droga', false, [[19.45, 41.32], [20.8, 41.1], [22.94, 40.64], [24.29, 41.01], [26.5, 40.9], [28.97, 41.01]]),
  r('anatolia', 'Wielka droga przez Azję Mniejszą', 'droga', false, [[27.34, 37.94], [29.1, 37.83], [31.19, 38.31], [32.49, 37.87], [34.9, 36.92], [36.16, 36.2]]),
  r('wybrzeze', 'Droga wzdłuż wybrzeża', 'droga', false, [[36.16, 36.2], [35.8, 34.9], [35.2, 33.27], [34.89, 32.5], [35.23, 31.78]]),
  r('appia', 'Droga Appijska', 'droga', true, [[17.94, 40.64], [15.8, 40.9], [14.25, 41.08], [12.48, 41.89]]),
  r('zboze', 'Szlak statków ze zbożem: Aleksandria → Italia', 'morze', true, [[29.92, 31.4], [25.5, 34.6], [19.0, 36.2], [15.65, 38.0], [14.12, 40.82]]),
  r('egejskie', 'Szlak przez Morze Egejskie', 'morze', false, [[22.95, 37.9], [25.3, 37.4], [27.34, 37.94]]),
  r('wschod', 'Szlak wzdłuż Azji Mniejszej i Cypru', 'morze', false, [[27.34, 37.94], [28.22, 36.43], [30.85, 36.6], [33.9, 35.18], [35.93, 36.12]]),
  r('adriatyk', 'Przeprawa przez morze do Italii', 'morze', true, [[19.45, 41.32], [17.94, 40.64]]),
];

/** Najmniejsza odległość punktu od łamanej. */
export function distToRoute(p: XY, route: Route): number {
  let best = Infinity;
  for (let i = 1; i < route.pts.length; i++) {
    const [ax, ay] = route.pts[i - 1];
    const [bx, by] = route.pts[i];
    const dx = bx - ax;
    const dy = by - ay;
    const len2 = dx * dx + dy * dy || 1;
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - ay) * dy) / len2));
    best = Math.min(best, Math.hypot(p[0] - (ax + t * dx), p[1] - (ay + t * dy)));
  }
  return best;
}

/** Gmina „przy szlaku”: port albo nie dalej niż ok. 25 km (ok. 2 px mapy) od drogi. */
export function onTradeRoute(id: CityId): boolean {
  const c = getCity(id);
  if (c.port) return true;
  return ROUTES.some((rt) => rt.kind === 'droga' && distToRoute(c.xy, rt) <= 2.5);
}

export function judgeRoute(routeId: string): TapVerdict {
  const rt = ROUTES.find((x) => x.id === routeId);
  if (!rt) return { ok: false, message: 'Nie ma takiego szlaku.' };
  if (rt.toRome) return { ok: true };
  return { ok: false, message: `${rt.name} nie dochodzi do Italii, więc nie zaprowadzi do Rzymu. Szukaj szlaku, który kończy się w Italii.` };
}
