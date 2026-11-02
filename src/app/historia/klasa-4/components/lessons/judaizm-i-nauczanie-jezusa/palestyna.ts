/**
 * Blok 1 — Palestyna w Cesarstwie. Dziecko najpierw przybliża mapę imperium
 * aż do małej prowincji, potem stuka jezioro i stawia miejscowości według
 * wskazówek drogi (kierunek + odległość w dniach marszu). Sędzią jest
 * prawdziwe położenie z `geo-palestyna.ts` (scripts/historia-palestyna-geo.py),
 * a odrzut mówi, gdzie leży postawiona pinezka względem punktu odniesienia
 * ze wskazówki — nie „źle”, tylko „za daleko na północ”.
 */

import { PAL_KM_PER_PX, PAL_PLACES } from './geo-palestyna';

export type XY = readonly [number, number];

/** Środek Jeziora Galilejskiego (35,59 E 32,82 N) i północny kraniec Morza Martwego (35,53 E 31,76 N) — w pikselach mapy. */
export const LAKE_CENTER: XY = [331.3, 118.2];
export const DEAD_SEA_NORTH: XY = [318.8, 379.4];

/** Jeden dzień marszu piechura po górach Judei i Galilei — ok. 30 km. */
export const KM_PER_DAY = 30;

export type PlaceId = 'kafarnaum' | 'nazaret' | 'jerozolima' | 'betlejem';

export interface PlaceStep {
  id: PlaceId;
  name: string;
  /** Wskazówka drogi — wszystko, czego dziecko potrzebuje, żeby postawić pinezkę. */
  clue: string;
  /** Od czego mierzymy w odrzucie. */
  anchor: { at: XY | PlaceId; name: string };
  /** Czego oczekuje wskazówka, słowami („ok. 8 km na południe”). */
  expected: string;
  /** Promień przyjęcia w km. */
  tolKm: number;
  /** Co tu się wydarzyło — karta odsłaniana po trafieniu. */
  story: string;
}

export const PLACE_STEPS: readonly PlaceStep[] = [
  {
    id: 'kafarnaum',
    name: 'Kafarnaum',
    clue: 'Miasteczko rybaków na samym brzegu Jeziora Galilejskiego, przy jego północnym końcu.',
    anchor: { at: LAKE_CENTER, name: 'środka jeziora' },
    expected: 'na północnym brzegu jeziora',
    tolKm: 6,
    story:
      'Według Ewangelii — czterech opowieści o życiu Jezusa, spisanych przez jego uczniów i ich następców — tu Jezus zamieszkał, kiedy zaczął nauczać. Mówił do ludzi w synagodze, czyli żydowskim domu modlitwy, i nad brzegiem jeziora. Jego pierwsi uczniowie byli rybakami: Szymon, nazwany później Piotrem, i jego brat Andrzej.',
  },
  {
    id: 'nazaret',
    name: 'Nazaret',
    clue: 'Mała wioska w górach, z dala od wody: mniej więcej dzień marszu (ok. 30 km) na południowy zachód od Kafarnaum.',
    anchor: { at: 'kafarnaum', name: 'Kafarnaum' },
    expected: 'ok. 30 km na południowy zachód',
    tolKm: 10,
    story:
      'Tu Jezus dorastał — w rodzinie Maryi i cieśli Józefa. Dlatego nazywano go Jezusem z Nazaretu. Był Żydem: modlił się do jednego Boga, znał Torę i chodził do synagogi jak wszyscy w wiosce.',
  },
  {
    id: 'jerozolima',
    name: 'Jerozolima',
    clue: 'Wielkie miasto w górach: niecały dzień marszu (ok. 28 km) na zachód od północnego końca Morza Martwego.',
    anchor: { at: DEAD_SEA_NORTH, name: 'północnego końca Morza Martwego' },
    expected: 'ok. 28 km na zachód',
    tolKm: 7,
    story:
      'Najważniejsze miasto Żydów. Stała tu świątynia jedynego Boga, do której na święta pielgrzymowały tłumy. Tu ok. 30–33 r. n.e. rzymski namiestnik Poncjusz Piłat skazał Jezusa na śmierć na krzyżu — tak Rzymianie karali buntowników i niewolników.',
  },
  {
    id: 'betlejem',
    name: 'Betlejem',
    clue: 'Małe miasteczko dwie godziny marszu (ok. 8 km) na południe od Jerozolimy.',
    anchor: { at: 'jerozolima', name: 'Jerozolimy' },
    expected: 'ok. 8 km na południe',
    tolKm: 4,
    story:
      'Według Ewangelii tu urodził się Jezus. Betlejem było miastem dawnego króla Dawida, a wielu Żydów wierzyło, że Mesjasz — wysłannik Boga, który uwolni ich lud — przyjdzie z rodu Dawida.',
  },
];

export function anchorPoint(step: PlaceStep): XY {
  return typeof step.anchor.at === 'string' ? PAL_PLACES[step.anchor.at] : step.anchor.at;
}

const DIRS = ['wschód', 'północny wschód', 'północ', 'północny zachód', 'zachód', 'południowy zachód', 'południe', 'południowy wschód'];

/** Kierunek z punktu `from` do `to` słowami (osiem stron świata; oś y mapy rośnie w dół). */
export function direction(from: XY, to: XY): string {
  const ang = Math.atan2(from[1] - to[1], to[0] - from[0]);
  const i = (Math.round(ang / (Math.PI / 4)) + 8) % 8;
  return DIRS[i];
}

export function km(a: XY, b: XY): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]) * PAL_KM_PER_PX;
}

export type PlaceVerdict = { ok: true } | { ok: false; message: string };

/** Czy pinezka stoi tam, gdzie prowadzi wskazówka. Odrzut mówi, gdzie stoi względem punktu odniesienia. */
export function judgePlace(step: PlaceStep, at: XY): PlaceVerdict {
  const truth = PAL_PLACES[step.id];
  if (km(at, truth) <= step.tolKm) return { ok: true };
  const anchor = anchorPoint(step);
  const d = Math.round(km(anchor, at));
  const where = d < 2 ? `prawie w tym samym miejscu co ${step.anchor.name}` : `ok. ${d} km na ${direction(anchor, at)} od ${step.anchor.name}`;
  return {
    ok: false,
    message: `Twoja pinezka stoi ${where}. Wskazówka mówi: ${step.expected}.`,
  };
}

export type LakeId = 'galilea' | 'martwe';

/** Jordan płynie z północy na południe — jezioro „po drodze” to Galilejskie, na końcu jest Martwe. */
export function judgeLake(lake: LakeId): PlaceVerdict {
  if (lake === 'galilea') return { ok: true };
  return {
    ok: false,
    message:
      'Do tego jeziora Jordan wpada i dalej już nie płynie — to Morze Martwe, tak słone, że nie żyją w nim ryby. Szukaj jeziora wyżej na rzece.',
  };
}

/** Przybliżenie mapy imperium: od 1 (całe Morze Śródziemne) do ZOOM_MAX (sama Palestyna). */
export const ZOOM_MAX = 20;
/** Od tego przybliżenia zamiast zgrubnej mapy imperium pojawia się dokładna mapa krainy. */
export const DETAIL_FROM = 6;
