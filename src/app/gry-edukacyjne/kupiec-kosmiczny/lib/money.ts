/** Grosze jako jedyna wewnętrzna jednostka, tak jak w prawdziwym obiegu — złote/grosze do wyświetlenia liczymy dzieleniem z resztą. */

/** Czy dany nominał to moneta (≤ 5 zł) czy banknot (10 zł+) — granica prawdziwego obiegu PLN. */
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
