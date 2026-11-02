/**
 * Wykrywanie **przepisanych ciągów** — jedna reguła dla całej lekcji o prawie
 * autorskim.
 *
 * Mieszka osobno, bo ma dwóch konsumentów: `OwnWords` (ćwiczenie na źródle
 * kursu) i `NatureNoteProof` (odbiór zadania — to samo porównanie, ale na
 * notatce, którą dziecko naprawdę napisało, i na źródle, które samo wklei).
 * Gdyby reguła stała w dwóch miejscach, ćwiczenie i odbiór mogłyby z czasem
 * zacząć mówić co innego o tej samej pracy.
 *
 * Reguła jest jawna i podana dziecku wprost: **ciąg co najmniej pięciu słów pod
 * rząd taki sam jak w źródle to przepisanie**. Cztery słowa przechodzą — po
 * polsku nie da się inaczej powiedzieć „pszczoła zbiera nektar z kwiatów”, a
 * dziecko nie ma się bać własnego języka, tylko kopiowania akapitu.
 */

/** Tyle słów pod rząd tak samo jak w źródle uznajemy za przepisane. */
export const RUN_MIN = 5;

export const words = (text: string): string[] =>
  (text.toLowerCase().match(/[\p{L}\p{N}]+/gu) ?? []) as string[];

/** Dzieli tekst na słowa i przerwy, żeby dało się podświetlić słowo w oryginale. */
export const tokenize = (text: string): { value: string; isWord: boolean }[] =>
  (text.match(/[\p{L}\p{N}]+|[^\p{L}\p{N}]+/gu) ?? []).map((value) => ({
    value,
    isWord: /[\p{L}\p{N}]/u.test(value),
  }));

export interface Analysis {
  /** Dla każdego słowa dziecka: czy należy do przepisanego ciągu. */
  flags: boolean[];
  longest: number;
  copied: number;
  total: number;
}

export function analyse(childText: string, sourceText: string): Analysis {
  const child = words(childText);
  const source = words(sourceText);
  const flags = new Array<boolean>(child.length).fill(false);
  let longest = 0;
  let index = 0;

  while (index < child.length) {
    let best = 0;
    for (let start = 0; start < source.length; start += 1) {
      let length = 0;
      while (
        index + length < child.length &&
        start + length < source.length &&
        child[index + length] === source[start + length]
      ) {
        length += 1;
      }
      if (length > best) best = length;
    }
    if (best > longest) longest = best;
    if (best >= RUN_MIN) {
      for (let k = 0; k < best; k += 1) flags[index + k] = true;
      index += best;
    } else {
      index += 1;
    }
  }

  return {
    flags,
    longest,
    copied: flags.filter(Boolean).length,
    total: child.length,
  };
}

