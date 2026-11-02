'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import {
  basePolygonName,
  countPolyhedron,
  prismPolyhedron,
  pyramidPolyhedron,
  solidName,
  type Polyhedron,
} from '../../../lib/solids';

const OLOWEK = prismPolyhedron(6, 2, 3.6);
const PIRAMIDA = pyramidPolyhedron(4, 2.4, 3.4);
const ZAGADKA = prismPolyhedron(6, 2, 3.6);

const OLOWEK_C = countPolyhedron(OLOWEK);
const PIRAMIDA_C = countPolyhedron(PIRAMIDA);
const ZAGADKA_C = countPolyhedron(ZAGADKA);

interface Example {
  id: string;
  solid: Polyhedron;
  story: string;
  steps: string[];
  answer: string;
  moral: string;
}

const EXAMPLES: Example[] = [
  {
    id: 'olowek',
    solid: OLOWEK,
    story:
      'Ołówek ma przekrój sześciokąta. Jak nazywa się ta bryła i ile ma ścian, krawędzi i wierzchołków?',
    steps: [
      `Szukamy podstawy. Ołówek ma dwie identyczne podstawy naprzeciw siebie, więc to graniastosłup, a jego podstawa to ${basePolygonName(6)} — czyli n = 6.`,
      `Nazwa idzie od podstawy: ${solidName('graniastoslup', 6)}.`,
      `Podstawiamy do wzorów graniastosłupa: ścian n + 2 = 6 + 2 = ${OLOWEK_C.sciany}, krawędzi 3n = 3 · 6 = ${OLOWEK_C.krawedzie}, wierzchołków 2n = 2 · 6 = ${OLOWEK_C.wierzcholki}.`,
    ],
    answer: `${solidName('graniastoslup', 6)}: ${OLOWEK_C.sciany} ścian · ${OLOWEK_C.krawedzie} krawędzi · ${OLOWEK_C.wierzcholki} wierzchołków`,
    moral: 'Nie trzeba liczyć krawędzi po jednej — wystarczy zobaczyć, ile boków ma podstawa.',
  },
  {
    id: 'piramida',
    solid: PIRAMIDA,
    story: 'Piramida w Gizie ma kwadratową podstawę. Co to za bryła i ile ma czego?',
    steps: [
      `Ściany boczne schodzą się w jednym wierzchołku na górze, więc to ostrosłup. Podstawa jest kwadratem, czyli ${basePolygonName(4)}em — n = 4.`,
      `Nazwa: ${solidName('ostroslup', 4)}.`,
      `Wzory ostrosłupa są inne niż graniastosłupa: ścian n + 1 = ${PIRAMIDA_C.sciany}, krawędzi 2n = ${PIRAMIDA_C.krawedzie}, wierzchołków n + 1 = ${PIRAMIDA_C.wierzcholki} (cztery na dole i jeden na szczycie).`,
    ],
    answer: `${solidName('ostroslup', 4)}: ${PIRAMIDA_C.sciany} ścian · ${PIRAMIDA_C.krawedzie} krawędzi · ${PIRAMIDA_C.wierzcholki} wierzchołków`,
    moral:
      'Ostrosłup ma jedną podstawę i jeden szczyt — dlatego wierzchołków ma o jeden więcej niż boków podstawy.',
  },
  {
    id: 'zagadka',
    solid: ZAGADKA,
    story:
      'Bryła ma same płaskie ściany, dwie identyczne podstawy i 12 wierzchołków. Co to za bryła?',
    steps: [
      'Dwie identyczne podstawy naprzeciw siebie to znak rozpoznawczy graniastosłupa — więc rodzina jest już znana.',
      `Dla graniastosłupa wierzchołków jest 2n. Skoro 2n = ${ZAGADKA_C.wierzcholki}, to n = ${ZAGADKA_C.wierzcholki / 2} — podstawa ma ${ZAGADKA_C.wierzcholki / 2} boków.`,
      `To ${solidName('graniastoslup', 6)}. Sprawdzenie: ścian n + 2 = ${ZAGADKA_C.sciany}, krawędzi 3n = ${ZAGADKA_C.krawedzie}.`,
    ],
    answer: solidName('graniastoslup', 6),
    moral:
      'Wzory działają w obie strony: z podstawy liczysz wierzchołki, a z wierzchołków odczytujesz podstawę.',
  },
];

/**
 * Przykłady: trzy rozwiązania odsłaniane krok po kroku. Trzeci idzie od końca —
 * z liczby wierzchołków trzeba odtworzyć podstawę, bo dopiero tam widać, że
 * `2n` jest regułą, a nie tabelką do zapamiętania. Wszystkie liczby liczy
 * `countPolyhedron` z tej samej bryły, którą pokazuje rysunek.
 */
export function SolidCountSteps({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [step, setStep] = useState(0);
  const [finished, setFinished] = useState(false);

  const example = EXAMPLES[Math.min(index, EXAMPLES.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${step}-${finished}`);
  const complete = step === example.steps.length;
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

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

      <div className="grid gap-5 md:grid-cols-[200px_1fr]">
        <SolidSketch
          polyhedron={example.solid}
          color={color}
          ariaLabel="Rysunek omawianej bryły"
        />

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
                {index + 1 < EXAMPLES.length ? 'Następny przykład' : 'Rozumiem nazwy brył'}
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
    </div>
  );
}
