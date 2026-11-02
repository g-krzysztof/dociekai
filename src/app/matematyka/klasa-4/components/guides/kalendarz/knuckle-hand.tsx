'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { KNUCKLE_SEQUENCE, MONTH_NAMES, daysInMonth, type KnucklePosition } from '../../../lib/calendar';
import { toRoman } from '../../../lib/roman';
import { img } from '@/lib/media';

/**
 * Współrzędne (%) każdego z czternastu miejsc na zdjęciu
 * `dwie-piesci-kostki.jpg` — dwie pięści złączone wskazującymi kostkami,
 * kciuki schowane. Kalibrowane ręcznie pod to jedno, konkretne zdjęcie (nie
 * pod żadną anatomiczną regułę), więc jeśli zdjęcie się kiedyś zmieni, te
 * liczby trzeba przekalibrować razem z nim.
 */
const POSITION_COORDS: { x: number; y: number }[] = [
  { x: 12.7, y: 51.6 }, // 0  L-mały (styczeń)
  { x: 18.7, y: 54.7 }, // 1  L-dolina (luty)
  { x: 21.5, y: 45.4 }, // 2  L-serdeczny (marzec)
  { x: 27.2, y: 48.5 }, // 3  L-dolina (kwiecień)
  { x: 31.5, y: 39.1 }, // 4  L-środkowy (maj)
  { x: 37.8, y: 46.5 }, // 5  L-dolina (czerwiec)
  { x: 44, y: 40 }, // 6  L-wskazujący (lipiec)
  { x: 56.9, y: 40 }, // 7  P-wskazujący (sierpień)
  { x: 62.2, y: 49 }, // 8  P-dolina (wrzesień)
  { x: 69.5, y: 39.4 }, // 9  P-środkowy (październik)
  { x: 73.7, y: 54.5 }, // 10 P-dolina (listopad)
  { x: 81, y: 45.4 }, // 11 P-serdeczny (grudzień)
  { x: 83.2, y: 58.5 }, // 12 P-dolina (nieużywana)
  { x: 89.3, y: 51.8 }, // 13 P-mały (nieużywany)
];

function positionReveal(position: KnucklePosition): string {
  if (position.monthIndex === null) {
    return 'To miejsce nie jest używane — w roku jest tylko dwanaście miesięcy, a dwie dłonie razem dają czternaście miejsc.';
  }
  const raw = MONTH_NAMES[position.monthIndex];
  const label = `${raw[0].toUpperCase()}${raw.slice(1)}`;
  const days = daysInMonth(position.monthIndex, 2026);
  const base = `${label} — ${days} dni${position.monthIndex === 1 ? ' (w roku przestępnym 29)' : ''}.`;

  if (position.hand === 'left' && position.indexInHand === 6) {
    return `${base} To ostatnia kostka lewej dłoni — wskazujący palec. Styka się bezpośrednio z pierwszą kostką prawej dłoni, bez doliny między nimi.`;
  }
  if (position.hand === 'right' && position.indexInHand === 0) {
    return `${base} To pierwsza kostka prawej dłoni — wskazujący palec, stykający się z lipcem na lewej dłoni. Jedyne miejsce w roku, gdzie dwa 31-dniowe miesiące sąsiadują ze sobą.`;
  }
  return base;
}

interface MarkerProps {
  color: string;
  coord: { x: number; y: number };
  position: KnucklePosition;
  selected: boolean;
  onSelect: () => void;
}

function Marker({ color, coord, position, selected, onSelect }: MarkerProps) {
  const used = position.monthIndex !== null;
  return (
    <button
      type="button"
      disabled={!used}
      onClick={onSelect}
      aria-pressed={selected}
      aria-label={
        used ? `${toRoman((position.monthIndex as number) + 1)} — ${MONTH_NAMES[position.monthIndex as number]}` : 'Nieużywane miejsce'
      }
      className={cn(
        'absolute flex h-8 w-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full font-mono text-[11px] font-bold tabular-nums transition-all sm:h-9 sm:w-9 sm:text-xs',
        used ? 'cursor-pointer' : 'cursor-default border-dashed'
      )}
      style={{
        left: `${coord.x}%`,
        top: `${coord.y}%`,
        borderWidth: 2,
        borderStyle: used ? 'solid' : 'dashed',
        borderColor: used ? (selected ? color : `${color}80`) : `${color}70`,
        backgroundColor: used ? (selected ? color : 'rgba(255,255,255,0.85)') : 'rgba(255,255,255,0.5)',
        color: used ? (selected ? '#fff' : color) : `${color}90`,
        opacity: used ? 1 : 0.7,
      }}
    >
      {used ? toRoman((position.monthIndex as number) + 1) : '·'}
    </button>
  );
}

export function KnuckleHand({ color }: { color: string }) {
  const [selected, setSelected] = useState<number | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const position = selected !== null ? KNUCKLE_SEQUENCE[selected] : undefined;
  const seamSelected = selected === 6 || selected === 7;

  return (
    <div>
      <div className="mb-3 text-xs text-muted-foreground sm:text-sm">
        Złóż obie dłonie w pięści, kostkami do góry, i złącz wskazujące palce ze sobą — tak, żeby
        stykały się bez żadnej przerwy, dokładnie jak na zdjęciu. Kliknij dowolny znacznik.
      </div>
      <div className="mb-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground sm:text-sm">
        <span>
          <span aria-hidden style={{ color }}>
            ●
          </span>{' '}
          kostka = 31 dni
        </span>
        <span>
          <span aria-hidden className="opacity-50" style={{ color }}>
            ○
          </span>{' '}
          dolina = 30 dni (luty: 28/29)
        </span>
      </div>

      <div className="relative mx-auto aspect-[4/3] w-full max-w-xl">
        <Image
          src={img('/images/matematyka/przewodniki/kalendarz/dwie-piesci-kostki.jpg')}
          alt="Dwie zaciśnięte pięści złączone kostkami wskazujących palców, widziane z góry"
          fill
          className="rounded-lg object-cover"
          sizes="(min-width: 640px) 576px, 100vw"
          priority
        />
        {KNUCKLE_SEQUENCE.map((p, i) => (
          <Marker
            key={i}
            color={color}
            coord={POSITION_COORDS[i]}
            position={p}
            selected={selected === i}
            onSelect={() => setSelected(i)}
          />
        ))}
      </div>

      <p
        className="mt-2 text-center text-[11px] leading-snug sm:text-xs"
        style={{ color: seamSelected ? textColor : undefined }}
      >
        ↑ tutaj obie dłonie się stykają — bez doliny między lipcem a sierpniem
      </p>

      <motion.div
        layout
        className="mt-4 min-h-[76px] border-l-4 p-3 sm:p-4"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <AnimatePresence mode="wait">
          {position ? (
            <motion.p
              key={selected}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="text-sm leading-relaxed sm:text-base"
              style={{ color: textColor }}
            >
              {positionReveal(position)}
            </motion.p>
          ) : (
            <motion.p
              key="placeholder"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Kliknij dowolną kostkę albo dolinę powyżej.
            </motion.p>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
