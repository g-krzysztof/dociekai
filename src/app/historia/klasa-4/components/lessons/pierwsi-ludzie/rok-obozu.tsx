'use client';

import { useRef, useState } from 'react';
import { RotateCcw } from 'lucide-react';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import {
  MONTHS,
  NEED,
  PLACES,
  advance,
  getPlace,
  grown,
  initialCamp,
  isYearOver,
  judgeYear,
  type FoodKind,
  type PlaceId,
} from './oboz';

/**
 * Blok 2 (symulator): **rok koczowniczego obozu**. Na mapce trzy miejsca
 * i zapasy, które widać jako znaczki; co miesiąc grupa zjada 4 porcje tam,
 * gdzie stoi szałas. Dziecko decyduje tylko, **kiedy zwinąć obóz i dokąd
 * iść** — przeciąga szałas na inne miejsce (albo stuka szałas, potem miejsce).
 * Werdykt po dwunastu miesiącach nazywa miesiąc i miejsce głodu.
 */

const AREAS: Record<PlaceId, { path: string; label: [number, number]; icons: [number, number]; hut: [number, number]; fill: string }> = {
  tundra: { path: 'M0 0H320V74H0Z', label: [10, 18], icons: [10, 28], hut: [262, 40], fill: '#e7eef0' },
  dolina: { path: 'M0 74H180V240H0Z', label: [10, 92], icons: [10, 102], hut: [122, 200], fill: '#e3edd3' },
  las: { path: 'M180 74H320V240H180Z', label: [190, 92], icons: [190, 102], hut: [270, 200], fill: '#cfe0c0' },
};

const KIND_LABEL: Record<FoodKind, string> = {
  jaja: 'ptasie jaja',
  ryby: 'ryby',
  jagody: 'jagody',
  grzyby: 'grzyby',
  renifery: 'renifery',
};

function FoodGlyph({ kind, x, y }: { kind: FoodKind; x: number; y: number }) {
  switch (kind) {
    case 'jaja':
      return <ellipse cx={x + 6} cy={y + 7} rx="4.2" ry="5.5" fill="#fafaf9" stroke="#a8a29e" strokeWidth="0.8" />;
    case 'ryby':
      return <path d={`M${x} ${y + 7} q6 -6 11 0 q-5 6 -11 0 Z M${x + 11} ${y + 7} l3 -3 v6 Z`} fill="#60a5fa" />;
    case 'jagody':
      return (
        <g fill="#6d28d9">
          <circle cx={x + 4} cy={y + 8} r="3" />
          <circle cx={x + 9} cy={y + 8} r="3" />
          <circle cx={x + 6.5} cy={y + 4} r="3" />
        </g>
      );
    case 'grzyby':
      return (
        <g>
          <path d={`M${x + 1} ${y + 7} q5.5 -8 11 0 Z`} fill="#b45309" />
          <rect x={x + 5} y={y + 7} width="2.5" height="5" fill="#f5f5f4" />
        </g>
      );
    case 'renifery':
      return (
        <g stroke="#78716c" strokeWidth="1.2" fill="none">
          <ellipse cx={x + 6} cy={y + 9} rx="5" ry="2.8" fill="#a8a29e" stroke="none" />
          <path d={`M${x + 10} ${y + 7} l2 -5 M${x + 12} ${y + 2} l-2 -1 M${x + 12} ${y + 2} l2 -1`} />
        </g>
      );
  }
}

export function RokObozu({ color, onComplete }: { color: string; onComplete: () => void }) {
  const [camp, setCamp] = useState(initialCamp);
  const [picked, setPicked] = useState(false);
  const completed = useRef(false);

  const over = isYearOver(camp);
  const verdict = over ? judgeYear(camp.log) : null;
  const m = camp.month;

  const step = (goTo: PlaceId) => {
    if (over) return;
    const next = advance(camp, goTo);
    setCamp(next);
    setPicked(false);
    if (isYearOver(next) && judgeYear(next.log).ok && !completed.current) {
      completed.current = true;
      onComplete();
    }
  };

  const { drag, hover, bind } = useDragToken({
    disabled: over,
    onDrop: (_id, target) => {
      if (target && target !== camp.at && PLACES.some((p) => p.id === target)) step(target as PlaceId);
    },
    onTap: () => setPicked((p) => !p),
  });

  const preview = (id: PlaceId) => (over ? camp.stock[id] : grown(getPlace(id), camp.stock[id], m));
  const lastLog = camp.log[camp.log.length - 1];
  const hut = AREAS[camp.at].hut;

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Wasza grupa potrzebuje <strong>{NEED} porcji jedzenia na miesiąc</strong>. Znaczki na mapce to jedzenie, które jest
        w danym miejscu teraz. Co miesiąc coś odrasta albo przychodzi — a stado reniferów wędruje z porą roku. Zostajecie
        (przycisk) albo <strong>zwijacie obóz</strong>: przeciągnij szałas na inne miejsce.
      </p>

      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-lg font-semibold" style={{ color }}>
          {over ? 'Rok minął' : `Miesiąc ${m + 1} z 12: ${MONTHS[m]}`}
        </p>
        {lastLog && !over && (
          <p className="text-sm text-muted-foreground" aria-live="polite">
            {MONTHS[lastLog.month]}: zjedliście {lastLog.eaten} z {NEED}
            {lastLog.short > 0 ? ` — głód, zabrakło ${lastLog.short}` : ''}
          </p>
        )}
      </div>

      <div className="relative mx-auto w-full max-w-[560px] border">
        <svg viewBox="0 0 320 240" className="block h-auto w-full" role="group" aria-label="Mapka okolicy obozu">
          {PLACES.map((p) => {
            const a = AREAS[p.id];
            const n = preview(p.id);
            const kind = p.kind(Math.min(m, 11));
            const isHere = camp.at === p.id;
            const canGo = !over && !isHere && (picked || drag);
            return (
              <g
                key={p.id}
                data-drop={p.id}
                onClick={() => picked && !isHere && step(p.id)}
                style={{ cursor: canGo ? 'pointer' : undefined }}
              >
                <path d={a.path} fill={hover === p.id && !isHere ? '#fde68a' : a.fill} stroke="#57534e" strokeWidth="0.8" />
                {p.id === 'dolina' && <path d="M20 240 C 50 190, 40 150, 90 120 S 160 90, 178 80" fill="none" stroke="#7dd3fc" strokeWidth="5" />}
                {p.id === 'las' &&
                  [0, 1, 2, 3, 4].map((k) => (
                    <path key={k} d={`M${200 + k * 24} 180 l8 -18 l8 18 Z`} fill="#4d7c0f" opacity="0.55" />
                  ))}
                {p.id === 'tundra' && <path d="M150 70 l18 -26 l14 18 l12 -14 l20 22" fill="none" stroke="#a8a29e" strokeWidth="1.5" />}
                <text x={a.label[0]} y={a.label[1]} fontSize="10" fontWeight="600" fill="#292524">
                  {p.name}
                </text>
                {Array.from({ length: n }, (_, k) => (
                  <FoodGlyph key={k} kind={kind} x={a.icons[0] + (k % 6) * 16} y={a.icons[1] + Math.floor(k / 6) * 15} />
                ))}
                <text x={a.label[0]} y={a.icons[1] + (n > 6 ? 44 : n > 0 ? 29 : 10)} fontSize="8.5" fill="#57534e">
                  {n === 0 ? 'nic do jedzenia' : `${n} × ${KIND_LABEL[kind]}`}
                </text>
              </g>
            );
          })}
        </svg>
        {!over && (
          <button
            type="button"
            {...bind('szalas')}
            aria-label={`Szałas — obóz stoi: ${getPlace(camp.at).inName}. Przeciągnij na inne miejsce albo stuknij, potem stuknij miejsce.`}
            className="absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 touch-none items-center justify-center border bg-white/90 dark:bg-zinc-900/90"
            style={{
              left: `${(hut[0] / 320) * 100}%`,
              top: `${(hut[1] / 240) * 100}%`,
              outline: picked ? `3px solid ${color}` : undefined,
            }}
          >
            <HutIcon />
          </button>
        )}
        <DragGhost drag={drag}>
          <span className="flex h-11 w-11 items-center justify-center border bg-white">
            <HutIcon />
          </span>
        </DragGhost>
      </div>

      {!over && (
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={() => step(camp.at)}
            className="border px-4 py-2 text-sm font-semibold text-white"
            style={{ background: color }}
          >
            Zostajemy {getPlace(camp.at).inName} — kolejny miesiąc
          </button>
          <span className="text-xs text-muted-foreground">
            {picked ? 'Stuknij miejsce, do którego idziecie.' : 'Albo przeciągnij szałas — wymarsz zajmuje początek miesiąca.'}
          </span>
        </div>
      )}

      {/* pasek roku */}
      <ol className="grid grid-cols-12 gap-0.5" aria-label="Przebieg roku">
        {MONTHS.map((name, k) => {
          const l = camp.log[k];
          return (
            <li
              key={name}
              title={name}
              className="flex h-9 flex-col items-center justify-center border text-[9px] leading-tight"
              style={{
                background: !l ? undefined : l.short > 0 ? '#fecaca' : '#dcfce7',
                borderColor: k === m && !over ? color : undefined,
              }}
            >
              <span>{name.slice(0, 3)}</span>
              {l && <span className="font-semibold">{l.movedFrom ? '→' : ''}{l.short > 0 ? '!' : '✓'}</span>}
            </li>
          );
        })}
      </ol>

      {verdict && (
        <div className="space-y-3 border-l-2 pl-3" style={{ borderColor: verdict.ok ? color : 'hsl(var(--destructive))' }}>
          <p className={`text-sm leading-relaxed ${verdict.ok ? '' : 'text-destructive'}`}>{verdict.text}</p>
          {verdict.ok ? (
            <p className="text-sm leading-relaxed">
              Tak żyli ludzie przez prawie całe swoje dzieje: <strong>szli za jedzeniem</strong>. Jedzenie w jednym miejscu
              się kończy, stada odchodzą — więc stały dom nie miał sensu. Szałas z żerdzi i skór da się zwinąć w godzinę
              i nieść na plecach. Takich ludzi nazywamy <strong>koczownikami</strong>, a ich życie — zbieractwem
              i łowiectwem.
            </p>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setCamp(initialCamp());
              setPicked(false);
            }}
            className="inline-flex items-center gap-1.5 border px-3 py-1.5 text-sm"
          >
            <RotateCcw className="h-4 w-4" aria-hidden /> {verdict.ok ? 'Przeżyj rok jeszcze raz' : 'Spróbuj jeszcze raz'}
          </button>
        </div>
      )}
    </div>
  );
}

function HutIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7" aria-hidden>
      <path d="M12 3 L21 21 H3 Z" fill="#d6b27a" stroke="#78350f" strokeWidth="1.2" />
      <path d="M12 3 L10 0 M12 3 L14 0" stroke="#78350f" strokeWidth="1.2" />
      <path d="M12 21 V14 L9 21 Z" fill="#78350f" />
    </svg>
  );
}
