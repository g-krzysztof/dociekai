/**
 * Wspólny silnik robota dla lekcji o planowaniu.
 *
 * Dwa widżety tej lekcji — `RobotPlan` (pisanie programu) i `BugHunt`
 * (znajdowanie błędu w cudzym) — dzielą jeden model świata i **jedną funkcję
 * wykonującą program**. Dzięki temu nie ma miejsca, w którym „prawidłowa
 * odpowiedź” byłaby zapisana z ręki: w obu blokach werdykt powstaje z
 * przejechania trasy krok po kroku, tak samo jak `runRecipe()` w lekcji 20
 * naprawdę wykonywało przepis.
 *
 * Robot jest celowo **relatywny**: nie umie „idź w prawo”, umie tylko „naprzód”
 * i „obróć się”. To jest ta różnica, która sprawia, że plan trzeba pisać z
 * punktu widzenia robota, a nie własnego — i o którą rozbija się większość
 * pierwszych programów dziecka.
 */

export const SIZE = 6;

/** Kierunki w kolejności zgodnej z ruchem wskazówek zegara — obrót to `±1`. */
export const DIRS = [
  { dx: 0, dy: -1, label: 'w górę' },
  { dx: 1, dy: 0, label: 'w prawo' },
  { dx: 0, dy: 1, label: 'w dół' },
  { dx: -1, dy: 0, label: 'w lewo' },
];

export type Command = 'naprzod' | 'w-lewo' | 'w-prawo';

export const COMMAND_LABEL: Record<Command, string> = {
  naprzod: 'Idź naprzód',
  'w-lewo': 'Obróć się w lewo',
  'w-prawo': 'Obróć się w prawo',
};

export interface Pose {
  x: number;
  y: number;
  /** Indeks w `DIRS`. */
  dir: number;
}

export interface Maze {
  start: Pose;
  goal: { x: number; y: number };
  /** Zablokowane pola jako `"x,y"`. */
  rocks: Set<string>;
}

export const key = (x: number, y: number) => `${x},${y}`;

export function makeMaze(start: Pose, goal: { x: number; y: number }, rocks: string[]): Maze {
  return { start, goal, rocks: new Set(rocks) };
}

/** Ścieżka przez korytarz w kształcie litery L — używana w obu widżetach. */
export const MAZE_A: Maze = makeMaze({ x: 0, y: 5, dir: 0 }, { x: 5, y: 0 }, [
  '1,4', '2,4', '3,4', '4,4',
  '1,2', '2,2', '3,2',
  '4,1', '3,1',
  '1,0', '2,0',
]);

/** Druga plansza — dłuższa i z zakrętem w drugą stronę, do bloku z błędem. */
export const MAZE_B: Maze = makeMaze({ x: 0, y: 0, dir: 2 }, { x: 5, y: 5 }, [
  '1,1', '2,1', '3,1', '4,1',
  '1,3', '2,3', '3,3',
  '5,2', '5,3',
  '2,5', '1,5',
]);

export type Status = 'idzie' | 'cel' | 'skala' | 'poza-plansza';

export interface Frame {
  pose: Pose;
  status: Status;
  /** Indeks instrukcji, która doprowadziła do tej klatki; `-1` dla pozycji startowej. */
  at: number;
}

/**
 * Wykonuje program krok po kroku i zwraca **całą trasę**, nie tylko wynik.
 * Klatki są potrzebne obu widżetom: jeden je animuje, drugi pozwala po nich
 * chodzić w przód instrukcja po instrukcji.
 *
 * Bieg kończy się na pierwszej instrukcji, której nie da się wykonać — robot nie
 * „przeskakuje” przeszkody i nie domyśla się niczego.
 */
export function run(program: Command[], maze: Maze): Frame[] {
  const frames: Frame[] = [{ pose: { ...maze.start }, status: 'idzie', at: -1 }];
  let pose = { ...maze.start };

  for (let i = 0; i < program.length; i += 1) {
    const command = program[i];
    if (command === 'w-lewo') pose = { ...pose, dir: (pose.dir + 3) % 4 };
    else if (command === 'w-prawo') pose = { ...pose, dir: (pose.dir + 1) % 4 };
    else {
      const next = { ...pose, x: pose.x + DIRS[pose.dir].dx, y: pose.y + DIRS[pose.dir].dy };
      if (next.x < 0 || next.y < 0 || next.x >= SIZE || next.y >= SIZE) {
        frames.push({ pose, status: 'poza-plansza', at: i });
        return frames;
      }
      if (maze.rocks.has(key(next.x, next.y))) {
        frames.push({ pose, status: 'skala', at: i });
        return frames;
      }
      pose = next;
    }
    const reached = pose.x === maze.goal.x && pose.y === maze.goal.y;
    frames.push({ pose, status: reached ? 'cel' : 'idzie', at: i });
    if (reached) return frames;
  }
  return frames;
}

export const STATUS_TEXT: Record<Exclude<Status, 'idzie'>, string> = {
  cel: 'Robot dojechał do celu.',
  skala: 'Robot wjechał w kamień. Stoi i czeka — nie domyśli się, że miał go ominąć.',
  'poza-plansza': 'Robot spadł z planszy. Krawędź nie jest dla niego żadną wskazówką.',
};

/** Najkrótszy program prowadzący do celu — liczony przeszukiwaniem wszerz. */
export function shortest(maze: Maze): Command[] {
  const startKey = `${maze.start.x},${maze.start.y},${maze.start.dir}`;
  const seen = new Map<string, Command[]>([[startKey, []]]);
  const queue: Pose[] = [{ ...maze.start }];
  while (queue.length > 0) {
    const pose = queue.shift() as Pose;
    const path = seen.get(`${pose.x},${pose.y},${pose.dir}`) as Command[];
    if (pose.x === maze.goal.x && pose.y === maze.goal.y) return path;
    (['naprzod', 'w-lewo', 'w-prawo'] as Command[]).forEach((command) => {
      let next: Pose;
      if (command === 'w-lewo') next = { ...pose, dir: (pose.dir + 3) % 4 };
      else if (command === 'w-prawo') next = { ...pose, dir: (pose.dir + 1) % 4 };
      else {
        const cx = pose.x + DIRS[pose.dir].dx;
        const cy = pose.y + DIRS[pose.dir].dy;
        if (cx < 0 || cy < 0 || cx >= SIZE || cy >= SIZE || maze.rocks.has(key(cx, cy))) return;
        next = { ...pose, x: cx, y: cy };
      }
      const id = `${next.x},${next.y},${next.dir}`;
      if (seen.has(id)) return;
      seen.set(id, [...path, command]);
      queue.push(next);
    });
  }
  return [];
}
