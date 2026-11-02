/**
 * Polska odmiana rzeczownika po liczbie: 1 wyraz, 2–4 wyrazy, 5+ wyrazów —
 * z wyjątkiem nastek, w których zawsze idzie forma mnoga (12 wyrazów, nie
 * „12 wyrazy”).
 *
 * Werdykty zadań praktycznych cytują dziecku liczby w co drugim zdaniu, więc
 * „znalazłam 2 przedmiotów” wychodziłoby na stronie kursu językowego dziesiątki
 * razy dziennie. Trzeci konsument (`sb3.ts`, `z10.ts`, a dalej cała grupa A
 * z planu migracji) jest momentem, w którym ta funkcja przestaje być lokalna.
 */
export function count(value: number, one: string, few: string, many: string): string {
  return `${value} ${plural(value, one, few, many)}`;
}

export function plural(value: number, one: string, few: string, many: string): string {
  const last = value % 10;
  const lastTwo = value % 100;
  if (value === 1) return one;
  if (last >= 2 && last <= 4 && (lastTwo < 12 || lastTwo > 14)) return few;
  return many;
}
