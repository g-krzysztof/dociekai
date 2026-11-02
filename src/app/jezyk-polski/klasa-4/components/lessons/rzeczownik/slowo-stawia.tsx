'use client';

import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { Check } from 'lucide-react';
import { plural } from '@/lib/plural';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { PlanszaWyspy, RzeczWyspy } from './rysunki-wyspy';
import { DO_ZALICZENIA, MAX_RZECZY, SLOWA, slowo, upusc, wPlanszy, type Postawiona } from './rzeczy';

/**
 * L14 blok 1 — „Słowo stawia rzecz”. Dziecko upuszcza wyraz na pustą wyspę:
 * rzeczownik stawia to, co nazywa, w miejscu upuszczenia, a inne wyrazy
 * spadają na piasek i trafiają do kosza „na później” (wrócą w L15–L17).
 * Blok zalicza sześć postawionych rzeczy; termin „rzeczownik” pada po bloku.
 */

export interface StanStawiania {
  postawione: Postawiona[];
  piasek: string[];
}

interface Props {
  color: string;
  zMagazynu: boolean;
  initial?: StanStawiania | null;
  onState?: (s: StanStawiania) => void;
  onPostaw?: (r: Postawiona) => void;
  onComplete: () => void;
}

export function SlowoStawia({ color, zMagazynu, initial, onState, onPostaw, onComplete }: Props) {
  const [stan, setStan] = useState<StanStawiania>(() => initial ?? { postawione: [], piasek: [] });
  const [wybrane, setWybrane] = useState<string | null>(null);
  const [spada, setSpada] = useState<{ id: string; x: number; y: number } | null>(null);
  const [msg, setMsg] = useState('');
  const plansza = useRef<HTMLDivElement>(null);
  const ostatni = useRef<{ x: number; y: number } | null>(null);
  const gotowe = stan.postawione.length >= DO_ZALICZENIA;

  useEffect(() => {
    if (!spada) return;
    const t = window.setTimeout(() => setSpada(null), 1300);
    return () => window.clearTimeout(t);
  }, [spada]);

  const zostaw = (id: string, clientX: number, clientY: number) => {
    const el = plansza.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const { x, y } = wPlanszy(clientX - r.left, clientY - r.top, r.width, r.height);
    const s = slowo(id);
    setWybrane(null);
    if (upusc(s) === 'piasek') {
      const ns = { ...stan, piasek: [...stan.piasek, id] };
      setStan(ns);
      onState?.(ns);
      setSpada({ id, x, y });
      setMsg(`„${s.tekst}” spadło na piasek i nic nie postawiło. To słowo czegoś szuka — wróci w następnych lekcjach. Na razie leży w koszu.`);
      return;
    }
    if (stan.postawione.length >= MAX_RZECZY) return;
    const r2: Postawiona = { id: `${id}-${stan.postawione.length}`, slowo: id, x, y };
    const ns = { ...stan, postawione: [...stan.postawione, r2] };
    setStan(ns);
    onState?.(ns);
    onPostaw?.(r2);
    setMsg(
      ns.postawione.length < DO_ZALICZENIA
        ? `„${s.tekst}” — i na wyspie stoi ${s.tekst}. Jeszcze ${DO_ZALICZENIA - ns.postawione.length} ${plural(DO_ZALICZENIA - ns.postawione.length, { one: 'rzecz', few: 'rzeczy', many: 'rzeczy' })}.`
        : `„${s.tekst}” stoi. Na wyspie jest już ${ns.postawione.length} ${plural(ns.postawione.length, { one: 'rzecz', few: 'rzeczy', many: 'rzeczy' })}.`
    );
    if (ns.postawione.length === DO_ZALICZENIA && !gotowe) onComplete();
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target === 'wyspa' && ostatni.current) zostaw(id, ostatni.current.x, ostatni.current.y);
    },
    onTap: (id) => {
      setWybrane((w) => (w === id ? null : id));
      setMsg('Teraz stuknij miejsce na wyspie.');
    },
  });
  // Ostatnia pozycja palca — `onDrop` podaje tylko cel, a rzecz ma stanąć tam, gdzie ją puszczono.
  useEffect(() => {
    if (drag.drag) ostatni.current = { x: drag.drag.x, y: drag.drag.y };
  }, [drag.drag]);

  const stuknijWyspe = (e: MouseEvent<HTMLDivElement>) => {
    if (wybrane) zostaw(wybrane, e.clientX, e.clientY);
  };

  const uzyte = new Set([...stan.postawione.map((r) => r.slowo), ...stan.piasek]);
  const paleta = SLOWA.filter((s) => !uzyte.has(s.id));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Przeciągnij wyraz na wyspę (albo stuknij wyraz, a potem miejsce). Zobacz, które słowa coś stawiają.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,500px)_1fr] md:items-start">
        <div
          ref={plansza}
          data-drop="wyspa"
          onClick={stuknijWyspe}
          className="relative aspect-[4/3] w-full overflow-hidden border"
          style={{ borderColor: drag.hover === 'wyspa' || wybrane ? color : undefined, cursor: wybrane ? 'copy' : undefined }}
          data-testid="wyspa"
        >
          <PlanszaWyspy />
          {stan.postawione.map((r) => (
            <div
              key={r.id}
              className="pointer-events-none absolute w-[13%] -translate-x-1/2 -translate-y-1/2 animate-in zoom-in-50 fade-in duration-500"
              style={{ left: `${r.x}%`, top: `${r.y}%` }}
              data-testid={`rzecz-${r.slowo}`}
            >
              <RzeczWyspy id={r.slowo} className="h-auto w-full" />
            </div>
          ))}
          {spada && (
            <span
              className="pointer-events-none absolute -translate-x-1/2 border bg-white/90 px-2 py-0.5 font-serif text-sm transition-all duration-1000 ease-in"
              style={{ left: `${spada.x}%`, top: `${spada.y}%`, transform: 'translate(-50%, 0) rotate(-12deg)', opacity: 0.85 }}
            >
              {slowo(spada.id).tekst}
            </span>
          )}
        </div>

        <div>
          <div className="border bg-[#efe6d2] p-2 dark:bg-zinc-800">
            <p className="text-xs text-muted-foreground">{zMagazynu ? 'Wyrazy z magazynu w porcie i z palety wyspy' : 'Wyrazy ze skrzyni i z palety wyspy'}</p>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {paleta.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  {...drag.bind(s.id)}
                  className="touch-none border bg-white px-3 py-1 font-serif text-base dark:bg-zinc-900"
                  style={wybrane === s.id ? { borderColor: color, background: `${color}22` } : undefined}
                  data-testid={`slowo-${s.id}`}
                >
                  {s.tekst}
                </button>
              ))}
            </div>
          </div>
          <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
            {msg}
          </p>
        </div>
      </div>

      {stan.piasek.length > 0 && (
        <p className="text-xs text-muted-foreground">
          Kosz „na później”: {stan.piasek.map((id) => slowo(id).tekst).join(', ')}
        </p>
      )}

      {gotowe && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Na wyspie stoją: {stan.postawione.map((r) => slowo(r.slowo).tekst).join(', ')}. Każde z tych słów coś <strong>nazywa</strong> — i
            dlatego mogło to postawić, nawet mgłę albo wiatr. Słowo, które nazywa, to <strong>rzeczownik</strong>.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <span className="block border bg-white px-3 py-1 font-serif text-base">{slowo(drag.drag.id).tekst}</span>}</DragGhost>
    </div>
  );
}
