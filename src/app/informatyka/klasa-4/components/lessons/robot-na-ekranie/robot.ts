/**
 * Robot na ekranie — jeden świat dla całej lekcji 28.
 *
 * **To nie jest silnik Scratcha i celowo nim nie jest.** `run()` z `engine.ts`
 * liczy przebieg z góry, a tutaj wszystko zależy od tego, **co czujnik widzi w
 * tej milisekundzie** — czyli od rysunku, po którym robot jedzie. Dlatego świat
 * jest osobny, a klocki, które lekcja pokazuje obok, są rysunkiem tego samego
 * programu (`components/scratch/loop-stack.tsx`), nie jego wykonaniem. Symulacja
 * i rysunek muszą mówić to samo — przy każdej zmianie liczb w `FOLLOW` albo
 * `COUNTED` popraw też klocki w widżecie.
 *
 * Świat jest jeden, bo cała lekcja jest o jednej różnicy: **odliczać kroki czy
 * patrzeć czujnikiem**. Robot ma położenie, kierunek i jeden czujnik wysunięty
 * do przodu, który odpowiada na jedno pytanie: czy pode mną jest linia. Nic
 * więcej — i o to chodzi.
 *
 * Układ współrzędnych jest **ekranowy** (y rośnie w dół), bo wszystko tu jedzie
 * po rysunku, a nie po scenie Scratcha. „W prawo” to dodatnie stopnie.
 */

export interface Point {
  x: number;
  y: number;
}

/** Tor: łamana i jej grubość. Rysowany jako gruba kreska z zaokrąglonymi końcami. */
export interface Track {
  points: Point[];
  width: number;
}

export interface Bot {
  x: number;
  y: number;
  /** Stopnie; 0 to w prawo, rosną zgodnie z ruchem wskazówek zegara. */
  angle: number;
}

/** Pole gry w jednostkach rysunku — proporcje 4:3, tak jak scena Scratcha. */
export const FIELD = { width: 320, height: 240 } as const;

/** Czujnik siedzi przed robotem, nie pod jego środkiem — tak samo jak w prawdziwym robocie. */
export const SENSOR_AHEAD = 9;

export function move(bot: Bot, steps: number): Bot {
  const radians = (bot.angle * Math.PI) / 180;
  return { ...bot, x: bot.x + Math.cos(radians) * steps, y: bot.y + Math.sin(radians) * steps };
}

export function turn(bot: Bot, degrees: number): Bot {
  return { ...bot, angle: bot.angle + degrees };
}

export function sensor(bot: Bot, ahead: number = SENSOR_AHEAD): Point {
  const radians = (bot.angle * Math.PI) / 180;
  return { x: bot.x + Math.cos(radians) * ahead, y: bot.y + Math.sin(radians) * ahead };
}

/** Odległość punktu od odcinka — z tego składa się odległość od całego toru. */
function toSegment(point: Point, a: Point, b: Point): number {
  const dx = b.x - a.x;
  const dy = b.y - a.y;
  const length = dx * dx + dy * dy;
  if (length === 0) return Math.hypot(point.x - a.x, point.y - a.y);
  const t = Math.max(0, Math.min(1, ((point.x - a.x) * dx + (point.y - a.y) * dy) / length));
  return Math.hypot(point.x - (a.x + t * dx), point.y - (a.y + t * dy));
}

export function distanceToTrack(point: Point, track: Track): number {
  let best = Number.POSITIVE_INFINITY;
  for (let i = 1; i < track.points.length; i += 1)
    best = Math.min(best, toSegment(point, track.points[i - 1], track.points[i]));
  return best;
}

/** Czy czujnik widzi linię. To jedyna informacja, jaką robot ma o świecie. */
export function onTrack(point: Point, track: Track): boolean {
  return distanceToTrack(point, track) <= track.width / 2;
}

export function inside(bot: Bot): boolean {
  return bot.x >= 0 && bot.x <= FIELD.width && bot.y >= 0 && bot.y <= FIELD.height;
}

/** Promień mety liczony hojnie — zadanie jest o dojechaniu, nie o celności do piksela. */
export const FINISH_RADIUS = 16;

export function atFinish(bot: Bot, track: Track): boolean {
  const end = track.points[track.points.length - 1];
  return Math.hypot(bot.x - end.x, bot.y - end.y) <= FINISH_RADIUS;
}

/**
 * Program „po czujniku” — jeden obieg pętli. Klasyczny robot jadący **wzdłuż
 * krawędzi linii**: na linii skręca w jedną stronę, poza nią w drugą, i przez to
 * wiecznie się waha. To wahanie nie jest usterką symulacji, tylko tym, co
 * prawdziwy robot z jednym czujnikiem naprawdę robi — i dlatego zostawiamy je
 * widoczne.
 */
export const FOLLOW = { steps: 3, degrees: 8 } as const;

export function followTick(bot: Bot, track: Track): Bot {
  const moved = move(bot, FOLLOW.steps);
  return turn(moved, onTrack(sensor(moved), track) ? -FOLLOW.degrees : FOLLOW.degrees);
}

/**
 * Program „po krokach” — ten, który niczego nie sprawdza. Tor A jest z niego
 * **wyprowadzony**, więc na torze A przejeżdża idealnie; to jest w tej lekcji
 * potrzebne, bo inaczej dziecko uznałoby, że odliczanie nie działa nigdy.
 */
export const COUNTED = { turns: 12, steps: 18, degrees: 9 } as const;

export const START: Bot = { x: 30, y: 58, angle: 0 };

/** Ślad, jaki zostawia program o zadanych zakrętach. Tory lekcji powstają właśnie tak. */
export function pathFrom(start: Bot, turns: number[], steps: number = COUNTED.steps): Point[] {
  let bot = { ...start };
  const points: Point[] = [{ x: bot.x, y: bot.y }];
  for (const degrees of turns) {
    bot = move(bot, steps);
    points.push({ x: bot.x, y: bot.y });
    bot = turn(bot, degrees);
  }
  return points;
}

const TURNS_A = Array.from({ length: COUNTED.turns }, () => COUNTED.degrees);
/** Tor B zaczyna się identycznie i **w połowie skręca w drugą stronę**. */
const TURNS_B = [
  ...Array.from({ length: COUNTED.turns / 2 }, () => COUNTED.degrees),
  ...Array.from({ length: COUNTED.turns / 2 }, () => -COUNTED.degrees),
];

export const TRACK_WIDTH = 18;

export const TRACK_A: Track = { points: pathFrom(START, TURNS_A), width: TRACK_WIDTH };
export const TRACK_B: Track = { points: pathFrom(START, TURNS_B), width: TRACK_WIDTH };
/**
 * Tor haczyka — krótki i z jednym łagodnym zakrętem, bo w pierwszym bloku
 * dziecko prowadzi robota **na ślepo**, po jednej lampce. Jest też szerszy od
 * pozostałych: zbaczanie ma być do odratowania, a nie karą.
 */
export const TRACK_HOOK: Track = { points: pathFrom(START, [0, 0, 22, 22, 0, 0], 30), width: 26 };

/** Jeden obieg programu „po krokach”. Zwraca `null`, gdy program się skończył. */
export function countedTick(bot: Bot, at: number): Bot | null {
  if (at >= COUNTED.turns) return null;
  return turn(move(bot, COUNTED.steps), COUNTED.degrees);
}

export type Program = 'kroki' | 'czujnik';

export interface Drive {
  bot: Bot;
  trail: Point[];
  ticks: number;
  status: 'jedzie' | 'meta' | 'poza-planszą' | 'koniec-programu' | 'zabłądził';
}

/** Ile obiegów pętli wystarczy, żeby przejechać tor — z dużym zapasem na wahanie czujnika. */
const MAX_TICKS = 700;

export function startDrive(): Drive {
  return { bot: { ...START }, trail: [{ x: START.x, y: START.y }], ticks: 0, status: 'jedzie' };
}

/** Krok symulacji. Widżety wołają to z zegara, klatka po klatce. */
export function step(drive: Drive, program: Program, track: Track): Drive {
  if (drive.status !== 'jedzie') return drive;
  const next = program === 'czujnik' ? followTick(drive.bot, track) : countedTick(drive.bot, drive.ticks);

  if (!next) return { ...drive, status: atFinish(drive.bot, track) ? 'meta' : 'koniec-programu' };

  const trail = [...drive.trail, { x: next.x, y: next.y }];
  const ticks = drive.ticks + 1;
  if (atFinish(next, track)) return { bot: next, trail, ticks, status: 'meta' };
  if (!inside(next)) return { bot: next, trail, ticks, status: 'poza-planszą' };
  if (ticks >= MAX_TICKS) return { bot: next, trail, ticks, status: 'zabłądził' };
  return { bot: next, trail, ticks, status: 'jedzie' };
}

/** Cały przejazd policzony od razu — do testów i do zdania „ile to zajmie”. */
export function drive(program: Program, track: Track): Drive {
  let current = startDrive();
  while (current.status === 'jedzie') current = step(current, program, track);
  return current;
}
