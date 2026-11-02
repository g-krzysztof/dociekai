import type { ProofCriterion, ProofVerdicts } from '../../task-shell';
import { count } from '../../../lib/plural';
import { KEY_SENSOR, flatSteps, type ScratchProgram, type ScratchStep } from '../../scratch/program';

/**
 * Werdykt zadania praktycznego lekcji 27 — **ożywiony duszek** złożony z klocków
 * na stronie (`blocksToProgram`). Cała wiedza o tym zamówieniu mieszka tutaj,
 * tak samo jak w `judge.ts`, `z7.ts` i `z8.ts` w trzech poprzednich lekcjach
 * modułu; sędzia nie wie, czy program przyszedł z pliku, czy z warsztatu.
 *
 * **To jest werdykt z zawartości, nie z uruchomienia** — i tak ma być. Z-8 musiał
 * wykonać program dziecka, bo pytał o *czas* („czy znikają jednocześnie”).
 * Tutaj wszystkie pytania są o *strukturę*: czy jest pętla, czy w niej jest
 * czekanie, czy warunek leży w środku pętli, czy na zewnątrz.
 *
 * Trzy rzeczy, których ten werdykt pilnuje, a żadna lista kontrolna by nie
 * potrafiła:
 *
 * 1. **Warunek w środku pętli kontra warunek nad nią.** Wygląda niemal tak samo
 *    na ekranie i znaczy coś zupełnie innego. To jest pointa całego bloku 3 — i
 *    dlatego dotyczy też pytania o klawisz: „jeżeli klawisz naciśnięty” poza
 *    pętlą sprawdzi się raz, na starcie, gdy jeszcze nic nie naciskasz.
 * 2. **Dziesięć kopii tego samego klocka.** Skrypt może spełnić zamówienie i mieć
 *    obok ciąg jednakowych klocków pod rząd — mówimy o tym wprost, bo właśnie od
 *    tego zaczęła się ta lekcja.
 * 3. **Pusta pętla i pętla bez czekania.** Jedno i drugie „jest pętlą”, a
 *    animacji z nich nie ma.
 *
 * Warsztat ma kapelusz z zieloną flagą na sztywno i nie ma kapelusza klawisza,
 * więc na klawisz da się zareagować tylko czujnikiem w „jeżeli” — i tego pilnuje
 * kryterium `klawisz`.
 */

export const WALK_CRITERIA: ProofCriterion[] = [
  { id: 'petla', label: 'Jest pętla, a w jej środku co najmniej dwa klocki.' },
  { id: 'animacja', label: 'W pętli jest zmiana kostiumu i czekanie.' },
  { id: 'warunek', label: 'Jest klocek „jeżeli … to”.' },
  { id: 'warunek-w-petli', label: 'Ten warunek siedzi w środku pętli, a nie nad nią.' },
  { id: 'klawisz', label: 'Duszek reaguje na klawisz: pętla o niego pyta i przesuwa duszka.' },
];

const COSTUME = 'looks_nextcostume';
/** Jedyny klocek makiety, który sam w sobie czeka. */
const WAIT = 'control_wait';
/** Jedyny klocek makiety, który przesuwa duszka („wróć na start” go nie rusza — flaga i tak ustawia start). */
const WALK = 'motion_movesteps';

const LOOPS = new Set(['control_repeat', 'control_forever', 'control_repeat_until']);
const IFS = new Set(['control_if', 'control_if_else']);

export interface FoundLoop {
  step: ScratchStep;
  /** Ile klocków siedzi w paszczy, razem z ich własnym wnętrzem. */
  size: number;
  /** Ile klocków trzeba by ułożyć bez tej pętli; `Infinity` dla „zawsze”. */
  unrolled: number;
}

export interface WalkReport {
  loops: FoundLoop[];
  /** Pętla z animacją: zmiana kostiumu i czekanie w jednej paszczy. */
  animation: FoundLoop | null;
  /** Pętla, w której siedzi warunek — dowód na to, że jest sprawdzany wielokrotnie. */
  guarded: FoundLoop | null;
  /** Warunek leżący poza jakąkolwiek pętlą — sprawdzany raz i nigdy więcej. */
  lonely: ScratchStep | null;
  /** Pierwszy klocek „jeżeli … to” — do zacytowania warunku, który dziecko w nim ułożyło. */
  ifBlock: ScratchStep | null;
  /** „Jeżeli klawisz …” siedzące w pętli, w środku którego duszek się przesuwa — to jest reakcja na klawisz. */
  steering: ScratchStep | null;
  /** „Jeżeli klawisz …” siedzące w pętli, ale bez przesunięcia w środku. */
  keyIdle: ScratchStep | null;
  /** „Jeżeli klawisz …” leżące poza pętlą. */
  keyOutside: ScratchStep | null;
  /** Najdłuższy ciąg jednakowych klocków pod rząd. */
  copies: { label: string; times: number } | null;
  blocks: number;
}

/** Ile klocków liczy fragment skryptu razem z wnętrzem klocków obejmujących. */
function size(steps: ScratchStep[]): number {
  return steps.reduce((sum, step) => sum + 1 + (step.inner ? size(step.inner) : 0), 0);
}

/** Ile klocków trzeba by ułożyć, gdyby rozwinąć każdą pętlę w ciąg powtórzeń. */
function unrolled(steps: ScratchStep[]): number {
  let total = 0;
  for (const step of steps) {
    const inside = step.inner ? unrolled(step.inner) : 0;
    if (!Number.isFinite(inside)) return Number.POSITIVE_INFINITY;
    if (step.opcode === 'control_forever' || step.opcode === 'control_repeat_until')
      return Number.POSITIVE_INFINITY;
    if (step.opcode === 'control_repeat') {
      const times = Math.max(0, Math.round(Number(step.values.TIMES ?? 0)));
      total += times * inside;
      continue;
    }
    total += 1 + inside;
  }
  return total;
}

/** Wszystkie pętle skryptu, razem z tymi zagnieżdżonymi. */
function findLoops(steps: ScratchStep[]): FoundLoop[] {
  const found: FoundLoop[] = [];
  for (const step of steps) {
    if (step.inner) found.push(...findLoops(step.inner));
    if (!LOOPS.has(step.opcode)) continue;
    found.push({ step, size: size(step.inner ?? []), unrolled: unrolled([step]) });
  }
  return found;
}

/** Czy w paszczy (na dowolnej głębokości) leży klocek spełniający warunek. */
function has(steps: ScratchStep[], test: (step: ScratchStep) => boolean): boolean {
  return flatSteps(steps).some(test);
}

/** Najdłuższy ciąg jednakowych klocków pod rząd — ten sam opcode i te same pola. */
function longestRun(steps: ScratchStep[]): { label: string; times: number } | null {
  let best: { label: string; times: number } | null = null;
  let run = 1;
  for (let i = 1; i <= steps.length; i += 1) {
    const previous = steps[i - 1];
    const current = steps[i];
    const same =
      current &&
      current.opcode === previous.opcode &&
      JSON.stringify(current.values) === JSON.stringify(previous.values) &&
      !current.inner &&
      !previous.inner;
    if (same) {
      run += 1;
      continue;
    }
    if (run >= 4 && (!best || run > best.times)) best = { label: previous.label, times: run };
    run = 1;
  }
  return best;
}

/** Ciągi kopii szukamy też w paszczach — pętla z dziesięcioma kopiami w środku to ta sama wada. */
function copiesIn(steps: ScratchStep[]): { label: string; times: number } | null {
  let best = longestRun(steps);
  for (const step of steps) {
    if (!step.inner) continue;
    const inside = copiesIn(step.inner);
    if (inside && (!best || inside.times > best.times)) best = inside;
  }
  return best;
}

export function readWalk(program: ScratchProgram): WalkReport {
  const scripts = program.stacks.filter((stack) => stack.steps.length > 0);
  const loops = scripts.flatMap((stack) => findLoops(stack.steps));

  const animation =
    loops.find(
      (loop) =>
        has(loop.step.inner ?? [], (step) => step.opcode === COSTUME) &&
        has(loop.step.inner ?? [], (step) => step.opcode === WAIT)
    ) ?? null;

  const guarded =
    loops.find((loop) => has(loop.step.inner ?? [], (step) => IFS.has(step.opcode))) ?? null;

  /* Warunek poza pętlą: jest w skrypcie, a nie ma go w żadnej paszczy pętli. */
  const inLoops = new Set(loops.flatMap((loop) => flatSteps(loop.step.inner ?? [])));
  const everyStep = scripts.flatMap((stack) => flatSteps(stack.steps));
  const ifs = everyStep.filter((step) => IFS.has(step.opcode));
  const keyed = ifs.filter((step) => step.conditionOpcode === KEY_SENSOR);
  const keyInLoop = keyed.filter((step) => inLoops.has(step));

  return {
    loops,
    animation,
    guarded,
    lonely: ifs.find((step) => !inLoops.has(step)) ?? null,
    ifBlock: ifs[0] ?? null,
    steering: keyInLoop.find((step) => has(step.inner ?? [], (inner) => inner.opcode === WALK)) ?? null,
    keyIdle: keyInLoop[0] ?? null,
    keyOutside: keyed.find((step) => !inLoops.has(step)) ?? null,
    copies: scripts.map((stack) => copiesIn(stack.steps)).reduce<{ label: string; times: number } | null>(
      (most, current) => (current && (!most || current.times > most.times) ? current : most),
      null
    ),
    blocks: scripts.reduce((sum, stack) => sum + size(stack.steps), 0),
  };
}

/** Nazwa pętli po polsku — werdykt cytuje ją tak, jak stoi w skrypcie dziecka. */
function loopName(step: ScratchStep): string {
  if (step.opcode === 'control_forever') return '„zawsze”';
  if (step.opcode === 'control_repeat_until') return '„powtarzaj aż …”';
  const times = step.values.TIMES;
  return times ? `„powtórz ${times} razy”` : '„powtórz … razy”';
}

export function judgeWalk(report: WalkReport): ProofVerdicts {
  const { loops, animation, guarded, lonely, ifBlock, copies } = report;
  const filled = loops.filter((loop) => loop.size >= 2);

  const petla = filled[0] ?? null;
  const copiesNote = copies
    ? ` Przy okazji: w skrypcie leży ${count(copies.times, 'jednakowy klocek', 'jednakowe klocki', 'jednakowych klocków')} „${copies.label}” pod rząd — dokładnie to zwijaliśmy na początku lekcji.`
    : '';

  return {
    petla: petla
      ? {
          ok: true,
          note: `Jest pętla ${loopName(petla.step)}, a w jej paszczy ${count(petla.size, 'klocek', 'klocki', 'klocków')}.${copiesNote}`,
        }
      : {
          ok: false,
          note:
            loops.length > 0
              ? `Pętla jest, ale pusta albo z jednym klockiem w środku — a zamówienie prosi o taką, w której coś się dzieje.${copiesNote}`
              : `W skrypcie nie ma ani jednej pętli. Weź pomarańczowy klocek „powtórz … razy” albo „zawsze” i włóż go pod zieloną flagę.${copiesNote}`,
        },

    animacja: animation
      ? {
          ok: true,
          note: `W pętli ${loopName(animation.step)} jest i zmiana kostiumu, i czekanie. To jest cała animacja.`,
        }
      : {
          ok: false,
          note: loops.some((loop) => has(loop.step.inner ?? [], (step) => step.opcode === COSTUME))
            ? 'Zmiana kostiumu jest w pętli, ale nie ma przy niej czekania — kostiumy przelecą tak szybko, że zobaczysz migotanie zamiast ruchu. Dołóż „czekaj … s”.'
            : 'W żadnej pętli nie ma zmiany kostiumu. Animacja to „następny kostium” i „czekaj” w jednej pętli — dokładnie tak, jak skakała piłka w drugim bloku.',
        },

    warunek: ifBlock
      ? { ok: true, note: `Jest warunek: „${ifBlock.condition}”.` }
      : {
          ok: false,
          note: 'Nie ma klocka „jeżeli … to”. Zamówienie prosi o jeden warunek, żeby duszek sam decydował, kiedy coś zrobić.',
        },

    'warunek-w-petli': guarded
      ? {
          ok: true,
          note: `Warunek siedzi w pętli ${loopName(guarded.step)}, więc jest sprawdzany na każdym obiegu — a nie raz, na starcie.`,
        }
      : {
          ok: false,
          note: lonely
            ? 'Warunek leży poza pętlą. Sprawdzi się dokładnie raz, w chwili, w której program przez niego przejdzie, i nigdy więcej — a to prawie zawsze znaczy „za wcześnie”. Przenieś go do środka pętli.'
            : 'Najpierw potrzebny jest warunek, a potem miejsce dla niego w pętli.',
        },

    klawisz: report.steering
      ? {
          ok: true,
          note: `Pętla pyta o klawisz („${report.steering.condition}”) na każdym obiegu i przesuwa duszka — tak w grach powstaje sterowanie, które reaguje bez zacięcia.`,
        }
      : {
          ok: false,
          note: report.keyIdle
            ? 'Pętla pyta o klawisz, ale w środku „jeżeli” nic nie przesuwa duszka. Dołóż tam „przesuń o … kroków” — inaczej naciśnięcie strzałki niczego nie zmieni.'
            : report.keyOutside
              ? 'O klawisz pytasz poza pętlą. Ten warunek sprawdzi się raz, na starcie programu, kiedy jeszcze niczego nie naciskasz — i nigdy więcej. Przenieś go do pętli.'
              : ifBlock
                ? `Twój warunek pyta o „${ifBlock.condition}”, a nie o klawisz. Kliknij jego owalne pole, aż pojawi się „klawisz … naciśnięty?”.`
                : 'Nic w tym skrypcie nie reaguje na klawiaturę. Weź „jeżeli … to”, ustaw w nim „klawisz … naciśnięty?” i włóż go do pętli.',
        },
  };
}
