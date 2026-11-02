'use client';

import Link from 'next/link';
import { ArrowRight, Flag, PlayCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { NextStepModel } from '../lib/atlas-shape';

interface NextStepProps {
  step?: NextStepModel;
  ready: boolean;
  /** Konto bez ani jednego ruchu w kursie — wtedy to nie jest „następna" lekcja, tylko pierwsza. */
  fresh: boolean;
}

/**
 * Miejsce zarezerwowane dla bloku „co teraz”, żeby ani hydratacja, ani różnica
 * długości opisu nie przesuwała reszty arkusza.
 *
 * Na wąskim ekranie rezerwuje przezroczysta obwoluta (`OUTER`) — gdyby wysokość
 * trzymał sam kafelek, po krótszym opisie zostawałby w nim pas pustego tła.
 * Od `sm` w górę wysokość trzyma już kafelek (`INNER`): arkusze stoją wtedy
 * obok siebie i ich rejestry liczb mają się zaczynać na tej samej wysokości.
 */
const OUTER = 'min-h-[16rem] sm:min-h-0';
const INNER = 'sm:min-h-[12rem]';

/** Jedyny prawdziwy przycisk akcji na stronie: lekcja, która jest teraz do zrobienia. */
export function NextStep({ step, ready, fresh }: NextStepProps) {
  if (!ready) {
    return (
      <div className={OUTER} aria-hidden>
        <div className={`${INNER} h-full border-t-2 border-[var(--rule-faint)]`} />
      </div>
    );
  }

  if (!step) {
    return (
      <div className={`${OUTER} ${INNER} border-t-2 border-[var(--ink)] pt-5`}>
        <p className="flex items-center gap-2 text-lg font-extrabold tracking-[-0.02em]">
          <Flag className="h-5 w-5 shrink-0" aria-hidden />
          Cały opublikowany materiał masz zrobiony
        </p>
        <p className="mt-2 max-w-[65ch] text-sm leading-relaxed text-[var(--ink-soft)]">
          Kolejne działy dopisujemy do kursu na bieżąco. Do tego czasu możesz wrócić do dowolnej
          lekcji i powtórzyć ją bez utraty postępu.
        </p>
      </div>
    );
  }

  const { color, inProgress } = step;

  return (
    <div className={OUTER}>
      <div
        className={`${INNER} flex flex-col gap-5 border-t-2 px-4 pb-5 pt-5 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:px-5`}
        style={{
          borderTopColor: color,
          backgroundColor: `color-mix(in oklch, ${color} 6%, transparent)`,
        }}
      >
        <div className="flex min-w-0 items-start gap-4 sm:gap-5">
          <span
            className="profil-num shrink-0 text-4xl leading-none sm:text-5xl"
            style={{ color }}
            aria-hidden
          >
            {step.moduleNumber}
          </span>
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold leading-tight tracking-[-0.02em] sm:text-xl">
              {inProgress ? 'Wróć do: ' : fresh ? 'Zacznij tutaj: ' : 'Następna lekcja: '}
              <span className="font-extrabold">{step.short}</span>
            </h3>
            {/* Trzy wiersze to sufit i podłoga naraz: razem z rezerwacją wyżej
                kafelek ma tę samą wysokość niezależnie od długości celu lekcji. */}
            <p className="mt-1.5 line-clamp-3 max-w-[62ch] text-sm leading-relaxed text-[var(--ink-soft)]">
              {step.goal}
            </p>
            <p className="profil-micro mt-2.5">
              {step.moduleTitle} · {step.duration}
            </p>
          </div>
        </div>

        <Button asChild className="profil-btn-solid h-12 shrink-0 px-6 text-[15px] font-bold">
          <Link href={step.href}>
            {inProgress ? <ArrowRight className="h-4 w-4" /> : <PlayCircle className="h-4 w-4" />}
            {inProgress ? 'Kontynuuj' : 'Zacznij'}
          </Link>
        </Button>
      </div>
    </div>
  );
}
