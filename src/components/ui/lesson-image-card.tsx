'use client';

import { useRef, useState, type MouseEvent as ReactMouseEvent, type ReactNode } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Współdzielona karta „ilustracja + wprowadzenie w krok/blok". Powstała dla
 * kursu `/matematyka` (krok lekcji), wypromowana do `src/components/ui/`, gdy
 * `/informatyka` stała się drugim konsumentem (blok lekcji) — ta sama zasada
 * „promote on second use" co `LessonRewardCard` / `useSectionScrollAnchor`.
 * Kurs matematyki importuje ją dalej przez re-eksport
 * `matematyka/klasa-4/components/lesson-image-card.tsx`, więc 60+ istniejących
 * lekcji nie wymagało zmiany importu.
 */

interface CardBaseProps {
  color: string;
  image: string;
  alt: string;
  children: ReactNode;
}

interface BasicCardProps extends CardBaseProps {
  variant: 'basic';
  /** Obrazek po lewej / tekst po prawej zamiast domyślnego układu. */
  reverse?: boolean;
}

interface SecondaryCardProps extends CardBaseProps {
  variant: 'secondary';
  /** Pogrubione zdanie-hak nad treścią — to ono niesie ciężar, `children` je tylko dopowiada. */
  lead: string;
  reverse?: boolean;
}

interface GhostCardProps extends CardBaseProps {
  variant: 'ghost';
  /** Wielki, widmowy numeral w tle — numer kroku, liczba z treści, cokolwiek pasuje tematycznie. */
  numeral: string;
  /** Krótka kolorowa etykieta nad treścią (np. "3 sposoby myślenia"). */
  kicker: string;
}

export type LessonImageCardProps = BasicCardProps | SecondaryCardProps | GhostCardProps;

/**
 * Karta "wprowadzenie do kroku": ilustracja + krótki tekst przed właściwym
 * ćwiczeniem/widgetem. Trzy warianty — odwołuj się do nich po nazwie:
 *
 * - `basic` — płaska belka z kolorowym tłem, obrazek i tekst obok siebie. Spokojny
 *   domyślny wybór; dobry, gdy krok sam w sobie już dużo się dzieje niżej (dużo
 *   interaktywnych elementów), więc wprowadzenie nie powinno z nimi konkurować.
 * - `secondary` — zdjęcie w przesuniętej, obróconej ramce (echo ilustracji modułów
 *   na hubie kursu) + pogrubione zdanie-hak nad zwykłym tekstem + kolorowy pasek
 *   z lewej. Wejście z animacją przy scrollu.
 * - `ghost` — wielki, widmowy numeral w tle, zdjęcie jako duża "polaroidowa" karta
 *   obok tekstu, blask podążający za kursorem (ten sam trik co `TopicRow` na
 *   stronie modułu), eyebrow-etykieta nad treścią. Najbardziej ozdobny wariant —
 *   dobry na otwarcie kroku, który sam w sobie jest krótki.
 *
 * Żaden wariant nie wprowadza nowych kolorów/fontów — wszystkie korzystają
 * wyłącznie z `color` modułu i technik już obecnych w kursie.
 */
export function LessonImageCard(props: LessonImageCardProps) {
  if (props.variant === 'secondary') return <SecondaryCard {...props} />;
  if (props.variant === 'ghost') return <GhostCard {...props} />;
  return <BasicCard {...props} />;
}

function BasicCard({ color, image, alt, reverse = false, children }: BasicCardProps) {
  return (
    <div
      className={cn(
        'mb-4 grid items-center gap-5 p-5 sm:p-6',
        reverse ? 'md:grid-cols-[200px_1fr]' : 'md:grid-cols-[1fr_200px]'
      )}
      style={{ backgroundColor: `${color}0f` }}
    >
      <div className={cn('text-sm leading-relaxed sm:text-base', reverse && 'md:order-2')}>
        {children}
      </div>
      <div
        className={cn(
          'relative mx-auto aspect-[4/3] w-full max-w-[220px] overflow-hidden',
          reverse && 'md:order-1'
        )}
      >
        <Image src={image} alt={alt} width={220} height={165} className="absolute inset-0 h-full w-full object-contain" />
      </div>
    </div>
  );
}

function SecondaryCard({ color, image, alt, lead, reverse = false, children }: SecondaryCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className={cn(
        'mb-4 grid items-center gap-6 border-l-4 p-6 sm:p-8',
        reverse ? 'md:grid-cols-[1fr_220px]' : 'md:grid-cols-[220px_1fr]'
      )}
      style={{ borderColor: color, backgroundColor: `${color}0f` }}
    >
      <div
        className={cn(
          'group relative mx-auto aspect-[4/3] w-full max-w-[220px]',
          reverse && 'md:order-2'
        )}
      >
        <span
          aria-hidden
          className="absolute inset-0 translate-x-3 translate-y-3 border-2 transition-transform duration-300 group-hover:translate-x-4 group-hover:translate-y-4"
          style={{ borderColor: color }}
        />
        <div className="relative aspect-[4/3] w-full -rotate-2 overflow-hidden bg-white transition-transform duration-300 group-hover:rotate-0 dark:bg-zinc-900/80">
          <Image src={image} alt={alt} width={220} height={165} className="absolute inset-0 h-full w-full object-contain" />
        </div>
      </div>

      <div className={cn(reverse && 'md:order-1')}>
        <p
          className="text-xl font-extrabold leading-snug sm:text-2xl"
          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
        >
          {lead}
        </p>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground sm:text-base">
          {children}
        </p>
      </div>
    </motion.div>
  );
}

function GhostCard({ color, image, alt, numeral, kicker, children }: GhostCardProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [hovered, setHovered] = useState(false);

  const handleMouseMove = (event: ReactMouseEvent<HTMLDivElement>) => {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    setPos({ x: event.clientX - rect.left, y: event.clientY - rect.top });
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="relative mb-4 overflow-hidden border-t-2 p-6 sm:p-8"
      style={{ borderColor: color, backgroundColor: `${color}0a` }}
    >
      {/* Blask podążający za kursorem */}
      <motion.div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(280px circle at ${pos.x}px ${pos.y}px, ${color}1f, transparent 70%)`,
        }}
        animate={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
      />

      {/* Widmowy numeral w tle, za tekstem — nie za zdjęciem, żeby oba były w pełni widoczne */}
      <span
        aria-hidden
        className="pointer-events-none absolute -left-4 -top-10 select-none font-mono text-[9rem] font-black leading-none sm:-left-6 sm:-top-14 sm:text-[12rem]"
        style={{ color: `${color}17`, WebkitTextStroke: `1.5px ${color}45` }}
      >
        {numeral}
      </span>

      <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center">
        <div className="flex-1">
          <p
            className="mb-2 text-xs font-bold uppercase tracking-[0.15em]"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            {kicker}
          </p>
          <p className="max-w-md text-sm leading-relaxed sm:text-base">{children}</p>
        </div>

        {/* Zdjęcie jako duża "polaroidowa" karta */}
        <motion.div
          initial={{ opacity: 0, scale: 0.85, rotate: 10 }}
          whileInView={{ opacity: 1, scale: 1, rotate: 3 }}
          viewport={{ once: true, margin: '-80px' }}
          transition={{ duration: 0.5, delay: 0.15, ease: 'easeOut' }}
          className="relative mx-auto aspect-square w-40 shrink-0 overflow-hidden border-4 border-white bg-white shadow-lg sm:mx-0 sm:w-48 dark:border-zinc-800"
        >
          <Image
            src={image}
            alt={alt}
            width={192}
            height={192}
            className="absolute inset-0 h-full w-full object-cover"
          />
        </motion.div>
      </div>
    </motion.div>
  );
}
