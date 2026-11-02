/** Rok historyczny bez zera → „69 p.n.e.”, „ok. 1479 p.n.e.”, „313 n.e.”. */
export function formatYear(year: number, approx?: boolean): string {
  const base = year < 0 ? `${-year} p.n.e.` : `${year} n.e.`;
  return approx ? `ok. ${base}` : base;
}
