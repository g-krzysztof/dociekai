'use client';

import { useState } from 'react';
import { Check } from 'lucide-react';
import { DragGhost, useDragToken } from '../../lesson-shell';
import { ikona } from './ikony';
import { KREGI, nowaScena, odznaka, scenyGotowe, wloz, wyjmij, type Przypiecie, type StanSceny } from './wspolnoty';

/**
 * L8, blok 2 „Gdyby mnie zabrakło” `[5.2]` — **gest nowy dla kursu: wyjmuje
 * siebie ze sceny palcem.** Trzy role z kręgów dziecka (dopełnione domyślnymi)
 * grają się same jako małe sceny. Postać „ja” przeciągnięta za kulisy (albo
 * stuknięta) znika ze sceny — scena blednie, rekwizyt się zmienia, inni
 * przestają się uśmiechać, a pod spodem staje, co w tej roli dajesz. Postać
 * wraca przeciągnięciem na puste miejsce albo stuknięciem. Blok zalicza
 * każda scena zobaczona bez ciebie i odzyskana.
 */

const TLO: Record<string, string> = { dom: '#fef3c7', klasa: '#dcfce7', podworko: '#dbeafe', miejscowosc: '#ede9fe', kraj: '#fee2e2' };

interface Props {
  color: string;
  sceny: { id: string; zDziecka: boolean }[];
  przypiecia: Przypiecie[];
  initial?: Record<string, StanSceny> | null;
  onState: (s: Record<string, StanSceny>) => void;
  onComplete: () => void;
}

export function GdybyMnieZabraklo({ color, sceny, przypiecia, initial, onState, onComplete }: Props) {
  const [stan, setStan] = useState<Record<string, StanSceny>>(() => initial ?? {});
  const ids = sceny.map((s) => s.id);
  const get = (id: string) => stan[id] ?? nowaScena();

  const ustaw = (id: string, s: StanSceny) => {
    const next = { ...stan, [id]: s };
    setStan(next);
    onState(next);
    if (scenyGotowe(ids, next)) onComplete();
  };
  const przelacz = (id: string) => ustaw(id, get(id).wSrodku ? wyjmij() : wloz(get(id)));

  const drag = useDragToken({
    onDrop: (tok, target) => {
      const id = tok.slice(3);
      if (target === `kulisy:${id}` && get(id).wSrodku) ustaw(id, wyjmij());
      if (target === `scena:${id}` && !get(id).wSrodku) ustaw(id, wloz(get(id)));
    },
    onTap: (tok) => przelacz(tok.slice(3)),
  });

  const gotowe = scenyGotowe(ids, stan);
  const zDziecka = sceny.filter((s) => s.zDziecka).length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        {zDziecka === 3
          ? 'Trzy role z twoich kręgów grają się same.'
          : zDziecka > 0
            ? 'Role z twoich kręgów grają się same, a resztę dopisaliśmy z kamienicy.'
            : 'Te sceny grają się same — to role z kamienicy przy Lipowej.'}{' '}
        W każdej stoisz ty, w kolorze lekcji. <strong>Wyjmij siebie ze sceny</strong> — przeciągnij postać za kulisy albo ją stuknij —
        i popatrz, co się zmieni. Potem wróć na swoje miejsce.
      </p>
      <div className="mt-4 grid gap-4 lg:grid-cols-3">
        {sceny.map((s) => (
          <ScenaRoli key={s.id} id={s.id} color={color} stan={get(s.id)} krag={przypiecia.find((p) => p.odznaka === s.id)?.krag ?? odznaka(s.id)!.zwykle} drag={drag} />
        ))}
      </div>
      <p className="mt-3 min-h-[2.5rem] text-sm" aria-live="polite">
        {gotowe ? (
          <span className="inline-flex items-start gap-1.5">
            <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
            Każda scena bez ciebie jest trochę uboższa. Świat się nie zawalił, ale czegoś zabrakło — bo w każdym z tych miejsc coś od
            siebie dajesz.
          </span>
        ) : (
          `Scen zobaczonych bez ciebie: ${ids.filter((id) => stan[id]?.widziane).length} z ${ids.length}.${ids.some((id) => stan[id]?.widziane && !stan[id]?.wSrodku) ? ' Scena czeka, aż wrócisz.' : ''}`
        )}
      </p>
      <DragGhost drag={drag.drag}>
        <span className="block" style={{ color }}>
          <Ja size={48} />
        </span>
      </DragGhost>
    </div>
  );
}

function ScenaRoli({ id, color, stan, krag, drag }: { id: string; color: string; stan: StanSceny; krag: string; drag: ReturnType<typeof useDragToken> }) {
  const o = odznaka(id)!;
  const { wSrodku, widziane } = stan;
  const Rekwizyt = ikona(o.scena.rekwizyt[wSrodku ? 0 : 1]);
  const tok = `ja:${id}`;
  const nadScena = drag.hover === `scena:${id}`;
  const nadKulisami = drag.hover === `kulisy:${id}`;
  const trzymany = drag.drag?.id === tok;
  const ja = (
    <button
      type="button"
      {...drag.bind(tok)}
      aria-label={wSrodku ? `Wyjmij siebie ze sceny: ${o.label}` : `Wróć do sceny: ${o.label}`}
      className={`cursor-grab touch-none transition-opacity ${trzymany ? 'opacity-30' : ''}`}
      style={{ color }}
    >
      <Ja size={56} />
    </button>
  );
  return (
    <figure className="m-0 border" style={{ borderColor: color }}>
      <figcaption className="flex items-center justify-between gap-2 border-b px-3 py-1.5 text-xs font-semibold" style={{ borderColor: color }}>
        <span>{o.label}</span>
        <span className="font-normal text-muted-foreground">{KREGI.find((k) => k.id === krag)?.label}</span>
      </figcaption>
      <div className="grid grid-cols-[1fr_64px]">
        <div
          data-drop={`scena:${id}`}
          className="relative h-[150px] overflow-hidden transition-[filter] duration-700"
          style={{ background: TLO[krag] ?? '#f5f5f4', filter: wSrodku ? 'none' : 'saturate(0.15) brightness(0.97)', outline: nadScena ? `2px solid ${color}` : undefined, outlineOffset: -2 }}
        >
          <div className="absolute inset-x-0 bottom-0 h-[21%] bg-black/[0.06]" aria-hidden />
          <svg viewBox="0 0 200 150" preserveAspectRatio="xMaxYMax meet" className="absolute inset-0 h-full w-full" aria-hidden>
            {Array.from({ length: o.scena.inni }, (_, i) => (
              <Inny key={i} x={112 + i * 30} smutny={!wSrodku} />
            ))}
          </svg>
          <Rekwizyt
            className={`absolute left-[44%] top-[18%] h-9 w-9 transition-all duration-700 ${wSrodku ? '' : 'translate-y-2 opacity-60'}`}
            style={{ color: wSrodku ? color : '#78716c' }}
            aria-hidden
          />
          <div className="absolute bottom-2 left-3">
            {wSrodku ? (
              ja
            ) : (
              <span className="block h-[56px] w-[37px] border-2 border-dashed" style={{ borderColor: color }} aria-hidden />
            )}
          </div>
        </div>
        <div
          data-drop={`kulisy:${id}`}
          className="flex items-end justify-center border-l pb-2"
          style={{
            borderColor: color,
            background: `repeating-linear-gradient(90deg, color-mix(in srgb, ${color} 28%, white) 0 6px, color-mix(in srgb, ${color} 16%, white) 6px 12px)`,
            outline: nadKulisami ? `2px solid ${color}` : undefined,
            outlineOffset: -2,
          }}
          aria-label="Kulisy"
        >
          {!wSrodku && ja}
        </div>
      </div>
      <div className="min-h-[5.5rem] border-t px-3 py-2 text-sm" style={{ borderColor: color }}>
        <p>{wSrodku ? o.scena.z : <strong>{o.scena.bez}</strong>}</p>
        {widziane && (
          <p className="mt-1 text-xs" style={{ color }}>
            W tej roli: {o.scena.dajesz.charAt(0).toLowerCase() + o.scena.dajesz.slice(1)}
          </p>
        )}
      </div>
    </figure>
  );
}

/** Postać dziecka: prosta sylwetka w kolorze lekcji (`currentColor`). */
function Ja({ size }: { size: number }) {
  return (
    <svg width={Math.round(size * 0.66)} height={size} viewBox="0 0 40 60" className="pointer-events-none block" aria-hidden>
      <circle cx="20" cy="12" r="9" fill="currentColor" />
      <path d="M8 58 L8 34 Q8 24 20 24 Q32 24 32 34 L32 58 Z" fill="currentColor" />
      <circle cx="17" cy="11" r="1.3" fill="#fff" />
      <circle cx="23" cy="11" r="1.3" fill="#fff" />
      <path d="M16 15 Q20 18 24 15" stroke="#fff" strokeWidth="1.4" fill="none" strokeLinecap="round" />
    </svg>
  );
}

/** Ktoś inny w scenie: szara sylwetka; bez ciebie przestaje się uśmiechać. */
function Inny({ x, smutny }: { x: number; smutny: boolean }) {
  return (
    <g transform={`translate(${x} 70)`} opacity={smutny ? 0.75 : 1}>
      <circle cx="0" cy="12" r="9" fill="#a8a29e" />
      <path d="M-11 50 L-11 32 Q-11 23 0 23 Q11 23 11 32 L11 50 Z" fill="#a8a29e" />
      <circle cx="-3" cy="11" r="1.2" fill="#fff" />
      <circle cx="3" cy="11" r="1.2" fill="#fff" />
      <path d={smutny ? 'M-4 17 Q0 14 4 17' : 'M-4 15 Q0 18.5 4 15'} stroke="#fff" strokeWidth="1.3" fill="none" strokeLinecap="round" />
    </g>
  );
}
