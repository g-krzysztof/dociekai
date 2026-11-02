'use client';

import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { Check, Eraser, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KettleIcon } from './kettle-icon';
import { KETTLE_WH, clock, formatKettles, formatW, formatWh, num, r2 } from './energy';
import {
  BASELINE_WH,
  SLOTS,
  SLOT_MIN,
  SOCKETS,
  TARGET_WH,
  freshTimers,
  isNeeded,
  judgeTimers,
  powered,
  totalWaste,
  wasteOf,
  type Criterion,
  type Socket,
  type SocketId,
  type TimerState,
  type Timers,
} from './timer-judge';

/**
 * Blok 5 — zadanie praktyczne, **w całości wykonywane tutaj**: ustaw
 * programatory czasowe w czterech gniazdkach domu z bloku 3.
 *
 * W bloku 3 dziecko wyłączało czuwanie ręką, na jedną noc. Ale ręką trzeba
 * pamiętać co wieczór — a **programator czasowy** (prawdziwe urządzenie za
 * kilkanaście złotych, wkładane między gniazdko a wtyczkę) pamięta sam. Ma
 * tarczę doby z bolcami: wciśnięty bolec znaczy „w tej pół godzinie płynie
 * prąd”. Gest jest nowy w kursie — **wciskanie bolców przeciągnięciem po
 * pierścieniu doby** — i jest dokładnie tym, co robi się palcem przy prawdziwym
 * programatorze.
 *
 * To jest zarazem most do informatyki: zasadę „prąd tylko wtedy, kiedy ktoś
 * z niego korzysta” dziecko **zapisuje jako program**, który wykona się jutro,
 * pojutrze i za rok bez przypominania.
 *
 * Zadanie ma trzy pułapki, każdą z innego powodu:
 *
 * - **lodówka** — zapał z bloku 3 każe wyłączyć wszystko w nocy, a lodówka nie
 *   czuwa, tylko pracuje;
 * - **nagrywanie meczu** — stoi tylko w planie dnia, na tarczy go nie widać; trzeba
 *   przeczytać zlecenie, a nie przerysować łuki;
 * - **północ** — nagrywanie przechodzi przez 0:00, więc bolce trzeba wcisnąć
 *   po obu stronach szczytu tarczy.
 *
 * Konsekwencja przed oceną: licznik zmarnowanego prądu (w czajnikach, miarce
 * z bloku 2) przelicza się przy każdym bolcu, a bolce, które dają prąd, kiedy
 * nikt nie korzysta, świecą na pomarańczowo.
 */

const PENDING = judgeTimers(freshTimers());
const WASTE_TONE = '#f59e0b';

export function TimerStudio({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [timers, setTimers] = useState<Timers>(freshTimers);
  const [active, setActive] = useState<SocketId>('salon');
  const [verdicts, setVerdicts] = useState<Criterion[] | null>(null);
  const reported = useRef(false);

  const accepted = verdicts !== null && verdicts.every((verdict) => verdict.ok);
  const waste = totalWaste(timers);
  const socket = SOCKETS.find((item) => item.id === active)!;

  useEffect(() => {
    if (accepted && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [accepted, onComplete]);

  const update = (id: SocketId, change: (state: TimerState) => TimerState) => {
    if (accepted) return;
    setVerdicts(null);
    setTimers((current) => ({ ...current, [id]: change(current[id]) }));
  };

  return (
    <div className="border bg-white dark:bg-zinc-900/80">
      <Stage number="01" label="Zlecenie" color={color}>
        <div className="space-y-2 text-sm leading-relaxed sm:text-base">
          <p>
            To ten sam dom, który przeszukiwałeś/przeszukiwałaś latarką. Wyłączanie wszystkiego ręką trzeba pamiętać
            co wieczór — a <strong>programator czasowy</strong> pamięta sam. Wkłada się go między gniazdko a wtyczkę.
            Ma tarczę doby z bolcami: <strong>wciśnięty bolec znaczy „w tej pół godzinie płynie prąd”</strong>, a
            niewciśnięty — „nie płynie”.
          </p>
          <p>
            Ustaw programatory w czterech gniazdkach tak, żeby rodzina miała prąd zawsze wtedy, kiedy go potrzebuje — i
            ani chwili dłużej. Przeczytaj plan dnia przy każdym gniazdku: nie wszystko, co trzeba, jest narysowane na
            tarczy.
          </p>
        </div>
        {!accepted && (
          <div className="mt-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Co sprawdzę, kiedy oddasz programatory
            </p>
            <CriteriaList criteria={PENDING} color={color} showResult={false} />
          </div>
        )}
      </Stage>

      <Stage number="02" label="Warsztat — cztery gniazdka" color={color}>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4" role="tablist">
          {SOCKETS.map((item) => {
            const itemWaste = wasteOf(item, timers[item.id]);
            const isActive = item.id === active;
            return (
              <button
                key={item.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActive(item.id)}
                className={cn(
                  'flex cursor-pointer items-center gap-2 border px-2.5 py-2 text-left transition-colors hover:bg-muted/60',
                  isActive && 'border-2'
                )}
                style={isActive ? { borderColor: color } : undefined}
              >
                <MiniRing socket={item} state={timers[item.id]} color={color} size={30} />
                <span className="min-w-0">
                  <span className="block text-sm font-semibold leading-tight">{item.name}</span>
                  <span className={cn('block text-[11px] tabular-nums', itemWaste > 0 ? 'text-amber-700' : 'text-muted-foreground')}>
                    {item.standby === 0 ? item.devices : `na darmo: ${formatWh(itemWaste)}`}
                  </span>
                </span>
              </button>
            );
          })}
        </div>

        {/* Na telefonie: plan dnia → przełącznik → tarcza → licznik. Przełącznik stoi tuż nad tarczą, na którą działa. */}
        <div className="mt-4 flex flex-col gap-4 lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-x-6 lg:gap-y-4">
          <div className="lg:col-start-2 lg:row-start-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{socket.name} — plan dnia</p>
            <ul className="mt-1.5 space-y-1 text-sm leading-relaxed">
              {socket.notes.map((note) => (
                <li key={note} className="border-l-2 pl-2" style={{ borderColor: `${color}66` }}>
                  {note}
                </li>
              ))}
            </ul>
            <p className="mt-2 text-xs text-muted-foreground">
              W gniazdku: {socket.devices}.{' '}
              {socket.standby > 0
                ? `Kiedy nikt z nich nie korzysta, czuwają i biorą razem ${formatW(socket.standby)}.`
                : 'Lodówka nie czuwa — kiedy ma prąd, to chłodzi.'}
            </p>
          </div>

          <div className="lg:col-start-1 lg:row-span-2 lg:row-start-1">
            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex border">
                {(['always', 'timer'] as const).map((mode) => (
                  <button
                    key={mode}
                    type="button"
                    onClick={() => update(socket.id, (state) => ({ ...state, mode }))}
                    aria-pressed={timers[socket.id].mode === mode}
                    className={cn(
                      'cursor-pointer px-3 py-1.5 text-sm transition-colors',
                      timers[socket.id].mode === mode ? 'font-semibold text-white' : 'hover:bg-muted'
                    )}
                    style={timers[socket.id].mode === mode ? { backgroundColor: color } : undefined}
                  >
                    {mode === 'always' ? 'Prąd cały czas' : 'Według bolców'}
                  </button>
                ))}
              </div>
              {timers[socket.id].mode === 'timer' && (
                <SmallButton onClick={() => update(socket.id, (state) => ({ ...state, pins: Array(SLOTS).fill(false) }))}>
                  <Eraser className="h-3.5 w-3.5" aria-hidden />
                  Wyciągnij bolce
                </SmallButton>
              )}
            </div>
            <p className="mb-2 mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {timers[socket.id].mode === 'always'
                ? 'Tak jest dziś: prąd płynie całą dobę, bolce nic nie zmieniają. Przełącz na „Według bolców”, żeby tarcza zaczęła rządzić.'
                : 'Przeciągnij palcem albo myszą po pierścieniu bolców. Zaczniesz od wciśniętego — będziesz wyciągać; od wyciągniętego — wciskać.'}
            </p>
            <TimerRing
              key={socket.id}
              socket={socket}
              state={timers[socket.id]}
              color={color}
              locked={accepted}
              onPins={(pins) => update(socket.id, (state) => ({ ...state, pins }))}
            />
            <WasteMeter waste={waste} color={color} />
          </div>

          <div className="lg:col-start-2 lg:row-start-2">
            <Legend color={color} />
          </div>
        </div>
      </Stage>

      <Stage number="03" label="Odbiór" color={color} last>
        {accepted ? (
          <Reward timers={timers} color={color} />
        ) : (
          <>
            <p className="text-sm leading-relaxed">
              Kiedy wszystkie cztery programatory będą gotowe, oddaj je. <strong>Poprawki są za darmo</strong> — liczy się
              ostatnie ustawienie.
            </p>
            <button
              type="button"
              onClick={() => setVerdicts(judgeTimers(timers))}
              className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted"
              style={{ borderColor: color, color }}
            >
              Oddaj programatory
            </button>
            {verdicts && (
              <div className="mt-4">
                <CriteriaList criteria={verdicts} color={color} showResult />
              </div>
            )}
          </>
        )}
      </Stage>
    </div>
  );
}

/** Wycinek pierścienia — jeden bolec. Kąt 0 to północ, na górze tarczy, i idziemy zgodnie ze wskazówkami zegara. */
function sector(cx: number, cy: number, rIn: number, rOut: number, slot: number, gap = 0.012) {
  const step = (2 * Math.PI) / SLOTS;
  const a0 = slot * step - Math.PI / 2 + gap;
  const a1 = (slot + 1) * step - Math.PI / 2 - gap;
  const p = (r: number, a: number) => `${r2(cx + Math.cos(a) * r)} ${r2(cy + Math.sin(a) * r)}`;
  return `M ${p(rOut, a0)} A ${rOut} ${rOut} 0 0 1 ${p(rOut, a1)} L ${p(rIn, a1)} A ${rIn} ${rIn} 0 0 0 ${p(rIn, a0)} Z`;
}

function arcPath(cx: number, cy: number, r: number, fromMin: number, toMin: number) {
  const a0 = (fromMin / 1440) * 2 * Math.PI - Math.PI / 2;
  const a1 = (Math.min(toMin, fromMin + 1439.9) / 1440) * 2 * Math.PI - Math.PI / 2;
  const large = toMin - fromMin > 720 ? 1 : 0;
  const p = (a: number) => `${r2(cx + Math.cos(a) * r)} ${r2(cy + Math.sin(a) * r)}`;
  return `M ${p(a0)} A ${r} ${r} 0 ${large} 1 ${p(a1)}`;
}

function pinTone(socket: Socket, state: TimerState, slot: number, color: string) {
  if (!powered(state, slot)) return { fill: '#f4f4f5', stroke: '#d4d4d8' };
  if (isNeeded(socket.id, slot) || socket.standby === 0) return { fill: color, stroke: color };
  return { fill: WASTE_TONE, stroke: WASTE_TONE };
}

function TimerRing({
  socket,
  state,
  color,
  locked,
  onPins,
}: {
  socket: Socket;
  state: TimerState;
  color: string;
  locked: boolean;
  onPins: (pins: boolean[]) => void;
}) {
  const svgRef = useRef<SVGSVGElement>(null);
  const paint = useRef<{ value: boolean; last: number; pins: boolean[] } | null>(null);
  const editable = state.mode === 'timer' && !locked;

  const slotAt = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    const dx = point.x - 160;
    const dy = point.y - 160;
    const dist = Math.hypot(dx, dy);
    if (dist < 84 || dist > 158) return null;
    const angle = (Math.atan2(dy, dx) + Math.PI / 2 + 2 * Math.PI) % (2 * Math.PI);
    return Math.floor(angle / ((2 * Math.PI) / SLOTS)) % SLOTS;
  };

  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    if (!editable) return;
    const slot = slotAt(event);
    if (slot === null) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const pins = [...state.pins];
    const value = !pins[slot];
    pins[slot] = value;
    paint.current = { value, last: slot, pins };
    onPins(pins);
  };

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    const current = paint.current;
    if (!current) return;
    const slot = slotAt(event);
    if (slot === null || slot === current.last) return;
    // Szybki ruch przeskakuje bolce — dopełniamy krótszą drogą po kole.
    const forward = (slot - current.last + SLOTS) % SLOTS;
    const direction = forward <= SLOTS / 2 ? 1 : -1;
    const steps = direction === 1 ? forward : SLOTS - forward;
    for (let k = 1; k <= steps; k += 1) {
      current.pins[(current.last + direction * k + SLOTS) % SLOTS] = current.value;
    }
    current.last = slot;
    onPins([...current.pins]);
  };

  const onUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    paint.current = null;
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 320 320"
      className={cn('mx-auto block w-full max-w-[320px] select-none', editable ? 'cursor-pointer' : 'cursor-default')}
      style={{ touchAction: editable ? 'none' : 'auto' }}
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerCancel={onUp}
      role="img"
      aria-label={`Programator: ${socket.name}. ${
        state.mode === 'always'
          ? 'Prąd płynie cały czas.'
          : `Wciśnięte bolce: ${state.pins.filter(Boolean).length} z ${SLOTS}.`
      }`}
    >
      <circle cx={160} cy={160} r={156} fill="#fafaf9" stroke="#d4d4d8" />
      {Array.from({ length: SLOTS }, (_, slot) => {
        const tone = pinTone(socket, state, slot, color);
        const pushed = powered(state, slot);
        return (
          <path
            key={slot}
            d={sector(160, 160, pushed ? 106 : 112, pushed ? 128 : 134, slot)}
            fill={tone.fill}
            stroke={tone.stroke}
            strokeWidth={1}
            opacity={state.mode === 'always' ? 0.55 : 1}
          />
        );
      })}

      {/* Wewnętrzny łuk: kiedy ktoś korzysta z tego gniazdka (nagrywania meczu tu nie ma). */}
      <circle cx={160} cy={160} r={94} fill="none" stroke="#f4f4f5" strokeWidth={8} />
      {socket.events.map((event) => (
        <path
          key={event.label}
          d={arcPath(160, 160, 94, event.from, event.to)}
          fill="none"
          stroke={color}
          strokeOpacity={0.35}
          strokeWidth={8}
        />
      ))}

      {Array.from({ length: 24 }, (_, h) => {
        const angle = (h / 24) * 2 * Math.PI - Math.PI / 2;
        const major = h % 3 === 0;
        const x1 = r2(160 + Math.cos(angle) * 139);
        const y1 = r2(160 + Math.sin(angle) * 139);
        const x2 = r2(160 + Math.cos(angle) * (major ? 146 : 143));
        const y2 = r2(160 + Math.sin(angle) * (major ? 146 : 143));
        return (
          <g key={h}>
            <line x1={x1} y1={y1} x2={x2} y2={y2} stroke="#a1a1aa" strokeWidth={major ? 2 : 1} />
            {major && (
              <text
                x={r2(160 + Math.cos(angle) * 72)}
                y={r2(160 + Math.sin(angle) * 72) + 4}
                textAnchor="middle"
                fontSize={12}
                fontWeight={h === 0 ? 800 : 600}
                fill="#52525b"
              >
                {h}
              </text>
            )}
          </g>
        );
      })}

      <text x={160} y={150} textAnchor="middle" fontSize={15} fontWeight={800} fill="#27272a">
        {socket.name}
      </text>
      <text x={160} y={170} textAnchor="middle" fontSize={11} fill="#71717a">
        {state.mode === 'always' ? 'prąd cały czas' : 'według bolców'}
      </text>
      <text x={160} y={186} textAnchor="middle" fontSize={11} fill="#71717a">
        {socket.standby > 0 ? `czuwanie: ${formatW(socket.standby)}` : 'lodówka'}
      </text>
    </svg>
  );
}

/** Mała tarcza do zakładek i nagrody — ten sam rysunek bolców w skali ikony. */
function MiniRing({ socket, state, color, size }: { socket: Socket; state: TimerState; color: string; size: number }) {
  return (
    <svg viewBox="0 0 40 40" width={size} height={size} className="shrink-0" aria-hidden>
      {Array.from({ length: SLOTS }, (_, slot) => {
        const tone = pinTone(socket, state, slot, color);
        return <path key={slot} d={sector(20, 20, 12, 19, slot, 0.02)} fill={tone.fill} />;
      })}
    </svg>
  );
}

/** Zmarnowany prąd całego domu w czajnikach — przeliczany przy każdym bolcu. */
function WasteMeter({ waste, color }: { waste: number; color: string }) {
  const count = Math.ceil(BASELINE_WH / KETTLE_WH);
  const ok = waste <= TARGET_WH;
  return (
    <div className="mt-3 border p-3">
      <p className="flex flex-wrap items-baseline justify-between gap-x-3 text-sm">
        <span>
          Prąd na czuwanie w ciągu doby: <strong className={cn('tabular-nums', ok ? '' : 'text-amber-700')}>{formatWh(waste)}</strong>
        </span>
        <span className="text-xs text-muted-foreground">cel: najwyżej 1 czajnik</span>
      </p>
      <div className="mt-2 flex gap-1" aria-label={`${formatKettles(waste)} zmarnowanego prądu`}>
        {Array.from({ length: count }, (_, index) => {
          const fill = Math.max(0, Math.min(1, (waste - index * KETTLE_WH) / KETTLE_WH));
          return (
            <span key={index} className="relative h-7 w-7">
              <KettleIcon className="absolute inset-0 h-7 w-7 text-zinc-300" />
              <span className="absolute inset-0 overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <KettleIcon className="h-7 w-7" style={{ color: index === 0 && ok ? color : WASTE_TONE }} />
              </span>
            </span>
          );
        })}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">
        {formatKettles(waste)} · bez programatorów: {formatKettles(BASELINE_WH)}
      </p>
    </div>
  );
}

function Legend({ color }: { color: string }) {
  const items = [
    { fill: color, label: 'wciśnięty — prąd płynie, bo ktoś korzysta' },
    { fill: WASTE_TONE, label: 'wciśnięty — prąd płynie, a nikt nie korzysta' },
    { fill: '#f4f4f5', label: 'wyciągnięty — prądu nie ma', border: true },
    { fill: `${color}59`, label: 'łuk w środku: kiedy rodzina korzysta z gniazdka' },
  ];
  return (
    <ul className="space-y-1 text-xs text-muted-foreground">
      {items.map((item) => (
        <li key={item.label} className="flex items-center gap-2">
          <span className={cn('h-3 w-3 shrink-0', item.border && 'border')} style={{ backgroundColor: item.fill }} />
          {item.label}
        </li>
      ))}
    </ul>
  );
}

/**
 * Nagroda: ta sama doba puszczona dwa razy naraz — dom bez programatorów i dom
 * z programatorami dziecka — z dwoma licznikami, które rozjeżdżają się w oczach.
 */
function Reward({ timers, color }: { timers: Timers; color: string }) {
  const [t, setT] = useState(0);
  const mine = totalWaste(timers);
  const saved = BASELINE_WH - mine;

  useEffect(() => {
    let frame = 0;
    let start = 0;
    const tick = (now: number) => {
      if (!start) start = now;
      const value = Math.min(1440, ((now - start) / 7000) * 1440);
      setT(value);
      if (value < 1440) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const wasteUntil = (ts: Timers, until: number) =>
    SOCKETS.reduce((acc, socket) => {
      let wh = 0;
      for (let slot = 0; slot < SLOTS; slot += 1) {
        const from = slot * SLOT_MIN;
        if (from >= until) break;
        if (powered(ts[socket.id], slot) && !isNeeded(socket.id, slot)) {
          wh += (socket.standby * (Math.min(until, from + SLOT_MIN) - from)) / 60;
        }
      }
      return acc + wh;
    }, 0);

  const baseline = freshTimers();
  const rows = [
    { label: 'bez programatorów', value: wasteUntil(baseline, t), tone: WASTE_TONE },
    { label: 'z twoimi programatorami', value: wasteUntil(timers, t), tone: color },
  ];

  return (
    <div className="space-y-5">
      <p className="text-sm leading-relaxed sm:text-base">
        <strong>Przyjęte — wszystkie pięć punktów.</strong> Rodzina ma prąd na wiadomości, konsolę, film, lekcje,
        internet i nocny mecz, lodówka chłodzi bez przerwy, a czuwanie spadło z {formatKettles(BASELINE_WH)} do{' '}
        {formatKettles(mine)} na dobę.
      </p>

      <div className="border p-3 sm:p-4">
        <div className="flex items-baseline justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">ta sama doba, dwa domy</span>
          <span className="font-mono text-xl font-bold tabular-nums">{clock(t)}</span>
        </div>
        <div className="mt-3 space-y-2">
          {rows.map((row) => (
            <div key={row.label} className="grid grid-cols-[132px_minmax(0,1fr)_64px] items-center gap-2 text-xs sm:grid-cols-[170px_minmax(0,1fr)_70px]">
              <span>{row.label}</span>
              <span className="h-3 bg-muted">
                <span className="block h-full" style={{ width: `${(row.value / BASELINE_WH) * 100}%`, backgroundColor: row.tone }} />
              </span>
              <span className="text-right font-bold tabular-nums">{formatWh(row.value)}</span>
            </div>
          ))}
        </div>
        <div className="mt-4 flex flex-wrap gap-3">
          {SOCKETS.map((socket) => (
            <span key={socket.id} className="flex items-center gap-1.5 text-xs">
              <MiniRing socket={socket} state={timers[socket.id]} color={color} size={36} />
              {socket.name}
            </span>
          ))}
        </div>
      </div>

      <p className="text-sm leading-relaxed sm:text-base">
        Każdego dnia ten dom oszczędza {formatWh(saved)} — {formatKettles(saved)}. Przez rok to{' '}
        <strong>{num((saved * 365) / 1000, 0)} kWh</strong>, w naszej miarce: {formatKettles(saved * 365)}.
      </p>
      <p className="border-l-2 pl-3 text-sm leading-relaxed sm:text-base" style={{ borderColor: color }}>
        I jeszcze jedno: to, co właśnie zrobiłeś/zrobiłaś, jest <strong>programem</strong>. Zasadę „prąd tylko wtedy,
        kiedy ktoś z niego korzysta” zapisałeś/zapisałaś w bolcach — i programator wykona ją jutro, pojutrze i za rok,
        bez przypominania. Tak jak skrypt w Scratchu, tylko zamiast klocków są bolce.
      </p>
    </div>
  );
}

function SmallButton({ onClick, children }: { onClick: () => void; children: ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex cursor-pointer items-center gap-1.5 border px-2.5 py-1 text-xs transition-colors hover:bg-muted"
    >
      {children}
    </button>
  );
}

function CriteriaList({ criteria, color, showResult }: { criteria: Criterion[]; color: string; showResult: boolean }) {
  return (
    <ul className="mt-2 space-y-1.5">
      {criteria.map((criterion) => (
        <li key={criterion.id} className="flex items-start gap-2 text-sm leading-snug">
          <span
            className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center text-white"
            style={{ backgroundColor: showResult ? (criterion.ok ? color : '#a1a1aa') : '#d4d4d8' }}
            aria-hidden
          >
            {showResult ? criterion.ok ? <Check className="h-3 w-3" /> : <X className="h-3 w-3" /> : null}
          </span>
          <span>
            {criterion.label}
            {showResult && <span className="block text-xs text-muted-foreground">{criterion.detail}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}

/** Etap zadania — ta sama typografia numerów co w `ProofTask` i w studiach z poprzednich lekcji. */
function Stage({
  number,
  label,
  color,
  children,
  last,
}: {
  number: string;
  label: string;
  color: string;
  children: ReactNode;
  last?: boolean;
}) {
  return (
    <section className={cn('p-5 sm:p-6', !last && 'border-b')}>
      <div className="mb-3 flex items-baseline gap-3">
        <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
          {number}
        </span>
        <h3 className="text-base font-bold">{label}</h3>
      </div>
      {children}
    </section>
  );
}
