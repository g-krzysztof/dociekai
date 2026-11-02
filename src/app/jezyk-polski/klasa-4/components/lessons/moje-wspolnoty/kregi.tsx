'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { ikona } from './ikony';
import {
  KREGI,
  KREGI_MIN,
  ODZNAKI,
  SRODEK,
  WLASNA,
  ileOdznak,
  odznaka,
  promienKregu,
  przypnij,
  wlasnaOk,
  type Przypiecie,
} from './wspolnoty';

/**
 * L8, blok 1 „Kręgi” `[5.3]` — **gest nowy dla kursu: przypina odznaki ról do
 * kręgów wokół siebie.** Pięć koncentrycznych kręgów (dom, klasa, podwórko i
 * kamienica, miejscowość, kraj), w środku „ja”. Odznaka upuszczona na planszy
 * zostaje tam jako pinezka, a krąg wynika z miejsca (odległość od środka).
 * Ta sama odznaka może trafić do kilku kręgów; jedna odznaka własna. Nic nie
 * jest złe; role, nie imiona — i żadnych pytań o to, kto jest w domu.
 */

const KOLORY = ['#fde68a', '#bbf7d0', '#bfdbfe', '#ddd6fe', '#fecaca'];
const SIZE = 320;
const C = SIZE / 2;

interface Props {
  color: string;
  value: Przypiecie[];
  onChange: (p: Przypiecie[]) => void;
  onComplete: () => void;
}

export function Kregi({ color, value, onChange, onComplete }: Props) {
  const boardRef = useRef<HTMLDivElement>(null);
  const last = useRef({ x: 0, y: 0 });
  const [held, setHeld] = useState<string | null>(null);
  const [wlasna, setWlasna] = useState('');
  const [wlasnaTok, setWlasnaTok] = useState<string | null>(() => value.find((p) => p.odznaka === WLASNA)?.wlasna ?? null);
  const [msg, setMsg] = useState('');

  const label = (p: Pick<Przypiecie, 'odznaka' | 'wlasna'>) => (p.wlasna ? p.wlasna : (odznaka(p.odznaka)?.label ?? p.odznaka));

  const dropAt = (tok: string, clientX: number, clientY: number) => {
    const r = boardRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = (clientX - r.left) / r.width;
    const y = (clientY - r.top) / r.height;
    const p = przypnij(value, tok, x, y, tok === WLASNA ? (wlasnaTok ?? '') : undefined);
    setHeld(null);
    if (!p) {
      const r2 = Math.hypot(x - 0.5, y - 0.5) / 0.5;
      setMsg(r2 < SRODEK ? 'Środek to ty. Przypnij odznakę w jednym z kręgów wokół.' : r2 > 1 ? 'Ten róg leży poza kręgami.' : 'Ta odznaka już wisi w tym kręgu.');
      return;
    }
    const next = [...value, p];
    onChange(next);
    const krag = KREGI.find((k) => k.id === p.krag)!.label;
    const n = ileOdznak(next);
    setMsg(
      n >= KREGI_MIN
        ? `${label(p)} → ${krag}. Masz już ${n} ${plural(n, { one: 'odznakę', few: 'odznaki', many: 'odznak' })} — dokładaj, ile chcesz.`
        : `${label(p)} → ${krag}. Jeszcze ${KREGI_MIN - n} ${plural(KREGI_MIN - n, { one: 'odznaka', few: 'odznaki', many: 'odznak' })}.`
    );
    if (n >= KREGI_MIN) onComplete();
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'kregi') dropAt(id, last.current.x, last.current.y);
    },
    onTap: (id) => setHeld((h) => (h === id ? null : id)),
  });

  const bind = (id: string) => {
    const b = drag.bind(id);
    return {
      ...b,
      onPointerUp: (e: PointerEvent<HTMLElement>) => {
        last.current = { x: e.clientX, y: e.clientY };
        b.onPointerUp(e);
      },
    };
  };

  const zrobWlasna = () => {
    if (!wlasnaOk(wlasna)) return;
    setWlasnaTok(wlasna.trim());
    setHeld(null);
  };

  const n = ileOdznak(value);
  const hover = drag.hover === 'kregi';

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        W środku jesteś ty. Wokół — kręgi miejsc, w których bywasz. Przypnij odznaki ról, które do ciebie pasują: przeciągnij
        odznakę na krąg albo stuknij odznakę, a potem krąg. Jedna odznaka może wisieć w kilku kręgach. Nic tu nie jest złe.
      </p>
      <div className="mt-4 grid items-start gap-4 md:grid-cols-[minmax(0,340px)_1fr]">
        <div
          ref={boardRef}
          data-drop="kregi"
          className={`relative mx-auto aspect-square w-full max-w-[340px] ${held ? 'cursor-pointer' : ''}`}
          onClick={(e) => held && dropAt(held, e.clientX, e.clientY)}
          aria-label="Kręgi: od domu przy środku do kraju na zewnątrz"
        >
          <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="block h-full w-full" aria-hidden>
            {[...KREGI].reverse().map((k, ri) => {
              const i = KREGI.length - 1 - ri;
              return <circle key={k.id} cx={C} cy={C} r={Math.round(promienKregu(i) * C * 10) / 10} fill={KOLORY[i]} stroke={hover || held ? color : '#fff'} strokeWidth="2" />;
            })}
            <circle cx={C} cy={C} r={Math.round(SRODEK * C * 10) / 10} fill={color} />
            <text x={C} y={C + 5} textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
              ja
            </text>
            {KREGI.map((k, i) => {
              const r = ((promienKregu(i) + (i === 0 ? SRODEK : promienKregu(i - 1))) / 2) * C;
              return (
                <text key={k.id} x={C} y={Math.round((C - r + 4) * 10) / 10} textAnchor="middle" fontSize="10" fill="#57534e">
                  {k.label}
                </text>
              );
            })}
          </svg>
          {value.map((p) => {
            const Ik = p.odznaka === WLASNA ? null : ikona(odznaka(p.odznaka)?.ikona ?? '');
            return (
              <span
                key={p.key}
                title={`${label(p)} — ${KREGI.find((k) => k.id === p.krag)?.label}`}
                className="pointer-events-none absolute flex h-6 w-6 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-white text-[11px] font-bold shadow-sm"
                style={{ left: `${p.x * 100}%`, top: `${p.y * 100}%`, borderColor: color, color }}
              >
                {Ik ? <Ik className="h-3.5 w-3.5" aria-hidden /> : (p.wlasna ?? '?').slice(0, 1).toUpperCase()}
              </span>
            );
          })}
        </div>
        <div className="space-y-3">
          <div className="flex flex-wrap gap-1.5">
            {ODZNAKI.map((o) => {
              const Ik = ikona(o.ikona);
              const uzyta = value.some((p) => p.odznaka === o.id);
              return (
                <button
                  key={o.id}
                  type="button"
                  {...bind(o.id)}
                  aria-pressed={held === o.id}
                  className="flex cursor-grab touch-none items-center gap-1 border-2 bg-white px-2 py-1 text-xs font-medium dark:bg-zinc-900 sm:text-sm"
                  style={{ borderColor: held === o.id ? '#111' : color, background: uzyta ? `color-mix(in srgb, ${color} 12%, white)` : undefined }}
                >
                  <Ik className="h-3.5 w-3.5 shrink-0" style={{ color }} aria-hidden />
                  {o.label}
                </button>
              );
            })}
            {wlasnaTok && (
              <button
                type="button"
                {...bind(WLASNA)}
                aria-pressed={held === WLASNA}
                className="cursor-grab touch-none border-2 border-dashed bg-white px-2 py-1 text-xs font-medium dark:bg-zinc-900 sm:text-sm"
                style={{ borderColor: held === WLASNA ? '#111' : color }}
              >
                {wlasnaTok}
              </button>
            )}
          </div>
          {!wlasnaTok && (
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                zrobWlasna();
              }}
            >
              <input
                value={wlasna}
                onChange={(e) => setWlasna(e.target.value.slice(0, 24))}
                placeholder="własna rola, np. harcerka"
                className="min-w-0 flex-1 border px-2 py-1.5 text-sm"
                aria-label="Własna odznaka"
                autoComplete="off"
              />
              <button type="submit" disabled={!wlasnaOk(wlasna)} className="flex items-center gap-1 border px-2 py-1.5 text-sm disabled:opacity-40">
                <Plus className="h-3.5 w-3.5" /> Zrób odznakę
              </button>
            </form>
          )}
          <p className="min-h-[2.5rem] text-sm" aria-live="polite">
            {held ? `Trzymasz: ${held === WLASNA ? wlasnaTok : odznaka(held)?.label}. Teraz stuknij miejsce w kręgu.` : msg || 'Rola, nie imię — nikt tu nie pyta, kto mieszka z tobą.'}
          </p>
          <div>
            <p className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Przypięte: {n} {plural(n, { one: 'odznaka', few: 'odznaki', many: 'odznak' })}
              {n >= KREGI_MIN && <Check className="h-3.5 w-3.5" style={{ color }} aria-hidden />}
            </p>
            <ul className="mt-1 space-y-1">
              {KREGI.map((k) => {
                const tu = value.filter((v) => v.krag === k.id);
                if (!tu.length) return null;
                return (
                  <li key={k.id} className="text-sm">
                    <span className="font-medium">{k.label}:</span>{' '}
                    {tu.map((p) => (
                      <button
                        key={p.key}
                        type="button"
                        onClick={() => onChange(value.filter((v) => v.key !== p.key))}
                        className="mb-1 mr-1 inline-flex items-center gap-0.5 border px-1.5 text-xs"
                        aria-label={`Odepnij: ${label(p)} (${k.label})`}
                      >
                        {label(p)} <X className="h-3 w-3" />
                      </button>
                    ))}
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </div>
      <DragGhost drag={drag.drag}>
        <span className="block border-2 bg-white px-2 py-1 text-sm" style={{ borderColor: color }}>
          {drag.drag?.id === WLASNA ? wlasnaTok : odznaka(drag.drag?.id ?? '')?.label}
        </span>
      </DragGhost>
    </div>
  );
}
