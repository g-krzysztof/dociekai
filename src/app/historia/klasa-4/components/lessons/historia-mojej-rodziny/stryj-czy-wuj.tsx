'use client';

import { useEffect, useRef, useState } from 'react';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { DragGhost, useDragToken } from '../../family-tree/use-drag-token';
import { KIN_PEOPLE, KIN_TERMS, judgeKin, type KinId, type KinPerson } from './pokrewienstwo';

/**
 * Blok 1 — **„Stryj czy wuj?”** (haczyk).
 *
 * Gest: dziecko **przenosi tabliczki z nazwami** (stryj, wuj, ciotka, dziadek,
 * prababcia, kuzyn) na osoby ze zdjęcia rodzinnego **według tego, co każda z nich
 * mówi** — „Jestem bratem taty Franka”. Odpowiedź wynika z wypowiedzi i reguły
 * słowa (stuknięta tabliczka pokazuje, co znaczy), nie z domysłu. Dobra
 * tabliczka zostaje i nad osobą na zdjęciu zapala się jej słowo; zła wraca na
 * tacę z konkretem: reguła słowa kontra zdanie osoby.
 *
 * Zdjęcie jest rysunkiem (sylwetki) — rodzina Franka jest wymyślona.
 */

const SKIN = ['#e8c9a8', '#d9b48f', '#f0d5b8'];
const CLOTHES = ['#8fb3c9', '#c9a38f', '#9bbf8a', '#d6b86a', '#b79ac4', '#c98f8f'];

interface Fig {
  n: number | null;
  x: number;
  base: number;
  adult: boolean;
  dress?: boolean;
  grey?: boolean;
  tall?: number;
  star?: boolean;
}

// Pozycje wynikają z numerów osób na zdjęciu.
const FIGS: Fig[] = [
  { n: 3, x: 38, base: 120, adult: true, dress: true, grey: true, tall: 0.86 },
  { n: 5, x: 108, base: 120, adult: true, grey: true, tall: 0.98 },
  { n: 1, x: 178, base: 120, adult: true, tall: 1.04 },
  { n: 4, x: 248, base: 120, adult: true, tall: 1.06 },
  { n: 6, x: 318, base: 120, adult: true, dress: true, tall: 0.98 },
  { n: null, x: 142, base: 146, adult: false, star: true },
  { n: 2, x: 214, base: 146, adult: false, dress: true },
];

function Photo({ placed, color }: { placed: Record<number, KinId>; color: string }) {
  return (
    <svg viewBox="0 0 360 160" className="h-auto w-full" role="img" aria-label="Zdjęcie rodzinne: pięcioro dorosłych w tylnym rzędzie i dwoje dzieci z przodu, w tym Franek">
      <rect width="360" height="160" fill="#f3ecdc" />
      <rect y="120" width="360" height="40" fill="#e4d9bd" />
      {FIGS.map((f, i) => {
        const h = (f.adult ? 52 : 32) * (f.tall ?? 1);
        const r = f.adult ? 9 : 7;
        const top = f.base - h;
        const label = f.n !== null && placed[f.n] ? KIN_TERMS.find((t) => t.id === placed[f.n!])!.label : null;
        const cloth = CLOTHES[i % CLOTHES.length];
        return (
          <g key={i}>
            {f.dress ? (
              <path d={`M${f.x - 4} ${top + r * 2 + 2} h8 l${f.adult ? 12 : 9} ${h - r * 2 - 2} h${f.adult ? -32 : -26} z`} fill={cloth} />
            ) : (
              <rect x={f.x - (f.adult ? 12 : 9)} y={top + r * 2 + 1} width={f.adult ? 24 : 18} height={h - r * 2 - 1} rx="3" fill={cloth} />
            )}
            <circle cx={f.x} cy={top + r} r={r} fill={SKIN[i % SKIN.length]} />
            {f.grey && <path d={`M${f.x - r} ${top + r} a${r} ${r} 0 0 1 ${r * 2} 0 z`} fill="#c9c4bb" />}
            {f.star ? (
              <g>
                <text x={f.x} y={top - 5} textAnchor="middle" fontSize="13" fill={color}>★</text>
                <text x={f.x} y={top - 17} textAnchor="middle" fontSize="9" fontWeight="700" fill="#4a4338">Franek</text>
              </g>
            ) : label ? (
              <g>
                <rect x={f.x - 30} y={top - 20} width="60" height="15" fill={color} />
                <text x={f.x} y={top - 9} textAnchor="middle" fontSize="9.5" fontWeight="700" fill="#fff">{label}</text>
              </g>
            ) : (
              <g>
                <circle cx={f.x} cy={top - 10} r="8" fill="#fff" stroke="#4a4338" strokeWidth="1" />
                <text x={f.x} y={top - 6.5} textAnchor="middle" fontSize="10" fontWeight="700" fill="#4a4338">{f.n}</text>
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}

export function StryjCzyWuj({ color, onComplete }: { color: string; onComplete: () => void }) {
  // numer osoby → tabliczka, która tam stoi (tylko poprawne zostają)
  const [placed, setPlaced] = useState<Record<number, KinId>>({});
  const [selected, setSelected] = useState<KinId | null>(null);
  const [note, setNote] = useState<{ text: string; key: number } | null>(null);
  const reported = useRef(false);

  const used = new Set(Object.values(placed));
  const tray = KIN_TERMS.filter((t) => !used.has(t.id));
  const allDone = tray.length === 0;

  useEffect(() => {
    if (allDone && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [allDone, onComplete]);

  const tryPlace = (term: KinId, person: KinPerson) => {
    setSelected(null);
    const verdict = judgeKin(person, term);
    if (verdict.ok) {
      setPlaced((prev) => ({ ...prev, [person.n]: term }));
      setNote(null);
    } else {
      setNote({ text: verdict.note ?? '', key: Date.now() });
    }
  };

  const { drag, hover, bind } = useDragToken({
    onDrop: (id, target) => {
      const person = KIN_PEOPLE.find((p) => String(p.n) === target);
      if (person && !placed[person.n]) tryPlace(id as KinId, person);
    },
    onTap: (id) => setSelected((prev) => (prev === id ? null : (id as KinId))),
  });

  const selectedTerm = KIN_TERMS.find((t) => t.id === selected);
  const ordered = [...KIN_PEOPLE].sort((a, b) => a.n - b.n);

  return (
    <div className="space-y-4">
      <div className="mx-auto w-full max-w-xl overflow-hidden border">
        <Photo placed={placed} color={color} />
      </div>
      <p className="text-center text-xs text-muted-foreground">
        Rodzina Franka jest wymyślona — rysunek też. Wszyscy mówią o Franku.
      </p>

      <div className="border-2 border-dashed bg-muted/20 p-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Tabliczki ({tray.length}) — przeciągnij na osobę albo stuknij tabliczkę, a potem osobę
        </p>
        {allDone ? (
          <p className="text-sm text-muted-foreground">Wszystkie tabliczki stoją na swoich miejscach.</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {tray.map((t) => (
              <button
                key={t.id}
                type="button"
                {...bind(t.id)}
                aria-pressed={selected === t.id}
                className={cn(
                  'touch-none select-none border-2 bg-white px-3 py-1.5 text-sm font-semibold dark:bg-zinc-900',
                  drag?.id === t.id && 'opacity-40'
                )}
                style={{
                  borderColor: selected === t.id ? color : 'var(--border)',
                  boxShadow: selected === t.id ? `0 0 0 2px ${color}` : undefined,
                }}
              >
                {t.label}
              </button>
            ))}
          </div>
        )}
        {selectedTerm && (
          <p className="mt-2 text-sm" style={{ color }} aria-live="polite">
            <strong>{selectedTerm.label}</strong> — {selectedTerm.rule.replace(/^[^ ]+ (to|jest) /, '')}
          </p>
        )}
      </div>

      <ol className="space-y-2">
        {ordered.map((p) => {
          const term = placed[p.n] ? KIN_TERMS.find((t) => t.id === placed[p.n]) : null;
          return (
            <li key={p.n} className="grid grid-cols-[1.75rem_1fr_8.5rem] items-center gap-2 sm:grid-cols-[2rem_1fr_11rem]">
              <span
                className="flex h-7 w-7 items-center justify-center rounded-full border text-sm font-bold"
                style={{ borderColor: color, color }}
              >
                {p.n}
              </span>
              <p className="bg-muted/50 px-3 py-2 text-sm leading-snug">„{p.says}”</p>
              <button
                type="button"
                data-drop={String(p.n)}
                disabled={Boolean(term)}
                onClick={() => {
                  if (selected && !term) tryPlace(selected, p);
                }}
                className={cn(
                  'flex min-h-[2.5rem] items-center justify-center border-2 px-2 text-center text-sm transition-colors',
                  term ? 'font-semibold text-white' : 'border-dashed text-muted-foreground',
                  hover === String(p.n) && !term && 'bg-muted'
                )}
                style={term ? { backgroundColor: color, borderColor: color } : selected ? { borderColor: color } : undefined}
              >
                {term ? (
                  <span className="flex items-center gap-1">
                    <Check className="h-4 w-4" aria-hidden /> {term.label}
                  </span>
                ) : (
                  <span>{selected ? 'połóż tu' : 'kim jest?'}</span>
                )}
              </button>
            </li>
          );
        })}
      </ol>

      <div aria-live="polite" className="min-h-[2.5rem] text-sm leading-relaxed">
        {note ? (
          <p key={note.key} className="border border-destructive/50 bg-destructive/5 px-3 py-2 text-destructive">
            {note.text}
          </p>
        ) : allDone ? (
          <p className="border-2 p-3" style={{ borderColor: color }}>
            <strong>Wszyscy rozpoznani.</strong> Zauważ, że żadna z tych osób nie powiedziała, jak się nazywa — każda
            powiedziała, <em>kim jest dla Franka</em>. Tak działa rodzina: słowo mówi o połączeniu. A takie połączenia da
            się narysować — drzewem.
          </p>
        ) : null}
      </div>

      <DragGhost drag={drag}>
        {drag && (
          <span className="border-2 bg-white px-3 py-1.5 text-sm font-semibold dark:bg-zinc-900" style={{ borderColor: color }}>
            {KIN_TERMS.find((t) => t.id === drag.id)?.label}
          </span>
        )}
      </DragGhost>
    </div>
  );
}
