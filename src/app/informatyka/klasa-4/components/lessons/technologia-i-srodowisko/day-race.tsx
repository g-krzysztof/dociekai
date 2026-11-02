'use client';

import { useEffect, useMemo, useRef, useState, type ComponentType, type CSSProperties } from 'react';
import { Minus, Play, Refrigerator, RotateCcw, Router, Smartphone, Tv } from 'lucide-react';
import { cn } from '@/lib/utils';
import { KettleIcon } from './kettle-icon';
import {
  DAY_DEVICES,
  clock,
  energyUntil,
  formatKettles,
  formatW,
  formatWh,
  isOnAt,
  splitTokens,
  type DayDevice,
} from './energy';

/**
 * Blok 2 — **moc razy czas**, zmierzone na dobie, a nie wyłożone w akapicie.
 *
 * Najpierw przewidywanie: dziecko **rozdziela dziesięć żetonów** między pięć
 * urządzeń — tyle, ile jego zdaniem każde zje prądu przez dobę. To nie jest
 * wybór jednej odpowiedzi, tylko oszacowanie proporcji, i dlatego po haczyku
 * prawie zawsze wygląda tak samo: większość żetonów na czajnik (400 kropek!),
 * nic na lodówkę.
 *
 * Potem doba leci sama w kilkanaście sekund i słupki rosną. **Zegar zwalnia,
 * kiedy pracuje czajnik** — inaczej jego trzy minuty trwałyby trzy setne
 * sekundy i wskaźnik „dom bierze teraz” skoczyłby niezauważony. Ze zwolnieniem
 * widać, jak wysoko skacze i jak krótko. Konsekwencja zamiast oceny: nikt nie
 * mówi „źle”, obok żetonów dziecka stają po prostu żetony doby.
 *
 * Na końcu wchodzi miarka całej lekcji: zagotowanie litra wody ≈ 100 Wh.
 */

const TOKENS = 10;
/** Doba bez zwolnień trwa tyle milisekund. */
const DAY_MS = 13000;
const BASE_RATE = 1440 / DAY_MS;
/** O tyle zwalnia zegar, kiedy pracuje czajnik. */
const KETTLE_SLOWDOWN = 18;

type IconType = ComponentType<{ className?: string; style?: CSSProperties }>;

const ICONS: Record<string, IconType> = {
  czajnik: KettleIcon,
  lodowka: Refrigerator,
  telewizor: Tv,
  router: Router,
  ladowarka: Smartphone,
};

/** Największy wynik doby — do niego skalujemy słupki. */
const MAX_WH = Math.max(...DAY_DEVICES.map((device) => energyUntil(device, 1440)));
const FINAL = DAY_DEVICES.map((device) => energyUntil(device, 1440));
const finalOf = (id: string) => FINAL[DAY_DEVICES.findIndex((device) => device.id === id)];
const REAL_TOKENS = splitTokens(FINAL, TOKENS);
const WINNER = DAY_DEVICES[FINAL.indexOf(Math.max(...FINAL))];
const KETTLE = DAY_DEVICES.find((device) => device.id === 'czajnik')!;

type Phase = 'bet' | 'run' | 'done';

const lowerFirst = (text: string) => text.charAt(0).toLowerCase() + text.slice(1);

export function DayRace({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [bets, setBets] = useState<Record<string, number>>({});
  const [phase, setPhase] = useState<Phase>('bet');
  const [t, setT] = useState(0);
  const reported = useRef(false);

  const placed = Object.values(bets).reduce((acc, value) => acc + value, 0);
  const left = TOKENS - placed;

  const add = (id: string) => {
    if (phase !== 'bet' || left <= 0) return;
    setBets((current) => ({ ...current, [id]: (current[id] ?? 0) + 1 }));
  };
  const remove = (id: string) => {
    if (phase !== 'bet') return;
    setBets((current) => ({ ...current, [id]: Math.max(0, (current[id] ?? 0) - 1) }));
  };

  const start = () => {
    setT(0);
    setPhase('run');
  };

  useEffect(() => {
    if (phase !== 'run') return;
    let frame = 0;
    let last = performance.now();
    let sim = 0;
    const tick = (now: number) => {
      const dt = Math.min(50, now - last);
      last = now;
      const rate = isOnAt(KETTLE, sim) ? BASE_RATE / KETTLE_SLOWDOWN : BASE_RATE;
      sim = Math.min(1440, sim + dt * rate);
      setT(sim);
      if (sim >= 1440) {
        setPhase('done');
        return;
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [phase]);

  useEffect(() => {
    if (phase === 'done' && !reported.current) {
      reported.current = true;
      onComplete?.();
    }
  }, [phase, onComplete]);

  const houseNow = DAY_DEVICES.reduce((acc, device) => acc + (isOnAt(device, t) ? device.power : 0), 0);
  const kettleOn = phase === 'run' && isOnAt(KETTLE, t);

  return (
    <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="text-sm leading-relaxed sm:text-base">
        Czajnik miał czterysta kropek, lodówka ma ich dwadzieścia, a router — dwie. Ale jedno urządzenie pracuje
        chwilę, a inne nie wyłącza się nigdy. <strong>Które zje najwięcej prądu przez całą dobę?</strong> Masz{' '}
        {TOKENS} żetonów. Rozłóż je tak, jak myślisz, że rozłoży się prąd: stuknij urządzenie, żeby dać mu żeton.
      </p>

      {phase !== 'bet' && <DayClock t={t} houseNow={houseNow} kettleOn={kettleOn} color={color} />}

      {phase === 'bet' && (
        <p className="mt-4 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          żetony do rozdania: <span className="tabular-nums">{left}</span>
          <span className="flex gap-1" aria-hidden>
            {Array.from({ length: left }, (_, index) => (
              <span key={index} className="h-3 w-3 rounded-full border-2" style={{ borderColor: color }} />
            ))}
          </span>
        </p>
      )}

      <ul className="mt-3 divide-y border">
        {DAY_DEVICES.map((device, index) => (
          <DeviceRow
            key={device.id}
            device={device}
            bet={bets[device.id] ?? 0}
            real={REAL_TOKENS[index]}
            t={t}
            phase={phase}
            color={color}
            canAdd={left > 0}
            onAdd={() => add(device.id)}
            onRemove={() => remove(device.id)}
          />
        ))}
      </ul>

      {phase === 'bet' && (
        <button
          type="button"
          onClick={start}
          disabled={left > 0}
          className="mt-4 inline-flex cursor-pointer items-center gap-2 border px-4 py-2 text-sm font-semibold transition-colors hover:bg-muted disabled:cursor-not-allowed disabled:opacity-40"
          style={{ borderColor: color, color }}
        >
          <Play className="h-4 w-4" aria-hidden />
          {left > 0 ? `Rozdaj jeszcze ${left} ${left === 1 ? 'żeton' : left < 5 ? 'żetony' : 'żetonów'}` : 'Puść dobę'}
        </button>
      )}

      {phase === 'done' && <Summary bets={bets} color={color} onReplay={start} />}
    </div>
  );
}

function DayClock({ t, houseNow, kettleOn, color }: { t: number; houseNow: number; kettleOn: boolean; color: string }) {
  return (
    <div className="mt-4 border p-3 sm:p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <span className="font-mono text-3xl font-bold tabular-nums">{clock(t)}</span>
        <span className="text-sm">
          dom bierze teraz:{' '}
          <strong className="tabular-nums" style={{ color: kettleOn ? '#b45309' : undefined }}>
            {formatW(houseNow)}
          </strong>
        </span>
      </div>
      <div className="relative mt-2 h-2 bg-muted">
        <div className="absolute inset-y-0 left-0" style={{ width: `${(t / 1440) * 100}%`, backgroundColor: color }} />
      </div>
      <p className={cn('mt-1.5 h-4 text-xs font-semibold text-amber-700 transition-opacity', kettleOn ? 'opacity-100' : 'opacity-0')}>
        Zegar zwalnia — pracuje czajnik. Patrz, jak krótko.
      </p>
    </div>
  );
}

function DeviceRow({
  device,
  bet,
  real,
  t,
  phase,
  color,
  canAdd,
  onAdd,
  onRemove,
}: {
  device: DayDevice;
  bet: number;
  real: number;
  t: number;
  phase: Phase;
  color: string;
  canAdd: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const Icon = ICONS[device.id];
  const on = phase === 'run' && isOnAt(device, t);
  const wh = phase === 'bet' ? 0 : energyUntil(device, t);

  return (
    <li className="p-3">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={phase !== 'bet' || !canAdd}
          className="flex min-w-0 flex-1 cursor-pointer items-center gap-3 text-left disabled:cursor-default"
          aria-label={phase === 'bet' ? `Daj żeton: ${device.name}` : device.name}
        >
          <Icon
            className="h-7 w-7 shrink-0 transition-colors"
            style={{ color: on ? color : '#a1a1aa', filter: on ? `drop-shadow(0 0 5px ${color})` : undefined }}
          />
          <span className="min-w-0">
            <span className="block text-sm font-semibold leading-tight">{device.name}</span>
            <span className="block text-xs tabular-nums text-muted-foreground">{formatW(device.power)}, kiedy pracuje</span>
          </span>
        </button>

        <Tokens count={bet} color={color} label="twoje" />
        {phase === 'bet' && (
          <button
            type="button"
            onClick={onRemove}
            disabled={bet === 0}
            aria-label={`Zabierz żeton: ${device.name}`}
            className="flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center border text-muted-foreground transition-colors hover:bg-muted disabled:cursor-default disabled:opacity-30"
          >
            <Minus className="h-3.5 w-3.5" aria-hidden />
          </button>
        )}
      </div>

      {phase !== 'bet' && (
        <div className="mt-2 grid grid-cols-[minmax(0,1fr)_76px] items-center gap-3 sm:pl-10">
          <div className="space-y-1">
            <Timeline device={device} t={t} color={color} />
            <div className="h-3 bg-muted">
              <div className="h-full" style={{ width: `${(wh / MAX_WH) * 100}%`, backgroundColor: color }} />
            </div>
          </div>
          <span className="text-right text-sm font-bold tabular-nums">{formatWh(wh)}</span>
        </div>
      )}

      {phase === 'done' && (
        <div className="mt-2 flex items-center justify-end gap-2 sm:pl-10">
          <span className="text-xs text-muted-foreground">naprawdę:</span>
          <Tokens count={real} color="#27272a" label="naprawdę" filled />
        </div>
      )}
    </li>
  );
}

/** Pasek doby: kiedy urządzenie pracowało, odsłaniany razem z zegarem. */
function Timeline({ device, t, color }: { device: DayDevice; t: number; color: string }) {
  return (
    <div className="relative h-1.5 bg-zinc-100 dark:bg-zinc-800" aria-hidden>
      {device.intervals
        .filter(([from]) => from < t)
        .map(([from, to]) => (
          <span
            key={from}
            className="absolute inset-y-0"
            style={{
              left: `${(from / 1440) * 100}%`,
              // Trzy minuty czajnika to 0,2% doby — dostają co najmniej 2 px, żeby było je widać.
              width: `max(2px, ${((Math.min(to, t) - from) / 1440) * 100}%)`,
              backgroundColor: color,
              opacity: 0.55,
            }}
          />
        ))}
    </div>
  );
}

function Tokens({ count, color, label, filled }: { count: number; color: string; label: string; filled?: boolean }) {
  return (
    <span className="flex max-w-[92px] shrink-0 flex-wrap justify-end gap-0.5" aria-label={`${label}: ${count}`}>
      {Array.from({ length: count }, (_, index) => (
        <span
          key={index}
          className="h-3 w-3 rounded-full border-2"
          style={{ borderColor: color, backgroundColor: filled ? color : `${color}33` }}
        />
      ))}
    </span>
  );
}

function Summary({ bets, color, onReplay }: { bets: Record<string, number>; color: string; onReplay: () => void }) {
  const topBet = useMemo(() => {
    let best: DayDevice | null = null;
    for (const device of DAY_DEVICES) {
      if ((bets[device.id] ?? 0) > (best ? bets[best.id] ?? 0 : 0)) best = device;
    }
    return best;
  }, [bets]);
  const chargerBet = bets.ladowarka ?? 0;

  return (
    <div className="mt-5 space-y-3 p-4 text-sm leading-relaxed sm:text-base" style={{ backgroundColor: `${color}12` }}>
      <p>
        {topBet?.id === WINNER.id ? (
          <>
            <strong>Trafione.</strong> Najwięcej postawiłeś/postawiłaś na lodówkę — i to ona zjadła najwięcej. Mało kto na
            nią stawia: stoi cicho w kącie i nikt jej nie włącza.
          </>
        ) : (
          <>
            Najwięcej postawiłeś/postawiłaś na: <strong>{topBet ? lowerFirst(topBet.name) : ''}</strong>. A najwięcej zjadła{' '}
            <strong>lodówka</strong> — cicha, w kącie, bez jednego pstryknięcia.
          </>
        )}
        {chargerBet >= 2 &&
          ` Na ładowarkę ${chargerBet < 5 ? `poszły ${chargerBet} żetony` : `poszło ${chargerBet} żetonów`}, a zjadła najmniej ze wszystkich.`}
      </p>
      <ul className="space-y-1 text-sm">
        {DAY_DEVICES.map((device, index) => (
          <li key={device.id}>
            <strong>{device.name}</strong> — {formatWh(FINAL[index])}: {device.why}
          </li>
        ))}
      </ul>
      <p className="border-l-2 pl-3" style={{ borderColor: color }}>
        Ile prądu zje urządzenie, zależy od dwóch rzeczy: <strong>ile bierze w każdej chwili</strong> (moc — to czułeś/czułaś
        w ręce przy korbie) i <strong>jak długo pracuje</strong>. Moc razy czas. Czajnik ma czterysta kropek, ale pracuje
        dziewięć minut. Lodówka ma dwadzieścia — ale pracuje sześć godzin.
      </p>
      <p>
        Zagotowanie litra wody w czajniku to około <strong>100 watogodzin</strong> (Wh). Od teraz to nasza miarka:
        lodówka zjada przez dobę {formatKettles(finalOf('lodowka'))}, router — {formatKettles(finalOf('router'))}, a
        ładowarka — {formatKettles(finalOf('ladowarka'))}.
      </p>
      <button
        type="button"
        onClick={onReplay}
        className="inline-flex cursor-pointer items-center gap-2 border bg-white px-3 py-1.5 text-sm font-semibold transition-colors hover:bg-muted dark:bg-zinc-900"
        style={{ borderColor: color, color }}
      >
        <RotateCcw className="h-4 w-4" aria-hidden />
        Puść tę samą dobę jeszcze raz
      </button>
    </div>
  );
}
