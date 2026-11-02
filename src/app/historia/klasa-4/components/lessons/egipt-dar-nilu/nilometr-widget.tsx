'use client';

import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  FIELD_HEIGHTS,
  FLOOD_YEARS,
  RULE_LABELS,
  SCALE_MAX,
  SCALE_MIN,
  VILLAGE_HEIGHT,
  floodOutcome,
  judgeReading,
  judgeRuleLabel,
  type FloodOutcome,
  type RuleLabel,
} from './nil';

/**
 * Blok 1, części B i C — **nilometr**. Woda wspina się po schodkach; dziecko
 * przeciąga trzcinowy znacznik do linii wody i odczytuje łokcie. Dopiero
 * potem odsłania się przekrój pól na tej samej skali i widać skutek. Po trzech
 * latach dziecko przykłada trzy tabliczki do schodków — sędzią jest ten sam
 * mechanizm (ile pól dostało wodę, czy woda weszła do wioski).
 */
const H = 260;
const TOP = 16;
const BOTTOM = 244;
const yOf = (lvl: number) => BOTTOM - ((lvl - SCALE_MIN) / (SCALE_MAX - SCALE_MIN)) * (BOTTOM - TOP);
const lvlOf = (y: number) => SCALE_MIN + ((BOTTOM - y) / (BOTTOM - TOP)) * (SCALE_MAX - SCALE_MIN);
const round1 = (n: number) => Math.round(n * 2) / 2;

const KIND_TEXT: Record<FloodOutcome['kind'], string> = {
  glod: 'głód — woda nie doszła do żadnego pola',
  bieda: 'chudy rok',
  dobry: 'dobry rok — woda na polach, wioska sucha',
  zalanie: 'woda w wiosce — domy z cegły mułowej rozmakają',
};

export function NilometrWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [year, setYear] = useState(0);
  const [water, setWater] = useState(SCALE_MIN);
  const [marker, setMarker] = useState(SCALE_MIN + 1);
  const [revealed, setRevealed] = useState(false);
  const [miss, setMiss] = useState<string | null>(null);
  const [outcomes, setOutcomes] = useState<FloodOutcome[]>([]);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);
  const level = FLOOD_YEARS[year] ?? FLOOD_YEARS[FLOOD_YEARS.length - 1];
  const allRead = outcomes.length === FLOOD_YEARS.length;

  // Woda wspina się po schodkach do poziomu tego roku.
  useEffect(() => {
    if (allRead) return;
    let raf = 0;
    const start = performance.now();
    const from = SCALE_MIN;
    const tick = (now: number) => {
      const k = Math.min(1, (now - start) / 2600);
      setWater(from + (level - from) * (1 - Math.pow(1 - k, 2)));
      if (k < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [level, allRead]);

  const setFromPointer = (e: PointerEvent<SVGSVGElement>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const box = svg.getBoundingClientRect();
    const y = ((e.clientY - box.top) / box.height) * H;
    setMarker(Math.max(SCALE_MIN, Math.min(SCALE_MAX, round1(lvlOf(y)))));
  };

  const onKey = (e: KeyboardEvent<SVGSVGElement>) => {
    if (revealed || allRead) return;
    if (e.key === 'ArrowUp') setMarker((m) => Math.min(SCALE_MAX, m + 0.5));
    else if (e.key === 'ArrowDown') setMarker((m) => Math.max(SCALE_MIN, m - 0.5));
    else return;
    e.preventDefault();
  };

  const read = () => {
    if (Math.abs(water - level) > 0.05) {
      setMiss('Poczekaj, aż woda przestanie się podnosić.');
      return;
    }
    if (!judgeReading(marker, level)) {
      setMiss(
        marker > level
          ? `Twoja trzcina stoi na ${marker} łokciach — wyżej niż woda. Zsuń ją do linii wody.`
          : `Twoja trzcina stoi na ${marker} łokciach — niżej niż woda. Podnieś ją do linii wody.`
      );
      return;
    }
    setMiss(null);
    setRevealed(true);
    setOutcomes((prev) => [...prev, floodOutcome(level)]);
  };

  const nextYear = () => {
    setRevealed(false);
    setWater(SCALE_MIN);
    setMarker(SCALE_MIN + 1);
    setYear((y) => y + 1);
  };

  const shownWater = allRead ? SCALE_MIN : water;
  const outcome = revealed ? floodOutcome(level) : null;

  return (
    <div className="space-y-4">
      {!allRead && (
        <p className="text-sm leading-relaxed">
          <strong>Rok {year + 1} z 3.</strong> Kapłan przy nilometrze patrzy, jak wysoko woda wejdzie po
          schodkach. Pola są daleko — stąd ich nie widać. <strong>Przeciągnij trzcinę</strong> (żółty znacznik)
          do linii wody i odczytaj, ile to łokci. Łokieć to około pół metra.
        </p>
      )}

      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <svg
          ref={svgRef}
          viewBox={`0 0 220 ${H}`}
          className="w-full max-w-[320px] cursor-ns-resize touch-none border bg-amber-50/60 outline-none focus-visible:ring-2 dark:bg-zinc-900"
          role="slider"
          aria-label="Trzcina na skali nilometru (łokcie)"
          aria-valuemin={SCALE_MIN}
          aria-valuemax={SCALE_MAX}
          aria-valuenow={marker}
          tabIndex={0}
          onKeyDown={onKey}
          onPointerDown={(e) => {
            if (revealed || allRead) return;
            dragging.current = true;
            e.currentTarget.setPointerCapture(e.pointerId);
            setFromPointer(e);
          }}
          onPointerMove={(e) => dragging.current && setFromPointer(e)}
          onPointerUp={() => (dragging.current = false)}
          onPointerCancel={() => (dragging.current = false)}
        >
          {/* schodki */}
          {Array.from({ length: SCALE_MAX - SCALE_MIN }, (_, i) => {
            const lvl = SCALE_MIN + i;
            const x = 40 + i * 9;
            return <rect key={lvl} x={x} y={yOf(lvl + 1)} width={220 - x} height={yOf(lvl) - yOf(lvl + 1)} fill="#dcc79c" stroke="#b79d6a" strokeWidth="0.6" />;
          })}
          {/* skala w łokciach */}
          {Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => {
            const lvl = SCALE_MIN + i;
            return (
              <g key={lvl}>
                <line x1="22" x2="40" y1={yOf(lvl)} y2={yOf(lvl)} stroke="#5b4a2a" strokeWidth="1" />
                <text x="2" y={yOf(lvl) + 3.5} fontSize="10" fill="#5b4a2a">
                  {lvl}
                </text>
              </g>
            );
          })}
          {/* woda */}
          <rect x="0" y={yOf(shownWater)} width="220" height={H - yOf(shownWater)} fill="#6f9fbf" opacity="0.72" />
          {/* trzcina */}
          {!allRead && (
            <g>
              <line x1="18" x2="220" y1={yOf(marker)} y2={yOf(marker)} stroke="#d4a017" strokeWidth="2" strokeDasharray="5 3" />
              <polygon points={`20,${yOf(marker)} 32,${yOf(marker) - 7} 32,${yOf(marker) + 7}`} fill="#d4a017" />
              <text x="150" y={yOf(marker) - 5} fontSize="11" fontWeight="bold" fill="#7a5a00">
                {marker} łokci
              </text>
            </g>
          )}
        </svg>

        {/* przekrój pól na tej samej skali — odsłania się po odczycie */}
        <div className="min-w-0">
          {revealed && outcome ? (
            <FieldsSection level={level} color={color} />
          ) : !allRead ? (
            <div className="flex h-full min-h-[120px] items-center justify-center border border-dashed p-4 text-center text-sm text-muted-foreground">
              Tu zobaczysz pola i wioskę — po odczycie.
            </div>
          ) : null}
        </div>
      </div>

      {!allRead && !revealed && (
        <button type="button" onClick={read} className="border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: color }}>
          Odczytaj nilometr
        </button>
      )}
      {miss && (
        <p className="text-sm text-destructive" role="status">
          {miss}
        </p>
      )}
      {revealed && outcome && (
        <div className="border-l-4 p-3 text-sm" style={{ borderColor: color }} role="status">
          <p>
            <strong>{level} łokci:</strong> woda na {outcome.fields} z {FIELD_HEIGHTS.length} pól
            {outcome.village ? ' i w wiosce' : ''} — {KIND_TEXT[outcome.kind]}.
          </p>
          {year < FLOOD_YEARS.length - 1 && (
            <button type="button" onClick={nextYear} className="mt-2 border px-3 py-1.5 text-sm">
              Następny rok
            </button>
          )}
        </div>
      )}

      {allRead && <RuleLabels color={color} outcomes={outcomes} onDone={onDone} />}
    </div>
  );
}

function FieldsSection({ level, color }: { level: number; color: string }) {
  const terraces = FIELD_HEIGHTS.map((h, i) => ({ h, x: 150 - i * 34 }));
  return (
    <svg viewBox={`0 0 220 ${H}`} className="w-full max-w-[320px] border bg-amber-50/60 dark:bg-zinc-900" role="img" aria-label={`Pola i wioska przy ${level} łokciach`}>
      <rect x="0" y={yOf(level)} width="220" height={H - yOf(level)} fill="#6f9fbf" opacity="0.75" />
      <rect x="0" y={yOf(11)} width="184" height={H - yOf(11)} fill="#9a7a4f" />
      <rect x="184" y={yOf(SCALE_MIN) + 6} width="36" height={H - yOf(SCALE_MIN) - 6} fill="#7d6442" />
      {terraces.map(({ h, x }, i) => (
        <g key={h}>
          <rect x={x} y={yOf(h)} width={34} height={H - yOf(h)} fill="#b8925c" />
          <rect x={x} y={yOf(h) - 4} width={34} height={4} fill={level >= h ? '#4f9a3c' : '#d8b878'} />
          <text x={x + 17} y={yOf(h) + 14} fontSize="9" textAnchor="middle" fill="#fff">
            pole {FIELD_HEIGHTS.length - i}
          </text>
        </g>
      ))}
      <rect x="0" y={yOf(VILLAGE_HEIGHT)} width="16" height={H - yOf(VILLAGE_HEIGHT)} fill="#a98457" />
      <rect x="2" y={yOf(VILLAGE_HEIGHT) - 16} width="12" height="16" fill={level >= VILLAGE_HEIGHT ? '#8a6a48' : '#e2c896'} stroke="#7a5a3a" strokeWidth="0.8" />
      <text x="2" y={yOf(VILLAGE_HEIGHT) - 20} fontSize="9" fill="#5b4a2a">wioska</text>
      <line x1="0" x2="220" y1={yOf(level)} y2={yOf(level)} stroke={color} strokeWidth="1.5" />
      <text x="190" y={yOf(SCALE_MIN) - 4} fontSize="10" fill="#fff">Nil</text>
    </svg>
  );
}

function RuleLabels({ color, outcomes, onDone }: { color: string; outcomes: FloodOutcome[]; onDone: () => void }) {
  const [placed, setPlaced] = useState<Partial<Record<RuleLabel, number>>>({});
  const [picked, setPicked] = useState<RuleLabel | null>(null);
  const [why, setWhy] = useState<string | null>(null);
  const reported = useRef(false);
  const done = RULE_LABELS.every((l) => placed[l.id] !== undefined);

  useEffect(() => {
    if (done && !reported.current) {
      reported.current = true;
      onDone();
    }
  }, [done, onDone]);

  const put = (label: RuleLabel, lvl: number) => {
    const v = judgeRuleLabel(label, lvl);
    if (!v.ok) {
      setWhy(v.why ?? null);
      return;
    }
    setWhy(null);
    setPicked(null);
    setPlaced((p) => ({ ...p, [label]: lvl }));
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('lvl-')) put(id as RuleLabel, Number(target.slice(4)));
    },
    onTap: (id) => setPicked(id as RuleLabel),
    disabled: done,
  });

  const levels = Array.from({ length: SCALE_MAX - SCALE_MIN + 1 }, (_, i) => SCALE_MAX - i);
  const free = RULE_LABELS.filter((l) => placed[l.id] === undefined);
  const dragged = RULE_LABELS.find((l) => l.id === drag?.id);

  return (
    <div className="space-y-3 border-t pt-4">
      <p className="text-sm leading-relaxed">
        Twoje trzy lata: {outcomes.map((o) => `${o.level} łokci — ${KIND_TEXT[o.kind].split(' — ')[0]}`).join('; ')}.
        Kapłani przy nilometrze musieli umieć ostrzec kraj, zanim woda zejdzie. <strong>Przyłóż trzy tabliczki
        do schodków</strong>: na którym łokciu napiszesz „głód”, na którym „dobry rok”, a na którym „zalane wioski”?
      </p>
      <div className="flex flex-wrap gap-2">
        {free.map((l) => (
          <button
            key={l.id}
            type="button"
            {...bind(l.id)}
            className="touch-none border-2 bg-white px-3 py-1.5 text-sm font-semibold dark:bg-zinc-900"
            style={{ borderColor: picked === l.id ? color : undefined }}
          >
            {l.text}
          </button>
        ))}
      </div>
      <div className="max-w-sm border">
        {levels.map((lvl) => {
          const here = RULE_LABELS.filter((l) => placed[l.id] === lvl);
          return (
            <button
              key={lvl}
              type="button"
              data-drop={`lvl-${lvl}`}
              onClick={() => picked && put(picked, lvl)}
              className="flex w-full items-center gap-3 border-b px-2 py-1 text-left text-sm last:border-b-0"
              style={{ background: hover === `lvl-${lvl}` ? `${color}22` : undefined }}
            >
              <span className="w-16 shrink-0 font-mono tabular-nums text-muted-foreground">{lvl} łokci</span>
              {here.map((l) => (
                <span key={l.id} className="border px-2 text-xs font-semibold" style={{ borderColor: color, color }}>
                  {l.text}
                </span>
              ))}
            </button>
          );
        })}
      </div>
      <DragGhost drag={drag}>
        <span className="border-2 bg-white px-3 py-1 text-sm font-semibold dark:bg-zinc-900">{dragged?.text}</span>
      </DragGhost>
      {why && (
        <p className="text-sm text-destructive" role="status">
          {why}
        </p>
      )}
      {done && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Rzymski uczony Pliniusz Starszy (I w. n.e.) zapisał skalę, której używano przy nilometrze: przy 12 łokciach
          — głód, przy 13 — jeszcze bieda, 14 — radość, 15 — spokój, 16 — obfitość (<em>Historia naturalna</em> V 58,
          omówienie). Twoja reguła wyszła z tego samego: <strong>cały rok Egipcjan zależał od jednej liczby na
          schodkach.</strong> Z odczytu nilometru urzędnicy wyliczali nawet, ile podatku należy się z pola.
        </div>
      )}
    </div>
  );
}
