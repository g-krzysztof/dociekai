/**
 * Podział liczby na klasy po 3 cyfry licząc od prawej (jedności, tysiące,
 * miliony) — współdzielone między widgetami tej lekcji (budowanie liczby,
 * czytanie przykładów), żeby grupowanie cyfr liczyło się raz, w jednym miejscu.
 */

export type ClassName = 'miliony' | 'tysiące' | 'jedności';

export interface DigitGroup {
  digits: number[];
  className: ClassName;
}

const CLASS_ORDER: ClassName[] = ['miliony', 'tysiące', 'jedności'];

export const CLASS_LABELS: Record<ClassName, string> = {
  miliony: 'klasa milionów',
  tysiące: 'klasa tysięcy',
  jedności: 'klasa jedności',
};

/** Rozmiary grup cyfr (od lewej), np. 8 cyfr → [2, 3, 3]. */
function groupSizes(length: number): number[] {
  const sizes: number[] = [];
  let remaining = length;
  while (remaining > 3) {
    sizes.push(3);
    remaining -= 3;
  }
  sizes.push(remaining);
  return sizes.reverse();
}

export function digitsOf(value: number): number[] {
  return String(value)
    .split('')
    .map((char) => Number(char));
}

export function digitGroups(value: number): DigitGroup[] {
  const digits = digitsOf(value);
  const sizes = groupSizes(digits.length);
  const offset = CLASS_ORDER.length - sizes.length;

  let cursor = 0;
  return sizes.map((size, i) => {
    const group = digits.slice(cursor, cursor + size);
    cursor += size;
    return { digits: group, className: CLASS_ORDER[offset + i] };
  });
}

/** Liczba zapisana z odstępem między klasami, np. 3250604 → „3 250 604”. */
export function formatGrouped(value: number): string {
  return digitGroups(value)
    .map((group) => group.digits.join(''))
    .join(' ');
}
