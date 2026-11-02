'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { cn } from '@/lib/utils';
import { MED_LAND, MED_VIEW } from '../grecja-gory-i-morze/geo-srodziemne';
import { IMPERIUM_REGIONS } from '../od-wioski-do-imperium/geo-imperium';
import { stageAt } from '../od-wioski-do-imperium/imperium';
import { PAL_GALILEA, PAL_JORDAN, PAL_KM_PER_PX, PAL_LAND, PAL_MARTWE, PAL_ON_MED, PAL_PLACES, PAL_VIEW } from './geo-palestyna';
import {
  DETAIL_FROM,
  judgeLake,
  judgePlace,
  KM_PER_DAY,
  PLACE_STEPS,
  ZOOM_MAX,
  type LakeId,
  type PlaceId,
  type XY,
} from './palestyna';

type Phase = 'zoom' | 'jezioro' | 'miejsca' | 'gotowe';

/** Jeden piksel mapy MED to tyle kilometrów (rzut z poprawką cos 42,5°). */
const MED_KM_PER_PX = (52 * Math.cos((42.5 * Math.PI) / 180) * 111.2) / MED_VIEW.w;
const PAL_H_ON_MED = (PAL_ON_MED.w * PAL_VIEW.h) / PAL_VIEW.w;
const STAGE_30 = stageAt(30);
const DAY_PX = Math.round((KM_PER_DAY / PAL_KM_PER_PX) * 10) / 10;

const SEA = '#dbe8ef';
const LAND = '#efe8d6';
const WATER = '#9cc3d9';

/** Podpisy krain i wód na mapie Palestyny (piksele mapy; z lon/lat w komentarzu). */
const LABELS: { text: string; x: number; y: number; italic?: boolean; water?: boolean }[] = [
  { text: 'GALILEA', x: 222, y: 70 }, // 35,07 E 33,02 N
  { text: 'SAMARIA', x: 240, y: 262 }, // 35,15 E 32,24 N
  { text: 'JUDEA', x: 190, y: 470 }, // 34,91 E 31,39 N
  { text: 'Morze Śródziemne', x: 70, y: 250, italic: true, water: true },
];

function zoomOf(t: number) {
  return Math.pow(ZOOM_MAX, t / 100);
}

/**
 * Blok 1 — **Palestyna w Cesarstwie**. Gesty: suwak przybliża mapę imperium
 * z 30 r. n.e. aż do małej krainy nad Jordanem (szerokość kadru w km i dniach
 * marszu zmienia się na żywo); stuknięcie jeziora, przez które płynie Jordan;
 * stawianie czterech miejscowości według wskazówek drogi — stuknięcie stawia
 * pinezkę, palec ją przesuwa, „Sprawdź” ocenia; odrzut mówi, gdzie pinezka
 * stoi względem punktu ze wskazówki. Po każdym trafieniu odsłania się karta
 * z opowieścią o tym miejscu. `onDone` po czwartym miejscu.
 */
export function PalestynaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [t, setT] = useState(0);
  const [phase, setPhase] = useState<Phase>('zoom');
  const [msg, setMsg] = useState<string | null>(null);
  const [step, setStep] = useState(0);
  const [pin, setPin] = useState<XY | null>(null);
  const [placed, setPlaced] = useState<PlaceId[]>([]);
  const [wrongLake, setWrongLake] = useState(false);
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const z = zoomOf(t);
  const current = PLACE_STEPS[step];

  // Kadr mapy MED: środek przesuwa się z Morza Śródziemnego na Palestynę razem z przybliżeniem.
  const vw = MED_VIEW.w / z;
  const vh = MED_VIEW.h / z;
  const k = (z - 1) / (ZOOM_MAX - 1);
  const cx = MED_VIEW.w / 2 + (PAL_ON_MED.cx - MED_VIEW.w / 2) * Math.min(1, k * 3);
  const cy = MED_VIEW.h / 2 + (PAL_ON_MED.cy - MED_VIEW.h / 2) * Math.min(1, k * 3);
  const vx = Math.max(0, Math.min(MED_VIEW.w - vw, cx - vw / 2));
  const vy = Math.max(0, Math.min(MED_VIEW.h - vh, cy - vh / 2));
  const widthKm = Math.round((vw * MED_KM_PER_PX) / 10) * 10;
  const detail = Math.max(0, Math.min(1, (z - DETAIL_FROM) / (ZOOM_MAX - DETAIL_FROM)));

  const onZoom = (v: number) => {
    setT(v);
    if (v >= 100 && phase === 'zoom') setPhase('jezioro');
  };

  const tapLake = (lake: LakeId) => {
    if (phase !== 'jezioro') return;
    const v = judgeLake(lake);
    if (v.ok) {
      setMsg(null);
      setWrongLake(false);
      setPhase('miejsca');
    } else {
      setWrongLake(true);
      setMsg(v.message);
    }
  };

  const toMap = (e: PointerEvent<SVGSVGElement>): XY | null => {
    const svg = svgRef.current;
    const m = svg?.getScreenCTM();
    if (!svg || !m) return null;
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(m.inverse());
    return [
      Math.round(Math.max(0, Math.min(PAL_VIEW.w, p.x)) * 10) / 10,
      Math.round(Math.max(0, Math.min(PAL_VIEW.h, p.y)) * 10) / 10,
    ];
  };

  const onDown = (e: PointerEvent<SVGSVGElement>) => {
    if (phase !== 'miejsca') return;
    const p = toMap(e);
    if (!p) return;
    dragging.current = true;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // bez przechwycenia działa, dopóki palec jest nad mapą
    }
    setPin(p);
    setMsg(null);
  };
  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    if (!dragging.current) return;
    const p = toMap(e);
    if (p) setPin(p);
  };
  const onUp = () => {
    dragging.current = false;
  };

  const nudge = (dx: number, dy: number) => {
    if (phase !== 'miejsca') return;
    setPin((p) => {
      const base = p ?? ([PAL_VIEW.w / 2, PAL_VIEW.h / 2] as XY);
      return [Math.max(0, Math.min(PAL_VIEW.w, base[0] + dx)), Math.max(0, Math.min(PAL_VIEW.h, base[1] + dy))] as XY;
    });
    setMsg(null);
  };

  const check = () => {
    if (!pin || !current) return;
    const v = judgePlace(current, pin);
    if (!v.ok) {
      setMsg(v.message);
      return;
    }
    setMsg(null);
    setPin(null);
    setPlaced((prev) => [...prev, current.id]);
    if (step + 1 >= PLACE_STEPS.length) {
      setPhase('gotowe');
      onDone();
    } else setStep(step + 1);
  };

  const showLakeNames = phase === 'miejsca' || phase === 'gotowe';

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'zoom' && (
          <>
            Tak wyglądało państwo rzymskie około 30 roku n.e. <strong>Przesuń suwak do końca</strong> i przybliż mapę do małej
            krainy na wschodnim brzegu Morza Śródziemnego.
          </>
        )}
        {phase === 'jezioro' && (
          <>
            To Palestyna. Przez całą krainę płynie rzeka Jordan, z północy na południe. Po drodze przepływa przez jezioro —
            Jezioro Galilejskie — a na końcu wpada do drugiego, z którego nie wypływa. <strong>Stuknij Jezioro Galilejskie.</strong>
          </>
        )}
        {phase === 'miejsca' && current && (
          <>
            <strong>
              Postaw pinezkę: {current.name} ({step + 1}/{PLACE_STEPS.length}).
            </strong>{' '}
            {current.clue} Stuknij mapę, przesuń pinezkę palcem i sprawdź.
          </>
        )}
        {phase === 'gotowe' && <>Wszystkie cztery miejsca stoją na mapie. Przeczytaj, co się w nich wydarzyło.</>}
      </p>

      <div className="mx-auto max-w-[460px] border" style={{ background: SEA }}>
        {phase === 'zoom' ? (
          <svg
            viewBox={`${vx.toFixed(2)} ${vy.toFixed(2)} ${vw.toFixed(2)} ${vh.toFixed(2)}`}
            className="block aspect-[600/422.6] h-auto w-full select-none"
            role="img"
            aria-label="Mapa państwa rzymskiego około 30 roku n.e."
          >
            <defs>
              <clipPath id="pal-med-land">
                <path d={MED_LAND} />
              </clipPath>
            </defs>
            <path d={MED_LAND} fill={LAND} stroke="#b8ab8a" strokeWidth={0.5} vectorEffect="non-scaling-stroke" />
            <g clipPath="url(#pal-med-land)" fill={color} opacity={0.5}>
              {STAGE_30.regions.map((r) => (
                <path key={r} d={IMPERIUM_REGIONS[r]} />
              ))}
            </g>
            {detail > 0 && (
              <svg
                x={PAL_ON_MED.cx - PAL_ON_MED.w / 2}
                y={PAL_ON_MED.cy - PAL_H_ON_MED / 2}
                width={PAL_ON_MED.w}
                height={PAL_H_ON_MED}
                viewBox={`0 0 ${PAL_VIEW.w} ${PAL_VIEW.h}`}
                opacity={detail}
              >
                <DetailLayers color={color} />
              </svg>
            )}
            <rect
              x={PAL_ON_MED.cx - PAL_ON_MED.w / 2}
              y={PAL_ON_MED.cy - PAL_H_ON_MED / 2}
              width={PAL_ON_MED.w}
              height={PAL_H_ON_MED}
              fill="none"
              stroke="#111"
              strokeWidth={1.5}
              strokeDasharray="4 3"
              vectorEffect="non-scaling-stroke"
              opacity={1 - detail}
            />
          </svg>
        ) : (
          <svg
            ref={svgRef}
            viewBox={`0 0 ${PAL_VIEW.w} ${PAL_VIEW.h}`}
            className={cn('block h-auto w-full select-none', phase === 'miejsca' && 'cursor-crosshair touch-none')}
            role="img"
            aria-label="Mapa Palestyny: wybrzeże Morza Śródziemnego, rzeka Jordan, Jezioro Galilejskie i Morze Martwe"
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
          >
            <DetailLayers color={color} />
            {/* Jeziora jako cele stuknięcia. */}
            <path
              d={PAL_GALILEA}
              fill={showLakeNames ? WATER : 'transparent'}
              stroke={phase === 'jezioro' ? '#111' : 'none'}
              strokeWidth={1}
              className={cn(phase === 'jezioro' && 'cursor-pointer')}
              onClick={() => tapLake('galilea')}
            />
            <path
              d={PAL_MARTWE}
              fill={wrongLake ? '#fca5a5' : 'transparent'}
              fillOpacity={0.6}
              stroke={phase === 'jezioro' ? '#111' : 'none'}
              strokeWidth={1}
              className={cn(phase === 'jezioro' && 'cursor-pointer')}
              onClick={() => tapLake('martwe')}
            />
            {phase === 'jezioro' && (
              <>
                <circle cx={331} cy={118} r={24} fill="transparent" className="cursor-pointer" onClick={() => tapLake('galilea')} />
                <circle cx={325} cy={420} r={30} fill="transparent" className="cursor-pointer" onClick={() => tapLake('martwe')} />
              </>
            )}
            {showLakeNames && (
              <>
                <MapText x={350} y={92} text="Jezioro Galilejskie" water />
                <MapText x={345} y={470} text="Morze Martwe" water />
              </>
            )}
            {placed.map((id) => {
              const [x, y] = PAL_PLACES[id];
              const name = PLACE_STEPS.find((s) => s.id === id)?.name ?? id;
              const left = id === 'betlejem' || id === 'nazaret';
              return (
                <g key={id}>
                  <circle cx={x} cy={y} r={5} fill={color} stroke="#fff" strokeWidth={2} />
                  <MapText x={left ? x - 9 : x + 9} y={y + (id === 'betlejem' ? 12 : 4)} text={name} anchor={left ? 'end' : 'start'} bold />
                </g>
              );
            })}
            {pin && phase === 'miejsca' && (
              <g pointerEvents="none">
                <line x1={pin[0]} y1={pin[1]} x2={pin[0]} y2={pin[1] - 22} stroke="#111" strokeWidth={2} />
                <circle cx={pin[0]} cy={pin[1] - 26} r={8} fill={color} stroke="#fff" strokeWidth={2} />
                <circle cx={pin[0]} cy={pin[1]} r={2.5} fill="#111" />
              </g>
            )}
          </svg>
        )}
      </div>

      {phase === 'zoom' && (
        <div className="mx-auto max-w-[460px] space-y-1">
          <input
            type="range"
            min={0}
            max={100}
            step={1}
            value={t}
            onChange={(e) => onZoom(Number(e.target.value))}
            aria-label="Przybliżenie mapy"
            className="w-full cursor-ew-resize"
            style={{ accentColor: color }}
          />
          <p className="text-sm tabular-nums text-muted-foreground">
            Szerokość kadru: ok. {widthKm.toLocaleString('pl-PL')} km — piechur szedłby {Math.max(1, Math.round(widthKm / KM_PER_DAY))}{' '}
            dni.
          </p>
        </div>
      )}

      {phase === 'miejsca' && (
        <div className="mx-auto flex max-w-[460px] flex-wrap items-center gap-2">
          <div className="flex gap-1" aria-label="Przesuń pinezkę">
            {(
              [
                ['←', -4, 0, 'w lewo'],
                ['↑', 0, -4, 'w górę'],
                ['↓', 0, 4, 'w dół'],
                ['→', 4, 0, 'w prawo'],
              ] as const
            ).map(([s, dx, dy, label]) => (
              <button key={label} type="button" onClick={() => nudge(dx, dy)} aria-label={`Pinezka ${label}`} className="h-9 w-9 border text-sm">
                {s}
              </button>
            ))}
          </div>
          <button
            type="button"
            onClick={check}
            disabled={!pin}
            className="border-2 px-3 py-1.5 text-sm font-semibold disabled:opacity-40"
            style={{ borderColor: color, color }}
          >
            Sprawdź
          </button>
        </div>
      )}

      {msg && (
        <p aria-live="polite" className="mx-auto max-w-[460px] text-sm text-destructive">
          {msg}
        </p>
      )}

      {placed.length > 0 && (
        <ol className="space-y-2">
          {placed.map((id) => {
            const s = PLACE_STEPS.find((x) => x.id === id);
            if (!s) return null;
            return (
              <li key={id} className="border bg-white p-3 text-sm leading-relaxed dark:bg-zinc-900">
                <strong style={{ color }}>{s.name}.</strong> {s.story}
              </li>
            );
          })}
        </ol>
      )}
    </div>
  );
}

function MapText({
  x,
  y,
  text,
  anchor = 'start',
  bold,
  water,
  italic,
}: {
  x: number;
  y: number;
  text: string;
  anchor?: 'start' | 'middle' | 'end';
  bold?: boolean;
  water?: boolean;
  italic?: boolean;
}) {
  return (
    <text
      x={x}
      y={y}
      textAnchor={anchor}
      fontSize={bold ? 15 : 13}
      fontWeight={bold ? 700 : 500}
      fontStyle={water || italic ? 'italic' : undefined}
      fill={water ? '#1e5a7a' : '#111'}
      stroke="#fff"
      strokeWidth={3}
      paintOrder="stroke"
      pointerEvents="none"
    >
      {text}
    </text>
  );
}

/** Ląd, wody, Jordan z kierunkiem, krainy i podziałka — wspólne dla przybliżania i mapy z pinezkami. */
function DetailLayers({ color }: { color: string }) {
  return (
    <g>
      <rect x={0} y={0} width={PAL_VIEW.w} height={PAL_VIEW.h} fill={SEA} />
      <path d={PAL_LAND} fill={LAND} stroke="#b8ab8a" strokeWidth={1} />
      <path d={PAL_JORDAN} fill="none" stroke={WATER} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      <path d={PAL_GALILEA} fill={WATER} />
      <path d={PAL_MARTWE} fill={WATER} />
      {/* Jordan: podpis i strzałka nurtu (z północy na południe). */}
      <g pointerEvents="none">
        <text x={352} y={250} fontSize={13} fontStyle="italic" fill="#1e5a7a" stroke="#fff" strokeWidth={3} paintOrder="stroke">
          Jordan
        </text>
        <path d="M357,258 L357,284 M351,277 L357,285 L363,277" stroke="#1e5a7a" strokeWidth={1.6} fill="none" />
      </g>
      {LABELS.map((l) => (
        <text
          key={l.text}
          x={l.x}
          y={l.y}
          textAnchor="middle"
          fontSize={l.water ? 13 : 12}
          letterSpacing={l.water ? 0 : 3}
          fontStyle={l.italic ? 'italic' : undefined}
          fill={l.water ? '#1e5a7a' : '#7c6f55'}
          pointerEvents="none"
        >
          {l.text}
        </text>
      ))}
      {/* Podziałka: jeden dzień marszu. */}
      <g transform={`translate(18 ${PAL_VIEW.h - 22})`} pointerEvents="none">
        <rect x={-6} y={-20} width={DAY_PX + 12} height={30} fill="#fff" opacity={0.75} />
        <line x1={0} y1={0} x2={DAY_PX} y2={0} stroke={color} strokeWidth={3} />
        <line x1={0} y1={-4} x2={0} y2={4} stroke={color} strokeWidth={2} />
        <line x1={DAY_PX} y1={-4} x2={DAY_PX} y2={4} stroke={color} strokeWidth={2} />
        <text x={0} y={-8} fontSize={11} fill="#111">
          1 dzień marszu ≈ 30 km
        </text>
      </g>
    </g>
  );
}
