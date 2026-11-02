'use client';

import { useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Check, Footprints } from 'lucide-react';
import { StageView } from '../../scratch/stage-view';
import { HOME, isUpsideDown, make, normalizeDirection, run, type Sprite } from '../../scratch/engine';

/**
 * Kierownica duszka — haczyk lekcji i **jedyne miejsce w kursie, w którym usterkę
 * produkuje palec dziecka, a nie przygotowany przez nas zepsuty program**.
 *
 * Dziecko przekręca prawdziwą tarczę kierunku (taką jak w panelu duszka w
 * Scratchu) i naciska „przesuń o 100 kroków”. Z dwóch pierwszych zleceń wychodzi,
 * że **kroki idą tam, gdzie patrzy nos** — a nie w prawo, jak wszystkim się
 * wydaje po pierwszej lekcji. Trzecie zlecenie każe wrócić w lewo i wtedy kot
 * dochodzi do celu **głową w dół**. Lekcja nie mówi jeszcze, dlaczego: blok
 * kończy się pytaniem, a odpowiedź zbiera się w bloku „Kot chodzi na głowie”.
 *
 * Tarcza jest przeciągana naprawdę (kąt liczony ze środka do palca), bo to jest
 * cała różnica między „wybieram liczbę z listy” a „czuję, że obracam duszka”;
 * przyciski przy tarczy zostają dla klawiatury, nie zamiast przeciągania. Wartość
 * zatrzaskuje się co 15°, żeby 90 i -90 dało się trafić palcem na telefonie.
 *
 * Przy okazji wychodzi druga niespodzianka Scratcha: **w lewo to -90, a nie 270**.
 * Dlatego odczyt pod tarczą pokazuje surową liczbę, a nie „w lewo”.
 */

interface Mission {
  target: { x: number; y: number; label: string };
  order: string;
  hint: string;
}

const START: Sprite = { ...HOME, x: -150, y: 0, direction: 90 };
const STEP = 100;
/** Cel uznajemy za trafiony z tolerancją — chodzi o kierunek, nie o celność co do kroku. */
const TOLERANCE = 60;

const MISSIONS: Mission[] = [
  {
    target: { x: 150, y: 0, label: 'piłka' },
    order: 'Doprowadź kota do piłki po prawej stronie sceny.',
    hint: 'Kot patrzy w prawo już na starcie — wystarczy kilka razy nacisnąć „przesuń”.',
  },
  {
    target: { x: 150, y: 120, label: 'balonik' },
    order: 'Teraz do balonika, który wisi nad piłką.',
    hint: 'Kroki idą tam, gdzie patrzy nos. Przekręć tarczę, zanim naciśniesz „przesuń”.',
  },
  {
    target: { x: -150, y: 120, label: 'koszyk' },
    order: 'Na koniec zabierz kota do koszyka po lewej stronie.',
    hint: 'W lewo, czyli… przekręć tarczę na drugą stronę i sprawdź, jaka liczba się pod nią pojawi.',
  },
];

interface DirectionDialProps {
  color: string;
  onComplete?: () => void;
}

export function DirectionDial({ color, onComplete }: DirectionDialProps) {
  const [sprite, setSprite] = useState<Sprite>(START);
  const [at, setAt] = useState(0);
  const [walkedUpsideDown, setWalkedUpsideDown] = useState(false);
  const done = at >= MISSIONS.length;
  const mission = MISSIONS[Math.min(at, MISSIONS.length - 1)];

  const move = () => {
    const next = run([make('flaga'), make('idz', STEP)], sprite).frames.at(-1)?.sprite;
    if (!next) return;
    setSprite(next);
    if (isUpsideDown(next)) setWalkedUpsideDown(true);

    const reached =
      Math.hypot(next.x - mission.target.x, next.y - mission.target.y) <= TOLERANCE;
    if (!reached || done) return;
    const following = at + 1;
    setAt(following);
    if (following >= MISSIONS.length) onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,230px)]">
        <div>
          <StageView
            actors={[{ id: 'kot', kind: 'kot', sprite }]}
            targets={done ? [] : [mission.target]}
            note={`kierunek ${normalizeDirection(sprite.direction)}`}
            className="max-w-[420px]"
          />
        </div>

        <div>
          <Dial
            direction={sprite.direction}
            color={color}
            onChange={(direction) => setSprite((current) => ({ ...current, direction }))}
          />
          <p className="mt-2 text-center text-sm tabular-nums">
            kierunek:{' '}
            <strong className="text-base" style={{ color }}>
              {normalizeDirection(sprite.direction)}
            </strong>
          </p>
          <button
            type="button"
            onClick={move}
            className="mt-2 inline-flex w-full cursor-pointer items-center justify-center gap-2 border px-3 py-2 text-sm font-semibold transition-colors hover:bg-muted/50"
            style={{ borderColor: color, color }}
          >
            <Footprints className="h-4 w-4 shrink-0" aria-hidden />
            przesuń o {STEP} kroków
          </button>
          <button
            type="button"
            onClick={() => setSprite((current) => ({ ...current, x: START.x, y: START.y }))}
            className="mt-1.5 w-full cursor-pointer text-xs text-muted-foreground underline underline-offset-4 transition-colors hover:text-primary"
          >
            odstaw kota na start
          </button>
        </div>
      </div>

      <div className="mt-4 border-t pt-3">
        {done ? (
          <div className="p-3" style={{ backgroundColor: `${color}14` }}>
            <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
              <Check className="h-4 w-4 shrink-0" aria-hidden />
              Trzy zlecenia wykonane.
            </p>
            <p className="mt-1.5 text-sm leading-relaxed">
              Kierunek nie jest ozdobą — <strong>to on decyduje, dokąd pójdą kroki</strong>. Ta sama
              instrukcja „przesuń o 100 kroków” raz prowadzi w prawo, raz do góry, a raz w lewo.
            </p>
            {walkedUpsideDown && (
              <p className="mt-2 text-sm leading-relaxed">
                Zauważyłeś/zauważyłaś jednak coś jeszcze: w drodze do koszyka{' '}
                <strong>kot szedł głową w dół</strong>. Doszedł, owszem — ale wyglądał, jakby mu się
                świat przewrócił. Zajmiemy się tym za dwa bloki.
              </p>
            )}
          </div>
        ) : (
          <>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Zlecenie {at + 1} z {MISSIONS.length}
            </p>
            <p className="mt-1 text-sm font-medium leading-relaxed">{mission.order}</p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{mission.hint}</p>
          </>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Tarcza                                                              */
/* ------------------------------------------------------------------ */

/** Zatrzask co 15° — tyle wystarczy, żeby 90 i -90 dało się trafić palcem na telefonie. */
const SNAP = 15;

/**
 * Współrzędne kresek tarczy **muszą być zaokrąglone**, zanim trafią do atrybutów
 * SVG. `Math.sin` nie jest w JavaScripcie dokładnie określony i V8 w Node
 * (render po stronie serwera) potrafi oddać inną ostatnią cyfrę niż V8 w
 * przeglądarce — a React uznaje to za rozjazd hydratacji i wypisuje błąd w
 * konsoli przy każdym wejściu w lekcję.
 */
const round = (value: number) => Math.round(value * 1000) / 1000;

const TICKS = [
  { value: 90, label: '90' },
  { value: 180, label: '180' },
  { value: -90, label: '-90' },
  { value: 0, label: '0' },
];

function Dial({
  direction,
  color,
  onChange,
}: {
  direction: number;
  color: string;
  onChange: (direction: number) => void;
}) {
  const box = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const aim = (event: { clientX: number; clientY: number }) => {
    const rect = box.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    /* Scratch liczy kierunek od pionu w prawo, więc oś zamienia się miejscami z atan2. */
    const degrees = (Math.atan2(dx, -dy) * 180) / Math.PI;
    onChange(normalizeDirection(Math.round(degrees / SNAP) * SNAP));
  };

  const start = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = true;
    event.currentTarget.setPointerCapture(event.pointerId);
    aim(event);
  };

  const pointer = useMemo(() => {
    const radians = (normalizeDirection(direction) * Math.PI) / 180;
    return { x: round(50 + Math.sin(radians) * 34), y: round(50 - Math.cos(radians) * 34) };
  }, [direction]);

  return (
    <svg
      ref={box}
      viewBox="0 0 100 100"
      role="slider"
      tabIndex={0}
      aria-label="Kierunek duszka w stopniach"
      aria-valuenow={normalizeDirection(direction)}
      aria-valuemin={-180}
      aria-valuemax={180}
      onPointerDown={start}
      onPointerMove={(event) => dragging.current && aim(event)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
      onKeyDown={(event) => {
        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown')
          onChange(normalizeDirection(direction - SNAP));
        else if (event.key === 'ArrowRight' || event.key === 'ArrowUp')
          onChange(normalizeDirection(direction + SNAP));
        else return;
        event.preventDefault();
      }}
      className="mx-auto block w-full max-w-[170px] touch-none cursor-grab select-none active:cursor-grabbing"
    >
      <circle cx={50} cy={50} r={44} className="fill-white dark:fill-zinc-800" stroke="#c7ccd4" strokeWidth={1.5} />
      {Array.from({ length: 24 }).map((_tick, i) => {
        const radians = (i * 15 * Math.PI) / 180;
        const long = i % 6 === 0;
        return (
          <line
            key={i}
            x1={round(50 + Math.sin(radians) * (long ? 36 : 40))}
            y1={round(50 - Math.cos(radians) * (long ? 36 : 40))}
            x2={round(50 + Math.sin(radians) * 43)}
            y2={round(50 - Math.cos(radians) * 43)}
            stroke={long ? '#94a3b8' : '#dbe1e8'}
            strokeWidth={long ? 1.4 : 1}
          />
        );
      })}
      {TICKS.map((tick) => {
        const radians = (tick.value * Math.PI) / 180;
        return (
          <text
            key={tick.value}
            x={round(50 + Math.sin(radians) * 22)}
            y={round(50 - Math.cos(radians) * 22 + 3)}
            textAnchor="middle"
            className="fill-zinc-500 text-[8px] font-semibold"
          >
            {tick.label}
          </text>
        );
      })}
      <line x1={50} y1={50} x2={pointer.x} y2={pointer.y} stroke={color} strokeWidth={3.2} strokeLinecap="round" />
      <circle cx={pointer.x} cy={pointer.y} r={6} fill={color} />
      <circle cx={50} cy={50} r={3.4} fill={color} />
    </svg>
  );
}
