'use client';

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { createPortal } from 'react-dom';
import { Check, MessageCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  NAROD,
  PEOPLE,
  PL,
  TY_ID,
  UE,
  VIEW,
  ZONE_LABEL,
  judgeWspolnoty,
  zoneAt,
  type Placement,
  type WspolnotyError,
} from './wspolnoty';
import { EU_BLUE } from './gwiazdy';

const PL_RED = '#DC143C';
const NAROD_GOLD = '#B7791F';
const TOKEN_R = 13;

const TOKENS = [
  ...PEOPLE.map((p) => ({ id: p.id, initial: p.initial, name: p.name, where: p.where })),
  { id: TY_ID, initial: 'Ty', name: 'Ty', where: 'tu i teraz' },
];

interface Drag {
  id: string;
  x: number;
  y: number;
  moved: boolean;
  sx: number;
  sy: number;
}

/**
 * L11 blok 1 — **ustawia postacie na planszy zachodzących kręgów**: Unia,
 * obywatele Polski, naród polski. Miejsce wynika z tego, co postać mówi o
 * sobie (paszport, język, kim się czuje); sędzia odrzuca z cytatem.
 * Gest: przeciągnięcie żetonu na planszę albo stuknięcie żetonu i miejsca.
 */
export function KregiWspolnot({ color, onComplete }: { color: string; onComplete: () => void }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const [placed, setPlaced] = useState<Record<string, Placement | undefined>>({});
  const [selected, setSelected] = useState<string>(PEOPLE[0].id);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [errors, setErrors] = useState<WspolnotyError[] | null>(null);
  const [solved, setSolved] = useState(false);
  const reported = useRef(false);

  useEffect(() => {
    if (solved && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [solved, onComplete]);

  const toSvg = (clientX: number, clientY: number): Placement | null => {
    const svg = svgRef.current;
    const ctm = svg?.getScreenCTM();
    if (!svg || !ctm) return null;
    const p = new DOMPoint(clientX, clientY).matrixTransform(ctm.inverse());
    if (p.x < 0 || p.y < 0 || p.x > VIEW.w || p.y > VIEW.h) return null;
    const clamp = (v: number, max: number) => Math.min(Math.max(v, TOKEN_R), max - TOKEN_R);
    return { x: Math.round(clamp(p.x, VIEW.w)), y: Math.round(clamp(p.y, VIEW.h)) };
  };

  const place = (id: string, at: Placement) => {
    if (solved) return;
    setPlaced((prev) => ({ ...prev, [id]: at }));
    setErrors(null);
  };

  const startDrag = (id: string, e: ReactPointerEvent) => {
    if (solved) return;
    e.preventDefault();
    (e.currentTarget as Element).setPointerCapture?.(e.pointerId);
    setSelected(id);
    setDrag({ id, x: e.clientX, y: e.clientY, sx: e.clientX, sy: e.clientY, moved: false });
  };

  const moveDrag = (e: ReactPointerEvent) => {
    if (!drag) return;
    const moved = drag.moved || Math.hypot(e.clientX - drag.sx, e.clientY - drag.sy) > 6;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, moved });
  };

  const endDrag = (e: ReactPointerEvent) => {
    if (!drag) return;
    if (drag.moved) {
      const at = toSvg(e.clientX, e.clientY);
      if (at) place(drag.id, at);
    }
    setDrag(null);
  };

  const onBoardClick = (e: React.MouseEvent) => {
    if (solved || drag) return;
    const at = toSvg(e.clientX, e.clientY);
    if (at) place(selected, at);
  };

  const check = () => {
    const verdict = judgeWspolnoty(placed);
    setErrors(verdict.errors);
    if (verdict.ok) setSolved(true);
  };

  const person = PEOPLE.find((p) => p.id === selected);
  const allPlaced = PEOPLE.every((p) => placed[p.id]);
  const errorIds = new Set(errors?.map((x) => x.personId));
  const selectedAt = placed[selected];

  return (
    <div className="space-y-4 text-sm leading-relaxed">
      <p>
        Na planszy są trzy kręgi. Wybierz osobę, przeczytaj, co mówi o sobie, i postaw ją tam, gdzie
        pasuje — przeciągnij żeton albo stuknij żeton, a potem miejsce na planszy. Kręgi zachodzą
        na siebie: można stać w dwóch naraz.
      </p>

      {/* Taca z żetonami */}
      <div className="flex flex-wrap gap-2" role="listbox" aria-label="Osoby">
        {TOKENS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="option"
            aria-selected={selected === t.id}
            onPointerDown={(e) => startDrag(t.id, e)}
            onPointerMove={moveDrag}
            onPointerUp={endDrag}
            onPointerCancel={() => setDrag(null)}
            onClick={() => setSelected(t.id)}
            className={cn(
              'flex touch-none cursor-grab items-center gap-2 border px-2 py-1.5 text-left',
              selected === t.id && 'ring-2',
              errorIds.has(t.id) && 'border-destructive'
            )}
            style={selected === t.id ? ({ '--tw-ring-color': color } as React.CSSProperties) : undefined}
          >
            <span
              className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold text-white"
              style={{ background: t.id === TY_ID ? color : '#52525b', opacity: placed[t.id] ? 0.45 : 1 }}
            >
              {t.initial}
            </span>
            <span className="leading-tight">
              <span className="block text-xs font-semibold">{t.name}</span>
              <span className="block text-[11px] text-muted-foreground">{t.where}</span>
            </span>
          </button>
        ))}
      </div>

      {/* Co mówi wybrana osoba — stała wysokość: plansza pod spodem nie może skakać pod palcem */}
      <div className="h-[196px] overflow-y-auto border-l-2 sm:h-[150px] bg-muted/30 px-3 py-2" style={{ borderColor: color }} aria-live="polite">
        {person ? (
          <>
            <p className="mb-1 flex items-center gap-1.5 text-xs font-semibold" style={{ color }}>
              <MessageCircle className="h-3.5 w-3.5" aria-hidden />
              {person.name} mówi:
            </p>
            {person.says.map((s) => (
              <p key={s}>„{s}”</p>
            ))}
          </>
        ) : (
          <p>
            <strong>Ty</strong> — postaw się tam, gdzie pasujesz. Tego nikt nie sprawdza: wiesz o
            sobie najlepiej.
          </p>
        )}
        <p className="mt-1 text-xs text-muted-foreground">
          {selectedAt ? `Stoi teraz: ${ZONE_LABEL[zoneAt(selectedAt.x, selectedAt.y)]}.` : 'Jeszcze nie stoi na planszy.'}
        </p>
      </div>

      {/* Plansza */}
      <svg
        ref={svgRef}
        viewBox={`0 0 ${VIEW.w} ${VIEW.h}`}
        className="mx-auto block w-full max-w-[520px] touch-none select-none border bg-white dark:bg-zinc-950"
        onClick={onBoardClick}
        role="img"
        aria-label="Plansza wspólnot: prostokąt Unii Europejskiej, w nim koło obywateli Polski; koło narodu polskiego zachodzi na koło Polski i wychodzi poza Unię"
      >
        <rect x={UE.x} y={UE.y} width={UE.w} height={UE.h} fill={EU_BLUE} fillOpacity={0.05} stroke={EU_BLUE} strokeDasharray="5 4" />
        <text x={UE.x + 4} y={UE.y - 6} fontSize={11} fill={EU_BLUE} fontWeight={600}>
          Obywatele Unii Europejskiej
        </text>
        <text x={VIEW.w - 8} y={VIEW.h - 8} fontSize={10} fill="#71717a" textAnchor="end">
          reszta świata
        </text>
        <circle cx={PL.cx} cy={PL.cy} r={PL.r} fill={PL_RED} fillOpacity={0.08} stroke={PL_RED} strokeWidth={1.5} />
        <circle cx={NAROD.cx} cy={NAROD.cy} r={NAROD.r} fill={NAROD_GOLD} fillOpacity={0.1} stroke={NAROD_GOLD} strokeWidth={1.5} />
        <text x={PL.cx - 22} y={PL.cy - PL.r + 22} fontSize={11} fill={PL_RED} fontWeight={600} textAnchor="middle">
          Obywatele Polski
        </text>
        <text x={NAROD.cx + 22} y={NAROD.cy + NAROD.r - 14} fontSize={11} fill={NAROD_GOLD} fontWeight={600} textAnchor="middle">
          Naród polski
        </text>

        {TOKENS.map((t) => {
          const at = placed[t.id];
          if (!at || drag?.id === t.id) return null;
          const bad = errorIds.has(t.id);
          return (
            <g
              key={t.id}
              transform={`translate(${at.x} ${at.y})`}
              className={solved ? '' : 'cursor-grab'}
              onPointerDown={(e) => startDrag(t.id, e)}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onClick={(e) => {
                e.stopPropagation();
                setSelected(t.id);
              }}
            >
              <circle
                r={TOKEN_R}
                fill={t.id === TY_ID ? color : '#52525b'}
                stroke={bad ? '#dc2626' : selected === t.id ? color : 'white'}
                strokeWidth={bad || selected === t.id ? 3 : 1.5}
              />
              <text y={4} fontSize={t.id === TY_ID ? 9 : 11} fontWeight={700} fill="white" textAnchor="middle" pointerEvents="none">
                {t.initial}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Duch przeciąganego żetonu */}
      {drag?.moved &&
        typeof document !== 'undefined' &&
        createPortal(
          <div
            className="pointer-events-none fixed z-50 flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full text-xs font-bold text-white shadow-lg"
            style={{ left: drag.x, top: drag.y, background: drag.id === TY_ID ? color : '#52525b' }}
          >
            {TOKENS.find((t) => t.id === drag.id)?.initial}
          </div>,
          document.body
        )}

      {!solved && (
        <div className="space-y-2">
          <button
            type="button"
            onClick={check}
            disabled={!allPlaced}
            className="cursor-pointer border px-4 py-2 font-semibold disabled:cursor-not-allowed disabled:opacity-40"
            style={{ borderColor: color, color }}
          >
            Sprawdź planszę
          </button>
          {!allPlaced && (
            <p className="text-xs text-muted-foreground">Postaw na planszy wszystkie pięć osób (siebie — jeśli chcesz).</p>
          )}
          {errors && errors.length > 0 && (
            <ul className="space-y-1 text-destructive" aria-live="polite">
              {errors.map((er) => (
                <li key={er.personId}>{er.message}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {solved && (
        <div className="space-y-2 p-3" style={{ backgroundColor: `${color}14` }} aria-live="polite">
          <p className="flex items-center gap-2 font-semibold" style={{ color }}>
            <Check className="h-4 w-4" aria-hidden /> Wszyscy stoją tam, gdzie mówią o sobie.
          </p>
          <p>
            <strong>Wspólnota państwowa</strong> to obywatele — z urodzenia albo z wyboru, jak pan
            Minh. Mają te same prawa i obowiązki. <strong>Naród</strong> łączy coś innego: język,
            historię, kulturę, tradycje i to, kim się czujesz. Dlatego kręgi zachodzą na siebie.
          </p>
          <p>
            Pani Barbara i Kasia mieszkają za granicą, a należą do narodu. Takich ludzi jest około
            20 milionów — to <strong>Polonia</strong>. A 11 listopada pani Barbara idzie na
            akademię w Chicago tak samo, jak Zosia w Lublinie: obie pamiętają o tym samym.
          </p>
        </div>
      )}
    </div>
  );
}
