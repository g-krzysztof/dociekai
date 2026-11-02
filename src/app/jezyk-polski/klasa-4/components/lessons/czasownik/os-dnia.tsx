'use client';

import { useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import Image from 'next/image';
import { Check, Sun } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import {
  CZASY_OSI,
  DZIENNIK,
  NAZWA_CZASU,
  START_ZDAN,
  dorzuc,
  dzienGotowy,
  naPeronie,
  polozenieCzasu,
  przejazd,
  zapadkaOsi,
  type Czas,
  type CzasyZdan,
} from './dzien';

/**
 * L15 blok 1 — „Wczoraj, dziś, jutro”. Dziecko przeciąga żeton dnia po osi.
 * Większość czasowników w dzienniku wyspy jedzie razem z dniem i zmienia
 * końcówkę sama, ale trzy zostają w tyle i czekają na peronie jak bagaż —
 * dziecko łapie każdy i dorzuca do zdania, a forma zmienia się w locie.
 * Termin „czasownik” pada po obu przejazdach (wczoraj i jutro).
 */

export interface StanOsi {
  dzien: Czas;
  zdania: CzasyZdan;
  zaliczone: Czas[];
}

interface Props {
  color: string;
  obraz: string;
  wyspa?: string;
  initial?: StanOsi | null;
  onState?: (s: StanOsi) => void;
  onComplete: () => void;
}

const FILTR: Record<Czas, string> = {
  wczoraj: 'sepia(0.55) saturate(0.8)',
  dzis: 'none',
  jutro: 'hue-rotate(-18deg) brightness(1.06) saturate(1.15)',
};

export function OsDnia({ color, obraz, wyspa, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<StanOsi>(() => initial ?? { dzien: 'dzis', zdania: { ...START_ZDAN }, zaliczone: [] });
  const [ciagnie, setCiagnie] = useState<number | null>(null);
  const [msg, setMsg] = useState('');
  const [mig, setMig] = useState<string | null>(null);
  const tor = useRef<HTMLDivElement>(null);
  const gotowe = stan.zaliczone.includes('wczoraj') && stan.zaliczone.includes('jutro');

  const zapisz = (s: StanOsi) => {
    setStan(s);
    onState?.(s);
  };

  const jedz = (cel: Czas) => {
    if (cel === stan.dzien) return;
    const zdania = przejazd(stan.zdania, cel);
    const peron = naPeronie(zdania, cel);
    zapisz({ ...stan, dzien: cel, zdania });
    setMsg(
      peron.length
        ? `Dzień pojechał na „${NAZWA_CZASU[cel]}”, a ${peron.length === 1 ? 'jeden czasownik został' : `${peron.length} czasowniki zostały`} na peronie. Złap ${peron.length === 1 ? 'go' : 'każdy'} i dorzuć do jego zdania.`
        : `Dzień na „${NAZWA_CZASU[cel]}” — wszystkie czasowniki dojechały.`
    );
  };

  const drag = useDragToken({
    onDrop: (id, target) => {
      if (target?.startsWith('zd:')) wrzuc(id, target.slice(3));
    },
    onTap: (id) => wrzuc(id, id),
  });

  function wrzuc(id: string, doZdania: string) {
    const o = dorzuc(stan.zdania, stan.dzien, id, doZdania);
    if (!o.ok) {
      if (o.powod === 'inne-zdanie') setMsg('To słowo jest z innego zdania — wraca na peron.');
      return;
    }
    const zdania = { ...stan.zdania, [id]: stan.dzien };
    const pelny = dzienGotowy(zdania, stan.dzien);
    const zaliczone = pelny && stan.dzien !== 'dzis' && !stan.zaliczone.includes(stan.dzien) ? [...stan.zaliczone, stan.dzien] : stan.zaliczone;
    zapisz({ ...stan, zdania, zaliczone });
    setMig(id);
    setMsg(`„${o.byla}” → „${o.forma}” — końcówka zmieniła się w locie.${pelny ? ' Cały dziennik jest już w „' + NAZWA_CZASU[stan.dzien] + '”.' : ''}`);
    if (zaliczone.length === 2 && !gotowe) onComplete();
  }

  // Żeton dnia: przeciąganie po osi, puszczenie wybiera najbliższy dzień.
  const pozycja = (e: ReactPointerEvent) => {
    const r = tor.current!.getBoundingClientRect();
    return Math.max(0, Math.min(1, (e.clientX - r.left) / r.width));
  };
  const down = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (e.button > 0) return;
    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      /* działa i bez przechwycenia */
    }
    setCiagnie(Math.round(pozycja(e) * 1000) / 1000);
  };
  const move = (e: ReactPointerEvent<HTMLButtonElement>) => {
    if (ciagnie == null) return;
    setCiagnie(Math.round(pozycja(e) * 1000) / 1000);
  };
  const up = () => {
    if (ciagnie == null) return;
    const cel = zapadkaOsi(ciagnie);
    setCiagnie(null);
    jedz(cel);
  };

  const t = ciagnie ?? polozenieCzasu(stan.dzien);
  const peron = naPeronie(stan.zdania, stan.dzien);

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Przeciągnij żeton dnia po osi. Patrz, które czasowniki jadą z nim, a które zostają w tyle.
      </p>

      <div className="mt-3 grid gap-3 md:grid-cols-[minmax(0,320px)_1fr] md:items-start">
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[320px] overflow-hidden border">
          <Image src={obraz} alt="Akwarela: o świcie siwy rybak naprawia młotkiem odwróconą łódkę na plaży wyspy, za nim na wydmie pasie się biała koza — kolor obrazka zmienia się z dniem na osi" width={320} height={240} className="h-full w-full object-cover transition-[filter] duration-700" style={{ filter: FILTR[stan.dzien] }} />
          <span className="absolute left-2 top-2 border bg-white/90 px-2 py-0.5 text-xs font-semibold dark:bg-zinc-900/90" style={{ color }}>
            {wyspa ? `${wyspa} · ` : ''}
            {NAZWA_CZASU[stan.dzien]}
          </span>
        </div>

        <div className="min-w-0">
          {/* Oś */}
          <div className="select-none px-5 pt-2">
            <div ref={tor} className="relative h-12">
              <span aria-hidden className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 bg-stone-300" />
              {CZASY_OSI.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => jedz(c)}
                  className="absolute top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-stone-400"
                  style={{ left: `${polozenieCzasu(c) * 100}%` }}
                  aria-label={`Dzień: ${NAZWA_CZASU[c]}`}
                />
              ))}
              <button
                type="button"
                onPointerDown={down}
                onPointerMove={move}
                onPointerUp={up}
                onPointerCancel={up}
                aria-label={`Żeton dnia — teraz ${NAZWA_CZASU[stan.dzien]}`}
                className="absolute top-1/2 flex h-10 w-10 touch-none items-center justify-center rounded-full border-2 bg-white shadow cursor-ew-resize dark:bg-zinc-900"
                style={{
                  left: `${t * 100}%`,
                  transform: 'translate(-50%, -50%)',
                  borderColor: color,
                  transition: ciagnie == null ? 'left 300ms ease-out' : 'none',
                }}
                data-testid="zeton-dnia"
              >
                <Sun className="h-5 w-5" style={{ color }} aria-hidden />
              </button>
            </div>
            <div className="relative h-5 text-xs font-semibold">
              {CZASY_OSI.map((c) => (
                <span key={c} className="absolute -translate-x-1/2" style={{ left: `${polozenieCzasu(c) * 100}%`, color: c === stan.dzien ? color : undefined }}>
                  {NAZWA_CZASU[c]}
                </span>
              ))}
            </div>
          </div>

          {/* Peron */}
          <div className="relative mt-2 min-h-[3.25rem] border-y-4 border-dotted border-stone-300 bg-stone-50 dark:bg-zinc-800" data-testid="peron">
            {peron.length === 0 && <p className="px-2 py-3 text-xs text-muted-foreground">Peron pusty.</p>}
            <div className="grid grid-cols-3 gap-1 p-1">
              {CZASY_OSI.map((c) => (
                <div key={c} className="flex min-h-[2.5rem] flex-col items-center gap-1">
                  {peron
                    .filter((id) => stan.zdania[id] === c)
                    .map((id) => {
                      const z = DZIENNIK.find((x) => x.id === id)!;
                      return (
                        <button
                          key={id}
                          type="button"
                          {...drag.bind(id)}
                          className="touch-none animate-pulse border-2 bg-amber-50 px-2 py-0.5 font-serif text-sm dark:bg-amber-950"
                          style={{ borderColor: '#d97706' }}
                          data-testid={`bagaz-${id}`}
                        >
                          {z.formy[c]}
                        </button>
                      );
                    })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dziennik */}
      <div className="mt-3 border bg-[#fffdf6] p-3 dark:bg-zinc-800">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Dziennik wyspy · {NAZWA_CZASU[stan.dzien]}</p>
        <ol className="mt-1 space-y-1 font-serif text-base leading-relaxed sm:text-lg">
          {DZIENNIK.map((z) => {
            const naMiejscu = stan.zdania[z.id] === stan.dzien;
            return (
              <li key={z.id}>
                {z.przed}{' '}
                {naMiejscu ? (
                  <strong key={`${z.id}-${stan.dzien}-${mig === z.id ? 'm' : ''}`} className="animate-in fade-in slide-in-from-left-2 duration-500" style={{ color }}>
                    {z.formy[stan.dzien]}
                  </strong>
                ) : (
                  <span
                    data-drop={`zd:${z.id}`}
                    className="inline-block min-w-[5rem] border-b-2 border-dashed align-baseline"
                    style={{ borderColor: '#d97706', background: drag.hover === `zd:${z.id}` ? `${color}22` : undefined }}
                    data-testid={`luka-${z.id}`}
                  >
                    &nbsp;
                  </span>
                )}{' '}
                {z.po}
              </li>
            );
          })}
        </ol>
      </div>

      <p className="mt-3 min-h-[3rem] text-sm leading-relaxed sm:text-base" aria-live="polite">
        {msg}
      </p>
      <p className="text-xs text-muted-foreground">
        Dziennik przeniesiony do: {stan.zaliczone.length ? stan.zaliczone.map((c) => NAZWA_CZASU[c]).join(', ') : '—'} (potrzebne: wczoraj i jutro)
      </p>

      {gotowe && (
        <p className="mt-3 flex items-start gap-2 border-t pt-3 text-sm leading-relaxed sm:text-base">
          <Check className="mt-0.5 h-5 w-5 shrink-0" style={{ color }} aria-hidden />
          <span>
            Wszystkie słowa, które jechały z dniem — skubie, naprawia, krzyczą, śpi, budują, zapala — mówią, <strong>co się dzieje</strong>, i
            same niosą czas: wczoraj, dziś albo jutro. To <strong>czasowniki</strong>. Przestaw czasownik, a cała historia przeniesie się w
            czasie.
          </span>
        </p>
      )}

      <DragGhost drag={drag.drag}>
        {drag.drag && (
          <span className="block border-2 bg-amber-50 px-2 py-0.5 font-serif text-sm" style={{ borderColor: '#d97706' }}>
            {(() => {
              const z = DZIENNIK.find((x) => x.id === drag.drag!.id)!;
              return z.formy[stan.zdania[z.id]];
            })()}
          </span>
        )}
      </DragGhost>
    </div>
  );
}
