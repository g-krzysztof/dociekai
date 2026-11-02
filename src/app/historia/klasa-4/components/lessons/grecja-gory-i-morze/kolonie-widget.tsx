'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { MED_ATENY, MED_COUNTRIES, MED_LAND, MED_VIEW } from './geo-srodziemne';
import {
  COLONY_COUNTRIES,
  YEAR_FROM,
  YEAR_TO,
  countryName,
  formatYear,
  fromWhere,
  judgeCountry,
  visibleAt,
} from './kolonie';

/**
 * Blok 3 — **Grecy za morzem**. Suwak czasu: wokół Morza Śródziemnego i Czarnego
 * wyrastają greckie miasta. Potem warstwa dzisiejszych państw — dziecko stuka
 * te, w których leżały; sędzią jest punkt miasta w granicach państwa.
 */
const W = MED_VIEW.w;
const H = MED_VIEW.h;

export function KolonieWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [year, setYear] = useState(YEAR_FROM);
  const [reachedEnd, setReachedEnd] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [note, setNote] = useState<{ ok: boolean; text: string } | null>(null);
  const reported = useRef(false);

  const visible = visibleAt(year);
  const countriesOn = reachedEnd;
  const allFound = COLONY_COUNTRIES.every((c) => found.includes(c));

  const tap = (id: string) => {
    if (!countriesOn || allFound) return;
    const v = judgeCountry(id);
    if (v.kind === 'kolonie') {
      setNote({ ok: true, text: `${countryName(id)}: ${v.colonies.map((c) => c.name).join(', ')}.` });
      if (found.includes(id)) return;
      const next = [...found, id];
      setFound(next);
      if (COLONY_COUNTRIES.every((c) => next.includes(c)) && !reported.current) {
        reported.current = true;
        onDone();
      }
    } else setNote({ ok: false, text: v.why });
  };

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {countriesOn ? (
          <>
            Dziś nad tymi brzegami leżą inne państwa. <strong>Stukaj państwa, w których stały greckie miasta.</strong>{' '}
            Znalezione: {found.length} z {COLONY_COUNTRIES.length}.
          </>
        ) : (
          <>
            Takich statków jak twój wypłynęło setki. <strong>Przesuń suwak czasu</strong> i patrz, gdzie wyrastają
            greckie miasta.
          </>
        )}
      </p>

      <div className="mx-auto max-w-[640px]">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full border bg-[#a9cbe0]" role="img" aria-label="Mapa Morza Śródziemnego i Czarnego z greckimi miastami założonymi w VIII–VI wieku p.n.e.">
          <path d={MED_LAND} fill="#e6d9a8" stroke="#b49a63" strokeWidth="0.5" />
          {countriesOn &&
            MED_COUNTRIES.map((c) => {
              const isFound = found.includes(c.id);
              return (
                <path
                  key={c.id}
                  d={c.d}
                  fill={isFound ? `${color}66` : 'transparent'}
                  stroke="#7c6a45"
                  strokeWidth="0.6"
                  className="cursor-pointer hover:fill-[#00000014]"
                  onClick={() => tap(c.id)}
                >
                  <title>{c.name}</title>
                </path>
              );
            })}
          <circle cx={MED_ATENY[0]} cy={MED_ATENY[1]} r="4" fill="#5b3a1a" stroke="white" strokeWidth="1.2" pointerEvents="none" />
          <text x={MED_ATENY[0] - 30} y={MED_ATENY[1] + 14} fontSize="10" fontWeight="bold" fill="#3b2a12" pointerEvents="none">
            Ateny
          </text>
          {visible.map((c) => (
            <g key={c.id} pointerEvents="none" className="hist-colony-pop">
              <line x1={MED_ATENY[0]} y1={MED_ATENY[1]} x2={c.xy[0]} y2={c.xy[1]} stroke={color} strokeOpacity="0.18" strokeWidth="0.8" />
              <circle cx={c.xy[0]} cy={c.xy[1]} r="3.5" fill={color} stroke="white" strokeWidth="1" />
              {!countriesOn && (
                <text x={c.xy[0] + 5} y={c.xy[1] - 4} fontSize="9.5" fill="#1e293b">
                  {c.name}
                </text>
              )}
            </g>
          ))}
          {countriesOn &&
            found.map((id) => {
              const cs = visible.filter((c) => c.country === id);
              return cs.map((c) => (
                <text key={c.id} x={c.xy[0] + 5} y={c.xy[1] - 4} fontSize="9.5" fill="#1e293b" pointerEvents="none">
                  {c.name}
                </text>
              ));
            })}
          <text x="150" y="365" fontSize="12" fill="#2c5878" fontStyle="italic" pointerEvents="none">
            Morze Śródziemne
          </text>
          <text x="455" y="268" fontSize="11" fill="#2c5878" fontStyle="italic" pointerEvents="none">
            Morze Czarne
          </text>
        </svg>
        <style>{`.hist-colony-pop{animation:histpop .5s ease-out}@keyframes histpop{from{opacity:0}}@media (prefers-reduced-motion: reduce){.hist-colony-pop{animation:none}}`}</style>
      </div>

      {!countriesOn && (
        <div className="space-y-1">
          <input
            type="range"
            min={YEAR_FROM}
            max={YEAR_TO}
            step={5}
            value={year}
            onChange={(e) => {
              const y = Number(e.target.value);
              setYear(y);
              if (y >= YEAR_TO) setReachedEnd(true);
            }}
            className="w-full"
            style={{ accentColor: color }}
            aria-label="Rok"
            aria-valuetext={formatYear(year)}
          />
          <p className="text-sm" role="status">
            <strong>{formatYear(year)}</strong> · {visible.length} {plural(visible.length, { one: 'grecka kolonia', few: 'greckie kolonie', many: 'greckich kolonii' })} na mapie
            {visible.length > 0 && <span className="text-muted-foreground"> · ostatnia: {visible[visible.length - 1].name} — założyli ją przybysze {fromWhere(visible[visible.length - 1].mother)}</span>}
          </p>
        </div>
      )}

      {note && (
        <p className={cn('text-sm', note.ok ? '' : 'text-destructive')} role="status">
          {note.text}
        </p>
      )}

      {countriesOn && (
        <p className="text-xs text-muted-foreground">
          Daty są przybliżone — tak podawali je starożytni autorzy. Granice państw: dzisiejsze.
        </p>
      )}

      {allFound && (
        <div className="border-l-4 p-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Greckie miasta stały w {COLONY_COUNTRIES.length} dzisiejszych państwach: {COLONY_COUNTRIES.map(countryName).join(', ')}. Wiele z
          tych miast żyje do dziś: Massalia to Marsylia, Bizancjum — Stambuł, Tarent — Taranto, a Syrakuzy wciąż
          nazywają się Syrakuzy. Wszystkie leżą nad morzem:
          Grecy nie szli w głąb lądu, tylko pływali od zatoki do zatoki.
        </div>
      )}
    </div>
  );
}
