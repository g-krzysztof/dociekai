'use client';

import { motion } from 'framer-motion';
import { FamilyTree } from '../../family-tree/family-tree';
import { AtrybutGlyph } from './atrybut';
import { OLIMP, type God } from './olimp';

const BY_ID: Record<string, God> = Object.fromEntries(OLIMP.map((g) => [g.id, g]));

/**
 * Blok 1 — **Rodzina z Olimpu**. Silnik `family-tree` (drugi konsument po L5)
 * bez lat urodzenia: bogowie sami mówią, czyimi są dziećmi albo małżonkami,
 * a dziecko sadza ich na trzech piętrach. Gdy miejsce boga potwierdzą
 * relacje (rodzice i małżonek też stoją, nikt się nie kłóci), do żetonu
 * dokleja się jego atrybut — dopiero zasłużony.
 */
export function OlimpWidget({ color, onDone }: { color: string; onDone: () => void }) {
  return (
    <FamilyTree
      color={color}
      people={OLIMP}
      trayLabel="Bogowie do posadzenia"
      hint={
        <>
          Każdy bóg mówi, czyim jest dzieckiem albo małżonkiem. Przeciągnij go na piętro (albo stuknij boga, a potem
          piętro): rodzice niżej, dzieci piętro wyżej, małżonkowie razem. Atrybut dostaje bóg, którego miejsce
          potwierdzi rodzina.
        </>
      }
      badge={(person, settled) => {
        const god = BY_ID[person.id];
        if (!god || !settled) return null;
        return (
          <motion.span
            initial={{ opacity: 0, y: -4, scale: 0.6 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            className="mt-0.5 flex items-center gap-1 text-[10px] leading-tight"
            style={{ color }}
          >
            <AtrybutGlyph id={god.attribute} className="h-3.5 w-3.5 shrink-0" />
            <span>{god.attributeLabel}</span>
          </motion.span>
        );
      }}
      completeNote={
        <div className="space-y-2">
          <p>
            <strong>Olimp stoi.</strong> Trzy pokolenia bogów: na dole tytani, w środku Zeus z rodzeństwem, na górze
            dzieci Zeusa. Grecy wyobrażali sobie bogów jak wielką rodzinę — kłócili się, zazdrościli i godzili, tylko
            nie umierali.
          </p>
          <ul className="grid gap-1 text-xs sm:grid-cols-2">
            {OLIMP.map((g) => (
              <li key={g.id} className="flex items-center gap-1.5">
                <AtrybutGlyph id={g.attribute} className="h-3.5 w-3.5 shrink-0" />
                <span>
                  <strong>{g.name}</strong> — {g.domain}
                </span>
              </li>
            ))}
          </ul>
        </div>
      }
      onComplete={onDone}
    />
  );
}
