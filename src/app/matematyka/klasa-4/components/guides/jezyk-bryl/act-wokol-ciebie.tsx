'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { SolidGlyph } from '../../solid-glyph';
import { CHEAT_SHEET, SOLID_FAMILY, SOLID_MATCHES, type SolidKind } from './guide-content';
import { img } from '@/lib/media';

export function ActWokolCiebie({ color }: { color: string }) {
  const [index, setIndex] = useState(0);
  const [wrong, setWrong] = useState<SolidKind | null>(null);
  const [solved, setSolved] = useState<string[]>([]);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const finished = index >= SOLID_MATCHES.length;
  const task = SOLID_MATCHES[index] ?? SOLID_MATCHES[SOLID_MATCHES.length - 1];
  const done = solved.includes(task.id);

  const pick = (id: SolidKind) => {
    if (done) return;
    if (id === task.correct) {
      setWrong(null);
      setSolved((prev) => [...prev, task.id]);
    } else {
      setWrong(id);
    }
  };

  return (
    <GuideAct id="wokol-ciebie" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Wokół ciebie</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Sześć przedmiotów, sześć nazw. Zła odpowiedź nic nie psuje — po prostu spróbuj jeszcze raz.
      </p>

      <div className="mb-10 border bg-white p-5 dark:bg-zinc-900/80 sm:p-6">
        {/* Kropki postępu — ten sam wzorzec fazowy co w widżetach „demo → rundy". */}
        <div className="mb-5 flex items-center gap-2">
          {SOLID_MATCHES.map((item, i) => (
            <span
              key={item.id}
              className="h-2 w-2 rounded-full"
              style={{
                backgroundColor: solved.includes(item.id) ? color : `${color}33`,
                outline: i === index && !finished ? `2px solid ${color}` : undefined,
                outlineOffset: '2px',
              }}
              aria-hidden
            />
          ))}
          <span className="ml-2 text-xs font-semibold text-muted-foreground">
            {solved.length} z {SOLID_MATCHES.length}
          </span>
        </div>

        {finished ? (
          <div className="flex flex-col items-start gap-3 sm:flex-row sm:items-center">
            <Check className="h-8 w-8 shrink-0" style={{ color }} aria-hidden />
            <p className="text-base leading-relaxed sm:text-lg">
              Wszystkie sześć nazwane. Te słowa wracają w każdej lekcji tego działu — przy siatkach,
              przy objętości i przy polu powierzchni.
            </p>
          </div>
        ) : (
          <>
            <p className="mb-4 text-base leading-relaxed sm:text-lg">
              Jaką bryłą jest <strong style={{ color: textColor }}>{task.thing}</strong>?
            </p>

            <div className="grid gap-2 sm:grid-cols-3">
              {SOLID_FAMILY.map((entry) => {
                const isWrong = wrong === entry.id;
                const isRight = done && entry.id === task.correct;
                return (
                  <motion.button
                    key={entry.id}
                    type="button"
                    onClick={() => pick(entry.id)}
                    animate={isWrong ? { x: [0, -6, 6, -4, 4, 0] } : { x: 0 }}
                    transition={{ duration: 0.35 }}
                    className={cn(
                      'flex cursor-pointer items-center gap-2 border px-3 py-2 text-left text-sm font-semibold transition-all',
                      !done && 'hover:-translate-y-0.5 hover:shadow-md'
                    )}
                    style={
                      isRight
                        ? { borderColor: color, backgroundColor: `${color}14`, color: textColor }
                        : isWrong
                          ? { borderColor: '#dc2626', color: '#b91c1c' }
                          : { borderColor: `${color}40`, color: textColor }
                    }
                  >
                    <SolidGlyph kind={entry.id} color={color} className="h-8 w-8 shrink-0" />
                    {entry.name}
                  </motion.button>
                );
              })}
            </div>

            <AnimatePresence mode="wait">
              {done ? (
                <motion.div
                  key="why"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 border-l-4 pl-4"
                  style={{ borderColor: color }}
                >
                  <p className="text-sm leading-relaxed sm:text-base">{task.why}</p>
                  <button
                    type="button"
                    onClick={() => {
                      setIndex((prev) => prev + 1);
                      setWrong(null);
                    }}
                    className="mt-3 cursor-pointer border px-4 py-2 text-sm font-semibold transition-colors hover:opacity-70"
                    style={{ borderColor: color, color: textColor }}
                  >
                    {index === SOLID_MATCHES.length - 1 ? 'Zakończ' : 'Następny przedmiot'}
                  </button>
                </motion.div>
              ) : wrong ? (
                <motion.p
                  key="wrong"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="mt-4 text-sm text-muted-foreground"
                >
                  Nie ta bryła — pomyśl, czy ten przedmiot ma płaskie ściany, czy zaokrągloną
                  powierzchnię. Klikaj dalej.
                </motion.p>
              ) : null}
            </AnimatePresence>
          </>
        )}
      </div>

      {/* Pełna lista dopasowań zawsze w DOM — quiz odsłania je po kolei, ale
          treść musi być indeksowalna i dostępna bez klikania. */}
      <ul className="sr-only">
        {SOLID_MATCHES.map((item) => (
          <li key={item.id}>
            {item.thing}: {item.why}
          </li>
        ))}
      </ul>

      <div
        className="mb-8 grid items-center gap-6 border-l-4 p-5 sm:p-6 md:grid-cols-[1fr_220px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <div>
          <p className="mb-2 text-sm font-semibold" style={{ color: textColor }}>
            Gdzie te słowa naprawdę się przydają
          </p>
          <ul className="grid gap-2 text-sm leading-relaxed sm:text-base">
            <li>
              W sklepie: „karton 40 × 30 × 25 cm” to trzy wymiary prostopadłościanu — długość,
              szerokość i wysokość.
            </li>
            <li>
              Przy pakowaniu paczki: krawędzie oklejasz taśmą, ściany podpisujesz, a wierzchołki
              wzmacniasz, żeby się nie pogniotły.
            </li>
            <li>
              Na budowie: rura to walec, kopiec piasku to stożek, a dach wieży — ostrosłup.
            </li>
            <li>
              W kuchni: puszka, słoik i szklanka to walce, więc ustawiają się w tym samym rzędzie
              w szafce.
            </li>
          </ul>
        </div>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
          <Image
            src={img('/images/matematyka/przewodniki/jezyk-bryl/chlopiec-uklada-pudelka.jpg')}
            alt="Chłopiec układa na półce pudełka, puszkę i piłkę"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>

      <section className="border-2 border-dashed p-5 sm:p-6" style={{ borderColor: `${color}59` }}>
        <h3 className="mb-1 text-lg font-bold">Język brył w siedmiu zdaniach</h3>
        <p className="mb-4 text-sm text-muted-foreground">
          Tyle wystarczy, żeby zrozumieć każdą lekcję tego działu.
        </p>
        <ol className="divide-y border bg-white dark:bg-zinc-900/80">
          {CHEAT_SHEET.map((rule, i) => (
            <li key={rule} className="flex items-start gap-4 px-4 py-3">
              <span
                className="w-6 shrink-0 font-mono text-lg font-bold leading-none tabular-nums"
                style={{ color }}
              >
                {i + 1}
              </span>
              <span className="text-sm leading-relaxed">{rule}</span>
            </li>
          ))}
        </ol>
      </section>
    </GuideAct>
  );
}
