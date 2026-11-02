'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import { NetView } from './net-view';
import { buildBoxNet, netFaceGroups, netTotalArea, type NetPatternId } from '../../../lib/box-net';
import type { BoxSpec } from '../../../lib/solids';

const UNIT = 'cm';

interface Example {
  id: string;
  spec: BoxSpec;
  pattern: NetPatternId;
  /** Który rysunek niesie odpowiedź — jego podpisy odsłaniają się dopiero po ostatnim kroku. */
  reveal: 'siatka' | 'bryla' | 'oba-dane';
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

/** Wszystkie liczby liczy `netFaceGroups`/`netTotalArea` z tej samej bryły, którą pokazuje rysunek. */
function buildExamples(): Example[] {
  const pudelko: BoxSpec = { width: 8, depth: 5, height: 3 };
  const [dnoA, przodA, bokA] = netFaceGroups(pudelko);

  const kostka: BoxSpec = { width: 6, depth: 4, height: 2 };
  const [dnoB, przodB, bokB] = netFaceGroups(kostka);

  const karton: BoxSpec = { width: 10, depth: 6, height: 4 };
  const [dnoC, przodC, bokC] = netFaceGroups(karton);

  return [
    {
      id: 'z-bryly-na-siatke',
      spec: pudelko,
      pattern: 'krzyz',
      reveal: 'siatka',
      story: `Pudełko ma ${pudelko.width} ${UNIT} długości, ${pudelko.depth} ${UNIT} szerokości i ${pudelko.height} ${UNIT} wysokości. Jakie wymiary mają prostokąty jego siatki?`,
      steps: [
        `Dno leży na stole, więc jego boki to długość i szerokość: ${dnoA.sides[0]} ${UNIT} × ${dnoA.sides[1]} ${UNIT}. Wieko jest jego kopią.`,
        `Przednia ściana stoi wzdłuż długości i sięga na wysokość: ${przodA.sides[0]} ${UNIT} × ${przodA.sides[1]} ${UNIT}. Tylna ściana jest taka sama.`,
        `Zostały boki: szerokość razy wysokość, czyli ${bokA.sides[0]} ${UNIT} × ${bokA.sides[1]} ${UNIT} — też dwa identyczne prostokąty.`,
      ],
      answer: `${dnoA.sides[0]} × ${dnoA.sides[1]} · ${przodA.sides[0]} × ${przodA.sides[1]} · ${bokA.sides[0]} × ${bokA.sides[1]} (każdy po dwa razy)`,
      moral:
        'Trzy wymiary bryły łączą się w pary na trzy sposoby — i to są dokładnie trzy pary prostokątów siatki.',
    },
    {
      id: 'z-siatki-na-bryle',
      spec: kostka,
      pattern: 'pas',
      reveal: 'bryla',
      story: `Na siatce widać prostokąty ${dnoB.sides[0]} × ${dnoB.sides[1]}, ${przodB.sides[0]} × ${przodB.sides[1]} i ${bokB.sides[0]} × ${bokB.sides[1]} (${UNIT}). Jakie wymiary ma pudełko?`,
      steps: [
        `Wypisujemy wszystkie liczby, które pojawiają się na bokach: ${kostka.width}, ${kostka.depth} i ${kostka.height}. Trzy różne liczby — to kandydaci na trzy wymiary bryły.`,
        `Sprawdzamy, czy każda para pasuje do jakiegoś prostokąta: ${dnoB.sides[0]} × ${dnoB.sides[1]} to dno, ${przodB.sides[0]} × ${przodB.sides[1]} to przód, ${bokB.sides[0]} × ${bokB.sides[1]} to bok. Zgadza się — każda para wystąpiła.`,
        `Każdy z tych prostokątów jest w siatce dwa razy: ${2 * 3} prostokątów razem, czyli 6 ścian.`,
      ],
      answer: `pudełko ${kostka.width} ${UNIT} × ${kostka.depth} ${UNIT} × ${kostka.height} ${UNIT}`,
      moral:
        'Siatkę czyta się w obie strony: z wymiarów bryły wyliczysz prostokąty, a z prostokątów odtworzysz bryłę.',
    },
    {
      id: 'ile-kartonu',
      spec: karton,
      pattern: 'schodki',
      reveal: 'oba-dane',
      story: `Karton ma wymiary ${karton.width} ${UNIT} × ${karton.depth} ${UNIT} × ${karton.height} ${UNIT}. Ile kartonu zużyto na jego ścianki?`,
      steps: [
        `Siatka to cała powierzchnia bryły rozłożona na płasko — wystarczy więc policzyć pola sześciu prostokątów.`,
        `Dno i wieko: ${dnoC.sides[0]} · ${dnoC.sides[1]} = ${dnoC.area}, razy dwa = ${2 * dnoC.area}. Przód i tył: ${przodC.sides[0]} · ${przodC.sides[1]} = ${przodC.area}, razy dwa = ${2 * przodC.area}.`,
        `Boki: ${bokC.sides[0]} · ${bokC.sides[1]} = ${bokC.area}, razy dwa = ${2 * bokC.area}. Sumujemy: ${2 * dnoC.area} + ${2 * przodC.area} + ${2 * bokC.area} = ${netTotalArea(karton)}.`,
      ],
      answer: `${netTotalArea(karton)} ${UNIT}² kartonu`,
      moral:
        'Pola liczy się na płaskiej siatce, a nie na bryle — dlatego siatka jest wygodniejsza od rysunku pudełka.',
    },
  ];
}

const EXAMPLES = buildExamples();

/**
 * Przykłady: trzy rozwiązania odsłaniane krok po kroku, każde na innym wzorze
 * siatki. Pierwsze idzie od bryły do siatki, drugie — odwrotnie, a trzecie
 * liczy, ile materiału zajmuje cała siatka. Liczby biorą się z `netFaceGroups`,
 * więc podpisy na rysunku i liczby w tekście nie mogą się rozjechać.
 */
export function NetDimensionSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[Math.min(index, EXAMPLES.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);
  const complete = step === example.steps.length;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  // Rysunek, który jest odpowiedzią, dostaje podpisy dopiero po ostatnim kroku —
  // inaczej przykład zdradzałby wynik, zanim ktokolwiek zacznie liczyć.
  const showSolidDims = complete || example.reveal !== 'bryla';
  const showNetDims = complete || example.reveal !== 'siatka';

  const goNext = () => {
    if (index + 1 < EXAMPLES.length) {
      setIndex(index + 1);
      setStep(0);
      return;
    }
    setFinished(true);
    onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide" style={{ color: textColor }}>
        Przykład {index + 1} z {EXAMPLES.length}
      </p>
      <p className="mb-4 text-sm leading-relaxed sm:text-base">{example.story}</p>

      <div className="grid gap-4 lg:grid-cols-[200px_1fr]">
        <div>
          <SolidSketch
            spec={example.spec}
            color={color}
            labels={
              showSolidDims
                ? [
                    `${example.spec.width} ${UNIT}`,
                    `${example.spec.depth} ${UNIT}`,
                    `${example.spec.height} ${UNIT}`,
                  ]
                : undefined
            }
            ariaLabel={`Prostopadłościan ${example.spec.width} na ${example.spec.depth} na ${example.spec.height} centymetrów`}
          />
        </div>

        <div>
          <ol className="space-y-2">
            <AnimatePresence initial={false}>
              {example.steps.slice(0, step).map((text, i) => (
                <motion.li
                  key={text}
                  initial={{ opacity: 0, y: -6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-3 border-l-2 py-1 pl-3 text-sm leading-relaxed"
                  style={{ borderColor: `${color}66` }}
                >
                  <span className="font-mono font-bold tabular-nums" style={{ color }}>
                    {i + 1}
                  </span>
                  <span>{text}</span>
                </motion.li>
              ))}
            </AnimatePresence>
          </ol>

          {complete && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-4 border p-3 font-mono text-base font-bold"
              style={{ color, backgroundColor: `${color}0f` }}
            >
              {example.answer}
            </motion.p>
          )}
          {complete && (
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{example.moral}</p>
          )}

          <div className="mt-4 flex flex-wrap gap-2">
            {!complete && (
              <Button size="sm" onClick={() => setStep(step + 1)} style={{ backgroundColor: color }}>
                {step === 0 ? 'Pokaż pierwszy krok' : 'Następny krok'}
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden />
              </Button>
            )}
            {complete && !finished && (
              <Button size="sm" onClick={goNext} style={{ backgroundColor: color }}>
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem wymiary siatki'}
              </Button>
            )}
            {finished && (
              <p className="flex items-center gap-2 text-sm font-medium" style={{ color }}>
                <Check className="h-4 w-4" aria-hidden /> Trzy przykłady za Tobą — teraz Twoja kolej.
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Siatka pod spodem, na pełnej szerokości — w wąskiej kolumnie podpisy
          wymiarów zjeżdżają do kilku pikseli i przestają być czytelne. */}
      <figure className="mt-5">
        <div className="mx-auto max-w-[520px] border" style={{ borderColor: `${color}33` }}>
          <NetView
            pieces={buildBoxNet(example.spec, example.pattern)}
            t={0}
            color={color}
            labels={showNetDims ? 'wymiary' : 'nazwy'}
            spec={example.spec}
            ariaLabel="Siatka tego pudełka z wymiarami wpisanymi w prostokąty"
          />
        </div>
        <figcaption className="mt-2 text-center text-xs text-muted-foreground">
          Siatka tego pudełka — wzór „{example.pattern === 'krzyz' ? 'krzyż' : example.pattern}”,
          wymiary w {UNIT}
        </figcaption>
      </figure>
    </div>
  );
}
