'use client';

import { useEffect, useRef, useState } from 'react';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toRoman } from '../../../lib/timeline/dating';
import { DIAL_CENTURIES, judgePlaqueCentury, PLAQUES, romanSteps, type Verdict } from './wieki';

/**
 * Przybliżenie tablicy z ilustracji kamienicy (`kamienica-z-tablica.jpg`,
 * 1536×1152). Kadr: x 31–69%, y 7–32% obrazu; wnętrze tablicy w tym kadrze:
 * x 7.6–93.2%, y 15.6–86.4% (zmierzone na pliku).
 */
const CROP = { x: 31, y: 7, w: 38, h: 25 };
const INNER = { left: 7.6, top: 15.6, right: 93.2, bottom: 86.4 };

const MATH_ROMAN = '/matematyka/klasa-4/obliczenia-praktyczne/system-rzymski';

/**
 * Blok 4 — **Tablica na murze** (`zrodlo`).
 *
 * Gest nowy w kursie: **stuka litery napisu po kolei, od lewej**, a liczydło
 * pod tablicą dodaje ich wartości (mniejsza przed większą dostaje minus —
 * liczydło pokazuje to samo). Z roku dziecko **kręci tarczą wieków** i sprawdza;
 * odrzucenie mówi tym samym zdaniem co półki (kciuk, zera). Tablice są
 * wymyślone (tak podpisane), napisy kuje SVG/tekst, nie generator obrazów.
 */
export function TabliceNaMurze({ color, image, onComplete }: { color: string; image: string; onComplete: () => void }) {
  const [index, setIndex] = useState(0);
  const [read, setRead] = useState(0);
  const [miss, setMiss] = useState(false);
  const [dial, setDial] = useState(DIAL_CENTURIES.indexOf(18));
  const [verdict, setVerdict] = useState<Verdict | null>(null);
  const reported = useRef(false);

  const plaque = PLAQUES[index];
  const finished = index >= PLAQUES.length;
  const steps = plaque ? romanSteps(plaque.numeral) : [];
  const fullyRead = plaque && read === steps.length;
  const year = fullyRead ? steps.at(-1)!.total : null;

  useEffect(() => {
    if (finished && !reported.current) {
      reported.current = true;
      onComplete();
    }
  }, [finished, onComplete]);

  const tap = (i: number) => {
    if (i !== read) {
      setMiss(true);
      return;
    }
    setMiss(false);
    setRead(read + 1);
  };

  const check = () => {
    if (year === null) return;
    setVerdict(judgePlaqueCentury(year, DIAL_CENTURIES[dial]));
  };

  const next = () => {
    setIndex((i) => i + 1);
    setRead(0);
    setVerdict(null);
    setMiss(false);
  };

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed">
        Na starych domach, bramach i szkołach często wykuwano rok budowy cyframi rzymskimi. <strong>Stukaj litery od
        lewej</strong> — liczydło pod tablicą policzy. Potem ustaw tarczę na wiek.
      </p>

      {!finished && plaque && (
        <>
          <div
            className="relative w-full overflow-hidden border"
            style={{
              aspectRatio: `${(CROP.w * 1536) / (CROP.h * 1152)}`,
              backgroundImage: `url(${image})`,
              backgroundSize: `${100 / (CROP.w / 100)}% auto`,
              backgroundPosition: `${(CROP.x / (100 - CROP.w)) * 100}% ${(CROP.y / (100 - CROP.h)) * 100}%`,
            }}
          >
            <div
              className="absolute flex flex-col items-center justify-center gap-[3%] font-serif text-stone-600/90"
              style={{
                left: `${INNER.left}%`,
                top: `${INNER.top}%`,
                width: `${INNER.right - INNER.left}%`,
                height: `${INNER.bottom - INNER.top}%`,
                containerType: 'size',
              }}
            >
              <span className="text-[14cqh] tracking-[0.3em]" style={{ textShadow: '0 1px 0 rgb(255 255 255 / 0.7)' }}>
                {plaque.over}
              </span>
              <span className="flex">
                {plaque.numeral.split('').map((letter, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => tap(i)}
                    disabled={fullyRead}
                    className={cn('px-[0.6cqw] text-[min(30cqh,9cqw)] font-bold leading-none transition-colors')}
                    style={{
                      color: i < read ? (steps[i].signed < 0 ? 'var(--destructive)' : color) : undefined,
                      textShadow: '0 1px 0 rgb(255 255 255 / 0.7), 0 -1px 0 rgb(0 0 0 / 0.15)',
                    }}
                    aria-label={`Litera ${letter}`}
                  >
                    {letter}
                  </button>
                ))}
              </span>
            </div>
          </div>

          {/* Liczydło */}
          <div className="min-h-[3rem] border bg-muted/30 px-3 py-2 font-mono text-sm tabular-nums" aria-live="polite">
            {read === 0 ? (
              <span className="font-sans text-muted-foreground">Liczydło czeka na pierwszą literę.</span>
            ) : (
              <>
                {steps.slice(0, read).map((s, i) => (
                  <span key={i} className={cn(s.signed < 0 && 'text-destructive')}>
                    {i > 0 ? (s.signed < 0 ? ' − ' : ' + ') : s.signed < 0 ? '−' : ''}
                    {s.value}
                  </span>
                ))}
                {fullyRead && (
                  <strong className="text-base">
                    {' '}
                    = {year}
                  </strong>
                )}
              </>
            )}
            {miss && <p className="mt-1 font-sans text-xs text-destructive">Czytamy po kolei, od lewej — stuknij następną literę.</p>}
            {read > 0 && steps.slice(0, read).some((s) => s.signed < 0) && !fullyRead && (
              <p className="mt-1 font-sans text-xs text-muted-foreground">Mniejsza cyfra przed większą — odejmujemy.</p>
            )}
          </div>

          {fullyRead && (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm">Rok {year} to wiek:</span>
                <div className="flex items-center border-2" style={{ borderColor: color }}>
                  <button
                    type="button"
                    onClick={() => {
                      setDial((d) => Math.max(0, d - 1));
                      setVerdict(null);
                    }}
                    disabled={verdict?.ok}
                    className="p-2"
                    aria-label="Wcześniejszy wiek"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <span className="w-16 text-center font-serif text-xl font-bold" style={{ color }} aria-live="polite">
                    {toRoman(DIAL_CENTURIES[dial])}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setDial((d) => Math.min(DIAL_CENTURIES.length - 1, d + 1));
                      setVerdict(null);
                    }}
                    disabled={verdict?.ok}
                    className="p-2"
                    aria-label="Późniejszy wiek"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
                {!verdict?.ok && (
                  <button type="button" onClick={check} className="border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: color, color }}>
                    Sprawdź
                  </button>
                )}
              </div>

              {verdict && (
                <p className={cn('text-sm leading-relaxed', !verdict.ok && 'text-destructive')} aria-live="polite">
                  {verdict.ok ? (
                    <>
                      <strong className="text-success">{verdict.message}</strong> {plaque.note}
                    </>
                  ) : (
                    verdict.message
                  )}
                </p>
              )}
              {verdict?.ok && (
                <button type="button" onClick={next} className="border-2 px-4 py-2 text-sm font-semibold" style={{ borderColor: color, color }}>
                  {index + 1 < PLAQUES.length ? 'Następna tablica' : 'Zakończ spacer'}
                </button>
              )}
            </div>
          )}

          <p className="text-xs text-muted-foreground">
            Tablica {index + 1} z {PLAQUES.length} · tablice wymyślone na potrzeby ćwiczenia, ale takie napisy zobaczysz na
            wielu starych budynkach.
          </p>
        </>
      )}

      {finished && (
        <p className="text-sm leading-relaxed">
          Cztery tablice, cztery wieki. Cyfry rzymskie to tylko inny zapis liczby — wiek ustalasz z niej tą samą regułą
          kciuka.
        </p>
      )}

      <a
        href={MATH_ROMAN}
        target="_blank"
        rel="noopener"
        className="inline-flex items-center gap-1.5 text-sm underline underline-offset-2"
      >
        Nie pamiętam cyfr rzymskich — otwórz lekcję matematyki <ExternalLink className="h-3.5 w-3.5" aria-hidden />
      </a>
    </div>
  );
}
