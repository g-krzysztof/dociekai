'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import {
  CARD,
  FORMATS,
  PHOTO,
  colorCount,
  diffPixels,
  encode,
  formatBytes,
  weigh,
  type Format,
  type Picture,
} from './card';

/**
 * Wyjaśnienie różnic między formatami — **przez ważenie, nie przez czytanie**.
 *
 * Reguła „rysunek → PNG, zdjęcie → JPG” jest w każdym podręczniku i w żadnym nie
 * da się jej sprawdzić. Tutaj dziecko kładzie na wadze ten sam obrazek osiem
 * razy (dwa źródła × cztery formaty) i **reguła wychodzi z liczb, które samo
 * zmierzyło** — a przy okazji widzi, że dla rysunku i dla zdjęcia zwycięzca jest
 * inny, więc nie ma jednego „najlepszego formatu”.
 *
 * Wagi liczy `weigh()` z prawdziwych pikseli (patrz `card.ts`), a podgląd
 * pokazuje `encode()`, czyli to samo, z czego waga powstała. Dzięki temu nie da
 * się tu zobaczyć pliku, który jest lekki i nietknięty naraz — a to właśnie ta
 * zależność jest treścią bloku.
 */

type Source = 'rysunek' | 'zdjecie';

const SOURCES: { id: Source; label: string; pic: Picture; about: string }[] = [
  {
    id: 'rysunek',
    label: 'Rysunek',
    pic: CARD,
    about: 'Kilkanaście kolorów i duże jednolite plamy — tak wygląda wszystko, co narysujesz sam.',
  },
  {
    id: 'zdjecie',
    label: 'Zdjęcie',
    pic: PHOTO,
    about:
      'Ta sama kartka sfotografowana: każdy piksel odrobinę inny od sąsiada, setki odcieni. Tak wygląda każde zdjęcie z aparatu.',
  },
];

const sourceInfo = (id: Source) => SOURCES.find((s) => s.id === id) ?? SOURCES[0];

interface FormatScaleProps {
  color: string;
  onComplete?: () => void;
}

export function FormatScale({ color, onComplete }: FormatScaleProps) {
  const [source, setSource] = useState<Source>('rysunek');
  const [weighed, setWeighed] = useState<string[]>([]);
  const [shown, setShown] = useState<Format | null>(null);

  const reported = useRef(false);
  const all = SOURCES.length * FORMATS.length;
  const done = weighed.length === all;
  const anchorRef = useSectionScrollAnchor(done ? 'koniec' : source);

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const current = sourceInfo(source);
  const key = (s: Source, f: Format) => `${s}-${f}`;

  const weighNow = (format: Format) => {
    const id = key(source, format);
    setShown(format);
    if (!weighed.includes(id)) setWeighed([...weighed, id]);
  };

  /* Największa waga w tym źródle wyznacza długość słupka — porównujemy w obrębie
     jednego obrazka, bo to jest pytanie bloku („który format dla TEGO obrazka”). */
  const maxBytes = Math.max(...FORMATS.map((f) => weigh(current.pic, f.id)));
  const preview = shown ? encode(current.pic, shown) : current.pic;
  const lost = shown ? diffPixels(current.pic, preview) : 0;

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {SOURCES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setSource(item.id);
                setShown(null);
              }}
              aria-pressed={source === item.id}
              className={cn(
                'border-2 px-3 py-1.5 text-sm font-medium transition',
                source !== item.id && 'hover:bg-black/5 dark:hover:bg-white/5'
              )}
              style={{
                borderColor: source === item.id ? color : `${color}33`,
                backgroundColor: source === item.id ? `${color}14` : undefined,
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          zważone: {weighed.length} z {all}
        </p>
      </div>

      <p className="mb-4 text-sm leading-relaxed">{current.about}</p>

      <div className="grid gap-5 md:grid-cols-[220px_minmax(0,1fr)]">
        <figure>
          <div className="border-2 p-1.5" style={{ borderColor: `${color}44` }}>
            <PictureView
              pic={preview}
              label={shown ? `Podgląd po zapisaniu jako ${shown}` : 'Obrazek przed zapisaniem'}
            />
          </div>
          <figcaption className="mt-1.5 text-xs tabular-nums text-muted-foreground">
            {shown ? (
              <>
                po zapisaniu jako <strong className="text-foreground">{shown.toUpperCase()}</strong>{' '}
                · kolorów {colorCount(preview)}
                {lost > 0 && (
                  <span className="mt-0.5 block font-semibold text-amber-700 dark:text-amber-500">
                    stracone szczegóły: {lost} pikseli
                  </span>
                )}
                {lost === 0 && <span className="mt-0.5 block">nic nie stracone</span>}
              </>
            ) : (
              <>obrazek przed zapisaniem · kolorów {colorCount(current.pic)}</>
            )}
          </figcaption>
        </figure>

        <div className="min-w-0 space-y-2">
          {FORMATS.map((format) => {
            const id = key(source, format.id);
            const measured = weighed.includes(id);
            const bytes = weigh(current.pic, format.id);
            const width = measured ? Math.max(6, (bytes / maxBytes) * 100) : 0;
            return (
              <div key={format.id} className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => weighNow(format.id)}
                  className={cn(
                    'w-24 shrink-0 border-2 px-2 py-1.5 text-xs font-semibold transition',
                    'hover:bg-black/5 dark:hover:bg-white/5'
                  )}
                  style={{
                    borderColor: shown === format.id ? color : `${color}33`,
                    backgroundColor: shown === format.id ? `${color}14` : undefined,
                  }}
                >
                  Zważ {format.label}
                </button>
                <div className="h-7 min-w-0 flex-1 bg-muted">
                  <motion.div
                    className="flex h-full items-center justify-end px-2"
                    style={{ backgroundColor: format.lossy ? `${color}99` : color }}
                    initial={false}
                    animate={{ width: `${width}%` }}
                    transition={{ type: 'spring', stiffness: 120, damping: 20 }}
                  >
                    {measured && (
                      <span className="whitespace-nowrap text-xs font-bold tabular-nums text-white">
                        {formatBytes(bytes)}
                      </span>
                    )}
                  </motion.div>
                </div>
              </div>
            );
          })}

          <p className="pt-1 text-xs leading-snug text-muted-foreground">
            {shown ? FORMATS.find((f) => f.id === shown)?.how : 'Kliknij „Zważ”, żeby zobaczyć wagę i to, co zostało z obrazka.'}
          </p>
        </div>
      </div>

      <AnimatePresence>
        {done && (
          <motion.div
            key="done"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t pt-4"
          >
            <p className="flex items-start gap-2 text-sm font-semibold sm:text-base">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>Osiem ważeń i dwóch różnych zwycięzców.</span>
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-2">
              <div className="border-l-2 p-3" style={{ borderColor: color }}>
                <p className="text-sm font-semibold">Rysunek → PNG</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Duże jednolite plamy da się zapisać krótko („tyle a tyle razy ten sam kolor”), więc
                  PNG chudnie i <strong className="text-foreground">nic nie traci</strong>. JPG na
                  ostrych krawędziach robi brudne kwadraciki i wcale nie jest lżejszy.
                </p>
              </div>
              <div className="border-l-2 p-3" style={{ borderColor: color }}>
                <p className="text-sm font-semibold">Zdjęcie → JPG</p>
                <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                  Tu każdy piksel jest inny, więc PNG{' '}
                  <strong className="text-foreground">nie ma czego ściskać</strong> i waży prawie
                  tyle co BMP. JPG wyrzuca różnice, których i tak nie widać — i dlatego wygrywa.
                </p>
              </div>
            </div>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              <strong className="text-foreground">BMP nie wygrał ani razu</strong> — nie ściska
              niczego, więc zawsze waży najwięcej. <strong className="text-foreground">GIF</strong>{' '}
              ma tylko 256 kolorów w tablicy: dla rysunku to aż nadto, dla zdjęcia stanowczo za mało.
              Został przy życiu dla jednej rzeczy, której nie ma żaden z pozostałych —{' '}
              <strong className="text-foreground">animacji</strong>.
            </p>
            <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
              Uwaga o liczbach: nasz obrazek ma 32 × 24 piksele, żeby dało się policzyć każdy, więc
              wagi wychodzą w bajtach. Prawdziwa kartka ma ich setki tysięcy i te same różnice robią
              się z bajtów megabajtami. Proporcje zostają te same.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
