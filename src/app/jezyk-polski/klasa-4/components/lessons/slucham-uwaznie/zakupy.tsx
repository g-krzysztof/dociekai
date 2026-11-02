'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { Minus, Plus, ShoppingCart, Volume2 } from 'lucide-react';
import { Twarz } from '../../twarz/twarz';
import { buildKorpus } from '../../../lib/korpus';
import { useLektor } from '../../../lib/lektor';
import { AUDIO as ZAKUPY_AUDIO } from './wiadomosci.zakupy.audio';
import { ZAKUPY } from './wiadomosci';
import { KASA, PRODUKTY, REGALY, kuchnia, odpowiedz, przyKasie, regalPrzy, type BladKuchni, type Koszyk, type PytanieId } from './sklep';

/**
 * L5, blok 2 „Zakupy” — **gest nowy dla kursu: prowadzi wózek palcem po
 * planie sklepu.** Przy regale otwiera się półka; produkty wkłada się
 * stuknięciem (+/−). Widać tylko własny notes — nagrania już nie. Przy kasie
 * zakupy lądują na stole pani Haliny i każdy błąd ma cytat z nagrania, które
 * teraz można odsłuchać bez limitu.
 */

const KORPUS = buildKorpus(ZAKUPY);
/** Zdanie nagrania, które rozstrzyga szczegół (dla poprawki — ostatnie zdanie fragmentu). */
const zdanieDo = (span: string) => KORPUS.spans[span]?.unitIds.at(-1) ?? null;

interface Props {
  color: string;
  notatka: string;
  pytanie: PytanieId | null;
  onDone: (bledy: BladKuchni[]) => void;
}

export function Zakupy({ color, notatka, pytanie, onDone }: Props) {
  const [pos, setPos] = useState({ x: 150, y: 70 });
  const [koszyk, setKoszyk] = useState<Koszyk>({});
  const [wynik, setWynik] = useState<BladKuchni[] | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const drag = useRef(false);
  const lektor = useLektor(ZAKUPY_AUDIO);
  const regal = regalPrzy(pos.x, pos.y);
  const kasa = przyKasie(pos.x, pos.y);
  const odp = pytanie ? odpowiedz(pytanie) : null;
  const items = Object.entries(koszyk).filter(([, n]) => n > 0);

  useEffect(() => {
    if (wynik) onDone(wynik);
  }, [wynik, onDone]);

  const move = (e: PointerEvent<SVGSVGElement>) => {
    const r = svgRef.current!.getBoundingClientRect();
    const x = Math.round(Math.max(8, Math.min(292, ((e.clientX - r.left) / r.width) * 300)));
    const y = Math.round(Math.max(8, Math.min(196, ((e.clientY - r.top) / r.height) * 200)));
    setPos({ x, y });
  };

  const add = (id: string, d: number) => setKoszyk((k) => ({ ...k, [id]: Math.max(0, Math.min(9, (k[id] ?? 0) + d)) }));

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      {!wynik ? (
        <>
          <p className="text-sm leading-relaxed sm:text-base">
            Prowadź wózek palcem po sklepie. Przy regale zobaczysz, co na nim leży. Masz tylko swój notes — nagrania już nie
            odsłuchasz.
          </p>
          <div className="mt-4 grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
            <div>
              <svg
                ref={svgRef}
                viewBox="0 0 300 200"
                className="block w-full touch-none select-none border bg-stone-50 dark:bg-zinc-800"
                onPointerDown={(e) => {
                  e.currentTarget.setPointerCapture?.(e.pointerId);
                  drag.current = true;
                  move(e);
                }}
                onPointerMove={(e) => drag.current && move(e)}
                onPointerUp={() => (drag.current = false)}
                onPointerCancel={() => (drag.current = false)}
                role="application"
                aria-label="Plan sklepu — prowadź wózek palcem"
              >
                {REGALY.map((g) => (
                  <g key={g.id}>
                    <rect x={g.x} y={g.y} width={g.w} height={g.h} fill={regal === g.id ? '#fde68a' : '#e7dcc8'} stroke="#a8916b" />
                    <text x={g.x + g.w / 2} y={g.y + g.h / 2 + 4} textAnchor="middle" fontSize="11" fill="#5b4a2e">
                      {g.label}
                    </text>
                  </g>
                ))}
                <rect x={KASA.x} y={KASA.y} width={KASA.w} height={KASA.h} fill={kasa ? '#bbf7d0' : '#d1fae5'} stroke="#059669" />
                <text x={KASA.x + KASA.w / 2} y={KASA.y + 19} textAnchor="middle" fontSize="11" fill="#065f46">
                  kasa
                </text>
                <g transform={`translate(${pos.x - 13} ${pos.y - 11})`} className="cursor-grab">
                  <rect x="2" y="2" width="22" height="13" fill={color} />
                  <line x1="0" y1="0" x2="4" y2="2" stroke="#333" strokeWidth="2" />
                  <circle cx="7" cy="19" r="2.6" fill="#333" />
                  <circle cx="20" cy="19" r="2.6" fill="#333" />
                  {items.length > 0 && <rect x="5" y="-3" width="15" height="6" fill="#f59e0b" />}
                </g>
              </svg>
              <div className="mt-3 min-h-[7rem]" aria-live="polite">
                {regal ? (
                  <ul className="grid gap-1.5 sm:grid-cols-2">
                    {PRODUKTY.filter((p) => p.regal === regal).map((p) => (
                      <li key={p.id} className="flex items-center justify-between gap-2 border px-2 py-1 text-sm">
                        <span>
                          {p.label} <span className="text-xs text-muted-foreground">({p.jedn})</span>
                        </span>
                        <span className="flex items-center gap-1">
                          <button type="button" onClick={() => add(p.id, -1)} className="flex h-7 w-7 items-center justify-center border" aria-label={`Odłóż: ${p.label}`}>
                            <Minus className="h-3.5 w-3.5" />
                          </button>
                          <span className="w-4 text-center font-mono tabular-nums">{koszyk[p.id] ?? 0}</span>
                          <button type="button" onClick={() => add(p.id, 1)} className="flex h-7 w-7 items-center justify-center border" aria-label={`Weź: ${p.label}`}>
                            <Plus className="h-3.5 w-3.5" />
                          </button>
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : kasa ? (
                  <button type="button" onClick={() => setWynik(kuchnia(koszyk))} className="flex items-center gap-2 border-2 px-4 py-2 text-sm font-semibold text-white" style={{ backgroundColor: color, borderColor: color }}>
                    <ShoppingCart className="h-4 w-4" /> Płacę i niosę do pani Haliny
                  </button>
                ) : (
                  <p className="text-sm text-muted-foreground">Podjedź wózkiem do regału albo do kasy.</p>
                )}
              </div>
            </div>
            <aside className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Mój notes</p>
                <pre className="mt-1 min-h-[5rem] whitespace-pre-wrap border bg-[repeating-linear-gradient(transparent_0,transparent_23px,#e5e7eb_24px)] px-2 py-0.5 font-mono text-[13px] leading-6">
                  {notatka.trim() || '(pusto)'}
                </pre>
              </div>
              {odp && <p className="italic text-muted-foreground">Pani Halina: {odp.mowi}</p>}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">W wózku</p>
                <p className="mt-1">{items.length ? items.map(([id, k]) => `${PRODUKTY.find((p) => p.id === id)!.label} ×${k}`).join(', ') : 'nic'}</p>
              </div>
            </aside>
          </div>
        </>
      ) : (
        <div>
          <div className="flex items-start gap-3">
            <Twarz kto="halina" mina={wynik.length === 0 ? 'usmiech' : wynik.length <= 2 ? 'zdziwienie' : 'grymas'} size={84} />
            <p className="border-l-4 bg-stone-50 px-3 py-2 text-sm italic dark:bg-zinc-800 sm:text-base" style={{ borderColor: '#b7a3d6' }}>
              {wynik.length === 0 ? 'Wszystko jak trzeba! Dziękuję ci, dziecko — jesteś najlepszym słuchaczem w kamienicy.' : 'Rozpakujmy… o, zobaczmy.'}
            </p>
          </div>
          {wynik.length > 0 && (
            <ul className="mt-3 space-y-2">
              {wynik.map((b, i) => {
                const unit = b.span ? zdanieDo(b.span) : null;
                return (
                  <li key={i} className="flex flex-wrap items-center gap-2 border-l-4 px-3 py-1.5 text-sm" style={{ borderColor: '#dc2626' }}>
                    <span className="flex-1">{b.mowi}</span>
                    {unit && (
                      <button type="button" onClick={() => lektor.playOne(unit)} className="flex items-center gap-1 border px-2 py-1 text-xs">
                        <Volume2 className="h-3.5 w-3.5" /> „{KORPUS.unitById[unit].text}”
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
          <p className="mt-3 text-sm text-muted-foreground">Teraz nagranie możesz odsłuchiwać bez limitu — stuknij cytat.</p>
        </div>
      )}
    </div>
  );
}
