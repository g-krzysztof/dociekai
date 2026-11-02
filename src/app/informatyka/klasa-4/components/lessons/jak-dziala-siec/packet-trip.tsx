'use client';

import { Fragment, useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Globe,
  Laptop,
  RadioTower,
  Send,
  Server,
  Wifi,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji i jej blok centralny: dziecko wysyła coś przez sieć i patrzy,
 * jak paczka danych przeskakuje przystanek po przystanku — twoje urządzenie →
 * router → dostawca internetu → internet → drugi komputer — a potem wszystko
 * wraca tą samą drogą. Realizuje `[4.2]`: funkcjonowanie sieci w kontekście
 * komunikacji i dostępu do informacji.
 *
 * Dwa scenariusze na tej samej drodze: „po informację" (otwierasz stronę) i „do
 * człowieka" (piszesz wiadomość). Blok kończy się po uruchomieniu obu — bo o to
 * właśnie chodzi: te same rury, dwa zastosowania.
 *
 * Paczka to jeden element z `layoutId` renderowany w kolejnych kolumnach —
 * framer-motion sam animuje przeskok między nimi (wzorzec `PeelBoard` /
 * `WholePackBoard` z matematyki), więc nie ma tu ręcznego liczenia współrzędnych
 * ani ryzyka rozjazdu SSR/klient.
 */

interface Station {
  id: string;
  label: string;
  sub: string;
  icon: LucideIcon;
}

const STATIONS: Station[] = [
  { id: 'ty', label: 'Twoje urządzenie', sub: 'komputer, telefon, tablet', icon: Laptop },
  { id: 'router', label: 'Router w domu', sub: 'rozdziela internet po domu', icon: Wifi },
  { id: 'dostawca', label: 'Dostawca internetu', sub: 'podłącza dom do sieci', icon: RadioTower },
  { id: 'internet', label: 'Internet', sub: 'miliony połączonych sieci', icon: Globe },
  { id: 'serwer', label: 'Serwer', sub: 'obcy komputer na drugim końcu', icon: Server },
];

type ScenarioId = 'strona' | 'wiadomosc';

interface Scenario {
  id: ScenarioId;
  pick: string;
  endLabel: string;
  endSub: string;
  endIcon: LucideIcon;
  outPill: string;
  inPill: string;
  outStatus: string;
  inStatus: string;
  resultStatus: string;
}

const SCENARIOS: Record<ScenarioId, Scenario> = {
  strona: {
    id: 'strona',
    pick: 'Po informację (otwórz stronę)',
    endLabel: 'Serwer strony',
    endSub: 'komputer, na którym mieszka strona',
    endIcon: Server,
    outPill: 'prośba',
    inPill: 'strona',
    outStatus: 'Twoja prośba „pokaż stronę" wędruje przez sieć aż do serwera.',
    inStatus: 'Serwer znalazł stronę i odsyła ci jej kopię tą samą drogą.',
    resultStatus: 'Strona przyjechała jako kopia — w mniej niż sekundę.',
  },
  wiadomosc: {
    id: 'wiadomosc',
    pick: 'Do człowieka (napisz wiadomość)',
    endLabel: 'Serwer wiadomości',
    endSub: 'stąd trafia do telefonu koleżanki',
    endIcon: Send,
    outPill: 'cześć!',
    inPill: 'odpisała',
    outStatus: 'Twoja wiadomość idzie tą samą drogą — do serwera, który poda ją dalej koleżance.',
    inStatus: 'Koleżanka odpisała, a jej odpowiedź wraca do ciebie tymi samymi przystankami.',
    resultStatus: 'Wiadomość dotarła do koleżanki i wróciła odpowiedź — ta sama droga, co po stronę.',
  },
};

/** Trasa jednej podróży: tam do serwera (4) i z powrotem do ciebie (0). */
const OUT = [0, 1, 2, 3, 4];
const BACK = [3, 2, 1, 0];
const FULL = [...OUT, ...BACK];
const ARRIVED = FULL.length;
const HOP_MS = 300;

interface PacketTripProps {
  color: string;
  onComplete?: () => void;
}

export function PacketTrip({ color, onComplete }: PacketTripProps) {
  const [scenario, setScenario] = useState<ScenarioId>('strona');
  /** -1 = przed startem; 0…FULL.length-1 = paczka w drodze; ARRIVED = dojechała, paczka schowana. */
  const [hop, setHop] = useState(-1);
  const [showResult, setShowResult] = useState(false);
  const [done, setDone] = useState<ScenarioId[]>([]);

  const config = SCENARIOS[scenario];
  const running = hop >= 0 && hop < ARRIVED;
  const active = running ? FULL[hop] : -1;
  const leg: 'out' | 'back' = hop >= OUT.length ? 'back' : 'out';
  const visited = running ? new Set(FULL.slice(0, hop + 1)) : new Set<number>();
  const finished = done.length === 2;

  // Krok po kroku przez trasę; ostatnia klatka chowa paczkę (hop → ARRIVED).
  useEffect(() => {
    if (hop < 0 || hop >= ARRIVED) return;
    const delay = hop < ARRIVED - 1 ? HOP_MS : 480;
    const next = hop < ARRIVED - 1 ? hop + 1 : ARRIVED;
    const t = setTimeout(() => setHop(next), delay);
    return () => clearTimeout(t);
  }, [hop]);

  // Dojazd: pokaż wynik i odhacz scenariusz.
  useEffect(() => {
    if (hop !== ARRIVED) return;
    setShowResult(true);
    setDone((prev) => (prev.includes(scenario) ? prev : [...prev, scenario]));
  }, [hop, scenario]);

  useEffect(() => {
    if (done.length === 2) onComplete?.();
  }, [done, onComplete]);

  const send = () => {
    if (running) return;
    setShowResult(false);
    setHop(0);
  };

  const pickScenario = (id: ScenarioId) => {
    if (running || id === scenario) return;
    setScenario(id);
    setHop(-1);
    setShowResult(false);
  };

  const stationLabel = (index: number) => (index === 4 ? config.endLabel : STATIONS[index].label);
  const stationSub = (index: number) => (index === 4 ? config.endSub : STATIONS[index].sub);
  const stationIcon = (index: number) => (index === 4 ? config.endIcon : STATIONS[index].icon);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      {/* Wybór scenariusza + licznik */}
      <div className="mb-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
        <div className="flex flex-wrap gap-2">
          {(Object.keys(SCENARIOS) as ScenarioId[]).map((id) => {
            const isOn = scenario === id;
            const isDone = done.includes(id);
            return (
              <button
                key={id}
                type="button"
                onClick={() => pickScenario(id)}
                disabled={running}
                aria-pressed={isOn}
                className={cn(
                  'inline-flex items-center gap-1.5 border px-3 py-1.5 text-xs font-medium transition-colors sm:text-sm',
                  running ? 'cursor-default' : 'cursor-pointer hover:bg-muted/60',
                  isOn ? 'font-semibold' : 'text-muted-foreground'
                )}
                style={isOn ? { borderColor: color, backgroundColor: `${color}14`, color } : undefined}
              >
                {isDone && <Check className="h-3.5 w-3.5 shrink-0" aria-hidden />}
                {SCENARIOS[id].pick}
              </button>
            );
          })}
        </div>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {done.length}/2
        </p>
      </div>

      {/* Diagram: pas paczki nad rzędem przystanków, oba w tym samym min-w, żeby kolumny się kryły */}
      <div className="overflow-x-auto">
        <div className="min-w-[560px]">
          {/* Pas paczki */}
          <div className="flex items-end">
            {STATIONS.map((station, index) => (
              <Fragment key={station.id}>
                <div className="flex h-10 flex-1 items-end justify-center">
                  {running && active === index && (
                    <motion.div
                      layout
                      layoutId="packet"
                      transition={{ duration: 0.22, ease: 'easeInOut' }}
                      className="inline-flex items-center gap-1 border-2 bg-background px-2 py-1 text-[11px] font-bold"
                      style={{ borderColor: color, color }}
                    >
                      {leg === 'out' ? (
                        <>
                          {config.outPill}
                          <ArrowRight className="h-3.5 w-3.5" aria-hidden />
                        </>
                      ) : (
                        <>
                          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
                          {config.inPill}
                        </>
                      )}
                    </motion.div>
                  )}
                </div>
                {index < STATIONS.length - 1 && <div className="w-7 shrink-0" aria-hidden />}
              </Fragment>
            ))}
          </div>

          {/* Rząd przystanków + odcinki „kabla" między nimi */}
          <div className="flex items-stretch">
            {STATIONS.map((station, index) => {
              const Icon = stationIcon(index);
              const isActive = active === index;
              const isLit = visited.has(index);
              const wireLit = visited.has(index) && visited.has(index + 1);
              return (
                <Fragment key={station.id}>
                  <div
                    className={cn(
                      'flex flex-1 flex-col items-center gap-1 border p-2 text-center transition-colors',
                      isActive && 'shadow-sm'
                    )}
                    style={
                      isActive
                        ? { borderColor: color, backgroundColor: `${color}12` }
                        : isLit
                          ? { borderColor: `${color}66` }
                          : undefined
                    }
                  >
                    <Icon
                      className="h-6 w-6 shrink-0"
                      style={{ color: isLit || isActive ? color : 'var(--muted-foreground)' }}
                      aria-hidden
                    />
                    <span className="text-[12px] font-semibold leading-tight">{stationLabel(index)}</span>
                    <span className="text-[10px] leading-tight text-muted-foreground">
                      {stationSub(index)}
                    </span>
                  </div>
                  {index < STATIONS.length - 1 && (
                    <div className="flex w-7 shrink-0 items-center">
                      <span
                        className="h-0.5 w-full transition-colors"
                        style={{ backgroundColor: wireLit ? color : `${color}33` }}
                        aria-hidden
                      />
                    </div>
                  )}
                </Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Sterowanie + status */}
      <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="button"
          onClick={send}
          disabled={running}
          className={cn(
            'inline-flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold transition-colors',
            running ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-muted/50'
          )}
          style={{ borderColor: color, color }}
        >
          <Send className="h-4 w-4" aria-hidden />
          {running ? 'W drodze…' : showResult ? 'Wyślij jeszcze raz' : 'Wyślij'}
        </button>
        <p className="min-h-[2.5rem] flex-1 text-sm leading-relaxed text-muted-foreground">
          {running
            ? leg === 'out'
              ? config.outStatus
              : config.inStatus
            : showResult
              ? config.resultStatus
              : 'Wybierz, co wysłać, i kliknij „Wyślij”. Patrz, przez które przystanki idzie paczka.'}
        </p>
      </div>

      {/* Wynik podróży */}
      <AnimatePresence mode="wait">
        {showResult && (
          <motion.div
            key={scenario}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 flex items-center gap-3 border-l-2 pl-3"
            style={{ borderColor: color }}
          >
            {scenario === 'strona' ? (
              <div className="w-24 shrink-0 border bg-background p-1.5" aria-hidden>
                <div className="mb-1 h-1.5 w-2/3" style={{ backgroundColor: color }} />
                <div className="mb-1 h-1 w-full bg-muted" />
                <div className="mb-1 h-1 w-full bg-muted" />
                <div className="h-1 w-3/4 bg-muted" />
              </div>
            ) : (
              <div
                className="shrink-0 border-2 px-3 py-2 text-sm font-bold"
                style={{ borderColor: color, color }}
                aria-hidden
              >
                Cześć! 👋
              </div>
            )}
            <p className="text-sm leading-relaxed">
              {scenario === 'strona'
                ? 'To, co teraz widzisz w oknie, to właśnie taka kopia. Za sekundę serwer nie pamięta, że ci ją wysłał.'
                : 'Ta sama droga, te same przystanki. Sieć nie odróżnia „strony” od „wiadomości” — dla niej to po prostu paczki danych.'}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Domknięcie po obu scenariuszach */}
      <AnimatePresence>
        {finished && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 space-y-3 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              <strong>Za każdym razem to ta sama droga:</strong> twoje urządzenie → router → dostawca
              internetu → internet → drugi komputer, a potem wszystko wraca. Tak działa sieć —
              komputery, które podają sobie paczki danych.
            </p>
            <p>
              <strong>Internet to nie jedno miejsce.</strong> To miliony sieci — domowych, szkolnych,
              firmowych — połączonych ze sobą. Samo słowo znaczy dosłownie „między-sieć”.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
