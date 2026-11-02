'use client';

import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, type PanInfo } from 'framer-motion';
import { Twarz, type MinaTwarzy } from '../../twarz/twarz';
import { STRONA_LABEL, druga, karta, rzut, talia, type Rzut, type Strona } from './argumenty';

/**
 * L6, blok 2 „Dlaczego?” — **gest nowy dla kursu: rzuca kartę-argument panu
 * Bogdanowi** (przeciągnięcie z rozpędem albo prosto na niego), a on ją
 * łapie i przypina pod chorągiewką (powód za twoją stroną), przypina pod
 * cudzą (powód za drugą stroną), albo odbija (powtórzenie, nie na temat).
 * Rodzaj karty widać w jej słowach (`argumenty.ts`). Talia lustrzana.
 */

const MINA: Record<Rzut['rodzaj'], MinaTwarzy> = { za: 'usmiech', przeciw: 'usmiech', powtorzenie: 'zdziwienie', obok: 'grymas' };

interface Lot {
  id: string;
  from: { x: number; y: number };
  via: { x: number; y: number };
  to: { x: number; y: number };
  wynik: Rzut;
}

interface Props {
  color: string;
  strona: Strona;
  przypiete: Record<Strona, string[]>;
  onPrzypnij: (s: Strona, id: string) => void;
  onComplete: () => void;
}

export function Dlaczego({ color, strona, przypiete, onPrzypnij, onComplete }: Props) {
  const [reka, setReka] = useState<string[]>(() => talia(strona));
  const [lot, setLot] = useState<Lot | null>(null);
  const [ostatni, setOstatni] = useState<Rzut | null>(null);
  const [odbite, setOdbite] = useState<string[]>([]);
  const bogdanRef = useRef<HTMLDivElement>(null);
  const kolRef = useRef<Record<string, HTMLDivElement | null>>({});
  const rekaRef = useRef<HTMLDivElement>(null);
  const done = reka.length === 0 && !lot;

  useEffect(() => {
    if (done) onComplete();
  }, [done, onComplete]);

  const center = (el: Element | null | undefined) => {
    const r = el?.getBoundingClientRect();
    return r ? { x: r.left + r.width / 2, y: r.top + r.height / 2 } : { x: 0, y: 0 };
  };

  const rzuc = (id: string, point: { x: number; y: number }) => {
    const w = rzut(id, strona);
    const target = w.cel === 'odbita' ? rekaRef.current : kolRef.current[w.cel];
    setReka((r) => r.filter((x) => x !== id));
    setLot({ id, from: point, via: center(bogdanRef.current), to: center(target), wynik: w });
  };

  const onDragEnd = (id: string) => (_e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const b = bogdanRef.current?.getBoundingClientRect();
    const onBogdan = b && info.point.x >= b.left - 20 && info.point.x <= b.right + 20 && info.point.y >= b.top - 20 && info.point.y <= b.bottom + 20;
    const fling = info.velocity.y < -500 || Math.hypot(info.velocity.x, info.velocity.y) > 900;
    if (onBogdan || fling) rzuc(id, { x: info.point.x, y: info.point.y });
  };

  const land = () => {
    if (!lot) return;
    const w = lot.wynik;
    if (w.cel === 'odbita') {
      setOdbite((o) => [...o, lot.id]);
    } else onPrzypnij(w.cel, lot.id);
    setOstatni(w);
    setLot(null);
  };

  const kolumna = (s: Strona) => (
    <div
      ref={(el) => {
        kolRef.current[s] = el;
      }}
      className="min-h-[7rem] border p-2"
      style={{ borderColor: s === strona ? color : undefined }}
    >
      <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: s === strona ? color : undefined }}>
        pod chorągiewką: {STRONA_LABEL[s]}
        {s === strona ? ' (twoja)' : ''}
      </p>
      <ul className="mt-1 space-y-1">
        {przypiete[s].map((id) => (
          <li key={id} className="border-l-2 bg-stone-50 px-2 py-1 text-xs leading-snug dark:bg-zinc-800" style={{ borderColor: s === strona ? color : '#a8a29e' }}>
            {karta(id).text}
          </li>
        ))}
      </ul>
    </div>
  );

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-5">
      <p className="text-sm leading-relaxed sm:text-base">
        Rzuć panu Bogdanowi kartę z argumentem — przeciągnij ją na niego albo pchnij z rozpędem w górę. On sprawdzi, czy to powód.
      </p>
      <div className="mt-3 grid grid-cols-[1fr_auto_1fr] items-start gap-2">
        {kolumna('ogrodek')}
        <div ref={bogdanRef} className="flex w-[92px] flex-col items-center">
          <Twarz kto="bogdan" mina={ostatni ? MINA[ostatni.rodzaj] : 'spokoj'} size={80} label="pan Bogdan" />
          <span className="text-xs text-muted-foreground">pan Bogdan</span>
        </div>
        {kolumna('boisko')}
      </div>
      <p className="mt-2 min-h-[2.75rem] border-l-4 bg-stone-50 px-3 py-1.5 text-sm italic dark:bg-zinc-800" style={{ borderColor: '#c9a227' }} aria-live="polite">
        {ostatni ? `Pan Bogdan: ${ostatni.mowi}` : 'Pan Bogdan czeka na argumenty.'}
      </p>

      <div ref={rekaRef} className="mt-3 border-t pt-3">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Twoje karty ({reka.length}) {odbite.length > 0 && `· odbite: ${odbite.length}`}
        </p>
        <div className="flex flex-wrap gap-2">
          {reka.map((id) => (
            <motion.div
              key={id}
              drag
              dragSnapToOrigin
              dragElastic={0.6}
              whileDrag={{ scale: 1.05, zIndex: 50 }}
              onDragEnd={onDragEnd(id)}
              className="max-w-[16rem] cursor-grab select-none border-2 bg-amber-50 px-3 py-2 text-sm leading-snug shadow-sm dark:bg-zinc-800"
              style={{ borderColor: '#c9a227', touchAction: 'none' }}
              role="button"
              tabIndex={0}
              aria-label={`Karta: ${karta(id).text} — rzuć do pana Bogdana`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  rzuc(id, center(e.currentTarget));
                }
              }}
            >
              {karta(id).text}
            </motion.div>
          ))}
        </div>
        {odbite.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">Odbite: {odbite.map((id) => `„${karta(id).text}”`).join(' ')}</p>
        )}
      </div>
      {done && (
        <p className="mt-3 border-t pt-3 text-sm leading-relaxed sm:text-base">
          Pod twoją chorągiewką wiszą powody. Pod drugą też — bo druga strona ma swoje racje. „{STRONA_LABEL[druga(strona)]}” to nie
          głupi pomysł, tylko inny wybór.
        </p>
      )}
      {lot &&
        typeof document !== 'undefined' &&
        createPortal(
          <motion.div
            className="pointer-events-none fixed z-[100] max-w-[14rem] border-2 bg-amber-50 px-3 py-2 text-sm shadow-lg"
            style={{ borderColor: '#c9a227', left: 0, top: 0 }}
            initial={{ x: lot.from.x - 100, y: lot.from.y - 20, rotate: 0 }}
            animate={{ x: [lot.from.x - 100, lot.via.x - 100, lot.to.x - 100], y: [lot.from.y - 20, lot.via.y - 20, lot.to.y - 20], rotate: [0, -8, 0] }}
            transition={{ duration: 0.9, times: [0, 0.45, 1], ease: 'easeInOut' }}
            onAnimationComplete={land}
          >
            {karta(lot.id).text}
          </motion.div>,
          document.body
        )}
    </div>
  );
}
