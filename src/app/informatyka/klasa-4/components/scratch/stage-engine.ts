import {
  BLOCKS,
  EVENT_OF,
  applyBlock,
  type Block,
  type BlockType,
  type EventKind,
  type Sprite,
} from './engine';

/**
 * Scena **wielu duszków naraz** — silnik lekcji 26 („Zdarzenia i komunikaty”).
 *
 * `run()` z `engine.ts` wykonuje jeden stos jednego duszka i to wystarczało przez
 * dwie lekcje. Tej lekcji nie da się na tym zbudować, bo cała jej treść brzmi
 * **„po kolei czy jednocześnie”**, a jednoczesność wymaga co najmniej dwóch
 * duszków działających w tej samej chwili. Dlatego tutaj jest prawdziwy
 * **planista zdarzeń**: wątki z własnym zegarem, kolejka posortowana po czasie i
 * komunikaty, które budzą wszystkich odbiorców **w tej samej milisekundzie**.
 *
 * Trzy decyzje, na których stoi lekcja:
 *
 * 1. **Komunikat budzi odbiorców w chwili nadania, nie „zaraz potem”.** Gdyby
 *    dokładać im choćby milisekundę opóźnienia, „jednocześnie” przestałoby
 *    istnieć — a właśnie na tym polega różnica, której lekcja uczy i której
 *    werdykt Z-8 szuka w pliku dziecka.
 * 2. **Czas jest liczbą, nie numerem klatki.** `run()` dzielił program na klatki
 *    między czekaniami i to wystarcza dla jednego duszka; przy trzech każdy ma
 *    własne czekania, więc klatki muszą powstać z **osi czasu**, wspólnej dla
 *    wszystkich. Stąd `StageFrame.t` w milisekundach i `hold` liczony z odstępu
 *    do następnej klatki.
 * 3. **Instrukcje bez czekania wykonują się natychmiast** — tak samo jak w
 *    `run()` i tak samo jak w prawdziwym Scratchu. Trzy klocki `pokaż` pod rząd
 *    w trzech duszkach dają jedną klatkę, nie trzy.
 *
 * Werdykty czytają `log` — **co się stało, komu i w której milisekundzie**. Na
 * tym stoi cały odbiór Z-8: „wszystkie litery znikają w tej samej chwili” to
 * zdanie o czasach w logu, nie o klockach w skrypcie.
 */

export interface ActorDef {
  id: string;
  /** Nazwa widoczna dla dziecka — trafia do podpisów skryptów i do werdyktów. */
  name: string;
  /** Stan duszka przed uruchomieniem: gdzie stoi i czy jest widoczny. */
  home: Sprite;
  /** Skrypty duszka; każdy zaczyna się kapeluszem, inaczej nic go nie uruchomi. */
  scripts: Block[][];
}

export type Trigger =
  | { kind: 'flaga' }
  | { kind: 'klawisz'; key: string }
  | { kind: 'klik'; actorId: string }
  | { kind: 'komunikat'; message: string };

export interface StageStep {
  /** Milisekunda, w której to się stało — liczona od uruchomienia. */
  t: number;
  actorId: string;
  type: BlockType;
  kind: EventKind;
  value?: string | number;
}

export interface StageFrame {
  t: number;
  /** Ile milisekund ten stan stoi na scenie, zanim ruszy dalszy ciąg. */
  hold: number;
  sprites: Record<string, Sprite>;
  sound: boolean;
}

export interface StageRun {
  /** Czy wyzwalacz w ogóle coś obudził — `false`, gdy żaden duszek go nie słucha. */
  started: boolean;
  frames: StageFrame[];
  log: StageStep[];
  duration: number;
  /** Duszki, których skrypt się uruchomił (wprost albo przez komunikat). */
  woken: string[];
}

/** Ostatnia klatka musi się utrzymać, inaczej koniec programu mignąłby. */
const TAIL_HOLD = 900;
/** Zabezpieczenia przed skryptem, który sam sobie nadaje komunikat w kółko. */
const MAX_STEPS = 600;
const MAX_TIME = 25000;

interface Thread {
  actor: ActorDef;
  stack: Block[];
  pc: number;
  at: number;
  /** Kolejność zbudzenia — rozstrzyga remisy w tej samej milisekundzie. */
  seq: number;
}

/** Czy ten kapelusz odpowiada na ten wyzwalacz. */
function answers(hat: Block, actor: ActorDef, trigger: Trigger): boolean {
  switch (trigger.kind) {
    case 'flaga':
      return hat.type === 'flaga';
    case 'klawisz':
      return hat.type === 'klawisz' && String(hat.value ?? '') === trigger.key;
    case 'klik':
      return hat.type === 'klik' && actor.id === trigger.actorId;
    case 'komunikat':
      return hat.type === 'odbior' && String(hat.value ?? '') === trigger.message;
  }
}

export function runStage(actors: ActorDef[], trigger: Trigger): StageRun {
  const state = new Map<string, Sprite>(actors.map((actor) => [actor.id, { ...actor.home }]));
  const log: StageStep[] = [];
  const frames: StageFrame[] = [];
  const woken = new Set<string>();
  const queue: Thread[] = [];
  let seq = 0;
  let steps = 0;

  const wake = (t: number, match: (hat: Block, actor: ActorDef) => boolean) => {
    for (const actor of actors)
      for (const stack of actor.scripts) {
        const hat = stack[0];
        if (!hat || BLOCKS[hat.type].shape !== 'kapelusz' || !match(hat, actor)) continue;
        seq += 1;
        queue.push({ actor, stack, pc: 1, at: t, seq });
        woken.add(actor.id);
      }
  };

  /**
   * Migawka sceny. Kilka zmian w tej samej milisekundzie to **jedna** klatka —
   * inaczej „trzy litery znikają naraz” rozpadłoby się na trzy klatki i wyglądało
   * jak znikanie po kolei.
   */
  const snap = (t: number, sound: boolean) => {
    const sprites: Record<string, Sprite> = {};
    state.forEach((sprite, id) => {
      sprites[id] = { ...sprite };
    });
    const last = frames[frames.length - 1];
    if (last && last.t === t) frames[frames.length - 1] = { ...last, sprites, sound: last.sound || sound };
    else frames.push({ t, hold: 0, sprites, sound });
  };

  snap(0, false);
  wake(0, (hat, actor) => answers(hat, actor, trigger));
  const started = queue.length > 0;

  while (queue.length > 0 && steps < MAX_STEPS) {
    queue.sort((a, b) => a.at - b.at || a.seq - b.seq);
    const thread = queue.shift();
    if (!thread || thread.at > MAX_TIME) break;
    const sprite = state.get(thread.actor.id);
    if (!sprite) continue;

    while (thread.pc < thread.stack.length) {
      steps += 1;
      if (steps > MAX_STEPS) break;
      const block = thread.stack[thread.pc];
      thread.pc += 1;
      /* Kapelusz w środku stosu jest nieosiągalny — w Scratchu też się go tam nie wstawi. */
      if (BLOCKS[block.type].shape === 'kapelusz') continue;

      if (block.type === 'czekaj') {
        thread.at += Number(block.value ?? 1) * 1000;
        log.push({ t: thread.at, actorId: thread.actor.id, type: 'czekaj', kind: 'czekanie' });
        queue.push(thread);
        break;
      }

      if (block.type === 'nadaj') {
        const message = String(block.value ?? '');
        log.push({ t: thread.at, actorId: thread.actor.id, type: 'nadaj', kind: 'komunikat', value: message });
        wake(thread.at, (hat) => hat.type === 'odbior' && String(hat.value ?? '') === message);
        continue;
      }

      const sound = applyBlock(block, sprite);
      const kind = EVENT_OF[block.type];
      if (kind)
        log.push({ t: thread.at, actorId: thread.actor.id, type: block.type, kind, value: block.value });
      snap(thread.at, sound);
    }
  }

  frames.forEach((frame, index) => {
    frame.hold = index + 1 < frames.length ? frames[index + 1].t - frame.t : TAIL_HOLD;
  });

  return {
    started,
    frames,
    log,
    duration: frames.length > 0 ? frames[frames.length - 1].t + TAIL_HOLD : TAIL_HOLD,
    woken: [...woken],
  };
}

/* ------------------------------------------------------------------ */
/* Odczyty, z których powstają werdykty                                */
/* ------------------------------------------------------------------ */

/** Dwa zdarzenia uznajemy za jednoczesne, gdy dzieli je mniej niż tyle. */
export const SAME_MOMENT = 50;

/**
 * Chwila, w której duszek **pojawił się na scenie**; `null`, gdy nigdy go nie
 * było widać.
 *
 * Nie wystarczy znaleźć pierwszego klocka `pokaż`: typowy skrypt Scratcha
 * zaczyna się od `ukryj` wykonanego w zerowej milisekundzie, więc duszek jest
 * „widoczny na starcie” tylko z nazwy. Dlatego przechodzimy log i śledzimy
 * **przejścia** niewidoczny → widoczny.
 */
export function shownAt(run: StageRun, actorId: string, home: Sprite): number | null {
  let visible = home.visible;
  let appeared: number | null = visible ? 0 : null;
  for (const step of run.log) {
    if (step.actorId !== actorId) continue;
    if (step.kind === 'ukrycie') {
      /* Ukryty w zerowej milisekundzie, zanim ktokolwiek zdążył go zobaczyć — „widoczny na starcie” było tylko z nazwy. */
      if (visible && step.t === 0 && appeared === 0) appeared = null;
      visible = false;
      continue;
    }
    if (step.kind !== 'pokazanie') continue;
    if (!visible) appeared = step.t;
    visible = true;
  }
  return appeared;
}

/**
 * Chwila, w której duszek **zniknął ze sceny**; `null`, gdy na niej został.
 *
 * Nie wystarczy wziąć ostatniego klocka `ukryj`: typowy skrypt Scratcha zaczyna
 * się od `ukryj` wykonanego w zerowej milisekundzie i to nie jest zniknięcie —
 * duszek zaraz potem się pokazuje. Rozstrzyga to jedna reguła: **`pokaż`
 * unieważnia poprzednie zniknięcie**. Zostaje więc ostatnie przejście na
 * niewidoczne, którego nikt już nie odwrócił — czyli dokładnie to, co dziecko
 * widzi jako „litera zeszła ze sceny”.
 */
export function hiddenAt(run: StageRun, actorId: string, home?: Sprite): number | null {
  let visible = home?.visible ?? false;
  let vanished: number | null = null;
  for (const step of run.log) {
    if (step.actorId !== actorId) continue;
    if (step.kind === 'pokazanie') {
      visible = true;
      vanished = null;
      continue;
    }
    if (step.kind !== 'ukrycie') continue;
    if (visible) vanished = step.t;
    visible = false;
  }
  return vanished;
}

/** Czy podane chwile mieszczą się w jednym mgnieniu — czyli czy stało się to naraz. */
export function together(times: (number | null)[]): boolean {
  const known = times.filter((time): time is number => time != null);
  if (known.length !== times.length || known.length === 0) return false;
  return Math.max(...known) - Math.min(...known) < SAME_MOMENT;
}

/** Czy chwile są parami różne — czyli czy działo się to po kolei. */
export function oneByOne(times: (number | null)[]): boolean {
  const known = times.filter((time): time is number => time != null);
  if (known.length !== times.length || known.length < 2) return false;
  const sorted = [...known].sort((a, b) => a - b);
  return sorted.every((time, index) => index === 0 || time - sorted[index - 1] >= SAME_MOMENT);
}
