'use client';

import { useRef, useState, type FormEvent, type PointerEvent as ReactPointerEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSectionScrollAnchor } from '../../lesson-shell';
import {
  baseArea,
  boxVolume,
  formatNumber,
  levelForVolume,
  toLitres,
  waterVolume,
} from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';

const TANK: BoxSpec = { width: 30, depth: 20, height: 25 };
const UNIT = 'cm';

/* ── kadr liczony raz, z pełnego akwarium ── */
const VIEW_W = 330;
const VIEW_H = 268;
/** Piksele viewBoxa na jeden centymetr wysokości. */
const PX = 8;
const LEFT = 76;
const RIGHT = 276;
const BOTTOM = 238;
const TOP = BOTTOM - TANK.height * PX;
/** Skos sugerujący głębokość naczynia — samo płaskie prostokątne pole czytałoby się jak wykres. */
const SKEW_X = 24;
const SKEW_Y = -15;

const yFor = (level: number): number => BOTTOM - level * PX;

/** Górna krawędź (prostokąt w rzucie ukośnym) na zadanej wysokości. */
function lidPoints(level: number): string {
  const y = yFor(level);
  return [
    `${LEFT},${y}`,
    `${RIGHT},${y}`,
    `${RIGHT + SKEW_X},${y + SKEW_Y}`,
    `${LEFT + SKEW_X},${y + SKEW_Y}`,
  ].join(' ');
}

interface Round {
  id: string;
  /** `set-level` — zadanie polega na ustawieniu lustra wody; `input` — na wpisaniu liczby. */
  kind: 'set-level' | 'input';
  difficulty: string;
  prompt: string;
  /** Poziom, który trzeba ustawić: cel zadania (`set-level`) albo warunek wstępny (`input`). */
  level: number;
  /** Oczekiwana liczba w polu — tylko `input`. */
  expected?: number;
  answerUnit?: string;
  hint: string;
  moral: string;
}

/** Wszystkie liczby liczy `lib/box-volume.ts` z wymiarów `TANK` — żadna nie jest wpisana ręcznie. */
function buildRounds(): Round[] {
  const pelne = boxVolume(TANK);

  const poziomA = 10;
  const wodaA = waterVolume(TANK, poziomA);

  const litryB = 9;
  const poziomB = levelForVolume(TANK, litryB * 1000);

  const poziomC = 5;
  const wodaC = waterVolume(TANK, poziomC);
  const brakuje = pelne - wodaC;

  return [
    {
      id: 'poziom-na-litry',
      kind: 'input',
      difficulty: 'P',
      prompt: `Ustaw lustro wody na ${poziomA} ${UNIT}. Ile litrów wody jest wtedy w akwarium?`,
      level: poziomA,
      expected: toLitres(wodaA),
      answerUnit: 'l',
      hint: `Tabliczka pokazuje objętość w ${UNIT}³. Litr to 1000 ${UNIT}³, więc wynik trzeba jeszcze podzielić przez 1000.`,
      moral:
        'Woda ma to samo dno co akwarium, więc wystarczy pomnożyć pole podstawy przez poziom — a potem zamienić na litry.',
    },
    {
      id: 'litry-na-poziom',
      kind: 'set-level',
      difficulty: 'R',
      prompt: `Do pustego akwarium wlano ${litryB} litrów wody. Ustaw lustro na właściwej wysokości.`,
      level: poziomB,
      hint: `${litryB} litrów to ${formatNumber(litryB * 1000)} ${UNIT}³. Pytanie brzmi: ile warstw po ${baseArea(TANK)} ${UNIT}³ mieści się w tej liczbie?`,
      moral:
        'To samo działanie od drugiej strony: znasz objętość i pole podstawy, więc wysokość znajdujesz dzieleniem.',
    },
    {
      id: 'ile-jeszcze',
      kind: 'input',
      difficulty: 'D',
      prompt: `Woda stoi na ${poziomC} ${UNIT}. Ile litrów jeszcze się zmieści, żeby akwarium było pełne po brzegi?`,
      level: poziomC,
      expected: toLitres(brakuje),
      answerUnit: 'l',
      hint: `Policz osobno, ile mieści całe akwarium (do ${TANK.height} ${UNIT}), a ile jest w nim teraz. Różnica to odpowiedź.`,
      moral:
        'Pytanie „ile jeszcze” to zawsze odejmowanie dwóch objętości — pełnej i tej, która już jest.',
    },
  ];
}

const ROUNDS = buildRounds();
const FULL_LITRES = toLitres(boxVolume(TANK));

function normalize(value: string): string {
  return value.trim().replace(',', '.');
}

/**
 * Zadanie problemowe: **jeden ruch, dwa odczyty.** Dziecko przeciąga lustro wody
 * w akwarium, a tabliczka obok przelicza poziom na objętość na żywo. Pole
 * podstawy się nie zmienia, więc objętość rośnie liniowo z wysokością — i to
 * widać w ruchu, zanim padnie zdanie.
 *
 * Odróżnia się od widżetów przewodnika o jednostkach objętości: tam sterowało
 * się **podziałem** bryły na kostki (skok co całą kostkę), tu sterowaniem jest
 * **ciągła wysokość** jednej i tej samej bryły. Trzy rundy używają tego samego
 * naczynia w trzech kierunkach: poziom → litry, litry → poziom, i „ile jeszcze".
 *
 * Tabliczka celowo pokazuje wynik w `cm³`, a nie w litrach — inaczej zadania na
 * wpisanie liczby byłyby odczytem z ekranu zamiast przeliczeniem. Litry
 * pojawiają się dopiero w odpowiedzi.
 *
 * Sterowanie: przeciąganie po całym `<svg>` (`setPointerCapture`, `touch-none`),
 * przyciski ▲/▼ i strzałki klawiatury (`role="slider"`). Poziom snapuje do
 * pełnych centymetrów, więc stan jest deterministyczny na serwerze i kliencie.
 */
export function AquariumFill({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [level, setLevel] = useState(0);
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [solved, setSolved] = useState(false);
  const [finished, setFinished] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const round = ROUNDS[Math.min(index, ROUNDS.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${solved}-${finished}`);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const volume = waterVolume(TANK, level);
  const atLevel = level === round.level;
  const levelSolved = round.kind === 'set-level' && atLevel;
  const done = solved || levelSolved;

  const apply = (next: number) => {
    const clamped = Math.min(TANK.height, Math.max(0, Math.round(next)));
    setLevel(clamped);
    setWrong(false);
  };

  const levelFromEvent = (event: ReactPointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return null;
    const rect = svg.getBoundingClientRect();
    if (rect.height === 0) return null;
    const y = ((event.clientY - rect.top) / rect.height) * VIEW_H;
    return (BOTTOM - y) / PX;
  };

  const onPointerDown = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (done) return;
    dragging.current = true;
    svgRef.current?.setPointerCapture(event.pointerId);
    const next = levelFromEvent(event);
    if (next !== null) apply(next);
  };

  const onPointerMove = (event: ReactPointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const next = levelFromEvent(event);
    if (next !== null) apply(next);
  };

  const endDrag = (event: ReactPointerEvent<SVGSVGElement>) => {
    dragging.current = false;
    svgRef.current?.releasePointerCapture?.(event.pointerId);
  };

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (round.expected === undefined) return;
    if (normalize(value) === String(round.expected)) {
      setSolved(true);
      setWrong(false);
      return;
    }
    setWrong(true);
  };

  const goNext = () => {
    setValue('');
    setWrong(false);
    setSolved(false);
    setLevel(0);
    if (index + 1 < ROUNDS.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div
        ref={containerRef}
        className="border-t-2 p-5 sm:p-6"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <p className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: textColor }}>
          <Check className="h-5 w-5 shrink-0" aria-hidden />
          Akwarium opanowane
        </p>
        <p className="text-base leading-relaxed">
          Poziom → litry, litry → poziom i „ile jeszcze”. Za każdym razem chodziło o to samo: pole
          podstawy jest stałe, więc objętość idzie w parze z wysokością wody.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Poziom wymagań{' '}
          <span className="font-mono font-bold" style={{ color }}>
            {round.difficulty}
          </span>
        </p>
        <p className="text-sm text-muted-foreground">
          Zadanie{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {ROUNDS.length}
        </p>
      </div>

      <p className="mb-4 text-base leading-relaxed sm:text-lg">{round.prompt}</p>

      <div className="grid items-center gap-6 md:grid-cols-[minmax(0,340px)_1fr]">
        <div
          role="slider"
          tabIndex={0}
          aria-label="Poziom wody w akwarium, w centymetrach"
          aria-valuemin={0}
          aria-valuemax={TANK.height}
          aria-valuenow={level}
          aria-valuetext={`${level} centymetrów, ${formatNumber(volume)} centymetrów sześciennych`}
          onKeyDown={(event) => {
            if (done) return;
            if (event.key === 'ArrowUp' || event.key === 'ArrowRight') {
              event.preventDefault();
              apply(level + 1);
            }
            if (event.key === 'ArrowDown' || event.key === 'ArrowLeft') {
              event.preventDefault();
              apply(level - 1);
            }
          }}
          className="mx-auto w-full max-w-[340px] outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
          style={{ ['--tw-ring-color' as string]: color }}
        >
          <svg
            ref={svgRef}
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            className="h-auto w-full touch-none select-none"
            style={{ cursor: done ? 'default' : 'ns-resize' }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={endDrag}
            onPointerLeave={endDrag}
            role="presentation"
          >
            {/* Niewidoczny cel na cały kadr — przeciąganie łapie też poza samą taflą. */}
            <rect x={0} y={0} width={VIEW_W} height={VIEW_H} fill="#fff" fillOpacity={0.001} />

            {/* Podziałka wysokości */}
            <g stroke={color} strokeOpacity={0.45} strokeWidth={1}>
              <line x1={LEFT - 12} y1={TOP} x2={LEFT - 12} y2={BOTTOM} />
              {Array.from({ length: TANK.height / 5 + 1 }, (_, i) => i * 5).map((cm) => (
                <line key={cm} x1={LEFT - 17} y1={yFor(cm)} x2={LEFT - 12} y2={yFor(cm)} />
              ))}
            </g>
            {Array.from({ length: TANK.height / 5 + 1 }, (_, i) => i * 5).map((cm) => (
              <text
                key={cm}
                x={LEFT - 21}
                y={yFor(cm) + 4}
                textAnchor="end"
                className="font-mono text-[10px] tabular-nums"
                fill="currentColor"
                fillOpacity={0.55}
              >
                {cm}
              </text>
            ))}

            {/* Woda: prostopadłościan o podstawie akwarium i wysokości równej poziomowi */}
            {level > 0 && (
              <g>
                <rect
                  x={LEFT}
                  y={yFor(level)}
                  width={RIGHT - LEFT}
                  height={level * PX}
                  fill={color}
                  fillOpacity={0.28}
                />
                <polygon points={lidPoints(level)} fill={color} fillOpacity={0.45} />
                <polygon
                  points={`${RIGHT},${BOTTOM} ${RIGHT},${yFor(level)} ${RIGHT + SKEW_X},${yFor(level) + SKEW_Y} ${RIGHT + SKEW_X},${BOTTOM + SKEW_Y}`}
                  fill={color}
                  fillOpacity={0.18}
                />
              </g>
            )}

            {/* Ścianki naczynia — rysowane po wodzie, żeby woda ich nie przykryła */}
            <g fill="none" stroke={color} strokeWidth={2.5} strokeLinejoin="round">
              <polyline points={`${LEFT},${TOP} ${LEFT},${BOTTOM} ${RIGHT},${BOTTOM} ${RIGHT},${TOP}`} />
              <polyline
                points={`${LEFT + SKEW_X},${TOP + SKEW_Y} ${LEFT + SKEW_X},${BOTTOM + SKEW_Y} ${RIGHT + SKEW_X},${BOTTOM + SKEW_Y} ${RIGHT + SKEW_X},${TOP + SKEW_Y}`}
                strokeOpacity={0.35}
              />
              <line x1={LEFT} y1={BOTTOM} x2={LEFT + SKEW_X} y2={BOTTOM + SKEW_Y} strokeOpacity={0.35} />
              <line x1={RIGHT} y1={BOTTOM} x2={RIGHT + SKEW_X} y2={BOTTOM + SKEW_Y} strokeOpacity={0.35} />
              <line x1={LEFT} y1={TOP} x2={LEFT + SKEW_X} y2={TOP + SKEW_Y} />
              <line x1={RIGHT} y1={TOP} x2={RIGHT + SKEW_X} y2={TOP + SKEW_Y} />
              <polygon points={lidPoints(TANK.height)} fill="none" />
            </g>

            {/* Uchwyt lustra wody — rysowany W ŚRODKU kadru, który łapie pointer */}
            <motion.g
              animate={{ y: yFor(level) - BOTTOM }}
              initial={false}
              transition={{ type: 'spring', stiffness: 340, damping: 30 }}
            >
              <line
                x1={LEFT}
                y1={BOTTOM}
                x2={RIGHT}
                y2={BOTTOM}
                stroke={color}
                strokeWidth={3}
                strokeLinecap="round"
              />
              <g transform={`translate(${RIGHT + SKEW_X / 2}, ${BOTTOM + SKEW_Y / 2})`}>
                <rect x={-13} y={-8} width={26} height={16} rx={2} fill={color} />
                <line x1={-6} y1={-3} x2={6} y2={-3} stroke="#fff" strokeOpacity={0.8} strokeWidth={1.5} />
                <line x1={-6} y1={3} x2={6} y2={3} stroke="#fff" strokeOpacity={0.8} strokeWidth={1.5} />
              </g>
            </motion.g>

            {/* Wymiary dna — pole podstawy jest niezmiennikiem całego zadania */}
            <text
              x={(LEFT + RIGHT) / 2}
              y={BOTTOM + 22}
              textAnchor="middle"
              className="font-mono text-[11px] tabular-nums"
              fill="currentColor"
              fillOpacity={0.6}
            >
              {TANK.width} {UNIT} × {TANK.depth} {UNIT}
            </text>
          </svg>
        </div>

        <div>
          {/* Tabliczka: poziom i objętość w cm³. Litry zostają zadaniem dziecka. */}
          <div className="border-t-2 p-4" style={{ borderColor: color, backgroundColor: `${color}0f` }}>
            <p className="mb-1 text-xs font-bold uppercase tracking-[0.15em]" style={{ color: textColor }}>
              Tabliczka
            </p>
            <p className="font-mono text-sm tabular-nums text-muted-foreground">
              poziom{' '}
              <span className="text-base font-bold" style={{ color }}>
                {level} {UNIT}
              </span>
            </p>
            <p className="mt-1 font-mono text-sm tabular-nums">
              {baseArea(TANK)} · {level} ={' '}
              <span className="text-xl font-black" style={{ color }}>
                {formatNumber(volume)}
              </span>{' '}
              <span className="text-muted-foreground">{UNIT}³</span>
            </p>
          </div>

          <div className="mt-3 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => apply(level - 1)}
              disabled={done || level === 0}
              aria-label="Obniż poziom wody o centymetr"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
            >
              <ChevronDown className="h-4 w-4" aria-hidden />
            </button>
            <span className="text-sm text-muted-foreground">Przeciągnij taflę albo użyj strzałek</span>
            <button
              type="button"
              onClick={() => apply(level + 1)}
              disabled={done || level === TANK.height}
              aria-label="Podnieś poziom wody o centymetr"
              className="flex h-9 w-9 cursor-pointer items-center justify-center border transition-colors hover:bg-black/5 disabled:cursor-not-allowed disabled:opacity-40 dark:hover:bg-white/10"
            >
              <ChevronUp className="h-4 w-4" aria-hidden />
            </button>
          </div>

          {round.kind === 'input' && (
            <form onSubmit={submit} className="mt-4">
              <label className="mb-2 block text-sm font-semibold" htmlFor="aquarium-answer">
                Twoja odpowiedź
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  id="aquarium-answer"
                  value={value}
                  onChange={(event) => setValue(event.target.value)}
                  disabled={!atLevel || done}
                  inputMode="decimal"
                  placeholder={atLevel ? 'wpisz liczbę' : `najpierw ustaw ${round.level} ${UNIT}`}
                  className="w-40 font-mono tabular-nums"
                />
                <span className="text-sm text-muted-foreground">{round.answerUnit}</span>
                <Button type="submit" disabled={!atLevel || done} style={done ? undefined : { backgroundColor: color }}>
                  Sprawdź
                </Button>
              </div>
            </form>
          )}

          <AnimatePresence mode="wait">
            {wrong && (
              <motion.p
                key="wrong"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                Jeszcze nie. {round.hint}
              </motion.p>
            )}
            {!wrong && !done && round.kind === 'set-level' && (
              <motion.p
                key="hint"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {round.hint}
              </motion.p>
            )}
            {done && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p className="flex items-center gap-2 font-semibold" style={{ color: textColor }}>
                  <Check className="h-4 w-4 shrink-0" aria-hidden />
                  Zgadza się
                </p>
                <p className="mt-1 text-sm leading-relaxed">{round.moral}</p>
                <Button onClick={goNext} className="mt-3" style={{ backgroundColor: color }}>
                  {index + 1 < ROUNDS.length ? 'Następne zadanie' : 'Gotowe'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ul className="sr-only">
        <li>
          Akwarium ma dno {TANK.width} × {TANK.depth} {UNIT}, czyli pole podstawy {baseArea(TANK)}{' '}
          {UNIT}², i {TANK.height} {UNIT} wysokości, więc pełne mieści {formatNumber(boxVolume(TANK))}{' '}
          {UNIT}³, czyli {formatNumber(FULL_LITRES)} litrów.
        </li>
        {ROUNDS.map((item) => (
          <li key={item.id}>
            {item.prompt} Poziom {item.level} {UNIT} to {formatNumber(waterVolume(TANK, item.level))}{' '}
            {UNIT}³. {item.moral}
          </li>
        ))}
      </ul>
    </div>
  );
}
