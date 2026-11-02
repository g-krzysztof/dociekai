import { BLOCKS, HOME, type Block, type RotationStyle } from './engine';
import type {
  ScratchProgram,
  ScratchSprite,
  ScratchStack,
  ScratchStep,
} from './program';

/**
 * Skrypt zbudowany **na stronie** (`Bench`, klocki z `engine.ts`) przełożony na
 * kształt z `program.ts`, który czytają werdykty (`judge.ts`, `z7.ts`,
 * `loops.ts`, `mission.ts`). Dzięki temu sędziowie nie wiedzą, skąd przyszedł
 * program — z pliku czy z warsztatu w lekcji — i pytają o to samo:
 * czy jest kapelusz, czy klocek stoi w pętli, czy warunek leży w jej środku.
 *
 * **Kierunek jest jeden: `Block` → `ScratchStep`** i nic nie ginie po drodze, bo
 * makieta jest ścisłym podzbiorem Scratcha (dwadzieścia jeden klocków, każdy ma
 * swój opcode).
 *
 * Dwie pułapki, które ten plik odwzorowuje:
 *
 * - **Wnętrze „jeżeli … w przeciwnym razie” to jedna lista**: obie paszcze
 *   sklejone w `ScratchStep.inner`. Sędziowie liczą klocki w środku,
 *   nie pytają, w której połowie stoją.
 * - **Kapelusz jest pierwszym krokiem stosu**, nie osobnym polem — `steps[0]` to
 *   „kiedy kliknięto zieloną flagę”, a `ScratchStack.hat` powtarza jego opcode.
 *   Stos bez kapelusza (`hat: null`) to klocki leżące luzem: dokładnie ta usterka,
 *   którą `judge.ts` nazywa „klocek leży osobno”.
 */

/** Jeden duszek razem z tym, co dziecko u niego ułożyło (każdy element `stacks` to osobny stos z `Bench`). */
export interface ActorScripts {
  sprite: ScratchSprite;
  stacks: Block[][];
}

/** Styl obrotu w pliku jest po angielsku; sędzia (`z7.ts`) czyta go stamtąd, więc oddajemy go w tej postaci. */
const STYLE_RAW: Record<RotationStyle, string> = {
  dowolny: 'all around',
  'lewo-prawo': 'left-right',
  'nie obracaj': "don't rotate",
};

/** Opcode czujnika dla warunków, które `Bench` pozwala wybrać — po nim sędziowie pytają o „czujnik”, nie o napis. */
const CONDITION_OPCODE: Record<string, string> = {
  'dotykasz krawędzi?': 'sensing_touchingobject',
  'klawisz w prawo naciśnięty?': 'sensing_keypressed',
  'klawisz w lewo naciśnięty?': 'sensing_keypressed',
  'dotykasz czarnej linii?': 'sensing_touchingcolor',
};

/** Napis klocka z podstawioną wartością pola — tak samo, jak dziecko widzi go w `Bench` i w Scratchu. */
function labelOf(block: Block, value: string | undefined): string {
  return BLOCKS[block.type].label.replace('{}', value ?? '');
}

function step(
  block: Block,
  opcode: string,
  values: Record<string, string> = {},
  extra: Partial<ScratchStep> = {}
): ScratchStep {
  const value = block.value == null ? undefined : String(block.value);
  return {
    opcode,
    label: labelOf(block, value),
    values,
    ...extra,
  };
}

function toStep(block: Block): ScratchStep {
  const value = block.value == null ? undefined : String(block.value);
  const number = Number(block.value ?? 0);

  switch (block.type) {
    case 'flaga':
      return step(block, 'event_whenflagclicked');
    case 'klawisz':
      return step(block, 'event_whenkeypressed', { KEY_OPTION: value ?? '' });
    case 'klik':
      return step(block, 'event_whenthisspriteclicked');
    case 'odbior':
      return step(block, 'event_whenbroadcastreceived', { BROADCAST_OPTION: value ?? '' });
    case 'nadaj':
      return step(block, 'event_broadcast', { BROADCAST_INPUT: value ?? '' });

    case 'idz':
      return step(block, 'motion_movesteps', { STEPS: String(number) });
    case 'wroc':
      return step(block, 'motion_gotoxy', { X: String(HOME.x), Y: String(HOME.y) });
    case 'kierunek':
      return step(block, 'motion_pointindirection', { DIRECTION: String(number) });
    case 'obroc':
      /* Ujemna wartość to skręt w lewo — w pliku jest na to osobny klocek, z kątem dodatnim. */
      return number < 0
        ? {
            ...step(block, 'motion_turnleft', { DEGREES: String(-number) }),
            label: `obróć w lewo o ${-number} stopni`,
          }
        : step(block, 'motion_turnright', { DEGREES: String(number) });
    case 'odbij':
      return step(block, 'motion_ifonedgebounce');
    case 'styl':
      return step(block, 'motion_setrotationstyle', {
        STYLE: STYLE_RAW[(block.value as RotationStyle) ?? 'dowolny'] ?? STYLE_RAW.dowolny,
      });

    case 'powiedz':
      return step(block, 'looks_say', {}, { text: value ?? '' });
    case 'pokaz':
      return step(block, 'looks_show');
    case 'ukryj':
      return step(block, 'looks_hide');
    case 'kostium':
      return step(block, 'looks_nextcostume');
    case 'dzwiek':
      return step(block, 'sound_play');

    case 'czekaj':
      return step(block, 'control_wait', { DURATION: String(number) });
    case 'powtorz':
      return withInner(step(block, 'control_repeat', { TIMES: String(number) }), block);
    case 'zawsze':
      return withInner(step(block, 'control_forever'), block);
    case 'jezeli':
    case 'jezeli_inaczej': {
      const condition = value ?? '';
      const opcode = block.type === 'jezeli' ? 'control_if' : 'control_if_else';
      return withInner(
        step(block, opcode, {}, {
          condition,
          conditionOpcode: CONDITION_OPCODE[condition],
          label:
            block.type === 'jezeli'
              ? `jeżeli ${condition} to`
              : `jeżeli ${condition} to … w przeciwnym razie`,
        }),
        block
      );
    }
  }
}

/** Wnętrze klocka obejmującego; gdy paszcza jest pusta, pola `inner` nie ma — tak jak w czytniku. */
function withInner(result: ScratchStep, block: Block): ScratchStep {
  const inner = [...(block.inner ?? []), ...(block.inner2 ?? [])].map(toStep);
  return inner.length > 0 ? { ...result, inner } : result;
}

/** Jeden stos z `Bench` — pusty stos nie jest skryptem i nie trafia do wyniku. */
export function blocksToStack(blocks: Block[], owner: string): ScratchStack | null {
  if (blocks.length === 0) return null;
  const steps = blocks.map(toStep);
  const first = blocks[0];
  return {
    owner,
    isStage: false,
    hat: BLOCKS[first.type].shape === 'kapelusz' ? steps[0].opcode : null,
    steps,
  };
}

/**
 * Cały program strony. `main` to pierwszy skrypt spod zielonej flagi — w pliku
 * czytnik wybierał najlepiej pasujący do zamówienia, ale na stronie dziecko ma
 * jeden warsztat, więc pierwszy wystarcza (sędzia, któremu to nie wystarczy,
 * i tak szuka po wszystkich `stacks`).
 */
export function blocksToProgram(actors: ActorScripts[]): ScratchProgram {
  const stacks = actors.flatMap(({ sprite, stacks: own }) =>
    own.flatMap((blocks) => blocksToStack(blocks, sprite.name) ?? [])
  );
  return {
    sprites: actors.map((actor) => actor.sprite),
    stacks,
    main: stacks.find((stack) => stack.hat === 'event_whenflagclicked') ?? null,
  };
}
