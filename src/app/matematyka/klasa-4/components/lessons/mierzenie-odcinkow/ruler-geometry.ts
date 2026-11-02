export interface RulerTick {
  mm: number;
  height: 'cm' | 'five' | 'mm';
}

/** Kreski linijki co 1 mm, z wyróżnieniem co 5 mm i co 10 mm (1 cm) — reużywane przez każdy widget rysujący linijkę w tej lekcji. */
export function buildTicks(maxMm: number): RulerTick[] {
  return Array.from({ length: maxMm + 1 }, (_, mm) => ({
    mm,
    height: mm % 10 === 0 ? 'cm' : mm % 5 === 0 ? 'five' : 'mm',
  }));
}

/** Wysokość (w jednostkach viewBoxa, licząc od TICK_TOP w dół) kreski podziałki przy danym mm — ta sama reguła co `buildTicks`, żeby prowadnica kończyła się dokładnie na końcu właściwej kreski, nie generycznie na wysokości kreski centymetrowej. */
export function tickHeightForMm(mm: number): number {
  return mm % 10 === 0 ? 16 : mm % 5 === 0 ? 11 : 6;
}

/** Zapis mieszany cm+mm używany w przykładach i zadaniach (np. 74 → "7 cm 4 mm"). */
export function formatCmMm(mm: number): string {
  const cm = Math.floor(mm / 10);
  const rest = mm % 10;
  if (cm === 0) return `${mm} mm`;
  if (rest === 0) return `${cm} cm`;
  return `${cm} cm ${rest} mm`;
}
