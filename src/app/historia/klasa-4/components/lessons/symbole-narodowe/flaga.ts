/**
 * L10 blok 1 — zasady wieszania flagi. Czyste funkcje, bez Reacta.
 *
 * Każda reguła pochodzi z ustawy z 31 stycznia 1980 r. o godle, barwach
 * i hymnie RP (tekst jednolity, isap.sejm.gov.pl, Dz.U. 1980 nr 7 poz. 18):
 *  - art. 4 ust. 1 — dwa poziome pasy, górny biały, dolny czerwony;
 *  - art. 4 ust. 2 — w układzie pionowym biel po lewej stronie patrzącego;
 *  - art. 11 ust. 2 — w żałobie narodowej flagę opuszcza się do połowy masztu;
 *  - załącznik nr 3 — proporcje flagi 5 : 8.
 * „Najpierw na szczyt, potem do połowy” to zwyczaj ceremoniału, nie ustawa —
 * tak też mówi o nim lekcja.
 */

/** Czerwień flagi — przyjęta w opracowaniach barwa wzoru z załącznika nr 2 (karmazyn). */
export const FLAG_RED = '#DC143C';
export const FLAG_WHITE = '#FFFFFF';

/** Proporcje (wysokość : szerokość) — prawdziwe, żeby różnica była widoczna. */
export const FLAGS = {
  polska: { label: 'Polska', ratio: 5 / 8, top: FLAG_WHITE, bottom: FLAG_RED },
  monako: { label: 'Monako', ratio: 4 / 5, top: FLAG_RED, bottom: FLAG_WHITE },
  indonezja: { label: 'Indonezja', ratio: 2 / 3, top: FLAG_RED, bottom: FLAG_WHITE },
} as const;

/* ------------------------------------------------------------------ maszt */

/** Wysokość flagi na maszcie: 0 = przy ziemi, 1 = szczyt. */
export type MastMode = 'swieto' | 'zaloba';

export interface MastState {
  /** Bieżąca wysokość 0–1. */
  height: number;
  /** Najwyżej, dokąd flaga doszła w tej próbie. */
  maxHeight: number;
}

export const TOP = 0.95;
export const HALF_LO = 0.4;
export const HALF_HI = 0.6;

export type MastVerdict =
  | { ok: true }
  | { ok: false; kind: 'za-nisko' | 'nie-do-szczytu' | 'za-wysoko-zaloba' | 'pominiety-szczyt'; message: string };

export function judgeMast(mode: MastMode, s: MastState): MastVerdict {
  if (mode === 'swieto') {
    if (s.height >= TOP) return { ok: true };
    return {
      ok: false,
      kind: 'nie-do-szczytu',
      message: `Flaga wisi na ${Math.round(s.height * 100)}% wysokości masztu. Opuszczona flaga to znak żałoby — w święto wciąga się ją na sam szczyt.`,
    };
  }
  if (s.height >= HALF_LO && s.height <= HALF_HI) {
    if (s.maxHeight >= TOP) return { ok: true };
    return {
      ok: false,
      kind: 'pominiety-szczyt',
      message:
        'Wysokość się zgadza — ustawa mówi „do połowy masztu”. Ale zwyczaj każe najpierw wciągnąć flagę na sam szczyt, a dopiero potem opuścić. Wciągnij do góry i opuść do połowy.',
    };
  }
  if (s.height > HALF_HI) {
    return {
      ok: false,
      kind: 'za-wysoko-zaloba',
      message:
        s.height >= TOP
          ? 'Tak wisi flaga w święto. W żałobie narodowej opuszcza się ją do połowy masztu (ustawa, art. 11).'
          : `Flaga jest na ${Math.round(s.height * 100)}% — za wysoko na żałobę. Opuść ją do połowy masztu.`,
    };
  }
  return {
    ok: false,
    kind: 'za-nisko',
    message: `Flaga jest na ${Math.round(s.height * 100)}% — poniżej połowy. W żałobie wisi w połowie masztu, nie przy ziemi.`,
  };
}

/* ----------------------------------------------------------- flaga w oknie */

/**
 * Obrót flagi stukaniem, co 90° zgodnie z zegarem. 0 = poziomo, biel u góry
 * (stan wyjściowy); 90 = pionowo, biel po prawej patrzącego; 180 = poziomo,
 * biel u dołu; 270 = pionowo, biel po lewej patrzącego.
 */
export type Turn = 0 | 90 | 180 | 270;

export function nextTurn(t: Turn): Turn {
  return ((t + 90) % 360) as Turn;
}

/** Gdzie jest biel, gdy patrzymy na flagę z przodu. */
export function whiteSide(t: Turn): 'gora' | 'prawo' | 'dol' | 'lewo' {
  return t === 0 ? 'gora' : t === 90 ? 'prawo' : t === 180 ? 'dol' : 'lewo';
}

export type WindowVerdict =
  | { ok: true }
  | { ok: false; kind: 'poziomo' | 'do-gory-nogami' | 'biel-z-prawej'; message: string };

/** Okno jest wąskie i wysokie — flaga wisi w nim pionowo, biel po lewej patrzącego. */
export function judgeWindow(t: Turn): WindowVerdict {
  const side = whiteSide(t);
  if (side === 'lewo') return { ok: true };
  if (side === 'gora')
    return {
      ok: false,
      kind: 'poziomo',
      message:
        'Flaga leży poziomo, a okno jest wąskie i wysokie — długa flaga zwisa w nim pionowo. Obróć ją.',
    };
  if (side === 'dol')
    return {
      ok: false,
      kind: 'do-gory-nogami',
      message: 'Czerwień u góry — tak wisiałaby flaga Monako albo Indonezji. Obróć ją dalej.',
    };
  return {
    ok: false,
    kind: 'biel-z-prawej',
    message:
      'Flaga wisi pionowo, ale biel jest po prawej. Ustawa mówi: w układzie pionowym biel po LEWEJ stronie patrzącego. Obróć jeszcze dwa razy.',
  };
}
