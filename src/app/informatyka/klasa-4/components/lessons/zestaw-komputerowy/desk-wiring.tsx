'use client';

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Camera,
  Check,
  Copy,
  Cpu,
  Gamepad2,
  Headphones,
  Headset,
  Keyboard,
  Mic,
  Monitor,
  MousePointer2,
  Plug,
  Printer,
  Router,
  ScanLine,
  TabletSmartphone,
  Touchpad,
  Usb,
  Volume2,
  X,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { count } from '../../../lib/plural';
import {
  DEVICES,
  MAX_DEVICES,
  MIN_DEVICES,
  SIDE_LABEL,
  countSide,
  deviceById,
  judge,
  needed,
  type Side,
} from './desk';

/**
 * Zadanie praktyczne lekcji o zestawie komputerowym — **podłączanie własnego
 * sprzętu**, w całości w lekcji.
 *
 * Pierwsza wersja odbierała je plikiem (spis „Mój zestaw komputerowy”
 * z podpisem kierunku przy każdym urządzeniu). Użytkownik odrzucił ten model
 * 2026-09-19: wyrzuca dziecko ze strony, wymaga od dziesięciolatka „Zapisz
 * jako” i odnalezienia pliku, a werdykt musiał zgadywać z jego słów, o jakim
 * urządzeniu mowa.
 *
 * Decyzja, którą tamto zadanie sprawdzało, została — zmienił się tylko sposób
 * jej wyrażenia. Zamiast dopisywać w Notatniku słowo „wejście”, dziecko
 * **wpina kabel** do jednego z dwóch gniazd jednostki centralnej. Trzy rzeczy,
 * których spis w pliku nie potrafił, a to potrafi:
 *
 * - **„obie strony” przestaje być trzecim słowem z listy.** Pendrive i ekran
 *   dotykowy potrzebują dwóch kabli — i dziecko odkrywa to samo, bo po
 *   sprawdzeniu strona mówi „dobrze, ale to dopiero połowa”. Trzeciego gniazda
 *   po prostu nie ma.
 * - **Zestaw jest jego.** Na półce stoją osobno słuchawki i słuchawki
 *   z mikrofonem, monitor i ekran dotykowy, drukarka i urządzenie
 *   wielofunkcyjne. Pierwszą decyzją zadania jest rozstrzygnięcie, co się
 *   naprawdę ma.
 * - **Nie ma czego źle nazwać.** Werdykt nie zgaduje niczego ze słów dziecka,
 *   więc każde zdanie, które mu mówimy, jest prawdziwe.
 *
 * Gest jest podwójny z rozmysłu: wtyczkę można **przeciągnąć** (pointer, więc
 * i palcem) albo **stuknąć i stuknąć gniazdo**. Bez tej drugiej drogi zadania
 * nie dałoby się zrobić z klawiatury.
 *
 * **Świadoma nieprawda, którą trzeba nazwać:** prawdziwe gniazda z tyłu
 * komputera nie dzielą się na wejściowe i wyjściowe — do tego samego portu USB
 * wepniesz mysz i drukarkę. Dlatego panel nie udaje tylnej ścianki i jest
 * podpisany kierunkiem informacji, a pod planszą stoi o tym jedno zdanie.
 */

const ICONS: Record<string, LucideIcon> = {
  klawiatura: Keyboard,
  monitor: Monitor,
  mysz: MousePointer2,
  pendrive: Usb,
  gladzik: Touchpad,
  glosniki: Volume2,
  dotykowy: TabletSmartphone,
  sluchawki: Headphones,
  mikrofon: Mic,
  headset: Headset,
  kamerka: Camera,
  drukarka: Printer,
  wielofunkcyjne: Copy,
  kontroler: Gamepad2,
  skaner: ScanLine,
  router: Router,
};

interface DeskWiringProps {
  color: string;
  onComplete?: () => void;
}

type Wiring = Record<string, Side[]>;
interface Point {
  x: number;
  y: number;
}

export function DeskWiring({ color, onComplete }: DeskWiringProps) {
  const [picked, setPicked] = useState<string[]>([]);
  const [wiring, setWiring] = useState<Wiring>({});
  const [checked, setChecked] = useState(false);
  const [held, setHeld] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const enough = picked.length >= MIN_DEVICES;
  const verdicts = picked.map((id) => ({ id, verdict: judge(deviceById(id), wiring[id] ?? []) }));
  const okCount = verdicts.filter((row) => row.verdict.ok).length;
  const allOk = picked.length > 0 && okCount === picked.length;

  const toggle = (id: string) => {
    setPicked((prev) => {
      if (prev.includes(id)) return prev.filter((item) => item !== id);
      if (prev.length >= MAX_DEVICES) return prev;
      return [...prev, id];
    });
    setWiring((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setHeld(null);
    setDone(false);
  };

  const plug = useCallback((id: string, side: Side) => {
    setWiring((prev) => {
      const current = prev[id] ?? [];
      if (current.includes(side)) return prev;
      return { ...prev, [id]: [...current, side] };
    });
    setHeld(null);
  }, []);

  const unplug = (id: string, side: Side) => {
    setWiring((prev) => ({ ...prev, [id]: (prev[id] ?? []).filter((item) => item !== side) }));
    setDone(false);
  };

  const check = () => {
    setChecked(true);
    if (allOk && !done) {
      setDone(true);
      onComplete?.();
    }
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="text-sm leading-relaxed sm:text-base">
        <p>
          <strong>Zadanie.</strong> Zbierz swój własny zestaw komputerowy i{' '}
          <strong>podłącz każde urządzenie tam, gdzie płynie przez nie informacja</strong> — do
          wejść albo do wyjść jednostki centralnej.
        </p>
        <p className="mt-2 text-muted-foreground">
          Wszystko dzieje się tutaj, niczego nie zapisujesz. Sprawdzę każdy kabel z osobna i przy
          każdym powiem, dlaczego stoi dobrze albo dlaczego nie.
        </p>
      </div>

      {/* 01 — półka */}
      <Step
        n="01"
        title="Zbierz to, czego naprawdę używasz"
        color={color}
        aside={`${picked.length}/${MAX_DEVICES}`}
      >
        <p className="mb-3 text-sm text-muted-foreground">
          Bierz tylko sprzęt, który masz — również ten wbudowany w laptop. Potrzebne są co najmniej{' '}
          <strong className="text-foreground">{MIN_DEVICES}</strong> urządzenia. Uważaj na te
          podobne: <strong className="text-foreground">słuchawki</strong> to nie to samo co{' '}
          <strong className="text-foreground">słuchawki z mikrofonem</strong>.
        </p>
        <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
          {DEVICES.map((device) => {
            const on = picked.includes(device.id);
            const Icon = ICONS[device.id];
            const full = !on && picked.length >= MAX_DEVICES;
            return (
              <li key={device.id}>
                <button
                  type="button"
                  onClick={() => toggle(device.id)}
                  aria-pressed={on}
                  disabled={full}
                  className={cn(
                    'flex h-full w-full cursor-pointer items-start gap-2 border p-2 text-left transition-colors',
                    !on && !full && 'hover:bg-muted/50',
                    full && 'cursor-not-allowed opacity-40'
                  )}
                  style={on ? { borderColor: color, backgroundColor: `${color}12` } : undefined}
                >
                  <Icon
                    className="mt-0.5 h-4 w-4 shrink-0"
                    style={{ color: on ? color : 'var(--muted-foreground)' }}
                    aria-hidden
                  />
                  <span className="min-w-0 text-xs leading-snug">
                    <span className={cn('block', on && 'font-semibold')}>{device.name}</span>
                    <span className="block text-[11px] text-muted-foreground">{device.what}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
        {!enough && picked.length > 0 && (
          <p className="mt-3 text-sm text-muted-foreground">
            Jeszcze {count(MIN_DEVICES - picked.length, 'urządzenie', 'urządzenia', 'urządzeń')}.
          </p>
        )}
      </Step>

      {/* 02 — kable */}
      {enough && (
        <Step
          n="02"
          title="Wepnij kable"
          color={color}
          aside={checked ? `${okCount}/${picked.length}` : undefined}
        >
          <Board
            color={color}
            picked={picked}
            wiring={wiring}
            held={held}
            setHeld={setHeld}
            onPlug={plug}
            onUnplug={unplug}
          />

          <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
            Prawdziwe gniazda z tyłu komputera tak się <strong>nie</strong> dzielą — do tego samego
            portu USB wepniesz i mysz, i drukarkę. Tutaj gniazda są podpisane{' '}
            <strong>kierunkiem informacji</strong>, bo właśnie o nim jest ta lekcja.
          </p>

          {!done && (
            <div className="mt-4 flex flex-wrap items-center gap-3">
              <button
                type="button"
                onClick={check}
                className="inline-flex cursor-pointer items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: color }}
              >
                <Plug className="h-4 w-4 shrink-0" aria-hidden />
                Sprawdź podłączenia
              </button>
              {checked && !allOk && (
                <span className="text-xs text-muted-foreground">
                  Poprawki są darmowe — liczy się ostatnia próba.
                </span>
              )}
            </div>
          )}

          {checked && (
            <ul className="mt-4 divide-y border">
              {verdicts.map(({ id, verdict }) => {
                const device = deviceById(id);
                const Icon = ICONS[id];
                return (
                  <li key={id} className="flex items-start gap-2.5 p-2.5">
                    <span
                      className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
                      style={{ backgroundColor: verdict.ok ? color : '#d4643a' }}
                      aria-hidden
                    >
                      {verdict.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" />}
                    </span>
                    <span className="min-w-0 flex-1 text-sm leading-snug">
                      <span className="flex items-center gap-1.5 font-medium">
                        <Icon className="h-3.5 w-3.5 shrink-0 text-muted-foreground" aria-hidden />
                        {device.name}
                      </span>
                      <span className="mt-0.5 block text-xs leading-relaxed text-muted-foreground">
                        {verdict.note}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Step>
      )}

      <AnimatePresence>
        {done && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 border-t-2 pt-5"
            style={{ borderColor: color }}
          >
            <Reward color={color} picked={picked} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Kroki                                                               */
/* ------------------------------------------------------------------ */

function Step({
  n,
  title,
  color,
  aside,
  children,
}: {
  n: string;
  title: string;
  color: string;
  aside?: string;
  children: ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-6 border-t pt-4"
    >
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <p className="flex items-baseline gap-2.5">
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {n}
          </span>
          <span className="font-bold">{title}</span>
        </p>
        {aside && (
          <span className="font-mono text-sm font-bold tabular-nums" style={{ color }}>
            {aside}
          </span>
        )}
      </div>
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Plansza z kablami                                                   */
/* ------------------------------------------------------------------ */

const SIDES: { id: Side; label: string; about: string }[] = [
  { id: 'in', label: 'Wejścia', about: 'tędy informacja WCHODZI do komputera' },
  { id: 'out', label: 'Wyjścia', about: 'tędy komputer coś ODDAJE tobie' },
];

function Board({
  color,
  picked,
  wiring,
  held,
  setHeld,
  onPlug,
  onUnplug,
}: {
  color: string;
  picked: string[];
  wiring: Wiring;
  held: string | null;
  setHeld: (id: string | null) => void;
  onPlug: (id: string, side: Side) => void;
  onUnplug: (id: string, side: Side) => void;
}) {
  const board = useRef<HTMLDivElement | null>(null);
  const plugs = useRef<Record<string, HTMLElement | null>>({});
  const holes = useRef<Record<string, HTMLElement | null>>({});
  const sockets = useRef<Record<Side, HTMLElement | null>>({ in: null, out: null });

  const [geom, setGeom] = useState<{ plugs: Record<string, Point>; holes: Record<string, Point> }>({
    plugs: {},
    holes: {},
  });
  const [drag, setDrag] = useState<{ id: string; point: Point } | null>(null);
  const dragRef = useRef<{ id: string; from: Point; moved: boolean } | null>(null);

  /** Punkt na planszy: mierzymy w układzie kontenera, bo w nim rysujemy kable. */
  const toBoard = useCallback((clientX: number, clientY: number): Point => {
    const rect = board.current?.getBoundingClientRect();
    return { x: clientX - (rect?.left ?? 0), y: clientY - (rect?.top ?? 0) };
  }, []);

  /* Położenia wtyczek i gniazd liczymy po każdym renderze układu — i po każdej
     zmianie szerokości, bo kable są rysowane w pikselach, a układ jest płynny. */
  const measure = useCallback(() => {
    const rect = board.current?.getBoundingClientRect();
    if (!rect) return;
    const at = (node: HTMLElement | null, edge: 'right' | 'left'): Point | null => {
      if (!node) return null;
      const box = node.getBoundingClientRect();
      return {
        x: (edge === 'right' ? box.right : box.left) - rect.left,
        y: box.top + box.height / 2 - rect.top,
      };
    };
    const nextPlugs: Record<string, Point> = {};
    for (const [id, node] of Object.entries(plugs.current)) {
      const point = at(node, 'right');
      if (point) nextPlugs[id] = point;
    }
    const nextHoles: Record<string, Point> = {};
    for (const [key, node] of Object.entries(holes.current)) {
      const point = at(node, 'left');
      if (point) nextHoles[key] = point;
    }
    setGeom({ plugs: nextPlugs, holes: nextHoles });
  }, []);

  useLayoutEffect(measure, [measure, picked, wiring]);

  useEffect(() => {
    if (!board.current || typeof ResizeObserver === 'undefined') return;
    const observer = new ResizeObserver(measure);
    observer.observe(board.current);
    return () => observer.disconnect();
  }, [measure]);

  /** Gniazdo pod punktem, w którym dziecko puściło wtyczkę. */
  const socketAt = (clientX: number, clientY: number): Side | null => {
    for (const side of ['in', 'out'] as Side[]) {
      const box = sockets.current[side]?.getBoundingClientRect();
      if (box && clientX >= box.left && clientX <= box.right && clientY >= box.top && clientY <= box.bottom) {
        return side;
      }
    }
    return null;
  };

  const startDrag = (event: ReactPointerEvent<HTMLButtonElement>, id: string) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = { id, from: { x: event.clientX, y: event.clientY }, moved: false };
    setDrag({ id, point: toBoard(event.clientX, event.clientY) });
  };

  const moveDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    if (!current) return;
    const far =
      Math.abs(event.clientX - current.from.x) > 6 || Math.abs(event.clientY - current.from.y) > 6;
    if (far) current.moved = true;
    setDrag({ id: current.id, point: toBoard(event.clientX, event.clientY) });
  };

  const endDrag = (event: ReactPointerEvent<HTMLButtonElement>) => {
    const current = dragRef.current;
    dragRef.current = null;
    setDrag(null);
    if (!current) return;
    if (!current.moved) {
      /* Samo stuknięcie: wtyczka zostaje w ręce, gniazdo wskazuje się drugim stuknięciem. */
      setHeld(held === current.id ? null : current.id);
      return;
    }
    const side = socketAt(event.clientX, event.clientY);
    if (side) onPlug(current.id, side);
  };

  const cables: { key: string; from: Point; to: Point }[] = [];
  for (const id of picked) {
    for (const side of wiring[id] ?? []) {
      const from = geom.plugs[id];
      const to = geom.holes[`${side}:${id}`];
      if (from && to) cables.push({ key: `${side}:${id}`, from, to });
    }
  }

  return (
    <div>
      <p className="mb-3 text-sm text-muted-foreground">
        <strong className="text-foreground">Przeciągnij wtyczkę do gniazda</strong> — albo stuknij
        ją, a potem stuknij gniazdo. Wpięty kabel zdejmiesz stuknięciem w jego wtyk po prawej.
      </p>

      <div
        ref={board}
        className={cn(
          'relative mx-auto grid max-w-[640px] grid-cols-[minmax(0,1fr)_112px] gap-3 sm:grid-cols-[minmax(0,1fr)_168px] sm:gap-6',
          drag && 'select-none'
        )}
      >
        {/* Kable */}
        <svg className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
          {cables.map((cable) => (
            <path
              key={cable.key}
              d={curve(cable.from, cable.to)}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeLinecap="round"
              opacity={0.75}
            />
          ))}
          {drag && geom.plugs[drag.id] && (
            <path
              d={curve(geom.plugs[drag.id], drag.point)}
              fill="none"
              stroke={color}
              strokeWidth={2.5}
              strokeDasharray="5 4"
              strokeLinecap="round"
            />
          )}
        </svg>

        {/* Biurko */}
        <ul className="relative z-10 flex flex-col gap-2">
          {picked.map((id) => {
            const device = deviceById(id);
            const Icon = ICONS[id];
            const wired = wiring[id] ?? [];
            const inHand = held === id;
            return (
              <li
                key={id}
                className="flex items-center gap-2 border bg-white p-2 dark:bg-zinc-900"
                style={{ borderColor: wired.length > 0 ? `${color}66` : undefined }}
              >
                <Icon className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                <span className="min-w-0 flex-1 truncate text-xs font-medium sm:text-sm">
                  {device.name}
                </span>
                <button
                  type="button"
                  ref={(node) => {
                    plugs.current[id] = node;
                  }}
                  onPointerDown={(event) => startDrag(event, id)}
                  onPointerMove={moveDrag}
                  onPointerUp={endDrag}
                  onPointerCancel={() => {
                    dragRef.current = null;
                    setDrag(null);
                  }}
                  aria-label={`Wtyczka: ${device.name}`}
                  aria-pressed={inHand}
                  className={cn(
                    'flex shrink-0 cursor-grab touch-none items-center gap-1 border-2 px-1.5 py-1 active:cursor-grabbing',
                    inHand ? 'font-semibold' : 'hover:bg-muted/50'
                  )}
                  style={{
                    borderColor: inHand ? color : 'var(--border)',
                    backgroundColor: inHand ? `${color}14` : undefined,
                  }}
                >
                  <Plug className="h-3.5 w-3.5" style={{ color }} aria-hidden />
                  <span className="text-[10px] tabular-nums" style={{ color }}>
                    {wired.length > 0 ? wired.length : ''}
                  </span>
                </button>
              </li>
            );
          })}
        </ul>

        {/* Jednostka centralna */}
        <div className="relative z-10 flex flex-col gap-2 border-2 p-1.5" style={{ borderColor: color }}>
          <p
            className="flex flex-col items-center gap-0.5 py-1 text-center text-[10px] font-bold leading-tight"
            style={{ color }}
          >
            <Cpu className="h-4 w-4" aria-hidden />
            JEDNOSTKA
            <br />
            CENTRALNA
          </p>
          {SIDES.map((side) => {
            const plugged = picked.filter((id) => (wiring[id] ?? []).includes(side.id));
            return (
              <div
                key={side.id}
                ref={(node) => {
                  sockets.current[side.id] = node;
                }}
                onClick={() => {
                  if (held) onPlug(held, side.id);
                }}
                className={cn(
                  'flex flex-1 flex-col border-2 p-1.5 text-left transition-colors',
                  held && 'cursor-pointer'
                )}
                style={{
                  borderColor: held ? color : `${color}44`,
                  backgroundColor: held ? `${color}1a` : `${color}0d`,
                }}
              >
                <span className="text-[10px] font-bold uppercase tracking-wide" style={{ color }}>
                  {side.label}
                </span>
                <span className="mb-1 text-[9px] leading-tight text-muted-foreground">
                  {side.about}
                </span>
                <div className="flex flex-col gap-1">
                  {held && (
                    <button
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onPlug(held, side.id);
                      }}
                      className="cursor-pointer border border-dashed p-1 text-center text-[9px] font-semibold leading-tight"
                      style={{ borderColor: color, color }}
                    >
                      wepnij tutaj
                    </button>
                  )}
                  {plugged.length === 0 && !held && (
                    <span className="border border-dashed p-1 text-center text-[9px] leading-tight text-muted-foreground">
                      puste gniazda
                    </span>
                  )}
                  {plugged.map((id) => (
                    <button
                      key={id}
                      type="button"
                      ref={(node) => {
                        holes.current[`${side.id}:${id}`] = node;
                      }}
                      onClick={(event) => {
                        event.stopPropagation();
                        onUnplug(id, side.id);
                      }}
                      title={`Wyjmij kabel: ${deviceById(id).name}`}
                      aria-label={`Wyjmij kabel: ${deviceById(id).name}`}
                      className="flex cursor-pointer items-center gap-1 border bg-white px-1 py-0.5 text-left text-[9px] leading-tight dark:bg-zinc-900"
                      style={{ borderColor: `${color}66` }}
                    >
                      <span className="h-1.5 w-1.5 shrink-0" style={{ backgroundColor: color }} />
                      <span className="min-w-0 flex-1 truncate">{deviceById(id).name}</span>
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

/** Kabel: łagodny łuk, żeby dwa biegnące do jednego gniazda dało się rozróżnić. */
function curve(from: Point, to: Point): string {
  const bend = Math.max(24, Math.abs(to.x - from.x) * 0.45);
  return `M ${from.x} ${from.y} C ${from.x + bend} ${from.y}, ${to.x - bend} ${to.y}, ${to.x} ${to.y}`;
}

/* ------------------------------------------------------------------ */
/* Nagroda                                                             */
/* ------------------------------------------------------------------ */

function Reward({ color, picked }: { color: string; picked: string[] }) {
  const both = picked.filter((id) => deviceById(id).flow === 'both');
  const cables = picked.reduce((sum, id) => sum + needed(deviceById(id).flow).length, 0);

  return (
    <div className="text-sm leading-relaxed">
      <p className="text-base font-bold">Zestaw podłączony.</p>
      <p className="mt-2">
        Twój zestaw to {count(picked.length, 'urządzenie', 'urządzenia', 'urządzeń')} i{' '}
        <strong>{count(cables, 'kabel', 'kable', 'kabli')}</strong> — każdy wpięty tam, gdzie
        naprawdę płynie informacja. Wszystkie schodzą się w jednym miejscu: w jednostce centralnej,
        przez którą przechodzi wszystko, co robisz.
      </p>

      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {(['in', 'out'] as Side[]).map((side) => (
          <div key={side} className="border p-2.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
              po stronie {SIDE_LABEL[side]}
            </p>
            <p className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
              {countSide(picked, side)}
            </p>
          </div>
        ))}
        <div className="border p-2.5">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">
            w obie strony
          </p>
          <p className="font-mono text-2xl font-bold tabular-nums" style={{ color }}>
            {both.length}
          </p>
        </div>
      </div>

      <p className="mt-3">
        {both.length > 0 ? (
          <>
            Dodaj te liczby, a wyjdzie więcej, niż masz urządzeń — i tak ma być.{' '}
            <strong>{both.map((id) => deviceById(id).name).join(', ')}</strong>:{' '}
            {both.length === 1 ? 'to urządzenie stoi' : 'te urządzenia stoją'} po obu stronach
            naraz, bo informacja idzie przez nie w jedną i w drugą stronę.
          </>
        ) : (
          <>
            W twoim zestawie każde urządzenie ma jeden kierunek — ale gdybyś dołożył/dołożyła
            pendrive’a albo ekran dotykowy, jedna wtyczka by nie wystarczyła.
          </>
        )}
      </p>
    </div>
  );
}
