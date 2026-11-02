'use client';

import { GraduationCap } from 'lucide-react';
import { motion } from 'framer-motion';
import { OrbitConnector } from './orbit-connector';

interface CourseSoonNodeProps {
  delay?: number;
  /** Nagłówek — domyślnie „Kolejne klasy w drodze”. */
  title?: string;
  /** Akapit pod nagłówkiem; katalog przedmiotu podaje własny, gdy domyślny nie pasuje. */
  text?: string;
}

/** Ostatni, "widmowy" węzeł ścieżki kursów — sygnalizuje kolejne klasy w budowie, bez udawania że już istnieją. */
export function CourseSoonNode({
  delay = 0,
  title = 'Kolejne klasy w drodze',
  text = 'Pracujemy nad kursami dla kolejnych klas szkoły podstawowej. Wróć tu niebawem — a na razie zacznij od klasy 4.',
}: CourseSoonNodeProps) {
  return (
    <motion.div
      className="flex gap-4 sm:gap-6"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
    >
      <OrbitConnector hasTop hasBottom={false} color="#94a3b8">
        <div
          aria-hidden
          className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30 bg-muted/30 sm:h-20 sm:w-20 lg:h-28 lg:w-28"
        >
          <GraduationCap className="h-6 w-6 text-muted-foreground/50 sm:h-7 sm:w-7" />
        </div>
      </OrbitConnector>

      <div className="flex min-w-0 flex-1 items-center">
        <div className="rounded-2xl border border-dashed bg-muted/20 px-5 py-6 sm:px-7">
          <h3 className="text-lg font-bold text-muted-foreground sm:text-xl">{title}</h3>
          <p className="mt-1 max-w-md text-sm text-muted-foreground/70">{text}</p>
        </div>
      </div>
    </motion.div>
  );
}
