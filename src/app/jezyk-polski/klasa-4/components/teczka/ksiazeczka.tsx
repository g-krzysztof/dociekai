'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { Printer } from 'lucide-react';
import { plural } from '@/lib/plural';
import { paragraphsOf } from '../../lib/polka/summary';
import type { TeczkaItem } from '../../lib/teczka/types';
import { lessonByKey } from '../polka/book-info';

/**
 * Książeczka z Teczki autora (E5c) — okładka, spis, każda kartka od nowej
 * strony. Na ekranie podgląd kartek A5, a „Drukuj” drukuje **tylko książeczkę**:
 * kopia stron trafia portalem do `<body>` (ukryta na ekranie), a reguła
 * `@media print` chowa wszystko inne. Numery stron w spisie są niemożliwe
 * (przeglądarka nie podaje ich treści), więc rozdziały mają numery.
 *
 * Tytuł i autora podaje wołający (L47 ustala, gdzie je trzymać). Pole autora
 * jest dobrowolne — mówimy „podpis”, nie prosimy o dane.
 */

export interface KsiazeczkaProps {
  color: string;
  title: string;
  author?: string;
  /** Kartki w kolejności książeczki (`bookletItems(items)`). */
  items: TeczkaItem[];
}

const PRINT_ID = 'pol-ksiazeczka-druk';
const PRINT_CSS = `@media print {
  @page { size: A5 portrait; margin: 16mm 14mm; }
  body > *:not(#${PRINT_ID}) { display: none !important; }
  #${PRINT_ID} { display: block !important; }
  #${PRINT_ID} .ks-page { break-after: page; }
  #${PRINT_ID} .ks-page:last-child { break-after: auto; }
}`;

function schoolYear(now: Date): string {
  const y = now.getFullYear();
  return now.getMonth() >= 8 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
}

export function Ksiazeczka({ color, title, author, items }: KsiazeczkaProps) {
  const [mounted, setMounted] = useState(false);
  // Portal i rok szkolny dopiero po montażu (SSR nie zna `document` ani daty urządzenia).
  useEffect(() => setMounted(true), []);

  if (items.length === 0) {
    return (
      <p data-testid="ksiazeczka-empty" className="border-2 border-dashed p-6 text-muted-foreground">
        Książeczka jest jeszcze pusta. Wybierz w Teczce kartki przyciskiem „Do książeczki”.
      </p>
    );
  }

  const year = mounted ? schoolYear(new Date()) : '';
  const pages = <Pages color={color} title={title} author={author} items={items} year={year} />;

  return (
    <div data-testid="ksiazeczka" className="space-y-4">
      <div className="flex min-h-10 flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          Podgląd: okładka, spis i {items.length} {plural(items.length, { one: 'kartka', few: 'kartki', many: 'kartek' })} — każda od nowej strony.
        </p>
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white"
          style={{ backgroundColor: color }}
        >
          <Printer className="h-4 w-4" aria-hidden /> Drukuj książeczkę
        </button>
      </div>

      <div className="space-y-4 bg-muted/40 p-3 sm:p-6">{pages}</div>

      {mounted &&
        createPortal(
          <div id={PRINT_ID} className="hidden bg-white text-black">
            <style>{PRINT_CSS}</style>
            {pages}
          </div>,
          document.body,
        )}
    </div>
  );
}

function Pages({ color, title, author, items, year }: KsiazeczkaProps & { year: string }) {
  return (
    <>
      <Sheet cover>
        <div className="flex h-full flex-col items-center border-4 border-double p-6 text-center" style={{ borderColor: color }}>
          <div className="my-auto">
            <p className="text-3xl font-bold leading-tight [overflow-wrap:anywhere]" style={{ color }}>
              {title.trim() || 'Moja książeczka'}
            </p>
            {author?.trim() && <p className="mt-4 text-lg">{author.trim()}</p>}
          </div>
          <p className="pt-6 text-xs opacity-70">
            Język polski, klasa 4{year ? ` · rok szkolny ${year}` : ''}
          </p>
        </div>
      </Sheet>

      <Sheet>
        <p className="mb-4 text-xl font-bold" style={{ color }}>
          Spis treści
        </p>
        <ol className="space-y-2">
          {items.map((it, i) => (
            <li key={it.id} className="flex gap-3">
              <span className="w-6 shrink-0 text-right font-semibold" style={{ color }}>
                {i + 1}.
              </span>
              <span>{it.title || 'Bez tytułu'}</span>
            </li>
          ))}
        </ol>
      </Sheet>

      {items.map((it, i) => {
        const lesson = lessonByKey(it.lesson);
        return (
          <Sheet key={it.id}>
            <p className="text-sm font-semibold" style={{ color }}>
              {i + 1}
            </p>
            <p className="mb-1 text-xl font-bold">{it.title || 'Bez tytułu'}</p>
            {lesson && <p className="mb-4 text-xs opacity-60">z lekcji „{lesson.short}”</p>}
            <div className="space-y-3 text-[15px] leading-relaxed [overflow-wrap:anywhere]">
              {paragraphsOf(it.text).map((p, j) => (
                <p key={j}>{p}</p>
              ))}
            </div>
          </Sheet>
        );
      })}
    </>
  );
}

/** Kartka A5 na ekranie; w druku zwykła strona (rozmiar daje `@page`). */
function Sheet({ children, cover = false }: { children: ReactNode; cover?: boolean }) {
  return (
    <section
      className={`ks-page mx-auto w-full max-w-md bg-white p-6 text-black shadow-sm print:max-w-none print:p-0 print:shadow-none ${
        cover ? 'aspect-[148/210] print:h-[178mm]' : 'min-h-[18rem] print:min-h-0'
      }`}
    >
      {children}
    </section>
  );
}
