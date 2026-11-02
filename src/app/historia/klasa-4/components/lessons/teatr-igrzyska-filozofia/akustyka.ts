/**
 * Blok 1 — akustyka teatru w Epidauros. Czysta logika, bez Reacta.
 *
 * **Model uproszczony, nie pomiar.** Teatr w Epidauros (IV w. p.n.e., F-IV.4-02)
 * ma 55 rzędów na zboczu; pierwszy rząd stoi ok. 10 m od środka orchestry,
 * ostatni ok. 60 m (średnica widowni ok. 120 m), widownia wznosi się pod kątem
 * ok. 26°. Badania akustyki (N. Declercq, C. Dekeyser, J. Acoust. Soc. Am. 121,
 * 2007) tłumaczą dobrą słyszalność m.in. stromą widownią (głowy z przodu nie
 * zasłaniają aktora) i kamiennymi rzędami, które wygłuszają niskie szumy tłumu.
 *
 * Wyrazistość kwestii (0–1) maleje z odległością; na płaskim polu dochodzi
 * strata za każdy rząd ludzi stojący między aktorem a słuchaczem.
 */

export const ROWS = 55;
export type Ground = 'zbocze' | 'pole';

/** Odległość pozioma i wysokość rzędu (m). */
export function rowGeometry(row: number, ground: Ground): { d: number; h: number } {
  const d = 10 + (row - 1) * 0.93;
  return { d, h: ground === 'zbocze' ? (row - 1) * 0.45 : 0 };
}

export function clarity(row: number, ground: Ground): number {
  const { d, h } = rowGeometry(row, ground);
  const dist = Math.hypot(d, h);
  let c = 1 - 0.0055 * (dist - 10);
  if (ground === 'zbocze') c += 0.08; // kamienna orchestra odbija głos w górę
  else c -= 0.014 * (row - 1); // głowy ludzi z przodu
  return Math.round(Math.max(0.03, Math.min(1, c)) * 100) / 100;
}

export const LINE = 'Ludzie Teb, słuchajcie! Król wrócił do miasta i niesie wiadomość, na którą czekaliście od wielu dni.';

/** Które słowa kwestii dochodzą do słuchacza — deterministycznie (bez losowania przy renderze). */
export function heardWords(line: string, c: number): { word: string; heard: boolean }[] {
  return line.split(' ').map((word, i) => ({ word, heard: ((i * 37 + 11) % 100) / 100 < c }));
}
