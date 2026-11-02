/**
 * L32 — Wykopalisko roku. Sześć warstw modelowego stanowiska (takiego
 * z sześcioma epokami naraz nie ma — to model roku), od góry: Rzym
 * i chrześcijanie → Grecja → Egipt → Mezopotamia → pierwsi rolnicy →
 * łowcy i zbieracze. W każdej warstwie znalezisko otwiera mikro-zadanie
 * w geście z tamtego modułu; sędziowie poniżej — czyste funkcje.
 */

export type LayerId = 'rzym' | 'grecja' | 'egipt' | 'mezopotamia' | 'neolit' | 'pradzieje';

export interface Layer {
  id: LayerId;
  era: string;
  when: string;
  soil: string;
  find: string;
  /** Lekcje, z których pochodzi gest mikro-zadania. */
  from: string;
}

export const LAYERS: readonly Layer[] = [
  { id: 'rzym', era: 'Rzym i pierwsi chrześcijanie', when: 'I–IV w. n.e.', soil: '#c9a877', find: 'kamień z rzymskiego kanału wodnego', from: 'L28' },
  { id: 'grecja', era: 'Grecja', when: 'V w. p.n.e.', soil: '#b8946a', find: 'skorupa z wydrapanym imieniem — kartka do głosowania', from: 'L23' },
  { id: 'egipt', era: 'Egipt', when: 'ok. 2500 p.n.e.', soil: '#a7845f', find: 'drewniany sierp z krzemiennymi zębami', from: 'L19' },
  { id: 'mezopotamia', era: 'Mezopotamia', when: 'ok. 3000 p.n.e.', soil: '#937356', find: 'gliniana tabliczka i trzcinowy rylec', from: 'L17–L18' },
  { id: 'neolit', era: 'Pierwsi rolnicy', when: 'ok. 9000 p.n.e.', soil: '#7f634b', find: 'kamień do mielenia ziarna', from: 'L16' },
  { id: 'pradzieje', era: 'Łowcy i zbieracze', when: 'dziesiątki tysięcy lat temu', soil: '#6a5240', find: 'krzemienny grot włóczni', from: 'L15' },
];

export type Verdict = { ok: true } | { ok: false; message: string };

// ─── Rzym: kanał akweduktu (L28) ─────────────────────────────────────────────

export const SOURCE_M = 80;
export const CITY_M = 30;

/** Dwa punkty kanału między źródłem (80 m) a miastem (30 m): woda płynie tylko w dół. */
export function judgeChannel(h1: number, h2: number): Verdict {
  if (h1 >= SOURCE_M) return { ok: false, message: `Punkt 1 stoi na ${h1} m — wyżej niż źródło (${SOURCE_M} m). Woda nie popłynie pod górę.` };
  if (h2 >= h1) return { ok: false, message: `Punkt 2 (${h2} m) nie jest niżej niż punkt 1 (${h1} m) — tu woda stanie.` };
  if (h2 <= CITY_M) return { ok: false, message: `Punkt 2 (${h2} m) jest niżej niż miasto (${CITY_M} m) — woda nie dopłynie do miasta.` };
  return { ok: true };
}

// ─── Grecja: kto głosuje w Atenach (L23) ─────────────────────────────────────

export interface Person {
  id: string;
  label: string;
  man: boolean;
  adult: boolean;
  citizen: boolean;
}

export const ATHENIANS: readonly Person[] = [
  { id: 'kleon', label: 'Kleon, garncarz, syn Ateńczyków, 40 lat', man: true, adult: true, citizen: true },
  { id: 'aspazja', label: 'Aspazja, żona obywatela, przybyła z Miletu', man: false, adult: true, citizen: false },
  { id: 'manes', label: 'Manes, niewolnik w kopalni srebra', man: true, adult: true, citizen: false },
  { id: 'lizja', label: 'Lizjasz, kupiec z Syrakuz, od 20 lat w Atenach', man: true, adult: true, citizen: false },
  { id: 'filip', label: 'Filip, 12-letni syn obywatela', man: true, adult: false, citizen: true },
  { id: 'nikias', label: 'Nikias, rolnik spod Aten, syn Ateńczyków, 55 lat', man: true, adult: true, citizen: true },
];

export const canVote = (p: Person) => p.man && p.adult && p.citizen;

export function judgeVoters(picked: readonly string[]): Verdict {
  for (const p of ATHENIANS) {
    const on = picked.includes(p.id);
    if (on && !canVote(p)) {
      const why = !p.adult ? 'jest dzieckiem' : !p.man ? 'jest kobietą, a kobiety nie głosowały' : !p.citizen ? 'nie jest obywatelem' : '';
      return { ok: false, message: `${p.label.split(',')[0]} nie ${p.man ? 'miał' : 'miała'} prawa głosu — ${why}.` };
    }
    if (!on && canVote(p)) return { ok: false, message: `Brakuje kogoś: ${p.label.split(',')[0]} — dorosły mężczyzna, obywatel — miał prawo głosu.` };
  }
  return { ok: true };
}

// ─── Egipt: pora siewu (L19) ─────────────────────────────────────────────────

export type Season = 'achet' | 'peret' | 'szemu';

export const SEASONS: readonly { id: Season; name: string; what: string }[] = [
  { id: 'achet', name: 'Achet', what: 'Nil wylewa — pola stoją pod wodą' },
  { id: 'peret', name: 'Peret', what: 'woda opada, zostaje mokry, żyzny muł' },
  { id: 'szemu', name: 'Szemu', what: 'gorąco i sucho, rzeka najniżej' },
];

export function judgeSow(s: Season): Verdict {
  if (s === 'peret') return { ok: true };
  if (s === 'achet') return { ok: false, message: 'W porze Achet pola stoją pod wodą — ziarno by spłynęło.' };
  return { ok: false, message: 'W porze Szemu ziemia jest sucha i twarda — to pora żniw, nie siewu.' };
}

// ─── Mezopotamia: liczba zapisana klinami (L18) ──────────────────────────────

export type Wedge = 10 | 1;
export const TABLET_TARGET = 23;

/** Dziesiątki (klin kątowy) piszemy przed jednościami (klin pionowy) — jak w L18. */
export function judgeTablet(wedges: readonly Wedge[]): Verdict {
  const tens = wedges.filter((w) => w === 10).length;
  const ones = wedges.filter((w) => w === 1).length;
  const sum = tens * 10 + ones;
  if (sum !== TABLET_TARGET) return { ok: false, message: `Na tabliczce stoi ${sum}, a skryba ma zapisać ${TABLET_TARGET} worki jęczmienia.` };
  const firstOne = wedges.indexOf(1);
  if (firstOne >= 0 && wedges.slice(firstOne).includes(10)) return { ok: false, message: 'Liczba się zgadza, ale kliny dziesiątek stoją po jedynkach. Skryba pisał najpierw dziesiątki.' };
  return { ok: true };
}

// ─── Pierwsi rolnicy: kolejność pracy w roku (L16) ───────────────────────────

export const FARM_STEPS: readonly { id: string; label: string }[] = [
  { id: 'karczuj', label: 'wyrwij krzaki i spulchnij ziemię' },
  { id: 'siej', label: 'zasiej ziarno' },
  { id: 'zbieraj', label: 'zbierz kłosy sierpem' },
  { id: 'miel', label: 'zmiel ziarno na kamieniu' },
];

export function judgeFarm(order: readonly string[]): Verdict {
  for (let i = 0; i < order.length; i++) {
    if (order[i] !== FARM_STEPS[i].id) {
      const got = FARM_STEPS.find((s) => s.id === order[i])!;
      return { ok: false, message: `Na miejscu ${i + 1}. stoi „${got.label}”, a najpierw trzeba: „${FARM_STEPS[i].label}”.` };
    }
  }
  return { ok: true };
}

// ─── Łowcy: dokąd przenieść obóz (L15) ───────────────────────────────────────

export type Place = 'wodopoj' | 'jaskinia' | 'wzgorza';

export const PLACES: readonly { id: Place; name: string }[] = [
  { id: 'wodopoj', name: 'nad jezioro na wschodzie' },
  { id: 'jaskinia', name: 'do jaskini na zachodzie' },
  { id: 'wzgorza', name: 'na wzgórza na południu' },
];

/** Ślady stada prowadzą na wschód, do jeziora — z rysunku, nie z klucza. */
export const HERD_WENT: Place = 'wodopoj';

export function judgeCamp(p: Place): Verdict {
  if (p === HERD_WENT) return { ok: true };
  return { ok: false, message: 'Spójrz na ślady kopyt — stado poszło w inną stronę. Łowcy szli tam, gdzie jedzenie.' };
}
