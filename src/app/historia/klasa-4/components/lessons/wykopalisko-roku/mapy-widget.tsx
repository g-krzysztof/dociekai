'use client';

import { useRef, useState } from 'react';
import { cn } from '@/lib/utils';
import { COLONIES, MED_COUNTRIES, MED_LAND, MED_VIEW } from '../grecja-gory-i-morze/geo-srodziemne';
import { IMPERIUM_REGIONS, IMPERIUM_STAGES } from '../od-wioski-do-imperium/geo-imperium';
import { medXY } from '../od-katakumb-do-religii-panujacej/pawel';

type LayerKey = 'egipt' | 'grecja' | 'rzym' | 'chrzescijanstwo';

const STAGE_117 = IMPERIUM_STAGES.find((s) => s.year === 117)!;
const STAGE_395 = IMPERIUM_STAGES.find((s) => s.year === 395)!;
const POLAND = MED_COUNTRIES.find((c) => c.id === 'POL')!;

/**
 * Szlak bursztynowy — przebieg orientacyjny: Akwileja → Carnuntum (nad
 * Dunajem) → przez Bramę Morawską → okolice Kalisza (Calisia u Ptolemeusza)
 * → wybrzeże Bałtyku koło Gdańska (Encyclopaedia Britannica, „Amber Road”).
 */
const AMBER: [number, number][] = [
  [13.37, 45.77],
  [16.9, 48.11],
  [17.6, 49.6],
  [18.09, 51.76],
  [18.65, 54.35],
];

const LAYERS: { key: LayerKey; name: string; when: string; fill: string }[] = [
  { key: 'egipt', name: 'Egipt faraonów', when: 'od ok. 3000 p.n.e.', fill: '#d4a017' },
  { key: 'grecja', name: 'Grecja i jej kolonie', when: 'VIII–V w. p.n.e.', fill: '#2f80b0' },
  { key: 'rzym', name: 'Imperium rzymskie', when: '117 n.e.', fill: '#b23a3a' },
  { key: 'chrzescijanstwo', name: 'Chrześcijaństwo religią panującą', when: 'koniec IV w.', fill: '#6b4fa0' },
];

/**
 * Blok 3 — **Cztery mapy, jedna ręka**. Gesty: włącza po kolei cztery
 * warstwy na jednej mapie (zasięgi z L19, L22, L26 i L30 — te same dane),
 * potem stuka, gdzie dziś stoi jego dom; sędzią jest kontur Polski z mapy.
 * Po trafieniu wyrasta szlak bursztynowy. `onDone` po stuknięciu Polski.
 */
export function MapyWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [on, setOn] = useState<LayerKey[]>([]);
  const [home, setHome] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const reported = useRef(false);
  const all = on.length === LAYERS.length;

  const toggle = (k: LayerKey) => setOn((x) => (x.includes(k) ? x.filter((i) => i !== k) : [...x, k]));

  const tapPoland = () => {
    if (!all || home) return;
    setMsg(null);
    setHome(true);
    if (!reported.current) {
      reported.current = true;
      onDone();
    }
  };
  const tapElsewhere = () => {
    if (!all || home) return;
    setMsg('To nie Polska. Szukaj nad Bałtykiem, na północ od gór — daleko od Morza Śródziemnego.');
  };

  const regions = (keys: readonly string[]) => keys.map((r) => IMPERIUM_REGIONS[r]).filter(Boolean);
  const amber = AMBER.map(([lon, lat]) => medXY(lon, lat));

  return (
    <div className="space-y-3">
      <p className="text-sm leading-relaxed">
        Przez rok oglądałeś/łaś osobne mapy. <strong>Włącz wszystkie cztery naraz</strong> — zobacz, jak na siebie zachodzą.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {LAYERS.map((l) => (
          <button
            key={l.key}
            type="button"
            aria-pressed={on.includes(l.key)}
            onClick={() => toggle(l.key)}
            className={cn('flex items-center gap-1.5 border-2 bg-white px-2.5 py-1 text-left text-sm dark:bg-zinc-900', on.includes(l.key) && 'font-semibold')}
            style={on.includes(l.key) ? { borderColor: l.fill } : undefined}
          >
            <span className="h-3 w-3 shrink-0" style={{ background: l.fill, opacity: on.includes(l.key) ? 1 : 0.35 }} aria-hidden />
            <span>
              {l.name} <span className="text-xs font-normal text-muted-foreground">· {l.when}</span>
            </span>
          </button>
        ))}
      </div>

      <div className="mx-auto max-w-[640px] border bg-[#dbe8ef] dark:bg-zinc-900">
        <svg viewBox={`0 0 ${MED_VIEW.w} ${MED_VIEW.h}`} className="block h-auto w-full select-none" role="img" aria-label="Mapa Europy i Morza Śródziemnego z zasięgami starożytnych państw">
          <defs>
            <clipPath id="wyk-land">
              <path d={MED_LAND} />
            </clipPath>
            <pattern id="wyk-hatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#6b4fa0" strokeWidth="2.2" />
            </pattern>
          </defs>
          <rect width={MED_VIEW.w} height={MED_VIEW.h} fill="transparent" onClick={tapElsewhere} />
          <path d={MED_LAND} fill="#efe8d6" stroke="#b8ab8a" strokeWidth={0.5} onClick={tapElsewhere} />
          <g clipPath="url(#wyk-land)" pointerEvents="none">
            {on.includes('rzym') && regions(STAGE_117.regions).map((d, i) => <path key={i} d={d} fill="#b23a3a" opacity={0.35} />)}
            {on.includes('chrzescijanstwo') && regions(STAGE_395.regions).map((d, i) => <path key={i} d={d} fill="url(#wyk-hatch)" opacity={0.55} />)}
            {on.includes('egipt') && <path d={IMPERIUM_REGIONS['egipt']} fill="#d4a017" opacity={0.6} />}
            {on.includes('grecja') && <path d={IMPERIUM_REGIONS['macgr']} fill="#2f80b0" opacity={0.5} />}
          </g>
          {on.includes('grecja') &&
            COLONIES.map((c) => <circle key={c.id} cx={c.xy[0]} cy={c.xy[1]} r={2.6} fill="#2f80b0" stroke="#fff" strokeWidth={0.6} pointerEvents="none" />)}
          <path
            d={POLAND.d}
            fill={home ? color : 'transparent'}
            fillOpacity={home ? 0.45 : 1}
            stroke={home ? color : 'transparent'}
            strokeWidth={1}
            onClick={tapPoland}
            className={all && !home ? 'cursor-pointer' : undefined}
          />
          {home && (
            <>
              <polyline points={amber.map((p) => p.join(',')).join(' ')} fill="none" stroke="#d98e04" strokeWidth={2.5} strokeDasharray="5 3" />
              {amber.map(([x, y], i) => (
                <circle key={i} cx={x} cy={y} r={2.5} fill="#d98e04" stroke="#fff" strokeWidth={0.6} />
              ))}
            </>
          )}
        </svg>
      </div>

      {all && !home && (
        <p className="text-sm leading-relaxed">
          <strong>Stuknij na mapie, gdzie dziś stoi Twój dom.</strong>
        </p>
      )}
      {msg && <p className="text-sm text-destructive">{msg}</p>}
      {home && (
        <p className="border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          Ziemie dzisiejszej Polski leżały <strong>poza</strong> wszystkimi tymi państwami — nawet imperium rzymskie zatrzymało się na
          Dunaju. Ale nie były odcięte od świata. Przez nie biegł <strong>szlak bursztynowy</strong> (pomarańczowa linia): kupcy
          z imperium jechali nad Bałtyk po bursztyn, a płacili rzymskimi monetami — archeolodzy znajdują je w polskiej ziemi do dziś,
          czasem całymi skarbami. Grecki uczony Ptolemeusz zapisał na swojej mapie miejscowość Calisia — wielu historyków uważa, że to
          dzisiejszy Kalisz.
        </p>
      )}
    </div>
  );
}
