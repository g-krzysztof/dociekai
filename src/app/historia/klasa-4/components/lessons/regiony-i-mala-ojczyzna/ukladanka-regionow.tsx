'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Crown, Home } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { PieceGlyph, RegionMap, RMAP } from '../../hist-map/region-map';
import { project } from '../../hist-map/geo';
import { CrownIcon } from '../mapa-i-plan/mapa-kazimierza';
import { PrzypnijPinezke } from '../../timeline/przypnij-pinezke';
import { getCorePin } from '../../../lib/timeline/pins';
import {
  ALL_REGIONS,
  CAPITALS,
  REASONS,
  judgeCrown,
  judgePiece,
  regionName,
  storyOf,
  type Capital,
  type ReasonId,
  type RegionId,
} from './regiony';

const HOLE = '#efe7d2';
const PLACED = '#e6c98f';

/** Kolejność na tacy — przemieszana raz, na stałe (bez losowania: hydracja). */
const TRAY_ORDER: RegionId[] = [
  'slask',
  'podlasie',
  'wielkopolska',
  'ziemia-lubuska',
  'mazowsze',
  'pomorze',
  'lubelszczyzna',
  'kujawy',
  'malopolska',
  'warmia-mazury',
  'ziemia-lodzka',
];

type Stage = 'puzzle' | 'dom' | 'stolice' | 'pinezka';

/**
 * Blok `mapa` L12 — układanka regionów. Kawałek pasuje tylko do swojej dziury
 * (dowodem jest kształt, nie klucz autora); po każdym ułożonym zdanie „co
 * ukształtowało ten region”, a powody zbierają się w cztery kupki. Potem dziecko
 * stuka swój region (nic się nie zapisuje), wiezie koronę przez trzy stolice
 * w kolejności wynikającej z dat przy miastach i przypina pinezkę „Warszawa stolicą”.
 */
export function UkladankaRegionow({
  color,
  lesson,
  done,
  onComplete,
}: {
  color: string;
  lesson: string;
  done: boolean;
  onComplete: () => void;
}) {
  const [placed, setPlaced] = useState<RegionId[]>([]);
  const [last, setLast] = useState<RegionId | null>(null);
  const [selected, setSelected] = useState<RegionId | null>(null);
  const [miss, setMiss] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('puzzle');
  const [home, setHome] = useState<RegionId | null>(null);
  const [crownAt, setCrownAt] = useState(0);
  const [crownMsg, setCrownMsg] = useState<string | null>(null);

  const tray = TRAY_ORDER.filter((id) => !placed.includes(id));

  const place = (piece: RegionId, slot: RegionId) => {
    if (placed.includes(slot)) {
      setMiss(`${regionName(slot)} już leży na swoim miejscu — szukaj pustej dziury.`);
      return;
    }
    const v = judgePiece(piece, slot);
    if (!v.ok) {
      setMiss(v.why);
      return;
    }
    const next = [...placed, piece];
    setPlaced(next);
    setLast(piece);
    setSelected(null);
    setMiss(null);
  };

  const crownTo = (to: Capital['id']) => {
    const v = judgeCrown(crownAt, to);
    if (!v.ok) {
      setCrownMsg(v.why);
      return;
    }
    const order = CAPITALS.find((c) => c.id === to)!.order;
    setCrownAt(order);
    setCrownMsg(null);
    if (order === 3) setStage('pinezka');
  };

  const { drag, hover, bind } = useDragToken({
    disabled: stage !== 'puzzle' && stage !== 'stolice',
    onTap: (id) => {
      if (id === 'korona') return;
      setSelected((s) => (s === id ? null : (id as RegionId)));
      setMiss(null);
    },
    onDrop: (id, target) => {
      if (!target) return;
      if (id === 'korona' && target.startsWith('stolica:')) crownTo(target.slice(8) as Capital['id']);
      else if (target.startsWith('slot:')) place(id as RegionId, target.slice(5) as RegionId);
    },
  });

  const onMapTap = (id: RegionId) => {
    if (stage === 'puzzle' && selected) place(selected, id);
    else if (stage === 'dom') setHome(id);
  };

  const count = (r: ReasonId) => placed.filter((p) => storyOf(p).reason === r).length;
  const allPlaced = placed.length === ALL_REGIONS.length;

  const look = (id: RegionId) => {
    const isPlaced = placed.includes(id);
    if (stage === 'puzzle')
      return { fill: isPlaced ? PLACED : HOLE, dashed: !isPlaced, label: isPlaced, stroke: id === last ? RMAP.ink : undefined };
    if (stage === 'dom') return { fill: id === home ? color : PLACED, opacity: id === home ? 0.8 : 1, label: true };
    return { fill: PLACED, opacity: 0.55, label: false };
  };

  return (
    <div className="space-y-4">
      <div className="grid gap-4 border bg-white p-4 dark:bg-zinc-900/80 sm:p-5 md:grid-cols-[1fr_minmax(0,280px)]">
        <div className="min-w-0">
          <div className={stage === 'puzzle' || stage === 'stolice' ? 'touch-none' : undefined}>
            <RegionMap
              look={look}
              onTap={onMapTap}
              dropPrefix={stage === 'puzzle' ? 'slot:' : undefined}
              hover={hover}
              label="Kontur Polski z dziurami na regiony"
              showRivers={stage !== 'puzzle'}
            >
              {(stage === 'stolice' || stage === 'pinezka') &&
                CAPITALS.map((c) => {
                  const [x, y] = project(c.lonlat);
                  const visited = c.order <= crownAt;
                  const here = c.order === crownAt;
                  return (
                    <g key={c.id} data-drop={`stolica:${c.id}`} onClick={() => stage === 'stolice' && crownTo(c.id)} style={{ cursor: 'pointer' }}>
                      <circle cx={x} cy={y} r={26} fill="transparent" />
                      <circle cx={x} cy={y} r={7} fill={visited ? color : '#fff'} stroke={RMAP.ink} strokeWidth={2} />
                      {here && (
                        <CrownIcon x={x} y={y - 20} s={1.4} />
                      )}
                      <text x={x + 12} y={y + 20} fontSize={15} fontWeight={700} fill={RMAP.ink} stroke="#fffaf0" strokeWidth={3.5} paintOrder="stroke">
                        {c.name}
                      </text>
                      <text x={x + 12} y={y + 37} fontSize={13} fill={RMAP.ink} stroke="#fffaf0" strokeWidth={3.5} paintOrder="stroke">
                        {c.when}
                      </text>
                    </g>
                  );
                })}
            </RegionMap>
          </div>
          {stage === 'puzzle' && (
            <p className="mt-1 text-xs text-muted-foreground">
              Regiony nie mają urzędowych granic. Kawałki to przybliżenie — sklejone dzisiejsze województwa.
            </p>
          )}
        </div>

        <div className="min-w-0 space-y-3 text-sm leading-relaxed">
          {stage === 'puzzle' && (
            <>
              <p>
                {allPlaced
                  ? 'Polska ułożona. Spójrz na cztery kupki powodów.'
                  : 'Przeciągnij kawałek na jego dziurę w konturze (albo stuknij kawałek, potem dziurę).'}
              </p>
              {!allPlaced && (
                <div className="flex flex-wrap gap-1.5">
                  {tray.map((id) => (
                    <button
                      key={id}
                      type="button"
                      {...bind(id)}
                      className="flex w-[64px] touch-none flex-col items-center gap-0.5 border-2 bg-white p-1 text-[10px] font-medium leading-tight dark:bg-zinc-900 sm:w-[78px] sm:text-[11px]"
                      style={{ borderColor: selected === id ? color : 'var(--border)', opacity: drag?.id === id ? 0.35 : 1 }}
                    >
                      <PieceGlyph id={id} fill={PLACED} size={40} className="h-7 w-7 sm:h-10 sm:w-10" />
                      {regionName(id)}
                    </button>
                  ))}
                </div>
              )}
              {miss && <p className="border-l-4 border-amber-500 pl-3">{miss}</p>}
              {last && (
                <motion.div key={last} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="border-l-4 pl-3" style={{ borderColor: color }}>
                  <p className="font-semibold">{regionName(last)}</p>
                  <p>{storyOf(last).text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Powód: {REASONS.find((r) => r.id === storyOf(last).reason)!.title.toLowerCase()}
                  </p>
                </motion.div>
              )}
            </>
          )}

          {stage === 'dom' && (
            <>
              <p className="flex items-center gap-2 font-semibold">
                <Home className="h-4 w-4" style={{ color }} /> A ty? Stuknij region, w którym mieszkasz.
              </p>
              {home ? (
                <div className="border-l-4 pl-3" style={{ borderColor: color }}>
                  <p>
                    Mieszkasz w regionie: <strong>{regionName(home)}</strong>. Twoja mała ojczyzna — wieś,
                    miasto albo dzielnica — leży właśnie tu, a duża ojczyzna to cała Polska.
                  </p>
                  <p className="mt-1">{storyOf(home).text}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Nie wiesz na pewno? Zapytaj dorosłego. Nic się tu nie zapisuje.
                  </p>
                </div>
              ) : (
                <p className="text-muted-foreground">Nie ma złej odpowiedzi — to pytanie o ciebie.</p>
              )}
              {home && (
                <button type="button" onClick={() => setStage('stolice')} className="px-4 py-2 font-semibold text-white" style={{ background: color }}>
                  Dalej: trzy stolice
                </button>
              )}
            </>
          )}

          {(stage === 'stolice' || stage === 'pinezka') && (
            <>
              <p>
                Polska miała <strong>trzy stolice</strong>. Przewieź koronę po kolei, od najdawniejszej —
                przeciągnij ją na miasto albo stuknij miasto. Kolejność zdradzają daty przy miastach.
              </p>
              {stage === 'stolice' && (
                <button
                  type="button"
                  {...bind('korona')}
                  className="inline-flex touch-none items-center gap-2 border-2 bg-white px-3 py-2 font-semibold dark:bg-zinc-900"
                  style={{ borderColor: color, opacity: drag?.id === 'korona' ? 0.35 : 1 }}
                >
                  <Crown className="h-5 w-5" style={{ color }} /> korona
                </button>
              )}
              {crownMsg && <p className="border-l-4 border-amber-500 pl-3">{crownMsg}</p>}
              {crownAt > 0 && (
                <p className="border-l-4 pl-3" style={{ borderColor: color }}>
                  {crownAt === 1 && 'Gniezno — gród Polan w Wielkopolsce, pierwsza stolica.'}
                  {crownAt === 2 && 'Kraków w Małopolsce: tu przez ponad czterysta lat koronowano królów.'}
                  {crownAt === 3 &&
                    'Warszawa na Mazowszu — leżała w połowie drogi między Krakowem a Wilnem, stolicą Litwy, z którą Polska tworzyła wtedy jedno państwo. Stolica do dziś.'}
                </p>
              )}
            </>
          )}
        </div>
      </div>

      {stage === 'puzzle' && placed.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {REASONS.map((r) => (
            <div key={r.id} className="border bg-white p-3 text-sm dark:bg-zinc-900/80">
              <p className="font-mono text-2xl font-bold tabular-nums" style={{ color: count(r.id) ? color : undefined }}>
                {count(r.id)}
              </p>
              <p className="font-medium leading-snug">{r.title}</p>
              <p className="mt-1 text-xs text-muted-foreground">
                {placed.filter((p) => storyOf(p).reason === r.id).map(regionName).join(', ')}
              </p>
            </div>
          ))}
        </div>
      )}

      {stage === 'puzzle' && allPlaced && (
        <div className="border-l-4 bg-white p-4 text-sm leading-relaxed dark:bg-zinc-900/80" style={{ borderColor: color }}>
          <p>
            <strong>Cztery powody, dla których regiony się różnią:</strong> część Polski długo była
            w granicach innego państwa; ludzie żyli z tego, co dawał krajobraz — morza, kopalni, pola;
            mieszkali obok innych narodów i brali od nich słowa, potrawy i zwyczaje; jedne ziemie
            miały stolicę i dwór króla, inne nie.
          </p>
          <button type="button" onClick={() => setStage('dom')} className="mt-3 px-4 py-2 font-semibold text-white" style={{ background: color }}>
            Dalej: twój region
          </button>
        </div>
      )}

      {stage === 'pinezka' && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
          <PrzypnijPinezke pin={getCorePin('warszawa-stolica')} color={color} lesson={lesson} done={done} onPinned={onComplete} />
        </motion.div>
      )}

      <DragGhost drag={drag}>
        {drag?.id === 'korona' ? (
          <span className="flex items-center gap-1 border-2 bg-white px-2 py-1" style={{ borderColor: color }}>
            <Crown className="h-5 w-5" style={{ color }} />
          </span>
        ) : drag ? (
          <span className="block border-2 bg-white p-1" style={{ borderColor: color }}>
            <PieceGlyph id={drag.id as RegionId} fill={PLACED} size={48} />
          </span>
        ) : null}
      </DragGhost>
    </div>
  );
}
