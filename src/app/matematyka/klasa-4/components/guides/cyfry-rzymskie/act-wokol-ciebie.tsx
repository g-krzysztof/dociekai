'use client';

import { useState } from 'react';
import Image from 'next/image';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { GuideAct } from '../guide-act';
import { toRoman } from '../../../lib/roman';
import { CENTURIES } from './guide-content';
import { img } from '@/lib/media';

const HOURS = Array.from({ length: 12 }, (_, i) => i + 1);
const RADIUS = 88;
const CENTER = 110;

export function ActWokolCiebie({ color }: { color: string }) {
  const [hour, setHour] = useState<number | null>(null);
  const [century, setCentury] = useState(CENTURIES[CENTURIES.length - 1].century);
  const textColor = `color-mix(in oklch, ${color} 88%, black)`;

  const activeCentury = CENTURIES.find((item) => item.century === century)!;

  return (
    <GuideAct id="wokol-ciebie" mode="flow">
      <h2 className="mb-2 text-2xl font-bold leading-snug sm:text-3xl">Gdzie je spotkasz</h2>
      <p className="mb-6 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
        Rzymskie znaki nie zostały w podręczniku do historii. Są dookoła — trzeba tylko umieć je
        przeczytać.
      </p>

      <div className="mb-8 grid gap-6 lg:grid-cols-[240px_1fr] lg:items-center">
        <svg
          viewBox="0 0 220 220"
          className="mx-auto h-auto w-full max-w-[240px]"
          role="img"
          aria-label="Tarcza zegara z godzinami zapisanymi cyframi rzymskimi"
        >
          <circle
            cx={CENTER}
            cy={CENTER}
            r={RADIUS + 14}
            fill="none"
            stroke={color}
            strokeOpacity={0.3}
            strokeWidth={2}
          />
          {HOURS.map((value) => {
            // -90°, żeby godzina 12 wypadła na górze tarczy.
            const angle = ((value * 30 - 90) * Math.PI) / 180;
            const x = CENTER + RADIUS * Math.cos(angle);
            const y = CENTER + RADIUS * Math.sin(angle);
            const active = hour === value;
            return (
              <g
                key={value}
                onClick={() => setHour(value)}
                className="cursor-pointer"
                role="button"
                aria-label={`Godzina ${value}`}
              >
                <circle cx={x} cy={y} r={17} fill={active ? color : 'transparent'} />
                <text
                  x={x}
                  y={y + 5}
                  textAnchor="middle"
                  className="font-mono text-[13px] font-black"
                  fill={active ? 'white' : color}
                >
                  {toRoman(value)}
                </text>
              </g>
            );
          })}
        </svg>

        <div>
          <div
            className="min-h-[92px] border-l-4 p-4"
            style={{ borderColor: color, backgroundColor: `${color}0c` }}
          >
            <AnimatePresence mode="wait">
              {hour === null ? (
                <motion.p
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-sm text-muted-foreground"
                >
                  Kliknij godzinę na tarczy.
                </motion.p>
              ) : (
                <motion.div
                  key={hour}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                >
                  <p className="font-mono text-2xl font-black" style={{ color }}>
                    {toRoman(hour)} = {hour}
                  </p>
                  {hour === 4 && (
                    <p className="mt-2 text-sm leading-relaxed">
                      Na wielu tarczach zegarów zobaczysz jednak <strong>IIII</strong> zamiast{' '}
                      {toRoman(4)}. To zegarmistrzowski zwyczaj, nie reguła zapisu liczb.
                    </p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <p className="mt-4 text-sm font-semibold" style={{ color: textColor }}>
            Numer wieku
          </p>
          <div className="mt-2 flex flex-wrap gap-2">
            {CENTURIES.map((item) => (
              <button
                key={item.century}
                type="button"
                onClick={() => setCentury(item.century)}
                aria-pressed={item.century === century}
                className={cn(
                  'cursor-pointer border px-3 py-1.5 font-mono text-base font-bold transition-all',
                  item.century !== century && 'hover:-translate-y-0.5 hover:shadow-md'
                )}
                style={
                  item.century === century
                    ? { borderColor: color, backgroundColor: `${color}14`, color }
                    : { borderColor: `${color}59`, color }
                }
              >
                {item.symbols}
              </button>
            ))}
          </div>
          <p className="mt-2 text-sm text-muted-foreground">
            Wiek {activeCentury.symbols} to lata {activeCentury.from}–{activeCentury.to}.
          </p>
        </div>
      </div>

      <div
        className="grid items-center gap-6 border-l-4 p-5 sm:p-6 md:grid-cols-[1fr_220px]"
        style={{ borderColor: color, backgroundColor: `${color}0c` }}
      >
        <ul className="grid gap-2 text-sm leading-relaxed sm:text-base">
          <li>Daty budowy wykute na starych kamienicach i tablicach pamiątkowych.</li>
          <li>Numery rozdziałów i tomów w książkach.</li>
          <li>Numery przy imionach władców — Jan III Sobieski, Kazimierz III Wielki.</li>
          <li>Rok produkcji w napisach końcowych filmów.</li>
          <li>Numery wieków na lekcjach historii.</li>
        </ul>
        <div className="relative mx-auto aspect-[4/3] w-full max-w-[220px]">
          <Image
            src={img('/images/matematyka/lekcje/system-rzymski/stary-pomnik.jpg')}
            alt="Stary kamienny pomnik na miejskim placu, porośnięty bluszczem"
            width={220}
            height={165}
            className="absolute inset-0 h-full w-full object-contain"
          />
        </div>
      </div>
    </GuideAct>
  );
}
