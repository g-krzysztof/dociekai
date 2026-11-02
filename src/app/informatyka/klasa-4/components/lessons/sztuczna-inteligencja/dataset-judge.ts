import { FEATURES, FUR_NAME, c, isBibi, type Creature, type FeatureId } from './creatures';

/**
 * Werdykt zadania praktycznego z lekcji o sztucznej inteligencji.
 *
 * Zadanie odwraca rolę z bloku 1: tam dziecko było modelem i dostało złe
 * przykłady, tu **ono dobiera przykłady dla maszyny**. Wie już, że bibi to
 * stworek z kropkami — maszyna nie wie i dowie się tylko z tego, co dostanie.
 *
 * **Model jest prawdziwy i prosty do pokazania.** Maszyna sprawdza każdą z
 * czterech cech osobno: jak dobrze ta jedna cecha rozdziela wybrane przykłady
 * na bibi i nie-bibi. Potem trzyma się tej, która rozdziela najlepiej. Kropki
 * zawsze rozdzielają w stu procentach, bo to one decydują o bibi — więc
 * jedynym sposobem, żeby maszyna nauczyła się złej reguły, jest podsunąć jej
 * drugą cechę, która w wybranych przykładach **przypadkiem** też rozdziela
 * w stu procentach. Przy remisie maszyna bierze pierwszą cechę z listy (uszy,
 * kolor, oczy, kropki) i mówi to wprost — remis to dla niej rzut monetą,
 * a moneta nie musi upaść po myśli dziecka.
 *
 * Z tego wynika, że kryteria 3–5 da się sformułować jako **kontrprzykład**
 * dla każdej fałszywej wskazówki — i tak właśnie są napisane, z nazwaniem
 * konkretu: „wszystkie twoje bibi mają okrągłe uszy, a wszystkie nie-bibi
 * spiczaste”. Kryterium 6 nie jest przeczytaniem wyboru, tylko **uruchomieniem
 * maszyny** na dwunastu stworkach, których nie widziała.
 */

export const MAX_EXAMPLES = 6;
export const MIN_PER_SIDE = 2;
export const PASS_MARK = 11;

/**
 * Kolekcja z pułapką: większość bibi ma okrągłe uszy, dwoje oczu i niebieski
 * kolor, większość nie-bibi — spiczaste uszy, jedno oko i pomarańczowy. Ręka
 * sięgająca po „typowe” przykłady zbuduje maszynę, która patrzy na uszy.
 * Kontrprzykłady są w kolekcji, ale trzeba ich poszukać.
 */
export const POOL: Creature[] = [
  c('p01', true, 'round', 'blue', 2),
  c('p02', false, 'pointy', 'orange', 1),
  c('p03', true, 'round', 'blue', 1),
  c('p04', false, 'pointy', 'green', 1),
  c('p05', true, 'pointy', 'blue', 2),
  c('p06', false, 'pointy', 'orange', 1),
  c('p07', true, 'round', 'blue', 2),
  c('p08', false, 'round', 'orange', 1),
  c('p09', true, 'round', 'orange', 2),
  c('p10', false, 'pointy', 'orange', 2),
  c('p11', true, 'round', 'green', 2),
  c('p12', false, 'pointy', 'orange', 1),
  c('p13', true, 'pointy', 'green', 1),
  c('p14', false, 'round', 'blue', 2),
  c('p15', true, 'round', 'blue', 2),
  c('p16', false, 'pointy', 'green', 1),
];

/** Sprawdzian: dwanaście stworków spoza kolekcji, cechy wymieszane celowo. */
export const TEST_SET: Creature[] = [
  c('t01', true, 'round', 'orange', 1),
  c('t02', false, 'round', 'blue', 2),
  c('t03', true, 'pointy', 'orange', 2),
  c('t04', false, 'round', 'blue', 1),
  c('t05', true, 'pointy', 'green', 1),
  c('t06', false, 'pointy', 'blue', 2),
  c('t07', true, 'round', 'green', 1),
  c('t08', false, 'round', 'green', 2),
  c('t09', true, 'pointy', 'blue', 1),
  c('t10', false, 'pointy', 'orange', 2),
  c('t11', true, 'round', 'orange', 2),
  c('t12', false, 'round', 'green', 1),
];

function valueOf(creature: Creature, feature: FeatureId): string {
  switch (feature) {
    case 'kropki':
      return creature.spots ? 'z kropkami' : 'bez kropek';
    case 'uszy':
      return creature.ears === 'round' ? 'okrągłe uszy' : 'spiczaste uszy';
    case 'kolor':
      return FUR_NAME[creature.fur];
    case 'oczy':
      return creature.eyes === 1 ? 'jedno oko' : 'dwoje oczu';
  }
}

export interface FeatureScore {
  feature: FeatureId;
  /** Ile przykładów ta jedna cecha rozdziela dobrze (najlepsza reguła „wartość → strona”). */
  correct: number;
  total: number;
  /** Reguła: wartość cechy → bibi (true), nie-bibi (false) albo remis (null). */
  rule: Map<string, boolean | null>;
}

export function scoreFeature(examples: Creature[], feature: FeatureId): FeatureScore {
  const groups = new Map<string, { bibi: number; nie: number }>();
  for (const example of examples) {
    const key = valueOf(example, feature);
    const group = groups.get(key) ?? { bibi: 0, nie: 0 };
    if (isBibi(example)) group.bibi += 1;
    else group.nie += 1;
    groups.set(key, group);
  }
  let correct = 0;
  const rule = new Map<string, boolean | null>();
  groups.forEach((group, key) => {
    correct += Math.max(group.bibi, group.nie);
    rule.set(key, group.bibi === group.nie ? null : group.bibi > group.nie);
  });
  return { feature, correct, total: examples.length, rule };
}

export interface Machine {
  scores: FeatureScore[];
  /** Cecha, której maszyna się trzyma. */
  chosen: FeatureScore | null;
  /** Inne cechy rozdzielające równie dobrze — remis, który maszyna rozstrzyga pierwszą z listy. */
  tiedWith: FeatureId[];
  /** Na wypadek wartości, której w przykładach nie było: strona, po której było więcej przykładów. */
  fallback: boolean;
}

export function train(examples: Creature[]): Machine {
  const scores = FEATURES.map((feature) => scoreFeature(examples, feature.id));
  if (examples.length === 0) return { scores, chosen: null, tiedWith: [], fallback: false };
  const best = Math.max(...scores.map((score) => score.correct));
  const top = scores.filter((score) => score.correct === best);
  const bibi = examples.filter(isBibi).length;
  return {
    scores,
    chosen: top[0],
    tiedWith: top.slice(1).map((score) => score.feature),
    fallback: bibi > examples.length - bibi,
  };
}

export interface Answer {
  creature: Creature;
  says: boolean;
  /** Maszyna nie miała reguły dla tej wartości i zgadła. */
  guessed: boolean;
  right: boolean;
}

export function ask(machine: Machine, creature: Creature): Answer {
  const rule = machine.chosen?.rule.get(valueOf(creature, machine.chosen.feature));
  const guessed = rule === undefined || rule === null;
  const says = guessed ? machine.fallback : (rule as boolean);
  return { creature, says, guessed, right: says === isBibi(creature) };
}

export interface Criterion {
  id: string;
  label: string;
  ok: boolean;
  detail: string;
}

const SIDE_TEXT: Record<Exclude<FeatureId, 'kropki'>, { label: string; plural: (values: string[]) => string; hint: string }> = {
  uszy: {
    label: 'Uszy niczego nie podpowiadają',
    plural: (values) => `mają tylko ${values.join(' i ')}`,
    hint: 'bibi ze spiczastymi uszami albo nie-bibi z okrągłymi',
  },
  kolor: {
    label: 'Kolor niczego nie podpowiada',
    plural: (values) => `są tylko ${values.map(colorAdjective).join(' i ')}`,
    hint: 'ten sam kolor po obu stronach — na przykład niebieskie bibi i niebieskie nie-bibi',
  },
  oczy: {
    label: 'Liczba oczu niczego nie podpowiada',
    plural: (values) => `mają tylko ${values.join(' i ')}`,
    hint: 'bibi z jednym okiem albo nie-bibi z dwojgiem oczu',
  },
};

/** „niebieski” → „niebieskie”: przymiotnik w liczbie mnogiej, do zdania o kilku stworkach. */
function colorAdjective(value: string): string {
  return value.replace(/i$/, 'ie').replace(/y$/, 'e');
}

function valuesOnSide(examples: Creature[], feature: FeatureId, bibi: boolean): string[] {
  return [...new Set(examples.filter((e) => isBibi(e) === bibi).map((e) => valueOf(e, feature)))];
}

export function judgeDataset(examples: Creature[]): { criteria: Criterion[]; machine: Machine; answers: Answer[] } {
  const machine = train(examples);
  const bibi = examples.filter(isBibi).length;
  const nie = examples.length - bibi;
  const answers = TEST_SET.map((creature) => ask(machine, creature));
  const hits = answers.filter((answer) => answer.right).length;

  const criteria: Criterion[] = [
    {
      id: 'limit',
      label: `Najwyżej ${MAX_EXAMPLES} przykładów`,
      ok: examples.length > 0 && examples.length <= MAX_EXAMPLES,
      detail:
        examples.length === 0
          ? 'Nie wybrałeś/wybrałaś jeszcze żadnego stworka.'
          : examples.length <= MAX_EXAMPLES
            ? `Masz ${examples.length} — mieści się.`
            : `Masz ${examples.length}, czyli o ${examples.length - MAX_EXAMPLES} za dużo. Wybierz te, które naprawdę czegoś uczą.`,
    },
    {
      id: 'obie-strony',
      label: `Co najmniej ${MIN_PER_SIDE} bibi i ${MIN_PER_SIDE} nie-bibi`,
      ok: bibi >= MIN_PER_SIDE && nie >= MIN_PER_SIDE,
      detail:
        bibi >= MIN_PER_SIDE && nie >= MIN_PER_SIDE
          ? `Bibi: ${bibi}, nie-bibi: ${nie}.`
          : `Bibi: ${bibi}, nie-bibi: ${nie}. Maszyna nie odróżni dwóch rzeczy, jeśli jednej prawie nie widziała.`,
    },
    ...(['uszy', 'kolor', 'oczy'] as const).map((feature): Criterion => {
      const score = machine.scores.find((item) => item.feature === feature)!;
      const text = SIDE_TEXT[feature];
      const tells = examples.length > 0 && bibi > 0 && nie > 0 && score.correct === score.total;
      return {
        id: feature,
        label: text.label,
        ok: examples.length > 0 && !tells,
        detail:
          examples.length === 0
            ? 'Najpierw wybierz przykłady.'
            : tells
              ? `Twoje bibi ${text.plural(valuesOnSide(examples, feature, true))}, a twoje nie-bibi ${text.plural(
                  valuesOnSide(examples, feature, false)
                )}. Maszyna nie wie, że to przypadek. Pokaż jej ${text.hint}.`
              : `Ta cecha nie rozdziela twoich przykładów, więc maszyna nie ma po co na nią patrzeć.`,
      };
    }),
    {
      id: 'sprawdzian',
      label: `Sprawdzian: co najmniej ${PASS_MARK} z ${TEST_SET.length} stworków, których maszyna nie widziała`,
      ok: examples.length > 0 && hits >= PASS_MARK,
      detail:
        examples.length === 0
          ? 'Maszyna bez przykładów nie ma czego się trzymać.'
          : `Rozpoznała ${hits} z ${TEST_SET.length}. Trzymała się cechy: ${featureName(machine.chosen?.feature)}${
              machine.tiedWith.length > 0 ? ` (remis z: ${machine.tiedWith.map(featureName).join(', ')} — wzięła pierwszą z listy)` : ''
            }.`,
    },
  ];

  return { criteria, machine, answers };
}

export function featureName(feature?: FeatureId): string {
  return FEATURES.find((item) => item.id === feature)?.name ?? '—';
}
