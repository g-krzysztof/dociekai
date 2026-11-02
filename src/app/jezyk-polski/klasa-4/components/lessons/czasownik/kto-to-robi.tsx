'use client';

import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { OSOBY, PLYNAC, PROG_OSOB, ZAGADKI, pasujeOsoba, type Osoba } from './dzien';

/**
 * L15 blok 2 — „Kto to robi?”. Na pomoście sześć figurek (ja, ty, on/ona,
 * my, wy, oni — sylwetki bez płci, strzałka mówi, kogo wskazuje). Figurka
 * postawiona na podeście zmienia końcówkę „płynie”; potem odwrotnie: zdanie
 * z gotową końcówką czeka na właściwą figurkę, a zła się zsuwa. Na koniec
 * „Nie karmić kozy.” — na „karmić” figurka nie ma gdzie stanąć
 * (bezokolicznik).
 */

export interface StanOsob {
  proby: Osoba[];
  zagadka: number;
  tablica: boolean;
}

interface Props {
  color: string;
  initial?: StanOsob | null;
  onState?: (s: StanOsob) => void;
  onComplete: () => void;
}

const SZARY = '#a8a29e';

/** Sylwetki: liczba osób i strzałka — do siebie (ja, my), do ciebie (ty, wy), na kogoś obok (on/ona, oni). */
export function Figurka({ osoba, color, size = 56 }: { osoba: Osoba; color: string; size?: number }) {
  const o = OSOBY.find((x) => x.id === osoba)!;
  const xs = o.ile === 1 ? [30] : o.ile === 2 ? [22, 38] : [16, 30, 44];
  const kolor = osoba === 'on' || osoba === 'oni' ? SZARY : color;
  return (
    <svg viewBox="0 0 60 60" width={size} height={size} aria-hidden>
      {xs.map((x) => (
        <g key={x} fill={kolor}>
          <circle cx={x} cy={20} r={6} />
          <path d={`M${x - 8} 46 Q${x - 8} 28 ${x} 28 Q${x + 8} 28 ${x + 8} 46 Z`} />
        </g>
      ))}
      {(osoba === 'ja' || osoba === 'my') && <path d="M52 10 Q58 26 46 34 M46 34 l2 -6 M46 34 l6 -1" stroke="#44403c" strokeWidth={2} fill="none" strokeLinecap="round" />}
      {(osoba === 'ty' || osoba === 'wy') && (
        <g stroke="#44403c" strokeWidth={2} fill="none" strokeLinecap="round">
          <path d="M30 48 V58 M30 58 l-4 -4 M30 58 l4 -4" />
        </g>
      )}
      {(osoba === 'on' || osoba === 'oni') && <path d="M2 30 H8 M8 30 l-3 -3 M8 30 l-3 3" stroke="#44403c" strokeWidth={2} fill="none" strokeLinecap="round" />}
    </svg>
  );
}

export function KtoToRobi({ color, initial, onState, onComplete }: Props) {
  const [st, setSt] = useState<StanOsob>(() => initial ?? { proby: [], zagadka: 0, tablica: false });
  const [naPodescie, setNaPodescie] = useState<Osoba | null>(null);
  const [zsuwa, setZsuwa] = useState<Osoba | null>(null);
  const [faza, setFaza] = useState<'plynie' | 'zagadki' | 'tablica'>(() =>
    initial?.tablica || (initial && initial.zagadka >= ZAGADKI.length) ? 'tablica' : initial && initial.proby.length >= PROG_OSOB ? 'zagadki' : 'plynie'
  );
  const [msg, setMsg] = useState('');
  /** Zdanie na ekranie — rozwiązane zostaje widoczne, dopóki dziecko nie pójdzie dalej. */
  const [widok, setWidok] = useState(() => initial?.zagadka ?? 0);
  const rozne = new Set(st.proby).size;

  const zapisz = (s: StanOsob) => {
    setSt(s);
    onState?.(s);
  };

  const postaw = (o: Osoba, cel: string) => {
    if (faza === 'plynie' && cel === 'podest') {
      setNaPodescie(o);
      zapisz({ ...st, proby: st.proby.includes(o) ? st.proby : [...st.proby, o] });
      setMsg(`„${OSOBY.find((x) => x.id === o)!.label} ${PLYNAC[o]}” — końcówka poszła za figurką.`);
      return;
    }
    if (faza === 'zagadki' && cel === 'podest') {
      const z = ZAGADKI[widok];
      if (!z || widok < st.zagadka) return;
      if (!pasujeOsoba(z, o)) {
        setZsuwa(o);
        setNaPodescie(null);
        setMsg(`„${OSOBY.find((x) => x.id === o)!.label} ${z.forma}”? Tak się nie mówi — figurka się zsuwa. Końcówka „${z.forma}” czeka na kogoś innego.`);
        return;
      }
      setZsuwa(null);
      setNaPodescie(o);
      zapisz({ ...st, zagadka: st.zagadka + 1 });
      setMsg(`„${OSOBY.find((x) => x.id === o)!.label} ${z.forma} ${z.po}” — figurka stoi pewnie.`);
      return;
    }
    if (faza === 'tablica' && cel === 'karmic') {
      setZsuwa(o);
      if (!st.tablica) {
        zapisz({ ...st, tablica: true });
        onComplete();
      }
      setMsg('Figurka nie ma gdzie stanąć. „Karmić” nie mówi, kto karmi ani kiedy — to sama nazwa czynności, jak w słowniku. Taka forma to bezokolicznik.');
    }
  };

  const drag = useDragToken({
    onDrop: (o, target) => {
      if (target) postaw(o as Osoba, target);
    },
    onTap: (o) => postaw(o as Osoba, faza === 'tablica' ? 'karmic' : 'podest'),
  });

  const z = ZAGADKI[widok];
  const rozwiazana = widok < st.zagadka;

  const podest = (
    <span
      data-drop="podest"
      className="relative mx-1 inline-flex h-16 w-16 items-end justify-center border-b-4 align-bottom"
      style={{ borderColor: drag.hover === 'podest' ? color : '#a8846a', background: drag.hover === 'podest' ? `${color}18` : undefined }}
      data-testid="podest"
    >
      {naPodescie && <Figurka key={naPodescie + widok} osoba={naPodescie} color={color} size={52} />}
    </span>
  );

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        {faza === 'plynie' && 'Postaw figurkę na podeście (przeciągnij albo stuknij). Patrz na słowo obok.'}
        {faza === 'zagadki' && 'Teraz odwrotnie: końcówka już jest. Która figurka zmieści się na podeście?'}
        {faza === 'tablica' && 'Na pomoście wisi tablica. Spróbuj postawić figurkę przy słowie „karmić”.'}
      </p>

      {/* Pomost z figurkami */}
      <div className="mt-3 flex flex-wrap justify-center gap-1 border-b-8 pb-1" style={{ borderColor: '#c9a978' }}>
        {OSOBY.map((o) => (
          <button
            key={o.id}
            type="button"
            {...drag.bind(o.id)}
            className={`flex touch-none flex-col items-center px-1 ${zsuwa === o.id ? 'animate-in slide-in-from-top-6 duration-500' : ''}`}
            data-testid={`figurka-${o.id}`}
          >
            <Figurka osoba={o.id} color={color} size={48} />
            <span className="text-xs font-semibold">{o.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4 min-h-[6rem] text-center font-serif text-xl sm:text-2xl">
        {faza === 'plynie' && (
          <p>
            {podest}{' '}
            <strong key={naPodescie ?? 'nic'} className="animate-in fade-in duration-300" style={{ color }}>
              {naPodescie ? PLYNAC[naPodescie] : 'płynie'}
            </strong>{' '}
            łódką.
          </p>
        )}
        {faza === 'zagadki' && z && (
          <p>
            {podest} <strong style={{ color }}>{z.forma}</strong> {z.po}
          </p>
        )}
        {faza === 'zagadki' && !z && <p className="text-base">Wszystkie zdania mają swoje figurki.</p>}
        {faza === 'tablica' && (
          <div className="mx-auto inline-block border-4 bg-[#f5ead6] px-5 py-3" style={{ borderColor: '#8b6b43' }}>
            Nie{' '}
            <span data-drop="karmic" className="inline-block border-b-2 border-dashed px-1" style={{ borderColor: drag.hover === 'karmic' ? color : '#a8846a' }} data-testid="karmic">
              karmić
            </span>{' '}
            kozy.
          </div>
        )}
      </div>

      <p className="mt-2 min-h-[4.5rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>

      {faza === 'plynie' && (
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-xs text-muted-foreground">
            Sprawdzone figurki: {rozne} z {OSOBY.length}
          </span>
          {rozne >= PROG_OSOB && (
            <button
              type="button"
              onClick={() => {
                setFaza('zagadki');
                setNaPodescie(null);
                setMsg('Osoba (kto?) i liczba (ilu?) idą za figurką — końcówka czasownika się do nich dopasowuje.');
              }}
              className="flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-medium"
              style={{ borderColor: color }}
            >
              Teraz odwrotnie <ArrowRight className="h-4 w-4" aria-hidden />
            </button>
          )}
        </div>
      )}
      {faza === 'zagadki' && z && rozwiazana && (
        <button
          type="button"
          onClick={() => {
            setWidok(widok + 1);
            setNaPodescie(null);
            setMsg('');
          }}
          className="flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-medium"
          style={{ borderColor: color }}
        >
          {widok + 1 < ZAGADKI.length ? 'Następne zdanie' : 'Dalej'} <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
      {faza === 'zagadki' && !z && (
        <button
          type="button"
          onClick={() => {
            setFaza('tablica');
            setNaPodescie(null);
            setZsuwa(null);
            setMsg('');
          }}
          className="flex items-center gap-1.5 border-2 px-3 py-1.5 text-sm font-medium"
          style={{ borderColor: color }}
        >
          Tablica na pomoście <ArrowRight className="h-4 w-4" aria-hidden />
        </button>
      )}
      {st.tablica && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Czasownik zmienia się, kiedy zmienia się <strong>osoba</strong> (ja, ty, on…) i <strong>liczba</strong> (jeden czy wielu). Tylko
            bezokolicznik — „karmić”, „płynąć” — stoi sam, bez osoby i bez czasu. Tak czasowniki wyglądają w słowniku.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>{drag.drag && <Figurka osoba={drag.drag.id as Osoba} color={color} size={48} />}</DragGhost>
    </div>
  );
}
