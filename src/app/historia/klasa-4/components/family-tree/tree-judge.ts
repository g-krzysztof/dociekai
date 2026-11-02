/**
 * Silnik `family-tree` — sędzia drzewa genealogicznego, bez Reacta.
 *
 * Konsumenci: L5 (rodzina wymyślona na potrzeby lekcji, z latami) i L24
 * (rodzina bogów Olimpu, bez lat — piętro wynika z samego pokrewieństwa).
 * Dane podaje lekcja, silnik niczego o rodzinie nie wie.
 *
 * Drzewo ma **piętra (pokolenia)**: 0 = pień (najstarsi), im wyżej, tym młodsi
 * (F-I.3-08). Poprawne piętro **wynika z dwóch reguł**, które dziecko stosuje
 * samo, a nie z klucza autora:
 *  1. dziecko stoi o jedno piętro nad rodzicem (jest młodsze o pokolenie),
 *  2. małżonkowie stoją na jednym piętrze (to to samo pokolenie).
 * Rodzeństwo wynika z pierwszej reguły (te same rodzice → to samo piętro).
 *
 * Sędzia nie wskazuje „właściwej” półki — wskazuje **parę osób**, która się
 * kłóci, i podaje ich lata, bo to z lat dziecko może wywnioskować, kto jest
 * starszy.
 */

export interface TreePerson {
  id: string;
  name: string;
  /** Rok urodzenia (n.e.). Bogowie (L24) go nie mają — wtedy sędzia mówi samym imieniem. */
  born?: number;
  /** Rodzice — id osób, które muszą stać piętro niżej. */
  parents?: string[];
  /** Małżonek — ta sama półka. Wystarczy podać z jednej strony. */
  partner?: string;
}

/** Piętro, na którym dziecko postawiło osobę; brak wpisu = osoba jeszcze na tacy. */
export type TreePlacement = Record<string, number | undefined>;

export interface TreeConflict {
  kind: 'dziecko-nie-nad-rodzicem' | 'za-wysoko' | 'malzonkowie';
  /** Osoby, które się kłócą — podświetlane na drzewie. */
  ids: [string, string];
  message: string;
}

export interface TreeVerdict {
  conflicts: TreeConflict[];
  placed: number;
  total: number;
  /** Wszyscy postawieni i żadna para się nie kłóci. */
  complete: boolean;
  /** Id osób biorących udział w jakimkolwiek konflikcie. */
  badIds: string[];
}

const byId = (people: TreePerson[]): Record<string, TreePerson> =>
  Object.fromEntries(people.map((p) => [p.id, p]));

const label = (p: TreePerson): string => (p.born === undefined ? p.name : `${p.name} (ur. ${p.born})`);

export function judgeTree(people: TreePerson[], placement: TreePlacement): TreeVerdict {
  const index = byId(people);
  const conflicts: TreeConflict[] = [];

  for (const child of people) {
    const childTier = placement[child.id];
    if (childTier === undefined) continue;
    for (const parentId of child.parents ?? []) {
      const parent = index[parentId];
      const parentTier = placement[parentId];
      if (!parent || parentTier === undefined) continue;
      if (childTier <= parentTier) {
        conflicts.push({
          kind: 'dziecko-nie-nad-rodzicem',
          ids: [child.id, parent.id],
          message: `${label(parent)} jest rodzicem, a ${label(child)} jego dzieckiem — dziecko jest młodsze o całe pokolenie, więc musi stać piętro wyżej niż rodzic.`,
        });
      } else if (childTier > parentTier + 1) {
        conflicts.push({
          kind: 'za-wysoko',
          ids: [child.id, parent.id],
          message: `${label(parent)} i ${label(child)} to rodzic i dziecko — dzieli ich jedno pokolenie, a na drzewie stoją o ${childTier - parentTier} piętra od siebie.`,
        });
      }
    }
  }

  const seenPairs = new Set<string>();
  for (const person of people) {
    if (!person.partner) continue;
    const mate = index[person.partner];
    if (!mate) continue;
    const key = [person.id, mate.id].sort().join('|');
    if (seenPairs.has(key)) continue;
    seenPairs.add(key);
    const a = placement[person.id];
    const b = placement[mate.id];
    if (a === undefined || b === undefined || a === b) continue;
    conflicts.push({
      kind: 'malzonkowie',
      ids: [person.id, mate.id],
      message: `${label(person)} i ${label(mate)} są małżeństwem — to to samo pokolenie, więc stoją na jednym piętrze.`,
    });
  }

  const placed = people.filter((p) => placement[p.id] !== undefined).length;
  const badIds = Array.from(new Set(conflicts.flatMap((c) => c.ids)));
  return {
    conflicts,
    placed,
    total: people.length,
    complete: placed === people.length && conflicts.length === 0,
    badIds,
  };
}

/**
 * Piętra, które wynikają z samych relacji (korzenie = 0, dziecko = rodzic + 1,
 * małżonek = piętro współmałżonka). Używane w testach i do podpisów po
 * ukończeniu — sędzia powyżej nie porównuje z tą tablicą.
 */
export function derivedTiers(people: TreePerson[]): Record<string, number> {
  const index = byId(people);
  const tiers: Record<string, number> = {};
  const visit = (id: string, trail: Set<string>): number => {
    if (tiers[id] !== undefined) return tiers[id];
    if (trail.has(id)) return 0;
    trail.add(id);
    const p = index[id];
    let tier = 0;
    for (const parentId of p.parents ?? []) tier = Math.max(tier, visit(parentId, trail) + 1);
    trail.delete(id);
    tiers[id] = tier;
    return tier;
  };
  people.forEach((p) => visit(p.id, new Set()));
  // Małżonkowie stoją na piętrze wyższego z pary.
  people.forEach((p) => {
    if (p.partner && tiers[p.partner] !== undefined) {
      const t = Math.max(tiers[p.id], tiers[p.partner]);
      tiers[p.id] = t;
      tiers[p.partner] = t;
    }
  });
  return tiers;
}

/**
 * Osoba „osiadła”: stoi na drzewie, nie kłóci się z nikim, a wszyscy, od
 * których zależy jej piętro (rodzice, małżonek), też już stoją. Dopiero wtedy
 * jej miejsce jest potwierdzone relacjami — L24 dokleja wtedy bogu atrybut.
 */
export function isSettled(people: TreePerson[], placement: TreePlacement, verdict: TreeVerdict, id: string): boolean {
  const p = people.find((x) => x.id === id);
  if (!p || placement[id] === undefined || verdict.badIds.includes(id)) return false;
  const deps = [...(p.parents ?? []), ...(p.partner ? [p.partner] : [])];
  // Ktoś, kogo ta osoba wskazuje jako małżonka z drugiej strony, też jest zależnością.
  people.forEach((x) => {
    if (x.partner === id) deps.push(x.id);
  });
  return deps.every((d) => placement[d] !== undefined && !verdict.badIds.includes(d));
}

/** Ile pokoleń ma drzewo i ile lat dzieli najstarszego od najmłodszego (wymaga lat urodzenia). */
export function treeSpan(people: TreePerson[]): {
  generations: number;
  oldest: TreePerson;
  youngest: TreePerson;
  years: number;
} {
  const tiers = derivedTiers(people);
  const born = (p: TreePerson) => p.born ?? 0;
  const oldest = people.reduce((a, b) => (born(b) < born(a) ? b : a));
  const youngest = people.reduce((a, b) => (born(b) > born(a) ? b : a));
  return {
    generations: Math.max(...Object.values(tiers)) + 1,
    oldest,
    youngest,
    years: born(youngest) - born(oldest),
  };
}
