'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import {
  FORMATS,
  PAPER,
  PHOTO,
  at,
  diffPixels,
  encode,
  formatBytes,
  formatInfo,
  weigh,
  type Format,
  type Picture,
} from './card';

/**
 * Blok `debugowanie` — **trzy pliki, które wróciły od odbiorcy**, i trzy zupełnie
 * różne usterki. Dziecko nie wybiera odpowiedzi z listy: zapisuje plik jeszcze
 * raz w innym formacie i **od razu widzi wynik**, bo podgląd to `encode()`,
 * czyli dokładnie ta sama operacja, z której liczy się waga.
 *
 * Trzy usterki są celowo z trzech różnych porządków — gdyby wszystkie były
 * „widać brzydkie kwadraty”, blok byłby jednym zadaniem powtórzonym trzy razy:
 *  1. **przezroczystość** — JPG jej nie zna, więc pod naklejką ląduje biały
 *     prostokąt (to ta sama pułapka, co „przezroczyste zaznaczenie” przy
 *     koniczynie w lekcji 15, tylko że tym razem robi ją format pliku);
 *  2. **ostre krawędzie** — JPG uśrednia bloki, więc cienkie linie brudzą się
 *     kwadracikami; tu poprawnych odpowiedzi jest **dwie** (PNG i GIF), bo
 *     liczy się warunek, a nie jedna właściwa nazwa;
 *  3. **nadwaga bez żadnej usterki** — zdjęcie zapisane w PNG wygląda idealnie i
 *     właśnie dlatego jest najtrudniejsze: błąd widać dopiero na wadze.
 */

/* ── Obrazki testowe ──────────────────────────────────────────────────────── */

const MINT = '#bfe3d0';

/** Naklejka z gwiazdką: wszystko dookoła to `PAPER`, czyli **przezroczystość**. */
function buildSticker(): Picture {
  const w = 16;
  const h = 16;
  const cells = new Array<string>(w * h).fill(PAPER);
  const star: [number, number][] = [
    [8, 1], [7, 2], [8, 2], [9, 2], [7, 3], [8, 3], [9, 3],
    [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [11, 5], [12, 5], [13, 5],
    [3, 6], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [10, 6], [11, 6], [12, 6],
    [4, 7], [5, 7], [6, 7], [7, 7], [8, 7], [9, 7], [10, 7], [11, 7],
    [5, 8], [6, 8], [7, 8], [8, 8], [9, 8], [10, 8],
    [4, 9], [5, 9], [6, 9], [9, 9], [10, 9], [11, 9],
    [3, 10], [4, 10], [11, 10], [12, 10],
    [2, 11], [3, 11], [12, 11], [13, 11],
  ];
  star.forEach(([x, y]) => {
    cells[at(w, x, y)] = '#f2b134';
  });
  return { w, h, cells };
}

const STICKER = buildSticker();

/**
 * Nakłada naklejkę na kolorowe tło. Format bez przezroczystości nie ma jak
 * zapisać „tu nic nie ma”, więc puste miejsca zostają białe — i to jest cała
 * awaria numer jeden, policzona, a nie narysowana z ręki.
 */
function composite(sticker: Picture, background: string, keepsTransparency: boolean): Picture {
  const cells = sticker.cells.map((color) =>
    color === PAPER ? (keepsTransparency ? background : '#ffffff') : color
  );
  return { ...sticker, cells };
}

/** Zaproszenie: cienka ramka i paski „napisu” — same ostre krawędzie. */
function buildInvite(): Picture {
  const w = 32;
  const h = 24;
  const cells = new Array<string>(w * h).fill('#fdf6ea');
  const ink = '#243b53';
  const put = (x: number, y: number, color = ink) => {
    if (x >= 0 && y >= 0 && x < w && y < h) cells[at(w, x, y)] = color;
  };
  for (let x = 1; x < w - 1; x += 1) {
    put(x, 1);
    put(x, h - 2);
  }
  for (let y = 1; y < h - 1; y += 1) {
    put(1, y);
    put(w - 2, y);
  }
  /* „Napis” jako trzy wiersze kresek — najostrzejsze, co może być na obrazku. */
  const lines: [number, number, number][] = [
    [6, 6, 20],
    [6, 10, 14],
    [6, 14, 18],
  ];
  lines.forEach(([x0, y, len]) => {
    for (let i = 0; i < len; i += 1) if (i % 4 !== 3) put(x0 + i, y);
  });
  for (let x = 5; x < 27; x += 1) put(x, 18, '#c0392b');
  return { w, h, cells };
}

const INVITE = buildInvite();

/** Waga najlżejszego z czterech formatów dla danego obrazka. */
function lightest(pic: Picture): number {
  return Math.min(...FORMATS.map((f) => weigh(pic, f.id)));
}

/* ── Trzy awarie ──────────────────────────────────────────────────────────── */

interface Case {
  id: string;
  file: string;
  /** Co powiedział odbiorca — objaw, nie diagnoza. */
  complaint: string;
  /** Format, w którym plik przyszedł zepsuty. */
  broken: Format;
  source: Picture;
  /** Renderowanie podglądu: naklejka idzie na tło, reszta wprost. */
  onBackground?: boolean;
  accept: (format: Format) => boolean;
  reject: (format: Format) => string;
  learned: string;
}

const CASES: Case[] = [
  {
    id: 'naklejka',
    file: 'naklejka.jpg',
    complaint:
      '„Wkleiłam twoją gwiazdkę na zieloną kartkę i wyszedł wokół niej biały prostokąt. Da się to jakoś usunąć?”',
    broken: 'jpg',
    source: STICKER,
    onBackground: true,
    accept: (format) => formatInfo(format).transparency,
    reject: () =>
      'Biały prostokąt dalej jest. Ten format nie umie zapisać informacji „tutaj nic nie ma” — każde puste miejsce musi mieć w nim jakiś kolor, a domyślnie to biel.',
    learned:
      'Przezroczystość to nie kolor, tylko osobna informacja przy każdym pikselu: „mnie tu nie ma”. Umieją ją zapisać PNG i GIF. JPG i BMP nie — dlatego naklejka, logo i wszystko, co ma leżeć na czymś innym, zapisuje się w PNG.',
  },
  {
    id: 'zaproszenie',
    file: 'zaproszenie.jpg',
    complaint:
      '„Wydrukowałem zaproszenie i litery mają wokół siebie brudne kwadraciki. Ramka też jest jakaś postrzępiona.”',
    broken: 'jpg',
    source: INVITE,
    accept: (format) =>
      diffPixels(INVITE, encode(INVITE, format), 8) === 0 && weigh(INVITE, format) < weigh(INVITE, 'bmp'),
    reject: (format) =>
      diffPixels(INVITE, encode(INVITE, format), 8) > 0
        ? 'Kwadraciki zostały. Ten format uśrednia sąsiednie piksele, a przy cienkiej kresce sąsiadem kreski jest tło — więc kreska się brudzi.'
        : 'Wygląda idealnie, bo ten format nic nie gubi. Ale niczego też nie ściska: plik waży cztery razy więcej, niż musi. Jest lżejszy sposób na to samo.',
    learned:
      'Im ostrzejsza krawędź, tym gorzej znosi ją zapis stratny. Napisy, ramki, komiksy i zrzuty ekranu to same ostre krawędzie — dla nich JPG jest najgorszym możliwym wyborem. Zdały tu dwa formaty, bo liczy się warunek („nic nie gubi i jednocześnie ściska”), a nie jedna właściwa nazwa.',
  },
  {
    id: 'zdjecie',
    file: 'zdjecie-tortu.png',
    complaint:
      '„Zdjęcie wygląda świetnie, ale nie chce się wysłać — skrzynka mówi, że załącznik jest za duży. Zapisz je najlżej, jak się da, żeby dalej wyglądało jak zdjęcie.”',
    broken: 'png',
    source: PHOTO,
    /* Tu jedynym sensownym kryterium jest waga. Licznik zmienionych pikseli
       byłby mylący: na zaszumionym zdjęciu stratny zapis rusza setki pikseli i
       mimo to nikt tego nie widzi — na tym polega cała sztuczka JPG-a. */
    accept: (format) => weigh(PHOTO, format) === lightest(PHOTO),
    reject: (format) =>
      formatInfo(format).lossy
        ? 'Schudł tylko odrobinę, a kolorów już ubyło — ten format trzyma w tablicy najwyżej 256 barw, a zdjęcie potrzebuje ich setek. Jest lżejszy sposób.'
        : 'Ten plik nie schudł. Na zdjęciu każdy piksel jest inny niż sąsiad, więc zapis bez straty nie ma czego ściskać — musi zapisać wszystko po kolei.',
    learned:
      'Ta awaria jest najpodstępniejsza, bo na obrazku nic nie widać — widać ją dopiero na wadze. Zdjęcia zapisuje się w JPG właśnie dlatego: wyrzuca różnice tak drobne, że oko ich nie zauważy, a plik wyraźnie chudnie.',
  },
];

interface BadSaveProps {
  color: string;
  onComplete?: () => void;
}

export function BadSave({ color, onComplete }: BadSaveProps) {
  const [index, setIndex] = useState(0);
  const [pick, setPick] = useState<Format | null>(null);
  const [note, setNote] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);
  const [done, setDone] = useState(false);

  const reported = useRef(false);
  const anchorRef = useSectionScrollAnchor(`${index}-${done}`);
  const item = CASES[index];

  useEffect(() => {
    if (!done || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [done, onComplete]);

  const render = (format: Format): Picture => {
    const coded = encode(item.source, format);
    return item.onBackground ? composite(coded, MINT, formatInfo(format).transparency) : coded;
  };

  const brokenPic = render(item.broken);
  const tryPic = pick ? render(pick) : null;

  const send = () => {
    if (!pick || solved) return;
    if (item.accept(pick)) {
      setSolved(true);
      setNote(null);
      return;
    }
    setNote(item.reject(pick));
  };

  const nextCase = () => {
    if (index === CASES.length - 1) {
      setDone(true);
      return;
    }
    setIndex(index + 1);
    setPick(null);
    setNote(null);
    setSolved(false);
  };

  if (done) {
    return (
      <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
        <p className="text-sm font-semibold sm:text-base" style={{ color }}>
          Trzy reklamacje, trzy zupełnie różne przyczyny.
        </p>
        <p className="mt-2 text-sm leading-relaxed sm:text-base">
          Zwróć uwagę, że ani razu nie chodziło o to, „który format jest lepszy”. Za każdym razem
          pytanie brzmiało: <strong>co jest na tym obrazku</strong> — przezroczyste tło? ostre
          kreski? setki odcieni? — i dopiero z tego wychodził format.
        </p>
        <ul className="mt-3 space-y-1.5 text-sm leading-relaxed">
          <li>
            <strong>Przezroczyste tło</strong> → PNG (albo GIF). JPG zamaluje je bielą.
          </li>
          <li>
            <strong>Napisy, ramki, zrzuty ekranu</strong> → PNG. JPG zabrudzi krawędzie.
          </li>
          <li>
            <strong>Zdjęcie</strong> → JPG. PNG nie ma czego ściskać i plik jest za ciężki.
          </li>
        </ul>
      </div>
    );
  }

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-1 flex flex-wrap items-baseline justify-between gap-2">
        <p className="font-mono text-sm font-semibold">{item.file}</p>
        <p className="text-xs tabular-nums text-muted-foreground">
          reklamacja {index + 1} z {CASES.length}
        </p>
      </div>
      <p className="mb-4 border-l-2 pl-3 text-sm italic leading-relaxed" style={{ borderColor: color }}>
        {item.complaint}
      </p>

      <div className="grid gap-4 sm:grid-cols-2">
        <Panel
          title="Co przyszło"
          sub={`${item.broken.toUpperCase()} · ${formatBytes(weigh(item.source, item.broken))}`}
          pic={brokenPic}
          border="#d97706"
        />
        <Panel
          title="Twój nowy zapis"
          sub={
            pick
              ? `${pick.toUpperCase()} · ${formatBytes(weigh(item.source, pick))}`
              : 'wybierz format poniżej'
          }
          pic={tryPic ?? brokenPic}
          border={pick ? (solved ? color : `${color}66`) : '#d4d4d8'}
          dim={!pick}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {FORMATS.map((format) => (
          <button
            key={format.id}
            type="button"
            onClick={() => {
              if (solved) return;
              setPick(format.id);
              setNote(null);
            }}
            aria-pressed={pick === format.id}
            className={cn(
              'border-2 px-3 py-1.5 text-sm font-semibold transition',
              !solved && 'hover:bg-black/5 dark:hover:bg-white/5'
            )}
            style={{
              borderColor: pick === format.id ? color : `${color}33`,
              backgroundColor: pick === format.id ? `${color}14` : undefined,
            }}
          >
            Zapisz jako {format.label}
          </button>
        ))}
      </div>

      {!solved && (
        <button
          type="button"
          onClick={send}
          disabled={!pick}
          className="mt-3 px-4 py-2 text-sm font-semibold text-white disabled:opacity-40"
          style={{ backgroundColor: color }}
        >
          Wyślij poprawiony plik
        </button>
      )}

      <AnimatePresence mode="wait">
        {solved ? (
          <motion.div
            key="solved"
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4 p-3"
            style={{ backgroundColor: `${color}14` }}
          >
            <p className="flex items-start gap-2 text-sm leading-relaxed">
              <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
              <span>{item.learned}</span>
            </p>
            <button
              type="button"
              onClick={nextCase}
              className="mt-3 px-4 py-2 text-sm font-semibold text-white"
              style={{ backgroundColor: color }}
            >
              {index === CASES.length - 1 ? 'Podsumowanie' : 'Następna reklamacja'}
            </button>
          </motion.div>
        ) : note ? (
          <motion.p
            key={note}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="mt-4 border-l-2 border-amber-500 bg-amber-50 p-3 text-sm leading-relaxed dark:bg-amber-950/30"
          >
            {note}
          </motion.p>
        ) : null}
      </AnimatePresence>
    </div>
  );
}

function Panel({
  title,
  sub,
  pic,
  border,
  dim = false,
}: {
  title: string;
  sub: string;
  pic: Picture;
  border: string;
  dim?: boolean;
}) {
  return (
    <figure className="min-w-0">
      <figcaption className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </figcaption>
      <div className={cn('border-2 p-1.5 transition-opacity', dim && 'opacity-40')} style={{ borderColor: border }}>
        <PictureView pic={pic} label={`${title}: ${sub}`} />
      </div>
      <p className="mt-1.5 text-xs tabular-nums text-muted-foreground">{sub}</p>
    </figure>
  );
}
