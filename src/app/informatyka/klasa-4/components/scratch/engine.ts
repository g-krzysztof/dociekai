/**
 * Silnik mini-Scratcha — wspólny dla widżetów całego modułu 6.
 *
 * Trzy decyzje, na których stoi moduł:
 *
 * 1. **Klocek bez kapelusza nie rusza od flagi.** `run()` oddaje
 *    `started: false`, gdy stos nie zaczyna się blokiem `flaga` — i to jest cała
 *    usterka A w `FixRun`. Kształt klocka nie jest ozdobą: kapelusz ma zaokrąglony
 *    wierzch, więc nic nad niego nie wejdzie, a stos bez niego nikt nie uruchamia.
 *
 * 2. **Instrukcje bez czekania wykonują się w jednej klatce**, dokładnie tak jak
 *    w prawdziwym Scratchu. Dlatego trzy `powiedz` pod rząd zostawiają na ekranie
 *    wyłącznie ostatnie zdanie, a trzy `przesuń o 50 kroków` wyglądają jak jeden skok o
 *    150 — i dopiero `czekaj` robi z programu coś, co da się obejrzeć. Gdyby każdy
 *    klocek dostał sztuczne opóźnienie, usterka C z `FixRun` przestałaby istnieć,
 *    a `czekaj` byłoby ozdobnikiem.
 *
 * 3. **Kroki idą tam, gdzie patrzy nos duszka** (dołożone w lekcji 25). `idz`
 *    przesuwa wzdłuż `direction`, a nie wzdłuż osi x — bo bez tego nie istnieje
 *    ani pojęcie kierunku, ani cała lekcja o stylu obrotu. Kierunek 90 to prawo,
 *    0 to góra, -90 to lewo: dokładnie jak w Scratchu, razem z tym, że w lewo jest
 *    **-90, a nie 270**.
 *
 * Klatka (`Frame`) to odcinek programu między czekaniami: stan duszka po jego
 * wykonaniu plus czas, przez który ten stan stoi na scenie. Werdykty zamówień
 * czytają `log` i podsumowania przebiegu (co się stało i w jakiej kolejności),
 * nigdy listy klocków — liczy się to, co duszek zrobił, a nie z czego dziecko to
 * złożyło.
 */

/** Kategorie palety — nazwy i kolory z prawdziwego Scratcha, żeby przesiadka nic nie kosztowała. */
export const CATEGORIES = {
  ruch: { label: 'Ruch', color: '#4c97ff' },
  wyglad: { label: 'Wygląd', color: '#9966ff' },
  dzwiek: { label: 'Dźwięk', color: '#cf63cf' },
  zdarzenia: { label: 'Zdarzenia', color: '#ffbf00' },
  kontrola: { label: 'Kontrola', color: '#ffab19' },
} as const;

export type Category = keyof typeof CATEGORIES;

export const CATEGORY_ORDER: Category[] = ['ruch', 'wyglad', 'dzwiek', 'zdarzenia', 'kontrola'];

/**
 * Trzy style obrotu z palety Scratcha, po polsku. To jest **cała treść lekcji
 * 25**: ten sam skrypt wygląda przy nich zupełnie inaczej, choć duszek robi
 * dokładnie to samo.
 */
export type RotationStyle = 'dowolny' | 'lewo-prawo' | 'nie obracaj';

export const ROTATION_STYLES: RotationStyle[] = ['dowolny', 'lewo-prawo', 'nie obracaj'];

/**
 * Nazwy komunikatów w makiecie. W prawdziwym Scratchu dziecko wpisuje własne, u
 * nas przeklikuje się je w owalnym polu — inaczej w makiecie trzeba by dołożyć
 * okno „Nowy komunikat”, a lekcja jest o tym, **kto go usłyszy**, nie o tym, jak
 * się go nazywa.
 */
export const MESSAGES: string[] = ['start', 'znikaj', 'dalej'];

/**
 * Warunki, które wchodzą w sześciokątne pole klocka „jeżeli … to”. W prawdziwym
 * Scratchu wkłada się tam osobny klocek z kategorii Czujniki; u nas przeklikuje
 * się je w polu — tak samo jak komunikaty i z tego samego powodu: lekcja jest o
 * tym, **jak często warunek jest sprawdzany**, nie o tym, z czego się go składa.
 *
 * `run()` sam rozstrzyga wyłącznie pierwszy z nich. Przebieg liczony z góry nie
 * ma palców, więc o klawiszach nic nie wie i **domyślnie traktuje je jako
 * fałsz** — sterowanie na żywo ma własny silnik w lekcji 27 (`key-drive.tsx`).
 * Wywołujący może jednak jawnie powiedzieć, że przez cały przebieg trzyma
 * strzałkę (`HeldKeys`) — to założenie podane z zewnątrz, a nie zgadywanie.
 */
export const CONDITIONS: string[] = [
  'dotykasz krawędzi?',
  'klawisz w prawo naciśnięty?',
  'klawisz w lewo naciśnięty?',
  'dotykasz czarnej linii?',
];

export type BlockType =
  | 'flaga'
  | 'klawisz'
  | 'klik'
  | 'odbior'
  | 'nadaj'
  | 'idz'
  | 'wroc'
  | 'kierunek'
  | 'obroc'
  | 'odbij'
  | 'styl'
  | 'powiedz'
  | 'pokaz'
  | 'ukryj'
  | 'kostium'
  | 'dzwiek'
  | 'czekaj'
  | 'powtorz'
  | 'zawsze'
  | 'jezeli'
  | 'jezeli_inaczej';

export interface BlockDef {
  type: BlockType;
  category: Category;
  /**
   * `kapelusz` może stać wyłącznie na wierzchu stosu — nic nad niego nie wchodzi.
   * `obejmujacy` ma paszczę: trzyma własny stos klocków w `Block.inner`.
   */
  shape: 'kapelusz' | 'klocek' | 'obejmujacy';
  /** `{}` to miejsce na owalne pole z wartością. */
  label: string;
  /** Wartości, przez które cyklicznie przechodzi kliknięcie w owalne pole. */
  values?: (string | number)[];
}

export const BLOCKS: Record<BlockType, BlockDef> = {
  flaga: {
    type: 'flaga',
    category: 'zdarzenia',
    shape: 'kapelusz',
    label: 'kiedy kliknięto zieloną flagę',
  },
  klawisz: {
    type: 'klawisz',
    category: 'zdarzenia',
    shape: 'kapelusz',
    label: 'kiedy klawisz {} naciśnięty',
    values: ['spacja', 'strzałka w prawo', 'strzałka w lewo', 'a'],
  },
  klik: {
    type: 'klik',
    category: 'zdarzenia',
    shape: 'kapelusz',
    label: 'kiedy ten duszek kliknięty',
  },
  odbior: {
    type: 'odbior',
    category: 'zdarzenia',
    shape: 'kapelusz',
    label: 'kiedy otrzymam {}',
    values: MESSAGES,
  },
  nadaj: {
    type: 'nadaj',
    category: 'zdarzenia',
    shape: 'klocek',
    label: 'nadaj komunikat {}',
    values: MESSAGES,
  },
  idz: { type: 'idz', category: 'ruch', shape: 'klocek', label: 'przesuń o {} kroków', values: [10, 50, 100] },
  wroc: { type: 'wroc', category: 'ruch', shape: 'klocek', label: 'wróć na start' },
  kierunek: {
    type: 'kierunek',
    category: 'ruch',
    shape: 'klocek',
    label: 'ustaw kierunek na {}',
    values: [90, -90, 0, 180],
  },
  obroc: {
    type: 'obroc',
    category: 'ruch',
    shape: 'klocek',
    label: 'obróć w prawo o {} stopni',
    values: [15, 45, 90, 180],
  },
  odbij: {
    type: 'odbij',
    category: 'ruch',
    shape: 'klocek',
    label: 'jeżeli na brzegu, odbij się',
  },
  styl: {
    type: 'styl',
    category: 'ruch',
    shape: 'klocek',
    label: 'ustaw styl obrotu {}',
    values: ROTATION_STYLES,
  },
  powiedz: {
    type: 'powiedz',
    category: 'wyglad',
    shape: 'klocek',
    label: 'powiedz {}',
    values: ['Cześć!', 'Jestem tu!', 'Uwaga!', 'Pa!'],
  },
  pokaz: { type: 'pokaz', category: 'wyglad', shape: 'klocek', label: 'pokaż' },
  ukryj: { type: 'ukryj', category: 'wyglad', shape: 'klocek', label: 'ukryj' },
  kostium: { type: 'kostium', category: 'wyglad', shape: 'klocek', label: 'następny kostium' },
  dzwiek: { type: 'dzwiek', category: 'dzwiek', shape: 'klocek', label: 'zagraj dźwięk' },
  czekaj: { type: 'czekaj', category: 'kontrola', shape: 'klocek', label: 'czekaj {} s', values: [0.5, 1, 2] },
  powtorz: {
    type: 'powtorz',
    category: 'kontrola',
    shape: 'obejmujacy',
    label: 'powtórz {} razy',
    values: [2, 4, 10],
  },
  /**
   * `zawsze` nie ma w Scratchu wypustki u dołu i to nie jest ozdoba: pod pętlą,
   * która się nie kończy, nic nie ma prawa się wykonać. Rysunek klocka mówi to
   * samo, co silnik.
   */
  zawsze: { type: 'zawsze', category: 'kontrola', shape: 'obejmujacy', label: 'zawsze' },
  jezeli: {
    type: 'jezeli',
    category: 'kontrola',
    shape: 'obejmujacy',
    label: 'jeżeli {} to',
    values: CONDITIONS,
  },
  /**
   * Jedyny klocek kursu z **dwiema paszczami**. Dołożony w lekcji 28, bo robot
   * podążający za linią jest w Scratchu kanonicznie zapisany jako „jeżeli widzi
   * linię — jedź, w przeciwnym razie — skręć”, a rozbicie tego na dwa osobne
   * „jeżeli” wymagałoby zaprzeczenia warunku, którego czwartoklasista jeszcze
   * nie zna.
   */
  jezeli_inaczej: {
    type: 'jezeli_inaczej',
    category: 'kontrola',
    shape: 'obejmujacy',
    label: 'jeżeli {} to',
    values: CONDITIONS,
  },
};

export interface Block {
  id: string;
  type: BlockType;
  /** Wartość owalnego pola; bez niej bierzemy pierwszą z `values`. */
  value?: string | number;
  /** Wnętrze klocka obejmującego — stos, który siedzi w jego paszczy. */
  inner?: Block[];
  /** Druga paszcza — wyłącznie „w przeciwnym razie”. */
  inner2?: Block[];
}

let seq = 0;

/** Nowy egzemplarz klocka. Każdy ma własne `id`, bo ten sam typ może leżeć w stosie kilka razy. */
export function make(
  type: BlockType,
  value?: string | number,
  inner?: Block[],
  inner2?: Block[]
): Block {
  seq += 1;
  const def = BLOCKS[type];
  const block: Block = { id: `b${seq}`, type, value: value ?? def.values?.[0] };
  if (def.shape === 'obejmujacy') block.inner = inner ?? [];
  if (type === 'jezeli_inaczej') block.inner2 = inner2 ?? [];
  return block;
}

/** Czy klocek ma paszczę. Używane wszędzie tam, gdzie liczy się kształt, nie typ. */
export function isWrapper(type: BlockType): boolean {
  return BLOCKS[type].shape === 'obejmujacy';
}

/** Ile klocków liczy skrypt razem z wnętrzem pętli — bez samych klocków obejmujących. */
export function countInside(blocks: Block[]): number {
  return blocks.reduce(
    (sum, block) =>
      sum + 1 + (block.inner ? countInside(block.inner) : 0) + (block.inner2 ? countInside(block.inner2) : 0),
    0
  );
}

/**
 * Następna wartość owalnego pola — kliknięcie przechodzi po kole. `values` to
 * własny zestaw widżetu (np. czujniki, które w tej scenie mają sens); bez niego
 * bierzemy zestaw klocka z palety.
 */
export function nextValue(block: Block, values = BLOCKS[block.type].values): string | number | undefined {
  if (!values) return undefined;
  const at = values.findIndex((v) => v === block.value);
  return values[(at + 1) % values.length];
}

/** Scena Scratcha ma 480 × 360 jednostek, a środek w (0, 0). */
export const STAGE = { width: 480, height: 360 } as const;

/** Duszek nie wychodzi poza scenę — Scratch też go przy krawędzi zatrzymuje. */
const EDGE_X = 205;
const EDGE_Y = 145;

export interface Sprite {
  x: number;
  y: number;
  /** Kierunek w stopniach: 90 w prawo, 0 w górę, -90 w lewo, 180 w dół. */
  direction: number;
  rotationStyle: RotationStyle;
  visible: boolean;
  say: string | null;
  /**
   * Który kostium jest na wierzchu. Liczy **przełączenia**, nie indeks w liście —
   * silnik nie wie, ile kostiumów ma duszek, a widok bierze resztę z dzielenia
   * przez liczbę swoich klatek. Dzięki temu „następny kostium” znaczy to samo przy
   * dwóch kostiumach i przy ośmiu.
   */
  costume?: number;
}

export const HOME: Sprite = {
  x: -150,
  y: 0,
  direction: 90,
  rotationStyle: 'dowolny',
  visible: true,
  say: null,
};

/**
 * Kierunek sprowadzony do przedziału (-180, 180] — dokładnie tak pokazuje go
 * Scratch. Stąd bierze się zaskoczenie, że „w lewo” to **-90**, choć dziecko po
 * czterech obrotach o 90 stopni spodziewa się 270.
 */
export function normalizeDirection(degrees: number): number {
  const wrapped = ((degrees % 360) + 360) % 360;
  return wrapped > 180 ? wrapped - 360 : wrapped;
}

/**
 * Czy duszek narysowany jest **głową w dół**. Prawda tylko przy stylu `dowolny` i
 * kierunku w lewą połowę tarczy — czyli dokładnie w sytuacji, o której jest cała
 * lekcja 25. Widżety rysują z tego obrót, a werdykty zdanie do dziecka.
 */
export function isUpsideDown(sprite: Sprite): boolean {
  return sprite.rotationStyle === 'dowolny' && normalizeDirection(sprite.direction) < 0;
}

export type EventKind =
  | 'ruch'
  | 'komunikat'
  | 'powrot'
  | 'obrot'
  | 'styl'
  | 'odbicie'
  | 'mowa'
  | 'pokazanie'
  | 'ukrycie'
  | 'kostium'
  | 'dzwiek'
  | 'czekanie';

export const EVENT_OF: Record<BlockType, EventKind | null> = {
  flaga: null,
  klawisz: null,
  klik: null,
  odbior: null,
  nadaj: 'komunikat',
  idz: 'ruch',
  wroc: 'powrot',
  kierunek: 'obrot',
  obroc: 'obrot',
  odbij: 'odbicie',
  styl: 'styl',
  powiedz: 'mowa',
  pokaz: 'pokazanie',
  ukryj: 'ukrycie',
  kostium: 'kostium',
  dzwiek: 'dzwiek',
  czekaj: 'czekanie',
  /* Klocki obejmujące same niczego nie robią — w logu widać ich wnętrze, obieg po obiegu. */
  powtorz: null,
  zawsze: null,
  jezeli: null,
  jezeli_inaczej: null,
};

/** Jeden wykonany klocek — z tego składają się werdykty zamówień. */
export interface Step {
  at: number;
  type: BlockType;
  kind: EventKind;
  value?: string | number;
  /** Przesunięcie w poziomie, jakie ten klocek naprawdę wywołał (dodatnie = w prawo). */
  dx?: number;
  /** Przesunięcie w pionie — po nim poznajemy ruch, który nie jest poziomy. */
  dy?: number;
  /** Stan duszka po wykonaniu klocka: stąd werdykt wie, czy szedł na głowie. */
  direction: number;
  rotationStyle: RotationStyle;
}

/** Odcinek programu między czekaniami: stan duszka i czas, przez który stoi na scenie. */
export interface Frame {
  /** Zakres instrukcji wykonanych w tej klatce (indeksy w stosie). */
  from: number;
  to: number;
  sprite: Sprite;
  /** Ile milisekund trzyma się ten stan, zanim ruszy dalszy ciąg. */
  hold: number;
  /** Czy w tej klatce padł dźwięk. */
  sound: boolean;
}

export interface Run {
  /** Czy flaga w ogóle cokolwiek uruchomiła — `false`, gdy stos nie ma kapelusza. */
  started: boolean;
  frames: Frame[];
  log: Step[];
  /** Łączny czas programu w milisekundach — zero dla programu bez czekania. */
  duration: number;
  /**
   * Najdalszy punkt, do jakiego duszek doszedł w trakcie — także wtedy, gdy nie
   * było tego widać, bo wrócił w tej samej klatce. Bez tego nie da się odróżnić
   * „nie doszedł do krawędzi" od „doszedł, ale program przeleciał przez to naraz".
   */
  peakX: number;
  minX: number;
  /** Czy duszek choć raz przesunął się w prawo / w lewo — Z-7 wymaga obu stron. */
  wentRight: boolean;
  wentLeft: boolean;
  /**
   * Czy duszek **szedł** głową w dół — albo tak skończył program. Liczone przy
   * instrukcjach, które naprawdę go przesunęły, i raz na końcu.
   *
   * Nie wystarczy sprawdzić ostatniej klatki: styl obrotu dołożony na sam dół
   * skryptu prostuje duszka po fakcie, a spacer i tak odbył się na głowie. Nie
   * wolno też liczyć tego po każdym klocku — między `ustaw kierunek na -90` a
   * `ustaw styl obrotu` duszek jest „na głowie” przez zero milisekund i nikt tego
   * nie widzi, więc uznanie tego za usterkę byłoby czepianiem się.
   */
  upsideDown: boolean;
  /**
   * Ile razy klocek „jeżeli na brzegu, odbij się” NAPRAWDĘ zawrócił duszka.
   * Sam klocek wykonuje się także wtedy, gdy duszek stoi na środku sceny i wtedy
   * nie robi nic — a cała lekcja 27 mieści się w różnicy między „wykonał się” a
   * „zadziałał”.
   */
  bounces: number;
  /** Czy program dobiegł końca, czy zatrzymał go sufit czasu (pętla `zawsze`). */
  endless: boolean;
}

/**
 * Strzałki, które **w całym przebiegu są trzymane** — założenie podane przez
 * wywołującego (u nas: przełącznik pod sceną w zadaniu lekcji 27). Przebieg
 * liczony z góry nie ma palców, więc nie zna klawiatury sam z siebie; bez
 * tego argumentu oba warunki z klawiszem są fałszem.
 */
export interface HeldKeys {
  prawo?: boolean;
  lewo?: boolean;
}

/** Punkt na scenie w jednostkach Scratcha — środek duszka albo mety. */
export interface StagePoint {
  x: number;
  y: number;
}

/**
 * Wszystko, co przebieg liczony z góry wie o świecie **tylko dlatego, że mu to
 * podano**: trzymane strzałki (`HeldKeys`) i miejsce mety. Duszek-meta nie ma
 * skryptów i nie ma ruchu — jest częścią sceny, więc nie potrzebuje własnego
 * wątku, a czujnik „dotykasz mety?” pyta wyłącznie o odległość od tego punktu.
 * Bez `meta` ten czujnik jest fałszem, tak samo jak klawisze bez `HeldKeys`.
 */
export interface Senses extends HeldKeys {
  meta?: StagePoint;
}

/** Napis czujnika mety. Nie ma go w `CONDITIONS`: pole „jeżeli” dostaje go tylko tam, gdzie na scenie jest meta. */
export const META_CONDITION = 'dotykasz mety?';

/**
 * Jak blisko muszą być środki dwóch duszków, żeby się „dotykały”. Figurka na
 * scenie ma ~68 jednostek szerokości, więc 50 to wyraźne zetknięcie, nie
 * muśnięcie; a zarazem połowa tego, co robot przesuwa jednym klockiem „przesuń o
 * 100”, więc żaden krok z palety nie przeskoczy mety bez zetknięcia.
 */
export const TOUCH_RADIUS = 50;

export function touches(sprite: Pick<Sprite, 'x' | 'y'>, target: StagePoint): boolean {
  return Math.hypot(sprite.x - target.x, sprite.y - target.y) <= TOUCH_RADIUS;
}

/** Ostatnia klatka musi się przez chwilę utrzymać, inaczej koniec programu mignąłby. */
const TAIL_HOLD = 700;

/**
 * Trzy sufity wykonania. Pętla `zawsze` nigdy nie wraca sama, a przebieg liczymy
 * z góry — więc ktoś musi powiedzieć „dość”. `MAX_DURATION` decyduje o tym, ile
 * scena naprawdę pokaże, `MAX_BLOCK_RUNS` ratuje przed pętlą bez czekania w
 * środku, a `LOOP_FRAME` to **oddanie ekranu na koniec każdego obiegu** — Scratch
 * robi dokładnie to samo i bez tego `zawsze [przesuń o 10 kroków]` przeleciałoby
 * przez całą scenę w jednym mgnieniu.
 */
const MAX_DURATION = 12000;
const MAX_BLOCK_RUNS = 6000;
const LOOP_FRAME = 40;

function clamp(value: number, limit: number): number {
  return Math.max(-limit, Math.min(limit, value));
}

/** Czy duszek dotyka krawędzi sceny — jedyny warunek, który przebieg liczony z góry umie rozstrzygnąć. */
export function atEdge(sprite: Sprite): boolean {
  return Math.abs(sprite.x) >= EDGE_X - 1 || Math.abs(sprite.y) >= EDGE_Y - 1;
}

/**
 * Wykonanie **jednego klocka** na duszku. Wydzielone z `run()`, bo od lekcji 26
 * ten sam zestaw instrukcji wykonuje też scena wielu duszków
 * (`stage-engine.ts`) — a dwie kopie tego `switch`a rozjechałyby się przy
 * pierwszym nowym klocku.
 *
 * Zwraca `true`, gdy klocek zagrał dźwięk. Klocki sterujące przebiegiem
 * (`czekaj`, `nadaj komunikat`) **nie należą tutaj** — o czasie i o tym, kto
 * jeszcze się obudzi, decyduje wywołujący.
 */
export function applyBlock(block: Block, sprite: Sprite): boolean {
  switch (block.type) {
    case 'idz': {
      /* Kroki idą tam, gdzie patrzy nos — to jest cała rola kierunku. */
      const steps = Number(block.value ?? 0);
      const radians = (normalizeDirection(sprite.direction) * Math.PI) / 180;
      sprite.x = clamp(sprite.x + steps * Math.sin(radians), EDGE_X);
      sprite.y = clamp(sprite.y + steps * Math.cos(radians), EDGE_Y);
      return false;
    }
    case 'wroc':
      sprite.x = HOME.x;
      sprite.y = HOME.y;
      return false;
    case 'kierunek':
      sprite.direction = normalizeDirection(Number(block.value ?? 90));
      return false;
    case 'obroc':
      sprite.direction = normalizeDirection(sprite.direction + Number(block.value ?? 0));
      return false;
    case 'odbij':
      /* Odbicie od pionowej krawędzi to lustro w poziomie: 90 ↔ -90. */
      if (Math.abs(sprite.x) >= EDGE_X - 1) sprite.direction = normalizeDirection(-sprite.direction);
      else if (Math.abs(sprite.y) >= EDGE_Y - 1)
        sprite.direction = normalizeDirection(180 - sprite.direction);
      return false;
    case 'styl':
      sprite.rotationStyle = (block.value as RotationStyle) ?? 'dowolny';
      return false;
    case 'powiedz':
      sprite.say = String(block.value ?? '');
      return false;
    case 'pokaz':
      sprite.visible = true;
      return false;
    case 'ukryj':
      sprite.visible = false;
      return false;
    case 'kostium':
      sprite.costume = (sprite.costume ?? 0) + 1;
      return false;
    case 'dzwiek':
      return true;
    default:
      return false;
  }
}

/**
 * Wykonuje jeden stos klocków. Nic nie jest porównywane z zapisaną odpowiedzią —
 * duszek po prostu robi to, co mu kazano, a widżety oglądają skutek.
 *
 * **Klocki obejmujące wykonują się rekurencyjnie**, a każdy obieg pętli kończy
 * się oddaniem ekranu (`LOOP_FRAME`). To nie jest sztuczne opóźnienie „żeby było
 * widać”, tylko odwzorowanie Scratcha: ciąg dziesięciu klocków `przesuń`
 * przeleci w jednym mgnieniu, a `powtórz 10 [przesuń]` narysuje dziesięć klatek.
 * Dzięki temu w lekcji 27 jedno i drugie stawia duszka w tym samym miejscu, ale
 * tylko przy pętli widać, którędy szedł.
 */
export function run(stack: Block[], start: Sprite = HOME, held?: Senses): Run {
  const head = stack[0];
  if (!head || BLOCKS[head.type].shape !== 'kapelusz') {
    return {
      started: false,
      frames: [],
      log: [],
      duration: 0,
      peakX: start.x,
      minX: start.x,
      wentRight: false,
      wentLeft: false,
      upsideDown: false,
      bounces: 0,
      endless: false,
    };
  }

  const sprite: Sprite = { ...start };
  const log: Step[] = [];
  const frames: Frame[] = [];
  let from = 1;
  let cursor = 1;
  let sound = false;
  let duration = 0;
  let peakX = sprite.x;
  let minX = sprite.x;
  let wentRight = false;
  let wentLeft = false;
  let upsideDown = false;
  let bounces = 0;
  let budget = MAX_BLOCK_RUNS;
  let endless = false;

  const flush = (hold: number) => {
    frames.push({ from: Math.min(from, cursor), to: cursor, sprite: { ...sprite }, hold, sound });
    duration += hold;
    from = cursor + 1;
    sound = false;
  };

  /** Czy wolno wykonać kolejny klocek. Fałsz przerywa cały przebieg, nie tylko pętlę. */
  const spare = (): boolean => {
    if (budget <= 0 || duration >= MAX_DURATION) {
      endless = true;
      return false;
    }
    budget -= 1;
    return true;
  };

  /** Zwraca `false`, gdy skończył się budżet — wtedy zwijamy się ze wszystkich poziomów naraz. */
  const exec = (blocks: Block[], depth: number): boolean => {
    for (let i = 0; i < blocks.length; i += 1) {
      const block = blocks[i];
      const def = BLOCKS[block.type];
      /* Kapelusz w środku stosu jest nieosiągalny — w Scratchu też się go tam nie wstawi. */
      if (def.shape === 'kapelusz') continue;
      if (depth === 0) cursor = i;
      if (!spare()) return false;

      if (def.shape === 'obejmujacy') {
        if (!wrap(block, depth)) return false;
        continue;
      }

      const beforeX = sprite.x;
      const beforeY = sprite.y;
      const beforeDirection = sprite.direction;

      if (applyBlock(block, sprite)) sound = true;

      const dx = sprite.x - beforeX;
      const dy = sprite.y - beforeY;
      if (dx > 0.5) wentRight = true;
      if (dx < -0.5) wentLeft = true;
      if (block.type === 'odbij' && sprite.direction !== beforeDirection) bounces += 1;
      peakX = Math.max(peakX, sprite.x);
      minX = Math.min(minX, sprite.x);
      if ((Math.abs(dx) > 0.5 || Math.abs(dy) > 0.5) && isUpsideDown(sprite)) upsideDown = true;

      const kind = EVENT_OF[block.type];
      if (kind)
        log.push({
          at: depth === 0 ? i : cursor,
          type: block.type,
          kind,
          value: block.value,
          dx,
          dy,
          direction: sprite.direction,
          rotationStyle: sprite.rotationStyle,
        });

      /* Tylko czekanie dzieli program na klatki — reszta dzieje się w jednym mgnieniu. */
      if (block.type === 'czekaj') flush(Number(block.value ?? 1) * 1000);
    }
    return true;
  };

  /** Klocek z paszczą: pętla albo warunek. Pusta paszcza kosztuje budżet, żeby `zawsze` nie wisiało. */
  const wrap = (block: Block, depth: number): boolean => {
    const inner = block.inner ?? [];

    if (block.type === 'jezeli' || block.type === 'jezeli_inaczej') {
      /* Warunek sprawdzamy DOKŁADNIE w tej chwili, w której klocek się wykonuje. */
      if (holds(block, sprite, held)) return exec(inner, depth + 1);
      return block.inner2 ? exec(block.inner2, depth + 1) : true;
    }

    const times =
      block.type === 'zawsze' ? Number.POSITIVE_INFINITY : Math.max(0, Math.round(Number(block.value ?? 0)));
    for (let turn = 0; turn < times; turn += 1) {
      if (!spare()) return false;
      if (inner.length === 0) continue;
      if (!exec(inner, depth + 1)) return false;
      /* Koniec obiegu = oddanie ekranu. Tak samo robi prawdziwy Scratch. */
      flush(LOOP_FRAME);
    }
    return true;
  };

  exec(stack, 0);
  cursor = stack.length - 1;
  flush(TAIL_HOLD);
  /* Duszek, który kończy program stojąc na głowie, też stoi na głowie. */
  if (isUpsideDown(sprite)) upsideDown = true;
  return {
    started: true,
    frames,
    log,
    duration,
    peakX,
    minX,
    wentRight,
    wentLeft,
    upsideDown,
    bounces,
    endless,
  };
}

/**
 * Rozstrzygnięcie warunku w sześciokątnym polu. Umiemy tu **krawędź sceny**,
 * strzałki, ale tylko te, które wywołujący **jawnie** ogłosił jako trzymane
 * (`held`), i **metę**, ale tylko tę, której miejsce wywołujący podał
 * (`held.meta`). Przebieg liczony z góry nie ma palców, więc o klawiaturze nie
 * wie nic ponad to (pyta o nią silnik na żywo z lekcji 27), a o czarnej linii nie
 * wie nic scena bez rysunku (pyta o nią symulacja robota z lekcji 28). Czarna
 * linia jest tu **fałszem** i tak ma zostać: lepszy jawny fałsz niż udawanie, że
 * coś sprawdziliśmy. Skrypt, który ma ją naprawdę wykonać, nie idzie przez
 * `run()`.
 */
function holds(block: Block, sprite: Sprite, held?: Senses): boolean {
  switch (block.value) {
    case 'dotykasz krawędzi?':
      return atEdge(sprite);
    case 'klawisz w prawo naciśnięty?':
      return held?.prawo === true;
    case 'klawisz w lewo naciśnięty?':
      return held?.lewo === true;
    case META_CONDITION:
      return held?.meta ? touches(sprite, held.meta) : false;
    default:
      return false;
  }
}

/** Czy stos ma kapelusz na wierzchu — czyli czy zielona flaga ma co uruchomić. */
export function hasHat(stack: Block[]): boolean {
  const head = stack[0];
  return Boolean(head && BLOCKS[head.type].shape === 'kapelusz');
}

/**
 * Czy klocek `type` wolno upuścić w stos `stack` na pozycję `index`. Dwie reguły
 * kształtu, obie z prawdziwego Scratcha: kapelusz idzie wyłącznie na wierzch
 * stosu, który kapelusza jeszcze nie ma, a nad kapeluszem już stojącym nic się
 * nie zmieści.
 *
 * `stack` to zawsze lista BEZ przenoszonego klocka — widżet zdejmuje go ze stosu
 * już w momencie chwycenia, tak samo jak Scratch, w którym złapany klocek
 * natychmiast wychodzi ze stosu i idzie za palcem.
 */
export function canDrop(stack: Block[], index: number, type: BlockType): boolean {
  if (BLOCKS[type].shape === 'kapelusz') return index === 0 && !hasHat(stack);
  return !(index === 0 && hasHat(stack));
}
