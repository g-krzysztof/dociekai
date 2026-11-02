'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { plural } from '@/lib/plural';
import {
  brakuje,
  czescPierwszaGotowa,
  dwieKoncowki,
  gdzie,
  START,
  strefa,
  SZER,
  sprawdz,
  WYS,
  ZDANIA,
  type Strefa,
} from './domek';

/**
 * L17 blok 1 — „Gdzie jest kot?”. Maszyna odwrócona: dziecko przesuwa kota
 * po przekroju domku, a zdanie pod domkiem samo zmienia przyimek i końcówkę
 * rzeczownika (świecą razem). Potem odwrotnie — zdanie podane, kot ma stanąć
 * tam, gdzie ono mówi; werdykt ze strefy w danych (`domek.ts`).
 */

export interface StanKota {
  kot: string;
  odwiedzone: string[];
  etap: 'szuka' | 'zdania';
  nr: number;
}

interface Props {
  color: string;
  initial?: StanKota | null;
  onState?: (s: StanKota) => void;
  onKot?: (strefa: string) => void;
  onComplete: () => void;
}

const POCZATEK: StanKota = { kot: START, odwiedzone: [], etap: 'szuka', nr: 0 };

export function GdzieJestKot({ color, initial, onState, onKot, onComplete }: Props) {
  const [stan, setStan] = useState<StanKota>(() => initial ?? POCZATEK);
  const [drag, setDrag] = useState<{ x: number; y: number } | null>(null);
  const [msg, setMsg] = useState<ReactNode>(null);
  const [blad, setBlad] = useState<string | null>(null);
  const svg = useRef<SVGSVGElement>(null);
  const koniec = stan.etap === 'zdania' && stan.nr >= ZDANIA.length;

  const zmien = (ns: StanKota) => {
    setStan(ns);
    onState?.(ns);
  };

  const punkt = (e: ReactPointerEvent) => {
    const r = svg.current!.getBoundingClientRect();
    return { x: Math.round(((e.clientX - r.left) / r.width) * SZER), y: Math.round(((e.clientY - r.top) / r.height) * WYS) };
  };

  const down = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (koniec) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    setDrag(punkt(e));
  };
  const move = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (drag) setDrag(punkt(e));
  };
  const up = (e: ReactPointerEvent<SVGSVGElement>) => {
    if (!drag) return;
    const p = punkt(e);
    setDrag(null);
    zostaw(gdzie(p.x, p.y));
  };

  const zostaw = (id: string) => {
    onKot?.(id);
    if (stan.etap === 'szuka') {
      const odwiedzone = stan.odwiedzone.includes(id) ? stan.odwiedzone : [...stan.odwiedzone, id];
      zmien({ ...stan, kot: id, odwiedzone });
      setMsg(null);
      return;
    }
    const z = ZDANIA[stan.nr];
    const w = sprawdz(z, id);
    if (w.ok) {
      const nr = stan.nr + 1;
      zmien({ ...stan, kot: id, nr });
      setBlad(null);
      setMsg(
        nr < ZDANIA.length ? (
          <>
            Zgadza się — kot jest <Wyr s={strefa(id)} color={color} />.
          </>
        ) : null,
      );
      if (nr === ZDANIA.length) onComplete();
      return;
    }
    zmien({ ...stan, kot: id });
    setMsg(null);
    setBlad(
      w.tenSamMebel
        ? `Mebel dobry, ale małe słowo inne: kot jest teraz „${w.jest}”, a zdanie mówi „${w.mowi}”.`
        : `Kot jest teraz „${w.jest}”, a zdanie mówi „${w.mowi}”. Spójrz na małe słowo i na mebel.`,
    );
  };

  const naZywo = drag ? gdzie(drag.x, drag.y) : stan.kot;
  const s = strefa(stan.kot);
  const dowod = dwieKoncowki(stan.odwiedzone);
  const zadanie = stan.etap === 'zdania' && !koniec ? ZDANIA[stan.nr] : null;

  const kotNaMiejscu = <Kot key="kot" x={s.kotX} y={s.kotY} plynnie />;
  const kotWLocie = drag && <Kot key="kot-lot" x={drag.x} y={drag.y + 16} />;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        {stan.etap === 'szuka'
          ? 'Przeciągnij kota po domku (albo stuknij miejsce, a kot tam przejdzie). Patrz na zdanie pod domkiem.'
          : 'Teraz odwrotnie: zdanie mówi, gdzie jest kot. Postaw go tam.'}
      </p>

      {zadanie && (
        <p className="mt-3 border-l-4 bg-[#fffdf6] px-3 py-2 font-serif text-lg dark:bg-zinc-800" style={{ borderColor: color }} data-testid="zdanie-cel">
          <span className="mr-2 font-sans text-xs text-muted-foreground tabular-nums">
            {stan.nr + 1}/{ZDANIA.length}
          </span>
          {zadanie.tekst}
        </p>
      )}

      <div className="mt-3 grid gap-3 lg:grid-cols-[minmax(0,560px)_1fr] lg:items-start">
        <svg
          ref={svg}
          viewBox={`0 0 ${SZER} ${WYS}`}
          className={`block aspect-[8/5] w-full touch-none select-none border ${koniec ? '' : 'cursor-grab'}`}
          onPointerDown={down}
          onPointerMove={move}
          onPointerUp={up}
          onPointerCancel={() => setDrag(null)}
          role="img"
          aria-label={`Przekrój domku. Kot jest ${przyimkowo(s)}.`}
          data-testid="domek"
        >
          <Pokoj />
          {!drag && s.warstwa === 'za' && kotNaMiejscu}
          <Szafa />
          <Stol />
          <Kanapa />
          <KoszTyl />
          {!drag && s.warstwa === 'w' && kotNaMiejscu}
          <KoszPrzod />
          {!drag && s.warstwa === 'przod' && kotNaMiejscu}
          {kotWLocie}
        </svg>

        <div>
          {stan.etap === 'szuka' && (
            <div className="border bg-[#fffdf6] p-3 dark:bg-zinc-800" aria-live="polite" data-testid="zdanie-kota">
              <p className="font-serif text-xl leading-snug">
                Kot siedzi <Wyr s={strefa(naZywo)} color={color} />.
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                {strefa(naZywo).rz.map((r) => (
                  <span key={r.lemat} className="mr-3 whitespace-nowrap">
                    {r.lemat} → {r.forma.slice(0, r.forma.length - r.koncowka.length)}
                    <b style={{ color }}>{r.koncowka}</b>
                  </span>
                ))}
              </p>
            </div>
          )}

          {stan.etap === 'szuka' && (
            <div className="mt-3 text-sm leading-relaxed sm:text-base">
              <p className="text-xs text-muted-foreground">
                Kot był już w {stan.odwiedzone.length} {plural(stan.odwiedzone.length, { one: 'miejscu', few: 'miejscach', many: 'miejscach' })}
              </p>
              <ul className="mt-1 flex flex-wrap gap-1.5">
                {stan.odwiedzone.map((id) => (
                  <li key={id} className="border px-2 py-0.5 font-serif text-sm">
                    {przyimkowo(strefa(id))}
                  </li>
                ))}
              </ul>
              {czescPierwszaGotowa(stan.odwiedzone) && dowod ? (
                <div className="mt-3 border-t pt-3">
                  <p>
                    Mebel ten sam, a słowo „{dowod.lemat}” zmieniło końcówkę: <strong>{dowod.formy.join(', ')}</strong>. Zmieniło się tylko
                    małe słowo przed nim. To ono mówi, gdzie jest kot — i każe rzeczownikowi zmienić końcówkę.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      zmien({ ...stan, etap: 'zdania', nr: 0 });
                      setMsg(null);
                    }}
                    className="mt-3 inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium text-white"
                    style={{ background: color, borderColor: color }}
                    data-testid="odwrotnie"
                  >
                    Teraz odwrotnie <ArrowRight className="h-4 w-4" aria-hidden />
                  </button>
                </div>
              ) : (
                <p className="mt-2 min-h-[1.5rem] text-sm text-muted-foreground">{brakuje(stan.odwiedzone)}</p>
              )}
            </div>
          )}

          {stan.etap === 'zdania' && (
            <div className="min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
              {blad ? <p data-testid="kot-blad">{blad}</p> : msg && <p>{msg}</p>}
              {stan.nr > 0 && (
                <ul className="mt-2 space-y-1">
                  {ZDANIA.slice(0, stan.nr).map((z) => (
                    <li key={z.id} className="flex items-start gap-2 font-serif">
                      <Check className="mt-1 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                      <span>{z.tekst}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </div>

      {koniec && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base" data-testid="kot-koniec">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Sześć zdań, sześć miejsc. Małe słowa <strong>na, pod, za, w, obok, przed, między</strong> mówią, gdzie co jest, i każą
            rzeczownikowi zmienić końcówkę: na stole, pod stołem. Takie słowo to <strong>przyimek</strong>. Samo nic nie nazywa — dlatego
            w poprzedniej lekcji „pod” spadło na piasek. Potrzebuje rzeczownika obok siebie.
          </span>
        </p>
      )}
    </div>
  );
}

const przyimkowo = (s: Strefa) => `${s.przyimek} ${s.rz.map((r) => r.forma).join(' a ')}`;

/** Wyrażenie przyimkowe: przyimek i końcówka świecą razem. */
function Wyr({ s, color }: { s: Strefa; color: string }) {
  return (
    <>
      <b style={{ color }}>{s.przyimek}</b>{' '}
      {s.rz.map((r, i) => (
        <span key={r.lemat}>
          {i > 0 && ' a '}
          {r.forma.slice(0, r.forma.length - r.koncowka.length)}
          <b style={{ color }}>{r.koncowka}</b>
        </span>
      ))}
    </>
  );
}

// ── Rysunek (całkowite współrzędne, bez napisów) ──

const KRESKA = '#57534e';

function Kot({ x, y, plynnie }: { x: number; y: number; plynnie?: boolean }) {
  return (
    <g
      style={{ transform: `translate(${x}px, ${y}px)`, transition: plynnie ? 'transform 350ms ease-out' : undefined }}
      stroke={KRESKA}
      strokeWidth={1.4}
      strokeLinejoin="round"
      data-testid="kot"
    >
      <path d="M-14 -8 Q-26 -12 -20 -28" fill="none" stroke="#e08a3c" strokeWidth={4} strokeLinecap="round" />
      <ellipse cx="-2" cy="-11" rx="14" ry="11" fill="#f0a35c" />
      <path d="M-10 -2 V0 M-4 -2 V0 M4 -2 V0 M8 -2 V0" />
      <circle cx="12" cy="-22" r="8" fill="#f0a35c" />
      <path d="M6 -27 L7 -35 L12 -30 Z M13 -30 L18 -35 L19 -27 Z" fill="#f0a35c" />
      <circle cx="15" cy="-23" r="1.2" fill={KRESKA} stroke="none" />
      <circle cx="9" cy="-23" r="1.2" fill={KRESKA} stroke="none" />
      <path d="M12 -19 l-1 1 M12 -19 l1 1" />
    </g>
  );
}

function Pokoj() {
  return (
    <g>
      <rect width={SZER} height="232" fill="#f5ead6" />
      <path d="M0 232 H480 V300 H0 Z" fill="#dcc7a1" />
      {[252, 274].map((y) => (
        <path key={y} d={`M0 ${y} H480`} stroke="#c9b089" strokeWidth={1} />
      ))}
      {[60, 150, 250, 330, 420].map((x, i) => (
        <path key={x} d={`M${x} ${i % 2 ? 252 : 232} V${i % 2 ? 274 : 252}`} stroke="#c9b089" strokeWidth={1} />
      ))}
      <path d="M0 232 H480" stroke={KRESKA} strokeWidth={1.2} />
      {/* okno z morzem i latarnią */}
      <rect x="410" y="40" width="60" height="80" fill="#cfe8f5" stroke={KRESKA} strokeWidth={1.6} />
      <path d="M410 92 H470" stroke="#7dd3fc" strokeWidth={2} />
      <path d="M440 40 V120 M410 80 H470" stroke={KRESKA} strokeWidth={1.4} />
      <path d="M452 88 L454 62 H458 L460 88 Z" fill="#fafaf9" stroke={KRESKA} strokeWidth={1} />
      <path d="M453 76 H459" stroke="#dc2626" strokeWidth={2} />
      <rect x="404" y="120" width="72" height="6" fill="#fafaf9" stroke={KRESKA} strokeWidth={1.2} />
      {/* obrazek na ścianie */}
      <rect x="190" y="60" width="44" height="34" fill="#fde68a" stroke={KRESKA} strokeWidth={1.2} />
      <path d="M194 88 L206 74 L214 82 L222 70 L230 88 Z" fill="#bbf7d0" stroke="none" />
    </g>
  );
}

function Szafa() {
  return (
    <g stroke={KRESKA} strokeWidth={1.6} strokeLinejoin="round">
      <rect x="36" y="64" width="88" height="8" fill="#a8846a" />
      <rect x="40" y="72" width="80" height="164" fill="#c9a978" />
      <path d="M80 76 V230" />
      <circle cx="75" cy="152" r="2" fill={KRESKA} />
      <circle cx="85" cy="152" r="2" fill={KRESKA} />
    </g>
  );
}

function Stol() {
  return (
    <g stroke={KRESKA} strokeWidth={1.6} strokeLinejoin="round" fill="#b08968">
      <rect x="160" y="158" width="100" height="8" />
      <rect x="168" y="166" width="6" height="70" />
      <rect x="246" y="166" width="6" height="70" />
      <path d="M200 158 v-10 h12 v10" fill="#e0f2fe" />
    </g>
  );
}

function Kanapa() {
  return (
    <g stroke={KRESKA} strokeWidth={1.6} strokeLinejoin="round" fill="#9fb8c9">
      <rect x="302" y="148" width="96" height="46" />
      <rect x="296" y="192" width="108" height="22" />
      <rect x="290" y="172" width="14" height="50" />
      <rect x="396" y="172" width="14" height="50" />
      <path d="M300 222 v12 M400 222 v12" stroke="#7c5c45" strokeWidth={3} />
      <path d="M350 152 V190" />
    </g>
  );
}

function KoszTyl() {
  return <ellipse cx="440" cy="212" rx="28" ry="6" fill="#a8784a" stroke={KRESKA} strokeWidth={1.4} />;
}

function KoszPrzod() {
  return (
    <g stroke={KRESKA} strokeWidth={1.4} strokeLinejoin="round">
      <path d="M412 212 Q440 220 468 212 L462 240 H418 Z" fill="#c9995f" />
      <path d="M416 222 H464 M418 231 H462" stroke="#a8784a" />
      <path d="M426 214 V240 M440 216 V240 M454 214 V240" stroke="#a8784a" />
    </g>
  );
}
