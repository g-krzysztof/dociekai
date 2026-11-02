'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { FileText, Image as ImageIcon, FileType2, FileQuestion, type LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Haczyk lekcji: dziecko dostaje listę plików z fatalnymi nazwami i polecenie
 * „znajdź swój referat o pszczołach sprzed dwóch tygodni". Nie da się — i o to
 * chodzi. Po kilku próbach (albo od razu, przyciskiem) odsłania się wniosek:
 * dobra nazwa odpowiada na trzy pytania — co to jest, z kiedy, która wersja —
 * i pokazuje ten sam plik nazwany porządnie.
 *
 * Klikanie niczego nie blokuje i nie punktuje; blok kończy się po odsłonięciu
 * odpowiedzi (wzorzec haczyka z `photo-weight-hook`).
 */

interface MessFile {
  id: string;
  name: string;
  icon: LucideIcon;
}

const FILES: MessFile[] = [
  { id: 'f1', name: 'Nowy dokument (2).docx', icon: FileText },
  { id: 'f2', name: 'bez tytułu.odt', icon: FileText },
  { id: 'f3', name: 'asdfgh.docx', icon: FileText },
  { id: 'f4', name: 'DSC_0481.jpg', icon: ImageIcon },
  { id: 'f5', name: '1.docx', icon: FileText },
  { id: 'f6', name: 'Kopia kopii referat FINAL final.docx', icon: FileText },
  { id: 'f7', name: 'zrzut ekranu 2026-04-30.png', icon: ImageIcon },
  { id: 'f8', name: 'notatki2.txt', icon: FileType2 },
  { id: 'f9', name: 'to ważne!!!.docx', icon: FileText },
  { id: 'f10', name: 'ściągnięte (7).pdf', icon: FileQuestion },
];

interface FindInMessProps {
  color: string;
  onComplete?: () => void;
}

export function FindInMess({ color, onComplete }: FindInMessProps) {
  const [misses, setMisses] = useState<string[]>([]);
  const [revealed, setRevealed] = useState(false);

  const click = (id: string) => {
    if (revealed) return;
    setMisses((prev) => (prev.includes(id) ? prev : [...prev, id]));
  };

  const reveal = () => {
    if (revealed) return;
    setRevealed(true);
    onComplete?.();
  };

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <p className="mb-4 text-sm leading-relaxed sm:text-base">
        Oto czyjś folder z pracami. <strong>Kliknij plik, w którym jest referat o pszczołach sprzed
        dwóch tygodni.</strong>
      </p>

      {/* Makieta okna z listą plików — celowo wygląda jak system. */}
      <div className="border bg-zinc-100 dark:bg-zinc-800">
        <div className="flex items-center gap-1.5 border-b bg-zinc-200 px-3 py-2 dark:bg-zinc-700">
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="h-2.5 w-2.5 rounded-full bg-zinc-400" />
          <span className="ml-2 truncate text-xs font-medium text-zinc-600 dark:text-zinc-300">
            Dokumenty
          </span>
        </div>
        <ul className="divide-y divide-zinc-200 dark:divide-zinc-700">
          {FILES.map((file) => {
            const Icon = file.icon;
            const missed = misses.includes(file.id);
            return (
              <li key={file.id}>
                <motion.button
                  type="button"
                  onClick={() => click(file.id)}
                  disabled={revealed}
                  animate={missed ? { x: [0, -5, 5, -3, 0] } : { x: 0 }}
                  transition={{ duration: 0.3 }}
                  className={cn(
                    'flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors',
                    revealed ? 'cursor-default opacity-60' : 'cursor-pointer hover:bg-white dark:hover:bg-zinc-900/60',
                    missed && 'text-red-700 dark:text-red-400'
                  )}
                >
                  <Icon className="h-4 w-4 shrink-0 text-zinc-500" aria-hidden />
                  <span className="font-mono">{file.name}</span>
                </motion.button>
              </li>
            );
          })}
        </ul>
      </div>

      <AnimatePresence mode="wait">
        {misses.length > 0 && !revealed && (
          <motion.div
            key="miss"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mt-3 text-sm leading-relaxed"
          >
            <p className="text-red-700 dark:text-red-400">
              Po tej nazwie nie da się poznać, co jest w środku ani z kiedy pochodzi.
            </p>
            <button
              type="button"
              onClick={reveal}
              className="mt-2 cursor-pointer border-b text-sm font-semibold transition-colors hover:text-primary"
              style={{ borderColor: color, color }}
            >
              {misses.length >= 3 ? 'Poddaję się — pokaż dobrą nazwę' : 'Pokaż od razu dobrą nazwę'}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {revealed && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-5 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <p>
              Nie dało się. <strong>Dobra nazwa pliku odpowiada na trzy pytania:</strong>
            </p>
            <ol className="my-3 space-y-1.5">
              {['co to jest', 'z kiedy pochodzi', 'która to wersja'].map((q, i) => (
                <li key={q} className="flex items-start gap-2">
                  <span className="font-mono font-bold" style={{ color }}>
                    {i + 1}.
                  </span>
                  <span>{q}</span>
                </li>
              ))}
            </ol>
            <p>Ten sam referat z porządną nazwą wyglądałby tak:</p>
            <p
              className="mt-2 border-l-2 py-1.5 pl-3 font-mono text-sm font-semibold"
              style={{ borderColor: color, color }}
            >
              przyroda_pszczoly-referat_2026-04-30_wersja-koncowa.docx
            </p>
            <p className="mt-3 text-muted-foreground">
              Od razu wiadomo: przedmiot, temat, data i to, że to wersja końcowa. Takich plików nie
              trzeba szukać — wystarczy przeczytać nazwę.
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
