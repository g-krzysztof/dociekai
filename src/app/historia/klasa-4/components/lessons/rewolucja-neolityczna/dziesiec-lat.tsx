'use client';

import Image from 'next/image';
import { plural } from '@/lib/plural';
import { useEffect, useRef, useState, type PointerEvent } from 'react';
import {
  CELLS,
  DROUGHT_YEAR,
  START_PEOPLE,
  YEARS,
  getSpecialist,
  houses,
  initialVillage,
  people,
  runYear,
  statsOf,
  type VillageState,
  type VillageStats,
} from './wioska';

/**
 * Blok 1 (symulator): **dziesięć lat w dolinie**. Rok po roku dziecko
 * **sieje** (wodzi palcem po zagonach — ziarno pada tam, gdzie przejedzie),
 * czeka, aż zboże dojrzeje, i **żnie sierpem** (znowu palcem po zagonach).
 * Plon sam trafia do spichlerza. Po trzech latach może przyspieszyć —
 * ten sam rytm, siedem lat. Na scenie przybywa domów i ludzi, którzy nie
 * muszą zdobywać jedzenia; myszy w spichlerzu sprowadzają kota. Obok
 * koczownicy z L15: ich zapas zawsze mieści się w tobołkach.
 */

type Phase = 'siew' | 'wzrost' | 'zniwa';
const MANUAL_YEARS = 3;

export function DziesiecLat({
  color,
  catImage,
  onFinish,
}: {
  color: string;
  catImage: string;
  onFinish: (stats: VillageStats) => void;
}) {
  const [v, setV] = useState<VillageState>(initialVillage);
  const [phase, setPhase] = useState<Phase>('siew');
  const [cells, setCells] = useState<('pusto' | 'zasiane' | 'dojrzale' | 'zzete')[]>(() => Array(CELLS).fill('pusto'));
  const [fast, setFast] = useState(false);
  const painting = useRef(false);
  const finished = useRef(false);

  const over = v.year >= YEARS;
  const last = v.log[v.log.length - 1];

  useEffect(() => {
    if (phase !== 'wzrost') return;
    const t = window.setTimeout(() => {
      setCells((c) => c.map((x) => (x === 'zasiane' ? 'dojrzale' : x)));
      setPhase('zniwa');
    }, 1200);
    return () => window.clearTimeout(t);
  }, [phase]);

  // przyspieszenie: reszta lat z całym polem obsianym, rok co 0,7 s
  useEffect(() => {
    if (!fast || over) return;
    const t = window.setTimeout(() => setV((s) => runYear(s, CELLS)), 700);
    return () => window.clearTimeout(t);
  }, [fast, over, v.year]);

  useEffect(() => {
    if (over && !finished.current) {
      finished.current = true;
      onFinish(statsOf(v));
    }
  }, [over, v, onFinish]);

  const touchCell = (i: number) => {
    setCells((c) => {
      if (phase === 'siew' && c[i] === 'pusto') return c.map((x, k) => (k === i ? 'zasiane' : x));
      if (phase === 'zniwa' && c[i] === 'dojrzale') return c.map((x, k) => (k === i ? 'zzete' : x));
      return c;
    });
  };

  const cellAt = (x: number, y: number): number | null => {
    const el = document.elementFromPoint(x, y)?.closest<HTMLElement>('[data-zagon]');
    return el ? Number(el.dataset.zagon) : null;
  };
  const onDown = (e: PointerEvent<HTMLDivElement>) => {
    if (phase === 'wzrost' || over || fast) return;
    painting.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const i = cellAt(e.clientX, e.clientY);
    if (i !== null) touchCell(i);
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!painting.current) return;
    const i = cellAt(e.clientX, e.clientY);
    if (i !== null) touchCell(i);
  };
  const onUp = () => {
    painting.current = false;
  };

  const sown = cells.filter((c) => c !== 'pusto').length;
  const ripeLeft = cells.filter((c) => c === 'dojrzale').length;

  const endHarvest = () => {
    const harvested = cells.filter((c) => c === 'zzete').length;
    setV((s) => runYear(s, harvested));
    setCells(Array(CELLS).fill('pusto'));
    setPhase('siew');
  };

  useEffect(() => {
    if (phase === 'zniwa' && ripeLeft === 0) {
      const t = window.setTimeout(endHarvest, 350);
      return () => window.clearTimeout(t);
    }
  });

  const hint = over
    ? 'Dziesięć lat minęło.'
    : fast
      ? `Rok ${v.year + 1}: ten sam rytm — siew, czekanie, żniwa.`
      : phase === 'siew'
        ? `Rok ${v.year + 1}: wodź palcem po zagonach i siej. Obsiane: ${sown} z ${CELLS}.`
        : phase === 'wzrost'
          ? 'Zboże rośnie… trzeba poczekać do lata.'
          : `Żniwa! Wodź sierpem po dojrzałym zbożu. Zostało: ${ripeLeft}.`;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Sześć osób postanowiło zostać w dolinie i <strong>siać</strong>. Kto sieje, musi poczekać do żniw — nie można zwinąć
        obozu i odejść. Każdy zjada rocznie jeden worek ziarna. Zobacz, co się stanie przez dziesięć lat.
      </p>

      <div className="grid gap-4 md:grid-cols-[1fr_1fr]">
        {/* pole */}
        <div className="space-y-2">
          <p className="min-h-[2.5rem] text-sm font-medium" style={{ color }} aria-live="polite">
            {hint}
          </p>
          <div
            onPointerDown={onDown}
            onPointerMove={onMove}
            onPointerUp={onUp}
            onPointerCancel={onUp}
            className={`grid grid-cols-4 gap-1 border bg-amber-100 p-1 dark:bg-amber-950 ${phase === 'wzrost' || over || fast ? '' : 'cursor-crosshair touch-none'}`}
            role="group"
            aria-label="Pole z ośmioma zagonami"
          >
            {cells.map((c, i) => (
              <button
                key={i}
                type="button"
                data-zagon={i}
                onClick={() => touchCell(i)}
                aria-label={`Zagon ${i + 1}: ${{ pusto: 'pusty', zasiane: 'obsiany', dojrzale: 'dojrzałe zboże', zzete: 'zżęty' }[c]}`}
                className="relative h-16 overflow-hidden border border-amber-800/30 sm:h-20"
                style={{ background: { pusto: '#a16207', zasiane: '#854d0e', dojrzale: '#eab308', zzete: '#d6b25e' }[c] }}
              >
                {c === 'zasiane' && <span className="absolute inset-0 bg-[radial-gradient(circle,#fef3c7_1.5px,transparent_2px)] bg-[length:10px_10px]" />}
                {c === 'dojrzale' && (
                  <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full" aria-hidden>
                    {[6, 14, 22, 30].map((x) => (
                      <g key={x}>
                        <line x1={x} y1="38" x2={x + 2} y2="10" stroke="#a16207" strokeWidth="1.5" />
                        <ellipse cx={x + 2} cy="9" rx="2.2" ry="5" fill="#ca8a04" />
                      </g>
                    ))}
                  </svg>
                )}
                {c === 'zzete' && <span className="absolute inset-x-1 bottom-1 h-2 bg-amber-700/40" />}
              </button>
            ))}
          </div>
          <div className="flex flex-wrap gap-2">
            {phase === 'siew' && !over && !fast && sown > 0 && (
              <button type="button" onClick={() => setPhase('wzrost')} className="border px-3 py-1.5 text-sm font-semibold text-white" style={{ background: color }}>
                Zasiane — czekamy do lata
              </button>
            )}
            {v.year >= MANUAL_YEARS && !over && !fast && phase === 'siew' && (
              <button type="button" onClick={() => setFast(true)} className="border px-3 py-1.5 text-sm">
                Ten sam rytm przez kolejne {YEARS - v.year} lat ▸
              </button>
            )}
          </div>
          {last && (
            <p className="text-sm text-muted-foreground" aria-live="polite">
              Rok {last.year + 1}: plon {last.harvest}
              {last.drought ? ' (susza!)' : ''}, zjedzone {last.eaten}
              {last.miceAte ? `, myszy zjadły ${last.miceAte}` : ''}
              {last.newcomer ? ` — przychodzi ${getSpecialist(last.newcomer).name}` : ''}
              {last.catArrived ? ' — do spichlerza przychodzi kot' : ''}.
            </p>
          )}
        </div>

        {/* wioska */}
        <WioskaScena v={v} color={color} />
      </div>

      {/* koczownicy dla porównania */}
      <div className="flex items-center gap-3 border border-dashed p-2 text-sm">
        <span className="font-semibold">Koczownicy obok:</span>
        <span className="text-muted-foreground">
          rok {Math.min(v.year + 1, YEARS)} — wciąż {START_PEOPLE} osób, zapas tylko w tobołkach, obóz zwijany kilka razy w roku.
        </span>
      </div>

      {v.cat && (
        <div className="grid items-center gap-3 sm:grid-cols-[200px_1fr]">
          <Image
            src={catImage}
            alt="Akwarela: pręgowany kot siedzi czujnie przy wielkim glinianym dzbanie pełnym ziarna w glinianej spiżarni; na podłodze rozsypane ziarna, zza kosza wygląda mała mysz"
            width={200}
            height={150}
            className="h-auto w-full border"
          />
          <p className="text-sm leading-relaxed">
            Gdzie zapasy ziarna, tam myszy — a gdzie myszy, tam przychodzi kot. Tak zaczęła się przyjaźń ludzi z kotami: nikt
            ich nie łapał, same przyszły do spichlerzy.
          </p>
        </div>
      )}

      {over && (
        <div className="space-y-2 border-l-2 pl-3" style={{ borderColor: color }}>
          <p className="text-sm leading-relaxed">
            Po dziesięciu latach w spichlerzu {plural(v.granary, { one: 'leży', few: 'leżą', many: 'leży' })}{' '}
            <strong>
              {v.granary} {plural(v.granary, { one: 'worek', few: 'worki', many: 'worków' })}
            </strong>{' '}
            zapasu, we wsi {plural(houses(v), { one: 'stoi', few: 'stoją', many: 'stoi' })}{' '}
            <strong>
              {houses(v)} {plural(houses(v), { one: 'dom', few: 'domy', many: 'domów' })}
            </strong>
            , a <strong>{v.specialists.length}</strong>{' '}
            {plural(v.specialists.length, { one: 'osoba nie musi', few: 'osoby nie muszą', many: 'osób nie musi' })} w ogóle
            zdobywać jedzenia.
            {v.log[DROUGHT_YEAR] ? ' W roku suszy wioskę uratował spichlerz.' : ''}
          </p>
          <p className="text-sm leading-relaxed">
            Jedna zmiana — siew — sprawiła, że ludzie zostali w miejscu, zbierali więcej, niż zjadali, i mogli robić inne
            rzeczy niż szukanie jedzenia. Tę wielką zmianę nazywamy <strong>rewolucją neolityczną</strong>.
          </p>
        </div>
      )}
    </div>
  );
}

function WioskaScena({ v, color }: { v: VillageState; color: string }) {
  const h = houses(v);
  const level = Math.min(1, v.granary / 60);
  return (
    <div className="space-y-2">
      <svg viewBox="0 0 300 200" className="block h-auto w-full border bg-[#f4efe1] dark:bg-zinc-900" role="img" aria-label={`Wioska: ${h} domów, ${people(v)} osób, w spichlerzu ${v.granary} worków`}>
        <rect x="0" y="150" width="300" height="50" fill="#d9c99a" />
        {Array.from({ length: h }, (_, k) => {
          const x = 14 + (k % 5) * 40;
          const y = k < 5 ? 108 : 70;
          return (
            <g key={k}>
              <rect x={x} y={y + 18} width="30" height="22" fill="#c8a97e" stroke="#7c5a33" strokeWidth="0.8" />
              <path d={`M${x - 4} ${y + 20} L${x + 15} ${y} L${x + 34} ${y + 20} Z`} fill="#d8c27a" stroke="#7c5a33" strokeWidth="0.8" />
              <rect x={x + 12} y={y + 28} width="7" height="12" fill="#5b3f1d" />
            </g>
          );
        })}
        {/* spichlerz */}
        <g>
          <rect x="226" y="70" width="56" height="80" fill="#e7d3a8" stroke="#7c5a33" />
          <rect x="228" y={150 - 78 * level} width="52" height={78 * level} fill="#eab308" opacity="0.8" />
          <path d="M220 72 L254 50 L288 72 Z" fill="#d8c27a" stroke="#7c5a33" />
          <text x="254" y="166" textAnchor="middle" fontSize="11" fontWeight="700" fill="#44403c">
            {v.granary} {plural(v.granary, { one: 'worek', few: 'worki', many: 'worków' })}
          </text>
          {v.mice && !v.cat && (
            <g fill="#78716c">
              <ellipse cx="236" cy="146" rx="4" ry="2.5" />
              <ellipse cx="270" cy="146" rx="4" ry="2.5" />
            </g>
          )}
          {v.cat && (
            <g>
              <ellipse cx="290" cy="146" rx="7" ry="4" fill="#a8a29e" />
              <circle cx="295" cy="140" r="3.5" fill="#a8a29e" />
            </g>
          )}
        </g>
        {/* ludzie */}
        {Array.from({ length: people(v) }, (_, k) => {
          const spec = k >= START_PEOPLE;
          const x = 12 + k * 19;
          return (
            <g key={k}>
              <circle cx={x} cy="168" r="3.5" fill={spec ? color : '#78716c'} />
              <rect x={x - 3.5} y="172" width="7" height="12" fill={spec ? color : '#78716c'} />
            </g>
          );
        })}
      </svg>
      <ul className="flex flex-wrap gap-1.5 text-xs">
        <li className="border px-1.5 py-0.5">
          <span className="mr-1 inline-block h-2 w-2 bg-stone-500" aria-hidden />
          rolnicy: {START_PEOPLE}
        </li>
        {v.specialists.map((id) => (
          <li key={id} className="border px-1.5 py-0.5" style={{ borderColor: color }}>
            <span className="mr-1 inline-block h-2 w-2" style={{ background: color }} aria-hidden />
            {getSpecialist(id).name} — {getSpecialist(id).does}
          </li>
        ))}
      </ul>
    </div>
  );
}
