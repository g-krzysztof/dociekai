'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import {
  baseArea,
  boxVolume,
  formatNumber,
  missingDimension,
  toLitres,
  waterVolume,
} from '../../../lib/box-volume';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';

interface Example {
  id: string;
  spec: BoxSpec;
  /** Który wymiar jest szukany — jego podpis odsłania się dopiero po ostatnim kroku. */
  hiddenLabel: 'wysokosc' | null;
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

/** Wszystkie liczby liczą funkcje z `lib/box-volume.ts` z tej samej bryły, którą pokazuje rysunek. */
function buildExamples(): Example[] {
  const karton: BoxSpec = { width: 6, depth: 4, height: 3 };
  const paczka: BoxSpec = { width: 5, depth: 4, height: 3 };
  const paczkaVolume = boxVolume(paczka);
  const akwarium: BoxSpec = { width: 30, depth: 20, height: 25 };
  const poziom = 20;
  const woda = waterVolume(akwarium, poziom);

  return [
    {
      id: 'z-wymiarow',
      spec: karton,
      hiddenLabel: null,
      story: `Karton ma ${karton.width} ${UNIT} długości, ${karton.depth} ${UNIT} szerokości i ${karton.height} ${UNIT} wysokości. Jaka jest jego objętość?`,
      steps: [
        `Zaczynamy od dna. Mieści ono ${karton.width} · ${karton.depth} = ${baseArea(karton)} kostek o boku 1 ${UNIT}, czyli pole podstawy to ${baseArea(karton)} ${UNIT}².`,
        `Wysokość to ${karton.height} ${UNIT}, więc takich warstw ułożymy ${karton.height}.`,
        `${baseArea(karton)} · ${karton.height} = ${boxVolume(karton)}. Jednostka jest sześcienna, bo mnożyliśmy trzy długości.`,
      ],
      answer: `${boxVolume(karton)} ${UNIT}³`,
      moral:
        'Zawsze tą samą drogą: najpierw jedna warstwa (pole podstawy), potem tyle warstw, ile wynosi wysokość.',
    },
    {
      id: 'brakujacy-wymiar',
      spec: paczka,
      hiddenLabel: 'wysokosc',
      story: `Paczka ma objętość ${paczkaVolume} ${UNIT}³, a jej dno to ${paczka.width} ${UNIT} na ${paczka.depth} ${UNIT}. Jaka jest jej wysokość?`,
      steps: [
        `Znów zaczynamy od dna: ${paczka.width} · ${paczka.depth} = ${baseArea(paczka)}. Tyle kostek mieści jedna warstwa.`,
        `Cała paczka mieści ${paczkaVolume} kostek. Pytamy więc: ile razy ${baseArea(paczka)} mieści się w ${paczkaVolume}?`,
        `${paczkaVolume} : ${baseArea(paczka)} = ${missingDimension(paczkaVolume, paczka.width, paczka.depth)}. Tyle jest warstw, czyli tyle centymetrów wysokości.`,
      ],
      answer: `${missingDimension(paczkaVolume, paczka.width, paczka.depth)} ${UNIT}`,
      moral:
        'Gdy szukany jest wymiar, a nie objętość, mnożenie zamienia się w dzielenie: c = V : (a · b).',
    },
    {
      id: 'akwarium-litry',
      spec: akwarium,
      hiddenLabel: null,
      story: `Akwarium ma dno ${akwarium.width} ${UNIT} na ${akwarium.depth} ${UNIT} i ${akwarium.height} ${UNIT} wysokości. Nalano wody do wysokości ${poziom} ${UNIT}. Ile to litrów?`,
      steps: [
        `Woda też jest prostopadłościanem — ma to samo dno co akwarium, tylko niższą wysokość. Dno: ${akwarium.width} · ${akwarium.depth} = ${baseArea(akwarium)} ${UNIT}².`,
        `Wysokość liczymy do lustra wody, nie do brzegu: ${baseArea(akwarium)} · ${poziom} = ${formatNumber(woda)} ${UNIT}³.`,
        `Zostaje zamiana na litry. 1000 ${UNIT}³ to 1 litr, więc ${formatNumber(woda)} : 1000 = ${formatNumber(toLitres(woda))}.`,
      ],
      answer: `${formatNumber(toLitres(woda))} litrów wody`,
      moral:
        'Woda w naczyniu ma podstawę naczynia i wysokość równą poziomowi wody. Wysokość ścianek nic tu nie zmienia.',
    },
  ];
}

const EXAMPLES = buildExamples();

/**
 * Przykłady: trzy rozwiązania odsłaniane krok po kroku. Pierwsze liczy objętość
 * wprost z wymiarów, drugie idzie w drugą stronę (znam objętość, szukam
 * wymiaru — mnożenie zamienia się w dzielenie), trzecie domyka lekcję zamianą
 * na litry i pokazuje najczęstszy błąd: liczenie wody do brzegu naczynia
 * zamiast do jej lustra.
 *
 * Szukany wymiar jest ukryty na rysunku aż do ostatniego kroku — inaczej
 * przykład zdradzałby wynik, zanim ktokolwiek zacznie liczyć (ta sama zasada
 * co `reveal` w `NetDimensionSteps`).
 */
export function VolumeSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[Math.min(index, EXAMPLES.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);
  const complete = step === example.steps.length;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const showHidden = complete || example.hiddenLabel === null;

  const goNext = () => {
    setStep(0);
    if (index + 1 < EXAMPLES.length) {
      setIndex(index + 1);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  if (finished) {
    return (
      <div
        ref={containerRef}
        className="border-t-2 p-5 sm:p-6"
        style={{ borderColor: color, backgroundColor: `${color}0f` }}
      >
        <p className="mb-2 flex items-center gap-2 text-lg font-bold" style={{ color: textColor }}>
          <Check className="h-5 w-5 shrink-0" aria-hidden />
          Trzy przykłady rozwiązane
        </p>
        <p className="text-base leading-relaxed">
          Objętość z wymiarów, wymiar z objętości i woda w naczyniu przeliczona na litry. Teraz to
          samo samodzielnie.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Przykład{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {EXAMPLES.length}
        </p>
        <p className="text-sm text-muted-foreground">
          Krok {Math.min(step + 1, example.steps.length)} z {example.steps.length}
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,240px)_1fr]">
        <SolidSketch
          spec={example.spec}
          color={color}
          labels={[
            `${example.spec.width} ${UNIT}`,
            `${example.spec.depth} ${UNIT}`,
            showHidden ? `${example.spec.height} ${UNIT}` : '?',
          ]}
          className="mx-auto h-auto w-full max-w-[240px]"
          ariaLabel={`Prostopadłościan ${example.spec.width} na ${example.spec.depth} na ${showHidden ? example.spec.height : 'nieznanej wysokości'}`}
        />

        <div>
          <p className="mb-4 text-base leading-relaxed sm:text-lg">{example.story}</p>

          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {example.steps.slice(0, step).map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-start gap-3 border-l-2 py-1 pl-3 text-sm leading-relaxed"
                  style={{ borderColor: `${color}59` }}
                >
                  <span
                    className="font-mono text-base font-bold leading-tight tabular-nums"
                    style={{ color }}
                  >
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          {!complete && (
            <Button
              onClick={() => setStep(step + 1)}
              className="mt-4"
              style={{ backgroundColor: color }}
            >
              {step === 0 ? 'Pokaż pierwszy krok' : 'Następny krok'}
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          )}

          {complete && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
              <p
                className="border-t-2 px-4 py-3 font-mono text-lg font-bold tabular-nums"
                style={{ borderColor: color, color, backgroundColor: `${color}0f` }}
              >
                {example.answer}
              </p>
              <p className="mt-3 text-sm leading-relaxed" style={{ color: textColor }}>
                {example.moral}
              </p>
              <Button onClick={goNext} variant="outline" className="mt-3">
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Gotowe'}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </motion.div>
          )}
        </div>
      </div>

      <ul className="sr-only">
        {EXAMPLES.map((item) => (
          <li key={item.id}>
            {item.story} {item.steps.join(' ')} Odpowiedź: {item.answer}. {item.moral}
          </li>
        ))}
      </ul>
    </div>
  );
}
