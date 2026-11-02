'use client';

import { useState } from 'react';
import { Check, Hand, Play } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { StageView } from '../../scratch/stage-view';
import { HOME, type Sprite } from '../../scratch/engine';

/**
 * Siatka sceny — trzy rundy, w których **zmienia się narzędzie, a nie temat**.
 *
 * 1. **Palec.** Dziecko przeciąga duszka po scenie i patrzy, jak pod palcem
 *    zmieniają się dwie liczby. Trzy punkty kontrolne (prawa góra, lewy dół,
 *    sam środek) zmuszają do odwiedzenia obu znaków przy obu liczbach — bo to
 *    jedyna rzecz, która w układzie współrzędnych naprawdę dziwi.
 * 2. **Bez palca.** Duszek przestaje się dać chwytać, a jedynym sposobem, żeby
 *    go ruszyć, jest wpisanie dwóch liczb w klocek `idź do x: … y: …`.
 *    To nie jest utrudnienie dla kaprysu: **program nie ma palca** i cała różnica
 *    między „przestawiam duszka” a „programuję duszka” mieści się w tym zdaniu.
 * 3. **Tylko w poziomie.** Zostaje klocek `zmień x o …`, a odczyt y dostaje
 *    podpis „nie drgnęło”. Stąd bierze się definicja, której potrzebuje zadanie
 *    Z-7: **ruch w poziomie to ten, przy którym zmienia się x, a y stoi**.
 *
 * Rundy różnią się gestem (ciągnięcie → wpisywanie liczb → jedna liczba), więc
 * nie jest to jedno ćwiczenie powtórzone trzy razy.
 */

const START: Sprite = { ...HOME, x: -180, y: -120, rotationStyle: 'nie obracaj' };

interface Checkpoint {
  id: string;
  label: string;
  hit: (sprite: Sprite) => boolean;
}

const CHECKPOINTS: Checkpoint[] = [
  { id: 'prawo-gora', label: 'x dodatni i y dodatni (prawa góra)', hit: (s) => s.x > 60 && s.y > 60 },
  { id: 'lewo-dol', label: 'x ujemny i y ujemny (lewy dół)', hit: (s) => s.x < -60 && s.y < -60 },
  { id: 'srodek', label: 'sam środek sceny, czyli x = 0 i y = 0', hit: (s) => Math.abs(s.x) < 22 && Math.abs(s.y) < 22 },
];

const JUMPS = [
  { x: 120, y: -90 },
  { x: -150, y: 60 },
];

/** Cele rundy trzeciej leżą na tej samej wysokości co duszek — o to w niej chodzi. */
const WALKS = [150, -120];
const WALK_Y = 0;
const HIT = 30;

interface StageGridProps {
  color: string;
  onComplete?: () => void;
}

export function StageGrid({ color, onComplete }: StageGridProps) {
  const [round, setRound] = useState(0);
  const anchorRef = useSectionScrollAnchor(round);

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="mb-3 flex flex-wrap items-center gap-2">
        {['Palec', 'Dwie liczby', 'Tylko w poziomie'].map((label, index) => (
          <span
            key={label}
            className={cn(
              'inline-flex items-center gap-1.5 border px-2 py-1 text-[11px] font-medium',
              index === round ? 'border-foreground' : 'border-transparent text-muted-foreground'
            )}
          >
            <span
              className="flex h-4 w-4 shrink-0 items-center justify-center text-[10px] font-bold text-white"
              style={{ backgroundColor: index <= round ? color : '#b6bcc4' }}
            >
              {index + 1}
            </span>
            {label}
          </span>
        ))}
      </div>

      {round === 0 && <DragRound color={color} onDone={() => setRound(1)} />}
      {round === 1 && <JumpRound color={color} onDone={() => setRound(2)} />}
      {round === 2 && (
        <WalkRound
          color={color}
          onDone={() => {
            setRound(3);
            onComplete?.();
          }}
        />
      )}
      {round === 3 && <Summary color={color} />}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Runda 1 — palec                                                     */
/* ------------------------------------------------------------------ */

function DragRound({ color, onDone }: { color: string; onDone: () => void }) {
  const [sprite, setSprite] = useState<Sprite>(START);
  const [hit, setHit] = useState<string[]>([]);

  const place = (point: { x: number; y: number }, phase: 'down' | 'move' | 'up') => {
    if (phase === 'up') return;
    const next = { ...sprite, x: point.x, y: point.y };
    setSprite(next);
    const reached = CHECKPOINTS.filter((item) => item.hit(next)).map((item) => item.id);
    const all = Array.from(new Set([...hit, ...reached]));
    setHit(all);
    if (all.length === CHECKPOINTS.length) window.setTimeout(onDone, 700);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,250px)]">
      <StageView
        actors={[{ id: 'kot', kind: 'kot', sprite }]}
        grid
        onStagePointer={place}
        note={`x ${Math.round(sprite.x)} · y ${Math.round(sprite.y)}`}
        className="max-w-[420px]"
      />
      <div>
        <p className="flex items-start gap-1.5 text-sm leading-relaxed">
          <Hand className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
          <span>
            Poprzeciągaj kota po scenie — pójdzie tam, gdzie palec. Nad sceną chodzą za nim{' '}
            <strong>dwie liczby</strong>: x mówi, jak daleko w bok, y — jak wysoko.
          </span>
        </p>
        <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Odwiedź te trzy miejsca
        </p>
        <ul className="mt-2 space-y-1.5">
          {CHECKPOINTS.map((item) => (
            <li key={item.id} className="flex items-start gap-2 text-sm leading-snug">
              <span
                className={cn(
                  'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center border text-white',
                  !hit.includes(item.id) && 'border-dashed'
                )}
                style={hit.includes(item.id) ? { backgroundColor: color, borderColor: color } : undefined}
                aria-hidden
              >
                {hit.includes(item.id) && <Check className="h-3 w-3" />}
              </span>
              <span className={cn(hit.includes(item.id) && 'text-muted-foreground line-through')}>
                {item.label}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
          Środek sceny to <strong className="text-foreground">zero</strong>, a nie lewy górny róg —
          dlatego po lewej i na dole liczby są ujemne.
        </p>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Runda 2 — dwie liczby                                               */
/* ------------------------------------------------------------------ */

function JumpRound({ color, onDone }: { color: string; onDone: () => void }) {
  const [sprite, setSprite] = useState<Sprite>(START);
  const [at, setAt] = useState(0);
  const [x, setX] = useState('0');
  const [y, setY] = useState('0');
  const [miss, setMiss] = useState<string | null>(null);

  const target = JUMPS[Math.min(at, JUMPS.length - 1)];

  const execute = () => {
    const next = { ...sprite, x: clampInput(x), y: clampInput(y) };
    setSprite(next);
    if (Math.abs(next.x - target.x) <= HIT && Math.abs(next.y - target.y) <= HIT) {
      setMiss(null);
      const following = at + 1;
      setAt(following);
      if (following >= JUMPS.length) window.setTimeout(onDone, 700);
      return;
    }
    setMiss(
      Math.abs(next.x - target.x) > HIT
        ? next.x > target.x
          ? 'Za daleko w prawo — zmniejsz x.'
          : 'Za daleko w lewo — zwiększ x.'
        : next.y > target.y
          ? 'Za wysoko — zmniejsz y.'
          : 'Za nisko — zwiększ y.'
    );
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,250px)]">
      <StageView
        actors={[{ id: 'kot', kind: 'kot', sprite }]}
        grid
        targets={at < JUMPS.length ? [target] : []}
        note={`x ${Math.round(sprite.x)} · y ${Math.round(sprite.y)}`}
        className="max-w-[420px]"
      />
      <div>
        <p className="text-sm leading-relaxed">
          Kota już nie da się chwycić — <strong>program nie ma palca</strong>. Postaw go na
          celowniku, wpisując dwie liczby w klocek. Kratki siatki są co 60, więc da się je
          odliczyć od środka.
        </p>
        <div className="mt-3 w-fit rounded-[3px] px-2.5 py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#4c97ff' }}>
          <span className="flex items-center gap-1">
            idź do x:
            <NumberField value={x} onChange={setX} label="współrzędna x" />
            y:
            <NumberField value={y} onChange={setY} label="współrzędna y" />
          </span>
        </div>
        <button
          type="button"
          onClick={execute}
          className="mt-2 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Play className="h-3.5 w-3.5 shrink-0" aria-hidden />
          wykonaj klocek
        </button>
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">
          Celownik {Math.min(at + 1, JUMPS.length)} z {JUMPS.length}
        </p>
        {miss && (
          <p className="mt-2 border-l-2 border-amber-500 bg-amber-50 p-2 text-xs leading-relaxed dark:bg-amber-950/30">
            {miss}
          </p>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Runda 3 — tylko w poziomie                                          */
/* ------------------------------------------------------------------ */

function WalkRound({ color, onDone }: { color: string; onDone: () => void }) {
  const [sprite, setSprite] = useState<Sprite>({ ...START, x: 0, y: WALK_Y });
  const [at, setAt] = useState(0);
  const [amount, setAmount] = useState('50');

  const target = { x: WALKS[Math.min(at, WALKS.length - 1)], y: WALK_Y };

  const execute = () => {
    const next = { ...sprite, x: Math.max(-205, Math.min(205, sprite.x + clampInput(amount))) };
    setSprite(next);
    if (Math.abs(next.x - target.x) > HIT) return;
    const following = at + 1;
    setAt(following);
    if (following >= WALKS.length) window.setTimeout(onDone, 700);
  };

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,250px)]">
      <StageView
        actors={[{ id: 'kot', kind: 'kot', sprite }]}
        grid
        targets={at < WALKS.length ? [target] : []}
        note={`x ${Math.round(sprite.x)} · y ${Math.round(sprite.y)}`}
        className="max-w-[420px]"
      />
      <div>
        <p className="text-sm leading-relaxed">
          Zostaje jedna liczba. Doprowadź kota do obu celowników — leżą{' '}
          <strong>na tej samej wysokości</strong> co on.
        </p>
        <div className="mt-3 w-fit rounded-[3px] px-2.5 py-2 text-xs font-semibold text-white" style={{ backgroundColor: '#4c97ff' }}>
          <span className="flex items-center gap-1">
            zmień x o
            <NumberField value={amount} onChange={setAmount} label="o ile zmienić x" />
          </span>
        </div>
        <button
          type="button"
          onClick={execute}
          className="mt-2 inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted/50"
          style={{ borderColor: color, color }}
        >
          <Play className="h-3.5 w-3.5 shrink-0" aria-hidden />
          wykonaj klocek
        </button>
        <p className="mt-3 border-l-2 pl-2.5 text-xs leading-relaxed" style={{ borderColor: `${color}66` }}>
          Popatrz na odczyt nad sceną: x biega w tę i z powrotem, a{' '}
          <strong>y ani razu nie drgnęło</strong>. Tak właśnie wygląda ruch w poziomie — i tego
          będzie wymagało zadanie na końcu lekcji.
        </p>
        <p className="mt-2 text-xs tabular-nums text-muted-foreground">
          Celownik {Math.min(at + 1, WALKS.length)} z {WALKS.length}
        </p>
      </div>
    </div>
  );
}

function Summary({ color }: { color: string }) {
  return (
    <div className="p-3" style={{ backgroundColor: `${color}14` }}>
      <p className="flex items-center gap-2 text-sm font-semibold" style={{ color }}>
        <Check className="h-4 w-4 shrink-0" aria-hidden />
        Umiesz już powiedzieć, gdzie na scenie stoi duszek.
      </p>
      <p className="mt-1.5 text-sm leading-relaxed">
        Scena ma <strong>480 na 360</strong> jednostek i zero dokładnie pośrodku. Duszek zawsze ma
        dwie liczby: x — jak daleko w bok, y — jak wysoko. Palcem możesz go przestawić sam, ale{' '}
        <strong>program musi podać liczby</strong>. A ruch w poziomie poznasz po tym, że zmienia się
        wyłącznie x.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------ */

/** Owalne pole klocka z wpisywaną liczbą — w Scratchu wygląda dokładnie tak. */
function NumberField({
  value,
  onChange,
  label,
}: {
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <input
      type="text"
      inputMode="numeric"
      aria-label={label}
      value={value}
      onChange={(event) => onChange(event.target.value.replace(/[^\d-]/g, '').slice(0, 4))}
      className="w-12 rounded-full bg-white px-2 py-[1px] text-center text-[11px] font-bold text-zinc-800 outline-none focus-visible:ring-2 focus-visible:ring-white"
    />
  );
}

/** Puste pole albo sam minus to zero, a nie `NaN` — dziecko kasuje liczbę w trakcie pisania. */
function clampInput(raw: string): number {
  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
}
