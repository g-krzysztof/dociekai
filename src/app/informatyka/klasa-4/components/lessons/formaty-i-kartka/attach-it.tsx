'use client';

import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, FileWarning, Paperclip, Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSectionScrollAnchor } from '../../lesson-shell';
import { PictureView } from '../../picture-view';
import { CARD, diffPixels, encode, formatBytes, weigh, type Format } from './card';

/**
 * Symulator domykający lekcję i most do zadania Z-4 — **załącznik widziany z
 * drugiej strony**.
 *
 * Lekcja 12 (`netykieta-i-poczta`) ćwiczyła pisanie wiadomości; tutaj treść jest
 * już napisana i chodzi wyłącznie o **plik**, bo to on jest w Z-4 trudną
 * częścią. Dziecko wybiera jeden z pięciu plików z folderu i wysyła; skrzynka
 * odrzuca za ciężki załącznik, a odbiorczyni **próbuje go otworzyć** — i plik
 * roboczy edytora odbija się właśnie na tym etapie, nie na wysyłce.
 *
 * Nowe w kursie jest to, że **poprawnych odpowiedzi są trzy** (PNG, GIF, JPG), a
 * każda kończy się inaczej: to, co odbiorczyni zobaczy na ekranie, jest tym, co
 * naprawdę zapisał wybrany format (`encode`), więc po JPG-u dostaje kartkę z
 * brudnymi krawędziami i mówi o tym wprost. Konsekwencja zamiast oceny — ta sama
 * zasada co w `PileOn` i `TwoSides`.
 */

/** Limit skrzynki w skali tej pracowni (obrazek ma 32 × 24 piksele). */
const LIMIT = 1500;

interface FileItem {
  name: string;
  /** `null` dla pliku roboczego edytora — on nie jest obrazkiem. */
  format: Format | null;
  bytes: number;
  hint: string;
}

const FILES: FileItem[] = [
  { name: 'kartka.png', format: 'png', bytes: weigh(CARD, 'png'), hint: 'zapis bezstratny' },
  { name: 'kartka.jpg', format: 'jpg', bytes: weigh(CARD, 'jpg'), hint: 'zapis stratny' },
  { name: 'kartka.gif', format: 'gif', bytes: weigh(CARD, 'gif'), hint: 'najwyżej 256 kolorów' },
  { name: 'kartka.bmp', format: 'bmp', bytes: weigh(CARD, 'bmp'), hint: 'bez ściskania' },
  {
    name: 'kartka-projekt.kra',
    format: null,
    bytes: 980,
    hint: 'plik roboczy programu do rysowania',
  },
];

type Outcome =
  | { kind: 'ok'; file: FileItem; damage: number }
  | { kind: 'za-duzy'; file: FileItem }
  | { kind: 'nie-otwiera'; file: FileItem };

interface AttachItProps {
  color: string;
  onComplete?: () => void;
}

export function AttachIt({ color, onComplete }: AttachItProps) {
  const [attached, setAttached] = useState<FileItem | null>(null);
  const [outcome, setOutcome] = useState<Outcome | null>(null);
  const [tried, setTried] = useState<string[]>([]);

  const reported = useRef(false);
  const delivered = outcome?.kind === 'ok';
  const anchorRef = useSectionScrollAnchor(delivered ? 'dostarczone' : 'pisanie');

  useEffect(() => {
    if (!delivered || reported.current) return;
    reported.current = true;
    onComplete?.();
  }, [delivered, onComplete]);

  const send = () => {
    if (!attached || delivered) return;
    if (!tried.includes(attached.name)) setTried([...tried, attached.name]);
    if (attached.format === null) {
      setOutcome({ kind: 'nie-otwiera', file: attached });
      return;
    }
    if (attached.bytes > LIMIT) {
      setOutcome({ kind: 'za-duzy', file: attached });
      return;
    }
    setOutcome({
      kind: 'ok',
      file: attached,
      damage: diffPixels(CARD, encode(CARD, attached.format), 8),
    });
  };

  return (
    <div ref={anchorRef} className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Kartka gotowa, wiadomość napisana. Zostało jedno: <strong>dołączyć właściwy plik</strong>.
        W folderze leży pięć — wszystkie nazywają się prawie tak samo.
      </p>

      <div className="grid gap-5 md:grid-cols-2">
        {/* Makieta okna poczty — świadomie poza językiem wizualnym kursu,
            jak makieta pulpitu w teście diagnostycznym. */}
        <div className="border bg-zinc-50 text-sm dark:bg-zinc-800/60">
          <div className="border-b px-3 py-2">
            <p className="text-xs text-muted-foreground">
              Do: <span className="text-foreground">babcia.krystyna@poczta.pl</span>
            </p>
            <p className="text-xs text-muted-foreground">
              Temat: <span className="text-foreground">Kartka urodzinowa od Igi</span>
            </p>
          </div>
          <div className="px-3 py-2.5 leading-relaxed">
            <p>Kochana Babciu,</p>
            <p className="mt-1.5">
              wszystkiego najlepszego! Zrobiłam dla Ciebie kartkę — dołączam ją do tej wiadomości.
            </p>
            <p className="mt-1.5">Iga</p>
          </div>
          <div className="border-t px-3 py-2.5">
            <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              <Paperclip className="h-3.5 w-3.5" aria-hidden />
              Załącznik
            </p>
            {attached ? (
              <p className="flex flex-wrap items-baseline gap-x-2 font-mono text-xs">
                <span className="font-semibold">{attached.name}</span>
                <span className="tabular-nums text-muted-foreground">
                  {formatBytes(attached.bytes)}
                </span>
              </p>
            ) : (
              <p className="text-xs italic text-muted-foreground">
                brak — wybierz plik z folderu obok
              </p>
            )}
            <button
              type="button"
              onClick={send}
              disabled={!attached || delivered}
              className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-40"
              style={{ backgroundColor: color }}
            >
              <Send className="h-3.5 w-3.5" aria-hidden />
              Wyślij
            </button>
            <p className="mt-1.5 text-[11px] text-muted-foreground">
              Ta skrzynka przyjmuje załączniki do {formatBytes(LIMIT)}.
            </p>
          </div>
        </div>

        {/* Folder z plikami */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            Folder „Kartka dla babci”
          </p>
          <ul className="space-y-1.5">
            {FILES.map((file) => {
              const active = attached?.name === file.name;
              return (
                <li key={file.name}>
                  <button
                    type="button"
                    onClick={() => {
                      if (delivered) return;
                      setAttached(file);
                      setOutcome(null);
                    }}
                    aria-pressed={active}
                    className={cn(
                      'flex w-full items-baseline justify-between gap-2 border-2 px-2.5 py-2 text-left transition',
                      !active && !delivered && 'hover:bg-black/5 dark:hover:bg-white/5'
                    )}
                    style={{
                      borderColor: active ? color : `${color}33`,
                      backgroundColor: active ? `${color}12` : undefined,
                    }}
                  >
                    <span className="min-w-0">
                      <span className="block truncate font-mono text-xs font-semibold">
                        {file.name}
                      </span>
                      <span className="block text-[11px] text-muted-foreground">{file.hint}</span>
                    </span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">
                      {formatBytes(file.bytes)}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <AnimatePresence mode="wait">
        {outcome && (
          <motion.div
            key={`${outcome.kind}-${outcome.file.name}`}
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-4"
          >
            {outcome.kind === 'ok' ? (
              <div className="p-3" style={{ backgroundColor: `${color}14` }}>
                <p className="mb-2 flex items-start gap-2 text-sm font-semibold">
                  <Check className="mt-0.5 h-4 w-4 shrink-0" style={{ color }} aria-hidden />
                  <span>Dostarczone. Babcia otwiera załącznik i widzi to:</span>
                </p>
                <div className="flex flex-wrap items-start gap-4">
                  <div className="w-[180px] shrink-0 border-2 p-1.5" style={{ borderColor: color }}>
                    <PictureView
                      pic={encode(CARD, outcome.file.format as Format)}
                      label="Kartka otwarta przez odbiorczynię"
                    />
                  </div>
                  <p className="min-w-[200px] flex-1 text-sm italic leading-relaxed">
                    {outcome.damage === 0
                      ? '„Śliczna kartka! Widzę ją dokładnie tak, jak ją narysowałaś — każdy kolor na swoim miejscu. Dziękuję!”'
                      : `„Śliczna kartka, dziękuję! Tylko wokół świeczek widzę jakieś drobne kwadraciki — o, w ${outcome.damage} miejscach coś się rozmyło. Ale i tak piękna.”`}
                  </p>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {outcome.damage === 0
                    ? 'Plik dojechał lekki i nietknięty — bo kartka to rysunek, a rysunki zapisuje się bezstratnie.'
                    : 'Wysłanie się udało, tylko kartka jest rysunkiem, a nie zdjęciem — zapis stratny zabrudził jej ostre krawędzie. Spróbuj wysłać ją jeszcze raz w innym formacie i porównaj, co babcia zobaczy.'}
                </p>
              </div>
            ) : (
              <div className="border-l-2 border-amber-500 bg-amber-50 p-3 dark:bg-amber-950/30">
                <p className="flex items-start gap-2 text-sm leading-relaxed">
                  <FileWarning className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" aria-hidden />
                  <span>
                    {outcome.kind === 'za-duzy' ? (
                      <>
                        <strong>Wiadomość wróciła.</strong> Załącznik waży{' '}
                        {formatBytes(outcome.file.bytes)}, a skrzynka przyjmuje do{' '}
                        {formatBytes(LIMIT)}. Ten format nie ściska obrazka wcale — ta sama kartka
                        zapisana inaczej waży kilka razy mniej i przejdzie bez problemu.
                      </>
                    ) : (
                      <>
                        <strong>Wysłane, ale babcia odpisała:</strong> „Kochanie, coś mi tu przyszło,
                        ale mój komputer nie wie, jak to otworzyć”. To był plik{' '}
                        <strong>roboczy</strong> twojego programu do rysowania — świetny, żeby
                        wrócić do pracy nad kartką, ale otworzy go tylko ten jeden program. Żeby
                        wysłać obrazek komuś, trzeba go najpierw{' '}
                        <strong>wyeksportować albo zapisać jako obrazek</strong>.
                      </>
                    )}
                  </span>
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {tried.length > 1 && (
        <p className="mt-3 text-xs text-muted-foreground">
          Sprawdzone pliki: {tried.join(', ')}.
        </p>
      )}
    </div>
  );
}
