'use client';

import { useState, type ReactNode } from 'react';
import { Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { MED_COUNTRIES, MED_LAND } from '../grecja-gory-i-morze/geo-srodziemne';
import { IMPERIUM_REGIONS, IMPERIUM_STAGES } from '../od-wioski-do-imperium/geo-imperium';
import { judgeLargest } from '../od-wioski-do-imperium/imperium';
import {
  AXIS_EVENTS,
  CENTURY_ITEMS,
  EGYPT_ITEMS,
  EGYPT_NEED,
  OPINION_TEXT,
  PLAN_SIGNS,
  SOURCES,
  STREET_ITEMS,
  STREET_NEED,
  WITNESSES,
  YEARS_FROM,
  YEARS_TO,
  judgeAxis,
  judgeCenturies,
  judgeCountry,
  judgeEgypt,
  judgeFlag,
  judgeOpinion,
  judgeSign,
  judgeSources,
  judgeStreet,
  judgeWitness,
  judgeYears,
  type MapSign,
  type SourceKind,
} from './zadania';
import { useTest } from './test-state';

const btn = 'border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-40';
const tile = 'border-2 bg-white px-2.5 py-1.5 text-left text-sm dark:bg-zinc-900';

/** Ramka zadania: treść do wykonania albo — po jedynej próbie — wynik z wyjaśnieniem. */
export function QuizTask({
  id,
  n,
  color,
  title,
  explain,
  children,
}: {
  id: string;
  n: number;
  color: string;
  title: ReactNode;
  explain: ReactNode;
  children: (answer: (ok: boolean) => void) => ReactNode;
}) {
  const { results, answer } = useTest();
  const done = id in results;
  const ok = results[id];
  return (
    <section className="border bg-white p-3 dark:bg-zinc-900 sm:p-4" aria-label={`Zadanie ${n}`}>
      <p className="mb-2 text-sm">
        <span className="mr-2 font-mono text-xs font-bold tabular-nums" style={{ color }}>
          {String(n).padStart(2, '0')}
        </span>
        {title}
      </p>
      {!done ? (
        children((v) => answer(id, v))
      ) : (
        <div className="flex gap-2 text-sm leading-relaxed">
          {ok ? (
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-700 dark:text-green-400" aria-label="dobrze" />
          ) : (
            <X className="mt-0.5 h-4 w-4 shrink-0 text-destructive" aria-label="nie tym razem" />
          )}
          <span>
            <strong>{ok ? 'Dobrze.' : 'Nie tym razem.'}</strong> {explain}
          </span>
        </div>
      )}
    </section>
  );
}

type Answer = (ok: boolean) => void;

// ─── A. Czas ────────────────────────────────────────────────────────────────

export function AxisTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [order, setOrder] = useState<string[]>([]);
  const tap = (id: string) => setOrder((o) => (o.includes(id) ? o.filter((x) => x !== id) : [...o, id]));
  return (
    <div className="space-y-2">
      <div className="grid gap-1.5 sm:grid-cols-2">
        {AXIS_EVENTS.map((e) => {
          const k = order.indexOf(e.id);
          return (
            <button key={e.id} type="button" onClick={() => tap(e.id)} className={cn(tile, 'flex items-center gap-2')} style={k >= 0 ? { borderColor: color } : undefined}>
              <span className="w-5 shrink-0 font-mono font-bold tabular-nums" style={{ color }}>
                {k >= 0 ? k + 1 : '·'}
              </span>
              <span>
                {e.label} <span className="text-xs text-muted-foreground">({e.when})</span>
              </span>
            </button>
          );
        })}
      </div>
      <button type="button" className={btn} style={{ borderColor: color, color }} disabled={order.length < AXIS_EVENTS.length} onClick={() => onAnswer(judgeAxis(order))}>
        Zatwierdź kolejność
      </button>
    </div>
  );
}

export function YearsTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [v, setV] = useState('');
  return (
    <div className="flex flex-wrap items-center gap-2">
      <input
        inputMode="numeric"
        value={v}
        onChange={(e) => setV(e.target.value.replace(/[^0-9]/g, '').slice(0, 5))}
        aria-label={`Ile lat minęło od ${-YEARS_FROM} p.n.e. do ${YEARS_TO} n.e.`}
        className="w-28 border-2 bg-white px-2 py-1.5 text-right font-mono text-lg tabular-nums dark:bg-zinc-900"
      />
      <span className="text-sm">lat</span>
      <button type="button" className={btn} style={{ borderColor: color, color }} disabled={!v} onClick={() => onAnswer(judgeYears(v))}>
        Zatwierdź
      </button>
    </div>
  );
}

export function CenturiesTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [picked, setPicked] = useState<Record<string, string>>({});
  return (
    <div className="space-y-2">
      {CENTURY_ITEMS.map((c) => (
        <div key={c.id} className="flex flex-wrap items-center gap-1.5">
          <span className="w-24 font-semibold tabular-nums">{c.year}</span>
          {c.options.map((o) => (
            <button
              key={o}
              type="button"
              aria-pressed={picked[c.id] === o}
              onClick={() => setPicked((p) => ({ ...p, [c.id]: o }))}
              className={cn(tile, 'px-2 py-1', picked[c.id] === o && 'font-semibold')}
              style={picked[c.id] === o ? { borderColor: color } : undefined}
            >
              {o}
            </button>
          ))}
        </div>
      ))}
      <button type="button" className={btn} style={{ borderColor: color, color }} disabled={Object.keys(picked).length < CENTURY_ITEMS.length} onClick={() => onAnswer(judgeCenturies(picked))}>
        Zatwierdź
      </button>
    </div>
  );
}

// ─── B. Ślady ───────────────────────────────────────────────────────────────

const KINDS: { id: SourceKind; label: string }[] = [
  { id: 'pisane', label: 'pisane' },
  { id: 'niepisane', label: 'niepisane' },
  { id: 'niematerialne', label: 'niematerialne' },
];

export function SourcesTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [picked, setPicked] = useState<Record<string, SourceKind>>({});
  return (
    <div className="space-y-2">
      {SOURCES.map((s) => (
        <div key={s.id} className="space-y-1 border-b pb-2 last:border-b-0">
          <p className="text-sm">{s.name}</p>
          <div className="flex flex-wrap gap-1.5">
            {KINDS.map((k) => (
              <button
                key={k.id}
                type="button"
                aria-pressed={picked[s.id] === k.id}
                onClick={() => setPicked((p) => ({ ...p, [s.id]: k.id }))}
                className={cn(tile, 'px-2 py-1', picked[s.id] === k.id && 'font-semibold')}
                style={picked[s.id] === k.id ? { borderColor: color } : undefined}
              >
                {k.label}
              </button>
            ))}
          </div>
        </div>
      ))}
      <button type="button" className={btn} style={{ borderColor: color, color }} disabled={Object.keys(picked).length < SOURCES.length} onClick={() => onAnswer(judgeSources(picked))}>
        Przepuść przez bramki
      </button>
    </div>
  );
}

export function OpinionTask({ onAnswer }: { onAnswer: Answer }) {
  return (
    <p className="border-l-2 bg-[#fbf6e9] p-3 font-serif text-[15px] leading-relaxed dark:bg-zinc-800">
      {OPINION_TEXT.map((o) => (
        <button key={o.id} type="button" onClick={() => onAnswer(judgeOpinion(o.id))} className="mr-1 rounded-sm px-0.5 text-left hover:bg-amber-200/50">
          {o.text}
        </button>
      ))}
    </p>
  );
}

export function WitnessTask({ onAnswer }: { onAnswer: Answer }) {
  return (
    <div className="grid gap-1.5 sm:grid-cols-2">
      {WITNESSES.map((w) => (
        <button key={w.id} type="button" onClick={() => onAnswer(judgeWitness(w.id))} className={tile}>
          {w.name}
        </button>
      ))}
    </div>
  );
}

// ─── C. Mapa i miejsce ──────────────────────────────────────────────────────

function SignGlyph({ sign, x, y }: { sign: MapSign; x: number; y: number }) {
  switch (sign) {
    case 'zamek':
      return <path d={`M${x - 7},${y + 6} L${x - 7},${y - 4} L${x - 4},${y - 4} L${x - 4},${y - 1} L${x - 1},${y - 1} L${x - 1},${y - 4} L${x + 2},${y - 4} L${x + 2},${y - 1} L${x + 5},${y - 1} L${x + 5},${y - 4} L${x + 7},${y - 4} L${x + 7},${y + 6} Z`} fill="#2b2b2b" />;
    case 'kosciol':
      return <path d={`M${x - 1.5},${y - 8} h3 v5 h5 v3 h-5 v8 h-3 v-8 h-5 v-3 h5 Z`} fill="#2b2b2b" />;
    case 'mlyn':
      return (
        <g stroke="#2b2b2b" strokeWidth={1.6} fill="#fff">
          <circle cx={x} cy={y} r={7} />
          <path d={`M${x - 7},${y} H${x + 7} M${x},${y - 7} V${y + 7}`} />
        </g>
      );
    case 'most':
      return <path d={`M${x - 9},${y - 3} H${x + 9} M${x - 9},${y + 3} H${x + 9}`} stroke="#2b2b2b" strokeWidth={2} />;
  }
}

export function PlanTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const legend: { sign: MapSign; label: string }[] = [
    { sign: 'zamek', label: 'zamek' },
    { sign: 'kosciol', label: 'kościół' },
    { sign: 'mlyn', label: 'młyn wodny' },
    { sign: 'most', label: 'most' },
  ];
  return (
    <div className="grid gap-3 sm:grid-cols-[1fr_150px]">
      <svg viewBox="0 0 220 130" className="block h-auto w-full max-w-[420px] border bg-[#f4f1e4]" aria-label="Plan wymyślonej wsi ze znakami">
        <path d="M0,88 C60,70 120,110 220,82" fill="none" stroke="#7fb2d1" strokeWidth={8} />
        {PLAN_SIGNS.map((s) => (
          <g key={s.id} onClick={() => onAnswer(judgeSign(s.id))} className="cursor-pointer">
            <circle cx={s.x} cy={s.y} r={14} fill="transparent" />
            <SignGlyph sign={s.sign} x={s.x} y={s.y} />
          </g>
        ))}
      </svg>
      <ul className="space-y-1 text-sm" aria-label="Legenda">
        <li className="text-xs font-semibold uppercase tracking-wide" style={{ color }}>
          Legenda
        </li>
        {legend.map((l) => (
          <li key={l.sign} className="flex items-center gap-2">
            <svg viewBox="-10 -10 20 20" className="h-5 w-5" aria-hidden>
              <SignGlyph sign={l.sign} x={0} y={0} />
            </svg>
            {l.label}
          </li>
        ))}
      </ul>
    </div>
  );
}

const COLONY_COUNTRIES = ['ITA', 'GRC', 'TUR', 'TUN', 'LBY', 'ALB', 'MLT'];

export function ColonyTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [hover, setHover] = useState<string | null>(null);
  return (
    <div className="mx-auto max-w-[560px] border bg-[#dbe8ef]">
      <svg viewBox="215 190 230 170" className="block h-auto w-full select-none" role="img" aria-label="Mapa środkowej części Morza Śródziemnego z dzisiejszymi państwami">
        <path d={MED_LAND} fill="#efe8d6" stroke="#b8ab8a" strokeWidth={0.4} />
        {MED_COUNTRIES.filter((c) => COLONY_COUNTRIES.includes(c.id)).map((c) => (
          <path
            key={c.id}
            d={c.d}
            fill={hover === c.id ? color : '#efe8d6'}
            fillOpacity={hover === c.id ? 0.35 : 1}
            stroke="#8a7d60"
            strokeWidth={0.5}
            onPointerEnter={() => setHover(c.id)}
            onPointerLeave={() => setHover(null)}
            onClick={() => onAnswer(judgeCountry(c.id))}
            className="cursor-pointer"
          >
            <title>{c.name}</title>
          </path>
        ))}
      </svg>
    </div>
  );
}

export function ReachTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [i, setI] = useState(0);
  const stage = IMPERIUM_STAGES[i];
  return (
    <div className="space-y-2">
      <div className="mx-auto max-w-[560px] border bg-[#dbe8ef]">
        <svg viewBox="0 120 600 300" className="block h-auto w-full select-none" role="img" aria-label={`Zasięg Rzymu: ${stage.year < 0 ? `${-stage.year} p.n.e.` : `${stage.year} n.e.`}`}>
          <defs>
            <clipPath id="tk-land">
              <path d={MED_LAND} />
            </clipPath>
          </defs>
          <path d={MED_LAND} fill="#efe8d6" stroke="#b8ab8a" strokeWidth={0.5} />
          <g clipPath="url(#tk-land)">
            {stage.regions.map((r) => (
              <path key={r} d={IMPERIUM_REGIONS[r]} fill={color} opacity={0.5} />
            ))}
          </g>
        </svg>
      </div>
      <label className="block text-sm">
        Rok: <strong className="tabular-nums">{stage.year < 0 ? `${-stage.year} p.n.e.` : `${stage.year} n.e.`}</strong>
        <input
          type="range"
          min={0}
          max={IMPERIUM_STAGES.length - 1}
          value={i}
          onChange={(e) => setI(Number(e.target.value))}
          className="block w-full cursor-ew-resize"
          style={{ accentColor: color }}
          aria-label="Suwak lat"
        />
      </label>
      <button type="button" className={btn} style={{ borderColor: color, color }} onClick={() => onAnswer(judgeLargest(stage.year).ok)}>
        To jest największy zasięg
      </button>
    </div>
  );
}

// ─── D. Dziedzictwo ─────────────────────────────────────────────────────────

function PickN({
  color,
  items,
  need,
  cta,
  onAnswer,
  judge,
}: {
  color: string;
  items: readonly { id: string; label: string }[];
  need: number;
  cta: string;
  onAnswer: Answer;
  judge: (picked: string[]) => boolean;
}) {
  const [picked, setPicked] = useState<string[]>([]);
  const tap = (id: string) =>
    setPicked((p) => (p.includes(id) ? p.filter((x) => x !== id) : p.length >= need ? p : [...p, id]));
  return (
    <div className="space-y-2">
      <div className="grid gap-1.5 sm:grid-cols-2">
        {items.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-pressed={picked.includes(s.id)}
            onClick={() => tap(s.id)}
            className={cn(tile, picked.includes(s.id) && 'font-semibold')}
            style={picked.includes(s.id) ? { borderColor: color } : undefined}
          >
            {s.label}
          </button>
        ))}
      </div>
      <button type="button" className={btn} style={{ borderColor: color, color }} disabled={picked.length < need} onClick={() => onAnswer(judge(picked))}>
        {cta} ({picked.length}/{need})
      </button>
    </div>
  );
}

export function StreetTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  return <PickN color={color} items={STREET_ITEMS} need={STREET_NEED} cta="To są ślady" onAnswer={onAnswer} judge={judgeStreet} />;
}

export function EgyptTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  return <PickN color={color} items={EGYPT_ITEMS} need={EGYPT_NEED} cta="To nie z tej epoki" onAnswer={onAnswer} judge={judgeEgypt} />;
}

/** Flaga rysowana kodem: biały i czerwony pas; dziecko obraca drzewce i wiesza. */
export function FlagTask({ color, onAnswer }: { color: string; onAnswer: Answer }) {
  const [whiteTop, setWhiteTop] = useState(false);
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 120 90" className="block h-auto w-40" role="img" aria-label={`Flaga: u góry pas ${whiteTop ? 'biały' : 'czerwony'}`}>
        <rect x={8} y={4} width={3} height={84} fill="#6b5a45" />
        <rect x={11} y={8} width={96} height={30} fill={whiteTop ? '#ffffff' : '#dc143c'} stroke="#999" strokeWidth={0.5} />
        <rect x={11} y={38} width={96} height={30} fill={whiteTop ? '#dc143c' : '#ffffff'} stroke="#999" strokeWidth={0.5} />
      </svg>
      <div className="flex flex-wrap gap-2">
        <button type="button" className="border px-3 py-1.5 text-sm" onClick={() => setWhiteTop((w) => !w)}>
          Obróć flagę
        </button>
        <button type="button" className={btn} style={{ borderColor: color, color }} onClick={() => onAnswer(judgeFlag(whiteTop))}>
          Wywieś
        </button>
      </div>
    </div>
  );
}
