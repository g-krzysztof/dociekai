'use client';

import { useEffect, useRef, useState, type PointerEvent } from 'react';
import { motion } from 'framer-motion';
import { Check, Hand, X } from 'lucide-react';
import { KazimierzMap, MapLegend } from './mapa-kazimierza';

/**
 * Blok 1 — **Mapa z zasłoniętą legendą** (`haczyk`).
 *
 * Dziecko widzi mapę, ale legenda leży pod kartką. Najpierw zgaduje, co znaczy
 * korona przy Krakowie i dwa odcienie czerwieni; potem **podnosi kartkę palcem**
 * (ciągnie w górę — gest nowy w kursie) i legenda zamienia zgadywanie w pewność.
 * Kartki nie da się podnieść przed zgadywaniem — inaczej nie byłoby czego porównać.
 */

interface Guess {
  id: string;
  question: string;
  options: string[];
  correct: number;
  legend: string;
}

const GUESSES: Guess[] = [
  {
    id: 'korona',
    question: 'Co znaczy korona przy Krakowie?',
    options: ['tu urodził się król', 'tu stała skarbnica z koroną', 'tu koronowano króla'],
    correct: 2,
    legend: 'korona to miejsce koronacji króla',
  },
  {
    id: 'czerwien',
    question: 'Dlaczego czerwień ma dwa odcienie?',
    options: [
      'ciemna — państwo na początku rządów, jasna — ziemie przyłączone później',
      'ciemna — ziemie w górach, jasna — na nizinach',
      'ciemna — duże miasta, jasna — wsie',
    ],
    correct: 0,
    legend: 'ciemna czerwień to Królestwo w 1333 roku, jasna — ziemie przyłączone do 1370 roku',
  },
];

/** Jaką część wysokości kartki trzeba podnieść, żeby odleciała. */
const LIFT_SHARE = 0.5;

export function ZaslonietaLegenda({
  color,
  onComplete,
}: {
  color: string;
  onComplete: () => void;
}) {
  const [picked, setPicked] = useState<Record<string, number>>({});
  const [lift, setLift] = useState(0);
  const [gone, setGone] = useState(false);
  const [dragging, setDragging] = useState(false);
  const drag = useRef<{ y: number; h: number } | null>(null);
  const reported = useRef(false);

  const guessed = GUESSES.every((g) => picked[g.id] !== undefined);

  useEffect(() => {
    if (gone && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [gone, onComplete]);

  const down = (e: PointerEvent<HTMLDivElement>) => {
    if (!guessed || gone) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    drag.current = { y: e.clientY, h: e.currentTarget.getBoundingClientRect().height };
    setDragging(true);
  };
  const move = (e: PointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d) return;
    setLift(Math.max(0, Math.min(1, (d.y - e.clientY) / d.h)));
  };
  const up = () => {
    const d = drag.current;
    drag.current = null;
    setDragging(false);
    if (!d) return;
    if (lift >= LIFT_SHARE) setGone(true);
    else setLift(0);
  };

  return (
    <div className="grid gap-4 md:grid-cols-[minmax(0,3fr)_minmax(0,2fr)] md:items-start">
      <KazimierzMap />

      <div className="space-y-4">
        {GUESSES.map((g) => (
          <fieldset key={g.id} className="border p-3">
            <legend className="px-1 text-sm font-semibold">{g.question}</legend>
            <div className="mt-1 flex flex-col gap-1.5">
              {g.options.map((opt, i) => {
                const mine = picked[g.id] === i;
                const right = gone && i === g.correct;
                return (
                  <button
                    key={opt}
                    type="button"
                    disabled={gone}
                    onClick={() => setPicked((p) => ({ ...p, [g.id]: i }))}
                    className="flex cursor-pointer items-start gap-2 border px-2.5 py-1.5 text-left text-sm transition-colors hover:bg-muted disabled:cursor-default disabled:hover:bg-transparent"
                    style={{
                      borderColor: mine || right ? color : undefined,
                      backgroundColor: right ? `${color}1f` : mine ? `${color}0d` : undefined,
                    }}
                  >
                    <span
                      className="mt-1 h-3 w-3 shrink-0 rounded-full border-2"
                      style={{ borderColor: color, backgroundColor: mine ? color : 'transparent' }}
                      aria-hidden
                    />
                    <span className="min-w-0 flex-1">{opt}</span>
                    {gone &&
                      mine &&
                      (i === g.correct ? (
                        <Check
                          className="h-4 w-4 shrink-0 text-emerald-600"
                          aria-label="zgadnięte"
                        />
                      ) : (
                        <X className="h-4 w-4 shrink-0 text-rose-600" aria-label="nie" />
                      ))}
                  </button>
                );
              })}
            </div>
          </fieldset>
        ))}

        {/* Legenda pod kartką. Kartka zasłania ją całą, póki nie odleci. */}
        <div className="relative">
          <MapLegend compact />
          {!gone && (
            <motion.div
              role="button"
              tabIndex={guessed ? 0 : -1}
              aria-label={
                guessed
                  ? 'Kartka zasłaniająca legendę — pociągnij ją w górę albo naciśnij Enter'
                  : 'Kartka zasłaniająca legendę — najpierw zgadnij'
              }
              onPointerDown={down}
              onPointerMove={move}
              onPointerUp={up}
              onPointerCancel={up}
              onKeyDown={(e) => {
                if (guessed && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  setGone(true);
                }
              }}
              className={`absolute inset-0 flex flex-col items-center justify-center gap-2 border bg-[#efe6d0] p-4 text-center shadow-md ${guessed ? 'cursor-grab touch-none' : 'cursor-not-allowed'}`}
              style={{
                transformOrigin: 'top center',
                transform: `translateY(${-lift * 100}%) rotateX(${lift * 35}deg)`,
                transition: dragging ? 'none' : 'transform 0.25s ease-out',
                backgroundImage:
                  'repeating-linear-gradient(0deg, transparent 0 23px, #d9cdb0 23px 24px)',
              }}
            >
              <Hand
                className="h-6 w-6"
                style={{ color: guessed ? color : '#a39878' }}
                aria-hidden
              />
              <p className="text-sm font-semibold" style={{ color: guessed ? color : '#7c715a' }}>
                {guessed ? 'Pociągnij kartkę w górę' : 'Tu leży legenda. Najpierw zgadnij.'}
              </p>
              {guessed && (
                <p className="text-xs text-muted-foreground">Złap palcem i podnieś do połowy.</p>
              )}
              {/* Wywinięty róg — zaproszenie do złapania. */}
              <span
                aria-hidden
                className="absolute bottom-0 right-0 h-8 w-8"
                style={{ background: 'linear-gradient(135deg, #efe6d0 50%, #cbbd99 50%)' }}
              />
            </motion.div>
          )}
        </div>

        {gone && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-3 text-sm leading-relaxed"
            style={{ backgroundColor: `${color}12` }}
          >
            {GUESSES.map((g) => (
              <p key={g.id} className="mb-1.5">
                {picked[g.id] === g.correct ? (
                  <strong>Zgadłeś/łaś</strong>
                ) : (
                  <strong>Legenda mówi co innego</strong>
                )}
                {' — '}
                {g.legend}.
              </p>
            ))}
            <p className="mt-2">
              Przed chwilą{' '}
              {GUESSES.every((g) => picked[g.id] === g.correct)
                ? 'trafiłeś/łaś, ale tylko zgadywałeś/łaś'
                : 'zgadywałeś/łaś'}{' '}
              — teraz <strong>wiesz</strong>. Ta sama mapa, te same kolory, ale dopiero legenda
              mówi, co one znaczą.{' '}
              <strong>Mapa bez legendy to obrazek — legenda zamienia ją w opowieść.</strong>
            </p>
          </motion.div>
        )}
      </div>
    </div>
  );
}
