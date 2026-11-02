'use client';

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Folder,
  FolderOpen,
  Image as ImageIcon,
  FileText,
  Music,
  Presentation,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/lib/utils';

/**
 * Symulator lekcji i jej centralny blok: makieta pulpitu z ośmioma
 * porozrzucanymi plikami i trzema folderami. Dziecko stuka plik, potem folder —
 * i po nazwie oraz rozszerzeniu rozstrzyga, dokąd plik należy. Zły wybór niczego
 * nie blokuje: folder się „otrząsa" i pada podpowiedź, żeby spojrzeć na
 * rozszerzenie.
 *
 * Makieta celowo wygląda jak system (ciemny pulpit, ikony folderów), nie jak
 * reszta strony — tak samo jak `DesktopFinder` w teście diagnostycznym. Blok
 * kończy się po uporządkowaniu wszystkich ośmiu plików.
 */

type FolderId = 'szkola' | 'zdjecia' | 'muzyka';

interface DeskFile {
  id: string;
  name: string;
  icon: LucideIcon;
  target: FolderId;
  hint: string;
}

const FILES: DeskFile[] = [
  { id: 'ulamki', name: 'lekcja-ulamki.docx', icon: FileText, target: 'szkola', hint: 'To dokument z lekcji — praca do szkoły.' },
  { id: 'morze', name: 'wakacje-morze.jpg', icon: ImageIcon, target: 'zdjecia', hint: '.jpg to zdjęcie.' },
  { id: 'piosenka', name: 'ulubiona-piosenka.mp3', icon: Music, target: 'muzyka', hint: '.mp3 to dźwięk.' },
  { id: 'kosmos', name: 'prezentacja-kosmos.odp', icon: Presentation, target: 'szkola', hint: '.odp to prezentacja — tu zrobiona na lekcję.' },
  { id: 'pies', name: 'selfie-z-psem.png', icon: ImageIcon, target: 'zdjecia', hint: '.png to obraz — tu zdjęcie.' },
  { id: 'koncert', name: 'koncert-nagranie.mp3', icon: Music, target: 'muzyka', hint: '.mp3 to nagranie dźwięku.' },
  { id: 'przyroda', name: 'test-przyroda.pdf', icon: FileText, target: 'szkola', hint: 'Test z przyrody — praca do szkoły.' },
  { id: 'zachod', name: 'zachod-slonca.jpg', icon: ImageIcon, target: 'zdjecia', hint: '.jpg to zdjęcie.' },
];

const FOLDERS: { id: FolderId; label: string }[] = [
  { id: 'szkola', label: 'Szkoła' },
  { id: 'zdjecia', label: 'Zdjęcia' },
  { id: 'muzyka', label: 'Muzyka' },
];

interface TidyDesktopProps {
  color: string;
  onComplete?: () => void;
}

export function TidyDesktop({ color, onComplete }: TidyDesktopProps) {
  /** id pliku → folder, do którego trafił. */
  const [placed, setPlaced] = useState<Record<string, FolderId>>({});
  const [selected, setSelected] = useState<string | null>(null);
  const [shakeFolder, setShakeFolder] = useState<FolderId | null>(null);
  const [hint, setHint] = useState<string | null>(null);

  const remaining = FILES.filter((file) => !placed[file.id]);
  const doneCount = FILES.length - remaining.length;
  const finished = remaining.length === 0;

  const selectFile = (id: string) => {
    setSelected((prev) => (prev === id ? null : id));
    setHint(null);
  };

  const dropInto = (folderId: FolderId) => {
    if (!selected) return;
    const file = FILES.find((f) => f.id === selected);
    if (!file) return;

    if (file.target === folderId) {
      const next = { ...placed, [file.id]: folderId };
      setPlaced(next);
      setSelected(null);
      setHint(null);
      if (Object.keys(next).length === FILES.length) onComplete?.();
    } else {
      setShakeFolder(folderId);
      setHint(`To nie tu. ${file.hint}`);
      setTimeout(() => setShakeFolder(null), 400);
    }
  };

  const countIn = (folderId: FolderId) =>
    Object.values(placed).filter((value) => value === folderId).length;

  return (
    <div className="border bg-white p-4 dark:bg-zinc-900/80 sm:p-6">
      <div className="mb-4 flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <p className="max-w-2xl text-sm leading-relaxed sm:text-base">
          Pulpit jest zawalony plikami. <strong>Stuknij plik, potem folder</strong>, do którego
          pasuje — patrz na nazwę i na rozszerzenie.
        </p>
        <p className="shrink-0 font-mono text-sm font-bold tabular-nums" style={{ color }}>
          {doneCount}/{FILES.length}
        </p>
      </div>

      {/* Makieta pulpitu — celowo wygląda jak system. */}
      <div className="border bg-gradient-to-b from-sky-900 to-slate-900 p-3 sm:p-5">
        {/* Porozrzucane pliki */}
        <div className="min-h-[4.5rem]">
          {finished ? (
            <p className="py-6 text-center text-sm font-medium text-sky-100">
              Pulpit pusty. Wszystko w folderach.
            </p>
          ) : (
            <ul className="flex flex-wrap gap-2">
              <AnimatePresence>
                {remaining.map((file) => {
                  const Icon = file.icon;
                  const isSelected = selected === file.id;
                  return (
                    <motion.li
                      key={file.id}
                      layout
                      exit={{ opacity: 0, scale: 0.6 }}
                      transition={{ duration: 0.2 }}
                    >
                      <button
                        type="button"
                        onClick={() => selectFile(file.id)}
                        aria-pressed={isSelected}
                        className={cn(
                          'flex w-full cursor-pointer items-center gap-2 border-2 px-2.5 py-2 text-left transition-colors',
                          isSelected
                            ? 'border-amber-400 bg-amber-400/20'
                            : 'border-transparent bg-white/10 hover:bg-white/20'
                        )}
                      >
                        <Icon className="h-4 w-4 shrink-0 text-sky-200" aria-hidden />
                        <span className="font-mono text-xs text-white">{file.name}</span>
                      </button>
                    </motion.li>
                  );
                })}
              </AnimatePresence>
            </ul>
          )}
        </div>

        {/* Foldery */}
        <div className="mt-4 grid grid-cols-3 gap-2 sm:gap-3">
          {FOLDERS.map((folder) => {
            const isShaking = shakeFolder === folder.id;
            const armed = selected !== null;
            const Icon = armed ? FolderOpen : Folder;
            return (
              <motion.button
                key={folder.id}
                type="button"
                onClick={() => dropInto(folder.id)}
                disabled={!armed}
                animate={isShaking ? { x: [0, -6, 6, -4, 0] } : { x: 0 }}
                transition={{ duration: 0.4 }}
                className={cn(
                  'flex flex-col items-center gap-1.5 border-2 border-dashed p-3 text-center transition-colors',
                  armed
                    ? 'cursor-pointer border-sky-300 bg-sky-300/10 hover:bg-sky-300/20'
                    : 'cursor-default border-white/25'
                )}
              >
                <Icon className="h-7 w-7 text-sky-200" aria-hidden />
                <span className="text-xs font-semibold text-white">{folder.label}</span>
                <span className="font-mono text-[11px] text-sky-200/80">{countIn(folder.id)}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      <div className="mt-3 min-h-[1.5rem]">
        <AnimatePresence mode="wait">
          {hint && (
            <motion.p
              key={hint}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm leading-relaxed text-red-700 dark:text-red-400"
            >
              {hint}
            </motion.p>
          )}
          {!hint && selected && (
            <motion.p
              key="armed"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-muted-foreground"
            >
              Wybrany plik:{' '}
              <span className="font-mono font-semibold" style={{ color }}>
                {FILES.find((f) => f.id === selected)?.name}
              </span>{' '}
              — teraz stuknij folder.
            </motion.p>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {finished && (
          <motion.p
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 border-t-2 pt-4 text-sm leading-relaxed"
            style={{ borderColor: color }}
          >
            <strong>Pulpit uprzątnięty.</strong> Każdy plik trafił tam, gdzie go potem znajdziesz —
            a rozstrzygała nazwa i rozszerzenie. Folder to nic więcej niż teczka na pliki jednego
            rodzaju; folder w folderze robi z tego całą szafę.
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}
