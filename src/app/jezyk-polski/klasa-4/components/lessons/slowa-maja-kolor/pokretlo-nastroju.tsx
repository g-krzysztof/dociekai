'use client';

import { useRef, useState, type PointerEvent } from 'react';
import Image from 'next/image';
import { Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { OPIS, ZAPADKI, biegunPrzy, katZPunktu, katZapadki, pokretloGotowe, wyraz, zapadkaZKata, type Zapadka } from './kolory';

/**
 * L11 blok 1 — „Pokrętło nastroju” `[3.2]`. **Gest nowy dla kursu: obraca
 * pokrętło palcem** (przeciąganie po łuku, kąt z `atan2`, pięć zapadek).
 * Wskazówka idzie za palcem, ale słowa przeskakują tylko na zapadkach — bez
 * płynnego mieszania. Ilustracja wycieczki stoi bez zmian. Blok zalicza dojście
 * do obu skrajów; wtedy pada termin „wyrazy bliskoznaczne”.
 */

export interface StanPokretla {
  d: Zapadka;
  odwiedzone: number[];
}

interface Props {
  color: string;
  obraz: string;
  initial?: StanPokretla | null;
  onState?: (s: StanPokretla) => void;
  onComplete: () => void;
}

const R = 46;
const pt = (kat: number, r: number) => {
  const a = (kat * Math.PI) / 180;
  return { x: Math.round((60 + r * Math.sin(a)) * 100) / 100, y: Math.round((60 - r * Math.cos(a)) * 100) / 100 };
};

export function PokretloNastroju({ color, obraz, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanPokretla>(() => initial ?? { d: 0, odwiedzone: [0] });
  const [kat, setKat] = useState<number | null>(null);
  const [blysk, setBlysk] = useState(0);
  const tarcza = useRef<SVGSVGElement>(null);
  const gotowe = pokretloGotowe(stan.odwiedzone);

  const ustaw = (d: Zapadka) => {
    if (d === stan.d) return;
    const odwiedzone = stan.odwiedzone.includes(d) ? stan.odwiedzone : [...stan.odwiedzone, d];
    const s = { d, odwiedzone };
    setStan(s);
    setBlysk((n) => n + 1);
    onState?.(s);
    if (!gotowe && pokretloGotowe(odwiedzone)) onComplete();
  };

  const katZ = (e: PointerEvent) => {
    const r = tarcza.current?.getBoundingClientRect();
    if (!r) return 0;
    return katZPunktu(e.clientX - (r.left + r.width / 2), e.clientY - (r.top + r.height / 2));
  };
  const down = (e: PointerEvent<SVGSVGElement>) => {
    if (e.button > 0) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const k = katZ(e);
    setKat(k);
    ustaw(zapadkaZKata(k));
  };
  const move = (e: PointerEvent<SVGSVGElement>) => {
    if (kat == null) return;
    const k = katZ(e);
    setKat(k);
    ustaw(zapadkaZKata(k));
  };
  const up = () => setKat(null);

  const wskazowka = kat ?? katZapadki(stan.d);
  const koniec = pt(wskazowka, 30);
  const label = ZAPADKI.find((z) => z.d === stan.d)!.label;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <div className="grid grid-cols-2 items-center gap-3 sm:grid-cols-[1fr_auto] sm:gap-5">
        <div className="relative aspect-[4/3] w-full overflow-hidden border">
          <Image
            src={obraz}
            alt="Akwarela: leśne jezioro latem, długi drewniany pomost, po którym biegnie brązowy pies, na końcu pomostu przywiązana łódka, na brzegu drewniany dom wśród brzóz"
            width={584}
            height={440}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex flex-col items-center">
          <svg
            ref={tarcza}
            viewBox="0 0 120 120"
            className="h-36 w-36 cursor-grab touch-none select-none outline-none focus-visible:ring-2 sm:h-44 sm:w-44"
            role="slider"
            aria-label="Pokrętło nastroju"
            aria-valuemin={-2}
            aria-valuemax={2}
            aria-valuenow={stan.d}
            aria-valuetext={label}
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'ArrowLeft' || e.key === 'ArrowDown') ustaw(Math.max(-2, stan.d - 1) as Zapadka);
              if (e.key === 'ArrowRight' || e.key === 'ArrowUp') ustaw(Math.min(2, stan.d + 1) as Zapadka);
            }}
            onPointerDown={down}
            onPointerMove={move}
            onPointerUp={up}
            onPointerCancel={up}
            data-testid="pokretlo"
          >
            {ZAPADKI.map((z) => {
              const a = pt(katZapadki(z.d), R + 6);
              const b = pt(katZapadki(z.d), R + 12);
              return <line key={z.d} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke={z.d === stan.d ? color : '#a1a1aa'} strokeWidth={z.d === stan.d ? 3 : 2} />;
            })}
            <circle cx={60} cy={60} r={R} fill="#e7d9b0" stroke="#8a6d2b" strokeWidth={2.5} />
            <circle cx={60} cy={60} r={R - 9} fill="#f3e8c8" stroke="#b39a5a" strokeWidth={1} />
            {/* Rowki na obwodzie — widać, że to się kręci. */}
            {Array.from({ length: 24 }, (_, i) => {
              const a = pt(wskazowka + i * 15, R - 2);
              const b = pt(wskazowka + i * 15, R - 7);
              return <line key={i} x1={a.x} y1={a.y} x2={b.x} y2={b.y} stroke="#8a6d2b" strokeWidth={1} opacity={0.6} />;
            })}
            <line x1={60} y1={60} x2={koniec.x} y2={koniec.y} stroke={color} strokeWidth={5} strokeLinecap="round" />
            <circle cx={60} cy={60} r={6} fill="#8a6d2b" />
          </svg>
          <div className="mt-1 flex w-full items-center justify-between gap-1">
            <button type="button" aria-label="W lewo" className="border p-1" onClick={() => ustaw(Math.max(-2, stan.d - 1) as Zapadka)}>
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="min-w-[6.5rem] text-center text-sm font-semibold" style={{ color }}>
              {label}
            </span>
            <button type="button" aria-label="W prawo" className="border p-1" onClick={() => ustaw(Math.min(2, stan.d + 1) as Zapadka)}>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      <p className="mt-2 text-xs text-muted-foreground">Kręć pokrętłem palcem albo strzałkami. Patrz na tekst — i na obrazek.</p>

      <div className="mt-3 border bg-[#fbf9f3] p-3 font-serif text-base leading-relaxed dark:bg-zinc-800 sm:text-lg" data-testid="opis">
        {OPIS.map((m) => {
          const b = biegunPrzy(m, stan.d);
          return (
            <span key={m.id}>
              {m.przed}{' '}
              <span
                key={`${m.id}-${b}-${blysk}`}
                className="inline-block border-b-2 px-0.5 animate-in fade-in duration-500"
                style={{ borderColor: b === 0 ? '#d4d4d8' : color, background: b === 0 ? undefined : `${color}18` }}
                data-slot={m.id}
              >
                {wyraz(m, b).tekst}
              </span>
              {m.po.startsWith('.') ? '' : ' '}
              {m.po}{' '}
            </span>
          );
        })}
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-xs" aria-label="Skraje pokrętła">
        {[-2, 2].map((d) => (
          <span key={d} className="flex items-center gap-1 border px-2 py-1" style={stan.odwiedzone.includes(d) ? { borderColor: color } : undefined}>
            {stan.odwiedzone.includes(d) && <Check className="h-3.5 w-3.5" style={{ color }} aria-hidden />}
            {ZAPADKI.find((z) => z.d === d)!.label}
          </span>
        ))}
      </div>

      <div className="mt-3 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {gotowe && (
          <p>
            Obrazek się nie zmienił. Zmieniło się, <strong>co o tym myśli</strong> ten, kto pisze. Piesek, pies i psisko to ten sam zwierzak —
            ale trzy różne opinie. Słowa, które nazywają to samo, to <strong>wyrazy bliskoznaczne</strong> (inaczej: <strong>synonimy</strong>).
          </p>
        )}
      </div>
    </div>
  );
}
