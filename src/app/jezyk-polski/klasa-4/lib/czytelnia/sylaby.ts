/**
 * Podział wyrazu na sylaby do narzędzi czytania (E4c) — **pomoc w czytaniu,
 * nie reguła ortograficzna**. Szkoła dopuszcza kilka podziałów zbitek
 * spółgłosek („wios-na” i „wio-sna”); tu zawsze pierwsza spółgłoska zostaje
 * przy poprzedniej sylabie. Sędzia L27 ma mieć własne dane, nie tę funkcję.
 *
 * - samogłoski: a ą e ę i o ó u y; „i” po spółgłosce i przed samogłoską tylko
 *   zmiękcza („sia-no”, „zie-mia”), więc nie robi sylaby;
 * - dwuznaki ch, cz, dz, dź, dż, rz, sz są jedną spółgłoską („dżun-gla”);
 * - wyraz bez samogłoski („w”, „z”) zostaje w całości.
 */

const VOWELS = new Set([...'aąeęioóuy']);
const DIGRAPHS = ['ch', 'cz', 'dz', 'dź', 'dż', 'rz', 'sz'];

interface Piece {
  text: string;
  vowel: boolean;
}

function pieces(word: string): Piece[] {
  const low = word.toLowerCase();
  const out: Piece[] = [];
  let i = 0;
  while (i < word.length) {
    const two = low.slice(i, i + 2);
    if (DIGRAPHS.includes(two)) {
      out.push({ text: word.slice(i, i + 2), vowel: false });
      i += 2;
      continue;
    }
    const ch = low[i];
    const prev = out[out.length - 1];
    // Zmiękczające „i” dokleja się do spółgłoski przed nim: „si”, „ci”, „dzi” to jedna głoska.
    if (ch === 'i' && prev && !prev.vowel && VOWELS.has(low[i + 1] ?? '')) {
      prev.text += word[i];
      i += 1;
      continue;
    }
    out.push({ text: word[i], vowel: VOWELS.has(ch) });
    i += 1;
  }
  return out;
}

export function sylaby(word: string): string[] {
  const ps = pieces(word);
  const nuclei = ps.map((p, i) => (p.vowel ? i : -1)).filter((i) => i >= 0);
  if (nuclei.length < 2) return [word];
  const cuts: number[] = [];
  for (let k = 0; k < nuclei.length - 1; k++) {
    const a = nuclei[k];
    const b = nuclei[k + 1];
    const between = b - a - 1;
    // 0 spółgłosek: między samogłoskami; 1: przed nią; 2 i więcej: po pierwszej.
    cuts.push(between <= 1 ? a + 1 : a + 2);
  }
  const out: string[] = [];
  let from = 0;
  for (const c of cuts) {
    out.push(ps.slice(from, c).map((p) => p.text).join(''));
    from = c;
  }
  out.push(ps.slice(from).map((p) => p.text).join(''));
  return out;
}
