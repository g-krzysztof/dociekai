'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Slajd rysowany tak, jak wygląda naprawdę — i to jest w tym pliku jedyna
 * ważna decyzja.
 *
 * **Slajd 16:9 w PowerPoincie ma 960 × 540 punktów.** Dlatego makieta ma 960 ×
 * 540 **pikseli** i jest w całości skalowana (`transform: scale`) do szerokości
 * kolumny. Dzięki temu `fontSize: 24` w naszym slajdzie to dokładnie te same
 * 24 punkty, które dziecko zobaczy w swoim programie i które sprawdzi potem
 * werdykt z pliku. Gdyby litery były dobierane „na oko”, cała lekcja o
 * czytelności mówiłaby o czymś innym niż jej zadanie.
 *
 * Skalowanie musi iść przez `transform`, nie przez zmianę rozmiaru czcionki:
 * inaczej proporcja liter do slajdu zmienia się razem z szerokością okna i ten
 * sam slajd jest „czytelny” na desktopie, a nieczytelny na telefonie.
 */

export const SLIDE_W = 960;
export const SLIDE_H = 540;

/** Reguła, którą powtarza każdy podręcznik wystąpień: mniejszych liter na slajd się nie wstawia. */
export const MIN_POINTS = 24;

/* Pole na treść slajdu — tyle zostaje po tytule i marginesach. */
const BODY_W = 860;
const BODY_H = 320;
const LADDER = [44, 40, 36, 32, 28, 24, 20, 18, 16, 14, 12];

/**
 * Rozmiar liter dobrany tak, żeby tekst zmieścił się w polu treści — czyli to
 * samo, co robi „autodopasowanie” w PowerPoincie i w Impressie. Program nie
 * pyta o zdanie: **im więcej wpiszesz, tym mniejsze litery**, i właśnie ta
 * zależność jest treścią drugiego bloku.
 */
export function fitFontSize(lines: string[], boxHeight = BODY_H): number {
  if (lines.length === 0) return LADDER[0];
  for (const size of LADDER) {
    /* Przy przeciętnym kroju szerokość znaku to ~0,5 wysokości. */
    const perLine = Math.max(8, Math.floor(BODY_W / (size * 0.5)));
    const height = lines.reduce(
      (sum, line) => sum + Math.max(1, Math.ceil(line.length / perLine)) * size * 1.35,
      0
    );
    if (height <= boxHeight) return size;
  }
  return LADDER[LADDER.length - 1];
}

/** Ile wyrazów niesie ten tekst — myślnik ani punktor nie jest wyrazem. */
export function words(text: string): number {
  return text.split(/\s+/).filter((word) => /[\p{L}\p{N}]/u.test(word)).length;
}

/**
 * Płótno slajdu: stałe 960 × 540 px przeskalowane do szerokości rodzica.
 * `max-w` jest obowiązkowy — makieta o stałych proporcjach puszczona na całą
 * kolumnę rośnie na desktopie tak, że sterowanie pod nią wypada poza ekran
 * (audyt „wyświetlacz musi zostać na ekranie”).
 */
export function SlideStage({
  children,
  className,
  maxWidth = 620,
  dim,
}: {
  children: ReactNode;
  className?: string;
  maxWidth?: number;
  /** Slajd zgaszony — używane, gdy pokaz jeszcze nie ruszył albo już zniknął. */
  dim?: boolean;
}) {
  const box = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(0.5);

  useEffect(() => {
    const element = box.current;
    if (!element) return;
    const observer = new ResizeObserver(([entry]) => {
      setScale(entry.contentRect.width / SLIDE_W);
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, []);

  /* Wysokość liczy się ze skali: przeskalowany slajd nie zajmuje już miejsca w układzie. */
  return (
    <div
      ref={box}
      className={cn('mx-auto w-full', className)}
      style={{ maxWidth, height: scale * SLIDE_H }}
    >
      <div
        className={cn(
          /* `select-none`: slajd jest obrazkiem slajdu, a nie tekstem do zaznaczania — bez tego
             przeciąganie zdań w bloku 2 zamalowuje pół podglądu na niebiesko. */
          'relative origin-top-left select-none overflow-hidden border bg-white shadow-sm transition-opacity dark:border-zinc-700',
          dim && 'opacity-0'
        )}
        style={{
          width: SLIDE_W,
          height: SLIDE_H,
          transform: `scale(${scale})`,
          /* Slajd jest przedmiotem ze świata poza kursem — biały zostaje biały także w trybie ciemnym. */
          backgroundColor: '#ffffff',
          color: '#1c1917',
        }}
      >
        {children}
      </div>
    </div>
  );
}

export interface SlideContent {
  title?: string | null;
  /** Wiersze treści: punkty listy albo zdania akapitu. */
  lines?: string[];
  /** Akapit zamiast punktów — wtedy `lines` są sklejane w jedną bryłę tekstu. */
  paragraph?: boolean;
  picture?: 'jez' | 'wiewiorka' | 'ogrod' | 'dom' | 'pilka' | null;
  /** Wymuszony rozmiar liter treści; domyślnie liczony autodopasowaniem. */
  size?: number;
  accent?: string;
}

/** Treść slajdu w układzie „tytuł u góry, reszta pod nim”. */
export function SlideContentView({
  title,
  lines = [],
  paragraph,
  picture,
  size,
  accent = '#db2777',
}: SlideContent) {
  const text = paragraph ? [lines.join(' ')] : lines;
  const hasPicture = Boolean(picture);
  const body = size ?? fitFontSize(text.map((line) => (hasPicture ? line + '          ' : line)));

  return (
    <div className="absolute inset-0 px-[50px] py-[44px]">
      {title !== null && title !== undefined && (
        <h3
          className="font-semibold leading-tight"
          style={{ fontSize: 40, color: accent, marginBottom: 26 }}
        >
          {title}
        </h3>
      )}
      <div className="flex gap-[30px]">
        <div className="min-w-0 flex-1">
          {paragraph ? (
            <p style={{ fontSize: body, lineHeight: 1.35 }}>{text[0]}</p>
          ) : (
            <ul className="space-y-[10px]">
              {text.map((line, index) => (
                <li key={index} className="flex gap-[14px]" style={{ fontSize: body, lineHeight: 1.35 }}>
                  <span style={{ color: accent }} aria-hidden>
                    •
                  </span>
                  <span className="min-w-0">{line}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
        {hasPicture && <SlidePicture kind={picture!} />}
      </div>
    </div>
  );
}

/**
 * Rysunek na slajdzie. Celowo rysowany kodem, a nie wstawiany jako plik: ma być
 * widoczny natychmiast w każdym rozmiarze i nie ma prawa nieść ani jednej litery,
 * bo slajdy w tej lekcji liczą się co do wyrazu.
 */
export function SlidePicture({ kind }: { kind: NonNullable<SlideContent['picture']> }) {
  return (
    <svg width={230} height={190} viewBox="0 0 230 190" aria-hidden className="shrink-0">
      <rect x="1" y="1" width="228" height="188" fill="#fdf6ec" stroke="#e2d6c4" />
      {kind === 'dom' ? (
        <>
          <path d="M0 155 H230 V189 H0 Z" fill="#dcead3" />
          <path d="M115 44 L188 104 H42 Z" fill="#b5654a" />
          <rect x="60" y="104" width="110" height="51" fill="#eadfc8" stroke="#b7a68a" />
          <rect x="100" y="120" width="30" height="35" fill="#9c7b52" />
          <rect x="70" y="116" width="22" height="20" fill="#cfe2ef" stroke="#b7a68a" />
        </>
      ) : kind === 'pilka' ? (
        <>
          <path d="M0 158 H230 V189 H0 Z" fill="#dcead3" />
          <circle cx="115" cy="106" r="46" fill="#f4efe4" stroke="#6f5638" strokeWidth="3" />
          <path d="M115 72 l26 19 -10 31 h-32 l-10 -31 Z" fill="#6f5638" />
          <path d="M115 60 v12 M141 91 l20 -9 M131 122 l12 22 M99 122 l-12 22 M89 91 l-20 -9" stroke="#6f5638" strokeWidth="3" />
        </>
      ) : kind === 'ogrod' ? (
        <>
          <path d="M0 150 Q60 120 115 140 T230 130 V189 H0 Z" fill="#dcead3" />
          <circle cx="185" cy="40" r="22" fill="#fbe3a3" />
          <path d="M40 150 V95" stroke="#9c7b52" strokeWidth="7" />
          <circle cx="40" cy="80" r="30" fill="#b8d8a8" />
        </>
      ) : (
        <>
          <path d="M0 155 H230 V189 H0 Z" fill="#e8ddc8" />
          {kind === 'jez' ? (
            <>
              <ellipse cx="110" cy="122" rx="66" ry="42" fill="#a98a63" />
              {Array.from({ length: 16 }).map((_, index) => {
                const angle = Math.PI + (index / 15) * Math.PI;
                return (
                  <line
                    key={index}
                    x1={110 + Math.cos(angle) * 60}
                    y1={122 + Math.sin(angle) * 38}
                    x2={110 + Math.cos(angle) * 84}
                    y2={122 + Math.sin(angle) * 60}
                    stroke="#6f5638"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                );
              })}
              <circle cx="172" cy="128" r="17" fill="#d8bb92" />
              <circle cx="182" cy="126" r="3" fill="#3f3226" />
              <circle cx="188" cy="132" r="4" fill="#3f3226" />
            </>
          ) : (
            <>
              <path d="M95 150 Q60 120 70 70 Q78 34 108 44 Q126 52 116 88 Q108 116 122 150 Z" fill="#c08a4e" />
              <ellipse cx="128" cy="118" rx="34" ry="40" fill="#d9a367" />
              <circle cx="140" cy="86" r="24" fill="#d9a367" />
              <circle cx="150" cy="82" r="4" fill="#3f3226" />
              <path d="M128 66 l6 -16 l10 14 Z" fill="#c08a4e" />
            </>
          )}
        </>
      )}
    </svg>
  );
}
