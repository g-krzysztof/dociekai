'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '@/lib/utils';

/**
 * Wyjaśnienie lekcji: budowa nazwy pliku (nazwa + kropka + rozszerzenie), a pod
 * nią sześć kart z najczęstszymi rozszerzeniami — co w takim pliku jest i czym
 * się go otwiera. Wzorzec „otwórz, żeby zobaczyć" z `ByteLadder` / `IoMap`.
 *
 * Blok kończy się po otwarciu wszystkich sześciu kart. Uwaga pod kartami mówi
 * wprost, że rozszerzenie to nie ozdoba — i że samo jego przepisanie nie zmienia
 * zawartości pliku.
 */

interface ExtCard {
  id: string;
  ext: string;
  kind: string;
  detail: string;
  opens: string;
}

const CARDS: ExtCard[] = [
  {
    id: 'doc',
    ext: '.docx / .odt',
    kind: 'dokument tekstowy',
    detail:
      'Tekst z formatowaniem: nagłówki, listy, pogrubienia, wstawione obrazki. .docx zapisuje Word, .odt — LibreOffice, ale oba programy otworzą jedno i drugie.',
    opens: 'Microsoft Word, LibreOffice Writer, Dokumenty Google',
  },
  {
    id: 'pdf',
    ext: '.pdf',
    kind: 'dokument gotowy do czytania i druku',
    detail:
      'Wygląda tak samo na każdym komputerze i telefonie — dlatego wysyła się nim gotowe pisma i bilety. Za to trudno go zmieniać: to raczej „wydruk na ekranie" niż plik do pracy.',
    opens: 'czytnik PDF, każda przeglądarka internetowa',
  },
  {
    id: 'img',
    ext: '.jpg / .png',
    kind: 'obraz',
    detail:
      '.jpg jest mniejszy i nadaje się do zdjęć. .png bierze się tam, gdzie potrzeba ostrych krawędzi albo przezroczystego tła — na przykład do rysunku czy logo.',
    opens: 'przeglądarka zdjęć, edytor grafiki, przeglądarka internetowa',
  },
  {
    id: 'mp3',
    ext: '.mp3',
    kind: 'dźwięk',
    detail: 'Muzyka, nagranie głosu, podcast. Sam dźwięk, bez obrazu — dlatego plik jest niewielki.',
    opens: 'odtwarzacz muzyki, przeglądarka internetowa',
  },
  {
    id: 'mp4',
    ext: '.mp4',
    kind: 'film',
    detail:
      'Obraz i dźwięk razem. Dlatego filmy „ważą" dużo więcej niż zdjęcia czy piosenki — minuta filmu to często kilkadziesiąt megabajtów.',
    opens: 'odtwarzacz wideo, przeglądarka internetowa',
  },
  {
    id: 'xls',
    ext: '.xlsx / .ods',
    kind: 'arkusz kalkulacyjny',
    detail:
      'Tabela z liczbami, która sama się przelicza, i wykresy zrobione z tych liczb. .xlsx to Excel, .ods — LibreOffice Calc.',
    opens: 'Microsoft Excel, LibreOffice Calc, Arkusze Google',
  },
];

interface FilenameAnatomyProps {
  color: string;
  onComplete?: () => void;
}

export function FilenameAnatomy({ color, onComplete }: FilenameAnatomyProps) {
  const [seen, setSeen] = useState<string[]>([]);
  const [open, setOpen] = useState<string | null>(null);

  const reveal = (id: string) => {
    setOpen((prev) => (prev === id ? null : id));
    if (seen.includes(id)) return;
    const next = [...seen, id];
    setSeen(next);
    if (next.length === CARDS.length) onComplete?.();
  };

  const finished = seen.length === CARDS.length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      {/* Budowa nazwy pliku */}
      <div className="mb-6">
        <p className="mb-3 text-sm leading-relaxed sm:text-base">
          Każda nazwa pliku ma dwie części, rozdzielone <strong>kropką</strong>:
        </p>
        <div className="flex flex-wrap items-stretch gap-1 font-mono text-sm sm:text-base">
          <span className="flex flex-col">
            <span
              className="border-2 px-3 py-2 font-semibold"
              style={{ borderColor: color, color }}
            >
              pszczoly-referat
            </span>
            <span className="mt-1 text-center text-[11px] font-sans text-muted-foreground">
              nazwa — wymyślasz ją ty
            </span>
          </span>
          <span className="flex flex-col">
            <span className="px-1 py-2 text-2xl font-bold leading-none">.</span>
          </span>
          <span className="flex flex-col">
            <span
              className="border-2 px-3 py-2 font-semibold"
              style={{ borderColor: 'var(--muted-foreground)' }}
            >
              docx
            </span>
            <span className="mt-1 text-center text-[11px] font-sans text-muted-foreground">
              rozszerzenie — mówi, co to za plik
            </span>
          </span>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          <strong>Otwórz każdą kartę</strong> i zobacz, co kryje się pod danym rozszerzeniem i czym
          taki plik się otwiera.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {seen.length}/{CARDS.length}
        </p>
      </div>

      <ul className="space-y-1.5">
        {CARDS.map((card) => {
          const isSeen = seen.includes(card.id);
          const isOpen = open === card.id;
          return (
            <li key={card.id}>
              <button
                type="button"
                onClick={() => reveal(card.id)}
                aria-expanded={isOpen}
                className={cn(
                  'flex w-full cursor-pointer items-center gap-3 border p-3 text-left transition-colors',
                  isOpen ? '' : 'hover:bg-muted/40'
                )}
                style={isOpen ? { borderColor: color, backgroundColor: `${color}0f` } : undefined}
              >
                <span
                  className="flex h-9 shrink-0 items-center justify-center border px-2 font-mono text-sm font-bold"
                  style={{
                    borderColor: isSeen ? color : 'var(--border)',
                    color: isSeen ? color : 'var(--muted-foreground)',
                  }}
                >
                  {card.ext}
                </span>
                <span className="min-w-0 flex-1 font-semibold leading-snug">{card.kind}</span>
              </button>

              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                  >
                    <div
                      className="border border-t-0 p-3 text-sm leading-relaxed"
                      style={{ borderColor: color }}
                    >
                      <p className="text-muted-foreground">{card.detail}</p>
                      <p className="mt-2">
                        <span
                          className="text-xs font-bold uppercase tracking-wide"
                          style={{ color: `color-mix(in oklch, ${color} 88%, black)` }}
                        >
                          Otwiera:{' '}
                        </span>
                        {card.opens}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-muted-foreground">
        Rozszerzenie to nie ozdoba — to po nim komputer poznaje, którym programem otworzyć plik.
        Samo przepisanie go w nazwie (z <span className="font-mono">.mp3</span> na{' '}
        <span className="font-mono">.mp4</span>) niczego nie zmienia w środku, a często psuje plik.
      </p>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Wszystkie sześć rozszerzeń otwarte.</strong> Patrząc na koniec nazwy, wiesz z
            góry: co jest w pliku i jaki program go otworzy. W następnym bloku wykorzystasz to, żeby
            posprzątać czyjś pulpit.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
