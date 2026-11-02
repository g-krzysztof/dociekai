'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSpinner } from '../../solid-spinner';
import {
  DIM_LABEL,
  FACE_LABEL,
  faceArea,
  faceGroupOf,
  netFaceGroups,
  netTotalArea,
  type BoxFaceId,
} from '../../../lib/box-net';
import type { BoxSpec } from '../../../lib/solids';

const SPEC: BoxSpec = { width: 5, depth: 3, height: 4 };
const UNIT = 'cm';
const FACES: BoxFaceId[] = ['przod', 'tyl', 'gora', 'dol', 'lewo', 'prawo'];

const isFace = (id: string): id is BoxFaceId => (FACES as string[]).includes(id);

/**
 * Nowe pojęcie: **pole powierzchni powstaje ściana po ścianie.** Dziecko obraca
 * pudełko i „maluje" kolejne ściany klikiem — każda dokłada swoje pole do sumy,
 * a obok od razu widać, z których dwóch wymiarów to pole wyszło. Sześciu ścian
 * nie da się zaznaczyć bez obrócenia bryły, więc „ścian jest sześć, trzy są po
 * drugiej stronie" nie jest tu zdaniem do zapamiętania, tylko warunkiem
 * ukończenia (ten sam mechanizm co `PartTally` w lekcji 1, tylko z polem
 * zamiast licznika sztuk).
 *
 * Kiedy pomalowana jest druga ściana z pary, panel podpisuje ją jako bliźniaczą
 * — stąd bierze się skrót `2 · (a·b + a·c + b·c)`, który domyka krok.
 *
 * Wszystkie pola liczy `faceArea`/`netFaceGroups` z `lib/box-net.ts` (pole
 * powierzchni to po prostu pole siatki z poprzedniej lekcji), więc rysunek,
 * podpisy i suma nie mogą się rozjechać.
 */
export function PaintTheBox({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [painted, setPainted] = useState<BoxFaceId[]>([]);
  const done = painted.length === FACES.length;
  const containerRef = useSectionScrollAnchor(done ? 'done' : String(painted.length));
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const total = painted.reduce((sum, face) => sum + faceArea(SPEC, face), 0);
  const groups = netFaceGroups(SPEC);

  const paint = (id: string) => {
    if (!isFace(id) || painted.includes(id)) return;
    const next = [...painted, id];
    setPainted(next);
    if (next.length === FACES.length) onComplete?.();
  };

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
        Pudełko ma {SPEC.width} {UNIT} długości, {SPEC.depth} {UNIT} szerokości i {SPEC.height}{' '}
        {UNIT} wysokości. Obróć je i pomaluj wszystkie ściany — klikaj tylko te, które widzisz.
      </p>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,320px)_1fr]">
        <SolidSpinner
          spec={SPEC}
          color={color}
          showHidden={false}
          picking={{ part: 'sciany', marked: painted, onPick: paint }}
          ariaLabel="Prostopadłościan do obracania — kliknij kolejne ściany, żeby je pomalować"
        />

        <div>
          <p className="font-mono text-4xl font-black leading-none tabular-nums" style={{ color }}>
            {total}
            <span className="text-xl text-muted-foreground"> {UNIT}²</span>
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            pomalowane{' '}
            <span className="font-mono font-bold tabular-nums" style={{ color: textColor }}>
              {painted.length}
            </span>{' '}
            z {FACES.length} ścian
          </p>

          <ol className="mt-4 space-y-2">
            <AnimatePresence initial={false}>
              {painted.map((face) => {
                const group = faceGroupOf(SPEC, face);
                if (!group) return null;
                const twinPainted =
                  painted.filter((item) => faceGroupOf(SPEC, item)?.pair === group.pair).length > 1;
                return (
                  <motion.li
                    key={face}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="border-l-2 py-1 pl-3 text-sm leading-relaxed"
                    style={{ borderColor: `${color}59` }}
                  >
                    <span className="font-semibold">{FACE_LABEL[face]}</span>:{' '}
                    <span className="font-mono tabular-nums" style={{ color: textColor }}>
                      {group.sides[0]} · {group.sides[1]} = {group.area} {UNIT}²
                    </span>
                    <span className="block text-xs text-muted-foreground">
                      {DIM_LABEL[group.dims[0]]} × {DIM_LABEL[group.dims[1]]}
                      {twinPainted ? ' — druga z pary, identyczna jak poprzednia' : ''}
                    </span>
                  </motion.li>
                );
              })}
            </AnimatePresence>
            {painted.length === 0 && (
              <li className="text-sm text-muted-foreground">
                Jeszcze nic nie pomalowane. Kliknij dowolną widoczną ścianę.
              </li>
            )}
          </ol>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-5 border-t-2 p-4"
          style={{ borderColor: color, backgroundColor: `${color}0f` }}
        >
          <p className="mb-2 flex items-center gap-2 font-bold" style={{ color: textColor }}>
            <Check className="h-4 w-4 shrink-0" aria-hidden />
            Cała powierzchnia pomalowana
          </p>
          <p className="mb-3 text-sm leading-relaxed">
            Sześć ścian, ale tylko <strong>trzy różne prostokąty</strong> — każdy wystąpił dwa razy.
            Dlatego nie trzeba liczyć sześciu pól, wystarczą trzy i podwojenie:
          </p>
          <p className="text-center font-mono text-lg font-bold tabular-nums sm:text-xl" style={{ color }}>
            2 · ({groups.map((g) => `${g.sides[0]} · ${g.sides[1]}`).join(' + ')}) ={' '}
            {netTotalArea(SPEC)} {UNIT}²
          </p>
          <p className="mt-3 text-center text-sm text-muted-foreground">
            To jest dokładnie pole siatki tego pudełka — powierzchnia bryły rozłożona na płasko.
          </p>
        </motion.div>
      )}

      <ul className="sr-only">
        {groups.map((group) => (
          <li key={group.pair}>
            {group.label}: {group.sides[0]} · {group.sides[1]} = {group.area} {UNIT}², dwa razy ={' '}
            {2 * group.area} {UNIT}².
          </li>
        ))}
        <li>
          Razem pole powierzchni pudełka {SPEC.width} × {SPEC.depth} × {SPEC.height} {UNIT} wynosi{' '}
          {netTotalArea(SPEC)} {UNIT}².
        </li>
      </ul>
    </div>
  );
}
