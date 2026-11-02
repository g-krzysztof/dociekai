import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Stworki „bibi” — wspólny świat bloku 1 i zadania w bloku 5.
 *
 * Stworek ma dokładnie cztery cechy i nic więcej: **kropki, uszy, kolor
 * i oczy**. Tyle samo widzi maszyna w zadaniu, więc dziecko i model patrzą na
 * ten sam, jawny zestaw — nie ma cech ukrytych ani „intuicji”, której dziecko
 * nie mogłoby sprawdzić.
 *
 * Bibi to stworek **z kropkami**. Tylko to. Cała reszta (uszy, kolor, oczy) jest
 * po to, żeby w przykładach mogła iść z kropkami w parze przez przypadek —
 * i na tym przypadku stoją oba bloki: w pierwszym dziecko samo daje się na niego
 * nabrać, w piątym ma nie dać się nabrać maszynie.
 *
 * Rysunek idzie kodem: 40 stworków w lekcji to 40 kombinacji tych samych
 * czterech cech, a obrazek z pliku nie umiałby się przełączyć z kropek na
 * gładkie futro.
 */

export type Ears = 'round' | 'pointy';
export type Fur = 'blue' | 'orange' | 'green';

export interface Creature {
  id: string;
  spots: boolean;
  ears: Ears;
  fur: Fur;
  eyes: 1 | 2;
}

export const isBibi = (creature: Creature) => creature.spots;

export type FeatureId = 'uszy' | 'kolor' | 'oczy' | 'kropki';

export const FEATURES: { id: FeatureId; name: string }[] = [
  { id: 'uszy', name: 'uszy' },
  { id: 'kolor', name: 'kolor' },
  { id: 'oczy', name: 'oczy' },
  { id: 'kropki', name: 'kropki' },
];

/** Wartość cechy jako słowo — do werdyktów i do tabliczek pod stworkiem. */
export function featureValue(creature: Creature, feature: FeatureId): string {
  switch (feature) {
    case 'kropki':
      return creature.spots ? 'z kropkami' : 'bez kropek';
    case 'uszy':
      return creature.ears === 'round' ? 'okrągłe uszy' : 'spiczaste uszy';
    case 'kolor':
      return FUR_NAME[creature.fur];
    case 'oczy':
      return creature.eyes === 1 ? 'jedno oko' : 'dwoje oczu';
  }
}

export const FUR_NAME: Record<Fur, string> = {
  blue: 'niebieski',
  orange: 'pomarańczowy',
  green: 'zielony',
};

const FUR_FILL: Record<Fur, { body: string; dark: string }> = {
  blue: { body: '#b9d4ee', dark: '#6f9cc9' },
  orange: { body: '#f6cfa8', dark: '#d8925c' },
  green: { body: '#c4e0b4', dark: '#7fae6a' },
};

const INK = '#44403c';

/** Skrót do budowania list stworków: `c('b1', true, 'round', 'blue', 2)`. */
export const c = (id: string, spots: boolean, ears: Ears, fur: Fur, eyes: 1 | 2): Creature => ({
  id,
  spots,
  ears,
  fur,
  eyes,
});

export function CreatureArt({
  creature,
  className,
  title,
}: {
  creature: Creature;
  className?: string;
  title?: string;
}) {
  const fill = FUR_FILL[creature.fur];
  return (
    <svg viewBox="0 0 100 100" className={cn('block h-full w-full', className)} role="img" aria-label={title ?? describe(creature)}>
      {/* Uszy za tułowiem — tułów przykrywa ich nasadę. */}
      {creature.ears === 'round' ? (
        <>
          <circle cx={29} cy={33} r={10} fill={fill.body} stroke={INK} strokeWidth={1.8} />
          <circle cx={71} cy={33} r={10} fill={fill.body} stroke={INK} strokeWidth={1.8} />
          <circle cx={29} cy={33} r={4.5} fill={fill.dark} opacity={0.55} />
          <circle cx={71} cy={33} r={4.5} fill={fill.dark} opacity={0.55} />
        </>
      ) : (
        <>
          <path d="M22 46 L26 14 L42 36 Z" fill={fill.body} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M78 46 L74 14 L58 36 Z" fill={fill.body} stroke={INK} strokeWidth={1.8} strokeLinejoin="round" />
          <path d="M27 38 L28.5 24 L36 34 Z" fill={fill.dark} opacity={0.55} />
          <path d="M73 38 L71.5 24 L64 34 Z" fill={fill.dark} opacity={0.55} />
        </>
      )}

      {/* Stopy */}
      <ellipse cx={38} cy={88} rx={9} ry={4.5} fill={fill.dark} stroke={INK} strokeWidth={1.5} />
      <ellipse cx={62} cy={88} rx={9} ry={4.5} fill={fill.dark} stroke={INK} strokeWidth={1.5} />

      {/* Tułów */}
      <ellipse cx={50} cy={60} rx={31} ry={28} fill={fill.body} stroke={INK} strokeWidth={1.8} />

      {creature.spots && (
        <g fill={fill.dark}>
          <circle cx={29} cy={66} r={4} />
          <circle cx={38} cy={78} r={3.2} />
          <circle cx={66} cy={70} r={4.2} />
          <circle cx={73} cy={57} r={3} />
          <circle cx={56} cy={81} r={3} />
        </g>
      )}

      {/* Oczy */}
      {creature.eyes === 2 ? (
        <>
          <circle cx={41} cy={53} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={1.5} />
          <circle cx={59} cy={53} r={6.5} fill="#ffffff" stroke={INK} strokeWidth={1.5} />
          <circle cx={42} cy={54} r={2.8} fill={INK} />
          <circle cx={60} cy={54} r={2.8} fill={INK} />
        </>
      ) : (
        <>
          <circle cx={50} cy={52} r={9} fill="#ffffff" stroke={INK} strokeWidth={1.5} />
          <circle cx={51} cy={53} r={3.8} fill={INK} />
        </>
      )}

      {/* Buzia */}
      <path d="M44 67 Q50 72 56 67" fill="none" stroke={INK} strokeWidth={1.6} strokeLinecap="round" />
    </svg>
  );
}

export function describe(creature: Creature): string {
  return `Stworek: ${FUR_NAME[creature.fur]}, ${featureValue(creature, 'uszy')}, ${featureValue(
    creature,
    'oczy'
  )}, ${featureValue(creature, 'kropki')}`;
}

/** Stworek na karcie o stałym rozmiarze — ten sam kształt w talii, na tacy i w sprawdzianie. */
export function CreatureCard({
  creature,
  size = 64,
  className,
  children,
}: {
  creature: Creature;
  size?: number;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <div className={cn('relative shrink-0 border bg-white', className)} style={{ width: size, height: size }}>
      <CreatureArt creature={creature} />
      {children}
    </div>
  );
}
