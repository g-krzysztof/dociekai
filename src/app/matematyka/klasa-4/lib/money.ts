/**
 * Grosze jako jedyna wewnętrzna jednostka — dokładnie jak w prawdziwych
 * systemach płatności: liczymy w groszach, a złote i grosze do wyświetlenia
 * dostajemy dzieleniem z resztą (`Math.floor` + `%`), żeby widget, przykład
 * i klucz odpowiedzi nie mogły się rozjechać (ten sam pomysł co `roman.ts`
 * czy `place-value.ts`).
 */

/** Monety: grosze (1–50) i złote do 5 zł, wszystkie jako wartość w groszach. */
export const COIN_VALUES = [1, 2, 5, 10, 20, 50, 100, 200, 500] as const;

/** Banknoty 10–200 zł, jako wartość w groszach. */
export const NOTE_VALUES = [1000, 2000, 5000, 10000, 20000] as const;

export const ALL_DENOMINATIONS: readonly number[] = [...COIN_VALUES, ...NOTE_VALUES];

/** Granica moneta/banknot w prawdziwym obiegu PLN — 5 zł to jeszcze moneta, 10 zł to już banknot. */
export function isCoin(valueInGrosze: number): boolean {
  return valueInGrosze <= 500;
}

/** np. formatMoney(1825) === '18 zł 25 gr', formatMoney(305) === '3 zł 5 gr', formatMoney(50) === '50 gr'. */
export function formatMoney(groszeTotal: number): string {
  const safe = Math.max(0, Math.round(groszeTotal));
  const zl = Math.floor(safe / 100);
  const gr = safe % 100;
  if (zl > 0 && gr > 0) return `${zl} zł ${gr} gr`;
  if (zl > 0) return `${zl} zł`;
  return `${gr} gr`;
}

/** Etykieta pojedynczego nominału, np. denominationLabel(500) === '5 zł', denominationLabel(20) === '20 gr'. */
export function denominationLabel(valueInGrosze: number): string {
  return valueInGrosze >= 100 ? `${valueInGrosze / 100} zł` : `${valueInGrosze} gr`;
}

export const MONEY_RULES: string[] = [
  '1 złoty to 100 groszy — dokładnie tyle samo, co sto groszowych monet razem.',
  'Zamieniając złote na grosze, mnożysz liczbę złotych przez 100 i dodajesz grosze.',
  'Zamieniając grosze na złote, dzielisz przez 100 — iloraz to złote, reszta to grosze.',
  'Dodając kwoty, dodaj osobno grosze i osobno złote — gdy grosze przekroczą 100, zamień 100 groszy na 1 złoty.',
  'Licząc resztę, sprawdź, ile brakuje od zapłaconej kwoty do ceny — tyle właśnie wynosi reszta.',
];
