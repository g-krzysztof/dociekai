'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Gift, Lock, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';

/**
 * Nagroda za ukończenie lekcji: prawdziwa, zweryfikowana ciekawostka powiązana
 * z tematem. Kształt danych wspólny dla obu kursów (`MathLesson.funFact`,
 * `InfoLesson.funFact`).
 */
export interface LessonFunFact {
  title: string;
  text: string;
  /** Podpis źródła pokazywany pod ciekawostką (wiarygodność, nie ozdobnik). */
  sourceLabel: string;
  sourceUrl?: string;
}

interface LessonRewardCardProps {
  funFact: LessonFunFact;
  color: string;
  /** 100% bloków/kroków lekcji — dopóki `false`, treść nie trafia do DOM. */
  unlocked: boolean;
  /** Zapowiedź nagrody przed jej otwarciem — inna dla każdego kursu. */
  teaser: string;
}

/**
 * Trzy stany: **zablokowana** (kłódka, bez treści w DOM), **odblokowana-nieotwarta**
 * (przycisk „Otwórz nagrodę”) i **otwarta**. Otwarcie żyje w stanie lokalnym i nie
 * jest utrwalane — powrót do ukończonej lekcji znów pokazuje zamknięty prezent.
 *
 * Wspólny dla kursów matematyki i informatyki (przeniesiony z
 * `matematyka/klasa-4/components/lesson-shell.tsx` przy drugim konsumencie).
 */
export function LessonRewardCard({ funFact, color, unlocked, teaser }: LessonRewardCardProps) {
  const [opened, setOpened] = useState(false);

  if (!unlocked) {
    return (
      <section className="scroll-mt-24">
        <div className="border border-dashed p-6 text-center sm:p-8">
          <Lock className="mx-auto mb-4 h-7 w-7 text-muted-foreground" aria-hidden />
          <h2 className="mb-1 text-lg font-bold text-muted-foreground">Nagroda: ciekawostka</h2>
          <p className="mx-auto max-w-md text-sm text-muted-foreground">
            Ukończ wszystkie kroki tej lekcji, żeby ją odblokować.
          </p>
        </div>
      </section>
    );
  }

  if (!opened) {
    return (
      <section className="scroll-mt-24">
        <div
          className="border-t-2 p-6 text-center sm:p-8"
          style={{ borderColor: color, backgroundColor: `${color}0c` }}
        >
          <Gift className="mx-auto mb-4 h-8 w-8" style={{ color }} aria-hidden />
          <h2 className="mb-2 text-lg font-bold">Nagroda odblokowana!</h2>
          <p className="mx-auto mb-5 max-w-md text-sm text-muted-foreground">{teaser}</p>
          <Button onClick={() => setOpened(true)} size="lg" style={{ backgroundColor: color }}>
            Otwórz nagrodę
          </Button>
        </div>
      </section>
    );
  }

  return (
    <motion.section
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="scroll-mt-24"
    >
      <div
        className="border-t-2 p-6 sm:p-8"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div className="mx-auto max-w-2xl text-center">
          <Sparkles className="mx-auto mb-4 h-7 w-7" style={{ color }} aria-hidden />
          <p
            className="mb-1 text-xs font-semibold uppercase tracking-wide"
            style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
          >
            Ciekawostka
          </p>
          <h2 className="mb-3 text-xl font-bold sm:text-2xl">{funFact.title}</h2>
          <p className="text-left text-base leading-relaxed text-muted-foreground">
            {funFact.text}
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            Źródło:{' '}
            {funFact.sourceUrl ? (
              <a
                href={funFact.sourceUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="underline underline-offset-2 hover:text-primary"
              >
                {funFact.sourceLabel}
              </a>
            ) : (
              funFact.sourceLabel
            )}
          </p>
        </div>
      </div>
    </motion.section>
  );
}
