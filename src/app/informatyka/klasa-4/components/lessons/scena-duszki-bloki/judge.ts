import { count } from '../../../lib/plural';
import type { ProofCriterion, ProofVerdicts } from '../../task-shell';
import { flatSteps, type ScratchProgram } from '../../scratch/program';

/**
 * Werdykt zadania praktycznego tej lekcji: **„duszek, który wita widza i
 * odchodzi”**. Czyta program złożony na stronie (`blocksToProgram`) i pyta o
 * strukturę: czy jest kapelusz, czy po mowie idzie czekanie, a po czekaniu ruch.
 *
 * Dwie decyzje, które wynikają z tego, że warsztatem jest `Bench`, a nie
 * prawdziwy Scratch:
 *
 * - **Nie ma kryterium „klocek leży osobno”.** Na `Benchu` z jednym stosem nie da
 *   się położyć klocka obok skryptu — upuszczony w próżnię wraca na miejsce — więc
 *   takie kryterium nigdy by nie zawiodło. Jedyną wersją tej usterki, jaką dziecko
 *   może tu wyprodukować, jest stos bez kapelusza, i o nim mówi kryterium `flaga`.
 *   Osobne klocki dziecko oglądało i naprawiało w bloku 4.
 * - **Ruchem jest wyłącznie „przesuń o … kroków”.** „Wróć na start” duszka nie
 *   przesuwa (flaga i tak ustawia go na starcie), więc jako „odchodzi” by nie
 *   zadziałał — choć jego opcode (`motion_gotoxy`) należy do klocków ruchu.
 */

export const FIRST_SCRIPT_CRITERIA: ProofCriterion[] = [
  { id: 'flaga', label: 'Duszek ma skrypt, który zaczyna się od kapelusza z zieloną flagą.' },
  { id: 'mowa', label: 'W tym skrypcie duszek mówi coś od siebie.' },
  { id: 'czekanie', label: 'Po powiedzeniu jest czekanie — inaczej nie da się tego zobaczyć.' },
  { id: 'ruch', label: 'Na końcu duszek rusza się z miejsca.' },
];

const SAY = 'looks_say';
const WAIT = 'control_wait';
const WALK = 'motion_movesteps';
/** „Wróć na start” — opcode ustawiający miejsce, a nie przesuwający duszka. */
const RESET = 'motion_gotoxy';

export function judgeFirstScript(program: ScratchProgram): ProofVerdicts {
  const main = program.main;
  const steps = main ? flatSteps(main.steps) : [];

  let sayAt = -1;
  let waitAt = -1;
  let moveAt = -1;
  steps.forEach((step, index) => {
    if (sayAt < 0 && step.opcode === SAY) {
      sayAt = index;
      return;
    }
    if (sayAt >= 0 && waitAt < 0 && step.opcode === WAIT) waitAt = index;
    if (waitAt >= 0 && moveAt < 0 && step.opcode === WALK) moveAt = index;
  });

  const anyWait = steps.some((step) => step.opcode === WAIT);
  const anyWalk = steps.some((step) => step.opcode === WALK);
  const onlyReset = !anyWalk && steps.some((step) => step.opcode === RESET);
  const sayText = (sayAt >= 0 ? (steps[sayAt].text ?? '') : '').trim();

  return {
    flaga: {
      ok: main !== null,
      note: main
        ? `Skrypt zaczyna się od zielonej flagi i ma pod nią ${count(steps.length - 1, 'klocek', 'klocki', 'klocków')}.`
        : program.stacks.length === 0
          ? 'Na stole nie ma ani jednego klocka. Zacznij od kapelusza z zieloną flagą — leży w kategorii Zdarzenia.'
          : 'Klocki są, ale nad nimi nie ma kapelusza „kiedy kliknięto zieloną flagę”. Bez niego zielona flaga nie ma czego uruchomić — wygląda to jak program, a nim nie jest.',
    },
    mowa: {
      ok: sayAt >= 0 && sayText !== '',
      note:
        sayAt >= 0
          ? `Duszek mówi: „${sayText}”.`
          : 'Nie ma klocka „powiedz …”. Znajdziesz go w fioletowej kategorii Wygląd.',
    },
    czekanie: {
      ok: waitAt >= 0,
      note:
        waitAt >= 0
          ? `Czekanie: „${steps[waitAt].label}”.`
          : anyWait
            ? sayAt < 0
              ? 'Klocek „czekaj” jest, ale nie ma po czym czekać — najpierw duszek musi coś powiedzieć.'
              : 'Klocek „czekaj” jest, ale stoi przed mówieniem. Przeciągnij go pod klocek „powiedz …”.'
            : 'Nie ma klocka „czekaj … s” z pomarańczowej kategorii Kontrola. Bez niego duszek powie i ruszy w tym samym mgnieniu — nie zobaczysz ani jednego, ani drugiego.',
    },
    ruch: {
      ok: moveAt >= 0,
      note:
        moveAt >= 0
          ? `Ruch: „${steps[moveAt].label}”.`
          : anyWalk
            ? 'Klocek ruchu jest, ale przed czekaniem (albo czekania w ogóle nie ma). Zamówienie było: powiedz, odczekaj, dopiero potem odejdź.'
            : onlyReset
              ? 'Jest tylko „wróć na start”, a on niczego tu nie ruszy — duszek stoi już na starcie. Potrzebny jest klocek „przesuń o … kroków” z niebieskiej kategorii Ruch.'
              : 'Nie ma żadnego klocka „przesuń o … kroków” z niebieskiej kategorii Ruch.',
    },
  };
}
