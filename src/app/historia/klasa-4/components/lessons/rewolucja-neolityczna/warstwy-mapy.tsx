'use client';

import { useMemo, useRef, useState, type MouseEvent } from 'react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { WORLD_DEEP, WORLD_LAND } from '../pierwsi-ludzie/geo-swiat';
import { BOX, LAYERS, RIVERS, SITES, STEP, buildGrid, judgeVillage, type LayerId, type LonLat } from './warstwy';

/**
 * Blok 2 (mapa): **warstwy na mapie**. Najpierw dziecko stuka, gdzie samo
 * postawiłoby pierwszą wioskę. Potem **nakłada na mapę przezroczyste folie**
 * (przeciąga je z tacy albo stuka folię, potem mapę): deszcz, rzeki, dzikie
 * zboża, dzikie kozy i owce. Kiedy leżą wszystkie, zapala się przecięcie —
 * Żyzny Półksiężyc — a werdykt mówi, czego brakowało w miejscu dziecka.
 * Kontury lądu z mapy świata L15 (Natural Earth), wycinek 24–62° E, 14–44° N.
 */

const S = 1000 / 360;
const xOf = (lon: number) => (lon + 180) * S;
const yOf = (lat: number) => (78 - lat) * S;
const VB = { x: xOf(BOX.lon0), y: yOf(BOX.lat1), w: (BOX.lon1 - BOX.lon0) * S, h: (BOX.lat1 - BOX.lat0) * S };
const CELL = STEP * S;

const LAYER_NAME_GEN: Record<LayerId, string> = { deszcz: 'deszczu', rzeki: 'rzeki', zboza: 'dzikich zbóż', zwierzeta: 'dzikich kóz i owiec' };

export function WarstwyMapy({ color, onComplete }: { color: string; onComplete: () => void }) {
  const grid = useMemo(buildGrid, []);
  const [village, setVillage] = useState<LonLat | null>(null);
  const [placed, setPlaced] = useState<LayerId[]>([]);
  const [picked, setPicked] = useState<LayerId | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const completed = useRef(false);

  const locked = village !== null && placed.length > 0;
  const all = placed.length === LAYERS.length;

  const lay = (id: LayerId) => {
    if (!village || placed.includes(id)) return;
    const next = [...placed, id];
    setPlaced(next);
    setPicked(null);
    if (next.length === LAYERS.length && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const { drag, hover, bind } = useDragToken({
    disabled: !village || all,
    onDrop: (id, target) => {
      if (target === 'mapa-warstw') lay(id as LayerId);
    },
    onTap: (id) => setPicked((p) => (p === id ? null : (id as LayerId))),
  });

  const tapMap = (e: MouseEvent<SVGSVGElement>) => {
    if (picked) {
      lay(picked);
      return;
    }
    if (locked || !svgRef.current) return;
    const ctm = svgRef.current.getScreenCTM();
    if (!ctm) return;
    const pt = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    const lon = Math.round((pt.x / S - 180) * 10) / 10;
    const lat = Math.round((78 - pt.y / S) * 10) / 10;
    setVillage([lon, lat]);
  };

  const verdict = all && village ? judgeVillage(village) : null;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        {village === null ? (
          <>
            Gdzie ludzie mogli po raz pierwszy zasiać zboże? <strong>Stuknij na mapie miejsce na pierwszą wioskę</strong> —
            tak, jak podpowiada ci intuicja.
          </>
        ) : !all ? (
          <>
            Teraz sprawdź. <strong>Połóż na mapie cztery przezroczyste folie</strong> — przeciągnij je albo stuknij folię,
            potem mapę. Rolnik potrzebuje wszystkiego naraz.
          </>
        ) : (
          <>Cztery folie leżą. Tam, gdzie są dzikie zboża, zwierzęta do oswojenia i woda — z deszczu albo z rzeki — świeci się zielony łuk.</>
        )}
      </p>

      <div data-drop="mapa-warstw" className="relative mx-auto max-w-[640px] select-none border" style={{ outline: hover === 'mapa-warstw' ? `3px solid ${color}` : undefined }}>
        <svg
          ref={svgRef}
          viewBox={`${VB.x} ${VB.y} ${VB.w} ${VB.h}`}
          className={`block h-auto w-full ${!locked || picked ? 'cursor-pointer' : ''}`}
          onClick={tapMap}
          role="img"
          aria-label="Mapa Bliskiego Wschodu z warstwami"
        >
          <rect x={VB.x} y={VB.y} width={VB.w} height={VB.h} fill="#cfe3f3" />
          <path d={WORLD_DEEP} fill="#a9cbe6" />
          <path d={WORLD_LAND} fill="#efe6cf" stroke="#a8936a" strokeWidth="0.6" vectorEffect="non-scaling-stroke" />
          {placed.map((id) => {
            const layer = LAYERS.find((l) => l.id === id)!;
            return (
              <g key={id} fill={layer.color} opacity={all ? 0.16 : 0.3}>
                {grid
                  .filter((c) => c.layers.includes(id))
                  .map((c) => (
                    <rect key={`${c.lon},${c.lat}`} x={xOf(c.lon - STEP / 2)} y={yOf(c.lat + STEP / 2)} width={CELL} height={CELL} />
                  ))}
              </g>
            );
          })}
          {placed.includes('rzeki') &&
            RIVERS.map((r) => (
              <polyline
                key={r.name}
                points={r.line.map(([lo, la]) => `${xOf(lo)},${yOf(la)}`).join(' ')}
                fill="none"
                stroke="#0369a1"
                strokeWidth="1.6"
                vectorEffect="non-scaling-stroke"
              />
            ))}
          {all && (
            <g fill="#16a34a" opacity="0.85">
              {grid
                .filter((c) => c.cradle)
                .map((c) => (
                  <rect key={`${c.lon},${c.lat}`} x={xOf(c.lon - STEP / 2)} y={yOf(c.lat + STEP / 2)} width={CELL} height={CELL} />
                ))}
            </g>
          )}
          {all &&
            SITES.map((s) => (
              <g key={s.id}>
                <circle cx={xOf(s.at[0])} cy={yOf(s.at[1])} r="0.9" fill="#1c1917" />
                <text x={xOf(s.at[0]) + 1.4} y={yOf(s.at[1]) + 1} fontSize="3.2" fill="#1c1917">
                  {s.name}
                </text>
              </g>
            ))}
          {village && (
            <g>
              <circle cx={xOf(village[0])} cy={yOf(village[1])} r="1.8" fill="#fff" stroke={color} strokeWidth="0.9" />
              <text x={xOf(village[0])} y={yOf(village[1]) - 2.6} fontSize="3.2" textAnchor="middle" fontWeight="700" fill={color}>
                twoja wioska
              </text>
            </g>
          )}
          {all && (
            <text x={xOf(41)} y={yOf(39.4)} fontSize="3.6" fontStyle="italic" fontWeight="700" fill="#14532d" textAnchor="middle">
              Żyzny Półksiężyc
            </text>
          )}
          <g fontSize="2.8" fill="#57534e" fontStyle="italic">
            <text x={xOf(31.2)} y={yOf(26)}>Nil</text>
            <text x={xOf(43.6)} y={yOf(31.8)}>Mezopotamia</text>
            <text x={xOf(32.5)} y={yOf(42.6)}>Morze Czarne</text>
          </g>
        </svg>
      </div>

      {village && !all && (
        <div className="flex flex-wrap gap-2">
          {LAYERS.filter((l) => !placed.includes(l.id)).map((l) => (
            <button
              key={l.id}
              type="button"
              {...bind(l.id)}
              className="flex touch-none items-center gap-2 border bg-white px-3 py-2 text-left text-sm dark:bg-zinc-900"
              style={{ outline: picked === l.id ? `3px solid ${color}` : undefined }}
            >
              <span className="h-5 w-5 shrink-0 border" style={{ background: l.color, opacity: 0.45 }} aria-hidden />
              <span>
                <span className="block font-semibold">{l.name}</span>
                <span className="block text-xs text-muted-foreground">{l.hint}</span>
              </span>
            </button>
          ))}
          {!placed.length && (
            <button type="button" onClick={() => setVillage(null)} className="text-xs text-muted-foreground underline">
              Przestaw wioskę
            </button>
          )}
        </div>
      )}
      <DragGhost drag={drag}>
        <span className="block border bg-white px-3 py-2 text-sm font-semibold">{LAYERS.find((l) => l.id === drag?.id)?.name}</span>
      </DragGhost>

      {verdict && (
        <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: color }}>
          <p className="text-sm leading-relaxed">
            {verdict.ok
              ? 'Twoja wioska stoi w zielonym łuku — tu było wszystko naraz. Dobre oko!'
              : `W miejscu twojej wioski zabrakło: ${verdict.missing.map((m) => LAYER_NAME_GEN[m]).join(', ')}. Bez tego pierwsi rolnicy by nie przetrwali.`}
          </p>
          <p className="text-sm leading-relaxed">
            Ten zielony łuk nazywamy <strong>Żyznym Półksiężycem</strong> — od kształtu. To tu, ok. 10 000 lat p.n.e., ludzie
            zaczęli siać i oswajać zwierzęta. Leżą tu Jerycho i — trochę dalej, w Azji Mniejszej — Çatalhöyük, jedne
            z najstarszych dużych osad świata. Dolina Nilu jest obok i jest podobna, ale dzikie zboża tam nie rosły — rolnictwo
            przyszło tam później.
          </p>
        </div>
      )}
    </div>
  );
}
