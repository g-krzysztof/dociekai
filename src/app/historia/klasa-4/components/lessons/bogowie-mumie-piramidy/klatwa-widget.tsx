'use client';

import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { Minus, Plus } from 'lucide-react';
import { AXIS_FROM, AXIS_TO, CURSE_YEARS, TEAM, judgeCurseCount, judgeThread } from './klatwa';

/**
 * Blok 4 L20 — **klątwa faraona? Sprawdź**. Nagłówki gazet (napisane przez
 * nas) krzyczą o klątwie. Dziecko **rozciąga nić życia** każdego członka
 * ekipy od odkrycia grobu do roku śmierci — rok odczytuje albo liczy z karty.
 * Potem liczy nici, które kończą się w pasie „klątwy” (10 lat). Wniosek z
 * danych: klątwa nie wytrzymuje sprawdzenia.
 */

const SPAN = AXIS_TO - AXIS_FROM;
const pct = (year: number) => ((year - AXIS_FROM) / SPAN) * 100;
const TICKS = [1922, 1930, 1940, 1950, 1960, 1970, 1980];

export function KlatwaWidget({ color, onDone }: { color: string; onDone: () => void }) {
  const [ends, setEnds] = useState<Record<string, number>>(() => Object.fromEntries(TEAM.map((m) => [m.id, AXIS_FROM + 1])));
  const [done, setDone] = useState<string[]>([]);
  const [hint, setHint] = useState<string | null>(null);
  const [count, setCount] = useState(3);
  const [countMiss, setCountMiss] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const drag = useRef<{ id: string; rect: DOMRect } | null>(null);

  const allThreads = done.length === TEAM.length;

  const yearAt = (clientX: number, rect: DOMRect) => {
    const f = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    return Math.max(AXIS_FROM + 1, Math.round(AXIS_FROM + f * SPAN));
  };

  const check = (id: string, year: number) => {
    const m = TEAM.find((t) => t.id === id);
    if (!m) return;
    const v = judgeThread(m, year);
    if (v.ok) {
      setHint(null);
      setDone((d) => (d.includes(id) ? d : [...d, id]));
    } else {
      setHint(v.hint);
    }
  };

  const onDown = (id: string) => (e: PointerEvent<HTMLDivElement>) => {
    if (done.includes(id)) return;
    const track = e.currentTarget.parentElement;
    if (!track) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // jw.
    }
    drag.current = { id, rect: track.getBoundingClientRect() };
  };
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    const y = yearAt(e.clientX, d.rect);
    setEnds((p) => ({ ...p, [d.id]: y }));
  };
  const onUp = () => {
    const d = drag.current;
    drag.current = null;
    if (d) check(d.id, ends[d.id]);
  };
  const onKey = (id: string) => (e: KeyboardEvent<HTMLDivElement>) => {
    if (done.includes(id)) return;
    const step = e.shiftKey ? 10 : 1;
    if (e.key === 'ArrowRight') setEnds((p) => ({ ...p, [id]: Math.min(AXIS_TO, p[id] + step) }));
    else if (e.key === 'ArrowLeft') setEnds((p) => ({ ...p, [id]: Math.max(AXIS_FROM + 1, p[id] - step) }));
    else if (e.key === 'Enter' || e.key === ' ') check(id, ends[id]);
    else return;
    e.preventDefault();
  };

  const submitCount = () => {
    const v = judgeCurseCount(count);
    if (v.ok) {
      setCountMiss(null);
      setSolved(true);
      onDone();
    } else setCountMiss(v.hint);
  };

  return (
    <div className="space-y-4">
      <div className="relative grid gap-2 border bg-[#f4efe2] p-3 font-serif dark:bg-zinc-900 sm:grid-cols-2">
        <p className="text-lg font-bold uppercase leading-tight">Klątwa faraona zabiła lorda!</p>
        <p className="text-base font-bold leading-tight">„Kto zakłóci spokój króla, tego dosięgnie śmierć” — ostrzegają uczeni</p>
        <p className="font-sans text-[11px] text-muted-foreground sm:col-span-2">
          Przykład — nagłówki napisaliśmy sami, ale w 1923 roku gazety na całym świecie pisały właśnie tak.
        </p>
        {solved && (
          <span
            className="pointer-events-none absolute right-3 top-3 rotate-[-8deg] border-4 px-2 py-1 font-sans text-sm font-black uppercase tracking-wide"
            style={{ borderColor: color, color }}
          >
            Nie wytrzymuje sprawdzenia
          </span>
        )}
      </div>

      <p className="text-sm leading-relaxed">
        Sprawdź to danymi. Oto sześć osób, które pracowały przy grobie. <strong>Pociągnij koniec każdej nici</strong> do roku, w którym ta
        osoba zmarła — rok jest na karcie albo trzeba go policzyć.
      </p>

      <div className="space-y-3">
        <div className="relative h-5 text-[10px] text-muted-foreground">
          {TICKS.map((t) => (
            <span key={t} className="absolute -translate-x-1/2" style={{ left: `${pct(t)}%` }}>
              {t}
            </span>
          ))}
        </div>
        {TEAM.map((m) => {
          const end = ends[m.id];
          const ok = done.includes(m.id);
          return (
            <div key={m.id} className="space-y-1">
              <p className="text-xs leading-snug">
                <strong>{m.name}</strong> — {m.role}. <span className="italic">{m.clue}</span>
              </p>
              <div className="relative h-8 border-b">
                {allThreads && (
                  <div
                    aria-hidden
                    className="absolute inset-y-0 left-0 bg-red-500/10"
                    style={{ width: `${pct(AXIS_FROM + CURSE_YEARS)}%` }}
                  />
                )}
                <div className="absolute top-1/2 h-1 -translate-y-1/2" style={{ left: 0, width: `${pct(end)}%`, background: ok ? color : '#a8a29e' }} />
                <div
                  role="slider"
                  tabIndex={ok ? -1 : 0}
                  aria-label={`Nić życia: ${m.name}`}
                  aria-valuemin={AXIS_FROM + 1}
                  aria-valuemax={AXIS_TO}
                  aria-valuenow={end}
                  onPointerDown={onDown(m.id)}
                  onPointerMove={onMove}
                  onPointerUp={onUp}
                  onPointerCancel={onUp}
                  onKeyDown={onKey(m.id)}
                  className={`absolute top-1/2 flex h-8 min-w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center border-2 bg-white px-1 font-mono text-[11px] tabular-nums dark:bg-zinc-900 ${ok ? '' : 'cursor-ew-resize touch-none'}`}
                  style={{ left: `${pct(end)}%`, borderColor: ok ? color : '#78716c' }}
                >
                  {end}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {hint && (
        <p className="text-sm text-destructive" role="status">
          {hint}
        </p>
      )}

      {allThreads && (
        <div className="space-y-2 border p-3">
          <p className="text-sm leading-relaxed">
            Zacieniony pas to <strong>{CURSE_YEARS} lat po odkryciu grobu</strong> — czas, w którym według gazet klątwa miała dosięgnąć
            winnych. <strong>Ile nici kończy się w tym pasie?</strong>
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button type="button" aria-label="mniej" disabled={solved} onClick={() => setCount((c) => Math.max(0, c - 1))} className="border p-2 disabled:opacity-40">
              <Minus className="h-4 w-4" />
            </button>
            <span className="w-8 text-center font-mono text-lg tabular-nums">{count}</span>
            <button type="button" aria-label="więcej" disabled={solved} onClick={() => setCount((c) => Math.min(6, c + 1))} className="border p-2 disabled:opacity-40">
              <Plus className="h-4 w-4" />
            </button>
            {!solved && (
              <button type="button" onClick={submitCount} className="ml-2 border-2 px-3 py-2 text-sm font-semibold" style={{ borderColor: color }}>
                Sprawdź
              </button>
            )}
          </div>
          {countMiss && <p className="text-sm text-destructive">{countMiss}</p>}
        </div>
      )}

      {solved && (
        <div className="space-y-2 border-l-2 pl-3 text-sm leading-relaxed" style={{ borderColor: color }}>
          <p>
            <strong>Jedna osoba z sześciu.</strong> Lord Carnarvon zmarł szybko — ale z prawdziwego powodu: zaciął się przy goleniu w
            ukąszenie komara, rana się zakaziła, przyszło zapalenie płuc, a leków na zakażenia jeszcze wtedy nie znano. Howard Carter,
            który pierwszy zajrzał do grobu, żył jeszcze 17 lat. Lady Evelyn — 57.
          </p>
          <p>
            Skąd więc nagłówki? Lord sprzedał prawo do wiadomości z wykopalisk jednej gazecie. Inne nie mogły wejść do grobu, więc pisały
            to, co się dobrze sprzedawało — tajemnicę i strach. W grobie nie znaleziono żadnego napisu z klątwą.
          </p>
          <p>
            Tak działa historyk: <strong>nie wierzy nagłówkowi, tylko sprawdza daty</strong>.
          </p>
        </div>
      )}
    </div>
  );
}
