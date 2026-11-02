'use client';

import { useRef, useState } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { OsDziejow } from '../../timeline/os-dziejow';
import { WORLD_BOX, WORLD_DEEP, WORLD_LAND, WORLD_VIEW } from './geo-swiat';
import {
  BRIDGE_AT,
  REGIONS,
  ROUTES,
  SEA_MIN,
  getRegion,
  isOpen,
  judgeLast,
  judgeMove,
  routeBetween,
  type RegionId,
} from './wedrowki';

/**
 * Blok 3 (mapa): **wędrówki ludzi**. Dziecko prowadzi grupę z Afryki po
 * mapie świata (przeciąga grupę na kontynent albo stuka grupę, potem
 * kontynent), a suwakiem opuszcza morze: w epoce lodowej szelf staje się
 * lądem i odsłania mosty — Beringię i Sundę. Na koniec samo ustala z dat,
 * które zebrało, który kontynent zasiedlono jako ostatni. Pinezka „pierwsi
 * ludzie” wisi po tym bloku.
 *
 * Mapa: Natural Earth (ląd + morze głębsze niż 200 m), rysowana dwa razy obok
 * siebie i wycięta od 25° W, żeby Pacyfik i Beringia były w środku, a nie na
 * brzegach kadru.
 */

const LESSON = 'poczatki-cywilizacji/pierwsi-ludzie';

/** Gdzie stoi etykieta względem punktu — na telefonie Europa, Afryka i Azja leżą blisko siebie. */
const PILL_POS: Record<RegionId, string> = {
  afryka: '-translate-x-1/2 translate-y-2',
  azja: 'translate-x-1 -translate-y-1/2',
  europa: '-translate-x-[20%] -translate-y-[135%]',
  australia: '-translate-x-1/2 translate-y-2',
  ameryka: '-translate-x-1/2 translate-y-2',
};
const W = WORLD_VIEW.w;
const H = WORLD_VIEW.h;
const S = W / (WORLD_BOX.lon1 - WORLD_BOX.lon0);
/** Lewy brzeg kadru: 25° W. */
const CUT_LON = -25;
const X0 = (CUT_LON - WORLD_BOX.lon0) * S;

function px(lon: number, lat: number): [number, number] {
  const wrapped = lon < CUT_LON ? lon + 360 : lon;
  return [Math.round((wrapped - WORLD_BOX.lon0) * S - X0), Math.round((WORLD_BOX.lat1 - lat) * S)];
}

function routePoints(a: RegionId, b: RegionId): string {
  const r = routeBetween(a, b)!;
  const ra = getRegion(r.a);
  const rb = getRegion(r.b);
  const pts: [number, number][] = [px(ra.lon, ra.lat), ...(r.through ?? []).map(([lo, la]) => px(lo, la)), px(rb.lon, rb.lat)];
  return pts.map((p) => p.join(',')).join(' ');
}

function mix(a: [number, number, number], b: [number, number, number], t: number): string {
  return `rgb(${a.map((v, i) => Math.round(v + (b[i] - v) * t)).join(',')})`;
}

export function WedrowkiLudzi({ color, onComplete, done }: { color: string; onComplete: () => void; done: boolean }) {
  const [sea, setSea] = useState(0);
  const [at, setAt] = useState<RegionId>('afryka');
  const [reached, setReached] = useState<RegionId[]>(['afryka']);
  const [walked, setWalked] = useState<[RegionId, RegionId][]>([]);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [picked, setPicked] = useState(false);
  const [answer, setAnswer] = useState<{ ok: boolean; text: string } | null>(null);
  const completed = useRef(false);

  const allReached = REGIONS.every((r) => reached.includes(r.id));
  const answered = answer?.ok === true;
  const ice = sea / SEA_MIN; // 0 … 1

  const go = (to: RegionId) => {
    if (allReached) return;
    const res = judgeMove(at, to, sea);
    setPicked(false);
    if (!res.ok) {
      if (res.reason !== 'ten-sam') setMsg({ ok: false, text: res.text });
      return;
    }
    const target = getRegion(to);
    const first = !reached.includes(to);
    setAt(to);
    setWalked((w) => (w.some(([a, b]) => (a === at && b === to) || (a === to && b === at)) ? w : [...w, [at, to]]));
    if (first) setReached((r) => [...r, to]);
    let text = first ? `${target.name} — ludzie dotarli tu ok. ${target.kya} tys. lat temu.` : `Grupa wróciła: ${target.name}.`;
    if (first && to === 'australia') text += ' Nawet przy niskim morzu trzeba było przepłynąć kawałek głębokiej wody — na tratwach albo łodziach.';
    if (first && to === 'ameryka') text += ' Przeszli suchą nogą przez Beringię — dziś jest tam Cieśnina Beringa.';
    if (first && to === 'europa') text += ' Było tu zimno — bez ognia i ciepłych skór nie dałoby się przezimować.';
    setMsg({ ok: true, text });
  };

  const tapRegion = (id: RegionId) => {
    if (allReached && !answered) {
      const res = judgeLast(reached, id);
      setAnswer(res);
      if (res.ok && !completed.current) {
        completed.current = true;
        onComplete();
      }
      return;
    }
    if (picked) go(id);
  };

  const { drag, hover, bind } = useDragToken({
    disabled: allReached,
    onDrop: (_id, target) => {
      if (target?.startsWith('kontynent-')) go(target.slice('kontynent-'.length) as RegionId);
    },
    onTap: () => setPicked((p) => !p),
  });

  const atXY = px(getRegion(at).lon, getRegion(at).lat);
  const shelf = mix([207, 227, 243], [233, 223, 196], Math.min(1, ice * 1.15));

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Człowiek rozumny pojawił się w Afryce ok. 300 tys. lat temu. Poprowadź grupę dalej:{' '}
        <strong>przeciągnij ją na inny kontynent</strong> (albo stuknij grupę, potem kontynent). Kiedy droga prowadzi przez
        morze — opuść je suwakiem. W epoce lodowej woda zamarzała w ogromnych lodowcach i morza opadały.
      </p>

      <div className="relative w-full overflow-hidden border">
        <svg viewBox={`0 0 ${W} ${H}`} className="block h-auto w-full" role="img" aria-label="Mapa świata z poziomem morza i drogami wędrówek">
          <rect x="0" y="0" width={W} height={H} fill={shelf} />
          <g transform={`translate(${-X0} 0)`}>
            {[0, W].map((dx) => (
              <g key={dx} transform={`translate(${dx} 0)`}>
                <path d={WORLD_DEEP} fill="#a9cbe6" />
                <path d={WORLD_LAND} fill="#e2d4ae" stroke="#a8936a" strokeWidth="0.5" />
              </g>
            ))}
          </g>
          {/* lądolody — rosną, gdy morze opada */}
          <g opacity={ice * 0.85} fill="#ffffff">
            <ellipse cx={px(-95, 60)[0]} cy={px(-95, 60)[1]} rx="95" ry="38" />
            <ellipse cx={px(15, 64)[0]} cy={px(15, 64)[1]} rx="40" ry="22" />
          </g>
          {ROUTES.map((r) => {
            const open = isOpen(r, sea);
            const walkedHere = walked.some(([a, b]) => (a === r.a && b === r.b) || (a === r.b && b === r.a));
            return (
              <polyline
                key={`${r.a}-${r.b}`}
                points={routePoints(r.a, r.b)}
                fill="none"
                stroke={walkedHere ? color : open ? '#78716c' : '#64748b'}
                strokeWidth={walkedHere ? 4 : 2}
                strokeDasharray={walkedHere ? undefined : open ? '6 5' : '2 6'}
                opacity={walkedHere ? 0.95 : open ? 0.7 : 0.45}
                strokeLinecap="round"
              />
            );
          })}
          {sea <= BRIDGE_AT && (
            <g fontSize="13" fontStyle="italic" fill="#57534e">
              <text x={px(-178, 70)[0] - 20} y={px(-178, 70)[1]}>Beringia</text>
              <text x={px(103, 0)[0] - 18} y={px(103, 0)[1] + 18}>Sunda</text>
            </g>
          )}
          <circle cx={atXY[0]} cy={atXY[1]} r="10" fill="none" stroke={color} strokeWidth="3" />
        </svg>

        {REGIONS.map((r) => {
          const [x, y] = px(r.lon, r.lat);
          const been = reached.includes(r.id);
          return (
            <button
              key={r.id}
              type="button"
              data-drop={`kontynent-${r.id}`}
              onClick={() => tapRegion(r.id)}
              className={`absolute ${PILL_POS[r.id]} whitespace-nowrap border bg-white/95 px-1 py-0.5 text-left text-[10px] leading-tight sm:px-1.5 sm:text-xs dark:bg-zinc-900/95`}
              style={{
                left: `${(x / W) * 100}%`,
                top: `${(y / H) * 100}%`,
                borderColor: hover === `kontynent-${r.id}` ? color : been ? color : undefined,
              }}
            >
              <span className="block font-semibold">{r.name}</span>
              {been && <span className="hidden font-mono tabular-nums text-muted-foreground sm:block">ok. {r.kya} tys. lat temu</span>}
            </button>
          );
        })}

        {!allReached && (
          <button
            type="button"
            {...bind('grupa')}
            aria-label={`Grupa ludzi — jest: ${getRegion(at).name}. Przeciągnij na inny kontynent albo stuknij, potem stuknij kontynent.`}
            className="absolute flex h-9 w-9 -translate-x-1/2 -translate-y-full touch-none items-center justify-center rounded-full border-2 bg-white shadow"
            style={{ left: `${(atXY[0] / W) * 100}%`, top: `${(atXY[1] / H) * 100}%`, borderColor: color, outline: picked ? `3px solid ${color}` : undefined }}
          >
            <GroupIcon color={color} />
          </button>
        )}
        <DragGhost drag={drag}>
          <span className="flex h-9 w-9 items-center justify-center rounded-full border-2 bg-white" style={{ borderColor: color }}>
            <GroupIcon color={color} />
          </span>
        </DragGhost>
      </div>

      <p className="text-xs leading-relaxed text-muted-foreground sm:hidden" aria-live="polite">
        {REGIONS.filter((r) => reached.includes(r.id))
          .map((r) => `${r.name}: ok. ${r.kya} tys. lat temu`)
          .join(' · ')}
      </p>

      <div className="space-y-1">
        <label htmlFor="poziom-morza" className="flex justify-between text-sm">
          <span>
            Poziom morza: <strong className="tabular-nums">{sea === 0 ? 'jak dziś' : `${sea} m`}</strong>
          </span>
          <span className="text-xs text-muted-foreground">{sea <= BRIDGE_AT ? 'epoka lodowa — mosty lądowe odsłonięte' : sea < 0 ? 'morze opada…' : ''}</span>
        </label>
        <input
          id="poziom-morza"
          type="range"
          min={SEA_MIN}
          max={0}
          step={10}
          value={sea}
          onChange={(e) => setSea(Number(e.target.value))}
          className="w-full cursor-ew-resize"
          style={{ accentColor: color, direction: 'rtl' }}
          aria-valuetext={sea === 0 ? 'jak dziś' : `${sea} metrów`}
        />
        <div className="flex justify-between text-[11px] text-muted-foreground" aria-hidden>
          <span>jak dziś</span>
          <span>−120 m</span>
        </div>
      </div>

      {msg && !allReached && (
        <p className={`border-l-2 pl-3 text-sm leading-relaxed ${msg.ok ? '' : 'text-destructive'}`} style={{ borderColor: msg.ok ? color : 'hsl(var(--destructive))' }} aria-live="polite">
          {msg.text}
        </p>
      )}

      {allReached && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Ludzie doszli na cztery kontynenty poza Afryką. Spójrz na daty przy nazwach. <strong>Który kontynent ludzie zasiedlili jako ostatni?</strong>{' '}
            Stuknij go na mapie.
          </p>
          {answer && (
            <p className={`text-sm ${answer.ok ? 'font-medium' : 'text-destructive'}`} aria-live="polite" style={answer.ok ? { color } : undefined}>
              {answer.text}
            </p>
          )}
        </div>
      )}

      {(answered || done) && (
        <div className="space-y-2 border-t pt-4">
          <p className="text-sm leading-relaxed">
            Na twojej Osi dziejów pojawiła się pinezka <strong>„pierwsi ludzie”</strong> — na samym początku, ok. 300 tys. lat
            temu. Prawie cała oś od niej do pisma to czas koczowników.
          </p>
          <OsDziejow color={color} lesson={LESSON} defaultMode="ludzkosc" highlightIds={['pierwsi-ludzie']} />
        </div>
      )}
    </div>
  );
}

function GroupIcon({ color }: { color: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" aria-hidden fill={color}>
      <circle cx="7" cy="7" r="2.5" />
      <circle cx="16" cy="6" r="2.5" />
      <path d="M4 20 v-6 q3 -4 6 0 v6 Z" />
      <path d="M13 20 v-7 q3 -4 6 0 v7 Z" />
      <circle cx="11.5" cy="13" r="1.8" />
      <path d="M9.5 21 v-3.5 q2 -2.5 4 0 V21 Z" />
    </svg>
  );
}
