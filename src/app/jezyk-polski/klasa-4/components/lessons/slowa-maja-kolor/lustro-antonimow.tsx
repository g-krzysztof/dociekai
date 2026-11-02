'use client';

import { useRef, useState, type PointerEvent } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { KARTY, RZECZY, TERMIN_PO, lustroGotowe, odbicie, rzeczPod, srodekRzeczy, type Rzecz } from './kolory';
import { RzeczSvg } from './rzeczy';

/**
 * L11 blok 3 — „Lustro antonimów” `[3.6]` `[3.10]`. **Gest nowy dla kursu:
 * przesuwa lustro po scenie.** Dziecko kładzie kartę przed lustrem i jeździ
 * lustrem pod rzeczami: przy wyrazie przeciwstawnym odbicie jest ostre
 * i odwrócone (pełny kubek → w lustrze pusty), przy słowie tylko innym —
 * krzywe i zamglone, a lustro mówi dlaczego; przy cudzym słowie lustro
 * zaparowuje. Termin „wyrazy przeciwstawne” pada po trzeciej parze.
 */

export interface StanLustra {
  znalezione: string[];
}

interface Props {
  color: string;
  initial?: StanLustra | null;
  onState?: (s: StanLustra) => void;
  onComplete: () => void;
}

const podpis = (r: Rzecz) => `${r.przed}${r.slowo}${r.po}`;

export function LustroAntonimow({ color, initial, onState, onComplete }: Props) {
  const [znalezione, setZnalezione] = useState<string[]>(() => initial?.znalezione ?? []);
  const [karta, setKarta] = useState<string | null>(null);
  const [p, setP] = useState(srodekRzeczy(0));
  const [jedzie, setJedzie] = useState(false);
  const [msg, setMsg] = useState('Połóż kartę przed lustrem, a potem przesuwaj lustro pod rzeczami.');
  const tor = useRef<HTMLDivElement>(null);
  const gotowe = lustroGotowe(znalezione);

  const i = rzeczPod(p);
  const r = RZECZY[i];
  const odb = odbicie(i, karta);

  const ocen = (idx: number, k: string | null) => {
    const o = odbicie(idx, k);
    const rz = RZECZY[idx];
    if (o.rodzaj === 'puste') setMsg('Połóż kartę przed lustrem.');
    else if (o.rodzaj === 'krzywe') setMsg(o.lustro);
    else if (o.rodzaj === 'mgla') setMsg(`Lustro zaparowane: „${k}” nic nie mówi o tym, co tu stoi (${podpis(rz)}). Przesuń lustro dalej.`);
    else {
      const juz = znalezione.includes(rz.id);
      const nowe = juz ? znalezione : [...znalezione, rz.id];
      let t = `„${rz.slowo}” i „${rz.przeciwne}” — odbicie ostre, wszystko na odwrót.`;
      if (!juz && nowe.length === TERMIN_PO)
        t += ' Słowa o przeciwnym znaczeniu to wyrazy przeciwstawne (inaczej: antonimy).';
      if (!juz && nowe.length === RZECZY.length) t = `„${rz.slowo}” i „${rz.przeciwne}” — to była ostatnia para. Sześć par wyrazów przeciwstawnych.`;
      setMsg(t);
      if (!juz) {
        setZnalezione(nowe);
        onState?.({ znalezione: nowe });
        if (lustroGotowe(nowe)) onComplete();
      }
    }
  };

  const poloz = (k: string) => {
    if (gotowe) return;
    setKarta(k);
    ocen(i, k);
  };

  const drag = useDragToken({
    onDrop: (k, target) => target === 'przed-lustrem' && poloz(k),
    onTap: poloz,
    disabled: gotowe,
  });

  const pozycja = (e: PointerEvent) => {
    const b = tor.current?.getBoundingClientRect();
    if (!b) return p;
    return Math.max(0, Math.min(0.999, (e.clientX - b.left) / b.width));
  };
  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setJedzie(true);
    setP(pozycja(e));
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    if (jedzie) setP(pozycja(e));
  };
  const up = () => {
    if (!jedzie) return;
    setJedzie(false);
    const idx = rzeczPod(p);
    setP(srodekRzeczy(idx));
    ocen(idx, karta);
  };
  const skocz = (idx: number) => {
    setP(srodekRzeczy(idx));
    ocen(idx, karta);
  };

  const tacka = KARTY.filter((k) => k !== karta && !RZECZY.some((x) => x.przeciwne === k && znalezione.includes(x.id)));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {/* Scena: rzeczy w rzędzie, każda z podpisem. */}
      <div className="grid grid-cols-6 gap-0.5 sm:gap-2">
        {RZECZY.map((x, idx) => (
          <button key={x.id} type="button" onClick={() => skocz(idx)} className="flex flex-col items-center px-0.5" aria-label={`Lustro pod: ${podpis(x)}`}>
            <RzeczSvg id={x.id} przeciw={false} className="h-12 w-12 sm:h-16 sm:w-16" />
            <span className="mt-0.5 text-center text-[11px] leading-tight sm:text-sm">
              <strong>{x.slowo}</strong>
              {x.po}
            </span>
            {znalezione.includes(x.id) && (
              <span className="mt-0.5 text-[11px] font-semibold sm:text-xs" style={{ color }}>
                ↔ {x.przeciwne}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tor lustra. */}
      <div
        ref={tor}
        className="relative mt-2 h-24 cursor-ew-resize touch-none select-none border-t-4 bg-[#f4f4f5] dark:bg-zinc-800 sm:h-28"
        style={{ borderColor: '#a8a29e' }}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={up}
        onPointerCancel={up}
        data-testid="tor-lustra"
      >
        <div
          className="absolute top-1 h-[calc(100%-0.5rem)] w-[16.66%] border-4 bg-gradient-to-br from-sky-50 to-slate-200"
          style={{ left: `calc(${(p * 100).toFixed(2)}% - 8.33%)`, borderColor: '#92400e', transition: jedzie ? 'none' : 'left 200ms ease-out' }}
          data-testid="lustro"
          data-rzecz={r.id}
          data-odbicie={odb.rodzaj}
        >
          <div className="flex h-full items-center justify-center overflow-hidden">
            {odb.rodzaj === 'ostre' && <RzeczSvg id={r.id} przeciw className="h-12 w-12 -scale-y-100 sm:h-16 sm:w-16" />}
            {odb.rodzaj === 'krzywe' && <RzeczSvg id={r.id} przeciw={false} className="h-12 w-12 -scale-y-100 skew-x-12 opacity-60 blur-[1.5px] sm:h-16 sm:w-16" />}
            {odb.rodzaj === 'mgla' && <RzeczSvg id={r.id} przeciw={false} className="h-12 w-12 -scale-y-100 opacity-25 blur-[4px] sm:h-16 sm:w-16" />}
          </div>
        </div>
      </div>
      <p className="mt-1 text-xs text-muted-foreground">Przesuwaj lustro palcem po torze (albo stuknij rzecz w scenie).</p>

      {/* Miejsce na kartę przed lustrem. */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium">Przed lustrem:</span>
        <span
          data-drop="przed-lustrem"
          className="inline-flex min-h-[2.25rem] min-w-[7rem] items-center justify-center border-2 border-dashed px-3 font-serif text-base"
          style={{ borderColor: color, background: drag.hover === 'przed-lustrem' ? `${color}22` : undefined }}
          data-testid="przed-lustrem"
        >
          {karta ?? '…'}
        </span>
      </div>

      {!gotowe && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tacka.map((k) => (
            <button key={k} type="button" {...drag.bind(k)} className="touch-none border bg-white px-3 py-1.5 font-serif text-base dark:bg-zinc-900">
              {k}
            </button>
          ))}
        </div>
      )}

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {gotowe && (
        <p className="mt-1 flex items-start gap-2 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Lustro pokazuje ostro tylko prawdziwe przeciwieństwo. Słowo „zielony” jest inne niż „pełny”, ale nie przeciwne — zielony kubek
            może być pełny. Pusty — już nie.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border bg-white px-3 py-1.5 font-serif text-base">{drag.drag.id}</span>}</DragGhost>
    </div>
  );
}
