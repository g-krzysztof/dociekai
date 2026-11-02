'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { plural } from '@/lib/plural';
import { MED_COUNTRIES, MED_LAND, MED_VIEW } from '../grecja-gory-i-morze/geo-srodziemne';
import { IMPERIUM_REGIONS, SHARE_117, SPLIT_X } from './geo-imperium';
import {
  CLASS_TEXT,
  countryClass,
  COUNTRIES_GOAL,
  FIRST_YEAR,
  judgeLargest,
  LAST_YEAR,
  MAX_KM2,
  stageAt,
  type CountryClass,
} from './imperium';

type Phase = 'rosnie' | 'kraje' | 'podzial' | 'gotowe';

// Rzym w rzucie mapy MED (lon 12,5°, lat 41,9°) — ta sama formuła co w skrypcie.
const K = Math.cos(((29 + 56) / 2) * (Math.PI / 180));
const SC = 600 / (52 * K);
const ROME = { x: Math.round((12.5 + 10) * K * SC * 10) / 10, y: Math.round((56 - 41.9) * SC * 10) / 10 };

const CLASS_FILL: Record<CountryClass, string> = { cale: '#16a34a', czesc: '#d97706', poza: '#78716c' };
const IN_EMPIRE = Object.keys(SHARE_117).filter((id) => countryClass(id) !== 'poza').length;
/** Cesarstwo wschodnie — kolor odległy od fioletu modułu i od klas państw. */
const EAST = '#0f766e';
const fmtYear = (y: number) => (y < 0 ? `${-y} p.n.e.` : `${y} n.e.`);

/**
 * Blok 3 — **Imperium rośnie**. Gesty: suwak lat od 500 p.n.e. do 395 n.e. —
 * dziecko zatrzymuje go przy największym zasięgu (sędzią jest powierzchnia
 * liczona z mapy); potem stuka dzisiejsze państwa i dowiaduje się, czy leżały
 * w imperium całe, w części, czy poza nim (udział liczony z mapy); na końcu
 * przesuwa suwak do 395 r. i widzi podział. `onDone` po podziale.
 */
export function ImperiumWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [year, setYear] = useState(FIRST_YEAR);
  const [phase, setPhase] = useState<Phase>('rosnie');
  const [msg, setMsg] = useState<string | null>(null);
  const [tapped, setTapped] = useState<string[]>([]);
  const [last, setLast] = useState<string | null>(null);
  const reported = useRef(false);

  const stage = phase === 'kraje' ? stageAt(117) : stageAt(year);
  const split = stage.year === 395;
  const found = tapped.filter((id) => countryClass(id) !== 'poza');

  useEffect(() => {
    if (phase === 'podzial' && split && !reported.current) {
      reported.current = true;
      setPhase('gotowe');
      onDone();
    }
  }, [phase, split, onDone]);

  const names = useMemo(() => Object.fromEntries(MED_COUNTRIES.map((c) => [c.id, c.name])), []);

  const checkLargest = () => {
    const v = judgeLargest(year);
    if (v.ok) {
      setMsg(null);
      setPhase('kraje');
    } else setMsg(v.message);
  };

  const tapCountry = (id: string) => {
    if (phase !== 'kraje' || !countryClass(id)) return;
    setLast(id);
    if (!tapped.includes(id)) {
      const next = [...tapped, id];
      setTapped(next);
      if (next.filter((x) => countryClass(x) !== 'poza').length >= COUNTRIES_GOAL) {
        setYear(117);
        setPhase('podzial');
      }
    }
  };

  const lastClass = last ? countryClass(last) : null;
  const minYear = phase === 'podzial' || phase === 'gotowe' ? 117 : FIRST_YEAR;

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        {phase === 'rosnie' && (
          <>
            Przesuwaj suwak lat i patrz, jak rośnie państwo rzymskie. <strong>Zatrzymaj go tam, gdzie imperium jest
            największe</strong>, i sprawdź.
          </>
        )}
        {phase === 'kraje' && (
          <>
            Tak wyglądało imperium za cesarza Trajana, w 117 roku. <strong>Stukaj dzisiejsze państwa</strong> i znajdź{' '}
            {COUNTRIES_GOAL}, które leżały w imperium — całe albo w części. Znalezione: {Math.min(found.length, COUNTRIES_GOAL)}/
            {COUNTRIES_GOAL}.
          </>
        )}
        {(phase === 'podzial' || phase === 'gotowe') && (
          <>
            Imperium było tak wielkie, że trudno było nim rządzić z jednego miasta. <strong>Przesuń suwak do 395 roku.</strong>
          </>
        )}
      </p>

      <div className="mx-auto max-w-[620px] border bg-[#dbe8ef] dark:bg-zinc-900">
        <svg viewBox={`0 0 ${MED_VIEW.w} ${MED_VIEW.h}`} className="block h-auto w-full select-none" role="img" aria-label={`Mapa państwa rzymskiego: ${stage.label}`}>
          <defs>
            <clipPath id="imp-land">
              <path d={MED_LAND} />
            </clipPath>
            <clipPath id="imp-west">
              <rect x={0} y={0} width={SPLIT_X} height={MED_VIEW.h} />
            </clipPath>
            <clipPath id="imp-east">
              <rect x={SPLIT_X} y={0} width={MED_VIEW.w - SPLIT_X} height={MED_VIEW.h} />
            </clipPath>
          </defs>
          <path d={MED_LAND} fill="#efe8d6" stroke="#b8ab8a" strokeWidth={0.5} />
          <g clipPath="url(#imp-land)">
            {split ? (
              <>
                <g clipPath="url(#imp-west)" fill={color} opacity={0.6}>
                  {stage.regions.map((r) => (
                    <path key={r} d={IMPERIUM_REGIONS[r]} />
                  ))}
                </g>
                <g clipPath="url(#imp-east)" fill={EAST} opacity={0.6}>
                  {stage.regions.map((r) => (
                    <path key={r} d={IMPERIUM_REGIONS[r]} />
                  ))}
                </g>
              </>
            ) : (
              <g fill={color} opacity={0.55}>
                {stage.regions.map((r) => (
                  <path key={r} d={IMPERIUM_REGIONS[r]} />
                ))}
              </g>
            )}
          </g>
          {/* Dzisiejsze państwa: kontury zawsze, stukanie w fazie „kraje”. */}
          {MED_COUNTRIES.map((c) => {
            const cls = phase === 'kraje' && tapped.includes(c.id) ? countryClass(c.id) : null;
            return (
              <path
                key={c.id}
                data-country={c.id}
                d={c.d}
                fill={cls ? CLASS_FILL[cls] : 'transparent'}
                fillOpacity={cls ? 0.55 : 0}
                stroke={last === c.id ? '#111' : '#8a7f66'}
                strokeWidth={last === c.id ? 1.4 : phase === 'kraje' ? 0.6 : 0.3}
                strokeOpacity={phase === 'kraje' || cls ? 0.9 : 0.35}
                onClick={() => tapCountry(c.id)}
                className={cn(phase === 'kraje' && countryClass(c.id) && 'cursor-pointer')}
              />
            );
          })}
          {split && (
            <line x1={SPLIT_X} x2={SPLIT_X} y1={150} y2={MED_VIEW.h} stroke="#111" strokeWidth={1} strokeDasharray="4 3" />
          )}
          <circle cx={ROME.x} cy={ROME.y} r={4} fill="#111" stroke="#fff" strokeWidth={1.5} />
          <text x={ROME.x + 6} y={ROME.y - 5} fontSize={16} fontWeight={700} fill="#111" stroke="#fff" strokeWidth={3} paintOrder="stroke">
            Rzym
          </text>
          {split && (
            <>
              <text x={SPLIT_X - 8} y={168} textAnchor="end" fontSize={18} fontWeight={700} fill={color} stroke="#fff" strokeWidth={3} paintOrder="stroke">
                zachodnie
              </text>
              <text x={SPLIT_X + 8} y={168} fontSize={18} fontWeight={700} fill={EAST} stroke="#fff" strokeWidth={3} paintOrder="stroke">
                wschodnie
              </text>
            </>
          )}
        </svg>
      </div>

      {phase !== 'kraje' && (
        <div className="mx-auto max-w-[620px] space-y-2">
          <div className="flex items-baseline justify-between gap-2">
            <span className="font-mono text-lg font-bold tabular-nums" style={{ color }}>
              {fmtYear(year)}
            </span>
            <div className="h-2 w-32 bg-muted" title="zasięg państwa">
              <div className="h-2" style={{ width: `${Math.round((stage.km2 / MAX_KM2) * 100)}%`, background: color }} />
            </div>
          </div>
          <input
            type="range"
            min={minYear}
            max={LAST_YEAR}
            step={1}
            value={year}
            onChange={(e) => {
              setYear(Number(e.target.value));
              setMsg(null);
            }}
            aria-label="Rok"
            className="w-full cursor-ew-resize"
            style={{ accentColor: color }}
          />
          <p className="min-h-[2.5rem] text-sm leading-relaxed">
            <strong>{stage.year < 0 ? `Od ${-stage.year} p.n.e.` : `Od ${stage.year} n.e.`}:</strong> {stage.label}
          </p>
          {phase === 'rosnie' && (
            <button type="button" onClick={checkLargest} className="border-2 px-3 py-1.5 text-sm font-semibold" style={{ borderColor: color, color }}>
              Tu imperium jest największe
            </button>
          )}
          {msg && <p className="text-sm text-destructive">{msg}</p>}
        </div>
      )}

      <div aria-live="polite" className="text-sm leading-relaxed">
        {phase === 'kraje' && last && lastClass && (
          <p>
            <strong>{names[last]}</strong> {CLASS_TEXT[lastClass]}.
            {last === 'POL' && ' Rzymianie tu nie dotarli — ale ich kupcy przyjeżdżali po bursztyn znad Bałtyku.'}
          </p>
        )}
        {phase !== 'rosnie' && phase !== 'kraje' && (
          <p className="text-muted-foreground">
            Znalazłeś/łaś {found.length} {plural(found.length, { one: 'państwo', few: 'państwa', many: 'państw' })} na ziemiach
            dawnego imperium. Na tej mapie takich państw jest {IN_EMPIRE}.
          </p>
        )}
        {phase === 'gotowe' && (
          <p className="mt-2 border-2 p-3" style={{ borderColor: color }}>
            <strong>395 rok:</strong> cesarz Teodozjusz umiera, a imperium dzielą między siebie jego dwaj synowie. Zachodnie
            rządzone jest z Italii, wschodnie — z Konstantynopola (dziś Stambuł). Zachodnie upadnie w 476 roku, wschodnie
            przetrwa jeszcze prawie tysiąc lat. <em>Granice na mapie są przybliżone.</em>
          </p>
        )}
      </div>
    </div>
  );
}
