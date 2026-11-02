'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { RomanOdometer } from '../../roman-odometer';
import { Beat, GuideAct } from '../guide-act';
import { classesOf, formatWithClassSpaces } from '../../../lib/place-value';
import { CLASS_EXPLANATIONS, HOOK_VALUE, PLACE_COLUMNS, PLACE_REGISTER_DIGIT } from './guide-content';
import { ClassTile } from './class-tile';
import { img } from '@/lib/media';

export function ActRzedyIKlasy({ color }: { color: string }) {
  return (
    <GuideAct id="rzedy-i-klasy" mode="flow">
      <RzedyIKlasyBody color={color} />
    </GuideAct>
  );
}

function RzedyIKlasyBody({ color }: { color: string }) {
  const [activePlace, setActivePlace] = useState(0);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;
  const classes = classesOf(HOOK_VALUE);

  const move = (delta: number) => {
    setActivePlace((prev) => Math.max(0, Math.min(3, prev + delta)));
  };

  return (
    <>
      <Beat at={0.05}>
        <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">
          Miejsce decyduje o wartości
        </h2>
        <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
          Ta sama cyfra znaczy co innego, zależnie od tego, na którym miejscu (rzędzie) stoi.
        </p>
      </Beat>

      <Beat at={0.15} className="mb-10">
        <div className="border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
          <div className="mb-5 flex justify-center gap-1.5 sm:gap-2">
            {PLACE_COLUMNS.map((column) => {
              const active = column.place === activePlace;
              return (
                <div key={column.label} className="flex flex-col items-center gap-1.5">
                  <span
                    className="flex h-14 w-14 items-center justify-center border font-mono text-3xl font-black transition-all sm:h-16 sm:w-16 sm:text-4xl"
                    style={{
                      borderColor: active ? color : `${color}30`,
                      backgroundColor: active ? `${color}14` : 'transparent',
                      color: active ? color : `${color}59`,
                    }}
                  >
                    {active ? PLACE_REGISTER_DIGIT : 0}
                  </span>
                  <span
                    className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground sm:text-xs"
                    style={{ color: active ? textColor : undefined }}
                  >
                    {column.label}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="mb-5 flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => move(1)}
              disabled={activePlace >= 3}
              aria-label="Przesuń cyfrę na wyższy rząd"
              className="cursor-pointer border p-2 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ borderColor: `${color}59`, color }}
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-muted-foreground">
              przesuń cyfrę {PLACE_REGISTER_DIGIT}
            </span>
            <button
              type="button"
              onClick={() => move(-1)}
              disabled={activePlace <= 0}
              aria-label="Przesuń cyfrę na niższy rząd"
              className="cursor-pointer border p-2 transition-all hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-30"
              style={{ borderColor: `${color}59`, color }}
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>

          <div className="flex justify-center">
            <RomanOdometer
              value={PLACE_REGISTER_DIGIT * 10 ** activePlace}
              digits={4}
              color={color}
              label="wartość"
            />
          </div>
        </div>
      </Beat>

      <Beat at={0.55}>
        <div className="grid items-center gap-6 md:grid-cols-[1fr_180px]">
          <div>
            <h3 className="mb-2 text-xl font-bold leading-snug">Rzędy grupują się w klasy</h3>
            <p className="mb-5 text-sm leading-relaxed text-muted-foreground sm:text-base">
              Co trzy rzędy — jedności, tysiące, miliony — to osobna „paczka” cyfr. Kliknij grupę,
              żeby zobaczyć, co znaczy.
            </p>

            <div className="mb-4 flex flex-wrap items-center justify-center gap-2 sm:justify-start">
              {classes.map((klass) => (
                <ClassTile
                  key={klass.name}
                  klass={klass}
                  color={color}
                  selected={selectedClass === klass.name}
                  onSelect={() => setSelectedClass(klass.name)}
                  explanation={CLASS_EXPLANATIONS[klass.name] ?? ''}
                />
              ))}
            </div>

            <div
              className="mb-4 min-h-[52px] border-l-4 p-3"
              style={{ borderColor: color, backgroundColor: `${color}0c` }}
            >
              <p className="text-sm leading-relaxed sm:text-base">
                {selectedClass ? CLASS_EXPLANATIONS[selectedClass] : 'Kliknij którąś z grup wyżej.'}
              </p>
            </div>

            <p className="font-mono text-2xl font-black tabular-nums sm:text-3xl" style={{ color }}>
              {formatWithClassSpaces(HOOK_VALUE)}
            </p>
          </div>

          <div className="relative mx-auto hidden aspect-[4/3] w-full max-w-[180px] md:block">
            <Image
              src={img('/images/matematyka/przewodniki/liczby-i-os/liczydlo.jpg')}
              alt="Drewniane liczydło z kolorowymi koralikami na prętach"
              width={180}
              height={135}
              className="absolute inset-0 h-full w-full object-contain"
            />
          </div>
        </div>
      </Beat>
    </>
  );
}
