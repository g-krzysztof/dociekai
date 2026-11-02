'use client';

import { useEffect, useState } from 'react';
import { Check, Pause, Play } from 'lucide-react';
import { Twarz, type Ksztalt } from '../../twarz/twarz';
import { POGARSZAJACE, SCENA, napiecie, stukniecie, type Kto } from './klotnia';

/**
 * L7, blok 1 „Kłótnia toczy się sama” — **gest nowy dla kursu: przewija
 * kłótnię suwakiem czasu jak taśmę i stuka zdania, po których robi się
 * gorzej.** Twarze (SVG) i miernik głośności idą za taśmą; „pogarszające”
 * zdanie rozpoznaje się po skutku w scenie, więc przyjmowane jest każde takie.
 */

export function twarzNapiecia(kto: 'tymek' | 'zuzia', t: number): Ksztalt {
  if (kto === 'zuzia' && t >= 3) return { brwi: 0.5, oczy: -0.7, usta: -1 };
  return { brwi: -0.33 * t, oczy: -0.15 * t, usta: 0.4 - 0.4 * t };
}

const KTO_LABEL: Record<Kto, string> = { narrator: 'narrator', tymek: 'Tymek', zuzia: 'Zuzia' };

interface Props {
  color: string;
  onComplete: () => void;
}

export function Tasma({ color, onComplete }: Props) {
  const [pos, setPos] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [found, setFound] = useState<string[]>([]);
  const [msg, setMsg] = useState('Puść taśmę. Potem cofaj suwakiem i stukaj zdania, po których robi się gorzej.');
  const need = 3;
  const done = found.length >= need;
  const n = napiecie(pos);

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  useEffect(() => {
    if (!playing) return;
    if (pos >= SCENA.length - 1) {
      setPlaying(false);
      return;
    }
    const t = window.setTimeout(() => setPos((p) => p + 1), 2400);
    return () => window.clearTimeout(t);
  }, [playing, pos]);

  const tap = (id: string) => {
    const r = stukniecie(id);
    setMsg(r.mowi);
    if (r.ok && !found.includes(id)) setFound((f) => [...f, id]);
  };

  const linia = SCENA[pos];

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2">
        <div className="flex flex-col items-center">
          <Twarz kto="tymek" ksztalt={twarzNapiecia('tymek', n.tymek)} size={92} label="Tymek" />
          <span className="text-xs">Tymek</span>
        </div>
        <div className="flex flex-col items-center gap-1 pb-4" aria-label={`Głośność: ${n.glosno} z 4`}>
          {[4, 3, 2, 1].map((lvl) => (
            <span key={lvl} className="block h-3 w-8" style={{ backgroundColor: n.glosno >= lvl ? (lvl >= 3 ? '#dc2626' : '#f59e0b') : '#e7e5e4' }} />
          ))}
          <span className="text-[10px] text-muted-foreground">głośno</span>
        </div>
        <div className="flex flex-col items-center">
          <Twarz kto="zuzia" ksztalt={twarzNapiecia('zuzia', n.zuzia)} size={92} label="Zuzia" />
          <span className="text-xs">Zuzia</span>
        </div>
      </div>
      <p
        className="mt-3 min-h-[3.5rem] border-l-4 px-3 py-2 text-base leading-snug"
        style={{ borderColor: linia.kto === 'narrator' ? '#a8a29e' : linia.kto === 'tymek' ? '#f08a3c' : '#f4d03f', fontStyle: linia.kto === 'narrator' ? 'italic' : undefined }}
        aria-live="polite"
      >
        <span className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{KTO_LABEL[linia.kto]}: </span>
        {linia.text}
      </p>

      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => {
            if (pos >= SCENA.length - 1) setPos(0);
            setPlaying((p) => !p);
          }}
          className="flex h-10 w-10 shrink-0 items-center justify-center text-white"
          style={{ backgroundColor: color }}
          aria-label={playing ? 'Pauza' : 'Puść taśmę'}
        >
          {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </button>
        <input
          type="range"
          min={0}
          max={SCENA.length - 1}
          value={pos}
          onChange={(e) => {
            setPlaying(false);
            setPos(Number(e.target.value));
          }}
          className="min-w-0 flex-1 cursor-ew-resize"
          style={{ accentColor: color }}
          aria-label="Taśma kłótni"
        />
      </div>

      <ol className="mt-3 space-y-1.5">
        {SCENA.slice(0, pos + 1).map((l) => (
          <li key={l.id}>
            <button
              type="button"
              onClick={() => tap(l.id)}
              className="flex w-full items-start gap-2 border px-2 py-1.5 text-left text-sm leading-snug"
              style={{
                borderColor: found.includes(l.id) ? '#dc2626' : undefined,
                backgroundColor: found.includes(l.id) ? 'color-mix(in srgb, #dc2626 8%, transparent)' : undefined,
                fontStyle: l.kto === 'narrator' ? 'italic' : undefined,
              }}
            >
              <span className="w-16 shrink-0 text-xs text-muted-foreground">{KTO_LABEL[l.kto]}</span>
              <span className="flex-1">{l.text}</span>
              {found.includes(l.id) && <Check className="h-4 w-4 shrink-0 text-red-600" aria-label="pogarsza" />}
            </button>
          </li>
        ))}
      </ol>
      <p className="mt-3 min-h-[2.75rem] text-sm leading-snug" aria-live="polite">
        {msg}
      </p>
      <p className="text-sm text-muted-foreground">
        Znalezione zdania, po których jest gorzej: {found.length} z {POGARSZAJACE.length}.
      </p>
      {done && (
        <p className="mt-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
          Wszystkie te zdania mają coś wspólnego: <strong>oskarżają</strong> — „zawsze”, „nigdy”, „jesteś okropna”. Mówią, jaka
          jest druga osoba, a nie, co czuje ten, kto mówi.
        </p>
      )}
    </div>
  );
}
