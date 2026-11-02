import type { ProofCriterion, ProofOutcome, ProofVerdict, ProofVerdicts } from '../../task-shell';
import { count } from '../../../lib/plural';
import {
  BLOCKS,
  HOME,
  META_CONDITION,
  TOUCH_RADIUS,
  make,
  run,
  touches,
  type Block,
  type BlockType,
  type Run,
  type Sprite,
  type StagePoint,
} from '../../scratch/engine';

/**
 * Werdykt zadania praktycznego lekcji 28 — **robota, który sam dojeżdża do
 * mety**. Zamówienie jest autorskie (program nie ma tu zadania
 * obowiązkowego), a dziecko wykonuje je na stronie, w edytorze z lekcji 27.
 *
 * Najważniejszy werdykt jest **ostatni** i jedyny, który nie czyta struktury, tylko
 * **uruchamia program**: robot ma stanąć przy mecie, **gdziekolwiek ją
 * postawimy** — blisko, w połowie drogi i daleko. Projekt z `powtórz 18 razy
 * [przesuń o 10]` wygląda przy jednej mecie identycznie jak ten z czujnikiem —
 * robot dojeżdża i staje — i jest dokładnie tym, czego cała lekcja uczy nie
 * robić. Przy pozostałych dwóch metach wychodzi na jaw, że o niczym nie
 * decydował czujnik. Pytania o budowę („czy jest pętla”, „czy warunek leży w
 * środku”) zostają, ale jako **diagnoza**, bo mówią dziecku, co poprawić — nie
 * jako dowód.
 *
 * Nie ma kryterium „na scenie są dwa duszki”: meta jest częścią świata, nie
 * pracą dziecka. Nie ma też „robot rusza od zielonej flagi” — kapelusz z flagą
 * stoi w edytorze na sztywno.
 */

/** Robot stoi na starcie po lewej, twarzą do mety. */
export const ROBOT_START: Sprite = { ...HOME, x: -150, y: 0, direction: 90, rotationStyle: 'lewo-prawo' };

/**
 * Trzy miejsca mety, w których sprawdzamy program. Odstępy są większe niż
 * `2 × TOUCH_RADIUS`, więc robot zatrzymany przy jednej z nich **nie dotyka**
 * żadnej sąsiedniej — inaczej program liczący kroki „trafiałby” w dwie mety naraz
 * tylko dlatego, że stoją blisko siebie.
 */
export const METAS = [
  { id: 'blisko', label: 'blisko', x: -30 },
  { id: 'srodek', label: 'w połowie drogi', x: 80 },
  { id: 'daleko', label: 'daleko', x: 190 },
] as const;

export type MetaSpot = (typeof METAS)[number];

/** Zakres, po którym dziecko może przestawiać metę suwakiem — od „jeszcze nie dotyka startu” po skraj sceny. */
export const META_RANGE = { min: -60, max: 195, step: 5 } as const;

/**
 * Program liczący kroki — ten z bloku „Cztery przejazdy”, dopasowany do mety
 * **w połowie drogi**. Trafia w nią co do kroku i na tym kończy się jego wiedza o
 * świecie; przy dwóch pozostałych nie ma z czym pójść dalej. Służy tylko za
 * kontrast w nagrodzie.
 */
export const COUNTED_STACK: Block[] = [
  make('flaga'),
  make('powtorz', Math.round((METAS[1].x - TOUCH_RADIUS - ROBOT_START.x) / 10), [make('idz', 10)]),
];

/* ------------------------------------------------------------------ */
/* Przebieg na jednej mecie                                            */
/* ------------------------------------------------------------------ */

export type Outcome = 'stanal' | 'dalej' | 'krotko';

export interface MetaRun {
  meta: MetaSpot;
  outcome: Outcome;
  /** Miejsca, w których stał robot po kolejnych ruchach — od startu do końca programu. */
  path: StagePoint[];
  /** Gdzie robot stanął na końcu. */
  final: StagePoint;
  /** Gdzie pierwszy raz dotknął mety — `null`, gdy do niej nie dotarł. */
  touched: StagePoint | null;
  /** Czy program ścięły sufity czasu silnika (pętla bez końca albo bardzo wolna jazda). */
  endless: boolean;
}

/** Miejsca, w których robot naprawdę stał — z `log`, bo klatki oddają tylko chwile po czekaniach i obiegach pętli. */
function pathOf(result: Run, start: StagePoint): StagePoint[] {
  const path: StagePoint[] = [{ x: start.x, y: start.y }];
  for (const entry of result.log) {
    if (!entry.dx && !entry.dy) continue;
    const last = path[path.length - 1];
    path.push({ x: last.x + (entry.dx ?? 0), y: last.y + (entry.dy ?? 0) });
  }
  return path;
}

/**
 * Uruchamia program na jednej mecie. **„Stanął” znaczy: skończył dokładnie tam,
 * gdzie pierwszy raz jej dotknął.** Robot, który dotknął mety i pojechał dalej,
 * nie stanął — choćby wciąż na niej leżał, bo o tym, że ma się zatrzymać,
 * zdecydował ktoś inny niż on.
 */
function driveTo(stack: Block[], meta: MetaSpot): MetaRun {
  const target: StagePoint = { x: meta.x, y: 0 };
  const result = run(stack, ROBOT_START, { meta: target });
  const path = pathOf(result, ROBOT_START);
  const final = path[path.length - 1];
  const first = path.find((point) => touches(point, target)) ?? null;
  const outcome: Outcome = !first ? 'krotko' : first.x === final.x && first.y === final.y ? 'stanal' : 'dalej';
  return { meta, outcome, path, final, touched: first, endless: result.endless };
}

/** Ten sam program na wszystkich trzech metach. */
export function driveAll(stack: Block[]): MetaRun[] {
  return METAS.map((meta) => driveTo(stack, meta));
}

/* ------------------------------------------------------------------ */
/* Struktura skryptu                                                   */
/* ------------------------------------------------------------------ */

const LOOPS = new Set<BlockType>(['powtorz', 'zawsze']);
const GUARDS = new Set<BlockType>(['jezeli', 'jezeli_inaczej']);
/** Rzeczy, po których widać albo słychać, że robot dojechał. */
const SIGNALS = new Set<BlockType>(['powiedz', 'dzwiek']);

/** Wszystkie klocki poniżej — z wnętrzem obu paszcz, w kolejności czytania. */
function below(blocks: Block[]): Block[] {
  return blocks.flatMap((block) => [block, ...below(block.inner ?? []), ...below(block.inner2 ?? [])]);
}

function inside(block: Block): Block[] {
  return below([...(block.inner ?? []), ...(block.inner2 ?? [])]);
}

function labelOf(block: Block): string {
  return BLOCKS[block.type].label.replace('{}', String(block.value ?? ''));
}

interface Reading {
  /** Pętla, w której robot jedzie. */
  loop: Block | null;
  movers: Block[];
  /** Klocek „jeżeli” z czujnikiem mety. */
  guard: Block | null;
  /** „Jeżeli” z jakimkolwiek innym czujnikiem. */
  otherGuard: Block | null;
  /** Czy czujnik mety leży w środku pętli, w której robot jedzie. */
  guarded: boolean;
  /** Sygnały w części „to” i w części „w przeciwnym razie” klocka z czujnikiem. */
  reaction: Block[];
  reactionElsewhere: Block[];
  /** Ile obiegów odlicza pętla „powtórz”, w której robot jedzie. */
  counter: number | null;
  empty: boolean;
}

function read(stack: Block[]): Reading {
  const all = below(stack.slice(1));
  const loop = all.find((block) => LOOPS.has(block.type) && inside(block).some((item) => item.type === 'idz')) ?? null;
  const guards = all.filter((block) => GUARDS.has(block.type));
  const guard = guards.find((block) => block.value === META_CONDITION) ?? null;

  return {
    loop,
    movers: loop ? inside(loop).filter((block) => block.type === 'idz') : [],
    guard,
    otherGuard: guards.find((block) => block.value !== META_CONDITION) ?? null,
    guarded: Boolean(guard && loop && inside(loop).includes(guard)),
    reaction: guard ? below(guard.inner ?? []).filter((block) => SIGNALS.has(block.type)) : [],
    reactionElsewhere: guard ? below(guard.inner2 ?? []).filter((block) => SIGNALS.has(block.type)) : [],
    counter: loop?.type === 'powtorz' ? Math.round(Number(loop.value ?? 0)) : null,
    empty: all.length === 0,
  };
}

/* ------------------------------------------------------------------ */
/* Werdykt                                                             */
/* ------------------------------------------------------------------ */

export const ROBOT_CRITERIA: ProofCriterion[] = [
  { id: 'petla', label: 'jazda siedzi w pętli, a nie w jednym klocku' },
  { id: 'czujnik', label: 'o zatrzymaniu decyduje czujnik „dotykasz mety?”, a nie odliczanie kroków' },
  { id: 'warunek-w-petli', label: 'czujnik jest sprawdzany w środku pętli, przy każdym kroku' },
  { id: 'reakcja', label: 'po dotarciu robot daje znać: mówi albo gra dźwięk' },
  { id: 'meta', label: 'robot staje przy mecie — blisko, w połowie drogi i daleko, gdziekolwiek ją postawię' },
];

/** Co się stało na jednej mecie — końcówka zdania „gdy meta stała …”. */
function told(item: MetaRun): string {
  if (item.outcome === 'stanal') return 'robot stanął przy niej';
  if (item.outcome === 'dalej') return 'robot jej dotknął, ale pojechał dalej';
  const gap = Math.round(item.meta.x - item.final.x);
  return gap > 0
    ? `robot nie dojechał — skończył jazdę ${count(gap, 'krok', 'kroki', 'kroków')} przed nią`
    : 'robot nie dojechał';
}

/** Jedno zdanie o wszystkich trzech metach — gdy na każdej było tak samo, mówimy to raz, a nie trzy razy. */
function story(runs: MetaRun[]): string {
  if (runs.every((item) => item.outcome === runs[0].outcome))
    return runs[0].outcome === 'dalej'
      ? 'Na każdej z trzech met robot jej dotknął, ale nie stanął — pojechał dalej.'
      : 'Na żadnej z trzech met robot nie dojechał.';

  return runs
    .map((item, index) => {
      const spot = index === 0 ? `Gdy meta stała ${item.meta.label}` : `${item.meta.label.charAt(0).toUpperCase()}${item.meta.label.slice(1)}`;
      return `${spot} — ${told(item)}.`;
    })
    .join(' ');
}

/** Co poprawić, gdy robot dotknął mety i pojechał dalej. */
function overrunAdvice(guard: Block): string {
  if (guard.type === 'jezeli')
    return 'Zwykłe „jeżeli … to” niczego nie zatrzymuje. Użyj klocka „jeżeli … w przeciwnym razie” i włóż „przesuń” do drugiej części — wtedy robot jedzie tylko wtedy, gdy mety jeszcze nie dotyka.';
  if (inside({ ...guard, inner2: [] }).some((block) => block.type === 'idz'))
    return 'W pierwszej części („to”) też jest „przesuń”, więc robot jedzie dalej także po dotknięciu mety. Zostaw tam tylko to, co ma zrobić na mecie.';
  if ((guard.inner2 ?? []).some((block) => block.type === 'idz'))
    return 'Jazda jest w części „w przeciwnym razie”, ale robot jedzie także gdzieś poza warunkiem — sprawdź, czy nie stoi tam drugi klocek „przesuń”.';
  return 'Jazda stoi poza warunkiem, więc dzieje się zawsze, nawet przy mecie. Przenieś „przesuń” do części „w przeciwnym razie”.';
}

function judgeMeta(reading: Reading, runs: MetaRun[]): ProofVerdict {
  if (runs.every((item) => item.outcome === 'stanal'))
    return {
      ok: true,
      note: 'Na wszystkich trzech metach robot dojechał i stanął tuż przy niej — choć żadnej z nich nie znał z góry. Tak działa czujnik.',
    };

  if (reading.empty)
    return { ok: false, note: 'Robot stoi w miejscu: pod flagą nie ma jeszcze żadnego klocka.' };

  const { guard } = reading;
  let advice: string;

  if (runs.every((item) => item.path.length === 1))
    advice =
      guard && (guard.inner ?? []).some((block) => block.type === 'idz') && !(guard.inner2 ?? []).some((block) => block.type === 'idz')
        ? 'Robot ani drgnął: jazda stoi w pierwszej części „jeżeli dotykasz mety? to”, a ta wykonuje się dopiero przy mecie. Przenieś „przesuń” do „w przeciwnym razie”.'
        : 'Robot ani drgnął — żaden klocek „przesuń” się nie wykonuje.';
  else if (!guard)
    advice =
      'Robot nie pyta o metę, więc nie wie, gdzie stoi — a stoi za każdym razem gdzie indziej. Czujnik „dotykasz mety?” to jedyny sposób, żeby to poznał.';
  else if (runs.some((item) => item.outcome === 'dalej')) advice = overrunAdvice(guard);
  else if (reading.counter !== null)
    advice = `Pętla „powtórz ${reading.counter} razy” skończyła się, zanim robot doszedł do mety. Kto odlicza kroki, musi znać odległość z góry — a meta może stać wszędzie.`;
  else if (runs.some((item) => item.outcome === 'krotko' && item.endless))
    advice = 'Robot jedzie za wolno: po dwunastu sekundach program się skończył, a on jeszcze nie dojechał. Skróć czekanie w pętli albo zwiększ krok.';
  else advice = 'Robot przestał jechać, zanim dotknął mety.';

  return { ok: false, note: `${story(runs)} ${advice}` };
}

/** Ustawienie z pola „jeżeli”, które nie jest czujnikiem mety — i co w nim nie pasuje do tej sceny. */
function wrongSensor(value: string | number | undefined): string {
  if (value === 'dotykasz krawędzi?')
    return 'Robot pyta „dotykasz krawędzi?” — ten czujnik zapali się dopiero na końcu sceny, a meta stoi wcześniej. Kliknij owalne pole w klocku „jeżeli” i wybierz „dotykasz mety?”.';
  if (value === 'dotykasz czarnej linii?')
    return 'Robot pyta „dotykasz czarnej linii?”, a na tej scenie nie ma żadnej czarnej linii — ten czujnik nigdy się nie zapali. Kliknij owalne pole w klocku „jeżeli” i wybierz „dotykasz mety?”.';
  return `Robot pyta „${value}”, a to nie jest czujnik mety. Kliknij owalne pole w klocku „jeżeli” i wybierz „dotykasz mety?”.`;
}

export function judgeRobot(stack: Block[]): ProofOutcome<{ runs: MetaRun[] }> {
  const reading = read(stack);
  const runs = driveAll(stack);
  const { loop, movers, guard, otherGuard, guarded, reaction, reactionElsewhere, counter } = reading;
  const anyMove = below(stack.slice(1)).some((block) => block.type === 'idz');

  const verdicts: ProofVerdicts = {
    petla:
      loop && movers.length > 0
        ? {
            ok: true,
            note: `Jazda siedzi w pętli „${labelOf(loop)}”, a w środku ${count(movers.length, 'klocek ruchu', 'klocki ruchu', 'klocków ruchu')}.`,
          }
        : {
            ok: false,
            note: reading.empty
              ? 'Pod flagą nie ma jeszcze żadnego klocka. Zacznij od pętli „zawsze” i włóż do niej „przesuń o … kroków”.'
              : anyMove
                ? 'Ruch jest, ale bez pętli — robot zrobi jeden krok i skończy. Owiń jazdę w „zawsze” albo „powtórz … razy”.'
                : below(stack.slice(1)).some((block) => LOOPS.has(block.type))
                  ? 'Pętla jest, ale nic w niej nie jedzie. Wstaw do jej wnętrza klocek „przesuń o … kroków”.'
                  : 'Robot niczego nie przesuwa. Potrzebna jest pętla, a w niej „przesuń o … kroków”.',
          },

    czujnik: guard
      ? { ok: true, note: `Robot pyta czujnika: „${META_CONDITION}”. To on decyduje, a nie licznik.` }
      : {
          ok: false,
          note: otherGuard
            ? wrongSensor(otherGuard.value)
            : counter !== null
              ? `Jedyne, co zatrzymuje twojego robota, to odliczone ${count(counter, 'powtórzenie', 'powtórzenia', 'powtórzeń')}. Wystarczy przestawić metę, a program przestanie pasować. Wstaw klocek „jeżeli” i ustaw w nim czujnik „dotykasz mety?”.`
              : 'Nie znalazłam warunku z czujnikiem. Klocek „jeżeli … to” z „dotykasz mety?” w sześciokątnym polu ma rozstrzygać, czy robot już dojechał.',
        },

    'warunek-w-petli': guarded
      ? { ok: true, note: 'Czujnik jest sprawdzany w środku pętli, czyli przy każdym kroku jazdy.' }
      : {
          ok: false,
          note: guard
            ? loop
              ? 'Warunek z czujnikiem jest, ale leży poza pętlą, w której robot jedzie — sprawdzi się raz, zanim ruszy, i nigdy więcej. Przenieś go do środka pętli.'
              : 'Warunek z czujnikiem jest, ale nie ma pętli z jazdą, w której mógłby stać.'
            : 'Najpierw czujnik „dotykasz mety?”, potem miejsce dla niego w pętli.',
        },

    reakcja: reaction.length > 0
      ? { ok: true, note: `Po dotarciu robot daje znać: „${labelOf(reaction[0])}”.` }
      : {
          ok: false,
          note: !guard
            ? 'Najpierw czujnik „dotykasz mety?” — reakcja ma stać w jego pierwszej części.'
            : reactionElsewhere.length > 0
              ? 'Robot daje znać w części „w przeciwnym razie”, czyli wtedy, gdy mety NIE dotyka. Przenieś „powiedz …” do pierwszej części, tuż pod „jeżeli dotykasz mety? to”.'
              : (guard.inner ?? []).length === 0
                ? 'Pierwsza część warunku jest pusta, więc po dotarciu do mety nic się nie dzieje. Wstaw tam „powiedz …” albo „zagraj dźwięk”.'
                : `W pierwszej części warunku jest „${labelOf(guard.inner![0])}”, ale nic, po czym poznasz, że robot dojechał. Dodaj „powiedz …” albo „zagraj dźwięk”.`,
        },

    meta: judgeMeta(reading, runs),
  };

  return { verdicts, data: { runs } };
}
