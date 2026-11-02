'use client';

import { useCallback, useEffect, useRef, useState, type ComponentType, type CSSProperties, type PointerEvent } from 'react';
import { Check, LampDesk, Laptop, Smartphone, Tv, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KettleIcon } from './kettle-icon';
import { formatW, num, r2 } from './energy';

/**
 * Blok 1 — **dziecko jest elektrownią.**
 *
 * Gniazdko w ścianie ukrywa najważniejszą rzecz o prądzie: że ktoś albo coś
 * musi go w tej chwili wytwarzać. Tu wytwarza go ręka dziecka: kręci korbą
 * prądnicy, a wskazówka pokazuje, ile watów daje. **Liczy się tempo, nie
 * położenie** — to jedyny gest kursu, w którym wejściem jest szybkość ruchu,
 * i dlatego da się nim poczuć moc: lampce wystarcza leniwe kręcenie, laptop
 * męczy, telewizor jest poza zasięgiem, a czajnik — poza skalą.
 *
 * Dwie decyzje:
 *
 * - **Korba ma sufit (75 W).** Bez niego wystarczająco szybka mysz zasiliłaby
 *   telewizor i haczyk powiedziałby nieprawdę. Ta sama liczba stoi w tekście:
 *   więcej ta korba nie da, a 100 W przez godzinę daje dorosły na rowerze.
 * - **Urządzenie rusza dopiero po 1,5 s utrzymanej mocy.** Jedno szarpnięcie to
 *   jeszcze nie zasilanie — prąd trzeba dawać cały czas, dopóki urządzenie
 *   pracuje. To jest ten sam pomysł, który w bloku 2 staje się „moc razy czas”.
 */

/** Jeden obrót na sekundę daje tyle watów. */
const W_PER_REV = 25;
/** Więcej ta korba nie da, choćby kręcić jak najszybciej. */
const HAND_MAX = 75;
const GAUGE_MAX = 120;
/** Tyle trzeba utrzymać moc, żeby urządzenie ruszyło. */
const HOLD_MS = 1500;
/** Tyle kręcenia przy za ciężkim urządzeniu wystarczy, żeby się przekonać. */
const TRY_MS = 2500;

type IconType = ComponentType<{ className?: string; style?: CSSProperties }>;

interface CrankDevice {
  id: string;
  name: string;
  need: number;
  icon: IconType;
  /** Co mówimy, kiedy się udało. */
  lit?: string;
  /** Co mówimy, kiedy się nie da. */
  heavy?: string;
}

const DEVICES: CrankDevice[] = [
  {
    id: 'lampka',
    name: 'Lampka LED',
    need: 5,
    icon: LampDesk,
    lit: 'Świeci! Lampce LED wystarczy 5 W — leniwe kręcenie.',
  },
  {
    id: 'telefon',
    name: 'Ładowanie telefonu',
    need: 10,
    icon: Smartphone,
    lit: 'Ładuje się. 10 W — dalej spokojnie, ale już trzeba kręcić równo.',
  },
  {
    id: 'laptop',
    name: 'Laptop',
    need: 45,
    icon: Laptop,
    lit: 'Działa — ale czujesz to w ręce. 45 W to już porządna praca, a laptop chce jej przez całe godziny.',
  },
  {
    id: 'telewizor',
    name: 'Telewizor',
    need: 100,
    icon: Tv,
    heavy:
      'Telewizor potrzebuje 100 W, a ta korba więcej niż 75 W nie da. Sto watów przez godzinę daje dorosły, który równo pedałuje na rowerze — ręką tego nie wykręcisz.',
  },
  {
    id: 'czajnik',
    name: 'Czajnik',
    need: 2000,
    icon: KettleIcon,
    heavy:
      'Czajnik potrzebuje 2000 W — tyle, co dwudziestu dorosłych pedałujących naraz na rowerach. A ty włączasz go jednym pstryknięciem. Tę pracę robi za ciebie elektrownia, daleko stąd.',
  },
];

type Status = 'lit' | 'heavy';

interface Sample {
  t: number;
  /** Suma przebytego kąta, radiany — kierunek kręcenia nie ma znaczenia. */
  a: number;
}

export function DynamoCrank({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [selectedId, setSelectedId] = useState(DEVICES[0].id);
  const [status, setStatus] = useState<Record<string, Status>>({});
  const [power, setPower] = useState(0);
  const [progress, setProgress] = useState(0);
  const [arm, setArm] = useState(-Math.PI / 2);
  const [grabbing, setGrabbing] = useState(false);

  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const lastAngle = useRef(0);
  const turned = useRef(0);
  const samples = useRef<Sample[]>([]);
  const powerRef = useRef(0);
  const armRef = useRef(-Math.PI / 2);
  const progressRef = useRef(0);
  const tryRef = useRef(0);
  const selectedRef = useRef(selectedId);
  const statusRef = useRef(status);
  const reported = useRef(false);

  // Pętla animacji czyta stan przez refy, żeby nie montować się od nowa przy każdej zmianie.
  useEffect(() => {
    selectedRef.current = selectedId;
    statusRef.current = status;
  }, [selectedId, status]);

  const selected = DEVICES.find((device) => device.id === selectedId) ?? DEVICES[0];
  const allTried = DEVICES.every((device) => status[device.id]);

  useEffect(() => {
    if (allTried && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [allTried, onComplete]);

  const choose = useCallback((id: string) => {
    selectedRef.current = id;
    setSelectedId(id);
    progressRef.current = 0;
    tryRef.current = 0;
    setProgress(0);
  }, []);

  // Jedna pętla animacji na cały widżet: prędkość korby → waty → postęp urządzenia.
  useEffect(() => {
    let frame = 0;
    let last = performance.now();

    const tick = (now: number) => {
      const dt = Math.min(64, now - last);
      last = now;

      samples.current = samples.current.filter((sample) => now - sample.t <= 300);
      let revPerSec = 0;
      const list = samples.current;
      if (dragging.current && list.length >= 2 && now - list[list.length - 1].t < 150) {
        const span = (list[list.length - 1].t - list[0].t) / 1000;
        if (span > 0.03) revPerSec = (list[list.length - 1].a - list[0].a) / (2 * Math.PI) / span;
      }
      const target = Math.min(HAND_MAX, revPerSec * W_PER_REV);
      // Koło zamachowe: rozpędza się szybko, zwalnia wolniej.
      const tau = target > powerRef.current ? 120 : 380;
      powerRef.current += (target - powerRef.current) * (1 - Math.exp(-dt / tau));
      if (powerRef.current < 0.05) powerRef.current = 0;
      const p = powerRef.current;

      if (!dragging.current && p > 0) {
        armRef.current += (p / W_PER_REV) * 2 * Math.PI * (dt / 1000);
        setArm(armRef.current);
      }

      const device = DEVICES.find((item) => item.id === selectedRef.current);
      if (device && !statusRef.current[device.id]) {
        if (device.need <= HAND_MAX) {
          progressRef.current =
            p >= device.need
              ? progressRef.current + dt / HOLD_MS
              : Math.max(0, progressRef.current - dt / (HOLD_MS * 2));
          if (progressRef.current >= 1) {
            progressRef.current = 1;
            statusRef.current = { ...statusRef.current, [device.id]: 'lit' };
            setStatus(statusRef.current);
          }
        } else {
          // Liczy się tylko porządne kręcenie — muśnięcie korby to jeszcze nie próba.
          if (p >= 25) tryRef.current += dt;
          progressRef.current = Math.min(1, p / device.need);
          if (tryRef.current >= TRY_MS) {
            statusRef.current = { ...statusRef.current, [device.id]: 'heavy' };
            setStatus(statusRef.current);
          }
        }
        setProgress(progressRef.current);
      }

      setPower(Math.round(p * 10) / 10);
      frame = requestAnimationFrame(tick);
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  // Po udanym zasileniu przejdź sam do następnego niesprawdzonego urządzenia.
  useEffect(() => {
    if (!status[selectedId]) return;
    const next = DEVICES.find((device) => !status[device.id]);
    if (!next) return;
    const timer = window.setTimeout(() => choose(next.id), 2600);
    return () => window.clearTimeout(timer);
  }, [status, selectedId, choose]);

  const angleOf = (event: PointerEvent<SVGSVGElement>) => {
    const rect = svgRef.current!.getBoundingClientRect();
    const dx = event.clientX - (rect.left + rect.width / 2);
    const dy = event.clientY - (rect.top + rect.height / 2);
    return { angle: Math.atan2(dy, dx), dist: Math.hypot(dx, dy) / (rect.width / 2) };
  };

  const onDown = (event: PointerEvent<SVGSVGElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragging.current = true;
    setGrabbing(true);
    lastAngle.current = angleOf(event).angle;
    samples.current = [{ t: performance.now(), a: turned.current }];
  };

  const onMove = (event: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const { angle, dist } = angleOf(event);
    // Przy samej osi kąt skacze od drgnięcia palca — tam ruch nie kręci korbą.
    if (dist < 0.15) return;
    let delta = angle - lastAngle.current;
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    lastAngle.current = angle;
    turned.current += Math.abs(delta);
    samples.current.push({ t: performance.now(), a: turned.current });
    armRef.current = angle;
    setArm(angle);
  };

  const onUp = (event: PointerEvent<SVGSVGElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragging.current = false;
    setGrabbing(false);
  };

  const ratio = Math.min(1, power / selected.need);
  const current = status[selected.id];
  const Icon = selected.icon;

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Gniazdko w ścianie to tylko koniec długiego kabla. Na jego drugim końcu coś musi w tej chwili{' '}
        <strong>wytwarzać prąd</strong> — w większości elektrowni coś się kręci, tylko zamiast ręki kręci para, woda
        albo wiatr. Tutaj elektrownią jesteś ty. <strong>Chwyć korbę i kręć w kółko</strong>, w którąkolwiek stronę.
        Im szybciej kręcisz, tym więcej watów dajesz.
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        {DEVICES.map((device) => {
          const DeviceIcon = device.icon;
          const state = status[device.id];
          const active = device.id === selectedId;
          return (
            <button
              key={device.id}
              type="button"
              onClick={() => choose(device.id)}
              aria-pressed={active}
              className={cn(
                'flex cursor-pointer items-center gap-2 border px-2.5 py-2 text-left transition-colors',
                active ? 'border-2' : 'hover:bg-muted/60',
                device.id === 'czajnik' && 'col-span-2 sm:col-span-1'
              )}
              style={active ? { borderColor: color } : undefined}
            >
              <DeviceIcon className="h-5 w-5 shrink-0" style={{ color: active ? color : '#71717a' }} />
              <span className="min-w-0 flex-1">
                <span className="block text-xs font-semibold leading-tight">{device.name}</span>
                <span className="block text-[11px] tabular-nums text-muted-foreground">{formatW(device.need)}</span>
              </span>
              {state === 'lit' && <Check className="h-4 w-4 shrink-0" style={{ color }} aria-label="zasilone" />}
              {state === 'heavy' && <X className="h-4 w-4 shrink-0 text-zinc-500" aria-label="za ciężkie dla korby" />}
            </button>
          );
        })}
      </div>

      {/* Korba i wskaźnik obok siebie na każdej szerokości — kręcąc, trzeba widzieć wskazówkę. */}
      <div className="mx-auto mt-5 grid max-w-[620px] grid-cols-2 items-center gap-3 sm:gap-8">
        <svg
          ref={svgRef}
          viewBox="0 0 200 200"
          className={cn('mx-auto w-full max-w-[250px] select-none', grabbing ? 'cursor-grabbing' : 'cursor-grab')}
          style={{ touchAction: 'none' }}
          onPointerDown={onDown}
          onPointerMove={onMove}
          onPointerUp={onUp}
          onPointerCancel={onUp}
          role="img"
          aria-label={`Korba prądnicy. Teraz dajesz ${formatW(Math.round(power))}.`}
        >
          <Crank arm={arm} color={color} spinning={power > 0.5} />
        </svg>

        <div className="min-w-0">
          <Gauge power={power} need={selected.need} color={color} />
          <div className="mt-2 flex items-center gap-3">
            <Icon
              className="h-10 w-10 shrink-0 transition-[filter,color] duration-100 sm:h-12 sm:w-12"
              style={{
                color: current === 'lit' || ratio >= 1 ? color : `color-mix(in oklch, ${color} ${Math.round(ratio * 100)}%, #a1a1aa)`,
                filter: ratio > 0.05 ? `drop-shadow(0 0 ${r2(2 + ratio * 10)}px ${color})` : undefined,
              }}
            />
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold leading-tight">{selected.name}</p>
              <div className="mt-1 h-2 bg-muted">
                <div
                  className="h-full transition-[width] duration-75"
                  style={{
                    width: `${(current === 'lit' ? 1 : progress) * 100}%`,
                    backgroundColor: selected.need > HAND_MAX ? '#a1a1aa' : color,
                  }}
                />
              </div>
              <p className="mt-1 text-[11px] leading-snug text-muted-foreground">
                {current === 'lit'
                  ? 'zasilone'
                  : current === 'heavy'
                    ? 'za ciężkie dla korby'
                    : power >= selected.need
                      ? 'trzymaj tak jeszcze chwilę…'
                      : selected.need > HAND_MAX && power > 0.5
                        ? `kręć z całej siły — brakuje ${formatW(Math.round(selected.need - power))}`
                        : power > 0.5
                        ? `brakuje ${formatW(Math.round(selected.need - power))}`
                        : `potrzebuje ${formatW(selected.need)}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div aria-live="polite">
        {current && (
          <p
            className="mt-5 border-l-2 pl-3 text-sm leading-relaxed sm:text-base"
            style={{ borderColor: current === 'lit' ? color : '#a1a1aa' }}
          >
            {current === 'lit' ? selected.lit : selected.heavy}
          </p>
        )}
      </div>

      {allTried && <PowerDots color={color} />}
    </div>
  );
}

/** Koło prądnicy z ramieniem korby. Ramię obraca się za palcem, a po puszczeniu kręci się siłą rozpędu. */
function Crank({ arm, color, spinning }: { arm: number; color: string; spinning: boolean }) {
  const hx = r2(100 + Math.cos(arm) * 64);
  const hy = r2(100 + Math.sin(arm) * 64);
  const spokes = [0, 1, 2, 3, 4, 5].map((index) => {
    const angle = arm + (index * Math.PI) / 3;
    return { x: r2(100 + Math.cos(angle) * 78), y: r2(100 + Math.sin(angle) * 78) };
  });
  return (
    <g>
      <circle cx={100} cy={100} r={84} fill="#f4f4f5" stroke="#a1a1aa" strokeWidth={3} />
      <circle cx={100} cy={100} r={84} fill="none" stroke={color} strokeWidth={3} strokeDasharray="4 10" opacity={spinning ? 0.9 : 0} />
      {spokes.map((spoke, index) => (
        <line key={index} x1={100} y1={100} x2={spoke.x} y2={spoke.y} stroke="#d4d4d8" strokeWidth={3} />
      ))}
      <line x1={100} y1={100} x2={hx} y2={hy} stroke="#52525b" strokeWidth={9} strokeLinecap="round" />
      <circle cx={100} cy={100} r={10} fill="#52525b" />
      <circle cx={hx} cy={hy} r={15} fill={color} stroke="#fff" strokeWidth={3} />
    </g>
  );
}

/** Półokrągły wskaźnik 0–120 W z kreską potrzeb wybranego urządzenia i szarym polem poza zasięgiem korby. */
function Gauge({ power, need, color }: { power: number; need: number; color: string }) {
  const cx = 110;
  const cy = 106;
  const radius = 88;
  const at = (watts: number, rr = radius) => {
    const angle = Math.PI + (Math.min(watts, GAUGE_MAX) / GAUGE_MAX) * Math.PI;
    return { x: r2(cx + Math.cos(angle) * rr), y: r2(cy + Math.sin(angle) * rr) };
  };
  const arc = (from: number, to: number, rr: number) => {
    const a = at(from, rr);
    const b = at(to, rr);
    return `M ${a.x} ${a.y} A ${rr} ${rr} 0 0 1 ${b.x} ${b.y}`;
  };
  const needle = at(power, radius - 14);
  const offScale = need > GAUGE_MAX;
  const mark = at(Math.min(need, GAUGE_MAX), radius + 8);
  const markIn = at(Math.min(need, GAUGE_MAX), radius - 8);

  return (
    <svg viewBox="0 0 220 128" className="w-full max-w-[260px]" role="img" aria-label={`Wskaźnik mocy: ${formatW(Math.round(power))}`}>
      <path d={arc(0, GAUGE_MAX, radius)} fill="none" stroke="#e4e4e7" strokeWidth={12} />
      <path d={arc(HAND_MAX, GAUGE_MAX, radius)} fill="none" stroke="#d4d4d8" strokeWidth={12} strokeDasharray="3 3" />
      {power > 0.3 && <path d={arc(0, power, radius)} fill="none" stroke={color} strokeWidth={12} />}
      {[0, 40, 80, 120].map((watts) => {
        const label = at(watts, radius - 22);
        return (
          <text key={watts} x={label.x} y={label.y + 4} textAnchor="middle" fontSize={10} fill="#71717a">
            {watts}
          </text>
        );
      })}
      {offScale ? (
        <text x={212} y={120} textAnchor="end" fontSize={10} fontWeight={700} fill="#b45309">
          {num(need, 0)} W → poza skalą
        </text>
      ) : (
        <line x1={markIn.x} y1={markIn.y} x2={mark.x} y2={mark.y} stroke="#b45309" strokeWidth={3} />
      )}
      <line x1={cx} y1={cy} x2={needle.x} y2={needle.y} stroke="#27272a" strokeWidth={3} strokeLinecap="round" />
      <circle cx={cx} cy={cy} r={5} fill="#27272a" />
      <text x={cx} y={cy - 26} textAnchor="middle" fontSize={20} fontWeight={800} fill="#27272a" className="tabular-nums">
        {num(power, 0)} W
      </text>
    </svg>
  );
}

/**
 * Podsumowanie haczyka: moc jako kropki. Jedna kropka = lampka (5 W), więc
 * telewizor to 20 kropek, a czajnik — 400. Na słupkach lampka byłaby
 * niewidoczną kreską; kropki da się policzyć.
 */
function PowerDots({ color }: { color: string }) {
  return (
    <div className="mt-5 space-y-3 p-4" style={{ backgroundColor: `${color}12` }}>
      <p className="text-sm leading-relaxed sm:text-base">
        To, co czułeś/czułaś w ręce, ma nazwę: <strong>moc</strong>. Mówi, ile prądu urządzenie bierze{' '}
        <strong>w każdej chwili</strong>, i mierzy się ją w <strong>watach</strong> (W). Tu jedna kropka to tyle, ile
        bierze lampka:
      </p>
      <ul className="space-y-2">
        {DEVICES.map((device) => {
          const dots = Math.round(device.need / 5);
          return (
            <li key={device.id} className="grid grid-cols-[92px_minmax(0,1fr)] items-start gap-2 sm:grid-cols-[140px_minmax(0,1fr)]">
              <span className="text-xs leading-tight">
                <span className="block font-semibold">{device.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatW(device.need)} · {dots} {dots === 1 ? 'kropka' : dots < 5 ? 'kropki' : 'kropek'}
                </span>
              </span>
              <span className="flex max-w-[260px] flex-wrap gap-[2px]" aria-hidden>
                {Array.from({ length: dots }, (_, index) => (
                  <span key={index} className="h-[5px] w-[5px]" style={{ backgroundColor: color }} />
                ))}
              </span>
            </li>
          );
        })}
      </ul>
      <p className="text-sm leading-relaxed">
        Czajnik ma czterysta kropek. Tyle że czajnik gotuje wodę trzy minuty, a są urządzenia, które mają kropek
        niewiele — i nie wyłączają się nigdy. Co wtedy zjada więcej? To sprawdzisz w następnym bloku.
      </p>
    </div>
  );
}
