/**
 * Czysta logika bloku 2 — **maszyna do losowania** (kleroterion). Opis działania:
 * Arystoteles, „Ustrój polityczny Aten” 63–66 (IV w. p.n.e.): tabliczki z imionami
 * w szczelinach kolumn, z boku rura z białymi i czarnymi kostkami; każda kostka
 * rozstrzyga o całym rzędzie — biała: ten rząd zostaje sędziami, czarna: rząd odpada.
 * Nasz model jest mniejszy: 5 kolumn × 8 rzędów, 3 białe kostki na 8.
 */
export const KCOLS = 5;
export const KROWS = 8;
export const WHITES = 3;

/** Imiona ateńskie (prawdziwe imiona greckie, osoby wymyślone). */
export const NAMES = [
  'Kallias', 'Nikias', 'Ksantyp', 'Lizjasz', 'Kimon', 'Ajschines', 'Demeas', 'Filon', 'Glaukon', 'Hippias',
  'Kleon', 'Laches', 'Menon', 'Nikomach', 'Onetor', 'Pasion', 'Simon', 'Teron', 'Dion', 'Eukrates',
  'Charmides', 'Kriton', 'Ariston', 'Polemarch', 'Kefalos', 'Agaton', 'Fajdros', 'Lizias', 'Timon', 'Eutyfron',
  'Meletos', 'Anytos', 'Krates', 'Diodot', 'Stefanos', 'Archip', 'Chremes', 'Strepsjades', 'Fidippides',
];

/** Szczeliny wolne dla tabliczki dziecka: [kolumna, rząd]. Reszta jest już zajęta. */
export const FREE_SLOTS: [number, number][] = [
  [0, 5],
  [2, 2],
  [4, 6],
];

export function slotKey(c: number, r: number) {
  return `${c}-${r}`;
}

/** Losuje kolejność kostek (true = biała). `rnd` — źródło losowości, w testach podmieniane. */
export function shakeTube(rnd: () => number = Math.random): boolean[] {
  const cubes = Array.from({ length: KROWS }, (_, i) => i < WHITES);
  for (let i = cubes.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [cubes[i], cubes[j]] = [cubes[j], cubes[i]];
  }
  return cubes;
}

/** Wynik jednego dnia: czy rząd dziecka dostał białą kostkę. */
export function chosen(tube: readonly boolean[], row: number) {
  return tube[row] === true;
}

export function expectedOf(days: number) {
  return (days * WHITES) / KROWS;
}
