'use client';

import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Check, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { SolidSketch } from '../../solid-sketch';
import {
  FACE_LABEL,
  faceArea,
  netTotalArea,
  packsNeeded,
  surfaceWithout,
  type BoxFaceId,
} from '../../../lib/box-net';
import { plural, type PluralForms } from '../../../lib/plural';
import type { BoxSpec } from '../../../lib/solids';

const ALL_FACES: BoxFaceId[] = ['dol', 'gora', 'przod', 'tyl', 'lewo', 'prawo'];

interface Scenario {
  id: string;
  spec: BoxSpec;
  unit: string;
  /** Ściany, których w tym zadaniu NIE pokrywamy — stąd bierze się cała trudność. */
  skip: BoxFaceId[];
  story: string;
  /** Ile pokrywa jedno opakowanie materiału. */
  perPack: number;
  packForms: PluralForms;
  packLabel: string;
  moral: string;
}

const SCENARIOS: Scenario[] = [
  {
    id: 'skrzynia',
    spec: { width: 3, depth: 2, height: 1 },
    unit: 'm',
    skip: ['dol'],
    story:
      'Drewniana skrzynia stoi na ziemi i malujesz ją z zewnątrz. Dna nikt nie zobaczy i pędzel tam nie sięgnie.',
    perPack: 5,
    packForms: { one: 'puszka', few: 'puszki', many: 'puszek' },
    packLabel: 'puszka farby na 5 m²',
    moral:
      'Gdy jakiejś ściany nie pokrywasz, odejmij jej pole od pola powierzchni. Reszta rachunku nie zmienia się wcale.',
  },
  {
    id: 'prezent',
    spec: { width: 30, depth: 20, height: 10 },
    unit: 'cm',
    skip: [],
    story:
      'Prezent w pudełku owijasz papierem — w całości, ze wszystkich stron. Zapas na zakładki pomijamy.',
    perPack: 1000,
    packForms: { one: 'arkusz', few: 'arkusze', many: 'arkuszy' },
    packLabel: 'arkusz papieru o powierzchni 1000 cm²',
    moral:
      'Owinięcie w całości to pełne pole powierzchni — dokładnie pole siatki pudełka, bez żadnych odejmowań.',
  },
  {
    id: 'basen',
    spec: { width: 5, depth: 3, height: 2 },
    unit: 'm',
    skip: ['gora'],
    story:
      'Basen ogrodowy wykładasz płytkami od środka: cztery ścianki i dno. Góra jest otwarta — tam jest woda i niebo.',
    perPack: 2,
    packForms: { one: 'karton', few: 'kartony', many: 'kartonów' },
    packLabel: 'karton płytek na 2 m²',
    moral:
      'Tym razem odpadła góra, a nie dół — ale rachunek jest ten sam. Zawsze zaczynaj od pełnego pola powierzchni, a dopiero potem odejmuj to, czego nie pokrywasz.',
  },
];

function normalize(value: string): string {
  return value.trim().replace(',', '.');
}

/**
 * Zadanie problemowe: **pole powierzchni w robocie, nie w zadaniu z podręcznika.**
 * Trzy scenariusze różnią się jedną rzeczą — które ściany naprawdę trzeba pokryć:
 * skrzynia stoi na ziemi (odpada dno), prezent owija się w całości (nie odpada
 * nic), basen wykłada się od środka (odpada góra). Lista ścian obok rysunku
 * pokazuje to wprost ✓/✗, więc trudność nie polega na zgadywaniu warunków, tylko
 * na policzeniu.
 *
 * Każdy scenariusz ma dwa etapy: najpierw pole do pokrycia, potem liczba
 * opakowań materiału. Drugi etap jest tu po to, żeby wyszło **zaokrąglanie w
 * górę** — 3,2 puszki farby to w sklepie cztery puszki.
 *
 * Wszystkie klucze liczą `surfaceWithout`/`packsNeeded` z `lib/box-net.ts`,
 * a lista ścian bierze pola z `faceArea` — dane scenariusza to wyłącznie wymiary
 * i lista pominiętych ścian.
 */
export function PaintCans({ color, onComplete }: { color: string; onComplete?: () => void }) {
  const [index, setIndex] = useState(0);
  const [stage, setStage] = useState<'area' | 'packs' | 'done'>('area');
  const [value, setValue] = useState('');
  const [wrong, setWrong] = useState(false);
  const [finished, setFinished] = useState(false);

  const scenario = SCENARIOS[Math.min(index, SCENARIOS.length - 1)];
  const containerRef = useSectionScrollAnchor(`${index}-${stage}-${finished}`);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const area = surfaceWithout(scenario.spec, scenario.skip);
  const packs = packsNeeded(area, scenario.perPack);
  const expected = stage === 'area' ? area : packs;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (normalize(value) !== String(expected)) {
      setWrong(true);
      return;
    }
    setWrong(false);
    setValue('');
    setStage(stage === 'area' ? 'packs' : 'done');
  };

  const goNext = () => {
    setValue('');
    setWrong(false);
    setStage('area');
    if (index + 1 < SCENARIOS.length) {
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
          Trzy roboty policzone
        </p>
        <p className="text-base leading-relaxed">
          Za każdym razem ta sama droga: pełne pole powierzchni, minus ściany, których nie
          pokrywasz, a na końcu dzielenie z zaokrągleniem <strong>w górę</strong> — bo materiału
          nie kupuje się na kawałki.
        </p>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2">
        <p className="max-w-xl text-base leading-relaxed">{scenario.story}</p>
        <p className="shrink-0 text-sm text-muted-foreground">
          Robota{' '}
          <span className="font-mono font-bold tabular-nums" style={{ color }}>
            {index + 1}
          </span>{' '}
          z {SCENARIOS.length}
        </p>
      </div>

      <div className="grid items-start gap-6 md:grid-cols-[minmax(0,220px)_1fr]">
        <div>
          <SolidSketch
            spec={scenario.spec}
            color={color}
            labels={[
              `${scenario.spec.width} ${scenario.unit}`,
              `${scenario.spec.depth} ${scenario.unit}`,
              `${scenario.spec.height} ${scenario.unit}`,
            ]}
            className="mx-auto h-auto w-full max-w-[220px]"
            ariaLabel={`Prostopadłościan ${scenario.spec.width} na ${scenario.spec.depth} na ${scenario.spec.height} ${scenario.unit}`}
          />
          <p className="mt-2 text-center text-sm text-muted-foreground">{scenario.packLabel}</p>
        </div>

        <div>
          {/* Które ściany naprawdę pokrywamy — warunek zadania, nie zagadka */}
          <ul className="divide-y border text-sm">
            {ALL_FACES.map((face) => {
              const skipped = scenario.skip.includes(face);
              return (
                <li key={face} className="flex items-center gap-3 px-3 py-1.5">
                  {skipped ? (
                    <X className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
                  ) : (
                    <Check className="h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  )}
                  <span className={skipped ? 'flex-1 text-muted-foreground line-through' : 'flex-1'}>
                    {FACE_LABEL[face]}
                  </span>
                  <span className="font-mono tabular-nums text-muted-foreground">
                    {faceArea(scenario.spec, face)} {scenario.unit}²
                  </span>
                </li>
              );
            })}
          </ul>

          <form onSubmit={submit} className="mt-4">
            <label className="mb-2 block text-sm font-semibold" htmlFor="paint-answer">
              {stage === 'area'
                ? `Ile ${scenario.unit}² trzeba pokryć?`
                : `Ile opakowań kupić? (jedno na ${scenario.perPack} ${scenario.unit}²)`}
            </label>
            <div className="flex flex-wrap items-center gap-2">
              <Input
                id="paint-answer"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                inputMode="numeric"
                placeholder="wpisz liczbę"
                className="w-40 font-mono tabular-nums"
              />
              <span className="text-sm text-muted-foreground">
                {stage === 'area'
                  ? `${scenario.unit}²`
                  : plural(2, scenario.packForms)}
              </span>
              <Button type="submit" style={{ backgroundColor: color }}>
                Sprawdź
              </Button>
            </div>
          </form>

          <AnimatePresence mode="wait">
            {wrong && (
              <motion.p
                key="wrong"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="mt-3 text-sm leading-relaxed text-muted-foreground"
              >
                {stage === 'area'
                  ? 'Jeszcze nie. Zsumuj pola tych ścian, które mają ✓ — przekreślone pomijasz.'
                  : 'Jeszcze nie. Podziel pole przez to, ile pokrywa jedno opakowanie, i zaokrąglij w GÓRĘ — resztka też musi być czymś pokryta.'}
              </motion.p>
            )}
            {stage === 'packs' && !wrong && (
              <motion.p
                key="area-ok"
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-3 text-sm leading-relaxed"
                style={{ color: textColor }}
              >
                Zgadza się — do pokrycia jest{' '}
                <strong className="font-mono tabular-nums">
                  {area} {scenario.unit}²
                </strong>
                {scenario.skip.length > 0 && (
                  <>
                    {' '}
                    (pełne pole powierzchni to {netTotalArea(scenario.spec)} {scenario.unit}², minus{' '}
                    {scenario.skip.map((face) => FACE_LABEL[face]).join(' i ')})
                  </>
                )}
                . Teraz materiał.
              </motion.p>
            )}
            {stage === 'done' && (
              <motion.div
                key="done"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4"
              >
                <p
                  className="border-l-2 px-4 py-3 font-mono text-base font-bold tabular-nums"
                  style={{ borderColor: color, color, backgroundColor: `${color}0d` }}
                >
                  {area} : {scenario.perPack} → {packs} {plural(packs, scenario.packForms)}
                </p>
                <p className="mt-3 text-sm leading-relaxed" style={{ color: textColor }}>
                  {scenario.moral}
                </p>
                <Button onClick={goNext} className="mt-3" style={{ backgroundColor: color }}>
                  {index + 1 < SCENARIOS.length ? 'Następna robota' : 'Gotowe'}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <ul className="sr-only">
        {SCENARIOS.map((item) => {
          const itemArea = surfaceWithout(item.spec, item.skip);
          return (
            <li key={item.id}>
              {item.story} Bryła {item.spec.width} × {item.spec.depth} × {item.spec.height}{' '}
              {item.unit}, pełne pole powierzchni {netTotalArea(item.spec)} {item.unit}².
              {item.skip.length > 0
                ? ` Pomijamy: ${item.skip.map((face) => FACE_LABEL[face]).join(', ')}.`
                : ' Pokrywamy wszystkie ściany.'}{' '}
              Do pokrycia {itemArea} {item.unit}², czyli{' '}
              {packsNeeded(itemArea, item.perPack)}{' '}
              {plural(packsNeeded(itemArea, item.perPack), item.packForms)}. {item.moral}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
