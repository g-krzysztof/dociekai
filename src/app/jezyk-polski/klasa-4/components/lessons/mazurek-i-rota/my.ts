/**
 * L9, blok 3 „Gdzie jest «my»?” — każde „my” w obu tekstach.
 *
 * Trzy przebrania tego samego „my”: samo słowo (`my`), jego inne przypadki i
 * „nasz” (`nam`, `nas`, `nasz`) oraz **końcówka czasownika** (`żyje-my`,
 * `da-my`, dawne `przejdzie-m`, `rzuci-m`). Klucz: id wyrazu nadane w
 * `mazurek.ts` / `rota.ts` (`{#my-…}`) — lista jest pełna (selftest to sprawdza:
 * każde `my-*` w tekstach ma wpis i odwrotnie).
 */

export type MyKind = 'slowo' | 'przebranie' | 'koncowka';

export interface MyTarget {
  kind: MyKind;
  /** Dla końcówki: ile ostatnich liter to końcówka (`my` → 2, `m` → 1). */
  ending?: number;
}

export const MY_TARGETS: Record<string, MyTarget> = {
  // Mazurek
  'my-m1': { kind: 'slowo' },
  'my-m2': { kind: 'koncowka', ending: 2 }, // żyje-my
  'my-m3': { kind: 'przebranie' }, // nam
  'my-m4': { kind: 'koncowka', ending: 2 }, // odbierze-my
  'my-m5': { kind: 'koncowka', ending: 1 }, // złączy-m
  'my-m6': { kind: 'koncowka', ending: 1 }, // przejdzie-m
  'my-m7': { kind: 'koncowka', ending: 1 },
  'my-m8': { kind: 'koncowka', ending: 1 }, // będzie-m
  'my-m9': { kind: 'przebranie' }, // nam
  'my-m10': { kind: 'koncowka', ending: 2 }, // ma-my
  // Rota
  'my-r1': { kind: 'koncowka', ending: 1 }, // rzuci-m
  'my-r2': { kind: 'przebranie' }, // nasz
  'my-r3': { kind: 'koncowka', ending: 2 }, // da-my
  'my-r4': { kind: 'slowo' },
  'my-r5': { kind: 'koncowka', ending: 2 },
  'my-r6': { kind: 'przebranie' }, // nas
  'my-r7': { kind: 'przebranie' }, // nam
  'my-r8': { kind: 'przebranie' },
};

export const MY_KIND_LABEL: Record<MyKind, string> = {
  slowo: 'samo słowo „my”',
  przebranie: '„my” w przebraniu: nam, nas, nasz',
  koncowka: '„my” schowane w końcówce czasownika',
};

/** Rozbicie wyrazu na rdzeń i końcówkę do podświetlenia. */
export function splitEnding(form: string, t: MyTarget): [string, string] {
  if (t.kind !== 'koncowka' || !t.ending) return ['', form];
  return [form.slice(0, form.length - t.ending), form.slice(form.length - t.ending)];
}

export function countByKind(found: Iterable<string>): Record<MyKind, number> {
  const out: Record<MyKind, number> = { slowo: 0, przebranie: 0, koncowka: 0 };
  for (const id of found) {
    const t = MY_TARGETS[id];
    if (t) out[t.kind] += 1;
  }
  return out;
}

export const MY_TOTAL = Object.keys(MY_TARGETS).length;

/** Komentarz do przewidywania — po znalezieniu wszystkiego. */
export function guessMessage(guess: number, total: number, wordOnly: number): string {
  const head = `Samo słowo „my” stoi tylko ${wordOnly === 2 ? 'dwa razy' : `${wordOnly} razy`}. A „my” mówi tu ${total} razy.`;
  if (guess === total) return `${head} Twój typ: ${guess} — co do jednego. Bystre oko.`;
  if (guess < total) return `${head} Twój typ: ${guess}. Reszta schowała się w końcówkach i w „nam”, „nas”, „nasz”.`;
  return `${head} Twój typ: ${guess} — więcej, niż jest. A „oni” nie ma tu ani razu.`;
}
