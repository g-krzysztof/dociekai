'use client';

import { useEffect, useId, useRef, useState, type PointerEvent } from 'react';
import { Flashlight, Power, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NIGHT_DEVICES,
  NIGHT_HOURS,
  ROOM_NAMES,
  formatKettles,
  formatW,
  formatWh,
  r2,
  type NightDevice,
} from './energy';

/**
 * Blok 3 — **dom po zmroku**, przeszukiwany latarką.
 *
 * Wszyscy śpią, wszystko jest „wyłączone” — a licznik prądu dalej się kręci.
 * Dziecko wodzi latarką (palcem albo myszą) po ciemnym mieszkaniu i szuka tego,
 * co bierze prąd, choć nikt z niczego nie korzysta. To nowy gest w kursie:
 * **szukanie światłem w ciemności**, w którym to, czego szukasz, jest z definicji
 * niewidoczne.
 *
 * Trzy rzeczy, na których blok stoi:
 *
 * - **Lampki kłamią.** Czerwona kropka telewizora, którą widać najlepiej, bierze
 *   pół wata. Dekoder ma maleńką zieloną kropkę i bierze dwanaście. Głośniki nie
 *   mają lampki wcale — i trzeba je znaleźć samym światłem.
 * - **Konsekwencja zamiast zakazu.** Lodówkę da się wyłączyć; licznik spada
 *   o 25 W, a blok pokazuje poranek: ciepłe mleko. Lodówka nie czuwa, tylko
 *   pracuje — to jest granica między oszczędzaniem a rezygnowaniem.
 * - **Czajnik jest w nocy niewinny.** Rekordzista z bloku 1 bierze 0 W. Moc to
 *   nie to samo co zużycie — to zdanie z bloku 2, zobaczone od drugiej strony.
 *
 * Blok zalicza się, gdy wszystko jest znalezione, całe czuwanie „na darmo” jest
 * wyłączone, a lodówka chłodzi. Router zostaje decyzją domu.
 */

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Led {
  x: number;
  y: number;
  fill: string;
  blink?: boolean;
}

/** Gdzie stoi urządzenie w kadrze i czym się zdradza w ciemności. */
const PLACES: Record<string, { parts: Rect[]; leds: Led[] }> = {
  lodowka: { parts: [{ x: 14, y: 168, w: 72, h: 232 }], leds: [] },
  mikrofalowka: { parts: [{ x: 98, y: 256, w: 62, h: 40 }], leds: [{ x: 152, y: 266, fill: '#4ade80' }] },
  czajnik: { parts: [{ x: 166, y: 266, w: 24, h: 30 }], leds: [] },
  router: {
    parts: [{ x: 214, y: 228, w: 56, h: 16 }],
    leds: [
      { x: 228, y: 236, fill: '#4ade80', blink: true },
      { x: 238, y: 236, fill: '#4ade80' },
      { x: 248, y: 236, fill: '#4ade80', blink: true },
    ],
  },
  telewizor: { parts: [{ x: 350, y: 220, w: 160, h: 96 }], leds: [{ x: 500, y: 311, fill: '#f87171' }] },
  soundbar: { parts: [{ x: 362, y: 322, w: 136, h: 8 }], leds: [] },
  dekoder: { parts: [{ x: 344, y: 348, w: 72, h: 16 }], leds: [{ x: 406, y: 356, fill: '#4ade80' }] },
  konsola: { parts: [{ x: 436, y: 344, w: 76, h: 22 }], leds: [{ x: 502, y: 355, fill: '#f8fafc' }] },
  monitor: { parts: [{ x: 624, y: 234, w: 72, h: 48 }], leds: [{ x: 689, y: 277, fill: '#fbbf24' }] },
  glosniki: {
    parts: [
      { x: 604, y: 260, w: 14, h: 40 },
      { x: 702, y: 260, w: 14, h: 40 },
    ],
    leds: [],
  },
  komputer: { parts: [{ x: 734, y: 300, w: 34, h: 100 }], leds: [{ x: 751, y: 314, fill: '#fb923c', blink: true }] },
  ladowarka: { parts: [{ x: 600, y: 362, w: 24, h: 38 }], leds: [] },
};

const W = 800;
const H = 440;
const LIGHT_R = 82;
/** Na dotyku latarka świeci nad palcem — inaczej palec zasłaniałby dokładnie to, co oświetla. */
const TOUCH_LIFT = 90;
/** Urządzenie jest znalezione, gdy środek plamy światła podejdzie do niego tak blisko. */
const FIND_DIST = 42;

const TOTAL_START = NIGHT_DEVICES.reduce((acc, device) => acc + device.watts, 0);
const WASTE = NIGHT_DEVICES.filter((device) => device.kind === 'waste');
const DEKODER_W = NIGHT_DEVICES.find((device) => device.id === 'dekoder')?.watts ?? 0;

function distToRect(px: number, py: number, rect: Rect) {
  const dx = Math.max(rect.x - px, 0, px - (rect.x + rect.w));
  const dy = Math.max(rect.y - py, 0, py - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}

const nearest = (px: number, py: number, limit: number) =>
  NIGHT_DEVICES.map((device) => ({
    device,
    dist: Math.min(...PLACES[device.id].parts.map((part) => distToRect(px, py, part))),
  }))
    .filter((item) => item.dist <= limit)
    .sort((a, b) => a.dist - b.dist);

export function NightHouse({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [light, setLight] = useState<{ x: number; y: number } | null>(null);
  const [found, setFound] = useState<string[]>([]);
  const [off, setOff] = useState<Record<string, boolean>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const pressed = useRef(false);
  const downAt = useRef<{ x: number; y: number } | null>(null);
  const reported = useRef(false);
  const uid = useId().replace(/[^a-zA-Z0-9]/g, '');

  const total = NIGHT_DEVICES.reduce((acc, device) => acc + (off[device.id] ? 0 : device.watts), 0);
  const allFound = found.length === NIGHT_DEVICES.length;
  const wasteOff = WASTE.every((device) => off[device.id]);
  const fridgeOff = Boolean(off.lodowka);
  const done = allFound && wasteOff && !fridgeOff;

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [done, onComplete]);

  const toSvg = (event: PointerEvent<SVGSVGElement>) => {
    const matrix = svgRef.current?.getScreenCTM();
    if (!matrix) return null;
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: Math.max(0, Math.min(W, point.x)), y: Math.max(0, Math.min(H, point.y)) };
  };

  const shine = (point: { x: number; y: number }, pointerType: string) => {
    const beam = pointerType === 'mouse' ? point : { x: point.x, y: Math.max(0, point.y - TOUCH_LIFT) };
    setLight(beam);
    const hits = nearest(beam.x, beam.y, FIND_DIST).map((item) => item.device.id);
    if (hits.length) setFound((current) => (hits.every((id) => current.includes(id)) ? current : [...new Set([...current, ...hits])]));
  };

  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    const point = toSvg(event);
    if (!point) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    pressed.current = true;
    downAt.current = point;
    shine(point, event.pointerType);
  };

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (event.pointerType !== 'mouse' && !pressed.current) return;
    const point = toSvg(event);
    if (point) shine(point, event.pointerType);
  };

  const onUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    pressed.current = false;
    const point = toSvg(event);
    const start = downAt.current;
    downAt.current = null;
    // Stuknięcie (bez przeciągania) w znalezione urządzenie otwiera jego kartkę.
    if (point && start && Math.hypot(point.x - start.x, point.y - start.y) < 12) {
      const hit = nearest(point.x, point.y, 10).find((item) => found.includes(item.device.id));
      if (hit) setSelected(hit.device.id);
    }
  };

  const toggle = (id: string) => setOff((current) => ({ ...current, [id]: !current[id] }));

  const device = NIGHT_DEVICES.find((item) => item.id === selected) ?? null;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Jest noc. Wszyscy śpią, wszystko jest „wyłączone” — a licznik prądu dalej się kręci. Weź latarkę:{' '}
        <strong>wódź nią po ciemnym mieszkaniu</strong> (myszą albo palcem) i znajdź wszystko, co bierze prąd. Nie
        wszystko ma lampkę — poświeć też tam, gdzie nic nie mruga. Znalezione urządzenie stuknij, żeby zobaczyć, ile
        bierze, i zdecydować, co z nim zrobić na noc.
      </p>

      <div className="mt-5 space-y-4 lg:grid lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-6 lg:space-y-0">
        <div className="min-w-0">
          <Meter watts={total} found={found.length} color={color} />

          <svg
            ref={svgRef}
            viewBox={`0 0 ${W} ${H}`}
            className="mx-auto mt-2 block w-full max-w-[640px] cursor-crosshair select-none border"
            style={{ touchAction: 'none' }}
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            role="img"
            aria-label={`Ciemne mieszkanie nocą. Znalezione urządzenia: ${found.length} z ${NIGHT_DEVICES.length}.`}
          >
            <defs>
              <radialGradient id={`beam-${uid}`}>
                <stop offset="0%" stopColor="black" />
                <stop offset="65%" stopColor="black" />
                <stop offset="100%" stopColor="white" />
              </radialGradient>
              <mask id={`dark-${uid}`}>
                <rect width={W} height={H} fill="white" />
                {light && <circle cx={r2(light.x)} cy={r2(light.y)} r={LIGHT_R} fill={`url(#beam-${uid})`} />}
              </mask>
              <filter id={`glow-${uid}`} x="-200%" y="-200%" width="500%" height="500%">
                <feGaussianBlur stdDeviation="2.5" />
              </filter>
            </defs>

            <Flat />
            {NIGHT_DEVICES.map((item) => (
              <DeviceArt key={item.id} id={item.id} off={Boolean(off[item.id])} />
            ))}

            {/* Noc. Maska wycina w niej plamę latarki. */}
            <rect width={W} height={H} fill="#0b1224" opacity={0.985} mask={`url(#dark-${uid})`} />
            {light && <circle cx={r2(light.x)} cy={r2(light.y)} r={LIGHT_R} fill="#fef3c7" opacity={0.1} pointerEvents="none" />}

            {/* Lampki czuwania świecą przez ciemność — dopóki urządzenie ma prąd. */}
            {NIGHT_DEVICES.filter((item) => !off[item.id]).flatMap((item) =>
              PLACES[item.id].leds.map((led, index) => (
                <g key={`${item.id}-${index}`} className={cn(led.blink && 'animate-pulse')} pointerEvents="none">
                  <circle cx={led.x} cy={led.y} r={5} fill={led.fill} opacity={0.7} filter={`url(#glow-${uid})`} />
                  <circle cx={led.x} cy={led.y} r={2.2} fill={led.fill} />
                </g>
              ))
            )}

            {/* Obrys znalezionych — żeby w ciemności było wiadomo, gdzie już się świeciło. */}
            {NIGHT_DEVICES.filter((item) => found.includes(item.id)).flatMap((item) =>
              PLACES[item.id].parts.map((part, index) => (
                <rect
                  key={`${item.id}-${index}`}
                  x={part.x - 4}
                  y={part.y - 4}
                  width={part.w + 8}
                  height={part.h + 8}
                  fill="none"
                  stroke={item.id === selected ? color : '#fde68a'}
                  strokeWidth={item.id === selected ? 3 : 1.5}
                  strokeDasharray={item.id === selected ? undefined : '5 4'}
                  opacity={0.9}
                  pointerEvents="none"
                />
              ))
            )}
          </svg>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {NIGHT_DEVICES.filter((item) => found.includes(item.id)).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setSelected(item.id)}
                aria-pressed={item.id === selected}
                className={cn(
                  'cursor-pointer border px-2 py-1 text-xs transition-colors hover:bg-muted',
                  off[item.id] && 'text-muted-foreground line-through',
                  item.id === selected && 'border-2 font-semibold'
                )}
                style={item.id === selected ? { borderColor: color } : undefined}
              >
                {item.name} · {formatW(item.watts)}
              </button>
            ))}
            {found.length === 0 && (
              <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground">
                <Flashlight className="h-3.5 w-3.5" aria-hidden />
                Tu pojawi się wszystko, co oświetlisz.
              </span>
            )}
          </div>
        </div>

        <div className="border p-4 lg:self-start">
          {device ? (
            <DeviceCard device={device} off={Boolean(off[device.id])} onToggle={() => toggle(device.id)} color={color} />
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground">
              Stuknij oświetlone urządzenie — albo jego nazwę pod rysunkiem — a tu zobaczysz, ile bierze w nocy.
            </p>
          )}
          {fridgeOff && selected !== 'lodowka' && (
            <p className="mt-3 flex gap-2 border-l-2 border-red-500 pl-3 text-sm leading-relaxed text-red-700">
              <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
              Lodówka stoi bez prądu. Do rana zrobi się w niej ciepło.
            </p>
          )}
        </div>
      </div>

      <p className="mt-4 text-sm text-muted-foreground" aria-live="polite">
        {!allFound
          ? `Znalezione: ${found.length} z ${NIGHT_DEVICES.length}. Szukaj dalej — nie wszystko się świeci.`
          : !wasteOff
            ? `Wszystko znalezione. Zostało jeszcze czuwanie na darmo: ${WASTE.filter((item) => !off[item.id])
                .map((item) => item.name.toLowerCase())
                .join(', ')}.`
            : fridgeOff
              ? 'Czuwanie wyłączone — ale lodówka też. Włącz ją z powrotem.'
              : null}
      </p>

      {done && <NightSummary total={total} color={color} />}
    </div>
  );
}

/** Licznik prądu: tarcza kręci się tym szybciej, im więcej watów bierze dom. */
function Meter({ watts, found, color }: { watts: number; found: number; color: string }) {
  const [angle, setAngle] = useState(0);
  const wattsRef = useRef(watts);
  useEffect(() => {
    wattsRef.current = watts;
  }, [watts]);
  useEffect(() => {
    let frame = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;
      // 65 W to mniej więcej obrót na półtorej sekundy.
      setAngle((value) => (value + wattsRef.current * 0.0037 * dt) % 360);
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);
  const rad = (angle * Math.PI) / 180;

  return (
    <div className="flex items-center gap-3 border px-3 py-2">
      <svg viewBox="0 0 64 30" className="h-8 w-16 shrink-0" aria-hidden>
        <ellipse cx={32} cy={15} rx={28} ry={10} fill="#e4e4e7" stroke="#a1a1aa" strokeWidth={1.5} />
        <line
          x1={r2(32 + Math.cos(rad) * 20)}
          y1={r2(15 + Math.sin(rad) * 7)}
          x2={r2(32 + Math.cos(rad) * 27)}
          y2={r2(15 + Math.sin(rad) * 9.6)}
          stroke="#dc2626"
          strokeWidth={3}
          strokeLinecap="round"
          opacity={Math.sin(rad) > -0.2 ? 1 : 0.35}
        />
      </svg>
      <div className="min-w-0 flex-1 text-sm leading-tight">
        <span className="block text-xs text-muted-foreground">licznik prądu — dom bierze teraz</span>
        <strong className="text-lg tabular-nums" style={{ color }}>
          {formatW(watts)}
        </strong>
        <span className="text-xs text-muted-foreground">
          {' '}
          · przez noc {formatKettles(watts * NIGHT_HOURS)}
        </span>
      </div>
      <span className="shrink-0 text-right text-xs tabular-nums text-muted-foreground">
        znalezione
        <br />
        <strong className="text-sm text-foreground">
          {found}/{NIGHT_DEVICES.length}
        </strong>
      </span>
    </div>
  );
}

function DeviceCard({
  device,
  off,
  onToggle,
  color,
}: {
  device: NightDevice;
  off: boolean;
  onToggle: () => void;
  color: string;
}) {
  const night = device.watts * NIGHT_HOURS;
  return (
    <div className="space-y-2 text-sm leading-relaxed">
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{ROOM_NAMES[device.room]}</p>
      <p className="text-base font-bold leading-tight">{device.name}</p>
      <p>
        W nocy bierze: <strong style={{ color }}>{formatW(device.watts)}</strong>
      </p>
      {device.kind !== 'off' && (
        <p className="text-xs text-muted-foreground">
          przez noc: {formatWh(night)} ({formatKettles(night)}) · przez rok nocy: {formatKettles(night * 365)}
        </p>
      )}
      <p>{device.note}</p>
      {device.kind === 'family' && (
        <p className="text-xs text-muted-foreground">
          Wyłączony na noc oszczędza {formatWh(night)} — {formatKettles(night)} — co noc. Tu decyduje dom, nie licznik.
        </p>
      )}
      {device.kind !== 'off' && (
        <button
          type="button"
          onClick={onToggle}
          className="inline-flex cursor-pointer items-center gap-2 border px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted"
          style={off ? undefined : { borderColor: color, color }}
        >
          <Power className="h-4 w-4" aria-hidden />
          {off ? 'Włącz z powrotem' : 'Wyłącz z gniazdka na noc'}
        </button>
      )}
      {device.id === 'lodowka' && off && (
        <p className="flex gap-2 border-l-2 border-red-500 pl-3 text-red-700">
          <TriangleAlert className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>
            Rano: ciepłe mleko, rozmrożony groszek i kałuża pod zamrażarką. Lodówka nie czuwa, tylko pracuje — jej prąd
            nie jest zmarnowany. <strong>Oszczędzać to nie znaczy rezygnować z tego, co potrzebne.</strong>
          </span>
        </p>
      )}
    </div>
  );
}

function NightSummary({ total, color }: { total: number; color: string }) {
  const saved = TOTAL_START - total;
  const perNight = saved * NIGHT_HOURS;
  return (
    <div className="mt-4 space-y-3 p-4 text-sm leading-relaxed sm:text-base" style={{ backgroundColor: `${color}12` }}>
      <p>
        <strong>
          Z {formatW(TOTAL_START)} zostało {formatW(total)}.
        </strong>{' '}
        Każdej nocy ten dom oszczędza {formatWh(perNight)} — {formatKettles(perNight)}, a przez rok nocy{' '}
        {formatKettles(perNight * 365)}. I nic, czego ktoś potrzebuje, nie przestało działać: lodówka chłodzi, a rano
        wszystko włączy się jednym pstryknięciem.
      </p>
      <p>
        Zauważ, kto brał najwięcej: <strong>dekoder z maleńką kropką</strong> ({formatW(DEKODER_W)}) i konsola, a zaraz za
        nimi głośniki bez żadnej lampki. Czerwona kropka telewizora — ta, którą widać najlepiej — brała najmniej.
        Czuwanie nie świeci. Trzeba o nim wiedzieć.
      </p>
      <p className="border-l-2 pl-3" style={{ borderColor: color }}>
        Najprościej zrobić to <strong>listwą z wyłącznikiem</strong>: dekoder, konsola i głośnik pod telewizorem w jednej
        listwie, wieczorem jedno pstryknięcie gasi całą trójkę. A jeśli ktoś zapomni? Na to też jest sposób — zobaczysz
        go w zadaniu.
      </p>
    </div>
  );
}

/** Mieszkanie w przekroju: kuchnia, przedpokój, salon i pokój Oli. Same meble — urządzenia rysuje `DeviceArt`. */
function Flat() {
  return (
    <g pointerEvents="none">
      <rect width={W} height={H} fill="#f5efe4" />
      <rect x={0} y={400} width={W} height={40} fill="#d6c4a8" />
      <rect x={0} y={28} width={W} height={12} fill="#d4d4d8" />
      {[196, 286, 586].map((x) => (
        <rect key={x} x={x} y={40} width={8} height={360} fill="#d9d2c5" />
      ))}
      {/* kuchnia */}
      <rect x={92} y={296} width={104} height={104} fill="#cdb694" />
      <rect x={88} y={292} width={108} height={8} fill="#a8a29e" />
      <rect x={98} y={110} width={92} height={62} fill="#e7dcc8" stroke="#cbbfa9" />
      {/* przedpokój */}
      <rect x={208} y={244} width={70} height={6} fill="#a8a29e" />
      <rect x={214} y={290} width={60} height={110} fill="#c9b08a" stroke="#b39a74" />
      <circle cx={264} cy={346} r={3} fill="#8a7458" />
      {/* salon */}
      <rect x={380} y={70} width={110} height={100} fill="#c9d6e8" stroke="#b7a893" strokeWidth={4} />
      <line x1={435} y1={70} x2={435} y2={170} stroke="#b7a893" strokeWidth={3} />
      <circle cx={462} cy={98} r={11} fill="#fefce8" />
      <rect x={330} y={332} width={200} height={68} fill="#b3977a" />
      <rect x={336} y={340} width={188} height={30} fill="#8f765c" />
      <path d="M548 400 v-58 h30 v58" fill="#9cb38a" />
      {/* pokój Oli */}
      <rect x={700} y={78} width={70} height={92} fill="#c9d6e8" stroke="#b7a893" strokeWidth={4} />
      <rect x={598} y={300} width={124} height={8} fill="#b3977a" />
      <rect x={602} y={308} width={6} height={92} fill="#9c8266" />
      <rect x={712} y={308} width={6} height={92} fill="#9c8266" />
    </g>
  );
}

/** Urządzenia w przekroju mieszkania. Wyłączone z gniazdka dostają przekreśloną wtyczkę. */
function DeviceArt({ id, off }: { id: string; off: boolean }) {
  const art = (() => {
    switch (id) {
      case 'lodowka':
        return (
          <>
            <rect x={14} y={168} width={72} height={232} fill="#eef2f5" stroke="#9ca3af" strokeWidth={2} />
            <line x1={14} y1={250} x2={86} y2={250} stroke="#9ca3af" strokeWidth={2} />
            <rect x={74} y={190} width={4} height={40} fill="#9ca3af" />
            <rect x={74} y={264} width={4} height={60} fill="#9ca3af" />
          </>
        );
      case 'mikrofalowka':
        return (
          <>
            <rect x={98} y={256} width={62} height={40} fill="#e5e7eb" stroke="#9ca3af" />
            <rect x={103} y={261} width={38} height={30} fill="#6b7280" />
          </>
        );
      case 'czajnik':
        return <path d="M168 296 l3 -24 h16 l3 24 z M186 278 h6 v10 h-5" fill="#d4d4d8" stroke="#71717a" />;
      case 'router':
        return (
          <>
            <line x1={220} y1={228} x2={216} y2={208} stroke="#71717a" strokeWidth={3} />
            <line x1={264} y1={228} x2={268} y2={208} stroke="#71717a" strokeWidth={3} />
            <rect x={214} y={228} width={56} height={16} fill="#f4f4f5" stroke="#a1a1aa" />
          </>
        );
      case 'telewizor':
        return (
          <>
            <rect x={350} y={220} width={160} height={96} fill="#27272a" />
            <rect x={424} y={316} width={12} height={6} fill="#3f3f46" />
          </>
        );
      case 'soundbar':
        return <rect x={362} y={322} width={136} height={8} fill="#3f3f46" />;
      case 'dekoder':
        return <rect x={344} y={348} width={72} height={16} fill="#3f3f46" />;
      case 'konsola':
        return <rect x={436} y={344} width={76} height={22} fill="#e4e4e7" stroke="#a1a1aa" />;
      case 'monitor':
        return (
          <>
            <rect x={624} y={234} width={72} height={48} fill="#27272a" />
            <rect x={656} y={282} width={8} height={18} fill="#3f3f46" />
          </>
        );
      case 'glosniki':
        return (
          <>
            <rect x={604} y={260} width={14} height={40} fill="#52525b" />
            <rect x={702} y={260} width={14} height={40} fill="#52525b" />
          </>
        );
      case 'komputer':
        return <rect x={734} y={300} width={34} height={100} fill="#3f3f46" />;
      case 'ladowarka':
        return (
          <>
            <rect x={602} y={362} width={20} height={24} fill="#f4f4f5" stroke="#a1a1aa" />
            <rect x={606} y={368} width={12} height={16} fill="#fafafa" stroke="#71717a" />
            <path d="M612 384 q2 10 -4 16" fill="none" stroke="#71717a" strokeWidth={2} />
          </>
        );
      default:
        return null;
    }
  })();

  const part = PLACES[id]?.parts[0];
  return (
    <g pointerEvents="none" opacity={off ? 0.55 : 1}>
      {art}
      {off && part && (
        <g transform={`translate(${part.x + part.w / 2 - 7} ${part.y - 18})`}>
          <circle cx={7} cy={7} r={8} fill="#fff" stroke="#71717a" />
          <line x1={2} y1={12} x2={12} y2={2} stroke="#dc2626" strokeWidth={2} />
        </g>
      )}
    </g>
  );
}
