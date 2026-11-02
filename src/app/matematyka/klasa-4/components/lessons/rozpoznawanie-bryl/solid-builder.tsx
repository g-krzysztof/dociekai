'use client';

import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { SolidSpinner } from '../../solid-spinner';
import {
  basePolygonName,
  countPolyhedron,
  prismPolyhedron,
  pyramidPolyhedron,
  solidName,
} from '../../../lib/solids';

type Kind = 'graniastoslup' | 'ostroslup';

const MIN_SIDES = 3;
const MAX_SIDES = 8;
/** Proporcje modelu — jedne dla obu rodzin, żeby porównanie było uczciwe. */
const RADIUS = 2.2;
const HEIGHT = 3.4;

/** Ile różnych podstaw trzeba obejrzeć, zanim reguła przestaje być zgadywaniem. */
const REVEAL_AFTER = 3;

interface RowProps {
  label: string;
  value: number;
  formula: string;
  color: string;
  showFormula: boolean;
}

function CountRow({ label, value, formula, color, showFormula }: RowProps) {
  return (
    <li className="flex items-baseline gap-3 border-l-4 py-1.5 pl-3" style={{ borderColor: `${color}59` }}>
      <span className="w-10 shrink-0 font-mono text-2xl font-black tabular-nums" style={{ color }}>
        {value}
      </span>
      <span className="text-sm leading-relaxed">
        {label}
        <AnimatePresence>
          {showFormula && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-2 font-mono font-bold"
              style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
            >
              = {formula}
            </motion.span>
          )}
        </AnimatePresence>
      </span>
    </li>
  );
}

/**
 * Nowe pojęcie: bryła bierze nazwę od podstawy — a razem z podstawą zmienia się
 * wszystko inne. Suwak przebudowuje bryłę (3–8 boków podstawy), przełącznik
 * zamienia graniastosłup w ostrosłup, a trzy liczniki jadą razem z modelem.
 * Po obejrzeniu kilku podstaw obok liczb pojawiają się wzory `n + 2`, `3n`,
 * `2n` — reguła jest **wynikiem oglądania**, nie zdaniem do zapamiętania.
 *
 * Liczniki liczy `countPolyhedron` z realnej bryły, nie osobny wzór wpisany
 * obok rysunku — nie ma więc miejsca, w którym rysunek i liczby mogłyby się
 * rozjechać.
 */
export function SolidBuilder({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [sides, setSides] = useState(3);
  const [kind, setKind] = useState<Kind>('graniastoslup');
  const [seen, setSeen] = useState<string[]>(['graniastoslup-3']);

  const solid = useMemo(
    () =>
      kind === 'graniastoslup'
        ? prismPolyhedron(sides, RADIUS, HEIGHT)
        : pyramidPolyhedron(sides, RADIUS, HEIGHT),
    [kind, sides]
  );
  const counts = countPolyhedron(solid);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const showFormula = seen.length >= REVEAL_AFTER;
  const bothKinds = seen.some((k) => k.startsWith('graniastoslup')) && seen.some((k) => k.startsWith('ostroslup'));
  const done = showFormula && bothKinds;

  /** Stan czytany z domknięcia, `onComplete` osobnym wyrażeniem po setterze. */
  const visit = (nextKind: Kind, nextSides: number) => {
    setKind(nextKind);
    setSides(nextSides);
    const key = `${nextKind}-${nextSides}`;
    if (seen.includes(key)) return;
    const next = [...seen, key];
    setSeen(next);
    const enough =
      next.length >= REVEAL_AFTER &&
      next.some((k) => k.startsWith('graniastoslup')) &&
      next.some((k) => k.startsWith('ostroslup'));
    if (enough) onComplete?.();
  };

  const formulas =
    kind === 'graniastoslup'
      ? { sciany: 'n + 2', krawedzie: '3n', wierzcholki: '2n' }
      : { sciany: 'n + 1', krawedzie: '2n', wierzcholki: 'n + 1' };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="grid items-center gap-6 md:grid-cols-[300px_1fr]">
        <SolidSpinner
          polyhedron={solid}
          color={color}
          ariaLabel={`${solidName(kind, sides)} — bryła do obracania`}
        />

        <div>
          <div className="mb-4 flex gap-2">
            {(['graniastoslup', 'ostroslup'] as Kind[]).map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => visit(item, sides)}
                aria-pressed={kind === item}
                className={cn(
                  'flex-1 cursor-pointer border px-3 py-2 text-sm font-semibold transition-all',
                  kind !== item && 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={
                  kind === item
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : { borderColor: `${color}40`, color: textColor }
                }
              >
                {item === 'graniastoslup' ? 'Graniastosłup' : 'Ostrosłup'}
              </button>
            ))}
          </div>

          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted-foreground">
            Podstawa: {basePolygonName(sides)} ({sides} boki)
          </p>
          <div className="mb-4 flex flex-wrap gap-1.5" role="group" aria-label="Liczba boków podstawy">
            {Array.from({ length: MAX_SIDES - MIN_SIDES + 1 }, (_, i) => MIN_SIDES + i).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => visit(kind, n)}
                aria-pressed={sides === n}
                aria-label={`Podstawa: ${basePolygonName(n)}`}
                className="h-9 w-9 cursor-pointer border font-mono text-sm font-bold tabular-nums transition-all hover:-translate-y-0.5"
                style={
                  sides === n
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : { borderColor: `${color}40`, color: textColor }
                }
              >
                {n}
              </button>
            ))}
          </div>

          <p className="mb-3 text-xl font-bold sm:text-2xl" style={{ color: textColor }}>
            {solidName(kind, sides)}
          </p>

          <ul className="space-y-1.5">
            <CountRow
              label="ścian"
              value={counts.sciany}
              formula={formulas.sciany}
              color={color}
              showFormula={showFormula}
            />
            <CountRow
              label="krawędzi"
              value={counts.krawedzie}
              formula={formulas.krawedzie}
              color={color}
              showFormula={showFormula}
            />
            <CountRow
              label="wierzchołków"
              value={counts.wierzcholki}
              formula={formulas.wierzcholki}
              color={color}
              showFormula={showFormula}
            />
          </ul>

          {!showFormula && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Zmień podstawę i popatrz, co robią te trzy liczby. Po kilku próbach pokażą się wzory.
            </p>
          )}

          {showFormula && !bothKinds && (
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Wzory są, ale tylko dla jednej rodziny. Przełącz na drugą i sprawdź, czy tam wychodzi
              to samo.
            </p>
          )}

          {done && (
            <motion.p
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 flex items-start gap-2 border-l-4 py-2 pl-4 text-sm leading-relaxed"
              style={{ borderColor: color, backgroundColor: `${color}0c` }}
            >
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>
                Nie musisz pamiętać liczb dla każdej bryły z osobna — wystarczy{' '}
                <strong style={{ color: textColor }}>n</strong>, czyli liczba boków podstawy. Reszta
                wynika z niej sama, a nazwa bryły też pochodzi od tej podstawy.
              </span>
            </motion.p>
          )}
        </div>
      </div>
    </div>
  );
}
