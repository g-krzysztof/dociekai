'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent, type ReactNode } from 'react';
import { Check, FolderOpen } from 'lucide-react';
import { PlanszaWyspy, RzeczWyspy } from '../rzeczownik/rysunki-wyspy';
import { CZESCI, odkryte, POZYCJE, sladPod, type Czesc, type Mapa } from './mapa';

/**
 * L17 blok 3 — „Wyspa skończona” (R, bez werdyktu). Dziecko przelatuje
 * palcem (albo myszą) nad mapą swojej wyspy; nad każdym śladem modułu
 * pojawia się zdanie „to postawił rzeczownik”, „to przesunął przyimek”…
 * Przypomnienie, nie sprawdzian: blok kończy się, gdy dziecko obleci
 * wszystkie ślady. Mapę można zapisać w Teczce.
 */

export interface StanMapy {
  czesci: Czesc[];
}

interface Props {
  color: string;
  mapa: Mapa;
  nazwa?: string;
  tor: boolean;
  initial?: StanMapy | null;
  onState?: (s: StanMapy) => void;
  onZapisz: () => void;
  zapisana: boolean;
  onComplete: () => void;
}

export function WyspaSkonczona({ color, mapa, nazwa, tor, initial, onState, onZapisz, zapisana, onComplete }: Props) {
  const [czesci, setCzesci] = useState<Czesc[]>(() => initial?.czesci ?? []);
  const [aktywny, setAktywny] = useState<string | null>(null);
  const [lot, setLot] = useState<{ x: number; y: number } | null>(null);
  const plansza = useRef<HTMLDivElement>(null);
  const gotowe = odkryte(czesci);
  const slad = mapa.slady.find((s) => s.id === aktywny) ?? null;

  const nad = (e: ReactPointerEvent<HTMLDivElement>) => {
    const r = plansza.current!.getBoundingClientRect();
    const x = Math.round(((e.clientX - r.left) / r.width) * 1000) / 10;
    const y = Math.round(((e.clientY - r.top) / r.height) * 1000) / 10;
    setLot({ x, y });
    const s = sladPod(mapa.slady, x, y);
    if (!s) return;
    setAktywny(s.id);
    if (!czesci.includes(s.czesc)) {
      const n = [...czesci, s.czesc];
      setCzesci(n);
      onState?.({ czesci: n });
      if (!gotowe && odkryte(n)) onComplete();
    }
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Przeleć palcem (albo myszą) nad wyspą{nazwa ? ` ${nazwa}` : ''}. Każdy ślad powie, które słowo go postawiło.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,520px)_1fr] md:items-start">
        <div
          ref={plansza}
          className="relative aspect-[4/3] w-full touch-none select-none overflow-hidden border"
          onPointerDown={(e) => {
            e.currentTarget.setPointerCapture(e.pointerId);
            nad(e);
          }}
          onPointerMove={nad}
          onPointerLeave={() => setLot(null)}
          onPointerUp={(e) => e.pointerType !== 'mouse' && setLot(null)}
          role="img"
          aria-label={`Mapa wyspy${nazwa ? ` ${nazwa}` : ''}: rzeczy, port z odmieniarką, słup z planem, tor ślimaków, cukiernia, domek przy latarni i łódka.`}
          data-testid="mapa"
        >
          <PlanszaWyspy />
          <svg viewBox="0 0 400 300" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden>
            <ellipse cx="200" cy="155" rx="112" ry="78" fill="none" stroke={tor ? '#a8846a' : '#d6d3d1'} strokeWidth={4} strokeDasharray="6 6" />
          </svg>
          {mapa.rzeczy.map((r) => (
            <Znak key={r.id} x={r.x} y={r.y} w={11} swieci={aktywny === `rzecz-${r.id}`} color={color}>
              <RzeczWyspy id={r.slowo} className="h-auto w-full" />
            </Znak>
          ))}
          <Znak {...POZYCJE.nazwa} w={30} swieci={aktywny === 'nazwa'} color={color}>
            <span className="block border bg-[#fffdf6] px-2 py-0.5 text-center font-serif text-xs sm:text-sm">{nazwa ?? '· · ·'}</span>
          </Znak>
          <Znak {...POZYCJE.odmieniarka} w={10} swieci={aktywny === 'odmieniarka'} color={color}>
            <Odmieniarka />
          </Znak>
          <Znak {...POZYCJE.slup} w={7} swieci={aktywny === 'slup'} color={color}>
            <Slup />
          </Znak>
          <Znak {...POZYCJE.tor} w={9} swieci={aktywny === 'tor'} color={color}>
            <Slimak />
          </Znak>
          <Znak {...POZYCJE.tort} w={8} swieci={aktywny === 'tort'} color={color}>
            <Tort />
          </Znak>
          <Znak {...POZYCJE.domek} w={10} swieci={aktywny === 'domek'} color={color}>
            <Domek />
          </Znak>
          <Znak {...POZYCJE.lodka} w={9} swieci={aktywny === 'lodka'} color={color}>
            <RzeczWyspy id="lodka" className="h-auto w-full" />
          </Znak>
          {lot && (
            <span
              aria-hidden
              className="pointer-events-none absolute h-6 w-6 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 bg-white/30"
              style={{ left: `${lot.x}%`, top: `${lot.y}%`, borderColor: color }}
            />
          )}
        </div>

        <div>
          <p className="min-h-[5.5rem] border bg-[#fffdf6] p-3 font-serif text-base leading-relaxed dark:bg-zinc-800 sm:text-lg" aria-live="polite" data-testid="mapa-zdanie">
            {slad ? slad.zdanie : 'Prowadź palec powoli — ślad odezwie się, kiedy nad nim przelecisz.'}
          </p>
          <p className="mt-3 text-xs text-muted-foreground">Ślady modułu</p>
          <ul className="mt-1 flex flex-wrap gap-1.5" data-testid="mapa-czesci">
            {CZESCI.map((c) => (
              <li
                key={c}
                className="border px-2 py-0.5 text-xs sm:text-sm"
                style={czesci.includes(c) ? { borderColor: color, background: `${color}18` } : { opacity: 0.45 }}
              >
                {NAZWY[c]}
              </li>
            ))}
          </ul>
          {mapa.startowe && (
            <p className="mt-2 text-xs text-muted-foreground">To wyspa startowa — rzeczy postawione słowami w lekcji o rzeczowniku pojawiłyby się tutaj.</p>
          )}
        </div>
      </div>

      {gotowe && (
        <div className="mt-3 border-t pt-3 text-sm leading-relaxed sm:text-base" data-testid="mapa-koniec">
          <p className="flex items-start gap-2">
            <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
            <span>
              Wyspa jest skończona — i każdą jej część postawiło inne słowo. Rzeczownik nazywa, czasownik mówi, co się dzieje, przymiotnik —
              jaki, przysłówek — jak, przyimek — gdzie, a zaimek zastępuje imię.
            </span>
          </p>
          <button
            type="button"
            onClick={onZapisz}
            disabled={zapisana}
            className="mt-3 inline-flex items-center gap-2 border px-4 py-2 text-sm font-medium disabled:opacity-70"
            style={zapisana ? { borderColor: color } : { background: color, borderColor: color, color: 'white' }}
            data-testid="mapa-teczka"
          >
            <FolderOpen className="h-4 w-4" aria-hidden />
            {zapisana ? 'Mapa leży w Teczce (na tym urządzeniu)' : 'Zapisz mapę w Teczce'}
          </button>
        </div>
      )}
    </div>
  );
}

const NAZWY: Record<Czesc, string> = {
  odmieniarka: 'odmieniarka',
  rzeczownik: 'rzeczownik',
  nazwa: 'nazwa własna',
  czasownik: 'czasownik',
  przyslowek: 'przysłówek',
  przymiotnik: 'przymiotnik',
  przyimek: 'przyimek',
  zaimek: 'zaimek',
};

function Znak({ x, y, w, swieci, color, children }: { x: number; y: number; w: number; swieci: boolean; color: string; children: ReactNode }) {
  return (
    <div
      className="pointer-events-none absolute -translate-x-1/2 -translate-y-1/2 transition-transform duration-200"
      style={{ left: `${x}%`, top: `${y}%`, width: `${w}%`, transform: `translate(-50%, -50%) scale(${swieci ? 1.25 : 1})`, filter: swieci ? `drop-shadow(0 0 4px ${color})` : undefined }}
    >
      {children}
    </div>
  );
}

const K = '#44403c';

function Odmieniarka() {
  return (
    <svg viewBox="0 0 40 40" className="h-auto w-full" fill="none" stroke={K} strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
      <rect x="6" y="12" width="28" height="22" fill="#d6d3d1" />
      <circle cx="15" cy="23" r="5" fill="#fafaf9" />
      <circle cx="27" cy="23" r="5" fill="#fafaf9" />
      <path d="M34 16 L38 6" strokeWidth={2.4} />
      <circle cx="38" cy="6" r="2.5" fill="#dc2626" />
      <path d="M2 34 H38" />
    </svg>
  );
}

function Slup() {
  return (
    <svg viewBox="0 0 24 48" className="h-auto w-full" fill="none" stroke={K} strokeWidth={1.4} aria-hidden>
      <rect x="10" y="10" width="4" height="36" fill="#a8846a" />
      <rect x="2" y="4" width="20" height="16" fill="#fffdf6" transform="rotate(-4 12 12)" />
      <path d="M5 9 H18 M5 13 H16 M5 17 H14" stroke="#a8a29e" />
    </svg>
  );
}

function Slimak() {
  return (
    <svg viewBox="0 0 40 28" className="h-auto w-full" fill="none" stroke={K} strokeWidth={1.4} aria-hidden>
      <path d="M4 24 H34 q4 0 4 -4 l-2 -6" fill="#e7cfa4" />
      <circle cx="18" cy="14" r="9" fill="#e8b4a0" />
      <path d="M18 14 m-4 0 a4 4 0 1 1 4 4" />
      <path d="M34 14 l-2 -8 M37 15 l2 -8" />
    </svg>
  );
}

function Tort() {
  return (
    <svg viewBox="0 0 32 32" className="h-auto w-full" fill="none" stroke={K} strokeWidth={1.4} aria-hidden>
      <rect x="4" y="18" width="24" height="10" fill="#8a5a3c" />
      <rect x="8" y="10" width="16" height="8" fill="#f7c6d4" />
      <circle cx="16" cy="7" r="2.5" fill="#dc2626" />
      <path d="M2 28 H30" />
    </svg>
  );
}

function Domek() {
  return (
    <svg viewBox="0 0 40 40" className="h-auto w-full" fill="none" stroke={K} strokeWidth={1.6} strokeLinejoin="round" aria-hidden>
      <path d="M6 20 L20 8 L34 20" fill="#e8b4a0" />
      <rect x="10" y="20" width="20" height="16" fill="#fafaf9" />
      <rect x="13" y="24" width="7" height="6" fill="#cfe8f5" />
      <path d="M15 30 q2 -4 4 0 z" fill="#f0a35c" stroke="#e08a3c" />
      <rect x="23" y="27" width="5" height="9" fill="#a8846a" />
    </svg>
  );
}
